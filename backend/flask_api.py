from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import cv2
import numpy as np
import json
import io
import base64
import traceback
from pathlib import Path as P

app = Flask(__name__)
CORS(app, origins="*")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

ROOT         = P(r"C:\\Users\\gazal\\OneDrive\\Desktop\\plants\\vanaushadhi-rakshak")
MODEL_PATH   = ROOT / "training" / "models" / "checkpoints" / "best_model.pth"
MAPPING_PATH = ROOT / "training" / "models" / "class_mapping.json"
DB_PATH      = ROOT / "backend" / "disease_database.json"
LOOKUP_PATH  = ROOT / "backend" / "species_lookup.json"

# ── Model ──────────────────────────────────────────────────────
class DiseaseDetector(nn.Module):
    def __init__(self, n):
        super().__init__()
        self.features = models.efficientnet_b7(weights=None).features
        self.avgpool  = nn.AdaptiveAvgPool2d(1)
        self.species_classifier = nn.Sequential(
            nn.Dropout(0.4), nn.Linear(2560,512), nn.BatchNorm1d(512), nn.SiLU(),
            nn.Dropout(0.4), nn.Linear(512,n))
        self.health_classifier = nn.Sequential(
            nn.Dropout(0.4), nn.Linear(2560,256), nn.BatchNorm1d(256), nn.SiLU(),
            nn.Dropout(0.4), nn.Linear(256,2))
    def forward(self, x):
        x = self.avgpool(self.features(x))
        x = torch.flatten(x,1)
        return self.species_classifier(x), self.health_classifier(x)

MODEL, SPECIES_MAP, DISEASE_DB, LOOKUP = None, {}, {}, {}

def boot():
    global MODEL, SPECIES_MAP, DISEASE_DB, LOOKUP
    try:
        m = json.loads(MAPPING_PATH.read_text())
        net = DiseaseDetector(m["num_species"])
        ckpt = torch.load(MODEL_PATH, map_location=DEVICE)
        net.load_state_dict(ckpt["model_state_dict"], strict=False)
        net.to(DEVICE).eval()
        MODEL = net
        SPECIES_MAP = m["idx_to_species"]
        print(f"Model OK — {m['num_species']} species")
    except Exception as e:
        print("Model error:", e)
    try:
        DISEASE_DB = json.loads(DB_PATH.read_text())
        print(f"DB OK — {len(DISEASE_DB)} plants")
    except Exception as e:
        print("DB error:", e)
    try:
        LOOKUP = json.loads(LOOKUP_PATH.read_text())
    except:
        pass

TRANSFORM = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])])

# ── Symptom Detection (based on research paper Table 1) ────────
SYMPTOMS = {
    "brown_spots": {
        "label": "Brown / Dark Spots",
        "desc": "Circular to irregular dark brown or necrotic spots on leaf surface",
        "diseases": ["Leaf Spot","Anthracnose","Leaf Blight","Alternaria Blight",
                     "Cercospora Leaf Spot","Colletotrichum Leaf Spot"],
        "hsv_ranges": [([5,60,20],[22,255,160]),([0,60,15],[7,255,140])],
        "min_pct": 0.012, "color": (0,0,180)
    },
    "yellowing": {
        "label": "Yellowing / Chlorosis",
        "desc": "Leaf turns yellow — indicates nutrient deficiency, viral or fungal infection",
        "diseases": ["Downy Mildew","Fusarium Wilt","Root Rot","Mosaic Virus",
                     "Bacterial Wilt","Damping Off"],
        "hsv_ranges": [([20,80,120],[38,255,255])],
        "min_pct": 0.04, "color": (0,220,220)
    },
    "white_powdery": {
        "label": "White Powdery Coating",
        "desc": "White or grey powdery patches on leaf surface — classic Powdery Mildew sign",
        "diseases": ["Powdery Mildew","Downy Mildew"],
        "hsv_ranges": [([0,0,210],[180,25,255])],
        "min_pct": 0.025, "color": (200,200,200)
    },
    "rust_pustules": {
        "label": "Rust / Orange Pustules",
        "desc": "Orange-brown powdery pustules — classic rust disease",
        "diseases": ["Rust","Leaf Rust","Alternaria Blight and Rust"],
        "hsv_ranges": [([8,120,80],[18,255,230])],
        "min_pct": 0.015, "color": (0,120,255)
    },
    "black_necrosis": {
        "label": "Black / Necrotic Areas",
        "desc": "Black or very dark dead tissue — severe infection or advanced blight",
        "diseases": ["Anthracnose","Black Necrotic Spots","Leaf Blight","Sooty Mold"],
        "hsv_ranges": [([0,0,0],[180,255,45])],
        "min_pct": 0.015, "color": (50,50,50)
    },
    "grey_growth": {
        "label": "Grey / Fuzzy Growth",
        "desc": "Grey-brown hairy or fuzzy growth — Grey Mold (Botrytis)",
        "diseases": ["Grey Mold","Botrytis Blight","Grey Blight"],
        "hsv_ranges": [([0,0,80],[180,30,165])],
        "min_pct": 0.05, "color": (150,150,150)
    },
    "water_soaked": {
        "label": "Water-soaked Lesions",
        "desc": "Wet, translucent or water-soaked spots — bacterial infection",
        "diseases": ["Bacterial Leaf Spot","Bacterial Leaf Blight","Soft Rot","Damping Off"],
        "hsv_ranges": [([85,30,100],[115,120,210])],
        "min_pct": 0.02, "color": (200,180,0)
    }
}

