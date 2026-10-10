import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await api.get("/notifications");

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await api.get(
        "/notifications/unread-count"
      );

      setUnreadCount(
        response.data.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Fetch unread notification count error:",
        error
      );
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    setMobileMenuOpen(false);
    setNotificationOpen(false);

    navigate("/login");
  };

  const markNotificationAsRead = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        await api.patch(
          `/notifications/${notification._id}/read`
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      if (!notification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    await markNotificationAsRead(
      notification
    );

    setNotificationOpen(false);
    setMobileMenuOpen(false);

    if (
      notification.type ===
      "new_message"
    ) {
      navigate("/messages");
      return;
    }

    if (notification.property?._id) {
      navigate(
        `/properties/${notification.property._id}`
      );
      return;
    }

    if (notification.property) {
      navigate(
        `/properties/${notification.property}`
      );
      return;
    }

    if (notification.inquiry) {
      navigate("/my-inquiries");
    }
  };

  const formatNotificationTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const notificationDate =
      new Date(date);

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case "new_inquiry":
        return "📩";
      case "inquiry_accepted":
        return "✅";
      case "inquiry_rejected":
        return "❌";
      case "new_review":
        return "⭐";
      case "new_message":
        return "💬";
      default:
        return "🔔";
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMobileMenu}
        >
          StaySync
        </Link>

        <nav
          className={`navbar-links ${
            mobileMenuOpen
              ? "navbar-links-mobile-open"
              : ""
          }`}
        >
          <Link
            to="/"
            onClick={closeMobileMenu}
          >
            Home
          </Link>

          <Link
            to="/properties"
            onClick={closeMobileMenu}
          >
            Find a Stay
          </Link>

          {isAuthenticated && (
            <>
              {user?.role === "seeker" && (
                <>
                  <Link
                    to="/favorites"
                    onClick={closeMobileMenu}
                  >
                    Favorites
                  </Link>

                  <Link
                    to="/my-inquiries"
                    onClick={closeMobileMenu}
                  >
                    My Inquiries
                  </Link>

                  <Link
                    to="/roommates"
                    onClick={closeMobileMenu}
                  >
                    Find Roommates
                  </Link>

                  <Link
                    to="/roommate-requests"
                    onClick={closeMobileMenu}
                  >
                    Roommate Requests
                  </Link>

                  <Link
                    to="/messages"
                    className="navbar-message-link"
                    onClick={closeMobileMenu}
                  >
                    Messages
                  </Link>
                </>
              )}

              {user?.role === "owner" && (
                <>
                  <Link
                    to="/owner/dashboard"
                    onClick={closeMobileMenu}
                  >
                    Owner Dashboard
                  </Link>

                  <Link
                    to="/owner/add-property"
                    onClick={closeMobileMenu}
                  >
                    Add Property
                  </Link>

                  <Link
                    to="/owner/my-properties"
                    onClick={closeMobileMenu}
                  >
                    My Properties
                  </Link>

                  <Link
                    to="/owner/inquiries"
                    onClick={closeMobileMenu}
                  >
                    Inquiries
                  </Link>

                  <Link
                    to="/messages"
                    className="navbar-message-link"
                    onClick={closeMobileMenu}
                  >
                    Messages
                  </Link>
                </>
              )}

              {user?.role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMobileMenu}
                  >
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/messages"
                    className="navbar-message-link"
                    onClick={closeMobileMenu}
                  >
                    Messages
                  </Link>
                </>
              )}
            </>
          )}

          {!isAuthenticated && (
            <div className="navbar-mobile-auth">
              <Link
                to="/login"
                onClick={closeMobileMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMobileMenu}
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated && (
            <div
              className="navbar-notification-wrapper"
              ref={notificationRef}
            >
              <button
                type="button"
                className="navbar-notification-button"
                onClick={() =>
                  setNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-label="Notifications"
              >
                <span className="notification-bell">
                  🔔
                </span>

                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <div>
                      <h3>
                        Notifications
                      </h3>

                      <span>
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : "All caught up"}
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="mark-all-button"
                        onClick={
                          markAllAsRead
                        }
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
                    {notifications.length ===
                    0 ? (
                      <div className="notification-empty">
                        <div>
                          🔔
                        </div>

                        <p>
                          No notifications yet.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            type="button"
                            key={
                              notification._id
                            }
                            className={`notification-item ${
                              notification.isRead
                                ? "notification-read"
                                : "notification-unread"
                            }`}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                          >
                            <div className="notification-icon">
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="notification-content">
                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <span>
                                {formatNotificationTime(
                                  notification.createdAt
                                )}
                              </span>
                            </div>

                            {!notification.isRead && (
                              <span className="notification-unread-dot" />
                            )}
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="navbar-user-area">
              <span className="navbar-user-greeting">
                Hi,{" "}
                {user?.name || "User"}
              </span>

              <button
                type="button"
                className="navbar-logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-desktop-auth">
              <Link
                to="/login"
                className="navbar-login-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register-link"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            className="navbar-menu-button"
            onClick={() =>
              setMobileMenuOpen(
                (previous) => !previous
              )
            }
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen
              ? "✕"
              : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;