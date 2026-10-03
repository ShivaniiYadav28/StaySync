const express = require("express");

const protect = require(
  "../middleware/authMiddleware"
);

const {
  createRoommateProfile,
  getMyRoommateProfile,
  updateRoommateProfile,
  deleteRoommateProfile,
  getRoommateProfiles,
  getRoommateProfileById,
  getRoommateMatches,
} = require(
  "../controllers/roommateController"
);

const router =
  express.Router();


// --------------------------------------------------
// Protected routes
// --------------------------------------------------

router.post(
  "/",
  protect,
  createRoommateProfile
);

router.get(
  "/me",
  protect,
  getMyRoommateProfile
);

router.put(
  "/me",
  protect,
  updateRoommateProfile
);

router.delete(
  "/me",
  protect,
  deleteRoommateProfile
);


// --------------------------------------------------
// Roommate Matching
// --------------------------------------------------

router.get(
  "/matches",
  protect,
  getRoommateMatches
);


// --------------------------------------------------
// Public routes
// --------------------------------------------------

router.get(
  "/",
  getRoommateProfiles
);

router.get(
  "/:id",
  getRoommateProfileById
);


module.exports = router;