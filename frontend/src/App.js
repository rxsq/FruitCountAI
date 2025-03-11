import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./App.css"; 

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [estimatedApples, setEstimatedApples] = useState(null);
  const [detectionImage, setDetectionImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caseWeight, setCaseWeight] = useState(0);
  const [averageAppleWeight, setAverageAppleWeight] = useState(150); 

  const cropperRef = useRef(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/average-weight")
      .then((response) => setAverageAppleWeight(response.data.average_weight))
      .catch((err) => console.error("Failed to fetch average weight", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setPreview(null); // Reset preview
        setCroppedImage(null); // Reset cropped image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          console.error("ERROR: Cropping failed, blob is null.");
          return;
        }
        const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
        setCroppedImage(file);
        setPreview(URL.createObjectURL(file));
      }, "image/jpeg");
    }
  };

  const resetCrop = () => {
    setPreview(null);
    setCroppedImage(null);
  };

  const handleUpload = async () => {
    if (!croppedImage) {
      alert("Please crop the image first!");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", croppedImage);
    try {
      const response = await axios.post("http://127.0.0.1:5000/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEstimatedApples(response.data.estimated_apples);
      setDetectionImage(`http://127.0.0.1:5000${response.data.detection_image}`);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAverageWeightChange = (e) => {
    const newWeight = parseFloat(e.target.value);
    if (!isNaN(newWeight) && newWeight > 0) {
      setAverageAppleWeight(newWeight);
      axios.post("http://127.0.0.1:5000/average-weight", { average_weight: newWeight })
        .catch((err) => console.error("Failed to update average weight", err));
    }
  };

  const estimatedCases = estimatedApples && caseWeight > 0
    ? (estimatedApples * averageAppleWeight) / (caseWeight * 1000) 
    : 0;

  return (
    <div className="app-container">
      <h1>Fruit Count AI</h1>

      <div className="upload-section">
        <input type="file" onChange={handleFileChange} accept="image/*" />
      </div>

      {image && (
        <div className="cropper-container">
          <h3>Crop Your Image:</h3>
          <Cropper
            src={image}
            style={{ height: 350, width: "100%" }}
            guides={true}
            ref={cropperRef}
            viewMode={2}
            minCropBoxHeight={50}
            minCropBoxWidth={50}
            background={false}
            autoCropArea={1}
          />
          <div className="crop-buttons">
            <button onClick={handleCrop} className="btn">Crop Image</button>
            <button onClick={resetCrop} className="btn btn-reset">Reset</button>
          </div>
        </div>
      )}

      {preview && (
        <div className="image-preview">
          <h3>Cropped Image:</h3>
          <div className="image-container">
            <img src={preview} alt="Cropped Preview" />
          </div>
        </div>
      )}

      {preview && (
        <button onClick={handleUpload} className="btn" disabled={loading}>
          {loading ? "Processing..." : "Upload & Detect"}
        </button>
      )}

      {estimatedApples !== null && (
        <h2>Detected Apples: {estimatedApples}</h2>
      )}

      {detectionImage && (
        <div className="detection-result">
          <h3>Detection Result:</h3>
          <div className="image-container">
            <img src={detectionImage} alt="Detected Fruits" />
          </div>
        </div>
      )}

      <div className="inputs">
        <label>Average Apple Weight (g):</label>
        <input
          type="number"
          value={averageAppleWeight}
          onChange={handleAverageWeightChange}
        />
      </div>

      <div className="inputs">
        <label>Case Weight (kg):</label>
        <input
          type="number"
          value={caseWeight}
          onChange={(e) => setCaseWeight(parseFloat(e.target.value) || 0)}
        />
      </div>

      {estimatedCases > 0 && (
        <h2>Estimated Cases: {estimatedCases.toFixed(2)}</h2>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
