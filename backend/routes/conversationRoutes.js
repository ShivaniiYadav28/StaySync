const express = require("express");

const router = express.Router();

const protect =
  require("../middleware/authMiddleware");

const {
  createConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
} =
  require("../controllers/conversationController");


/*
 * Create conversation from
 * accepted inquiry
 */
router.post(
  "/inquiry/:inquiryId",
  protect,
  createConversation
);


/*
 * Get logged-in user's
 * conversations
 */
router.get(
  "/",
  protect,
  getMyConversations
);


/*
 * Get messages
 */
router.get(
  "/:conversationId/messages",
  protect,
  getMessages
);


/*
 * Send message
 */
router.post(
  "/:conversationId/messages",
  protect,
  sendMessage
);


/*
 * Mark messages as read
 */
router.patch(
  "/:conversationId/read",
  protect,
  markConversationAsRead
);


module.exports = router;