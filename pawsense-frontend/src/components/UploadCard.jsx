function UploadCard({ preview, onImageUpload }) {
    return (
        <div className="upload-card">
            <label htmlFor="petImage">

                {preview ? (
                    <img
                        src={preview}
                        alt="Pet"
                        className="hero-preview"
                    />
                ) : (
                    <>
                        <div className="upload-icon">📷</div>
                        <div className="upload-title">
                            Upload Pet Photo
                        </div>
                        <div className="upload-subtitle">
                            Click to choose an image
                        </div>
                    </>
                )}

            </label>

            <input
                id="petImage"
                type="file"
                accept="image/*"
                hidden
                onChange={onImageUpload}
            />
        </div>
    );
}

export default UploadCard;