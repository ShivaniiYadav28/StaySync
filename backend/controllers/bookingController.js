const crypto = require("crypto");
const Booking = require("../models/Booking");
const Property = require("../models/Property");

const getTokenAmount = () => {
  const amount = Number(process.env.BOOKING_TOKEN_AMOUNT_INR);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

const razorpayRequest = async (path, method, payload) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay test keys are not configured on the server.");
    error.status = 503;
    throw error;
  }

  const authorization = Buffer.from(keyId + ":" + keySecret).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1" + path, {
    method,
    headers: {
      Authorization: "Basic " + authorization,
      "Content-Type": "application/json",
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error?.description || "Razorpay request failed.");
    error.status = response.status;
    throw error;
  }

  return data;
};

const validSignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");

  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const getBookingConfig = async (req, res) => {
  const tokenAmount = getTokenAmount();

  if (!tokenAmount) {
    return res.status(503).json({
      message: "Set BOOKING_TOKEN_AMOUNT_INR in the backend environment before enabling bookings.",
    });
  }

  return res.status(200).json({
    tokenAmount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID || "",
  });
};

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("seeker", "name")
      .populate("property", "title city");

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get owner bookings error:", error.message);
    return res.status(500).json({
      message: "Unable to load your bookings.",
    });
  }
};

const createBookingOrder = async (req, res) => {


  try {
    const seekerId = req.user.userId;
    const { propertyId } = req.params;
    const { moveInDate } = req.body;
    const tokenAmount = getTokenAmount();

    if (!tokenAmount || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: "Booking payment is not configured yet. Add the booking token amount and Razorpay test keys to the backend environment.",
      });
    }

    if (!moveInDate || Number.isNaN(new Date(moveInDate).getTime())) {
      return res.status(400).json({ message: "Choose a valid move-in date." });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (String(moveInDate).slice(0, 10) < today) {
      return res.status(400).json({ message: "Move-in date cannot be in the past." });
    }

    const property = await Property.findOne({
      _id: propertyId,
      isActive: true,
    }).populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ message: "This property is not available." });
    }

    if (String(property.owner?._id) === String(seekerId)) {
      return res.status(400).json({ message: "You cannot book your own property." });
    }

    const order = await razorpayRequest("/orders", "POST", {
      amount: Math.round(tokenAmount * 100),
      currency: "INR",
      receipt: "stay_" + Date.now(),
      notes: {
        propertyId: String(property._id),
        seekerId: String(seekerId),
      },
    });

    const booking = await Booking.create({
      property: property._id,
      seeker: seekerId,
      owner: property.owner._id,
      moveInDate: new Date(moveInDate),
      tokenAmount,
      amountPaise: Math.round(tokenAmount * 100),
      razorpayOrderId: order.id,
    });

    return res.status(201).json({
      bookingId: booking._id,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      tokenAmount,
      property: {
        title: property.title,
        ownerName: property.owner.name,
      },
    });
  } catch (error) {
    console.error("Create booking order error:", error.message);
    return res.status(error.status || 500).json({
      message: error.message || "Unable to start this booking.",
    });
  }
};

const verifyBookingPayment = async (req, res) => {
  try {
    const seekerId = req.user.userId;
    const { bookingId } = req.params;
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      seeker: seekerId,
    }).populate("property", "title city address");

    if (!booking) {
      return res.status(404).json({ message: "Booking was not found." });
    }

    if (booking.status === "confirmed" && booking.razorpayPaymentId === paymentId) {
      return res.status(200).json({
        message: "Booking is already confirmed.",
        booking,
      });
    }

    if (booking.status !== "pending") {
      return res.status(409).json({ message: "This booking can no longer be confirmed." });
    }

    if (orderId !== booking.razorpayOrderId || !validSignature(orderId, paymentId, signature)) {
      return res.status(400).json({ message: "Payment signature could not be verified." });
    }

    const payment = await razorpayRequest("/payments/" + encodeURIComponent(paymentId), "GET");
    if (
      payment.order_id !== booking.razorpayOrderId ||
      payment.amount !== booking.amountPaise ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        message: "Payment is not captured yet. If money was deducted, contact support with your payment ID.",
      });
    }

    const claimedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        seeker: seekerId,
        status: "pending",
      },
      {
        $set: {
          status: "processing",
          razorpayPaymentId: paymentId,
        },
      },
      { new: true }
    );

    if (!claimedBooking) {
      const current = await Booking.findById(booking._id);
      if (current?.status === "confirmed" && current.razorpayPaymentId === paymentId) {
        return res.status(200).json({ message: "Booking is already confirmed.", booking: current });
      }
      return res.status(409).json({ message: "This payment is already being processed." });
    }

    const propertyUpdate = await Property.findOneAndUpdate(
      {
        _id: booking.property._id,
        isActive: true,
        availableRooms: { $gt: 0 },
      },
      { $inc: { availableRooms: -1 } },
      { new: true }
    );

    if (!propertyUpdate) {
      await Booking.updateOne(
        { _id: booking._id, status: "processing" },
        { $set: { status: "refund_pending" } }
      );

      try {
        await razorpayRequest(
          "/payments/" + encodeURIComponent(paymentId) + "/refund",
          "POST",
          { amount: booking.amountPaise }
        );
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { status: "refunded" } }
        );
        return res.status(409).json({
          message: "The room was taken during checkout. The token payment has been refunded.",
        });
      } catch (refundError) {
        console.error("Booking refund error:", refundError.message);
        return res.status(409).json({
          message: "The room was taken during checkout. Your payment is marked for refund; contact support if it does not return.",
        });
      }
    }

    const confirmedBooking = await Booking.findOneAndUpdate(
      { _id: booking._id, status: "processing" },
      {
        $set: {
          status: "confirmed",
          paymentVerifiedAt: new Date(),
        },
      },
      { new: true }
    ).populate("property", "title city address");

    if (!confirmedBooking) {
      await Property.updateOne(
        { _id: booking.property._id },
        { $inc: { availableRooms: 1 } }
      );
      return res.status(409).json({ message: "Unable to finalize the booking. Contact support with your payment ID." });
    }

    return res.status(200).json({
      message: "Payment verified and booking confirmed.",
      booking: {
        _id: confirmedBooking._id,
        status: confirmedBooking.status,
        tokenAmount: confirmedBooking.tokenAmount,
        currency: confirmedBooking.currency,
        moveInDate: confirmedBooking.moveInDate,
        property: confirmedBooking.property,
      },
    });
  } catch (error) {
    console.error("Verify booking payment error:", error.message);
    return res.status(error.status || 500).json({
      message: error.message || "Unable to verify the booking payment.",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.bookingId,
        seeker: req.user.userId,
        status: "pending",
      },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Pending booking was not found." });
    }


    return res.status(200).json({ message: "Booking was cancelled." });
  } catch (error) {
    console.error("Cancel booking error:", error.message);
    return res.status(500).json({ message: "Unable to cancel this booking." });
  }
};

module.exports = {
  getBookingConfig,
  getOwnerBookings,
  createBookingOrder,
  verifyBookingPayment,
  cancelBooking,
};
