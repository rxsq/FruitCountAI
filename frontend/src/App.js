import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [estimatedApples, setEstimatedApples] = useState(null);
  const [detectionImage, setDetectionImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [caseWeight, setCaseWeight] = useState(0);
  const [averageAppleWeight, setAverageAppleWeight] = useState(150); 
  
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/average-weight")
      .then((response) => setAverageAppleWeight(response.data.average_weight))
      .catch((err) => console.error("Failed to fetch average weight", err));
  }, []);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", image);
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
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Detect"}
        </button>
      </div>
      
      {preview && (
        <div className="image-preview">
          <h3>Selected Image:</h3>
          <img src={preview} alt="Preview" />
        </div>
      )}
      
      {estimatedApples !== null && (
        <h2>Detected Apples: {estimatedApples}</h2>
      )}
      
      {detectionImage && (
        <div className="detection-result">
          <h3>Detection Result:</h3>
          <img src={detectionImage} alt="Detected Fruits" />
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