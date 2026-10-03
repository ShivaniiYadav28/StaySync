const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

dotenv.config();

const app = express();


// --------------------------------------------------
// Security Middleware
// --------------------------------------------------

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);


// --------------------------------------------------
// Body Parsing
// --------------------------------------------------

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(cookieParser());


// --------------------------------------------------
// Rate Limiting
// --------------------------------------------------

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);


// --------------------------------------------------
// Database
// --------------------------------------------------

connectDB();


// --------------------------------------------------
// Routes
// --------------------------------------------------

const authRoutes =
  require("./routes/authRoutes");

app.use(
  "/api/auth",
  authRoutes
);


const propertyRoutes =
  require("./routes/propertyRoutes");

app.use(
  "/api/properties",
  propertyRoutes
);


const favoriteRoutes =
  require("./routes/favoriteRoutes");

app.use(
  "/api/favorites",
  favoriteRoutes
);


const inquiryRoutes =
  require("./routes/inquiryRoutes");

app.use(
  "/api/inquiries",
  inquiryRoutes
);


const reviewRoutes =
  require("./routes/reviewRoutes");

app.use(
  "/api/reviews",
  reviewRoutes
);


const notificationRoutes =
  require("./routes/notificationRoutes");

app.use(
  "/api/notifications",
  notificationRoutes
);


const conversationRoutes =
  require("./routes/conversationRoutes");

app.use(
  "/api/conversations",
  conversationRoutes
);


// --------------------------------------------------
// Roommate Matching Routes
// --------------------------------------------------

const roommateRoutes =
  require("./routes/roommateRoutes");

app.use(
  "/api/roommates",
  roommateRoutes
);


// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get(
  "/api/health",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "StaySync API is running",
    });
  }
);


// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message:
        "API route not found",
    });
  }
);


// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Global server error:",
      error
    );


    // Invalid JSON
    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      error.type ===
        "entity.parse.failed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON request body",
      });
    }


    // Mongoose validation error
    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Validation error",

        errors:
          Object.values(
            error.errors
          ).map(
            (item) =>
              item.message
          ),
      });
    }


    // Duplicate MongoDB record
    if (
      error?.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate record",
      });
    }


    // Default server error
    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);


// --------------------------------------------------
// Start Server
// --------------------------------------------------

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `StaySync server running on port ${PORT}`
    );
  }
);