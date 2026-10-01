import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        formData.email,
        formData.password
      );

      const user = response.user;

      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, {
          replace: true,
        });

        return;
      }

      if (user.role === "owner") {
        navigate("/owner/my-properties", {
          replace: true,
        });

        return;
      }

      navigate("/properties", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* LEFT INFORMATION SECTION */}
        <div className="auth-info">

          <div className="auth-logo">
            <span>🏠</span>
            <strong>StaySync</strong>
          </div>

          <h1>
            Find your
            <br />
            perfect <span>place.</span>
          </h1>

          <p>
            Find comfortable, affordable and suitable
            PGs and rooms for your next stay.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span>✓</span>
              <p>Verified PGs and rooms</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>Search by location and budget</p>
            </div>

            <div className="auth-benefit">
              <span>✓</span>
              <p>Find a stay that suits you</p>
            </div>

          </div>

        </div>

        {/* RIGHT LOGIN SECTION */}
        <div className="login-form-section">

          <div className="login-heading">
            <h2>Welcome back</h2>

            <p>
              Sign in to continue to StaySync.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          <p className="register-prompt">
            Don't have an account?

            <Link to="/register">
              Create one
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;