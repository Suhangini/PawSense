import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/logo.png";
import "../styles/Dashboard.css";
import { getLatestHeatCycle } from "../services/heatCycleService";
import { calculateBCS } from "../services/bcsService";


const Dashboard = () => {
  const [pet, setPet] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
const [cameraOpen, setCameraOpen] = useState(false);
const [aiFeaturesOpen, setAiFeaturesOpen] = useState(false);
const videoRef = useRef(null);
const cameraStreamRef = useRef(null);
const [heatCycle, setHeatCycle] = useState(null);
const [notificationOpen, setNotificationOpen] = useState(false);
const [bcs, setBcs] = useState(null);
const [bcsLoading, setBcsLoading] = useState(true);
const [bcsError, setBcsError] = useState("");


const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
};

const handlePetImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
        const imageData = reader.result;

        // Update dashboard immediately
        setPet((prevPet) => ({
            ...prevPet,
            image: imageData,
        }));

        // Save image to MongoDB
        try {
            await api.put("/pets/image", {
                image: imageData,
            });

            console.log("Pet image saved to database");
        } catch (error) {
            console.error(
                "Failed to save pet image:",
                error.response?.data || error.message
            );

            alert("Image changed, but could not be saved to database.");
        }
    };

    reader.readAsDataURL(file);

    setCameraMenuOpen(false);

    event.target.value = "";
};
const openDeviceCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    cameraStreamRef.current = stream;
    setCameraOpen(true);
    setCameraMenuOpen(false);
  } catch (error) {
    console.error("Camera access failed:", error);
    alert("Unable to access your camera. Please allow camera permission.");
  }
};

  // ============================================================
  // FETCH PET FROM DATABASE
  // ============================================================

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get("/pets/me");

        console.log("Pet from database:", response.data);

        setPet(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch pet:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.detail ||
            "Unable to load pet information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, []);

  useEffect(() => {
    const loadBCS = async () => {
        if (!pet) return;

        // Check required data
        if (
            pet.weight === undefined ||
            pet.weight === null ||
            pet.height === undefined ||
            pet.height === null
        ) {
            setBcsError("Weight and height are required for BCS.");
            setBcsLoading(false);
            return;
        }

        try {
            setBcsLoading(true);
            setBcsError("");

            const result = await calculateBCS(pet);

            console.log("BCS result:", result);

            setBcs(result);
        } catch (error) {
            console.error(
                "Failed to calculate BCS:",
                error.response?.data || error.message
            );

            setBcsError("Unable to calculate BCS.");
        } finally {
            setBcsLoading(false);
        }
    };

    loadBCS();
}, [pet]);

  useEffect(() => {

  const loadHeatCycle = async () => {

    try {

      const response = await getLatestHeatCycle();

      setHeatCycle(response.data);

    } catch (error) {

      // 404 simply means the pet has not tracked
      // a heat cycle yet.
      if (error.response?.status !== 404) {
        console.error(
          "Failed to load heat cycle:",
          error
        );
      }

    }

  };

  loadHeatCycle();

}, []);
const getHeatReminder = () => {
  if (!heatCycle?.reminder_date || !heatCycle?.next_estimated_heat) {
    return null;
  }

  const today = new Date();
  const reminderDate = new Date(heatCycle.reminder_date);
  const nextHeatDate = new Date(heatCycle.next_estimated_heat);

  // Show reminder only when today's date
  // has reached the reminder date
  // and the heat cycle hasn't passed yet.
  if (today >= reminderDate && today <= nextHeatDate) {
    return {
      type: "upcoming",
      days: Math.ceil(
        (nextHeatDate.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    };
  }

  return null;
};

const heatReminder = getHeatReminder();

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good morning!";
    }

    if (hour >= 12 && hour < 17) {
        return "Good afternoon!";
    }

    if (hour >= 17 && hour < 21) {
        return "Good evening!";
    }

    return "Hello, night owl!";
};

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-paw">🐾</div>
        <p>Loading your PawSense dashboard...</p>
      </div>
    );
  }


  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="dashboard-loading">
        <div className="loading-paw">🐾</div>
        <p>{error}</p>
      </div>
    );
  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="dashboard">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-paw">
            <img
              src={logo}
              alt="PawSense"
              className="brand-logo-img"
            />
          </div>
          <span>PawSense</span>
        </div>


        <nav className="sidebar-nav">

          <button className="nav-item active">
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>
          <button
  type="button"
  className="nav-item"
  onClick={() => setAiFeaturesOpen(true)}
