const mongoose = require("mongoose");

const roommateRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

roommateRequestSchema.index(
  {
    sender: 1,
    receiver: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
  }
);

roommateRequestSchema.index({
  receiver: 1,
  status: 1,
});

roommateRequestSchema.index({
  sender: 1,
  status: 1,
});

const RoommateRequest = mongoose.model(
  "RoommateRequest",
  roommateRequestSchema
);

module.exports = RoommateRequest;