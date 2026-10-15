import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/images/logo.png";

import "../styles/HealthInfo.css";


function HealthInfo() {

    const navigate = useNavigate();
    const location = useLocation();


    // ============================================================
    // PET DATA FROM PET PROFILE
    // ============================================================

    const petData = location.state?.petData || {};


    // ============================================================
    // HEALTH DATA
    // ============================================================

    const [healthData, setHealthData] = useState({

        neuteredSpayed: "",
        vaccinationStatus: "",
        lastVetVisit: "",

        knownAllergies: "",
        allergyDetails: "",

        existingConditions: "",
        pastSurgeries: "",

        currentMedication: "",
        medicationDetails: "",

        dietType: "",
        activityLevel: "",
        waterIntake: "",

        recentChanges: "",

    });


    // ============================================================
    // HANDLE CHANGE
    // ============================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setHealthData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    // ============================================================
    // BACK TO PET PROFILE
    // ============================================================

    const handleBack = () => {

        navigate(
            "/pet-profile",
            {
                state: {
                    petData,
                },
            }
        );

    };


    // ============================================================
    // SAVE & CONTINUE
    // ============================================================

    const handleSubmit = (e) => {

        e.preventDefault();

        navigate(
            "/confirm",
            {
                state: {
                    petData,
                    healthData,
                },
            }
        );

    };


    return (

        <div className="healthinfo-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="health-header">

                <div className="health-brand">

                    <img
                        src={logo}
                        alt="PawSense"
                        className="health-logo"
                    />


                    <div className="health-brand-text">

                        <h1>
                            <span>Paw</span>Sense
                        </h1>

                        <p>
                            AI-Powered Pet Care, Every Step Of The Way
                            <span> ♥</span>
                        </p>

                    </div>

                </div>


                <div className="welcome-parent-card">

                    <div className="welcome-paw">
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
                TOP CONTENT
            ==================================================== */}

            <main className="health-main">


                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <button
                    type="button"
                    className="health-back-btn"
                    onClick={handleBack}
                >
                    <span>←</span>
                    Back to Pet Profile
                </button>



                {/* ==================================================
                    PROGRESS
                ================================================== */}

                <div className="health-progress">

                    <div className="progress-step completed">

                        <div className="progress-circle">
                            ✓
                        </div>

                        <span>
                            Pet Profile
                        </span>

                    </div>


                    <div className="progress-line active"></div>


                    <div className="progress-step active">

                        <div className="progress-circle">
                            2
                        </div>

                        <span>
                            Health Information
                        </span>

                    </div>


                    <div className="progress-line"></div>


                    <div className="progress-step">

                        <div className="progress-circle">
                            3
                        </div>

                        <span>
                            Confirm
                        </span>

                    </div>

                </div>



                {/* ==================================================
                    PAGE TITLE
                ================================================== */}

                <section className="health-title">

                    <h2>
                        Tell Us About Your Pet's{" "}
                        <span>Health</span>

                        <b>
                            ♥
                        </b>
                    </h2>

                    <p>
                        Help us understand your pet's health better so we
                        can provide personalized care and recommendations.
                    </p>

                </section>



                {/* ==================================================
                    MAIN FORM CARD
                ================================================== */}

                <form
                    className="health-card"
                    onSubmit={handleSubmit}
                >


                    {/* ==================================================
                        LEFT FORM
                    ================================================== */}

                    <div className="health-form">


                        {/* ==================================================
                            GENERAL HEALTH
                        ================================================== */}

                        <section className="health-section">

                            <div className="section-title">
                                <span>💗</span>
                                General Health Information
                            </div>


                            <div className="three-column-grid">

                                <div className="health-field">

                                    <label>
                                        Neutered / Spayed
                                    </label>

                                    <select
                                        name="neuteredSpayed"
                                        value={
                                            healthData.neuteredSpayed
                                        }
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select an option
                                        </option>

                                        <option value="Yes">
                                            Yes
                                        </option>

                                        <option value="No">
                                            No
                                        </option>

                                        <option value="Unknown">
                                            Unknown
                                        </option>

                                    </select>

                                </div>


                                <div className="health-field">

                                    <label>
                                        Vaccination Status
                                    </label>

                                    <select
                                        name="vaccinationStatus"
                                        value={
                                            healthData.vaccinationStatus
                                        }
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select an option
                                        </option>

                                        <option value="Up to date">
                                            Up to date
                                        </option>

                                        <option value="Partially vaccinated">
                                            Partially vaccinated
                                        </option>

                                        <option value="Not vaccinated">
                                            Not vaccinated
                                        </option>

                                    </select>

                                </div>


                                <div className="health-field">

                                    <label>
                                        Last Vet Visit
                                    </label>

                                    <div className="date-input">

                                        <span>
                                            📅
                                        </span>

                                        <input
                                            type="date"
                                            name="lastVetVisit"
                                            value={
                                                healthData.lastVetVisit
                                            }
                                            onChange={handleChange}
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="two-column-grid">

                                <div className="health-field">

                                    <label>
                                        Any Known Allergies?
                                    </label>

                                    <select
                                        name="knownAllergies"
                                        value={
                                            healthData.knownAllergies
                                        }
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select an option
                                        </option>

                                        <option value="Yes">
                                            Yes
                                        </option>

                                        <option value="No">
                                            No
                                        </option>

                                        <option value="Unknown">
                                            Unknown
                                        </option>

                                    </select>

                                </div>


                                <div className="health-field">

                                    <label>
                                        Allergies Details (if any)
                                    </label>

                                    <input
                                        type="text"
                                        name="allergyDetails"
                                        placeholder="E.g. Dust, Pollen, Certain Food"
                                        value={
                                            healthData.allergyDetails
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </section>



                        {/* ==================================================
                            MEDICAL HISTORY
                        ================================================== */}

                        <section className="health-section">

                            <div className="section-title">
                                <span>🛡️</span>
                                Medical History
                            </div>


                            <div className="two-column-grid">

                                <div className="health-field">

                                    <label>
                                        Existing Medical Conditions
                                    </label>

                                    <textarea
                                        name="existingConditions"
                                        placeholder="E.g. Diabetes, Skin Allergy, Heart Murmur"
                                        value={
                                            healthData.existingConditions
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="health-field">

                                    <label>
                                        Past Surgeries / Treatments
                                    </label>

                                    <textarea
                                        name="pastSurgeries"
                                        placeholder="E.g. Surgery type, date, reason"
                                        value={
                                            healthData.pastSurgeries
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>


                            <div className="two-column-grid">

                                <div className="health-field">

                                    <label>
                                        Is your pet currently on any medication?
                                    </label>

                                    <select
                                        name="currentMedication"
                                        value={
                                            healthData.currentMedication
                                        }
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select an option
                                        </option>

                                        <option value="Yes">
                                            Yes
                                        </option>

                                        <option value="No">
                                            No
                                        </option>

                                    </select>

                                </div>


                                <div className="health-field">

                                    <label>
                                        Medication Details (if any)
                                    </label>

                                    <input
                                        type="text"
                                        name="medicationDetails"
                                        placeholder="E.g. Medicine name, dosage, frequency"
                                        value={
                                            healthData.medicationDetails
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </section>



                        {/* ==================================================
                            LIFESTYLE
                        ================================================== */}

                        <section className="health-section">

                            <div className="section-title">
                                <span>🍎</span>
                                Lifestyle & Wellness
                            </div>


                            <div className="three-column-grid">

                                <div className="health-field">

                                    <label>
                                        Diet Type
                                    </label>

                                    <select
                                        name="dietType"
                                        value={
                                            healthData.dietType
                                        }
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select diet type
                                        </option>

                                        <option value="Dry Food">
                                            Dry Food
                                        </option>

                                        <option value="Wet Food">
                                            Wet Food
                                        </option>

                                        <option value="Mixed">
                                            Mixed
                                        </option>

                                        <option value="Home Cooked">
                                            Home Cooked
                                        </option>

                                    </select>

                                </div>


                                <div className="health-field">

                                    <label>
                                        Activity Level
                                    </label>

                                    <select
                                        name="activityLevel"
                                        value={
                                            healthData.activityLevel
                                        }
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select activity level
                                        </option>

                                        <option value="Low">
                                            Low
                                        </option>

                                        <option value="Moderate">
                                            Moderate
                                        </option>

                                        <option value="High">
                                            High
                                        </option>

                                    </select>

                                </div>


                                <div className="health-field">

                                    <label>
                                        Water Intake
                                    </label>

                                    <select
                                        name="waterIntake"
                                        value={
                                            healthData.waterIntake
                                        }
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            Select water intake
                                        </option>

                                        <option value="Low">
                                            Low
                                        </option>

                                        <option value="Normal">
                                            Normal
                                        </option>

                                        <option value="High">
                                            High
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <div className="health-field">

                                <label>
                                    Any Recent Changes in Behavior or Appetite?
                                </label>

                                <textarea
                                    name="recentChanges"
                                    placeholder="E.g. Loss of appetite, Lethargy, Aggression"
                                    value={
                                        healthData.recentChanges
                                    }
                                    onChange={handleChange}
                                />

                            </div>

                        </section>



                        {/* ==================================================
                            SECURITY
                        ================================================== */}

                        <div className="security-strip">

                            <div className="security-icon">
                                🛡️
                            </div>

                            <div>

                                <strong>
                                    Your pet's data is safe with us!
                                </strong>

                                <p>
                                    We never share your information with anyone.
                                    It's 100% secure and confidential.
                                </p>

                            </div>

                            <div className="lock-icon">
                                🔒
                            </div>

                        </div>



                        {/* ==================================================
                            FORM BUTTONS
                        ================================================== */}

                        <div className="health-actions">

                            <button
                                type="button"
                                className="health-cancel-btn"
                                onClick={handleBack}
                            >
                                ←
                                <span>
                                    Back
                                </span>
                            </button>


                            <button
                                type="submit"
                                className="health-save-btn"
                            >
                                🐾
                                Save & Continue
                                <span>
                                    →
                                </span>
                            </button>

                        </div>

                    </div>



                    {/* ==================================================
                        RIGHT INFORMATION PANEL
                    ================================================== */}

                    <aside className="health-info-panel">

                        <h3>
                            <span>🛡️</span>
                            Why is this important?
                        </h3>

                        <p className="info-intro">
                            This information helps PawSense AI analyze
                            your pet's health better and provide accurate
                            insights, reminders, and care recommendations.
                        </p>


                        <div className="info-item">

                            <div className="info-icon">
                                📊
                            </div>

                            <div>

                                <strong>
                                    Personalized Health Insights
                                </strong>

                                <p>
                                    Get AI-powered suggestions
                                    tailored to your pet.
                                </p>

                            </div>

                        </div>


                        <div className="info-item">

                            <div className="info-icon">
                                🔔
                            </div>

                            <div>

                                <strong>
                                    Timely Reminders
                                </strong>

                                <p>
                                    Never miss vaccinations or
                                    medications.
                                </p>

                            </div>

                        </div>


                        <div className="info-item">

                            <div className="info-icon">
                                ✚
                            </div>

                            <div>

                                <strong>
                                    Better Emergency Support
                                </strong>

                                <p>
                                    Helps us assist you quickly in
                                    critical situations.
                                </p>

                            </div>

                        </div>


                        <div className="info-item">

                            <div className="info-icon">
                                ↗
                            </div>

                            <div>

                                <strong>
                                    Track Health Over Time
                                </strong>

                                <p>
                                    Monitor progress and stay ahead
                                    of potential issues.
                                </p>

                            </div>

                        </div>


                        {/* Illustration placeholder */}

                        <div className="health-illustration">

                            <div className="illustration-pet">
                                🐶
                            </div>

                            <div className="illustration-cat">
                                🐱
                            </div>

                            <span className="heart-one">
                                ♥
                            </span>

                            <span className="heart-two">
                                ♥
                            </span>

                        </div>

                    </aside>

                </form>

            </main>

        </div>

    );

}

export default HealthInfo;