from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import io
import numpy as np
import os
from mlservice.model_file import CattleClassifier

app = FastAPI(title="PashuRakshak ML Service")

# Resolve model files relative to this file's location
_dir = os.path.dirname(__file__)
model = CattleClassifier(
    os.path.join(_dir, 'cattlecare_v2.tflite'),
    os.path.join(_dir, 'labels_v2.txt')
)

@app.post("/predict")
async def predict_cattle_disease(file: UploadFile = File(...)):
    # 1. Validate the file type
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"error": "File provided is not an image."})
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # 2. Resize to model requirements (224x224)
        image = image.resize((224, 224))
        image_array = np.array(image)

        # 3. Check for solid color / black photos (low variance)
        variance = np.var(image_array)
        if variance < 100:  # Threshold for "too solid/black/white"
            return {
                "label": "Unknown/Healthy",
                "confidence": 0.0,
                "all_scores": {"Healthy": 1.0, "FMD": 0.0, "Lumpy Skin Disease": 0.0, "Mastitis": 0.0},
                "error": "Image is too dark or solid color. Please upload a clear photo."
            }

        # 4. Run Inference
        result = model.predict(image_array)
        
        # 5. Return JSON
        return result
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
