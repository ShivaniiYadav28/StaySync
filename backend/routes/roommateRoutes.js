const express = require("express");

const {
  createRoommateProfile,
  getRoommateProfiles,
  getMyRoommateProfile,
  getRoommateProfileById,
  getRoommateMatches,
  updateMyRoommateProfile,
  deleteMyRoommateProfile,
} = require("../controllers/roommateController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getRoommateProfiles
);

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

router.get(
  "/matches",
  protect,
  getRoommateMatches
);

router.get(
  "/:id",
  protect,
  getRoommateProfileById
);

router.put(
  "/me",
  protect,
  updateMyRoommateProfile
);

router.delete(
  "/me",
  protect,
  deleteMyRoommateProfile
);

module.exports = router;