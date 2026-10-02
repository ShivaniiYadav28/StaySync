const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same seeker from
// favoriting the same property twice.
favoriteSchema.index(
  {
    user: 1,
    property: 1,
  },
  {
    unique: true,
  }
);

// Useful for finding all favorites
// belonging to a particular user.
favoriteSchema.index({
  user: 1,
});

const Favorite = mongoose.model(
  "Favorite",
  favoriteSchema
);

module.exports = Favorite;