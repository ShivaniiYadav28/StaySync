const express = require("express");

const router = express.Router();

const protect =
  require("../middleware/authMiddleware");

const {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} =
  require(
    "../controllers/notificationController"
  );


router.get(
  "/",
  protect,
  getMyNotifications
);


router.get(
  "/unread-count",
  protect,
  getUnreadCount
);


router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);


router.patch(
  "/:notificationId/read",
  protect,
  markNotificationAsRead
);


module.exports = router;