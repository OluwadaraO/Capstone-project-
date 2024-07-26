import React from "react";
import "./RateLimitModal.css";

function RateLimitModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rate Limit Exceeded</h2>
        <p>
          You have reached the maximum number of API calls per minute. Please
          wait for 2 minutes and reload the page.
        </p>
        <button className="close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
export default RateLimitModal;
