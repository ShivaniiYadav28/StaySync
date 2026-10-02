const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);


// One review per seeker for each property
reviewSchema.index(
  {
    property: 1,
    seeker: 1,
  },
  {
    unique: true,
  }
);


// Fast property review lookup
reviewSchema.index({
  property: 1,
  createdAt: -1,
});


const Review = mongoose.model(
  "Review",
  reviewSchema
);

module.exports = Review;