import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import SuccessModal from "../components/SuccessModal";

import logo from "../assets/images/logo.png";
import "./../styles/Signup.css";

import { signup } from "../services/authService";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "email" ? value.trim() : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            alert("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await signup(formData);

            // Clear the form
            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: "",
            });

            // Show Success Modal
            setShowSuccessModal(true);
        } catch (error) {
            const details = error.response?.data?.detail;

            if (Array.isArray(details)) {
                const hasPasswordLengthError = details.some(
                    (err) =>
                        (err.loc.includes("password") || err.loc.includes("confirm_password")) &&
                        err.type === "string_too_short"
                );

                if (hasPasswordLengthError) {
                    alert("Password must be at least 8 characters long.");
                    return;
                }

                details.forEach((err) => {
                    alert(err.msg);
                });
            } else if (typeof details === "string") {
                alert(details);
            } else {
                alert("Signup failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="logo-container">
                    <img src={logo} alt="PawSense Logo" className="logo" />
                </div>

                <h2>Start Your PawSense Journey</h2>

                <p className="subtitle">Smart pet care begins with one little paw. 🐾✨</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="confirm_password"
                        placeholder="Confirm Password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "🐶 Create My PawAccount"}
                    </button>
                </form>

                <p className="bottom-text">
                    Already have an account? <Link to="/">Login</Link>
                </p>
            </div>

            <SuccessModal
    isOpen={showSuccessModal}
    title="Congratulations! 🐾"
    message="Your PawSense account has been created successfully."
    buttonText="Let's Add Your Pet"
    onButtonClick={() => {
        setShowSuccessModal(false);
        navigate("/pet-profile");
    }}
/>
        </div>
    );
}

export default Signup;