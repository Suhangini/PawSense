import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/images/logo.png";

import "../styles/Confirm.css";


function Confirm() {

    const navigate = useNavigate();
    const location = useLocation();

    const petData = location.state?.petData || {};
    const healthData = location.state?.healthData || {};


    // ============================================================
    // BACK TO HEALTH INFORMATION
    // ============================================================

    const handleBack = () => {

        navigate("/health-info", {
            state: {
                petData,
                healthData,
            },
        });

    };


    // ============================================================
    // EDIT PET PROFILE
    // ============================================================

    const handleEditProfile = () => {

        navigate("/pet-profile", {
            state: {
                petData,
            },
        });

    };


    // ============================================================
    // EDIT HEALTH INFORMATION
    // ============================================================

    const handleEditHealth = () => {

        navigate("/health-info", {
            state: {
                petData,
                healthData,
            },
        });

    };


    // ============================================================
    // FINAL CONFIRM
    // ============================================================

    const handleConfirm = () => {

        // Final submission can be connected to backend here later.

        console.log("Final Pet Data:", petData);
        console.log("Final Health Data:", healthData);

        // Temporary destination.
        // Change this when Dashboard is ready.
        navigate("/dashboard", {
            state: {
                petData,
                healthData,
            },
        });

    };


    return (

        <div className="confirm-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="confirm-header">

                <div className="confirm-brand">

                    <img
                        src={logo}
                        alt="PawSense"
                        className="confirm-logo"
                    />

                    <div className="confirm-brand-text">

                        <h1>
                            <span>Paw</span>Sense
                        </h1>

                        <p>
                            AI-Powered Pet Care, Every Step Of The Way
                            <span> ♥</span>
                        </p>

                    </div>

                </div>


                <div className="confirm-welcome">

                    <div className="confirm-welcome-icon">
                        🐾
                    </div>

                    <div>

                        <strong>
                            Welcome, Pet Parent! 🐾
                        </strong>

                        <span>
                            We're here to keep your pet healthy!
                        </span>

                    </div>

                </div>

            </header>



            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="confirm-main">


                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <button
                    type="button"
                    className="confirm-back-btn"
                    onClick={handleBack}
                >

                    <span>←</span>

                    Back to Health Info

                </button>



                {/* ==================================================
                    PROGRESS
                ================================================== */}

                <div className="confirm-progress">

                    <div className="confirm-step completed">

                        <div className="confirm-circle">
                            ✓
                        </div>

                        <span>
                            Pet Profile
                        </span>

                    </div>


                    <div className="confirm-progress-line"></div>


                    <div className="confirm-step completed">

                        <div className="confirm-circle">
                            ✓
                        </div>

                        <span>
                            Health Information
                        </span>

                    </div>


                    <div className="confirm-progress-line"></div>


                    <div className="confirm-step active">

                        <div className="confirm-circle">
                            3
                        </div>

                        <span>
                            Confirm
                        </span>

                    </div>

                </div>



                {/* ==================================================
                    TITLE
                ================================================== */}

                <section className="confirm-title">

                    <h2>
                        Almost Done! Let's{" "}
                        <span>Confirm</span>{" "}
                        Your Pet's Details
                        <b>✓</b>
                    </h2>

                    <p>
                        Please review the information below.
                        You can edit anything if needed.
                    </p>

                </section>



                {/* ==================================================
                    SUMMARY CARD
                ================================================== */}

                <section className="summary-card">


                    {/* ==================================================
                        CARD HEADER
                    ================================================== */}

                    <div className="summary-header">

                        <h3>
                            <span>🐾</span>
                            Pet Summary
                        </h3>


                        <button
                            type="button"
                            className="edit-all-btn"
                            onClick={handleEditProfile}
                        >
                            ✎
                            Edit All
                        </button>

                    </div>



                    {/* ==================================================
                        SUMMARY GRID
                    ================================================== */}

                    <div className="summary-grid">


                        {/* ==================================================
                            BASIC INFORMATION
                        ================================================== */}

                        <div className="summary-section">

                            <div className="summary-section-title">

                                <span className="summary-icon">
                                    🐾
                                </span>

                                Basic Information

                            </div>


                            <div className="summary-row">
                                <span>🐾 Pet Name</span>
                                <strong>
                                    {petData.petName || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>🐶 Species</span>
                                <strong>
                                    {petData.species || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>🦴 Breed</span>
                                <strong>
                                    {petData.breed || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>▣ Age</span>
                                <strong>
                                    {petData.age
                                        ? `${petData.age} Years`
                                        : "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>⚥ Gender</span>
                                <strong>
                                    {petData.gender || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>⚖ Weight</span>
                                <strong>
                                    {petData.weight
                                        ? `${petData.weight} kg`
                                        : "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>📏 Height</span>
                                <strong>
                                    {petData.height
                                        ? `${petData.height} cm`
                                        : "Not provided"}
                                </strong>
                            </div>

                        </div>



                        {/* ==================================================
                            GENERAL HEALTH
                        ================================================== */}

                        <div className="summary-section">

                            <div className="summary-section-title">

                                <span className="summary-icon">
                                    💗
                                </span>

                                General Health Information

                            </div>


                            <div className="summary-row">
                                <span>💉 Neutered / Spayed</span>
                                <strong>
                                    {healthData.neuteredSpayed || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>💉 Vaccination Status</span>
                                <strong>
                                    {healthData.vaccinationStatus || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>📅 Last Vet Visit</span>
                                <strong>
                                    {healthData.lastVetVisit || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>🐾 Known Allergies</span>
                                <strong>
                                    {healthData.knownAllergies || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>📝 Allergy Details</span>
                                <strong>
                                    {healthData.allergyDetails || "None"}
                                </strong>
                            </div>

                        </div>



                        {/* ==================================================
                            MEDICAL HISTORY
                        ================================================== */}

                        <div className="summary-section">

                            <div className="summary-section-title">

                                <span className="summary-icon">
                                    🛡️
                                </span>

                                Medical History

                            </div>


                            <div className="summary-row">
                                <span>🏥 Existing Medical Conditions</span>
                                <strong>
                                    {healthData.existingConditions || "None"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>🏥 Past Surgeries / Treatments</span>
                                <strong>
                                    {healthData.pastSurgeries || "None"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>💊 Currently on Medication</span>
                                <strong>
                                    {healthData.currentMedication || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>💊 Medication Details</span>
                                <strong>
                                    {healthData.medicationDetails || "-"}
                                </strong>
                            </div>

                        </div>



                        {/* ==================================================
                            LIFESTYLE
                        ================================================== */}

                        <div className="summary-section">

                            <div className="summary-section-title">

                                <span className="summary-icon">
                                    🍎
                                </span>

                                Lifestyle & Wellness

                            </div>


                            <div className="summary-row">
                                <span>🍽 Diet Type</span>
                                <strong>
                                    {healthData.dietType || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>🐾 Activity Level</span>
                                <strong>
                                    {healthData.activityLevel || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>💧 Water Intake</span>
                                <strong>
                                    {healthData.waterIntake || "Not provided"}
                                </strong>
                            </div>


                            <div className="summary-row">
                                <span>🐾 Recent Changes</span>
                                <strong>
                                    {healthData.recentChanges || "None"}
                                </strong>
                            </div>

                        </div>

                    </div>



                    {/* ==================================================
                        SUCCESS MESSAGE
                    ================================================== */}

                    <div className="confirm-success">

                        <div className="success-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Looks good!
                            </strong>

                            <p>
                                Your pet's information is complete and
                                ready to help us provide better care.
                            </p>

                        </div>

                        <div className="success-check">
                            ✓
                        </div>

                    </div>



                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="confirm-actions">

                        <button
                            type="button"
                            className="confirm-action back"
                            onClick={handleBack}
                        >
                            ←
                            <span>
                                Back
                            </span>
                        </button>


                        <button
                            type="button"
                            className="confirm-action edit"
                            onClick={handleEditHealth}
                        >
                            ✎
                            <span>
                                Edit Information
                            </span>
                        </button>


                        <button
                            type="button"
                            className="confirm-action final"
                            onClick={handleConfirm}
                        >
                            🐾
                            <span>
                                Confirm & Continue
                            </span>
                            →
                        </button>

                    </div>



                    {/* ==================================================
                        PRIVACY
                    ================================================== */}

                    <p className="confirm-privacy">
                        🔒 Your data is safe with us and will only be used
                        to provide personalized care. 💗
                    </p>

                </section>

            </main>

        </div>

    );

}

export default Confirm;