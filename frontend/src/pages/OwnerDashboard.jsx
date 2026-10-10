import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const bookingStatusDetails = {
  pending: {
    label: "Payment in progress",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    description: "The customer started checkout; payment is not confirmed yet.",
  },
  processing: {
    label: "Confirming payment",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    description: "StaySync is verifying the payment.",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-500/15 text-green-300 border-green-500/30",
    description: "Payment was verified and the booking is confirmed.",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-500/15 text-gray-300 border-gray-500/30",
    description: "Checkout was cancelled.",
  },
  refund_pending: {
    label: "Refund pending",
    className: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    description: "The room became unavailable; the refund is being handled.",
  },
  refunded: {
    label: "Refunded",
    className: "bg-gray-500/15 text-gray-300 border-gray-500/30",
    description: "The payment was refunded.",
  },
};

const formatBookingDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/properties/my-properties"
      );

      if (Array.isArray(response.data)) {
        setProperties(response.data);
      } else if (
        Array.isArray(response.data.properties)
      ) {
        setProperties(response.data.properties);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error(
        "Error fetching owner properties:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load your properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  useEffect(() => {
    let active = true;

    const loadBookings = async (showLoading = false) => {
      try {
        if (showLoading && active) setBookingsLoading(true);
        const response = await api.get("/bookings/owner");
        if (active) {
          setBookings(
            Array.isArray(response.data?.bookings)
              ? response.data.bookings
              : []
          );
          setBookingsError("");
        }
      } catch (err) {
        if (active) {
          setBookingsError(
            err.response?.data?.message || "Could not load bookings."
          );
        }
      } finally {
        if (showLoading && active) setBookingsLoading(false);
      }
    };

    loadBookings(true);
    const refreshTimer = window.setInterval(() => loadBookings(), 15000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const stats = useMemo(() => {
    const totalProperties = properties.length;

    const totalRooms = properties.reduce(
      (sum, property) =>
        sum + Number(property.totalRooms || 0),
      0
    );

    const availableRooms = properties.reduce(
      (sum, property) =>
        sum + Number(property.availableRooms || 0),
      0
    );

    const occupiedRooms = Math.max(
      0,
      totalRooms - availableRooms
    );

    const averageRent =
      totalProperties > 0
        ? Math.round(
            properties.reduce(
              (sum, property) =>
                sum + Number(property.rent || 0),
              0
            ) / totalProperties
          )
        : 0;

    const occupancy =
      totalRooms > 0
        ? Math.round(
            (occupiedRooms / totalRooms) * 100
          )
        : 0;

    return {
      totalProperties,
      totalRooms,
      availableRooms,
      occupiedRooms,
      averageRent,
      occupancy,
    };
  }, [properties]);

  const handleAddProperty = () => {
    navigate("/owner/add-property");
  };

  const handleViewProperty = (id) => {
    navigate(`/properties/${id}`);
  };

  const handleEditProperty = (id) => {
    navigate(`/owner/properties/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-[#080d1d] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <p className="text-cyan-400 font-semibold tracking-[0.25em] text-sm">
              STAYSYNC OWNER
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              Owner Dashboard
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Welcome back,{" "}
              <span className="text-white font-semibold">
                {user?.name || "Owner"}
              </span>
              . Manage your properties from one place.
            </p>
          </div>

          <button
            onClick={handleAddProperty}
            className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-cyan-500/10"
          >
            + Add Property
          </button>
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    Total Properties
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {stats.totalProperties}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl">
                  🏠
                </div>
              </div>
            </div>

            <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    Total Rooms
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {stats.totalRooms}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                  🛏️
                </div>
              </div>
            </div>

            <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    Available Rooms
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {stats.availableRooms}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    Occupancy
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {stats.occupancy}%
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
                  📊
                </div>
              </div>
            </div>

          </div>
        )}

        <section className="bg-[#11182b] border border-gray-700 rounded-2xl p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold">Booking activity</h2>
              <p className="text-gray-400 text-sm mt-1">
                New bookings appear here. This list refreshes automatically every 15 seconds.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-cyan-500/10 text-cyan-300 px-3 py-1 text-sm font-semibold">
              {bookings.filter((booking) => ["pending", "processing"].includes(booking.status)).length} in progress
            </span>
          </div>

          {bookingsLoading ? (
            <p className="text-gray-400">Loading bookings...</p>
          ) : bookingsError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
              <p className="text-red-300">{bookingsError}</p>
              <button
                type="button"
                onClick={() => {
                  setBookingsLoading(true);
                  api.get("/bookings/owner")
                    .then((response) => {
                      setBookings(Array.isArray(response.data?.bookings) ? response.data.bookings : []);
                      setBookingsError("");
                    })
                    .catch((err) => setBookingsError(err.response?.data?.message || "Could not load bookings."))
                    .finally(() => setBookingsLoading(false));
                }}
                className="mt-3 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-semibold"
              >
                Try again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-[#080d1d] p-6 text-center">
              <p className="font-semibold">No bookings yet</p>
              <p className="text-gray-400 text-sm mt-1">
                When someone starts booking one of your properties, it will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const status = bookingStatusDetails[booking.status] || {
                  label: booking.status || "Unknown",
                  className: "bg-gray-500/15 text-gray-300 border-gray-500/30",
                  description: "Booking status update.",
                };

                return (
                  <article
                    key={booking._id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-gray-800 bg-[#080d1d] p-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold">
                          {booking.seeker?.name || "Guest"}
                        </h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-2">
                        {booking.property?.title || "Property unavailable"}
                        {booking.property?.city ? ` · ${booking.property.city}` : ""}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">{status.description}</p>
                    </div>
                    <div className="text-sm text-gray-400 md:text-right">
                      <p>Move-in: <span className="text-white">{formatBookingDate(booking.moveInDate)}</span></p>
                      <p className="mt-1">Started: {formatBookingDate(booking.createdAt)}</p>
                      <p className="mt-1">Token: ₹{Number(booking.tokenAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

            <div className="lg:col-span-2 bg-[#11182b] border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold">
                    Property Performance
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Overview of your current listings.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-[#080d1d] rounded-xl p-5 border border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Occupied Rooms
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {stats.occupiedRooms}
                  </p>
                </div>

                <div className="bg-[#080d1d] rounded-xl p-5 border border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Average Rent
                  </p>

                  <p className="text-2xl font-bold mt-2 text-cyan-400">
                    ₹{stats.averageRent.toLocaleString("en-IN")}
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    per month
                  </p>
                </div>

                <div className="bg-[#080d1d] rounded-xl p-5 border border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Available
                  </p>

                  <p className="text-2xl font-bold mt-2 text-green-400">
                    {stats.availableRooms}
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    rooms ready
                  </p>
                </div>

              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">
                    Occupancy Rate
                  </span>

                  <span className="text-white font-semibold text-sm">
                    {stats.occupancy}%
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.occupancy}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-5">
                Quick Actions
              </h2>

              <div className="space-y-3">

                <button
                  onClick={handleAddProperty}
                  className="w-full flex items-center gap-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl px-4 py-3 font-semibold transition"
                >
                  <span>➕</span>
                  Add New Property
                </button>

                <Link
                  to="/owner/my-properties"
                  className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 font-semibold transition"
                >
                  <span>🏠</span>
                  Manage Properties
                </Link>

                <Link
                  to="/owner/inquiries"
                  className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 font-semibold transition"
                >
                  <span>📩</span>
                  View Inquiries
                </Link>

                <Link
                  to="/messages"
                  className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 font-semibold transition"
                >
                  <span>💬</span>
                  Open Messages
                </Link>

              </div>
            </div>

          </div>
        )}

        {loading && (
          <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-10 text-center">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-400">
              Loading your dashboard...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-6">
            <p className="text-red-400">
              {error}
            </p>

            <button
              onClick={fetchMyProperties}
              className="mt-4 bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          properties.length === 0 && (
            <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-5">
                🏠
              </div>

              <h2 className="text-2xl font-bold mb-2">
                No Properties Yet
              </h2>

              <p className="text-gray-400 mb-7">
                Start by adding your first property to StaySync.
              </p>

              <button
                onClick={handleAddProperty}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold transition"
              >
                + Add Your First Property
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          properties.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-bold">
                    Your Properties
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Manage and monitor your current listings.
                  </p>
                </div>

                <Link
                  to="/owner/my-properties"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm"
                >
                  View All Properties →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {properties.map((property) => {
                  const imageUrl =
                    property.images?.[0]?.url || "";

                  const totalRooms =
                    Number(property.totalRooms || 0);

                  const availableRooms =
                    Number(property.availableRooms || 0);

                  const occupiedRooms = Math.max(
                    0,
                    totalRooms - availableRooms
                  );

                  const propertyOccupancy =
                    totalRooms > 0
                      ? Math.round(
                          (occupiedRooms /
                            totalRooms) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={property._id}
                      className="bg-[#11182b] border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:border-cyan-500/40 transition"
                    >
                      <div className="relative w-full h-56 bg-gradient-to-br from-[#18233b] to-[#0b1122]">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              property.title ||
                              "Property"
                            }
                            className="w-full h-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";

                              const fallback =
                                event.currentTarget
                                  .nextElementSibling;

                              if (fallback) {
                                fallback.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={`absolute inset-0 ${
                            imageUrl
                              ? "hidden"
                              : "flex"
                          } items-center justify-center flex-col`}
                        >
                          <div className="text-4xl mb-2">
                            🏠
                          </div>

                          <span className="text-gray-400 text-sm">
                            No Image Available
                          </span>
                        </div>

                        <div className="absolute top-4 right-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              property.isActive === false
                                ? "bg-red-500/90 text-white"
                                : "bg-green-500/90 text-white"
                            }`}
                          >
                            {property.isActive === false
                              ? "Inactive"
                              : "Active"}
                          </span>
                        </div>

                      </div>

                      <div className="p-5">

                        <h3 className="text-xl font-bold truncate">
                          {property.title ||
                            "Untitled Property"}
                        </h3>

                        <p className="text-gray-400 text-sm mt-2">
                          📍{" "}
                          {property.area
                            ? `${property.area}, `
                            : ""}
                          {property.city || "Location unavailable"}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {property.propertyType && (
                            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                              🏠 {property.propertyType}
                            </span>
                          )}

                          {property.roomType && (
                            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                              🛏️ {property.roomType}
                            </span>
                          )}

                          {property.gender && (
                            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                              👤 {property.gender}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-end justify-between">
                          <div>
                            <p className="text-cyan-400 text-xl font-bold">
                              ₹
                              {Number(
                                property.rent || 0
                              ).toLocaleString("en-IN")}
                            </p>

                            <p className="text-gray-500 text-xs">
                              per month
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {availableRooms}
                            </p>

                            <p className="text-gray-500 text-xs">
                              rooms available
                            </p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400">
                              Occupancy
                            </span>

                            <span className="text-gray-300">
                              {propertyOccupancy}%
                            </span>
                          </div>

                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full"
                              style={{
                                width: `${propertyOccupancy}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">

                          <button
                            onClick={() =>
                              handleViewProperty(
                                property._id
                              )
                            }
                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-2.5 rounded-lg font-semibold transition"
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              handleEditProperty(
                                property._id
                              )
                            }
                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 py-2.5 rounded-lg font-semibold transition"
                          >
                            Edit
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default OwnerDashboard;
