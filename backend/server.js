const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const {
  apiLimiter,
} = require("./middleware/rateLimitMiddleware");

const app = express();

// =====================================
// BASIC SECURITY
// =====================================

app.disable("x-powered-by");

app.use(helmet());

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// =====================================
// COOKIE PARSER
// =====================================

app.use(cookieParser());

// =====================================
// BODY PARSER
// =====================================

app.use(
  express.json({
    limit: "100kb",
  })
);

// =====================================
// GENERAL API RATE LIMIT
// =====================================

app.use(
  "/api",
  apiLimiter
);

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "StaySync API is running",
  });
});

// =====================================
// API ROUTES
// =====================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/properties",
  propertyRoutes
);

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

// =====================================
// ERROR HANDLER
// =====================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Unhandled server error:",
      err
    );

    res.status(500).json({
      message:
        "Something went wrong on the server.",
    });
  }
);

// =====================================
// START SERVER
// =====================================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();