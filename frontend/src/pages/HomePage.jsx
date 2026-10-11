import { Link } from "react-router-dom";
import PropertySearch from "../components/PropertySearch";
function HomePage() {
  return (
    <div className="home-page [background:#0b1120] [color:#f8fafc]">

      {/* ================================
          HERO SECTION
      ================================= */}

      <section className="hero-section [background:radial-gradient(_circle_at_80%_20%,_rgba(20,_184,_166,_0.16),_transparent_30%_),_linear-gradient(_135deg,_#0f172a_0%,_#0b2530_55%,_#0f766e_100%_)] [min-height:570px] [display:block] [padding:80px_7%] [box-sizing:border-box] [&>_.mt-10]:[width:100%] [&>_.mt-10]:[max-width:1200px] [&>_.mt-10]:![margin:35px_auto_0] [&>_.mt-10]:[padding:0_20px] [&>_.mt-10]:[position:relative] [&>_.mt-10]:[z-index:5] [&>_.mt-10_>_div]:[width:100%] [&>_.mt-10_.bg-white]:![background:#111827] [&>_.mt-10_.bg-white]:![border-color:#334155] [&>_.mt-10_.bg-white]:![box-shadow:0_20px_50px_rgba(0,_0,_0,_0.35)] [&>_.mt-10_label]:![color:#e2e8f0] [&>_.mt-10_input]:![background:#0f172a] [&>_.mt-10_input]:![color:#f8fafc] [&>_.mt-10_input]:![border-color:#475569] [&>_.mt-10_select]:![background:#0f172a] [&>_.mt-10_select]:![color:#f8fafc] [&>_.mt-10_select]:![border-color:#475569] [&>_.mt-10_input::placeholder]:![color:#64748b] [&>_.mt-10_input:focus]:![border-color:#14b8a6] [&>_.mt-10_input:focus]:![box-shadow:0_0_0_4px_rgba(20,_184,_166,_0.12)] [&>_.mt-10_select:focus]:![border-color:#14b8a6] [&>_.mt-10_select:focus]:![box-shadow:0_0_0_4px_rgba(20,_184,_166,_0.12)] [&>_.mt-10_select_option]:[background:#111827] [&>_.mt-10_select_option]:[color:#f8fafc] [&>_.mt-10_button]:![background:#0d9488] [&>_.mt-10_button]:![color:white] [&>_.mt-10_button:hover]:![background:#14b8a6] max-[950px]:[padding:60px_6%] max-[650px]:[&>_.mt-10]:![margin-top:30px] max-[650px]:[&>_.mt-10]:[padding:0_16px]">
        <div className="hero-content [width:100%] [max-width:1200px] [margin:auto] [display:grid] [grid-template-columns:1.2fr_0.8fr] [gap:80px] [align-items:center] max-[950px]:[grid-template-columns:1fr] max-[950px]:[gap:45px]">

          <div className="hero-text [&_h1]:[color:#f8fafc] [&_h1]:[font-size:60px] [&_h1]:[line-height:1.05] [&_h1]:[margin:0] [&_h1]:[letter-spacing:-2px] [&_h1_span]:[color:#5eead4] max-[950px]:[&_h1]:[font-size:48px] max-[650px]:[&_h1]:[font-size:40px]">
            <p className="hero-label [color:#5eead4] [font-size:13px] [font-weight:800] [letter-spacing:3px] [margin-bottom:18px]">
              STAYSYNC
            </p>

            <h1>
              Find a place
              <br />
              that feels like
              <span> home.</span>
            </h1>

            <p className="hero-description [max-width:600px] [color:#cbd5e1] [font-size:18px] [line-height:1.7] [margin:25px_0_30px] max-[650px]:[font-size:16px]">
              Discover trusted PGs, rooms and
              shared stays that match your
              budget, location and lifestyle.
            </p>

            <div className="hero-buttons [display:flex] [gap:14px] [flex-wrap:wrap]">
              <Link
                to="/properties"
                className="primary-btn [display:inline-block] [text-decoration:none] [padding:13px_22px] [border-radius:9px] [font-weight:700] [transition:transform_0.2s_ease,_background_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] [background:#14b8a6] [color:#042f2e] [box-shadow:0_8px_25px_rgba(20,_184,_166,_0.2)] hover:[transform:translateY(-2px)] hover:[background:#2dd4bf] hover:[box-shadow:0_12px_30px_rgba(20,_184,_166,_0.3)]"
              >
                Find Your Stay
              </Link>

              <Link
                to="/register"
                className="secondary-btn [display:inline-block] [text-decoration:none] [padding:13px_22px] [border-radius:9px] [font-weight:700] [transition:transform_0.2s_ease,_background_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] [border:1px_solid_#5eead4] [color:#f0fdfa] [background:rgba(15,_23,_42,_0.2)] hover:[background:rgba(20,_184,_166,_0.15)] hover:[border-color:#2dd4bf]"
              >
                List Your Property
              </Link>
            </div>
          </div>

          <div className="hero-card [background:linear-gradient(_145deg,_#172033,_#111827_)] [border:1px_solid_#334155] [border-radius:20px] [padding:30px] [box-shadow:0_25px_60px_rgba(0,_0,_0,_0.35)] [&_h3]:[color:#f8fafc] [&_h3]:[font-size:30px] [&_h3]:[margin:18px_0_8px] [&>_p]:[color:#94a3b8] [&>_p]:[line-height:1.6]">

            <div className="hero-card-top [display:flex] [justify-content:space-between] [color:#94a3b8] [font-size:13px]">
              <span>
                Popular location
              </span>

              <span className="online-dot [color:#2dd4bf] [text-shadow:0_0_10px_rgba(45,_212,_191,_0.7)]">
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

            <div className="hero-stats [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:10px] [margin:25px_0] [padding:18px_0] [border-top:1px_solid_#334155] [border-bottom:1px_solid_#334155] [&_div]:[display:flex] [&_div]:[flex-direction:column] [&_div]:[gap:5px] [&_strong]:[color:#2dd4bf] [&_span]:[color:#94a3b8] [&_span]:[font-size:11px]">

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
              className="hero-card-link [color:#5eead4] [text-decoration:none] [font-weight:700] [transition:color_0.2s_ease] hover:[color:#99f6e4]"
            >
              Explore stays →
            </Link>

          </div>

        </div>

        {/* ================================
            PROPERTY SEARCH
        ================================= */}

        <div className="mt-10">
          <PropertySearch />
        </div>

      </section>


      {/* ================================
          FEATURES
      ================================= */}

      <section className="features-section [max-width:1200px] [margin:auto] [padding:90px_7%]">

        <div className="section-heading [margin-bottom:45px] [&_p]:[color:#2dd4bf] [&_p]:[font-size:12px] [&_p]:[font-weight:800] [&_p]:[letter-spacing:2px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:38px] [&_h2]:[line-height:1.15] [&_h2]:[margin:10px_0_15px] [&_span]:[color:#94a3b8] [&_span]:[line-height:1.6] max-[650px]:[&_h2]:[font-size:30px]">

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


        <div className="features-grid [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:20px] max-[950px]:[grid-template-columns:repeat(2,_1fr)] max-[650px]:[grid-template-columns:1fr]">

          <div className="feature-card [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [padding:25px] [border:1px_solid_#273449] [border-radius:14px] [transition:transform_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-5px)] hover:[border-color:#0d9488] hover:[box-shadow:0_15px_35px_rgba(20,_184,_166,_0.08)] [&_h3]:[color:#f8fafc] [&_h3]:[margin-bottom:10px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6] [&_p]:[font-size:14px]">

            <div className="feature-icon [width:45px] [height:45px] [display:flex] [align-items:center] [justify-content:center] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.15)] [border-radius:10px] [font-size:20px] [margin-bottom:20px]">
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


          <div className="feature-card [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [padding:25px] [border:1px_solid_#273449] [border-radius:14px] [transition:transform_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-5px)] hover:[border-color:#0d9488] hover:[box-shadow:0_15px_35px_rgba(20,_184,_166,_0.08)] [&_h3]:[color:#f8fafc] [&_h3]:[margin-bottom:10px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6] [&_p]:[font-size:14px]">

            <div className="feature-icon [width:45px] [height:45px] [display:flex] [align-items:center] [justify-content:center] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.15)] [border-radius:10px] [font-size:20px] [margin-bottom:20px]">
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


          <div className="feature-card [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [padding:25px] [border:1px_solid_#273449] [border-radius:14px] [transition:transform_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-5px)] hover:[border-color:#0d9488] hover:[box-shadow:0_15px_35px_rgba(20,_184,_166,_0.08)] [&_h3]:[color:#f8fafc] [&_h3]:[margin-bottom:10px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6] [&_p]:[font-size:14px]">

            <div className="feature-icon [width:45px] [height:45px] [display:flex] [align-items:center] [justify-content:center] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.15)] [border-radius:10px] [font-size:20px] [margin-bottom:20px]">
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


          <div className="feature-card [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [padding:25px] [border:1px_solid_#273449] [border-radius:14px] [transition:transform_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-5px)] hover:[border-color:#0d9488] hover:[box-shadow:0_15px_35px_rgba(20,_184,_166,_0.08)] [&_h3]:[color:#f8fafc] [&_h3]:[margin-bottom:10px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6] [&_p]:[font-size:14px]">

            <div className="feature-icon [width:45px] [height:45px] [display:flex] [align-items:center] [justify-content:center] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.15)] [border-radius:10px] [font-size:20px] [margin-bottom:20px]">
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

      <section className="how-section [background:#111827] [padding:90px_7%] [border-top:1px_solid_#1e293b] [border-bottom:1px_solid_#1e293b]">

        <div className="section-heading center [margin-bottom:45px] [&_p]:[color:#2dd4bf] [&_p]:[font-size:12px] [&_p]:[font-weight:800] [&_p]:[letter-spacing:2px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:38px] [&_h2]:[line-height:1.15] [&_h2]:[margin:10px_0_15px] [&_span]:[color:#94a3b8] [&_span]:[line-height:1.6] max-[650px]:[&_h2]:[font-size:30px] [text-align:center]">

          <p>
            HOW IT WORKS
          </p>

          <h2>
            Find your stay in
            <br />
            three simple steps.
          </h2>

        </div>


        <div className="steps [max-width:1000px] [margin:50px_auto_0] [display:flex] [align-items:center] [justify-content:space-between] max-[950px]:[gap:20px] max-[650px]:[flex-direction:column]">

          <div className="step [text-align:center] [max-width:230px] [&_h3]:[color:#f8fafc] [&_h3]:[margin:18px_0_8px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.5] [&_p]:[font-size:14px]">

            <div className="step-number [width:55px] [height:55px] [margin:auto] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.25)] [color:#2dd4bf] [font-weight:800]">
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


          <div className="step-line [height:1px] [width:100px] [background:#334155] max-[950px]:[width:50px] max-[650px]:[width:1px] max-[650px]:[height:40px]"></div>


          <div className="step [text-align:center] [max-width:230px] [&_h3]:[color:#f8fafc] [&_h3]:[margin:18px_0_8px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.5] [&_p]:[font-size:14px]">

            <div className="step-number [width:55px] [height:55px] [margin:auto] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.25)] [color:#2dd4bf] [font-weight:800]">
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


          <div className="step-line [height:1px] [width:100px] [background:#334155] max-[950px]:[width:50px] max-[650px]:[width:1px] max-[650px]:[height:40px]"></div>


          <div className="step [text-align:center] [max-width:230px] [&_h3]:[color:#f8fafc] [&_h3]:[margin:18px_0_8px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.5] [&_p]:[font-size:14px]">

            <div className="step-number [width:55px] [height:55px] [margin:auto] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.25)] [color:#2dd4bf] [font-weight:800]">
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

      <section className="owner-section [padding:80px_7%] [background:linear-gradient(_135deg,_#0f292b,_#102a35_)] [border-bottom:1px_solid_#1e293b] ![background:linear-gradient(_135deg,_#111827_0%,_#0f292b_50%,_#0f766e_100%_)] ![color:#f8fafc] [border:1px_solid_#273449] [border-radius:0_0_18px_18px] [&_h2]:![color:#f8fafc] [&_h3]:![color:#f8fafc] [&_h4]:![color:#f8fafc] [&_p]:![color:#cbd5e1] [&.section-label]:![color:#5eead4] [&.eyebrow]:![color:#5eead4] [&_a]:![background:#14b8a6] [&_a]:![color:#062a27] [&_a]:![border-color:#14b8a6] [&_button]:![background:#14b8a6] [&_button]:![color:#062a27] [&_button]:![border-color:#14b8a6] [&_a:hover]:![background:#2dd4bf] [&_a:hover]:![color:#042f2e] [&_button:hover]:![background:#2dd4bf] [&_button:hover]:![color:#042f2e] [padding:22px] [border-radius:14px] [background:linear-gradient(_135deg,_#111827,_#0f172a_)] [&_h2]:[margin-bottom:16px] [&_p]:[margin:6px_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] [&_strong]:[color:#f8fafc] [&_strong]:[font-size:16px]">

        <div className="owner-content [max-width:1100px] [margin:auto] [display:flex] [align-items:center] [justify-content:space-between] [gap:40px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:38px] [&_h2]:[line-height:1.15] [&_h2]:[margin:10px_0_15px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6] [&_p]:[max-width:600px] max-[650px]:[flex-direction:column] max-[650px]:[align-items:flex-start]">

          <div>

            <p className="owner-label [color:#2dd4bf] [font-size:12px] [font-weight:800] [letter-spacing:2px]">
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
            className="owner-btn [background:#14b8a6] [color:#042f2e] [text-decoration:none] [padding:14px_22px] [border-radius:9px] [font-weight:700] [white-space:nowrap] [transition:background_0.2s_ease,_transform_0.2s_ease] hover:[background:#2dd4bf] hover:[transform:translateY(-2px)]"
          >
            List Your Property →
          </Link>

        </div>

      </section>


      {/* ================================
          FINAL CTA
      ================================= */}

      <section className="final-cta [text-align:center] [padding:100px_20px] [background:radial-gradient(_circle_at_center,_rgba(20,_184,_166,_0.2),_transparent_45%_),_#0b1120] [&_p]:[color:#5eead4] [&_p]:[font-size:12px] [&_p]:[font-weight:800] [&_p]:[letter-spacing:2px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:44px] [&_h2]:[line-height:1.15] [&_h2]:[margin:15px_0_30px] max-[650px]:[&_h2]:[font-size:34px]">

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
          className="primary-btn [display:inline-block] [text-decoration:none] [padding:13px_22px] [border-radius:9px] [font-weight:700] [transition:transform_0.2s_ease,_background_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] [background:#14b8a6] [color:#042f2e] [box-shadow:0_8px_25px_rgba(20,_184,_166,_0.2)] hover:[transform:translateY(-2px)] hover:[background:#2dd4bf] hover:[box-shadow:0_12px_30px_rgba(20,_184,_166,_0.3)]"
        >
          Explore Properties
        </Link>

      </section>

    </div>
  );
}

export default HomePage;