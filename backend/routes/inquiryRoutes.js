const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  sendInquiry,
  getMyInquiries,
  getOwnerInquiries,
  updateInquiryStatus,
  withdrawInquiry,
} = require("../controllers/inquiryController");


// =========================================
// SEEKER ROUTES
// =========================================

router.post(
  "/property/:propertyId",
  protect,
  allowRoles("seeker"),
  sendInquiry
);

router.get(
  "/my",
  protect,
  allowRoles("seeker"),
  getMyInquiries
);

router.patch(
  "/:inquiryId/withdraw",
  protect,
  allowRoles("seeker"),
  withdrawInquiry
);


// =========================================
// OWNER ROUTES
// =========================================

router.get(
  "/owner",
  protect,
  allowRoles("owner"),
  getOwnerInquiries
);

router.patch(
  "/:inquiryId/status",
  protect,
  allowRoles("owner"),
  updateInquiryStatus
);


module.exports = router;