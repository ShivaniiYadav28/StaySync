const mongoose = require("mongoose");

const Review = require("../models/Review");
const Property = require("../models/Property");
const Inquiry = require("../models/Inquiry");

const {
  createNotification,
} = require("../utils/notificationHelper");


// =========================================
// GET USER ID
// =========================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.user?.user_id ||
    null
  );
};


// =========================================
// CREATE REVIEW
// =========================================

const createReview = async (
  req,
  res
) => {

  try {

    const seekerId =
      getUserId(req);


    if (!seekerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const {
      propertyId,
    } = req.params;


    const {
      rating,
      comment,
    } = req.body;


    // -------------------------------------
    // Validate property ID
    // -------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        propertyId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid property ID.",
      });

    }


    // -------------------------------------
    // Validate rating
    // -------------------------------------

    const numericRating =
      Number(rating);


    if (
      !Number.isInteger(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Rating must be an integer between 1 and 5.",
      });

    }


    // -------------------------------------
    // Validate comment
    // -------------------------------------

    if (
      typeof comment !== "string"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Comment is required.",
      });

    }


    const trimmedComment =
      comment.trim();


    if (
      trimmedComment.length < 5
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Review comment must contain at least 5 characters.",
      });

    }


    if (
      trimmedComment.length > 1000
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Review comment cannot exceed 1000 characters.",
      });

    }


    // -------------------------------------
    // Find active property
    // -------------------------------------

    const property =
      await Property.findOne({
        _id: propertyId,
        isActive: true,
      });


    if (!property) {

      return res.status(404).json({
        success: false,
        message:
          "Property not found or inactive.",
      });

    }


    // -------------------------------------
    // Prevent owner from reviewing own
    // property
    // -------------------------------------

    if (
      property.owner.toString() ===
      seekerId.toString()
    ) {

      return res.status(403).json({
        success: false,
        message:
          "You cannot review your own property.",
      });

    }


    // -------------------------------------
    // Verify accepted inquiry
    // -------------------------------------

    const acceptedInquiry =
      await Inquiry.findOne({
        property: propertyId,
        seeker: seekerId,
        status: "accepted",
      });


    if (!acceptedInquiry) {

      return res.status(403).json({
        success: false,
        message:
          "You can review this property only after your inquiry has been accepted.",
      });

    }


    // -------------------------------------
    // Check duplicate review
    // -------------------------------------

    const existingReview =
      await Review.findOne({
        property: propertyId,
        seeker: seekerId,
      });


    if (existingReview) {

      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this property.",
        review:
          existingReview,
      });

    }


    // -------------------------------------
    // Create review
    // -------------------------------------

    const review =
      await Review.create({

        property:
          property._id,

        seeker:
          seekerId,

        rating:
          numericRating,

        comment:
          trimmedComment,

      });


    // -------------------------------------
    // Create owner notification
    // -------------------------------------

    await createNotification({

      recipient:
        property.owner,

      type:
        "new_review",

      title:
        "New property review",

      message:
        `A seeker has reviewed "${property.title}".`,

      property:
        property._id,

      review:
        review._id,

    });


    // -------------------------------------
    // Populate review
    // -------------------------------------

    const populatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "seeker",
          "name"
        )
        .populate(
          "property",
          "title area city"
        );


    return res.status(201).json({

      success: true,

      message:
        "Review added successfully.",

      review:
        populatedReview,

    });

  } catch (error) {

    console.error(
      "Create review error:",
      error
    );


    // -------------------------------------
    // Duplicate index safety
    // -------------------------------------

    if (
      error.code === 11000
    ) {

      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this property.",
      });

    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to create review.",
    });

  }

};


// =========================================
// GET PROPERTY REVIEWS
// =========================================

const getPropertyReviews = async (
  req,
  res
) => {

  try {

    const {
      propertyId,
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        propertyId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid property ID.",
      });

    }


    const reviews =
      await Review.find({
        property: propertyId,
      })
        .populate(
          "seeker",
          "name"
        )
        .sort({
          createdAt: -1,
        });


    // -------------------------------------
    // Calculate rating summary
    // -------------------------------------

    const reviewCount =
      reviews.length;


    const totalRating =
      reviews.reduce(
        (
          total,
          review
        ) => {
          return (
            total +
            review.rating
          );
        },
        0
      );


    const averageRating =
      reviewCount > 0
        ? Number(
            (
              totalRating /
              reviewCount
            ).toFixed(1)
          )
        : 0;


    return res.status(200).json({

      success: true,

      reviewCount,

      averageRating,

      reviews,

    });

  } catch (error) {

    console.error(
      "Get property reviews error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to load reviews.",
    });

  }

};


// =========================================
// DELETE REVIEW
// =========================================

const deleteReview = async (
  req,
  res
) => {

  try {

    const seekerId =
      getUserId(req);


    if (!seekerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const {
      reviewId,
    } = req.params;


    // -------------------------------------
    // Validate review ID
    // -------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });

    }


    // -------------------------------------
    // Find only review belonging to
    // current seeker
    // -------------------------------------

    const review =
      await Review.findOne({
        _id: reviewId,
        seeker: seekerId,
      });


    if (!review) {

      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });

    }


    await Review.deleteOne({
      _id: reviewId,
    });


    return res.status(200).json({

      success: true,

      message:
        "Review deleted successfully.",

    });

  } catch (error) {

    console.error(
      "Delete review error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to delete review.",
    });

  }

};


module.exports = {
  createReview,
  getPropertyReviews,
  deleteReview,
};