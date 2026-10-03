const mongoose = require("mongoose");

const RoommateProfile = require("../models/RoommateProfile");
const User = require("../models/User");


// ==================================================
// Helper: Get Authenticated User ID
// ==================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};


// ==================================================
// COMPATIBILITY FUNCTIONS
// ==================================================

// --------------------------------------------------
// Budget Score
// --------------------------------------------------

const calculateBudgetScore = (
  budget1,
  budget2
) => {
  if (
    !budget1 ||
    !budget2 ||
    budget1 <= 0 ||
    budget2 <= 0
  ) {
    return 0;
  }

  const difference =
    Math.abs(
      budget1 - budget2
    );

  const average =
    (budget1 + budget2) / 2;

  const percentage =
    difference / average;

  if (percentage <= 0.10) {
    return 100;
  }

  if (percentage <= 0.20) {
    return 80;
  }

  if (percentage <= 0.30) {
    return 60;
  }

  if (percentage <= 0.40) {
    return 40;
  }

  return 20;
};


// --------------------------------------------------
// Location Score
// --------------------------------------------------

const calculateLocationScore = (
  profile1,
  profile2
) => {
  const city1 =
    profile1.preferredCity
      ?.trim()
      .toLowerCase();

  const city2 =
    profile2.preferredCity
      ?.trim()
      .toLowerCase();

  const area1 =
    profile1.preferredArea
      ?.trim()
      .toLowerCase();

  const area2 =
    profile2.preferredArea
      ?.trim()
      .toLowerCase();


  // Same city + same area
  if (
    city1 === city2 &&
    area1 &&
    area2 &&
    area1 === area2
  ) {
    return 100;
  }


  // Same city
  if (
    city1 === city2
  ) {
    return 80;
  }


  // Different city
  return 0;
};


// --------------------------------------------------
// Move-in Date Score
// --------------------------------------------------

const calculateMoveInScore = (
  date1,
  date2
) => {
  if (
    !date1 ||
    !date2
  ) {
    return 0;
  }

  const firstDate =
    new Date(date1);

  const secondDate =
    new Date(date2);

  const difference =
    Math.abs(
      firstDate.getTime() -
        secondDate.getTime()
    );

  const days =
    difference /
    (1000 * 60 * 60 * 24);


  if (days <= 7) {
    return 100;
  }

  if (days <= 30) {
    return 80;
  }

  if (days <= 60) {
    return 60;
  }

  if (days <= 90) {
    return 40;
  }

  return 20;
};


// --------------------------------------------------
// Exact Preference Score
// --------------------------------------------------

const calculatePreferenceScore = (
  value1,
  value2
) => {
  if (
    !value1 ||
    !value2
  ) {
    return 0;
  }

  const first =
    value1
      .toString()
      .trim()
      .toLowerCase();

  const second =
    value2
      .toString()
      .trim()
      .toLowerCase();


  if (first === second) {
    return 100;
  }

  return 0;
};


// --------------------------------------------------
// Numeric Preference Score
// --------------------------------------------------

const calculateNumericPreferenceScore = (
  value1,
  value2
) => {
  if (
    typeof value1 !== "number" ||
    typeof value2 !== "number"
  ) {
    return 0;
  }

  const difference =
    Math.abs(
      value1 - value2
    );


  if (difference === 0) {
    return 100;
  }

  if (difference === 1) {
    return 80;
  }

  if (difference === 2) {
    return 60;
  }

  if (difference === 3) {
    return 40;
  }

  return 20;
};


// ==================================================
// COMPLETE COMPATIBILITY CALCULATION
// ==================================================

