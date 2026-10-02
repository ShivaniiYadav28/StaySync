const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
} = require("../controllers/favoriteController");

router.use(protect, allowRoles("seeker"));

router.post(
  "/:propertyId",
  addFavorite
);

router.delete(
  "/:propertyId",
  removeFavorite
);

router.get(
  "/",
  getMyFavorites
);

router.get(
  "/check/:propertyId",
  checkFavorite
);

module.exports = router;