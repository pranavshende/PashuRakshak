import numpy as np
try:
    import tflite_runtime.interpreter as tflite  # type: ignore
except ImportError:
    from tensorflow import lite as tflite  # type: ignore

class CattleClassifier:
    def __init__(self, model_path: str, labels_path: str):
        # Initialize the TFLite interpreter
        self.interpreter = tflite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()

        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

        # Load class labels
        with open(labels_path, 'r') as f:
            self.labels = [line.strip() for line in f.readlines() if line.strip()]

    def predict(self, image_array: np.ndarray) -> dict:
        """
        Takes an RGB image array of shape (224, 224, 3) and returns classification results.
        """
        # Add batch dimension: shape becomes (1, 224, 224, 3)
        input_data = np.expand_dims(image_array, axis=0)

        # Type conversion based on model's expected input type
        input_type = self.input_details[0]['dtype']
        if input_type == np.float32:
            # Typical for float32 models: normalize to [0, 1]
            input_data = np.float32(input_data) / 255.0
        else:
            # Typical for uint8 models: keep as 0-255
            input_data = input_data.astype(input_type)

        # Set the tensor and run inference
        self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
        self.interpreter.invoke()

        # Get the output tensor
        output_data = self.interpreter.get_tensor(self.output_details[0]['index'])[0]
        
        # If the output is quantized (e.g. uint8), convert back to float probabilities
        if self.output_details[0]['dtype'] == np.uint8:
            output_data = output_data.astype(np.float32) / 255.0
        
        # Build the structured response
        all_scores = {self.labels[i]: float(output_data[i]) for i in range(len(self.labels))}
        
        best_idx = np.argmax(output_data)
        best_label = self.labels[best_idx]
        best_confidence = float(output_data[best_idx])

        return {
            "label": best_label,
            "confidence": round(best_confidence, 3),
            "all_scores": {k: round(v, 3) for k, v in all_scores.items()}
        }
