const express = require("express");

const {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getProperties);

router.get(
  "/my-properties",
  protect,
  getMyProperties
);

router.get("/:id", getPropertyById);

router.post(
  "/",
  protect,
  createProperty
);

router.post(
  "/:id/images",
  protect,
  upload.array("images", 6),
  uploadPropertyImages
);

router.put(
  "/:id",
  protect,
  updateProperty
);

router.delete(
  "/:id",
  protect,
  deleteProperty
);

module.exports = router;