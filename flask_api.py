from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models
import torchvision.transforms as T
from PIL import Image
import cv2
import numpy as np
import json
import io
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Device Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 1. Load Research Database
def load_research_data():
    db_path = Path('disease_database.json')
    if db_path.exists():
        with open(db_path, 'r') as f:
            return json.load(f)
    return {}

RESEARCH_DB = load_research_data()

# 2. Hardcoded Class Names (89 Species)
CLASS_NAMES = [
    "Adhatoda-vasica", "Aloevera", "Amla", "Amruthaballi", "Apple_Tree_leaf", 
    "Arali", "Astma_weed", "Badipala", "Balloon_Vine", "Bamboo", "Beans", 
    "Betel", "Bhrami", "Bringaraja", "Caricature", "Castor", "Catharanthus", 
    "Chakte", "Chilly", "Citron lime (herelikai)", "Coffee", "Common rue(naagdalli)", 
    "Coriender", "Curry", "Cymbopogon citratus", "Doddpathre", "Drumstick", 
    "Ekka", "Eucalyptus", "Ganigale", "Ganike", "Gasagase", "Ginger", 
    "Globe Amarnath", "Guava", "Henna", "Hibiscus", "Honge", "Insulin", 
    "Jackfruit", "Jasmine", "Kambajala", "Kasambruga", "Kohlrabi", "Lantana", 
    "Lemon", "Lemongrass", "Malabar_Nut", "Malabar_Spinach", "Mango", 
    "Marigold", "Mint", "Neem", "Nelavembu", "Nerale", "Nooni", "Onion", 
    "Padri", "Palak(Spinach)", "Papaya", "Parijatha", "Pea", "Pepper", 
    "Phaseolus", "Pomoegranate", "Pumpkin", "Raddish", "Rose", "Sampige", 
    "Sapota", "Seethaashoka", "Seethapala", "Spinach1", "Tamarind", "Taro", 
    "Tecoma", "Thumbe", "Tomato", "Tulsi", "Turmeric", "ashoka", "c.martini", 
    "camphor", "cucumber leaf", "hydrangea-cinerea", "kamakasturi", "kepala", 
    "piper betle", "turnip-leaf"
]

# 3. Model Architecture and Loading - FIXED VERSION
def load_trained_model():
    model_path = Path('checkpoints/best_model.pth')
    if not model_path.exists():
        print("  Model file not found at:", model_path)
        return None
    
    try:
        model = models.resnet18(pretrained=False)
        num_ftrs = model.fc.in_features
        
        # CRITICAL: Match the training architecture exactly
        # Training used: nn.Sequential(Dropout, Linear)
        model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_ftrs, len(CLASS_NAMES))
        )
        
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.to(device)
        model.eval()
        print(" Model loaded successfully!")
        return model
    except Exception as e:
        print(f" Model Loading Error: {str(e)}")
        print(" Tip: Make sure model architecture matches training script")
        return None

MODEL = load_trained_model()

# Image Preprocessing
transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# CV Symptom Scanning - IMPROVED VERSION
def scan_cv_symptoms(img_pil):
    """Enhanced symptom detection"""
    # Convert PIL to OpenCV format
    img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    
    # Calculate total pixels
    total_pixels = img_cv.shape[0] * img_cv.shape[1]
    
    # Brown/Dark spots (Leaf spot, Anthracnose)
    mask_brown = cv2.inRange(hsv, np.array([0, 20, 20]), np.array([30, 255, 150]))
    brown_coverage = (np.sum(mask_brown > 0) / total_pixels) * 100
    
    # Yellowing (Bacterial blight, Nutrient deficiency)
    mask_yellow = cv2.inRange(hsv, np.array([15, 100, 100]), np.array([35, 255, 255]))
    yellow_coverage = (np.sum(mask_yellow > 0) / total_pixels) * 100
    
    # White powder (Powdery mildew)
    mask_white = cv2.inRange(hsv, np.array([0, 0, 200]), np.array([180, 30, 255]))
    white_coverage = (np.sum(mask_white > 0) / total_pixels) * 100
    
    # Orange/Rust
    mask_orange = cv2.inRange(hsv, np.array([5, 100, 100]), np.array([15, 255, 255]))
    orange_coverage = (np.sum(mask_orange > 0) / total_pixels) * 100
    
    found = []
    severity = {}
    
    # Detect symptoms (lowered thresholds for better sensitivity)
    if brown_coverage > 1.0:  # More than 1%
        found.extend(["brown spots", "dark spots", "lesions"])
        severity['brown_spots'] = round(brown_coverage, 2)
        
    if yellow_coverage > 1.0:
        found.extend(["yellowing", "yellow halo"])
        severity['yellowing'] = round(yellow_coverage, 2)
        
    if white_coverage > 0.5:
        found.extend(["white powder", "dusty coating"])
        severity['white_powder'] = round(white_coverage, 2)
        
    if orange_coverage > 0.8:
        found.extend(["orange pustules", "rust spots"])
        severity['rust'] = round(orange_coverage, 2)
    
    return found, severity

