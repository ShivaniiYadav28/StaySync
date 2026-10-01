import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./MyProperties.css";

function MyProperties() {
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        const response = await api.get(
          "/properties/owner/my-properties"
        );

        if (isMounted) {
          setProperties(
            response.data.properties
          );
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setError(
            error.response?.data?.message ||
              "Unable to load your properties."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const deleteProperty = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/properties/${id}`
      );

      setProperties((previous) =>
        previous.filter(
          (property) =>
            property._id !== id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to delete property."
      );
    }
  };

  if (loading) {
    return (
      <div className="owner-state">
        Loading your properties...
      </div>
    );
  }

  return (
    <div className="my-properties-page">
      <div className="my-properties-container">

        {/* ================================
            HEADER
        ================================= */}

        <div className="owner-header">

          <div>
            <p>
              STAYSYNC OWNER
            </p>

            <h1>
              My Properties
            </h1>

            <span>
              Manage the properties you
              have listed on StaySync.
            </span>
          </div>

          <Link
            to="/owner/add-property"
            className="add-property-btn"
          >
            + Add Property
          </Link>

        </div>


        {/* ================================
            ERROR
        ================================= */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        {/* ================================
            EMPTY STATE
        ================================= */}

        {!error &&
          properties.length === 0 && (
            <div className="empty-properties">

              <h2>
                No properties yet
              </h2>

              <p>
                Add your first property
                to start receiving
                inquiries.
              </p>

              <Link
                to="/owner/add-property"
                className="add-property-btn"
              >
                Add Property
              </Link>

            </div>
          )}


        {/* ================================
            PROPERTY CARDS
        ================================= */}

        <div className="owner-property-grid">

          {properties.map((property) => (
            <div
              className="owner-property-card"
              key={property._id}
            >

              <div className="owner-property-top">

                <span>
                  {property.propertyType}
                </span>

                <span
                  className={
                    property.isActive
                      ? "active"
                      : "inactive"
                  }
                >
                  {property.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>


              <h2>
                {property.title}
              </h2>


              <p>
                📍 {property.area},{" "}
                {property.city}
              </p>


              <strong>
                ₹{property.rent}/month
              </strong>


              <p>
                {property.availableRooms}{" "}
                available rooms
              </p>


              <div className="owner-actions">

                <Link
                  to={`/properties/${property._id}`}
                >
                  View
                </Link>

                <button
                  onClick={() =>
                    deleteProperty(
                      property._id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default MyProperties;