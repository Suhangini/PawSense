import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/HealthRecords.css";

const HealthRecords = () => {
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    vaccination_status: "Not Vaccinated",
    vaccination_date: "",
    vaccination_notes: ""
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get("/pets/me");

        setPet(response.data);

        setFormData({
          age: response.data.age ?? "",
          height: response.data.height ?? "",
          weight: response.data.weight ?? "",
          vaccination_status:
            response.data.vaccination_status || "Not Vaccinated",
          vaccination_date:
            response.data.vaccination_date || "",
          vaccination_notes:
            response.data.vaccination_notes || ""
        });
      } catch (error) {
        console.error(
          "Failed to load pet:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
        setSaving(true);
        setMessage("");

    const updatedData = {
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
      vaccination_status: formData.vaccination_status,
      vaccination_date: formData.vaccination_date || null,
      vaccination_notes: formData.vaccination_notes
    };

    await api.put("/pets/me", updatedData);

    // Update local pet data
    setPet((prev) => ({
      ...prev,
      ...updatedData
    }));

    setMessage("Health information updated successfully! 🐾");

  } catch (error) {
    console.error(
      "Failed to update health information:",
      error.response?.data || error.message
    );

    setMessage("Unable to save changes. Please try again.");
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="health-records-loading">
        🐾
        <p>Loading health records...</p>
      </div>
    );
  }

  return (
    <div className="health-records-page">

      {/* HEADER */}
      <div className="health-records-header">

        <div>
          <span className="health-records-label">
            PET HEALTH
          </span>

          <h1>Health Records</h1>

          <p>
            Keep {pet?.petName || "your pet"}'s health information
            up to date.
          </p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* FORM */}
      <form
        className="health-records-card"
        onSubmit={handleSave}
      >

        {/* PET INFO */}
        <div className="health-section-title">
          <span>🐾</span>

          <div>
            <h2>Basic Information</h2>
            <p>Update your pet's current measurements.</p>
          </div>
        </div>


        <div className="health-form-grid">

          <div className="health-field">
            <label>Pet Name</label>

            <input
              type="text"
              value={pet?.petName || ""}
              disabled
            />
          </div>


          <div className="health-field">
            <label>Breed</label>

            <input
              type="text"
              value={pet?.breed || "Not added"}
              disabled
            />
          </div>


          <div className="health-field">
            <label>Age</label>

            <div className="input-with-unit">
              <input
                type="number"
                name="age"
                min="0"
                step="0.1"
                value={formData.age}
                onChange={handleChange}
                required
              />
              <span>years</span>
            </div>
          </div>


          <div className="health-field">
            <label>Height</label>

            <div className="input-with-unit">
              <input
                type="number"
                name="height"
                min="1"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                required
              />
              <span>cm</span>
            </div>
          </div>


          <div className="health-field">
            <label>Weight</label>

            <div className="input-with-unit">
              <input
                type="number"
                name="weight"
                min="0.1"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                required
              />
              <span>kg</span>
            </div>
          </div>

        </div>


        {/* VACCINATION */}
        <div className="health-section-title vaccination-title">
          <span>💉</span>

          <div>
            <h2>Vaccination</h2>
            <p>Keep track of your pet's vaccination status.</p>
          </div>
        </div>


        <div className="health-form-grid">

          <div className="health-field">
            <label>Vaccination Status</label>

            <select
              name="vaccination_status"
              value={formData.vaccination_status}
              onChange={handleChange}
            >
              <option value="Vaccinated">
                Vaccinated
              </option>

              <option value="Partially Vaccinated">
                Partially Vaccinated
              </option>

              <option value="Not Vaccinated">
                Not Vaccinated
              </option>
            </select>
          </div>


          <div className="health-field">
            <label>Last Vaccination Date</label>

            <input
              type="date"
              name="vaccination_date"
              value={formData.vaccination_date}
              onChange={handleChange}
            />
          </div>

        </div>


        <div className="health-field full-width">
          <label>Vaccination Notes</label>

          <textarea
            name="vaccination_notes"
            value={formData.vaccination_notes}
            onChange={handleChange}
            placeholder="Add vaccine names, booster information, etc."
            rows="4"
          />
        </div>


        {/* MESSAGE */}
        {message && (
          <div className="health-save-message">
            {message}
          </div>
        )}


        {/* ACTIONS */}
        <div className="health-actions">

          <button
            type="button"
            className="cancel-health-button"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-health-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default HealthRecords;