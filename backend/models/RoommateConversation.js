const mongoose = require("mongoose");

const roommateConversationSchema = new mongoose.Schema(
  {
    roommateRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoommateRequest",
      required: true,
      unique: true,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

roommateConversationSchema.index({ participants: 1, lastMessageAt: -1 });

module.exports = mongoose.model(
  "RoommateConversation",
  roommateConversationSchema
);
