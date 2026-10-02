import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../services/api";

import "./MyInquiries.css";


function MyInquiries() {

  const [inquiries, setInquiries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [withdrawLoading, setWithdrawLoading] =
    useState(null);


  // =========================================
  // LOAD INQUIRIES
  // =========================================

  useEffect(() => {

    let isMounted = true;


    const fetchInquiries = async () => {

      try {

        const response =
          await api.get("/inquiries/my");


        if (!isMounted) {
          return;
        }


        setInquiries(
          response.data.inquiries || []
        );


      } catch (error) {

        if (!isMounted) {
          return;
        }


        console.error(
          "Load inquiries error:",
          error
        );


        setError(
          error.response?.data?.message ||
            "Unable to load your inquiries."
        );


      } finally {

        if (isMounted) {

          setLoading(false);

        }

      }

    };


    fetchInquiries();


    return () => {

      isMounted = false;

    };

  }, []);


  // =========================================
  // WITHDRAW INQUIRY
  // =========================================

  const handleWithdraw = async (
    inquiryId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to withdraw this inquiry?"
      );


    if (!confirmed) {

      return;

    }


    try {

      setWithdrawLoading(
        inquiryId
      );


      await api.patch(
        `/inquiries/${inquiryId}/withdraw`
      );


      setInquiries(
        (previous) =>
          previous.map(
            (inquiry) =>
              inquiry._id === inquiryId
                ? {
                    ...inquiry,
                    status: "withdrawn",
                  }
                : inquiry
          )
      );


    } catch (error) {

      console.error(
        "Withdraw inquiry error:",
        error
      );


      alert(
        error.response?.data?.message ||
          "Unable to withdraw inquiry."
      );


    } finally {

      setWithdrawLoading(null);

    }

  };


  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {

    if (!date) {

      return "Not specified";

    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =========================================
  // STATUS CLASS
  // =========================================

  const getStatusClass = (
    status
  ) => {

    return `inquiry-status inquiry-status-${status}`;

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="inquiries-page">

        <div className="inquiries-container">

          <div className="inquiries-state">

            Loading your inquiries...

          </div>

        </div>

      </div>

    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (error) {

    return (

      <div className="inquiries-page">

        <div className="inquiries-container">

          <div className="inquiries-state inquiries-error">

            {error}

          </div>

        </div>

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="inquiries-page">

      <div className="inquiries-container">


        {/* =================================
            HEADER
        ================================= */}

        <div className="inquiries-header">

          <div>

            <h1>
              My Inquiries
            </h1>

            <p>
              Track the properties you
              have contacted.
            </p>

          </div>


          <Link
            to="/properties"
            className="browse-properties-button"
          >
            Find More Properties
          </Link>

        </div>


        {/* =================================
            EMPTY STATE
        ================================= */}

        {inquiries.length === 0 ? (

          <div className="inquiries-empty">

            <div className="inquiries-empty-icon">
              ✉
            </div>


            <h2>
              No inquiries yet
            </h2>


            <p>
              You haven't contacted any
              property owners yet.
            </p>


            <Link
              to="/properties"
              className="browse-properties-button"
            >
              Explore Properties
            </Link>

          </div>

        ) : (

          <div className="inquiries-list">

            {inquiries.map(
              (inquiry) => {

                const property =
                  inquiry.property;


                return (

                  <div
                    className="inquiry-card"
                    key={inquiry._id}
                  >


                    {/* =========================
                        PROPERTY IMAGE
                    ========================= */}

                    <div className="inquiry-card-image">

                      {property?.images?.length >
                        0 ? (

                        <img
                          src={
                            property
                              .images[0]
                              .url
                          }
                          alt={
                            property.title
                          }
                        />

                      ) : (

                        <div className="inquiry-no-image">
                          🏠
                        </div>

                      )}

                    </div>


                    {/* =========================
                        CONTENT
                    ========================= */}

                    <div className="inquiry-card-content">


                      <div className="inquiry-card-top">

                        <div>

                          <h2>

                            {property?.title ||
                              "Property"}

                          </h2>


                          <p className="inquiry-location">

                            📍{" "}

                            {property?.area}

                            {property?.area &&
                            property?.city
                              ? ", "
                              : ""}

                            {property?.city}

                          </p>

                        </div>


                        <span
                          className={getStatusClass(
                            inquiry.status
                          )}
                        >
                          {inquiry.status}
                        </span>

                      </div>


                      {/* =========================
                          PROPERTY DETAILS
                      ========================= */}

                      <div className="inquiry-property-details">


                        <div>

                          <span>
                            Rent
                          </span>

                          <strong>

                            ₹
                            {property?.rent ||
                              0}
                            /month

                          </strong>

                        </div>


                        <div>

                          <span>
                            Room
                          </span>

                          <strong>

                            {property?.roomType ||
                              "Not specified"}

                          </strong>

                        </div>


                        <div>

                          <span>
                            Move-in
                          </span>

                          <strong>

                            {formatDate(
                              inquiry.moveInDate
                            )}

                          </strong>

                        </div>

                      </div>


                      {/* =========================
                          MESSAGE
                      ========================= */}

                      <div className="inquiry-message">

                        <h3>
                          Your message
                        </h3>

                        <p>
                          {inquiry.message}
                        </p>

                      </div>


                      {/* =========================
                          OWNER RESPONSE
                      ========================= */}

                      {inquiry.ownerResponse && (

                        <div className="owner-response">

                          <h3>
                            Owner response
                          </h3>

                          <p>
                            {inquiry.ownerResponse}
                          </p>

                        </div>

                      )}


                      {/* =========================
                          ACTIONS
                      ========================= */}

                      <div className="inquiry-actions">


                        {property?._id && (

                          <Link
                            to={`/properties/${property._id}`}
                            className="view-property-button"
                          >
                            View Property
                          </Link>

                        )}


                        {inquiry.status ===
                          "pending" && (

                          <button
                            type="button"
                            className="withdraw-button"
                            onClick={() =>
                              handleWithdraw(
                                inquiry._id
                              )
                            }
                            disabled={
                              withdrawLoading ===
                              inquiry._id
                            }
                          >

                            {withdrawLoading ===
                            inquiry._id
                              ? "Withdrawing..."
                              : "Withdraw Inquiry"}

                          </button>

                        )}

                      </div>


                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}


export default MyInquiries;