import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { logApiError } from "../services/api";
import { useAuth } from "../context/useAuth";

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
        logApiError("Fetch favorites error:", error);

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
      <div className="favorites-page [min-height:80vh] [background:#0b1120] [padding:45px_20px_70px] max-[600px]:[padding:30px_15px_50px]">
        <div className="favorites-container [max-width:1200px] [margin:0_auto]">
          <div className="favorites-message [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [border:1px_solid_#273449] [border-radius:14px] [padding:55px_25px] [text-align:center] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)]">
            <h2>
              Favorites are available
              for seekers.
            </h2>

            <Link
              to="/properties"
              className="favorites-primary-button [display:inline-block] [padding:11px_20px] [border-radius:8px] [background:#0d9488] [color:#ffffff] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_7px_18px_rgba(20,_184,_166,_0.2)]"
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
      <div className="favorites-page [min-height:80vh] [background:#0b1120] [padding:45px_20px_70px] max-[600px]:[padding:30px_15px_50px]">
        <div className="favorites-container [max-width:1200px] [margin:0_auto]">

          <div className="favorites-message [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [border:1px_solid_#273449] [border-radius:14px] [padding:55px_25px] [text-align:center] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)]">
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
      <div className="favorites-page [min-height:80vh] [background:#0b1120] [padding:45px_20px_70px] max-[600px]:[padding:30px_15px_50px]">
        <div className="favorites-container [max-width:1200px] [margin:0_auto]">

          <div className="favorites-message favorites-error [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [border:1px_solid_#273449] [border-radius:14px] [padding:55px_25px] [text-align:center] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)] [color:#fca5a5] [background:#2a1518] [border-color:#7f1d1d]">
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
      <div className="favorites-page [min-height:80vh] [background:#0b1120] [padding:45px_20px_70px] max-[600px]:[padding:30px_15px_50px]">

        <div className="favorites-container [max-width:1200px] [margin:0_auto]">

          <div className="favorites-header [display:flex] [align-items:flex-end] [justify-content:space-between] [gap:20px] [margin-bottom:30px] [&_h1]:[margin:0_0_8px] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:36px] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:15px] max-[600px]:[flex-direction:column] max-[600px]:[align-items:flex-start] max-[600px]:[&_h1]:[font-size:29px]">

            <div>
              <p className="favorites-label [margin:0_0_7px] [color:#2dd4bf] [font-size:13px] [font-weight:700] [letter-spacing:1.5px]">
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

          <div className="favorites-empty [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [border:1px_solid_#273449] [border-radius:14px] [padding:55px_25px] [text-align:center] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)] [&_h2]:[margin:0_0_8px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:24px] [&_p]:[margin:0_0_22px] [&_p]:[color:#94a3b8] [&_p]:[font-size:15px]">

            <div className="favorites-empty-icon [margin-bottom:15px] [color:#2dd4bf] [font-size:60px] [line-height:1]">
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
              className="favorites-primary-button [display:inline-block] [padding:11px_20px] [border-radius:8px] [background:#0d9488] [color:#ffffff] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_7px_18px_rgba(20,_184,_166,_0.2)]"
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
    <div className="favorites-page [min-height:80vh] [background:#0b1120] [padding:45px_20px_70px] max-[600px]:[padding:30px_15px_50px]">

      <div className="favorites-container [max-width:1200px] [margin:0_auto]">

        {/* HEADER */}

        <div className="favorites-header [display:flex] [align-items:flex-end] [justify-content:space-between] [gap:20px] [margin-bottom:30px] [&_h1]:[margin:0_0_8px] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:36px] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:15px] max-[600px]:[flex-direction:column] max-[600px]:[align-items:flex-start] max-[600px]:[&_h1]:[font-size:29px]">

          <div>

            <p className="favorites-label [margin:0_0_7px] [color:#2dd4bf] [font-size:13px] [font-weight:700] [letter-spacing:1.5px]">
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

          <div className="favorites-count [padding:9px_15px] [border-radius:20px] [background:rgba(20,_184,_166,_0.12)] [border:1px_solid_rgba(45,_212,_191,_0.15)] [color:#5eead4] [font-size:14px] [font-weight:600] [white-space:nowrap]">
            {favorites.length}{" "}
            {favorites.length === 1
              ? "property"
              : "properties"}
          </div>

        </div>

        {/* GRID */}

        <div className="favorites-grid [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:22px] max-[900px]:[grid-template-columns:repeat(2,_1fr)] max-[600px]:[grid-template-columns:1fr]">

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
                  className="favorite-card [overflow:hidden] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [border:1px_solid_#273449] [border-radius:14px] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)] [transition:transform_0.2s_ease,_box-shadow_0.2s_ease,_border-color_0.2s_ease] hover:[transform:translateY(-5px)] hover:[border-color:#0d9488] hover:[box-shadow:0_15px_35px_rgba(0,_0,_0,_0.4)] [&:hover_.favorite-card-image_>_img]:[transform:scale(1.04)]"
                  key={favorite._id}
                >

                  {/* IMAGE */}

                  <div className="favorite-card-image [position:relative] [height:220px] [overflow:hidden] [background:linear-gradient(_135deg,_#172033,_#0f292b_)] [&>_img]:[width:100%] [&>_img]:[height:100%] [&>_img]:[display:block] [&>_img]:[object-fit:cover] [&>_img]:[transition:transform_0.35s_ease] max-[600px]:[height:210px]">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={
                          property.title
                        }
                      />
                    ) : (
                      <div className="favorite-image-fallback [width:100%] [height:100%] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [gap:7px] [color:#94a3b8] [&_span]:[font-size:48px] [&_p]:[margin:0] [&_p]:[font-size:14px] [&_p]:[font-weight:600]">

                        <span>
                          🏠
                        </span>

                        <p>
                          No property image
                        </p>

                      </div>
                    )}

                    <span className="favorite-property-type [position:absolute] [top:14px] [left:14px] [padding:7px_12px] [border-radius:20px] [background:rgba(15,_23,_42,_0.9)] [border:1px_solid_rgba(255,_255,_255,_0.12)] [color:#5eead4] [font-size:12px] [font-weight:700] [box-shadow:0_4px_12px_rgba(0,_0,_0,_0.35)]">
                      {property.propertyType}
                    </span>

                    <button
                      type="button"
                      className="favorite-remove-button [position:absolute] [top:12px] [right:12px] [width:42px] [height:42px] [display:flex] [align-items:center] [justify-content:center] [border:1px_solid_rgba(255,_255,_255,_0.15)] [border-radius:50%] [background:rgba(15,_23,_42,_0.9)] [color:#fb7185] [font-size:21px] [cursor:pointer] [box-shadow:0_5px_15px_rgba(0,_0,_0,_0.35)] [transition:transform_0.2s_ease,_background_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:scale(1.08)] hover:[background:#1e293b] hover:[box-shadow:0_7px_18px_rgba(0,_0,_0,_0.45)] disabled:[opacity:0.6] disabled:[cursor:not-allowed]"
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

                  <div className="favorite-card-content [padding:20px]">

                    <div className="favorite-card-top [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:15px] [margin-bottom:9px] [&_h2]:[margin:0] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:19px] [&_h2]:[line-height:1.3] max-[600px]:[flex-direction:column] max-[600px]:[gap:7px]">

                      <h2>
                        {property.title}
                      </h2>

                      <div className="favorite-price [color:#2dd4bf] [font-size:19px] [font-weight:700] [white-space:nowrap] [&_span]:[margin-left:3px] [&_span]:[color:#64748b] [&_span]:[font-size:12px] [&_span]:[font-weight:400]">
                        ₹{property.rent}
                        <span>
                          /month
                        </span>
                      </div>

                    </div>

                    <p className="favorite-location [margin:0_0_16px] [color:#94a3b8] [font-size:14px]">
                      📍 {property.area},{" "}
                      {property.city}
                    </p>

                    <div className="favorite-tags [display:flex] [flex-wrap:wrap] [gap:7px] [margin-bottom:18px] [&_span]:[padding:6px_9px] [&_span]:[border-radius:6px] [&_span]:[background:#1e293b] [&_span]:[border:1px_solid_#334155] [&_span]:[color:#cbd5e1] [&_span]:[font-size:12px] [&_span]:[font-weight:600]">

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
                      className="favorite-view-button [display:block] [width:100%] [box-sizing:border-box] [padding:11px] [text-align:center] [text-decoration:none] [border-radius:8px] [background:#0d9488] [color:#ffffff] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_7px_18px_rgba(20,_184,_166,_0.2)]"
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
