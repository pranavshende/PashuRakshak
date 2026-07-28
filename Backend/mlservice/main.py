from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import io
import numpy as np
import os
from mlservice.model_file import CattleClassifier

app = FastAPI(
    title="PashuRakshak ML Service",
    description="Cattle disease detection using CattleCare AI (MobileNetV3-Small TFLite)",
    version="1.0.0",
)

# Resolve model files relative to this file's location
_dir = os.path.dirname(__file__)

model = CattleClassifier(
    model_path=os.path.join(_dir, 'cattlecare_v1.tflite'),
    labels_path=os.path.join(_dir, 'labels.txt'),
    diseases_path=os.path.join(_dir, 'diseases.json'),
)


@app.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running."""
    return {
        "status": "healthy",
        "model_loaded": model.interpreter is not None,
        "classes": model.labels,
    }


@app.get("/model-info")
async def model_info():
    """Return metadata about the loaded model."""
    return model.model_info


@app.post("/predict")
async def predict_cattle_disease(file: UploadFile = File(...)):
    """
    Accepts an image file and returns cattle disease prediction.

    The image is resized to 224x224 and fed to the CattleCare TFLite model.
    Returns label, confidence, all class scores, and disease info.
    """
    # 1. Validate the file type
    if not file.content_type or not file.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"error": "File provided is not an image."},
        )

    try:
        # 2. Read and decode image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')

        # 3. Resize to model requirements
        img_size = model.img_size  # 224
        image = image.resize((img_size, img_size))
        image_array = np.array(image, dtype=np.uint8)

        # 4. Check for solid color / too-dark photos (low pixel variance)
        variance = float(np.var(image_array))
        if variance < 100:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Image is too dark or a solid color. Please upload a clear photo of the animal.",
                    "status": "ERROR",
                    "label": None,
                    "confidence": 0.0,
                },
            )

        # 5. Run inference
        result = model.predict(image_array)

        # 6. Add disclaimer
        result['disclaimer'] = (
            "This AI diagnosis is for guidance only. "
            "Always consult a licensed veterinarian before administering any treatment."
        )

        return result

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Prediction failed: {str(e)}", "status": "ERROR"},
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