>
  <span className="nav-icon">✦</span>
  <span>AI Features</span>
</button>

          <button
  type="button"
  className="nav-item"
  onClick={() => navigate("/health-records")}
>
  <span className="nav-icon">▣</span>
  <span>Health Records</span>
</button>

          <button className="nav-item">
            <span className="nav-icon">📄</span>
            <span>Logs</span>
          </button>

        </nav>


        <div className="sidebar-bottom">

  <div className="sidebar-paw">🐾</div>

  <img
    src="/src/assets/images/paw-sense-pet-buddy.png"
    alt="Happy pets"
    className="sidebar-pets"
  />

  <p>
    Better care,
    <br />
    happier pets.
  </p>

  <button
    type="button"
    className="logout-btn"
    onClick={handleLogout}
  >
    <span className="logout-icon">↪</span>
    <span>Logout</span>
  </button>

</div>

      </aside>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="dashboard-content">


        {/* ====================================================
            TOP HEADER
        ==================================================== */}

        <header className="dashboard-header">

          <div>

            <h1>
    {getGreeting()} <span>👋</span>
</h1>

            <p>
              Here's how {pet.petName} is doing today. 🐾
            </p>

          </div>


          <div className="header-right">

  <div className="notification-wrapper">

    <button
      type="button"
      className="notification-btn"
      onClick={() =>
        setNotificationOpen((prev) => !prev)
      }
      aria-label="Notifications"
    >
      🔔

      {heatReminder && (
        <span className="notification-dot"></span>
      )}
    </button>


    {notificationOpen && (
      <div className="notification-dropdown">

        <div className="notification-header">
          <div>
            <strong>Notifications</strong>
            <span>
              {heatReminder ? "1 new reminder" : "All caught up"}
            </span>
          </div>
        </div>


        {heatReminder && heatCycle ? (
          <div className="notification-item">

            <div className="notification-item-icon">
              🩷
            </div>

            <div className="notification-item-content">

              <strong>
                Heat Cycle Reminder
              </strong>

              <p>
                {pet?.petName || "Your pet"}'s estimated
                heat cycle is approaching.
              </p>

              <span>
                Estimated date:{" "}
                {new Date(
                  heatCycle.next_estimated_heat
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>

            </div>

          </div>
        ) : (
          <div className="notification-empty">

            <span>✓</span>

            <p>
              No new notifications
            </p>

          </div>
        )}

      </div>
    )}

  </div>

</div>

        </header>


        {/* ====================================================
            PET PROFILE CARD
        ==================================================== */}

        <section className="pet-profile-card">


          {/* PET IMAGE */}

          <div className="pet-photo-wrapper">

            <img
              src={
                pet.image ||
                "/src/assets/images/card-bg.png"
              }
              alt={pet.petName}
              className="pet-photo"
            />

            <div className="camera-wrapper">

  <button
    type="button"
    className="camera-btn"
    onClick={() => setCameraMenuOpen((prev) => !prev)}
  >
    📷
  </button>

  {cameraMenuOpen && (
    <div className="camera-menu">

      <button
        type="button"
        onClick={openDeviceCamera}
      >
        <span>📷</span>
        <span>Open Camera</span>
      </button>

      <button
        type="button"
        onClick={() => {
          document.getElementById("gallery-input").click();
          setCameraMenuOpen(false);
        }}
      >
        <span>🖼️</span>
        <span>Choose from Gallery</span>
      </button>

    </div>
  )}

<input
  id="gallery-input"
  type="file"
  accept="image/*"
  hidden
  onChange={handlePetImageChange}
/>
</div>

          </div>


          {/* PET INFORMATION */}

          <div className="pet-info">

            <div className="pet-heading">

              <h2>
                {pet.petName} <span>🐾</span>
              </h2>

              <span className="breed-tag">
                {pet.breed || "Breed not added"}
              </span>

            </div>


            <div className="pet-stats">


              {/* AGE */}

              <div className="pet-stat">

                <span className="stat-icon">
                  ▣
                </span>

                <div>

                  <strong>
                    {pet.age} yrs
                  </strong>

                  <small>
                    Age
                  </small>

                </div>

              </div>


              {/* GENDER */}

              <div className="pet-stat">

                <span className="stat-icon blue">
                  {pet.gender === "Male" ? "♂" : "♀"}
                </span>

                <div>

                  <strong>
                    {pet.gender}
                  </strong>

                  <small>
                    Gender
                  </small>

                </div>

              </div>


              {/* WEIGHT */}

              <div className="pet-stat">

                <span className="stat-icon orange">
                  ⚖
                </span>

                <div>

                  <strong>
                    {pet.weight} kg
                  </strong>

                  <small>
                    Weight
                  </small>

                </div>

              </div>


              {/* SPECIES */}

              <div className="pet-stat">

                <span className="stat-icon green">
                  🐾
                </span>

                <div>

                  <strong>
                    {pet.species}
                  </strong>

                  <small>
                    Species
                  </small>

                </div>

              </div>

            </div>

          </div>

        </section>



        {/* ====================================================
            QUICK HEALTH INFO
        ==================================================== */}

        <section className="dashboard-section health-section">

          <div className="section-heading">

            <span className="heading-icon health-icon">
              ⌁
            </span>

            <h2>
              Quick Health Info
            </h2>

          </div>


          <div className="health-grid">


            {/* HEALTH */}

            <div className="quick-health-card health-good">

              <span className="status-dot" aria-hidden="true"></span>

              <div className="health-card-icon">
                ♡
              </div>

              <div className="health-card-content">

                <span>
                  Health
                </span>

                <strong>
                  Good
                </strong>

              </div>

              <p>
                Your pet is doing well!
              </p>

            </div>


            {/* WEIGHT */}

            <div className="quick-health-card health-weight">

              <span className="status-dot" aria-hidden="true"></span>

              <div className="health-card-icon">
                ⚖
              </div>

              <div className="health-card-content">

                <span>
                  Weight
                </span>

                <strong>
                  {pet.weight} kg
                </strong>

              </div>

              <p>
                Current weight
              </p>

            </div>


            {/* SPECIES */}

            <div className="quick-health-card health-records">

              <span className="status-dot" aria-hidden="true"></span>

              <div className="health-card-icon">
                🐾
              </div>

              <div className="health-card-content">

                <span>
                  Pet Type
                </span>

                <strong>
                  {pet.species}
                </strong>

              </div>

              <p>
                Registered pet
              </p>

            </div>

          </div>

        </section>

{/* ====================================================
    BODY CONDITION SCORE
==================================================== */}

<section className="dashboard-section bcs-section">

    <div className="section-heading">

        <span className="heading-icon bcs-heading-icon">
            ⚖
        </span>

        <div>
            <h2>Body Condition Score</h2>

            <p className="bcs-section-subtitle">
                A quick look at {pet.petName}'s current body condition.
            </p>
        </div>

    </div>


    {bcsLoading ? (

        <div className="bcs-loading-card">
            <div className="bcs-loading-circle">
                🐾
            </div>

            <p>Checking body condition...</p>
        </div>

    ) : bcsError ? (

        <div className="bcs-error-card">
            <span>⚠️</span>
            <p>{bcsError}</p>
        </div>

    ) : bcs ? (

        <div className="bcs-card">

            {/* LEFT SIDE */}

            <div className="bcs-main">

                <div className="bcs-score-top">

                    <span className="bcs-label">
                        ESTIMATED BCS
                    </span>

                    <div className="bcs-number">
                        {bcs.bcs_score}
                        <span>/9</span>
                    </div>

                    <strong
                        className={`bcs-status bcs-${bcs.bcs_score}`}
                    >
                        {bcs.status}
                    </strong>

                </div>


                {/* BCS SCALE */}

                <div className="bcs-scale">

                    <div className="bcs-scale-line">
                        <span
    className="bcs-progress"
    style={{
        width: `${((bcs.bcs_score - 1) / 8) * 100}%`
    }}
></span>
                        <span
                            className="bcs-marker"
                            style={{
                                left: `${((bcs.bcs_score - 1) / 8) * 100}%`
                            }}
                        ></span>
                    </div>


                    <div className="bcs-scale-numbers">

                        {[1,2,3,4,5,6,7,8,9].map((number) => (

                            <span
                                key={number}
                                className={
                                    number === bcs.bcs_score
                                        ? "active"
                                        : ""
                                }
                            >
                                {number}
                            </span>

                        ))}

                    </div>


                    <div className="bcs-scale-labels">
                        <span>Underweight</span>
                        <span>Ideal</span>
                        <span>Overweight</span>
                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="bcs-details">

                <div className="bcs-detail-header">

                    <div>

                        <span>Current Condition</span>

                        <h3>
                            {pet.petName}
                            <span> 🐾</span>
                        </h3>

                    </div>

                    <div className="bcs-mini-icon">
                        ⚖
                    </div>

                </div>


                {/* STATS */}

<div className="bcs-stats">

    {/* CURRENT WEIGHT */}
    <div className="bcs-stat">

        <span>Weight</span>

        <strong>
            {bcs.weight}
            <small> kg</small>
        </strong>

    </div>


    {/* IDEAL WEIGHT */}
    <div className="bcs-stat">

        <span>Ideal Weight</span>

        <strong>
            {bcs.ideal_weight ?? "--"}
            <small> kg</small>
        </strong>

    </div>


    {/* HEIGHT */}
    <div className="bcs-stat">

        <span>Height</span>

        <strong>
            {bcs.height}
            <small> cm</small>
        </strong>

    </div>

</div>


                {/* GUIDANCE */}

                <div className="bcs-guidance">

                    <div className="bcs-guidance-icon">
                        🥗
                    </div>

                    <div>

                        <strong>
                            PawSense Guidance
                        </strong>

                        <p>
                            {bcs.diet_message}
                        </p>

                    </div>

                </div>

            </div>


            {/* RECOMMENDATIONS */}

            <div className="bcs-recommendations">

                <div className="bcs-recommendation-title">
                    <span>💡</span>
                    <strong>What you can do</strong>
                </div>


                <div className="bcs-recommendation-list">

                    {bcs.recommendation.map((item, index) => (

                        <div
                            className="bcs-recommendation-item"
                            key={index}
                        >

                            <span>✓</span>

                            <p>{item}</p>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    ) : null}

</section>



        {/* ====================================================
            AI CARE
        ==================================================== */}

        <section className="dashboard-section ai-section">

          <div className="section-heading">

            <span className="heading-icon ai-heading-icon">
              ✧
            </span>

            <h2>
              AI Care
            </h2>

          </div>


          <div className="ai-grid">


            {/* EMERGENCY FIRST AID */}

           <button
  type="button"
  className="ai-card emergency-card"
  onClick={() => navigate("/emergency")}
>
  <div className="ai-icon">
    ✚
  </div>

              <h3>
                Emergency
                <br />
                First Aid
              </h3>

              <p>
                Get immediate guidance
                <br />
                when your pet needs help.
              </p>

              <span className="ai-arrow">
                →
              </span>

            </button>

          </div>

        </section>



        {/* ====================================================
            SUPPORTING ILLUSTRATION
            (flows normally at end of page — cannot overlap
            any section above it, at any viewport height)
        ==================================================== */}

        <div className="dashboard-illustration">
          <img
            src="/src/assets/images/paw-sense-pet-buddy.png"
            alt=""
            className="dashboard-pet-decoration"
          />
        </div>
    
    {/* ====================================================
    AI FEATURES MODAL
==================================================== */}

{aiFeaturesOpen && (
  <div
    className="ai-features-overlay"
    onClick={() => setAiFeaturesOpen(false)}
  >
    <div
      className="ai-features-modal"
      onClick={(event) => event.stopPropagation()}
    >

      {/* HEADER */}

      <div className="ai-features-header">

        <div>
          <span className="ai-features-label">
            PAWSENSE AI
          </span>

          <h2>
            AI Features
          </h2>

          <p>
            Intelligent tools for your pet's care.
          </p>
        </div>

        <button
          type="button"
          className="ai-features-close"
          onClick={() => setAiFeaturesOpen(false)}
          aria-label="Close AI Features"
        >
          ×
        </button>

      </div>


      {/* FEATURE GRID */}

      <div className="ai-features-grid">
        {/* FOOD & TOXICITY */}

        <button
          type="button"
          className="ai-feature-modal-card"
          onClick={() => {
    setAiFeaturesOpen(false);
    navigate("/food-detection");
  }}
        >
          <div className="ai-feature-icon">
            🍎
          </div>

          <div className="ai-feature-content">
            <span className="ai-feature-category">
              FOOD SAFETY
            </span>

            <h3>
              Food & Toxicity
            </h3>

            <p>
              Analyze food and detect potential toxicity for your pet.
            </p>
          </div>
        </button> 

{/* POSTURE GUIDANCE */}

<button
  type="button"
  className="ai-feature-modal-card"
  onClick={() => {
    setAiFeaturesOpen(false);
    navigate("/posture-guidance");
  }}
>
  <div className="ai-feature-icon">
    🐈
  </div>

  <div className="ai-feature-content">
    <span className="ai-feature-category">
      BEHAVIOR GUIDANCE
    </span>

    <h3>Posture Guidance</h3>

    <p>
      Get to know about your pet's posture.
    </p>
  </div>
</button>




        {/* EMOTION DETECTION */}

        <button
          type="button"
          className="ai-feature-modal-card"
          onClick={() => navigate("/emotion-detection")}
        >
          <div className="ai-feature-icon">
            💭
          </div>

          <div className="ai-feature-content">
            <span className="ai-feature-category">
              AUDIO AI
            </span>

            <h3>
              Emotion Detection
            </h3>

            <p>
              Understand your pet's emotional state through sound.
            </p>
          </div>
        </button>


        {/* HEAT CYCLE */}

        <button
          type="button"
          className="ai-feature-modal-card"
          onClick={() => {
  setAiFeaturesOpen(false);
  navigate("/heat-cycle");
}}
        >
          <div className="ai-feature-icon">
            🩷
          </div>

          <div className="ai-feature-content">
            <span className="ai-feature-category">
              HEALTH AI
            </span>

            <h3>
              Heat Cycle
            </h3>

            <p>
              Track and understand the heat cycle of female pets.
            </p>
          </div>
        </button>


        {/* EMERGENCY FIRST AID */}

        <button
  type="button"
  className="ai-feature-modal-card"
  onClick={() => {
    setAiFeaturesOpen(false);
    navigate("/emergency");
  }}
>
          <div className="ai-feature-icon">
            ❤️‍🩹
          </div>

          <div className="ai-feature-content">
            <span className="ai-feature-category">
              EMERGENCY CARE
            </span>

            <h3>
              Emergency First Aid
            </h3>

            <p>
              Get immediate AI-assisted guidance when your pet needs help.
            </p>
          </div>
        </button>

      </div>

    </div>
  </div>
)}
      

    {cameraOpen && (
  <div className="camera-modal">

    <div className="camera-modal-card">

      <h3>Take Pet Photo</h3>

      <video
        ref={(video) => {
          videoRef.current = video;

          if (video && cameraStreamRef.current) {
            video.srcObject = cameraStreamRef.current;
          }
        }}
        autoPlay
        playsInline
        className="camera-video"
      />

      <div className="camera-actions">

        <button
  type="button"
  onClick={async () => {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData = canvas.toDataURL("image/jpeg");

    setPet((prevPet) => ({
      ...prevPet,
      image: imageData,
    }));

    try {
      await api.put("/pets/image", {
        image: imageData,
      });

      console.log("Camera image saved to database");
    } catch (error) {
      console.error(
        "Failed to save camera image:",
        error.response?.data || error.message
      );

      alert("Photo changed, but could not be saved to database.");
    }

    cameraStreamRef.current?.getTracks().forEach(
      (track) => track.stop()
    );

    cameraStreamRef.current = null;
    setCameraOpen(false);
  }}
>
  📷 Take Photo
</button>

        <button
          type="button"
          onClick={() => {
            cameraStreamRef.current?.getTracks().forEach(
              (track) => track.stop()
            );

            cameraStreamRef.current = null;
            setCameraOpen(false);
          }}
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}

      </main>

    </div>
  );
};


export default Dashboard;