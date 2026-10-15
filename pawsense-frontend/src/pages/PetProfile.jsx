import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/images/logo.png";
import BreedCard from "../components/BreedCard";
import api from "../services/api";

import "../styles/PetProfile.css";

const initialPetData = {
    petName: "",
    age: "",
    gender: "",
    species: "Dog",
    weight: "",
    height: "",
    breed: "",
    image: null,
};

const BREED_OPTIONS = {
    Dog: [
        { label: "Indian Domestic Dog (Indie)", value: "indian-domestic-dog" },
        { label: "Beagle", value: "beagle" },
        { label: "Bulldog", value: "bulldog" },
        { label: "Dalmatian", value: "dalmatian" },
        { label: "German Shepherd", value: "german-shepherd" },
        { label: "Golden Retriever", value: "golden-retriever" },
        { label: "Husky", value: "husky" },
        { label: "Labrador Retriever", value: "labrador-retriever" },
        { label: "Poodle", value: "poodle" },
        { label: "Rottweiler", value: "rottweiler" },
        { label: "Other / Unknown", value: "other" },
    ],
    Cat: [
        { label: "Indian Domestic Cat", value: "indian-domestic-cat" },
        { label: "Abyssinian Cat", value: "Abyssinian cat" },
        { label: "Bengal Cat", value: "bengal cat" },
        { label: "Bombay Cat", value: "bombay cat" },
        { label: "British Shorthair", value: "British Shorthair cat" },
        { label: "Egyptian Mau", value: "egyptian mau cat" },
        { label: "Maine Coon", value: "maine coon cat" },
        { label: "Manx Cat", value: "manx cat" },
        { label: "Norwegian Forest Cat", value: "Norwegian Forest Cat" },
        { label: "Oriental Shorthair", value: "Oriental Shorthair Cat" },
        { label: "Persian Cat", value: "persian cat" },
        { label: "Ragdoll", value: "Ragdoll cat" },
        { label: "Russian Blue", value: "Russian Blue Cat" },
        { label: "Siamese Cat", value: "Siamese cat" },
        { label: "Sphynx Cat", value: "Sphynx cat" },
        { label: "Turkish Van", value: "turkish van cat" },
        { label: "Other / Unknown", value: "other" },
    ],
};

