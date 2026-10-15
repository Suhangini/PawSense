
import { useNavigate } from "react-router-dom";
import "./BackToDashboard.css";

export default function BackToDashboard() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="feature-back-button"
      onClick={() => navigate("/dashboard")}
      aria-label="Back to dashboard"
      title="Back to dashboard"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 12H5M12 19L5 12L12 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
