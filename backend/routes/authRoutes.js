const express = require("express");

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const {
  authLimiter,
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// =====================================
// REGISTER
// =====================================

router.post(
  "/register",
  authLimiter,
  registerUser
);

// =====================================
// LOGIN
// =====================================

router.post(
  "/login",
  authLimiter,
  loginUser
);

// =====================================
// REFRESH ACCESS TOKEN
// =====================================

router.post(
  "/refresh",
  refreshAccessToken
);

// =====================================
// LOGOUT
// =====================================

router.post(
  "/logout",
  logoutUser
);

// =====================================
// PROFILE
// =====================================

router.get(
  "/profile",
  protect,
  getProfile
);

module.exports = router;