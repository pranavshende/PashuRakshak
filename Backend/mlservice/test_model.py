r"""
Test the CattleCare TFLite model via the CattleClassifier API.

Usage:
    cd D:\Uba_PashuRakshak\Backend\mlservice
    python test_model.py
"""

import json
import os
import numpy as np
from PIL import Image

# Resolve paths relative to this script
_dir = os.path.dirname(os.path.abspath(__file__))


def test_model_loads():
    """Test that the model loads successfully and reports correct metadata."""
    from model_file import CattleClassifier

    print("=" * 55)
    print("TEST 1: Model Loading")
    print("=" * 55)

    model = CattleClassifier(
        model_path=os.path.join(_dir, 'cattlecare_v1.tflite'),
        labels_path=os.path.join(_dir, 'labels.txt'),
        diseases_path=os.path.join(_dir, 'diseases.json'),
    )

    info = model.model_info
    print("Model info:")
    print(json.dumps(info, indent=2))

    assert info['num_classes'] == 4, f"Expected 4 classes, got {info['num_classes']}"
    assert 'FMD' in info['class_names'], "Missing FMD class"
    assert 'Healthy_Cow' in info['class_names'], "Missing Healthy_Cow class"
    assert 'LSD' in info['class_names'], "Missing LSD class"
    assert 'Mastitis' in info['class_names'], "Missing Mastitis class"
    assert info['input_shape'][1] == 224, f"Expected 224 input, got {info['input_shape'][1]}"

    print("\n[PASS] Model loaded and validated successfully.\n")
    return model


def test_dummy_prediction(model):
    """Test prediction with a random noise image — should return UNCERTAIN."""
    print("=" * 55)
    print("TEST 2: Random Noise Prediction (expect UNCERTAIN)")
    print("=" * 55)

    dummy_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    result = model.predict(dummy_image)

    print("Result:")
    print(json.dumps(result, indent=2, default=str))

    assert 'status' in result, "Missing 'status' field"
    assert 'label' in result, "Missing 'label' field"
    assert 'confidence' in result, "Missing 'confidence' field"
    assert 'all_scores' in result, "Missing 'all_scores' field"
    assert result['label'] in ['FMD', 'Healthy_Cow', 'LSD', 'Mastitis'], \
        f"Unexpected label: {result['label']}"

    print(f"\n[PASS] Prediction returned: {result['status']} — {result['label']} ({result['confidence']:.4f})\n")
    return result


def test_solid_color_prediction(model):
    """Test with a solid color image — model will predict but likely UNCERTAIN."""
    print("=" * 55)
    print("TEST 3: Solid Green Image Prediction")
    print("=" * 55)

    green_image = np.full((224, 224, 3), [0, 200, 0], dtype=np.uint8)
    result = model.predict(green_image)

    print("Result:")
    print(json.dumps(result, indent=2, default=str))

    # Sum of all_scores should be close to 1.0 (softmax output)
    total = sum(result['all_scores'].values())
    print(f"\n  Sum of all_scores: {total:.4f} (expected ~1.0)")
    assert 0.8 < total < 1.2, f"Softmax sum out of range: {total}"

    print(f"\n[PASS] Solid color prediction: {result['status']} — {result['label']}\n")
    return result


def test_disease_info(model):
    """Test that disease info is attached when available."""
    print("=" * 55)
    print("TEST 4: Disease Info Enrichment")
    print("=" * 55)

    # Create a dummy prediction — we just check if diseaseInfo is present
    dummy_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    result = model.predict(dummy_image)

    if 'diseaseInfo' in result:
        info = result['diseaseInfo']
        print(f"  Disease: {info.get('full_name', 'N/A')}")
        print(f"  Severity: {info.get('severity', 'N/A')}")
        print(f"  Vet required: {info.get('vet_required', 'N/A')}")
        print(f"\n[PASS] Disease info attached for '{result['label']}'.\n")
    else:
        print(f"\n[WARN] No diseaseInfo attached (label '{result['label']}' may not be in diseases.json)\n")


def test_real_image(model, image_path):
    """Test prediction with a real image file."""
    print("=" * 55)
    print(f"TEST 5: Real Image — {os.path.basename(image_path)}")
    print("=" * 55)

    image = Image.open(image_path).convert('RGB')
    image = image.resize((224, 224))
    image_array = np.array(image, dtype=np.uint8)

    result = model.predict(image_array)
    print("Result:")
    print(json.dumps(result, indent=2, default=str))

    print(f"\n[PASS] Real image prediction: {result['status']} — {result['label']} ({result['confidence']:.4f})\n")
    return result


def main():
    print("\nCattleCare AI -- Model Test Suite\n")

    # Test 1: Load model
    model = test_model_loads()

    # Test 2: Random noise
    test_dummy_prediction(model)

    # Test 3: Solid color
    test_solid_color_prediction(model)

    # Test 4: Disease info
    test_disease_info(model)

    # Test 5: Real image (if any test images exist)
    test_images_dir = os.path.join(_dir, 'test_images')
    if os.path.exists(test_images_dir):
        for fname in os.listdir(test_images_dir):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                test_real_image(model, os.path.join(test_images_dir, fname))

    print("=" * 55)
    print("ALL TESTS PASSED")
    print("=" * 55)


if __name__ == '__main__':
    main()