def get_leaf_mask(arr):
    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
    green  = cv2.inRange(hsv, np.array([25,20,30]),  np.array([95,255,255]))
    yellow = cv2.inRange(hsv, np.array([15,30,80]),  np.array([38,255,255]))
    brown  = cv2.inRange(hsv, np.array([0,30,20]),   np.array([25,255,180]))
    leaf   = cv2.bitwise_or(green, cv2.bitwise_or(yellow, brown))
    k = np.ones((15,15), np.uint8)
    leaf = cv2.morphologyEx(leaf, cv2.MORPH_CLOSE, k)
    leaf = cv2.morphologyEx(leaf, cv2.MORPH_DILATE, k)
    return leaf

def detect_symptoms(img_pil):
    arr  = np.array(img_pil.resize((512,512)))
    hsv  = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
    lmask = get_leaf_mask(arr)
    leaf_area = max(int(np.sum(lmask>0)), 1)
    found = {}
    k = np.ones((9,9), np.uint8)

    def get_cnts(m, min_a=600):
        m = cv2.bitwise_and(m, m, mask=lmask)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k)
        cs,_ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        return m, sorted([c for c in cs if cv2.contourArea(c)>min_a],
                         key=cv2.contourArea, reverse=True)[:5]

    # 1. BROWN SPOTS
    m1 = cv2.inRange(hsv, np.array([5,60,15]),  np.array([22,255,150]))
    m2 = cv2.inRange(hsv, np.array([0,60,10]),  np.array([7,255,130]))
    m, c = get_cnts(cv2.bitwise_or(m1,m2), 800)
    if c and np.sum(m>0)/leaf_area > 0.01:
        found["brown_spots"] = {"label":"Brown / Dark Spots",
            "desc":"Dark brown circular to irregular spots — Leaf Spot, Anthracnose or Blight",
            "pct":round(np.sum(m>0)/leaf_area*100,1), "contours":c,
            "color":(0,0,180),
            "possible_diseases":["Leaf Spot","Anthracnose","Alternaria Blight","Cercospora Leaf Spot"]}

    # 2. YELLOWING
    m, c = get_cnts(cv2.inRange(hsv, np.array([20,80,100]), np.array([38,255,255])), 1000)
    if c and np.sum(m>0)/leaf_area > 0.04:
        found["yellowing"] = {"label":"Yellowing / Chlorosis",
            "desc":"Yellowing of leaf tissue — Downy Mildew, Wilt or nutrient deficiency",
            "pct":round(np.sum(m>0)/leaf_area*100,1), "contours":c,
            "color":(0,220,220),
            "possible_diseases":["Downy Mildew","Fusarium Wilt","Mosaic Virus","Chlorosis"]}

    # 3. BLACK NECROSIS
    m, c = get_cnts(cv2.inRange(hsv, np.array([0,0,0]), np.array([180,255,50])), 600)
    if c and np.sum(m>0)/leaf_area > 0.01:
        found["black_necrosis"] = {"label":"Black / Necrotic Areas",
            "desc":"Black dead tissue — severe Anthracnose, advanced Blight or Sooty Mold",
            "pct":round(np.sum(m>0)/leaf_area*100,1), "contours":c,
            "color":(50,50,50),
            "possible_diseases":["Anthracnose","Leaf Blight","Sooty Mold"]}

    # 4. WHITE POWDERY
    m, c = get_cnts(cv2.inRange(hsv, np.array([0,0,215]), np.array([180,22,255])), 1000)
    if c and np.sum(m>0)/leaf_area > 0.03:
        found["white_powdery"] = {"label":"White Powdery Coating",
            "desc":"White or grey powdery patches — Powdery Mildew",
            "pct":round(np.sum(m>0)/leaf_area*100,1), "contours":c,
            "color":(200,200,200),
            "possible_diseases":["Powdery Mildew","Downy Mildew"]}

    # 5. RUST
    m, c = get_cnts(cv2.inRange(hsv, np.array([8,120,80]), np.array([18,255,220])), 600)
    if c and np.sum(m>0)/leaf_area > 0.01:
        found["rust_pustules"] = {"label":"Rust / Orange Pustules",
            "desc":"Orange-brown powdery pustules — Rust disease",
            "pct":round(np.sum(m>0)/leaf_area*100,1), "contours":c,
            "color":(0,120,255),
            "possible_diseases":["Rust","Leaf Rust","Alternaria Blight and Rust"]}

    # 6. WATER SOAKED
    m, c = get_cnts(cv2.inRange(hsv, np.array([85,25,90]), np.array([115,100,200])), 600)
    if c and np.sum(m>0)/leaf_area > 0.015:
        found["water_soaked"] = {"label":"Water-soaked Lesions",
            "desc":"Translucent water-soaked spots — Bacterial Leaf Spot or Blight",
            "pct":round(np.sum(m>0)/leaf_area*100,1), "contours":c,
            "color":(200,180,0),
            "possible_diseases":["Bacterial Leaf Spot","Bacterial Blight","Soft Rot"]}

    return found

