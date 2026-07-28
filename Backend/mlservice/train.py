# train.py — CattleCare AI Training Pipeline
# Based on the CattleCare MobileNetV3-Small 2-phase training approach.
#
# Usage:
#   cd D:\Uba_PashuRakshak\Backend\mlservice
#   python train.py
#
# Dataset structure expected:
#   dataset/
#     train/
#       FMD/
#       Healthy_Cow/
#       LSD/
#       Mastitis/
#     val/
#       ...same classes...
#     test/
#       ...same classes...

import os
import gc
import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from datetime import datetime
from sklearn.utils.class_weight import compute_class_weight

# ── SUPPRESS TF INFO LOGS ──────────────────────────────────────────
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# ── CONFIG ──────────────────────────────────────────────────────────
_DIR = Path(os.path.dirname(__file__))
DATASET_DIR = _DIR / 'dataset'
MODEL_DIR = _DIR  # Save .tflite alongside the service
LOG_DIR = _DIR / 'logs'
LOG_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE = 224
BATCH_SIZE = 4          # Small batch to prevent laptop OOM
EPOCHS_P1 = 8           # Phase 1: frozen base
EPOCHS_P2 = 60          # Phase 2: fine-tuning (early stopping will cut short)
SEED = 42
RUN_ID = datetime.now().strftime("%Y%m%d_%H%M")

LABELS_FILE = DATASET_DIR / 'labels.txt'
TFLITE_OUTPUT = MODEL_DIR / 'cattlecare_v1.tflite'
LABELS_OUTPUT = MODEL_DIR / 'labels.txt'


