const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// =====================================
// CREATE ACCESS TOKEN
// =====================================

const createAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

// =====================================
// CREATE REFRESH TOKEN
// =====================================

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================
// HASH REFRESH TOKEN
// =====================================

const hashRefreshToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
};