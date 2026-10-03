import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

import "./Roommates.css";


function Roommates() {
  const navigate =
    useNavigate();


  // ==================================================
  // STATE
  // ==================================================

  const [
    matches,
    setMatches,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ==================================================
  // FETCH MATCHES
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    const loadMatches = async () => {
      try {
        const response =
          await api.get(
            "/roommates/matches"
          );

        if (cancelled) {
          return;
        }

        setMatches(
          response.data?.matches || []
        );

        setError("");

      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Fetch roommate matches error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load roommate matches."
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, []);


  // ==================================================
  // RETRY
  // ==================================================

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/roommates/matches"
        );

      setMatches(
        response.data?.matches || []
      );

    } catch (error) {
      console.error(
        "Retry roommate matches error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load roommate matches."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==================================================
  // GET INITIALS
  // ==================================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .map(
        (word) =>
          word.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };


  // ==================================================
  // MATCH CLASS
  // ==================================================

  const getMatchClass = (score) => {
    if (score >= 80) {
      return "match-high";
    }

    if (score >= 60) {
      return "match-medium";
    }

    return "match-low";
  };


  // ==================================================
  // FORMAT MOVE-IN DATE
  // ==================================================

  const formatMoveInDate = (
    date
  ) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==================================================
  // FORMAT TEXT
  // ==================================================

  const formatText = (
    value
  ) => {
    if (!value) {
      return "Not specified";
    }

    return value
      .toString()
      .replace(
        /_/g,
        " "
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };


  // ==================================================
  // FORMAT BUDGET
  // ==================================================

  const formatBudget = (
    budget
  ) => {
    const amount =
      Number(budget);

    if (
      Number.isNaN(amount)
    ) {
      return "Not specified";
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <main className="roommates-page">

      {/* ==========================================
          HERO
          ========================================== */}

      <section className="roommates-hero">

        <div className="roommates-hero-content">

          <div>

            <p className="roommates-eyebrow">
              STAYSYNC MATCHING
            </p>

            <h1>
              Find Your Ideal Roommate
            </h1>

            <p className="roommates-hero-text">
              Discover people who match
              your budget, location,
              lifestyle and living
              preferences.
            </p>

          </div>


          <div className="roommates-hero-icon">
            👥
          </div>

        </div>

      </section>


      {/* ==========================================
          CONTENT
          ========================================== */}

      <section className="roommates-content">

        <div className="roommates-heading">

          <div>

            <h2>
              Your Matches
            </h2>

            <p>
              Roommates ranked by
              compatibility with your
              preferences.
            </p>

          </div>


          {!loading &&
            !error && (
              <div className="match-count">

                {matches.length}{" "}

                {matches.length === 1
                  ? "match"
                  : "matches"}

              </div>
            )}

        </div>


        {/* ========================================
            LOADING
            ======================================== */}

        {loading && (
          <div className="roommates-state">

            <div className="roommates-spinner" />

            <p>
              Finding compatible
              roommates...
            </p>

          </div>
        )}


        {/* ========================================
            ERROR
            ======================================== */}

        {!loading &&
          error && (
            <div className="roommates-state roommates-error">

              <div className="state-icon">
                ⚠️
              </div>

              <h3>
                Unable to load matches
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="retry-button"
                onClick={
                  handleRetry
                }
              >
                Try Again
              </button>

            </div>
          )}


        {/* ========================================
            EMPTY
            ======================================== */}

        {!loading &&
          !error &&
          matches.length === 0 && (
            <div className="roommates-state">

              <div className="state-icon">
                👥
              </div>

              <h3>
                No roommate matches yet
              </h3>

              <p>
                There are currently no
                other active roommate
                profiles to match with.
              </p>

            </div>
          )}


        {/* ========================================
            MATCH CARDS
            ======================================== */}

        {!loading &&
          !error &&
          matches.length > 0 && (

            <div className="roommate-grid">

              {matches.map(
                (match) => {

                  const profile =
                    match?.profile;

                  if (!profile) {
                    return null;
                  }

                  const profileUser =
                    profile?.user;

                  const score =
                    Number(
                      match?.compatibilityScore ||
                        0
                    );


                  return (
                    <article
                      className="roommate-card"
                      key={
                        profile._id
                      }
                    >

                      {/* ==========================
                          CARD HEADER
                          ========================== */}

                      <div className="roommate-card-top">

                        <div className="roommate-avatar">

                          {getInitials(
                            profileUser?.name
                          )}

                        </div>


                        <div className="roommate-user-info">

                          <h3>
                            {profileUser?.name ||
                              "StaySync User"}
                          </h3>

                          <p>

                            {profile.age
                              ? `${profile.age} years`
                              : "Age not specified"}

                            {profile.occupation
                              ? ` • ${profile.occupation}`
                              : ""}

                          </p>

                        </div>


                        <div
                          className={`match-badge ${getMatchClass(
                            score
                          )}`}
                        >

                          <strong>
                            {score}%
                          </strong>

                          <span>
                            Match
                          </span>

                        </div>

                      </div>


                      {/* ==========================
                          LOCATION
                          ========================== */}

                      <div className="roommate-location">

                        <span className="info-icon">
                          📍
                        </span>

                        <div>

                          <strong>
                            {profile.preferredCity ||
                              "City not specified"}
                          </strong>

                          {profile.preferredArea && (
                            <span>
                              {" "}
                              •{" "}
                              {
                                profile.preferredArea
                              }
                            </span>
                          )}

                        </div>

                      </div>


                      {/* ==========================
                          DETAILS
                          ========================== */}

                      <div className="roommate-details">

                        <div className="roommate-detail">

                          <span className="detail-label">
                            Budget
                          </span>

                          <strong>
                            {formatBudget(
                              profile.budget
                            )}
                          </strong>

                          <span className="detail-subtext">
                            / month
                          </span>

                        </div>


                        <div className="roommate-detail">

                          <span className="detail-label">
                            Move-in
                          </span>

                          <strong>
                            {formatMoveInDate(
                              profile.moveInDate
                            )}
                          </strong>

                        </div>


                        <div className="roommate-detail">

                          <span className="detail-label">
                            Room
                          </span>

                          <strong>
                            {formatText(
                              profile.preferredRoomType
                            )}
                          </strong>

                        </div>


                        <div className="roommate-detail">

                          <span className="detail-label">
                            Food
                          </span>

                          <strong>
                            {formatText(
                              profile.foodPreference
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* ==========================
                          LIFESTYLE
                          ========================== */}

                      <div className="roommate-lifestyle">

                        <div className="lifestyle-item">

                          <span>
                            🚭
                          </span>

                          <div>

                            <small>
                              Smoking
                            </small>

                            <strong>
                              {formatText(
                                profile.smoking
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="lifestyle-item">

                          <span>
                            🌙
                          </span>

                          <div>

                            <small>
                              Sleep
                            </small>

                            <strong>
                              {formatText(
                                profile.sleepSchedule
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="lifestyle-item">

                          <span>
                            🧹
                          </span>

                          <div>

                            <small>
                              Cleanliness
                            </small>

                            <strong>
                              {profile.cleanliness
                                ? `${profile.cleanliness}/5`
                                : "Not specified"}
                            </strong>

                          </div>

                        </div>


                        <div className="lifestyle-item">

                          <span>
                            🐾
                          </span>

                          <div>

                            <small>
                              Pets
                            </small>

                            <strong>
                              {formatText(
                                profile.pets
                              )}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* ==========================
                          ACTION
                          ========================== */}

                      <div className="roommate-card-actions">

                        <button
                          type="button"
                          className="view-roommate-button"
                          onClick={() =>
                            navigate(
                              `/roommates/${profile._id}`
                            )
                          }
                        >
                          View Profile
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </section>

    </main>
  );
}


export default Roommates;