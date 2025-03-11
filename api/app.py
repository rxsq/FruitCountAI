import os
import cv2
import torch
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "runs", "detect", "train10", "weights", "best.pt")
model = YOLO(MODEL_PATH)

AVERAGE_APPLE_WEIGHT = 150  

def detect_fruits(image_path):
    """Runs YOLO inference on an image and returns detected fruit count + processed image path."""
    print(f"Checking if image exists: {image_path}")

    if not os.path.exists(image_path):
        print(f"ERROR: Image not found at {image_path}")
        raise FileNotFoundError(f"Image not found: {image_path}")

    results = model(image_path)  
    detections = results[0].boxes  

    fruit_count = len(detections)  
    image = cv2.imread(image_path)

    # Draw bounding boxes
    for box in detections.xyxy.cpu().numpy():
        x1, y1, x2, y2 = map(int, box[:4])
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # Save detection result with a unique name
    output_filename = f"detection_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
    output_path = os.path.join(UPLOAD_FOLDER, output_filename)
    cv2.imwrite(output_path, image)

    print(f"✅ YOLO detection complete. Fruits detected: {fruit_count}")
    return fruit_count, output_filename 

@app.route("/detect", methods=["POST"])
def detect():
    print("eceived image upload request")

    if "file" not in request.files:
        print("ERROR: No file uploaded")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        print("ERROR: No selected file")
        return jsonify({"error": "No selected file"}), 400

    # Generate a unique filename for each uploaded image
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    filename = f"uploaded_{timestamp}.jpg"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    print(f"Saving file as: {file_path}")
    file.save(file_path)

    try:
        estimated_apples, detection_filename = detect_fruits(file_path)
        return jsonify({
            "estimated_apples": estimated_apples, 
            "detection_image": f"/uploads/{detection_filename}"
        })
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"ERROR during detection: {str(e)}")
        return jsonify({"error": "Detection failed", "details": str(e)}), 500

@app.route("/average-weight", methods=["GET", "POST"])
def average_weight():
    """Endpoint to get or update the average apple weight."""
    global AVERAGE_APPLE_WEIGHT
    if request.method == "POST":
        data = request.json
        if "average_weight" in data:
            AVERAGE_APPLE_WEIGHT = data["average_weight"]
    return jsonify({"average_weight": AVERAGE_APPLE_WEIGHT})

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """Endpoint to serve uploaded detection images."""
    print(f" Serving file: {filename}")
    return send_from_directory(UPLOAD_FOLDER, filename, mimetype="image/jpeg")

if __name__ == "__main__":
    print("🚀 Flask running at http://127.0.0.1:5000/")
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
