function BreedCard({ onDetect }) {
    return (
        <div className="breed-card">
            <h3>🐾 Don't know your pet's breed?</h3>

            <p>
                Let PawSense AI identify it for you.
            </p>

            <button
                type="button"
                className="detect-btn"
                onClick={onDetect}
            >
                Detect Breed with AI
            </button>
        </div>
    );
}

export default BreedCard;