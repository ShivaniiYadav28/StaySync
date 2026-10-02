import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import api from "../services/api";

import { useAuth } from "../context/useAuth";

import "./PropertyDetails.css";


function PropertyDetails() {

  const { id } = useParams();


  const {
    isAuthenticated,
    user,
  } = useAuth();


  const [property, setProperty] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);


  // =========================================
  // FAVORITES
  // =========================================

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);


  // =========================================
  // INQUIRY
  // =========================================

  const [showInquiryForm, setShowInquiryForm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [moveInDate, setMoveInDate] =
    useState("");

  const [inquiryLoading, setInquiryLoading] =
    useState(false);

  const [inquirySuccess, setInquirySuccess] =
    useState("");

  const [inquiryError, setInquiryError] =
    useState("");


  // =========================================
  // REVIEWS
  // =========================================

  const [reviews, setReviews] =
    useState([]);

  const [averageRating, setAverageRating] =
    useState(0);

  const [reviewCount, setReviewCount] =
    useState(0);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [reviewError, setReviewError] =
    useState("");

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [reviewDeleting, setReviewDeleting] =
    useState(null);


  // =========================================
  // LOAD PROPERTY
  // =========================================

  useEffect(() => {

    let isMounted = true;


    const loadProperty = async () => {

      try {

        const response =
          await api.get(
            `/properties/${id}`
          );


        if (isMounted) {

          setProperty(
            response.data.property
          );

          setSelectedImage(0);

        }

      } catch (error) {

        console.error(
          "Load property error:",
          error
        );


        if (isMounted) {

          setError(
            error.response?.data?.message ||
              "Property could not be found."
          );

        }

      } finally {

        if (isMounted) {

          setLoading(false);

        }

      }

    };


    loadProperty();


    return () => {

      isMounted = false;

    };

  }, [id]);


  // =========================================
  // LOAD REVIEWS
  // =========================================

  useEffect(() => {

    let isMounted = true;


    const loadReviews = async () => {

      try {

        setReviewsLoading(true);
        setReviewError("");


        const response =
          await api.get(
            `/reviews/property/${id}`
          );


        if (!isMounted) {

          return;

        }


        setReviews(
          response.data.reviews || []
        );

        setAverageRating(
          Number(
            response.data.averageRating || 0
          )
        );

        setReviewCount(
          Number(
            response.data.reviewCount || 0
          )
        );


      } catch (error) {

        console.error(
          "Load reviews error:",
          error
        );


        if (isMounted) {

          setReviewError(
            error.response?.data?.message ||
              "Unable to load reviews."
          );

        }

      } finally {

        if (isMounted) {

          setReviewsLoading(false);

        }

      }

    };


    loadReviews();


    return () => {

      isMounted = false;

    };

  }, [id]);


  // =========================================
  // CHECK FAVORITE
  // =========================================

  useEffect(() => {

    let isMounted = true;


    const checkFavoriteStatus =
      async () => {

        if (
          !isAuthenticated ||
          user?.role !== "seeker"
        ) {

          if (isMounted) {

            setIsFavorite(false);

          }

          return;

        }


        try {

          const response =
            await api.get(
              `/favorites/check/${id}`
            );


          if (isMounted) {

            setIsFavorite(
              Boolean(
                response.data.isFavorite
              )
            );

          }

        } catch (error) {

          console.error(
            "Favorite check error:",
            error
          );


          if (isMounted) {

            setIsFavorite(false);

          }

        }

      };


    checkFavoriteStatus();


    return () => {

      isMounted = false;

    };

  }, [
    id,
    isAuthenticated,
    user,
  ]);


  // =========================================
  // FAVORITE TOGGLE
  // =========================================

  const handleFavoriteToggle =
    async () => {

      if (!isAuthenticated) {

        alert(
          "Please login as a seeker to save properties."
        );

        return;

      }


      if (user?.role !== "seeker") {

        alert(
          "Only seekers can save properties."
        );

        return;

      }


      try {

        setFavoriteLoading(true);


        if (isFavorite) {

          await api.delete(
            `/favorites/${id}`
          );


          setIsFavorite(false);

        } else {

          await api.post(
            `/favorites/${id}`
          );


          setIsFavorite(true);

        }

      } catch (error) {

        console.error(
          "Favorite toggle error:",
          error
        );


        const status =
          error.response?.status;


        if (status === 409) {

          setIsFavorite(true);


          alert(
            "This property is already in your favorites."
          );

        } else if (status === 401) {

          alert(
            "Please login again to continue."
          );

        } else if (status === 403) {

          alert(
            "Only seekers can save properties."
          );

        } else {

          alert(
            error.response?.data?.message ||
              "Unable to update favorites."
          );

        }

      } finally {

        setFavoriteLoading(false);

      }

    };


  // =========================================
  // OPEN INQUIRY FORM
  // =========================================

  const handleOpenInquiry =
    () => {

      if (!isAuthenticated) {

        alert(
          "Please login as a seeker to contact the owner."
        );

        return;

      }


      if (user?.role !== "seeker") {

        alert(
          "Only seekers can contact property owners."
        );

        return;

      }


      setInquiryError("");
      setInquirySuccess("");
      setShowInquiryForm(true);

    };


  // =========================================
  // CLOSE INQUIRY FORM
  // =========================================

  const handleCloseInquiry =
    () => {

      if (inquiryLoading) {

        return;

      }


      setShowInquiryForm(false);
      setInquiryError("");

    };


  // =========================================
  // SEND INQUIRY
  // =========================================

  const handleSendInquiry =
    async (event) => {

      event.preventDefault();


      setInquiryError("");
      setInquirySuccess("");


      if (
        message.trim().length < 10
      ) {

        setInquiryError(
          "Message must contain at least 10 characters."
        );

        return;

      }


      if (
        message.trim().length > 1000
      ) {

        setInquiryError(
          "Message cannot exceed 1000 characters."
        );

        return;

      }


      try {

        setInquiryLoading(true);


        const response =
          await api.post(
            `/inquiries/property/${id}`,
            {
              message:
                message.trim(),

              moveInDate:
                moveInDate || null,
            }
          );


        setInquirySuccess(
          response.data.message ||
            "Inquiry sent successfully."
        );


        setMessage("");
        setMoveInDate("");

      } catch (error) {

        console.error(
          "Send inquiry error:",
          error
        );


        setInquiryError(
          error.response?.data?.message ||
            "Unable to send inquiry."
        );

      } finally {

        setInquiryLoading(false);

      }

    };


  // =========================================
  // SUBMIT REVIEW
  // =========================================

  const handleSubmitReview =
    async (event) => {

      event.preventDefault();


      setReviewError("");


      if (!isAuthenticated) {

        setReviewError(
          "Please login as a seeker to write a review."
        );

        return;

      }


      if (user?.role !== "seeker") {

        setReviewError(
          "Only seekers can write reviews."
        );

        return;

      }


      if (
        !Number.isInteger(
          Number(reviewRating)
        ) ||
        Number(reviewRating) < 1 ||
        Number(reviewRating) > 5
      ) {

        setReviewError(
          "Please select a rating between 1 and 5."
        );

        return;

      }


      if (
        reviewComment.trim().length < 5
      ) {

        setReviewError(
          "Review comment must contain at least 5 characters."
        );

        return;

      }


      if (
        reviewComment.trim().length > 1000
      ) {

        setReviewError(
          "Review comment cannot exceed 1000 characters."
        );

        return;

      }


      try {

        setReviewSubmitting(true);


        const response =
          await api.post(
            `/reviews/${id}`,
            {
              rating:
                Number(reviewRating),

              comment:
                reviewComment.trim(),
            }
          );


        const newReview =
          response.data.review;


        setReviews(
          (previous) => [
            newReview,
            ...previous,
          ]
        );


        setReviewCount(
          (previous) =>
            previous + 1
        );


        const newCount =
          reviewCount + 1;

        const newAverage =
          (
            (
              averageRating *
                reviewCount
            ) +
            Number(reviewRating)
          ) /
          newCount;


        setAverageRating(
          Number(
            newAverage.toFixed(1)
          )
        );


        setReviewRating(0);
        setReviewComment("");


      } catch (error) {

        console.error(
          "Submit review error:",
          error
        );


        setReviewError(
          error.response?.data?.message ||
            "Unable to submit review."
        );

      } finally {

        setReviewSubmitting(false);

      }

    };


  // =========================================
  // DELETE REVIEW
  // =========================================

  const handleDeleteReview =
    async (reviewId) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this review?"
        );


      if (!confirmed) {

        return;

      }


      try {

        setReviewDeleting(
          reviewId
        );


        await api.delete(
          `/reviews/${reviewId}`
        );


        const deletedReview =
          reviews.find(
            (review) =>
              review._id === reviewId
          );


        const remainingReviews =
          reviews.filter(
            (review) =>
              review._id !== reviewId
          );


        setReviews(
          remainingReviews
        );


        const oldCount =
          reviewCount;

        const newCount =
          Math.max(
            oldCount - 1,
            0
          );


        const oldTotal =
          averageRating *
          oldCount;

        const deletedRating =
          Number(
            deletedReview?.rating || 0
          );

        const newTotal =
          oldTotal -
          deletedRating;


        const newAverage =
          newCount > 0
            ? newTotal / newCount
            : 0;


        setReviewCount(
          newCount
        );

        setAverageRating(
          Number(
            newAverage.toFixed(1)
          )
        );


      } catch (error) {

        console.error(
          "Delete review error:",
          error
        );


        alert(
          error.response?.data?.message ||
            "Unable to delete review."
        );

      } finally {

        setReviewDeleting(null);

      }

    };


  // =========================================
  // REVIEW DATE
  // =========================================

  const formatReviewDate =
    (date) => {

      if (!date) {

        return "";

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
  // RATING STARS
  // =========================================

  const renderStars =
    (rating) => {

      const numericRating =
        Number(rating) || 0;


      return (

        <div
          className="review-stars"
          aria-label={`${numericRating} out of 5 stars`}
        >

          {[1, 2, 3, 4, 5].map(
            (star) => (

              <span
                key={star}
                className={
                  star <= numericRating
                    ? "review-star active"
                    : "review-star"
                }
              >
                ★
              </span>

            )
          )}

        </div>

      );

    };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="details-state">

        Loading property...

      </div>

    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (error || !property) {

    return (

      <div className="details-state error">

        {error ||
          "Property not found."}

      </div>

    );

  }


  // =========================================
  // GALLERY
  // =========================================

  const images =
    property.images || [];

  const hasImages =
    images.length > 0;

  const currentImage =
    images[selectedImage];


  const showPreviousImage =
    () => {

      setSelectedImage(
        (previous) =>
          previous === 0
            ? images.length - 1
            : previous - 1
      );

    };


  const showNextImage =
    () => {

      setSelectedImage(
        (previous) =>
          previous ===
          images.length - 1
            ? 0
            : previous + 1
      );

    };


  return (

    <div className="property-details-page">

      <div className="details-container">


        <Link
          to="/properties"
          className="back-link"
        >
          ← Back to properties
        </Link>


        <div className="details-card">


          {/* =================================
              IMAGE GALLERY
          ================================= */}

          <div className="details-gallery">

            <div className="details-main-image">

              {hasImages ? (

                <>

                  <img
                    src={currentImage.url}
                    alt={`${property.title} ${
                      selectedImage + 1
                    }`}
                  />


                  <span className="property-type-badge">
                    {property.propertyType}
                  </span>


                  {images.length > 1 && (

                    <>

                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-left"
                        onClick={
                          showPreviousImage
                        }
                        aria-label="Previous image"
                      >
                        ‹
                      </button>


                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-right"
                        onClick={
                          showNextImage
                        }
                        aria-label="Next image"
                      >
                        ›
                      </button>


                      <div className="image-counter">

                        {selectedImage + 1} /{" "}

                        {images.length}

                      </div>

                    </>

                  )}

                </>

              ) : (

                <>

                  <div className="no-image-placeholder">

                    <span className="no-image-icon">
                      🏠
                    </span>

                    <span>
                      No property image
                    </span>

                  </div>


                  <span className="property-type-badge">
                    {property.propertyType}
                  </span>

                </>

              )}

            </div>


            {images.length > 1 && (

              <div className="image-thumbnails">

                {images.map(
                  (image, index) => (

                    <button
                      type="button"
                      key={
                        image._id ||
                        image.publicId ||
                        index
                      }
                      className={`image-thumbnail ${
                        selectedImage === index
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedImage(
                          index
                        )
                      }
                    >

                      <img
                        src={image.url}
                        alt={`Thumbnail ${
                          index + 1
                        }`}
                      />

                    </button>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================
              PROPERTY INFORMATION
          ================================= */}

          <div className="details-content">


            <div className="details-title">

              <div>

                <h1>
                  {property.title}
                </h1>

                <p>
                  📍 {property.address},{" "}
                  {property.area},{" "}
                  {property.city} -{" "}
                  {property.pincode}
                </p>

              </div>


              <div className="details-price">

                ₹{property.rent}

                <small>
                  /month
                </small>

              </div>

            </div>


            {/* =================================
                RATING SUMMARY
            ================================= */}

            <div className="property-rating-summary">

              <div className="rating-summary-stars">

                {renderStars(
                  Math.round(
                    averageRating
                  )
                )}

              </div>


              <div className="rating-summary-value">

                <strong>
                  {averageRating.toFixed(1)}
                </strong>

                <span>
                  / 5
                </span>

              </div>


              <div className="rating-summary-count">

                {reviewCount === 1
                  ? "1 review"
                  : `${reviewCount} reviews`}

              </div>

            </div>


            {/* =================================
                FAVORITE
            ================================= */}

            {user?.role === "seeker" && (

              <div className="details-favorite-wrapper">

                <button
                  type="button"
                  className={`details-favorite-button ${
                    isFavorite
                      ? "details-favorite-active"
                      : ""
                  }`}
                  onClick={
                    handleFavoriteToggle
                  }
                  disabled={
                    favoriteLoading
                  }
                >

                  <span>

                    {isFavorite
                      ? "♥"
                      : "♡"}

                  </span>


                  {favoriteLoading
                    ? "Saving..."
                    : isFavorite
                    ? "Saved to Favorites"
                    : "Save Property"}

                </button>

              </div>

            )}


            {/* =================================
                PROPERTY GRID
            ================================= */}

            <div className="details-grid">

              <div>

                <span>
                  Property
                </span>

                <strong>
                  {property.propertyType}
                </strong>

              </div>


              <div>

                <span>
                  Suitable for
                </span>

                <strong>
                  {property.gender}
                </strong>

              </div>


              <div>

                <span>
                  Room
                </span>

                <strong>
                  {property.roomType}
                </strong>

              </div>


              <div>

                <span>
                  Deposit
                </span>

                <strong>
                  ₹{property.deposit}
                </strong>

              </div>


              <div>

                <span>
                  Available
                </span>

                <strong>
                  {property.availableRooms}{" "}
                  rooms
                </strong>

              </div>

            </div>


            {/* =================================
                DESCRIPTION
            ================================= */}

            <section>

              <h2>
                About this place
              </h2>

              <p className="details-description">
                {property.description}
              </p>

            </section>


            {/* =================================
                AMENITIES
            ================================= */}

            <section>

              <h2>
                Amenities
              </h2>

              <div className="amenities">

                {property.amenities?.length >
                0 ? (

                  property.amenities.map(
                    (
                      amenity,
                      index
                    ) => (

                      <span
                        key={index}
                      >
                        ✓ {amenity}
                      </span>

                    )
                  )

                ) : (

                  <span>
                    No amenities listed.
                  </span>

                )}

              </div>

            </section>


            {/* =================================
                HOUSE RULES
            ================================= */}

            <section>

              <h2>
                House rules
              </h2>

              {property.rules?.length >
              0 ? (

                <ul className="rules">

                  {property.rules.map(
                    (
                      rule,
                      index
                    ) => (

                      <li
                        key={index}
                      >
                        {rule}
                      </li>

                    )
                  )}

                </ul>

              ) : (

                <p>
                  No specific house
                  rules listed.
                </p>

              )}

            </section>


            {/* =================================
                OWNER
            ================================= */}

            {property.owner && (

              <section className="owner-section">

                <h2>
                  Listed by
                </h2>

                <p>

                  <strong>
                    {property.owner.name}
                  </strong>

                </p>

                <p>
                  {property.owner.email}
                </p>

              </section>

            )}


            {/* =================================
                CONTACT OWNER
            ================================= */}

            {user?.role === "seeker" && (

              <button
                className="inquiry-btn"
                type="button"
                onClick={
                  handleOpenInquiry
                }
              >
                Contact Owner
              </button>

            )}


            {/* =================================
                INQUIRY FORM
            ================================= */}

            {showInquiryForm && (

              <div className="inquiry-form-wrapper">

                <div className="inquiry-form-header">

                  <div>

                    <h2>
                      Contact Owner
                    </h2>

                    <p>
                      Send an inquiry about
                      this property.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="inquiry-close-button"
                    onClick={
                      handleCloseInquiry
                    }
                    disabled={
                      inquiryLoading
                    }
                  >
                    ×
                  </button>

                </div>


                {inquirySuccess && (

                  <div className="inquiry-success">
                    {inquirySuccess}
                  </div>

                )}


                {inquiryError && (

                  <div className="inquiry-error">
                    {inquiryError}
                  </div>

                )}


                {!inquirySuccess && (

                  <form
                    className="inquiry-form"
                    onSubmit={
                      handleSendInquiry
                    }
                  >

                    <div className="inquiry-field">

                      <label htmlFor="moveInDate">
                        Preferred Move-in Date
                      </label>


                      <input
                        id="moveInDate"
                        type="date"
                        value={
                          moveInDate
                        }
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(event) =>
                          setMoveInDate(
                            event.target.value
                          )
                        }
                      />

                    </div>


                    <div className="inquiry-field">

                      <label htmlFor="message">
                        Message *
                      </label>


                      <textarea
                        id="message"
                        value={message}
                        onChange={(event) =>
                          setMessage(
                            event.target.value
                          )
                        }
                        placeholder="Hi, I am interested in this property. I would like to know more about availability and the room."
                        rows="6"
                        maxLength="1000"
                        required
                      />


                      <small>
                        {message.length}/1000
                      </small>

                    </div>


                    <button
                      type="submit"
                      className="inquiry-submit-button"
                      disabled={
                        inquiryLoading
                      }
                    >

                      {inquiryLoading
                        ? "Sending..."
                        : "Send Inquiry"}

                    </button>

                  </form>

                )}

              </div>

            )}


            {/* =================================
                REVIEWS & RATINGS
            ================================= */}

            <section className="reviews-section">

              <div className="reviews-section-header">

                <div>

                  <h2>
                    Reviews & Ratings
                  </h2>

                  <p>
                    See what previous seekers
                    say about this property.
                  </p>

                </div>


                {reviewCount > 0 && (

                  <div className="reviews-header-rating">

                    <strong>
                      {averageRating.toFixed(1)}
                    </strong>

                    <div>

                      {renderStars(
                        Math.round(
                          averageRating
                        )
                      )}

                      <span>
                        {reviewCount === 1
                          ? "1 review"
                          : `${reviewCount} reviews`}
                      </span>

                    </div>

                  </div>

                )}

              </div>


              {/* REVIEW ERROR */}

              {reviewError && (

                <div className="review-error">
                  {reviewError}
                </div>

              )}


              {/* REVIEW FORM */}

              {isAuthenticated &&
                user?.role === "seeker" && (

                <div className="review-form-wrapper">

                  <h3>
                    Share your experience
                  </h3>

                  <p>
                    Have you stayed here?
                    Leave a review for other
                    seekers.
                  </p>


                  <form
                    className="review-form"
                    onSubmit={
                      handleSubmitReview
                    }
                  >

                    <div className="review-rating-field">

                      <label>
                        Your Rating
                      </label>


                      <div className="rating-selector">

                        {[1, 2, 3, 4, 5].map(
                          (star) => (

                            <button
                              key={star}
                              type="button"
                              className={
                                star <=
                                reviewRating
                                  ? "rating-star selected"
                                  : "rating-star"
                              }
                              onClick={() =>
                                setReviewRating(
                                  star
                                )
                              }
                              aria-label={`Rate ${star} out of 5`}
                            >
                              ★
                            </button>

                          )
                        )}

                      </div>

                    </div>


                    <div className="review-comment-field">

                      <label htmlFor="reviewComment">
                        Your Review
                      </label>


                      <textarea
                        id="reviewComment"
                        value={
                          reviewComment
                        }
                        onChange={(event) =>
                          setReviewComment(
                            event.target.value
                          )
                        }
                        placeholder="Share your experience with this property and owner..."
                        rows="5"
                        maxLength="1000"
                      />


                      <small>
                        {reviewComment.length}/1000
                      </small>

                    </div>


                    <button
                      type="submit"
                      className="review-submit-button"
                      disabled={
                        reviewSubmitting
                      }
                    >

                      {reviewSubmitting
                        ? "Submitting..."
                        : "Submit Review"}

                    </button>

                  </form>

                </div>

              )}


              {/* REVIEWS LIST */}

              <div className="reviews-list">

                {reviewsLoading ? (

                  <div className="reviews-state">
                    Loading reviews...
                  </div>

                ) : reviews.length === 0 ? (

                  <div className="reviews-empty">

                    <div className="reviews-empty-icon">
                      ★
                    </div>

                    <h3>
                      No reviews yet
                    </h3>

                    <p>
                      Be the first to share
                      your experience with
                      this property.
                    </p>

                  </div>

                ) : (

                  reviews.map(
                    (review) => (

                      <article
                        className="review-card"
                        key={review._id}
                      >

                        <div className="review-card-header">

                          <div>

                            <h3>
                              {review.seeker?.name ||
                                "Seeker"}
                            </h3>

                            <div className="review-card-meta">

                              {renderStars(
                                review.rating
                              )}

                              <span>
                                {formatReviewDate(
                                  review.createdAt
                                )}
                              </span>

                            </div>

                          </div>


                          {user?._id ===
                            review.seeker?._id && (

                            <button
                              type="button"
                              className="delete-review-button"
                              onClick={() =>
                                handleDeleteReview(
                                  review._id
                                )
                              }
                              disabled={
                                reviewDeleting ===
                                review._id
                              }
                            >

                              {reviewDeleting ===
                              review._id
                                ? "Deleting..."
                                : "Delete"}

                            </button>

                          )}

                        </div>


                        <p className="review-comment">
                          {review.comment}
                        </p>

                      </article>

                    )
                  )

                )}

              </div>

            </section>


          </div>

        </div>

      </div>

    </div>

  );

}


export default PropertyDetails;