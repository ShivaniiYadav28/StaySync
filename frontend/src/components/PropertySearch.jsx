import { useState } from "react";
import { useNavigate } from "react-router-dom";


function PropertySearch() {
  const navigate = useNavigate();


  const [city, setCity] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [propertyType, setPropertyType] =
    useState("");

  const [roomType, setRoomType] =
    useState("");

  const [gender, setGender] =
    useState("");


  const handleSearch = (event) => {
    event.preventDefault();


    const params =
      new URLSearchParams();


    // ================================
    // CITY
    // ================================

    if (city.trim()) {
      params.set(
        "city",
        city.trim()
      );
    }


    // ================================
    // MAX RENT
    // ================================

    if (budget) {
      params.set(
        "maxRent",
        budget
      );
    }


    // ================================
    // PROPERTY TYPE
    // ================================

    if (propertyType) {
      params.set(
        "propertyType",
        propertyType
      );
    }


    // ================================
    // ROOM TYPE
    // ================================

    if (roomType) {
      params.set(
        "roomType",
        roomType
      );
    }


    // ================================
    // GENDER
    // ================================

    if (gender) {
      params.set(
        "gender",
        gender
      );
    }


    const query =
      params.toString();


    navigate(
      query
        ? `/properties?${query}`
        : "/properties"
    );
  };


  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">

      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-5"
      >

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 lg:items-end">


          {/* =================================
              LOCATION
          ================================= */}

          <div className="lg:col-span-2">

            <label
              htmlFor="search-city"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              📍 Location
            </label>

            <input
              id="search-city"
              type="text"
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value
                )
              }
              placeholder="Bangalore, Indiranagar..."
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            />

          </div>


          {/* =================================
              MAX BUDGET
          ================================= */}

          <div>

            <label
              htmlFor="search-budget"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              💰 Max Budget
            </label>

            <select
              id="search-budget"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            >

              <option value="">
                Any budget
              </option>

              <option value="5000">
                ₹5,000
              </option>

              <option value="10000">
                ₹10,000
              </option>

              <option value="15000">
                ₹15,000
              </option>

              <option value="20000">
                ₹20,000
              </option>

              <option value="30000">
                ₹30,000
              </option>

            </select>

          </div>


          {/* =================================
              PROPERTY TYPE
          ================================= */}

          <div>

            <label
              htmlFor="search-property-type"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              🏠 Property
            </label>

            <select
              id="search-property-type"
              value={propertyType}
              onChange={(event) =>
                setPropertyType(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            >

              <option value="">
                Any type
              </option>

              <option value="PG">
                PG
              </option>

              <option value="Room">
                Room
              </option>

              <option value="Apartment">
                Apartment
              </option>

            </select>

          </div>


          {/* =================================
              ROOM TYPE
          ================================= */}

          <div>

            <label
              htmlFor="search-room-type"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              🛏️ Room
            </label>

            <select
              id="search-room-type"
              value={roomType}
              onChange={(event) =>
                setRoomType(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            >

              <option value="">
                Any room
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


          {/* =================================
              GENDER
          ================================= */}

          <div>

            <label
              htmlFor="search-gender"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              👤 Gender
            </label>

            <select
              id="search-gender"
              value={gender}
              onChange={(event) =>
                setGender(
                  event.target.value
                )
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
            >

              <option value="">
                Any
              </option>

              {/* IMPORTANT:
                  Keep these values capitalized.
              */}

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Unisex">
                Unisex
              </option>

            </select>

          </div>


          {/* =================================
              SEARCH BUTTON
          ================================= */}

          <button
            type="submit"
            className="h-12 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-600/20 active:scale-[0.98]"
          >
            Search Stays
          </button>

        </div>

      </form>

    </div>
  );
}


export default PropertySearch;