# 5. API Endpoints
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "model_loaded": MODEL is not None,
        "database_size": len(RESEARCH_DB),
        "device": str(device)
    })

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    try:
        # Check if an image file was sent (from test script)
        if 'image' in request.files:
            file = request.files['image']
            img_pil = Image.open(file.stream).convert('RGB')
        # Check if base64 was sent (from Mobile App)
        elif request.json and 'image_base64' in request.json:
            import base64
            image_bytes = base64.b64decode(request.json['image_base64'])
            img_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        else:
            return jsonify({"success": False, "error": "No image data provided"}), 400

        # A. AI Species Identification
        species = "Unknown"
        confidence = "Medium"
        
        if MODEL:
            img_tensor = transform(img_pil).unsqueeze(0).to(device)
            with torch.no_grad():
                output = MODEL(img_tensor)
                probabilities = torch.nn.functional.softmax(output, dim=1)
                conf, pred = torch.max(probabilities, 1)
                species = CLASS_NAMES[pred.item()]
                confidence = f"{conf.item() * 100:.1f}%"
        else:
            return jsonify({
                "success": False, 
                "error": "Model not loaded. Please check server logs."
            }), 500
        
        # B. Symptom Scanning
        symptoms, severity = scan_cv_symptoms(img_pil)
        
        # C. Database Lookup
        plant_data = RESEARCH_DB.get(species, None)
        diagnosis = "Healthy"
        treatment = "No disease detected. Continue regular maintenance."
        botanical = "N/A"

        if plant_data:
            botanical = plant_data.get("common_name", "N/A")
            
            # Match symptoms with database
            for disease, details in plant_data.get("diseases", {}).items():
                if any(kw in details["symptoms"]["visual_keywords"] for kw in symptoms):
                    diagnosis = disease
                    treatment = details["treatment"]
                    break
        else:
            # Plant not in database but has symptoms
            if symptoms:
                diagnosis = "Possible Disease Detected"
                treatment = (
                    f"Visual symptoms detected: {', '.join(set(symptoms[:3]))}. "
                    "This plant species is not in our treatment database yet. "
                    "General recommendations: Remove affected leaves, improve air circulation, "
                    "avoid overhead watering, and consult with a local agricultural expert."
                )

        # Preventive measures
        preventive_measures = []
        if "brown spots" in symptoms or "dark spots" in symptoms:
            preventive_measures.extend([
                "Remove and dispose of infected leaves",
                "Improve air circulation around plant",
                "Avoid overhead watering"
            ])
        if "yellowing" in symptoms:
            preventive_measures.extend([
                "Check soil drainage",
                "Monitor watering schedule"
            ])
        if "white powder" in symptoms:
            preventive_measures.append("Apply sulfur-based fungicide")
        
        if not preventive_measures:
            preventive_measures = [
                "Continue regular monitoring",
                "Maintain optimal growing conditions"
            ]

        return jsonify({
            "success": True,
            "report": {
                "species": species,
                "common_name": botanical,
                "condition": diagnosis,
                "confidence": confidence,
                "treatment": treatment,
                "detected_symptoms": list(set(symptoms)) if symptoms else ["None detected"],
                "severity_analysis": severity,
                "preventive_measures": preventive_measures[:4]
            }
        })

    except Exception as e:
        print(f" Error in diagnosis: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("🌿 VANAUSHADHI RAKSHAK API SERVER")
    print(f"Device: {device}")
    print(f"Model Status: {'Loaded' if MODEL else 'Not Found '}")
    print(f"Database: {len(RESEARCH_DB)} plants")
    print(f"Supported Species: {len(CLASS_NAMES)}")

    app.run(host='0.0.0.0', port=5000, debug=False)