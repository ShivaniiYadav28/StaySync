import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        email.trim(),
        password
      );

      const loggedInUser =
        response?.data?.user;

      if (loggedInUser?.role === "owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-info">
          <div className="login-info-icon">
            🏠
          </div>

          <p className="login-eyebrow">
            STAYSYNC
          </p>

          <h1>
            Find your perfect
            <br />
            <span>stay.</span>
          </h1>

          <p className="login-description">
            Discover comfortable PGs, rooms and
            compatible roommates with StaySync.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <span>✓</span>
              <p>Verified properties</p>
            </div>

            <div className="login-feature">
              <span>✓</span>
              <p>Find compatible roommates</p>
            </div>

            <div className="login-feature">
              <span>✓</span>
              <p>Connect directly with owners</p>
            </div>

            <div className="login-feature">
              <span>✓</span>
              <p>Find a stay that suits you</p>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>

            <p>
              Sign in to continue to StaySync.
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="login-register">
            <span>
              Don't have an account?
            </span>{" "}
            <Link to="/register">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;