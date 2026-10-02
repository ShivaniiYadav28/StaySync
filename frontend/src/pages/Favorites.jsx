import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/useAuth";

import "./Favorites.css";

function Favorites() {
  const { user } = useAuth();

  const [favorites, setFavorites] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState(null);

  /*
  ========================================
  LOAD FAVORITES
  ========================================
  */

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/favorites");

        if (isMounted) {
          setFavorites(
            response.data.favorites || []
          );
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setError(
            error.response?.data?.message ||
              "Unable to load your favorites."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  ========================================
  REMOVE FAVORITE
  ========================================
  */

  const handleRemoveFavorite = async (
    propertyId
  ) => {
    try {
      setRemovingId(propertyId);

      await api.delete(
        `/favorites/${propertyId}`
      );

      setFavorites((previous) =>
        previous.filter(
          (favorite) =>
            favorite.property?._id !==
            propertyId
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  };

  /*
  ========================================
  ROLE CHECK
  ========================================
  */

  if (user?.role !== "seeker") {
    return (
      <div className="favorites-page">
        <div className="favorites-container">
          <div className="favorites-message">
            <h2>
              Favorites are available
              for seekers.
            </h2>

            <Link
              to="/properties"
              className="favorites-primary-button"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">

          <div className="favorites-message">
            Loading your favorites...
          </div>

        </div>
      </div>
    );
  }

  /*
  ========================================
  ERROR
  ========================================
  */

  if (error) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">

          <div className="favorites-message favorites-error">
            {error}
          </div>

        </div>
      </div>
    );
  }

  /*
  ========================================
  EMPTY STATE
  ========================================
  */

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">

        <div className="favorites-container">

          <div className="favorites-header">

            <div>
              <p className="favorites-label">
                STAYSYNC
              </p>

              <h1>
                My Favorites
              </h1>

              <p>
                Properties you save will
                appear here.
              </p>
            </div>

          </div>

          <div className="favorites-empty">

            <div className="favorites-empty-icon">
              ♡
            </div>

            <h2>
              No saved properties yet
            </h2>

            <p>
              Explore properties and
              save the ones you like.
            </p>

            <Link
              to="/properties"
              className="favorites-primary-button"
            >
              Find a Stay
            </Link>

          </div>

        </div>

      </div>
    );
  }

  /*
  ========================================
  FAVORITES LIST
  ========================================
  */

  return (
    <div className="favorites-page">

      <div className="favorites-container">

        {/* HEADER */}

        <div className="favorites-header">

          <div>

            <p className="favorites-label">
              STAYSYNC
            </p>

            <h1>
              My Favorites
            </h1>

            <p>
              Your saved properties in
              one place.
            </p>

          </div>

          <div className="favorites-count">
            {favorites.length}{" "}
            {favorites.length === 1
              ? "property"
              : "properties"}
          </div>

        </div>

        {/* GRID */}

        <div className="favorites-grid">

          {favorites.map(
            (favorite) => {
              const property =
                favorite.property;

              if (!property) {
                return null;
              }

              const hasImage =
                property.images &&
                property.images.length >
                  0;

              const imageUrl =
                hasImage
                  ? property.images[0].url
                  : null;

              return (
                <article
                  className="favorite-card"
                  key={favorite._id}
                >

                  {/* IMAGE */}

                  <div className="favorite-card-image">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={
                          property.title
                        }
                      />
                    ) : (
                      <div className="favorite-image-fallback">

                        <span>
                          🏠
                        </span>

                        <p>
                          No property image
                        </p>

                      </div>
                    )}

                    <span className="favorite-property-type">
                      {property.propertyType}
                    </span>

                    <button
                      type="button"
                      className="favorite-remove-button"
                      onClick={() =>
                        handleRemoveFavorite(
                          property._id
                        )
                      }
                      disabled={
                        removingId ===
                        property._id
                      }
                      aria-label="Remove from favorites"
                      title="Remove from favorites"
                    >
                      ♥
                    </button>

                  </div>

                  {/* CONTENT */}

                  <div className="favorite-card-content">

                    <div className="favorite-card-top">

                      <h2>
                        {property.title}
                      </h2>

                      <div className="favorite-price">
                        ₹{property.rent}
                        <span>
                          /month
                        </span>
                      </div>

                    </div>

                    <p className="favorite-location">
                      📍 {property.area},{" "}
                      {property.city}
                    </p>

                    <div className="favorite-tags">

                      <span>
                        {property.roomType}
                      </span>

                      <span>
                        {property.gender}
                      </span>

                      <span>
                        {
                          property.availableRooms
                        }{" "}
                        rooms left
                      </span>

                    </div>

                    <Link
                      to={`/properties/${property._id}`}
                      className="favorite-view-button"
                    >
                      View Property
                    </Link>

                  </div>

                </article>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}

export default Favorites;