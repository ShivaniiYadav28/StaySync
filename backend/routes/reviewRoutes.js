const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createReview,
  getPropertyReviews,
  deleteReview,
} = require("../controllers/reviewController");


// =========================================
// PUBLIC
// GET PROPERTY REVIEWS
// =========================================

router.get(
  "/property/:propertyId",
  getPropertyReviews
);


// =========================================
// SEEKER
// CREATE REVIEW
// =========================================

router.post(
  "/:propertyId",
  protect,
  allowRoles("seeker"),
  createReview
);


// =========================================
// SEEKER
// DELETE OWN REVIEW
// =========================================

router.delete(
  "/:reviewId",
  protect,
  allowRoles("seeker"),
  deleteReview
);


module.exports = router;