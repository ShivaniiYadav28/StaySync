const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
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

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    moveInDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "pending",
    },

    ownerResponse: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
  Prevent the same seeker from having
  multiple active inquiries for the
  same property.
*/
inquirySchema.index(
  {
    property: 1,
    seeker: 1,
  },
  {
    unique: true,
  }
);

inquirySchema.index({
  owner: 1,
  status: 1,
});

inquirySchema.index({
  seeker: 1,
  status: 1,
});

const Inquiry = mongoose.model(
  "Inquiry",
  inquirySchema
);

module.exports = Inquiry;