const calculateCompatibility = (
  userProfile,
  otherProfile
) => {

  // 20%
  const budgetScore =
    calculateBudgetScore(
      userProfile.budget,
      otherProfile.budget
    );


  // 20%
  const locationScore =
    calculateLocationScore(
      userProfile,
      otherProfile
    );


  // 15%
  const moveInScore =
    calculateMoveInScore(
      userProfile.moveInDate,
      otherProfile.moveInDate
    );


  // 10%
  const foodScore =
    calculatePreferenceScore(
      userProfile.foodPreference,
      otherProfile.foodPreference
    );


  // 10%
  const smokingScore =
    calculatePreferenceScore(
      userProfile.smoking,
      otherProfile.smoking
    );


  // 10%
  const sleepScore =
    calculatePreferenceScore(
      userProfile.sleepSchedule,
      otherProfile.sleepSchedule
    );


  // 5%
  const cleanlinessScore =
    calculateNumericPreferenceScore(
      userProfile.cleanliness,
      otherProfile.cleanliness
    );


  // 5%
  const drinkingScore =
    calculatePreferenceScore(
      userProfile.drinking,
      otherProfile.drinking
    );


  // 3%
  const petsScore =
    calculatePreferenceScore(
      userProfile.pets,
      otherProfile.pets
    );


  // 2%
  const socialScore =
    calculateNumericPreferenceScore(
      userProfile.socialLevel,
      otherProfile.socialLevel
    );


  // ------------------------------------------------
  // Weighted Final Score
  // ------------------------------------------------

  const finalScore =
    budgetScore * 0.20 +
    locationScore * 0.20 +
    moveInScore * 0.15 +
    foodScore * 0.10 +
    smokingScore * 0.10 +
    sleepScore * 0.10 +
    cleanlinessScore * 0.05 +
    drinkingScore * 0.05 +
    petsScore * 0.03 +
    socialScore * 0.02;


  return Math.round(
    finalScore
  );
};


// ==================================================
// CREATE ROOMMATE PROFILE
// POST /api/roommates
// ==================================================

const createRoommateProfile = async (
  req,
  res
) => {
  try {

    const userId =
      getUserId(req);


    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID.",
      });
    }


    const existingProfile =
      await RoommateProfile.findOne({
        user: userId,
      });


    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a roommate profile.",
      });
    }


    const user =
      await User.findById(userId);


    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }


    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive.",
      });
    }


    const {
      age,
      gender,
      occupation,
      budget,
      preferredCity,
      preferredArea,
      moveInDate,
      foodPreference,
      smoking,
      drinking,
      pets,
      sleepSchedule,
      cleanliness,
      socialLevel,
      preferredRoomType,
    } = req.body;


    const profile =
      await RoommateProfile.create({
        user: userId,
        age,
        gender,
        occupation,
        budget,
        preferredCity,
        preferredArea,
        moveInDate,
        foodPreference,
        smoking,
        drinking,
        pets,
        sleepSchedule,
        cleanliness,
        socialLevel,
        preferredRoomType,
      });


    const populatedProfile =
      await RoommateProfile.findById(
        profile._id
      ).populate(
        "user",
        "name email role"
      );


    return res.status(201).json({
      success: true,
      message:
        "Roommate profile created successfully.",
      profile:
        populatedProfile,
    });

  } catch (error) {

    console.error(
      "Create roommate profile error:",
      error
    );


    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a roommate profile.",
      });
    }


    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Validation error.",
        errors:
          Object.values(
            error.errors
          ).map(
            (item) =>
              item.message
          ),
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Failed to create roommate profile.",
    });
  }
};


// ==================================================
// GET MY PROFILE
// GET /api/roommates/me
// ==================================================

const getMyRoommateProfile =
  async (req, res) => {
    try {

      const userId =
        getUserId(req);


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }


      const profile =
        await RoommateProfile.findOne({
          user: userId,
        }).populate(
          "user",
          "name email role"
        );


      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Roommate profile not found.",
        });
      }


      return res.status(200).json({
        success: true,
        profile,
      });

    } catch (error) {

      console.error(
        "Get roommate profile error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch roommate profile.",
      });
    }
  };


// ==================================================
// UPDATE MY PROFILE
// PUT /api/roommates/me
// ==================================================

