
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { trackHeatCycle } from "../services/heatCycleService";
import "../styles/HeatCycle.css";
import BackToDashboard from "../components/BackToDashboard";

const HeatCycle = () => {
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [lastHeatDate, setLastHeatDate] = useState("");
  const [result, setResult] = useState(null);
  const [loadingPet, setLoadingPet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get("/pets/me");
        setPet(response.data);
      } catch (err) {
        console.error(
          "Failed to fetch pet:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.detail ||
          "Unable to load your pet information."
        );
      } finally {
        setLoadingPet(false);
      }
    };

    fetchPet();
  }, []);

  const handleTrackCycle = async () => {
    if (!lastHeatDate) {
      setError("Please select the last heat date.");
      return;
    }

    // Prevent future dates from being entered.
    const selectedDate = new Date(`${lastHeatDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setError("Please select a date that is today or earlier.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await trackHeatCycle(lastHeatDate);
      setResult(response.data);
    } catch (err) {
      console.error(
        "Heat cycle tracking failed:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
        "Unable to calculate the heat cycle. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const daysUntil = (date) => {
    if (!date) return null;

    const target = new Date(date);
    const today = new Date();

    if (Number.isNaN(target.getTime())) return null;

    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  };

  const getDaysMessage = (date) => {
    const days = daysUntil(date);

    if (days === null) return "Date unavailable";
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return "Estimated for today";
    if (days === 1) return "1 day remaining";

    return `${days} days remaining`;
  };

  if (loadingPet) {
    return (
      <div className="heat-cycle-page">
        <div className="heat-cycle-loading">
          <div className="loading-paw">🐾</div>
          <h2>Preparing your pet's tracker</h2>
          <p>Loading your pet's information...</p>
        </div>
      </div>
    );
  }

  const nextHeatDate = result?.next_estimated_heat;

  return (
    <main className="heat-cycle-page">
      <div className="heat-cycle-container">

        <BackToDashboard />

        {/* Page introduction */}
        <header className="heat-cycle-hero">
          <div className="heat-cycle-hero-copy">
            <span className="heat-cycle-label">
              PAWSENSE HEALTH
            </span>

            <h1>Heat Cycle Tracker</h1>

            <p>
              A little more care, a little more preparation.
              Keep track of your female pet's estimated upcoming
              heat cycle in one place.
            </p>

            <div className="heat-hero-badges">
              <span>♡ Cycle tracking</span>
              <span>✦ Date estimates</span>
            </div>
          </div>

          <aside className="heat-cycle-insight">
            <div className="heat-insight-icon">💗</div>
            <div>
              <strong>Care starts with awareness</strong>
              <p>
                Tracking previous cycle dates can help you
                prepare for your pet's changing needs.
              </p>
            </div>
            <span className="heat-decorative-heart" aria-hidden="true">
              ♡
            </span>
          </aside>
        </header>

        {/* Main tracker */}
        <section className="heat-cycle-card">

          <div className="heat-card-heading">
            <div>
              <span className="heat-section-eyebrow">
                YOUR PET'S WELLNESS
              </span>
              <h2>Let's track the cycle</h2>
              <p>
                Enter the start date of the previous heat cycle
                to calculate an estimate.
              </p>
            </div>

            <div className="heat-heading-icon" aria-hidden="true">
              ♡
            </div>
          </div>

          {/* Pet information */}
          {pet && (
            <div className="heat-pet-banner">
              <div className="heat-pet-avatar" aria-hidden="true">
                🐾
              </div>

              <div className="heat-pet-info">
                <span>TRACKING FOR</span>
                <strong>{pet.petName || "Your Pet"}</strong>
                <small>
                  {pet.species || "Pet"}{" "}
                  {pet.gender ? `· ${pet.gender}` : ""}
                </small>
              </div>

              <span className="heat-pet-status">
                <span className="heat-status-dot" />
                Profile loaded
              </span>
            </div>
          )}

          {/* Date selection */}
          <div className="heat-cycle-form">
            <label htmlFor="lastHeatDate">
              When did {pet?.petName || "your pet"}'s last heat
              cycle start?
            </label>

            <p className="heat-field-hint">
              Select the first day of the previous heat cycle.
            </p>

            <div className="heat-date-wrap">
              <span className="heat-date-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                >
                  <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="15.5"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M7.5 3v4M16.5 3v4M4 9.5h16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <input
                id="lastHeatDate"
                type="date"
                value={lastHeatDate}
                max={new Date().toLocaleDateString("en-CA")}
                onChange={(event) => {
                  setLastHeatDate(event.target.value);
                  setError("");
                  setResult(null);
                }}
              />
            </div>

            {error && (
              <div className="heat-cycle-error" role="alert">
                <span aria-hidden="true">!</span>
                {error}
              </div>
            )}

            <button
              type="button"
              className="heat-cycle-form-button"
              onClick={handleTrackCycle}
              disabled={loading || !pet}
            >
              {loading ? (
                <>
                  <span className="heat-button-spinner" />
                  Calculating estimate...
                </>
              ) : (
                <>
                  Calculate Heat Cycle
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            <p className="heat-form-footnote">
              ♡ Estimates are for planning purposes and are
              not a substitute for veterinary advice.
            </p>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section className="heat-cycle-result">

            <div className="heat-result-heading">
              <div>
                <span className="heat-section-eyebrow">
                  YOUR TRACKING RESULTS
                </span>
                <h2>{pet?.petName || "Your Pet"}'s cycle overview</h2>
                <p>
                  Your estimated dates are ready to review.
                </p>
              </div>

              <span className="heat-result-tag">
                ✦ Estimate
              </span>
            </div>

            {/* Main estimated date */}
            <div className="next-heat-card">
              <div className="next-heat-decoration" aria-hidden="true">
                ♡
              </div>

              <div className="next-heat-content">
                <span>NEXT ESTIMATED HEAT</span>
                <strong>{formatDate(nextHeatDate)}</strong>
                <p>{getDaysMessage(nextHeatDate)}</p>
              </div>

              <div className="next-heat-calendar">
                <span>♡</span>
                <small>UPCOMING</small>
              </div>
            </div>

            {/* Summary cards */}
            <div className="result-grid">

              <article className="result-item">
                <div className="result-item-top">
                  <span className="result-item-icon">📅</span>
                  <span className="result-item-label">
                    LAST HEAT STARTED
                  </span>
                </div>
                <strong>{formatDate(result.last_heat_date)}</strong>
                <small>Previously recorded date</small>
              </article>

              <article className="result-item">
                <div className="result-item-top">
                  <span className="result-item-icon">🔔</span>
                  <span className="result-item-label">
                    REMINDER DATE
                  </span>
                </div>
                <strong>{formatDate(result.reminder_date)}</strong>
                <small>Suggested preparation date</small>
              </article>

              <article className="result-item result-item-wide">
                <div className="result-item-top">
                  <span className="result-item-icon">🌸</span>
                  <span className="result-item-label">
                    ESTIMATED HEAT WINDOW
                  </span>
                </div>
                <strong>
                  {formatDate(result.heat_window_start)}
                  {" — "}
                  {formatDate(result.heat_window_end)}
                </strong>
                <small>
                  Approximate window around the estimated cycle
                </small>
              </article>
            </div>

            {/* Visual timeline */}
            <div className="heat-timeline">
              <div className="heat-timeline-heading">
                <div>
                  <span className="heat-section-eyebrow">
                    YOUR CYCLE TIMELINE
                  </span>
                  <h3>Important dates</h3>
                </div>
                <span className="heat-timeline-flower">✿</span>
              </div>

              <div className="heat-timeline-track">
                <div className="heat-timeline-item">
                  <span className="heat-timeline-dot completed" />
                  <div>
                    <small>PREVIOUS CYCLE</small>
                    <strong>
                      {formatDate(result.last_heat_date)}
                    </strong>
                  </div>
                </div>

                <div className="heat-timeline-item">
                  <span className="heat-timeline-dot reminder" />
                  <div>
                    <small>PREPARE AHEAD</small>
                    <strong>
                      {formatDate(result.reminder_date)}
                    </strong>
                  </div>
                </div>

                <div className="heat-timeline-item">
                  <span className="heat-timeline-dot upcoming" />
                  <div>
                    <small>ESTIMATED NEXT CYCLE</small>
                    <strong>{formatDate(nextHeatDate)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="heat-cycle-note">
              <span className="note-icon" aria-hidden="true">ⓘ</span>
              <div>
                <strong>A gentle reminder</strong>
                <p>
                  Cycle dates can vary between individual pets.
                  These estimates are based on your recorded date
                  and the application's calculation rules. They
                  cannot confirm fertility or predict the exact
                  start of a heat cycle. Contact a veterinarian
                  if you notice unusual symptoms or changes.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="heat-cycle-continue"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
              <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        <footer className="heat-cycle-footer">
          <span>🐾</span>
          Made with care for your furry family.
        </footer>

      </div>
    </main>
  );
};

export default HeatCycle;
