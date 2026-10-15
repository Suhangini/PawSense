import "./SuccessModal.css";

function SuccessModal({
    isOpen,
    title,
    message,
    buttonText,
    onButtonClick,
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="success-modal">

                <div className="paw-icon">
                    🐾
                </div>

                <h2>{title}</h2>

                <p>{message}</p>

                <button
                    className="success-btn"
                    onClick={onButtonClick}
                >
                    {buttonText} →
                </button>

            </div>
        </div>
    );
}

export default SuccessModal;