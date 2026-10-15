import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { detectFood } from "../services/foodServices";
import "../styles/FoodDetection.css";

import BackToDashboard from "../components/BackToDashboard";


const FoodDetection = () => {
  const navigate = useNavigate();

  // File input
  const fileInputRef = useRef(null);

  // Camera
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE IMAGE
  // ==========================================

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setResult(null);
    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // ==========================================
  // GALLERY / FILE INPUT
  // ==========================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    handleFile(file);

    // Allows selecting the same image again
    event.target.value = "";
  };

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  // ==========================================
  // OPEN CAMERA
  // ==========================================

  const openCamera = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      cameraStreamRef.current = stream;

      setCameraOpen(true);

      // Wait for camera UI to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera access failed:", error);

      setError(
        "Unable to access the camera. Please allow camera permission and try again."
      );
    }
  };

  // ==========================================
  // CLOSE CAMERA
  // ==========================================

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // ==========================================
  // CAPTURE PHOTO
  // ==========================================

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      setError("Camera is not ready. Please try again.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still loading. Please wait a moment.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to capture the image. Please try again.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Unable to capture the image. Please try again.");
          return;
        }

        const file = new File(
          [blob],
          `food-camera-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        handleFile(file);

        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  // ==========================================
  // CAMERA CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        cameraStreamRef.current = null;
      }
    };
  }, []);

  // ==========================================
  // ANALYZE FOOD
  // ==========================================

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload a food image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await detectFood(selectedFile);

      setResult(data);
    } catch (error) {
      console.error(
        "Food detection failed:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.detail ||
          "Unable to analyze the image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REMOVE / RESET
  // ==========================================

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview("");
    setResult(null);
    setError("");
  };

  // ==========================================
  // RESULT VALUES
  // ==========================================

  const foodConfidence = result
    ? (result.food_confidence * 100).toFixed(1)
    : null;

  const toxicProbability = result
    ? (result.toxic_probability * 100).toFixed(1)
    : null;

  const isToxic = result?.toxicity === "TOXIC";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="food-page">

      {/* ======================================
          TOP BAR
      ====================================== */}

      
<header className="food-header">
  <BackToDashboard />

  <div className="food-header-brand">
    <span className="food-brand-icon" aria-hidden="true">
      🐾
    </span>
    <span>PawSense</span>
  </div>
</header>



      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="food-content">

        {/* INTRO */}

        <section className="food-intro">

          <span className="food-eyebrow">
            FOOD SAFETY AI
          </span>

          <h1>
            Food & Toxicity
          </h1>

          <p>
            Check whether a food is safe for your pet using
            AI-powered image analysis.
          </p>

        </section>


        {/* ======================================
            ANALYSIS CARD
        ====================================== */}

        <section className="food-analysis-card">

          {/* ====================================
              LEFT — UPLOAD
          ==================================== */}

          <div className="food-upload-section">

            <div className="food-section-title">

              <div className="food-title-icon">
                🍎
              </div>

              <div>
                <h2>Analyze Food</h2>

                <p>
                  Take a photo or upload a clear image
                  of the food.
                </p>
              </div>

            </div>


            {/* ==================================
                PREVIEW
            ================================== */}

            {preview ? (

              <div className="food-preview-wrapper">

                <img
                  src={preview}
                  alt="Selected food"
                  className="food-preview"
                />

                <button
                  type="button"
                  className="food-remove-btn"
                  onClick={handleRemove}
                >
                  ×
                </button>

                <div className="food-file-name">
                  {selectedFile?.name}
                </div>

              </div>

            ) : !cameraOpen ? (
  <>

                {/* ==================================
                    CAMERA + GALLERY OPTIONS
                ================================== */}

                <div className="food-source-options">

                  {/* CAMERA */}

                  <button
                    type="button"
                    className="food-source-card"
                    onClick={openCamera}
                  >

                    <div className="food-source-icon">
                      📸
                    </div>

                    <div>
                      <h3>Use Camera</h3>

                      <p>
                        Take a photo of the food
                      </p>
                    </div>

                  </button>


                  {/* GALLERY */}

                  <button
                    type="button"
                    className="food-source-card"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >

                    <div className="food-source-icon">
                      🏞️
                    </div>

                    <div>
                      <h3>Choose from Gallery</h3>

                      <p>
                        Select an existing image
                      </p>
                    </div>

                  </button>

                </div>


                {/* ==================================
                    DRAG & DROP
                ================================== */}

                <div
                  className={`food-drop-zone ${
                    dragActive ? "drag-active" : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() =>
                    setDragActive(false)
                  }
                  onDrop={handleDrop}
                >

                  <div className="food-upload-icon">
                    +
                  </div>

                  <h3>
                    Or drag & drop an image
                  </h3>

                  <small>
                    JPG, JPEG or PNG
                  </small>

                </div>

              </>

            ) : null}


            {/* ==================================
                HIDDEN FILE INPUT
            ================================== */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              hidden
              onChange={handleFileChange}
            />


            {/* ==================================
                CAMERA UI
            ================================== */}

            {cameraOpen && (

              <div className="food-camera">

                {/* CAMERA HEADER */}

                <div className="food-camera-header">

                  <div>

                    <span>
                      FOOD CAMERA
                    </span>

                    <h3>
                      Capture Food Image
                    </h3>

                  </div>


                  <button
                    type="button"
                    className="camera-close-btn"
                    onClick={closeCamera}
                  >
                    ×
                  </button>

                </div>


                {/* LIVE CAMERA */}

                <div className="food-camera-view">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="food-camera-video"
                  />

                  <div className="camera-frame"></div>

                </div>


                {/* CAMERA ACTIONS */}

                <div className="food-camera-actions">

                  <button
                    type="button"
                    className="camera-cancel-btn"
                    onClick={closeCamera}
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    className="camera-capture-btn"
                    onClick={capturePhoto}
                  >
                    <span>●</span>
                    Take Photo
                  </button>

                </div>

              </div>

            )}


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

              <div className="food-error">

                <span>!</span>

                {error}

              </div>

            )}


            {/* ==================================
                ANALYZE BUTTON
            ================================== */}
          {!cameraOpen && (
            <button
              type="button"
              className="food-analyze-btn"
              disabled={!selectedFile || loading}
              onClick={handleAnalyze}
            >

              {loading ? (

                <>
                  <span className="food-spinner"></span>
                  Analyzing...
                </>

              ) : (

                <>
                  Analyze Food
                </>

              )}

            </button> 
            )}

          </div>


          {/* ====================================
              RIGHT — RESULT
          ==================================== */}

          <div className="food-result-section">

            {/* EMPTY */}

            {!result && !loading && (

              <div className="food-empty-result">

                <div className="food-empty-icon">
                  ✦
                </div>

                <h3>
                  Your result will appear here
                </h3>

                <p>
                  Upload a food image and let PawSense
                  analyze its safety for your pet.
                </p>

              </div>

            )}


            {/* LOADING */}

            {loading && (

              <div className="food-empty-result">

                <div className="food-analysis-spinner">
                  🐾
                </div>

                <h3>
                  Analyzing your food...
                </h3>

                <p>
                  PawSense AI is identifying the food
                  and checking its toxicity.
                </p>

              </div>

            )}


            {/* ==================================
                RESULT
            ================================== */}

            {result && !loading && (

              <div
                className={`food-result ${
                  isToxic
                    ? "result-toxic"
                    : "result-safe"
                }`}
              >

                {/* RESULT HEADER */}

                <div className="food-result-top">

                  <div
                    className={`food-result-icon ${
                      isToxic
                        ? "icon-toxic"
                        : "icon-safe"
                    }`}
                  >
                    {isToxic ? "⚠" : "✓"}
                  </div>

                  <div>

                    <span className="food-result-label">
                      ANALYSIS RESULT
                    </span>

                    <h2>
                      {result.food}
                    </h2>

                  </div>

                </div>


                {/* SAFETY STATUS */}

                <div className="food-safety-status">

                  <span className="status-symbol">
                    {isToxic ? "!" : "✓"}
                  </span>

                  <div>

                    <span>
                      Food Safety
                    </span>

                    <strong>
                      {isToxic
                        ? "TOXIC"
                        : "SAFE"}
                    </strong>

                  </div>

                </div>


                {/* METRICS */}

                <div className="food-metrics">

                  {/* FOOD CONFIDENCE */}

                  <div className="food-metric">

                    <span>
                      Food Confidence
                    </span>

                    <strong>
                      {foodConfidence}%
                    </strong>

                    <div className="metric-bar">

                      <div
                        style={{
                          width: `${foodConfidence}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* TOXIC PROBABILITY */}

                  <div className="food-metric">

                    <span>
                      Toxic Probability
                    </span>

                    <strong>
                      {toxicProbability}%
                    </strong>

                    <div className="metric-bar">

                      <div
                        style={{
                          width: `${toxicProbability}%`,
                        }}
                      ></div>

                    </div>

                  </div>

                </div>


                {/* MESSAGE */}

                <div className="food-result-message">

                  <span>
                    {isToxic ? "⚠️" : "💚"}
                  </span>

                  <p>

                    {isToxic
                      ? "This food may be harmful to your pet. Avoid feeding it and consult a veterinarian if your pet has already consumed it."
                      : "This food was classified as safe by PawSense AI. Always consider your pet's individual dietary needs."}

                  </p>

                </div>


                {/* NEW ANALYSIS */}

                <button
                  type="button"
                  className="food-new-analysis"
                  onClick={handleRemove}
                >
                  Analyze Another Food
                </button>

              </div>

            )}

          </div>

        </section>


        {/* ======================================
            DISCLAIMER
        ====================================== */}

        <p className="food-disclaimer">

          PawSense AI provides supportive information
          and does not replace professional veterinary
          advice.

        </p>

      </main>

    </div>
  );
};

export default FoodDetection;