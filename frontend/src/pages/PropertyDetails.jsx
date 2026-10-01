import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./PropertyDetails.css";

function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/properties/${id}`
        );

        if (isMounted) {
          setProperty(
            response.data.property
          );

          setSelectedImage(0);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setError(
            error.response?.data?.message ||
              "Property could not be found."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="details-state">
        Loading property...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="details-state error">
        {error || "Property not found."}
      </div>
    );
  }

  const images = property.images || [];

  const hasImages =
    images.length > 0;

  const currentImage =
    images[selectedImage];

  const showPreviousImage = () => {
    setSelectedImage((previous) =>
      previous === 0
        ? images.length - 1
        : previous - 1
    );
  };

  const showNextImage = () => {
    setSelectedImage((previous) =>
      previous === images.length - 1
        ? 0
        : previous + 1
    );
  };

  return (
    <div className="property-details-page">
      <div className="details-container">

        <Link
          to="/properties"
          className="back-link"
        >
          ← Back to properties
        </Link>

        <div className="details-card">

          {/* ========================= */}
          {/* PROPERTY IMAGE GALLERY */}
          {/* ========================= */}

          <div className="details-gallery">

            <div className="details-main-image">

              {hasImages ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={`${property.title} ${
                      selectedImage + 1
                    }`}
                  />

                  <span className="property-type-badge">
                    {property.propertyType}
                  </span>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-left"
                        onClick={
                          showPreviousImage
                        }
                        aria-label="Previous image"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-right"
                        onClick={
                          showNextImage
                        }
                        aria-label="Next image"
                      >
                        ›
                      </button>

                      <div className="image-counter">
                        {selectedImage + 1} /{" "}
                        {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="no-image-placeholder">
                    <span className="no-image-icon">
                      🏠
                    </span>

                    <span>
                      No property image
                    </span>
                  </div>

                  <span className="property-type-badge">
                    {property.propertyType}
                  </span>
                </>
              )}

            </div>

            {/* THUMBNAILS */}

            {images.length > 1 && (
              <div className="image-thumbnails">

                {images.map(
                  (image, index) => (
                    <button
                      type="button"
                      key={
                        image._id ||
                        image.publicId ||
                        index
                      }
                      className={`image-thumbnail ${
                        selectedImage === index
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedImage(index)
                      }
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* ========================= */}
          {/* PROPERTY INFORMATION */}
          {/* ========================= */}

          <div className="details-content">

            <div className="details-title">

              <div>
                <h1>
                  {property.title}
                </h1>

                <p>
                  📍 {property.address},{" "}
                  {property.area},{" "}
                  {property.city} -{" "}
                  {property.pincode}
                </p>
              </div>

              <div className="details-price">
                ₹{property.rent}

                <small>
                  /month
                </small>
              </div>

            </div>

            <div className="details-grid">

              <div>
                <span>
                  Property
                </span>

                <strong>
                  {property.propertyType}
                </strong>
              </div>

              <div>
                <span>
                  Suitable for
                </span>

                <strong>
                  {property.gender}
                </strong>
              </div>

              <div>
                <span>
                  Room
                </span>

                <strong>
                  {property.roomType}
                </strong>
              </div>

              <div>
                <span>
                  Deposit
                </span>

                <strong>
                  ₹{property.deposit}
                </strong>
              </div>

              <div>
                <span>
                  Available
                </span>

                <strong>
                  {property.availableRooms}{" "}
                  rooms
                </strong>
              </div>

            </div>

            <section>
              <h2>
                About this place
              </h2>

              <p className="details-description">
                {property.description}
              </p>
            </section>

            <section>
              <h2>
                Amenities
              </h2>

              <div className="amenities">

                {property.amenities?.map(
                  (amenity, index) => (
                    <span key={index}>
                      ✓ {amenity}
                    </span>
                  )
                )}

              </div>
            </section>

            <section>
              <h2>
                House rules
              </h2>

              <ul className="rules">

                {property.rules?.map(
                  (rule, index) => (
                    <li key={index}>
                      {rule}
                    </li>
                  )
                )}

              </ul>
            </section>

            {property.owner && (
              <section className="owner-section">

                <h2>
                  Listed by
                </h2>

                <p>
                  <strong>
                    {property.owner.name}
                  </strong>
                </p>

                <p>
                  {property.owner.email}
                </p>

              </section>
            )}

            <button
              className="inquiry-btn"
              type="button"
            >
              Contact Owner
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default PropertyDetails;