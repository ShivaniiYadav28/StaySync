const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "new_inquiry",
        "inquiry_accepted",
        "inquiry_rejected",
        "new_review",
        "new_message",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    inquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
      default: null,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


/*
 * Get unread notifications
 * for a user quickly.
 */
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});


/*
 * Get user's latest notifications.
 */
notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});


const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );

module.exports = Notification;