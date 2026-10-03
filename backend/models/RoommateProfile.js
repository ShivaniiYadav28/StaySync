const mongoose = require("mongoose");

const roommateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    age: {
      type: Number,
      required: true,
      min: 18,
      max: 100,
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
        "prefer_not_to_say",
      ],
      required: true,
    },

    occupation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    preferredCity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    preferredArea: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    moveInDate: {
      type: Date,
      required: true,
    },

    foodPreference: {
      type: String,
      enum: [
        "vegetarian",
        "non_vegetarian",
        "vegan",
        "eggetarian",
        "any",
      ],
      required: true,
    },

    smoking: {
      type: String,
      enum: [
        "yes",
        "no",
        "occasionally",
      ],
      required: true,
    },

    drinking: {
      type: String,
      enum: [
        "yes",
        "no",
        "occasionally",
      ],
      required: true,
    },

    pets: {
      type: String,
      enum: [
        "yes",
        "no",
        "comfortable",
      ],
      required: true,
    },

    sleepSchedule: {
      type: String,
      enum: [
        "early_bird",
        "normal",
        "night_owl",
      ],
      required: true,
    },

    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    socialLevel: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    preferredRoomType: {
      type: String,
      enum: [
        "single",
        "double",
        "triple",
        "shared",
        "any",
      ],
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

roommateProfileSchema.index({
  preferredCity: 1,
});

roommateProfileSchema.index({
  preferredCity: 1,
  budget: 1,
});

roommateProfileSchema.index({
  preferredCity: 1,
  isActive: 1,
});

const RoommateProfile =
  mongoose.model(
    "RoommateProfile",
    roommateProfileSchema
  );

module.exports = RoommateProfile;