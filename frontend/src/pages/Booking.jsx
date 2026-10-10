import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import "./Booking.css";

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
      <main className="booking-page">
        <div className="booking-card booking-loading">Loading booking details...</div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="booking-page">
        <div className="booking-card">
          <p className="booking-error">{error || "Property could not be found."}</p>
          <Link className="booking-back-link" to="/properties">Back to properties</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-card">
        <Link className="booking-back-link" to={"/properties/" + id}>← Back to property</Link>
        <span className="booking-eyebrow">SECURE PG BOOKING</span>
        <h1>Reserve your stay</h1>
        <p className="booking-subtitle">
          Review the token and move-in date before continuing to secure checkout.
        </p>

        <section className="booking-property">
          <div>
            <h2>{property.title}</h2>
            <p>{[property.area, property.city].filter(Boolean).join(", ")}</p>
          </div>
          <div className="booking-availability">
            {property.availableRooms > 0
              ? property.availableRooms + " rooms available"
              : "No rooms available"}
          </div>
        </section>

        {success ? (
          <div className="booking-success">
            <div className="booking-success-icon">✓</div>
            <h2>Booking confirmed</h2>
            <p>{success}</p>
            {bookingId && <small>Booking reference: {bookingId}</small>}
            <Link className="booking-primary-link" to={"/properties/" + id}>
              Return to property
            </Link>
          </div>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit}>
            {error && <div className="booking-error">{error}</div>}
            <label htmlFor="booking-move-in">Preferred move-in date</label>
            <input
              id="booking-move-in"
              type="date"
              value={moveInDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setMoveInDate(event.target.value)}
              required
            />

            <div className="booking-token-row">
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

            <p className="booking-note">
              Booking tokens are set in the backend environment. Your booking is confirmed only after the server verifies a captured payment.
            </p>

            <button
              type="submit"
              className="booking-pay-button"
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