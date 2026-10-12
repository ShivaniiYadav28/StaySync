import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import api, { logApiError } from "../services/api";

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

      logApiError("Fetch favorites error:", error);

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

      logApiError("Fetch properties error:", error);


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

      <div className="properties-page [min-height:80vh] [background:#0b1120] [color:#f8fafc] [padding:40px_20px_70px] max-[650px]:[padding:28px_14px_50px] max-[400px]:[padding-left:10px] max-[400px]:[padding-right:10px]">

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

    <div className="properties-page [min-height:80vh] [background:#0b1120] [color:#f8fafc] [padding:40px_20px_70px] max-[650px]:[padding:28px_14px_50px] max-[400px]:[padding-left:10px] max-[400px]:[padding-right:10px]">

      <div className="properties-container [width:100%] [max-width:1200px] [margin:0_auto]">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="properties-header [text-align:center] [margin-bottom:35px] [&_h1]:[margin:0_0_10px] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:36px] [&_h1]:[font-weight:800] [&_h1]:[line-height:1.2] [&_span]:[display:block] [&_span]:[color:#94a3b8] [&_span]:[font-size:16px] [&_span]:[line-height:1.6] max-[650px]:[margin-bottom:25px] max-[650px]:[&_h1]:[font-size:28px] max-[650px]:[&_span]:[font-size:14px]">

          <div>

            <p className="properties-label [margin:0_0_8px] [color:#14b8a6] [font-size:13px] [font-weight:700] [letter-spacing:0.14em] [text-transform:uppercase]">

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

          <div className="form-error [padding:14px] [border-radius:8px] [margin-bottom:20px] [background:rgba(239,_68,_68,_0.1)] [border:1px_solid_rgba(248,_113,_113,_0.2)] [color:#f87171] [padding:14px_16px] [background:rgba(127,_29,_29,_0.25)] [border:1px_solid_#7f1d1d] [border-radius:10px] [color:#fca5a5] [font-size:14px]">

            {error}

          </div>

        )}


        {/* =============================================
            FILTER FORM
        ============================================= */}

        <form
          className="property-filters [width:100%] [box-sizing:border-box] [display:grid] [grid-template-columns:repeat(4,_minmax(0,_1fr))] [gap:18px] [margin-bottom:35px] [padding:25px] [background:#111827] [border:1px_solid_#273449] [border-radius:16px] [box-shadow:0_12px_35px_rgba(0,_0,_0,_0.25)] max-[1000px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[650px]:[grid-template-columns:1fr] max-[650px]:[padding:18px] max-[650px]:[gap:15px] max-[400px]:[padding:15px]"
          onSubmit={handleSearch}
        >


          {/* Search */}

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-group [display:flex] [flex-direction:column] [gap:8px] [min-width:0] [&_label]:[color:#f8fafc] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_input]:[width:100%] [&_input]:[min-width:0] [&_input]:[box-sizing:border-box] [&_input]:[padding:12px_13px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:9px] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[font-size:14px] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_select]:[width:100%] [&_select]:[min-width:0] [&_select]:[box-sizing:border-box] [&_select]:[padding:12px_13px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:9px] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[font-size:14px] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease,_background_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_input:hover]:[border-color:#475569] [&_select:hover]:[border-color:#475569] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_input:focus]:[background:#111827] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.14)] [&_select:focus]:[background:#111827] [&_select]:[cursor:pointer] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc]">

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

          <div className="filter-checkbox [display:flex] [align-items:center] [min-height:68px] [&_label]:[display:flex] [&_label]:[align-items:center] [&_label]:[gap:10px] [&_label]:[color:#cbd5e1] [&_label]:[font-size:14px] [&_label]:[font-weight:500] [&_label]:[cursor:pointer] [&_input]:[width:17px] [&_input]:[height:17px] [&_input]:[accent-color:#14b8a6] [&_input]:[cursor:pointer] max-[650px]:[min-height:auto]">

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

          <div className="filter-actions [display:flex] [align-items:flex-end] [gap:10px] [min-height:68px] max-[650px]:[min-height:auto] max-[650px]:[flex-direction:column]">

            <button
              type="submit"
              className="filter-search-btn [border:none] [border-radius:9px] [padding:12px_20px] [font-size:14px] [font-weight:700] [cursor:pointer] [transition:background_0.2s_ease,_transform_0.15s_ease,_border-color_0.2s_ease] [background:#14b8a6] [color:#06131a] hover:[background:#2dd4bf] hover:[transform:translateY(-1px)] active:[transform:translateY(0)] max-[650px]:[width:100%]"
            >

              Search

            </button>


            <button
              type="button"
              className="filter-clear-btn [border:none] [border-radius:9px] [padding:12px_20px] [font-size:14px] [font-weight:700] [cursor:pointer] [transition:background_0.2s_ease,_transform_0.15s_ease,_border-color_0.2s_ease] [background:#1e293b] [color:#cbd5e1] [border:1px_solid_#334155] hover:[background:#273449] hover:[color:#f8fafc] hover:[transform:translateY(-1px)] active:[transform:translateY(0)] max-[650px]:[width:100%]"
              onClick={handleClear}
            >

              Clear

            </button>

          </div>


        </form>


        {/* =============================================
            RESULTS HEADER
        ============================================= */}

        <div className="properties-results-header [display:flex] [justify-content:space-between] [align-items:center] [gap:15px] [margin-bottom:20px] [&_h2]:[margin:0] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:21px] [&_h2]:[font-weight:700] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] max-[650px]:[flex-direction:column] max-[650px]:[align-items:flex-start] max-[650px]:[gap:5px]">

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

          <div className="empty-properties [padding:60px_25px] [text-align:center] [background:#111827] [border:1px_solid_#273449] [border-radius:16px] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.2)] [&_h2]:[margin:0_0_10px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:22px] [&_p]:[margin:0_0_20px] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] [&_button]:[padding:11px_18px] [&_button]:[border:none] [&_button]:[border-radius:9px] [&_button]:[background:#14b8a6] [&_button]:[color:#06131a] [&_button]:[font-size:14px] [&_button]:[font-weight:700] [&_button]:[cursor:pointer] [&_button:hover]:[background:#2dd4bf] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [padding:70px_20px] [border-radius:14px] [box-shadow:0_10px_30px_rgba(0,_0,_0,_0.22)] [&_p]:[margin-bottom:25px]">

            <div className="empty-icon [margin-bottom:15px] [font-size:48px]">

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

            <div className="property-grid [display:grid] [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:22px] [width:100%] max-[1000px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[650px]:[grid-template-columns:1fr] max-[650px]:[gap:18px]">

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
                      className="property-card [position:relative] [min-width:0] [display:flex] [flex-direction:column] [overflow:hidden] [background:#111827] [border:1px_solid_#273449] [border-radius:16px] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.22)] [transition:transform_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-5px)] hover:[border-color:#14b8a6] hover:[box-shadow:0_14px_35px_rgba(0,_0,_0,_0.35)] [&:hover_.property-image]:[transform:scale(1.04)]"
                      key={propertyId}
                    >


                      {/* Image */}

                      <div className="property-image-wrapper [position:relative] [width:100%] [height:220px] [overflow:hidden] [background:#1e293b] max-[650px]:[height:210px] max-[400px]:[height:190px]">

                        {image ? (

                          <img
                            src={image}
                            alt={
                              property.title ||
                              "Property"
                            }
                            className="property-image [display:block] [width:100%] [height:100%] [object-fit:cover] [transition:transform_0.35s_ease]"
                          />

                        ) : (

                          <div className="property-image-placeholder [width:100%] [height:100%] [display:flex] [align-items:center] [justify-content:center] [background:linear-gradient(_135deg,_#111827,_#1e293b_)] [color:#64748b] [font-size:48px]">

                            🏠

                          </div>

                        )}


                        {/* Property Type */}

                        {property.propertyType && (

                          <span className="property-type-badge [position:absolute] [top:14px] [right:14px] [padding:7px_12px] [background:rgba(11,_17,_32,_0.88)] [border:1px_solid_#334155] [border-radius:999px] [color:#2dd4bf] [font-size:12px] [font-weight:700] [backdrop-filter:blur(8px)] max-[400px]:[top:12px] max-[400px]:[right:12px] max-[400px]:[padding:6px_9px] [z-index:2] [top:20px] [right:20px] [padding:9px_16px] [border:1px_solid_rgba(94,_234,_212,_0.28)] [background:rgba(15,_23,_42,_0.88)] [backdrop-filter:blur(10px)] [color:#5eead4] [font-size:13px] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.3)] max-[768px]:[top:14px] max-[768px]:[right:14px] max-[480px]:[top:10px] max-[480px]:[right:10px] max-[480px]:[padding:7px_11px] max-[480px]:[font-size:12px]">

                            {
                              property.propertyType
                            }

                          </span>

                        )}


                        {/* Favorite */}

                        <button
                          type="button"
                          className={`favorite-button [position:absolute] [top:14px] [left:14px] [width:40px] [height:40px] [display:flex] [align-items:center] [justify-content:center] [border:1px_solid_#334155] [border-radius:50%] [background:rgba(11,_17,_32,_0.88)] [color:#cbd5e1] [font-size:21px] [cursor:pointer] [backdrop-filter:blur(8px)] [transition:background_0.2s_ease,_color_0.2s_ease,_border-color_0.2s_ease,_transform_0.2s_ease] hover:[transform:scale(1.06)] hover:[border-color:#14b8a6] hover:[color:#2dd4bf] hover:[background:rgba(15,_23,_42,_0.95)] [&.active]:[border-color:rgba(20,_184,_166,_0.55)] [&.active]:[background:rgba(20,_184,_166,_0.16)] [&.active]:[color:#2dd4bf] max-[400px]:[width:36px] max-[400px]:[height:36px] max-[400px]:[font-size:18px] ${
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

                      <div className="property-card-content [display:flex] [flex-direction:column] [flex:1] [padding:18px] max-[650px]:[padding:16px]">


                        <div className="property-card-top [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:12px] [margin-bottom:10px] [&_h2]:[min-width:0] [&_h2]:[margin:0] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:19px] [&_h2]:[font-weight:700] [&_h2]:[line-height:1.35] [&_h2]:[overflow-wrap:anywhere] max-[650px]:[&_h2]:[font-size:18px]">

                          <h2>

                            {
                              property.title ||
                              "Untitled Property"
                            }

                          </h2>


                          {property.gender && (

                            <span className="property-gender [flex-shrink:0] [padding:6px_10px] [background:#1e293b] [border:1px_solid_#334155] [border-radius:999px] [color:#cbd5e1] [font-size:12px] [font-weight:700]">

                              {
                                property.gender
                              }

                            </span>

                          )}

                        </div>


                        {/* Location */}

                        <p className="property-location [margin:4px_0_10px] [color:#94a3b8] [font-size:14px] [line-height:1.5]">

                          📍{" "}

                          {
                            property.area ||
                            property.locality ||
                            property.city ||
                            "Location unavailable"
                          }

                        </p>


                        {/* Rent */}

                        <p className="property-rent [margin:4px_0_12px] [color:#2dd4bf] [font-size:22px] [font-weight:800] [&_span]:[margin-left:4px] [&_span]:[color:#64748b] [&_span]:[font-size:12px] [&_span]:[font-weight:500] max-[650px]:[font-size:20px]">

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

                        <div className="property-meta [display:flex] [flex-wrap:wrap] [gap:7px] [margin-bottom:18px] [&_span]:[display:inline-flex] [&_span]:[align-items:center] [&_span]:[padding:6px_9px] [&_span]:[background:#0f172a] [&_span]:[border:1px_solid_#273449] [&_span]:[border-radius:7px] [&_span]:[color:#94a3b8] [&_span]:[font-size:12px] [&_span]:[font-weight:500]">

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
                          className="view-property-btn [display:block] [width:100%] [box-sizing:border-box] [margin-top:auto] [padding:11px_14px] [text-align:center] [text-decoration:none] [background:#14b8a6] [border-radius:9px] [color:#06131a] [font-size:14px] [font-weight:700] [transition:background_0.2s_ease,_transform_0.15s_ease] hover:[background:#2dd4bf] hover:[transform:translateY(-1px)]"
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

              <div className="pagination [display:flex] [justify-content:center] [align-items:center] [flex-wrap:wrap] [gap:8px] [margin-top:35px] [&_button]:[min-width:42px] [&_button]:[padding:10px_14px] [&_button]:[border:1px_solid_#334155] [&_button]:[border-radius:8px] [&_button]:[background:#111827] [&_button]:[color:#cbd5e1] [&_button]:[font-size:14px] [&_button]:[font-weight:600] [&_button]:[cursor:pointer] [&_button]:[transition:background_0.2s_ease,_border-color_0.2s_ease,_color_0.2s_ease] [&_button:hover:not(:disabled)]:[background:#1e293b] [&_button:hover:not(:disabled)]:[border-color:#14b8a6] [&_button:hover:not(:disabled)]:[color:#2dd4bf] [&_button.active]:[background:#14b8a6] [&_button.active]:[border-color:#14b8a6] [&_button.active]:[color:#06131a] [&_button:disabled]:[opacity:0.4] [&_button:disabled]:[cursor:not-allowed]">


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
