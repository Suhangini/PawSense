import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import SuccessModal from "../components/SuccessModal";

import logo from "../assets/images/logo.png";
import "./../styles/Login.css";

import { login } from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
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

        setLoading(true);

        try {
            const response = await login(formData);

            console.log(response);

            // Show Success Modal
            setShowSuccessModal(true);
        } catch (error) {
            alert(error.response?.data?.detail || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-container">
                    <img src={logo} alt="PawSense Logo" className="logo" />
                </div>

                <h2>Welcome back!</h2>

                <p className="subtitle">Let's take care of your furry friend today. 🐾</p>

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging In..." : "🐾 Log In"}
                    </button>
                </form>

                <p className="bottom-text">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>

            <SuccessModal
                isOpen={showSuccessModal}
                title="Welcome Back! 🐾"
                message="You've successfully logged in to PawSense."
                buttonText="Continue"
                onButtonClick={() => {
                    setShowSuccessModal(false);
                    // Change this route if your dashboard route is different
                    navigate("/dashboard");
                }}
            />
        </div>
    );
}

export default Login;