const updateRoommateProfile =
  async (req, res) => {
    try {

      const userId =
        getUserId(req);


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }


      const allowedFields = [
        "age",
        "gender",
        "occupation",
        "budget",
        "preferredCity",
        "preferredArea",
        "moveInDate",
        "foodPreference",
        "smoking",
        "drinking",
        "pets",
        "sleepSchedule",
        "cleanliness",
        "socialLevel",
        "preferredRoomType",
      ];


      const updates = {};


      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            updates[field] =
              req.body[field];
          }
        }
      );


      if (
        Object.keys(updates)
          .length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "No valid fields provided for update.",
        });
      }


      const profile =
        await RoommateProfile.findOneAndUpdate(
          {
            user: userId,
          },
          {
            $set: updates,
          },
          {
            new: true,
            runValidators: true,
          }
        ).populate(
          "user",
          "name email role"
        );


      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Roommate profile not found.",
        });
      }


      return res.status(200).json({
        success: true,
        message:
          "Roommate profile updated successfully.",
        profile,
      });

    } catch (error) {

      console.error(
        "Update roommate profile error:",
        error
      );


      if (
        error instanceof
        mongoose.Error.ValidationError
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Validation error.",
          errors:
            Object.values(
              error.errors
            ).map(
              (item) =>
                item.message
            ),
        });
      }


      return res.status(500).json({
        success: false,
        message:
          "Failed to update roommate profile.",
      });
    }
  };


// ==================================================
// DELETE MY PROFILE
// DELETE /api/roommates/me
// ==================================================

const deleteRoommateProfile =
  async (req, res) => {
    try {

      const userId =
        getUserId(req);


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }


      const profile =
        await RoommateProfile.findOneAndDelete(
          {
            user: userId,
          }
        );


      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Roommate profile not found.",
        });
      }


      return res.status(200).json({
        success: true,
        message:
          "Roommate profile deleted successfully.",
      });

    } catch (error) {

      console.error(
        "Delete roommate profile error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Failed to delete roommate profile.",
      });
    }
  };


// ==================================================
// GET ALL ROOMMATES
// GET /api/roommates
// ==================================================

const getRoommateProfiles =
  async (req, res) => {
    try {

      const profiles =
        await RoommateProfile.find({
          isActive: true,
        })
          .populate(
            "user",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });


      return res.status(200).json({
        success: true,
        count:
          profiles.length,
        profiles,
      });

    } catch (error) {

      console.error(
        "Get roommate profiles error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch roommate profiles.",
      });
    }
  };


// ==================================================
// GET SINGLE ROOMMATE
// GET /api/roommates/:id
// ==================================================

const getRoommateProfileById =
  async (req, res) => {
    try {

      const { id } =
        req.params;


      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid roommate profile ID.",
        });
      }


      const profile =
        await RoommateProfile.findOne({
          _id: id,
          isActive: true,
        }).populate(
          "user",
          "name email role"
        );


      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Roommate profile not found.",
        });
      }


      return res.status(200).json({
        success: true,
        profile,
      });

    } catch (error) {

      console.error(
        "Get roommate profile by ID error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch roommate profile.",
      });
    }
  };


// ==================================================
// FIND ROOMMATE MATCHES
// GET /api/roommates/matches
// ==================================================

const getRoommateMatches =
  async (req, res) => {
    try {

      const userId =
        getUserId(req);


      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }


      const myProfile =
        await RoommateProfile.findOne({
          user: userId,
          isActive: true,
        });


      if (!myProfile) {
        return res.status(404).json({
          success: false,
          message:
            "Create a roommate profile before finding matches.",
        });
      }


      const otherProfiles =
        await RoommateProfile.find({
          isActive: true,
          user: {
            $ne: userId,
          },
        }).populate(
          "user",
          "name email role"
        );


      const matches =
        otherProfiles
          .map((profile) => {

            const compatibilityScore =
              calculateCompatibility(
                myProfile,
                profile
              );


            return {
              profile,
              compatibilityScore,
            };
          })
          .sort(
            (a, b) =>
              b.compatibilityScore -
              a.compatibilityScore
          );


      return res.status(200).json({
        success: true,
        count:
          matches.length,
        matches,
      });

    } catch (error) {

      console.error(
        "Get roommate matches error:",
        error
      );


      return res.status(500).json({
        success: false,
        message:
          "Failed to calculate roommate matches.",
      });
    }
  };


module.exports = {
  createRoommateProfile,
  getMyRoommateProfile,
  updateRoommateProfile,
  deleteRoommateProfile,
  getRoommateProfiles,
  getRoommateProfileById,
  getRoommateMatches,
};