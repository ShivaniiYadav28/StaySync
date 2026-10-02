import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

import "./Properties.css";

function Properties() {
  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filters, setFilters] = useState({
    search: "",
    city: "",
    propertyType: "",
    gender: "",
    roomType: "",
    minRent: "",
    maxRent: "",
    availableOnly: false,
  });

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalProperties: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // =====================================
  // FAVORITES
  // =====================================

  const [favoriteIds, setFavoriteIds] =
    useState(new Set());

  const [favoriteLoading, setFavoriteLoading] =
    useState({});

  // =====================================
  // FETCH PROPERTIES
  // =====================================

  const fetchProperties = async (
    currentPage = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: 12,
      };

      if (filters.search.trim()) {
        params.search =
          filters.search.trim();
      }

      if (filters.city.trim()) {
        params.city =
          filters.city.trim();
      }

      if (filters.propertyType) {
        params.propertyType =
          filters.propertyType;
      }

      if (filters.gender) {
        params.gender =
          filters.gender;
      }

      if (filters.roomType) {
        params.roomType =
          filters.roomType;
      }

      if (filters.minRent !== "") {
        params.minRent =
          filters.minRent;
      }

      if (filters.maxRent !== "") {
        params.maxRent =
          filters.maxRent;
      }

      if (filters.availableOnly) {
        params.availableOnly = "true";
      }

      const response =
        await api.get(
          "/properties",
          {
            params,
          }
        );

      setProperties(
        response.data.properties || []
      );

      setPagination(
        response.data.pagination || {
          currentPage,
          totalPages: 1,
          totalProperties: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );

      setPage(currentPage);
    } catch (error) {
      console.error(
        "Failed to fetch properties:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load properties."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // FETCH FAVORITES
  // =====================================

  const fetchFavorites = async () => {
    try {
      const response =
        await api.get(
          "/favorites"
        );

      const favoritePropertyIds =
        new Set(
          (response.data.favorites || [])
            .map(
              (favorite) =>
                favorite.property?._id
            )
            .filter(Boolean)
        );

      setFavoriteIds(
        favoritePropertyIds
      );
    } catch (error) {
      // A visitor who is not logged in
      // should still be able to browse properties.
      // Therefore, favorite loading errors
      // are intentionally ignored here.
      console.log(
        "Favorites not loaded:",
        error.response?.data?.message ||
          error.message
      );
    }
  };

  // =====================================
  // TOGGLE FAVORITE
  // =====================================

  const handleFavoriteToggle = async (
    propertyId
  ) => {
    if (
      favoriteLoading[propertyId]
    ) {
      return;
    }

    setFavoriteLoading(
      (previous) => ({
        ...previous,
        [propertyId]: true,
      })
    );

    try {
      const isFavorite =
        favoriteIds.has(propertyId);

      if (isFavorite) {
        await api.delete(
          `/favorites/${propertyId}`
        );

        setFavoriteIds(
          (previous) => {
            const updated =
              new Set(previous);

            updated.delete(propertyId);

            return updated;
          }
        );
      } else {
        await api.post(
          `/favorites/${propertyId}`
        );

        setFavoriteIds(
          (previous) => {
            const updated =
              new Set(previous);

            updated.add(propertyId);

            return updated;
          }
        );
      }
    } catch (error) {
      console.error(
        "Failed to update favorite:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        alert(
          "Please login as a seeker to save properties."
        );
      } else if (
        error.response?.status === 403
      ) {
        alert(
          "Only seekers can save properties."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to update favorite."
        );
      }
    } finally {
      setFavoriteLoading(
        (previous) => ({
          ...previous,
          [propertyId]: false,
        })
      );
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    let isMounted = true;

    const loadProperties =
      async () => {
        if (!isMounted) {
          return;
        }

        await fetchProperties(1);
      };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================
  // LOAD FAVORITES
  // =====================================

  useEffect(() => {
    fetchFavorites();
  }, []);

  // =====================================
  // HANDLE FILTER CHANGE
  // =====================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFilters(
      (previous) => ({
        ...previous,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  // =====================================
  // SEARCH
  // =====================================

  const handleSearch = async (e) => {
    e.preventDefault();

    await fetchProperties(1);
  };

  // =====================================
  // CLEAR FILTERS
  // =====================================

  const handleClear = () => {
    const emptyFilters = {
      search: "",
      city: "",
      propertyType: "",
      gender: "",
      roomType: "",
      minRent: "",
      maxRent: "",
      availableOnly: false,
    };

    setFilters(emptyFilters);

    fetchPropertiesWithFilters(
      emptyFilters,
      1
    );
  };

  // =====================================
  // FETCH WITH CUSTOM FILTERS
  // =====================================

  const fetchPropertiesWithFilters =
    async (
      currentFilters,
      currentPage = 1
    ) => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: currentPage,
          limit: 12,
        };

        if (
          currentFilters.search.trim()
        ) {
          params.search =
            currentFilters.search.trim();
        }

        if (
          currentFilters.city.trim()
        ) {
          params.city =
            currentFilters.city.trim();
        }

        if (
          currentFilters.propertyType
        ) {
          params.propertyType =
            currentFilters.propertyType;
        }

        if (
          currentFilters.gender
        ) {
          params.gender =
            currentFilters.gender;
        }

        if (
          currentFilters.roomType
        ) {
          params.roomType =
            currentFilters.roomType;
        }

        if (
          currentFilters.minRent !== ""
        ) {
          params.minRent =
            currentFilters.minRent;
        }

        if (
          currentFilters.maxRent !== ""
        ) {
          params.maxRent =
            currentFilters.maxRent;
        }

        if (
          currentFilters.availableOnly
        ) {
          params.availableOnly =
            "true";
        }

        const response =
          await api.get(
            "/properties",
            {
              params,
            }
          );

        setProperties(
          response.data.properties || []
        );

        setPagination(
          response.data.pagination || {
            currentPage,
            totalPages: 1,
            totalProperties: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );

        setPage(currentPage);
      } catch (error) {
        console.error(
          "Failed to fetch properties:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load properties."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================
  // PREVIOUS PAGE
  // =====================================

  const handlePrevious = () => {
    if (
      pagination.hasPreviousPage
    ) {
      fetchProperties(page - 1);
    }
  };

  // =====================================
  // NEXT PAGE
  // =====================================

  const handleNext = () => {
    if (
      pagination.hasNextPage
    ) {
      fetchProperties(page + 1);
    }
  };

  return (
    <div className="properties-page">
      <div className="properties-container">

        {/* =================================
            HEADER
        ================================= */}

        <div className="properties-header">
          <h1>
            Find Your Perfect Stay
          </h1>

          <p>
            Search PGs, hostels, flats
            and rooms that match your
            needs.
          </p>
        </div>

        {/* =================================
            FILTERS
        ================================= */}

        <form
          className="property-filters"
          onSubmit={handleSearch}
        >

          {/* SEARCH */}

          <div className="filter-group search-group">
            <label>
              Search
            </label>

            <input
              type="text"
              name="search"
              placeholder="Search city, area or property..."
              value={filters.search}
              onChange={handleChange}
            />
          </div>

          {/* CITY */}

          <div className="filter-group">
            <label>
              City
            </label>

            <input
              type="text"
              name="city"
              placeholder="e.g. Bangalore"
              value={filters.city}
              onChange={handleChange}
            />
          </div>

          {/* PROPERTY TYPE */}

          <div className="filter-group">
            <label>
              Property Type
            </label>

            <select
              name="propertyType"
              value={
                filters.propertyType
              }
              onChange={handleChange}
            >
              <option value="">
                All
              </option>

              <option value="PG">
                PG
              </option>

              <option value="Hostel">
                Hostel
              </option>

              <option value="Flat">
                Flat
              </option>

              <option value="Room">
                Room
              </option>
            </select>
          </div>

          {/* GENDER */}

          <div className="filter-group">
            <label>
              Gender
            </label>

            <select
              name="gender"
              value={filters.gender}
              onChange={handleChange}
            >
              <option value="">
                Any
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Any">
                Any
              </option>
            </select>
          </div>

          {/* ROOM TYPE */}

          <div className="filter-group">
            <label>
              Room Type
            </label>

            <select
              name="roomType"
              value={filters.roomType}
              onChange={handleChange}
            >
              <option value="">
                All
              </option>

              <option value="Single">
                Single
              </option>

              <option value="Double">
                Double
              </option>

              <option value="Triple">
                Triple
              </option>

              <option value="Shared">
                Shared
              </option>
            </select>
          </div>

          {/* MIN RENT */}

          <div className="filter-group">
            <label>
              Min Rent
            </label>

            <input
              type="number"
              name="minRent"
              placeholder="₹ Minimum"
              min="0"
              value={filters.minRent}
              onChange={handleChange}
            />
          </div>

          {/* MAX RENT */}

          <div className="filter-group">
            <label>
              Max Rent
            </label>

            <input
              type="number"
              name="maxRent"
              placeholder="₹ Maximum"
              min="0"
              value={filters.maxRent}
              onChange={handleChange}
            />
          </div>

          {/* AVAILABLE */}

          <div className="filter-checkbox">
            <label>
              <input
                type="checkbox"
                name="availableOnly"
                checked={
                  filters.availableOnly
                }
                onChange={handleChange}
              />

              <span>
                Available rooms only
              </span>
            </label>
          </div>

          {/* BUTTONS */}

          <div className="filter-actions">
            <button
              type="submit"
              className="search-button"
            >
              Search
            </button>

            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>

        {/* =================================
            RESULTS HEADER
        ================================= */}

        <div className="results-header">
          <h2>
            Properties
          </h2>

          <span>
            {pagination.totalProperties}{" "}
            properties found
          </span>
        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading && (
          <div className="loading-message">
            Loading properties...
          </div>
        )}

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =================================
            NO RESULTS
        ================================= */}

        {!loading &&
          !error &&
          properties.length === 0 && (
            <div className="no-results">
              <h3>
                No properties found
              </h3>

              <p>
                Try changing your
                search filters.
              </p>
            </div>
          )}

        {/* =================================
            PROPERTY GRID
        ================================= */}

        {!loading &&
          properties.length > 0 && (
            <div className="properties-grid">

              {properties.map(
                (property) => {

                  const coverImage =
                    property.images?.length >
                    0
                      ? property.images[0].url
                      : null;

                  const isFavorite =
                    favoriteIds.has(
                      property._id
                    );

                  const isFavoriteLoading =
                    favoriteLoading[
                      property._id
                    ];

                  return (
                    <div
                      className="property-card"
                      key={property._id}
                    >

                      {/* PROPERTY IMAGE */}

                      <div className="property-card-image">

                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={
                              property.title
                            }
                          />
                        ) : (
                          <div className="property-card-image-fallback">
                            <span>
                              🏠
                            </span>

                            <p>
                              No image available
                            </p>
                          </div>
                        )}

                        <span className="card-image-type">
                          {
                            property.propertyType
                          }
                        </span>

                        {/* FAVORITE BUTTON */}

                        <button
                          type="button"
                          className={`favorite-button ${
                            isFavorite
                              ? "favorite-active"
                              : ""
                          }`}
                          onClick={() =>
                            handleFavoriteToggle(
                              property._id
                            )
                          }
                          disabled={
                            isFavoriteLoading
                          }
                          aria-label={
                            isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          title={
                            isFavorite
                              ? "Remove from favorites"
                              : "Save property"
                          }
                        >
                          {isFavorite
                            ? "♥"
                            : "♡"}
                        </button>
                      </div>

                      {/* PROPERTY CONTENT */}

                      <div className="property-card-content">

                        <div className="property-card-top">

                          <span className="property-type">
                            {
                              property.propertyType
                            }
                          </span>

                          <span className="property-gender">
                            {
                              property.gender
                            }
                          </span>
                        </div>

                        <h3>
                          {property.title}
                        </h3>

                        <p className="property-location">
                          📍 {property.area},{" "}
                          {property.city}
                        </p>

                        <p className="property-room">
                          🛏️{" "}
                          {property.roomType}
                        </p>

                        <div className="property-price">
                          ₹
                          {Number(
                            property.rent
                          ).toLocaleString(
                            "en-IN"
                          )}

                          <span>
                            / month
                          </span>
                        </div>

                        <p className="property-availability">
                          {property.availableRooms >
                          0
                            ? `${property.availableRooms} rooms available`
                            : "Currently unavailable"}
                        </p>

                        <Link
                          to={`/properties/${property._id}`}
                          className="view-property-button"
                        >
                          View Details
                        </Link>

                      </div>
                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* =================================
            PAGINATION
        ================================= */}

        {!loading &&
          properties.length > 0 && (
            <div className="pagination">

              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  !pagination.hasPreviousPage
                }
              >
                ← Previous
              </button>

              <span>
                Page{" "}
                {pagination.currentPage}{" "}
                of{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  !pagination.hasNextPage
                }
              >
                Next →
              </button>

            </div>
          )}

      </div>
    </div>
  );
}

export default Properties;