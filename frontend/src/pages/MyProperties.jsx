import React, { useEffect, useState } from "react";
import api from "../services/api";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/properties/my-properties"
      );

      console.log(
        "My Properties response:",
        response.data
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
        "Error fetching my properties:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      if (err.response?.status === 401) {
        setError(
          "Your login session is invalid or expired. Please login again."
        );
      } else if (err.response?.status === 404) {
        setError(
          "My Properties API route was not found."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load your properties."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handleAddProperty = () => {
    window.location.href =
      "/owner/add-property";
  };

  const handleViewProperty = (id) => {
    window.location.href =
      `/properties/${id}`;
  };

  const handleEditProperty = (id) => {
    window.location.href =
      `/owner/properties/${id}/edit`;
  };

  return (
    <div className="min-h-screen bg-[#080d1d] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">
          <p className="text-cyan-400 font-semibold tracking-widest text-sm">
            STAYSYNC OWNER
          </p>

          <h1 className="text-4xl font-bold mt-2">
            My Properties
          </h1>

          <p className="text-gray-400 mt-2">
            Manage the properties you have listed on
            StaySync.
          </p>
        </div>

        <button
          onClick={handleAddProperty}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold transition mb-8"
        >
          + Add Property
        </button>

        {loading && (
          <div className="bg-[#11182b] border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              Loading your properties...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-5">
            <p className="text-red-400">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          properties.length === 0 && (
            <div className="bg-[#11182b] border border-gray-700 rounded-xl p-10 text-center">
              <h2 className="text-xl font-semibold mb-2">
                No Properties Found
              </h2>

              <p className="text-gray-400 mb-6">
                You haven't listed any properties yet.
              </p>

              <button
                onClick={handleAddProperty}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold"
              >
                + Add Your First Property
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {properties.map((property) => (
                <div
                  key={property._id}
                  className="bg-[#11182b] border border-gray-700 rounded-xl overflow-hidden shadow-lg"
                >

                  <div className="w-full h-64 bg-gray-800">

                    {property.images &&
                    property.images.length > 0 &&
                    property.images[0].url ? (
                      <img
                        src={property.images[0].url}
                        alt={
                          property.title ||
                          "Property"
                        }
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            property.images[0].url
                          );

                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">
                          No Image Available
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="p-5">

                    <h2 className="text-xl font-bold mb-2">
                      {property.title ||
                        "Untitled Property"}
                    </h2>

                    <p className="text-gray-400 mb-2">
                      📍{" "}
                      {property.area
                        ? `${property.area}, `
                        : ""}
                      {property.city || ""}
                    </p>

                    <p className="text-gray-400 mb-2">
                      🏠{" "}
                      {property.propertyType ||
                        "Property"}
                    </p>

                    {property.gender && (
                      <p className="text-gray-400 mb-2">
                        👤 Suitable for:{" "}
                        {property.gender}
                      </p>
                    )}

                    {property.roomType && (
                      <p className="text-gray-400 mb-2">
                        🛏️{" "}
                        {property.roomType}
                      </p>
                    )}

                    <p className="text-cyan-400 font-semibold text-lg mt-3">
                      ₹{property.rent}
                      <span className="text-gray-400 text-sm font-normal">
                        {" "}
                        / month
                      </span>
                    </p>

                    <p className="text-gray-400 text-sm mt-2">
                      Available rooms:{" "}
                      {property.availableRooms ??
                        0}
                    </p>

                    <div className="flex gap-3 mt-5">

                      <button
                        onClick={() =>
                          handleViewProperty(
                            property._id
                          )
                        }
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleEditProperty(
                            property._id
                          )
                        }
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition"
                      >
                        Edit
                      </button>

                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

      </div>
    </div>
  );
};

export default MyProperties;