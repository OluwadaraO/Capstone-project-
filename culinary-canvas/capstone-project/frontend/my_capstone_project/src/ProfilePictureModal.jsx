import React, { useState } from "react";
import "./ProfilePictureModal.css";
function ProfilePictureModal({ isOpen, onClose, onUpload }) {
  const [isLoading, setIsLoading] = useState(false);
  if (!isOpen) {
    return null;
  }
  const handleUpload = async (event) => {
    try {
      event.preventDefault();
      const file = event.target.elements.profilePicture.files[0];
      onUpload(file);
    } catch (error) {
      alert("Failed to upload profile picture");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Profile Picture</h2>
        <form onSubmit={handleUpload}>
          <input type="file" name="profilePicture" accept="image/*" required />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
export default ProfilePictureModal;