def main():
    print("=" * 60)
    print("CATTLECARE AI — MODEL TRAINING (MobileNetV3-Small)")
    print("=" * 60)
    print(f"  Run ID      : {RUN_ID}")
    print(f"  Dataset     : {DATASET_DIR}")
    print(f"  Image size  : {IMG_SIZE}x{IMG_SIZE}")
    print(f"  Batch size  : {BATCH_SIZE}")

    # ── RESOLVE CLASS NAMES ─────────────────────────────────────────
    if LABELS_FILE.exists():
        with open(LABELS_FILE) as f:
            CLASS_NAMES = [line.strip() for line in f if line.strip()]
    else:
        train_dir = DATASET_DIR / 'train'
        if not train_dir.exists():
            print(f"\nERROR: No dataset found at {DATASET_DIR}")
            print("Expected structure: dataset/train/<class_name>/*.jpg")
            print("You can also place a labels.txt in the dataset directory.")
            return
        CLASS_NAMES = sorted([
            d.name for d in train_dir.iterdir()
            if d.is_dir() and any(d.glob("*.jpg")) or any(d.glob("*.png"))
        ])

    NUM_CLASSES = len(CLASS_NAMES)
    print(f"\n  Classes ({NUM_CLASSES}): {CLASS_NAMES}")

    # ── LOAD DATASETS ───────────────────────────────────────────────
    print("\nLoading datasets...")

    def make_dataset(split, shuffle=True):
        split_dir = DATASET_DIR / split
        if not split_dir.exists():
            raise FileNotFoundError(f"Missing split directory: {split_dir}")

        ds = tf.keras.utils.image_dataset_from_directory(
            str(split_dir),
            labels='inferred',
            label_mode='categorical',
            class_names=CLASS_NAMES,
            image_size=(IMG_SIZE, IMG_SIZE),
            batch_size=BATCH_SIZE,
            shuffle=shuffle,
            seed=SEED,
        )
        AUTOTUNE = tf.data.AUTOTUNE
        if shuffle:
            ds = ds.shuffle(1000, seed=SEED).prefetch(AUTOTUNE)
        else:
            ds = ds.prefetch(AUTOTUNE)
        return ds

    train_ds = make_dataset('train', shuffle=True)
    val_ds = make_dataset('val', shuffle=False)

    # Optional test set
    test_ds = None
    if (DATASET_DIR / 'test').exists():
        test_ds = make_dataset('test', shuffle=False)

    # ── COUNT IMAGES PER CLASS (for class weights) ──────────────────
    train_counts = []
    for cls in CLASS_NAMES:
        cls_path = DATASET_DIR / 'train' / cls
        count = len(list(cls_path.glob("*.jpg"))) + len(list(cls_path.glob("*.png")))
        train_counts.append(count)
        print(f"  train/{cls:<25}: {count}")

    # ── CLASS WEIGHTS ───────────────────────────────────────────────
    # Critical for imbalanced datasets — without weights, the model
    # ignores rare classes like FMD completely.
    labels_for_weight = []
    for cls_idx, count in enumerate(train_counts):
        labels_for_weight.extend([cls_idx] * count)

    labels_array = np.array(labels_for_weight)
    class_weights_array = compute_class_weight(
        class_weight='balanced',
        classes=np.unique(labels_array),
        y=labels_array,
    )
    class_weight_dict = {i: float(w) for i, w in enumerate(class_weights_array)}
    print(f"\n  Class weights: {class_weight_dict}")

    # ── MODEL DEFINITION ────────────────────────────────────────────
    def build_model(num_classes, dropout_rate=0.4):
        """
        MobileNetV3-Small pretrained on ImageNet.

        Architecture:
          Input → MobileNetV3-Small (frozen) → GAP → BatchNorm →
          Dropout(0.4) → Dense(256, ReLU) → Dropout(0.2) → Dense(N, softmax)

        include_preprocessing=True handles pixel normalization internally,
        so the model expects float32 input in [0, 255] range.
        """
        base_model = tf.keras.applications.MobileNetV3Small(
            input_shape=(IMG_SIZE, IMG_SIZE, 3),
            include_top=False,
            weights='imagenet',
            include_preprocessing=True,
        )
        base_model.trainable = False  # Freeze for Phase 1

        inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
        x = base_model(inputs, training=False)
        x = tf.keras.layers.GlobalAveragePooling2D()(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.Dropout(dropout_rate)(x)
        x = tf.keras.layers.Dense(256, activation='relu')(x)
        x = tf.keras.layers.Dropout(dropout_rate / 2)(x)
        outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)

        model = tf.keras.Model(inputs, outputs)
        return model, base_model

    # Check for existing checkpoints to resume from
    checkpoint_p2 = MODEL_DIR / 'best_phase2.keras'
    checkpoint_p1 = MODEL_DIR / 'best_phase1.keras'
    skip_phase1 = False
    already_unfrozen = False

    if checkpoint_p2.exists():
        print(f"\nResuming from Phase 2 checkpoint: {checkpoint_p2}")
        model = tf.keras.models.load_model(str(checkpoint_p2))
        skip_phase1 = True
        already_unfrozen = True
    elif checkpoint_p1.exists():
        print(f"\nResuming from Phase 1 checkpoint: {checkpoint_p1}")
        model = tf.keras.models.load_model(str(checkpoint_p1))
        skip_phase1 = True
    else:
        model, base_model_ref = build_model(NUM_CLASSES)
        print(f"\nModel built from scratch.")

    # Find the base model layer for unfreezing in Phase 2
    base_model = None
    for layer in model.layers:
        if 'mobilenet' in layer.name.lower() or isinstance(layer, tf.keras.Model):
            base_model = layer
            break

    print(f"  Total params     : {model.count_params():,}")
    trainable_count = sum(np.prod(v.shape) for v in model.trainable_variables)
    print(f"  Trainable params : {trainable_count:,}")

    # ── CALLBACKS ───────────────────────────────────────────────────
    def make_callbacks(phase_name):
        return [
            tf.keras.callbacks.ModelCheckpoint(
                filepath=str(MODEL_DIR / f'best_{phase_name}.keras'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1,
            ),
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=1,
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-8,
                verbose=1,
            ),
            tf.keras.callbacks.CSVLogger(
                filename=str(LOG_DIR / f'history_{phase_name}_{RUN_ID}.csv'),
                append=False,
            ),
            # Clear memory after each epoch to prevent crashing on laptops
            tf.keras.callbacks.LambdaCallback(
                on_epoch_end=lambda epoch, logs: gc.collect()
            ),
        ]

    metrics = [
        'accuracy',
        tf.keras.metrics.Precision(name='precision'),
        tf.keras.metrics.Recall(name='recall'),
        tf.keras.metrics.AUC(name='auc'),
    ]

    # ── PHASE 1: TRAIN CLASSIFIER HEAD (BASE FROZEN) ───────────────
    if not skip_phase1:
        print("\n" + "=" * 60)
        print("PHASE 1: Training classifier head (base frozen)")
        print(f"  Epochs : {EPOCHS_P1}")
        print(f"  LR     : 1e-3")
        print("=" * 60)

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
            loss='categorical_crossentropy',
            metrics=metrics,
        )

        history_p1 = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=EPOCHS_P1,
            class_weight=class_weight_dict,
            callbacks=make_callbacks('phase1'),
            verbose=1,
        )

        p1_val_acc = max(history_p1.history['val_accuracy'])
        print(f"\nPhase 1 best val accuracy: {p1_val_acc:.4f}")
    else:
        print("\n" + "=" * 60)
        print("PHASE 1: SKIPPED (loaded from checkpoint)")
        print("=" * 60)
        p1_val_acc = 0.0

    # ── PHASE 2: FINE-TUNE TOP 30 LAYERS ────────────────────────────
    print("\n" + "=" * 60)
    print("PHASE 2: Fine-tuning (unfreezing top 30 layers)")
    print(f"  Epochs : {EPOCHS_P2}")
    print(f"  LR     : 1e-4 (10x lower than Phase 1)")
    print("=" * 60)

    if not already_unfrozen:
        if base_model is None:
            raise ValueError(
                "Could not find base_model in model layers. Cannot fine-tune."
            )
        base_model.trainable = True
        for layer in base_model.layers[:-30]:
            layer.trainable = False
    else:
        print("  Model already unfrozen — continuing training.")

    trainable_count = sum(np.prod(v.shape) for v in model.trainable_variables)
    print(f"  Trainable params now: {trainable_count:,}")

    # Must recompile after changing trainability
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=metrics,
    )

    history_p2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_P2,
        class_weight=class_weight_dict,
        callbacks=make_callbacks('phase2'),
        verbose=1,
    )

    p2_val_acc = max(history_p2.history['val_accuracy'])

    # ── EVALUATE ON TEST SET ────────────────────────────────────────
    if test_ds is not None:
        print("\nEvaluating on test set...")
        test_results = model.evaluate(test_ds, verbose=1)
        test_acc = test_results[1]  # accuracy is the second metric
        print(f"  Test accuracy: {test_acc:.4f}")
    else:
        test_acc = None

    # ── SAVE KERAS MODEL ────────────────────────────────────────────
    final_keras_path = MODEL_DIR / f'cattlecare_final_{RUN_ID}.keras'
    model.save(str(final_keras_path))
    print(f"\nKeras model saved: {final_keras_path}")

    # ── CONVERT TO TFLITE (FLOAT16) ─────────────────────────────────
    # Float16 quantization maintains ~87% accuracy at 2.1 MB.
    # Int8 causes accuracy drops with BatchNorm layers (87% → 59%).
    print("\nConverting to TFLite (float16 quantization)...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    tflite_model = converter.convert()

    with open(str(TFLITE_OUTPUT), 'wb') as f:
        f.write(tflite_model)

    tflite_size_mb = len(tflite_model) / (1024 * 1024)
    print(f"  TFLite model saved: {TFLITE_OUTPUT} ({tflite_size_mb:.1f} MB)")

    # ── SAVE LABELS ─────────────────────────────────────────────────
    with open(str(LABELS_OUTPUT), 'w') as f:
        for name in CLASS_NAMES:
            f.write(name + '\n')
    print(f"  Labels saved: {LABELS_OUTPUT}")

    # ── SAVE TRAINING SUMMARY ───────────────────────────────────────
    summary = {
        'run_id': RUN_ID,
        'classes': CLASS_NAMES,
        'num_classes': NUM_CLASSES,
        'architecture': 'MobileNetV3-Small',
        'img_size': IMG_SIZE,
        'phase1_best_val_acc': float(p1_val_acc),
        'phase2_best_val_acc': float(p2_val_acc),
        'test_accuracy': float(test_acc) if test_acc is not None else None,
        'tflite_size_mb': round(tflite_size_mb, 2),
        'tflite_path': str(TFLITE_OUTPUT),
        'keras_path': str(final_keras_path),
    }

    summary_path = MODEL_DIR / f'training_summary_{RUN_ID}.json'
    with open(str(summary_path), 'w') as f:
        json.dump(summary, f, indent=2)

    print(f"\n{'=' * 60}")
    print(f"TRAINING COMPLETE")
    print(f"{'=' * 60}")
    print(f"  Phase 2 best val accuracy : {p2_val_acc:.4f}")
    if test_acc is not None:
        print(f"  Test accuracy             : {test_acc:.4f}")
    print(f"  TFLite model              : {TFLITE_OUTPUT}")
    print(f"  Summary                   : {summary_path}")


if __name__ == '__main__':
    main()
