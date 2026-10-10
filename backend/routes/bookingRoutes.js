const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getBookingConfig,
  getOwnerBookings,
  createBookingOrder,
  verifyBookingPayment,
  cancelBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/config", protect, allowRoles("seeker"), getBookingConfig);
router.get("/owner", protect, allowRoles("owner"), getOwnerBookings);
router.post("/property/:propertyId/order", protect, allowRoles("seeker"), createBookingOrder);
router.post("/:bookingId/verify", protect, allowRoles("seeker"), verifyBookingPayment);
router.post("/:bookingId/cancel", protect, allowRoles("seeker"), cancelBooking);

module.exports = router;
