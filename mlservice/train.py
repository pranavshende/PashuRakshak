import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

# Configuration
DATASET_DIR = 'dataset'
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
CLASSES = ['FMD', 'Healthy_Cow', 'LSD', 'Mastitis']
MODEL_NAME = 'cattlecare_v1.tflite'

def create_model():
    # Load MobileNetV2 without the top classification layer
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze the base model layers initially
    base_model.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(len(CLASSES), activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer=Adam(learning_rate=0.001), 
                  loss='categorical_crossentropy', 
                  metrics=['accuracy'])
    return model, base_model

def plot_training(history):
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    
    epochs_range = range(len(acc))
    
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy')
    plt.plot(epochs_range, val_acc, label='Validation Accuracy')
    plt.legend(loc='lower right')
    plt.title('Training and Validation Accuracy')
    
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss')
    plt.plot(epochs_range, val_loss, label='Validation Loss')
    plt.legend(loc='upper right')
    plt.title('Training and Validation Loss')
    plt.savefig('training_history.png')
    print("Training plot saved to 'training_history.png'")

def export_to_tflite(model):
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Optimize for size and latency
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    with open(MODEL_NAME, 'wb') as f:
        f.write(tflite_model)
    print(f"Model successfully exported to {MODEL_NAME}")

def main():
    print("Starting ML Model Retraining Pipeline...")
    
    # Data Augmentation to improve generalization
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        zoom_range=0.2,
        shear_range=0.15,
        brightness_range=[0.8, 1.2],
        horizontal_flip=True,
        validation_split=0.2 # 20% for validation
    )
    
    print("Loading Dataset...")
    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=CLASSES,
        subset='training'
    )
    
    val_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=CLASSES,
        subset='validation'
    )
    
    # Check if data was found
    if train_generator.samples == 0:
        print("\nERROR: No images found in 'dataset/'. Please add images into the respective class folders.")
        return
        
    print(f"Found {train_generator.samples} training images and {val_generator.samples} validation images.")
    
    model, base_model = create_model()
    
    print("Phase 1: Training the custom classification head...")
    history_head = model.fit(
        train_datagen.flow_from_directory(
            DATASET_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', classes=CLASSES, subset='training'
        ),
        validation_data=val_generator,
        epochs=EPOCHS
    )
    
    print("Phase 2: Fine-Tuning the Base Model...")
    # Unfreeze the top layers of the base model
    base_model.trainable = True
    fine_tune_at = 100
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False
        
    # Recompile model with a lower learning rate
    model.compile(optimizer=Adam(learning_rate=1e-5), 
                  loss='categorical_crossentropy', 
                  metrics=['accuracy'])
                  
    # Train for more epochs
    FINE_TUNE_EPOCHS = 10
    total_epochs = EPOCHS + FINE_TUNE_EPOCHS
    
    history_fine = model.fit(
        train_datagen.flow_from_directory(
            DATASET_DIR, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical', classes=CLASSES, subset='training'
        ),
        validation_data=val_generator,
        epochs=total_epochs,
        initial_epoch=history_head.epoch[-1]
    )
    
    plot_training(history_fine)
    
    print("Exporting model to TensorFlow Lite format...")
    export_to_tflite(model)
    print("Done! The new model is ready to be used by the FastAPI service.")

if __name__ == '__main__':
    main()
