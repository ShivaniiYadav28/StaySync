import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load secure checkout."));
    document.body.appendChild(script);
  });

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [tokenAmount, setTokenAmount] = useState(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (user?.role !== "seeker") {
      navigate("/properties/" + id, { replace: true });
      return;
    }

    let active = true;
    const loadData = async () => {
      try {
        const [propertyResponse, configResponse] = await Promise.all([
          api.get("/properties/" + id),
          api.get("/bookings/config"),
        ]);
        if (!active) return;
        setProperty(propertyResponse.data?.property || null);
        setTokenAmount(configResponse.data?.tokenAmount ?? null);
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message || "Unable to load booking details.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, navigate, user?.role]);

  const cancelPendingBooking = (pendingBookingId) =>
    api.post("/bookings/" + pendingBookingId + "/cancel").catch(() => {});

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (paying || !moveInDate) return;

    try {
      setPaying(true);
      setError("");
      setSuccess("");
      await loadRazorpay();

      const response = await api.post(
        "/bookings/property/" + id + "/order",
        { moveInDate }
      );
      const data = response.data;
      setBookingId(data.bookingId);

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "StaySync",
        description: "Booking token for " + (property?.title || "PG"),
        order_id: data.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#14b8a6" },
        handler: async (payment) => {
          try {
            const verified = await api.post(
              "/bookings/" + data.bookingId + "/verify",
              payment
            );
            setBookingId(data.bookingId);
            setSuccess(verified.data?.message || "Booking confirmed.");
          } catch (verifyError) {
            setError(
              verifyError.response?.data?.message ||
                "Payment was received, but confirmation failed. Keep your payment ID and contact support."
            );
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await cancelPendingBooking(data.bookingId);
            setPaying(false);
          },
        },
      });

      checkout.on("payment.failed", async (failure) => {
        await cancelPendingBooking(data.bookingId);
        setError(failure.error?.description || "Payment did not complete. You can try again.");
        setPaying(false);
      });

      checkout.open();
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
          submitError.message ||
          "Unable to start payment."
      );
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="booking-page [min-height:calc(100vh_-_74px)] [padding:48px_20px] [display:flex] [align-items:flex-start] [justify-content:center] [background:radial-gradient(circle_at_15%_15%,_rgba(20,_184,_166,_0.11),_transparent_32%),_#070d1b] [color:#f8fafc] [box-sizing:border-box] max-[600px]:[min-height:calc(100vh_-_68px)] max-[600px]:[padding:24px_14px]">
        <div className="booking-card booking-loading [width:min(100%,_760px)] [padding:32px] [border:1px_solid_rgba(148,_163,_184,_0.17)] [border-radius:22px] [background:linear-gradient(145deg,_#111c30,_#0d1526)] [box-shadow:0_24px_70px_rgba(0,_0,_0,_0.3)] [&_h1]:[margin:10px_0_0] [&_h1]:[font-size:clamp(28px,_5vw,_40px)] [&_h1]:[letter-spacing:-0.04em] max-[600px]:[padding:23px_18px] max-[600px]:[border-radius:18px] [color:#94a3b8] [text-align:center]">Loading booking details...</div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="booking-page [min-height:calc(100vh_-_74px)] [padding:48px_20px] [display:flex] [align-items:flex-start] [justify-content:center] [background:radial-gradient(circle_at_15%_15%,_rgba(20,_184,_166,_0.11),_transparent_32%),_#070d1b] [color:#f8fafc] [box-sizing:border-box] max-[600px]:[min-height:calc(100vh_-_68px)] max-[600px]:[padding:24px_14px]">
        <div className="booking-card [width:min(100%,_760px)] [padding:32px] [border:1px_solid_rgba(148,_163,_184,_0.17)] [border-radius:22px] [background:linear-gradient(145deg,_#111c30,_#0d1526)] [box-shadow:0_24px_70px_rgba(0,_0,_0,_0.3)] [&_h1]:[margin:10px_0_0] [&_h1]:[font-size:clamp(28px,_5vw,_40px)] [&_h1]:[letter-spacing:-0.04em] max-[600px]:[padding:23px_18px] max-[600px]:[border-radius:18px]">
          <p className="booking-error [padding:12px_14px] [border:1px_solid_rgba(248,_113,_113,_0.3)] [border-radius:10px] [background:rgba(127,_29,_29,_0.17)] [color:#fca5a5] [font-size:13px]">{error || "Property could not be found."}</p>
          <Link className="booking-back-link [display:inline-flex] [margin-bottom:30px] [color:#5eead4] [font-size:14px] [font-weight:700] [text-decoration:none] hover:[color:#99f6e4]" to="/properties">Back to properties</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page [min-height:calc(100vh_-_74px)] [padding:48px_20px] [display:flex] [align-items:flex-start] [justify-content:center] [background:radial-gradient(circle_at_15%_15%,_rgba(20,_184,_166,_0.11),_transparent_32%),_#070d1b] [color:#f8fafc] [box-sizing:border-box] max-[600px]:[min-height:calc(100vh_-_68px)] max-[600px]:[padding:24px_14px]">
      <div className="booking-card [width:min(100%,_760px)] [padding:32px] [border:1px_solid_rgba(148,_163,_184,_0.17)] [border-radius:22px] [background:linear-gradient(145deg,_#111c30,_#0d1526)] [box-shadow:0_24px_70px_rgba(0,_0,_0,_0.3)] [&_h1]:[margin:10px_0_0] [&_h1]:[font-size:clamp(28px,_5vw,_40px)] [&_h1]:[letter-spacing:-0.04em] max-[600px]:[padding:23px_18px] max-[600px]:[border-radius:18px]">
        <Link className="booking-back-link [display:inline-flex] [margin-bottom:30px] [color:#5eead4] [font-size:14px] [font-weight:700] [text-decoration:none] hover:[color:#99f6e4]" to={"/properties/" + id}>← Back to property</Link>
        <span className="booking-eyebrow [display:block] [color:#2dd4bf] [font-size:11px] [font-weight:800] [letter-spacing:0.16em]">SECURE PG BOOKING</span>
        <h1>Reserve your stay</h1>
        <p className="booking-subtitle [margin:10px_0_26px] [color:#94a3b8] [line-height:1.6]">
          Review the token and move-in date before continuing to secure checkout.
        </p>

        <section className="booking-property [display:flex] [align-items:center] [justify-content:space-between] [gap:18px] [padding:18px] [border:1px_solid_#29384f] [border-radius:15px] [background:rgba(15,_23,_42,_0.72)] [&_h2]:[margin:0] [&_h2]:[font-size:18px] [&_p]:[margin:6px_0_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:13px] max-[600px]:[align-items:flex-start] max-[600px]:[flex-direction:column]">
          <div>
            <h2>{property.title}</h2>
            <p>{[property.area, property.city].filter(Boolean).join(", ")}</p>
          </div>
          <div className="booking-availability [flex-shrink:0] [padding:7px_10px] [border:1px_solid_rgba(45,_212,_191,_0.22)] [border-radius:999px] [background:rgba(20,_184,_166,_0.1)] [color:#5eead4] [font-size:11px] [font-weight:700]">
            {property.availableRooms > 0
              ? property.availableRooms + " rooms available"
              : "No rooms available"}
          </div>
        </section>

        {success ? (
          <div className="booking-success [padding:35px_12px_10px] [text-align:center] [&_h2]:[margin:0] [&_h2]:[font-size:26px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6] [&_small]:[display:block] [&_small]:[margin:14px_0_22px] [&_small]:[color:#64748b] [&_small]:[overflow-wrap:anywhere]">
            <div className="booking-success-icon [display:grid] [width:58px] [height:58px] [margin:0_auto_15px] [place-items:center] [border-radius:50%] [background:rgba(16,_185,_129,_0.13)] [color:#34d399] [font-size:30px]">✓</div>
            <h2>Booking confirmed</h2>
            <p>{success}</p>
            {bookingId && <small>Booking reference: {bookingId}</small>}
            <Link className="booking-primary-link [display:inline-flex] [min-height:50px] [align-items:center] [justify-content:center] [border:0] [border-radius:11px] [background:linear-gradient(100deg,_#0d9488,_#14b8a6)] [color:#052e2b] [font-size:14px] [font-weight:800] [text-decoration:none] [cursor:pointer] [transition:transform_0.18s_ease,_filter_0.18s_ease] hover:[transform:translateY(-1px)] hover:[filter:brightness(1.08)] [width:100%]" to={"/properties/" + id}>
              Return to property
            </Link>
          </div>
        ) : (
          <form className="booking-form [display:grid] [gap:12px] [margin-top:26px] [&_label]:[color:#e2e8f0] [&_label]:[font-size:13px] [&_label]:[font-weight:700] [&_input]:[width:100%] [&_input]:[min-height:48px] [&_input]:[padding:0_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:10px] [&_input]:[outline:none] [&_input]:[background:#0b1424] [&_input]:[color:#f8fafc] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.12)]" onSubmit={handleSubmit}>
            {error && <div className="booking-error [padding:12px_14px] [border:1px_solid_rgba(248,_113,_113,_0.3)] [border-radius:10px] [background:rgba(127,_29,_29,_0.17)] [color:#fca5a5] [font-size:13px]">{error}</div>}
            <label htmlFor="booking-move-in">Preferred move-in date</label>
            <input
              id="booking-move-in"
              type="date"
              value={moveInDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setMoveInDate(event.target.value)}
              required
            />

            <div className="booking-token-row [display:flex] [align-items:center] [justify-content:space-between] [gap:15px] [margin-top:8px] [padding:17px] [border:1px_solid_rgba(45,_212,_191,_0.24)] [border-radius:13px] [background:rgba(20,_184,_166,_0.07)] [&_span]:[display:block] [&_small]:[display:block] [&_span]:[color:#e2e8f0] [&_span]:[font-weight:700] [&_small]:[margin-top:5px] [&_small]:[color:#94a3b8] [&_small]:[font-size:11px] [&_strong]:[color:#5eead4] [&_strong]:[font-size:22px] [&_strong]:[white-space:nowrap]">
              <div>
                <span>Booking token</span>
                <small>Charged once to request this PG booking</small>
              </div>
              <strong>
                {tokenAmount === null
                  ? "Not configured"
                  : "₹" + Number(tokenAmount).toLocaleString("en-IN")}
              </strong>
            </div>

            <p className="booking-note [margin:0] [color:#94a3b8] [font-size:12px] [line-height:1.6]">
              Booking tokens are set in the backend environment. Your booking is confirmed only after the server verifies a captured payment.
            </p>

            <button
              type="submit"
              className="booking-pay-button [display:inline-flex] [min-height:50px] [align-items:center] [justify-content:center] [border:0] [border-radius:11px] [background:linear-gradient(100deg,_#0d9488,_#14b8a6)] [color:#052e2b] [font-size:14px] [font-weight:800] [text-decoration:none] [cursor:pointer] [transition:transform_0.18s_ease,_filter_0.18s_ease] hover:not:(disabled:)[transform:translateY(-1px)] hover:not:(disabled:)[filter:brightness(1.08)] disabled:[opacity:0.55] disabled:[cursor:not-allowed]"
              disabled={paying || !moveInDate || !tokenAmount || property.availableRooms < 1}
            >
              {paying
                ? "Opening secure checkout..."
                : tokenAmount
                  ? "Pay token and book"
                  : "Booking payment unavailable"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default Booking;