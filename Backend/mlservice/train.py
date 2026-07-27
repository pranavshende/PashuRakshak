import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2

# 1. Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'cattlecare_v2.tflite')
LABELS_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'labels_v2.txt')

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10 # You can increase this when using real data

def main():
    print(f"Loading dataset from: {DATASET_DIR}")
    
    # 2. Load dataset
    # This automatically infers classes from the subdirectories
    train_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical' # one-hot encoding for multi-class
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    
    class_names = train_ds.class_names
    print(f"Detected classes: {class_names}")
    
    # Save labels.txt
    with open(LABELS_SAVE_PATH, 'w') as f:
        for cls in class_names:
            f.write(f"{cls}\n")
    print(f"Saved labels to {LABELS_SAVE_PATH}")

    # Optimize dataset for performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
    
    # 3. Build Model (Transfer Learning with MobileNetV2)
    # Data Augmentation layer to help with small datasets
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ])
    
    # Base model from MobileNetV2 (pre-trained on ImageNet)
    # Note: MobileNetV2 expects input values in [-1, 1], so we use Rescaling
    base_model = MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the base model
    base_model.trainable = False
    
    # Build complete model
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)
    # Rescale to [-1, 1] for MobileNetV2
    x = layers.Rescaling(1./127.5, offset=-1)(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(len(class_names), activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # 4. Train the model
    print("Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS
    )
    
    # 5. Convert to TFLite
    print("Converting model to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Optimize for size and latency
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    # Save the TFLite model
    with open(MODEL_SAVE_PATH, 'wb') as f:
        f.write(tflite_model)
        
    print(f"[OK] Successfully saved TFLite model to {MODEL_SAVE_PATH}")
    print("Training complete! Your model is ready to be used by the backend.")

if __name__ == '__main__':
    main()
