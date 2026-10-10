const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
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
    moveInDate: {
      type: Date,
      required: true,
    },
    tokenAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "confirmed",
        "cancelled",
        "refund_pending",
        "refunded",
      ],
      default: "pending",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    confirmationEmailError: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ seeker: 1, createdAt: -1 });
bookingSchema.index({ property: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);