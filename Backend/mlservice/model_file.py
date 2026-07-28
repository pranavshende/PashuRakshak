import json
import os
import numpy as np

try:
    import tflite_runtime.interpreter as tflite  # type: ignore
except ImportError:
    from tensorflow import lite as tflite  # type: ignore


class CattleClassifier:
    """
    TFLite-based cattle disease classifier.

    Supports both float16 (deployed) and int8 (quantized) CattleCare models.
    The CattleCare v1 model uses MobileNetV3-Small with include_preprocessing=True,
    meaning pixel normalization is baked into the first layers of the model graph.
    Input must be float32 [0, 255] range (NOT normalized to [0,1]).
    """

    MIN_CONFIDENCE = 0.60  # Below this → UNCERTAIN result

    def __init__(self, model_path: str, labels_path: str, diseases_path: str = None):
        # Initialize the TFLite interpreter
        self.interpreter = tflite.Interpreter(model_path=model_path)
        self.interpreter.allocate_tensors()

        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()

        # Cache input/output metadata
        self._input_dtype = self.input_details[0]['dtype']
        self._input_shape = self.input_details[0]['shape']  # e.g. [1, 224, 224, 3]
        self._output_dtype = self.output_details[0]['dtype']

        # Quantization parameters for dequantizing uint8/int8 output
        quant_params = self.output_details[0].get('quantization_parameters', {})
        scales = quant_params.get('scales', np.array([]))
        zero_points = quant_params.get('zero_points', np.array([]))
        self._output_scale = float(scales[0]) if len(scales) > 0 else 1.0
        self._output_zero_point = int(zero_points[0]) if len(zero_points) > 0 else 0

        # Load class labels
        with open(labels_path, 'r') as f:
            self.labels = [line.strip() for line in f.readlines() if line.strip()]

        # Load disease knowledge base (optional)
        self.diseases = {}
        if diseases_path and os.path.exists(diseases_path):
            with open(diseases_path, 'r', encoding='utf-8') as f:
                self.diseases = json.load(f)

    @property
    def img_size(self) -> int:
        """Expected image dimension (H == W)."""
        return int(self._input_shape[1])

    @property
    def num_classes(self) -> int:
        return len(self.labels)

    @property
    def model_info(self) -> dict:
        """Return metadata about the loaded model."""
        return {
            'input_shape': self._input_shape.tolist(),
            'input_dtype': str(self._input_dtype),
            'output_dtype': str(self._output_dtype),
            'num_classes': self.num_classes,
            'class_names': list(self.labels),
            'confidence_threshold': self.MIN_CONFIDENCE,
        }

    def _preprocess(self, image_array: np.ndarray) -> np.ndarray:
        """
        Prepare the image array for inference.

        The CattleCare MobileNetV3-Small model was trained with
        `include_preprocessing=True`, which bakes normalization into the graph.
        - For float32 models: pass pixel values as float32 in [0, 255] range.
        - For uint8 models: pass pixel values as uint8 in [0, 255] range.
        """
        # Add batch dimension: (224, 224, 3) → (1, 224, 224, 3)
        input_data = np.expand_dims(image_array, axis=0)

        if self._input_dtype == np.float32:
            # Float16/float32 model: input is float32 pixels [0, 255]
            # Do NOT divide by 255 — the model handles preprocessing internally
            input_data = input_data.astype(np.float32)
        else:
            # Quantized (uint8/int8) model: keep as-is
            input_data = input_data.astype(self._input_dtype)

        return input_data

    def _dequantize_output(self, raw_output: np.ndarray) -> np.ndarray:
        """
        Convert quantized model output to float32 probabilities.

        For float32 output: already probabilities (softmax), return as-is.
        For uint8/int8 output: dequantize using scale and zero_point.
          real_value = (quantized_value - zero_point) * scale
        """
        if self._output_dtype == np.float32:
            return raw_output.astype(np.float32)

        # Dequantize
        return (raw_output.astype(np.float32) - self._output_zero_point) * self._output_scale

    def predict(self, image_array: np.ndarray) -> dict:
        """
        Takes an RGB image array of shape (224, 224, 3) and returns
        classification results with confidence threshold handling.

        Returns:
            dict with keys: status, label, confidence, all_scores,
                            and optionally diseaseInfo
        """
        # Preprocess
        input_data = self._preprocess(image_array)

        # Run inference
        self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
        self.interpreter.invoke()

        # Get and dequantize output
        raw_output = self.interpreter.get_tensor(self.output_details[0]['index'])[0]
        probabilities = self._dequantize_output(raw_output)

        # Build score map
        all_scores = {
            self.labels[i]: round(float(probabilities[i]), 4)
            for i in range(len(self.labels))
        }

        best_idx = int(np.argmax(probabilities))
        best_label = self.labels[best_idx]
        best_confidence = float(probabilities[best_idx])

        # Confidence threshold check
        if best_confidence < self.MIN_CONFIDENCE:
            result = {
                'status': 'UNCERTAIN',
                'label': best_label,
                'confidence': round(best_confidence, 4),
                'all_scores': all_scores,
                'message': 'Low confidence — image quality may be poor or animal not clearly visible. Please retake the photo in good lighting.',
            }
        else:
            result = {
                'status': 'OK',
                'label': best_label,
                'confidence': round(best_confidence, 4),
                'all_scores': all_scores,
            }

        # Attach disease info if available
        if best_label in self.diseases:
            result['diseaseInfo'] = self.diseases[best_label]

        # Add secondary detections (any class > 10% that isn't the primary)
        secondary = [
            {'label': self.labels[i], 'confidence': round(float(probabilities[i]), 4)}
            for i in range(len(self.labels))
            if i != best_idx and float(probabilities[i]) > 0.10
        ]
        if secondary:
            result['secondaryDetections'] = secondary

        return result
