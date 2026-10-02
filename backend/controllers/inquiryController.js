const mongoose = require("mongoose");

const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");

const {
  createNotification,
} = require("../utils/notificationHelper");


// =========================================
// GET USER ID
// =========================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.user?.user_id ||
    null
  );
};


// =========================================
// SEND INQUIRY
// =========================================

const sendInquiry = async (
  req,
  res
) => {

  try {

    const seekerId =
      getUserId(req);


    if (!seekerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const {
      propertyId,
    } = req.params;


    const {
      message,
      moveInDate,
    } = req.body;


    // -------------------------------------
    // Validate property ID
    // -------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        propertyId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid property ID.",
      });

    }


    // -------------------------------------
    // Validate message
    // -------------------------------------

    if (
      typeof message !== "string"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Message is required.",
      });

    }


    const trimmedMessage =
      message.trim();


    if (
      trimmedMessage.length < 10
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Message must contain at least 10 characters.",
      });

    }


    if (
      trimmedMessage.length > 1000
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 1000 characters.",
      });

    }


    // -------------------------------------
    // Find property
    // -------------------------------------

    const property =
      await Property.findOne({
        _id: propertyId,
        isActive: true,
      });


    if (!property) {

      return res.status(404).json({
        success: false,
        message:
          "Property not found or inactive.",
      });

    }


    // -------------------------------------
    // Prevent owner from contacting own
    // property
    // -------------------------------------

    if (
      property.owner.toString() ===
      seekerId.toString()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "You cannot send an inquiry for your own property.",
      });

    }


    // -------------------------------------
    // Validate move-in date
    // -------------------------------------

    let parsedMoveInDate = null;


    if (moveInDate) {

      parsedMoveInDate =
        new Date(moveInDate);


      if (
        Number.isNaN(
          parsedMoveInDate.getTime()
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid move-in date.",
        });

      }


      const today =
        new Date();


      today.setHours(
        0,
        0,
        0,
        0
      );


      parsedMoveInDate.setHours(
        0,
        0,
        0,
        0
      );


      if (
        parsedMoveInDate < today
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Move-in date cannot be in the past.",
        });

      }

    }


    // -------------------------------------
    // Check duplicate inquiry
    // -------------------------------------

    const existingInquiry =
      await Inquiry.findOne({
        property: propertyId,
        seeker: seekerId,
      });


    if (existingInquiry) {

      return res.status(409).json({
        success: false,
        message:
          "You have already sent an inquiry for this property.",
        inquiry:
          existingInquiry,
      });

    }


    // -------------------------------------
    // Create inquiry
    // -------------------------------------

    const inquiry =
      await Inquiry.create({

        property:
          property._id,

        seeker:
          seekerId,

        owner:
          property.owner,

        message:
          trimmedMessage,

        moveInDate:
          parsedMoveInDate,

      });


    // -------------------------------------
    // Create owner notification
    // -------------------------------------

    await createNotification({

      recipient:
        property.owner,

      type:
        "new_inquiry",

      title:
        "New property inquiry",

      message:
        `Someone has sent an inquiry for "${property.title}".`,

      property:
        property._id,

      inquiry:
        inquiry._id,

    });


    // -------------------------------------
    // Populate response
    // -------------------------------------

    const populatedInquiry =
      await Inquiry.findById(
        inquiry._id
      )
        .populate(
          "property",
          "title area city rent roomType images"
        )
        .populate(
          "seeker",
          "name email"
        )
        .populate(
          "owner",
          "name email"
        );


    return res.status(201).json({

      success: true,

      message:
        "Inquiry sent successfully.",

      inquiry:
        populatedInquiry,

    });

  } catch (error) {

    console.error(
      "Send inquiry error:",
      error
    );


    // -------------------------------------
    // Duplicate index safety
    // -------------------------------------

    if (
      error.code === 11000
    ) {

      return res.status(409).json({
        success: false,
        message:
          "You have already sent an inquiry for this property.",
      });

    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to send inquiry.",
    });

  }

};


// =========================================
// GET MY INQUIRIES
// =========================================

