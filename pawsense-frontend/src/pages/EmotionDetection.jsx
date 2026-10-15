import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { detectEmotion } from "../services/emotionService";
import "../styles/EmotionDetection.css";
import BackToDashboard from "../components/BackToDashboard";

const EmotionDetection = () => {
  const navigate = useNavigate();

  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // LIVE RECORDING
  // ---------------------------------------------------------

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // ---------------------------------------------------------
  // Supported formats
  // ---------------------------------------------------------

  const supportedFormats = [
    ".wav",
    ".mp3",
    ".m4a",
    ".ogg",
    ".webm",
    ".aac",
    ".flac",
    ".mp4",
    ".mov",
    ".3gp",
    ".wma",
  ];

  // ---------------------------------------------------------
  // Handle uploaded file
  // ---------------------------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Stop recording if currently recording
    stopRecording();

    setAudioFile(file);
    setResult(null);
    setError("");
    setRecordingTime(0);

    const newUrl = URL.createObjectURL(file);
    setAudioUrl(newUrl);
  };

  // ---------------------------------------------------------
  // LIVE MICROPHONE RECORDING
  // ---------------------------------------------------------

  const startRecording = async () => {
    try {
      setError("");
      setResult(null);

      // Ask browser for microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Prefer WebM/Opus
      let mimeType = "audio/webm";

      if (
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ) {
        mimeType = "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported("audio/webm")
      ) {
        mimeType = "audio/webm";
      } else if (
        MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
      ) {
        mimeType = "audio/ogg;codecs=opus";
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        const extension = mimeType.includes("ogg")
          ? "ogg"
          : "webm";

        const file = new File(
          [blob],
          `live-pet-recording-${Date.now()}.${extension}`,
          {
            type: mimeType,
          }
        );

        setAudioFile(file);

        const newUrl = URL.createObjectURL(blob);
        setAudioUrl(newUrl);

        setIsRecording(false);

        // Stop microphone
        if (mediaStreamRef.current) {
          mediaStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          mediaStreamRef.current = null;
        }
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event);
        setError("Unable to record audio.");
        setIsRecording(false);
      };

      recorder.start();

      setRecordingTime(0);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);

      setError(
        "Microphone access was denied or is unavailable. Please allow microphone permission."
      );

      setIsRecording(false);
    }
  };

  // ---------------------------------------------------------
  // STOP RECORDING
  // ---------------------------------------------------------

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // ---------------------------------------------------------
  // RECORDING TIMER
  // ---------------------------------------------------------

  useEffect(() => {
    let timer;

    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((previous) => previous + 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording]);

  // ---------------------------------------------------------
  // FORMAT RECORDING TIME
  // ---------------------------------------------------------

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // ---------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [audioUrl]);

  // ---------------------------------------------------------
  // ANALYZE AUDIO
  // ---------------------------------------------------------

  const handleAnalyze = async () => {
    if (!audioFile) {
      setError("Please upload or record an audio file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Sending audio for emotion detection:", {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size,
      });

      const data = await detectEmotion(audioFile);

      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setError("Emotion detection failed.");
      }
    } catch (err) {
      console.error("Emotion detection error:", err);

      setError(
        err.response?.data?.detail ||
          "Something went wrong while analyzing the audio."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // BACK TO DASHBOARD
  // ---------------------------------------------------------

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // ---------------------------------------------------------
  // FILE PICKER
  // ---------------------------------------------------------

  const acceptedFormats = supportedFormats.join(",");

  // ---------------------------------------------------------
  // AUDIO PREVIEW
  // ---------------------------------------------------------

  const isAudioFile =
    audioFile &&
    (
      audioFile.type.startsWith("audio/") ||
      /\.(wav|mp3|m4a|ogg|webm|aac|flac|wma)$/i.test(
        audioFile.name
      )
    );

  return (
    <div className="emotion-page">
      <BackToDashboard />

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="emotion-header">
        <div className="emotion-heading">

          <span className="feature-label">
            PAWSENSE AI
          </span>

          <h1>Emotion Detection</h1>

          <p>
            Understand your pet's vocal behavior through AI-powered
            acoustic analysis.
          </p>

        </div>

      </div>


      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="emotion-card">

        <div className="upload-icon">
          <span>🎙</span>
        </div>

        <h2>Analyze Your Pet's Voice</h2>

        <p className="upload-description">
          Upload a recording or record your pet's voice live
          using your microphone.
        </p>


        {/* =================================================
            INPUT OPTIONS
        ================================================== */}

        <div className="emotion-input-options">

          {/* -------------------------------------------------
              UPLOAD
          -------------------------------------------------- */}

          <label className="emotion-input-option">

            <input
              type="file"
              accept={acceptedFormats}
              onChange={handleFileChange}
              disabled={isRecording || loading}
            />

            <div className="input-option-icon">
              📁
            </div>

            <div className="input-option-content">

              <span className="input-option-title">
                Upload Audio
              </span>

              <span className="input-option-subtitle">
                Choose a recording from your device
              </span>

            </div>

          </label>


          {/* -------------------------------------------------
              LIVE RECORDING
          -------------------------------------------------- */}

          <button
            type="button"
            className={`emotion-input-option record-option ${
              isRecording ? "recording-active" : ""
            }`}
            onClick={
              isRecording
                ? stopRecording
                : startRecording
            }
            disabled={loading}
          >

            <div className="input-option-icon">
              {isRecording ? "⏹" : "🎙️"}
            </div>

            <div className="input-option-content">

              <span className="input-option-title">

                {isRecording
                  ? "Stop Recording"
                  : "Record Live"}

              </span>

              <span className="input-option-subtitle">

                {isRecording
                  ? `Recording ${formatRecordingTime(
                      recordingTime
                    )}`
                  : "Use your microphone"}

              </span>

            </div>

          </button>

        </div>


        {/* =================================================
            RECORDING STATUS
        ================================================== */}

        {isRecording && (

          <div className="recording-status">

            <span className="recording-dot"></span>

            <div>
              <strong>Recording your pet's voice...</strong>

              <span>
                {formatRecordingTime(recordingTime)}
              </span>
            </div>

          </div>

        )}


        {/* =================================================
            SELECTED / RECORDED FILE
        ================================================== */}

        {audioFile && !isRecording && (

          <div className="selected-file">

            <div className="file-info">

              <div className="file-icon">
                🎵
              </div>

              <div className="file-details">

                <span className="file-name">
                  {audioFile.name}
                </span>

                <span className="file-size">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>

              </div>

            </div>


            {/* Audio Preview */}

            {isAudioFile && audioUrl && (

              <audio
                className="audio-player"
                controls
                src={audioUrl}
              >
                Your browser does not support audio playback.
              </audio>

            )}

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="emotion-error">
            {error}
          </div>

        )}


        {/* =================================================
            ANALYZE BUTTON
        ================================================== */}

        <button
          type="button"
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={!audioFile || loading || isRecording}
        >

          {loading ? (

            <>
              <span className="loading-spinner"></span>
              Analyzing with PawSense...
            </>

          ) : (

            "Analyze Audio"

          )}

        </button>

      </div>


      {/* =====================================================
          ANALYSIS RESULT
      ====================================================== */}

      {result && (

        <div className="emotion-result">

          <div className="result-header">

            <div className="result-icon">
              🐾
            </div>

            <div>

              <span className="result-label">
                PAWSENSE AI
              </span>

              <h2>Emotion Analysis</h2>

              <p>
                Estimated from your pet's vocal characteristics.
              </p>

            </div>

          </div>


          {/* RESULT GRID */}

          <div className="emotion-result-grid">

            {/* Animal Species */}

            <div className="emotion-result-item">

              <span className="result-item-label">
                Animal Species
              </span>

              <strong className="emotion-species">
                {result.species_display || "Not available"}
              </strong>

            </div>


            {/* Estimated State */}

            <div className="emotion-result-item">

              <span className="result-item-label">
                Estimated State
              </span>

              <strong className="emotion-state">
                {result.estimated_state_display ||
                  result.estimated_state ||
                  "Not available"}
              </strong>

            </div>


            {/* Confidence */}

            <div className="emotion-result-item">

              <span className="result-item-label">
                State Confidence
              </span>

              <strong className="emotion-confidence">

                {typeof result.confidence === "number"
                  ? `${(result.confidence * 100).toFixed(1)}%`
                  : "Not available"}

              </strong>

            </div>

          </div>


          {/* CONTINUE */}

          <button
            type="button"
            className="continue-button"
            onClick={handleBackToDashboard}
          >
            Continue to Dashboard
          </button>

        </div>

      )}

    </div>
  );
};

export default EmotionDetection;