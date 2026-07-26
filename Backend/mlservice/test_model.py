import numpy as np
from PIL import Image
from model_file import CattleClassifier

def main():
    print("Loading model...")
    try:
        model = CattleClassifier("cattlecare_v1.tflite", "labels.txt")
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    print("Creating a dummy 224x224 RGB image...")
    # Create a random RGB image for testing
    dummy_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    image = Image.fromarray(dummy_image)
    
    # Optional: resize just in case (already 224x224)
    image = image.resize((224, 224))
    image_array = np.array(image)

    print("Running prediction...")
    try:
        result = model.predict(image_array)
        print("Prediction successful!")
        print("Result JSON:")
        import json
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Failed to run prediction: {e}")

if __name__ == "__main__":
    main()
