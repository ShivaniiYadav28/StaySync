import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
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
    <header className="navbar [position:sticky] [top:0] [z-index:1000] [width:100%] [background:rgba(7,_13,_27,_0.94)] [border-bottom:1px_solid_rgba(148,_163,_184,_0.12)] [box-shadow:0_8px_30px_rgba(0,_0,_0,_0.22)] [backdrop-filter:blur(18px)]">
      <div className="navbar-container [width:100%] [max-width:1440px] [min-height:74px] [margin:0_auto] [padding:0_28px] [display:flex] [align-items:center] [gap:28px] max-[1180px]:[padding:0_20px] max-[1180px]:[gap:18px] max-[900px]:[min-height:68px] max-[900px]:[padding:0_18px] max-[480px]:[padding:0_14px]">
        <Link
          to="/"
          className="navbar-logo [flex-shrink:0] [color:#2dd4bf] [text-decoration:none] [font-size:27px] [font-weight:800] [letter-spacing:-1px] [white-space:nowrap] [transition:0.2s_ease] hover:[color:#5eead4] hover:[text-shadow:0_0_20px_rgba(45,_212,_191,_0.3)] max-[900px]:[font-size:25px] max-[480px]:[font-size:23px]"
          onClick={closeMobileMenu}
        >
          StaySync
        </Link>

        <nav
          className={`navbar-links [display:flex] [align-items:center] [gap:3px] [flex:1] [min-width:0] [&_a]:[display:inline-flex] [&_a]:[align-items:center] [&_a]:[justify-content:center] [&_a]:[min-height:40px] [&_a]:[padding:0_12px] [&_a]:[color:#94a3b8] [&_a]:[text-decoration:none] [&_a]:[font-size:14px] [&_a]:[font-weight:600] [&_a]:[border-radius:10px] [&_a]:[white-space:nowrap] [&_a]:[transition:color_0.2s_ease,_background_0.2s_ease,_transform_0.2s_ease] [&_a:hover]:[color:#5eead4] [&_a:hover]:[background:rgba(20,_184,_166,_0.09)] [&_a:active]:[transform:scale(0.98)] max-[1180px]:[gap:1px] max-[1180px]:[&_a]:[padding:0_9px] max-[1180px]:[&_a]:[font-size:13px] max-[900px]:[display:none] max-[900px]:[&.navbar-links-mobile-open]:[position:absolute] max-[900px]:[&.navbar-links-mobile-open]:[top:68px] max-[900px]:[&.navbar-links-mobile-open]:[left:0] max-[900px]:[&.navbar-links-mobile-open]:[right:0] max-[900px]:[&.navbar-links-mobile-open]:[display:flex] max-[900px]:[&.navbar-links-mobile-open]:[flex-direction:column] max-[900px]:[&.navbar-links-mobile-open]:[align-items:stretch] max-[900px]:[&.navbar-links-mobile-open]:[gap:3px] max-[900px]:[&.navbar-links-mobile-open]:[margin:0] max-[900px]:[&.navbar-links-mobile-open]:[padding:13px_16px_16px] max-[900px]:[&.navbar-links-mobile-open]:[background:rgba(7,_13,_27,_0.98)] max-[900px]:[&.navbar-links-mobile-open]:[border-bottom:1px_solid_rgba(148,_163,_184,_0.12)] max-[900px]:[&.navbar-links-mobile-open]:[box-shadow:0_18px_35px_rgba(0,_0,_0,_0.4)] max-[900px]:[&.navbar-links-mobile-open]:[backdrop-filter:blur(18px)] max-[900px]:[&.navbar-links-mobile-open_.navbar-mobile-auth]:[display:flex] max-[900px]:[&.navbar-links-mobile-open_a]:[width:100%] max-[900px]:[&.navbar-links-mobile-open_a]:[min-height:44px] max-[900px]:[&.navbar-links-mobile-open_a]:[justify-content:flex-start] max-[900px]:[&.navbar-links-mobile-open_a]:[padding:0_14px] max-[900px]:[&.navbar-links-mobile-open_a]:[color:#cbd5e1] max-[900px]:[&.navbar-links-mobile-open_a:hover]:[color:#5eead4] max-[900px]:[&.navbar-links-mobile-open_a:hover]:[background:rgba(20,_184,_166,_0.1)] ${
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
            <div className="navbar-mobile-auth [display:none] [flex-direction:column] [gap:4px]">
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

        <div className="navbar-actions [display:flex] [align-items:center] [gap:10px] [flex-shrink:0] max-[900px]:[margin-left:auto] max-[900px]:[gap:8px]">
          {isAuthenticated && (
            <div
              className="navbar-notification-wrapper [position:relative]"
              ref={notificationRef}
            >
              <button
                type="button"
                className="navbar-notification-button [width:40px] [height:40px] [display:flex] [align-items:center] [justify-content:center] [border:1px_solid_rgba(148,_163,_184,_0.16)] [border-radius:50%] [background:rgba(15,_23,_42,_0.8)] [color:#cbd5e1] [cursor:pointer] [font-size:17px] [transition:0.2s_ease] hover:[color:#5eead4] hover:[background:rgba(20,_184,_166,_0.1)] hover:[border-color:rgba(45,_212,_191,_0.4)] hover:[box-shadow:0_0_18px_rgba(20,_184,_166,_0.1)] max-[480px]:[width:38px] max-[480px]:[height:38px]"
                onClick={() =>
                  setNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-label="Notifications"
              >
                <span className="notification-bell [display:flex] [align-items:center] [justify-content:center]">
                  🔔
                </span>

                {unreadCount > 0 && (
                  <span className="notification-count [position:absolute] [top:-5px] [right:-5px] [min-width:18px] [height:18px] [padding:0_5px] [display:flex] [align-items:center] [justify-content:center] [border-radius:999px] [background:#ef4444] [color:white] [border:2px_solid_#070d1b] [font-size:9px] [font-weight:800]">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown [position:absolute] [top:calc(100%_+_12px)] [right:0] [width:370px] [max-width:calc(100vw_-_30px)] [background:#0f172a] [border:1px_solid_rgba(148,_163,_184,_0.16)] [border-radius:16px] [box-shadow:0_25px_70px_rgba(0,_0,_0,_0.5),_0_5px_20px_rgba(0,_0,_0,_0.25)] [overflow:hidden] max-[480px]:[position:fixed] max-[480px]:[top:68px] max-[480px]:[left:12px] max-[480px]:[right:12px] max-[480px]:[width:auto] max-[480px]:[max-width:none]">
                  <div className="notification-header [display:flex] [align-items:center] [justify-content:space-between] [padding:17px_18px] [border-bottom:1px_solid_rgba(148,_163,_184,_0.1)] [&_h3]:[margin:0] [&_h3]:[color:#f8fafc] [&_h3]:[font-size:15px] [&_h3]:[font-weight:700] [&_span]:[display:block] [&_span]:[margin-top:3px] [&_span]:[color:#64748b] [&_span]:[font-size:11px]">
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
                        className="mark-all-button [border:none] [background:transparent] [color:#2dd4bf] [font-size:12px] [font-weight:700] [cursor:pointer] hover:[color:#5eead4]"
                        onClick={
                          markAllAsRead
                        }
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list [max-height:390px] [overflow-y:auto] -webkit-scrollbar:[width:6px] -webkit-scrollbar-track:[background:transparent] -webkit-scrollbar-thumb:[background:#334155] -webkit-scrollbar-thumb:[border-radius:20px]">
                    {notifications.length ===
                    0 ? (
                      <div className="notification-empty [padding:40px_20px] [text-align:center] [color:#64748b] [font-size:13px] [&_div]:[margin-bottom:8px] [&_div]:[font-size:28px]">
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
                            className={`notification-item [width:100%] [display:flex] [align-items:flex-start] [gap:12px] [padding:15px_17px] [border:none] [border-bottom:1px_solid_rgba(148,_163,_184,_0.08)] [cursor:pointer] [text-align:left] [transition:0.2s_ease] hover:[background:rgba(148,_163,_184,_0.06)] ${
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
                            <div className="notification-icon [width:34px] [height:34px] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [border-radius:10px] [background:rgba(20,_184,_166,_0.08)] [color:#5eead4]">
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="notification-content [flex:1] [min-width:0] [&_strong]:[display:block] [&_strong]:[color:#e2e8f0] [&_strong]:[font-size:13px] [&_strong]:[font-weight:700] [&_p]:[margin:4px_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:12px] [&_p]:[line-height:1.5] [&_span]:[color:#64748b] [&_span]:[font-size:10px]">
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
                              <span className="notification-unread-dot [width:7px] [height:7px] [flex-shrink:0] [margin-top:7px] [border-radius:50%] [background:#2dd4bf] [box-shadow:0_0_9px_rgba(45,_212,_191,_0.7)]" />
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
            <div className="navbar-user-area [display:flex] [align-items:center] [gap:10px] max-[900px]:[display:none]">
              <span className="navbar-user-greeting [max-width:125px] [overflow:hidden] [text-overflow:ellipsis] [color:#cbd5e1] [font-size:13px] [font-weight:600] [white-space:nowrap] max-[1180px]:[display:none]">
                Hi,{" "}
                {user?.name || "User"}
              </span>

              <button
                type="button"
                className="navbar-logout-button [border:1px_solid_rgba(148,_163,_184,_0.18)] [background:rgba(15,_23,_42,_0.85)] [color:#cbd5e1] [padding:8px_13px] [border-radius:9px] [font-size:13px] [font-weight:600] [cursor:pointer] [transition:0.2s_ease] hover:[color:#fca5a5] hover:[border-color:rgba(248,_113,_113,_0.4)] hover:[background:rgba(127,_29,_29,_0.18)]"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-desktop-auth [display:flex] [align-items:center] [gap:7px] max-[900px]:[display:none]">
              <Link
                to="/login"
                className="navbar-login-link [text-decoration:none] [font-size:14px] [font-weight:600] [border-radius:9px] [padding:9px_14px] [transition:0.2s_ease] [color:#cbd5e1] hover:[color:#5eead4] hover:[background:rgba(20,_184,_166,_0.09)]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register-link [text-decoration:none] [font-size:14px] [font-weight:600] [border-radius:9px] [padding:9px_14px] [transition:0.2s_ease] [color:#042f2e] [background:#2dd4bf] [box-shadow:0_5px_18px_rgba(20,_184,_166,_0.14)] hover:[background:#5eead4] hover:[transform:translateY(-1px)] hover:[box-shadow:0_7px_22px_rgba(20,_184,_166,_0.22)]"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            className="navbar-menu-button [display:none] [width:40px] [height:40px] [align-items:center] [justify-content:center] [border:1px_solid_rgba(148,_163,_184,_0.18)] [border-radius:9px] [background:#111827] [color:#cbd5e1] [cursor:pointer] [font-size:19px] [transition:0.2s_ease] hover:[background:#1e293b] hover:[border-color:rgba(45,_212,_191,_0.4)] hover:[color:#5eead4] max-[900px]:[display:flex] max-[480px]:[width:38px] max-[480px]:[height:38px]"
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