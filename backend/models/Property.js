const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    propertyType: {
      type: String,
      enum: ["PG", "Hostel", "Flat", "Room"],
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Any"],
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    area: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/,
    },

    rent: {
      type: Number,
      required: true,
      min: 0,
    },

    deposit: {
      type: Number,
      required: true,
      min: 0,
    },

    roomType: {
      type: String,
      enum: [
        "Single",
        "Double",
        "Triple",
        "Shared",
      ],
      required: true,
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    rules: [
      {
        type: String,
        trim: true,
      },
    ],

    // Property images uploaded to Cloudinary
    images: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

// Search/filter indexes
propertySchema.index({
  city: 1,
  area: 1,
});

propertySchema.index({
  rent: 1,
});

propertySchema.index({
  propertyType: 1,
});

propertySchema.index({
  gender: 1,
});

const Property = mongoose.model(
  "Property",
  propertySchema
);

module.exports = Property;