SYMPTOM_DISEASE_MAP = {
    "brown_spots": [
        {"disease":"Leaf Spot / Anthracnose",
         "causal":"Colletotrichum gloeosporioides, Alternaria sp., Cercospora sp.",
         "treatment":"Carbendazim 0.1% + Mancozeb 0.25% spray at 15-day intervals. Remove infected leaves. Apply Bordeaux mixture 1% as alternative.",
         "immediate":["Remove and destroy all infected leaves immediately",
                      "Spray Mancozeb (0.25%) or Carbendazim (0.1%)",
                      "Avoid overhead irrigation — water at base only"],
         "prevention":["Maintain plant spacing for air circulation",
                       "Remove fallen leaves from base regularly",
                       "Apply preventive copper fungicide during monsoon season",
                       "Use disease-free planting material"]}
    ],
    "yellowing": [
        {"disease":"Downy Mildew / Chlorosis",
         "causal":"Peronospora belbahrii, Pythium sp., nutrient deficiency",
         "treatment":"Mancozeb + Metalaxyl spray. Check soil pH and nutrient levels. Apply balanced NPK fertilizer.",
         "immediate":["Remove severely yellowed leaves",
                      "Apply Mancozeb + Metalaxyl (Ridomil) spray",
                      "Improve soil drainage immediately"],
         "prevention":["Avoid waterlogging — ensure proper drainage",
                       "Ensure balanced NPK fertilization",
                       "Improve air circulation around plant",
                       "Reduce humidity — avoid evening watering"]}
    ],
    "white_powdery": [
        {"disease":"Powdery Mildew",
         "causal":"Erysiphe sp., Podosphaera sp., Oidium azadiractae",
         "treatment":"Wettable Sulphur 0.3% OR Neem oil 2% spray. Eucalyptus leaf extract 10%. Carbendazim 500g as follow-up.",
         "immediate":["Remove heavily infected leaves and destroy",
                      "Spray Wettable Sulphur (0.3%) immediately",
                      "Ensure good air circulation around plant"],
         "prevention":["Avoid overhead watering — water at base only",
                       "Maintain plant spacing",
                       "Apply preventive neem oil spray monthly",
                       "Avoid excessive nitrogen fertilizer"]}
    ],
    "rust_pustules": [
        {"disease":"Rust Disease",
         "causal":"Puccinia sp., Uromyces sp., Phakospora pachyrhizi",
         "treatment":"Wettable Sulphur/Copper oxychloride spray. Propiconazole 0.1% or Zineb 2.5kg/ha. Mancozeb or chlorothalonil.",
         "immediate":["Remove infected leaves and destroy — do not compost",
                      "Spray Propiconazole (0.1%) or Mancozeb",
                      "Avoid wetting leaves during watering"],
         "prevention":["Plant resistant varieties where available",
                       "Maintain proper plant spacing",
                       "Spray preventive fungicide before monsoon",
                       "Remove and burn infected plant debris"]}
    ],
    "black_necrosis": [
        {"disease":"Severe Blight / Anthracnose",
         "causal":"Colletotrichum gloeosporioides, Alternaria alternata, Phytophthora sp.",
         "treatment":"Copper oxychloride 0.3% + Mancozeb 0.25% spray. Bordeaux mixture 1%. Carbendazim 0.1%.",
         "immediate":["Immediately remove all blackened/dead tissue",
                      "Spray Copper oxychloride (0.3%)",
                      "Isolate plant from others to prevent spread"],
         "prevention":["Improve drainage — avoid waterlogging",
                       "Reduce canopy density by pruning",
                       "Apply preventive Bordeaux mixture before rains",
                       "Use certified disease-free seeds/cuttings"]}
    ],
    "water_soaked": [
        {"disease":"Bacterial Leaf Spot / Blight",
         "causal":"Pseudomonas cichorii, Xanthomonas campestris",
         "treatment":"Copper oxychloride (0.4%) + Streptocycline (0.05%) spray. Avoid overhead irrigation.",
         "immediate":["Stop overhead irrigation immediately",
                      "Spray Copper oxychloride (0.4%) + Streptocycline (0.05%)",
                      "Remove infected leaves with sterilized tools"],
         "prevention":["Use drip irrigation — never overhead",
                       "Sterilize pruning tools with alcohol before use",
                       "Do not work with plants when leaves are wet",
                       "Ensure good air circulation"]}
    ]
}


