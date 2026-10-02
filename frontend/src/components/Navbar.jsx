import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";

import api from "../services/api";

import "./Navbar.css";


function Navbar() {

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const navigate = useNavigate();


  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);


  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);


  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(false);


  const notificationRef =
    useRef(null);


  /* =========================================
     LOAD NOTIFICATIONS
  ========================================= */

  useEffect(() => {

    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;


    const loadNotifications =
      async () => {

        try {

          setNotificationLoading(true);

          const response =
            await api.get(
              "/notifications"
            );


          if (!isMounted) {
            return;
          }


          setNotifications(
            response.data.notifications || []
          );


          setUnreadCount(
            response.data.unreadCount || 0
          );


        } catch (error) {

          if (!isMounted) {
            return;
          }

          console.error(
            "Failed to load notifications:",
            error
          );


        } finally {

          if (isMounted) {
            setNotificationLoading(false);
          }

        }

      };


    loadNotifications();


    return () => {

      isMounted = false;

    };

  }, [isAuthenticated]);


  /* =========================================
     CLOSE NOTIFICATION DROPDOWN
  ========================================= */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {

          setShowNotifications(false);

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


  /* =========================================
     MARK ONE NOTIFICATION AS READ
  ========================================= */

  const markAsRead =
    async (
      notificationId
    ) => {

      try {

        await api.patch(
          `/notifications/${notificationId}/read`
        );


        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                notification._id ===
                notificationId
                  ? {
                      ...notification,
                      isRead: true,
                    }
                  : notification
            )
        );


        setUnreadCount(
          (previous) =>
            Math.max(
              previous - 1,
              0
            )
        );


      } catch (error) {

        console.error(
          "Failed to mark notification as read:",
          error
        );

      }

    };


  /* =========================================
     MARK ALL NOTIFICATIONS AS READ
  ========================================= */

  const markAllAsRead =
    async () => {

      try {

        await api.patch(
          "/notifications/read-all"
        );


        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );


        setUnreadCount(0);


      } catch (error) {

        console.error(
          "Failed to mark all notifications as read:",
          error
        );

      }

    };


  /* =========================================
     NOTIFICATION CLICK
  ========================================= */

  const handleNotificationClick =
    async (
      notification
    ) => {

      if (!notification.isRead) {

        await markAsRead(
          notification._id
        );

      }


      setShowNotifications(false);


      /*
       * Property notification
       */
      if (
        notification.property?._id
      ) {

        navigate(
          `/properties/${notification.property._id}`
        );

        return;

      }


      /*
       * New inquiry
       */
      if (
        notification.type ===
          "new_inquiry" &&
        user?.role === "owner"
      ) {

        navigate(
          "/owner/inquiries"
        );

        return;

      }


      /*
       * Accepted / rejected inquiry
       */
      if (
        (
          notification.type ===
            "inquiry_accepted" ||
          notification.type ===
            "inquiry_rejected"
        ) &&
        user?.role === "seeker"
      ) {

        navigate(
          "/my-inquiries"
        );

        return;

      }


      /*
       * New message
       */
      if (
        notification.type ===
        "new_message"
      ) {

        navigate(
          "/messages"
        );

      }

    };


  /* =========================================
     NOTIFICATION TIME
  ========================================= */

  const formatNotificationTime =
    (
      createdAt
    ) => {

      if (!createdAt) {
        return "";
      }


      const date =
        new Date(createdAt);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "";

      }


      return date.toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        }
      );

    };


  /* =========================================
     NOTIFICATION ICON
  ========================================= */

  const getNotificationIcon =
    (type) => {

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


  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout =
    async () => {

      setNotifications([]);

      setUnreadCount(0);

      setShowNotifications(false);

      await logout();

    };


  return (

    <nav className="navbar">

      {/* =====================================
          LOGO
      ===================================== */}

      <Link
        to="/"
        className="navbar-logo"
      >
        StaySync
      </Link>


      {/* =====================================
          NAVIGATION LINKS
      ===================================== */}

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>


        <Link to="/properties">
          Find a Stay
        </Link>


        {/* =================================
            LOGGED OUT
        ================================= */}

        {!isAuthenticated && (
          <>

            <Link to="/login">
              Login
            </Link>


            <Link to="/register">
              Register
            </Link>

          </>
        )}


        {/* =================================
            LOGGED IN
        ================================= */}

        {isAuthenticated && (
          <>

            {/* ===============================
                OWNER LINKS
            =============================== */}

            {user?.role === "owner" && (
              <>

                <Link to="/owner/my-properties">
                  My Properties
                </Link>


                <Link to="/owner/inquiries">
                  Inquiries
                </Link>


                {/* MESSAGE LINK */}

                <Link
                  to="/messages"
                  className="navbar-message-link"
                >
                  <span className="navbar-message-icon">
                    💬
                  </span>

                  <span>
                    Messages
                  </span>
                </Link>

              </>
            )}


            {/* ===============================
                SEEKER LINKS
            =============================== */}

            {user?.role === "seeker" && (
              <>

                <Link to="/properties">
                  Explore
                </Link>


                <Link to="/favorites">
                  ♥ Favorites
                </Link>


                <Link to="/my-inquiries">
                  My Inquiries
                </Link>


                {/* MESSAGE LINK */}

                <Link
                  to="/messages"
                  className="navbar-message-link"
                >
                  <span className="navbar-message-icon">
                    💬
                  </span>

                  <span>
                    Messages
                  </span>
                </Link>

              </>
            )}


            {/* =================================
                NOTIFICATION
            ================================= */}

            <div
              className="notification-wrapper"
              ref={notificationRef}
            >

              <button
                type="button"
                className="notification-button"
                onClick={() =>
                  setShowNotifications(
                    (previous) =>
                      !previous
                  )
                }
                aria-label="Notifications"
              >

                🔔


                {unreadCount > 0 && (

                  <span className="notification-badge">

                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}

                  </span>

                )}

              </button>


              {/* NOTIFICATION DROPDOWN */}

              {showNotifications && (

                <div className="notification-dropdown">

                  {/* HEADER */}

                  <div className="notification-header">

                    <div>

                      <h3>
                        Notifications
                      </h3>


                      {unreadCount > 0 && (

                        <span>
                          {unreadCount} unread
                        </span>

                      )}

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


                  {/* LIST */}

                  <div className="notification-list">

                    {notificationLoading ? (

                      <div className="notification-empty">
                        Loading notifications...
                      </div>

                    ) : notifications.length === 0 ? (

                      <div className="notification-empty">

                        <div className="empty-bell">
                          🔔
                        </div>


                        <p>
                          No notifications yet
                        </p>


                        <span>
                          You're all caught up!
                        </span>

                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <button
                            key={
                              notification._id
                            }
                            type="button"
                            className={`notification-item ${
                              !notification.isRead
                                ? "notification-unread"
                                : ""
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

                              <div className="notification-title-row">

                                <strong>
                                  {
                                    notification.title
                                  }
                                </strong>


                                {!notification.isRead && (

                                  <span className="notification-dot" />

                                )}

                              </div>


                              <p>
                                {
                                  notification.message
                                }
                              </p>


                              <span className="notification-time">

                                {formatNotificationTime(
                                  notification.createdAt
                                )}

                              </span>

                            </div>

                          </button>

                        )
                      )

                    )}

                  </div>

                </div>

              )}

            </div>


            {/* =================================
                USER
            ================================= */}

            <span className="navbar-user">

              Hi, {user?.name}

            </span>


            {/* =================================
                LOGOUT
            ================================= */}

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </>
        )}

      </div>

    </nav>

  );

}


export default Navbar;