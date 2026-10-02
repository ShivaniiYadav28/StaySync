const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    inquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
      required: true,
      unique: true,
    },

    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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
  {
    timestamps: true,
  }
);

conversationSchema.index({
  seeker: 1,
  updatedAt: -1,
});

conversationSchema.index({
  owner: 1,
  updatedAt: -1,
});

conversationSchema.index({
  property: 1,
});

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

module.exports = Conversation;