def symptom_first_diagnosis(detected_symptoms):
    """
    Primary diagnosis based on symptoms detected — works regardless of species.
    Based on research paper Table 1 diseases of medicinal plants in India.
    """
    if not detected_symptoms:
        return []

    results = []
    for sid, sdata in detected_symptoms.items():
        if sid in SYMPTOM_DISEASE_MAP:
            for disease_info in SYMPTOM_DISEASE_MAP[sid][:1]:  # top match per symptom
                results.append({
                    "symptom_observed": sdata["label"],
                    "symptom_description": sdata["desc"],
                    "affected_pct": sdata["pct"],
                    "disease": disease_info["disease"],
                    "causal_organism": disease_info["causal"],
                    "treatment": disease_info["treatment"],
                    "immediate_actions": disease_info["immediate"],
                    "preventive_measures": disease_info["prevention"],
                    "confidence": "High" if sdata["pct"] > 5 else "Moderate"
                })

    # Sort by affected area
    results.sort(key=lambda x: x["affected_pct"], reverse=True)
    return results

def annotate(img_pil, symptoms, species="", conf=""):
    AW, AH = 900, 675
    img_r = img_pil.resize((AW, AH))
    bgr = cv2.cvtColor(np.array(img_r), cv2.COLOR_RGB2BGR)
    sx, sy = AW/512, AH/512

    for sid, sdata in symptoms.items():
        color = sdata["color"]
        for cnt in sdata["contours"]:
            sc = (cnt.astype(float)*[sx,sy]).astype(np.int32)
            (cx,cy),r = cv2.minEnclosingCircle(sc)
            cx,cy,r = int(cx),int(cy),max(int(r*1.4),22)
            cv2.circle(bgr,(cx,cy),r+12,color,3)
            cv2.circle(bgr,(cx,cy),r,color,5)
            bright = tuple(min(255,c+80) for c in color)
            cv2.circle(bgr,(cx,cy),r-8,bright,2)
            cv2.circle(bgr,(cx,cy),8,color,-1)
            # Label
            lbl = sdata["label"][:16]
            (tw,_),_ = cv2.getTextSize(lbl,cv2.FONT_HERSHEY_SIMPLEX,0.4,1)
            lx = min(cx+r+8, AW-tw-5)
            ly = max(cy,15)
            cv2.rectangle(bgr,(lx-2,ly-12),(lx+tw+2,ly+4),(0,0,0),-1)
            cv2.putText(bgr,lbl,(lx,ly),cv2.FONT_HERSHEY_SIMPLEX,0.4,
                       tuple(min(255,c+120) for c in color),1,cv2.LINE_AA)

    # Banner
    ban = np.zeros((60,AW,3),np.uint8); ban[:]=(15,15,15)
    cv2.putText(ban,f"Vanaushadhi Rakshak | {species} ({conf})",
                (10,22),cv2.FONT_HERSHEY_SIMPLEX,0.55,(80,220,80),1,cv2.LINE_AA)
    syms = " | ".join(s["label"][:12] for s in list(symptoms.values())[:3])
    cv2.putText(ban,f"Symptoms: {syms}",(10,48),
                cv2.FONT_HERSHEY_SIMPLEX,0.42,(180,180,180),1,cv2.LINE_AA)

    # Legend
    leg = np.zeros((40,AW,3),np.uint8); leg[:]=(15,15,15)
    x=10
    for sid,sdata in list(symptoms.items())[:4]:
        color=sdata["color"]
        cv2.circle(leg,(x+8,20),8,color,-1)
        cv2.putText(leg,sdata["label"][:14],(x+22,25),
                   cv2.FONT_HERSHEY_SIMPLEX,0.36,(200,200,200),1)
        x+=200

    out = np.vstack([ban,bgr,leg])
    _,buf = cv2.imencode(".jpg",out,[cv2.IMWRITE_JPEG_QUALITY,92])
    return base64.b64encode(buf.tobytes()).decode()

