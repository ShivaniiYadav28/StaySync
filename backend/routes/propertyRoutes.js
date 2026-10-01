const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadPropertyImages,
  deletePropertyImage,
} = require("../controllers/imageController");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require("../controllers/propertyController");

// =====================================
// PUBLIC ROUTES
// =====================================

router.get(
  "/",
  getProperties
);

// =====================================
// PROTECTED OWNER ROUTES
// =====================================

// IMPORTANT:
// This route must come before /:id

router.get(
  "/owner/my-properties",
  protect,
  allowRoles("owner"),
  getMyProperties
);

// =====================================
// CREATE PROPERTY
// =====================================

router.post(
  "/",
  protect,
  allowRoles("owner"),
  createProperty
);

// =====================================
// SINGLE PROPERTY
// =====================================

router.get(
  "/:id",
  getPropertyById
);

// =====================================
// UPDATE PROPERTY
// =====================================

router.put(
  "/:id",
  protect,
  allowRoles("owner"),
  updateProperty
);

// =====================================
// DELETE PROPERTY
// =====================================

router.delete(
  "/:id",
  protect,
  allowRoles("owner"),
  deleteProperty
);
router.post(
  "/:id/images",
  protect,
  allowRoles("owner"),
  upload.array("images", 6),
  uploadPropertyImages
);

router.delete(
  "/:id/images/:imageId",
  protect,
  allowRoles("owner"),
  deletePropertyImage
);

module.exports = router;