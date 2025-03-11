Fruit Count AI

Overview

Fruit Count AI is a web application that detects and counts apples in an uploaded image using a YOLO-based machine learning model. It also estimates the number of cases based on the average apple weight and user-provided case weight.

Features

Upload an image of apples

Detects and counts apples using YOLOv8

Estimates depth perception for stacked apples

Allows user to input case weight (in kg)

Calculates the estimated number of cases based on detected apples

Modern React frontend and Flask backend

Tech Stack

Frontend: React, Axios

Backend: Flask, OpenCV, YOLOv8 (Ultralytics)

Libraries: NumPy, Torch, Flask-CORS

Model: YOLOv8 for fruit detection

Installation & Setup

1. Clone the repository:

git clone https://github.com/rxsq/FruitCountAI.git
cd FruitCountAI

2. Backend Setup (Flask API)

Install dependencies:

python -m venv venv  # Create virtual environment
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
pip install -r requirements.txt

Run the Flask server:

cd api
python app.py

Flask API should now be running at http://127.0.0.1:5000/

3. Frontend Setup (React App)

Install dependencies:

cd frontend
npm install

Run the React app:

npm start

React app should now be running at http://localhost:3000/

API Endpoints

Endpoint

Method

Description

/detect

POST

Uploads an image and detects apples

/average-weight

GET/POST

Get or update the average apple weight

/uploads/<file>

GET

Retrieves processed detection image

Usage

Upload an image of apples.

The AI will detect and count apples.

Enter the case weight in kg.

The app will calculate estimated cases.

TODO

Improve depth estimation

Deploy backend and frontend

Add support for multiple fruit types

Contributing

Pull requests are welcome. For major changes, please open an issue first.

License

MIT License © 2025 Andrew Dionne

