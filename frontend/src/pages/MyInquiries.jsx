import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../services/api";

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
    const statusClasses = {
      pending: "border border-yellow-300/15 bg-yellow-400/10 text-yellow-300",
      accepted: "border border-teal-300/15 bg-teal-500/10 text-teal-300",
      rejected: "border border-red-400/15 bg-red-500/10 text-red-300",
      withdrawn: "border border-slate-700 bg-slate-800 text-slate-400",
    };
    return `inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize whitespace-nowrap ${statusClasses[status] || ""}`;

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="inquiries-page [min-height:75vh] [padding:50px_20px] [background:#0b1120] max-[750px]:[padding:35px_15px_50px]">

        <div className="inquiries-container [max-width:1100px] [margin:0_auto]">

          <div className="inquiries-state [padding:60px_20px] [text-align:center] [color:#94a3b8]">

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

      <div className="inquiries-page [min-height:75vh] [padding:50px_20px] [background:#0b1120] max-[750px]:[padding:35px_15px_50px]">

        <div className="inquiries-container [max-width:1100px] [margin:0_auto]">

          <div className="inquiries-state inquiries-error [padding:60px_20px] [text-align:center] [color:#94a3b8] [color:#fca5a5]">

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

    <div className="inquiries-page [min-height:75vh] [padding:50px_20px] [background:#0b1120] max-[750px]:[padding:35px_15px_50px]">

      <div className="inquiries-container [max-width:1100px] [margin:0_auto]">


        {/* =================================
            HEADER
        ================================= */}

        <div className="inquiries-header [display:flex] [align-items:center] [justify-content:space-between] [gap:25px] [margin-bottom:35px] [&_h1]:[margin:0_0_8px] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:32px] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:15px] max-[750px]:[flex-direction:column] max-[750px]:[align-items:flex-start]">

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
            className="browse-properties-button [display:inline-flex] [align-items:center] [justify-content:center] [padding:11px_18px] [border-radius:8px] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] [background:#0d9488] [color:#ffffff] [box-shadow:0_6px_18px_rgba(20,_184,_166,_0.15)] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_8px_22px_rgba(20,_184,_166,_0.25)]"
          >
            Find More Properties
          </Link>

        </div>


        {/* =================================
            EMPTY STATE
        ================================= */}

        {inquiries.length === 0 ? (

          <div className="inquiries-empty [padding:70px_25px] [text-align:center] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)] [&_h2]:[margin:0_0_8px] [&_h2]:[color:#f8fafc] [&_p]:[margin:0_0_25px] [&_p]:[color:#94a3b8]">

            <div className="inquiries-empty-icon [margin-bottom:15px] [font-size:45px]">
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
              className="browse-properties-button [display:inline-flex] [align-items:center] [justify-content:center] [padding:11px_18px] [border-radius:8px] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] [background:#0d9488] [color:#ffffff] [box-shadow:0_6px_18px_rgba(20,_184,_166,_0.15)] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_8px_22px_rgba(20,_184,_166,_0.25)]"
            >
              Explore Properties
            </Link>

          </div>

        ) : (

          <div className="inquiries-list [display:flex] [flex-direction:column] [gap:22px]">

            {inquiries.map(
              (inquiry) => {

                const property =
                  inquiry.property;


                return (

                  <div
                    className="inquiry-card [display:grid] [grid-template-columns:230px_1fr] [overflow:hidden] [border:1px_solid_#273449] [border-radius:14px] [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [box-shadow:0_8px_25px_rgba(0,_0,_0,_0.25)] [transition:transform_0.2s_ease,_border-color_0.2s_ease,_box-shadow_0.2s_ease] hover:[transform:translateY(-3px)] hover:[border-color:#334155] hover:[box-shadow:0_14px_35px_rgba(0,_0,_0,_0.35)] max-[750px]:[grid-template-columns:1fr]"
                    key={inquiry._id}
                  >


                    {/* =========================
                        PROPERTY IMAGE
                    ========================= */}

                    <div className="inquiry-card-image [min-height:300px] [background:linear-gradient(_135deg,_#172033,_#0f292b_)] [&_img]:[width:100%] [&_img]:[height:100%] [&_img]:[min-height:300px] [&_img]:[object-fit:cover] max-[750px]:[min-height:220px] max-[750px]:[height:220px] max-[750px]:[&_img]:[min-height:220px] max-[750px]:[&_img]:[height:220px]">

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

                        <div className="inquiry-no-image [width:100%] [height:100%] [min-height:300px] [display:flex] [align-items:center] [justify-content:center] [font-size:48px] [color:#64748b] max-[750px]:[min-height:220px] max-[750px]:[height:220px]">
                          🏠
                        </div>

                      )}

                    </div>


                    {/* =========================
                        CONTENT
                    ========================= */}

                    <div className="inquiry-card-content [padding:25px]">


                      <div className="inquiry-card-top [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:20px] [&_h2]:[margin:0_0_7px] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:22px] max-[750px]:[flex-direction:column]">

                        <div>

                          <h2>

                            {property?.title ||
                              "Property"}

                          </h2>


                          <p className="inquiry-location [margin:0] [color:#94a3b8] [font-size:14px]">

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

                      <div className="inquiry-property-details [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:15px] [margin:22px_0] [padding:17px] [border-radius:10px] [background:#0f172a] [border:1px_solid_#1e293b] [&_div]:[display:flex] [&_div]:[flex-direction:column] [&_div]:[gap:5px] [&_span]:[color:#64748b] [&_span]:[font-size:12px] [&_strong]:[color:#e2e8f0] [&_strong]:[font-size:14px] max-[750px]:[grid-template-columns:1fr]">


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

                      <div className="inquiry-message [padding:16px] [margin-top:15px] [border-radius:9px] [border:1px_solid_#273449] [background:#0f172a] [&_h3]:[margin:0_0_8px] [&_h3]:[font-size:14px] [&_h3]:[color:#e2e8f0] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] [&_p]:[line-height:1.6]">

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

                        <div className="owner-response [padding:16px] [margin-top:15px] [border-radius:9px] [border:1px_solid_#273449] [background:rgba(20,_184,_166,_0.08)] [border-color:rgba(45,_212,_191,_0.15)] [&_h3]:[margin:0_0_8px] [&_h3]:[font-size:14px] [&_h3]:[color:#e2e8f0] [&_p]:[margin:0] [&_p]:[color:#94a3b8] [&_p]:[font-size:14px] [&_p]:[line-height:1.6]">

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

                      <div className="inquiry-actions [display:flex] [align-items:center] [gap:12px] [margin-top:22px] max-[750px]:[flex-direction:column] max-[750px]:[align-items:stretch]">


                        {property?._id && (

                          <Link
                            to={`/properties/${property._id}`}
                            className="view-property-button [margin-left:auto] [border:1px_solid_#0d9488] [background:transparent] [color:#5eead4] [border-radius:8px] [padding:8px_15px] [font-size:11px] [font-weight:700] [cursor:pointer] [transition:background_0.2s_ease,_color_0.2s_ease] hover:[background:#0d9488] hover:[color:#ffffff] max-[430px]:[padding:7px_9px] max-[430px]:[font-size:10px] [display:inline-flex] [align-items:center] [justify-content:center] [padding:11px_18px] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] [background:#0d9488] [color:#ffffff] [box-shadow:0_5px_15px_rgba(20,_184,_166,_0.12)] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_7px_18px_rgba(20,_184,_166,_0.2)] max-[750px]:[width:100%]"
                          >
                            View Property
                          </Link>

                        )}


                        {inquiry.status ===
                          "pending" && (

                          <button
                            type="button"
                            className="withdraw-button [padding:10px_16px] [border:1px_solid_#334155] [border-radius:8px] [background:#111827] [color:#cbd5e1] [font-size:13px] [font-weight:600] [cursor:pointer] [transition:background_0.2s_ease,_border-color_0.2s_ease,_color_0.2s_ease] hover:[background:#1e293b] hover:[border-color:#475569] hover:[color:#f8fafc] disabled:[opacity:0.6] disabled:[cursor:not-allowed] max-[750px]:[width:100%]"
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
