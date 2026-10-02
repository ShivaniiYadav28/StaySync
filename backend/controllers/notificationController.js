const mongoose = require("mongoose");

const Notification = require("../models/Notification");


// =========================================
// GET MY NOTIFICATIONS
// =========================================

const getMyNotifications = async (
  req,
  res
) => {

  try {

    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      req.user?.user_id;


    if (!userId) {

      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

    }


    const notifications =
      await Notification.find({
        recipient: userId,
      })
        .populate(
          "property",
          "title city area"
        )
        .sort({
          createdAt: -1,
        })
        .limit(50);


    const unreadCount =
      await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });


    return res.status(200).json({

      success: true,

      notifications,

      unreadCount,

    });

  } catch (error) {

    console.error(
      "Get notifications error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to load notifications.",
    });

  }

};


// =========================================
// GET UNREAD COUNT
// =========================================

const getUnreadCount = async (
  req,
  res
) => {

  try {

    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      req.user?.user_id;


    if (!userId) {

      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

    }


    const unreadCount =
      await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });


    return res.status(200).json({

      success: true,

      unreadCount,

    });

  } catch (error) {

    console.error(
      "Get unread notification count error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to load notification count.",
    });

  }

};


// =========================================
// MARK ONE AS READ
// =========================================

const markNotificationAsRead = async (
  req,
  res
) => {

  try {

    const {
      notificationId,
    } = req.params;


    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      req.user?.user_id;


    if (!mongoose.Types.ObjectId.isValid(
      notificationId
    )) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid notification ID.",
      });

    }


    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: userId,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        }
      );


    if (!notification) {

      return res.status(404).json({
        success: false,
        message:
          "Notification not found.",
      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Notification marked as read.",

      notification,

    });

  } catch (error) {

    console.error(
      "Mark notification as read error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update notification.",
    });

  }

};


// =========================================
// MARK ALL AS READ
// =========================================

const markAllNotificationsAsRead = async (
  req,
  res
) => {

  try {

    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      req.user?.user_id;


    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );


    return res.status(200).json({

      success: true,

      message:
        "All notifications marked as read.",

    });

  } catch (error) {

    console.error(
      "Mark all notifications as read error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update notifications.",
    });

  }

};


module.exports = {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};