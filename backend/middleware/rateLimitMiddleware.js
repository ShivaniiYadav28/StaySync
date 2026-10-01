const rateLimit = require("express-rate-limit");

// =====================================
// GENERAL API RATE LIMIT
// =====================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message:
      "Too many requests. Please try again later.",
  },
});

// =====================================
// AUTH RATE LIMIT
// =====================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};