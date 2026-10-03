import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/useAuth";

import "./Login.css";


function Login() {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();


  // =========================================
  // FORM STATE
  // =========================================

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");


  // =========================================
  // PAGE STATE
  // =========================================

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =========================================
  // REDIRECT IF ALREADY LOGGED IN
  // =========================================

  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated
    ) {
      navigate(
        "/properties",
        {
          replace: true,
        }
      );
    }
  }, [
    isAuthenticated,
    authLoading,
    navigate,
  ]);


  // =========================================
  // INPUT HANDLERS
  // =========================================

  const handleEmailChange = (
    event
  ) => {
    setEmail(
      event.target.value
    );

    if (error) {
      setError("");
    }
  };


  const handlePasswordChange = (
    event
  ) => {
    setPassword(
      event.target.value
    );

    if (error) {
      setError("");
    }
  };


  // =========================================
  // FORM SUBMIT
  // =========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");


    // =======================================
    // BASIC VALIDATION
    // =======================================

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }


    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }


    // =======================================
    // LOGIN
    // =======================================

    try {
      setLoading(true);


      const response =
        await login(
          cleanEmail,
          password
        );


      console.log(
        "Login response:",
        response
      );


      // =====================================
      // GET LOGGED-IN USER SAFELY
      // =====================================

      const loggedInUser =
        response?.data?.user ||
        response?.data?.data?.user ||
        null;


      // =====================================
      // PROTECT AGAINST MISSING USER
      // =====================================

      if (!loggedInUser) {
        throw new Error(
          "Login succeeded, but user information was not returned."
        );
      }


      console.log(
        "Logged-in user:",
        loggedInUser
      );


      // =====================================
      // ROLE-BASED NAVIGATION
      // =====================================

      if (
        loggedInUser.role ===
        "owner"
      ) {
        navigate(
          "/owner/my-properties",
          {
            replace: true,
          }
        );

        return;
      }


      if (
        loggedInUser.role ===
        "admin"
      ) {
        navigate(
          "/",
          {
            replace: true,
          }
        );

        return;
      }


      // Default: seeker
      navigate(
        "/properties",
        {
          replace: true,
        }
      );

    } catch (loginError) {

      console.error(
        "Login error:",
        loginError
      );


      // =====================================
      // ERROR MESSAGE
      // =====================================

      const serverMessage =
        loginError
          ?.response
          ?.data
          ?.message;


      if (serverMessage) {
        setError(
          serverMessage
        );

      } else if (
        loginError?.message
      ) {
        setError(
          loginError.message
        );

      } else {
        setError(
          "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // LOADING SCREEN
  // =========================================

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-loading">
          Checking authentication...
        </div>
      </div>
    );
  }


  // =========================================
  // UI
  // =========================================

  return (
    <div className="login-page">

      <div className="login-container">


        {/* ====================================
            LEFT / BRAND SECTION
        ==================================== */}

        <div className="login-brand-section">

          <div className="login-brand-content">

            <div className="login-brand-icon">
              🏠
            </div>

            <h1>
              Find your perfect stay.
            </h1>

            <p>
              Discover comfortable PGs,
              rooms and compatible
              roommates with StaySync.
            </p>


            <div className="login-brand-points">

              <div className="login-brand-point">
                <span>✓</span>
                <p>
                  Verified properties
                </p>
              </div>


              <div className="login-brand-point">
                <span>✓</span>
                <p>
                  Find compatible roommates
                </p>
              </div>


              <div className="login-brand-point">
                <span>✓</span>
                <p>
                  Connect directly with owners
                </p>
              </div>


              <div className="login-brand-point">
                <span>✓</span>
                <p>
                  Find a stay that suits you
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* ====================================
            LOGIN FORM
        ==================================== */}

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue to StaySync.
            </p>

          </div>


          {/* ==================================
              ERROR
          ================================== */}

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* ==================================
              FORM
          ================================== */}

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >


            {/* EMAIL */}

            <div className="login-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={
                  handleEmailChange
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="login-form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={
                  handlePasswordChange
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign In"}

            </button>

          </form>


          {/* ==================================
              REGISTER
          ================================== */}

          <div className="login-register-link">

            <span>
              Don't have an account?
            </span>

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