const getMyInquiries = async (
  req,
  res
) => {

  try {

    const seekerId =
      getUserId(req);


    if (!seekerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const inquiries =
      await Inquiry.find({
        seeker: seekerId,
      })
        .populate(
          "property",
          "title description propertyType gender area city rent deposit roomType availableRooms images"
        )
        .populate(
          "owner",
          "name email"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({

      success: true,

      inquiries,

    });

  } catch (error) {

    console.error(
      "Get my inquiries error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to load your inquiries.",
    });

  }

};


// =========================================
// GET OWNER INQUIRIES
// =========================================

const getOwnerInquiries = async (
  req,
  res
) => {

  try {

    const ownerId =
      getUserId(req);


    if (!ownerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const inquiries =
      await Inquiry.find({
        owner: ownerId,
      })
        .populate(
          "property",
          "title description propertyType gender area city rent deposit roomType availableRooms images"
        )
        .populate(
          "seeker",
          "name email"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({

      success: true,

      inquiries,

    });

  } catch (error) {

    console.error(
      "Get owner inquiries error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to load owner inquiries.",
    });

  }

};


// =========================================
// UPDATE INQUIRY STATUS
// =========================================

const updateInquiryStatus = async (
  req,
  res
) => {

  try {

    const ownerId =
      getUserId(req);


    if (!ownerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const {
      inquiryId,
    } = req.params;


    const {
      status,
      ownerResponse,
    } = req.body;


    // -------------------------------------
    // Validate inquiry ID
    // -------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        inquiryId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid inquiry ID.",
      });

    }


    // -------------------------------------
    // Validate status
    // -------------------------------------

    if (
      ![
        "accepted",
        "rejected",
      ].includes(status)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Status must be accepted or rejected.",
      });

    }


    // -------------------------------------
    // Validate response
    // -------------------------------------

    let cleanedResponse = "";


    if (
      ownerResponse !== undefined &&
      ownerResponse !== null
    ) {

      if (
        typeof ownerResponse !== "string"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Owner response must be text.",
        });

      }


      cleanedResponse =
        ownerResponse.trim();


      if (
        cleanedResponse.length > 1000
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Owner response cannot exceed 1000 characters.",
        });

      }

    }


    // -------------------------------------
    // Find inquiry
    // -------------------------------------

    const inquiry =
      await Inquiry.findOne({
        _id: inquiryId,
        owner: ownerId,
      });


    if (!inquiry) {

      return res.status(404).json({
        success: false,
        message:
          "Inquiry not found.",
      });

    }


    // -------------------------------------
    // Only pending inquiries can be
    // accepted/rejected
    // -------------------------------------

    if (
      inquiry.status !== "pending"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Only pending inquiries can be updated.",
      });

    }


    // -------------------------------------
    // Update inquiry
    // -------------------------------------

    inquiry.status =
      status;

    inquiry.ownerResponse =
      cleanedResponse;


    await inquiry.save();


    // -------------------------------------
    // Get property for notification
    // -------------------------------------

    const property =
      await Property.findById(
        inquiry.property
      ).select(
        "title area city"
      );


    // -------------------------------------
    // Notify seeker
    // -------------------------------------

    if (
      status === "accepted"
    ) {

      await createNotification({

        recipient:
          inquiry.seeker,

        type:
          "inquiry_accepted",

        title:
          "Inquiry accepted",

        message:
          `Your inquiry for "${property?.title || "the property"}" has been accepted.`,

        property:
          inquiry.property,

        inquiry:
          inquiry._id,

      });

    }


    if (
      status === "rejected"
    ) {

      await createNotification({

        recipient:
          inquiry.seeker,

        type:
          "inquiry_rejected",

        title:
          "Inquiry rejected",

        message:
          `Your inquiry for "${property?.title || "the property"}" has been rejected.`,

        property:
          inquiry.property,

        inquiry:
          inquiry._id,

      });

    }


    // -------------------------------------
    // Populate response
    // -------------------------------------

    const populatedInquiry =
      await Inquiry.findById(
        inquiry._id
      )
        .populate(
          "property",
          "title description propertyType gender area city rent deposit roomType availableRooms images"
        )
        .populate(
          "seeker",
          "name email"
        )
        .populate(
          "owner",
          "name email"
        );


    return res.status(200).json({

      success: true,

      message:
        `Inquiry ${status} successfully.`,

      inquiry:
        populatedInquiry,

    });

  } catch (error) {

    console.error(
      "Update inquiry status error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update inquiry.",
    });

  }

};


// =========================================
// WITHDRAW INQUIRY
// =========================================

const withdrawInquiry = async (
  req,
  res
) => {

  try {

    const seekerId =
      getUserId(req);


    if (!seekerId) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

    }


    const {
      inquiryId,
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        inquiryId
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid inquiry ID.",
      });

    }


    const inquiry =
      await Inquiry.findOne({
        _id: inquiryId,
        seeker: seekerId,
      });


    if (!inquiry) {

      return res.status(404).json({
        success: false,
        message:
          "Inquiry not found.",
      });

    }


    if (
      inquiry.status !== "pending"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Only pending inquiries can be withdrawn.",
      });

    }


    inquiry.status =
      "withdrawn";


    await inquiry.save();


    return res.status(200).json({

      success: true,

      message:
        "Inquiry withdrawn successfully.",

      inquiry,

    });

  } catch (error) {

    console.error(
      "Withdraw inquiry error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to withdraw inquiry.",
    });

  }

};


module.exports = {
  sendInquiry,
  getMyInquiries,
  getOwnerInquiries,
  updateInquiryStatus,
  withdrawInquiry,
};