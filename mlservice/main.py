from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import io
import numpy as np
from model_file import CattleClassifier

app = FastAPI(title="PashuRakshak ML Service")

# Singleton Initialization
# Initialize the CattleClassifier once when the server starts
model = CattleClassifier('cattlecare_v1.tflite', 'labels.txt')

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

        # 3. Run Inference
        result = model.predict(image_array)
        
        # 4. Return JSON
        return result
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
