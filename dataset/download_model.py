from roboflow import Roboflow

# ✅ Replace with your actual Roboflow API key
rf = Roboflow(api_key="FelkDt3u0CkczBaRuMWn")  

# ✅ Make sure workspace & project IDs are correct
project = rf.workspace("andrews-workspace-q2cfv").project("fruitcountai")

# ✅ Check the correct version number (Replace `1` if needed)
version_number = 1  # Change this to match your trained model version in Roboflow

# ✅ Download the model (YOLOv8 weights)
version = project.version(version_number)
model_path = version.download("yolov8")

print(f"✅ Model downloaded successfully: {model_path}")
