import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../services/api";

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
    const statusClasses = {
      pending: "border border-yellow-300/15 bg-yellow-400/10 text-yellow-300",
      accepted: "border border-teal-300/15 bg-teal-500/10 text-teal-300",
      rejected: "border border-red-400/15 bg-red-500/10 text-red-400",
      withdrawn: "border border-slate-700 bg-slate-800 text-slate-400",
    };
    return `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize whitespace-nowrap ${statusClasses[status] || ""}`;

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="owner-inquiries-page [min-height:75vh] [padding:50px_20px] [background:#0b1120]">

        <div className="owner-inquiries-container [max-width:1150px] [margin:0_auto]">

          <div className="owner-inquiries-state [padding:60px_20px] [text-align:center] [color:#94a3b8]">

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

      <div className="owner-inquiries-page [min-height:75vh] [padding:50px_20px] [background:#0b1120]">

        <div className="owner-inquiries-container [max-width:1150px] [margin:0_auto]">

          <div className="owner-inquiries-state owner-inquiries-error [padding:60px_20px] [text-align:center] [color:#94a3b8] [color:#f87171]">

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

    <div className="owner-inquiries-page [min-height:75vh] [padding:50px_20px] [background:#0b1120]">

      <div className="owner-inquiries-container [max-width:1150px] [margin:0_auto]">


        {/* =================================
            HEADER
        ================================= */}

        <div className="owner-inquiries-header [display:flex] [align-items:center] [justify-content:space-between] [gap:25px] [margin-bottom:35px] [&_h1]:[margin:0_0_8px] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:32px] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:15px] max-[800px]:[flex-direction:column] max-[800px]:[align-items:flex-start]">

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
            className="owner-inquiries-back-button [display:inline-flex] [align-items:center] [justify-content:center] [padding:11px_18px] [border-radius:8px] [background:#0d9488] [color:#ffffff] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)]"
          >
            My Properties
          </Link>

        </div>


        {/* =================================
            EMPTY STATE
        ================================= */}

        {inquiries.length === 0 ? (

          <div className="owner-inquiries-empty [padding:70px_25px] [text-align:center] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [box-shadow:0_10px_30px_rgba(0,_0,_0,_0.2)] [&_h2]:[margin:0_0_8px] [&_h2]:[color:#f8fafc] [&_p]:[max-width:500px] [&_p]:[margin:0_auto_25px] [&_p]:[color:#94a3b8] [&_p]:[line-height:1.6]">

            <div className="owner-inquiries-empty-icon [margin-bottom:15px] [color:#5eead4] [font-size:45px]">
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
              className="owner-inquiries-back-button [display:inline-flex] [align-items:center] [justify-content:center] [padding:11px_18px] [border-radius:8px] [background:#0d9488] [color:#ffffff] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease] hover:[background:#14b8a6] hover:[transform:translateY(-1px)]"
            >
              View My Properties
            </Link>

          </div>

        ) : (

          <div className="owner-inquiries-list [display:flex] [flex-direction:column] [gap:24px]">

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
                    className="owner-inquiry-card [display:grid] [grid-template-columns:250px_1fr] [overflow:hidden] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [box-shadow:0_10px_30px_rgba(0,_0,_0,_0.28)] max-[800px]:[grid-template-columns:1fr]"
                    key={inquiry._id}
                  >


                    {/* =========================
                        PROPERTY IMAGE
                    ========================= */}

                    <div className="owner-inquiry-image [min-height:420px] [background:#0f172a] [&_img]:[width:100%] [&_img]:[height:100%] [&_img]:[min-height:420px] [&_img]:[object-fit:cover] max-[800px]:[min-height:240px] max-[800px]:[height:240px] max-[800px]:[&_img]:[min-height:240px] max-[800px]:[&_img]:[height:240px]">

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

                        <div className="owner-inquiry-no-image [width:100%] [height:100%] [min-height:420px] [display:flex] [align-items:center] [justify-content:center] [background:#0f172a] [color:#64748b] [font-size:50px] max-[800px]:[min-height:240px] max-[800px]:[height:240px]">
                          🏠
                        </div>

                      )}

                    </div>


                    {/* =========================
                        CONTENT
                    ========================= */}

                    <div className="owner-inquiry-content [padding:28px]">


                      {/* =========================
                          TOP
                      ========================= */}

                      <div className="owner-inquiry-top [display:flex] [align-items:flex-start] [justify-content:space-between] [gap:20px] [&_h2]:[margin:0_0_7px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:23px] max-[800px]:[flex-direction:column]">

                        <div>

                          <h2>

                            {property?.title ||
                              "Property"}

                          </h2>


                          <p className="owner-inquiry-location [margin:0] [color:#94a3b8] [font-size:14px]">

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

                      <div className="seeker-information [margin-top:24px] [padding:18px] [border-radius:10px] [background:#0f172a] [border:1px_solid_#273449] [&_h3]:[margin:0_0_13px] [&_h3]:[color:#e2e8f0] [&_h3]:[font-size:15px]">

                        <h3>
                          Seeker Details
                        </h3>


                        <div className="seeker-details-grid [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:18px] [&_div]:[display:flex] [&_div]:[flex-direction:column] [&_div]:[gap:5px] [&_span]:[color:#64748b] [&_span]:[font-size:12px] [&_strong]:[color:#e2e8f0] [&_strong]:[font-size:14px] [&_strong]:[word-break:break-word] max-[800px]:[grid-template-columns:1fr]">


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

                      <div className="owner-property-information [&_div]:[display:flex] [&_div]:[flex-direction:column] [&_div]:[gap:5px] [&_span]:[color:#64748b] [&_span]:[font-size:12px] [&_strong]:[color:#e2e8f0] [&_strong]:[font-size:14px] [&_strong]:[word-break:break-word] [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:15px] [margin-top:15px] [padding:17px] [border:1px_solid_#273449] [border-radius:10px] [background:#111827] max-[800px]:[grid-template-columns:1fr]">


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

                      <div className="seeker-message [&_h3]:[margin:0_0_13px] [&_h3]:[color:#e2e8f0] [&_h3]:[font-size:15px] [margin-top:15px] [padding:17px] [border-radius:10px] [background:#0f172a] [border:1px_solid_#273449] [&_p]:[margin:0] [&_p]:[color:#cbd5e1] [&_p]:[font-size:14px] [&_p]:[line-height:1.6]">

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

                        <div className="existing-owner-response [&_h3]:[margin:0_0_13px] [&_h3]:[color:#e2e8f0] [&_h3]:[font-size:15px] [&_p]:[margin:0] [&_p]:[color:#cbd5e1] [&_p]:[font-size:14px] [&_p]:[line-height:1.6] [margin-top:15px] [padding:17px] [border-radius:10px] [background:rgba(20,_184,_166,_0.1)] [border:1px_solid_rgba(45,_212,_191,_0.12)]">

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

                        <div className="owner-action-section [margin-top:20px] [padding:20px] [border:1px_solid_#273449] [border-radius:10px] [background:#111827]">


                          <div className="owner-response-field [display:flex] [flex-direction:column] [gap:8px] [&_label]:[color:#e2e8f0] [&_label]:[font-size:14px] [&_label]:[font-weight:600] [&_textarea]:[width:100%] [&_textarea]:[box-sizing:border-box] [&_textarea]:[padding:12px_14px] [&_textarea]:[border:1px_solid_#334155] [&_textarea]:[border-radius:8px] [&_textarea]:[resize:vertical] [&_textarea]:[font-family:inherit] [&_textarea]:[font-size:14px] [&_textarea]:[color:#f8fafc] [&_textarea]:[background:#0f172a] [&_textarea]:[outline:none] [&_textarea]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [&_textarea::placeholder]:[color:#64748b] [&_textarea:focus]:[border-color:#14b8a6] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.12)] [&_small]:[align-self:flex-end] [&_small]:[color:#64748b] [&_small]:[font-size:12px]">

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


                          <div className="owner-action-buttons [display:flex] [gap:12px] [margin-top:18px] max-[800px]:[flex-direction:column]">


                            <button
                              type="button"
                              className="accept-inquiry-button [padding:11px_18px] [border-radius:8px] [font-size:14px] [font-weight:600] [cursor:pointer] [transition:background_0.2s_ease,_border-color_0.2s_ease,_transform_0.2s_ease] [border:1px_solid_#0d9488] [background:#0d9488] [color:#ffffff] hover:[background:#14b8a6] hover:[border-color:#14b8a6] hover:[transform:translateY(-1px)] disabled:[opacity:0.6] disabled:[cursor:not-allowed] disabled:[transform:none] max-[800px]:[width:100%]"
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
                              className="reject-inquiry-button [padding:11px_18px] [border-radius:8px] [font-size:14px] [font-weight:600] [cursor:pointer] [transition:background_0.2s_ease,_border-color_0.2s_ease,_transform_0.2s_ease] [border:1px_solid_#334155] [background:#1e293b] [color:#f87171] hover:[background:rgba(239,_68,_68,_0.12)] hover:[border-color:#7f1d1d] disabled:[opacity:0.6] disabled:[cursor:not-allowed] disabled:[transform:none] max-[800px]:[width:100%]"
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

                        <div className="owner-inquiry-footer [margin-top:20px]">

                          <Link
                            to={`/properties/${property._id}`}
                            className="owner-view-property-button [display:inline-flex] [padding:10px_17px] [border:1px_solid_#334155] [border-radius:8px] [background:#1e293b] [color:#cbd5e1] [text-decoration:none] [font-size:13px] [font-weight:600] [transition:background_0.2s_ease,_border-color_0.2s_ease] hover:[background:#273449] hover:[border-color:#475569]"
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
