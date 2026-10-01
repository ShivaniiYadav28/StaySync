import { Link } from "react-router-dom";
import "./Home.css";

function HomePage() {
  return (
    <div className="home-page">

      {/* ================================
          HERO SECTION
      ================================= */}

      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-text">
            <p className="hero-label">
              STAYSYNC
            </p>

            <h1>
              Find a place
              <br />
              that feels like
              <span> home.</span>
            </h1>

            <p className="hero-description">
              Discover trusted PGs, rooms and
              shared stays that match your
              budget, location and lifestyle.
            </p>

            <div className="hero-buttons">
              <Link
                to="/properties"
                className="primary-btn"
              >
                Find Your Stay
              </Link>

              <Link
                to="/register"
                className="secondary-btn"
              >
                List Your Property
              </Link>
            </div>
          </div>

          <div className="hero-card">

            <div className="hero-card-top">
              <span>
                Popular location
              </span>

              <span className="online-dot">
                ●
              </span>
            </div>

            <h3>
              Bangalore
            </h3>

            <p>
              PGs & rooms for students
              and working professionals.
            </p>

            <div className="hero-stats">
              <div>
                <strong>
                  PGs
                </strong>

                <span>
                  Available
                </span>
              </div>

              <div>
                <strong>
                  ₹5K+
                </strong>

                <span>
                  Starting rent
                </span>
              </div>

              <div>
                <strong>
                  24/7
                </strong>

                <span>
                  Explore
                </span>
              </div>
            </div>

            <Link
              to="/properties"
              className="hero-card-link"
            >
              Explore stays →
            </Link>

          </div>

        </div>
      </section>


      {/* ================================
          FEATURES
      ================================= */}

      <section className="features-section">

        <div className="section-heading">

          <p>
            WHY STAYSYNC
          </p>

          <h2>
            Everything you need
            <br />
            to find your next stay.
          </h2>

          <span>
            Searching for accommodation
            shouldn't be complicated.
          </span>

        </div>


        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">
              🔍
            </div>

            <h3>
              Easy Discovery
            </h3>

            <p>
              Search PGs and rooms by
              location, budget, property
              type and room preferences.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              💰
            </div>

            <h3>
              Budget Friendly
            </h3>

            <p>
              Compare rents and find
              accommodation that fits
              your monthly budget.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              👥
            </div>

            <h3>
              Find Roommates
            </h3>

            <p>
              Connect with people looking
              for compatible roommates and
              shared accommodation.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🏠
            </div>

            <h3>
              For Property Owners
            </h3>

            <p>
              List your PG or room and
              reach students and working
              professionals.
            </p>

          </div>

        </div>

      </section>


      {/* ================================
          HOW IT WORKS
      ================================= */}

      <section className="how-section">

        <div className="section-heading center">

          <p>
            HOW IT WORKS
          </p>

          <h2>
            Find your stay in
            <br />
            three simple steps.
          </h2>

        </div>


        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Search
            </h3>

            <p>
              Enter your preferred city,
              area and budget.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              Compare
            </h3>

            <p>
              Explore properties and
              compare rooms, rent and
              amenities.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Connect
            </h3>

            <p>
              Contact the owner and
              find your next stay.
            </p>

          </div>

        </div>

      </section>


      {/* ================================
          OWNER CTA
      ================================= */}

      <section className="owner-section">

        <div className="owner-content">

          <div>

            <p className="owner-label">
              FOR PROPERTY OWNERS
            </p>

            <h2>
              Have a property?
              <br />
              Find the right tenants.
            </h2>

            <p>
              List your PG, room or
              accommodation on StaySync
              and connect with people
              looking for a place to stay.
            </p>

          </div>

          <Link
            to="/register"
            className="owner-btn"
          >
            List Your Property →
          </Link>

        </div>

      </section>


      {/* ================================
          FINAL CTA
      ================================= */}

      <section className="final-cta">

        <p>
          YOUR NEXT STAY IS WAITING
        </p>

        <h2>
          Ready to find your
          <br />
          new place?
        </h2>

        <Link
          to="/properties"
          className="primary-btn"
        >
          Explore Properties
        </Link>

      </section>

    </div>
  );
}

export default HomePage;