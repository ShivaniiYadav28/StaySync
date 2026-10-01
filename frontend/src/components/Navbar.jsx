import { Link } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import "./Navbar.css";

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="navbar-logo"
      >
        StaySync
      </Link>

      <div className="navbar-links">

        <Link to="/">
          Home
        </Link>

        <Link to="/properties">
          Find a Stay
        </Link>

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

        {isAuthenticated && (
          <>
            {user?.role === "owner" && (
              <Link to="/owner/my-properties">
                My Properties
              </Link>
            )}

            {user?.role === "seeker" && (
              <Link to="/properties">
                Explore
              </Link>
            )}

            <span className="navbar-user">
              Hi, {user?.name}
            </span>

            <button
              type="button"
              className="navbar-logout"
              onClick={logout}
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