function PetProfile() {
    const navigate = useNavigate();
    const location = useLocation();

    // ============================================================
    // PET DATA
    // ============================================================

    const [petData, setPetData] = useState(() => {
        if (location.state?.petData) {
            return {
                ...initialPetData,
                ...location.state.petData,
            };
        }

        return initialPetData;
    });

    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    const previewRef = useRef(null);

    // ============================================================
    // RESTORE PET DATA
    // ============================================================

    useEffect(() => {
        const incomingPetData = location.state?.petData;

        if (!incomingPetData) {
            return;
        }

        setPetData({
            ...initialPetData,
            ...incomingPetData,
        });

        if (incomingPetData.image instanceof Blob) {
            try {
                if (previewRef.current) {
                    URL.revokeObjectURL(previewRef.current);
                }

                const imageUrl = URL.createObjectURL(
                    incomingPetData.image
                );

                previewRef.current = imageUrl;
                setPreview(imageUrl);
            } catch (error) {
                console.error(
                    "Unable to restore pet image preview:",
                    error
                );

                setPreview(null);
            }
        }
    }, [location.state]);

    // ============================================================
    // CLEANUP
    // ============================================================

    useEffect(() => {
        return () => {
            if (previewRef.current) {
                URL.revokeObjectURL(previewRef.current);
            }
        };
    }, []);

    // ============================================================
    // HANDLE FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setPetData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "species" ? { breed: "" } : {}),
        }));

        if (errors[name] || (name === "species" && errors.breed)) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
                ...(name === "species" ? { breed: undefined } : {}),
            }));
        }
    };

    // ============================================================
    // IMAGE UPLOAD
    // ============================================================

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        if (previewRef.current) {
            URL.revokeObjectURL(previewRef.current);
        }

        const url = URL.createObjectURL(file);

        previewRef.current = url;

        setPetData((prev) => ({
            ...prev,
            image: file,
        }));

        setPreview(url);
    };

    // ============================================================
    // VALIDATION
    // ============================================================

    const validate = () => {
        const newErrors = {};

        if (!petData.petName.trim()) {
            newErrors.petName = "Pet name is required";
        }

        if (!petData.age || Number(petData.age) <= 0) {
            newErrors.age = "Enter a valid age";
        }

        if (!petData.gender) {
            newErrors.gender = "Please select a gender";
        }

        if (!petData.weight || Number(petData.weight) <= 0) {
            newErrors.weight = "Enter a valid weight";
        }

        if (!petData.height || Number(petData.height) <= 0) {
            newErrors.height = "Enter a valid height";
        }

        if (!petData.breed) {
            newErrors.breed = "Please select a breed";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            let imageData = petData.image;

            // Convert uploaded image to a data URL
            // so the existing JSON-based backend can store it.
            if (petData.image instanceof File) {
                imageData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;

                    reader.readAsDataURL(petData.image);
                });
            }

            const response = await api.post("/pets/", {
                petName: petData.petName,
                age: Number(petData.age),
                gender: petData.gender,
                species: petData.species,
                weight: Number(petData.weight),
                height: Number(petData.height),
                breed: petData.breed,
                image: imageData || null,
            });

            console.log("Pet saved successfully:", response.data);

            navigate("/health-info", {
                state: {
                    petData: {
                        ...petData,
                        image: imageData,
                        petId: response.data.pet.id,
                    },
                },
            });
        } catch (error) {
            console.error(
                "Failed to save pet:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.detail ||
                "Unable to save pet profile. Please try again."
            );
        }
    };

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="petprofile-container">
            {/* HEADER */}
            <header className="pet-header">
                <div className="header-logo">
                    <img
                        src={logo}
                        alt="PawSense"
                        className="logo"
                    />

                    <div className="header-brand-text">
                        <h1>
                            <span>Paw</span>Sense
                        </h1>

                        <p>
                            AI-Powered Pet Care, Every Step Of The Way
                        </p>
                    </div>
                </div>
            </header>

            {/* PAGE NAVIGATION */}
            <div className="profile-navigation">
                <div className="profile-nav-item active">
                    <span>🐾</span>
                    Pet Profile
                </div>
            </div>

            {/* MAIN CARD */}
            <main className="petprofile-card">
                {/* HERO */}
                <section className="hero-section">
                    <div className="hero-content">
                        <span className="hero-tag">
                            🐾 Welcome!
                        </span>

                        <h2>
                            Tell Us About Your Pet
                            <span className="heading-paw">🐾</span>
                        </h2>

                        <p>
                            Help PawSense get to know your furry companion.
                            This information helps us provide personalized
                            health insights and recommendations.
                        </p>
                    </div>

                    {/* IMAGE */}
                    <div className="pet-image-upload">
                        <input
                            type="file"
                            id="petImage"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageUpload}
                            hidden
                        />

                        <label
                            htmlFor="petImage"
                            className={`pet-image-box ${
                                preview ? "has-image" : ""
                            }`}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Pet preview"
                                    className="pet-preview"
                                />
                            ) : (
                                <>
                                    <div className="camera-circle">📷</div>

                                    <span className="upload-text">
                                        Upload Pet Photo
                                    </span>

                                    <span className="upload-subtext">
                                        JPG or PNG (Max 5MB)
                                    </span>
                                </>
                            )}
                        </label>

                        {preview && (
                            <label
                                htmlFor="petImage"
                                className="change-photo"
                            >
                                Change Photo
                            </label>
                        )}
                    </div>
                </section>

                {/* FORM */}
                <form
                    className="pet-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="form-grid">
                        {/* PET NAME */}
                        <div className="input-group">
                            <label htmlFor="petName">
                                <span>🐾</span>
                                Pet Name
                            </label>

                            <input
                                id="petName"
                                type="text"
                                name="petName"
                                placeholder="Enter your pet's name"
                                value={petData.petName}
                                onChange={handleChange}
                            />

                            {errors.petName && (
                                <span className="field-error">
                                    {errors.petName}
                                </span>
                            )}
                        </div>

                        {/* SPECIES */}
                        <div className="input-group">
                            <label htmlFor="species">
                                <span>🐶</span>
                                Species
                            </label>

                            <select
                                id="species"
                                name="species"
                                value={petData.species}
                                onChange={handleChange}
                            >
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                            </select>
                        </div>

                        {/* AGE */}
                        <div className="input-group">
                            <label htmlFor="age">
                                <span>▣</span>
                                Age
                            </label>

                            <input
                                id="age"
                                type="number"
                                name="age"
                                placeholder="Years"
                                value={petData.age}
                                min="0"
                                onChange={handleChange}
                            />

                            {errors.age && (
                                <span className="field-error">
                                    {errors.age}
                                </span>
                            )}
                        </div>

                        {/* WEIGHT */}
                        <div className="input-group">
                            <label htmlFor="weight">
                                <span>🐾</span>
                                Weight (kg)
                            </label>

                            <input
                                id="weight"
                                type="number"
                                name="weight"
                                placeholder="Weight in kilograms"
                                value={petData.weight}
                                step="0.1"
                                min="0"
                                onChange={handleChange}
                            />

                            {errors.weight && (
                                <span className="field-error">
                                    {errors.weight}
                                </span>
                            )}
                        </div>

                        {/* HEIGHT */}
                        <div className="input-group">
                            <label htmlFor="height">
                                <span>📏</span>
                                Height (cm)
                            </label>

                            <input
                                id="height"
                                type="number"
                                name="height"
                                placeholder="Height in centimeters"
                                value={petData.height}
                                step="0.1"
                                min="0"
                                onChange={handleChange}
                            />

                            {errors.height && (
                                <span className="field-error">
                                    {errors.height}
                                </span>
                            )}
                        </div>

                        {/* GENDER */}
                        <div className="input-group">
                            <label>
                                <span>♀</span>
                                Gender
                            </label>

                            <div className="gender-selector">
                                <label
                                    className={`gender-card ${
                                        petData.gender === "Male"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={petData.gender === "Male"}
                                        onChange={handleChange}
                                    />

                                    <span className="gender-icon">♂</span>
                                    <span>Male</span>
                                </label>

                                <label
                                    className={`gender-card ${
                                        petData.gender === "Female"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={petData.gender === "Female"}
                                        onChange={handleChange}
                                    />

                                    <span className="gender-icon">♀</span>
                                    <span>Female</span>
                                </label>
                            </div>

                            {errors.gender && (
                                <span className="field-error">
                                    {errors.gender}
                                </span>
                            )}
                        </div>

                        {/* BREED DROPDOWN */}
                        <div className="input-group full-width">
                            <label htmlFor="breed">
                                <span>🐾</span>
                                Breed
                            </label>

                            <select
                                id="breed"
                                name="breed"
                                value={petData.breed}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select {petData.species.toLowerCase()} breed
                                </option>

                                {BREED_OPTIONS[petData.species].map((breed) => (
                                    <option
                                        key={breed.value}
                                        value={breed.value}
                                    >
                                        {breed.label}
                                    </option>
                                ))}
                            </select>

                            {errors.breed && (
                                <span className="field-error">
                                    {errors.breed}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* AI BREED DETECTION */}
                    <BreedCard
                        onDetect={() =>
                            navigate("/breed-detection", {
                                state: {
                                    petData,
                                },
                            })
                        }
                    />

                    {/* SAVE & CONTINUE */}
                    <div className="button-group">
                        <button
                            type="submit"
                            className="continue-btn"
                        >
                            <span>🐾</span>
                            Save & Continue
                            <span className="continue-arrow">→</span>
                        </button>

                        <p className="continue-note">
                            We'll use this information to personalize
                            your pet's care journey. 💗
                        </p>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default PetProfile;