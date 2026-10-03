import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import api from "../services/api";

import "./Properties.css";


function Properties() {

  /* =====================================================
     URL SEARCH PARAMETERS
  ===================================================== */

  const [searchParams, setSearchParams] =
    useSearchParams();


  /* =====================================================
     PROPERTY DATA
  ===================================================== */

  const [properties, setProperties] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =====================================================
     FILTER STATES
  ===================================================== */

  const [search, setSearch] =
    useState(
      searchParams.get("search") || ""
    );

  const [city, setCity] =
    useState(
      searchParams.get("city") || ""
    );

  const [propertyType, setPropertyType] =
    useState(
      searchParams.get("propertyType") || ""
    );

  const [gender, setGender] =
    useState(
      searchParams.get("gender") || ""
    );

  const [roomType, setRoomType] =
    useState(
      searchParams.get("roomType") || ""
    );

  const [minRent, setMinRent] =
    useState(
      searchParams.get("minRent") || ""
    );

  const [maxRent, setMaxRent] =
    useState(
      searchParams.get("maxRent") || ""
    );

  const [availableOnly, setAvailableOnly] =
    useState(
      searchParams.get("availableOnly") ===
        "true"
    );


  /* =====================================================
     SORTING
  ===================================================== */

  const [sort, setSort] =
    useState(
      searchParams.get("sort") || "newest"
    );


  /* =====================================================
     PAGINATION
  ===================================================== */

  const [page, setPage] =
    useState(
      Number(
        searchParams.get("page")
      ) || 1
    );

  const [totalPages, setTotalPages] =
    useState(1);


  /* =====================================================
     FAVORITES
  ===================================================== */

  const [favoriteIds, setFavoriteIds] =
    useState([]);

  const [favoritesLoading, setFavoritesLoading] =
    useState(false);


  /* =====================================================
     FETCH FAVORITES
  ===================================================== */

  const fetchFavorites = async () => {

    try {

      const response =
        await api.get("/favorites");

      const favorites =
        response.data?.favorites ||
        response.data?.data ||
        [];

      const ids =
        favorites.map(
          (item) =>
            item.property?._id ||
            item.property ||
            item._id
        );

      setFavoriteIds(ids);

    } catch (error) {

      console.error(
        "Fetch favorites error:",
        error
      );

    }
  };


  /* =====================================================
     FETCH PROPERTIES
  ===================================================== */

  const fetchProperties = async (
    currentPage = page
  ) => {

    try {

      setLoading(true);

      setError("");


      const params = {};


      /* Search */

      if (search.trim()) {

        params.search =
          search.trim();

      }


      /* City */

      if (city.trim()) {

        params.city =
          city.trim();

      }


      /* Property Type */

      if (propertyType) {

        params.propertyType =
          propertyType;

      }


      /* Gender */

      if (gender) {

        params.gender =
          gender;

      }


      /* Room Type */

      if (roomType) {

        params.roomType =
          roomType;

      }


      /* Minimum Rent */

      if (minRent) {

        params.minRent =
          minRent;

      }


      /* Maximum Rent */

      if (maxRent) {

        params.maxRent =
          maxRent;

      }


      /* Availability */

      if (availableOnly) {

        params.availableOnly =
          true;

      }


      /* Sorting */

      if (
        sort &&
        sort !== "newest"
      ) {

        params.sort =
          sort;

      }


      /* Pagination */

      params.page =
        currentPage;


      const response =
        await api.get(
          "/properties",
          {
            params,
          }
        );


      const responseData =
        response.data;


      /*
        Support different response
        structures.
      */

      const propertyList =
        responseData?.properties ||
        responseData?.data?.properties ||
        responseData?.data ||
        [];


      setProperties(
        Array.isArray(propertyList)
          ? propertyList
          : []
      );


      /*
        Pagination support
      */

      const pagination =
        responseData?.pagination ||
        responseData?.data?.pagination ||
        {};


      const backendTotalPages =
        Number(
          pagination.totalPages
        ) || 1;


      setTotalPages(
        backendTotalPages
      );


      setPage(currentPage);

    } catch (error) {

      console.error(
        "Fetch properties error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to load properties."
      );


      setProperties([]);

    } finally {

      setLoading(false);

    }
  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    fetchProperties(page);

    fetchFavorites();

  }, []);


  /* =====================================================
     INPUT HANDLER
  ===================================================== */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    if (type === "checkbox") {

      setAvailableOnly(
        checked
      );

      return;
    }


    if (name === "search") {

      setSearch(value);

    }


    if (name === "city") {

      setCity(value);

    }


    if (name === "propertyType") {

      setPropertyType(value);

    }


    if (name === "gender") {

      setGender(value);

    }


    if (name === "roomType") {

      setRoomType(value);

    }


    if (name === "minRent") {

      setMinRent(value);

    }


    if (name === "maxRent") {

      setMaxRent(value);

    }


    if (name === "sort") {

      setSort(value);

    }

  };


  /* =====================================================
     BUILD URL FROM FILTERS
  ===================================================== */

  const updateUrl = (
    currentPage = 1
  ) => {

    const params =
      new URLSearchParams();


    if (search.trim()) {

      params.set(
        "search",
        search.trim()
      );

    }


    if (city.trim()) {

      params.set(
        "city",
        city.trim()
      );

    }


    if (propertyType) {

      params.set(
        "propertyType",
        propertyType
      );

    }


    if (gender) {

      params.set(
        "gender",
        gender
      );

    }


    if (roomType) {

      params.set(
        "roomType",
        roomType
      );

    }


    if (minRent) {

      params.set(
        "minRent",
        minRent
      );

    }


    if (maxRent) {

      params.set(
        "maxRent",
        maxRent
      );

    }


    if (availableOnly) {

      params.set(
        "availableOnly",
        "true"
      );

    }


    /* Sorting */

    if (
      sort &&
      sort !== "newest"
    ) {

      params.set(
        "sort",
        sort
      );

    }


    if (currentPage > 1) {

      params.set(
        "page",
        String(currentPage)
      );

    }


    setSearchParams(
      params,
      {
        replace: true,
      }
    );

  };


  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = async (
    event
  ) => {

    event.preventDefault();

    updateUrl(1);

    await fetchProperties(1);

  };


  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const handleClear = async () => {

    setSearch("");

    setCity("");

    setPropertyType("");

    setGender("");

    setRoomType("");

    setMinRent("");

    setMaxRent("");

    setAvailableOnly(false);

    setSort("newest");

    setPage(1);


    setSearchParams(
      {},
      {
        replace: true,
      }
    );


    /*
      Fetch all properties immediately.
    */

    try {

      setLoading(true);

      setError("");


      const response =
        await api.get(
          "/properties",
          {
            params: {
              page: 1,
            },
          }
        );


      const responseData =
        response.data;


      const propertyList =
        responseData?.properties ||
        responseData?.data?.properties ||
        responseData?.data ||
        [];


      setProperties(
        Array.isArray(propertyList)
          ? propertyList
          : []
      );


      const pagination =
        responseData?.pagination ||
        responseData?.data?.pagination ||
        {};


      setTotalPages(
        Number(
          pagination.totalPages
        ) || 1
      );

    } catch (error) {

      console.error(
        "Clear filters error:",
        error
      );


      setError(
        error.response?.data?.message ||
          "Unable to load properties."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     FILTER SEARCH
  ===================================================== */

  const fetchPropertiesWithFilters =
    async () => {

      await handleSearch({
        preventDefault: () => {},
      });

    };


  /* =====================================================
     PAGINATION
  ===================================================== */

  const handlePageChange = async (
    newPage
  ) => {

    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {

      return;

    }


    setPage(newPage);

    updateUrl(newPage);

    await fetchProperties(
      newPage
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /* =====================================================
     FAVORITE CHECK
  ===================================================== */

  const isFavorite = (
    propertyId
  ) => {

    return favoriteIds.includes(
      propertyId
    );

  };


  /* =====================================================
     TOGGLE FAVORITE
  ===================================================== */

  const handleFavorite = async (
    propertyId
  ) => {

    if (favoritesLoading) {

      return;

    }


    try {

      setFavoritesLoading(true);


      const alreadyFavorite =
        isFavorite(propertyId);


      if (alreadyFavorite) {

        await api.delete(
          `/favorites/${propertyId}`
        );


        setFavoriteIds(
          (previous) =>
            previous.filter(
              (id) =>
                id !== propertyId
            )
        );

      } else {

        await api.post(
          `/favorites/${propertyId}`
        );


        setFavoriteIds(
          (previous) => [
            ...previous,
            propertyId,
          ]
        );

      }

    } catch (error) {

      console.error(
        "Favorite error:",
        error
      );


      alert(
        error.response?.data?.message ||
          "Unable to update favorite."
      );

    } finally {

      setFavoritesLoading(false);

    }

  };


  /* =====================================================
     PROPERTY IMAGE
  ===================================================== */

  const getPropertyImage = (
    property
  ) => {

    if (
      property.images &&
      property.images.length > 0
    ) {

      const firstImage =
        property.images[0];


      if (
        typeof firstImage ===
        "string"
      ) {

        return firstImage;

      }


      return (
        firstImage?.url ||
        firstImage?.secure_url ||
        ""
      );

    }


    return "";

  };


  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {

    return (

      <div className="properties-page">

        <div className="properties-loading">

          Loading properties...

        </div>

      </div>

    );

  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="properties-page">

      <div className="properties-container">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="properties-header">

          <div>

            <p className="properties-label">

              STAYSYNC PROPERTIES

            </p>


            <h1>

              Find Your Perfect Stay

            </h1>


            <span>

              Explore PGs, rooms and
              apartments that match
              your needs.

            </span>

          </div>

        </div>


        {/* =============================================
            ERROR
        ============================================= */}

        {error && (

          <div className="form-error">

            {error}

          </div>

        )}


        {/* =============================================
            FILTER FORM
        ============================================= */}

        <form
          className="property-filters"
          onSubmit={handleSearch}
        >


          {/* Search */}

          <div className="filter-group">

            <label htmlFor="search">

              Search

            </label>


            <input
              id="search"
              name="search"
              type="text"
              value={search}
              onChange={handleChange}
              placeholder="Search properties..."
            />

          </div>


          {/* City */}

          <div className="filter-group">

            <label htmlFor="city">

              City

            </label>


            <input
              id="city"
              name="city"
              type="text"
              value={city}
              onChange={handleChange}
              placeholder="Bangalore"
            />

          </div>


          {/* Property Type */}

          <div className="filter-group">

            <label htmlFor="propertyType">

              Property Type

            </label>


            <select
              id="propertyType"
              name="propertyType"
              value={propertyType}
              onChange={handleChange}
            >

              <option value="">

                All Types

              </option>


              <option value="PG">

                PG

              </option>


              <option value="Room">

                Room

              </option>


              <option value="Flat">

                Flat

              </option>


              <option value="Hostel">

                Hostel

              </option>

            </select>

          </div>


          {/* Gender */}

          <div className="filter-group">

            <label htmlFor="gender">

              Gender

            </label>


            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={handleChange}
            >

              <option value="">

                Any Gender

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


          {/* Room Type */}

          <div className="filter-group">

            <label htmlFor="roomType">

              Room Type

            </label>


            <select
              id="roomType"
              name="roomType"
              value={roomType}
              onChange={handleChange}
            >

              <option value="">

                Any Room

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


          {/* Minimum Rent */}

          <div className="filter-group">

            <label htmlFor="minRent">

              Min Rent

            </label>


            <input
              id="minRent"
              name="minRent"
              type="number"
              min="0"
              value={minRent}
              onChange={handleChange}
              placeholder="₹5,000"
            />

          </div>


          {/* Maximum Rent */}

          <div className="filter-group">

            <label htmlFor="maxRent">

              Max Rent

            </label>


            <input
              id="maxRent"
              name="maxRent"
              type="number"
              min="0"
              value={maxRent}
              onChange={handleChange}
              placeholder="₹15,000"
            />

          </div>


          {/* Sort */}

          <div className="filter-group">

            <label htmlFor="sort">

              Sort By

            </label>


            <select
              id="sort"
              name="sort"
              value={sort}
              onChange={handleChange}
            >

              <option value="newest">

                Newest

              </option>


              <option value="rent_asc">

                Rent: Low → High

              </option>


              <option value="rent_desc">

                Rent: High → Low

              </option>

            </select>

          </div>


          {/* Available */}

          <div className="filter-checkbox">

            <label>

              <input
                type="checkbox"
                name="availableOnly"
                checked={availableOnly}
                onChange={handleChange}
              />


              <span>

                Available only

              </span>

            </label>

          </div>


          {/* Buttons */}

          <div className="filter-actions">

            <button
              type="submit"
              className="filter-search-btn"
            >

              Search

            </button>


            <button
              type="button"
              className="filter-clear-btn"
              onClick={handleClear}
            >

              Clear

            </button>

          </div>


        </form>


        {/* =============================================
            RESULTS HEADER
        ============================================= */}

        <div className="properties-results-header">

          <h2>

            {properties.length}{" "}

            {properties.length === 1
              ? "Property"
              : "Properties"}{" "}

            Found

          </h2>


          {(city ||
            propertyType ||
            gender ||
            roomType ||
            minRent ||
            maxRent ||
            availableOnly ||
            search ||
            sort !== "newest") && (

            <p>

              Showing results based
              on your filters.

            </p>

          )}

        </div>


        {/* =============================================
            NO RESULTS
        ============================================= */}

        {properties.length === 0 ? (

          <div className="empty-properties">

            <div className="empty-icon">

              🏠

            </div>


            <h2>

              No properties found

            </h2>


            <p>

              Try changing your filters
              or search for another
              location.

            </p>


            <button
              type="button"
              onClick={handleClear}
            >

              Clear Filters

            </button>

          </div>

        ) : (

          <>


            {/* =========================================
                PROPERTY GRID
            ========================================= */}

            <div className="property-grid">

              {properties.map(
                (property) => {

                  const propertyId =
                    property._id ||
                    property.id;


                  const image =
                    getPropertyImage(
                      property
                    );


                  return (

                    <div
                      className="property-card"
                      key={propertyId}
                    >


                      {/* Image */}

                      <div className="property-image-wrapper">

                        {image ? (

                          <img
                            src={image}
                            alt={
                              property.title ||
                              "Property"
                            }
                            className="property-image"
                          />

                        ) : (

                          <div className="property-image-placeholder">

                            🏠

                          </div>

                        )}


                        {/* Property Type */}

                        {property.propertyType && (

                          <span className="property-type-badge">

                            {
                              property.propertyType
                            }

                          </span>

                        )}


                        {/* Favorite */}

                        <button
                          type="button"
                          className={`favorite-button ${
                            isFavorite(
                              propertyId
                            )
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            handleFavorite(
                              propertyId
                            )
                          }
                          aria-label={
                            isFavorite(
                              propertyId
                            )
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >

                          {isFavorite(
                            propertyId
                          )
                            ? "♥"
                            : "♡"}

                        </button>

                      </div>


                      {/* Card Content */}

                      <div className="property-card-content">


                        <div className="property-card-top">

                          <h2>

                            {
                              property.title ||
                              "Untitled Property"
                            }

                          </h2>


                          {property.gender && (

                            <span className="property-gender">

                              {
                                property.gender
                              }

                            </span>

                          )}

                        </div>


                        {/* Location */}

                        <p className="property-location">

                          📍{" "}

                          {
                            property.area ||
                            property.locality ||
                            property.city ||
                            "Location unavailable"
                          }

                        </p>


                        {/* Rent */}

                        <p className="property-rent">

                          ₹

                          {Number(
                            property.rent ||
                              property.monthlyRent ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}


                          <span>

                            / month

                          </span>

                        </p>


                        {/* Details */}

                        <div className="property-meta">

                          {property.roomType && (

                            <span>

                              🛏️{" "}

                              {
                                property.roomType
                              }

                            </span>

                          )}


                          {property.city && (

                            <span>

                              📍{" "}

                              {
                                property.city
                              }

                            </span>

                          )}


                          {property.available !==
                            undefined && (

                            <span>

                              {property.available
                                ? "Available"
                                : "Not Available"}

                            </span>

                          )}

                        </div>


                        {/* View Button */}

                        <Link
                          to={`/properties/${propertyId}`}
                          className="view-property-btn"
                        >

                          View Property

                        </Link>

                      </div>

                    </div>

                  );

                }
              )}

            </div>


            {/* =========================================
                PAGINATION
            ========================================= */}

            {totalPages > 1 && (

              <div className="pagination">


                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    handlePageChange(
                      page - 1
                    )
                  }
                >

                  ← Previous

                </button>


                {Array.from(
                  {
                    length: totalPages,
                  }
                ).map(
                  (_, index) =>
                    index + 1
                ).map(
                  (pageNumber) => (

                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        page ===
                        pageNumber
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handlePageChange(
                          pageNumber
                        )
                      }
                    >

                      {pageNumber}

                    </button>

                  )
                )}


                <button
                  type="button"
                  disabled={
                    page === totalPages
                  }
                  onClick={() =>
                    handlePageChange(
                      page + 1
                    )
                  }
                >

                  Next →

                </button>

              </div>

            )}

          </>

        )}

      </div>

    </div>

  );

}


export default Properties;