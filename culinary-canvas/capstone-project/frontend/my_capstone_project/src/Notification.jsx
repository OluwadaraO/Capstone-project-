import React, { useEffect, useState } from "react";
import { useAuth } from "./RedirectToAuthentication";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;
import { getSocket } from "./socket";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (isAuthenticated && user) {
      if (!user) {
        navigate("/");
      }
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `${backendAddress}/notifications/${user.id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications: ", error);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
      socket.on("connect", () => {
        socket.emit("suscribe", user.id);
      });
      socket.on("notifications", (data) => {
        setNotifications(data);
      });
      socket.on("notifications", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
      socket.on("disconnect", () => {
        console.log("Disconnected from web socket server");
      });
      socket.on("connect_error", (error) => {
        console.error("Connection error: ", error);
      });
      socket.on("reconnect_attempt", () => {
        console.log("Attempting to reconnect...");
      });
      return () => {
        socket.off("connect");
        socket.off("notifications");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("reconnect_attempt");
      };
    }
  }, [user, isAuthenticated]);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${backendAddress}/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
        credentials: "include",
      });
      const index = notifications.findIndex((n) => n.id === notificationId);
      if (index !== -1) {
        const updatedNotifications = [...notifications];
        updatedNotifications[index] = {
          ...updatedNotifications[index],
          read: true,
        };
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `${backendAddress}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        alert("Notification deleted successfully");
        setNotifications(
          notifications.filter(
            (notification) => notification.id !== notificationId
          )
        );
      } else {
        console.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };
  return (
    <div>
      <h1>Welcome </h1>
      <h2>Notifications For You</h2>
      <Link to="/">
        <button>Back to Home Page</button>
      </Link>
      <Link to="/login/:id">
        <button>Back to User's Page</button>
      </Link>

      {notifications.length > 0 && user ? (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              style={{
                backgroundColor: notification.read ? "lightgrey" : "white",
              }}
            >
              <p>{notification.message}</p>
              <button onClick={() => deleteNotification(notification.id)}>
                Delete
              </button>
              {!notification.read && (
                <button onClick={() => markAsRead(notification.id)}>
                  Mark as Read
                </button>
              )}
              {notification.recipes &&
                notification.recipes.map((recipe, index) => (
                  <div key={index}>
                    <img src={recipe.image} alt={recipe.label} />
                    <a
                      href={recipe.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {recipe.label}
                    </a>
                  </div>
                ))}
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications found for you</p>
      )}
    </div>
  );
}
export default Notification;