# ── API ─────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def root():
    return jsonify({"status":"online","model_loaded":MODEL is not None,
                    "species":len(SPECIES_MAP),"db_plants":len(DISEASE_DB)})

@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    if MODEL is None:
        return jsonify({"success":False,"error":"Model not loaded"}),503
    try:
        # Load image
        if "image" in request.files and request.files["image"].filename:
            img = Image.open(request.files["image"].stream).convert("RGB")
        elif request.is_json and request.json.get("image_base64"):
            img = Image.open(io.BytesIO(base64.b64decode(
                request.json["image_base64"]))).convert("RGB")
        elif request.form.get("image"):
            data = request.form["image"]
            if "," in data: data = data.split(",")[1]
            img = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGB")
        else:
            return jsonify({"success":False,"error":"No image"}),400

        # No species prediction — symptom-only diagnosis

        # Symptom detection (primary diagnosis driver)
        symptoms = detect_symptoms(img)

        # Symptom-first diagnosis (works for any plant)
        sym_diagnoses = symptom_first_diagnosis(symptoms)

        # No species lookup needed

        # Determine overall health
        is_healthy = len(symptoms) == 0
        primary = sym_diagnoses[0] if sym_diagnoses else None

        # Annotated image
        annotated = annotate(img, symptoms, "Vanaushadhi Rakshak", "")

        return jsonify({
            "success": True,
            "health_status": "Healthy" if is_healthy else "Diseased",
            "total_symptoms_detected": len(symptoms),
            "symptoms_observed": [
                {
                    "symptom_id": sid,
                    "label": sdata["label"],
                    "description": sdata["desc"],
                    "affected_area_pct": sdata["pct"],
                    "possible_diseases": sdata["possible_diseases"]
                }
                for sid, sdata in symptoms.items()
            ],
            "diagnosis": {
                "primary_disease": primary["disease"] if primary else "No disease detected",
                "based_on_symptom": primary["symptom_observed"] if primary else None,
                "causal_organism": primary["causal_organism"] if primary else "N/A",
                "treatment": primary["treatment"] if primary else "Plant appears healthy. Maintain regular care.",
                "immediate_actions": primary["immediate_actions"] if primary else [
                    "Continue regular watering schedule",
                    "Inspect weekly for early disease signs",
                    "Ensure adequate sunlight and air circulation"
                ],
                "preventive_measures": primary["preventive_measures"] if primary else [
                    "Maintain proper plant spacing",
                    "Apply neem oil spray monthly as preventive",
                    "Use balanced fertilization"
                ],
                "confidence": primary["confidence"] if primary else "N/A",
                "reference": "Ghosh & Gupta, J. Medicinal Plants Studies 2024; 12(2):19-34"
            },
            "all_diagnoses": sym_diagnoses,
            "annotated_image": annotated
        })

    except Exception:
        traceback.print_exc()
        return jsonify({"success":False,"error":traceback.format_exc()}),500

@app.route("/api/species", methods=["GET"])
def list_species():
    return jsonify({"count":len(SPECIES_MAP),
                    "species":list(SPECIES_MAP.values())})

boot()

if __name__ == "__main__":
    print("="*60)
    print("  VANAUSHADHI RAKSHAK | Symptom-First Diagnosis")
    print("="*60)
    print(f"  Model  : {'OK' if MODEL else 'FAILED'} — {len(SPECIES_MAP)} species")
    print(f"  DB     : {len(DISEASE_DB)} plants")
    print(f"  Device : {DEVICE}")
    print("="*60)
    app.run(host="0.0.0.0", port=5000, debug=False)
