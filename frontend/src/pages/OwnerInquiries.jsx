import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../services/api";

import "./OwnerInquiries.css";


function OwnerInquiries() {

  const [inquiries, setInquiries] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [responseText, setResponseText] =
    useState({});

  const [actionLoading, setActionLoading] =
    useState(null);


  // =========================================
  // LOAD OWNER INQUIRIES
  // =========================================

  useEffect(() => {

    let isMounted = true;


    const fetchInquiries = async () => {

      try {

        const response =
          await api.get(
            "/inquiries/owner"
          );


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
          "Load owner inquiries error:",
          error
        );


        setError(
          error.response?.data?.message ||
            "Unable to load inquiries."
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
  // RESPONSE TEXT
  // =========================================

  const handleResponseChange = (
    inquiryId,
    value
  ) => {

    setResponseText(
      (previous) => ({
        ...previous,

        [inquiryId]: value,
      })
    );

  };


  // =========================================
  // UPDATE INQUIRY STATUS
  // =========================================

  const handleStatusUpdate = async (
    inquiryId,
    status
  ) => {

    const response =
      responseText[inquiryId] || "";


    if (response.length > 1000) {

      alert(
        "Response cannot exceed 1000 characters."
      );

      return;

    }


    const action =
      status === "accepted"
        ? "accept"
        : "reject";


    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} this inquiry?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setActionLoading(
        inquiryId
      );


      const result =
        await api.patch(
          `/inquiries/${inquiryId}/status`,
          {
            status,
            ownerResponse:
              response.trim(),
          }
        );


      setInquiries(
        (previous) =>
          previous.map(
            (inquiry) =>
              inquiry._id === inquiryId
                ? result.data.inquiry
                : inquiry
          )
      );


      setResponseText(
        (previous) => ({
          ...previous,

          [inquiryId]: "",
        })
      );


      alert(
        result.data.message ||
          `Inquiry ${status} successfully.`
      );


    } catch (error) {

      console.error(
        "Update inquiry error:",
        error
      );


      alert(
        error.response?.data?.message ||
          "Unable to update inquiry."
      );


    } finally {

      setActionLoading(null);

    }

  };


  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (
    date
  ) => {

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

    return `owner-inquiry-status owner-inquiry-status-${status}`;

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="owner-inquiries-page">

        <div className="owner-inquiries-container">

          <div className="owner-inquiries-state">

            Loading inquiries...

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

      <div className="owner-inquiries-page">

        <div className="owner-inquiries-container">

          <div className="owner-inquiries-state owner-inquiries-error">

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

    <div className="owner-inquiries-page">

      <div className="owner-inquiries-container">


        {/* =================================
            HEADER
        ================================= */}

        <div className="owner-inquiries-header">

          <div>

            <h1>
              Property Inquiries
            </h1>

            <p>
              Manage inquiries from
              people interested in your
              properties.
            </p>

          </div>


          <Link
            to="/owner/my-properties"
            className="owner-inquiries-back-button"
          >
            My Properties
          </Link>

        </div>


        {/* =================================
            EMPTY STATE
        ================================= */}

        {inquiries.length === 0 ? (

          <div className="owner-inquiries-empty">

            <div className="owner-inquiries-empty-icon">
              ✉
            </div>


            <h2>
              No inquiries yet
            </h2>


            <p>
              When someone contacts you
              about your property, their
              inquiry will appear here.
            </p>


            <Link
              to="/owner/my-properties"
              className="owner-inquiries-back-button"
            >
              View My Properties
            </Link>

          </div>

        ) : (

          <div className="owner-inquiries-list">

            {inquiries.map(
              (inquiry) => {

                const property =
                  inquiry.property;

                const seeker =
                  inquiry.seeker;

                const isPending =
                  inquiry.status ===
                  "pending";

                const currentResponse =
                  responseText[
                    inquiry._id
                  ] || "";


                return (

                  <div
                    className="owner-inquiry-card"
                    key={inquiry._id}
                  >


                    {/* =========================
                        PROPERTY IMAGE
                    ========================= */}

                    <div className="owner-inquiry-image">

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

                        <div className="owner-inquiry-no-image">
                          🏠
                        </div>

                      )}

                    </div>


                    {/* =========================
                        CONTENT
                    ========================= */}

                    <div className="owner-inquiry-content">


                      {/* =========================
                          TOP
                      ========================= */}

                      <div className="owner-inquiry-top">

                        <div>

                          <h2>

                            {property?.title ||
                              "Property"}

                          </h2>


                          <p className="owner-inquiry-location">

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
                          SEEKER INFORMATION
                      ========================= */}

                      <div className="seeker-information">

                        <h3>
                          Seeker Details
                        </h3>


                        <div className="seeker-details-grid">


                          <div>

                            <span>
                              Name
                            </span>

                            <strong>

                              {seeker?.name ||
                                "Not available"}

                            </strong>

                          </div>


                          <div>

                            <span>
                              Email
                            </span>

                            <strong>

                              {seeker?.email ||
                                "Not available"}

                            </strong>

                          </div>


                          <div>

                            <span>
                              Move-in Date
                            </span>

                            <strong>

                              {formatDate(
                                inquiry.moveInDate
                              )}

                            </strong>

                          </div>


                        </div>

                      </div>


                      {/* =========================
                          PROPERTY INFORMATION
                      ========================= */}

                      <div className="owner-property-information">


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
                            Inquiry Date
                          </span>

                          <strong>

                            {formatDate(
                              inquiry.createdAt
                            )}

                          </strong>

                        </div>


                      </div>


                      {/* =========================
                          SEEKER MESSAGE
                      ========================= */}

                      <div className="seeker-message">

                        <h3>
                          Seeker Message
                        </h3>

                        <p>
                          {inquiry.message}
                        </p>

                      </div>


                      {/* =========================
                          EXISTING RESPONSE
                      ========================= */}

                      {inquiry.ownerResponse && (

                        <div className="existing-owner-response">

                          <h3>
                            Your Response
                          </h3>

                          <p>
                            {
                              inquiry.ownerResponse
                            }
                          </p>

                        </div>

                      )}


                      {/* =========================
                          OWNER ACTION
                      ========================= */}

                      {isPending && (

                        <div className="owner-action-section">


                          <div className="owner-response-field">

                            <label
                              htmlFor={`response-${inquiry._id}`}
                            >
                              Response to Seeker
                            </label>


                            <textarea
                              id={`response-${inquiry._id}`}
                              value={
                                currentResponse
                              }
                              onChange={(
                                event
                              ) =>
                                handleResponseChange(
                                  inquiry._id,
                                  event.target
                                    .value
                                )
                              }
                              placeholder="Write a response to the seeker..."
                              maxLength="1000"
                              rows="4"
                            />


                            <small>

                              {
                                currentResponse.length
                              }
                              /1000

                            </small>

                          </div>


                          <div className="owner-action-buttons">


                            <button
                              type="button"
                              className="accept-inquiry-button"
                              onClick={() =>
                                handleStatusUpdate(
                                  inquiry._id,
                                  "accepted"
                                )
                              }
                              disabled={
                                actionLoading ===
                                inquiry._id
                              }
                            >

                              {actionLoading ===
                              inquiry._id
                                ? "Processing..."
                                : "✓ Accept Inquiry"}

                            </button>


                            <button
                              type="button"
                              className="reject-inquiry-button"
                              onClick={() =>
                                handleStatusUpdate(
                                  inquiry._id,
                                  "rejected"
                                )
                              }
                              disabled={
                                actionLoading ===
                                inquiry._id
                              }
                            >

                              {actionLoading ===
                              inquiry._id
                                ? "Processing..."
                                : "✕ Reject Inquiry"}

                            </button>


                          </div>

                        </div>

                      )}


                      {/* =========================
                          VIEW PROPERTY
                      ========================= */}

                      {property?._id && (

                        <div className="owner-inquiry-footer">

                          <Link
                            to={`/properties/${property._id}`}
                            className="owner-view-property-button"
                          >
                            View Property
                          </Link>

                        </div>

                      )}

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


export default OwnerInquiries;