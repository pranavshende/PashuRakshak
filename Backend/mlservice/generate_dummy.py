import os
from PIL import Image

DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')

# Define dummy colors for each class to give the model a chance to "learn"
CLASSES = {
    'FMD': (255, 0, 0),         # Red
    'Healthy_Cow': (0, 255, 0), # Green
    'LSD': (0, 0, 255),         # Blue
    'Mastitis': (255, 255, 0)   # Yellow
}

def create_dummy_images():
    for cls_name, color in CLASSES.items():
        folder = os.path.join(DATASET_DIR, cls_name)
        os.makedirs(folder, exist_ok=True)
        
        # Create 10 dummy images per class
        for i in range(1, 11):
            img_path = os.path.join(folder, f'dummy_{i}.jpg')
            if not os.path.exists(img_path):
                img = Image.new('RGB', (224, 224), color)
                img.save(img_path)
        print(f"Created 10 dummy images for {cls_name}")

if __name__ == '__main__':
    create_dummy_images()
