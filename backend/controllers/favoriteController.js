const mongoose = require("mongoose");

const Favorite = require("../models/Favorite");
const Property = require("../models/Property");

const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    const property = await Property.findOne({
      _id: propertyId,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({
        message: "Property not found.",
      });
    }

    const existingFavorite =
      await Favorite.findOne({
        user: userId,
        property: propertyId,
      });

    if (existingFavorite) {
      return res.status(409).json({
        message: "Property is already in your favorites.",
      });
    }

    const favorite = await Favorite.create({
      user: userId,
      property: propertyId,
    });

    return res.status(201).json({
      message: "Property added to favorites.",
      favorite,
    });
  } catch (error) {
    // Handles the database-level unique constraint
    // in case two requests arrive at the same time.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Property is already in your favorites.",
      });
    }

    console.error(
      "Add favorite error:",
      error
    );

    return res.status(500).json({
      message: "Unable to add property to favorites.",
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    const favorite =
      await Favorite.findOneAndDelete({
        user: userId,
        property: propertyId,
      });

    if (!favorite) {
      return res.status(404).json({
        message: "Property is not in your favorites.",
      });
    }

    return res.status(200).json({
      message: "Property removed from favorites.",
    });
  } catch (error) {
    console.error(
      "Remove favorite error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to remove property from favorites.",
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites =
      await Favorite.find({
        user: userId,
      })
        .populate({
          path: "property",
          select:
            "title description propertyType gender area city rent deposit roomType availableRooms images owner isActive",
        })
        .sort({
          createdAt: -1,
        });

    const activeFavorites = favorites.filter(
      (favorite) =>
        favorite.property &&
        favorite.property.isActive
    );

    return res.status(200).json({
      favorites: activeFavorites,
    });
  } catch (error) {
    console.error(
      "Get favorites error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch your favorites.",
    });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    const favorite =
      await Favorite.exists({
        user: userId,
        property: propertyId,
      });

    return res.status(200).json({
      isFavorite: Boolean(favorite),
    });
  } catch (error) {
    console.error(
      "Check favorite error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to check favorite status.",
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
};