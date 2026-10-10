const express = require("express");

const {
  sendRoommateRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getAcceptedConnections,
  acceptRoommateRequest,
  rejectRoommateRequest,
  cancelRoommateRequest,
} = require("../controllers/roommateRequestController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendRoommateRequest);
router.get("/incoming", protect, getIncomingRequests);
router.get("/outgoing", protect, getOutgoingRequests);
router.get("/accepted", protect, getAcceptedConnections);
router.put("/:id/accept", protect, acceptRoommateRequest);
router.put("/:id/reject", protect, rejectRoommateRequest);
router.delete("/:id", protect, cancelRoommateRequest);

module.exports = router;