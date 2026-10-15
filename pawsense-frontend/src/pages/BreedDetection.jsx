import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/images/logo.png";
import { predictBreed } from "../services/api";

import "../styles/BreedDetection.css";

function BreedDetection() {
    const navigate = useNavigate();
    const location = useLocation();

    // ============================================================
    // STATE
    // ============================================================

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const previewRef = useRef(null);

    // ============================================================
    // CLEAN UP PREVIEW URL
    // ============================================================

    useEffect(() => {
        return () => {
            if (previewRef.current) {
                URL.revokeObjectURL(previewRef.current);
            }
        };
    }, []);

    // ============================================================
    // IMAGE UPLOAD
    // ============================================================

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            return;
        }

        if (previewRef.current) {
            URL.revokeObjectURL(previewRef.current);
        }

        const url = URL.createObjectURL(file);

        previewRef.current = url;

        setImage(file);
        setPreview(url);

        setPrediction(null);
        setError(null);
    };

    // ============================================================
    // REMOVE IMAGE
    // ============================================================

    const handleRemoveImage = () => {
        if (previewRef.current) {
            URL.revokeObjectURL(previewRef.current);
            previewRef.current = null;
        }

        setImage(null);
        setPreview(null);

        setPrediction(null);
        setError(null);
    };

    // ============================================================
    // AI BREED DETECTION
    // ============================================================

    const handleAnalyze = async () => {
        if (!image) {
            alert("Please upload your pet's image first.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setPrediction(null);

            console.log(
                "Sending image to PawSense AI:",
                image.name
            );

            const result = await predictBreed(image);

            console.log(
                "Breed detection result:",
                result
            );

            if (result.success) {
                setPrediction(result);
            } else {
                setError("Breed detection failed.");
            }
        } catch (err) {
            console.error(
                "Breed detection error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to detect breed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // USE DETECTED BREED
    // ============================================================

    const handleUseBreed = () => {
        if (!prediction) {
            return;
        }

        const detectedBreed = prediction.breed
            .replace("Cat_", "")
            .replace("Dog_", "")
            .replace(/-/g, " ");

        const detectedSpecies =
            prediction.breed.startsWith("Cat_")
                ? "Cat"
                : "Dog";

        const previousPetData =
            location.state?.petData || {};

        console.log(
            "Previous Pet Data:",
            previousPetData
        );

        console.log(
            "Detected Breed:",
            detectedBreed
        );

        navigate(
            "/pet-profile",
            {
                state: {
                    petData: {
                        ...previousPetData,
                        breed: detectedBreed,
                        species: detectedSpecies,
                    },
                },
            }
        );
    };

    // ============================================================
    // BACK TO PET PROFILE
    // ============================================================

    const handleBackToProfile = () => {
        navigate(
            "/pet-profile",
            {
                state: {
                    petData:
                        location.state?.petData
                }
            }
        );
    };

    // ============================================================
    // BREED NAME
    // ============================================================

    const getBreedName = () => {
        if (!prediction?.breed) {
            return "";
        }

        return prediction.breed
            .replace("Cat_", "")
            .replace("Dog_", "")
            .replace(/-/g, " ");
    };

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="breed-page">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="breed-navbar">

                <div className="breed-brand">

                    <div className="breed-logo-wrapper">
                        <img
                            src={logo}
                            alt="PawSense"
                            className="breed-logo"
                        />
                    </div>

                    <div className="breed-brand-text">
                        <h1>PawSense</h1>

                        <p>
                            Because they deserve the best care
                        </p>
                    </div>

                </div>


                <div className="priority-badge">

                    <span>🐾</span>

                    <span>
                        Your Pet, Our Priority
                    </span>

                    <span className="priority-heart">
                        ♥
                    </span>

                </div>

            </header>


            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="breed-main">

                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <button
                    type="button"
                    className="page-back-btn"
                    onClick={handleBackToProfile}
                >
                    <span>←</span>
                    Back to Pet Profile
                </button>


                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="breed-hero">

                    <h2>
                        Discover Your Pet's{" "}
                        <span>Breed</span>
                    </h2>

                    <p>
                        Upload a clear photo of your pet and let
                        <strong> PawSense</strong> identify their breed.
                    </p>


                    <div className="hero-tip">

                        <span className="tip-bulb">
                            ♧
                        </span>

                        <span>
                            For best results, use a clear
                            front-facing photo.
                        </span>

                    </div>

                </section>


                {/* ==================================================
                    UPLOAD / PREVIEW CARD
                ================================================== */}

                <section className="detection-workspace">

                    {/* ==================================================
                        UPLOAD
                    ================================================== */}

                    <div className="upload-panel">

                        <div className="panel-title">
                            Upload Pet Image
                        </div>


                        <input
                            type="file"
                            id="breedImage"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageUpload}
                            hidden
                        />


                        {!preview ? (

                            <label
                                htmlFor="breedImage"
                                className="dropzone"
                            >

                                <div className="upload-cloud">
                                    ↑
                                </div>

                                <h3>
                                    Drag & drop your pet's image here
                                </h3>

                                <p>
                                    or
                                </p>

                                <span className="choose-image-btn">
                                    <span>▧</span>
                                    Choose Image
                                </span>

                                <small>
                                    JPG, PNG, WEBP up to 10MB
                                </small>

                            </label>

                        ) : (

                            <div className="dropzone uploaded-dropzone">

                                <div className="uploaded-check">
                                    ✓
                                </div>

                                <div className="uploaded-icon">
                                    ✓
                                </div>

                                <h3>
                                    Image uploaded successfully
                                </h3>

                                <p>
                                    {image?.name}
                                </p>

                                <label
                                    htmlFor="breedImage"
                                    className="change-image-link"
                                >
                                    Change Image
                                </label>

                            </div>

                        )}

                    </div>


                    {/* ==================================================
                        PREVIEW
                    ================================================== */}

                    <div className="preview-panel">

                        <div className="panel-title">
                            Preview
                        </div>


                        <div className="preview-container">

                            {preview ? (

                                <>
                                    <img
                                        src={preview}
                                        alt="Selected pet"
                                        className="pet-preview"
                                    />

                                    <button
                                        type="button"
                                        className="preview-remove"
                                        onClick={handleRemoveImage}
                                        aria-label="Remove image"
                                    >
                                        ×
                                    </button>
                                </>

                            ) : (

                                <div className="empty-preview">

                                    <div>
                                        🐾
                                    </div>

                                    <p>
                                        Your pet's photo
                                        will appear here
                                    </p>

                                </div>

                            )}

                        </div>


                        <button
                            type="button"
                            className={`detect-btn ${
                                !image || loading
                                    ? "disabled"
                                    : ""
                            }`}
                            onClick={handleAnalyze}
                            disabled={!image || loading}
                        >

                            {loading ? (

                                <>
                                    <span className="button-spinner"></span>
                                    Analyzing...
                                </>

                            ) : (

                                <>
                                    ✨
                                    Detect Breed
                                </>

                            )}

                        </button>

                    </div>

                </section>


                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading && (

                    <div className="loading-message">

                        <div className="loading-paw">
                            🐾
                        </div>

                        <div>
                            <strong>
                                PawSense is analyzing your pet...
                            </strong>

                            <p>
                                Our AI is identifying the breed
                                from the uploaded image.
                            </p>
                        </div>

                    </div>

                )}


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && !loading && (

                    <div className="error-message">

                        <div className="error-symbol">
                            !
                        </div>

                        <div>
                            <strong>
                                Detection Failed
                            </strong>

                            <p>
                                {error}
                            </p>
                        </div>

                    </div>

                )}


                {/* ==================================================
                    DETECTION RESULT
                ================================================== */}

                {prediction && !loading && (

                    <section className="result-section">

                        <div className="section-heading">

                            <span>
                                🐾
                            </span>

                            <h2>
                                Detection Result
                            </h2>

                        </div>


                        <div className="result-card">

                            {/* PET IMAGE */}

                            <div className="result-image-wrapper">

                                <img
                                    src={preview}
                                    alt="Detected pet"
                                    className="result-pet-image"
                                />

                            </div>


                            {/* MAIN RESULT */}

                            <div className="result-main">

                                <span className="result-small-label">
                                    BREED DETECTED
                                </span>

                                <h2>
                                    {getBreedName()}
                                </h2>


                                <div className="confidence-pill">

                                    <span>
                                        ♧
                                    </span>

                                    Confidence:
                                    {" "}

                                    <strong>
                                        {prediction.confidence}%
                                    </strong>

                                </div>


                                <p className="result-description">
                                    PawSense AI has analyzed your
                                    pet's image and identified the
                                    most likely breed based on
                                    visual features.
                                </p>


                                <button
                                    type="button"
                                    className="use-breed-result-btn"
                                    onClick={handleUseBreed}
                                >
                                    Use This Breed
                                    <span>→</span>
                                </button>

                            </div>


                            {/* ABOUT RESULT */}

                            <div className="about-result">

                                <h3>
                                    About This Result
                                </h3>


                                <div className="result-point">
                                    <span>✓</span>
                                    <p>
                                        Breed identified by
                                        PawSense AI
                                    </p>
                                </div>


                                <div className="result-point">
                                    <span>✓</span>
                                    <p>
                                        Confidence score:
                                        {" "}
                                        {prediction.confidence}%
                                    </p>
                                </div>


                                <div className="result-point">
                                    <span>✓</span>
                                    <p>
                                        Result is based on the
                                        uploaded pet image
                                    </p>
                                </div>


                                <div className="result-point">
                                    <span>✓</span>
                                    <p>
                                        You can save this breed
                                        to your Pet Profile
                                    </p>
                                </div>

                            </div>

                        </div>

                    </section>

                )}


                {/* ==================================================
                    BOTTOM HELP
                ================================================== */}

                <div className="result-help">

                    <div className="help-icon">
                        🐶
                    </div>

                    <div className="help-content">

                        <strong>
                            Not sure about the result?
                        </strong>

                        <p>
                            You can upload another image
                            and try the detection again.
                        </p>

                    </div>


                    {preview && (

                        <button
                            type="button"
                            className="try-again-btn"
                            onClick={handleRemoveImage}
                        >
                            ↻
                            Try Another Image
                        </button>

                    )}

                </div>

            </main>

        </div>
    );
}

export default BreedDetection;