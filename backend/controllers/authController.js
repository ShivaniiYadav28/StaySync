const bcrypt = require("bcrypt");
const User = require("../models/User");

const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} = require("../utils/tokenUtils");

// =====================================
// COOKIE OPTIONS
// =====================================

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

// =====================================
// REGISTER USER
// =====================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body || {};

    // =====================================
    // BASIC VALIDATION
    // =====================================

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Invalid input format.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message:
          "Name must contain at least 2 characters.",
      });
    }

    if (cleanName.length > 50) {
      return res.status(400).json({
        message:
          "Name cannot exceed 50 characters.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters.",
      });
    }

    // =====================================
    // EMAIL VALIDATION
    // =====================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message:
          "Please provide a valid email address.",
      });
    }

    // =====================================
    // CHECK EXISTING USER
    // =====================================

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Unable to create account with these details.",
      });
    }

    // =====================================
    // PUBLIC ROLES
    // =====================================

    const allowedRoles = [
      "seeker",
      "owner",
    ];

    const userRole =
      allowedRoles.includes(role)
        ? role
        : "seeker";

    // =====================================
    // PASSWORD HASH
    // =====================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // =====================================
    // CREATE USER
    // =====================================

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
    });

    return res.status(201).json({
      message:
        "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// LOGIN USER
// =====================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    // =====================================
    // BASIC VALIDATION
    // =====================================

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Invalid input format.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    // =====================================
    // FIND USER
    // =====================================

    const user =
      await User.findOne({
        email: cleanEmail,
      }).select("+password +refreshTokenHash");

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // =====================================
    // ACTIVE ACCOUNT CHECK
    // =====================================

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive.",
      });
    }

    // =====================================
    // PASSWORD CHECK
    // =====================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // =====================================
    // CREATE TOKENS
    // =====================================

    const accessToken =
      createAccessToken(user);

    const refreshToken =
      createRefreshToken(user);

    // =====================================
    // STORE HASH ONLY
    // =====================================

    user.refreshTokenHash =
      hashRefreshToken(
        refreshToken
      );

    await user.save();

    // =====================================
    // SET HTTPONLY COOKIE
    // =====================================

    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions
    );

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      message:
        "Login successful.",

      accessToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// REFRESH ACCESS TOKEN
// =====================================

const refreshAccessToken = async (
  req,
  res
) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message:
          "Refresh token required.",
      });
    }

    let decoded;

    try {
      const jwt = require("jsonwebtoken");

      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired refresh token.",
      });
    }

    if (!decoded.userId) {
      return res.status(401).json({
        message:
          "Invalid refresh token.",
      });
    }

    // =====================================
    // FIND USER
    // =====================================

    const user =
      await User.findById(
        decoded.userId
      ).select(
        "+refreshTokenHash"
      );

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid refresh token.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive.",
      });
    }

    // =====================================
    // VERIFY TOKEN HASH
    // =====================================

    const incomingHash =
      hashRefreshToken(
        refreshToken
      );

    if (
      !user.refreshTokenHash ||
      user.refreshTokenHash !==
        incomingHash
    ) {
      return res.status(401).json({
        message:
          "Invalid refresh token.",
      });
    }

    // =====================================
    // TOKEN ROTATION
    // =====================================

    const newAccessToken =
      createAccessToken(user);

    const newRefreshToken =
      createRefreshToken(user);

    user.refreshTokenHash =
      hashRefreshToken(
        newRefreshToken
      );

    await user.save();

    // =====================================
    // REPLACE COOKIE
    // =====================================

    res.cookie(
      "refreshToken",
      newRefreshToken,
      refreshCookieOptions
    );

    return res.status(200).json({
      message:
        "Access token refreshed.",

      accessToken:
        newAccessToken,
    });
  } catch (error) {
    console.error(
      "Refresh token error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// LOGOUT USER
// =====================================

const logoutUser = async (
  req,
  res
) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const jwt = require("jsonwebtoken");

        const decoded =
          jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
          );

        if (decoded.userId) {
          await User.findByIdAndUpdate(
            decoded.userId,
            {
              $set: {
                refreshTokenHash: null,
              },
            }
          );
        }
      } catch (error) {
        // Token is already invalid/expired.
        // We still clear the cookie.
      }
    }

    // =====================================
    // CLEAR COOKIE
    // =====================================

    res.clearCookie(
      "refreshToken",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path: "/api/auth",
      }
    );

    return res.status(200).json({
      message:
        "Logout successful.",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// GET PROFILE
// =====================================

const getProfile = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user.userId
    ) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const user =
      await User.findById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account is inactive.",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Profile error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
};