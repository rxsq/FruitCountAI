import os
import cv2
import torch
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)  

MODEL_PATH = r"C:\Users\Andrew\Documents\GitHub\FruitCountAI\runs\detect\train10\weights\best.pt"
model = YOLO(MODEL_PATH)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  

# Store average apple weight (in grams)
AVERAGE_APPLE_WEIGHT = 150  # Default value

def detect_fruits(image_path):
    """
    Runs YOLOv8 inference on an image and estimates apple count using depth perception.
    Returns:
    - Estimated apple count
    - Processed image with bounding boxes
    """
    results = model(image_path)  
    detections = results[0].boxes  
    fruit_count = len(detections)  
    
    image = cv2.imread(image_path)
    apple_sizes = []  # Store apple sizes for depth estimation
    
    for box in detections.xyxy.cpu().numpy():
        x1, y1, x2, y2 = map(int, box[:4])
        apple_sizes.append(abs(x2 - x1) * abs(y2 - y1))  # Area estimation
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2) 
    
    if len(apple_sizes) > 1:
        avg_size = np.mean(apple_sizes)
        estimated_stack_count = round(sum(apple_sizes) / avg_size)
    else:
        estimated_stack_count = fruit_count  # If only one detected, no stack estimation

    output_path = os.path.join(UPLOAD_FOLDER, "detections.jpg")
    cv2.imwrite(output_path, image)
    
    return estimated_stack_count, output_path

@app.route("/detect", methods=["POST"])
def detect():
    """
    Endpoint to detect apples and estimate total count using depth.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    estimated_apples, output_path = detect_fruits(file_path)
    
    return jsonify({
        "estimated_apples": estimated_apples,
        "detection_image": f"/uploads/detections.jpg"
    })

@app.route("/average-weight", methods=["GET", "POST"])
def average_weight():
    """
    Endpoint to get or update the average apple weight.
    """
    global AVERAGE_APPLE_WEIGHT
    if request.method == "POST":
        data = request.json
        if "average_weight" in data:
            AVERAGE_APPLE_WEIGHT = data["average_weight"]
    return jsonify({"average_weight": AVERAGE_APPLE_WEIGHT})

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """
    Endpoint to serve uploaded detection images.
    """
    return send_file(os.path.join(UPLOAD_FOLDER, filename), mimetype="image/jpeg")

if __name__ == "__main__":
    print("🚀 Flask running at http://127.0.0.1:5000/")
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)