import React, { useEffect } from "react";
import { useNotifications } from "./useNotification";
function NotificationModal({ onClose, userId }) {
  const { isSubscribed, subscribeToNotifications } = useNotifications(userId);

  useEffect(() => {
    if (isSubscribed) {
      onClose();
    }
  }, [isSubscribed, onClose]);

  if (isSubscribed) {
    return null;
  }
  const handleSubscribe = async () => {
    try {
      await subscribeToNotifications();
      onClose();
    } catch (error) {
      console.error("Failed to subscribe user");
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h3>Stay Updated With Culinary Canvas</h3>
        <p>Enable notifications to get the lastest dietary tips!</p>
        <button onClick={handleSubscribe}>
          {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
        </button>
        <button onClick={onClose}>Maybe Later</button>
      </div>
    </div>
  );
}
export default NotificationModal;
