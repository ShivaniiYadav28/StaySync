import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}

        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">⌂</span>
            <span>PG Finder</span>
          </Link>

          <p>
            Find comfortable, affordable and
            suitable PGs and rooms for your
            next stay.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              Instagram
            </a>

            <a href="#" aria-label="LinkedIn">
              LinkedIn
            </a>

            <a href="#" aria-label="Twitter">
              Twitter
            </a>
          </div>

        </div>


        {/* Explore */}

        <div className="footer-column">

          <h3>Explore</h3>

          <Link to="/">
            Find PGs
          </Link>

          <Link to="/">
            Find Rooms
          </Link>

          <Link to="/">
            Find Roommates
          </Link>

          <Link to="/">
            Popular Locations
          </Link>

        </div>


        {/* Company */}

        <div className="footer-column">

          <h3>Company</h3>

          <Link to="/">
            About Us
          </Link>

          <Link to="/">
            Contact Us
          </Link>

          <Link to="/">
            Help Center
          </Link>

          <Link to="/">
            List Your Property
          </Link>

        </div>


        {/* Legal */}

        <div className="footer-column">

          <h3>Legal</h3>

          <Link to="/">
            Privacy Policy
          </Link>

          <Link to="/">
            Terms & Conditions
          </Link>

          <Link to="/">
            Cookie Policy
          </Link>

          <Link to="/">
            Safety Guidelines
          </Link>

        </div>

      </div>


      {/* Bottom */}

      <div className="footer-bottom">

        <div>
          © 2026 PG Finder. All rights reserved.
        </div>

        <div>
          Made for students & professionals 🏠
        </div>

      </div>

    </footer>
  );
}

export default Footer;