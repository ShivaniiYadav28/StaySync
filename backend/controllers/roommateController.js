const RoommateProfile = require("../models/RoommateProfile");

const calculateCompatibility = (current, other) => {
  let score = 0;
  const reasons = [];

  if (
    current.preferredCity.toLowerCase() ===
    other.preferredCity.toLowerCase()
  ) {
    score += 15;
    reasons.push("Same preferred city");
  }

  if (
    current.preferredArea &&
    other.preferredArea &&
    current.preferredArea.toLowerCase() ===
      other.preferredArea.toLowerCase()
  ) {
    score += 10;
    reasons.push("Same preferred area");
  }

  const budgetDifference = Math.abs(
    Number(current.budget) - Number(other.budget)
  );

  const averageBudget =
    (Number(current.budget) + Number(other.budget)) / 2;

  if (budgetDifference <= averageBudget * 0.1) {
    score += 15;
    reasons.push("Similar budget");
  } else if (budgetDifference <= averageBudget * 0.2) {
    score += 10;
    reasons.push("Compatible budget");
  } else if (budgetDifference <= averageBudget * 0.35) {
    score += 5;
  }

  if (
    current.preferredRoomType === "any" ||
    other.preferredRoomType === "any" ||
    current.preferredRoomType ===
      other.preferredRoomType
  ) {
    score += 10;
    reasons.push("Compatible room preference");
  }

  if (
    current.foodPreference === "any" ||
    other.foodPreference === "any" ||
    current.foodPreference ===
      other.foodPreference
  ) {
    score += 8;
    reasons.push("Similar food preference");
  }

  if (current.smoking === other.smoking) {
    score += 7;
    reasons.push("Similar smoking preference");
  }

  if (current.drinking === other.drinking) {
    score += 5;
    reasons.push("Similar drinking preference");
  }

  if (
    current.pets === other.pets ||
    current.pets === "comfortable" ||
    other.pets === "comfortable"
  ) {
    score += 5;
    reasons.push("Compatible pet preference");
  }

  if (
    current.sleepSchedule ===
    other.sleepSchedule
  ) {
    score += 8;
    reasons.push("Similar sleep schedule");
  }

  const cleanlinessDifference = Math.abs(
    Number(current.cleanliness) -
      Number(other.cleanliness)
  );

  if (cleanlinessDifference === 0) {
    score += 5;
    reasons.push("Same cleanliness level");
  } else if (cleanlinessDifference === 1) {
    score += 3;
    reasons.push("Similar cleanliness level");
  }

  const socialDifference = Math.abs(
    Number(current.socialLevel) -
      Number(other.socialLevel)
  );

  if (socialDifference === 0) {
    score += 5;
    reasons.push("Same social preference");
  } else if (socialDifference === 1) {
    score += 2;
    reasons.push("Similar social preference");
  }

  const currentMoveIn = new Date(
    current.moveInDate
  );

  const otherMoveIn = new Date(
    other.moveInDate
  );

  const daysDifference =
    Math.abs(
      currentMoveIn.getTime() -
        otherMoveIn.getTime()
    ) /
    (1000 * 60 * 60 * 24);

  if (daysDifference <= 7) {
    score += 7;
    reasons.push("Similar move-in date");
  } else if (daysDifference <= 30) {
    score += 4;
  }

  return {
    score: Math.min(Math.round(score), 100),
    reasons,
  };
};

const createRoommateProfile = async (
  req,
  res
) => {
  try {
    const existingProfile =
      await RoommateProfile.findOne({
        user: req.user.userId,
      });

    if (existingProfile) {
      return res.status(400).json({
        message:
          "You already have a roommate profile.",
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

    if (
      age === undefined ||
      !gender ||
      !occupation ||
      budget === undefined ||
      !preferredCity ||
      !moveInDate ||
      !foodPreference ||
      !smoking ||
      !drinking ||
      !pets ||
      !sleepSchedule ||
      cleanliness === undefined ||
      socialLevel === undefined ||
      !preferredRoomType
    ) {
      return res.status(400).json({
        message:
          "Please provide all required roommate profile details.",
      });
    }

    const profile =
      await RoommateProfile.create({
        user: req.user.userId,
        age,
        gender,
        occupation,
        budget,
        preferredCity,
        preferredArea:
          preferredArea || "",
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
        "name email"
      );

    return res.status(201).json({
      message:
        "Roommate profile created successfully.",
      profile: populatedProfile,
    });
  } catch (error) {
    console.error(
      "Create roommate profile error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "You already have a roommate profile.",
      });
    }

    return res.status(500).json({
      message:
        "Failed to create roommate profile.",
    });
  }
};

const getRoommateProfiles = async (
  req,
  res
) => {
  try {
    const profiles =
      await RoommateProfile.find({
        isActive: true,
      })
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      profiles,
    });
  } catch (error) {
    console.error(
      "Get roommate profiles error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch roommate profiles.",
    });
  }
};

const getMyRoommateProfile = async (
  req,
  res
) => {
  try {
    const profile =
      await RoommateProfile.findOne({
        user: req.user.userId,
      }).populate(
        "user",
        "name email"
      );

    if (!profile) {
      return res.status(404).json({
        message:
          "Roommate profile not found.",
      });
    }

    return res.status(200).json({
      profile,
    });
  } catch (error) {
    console.error(
      "Get my roommate profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch your roommate profile.",
    });
  }
};

const getRoommateProfileById = async (
  req,
  res
) => {
  try {
    const profile =
      await RoommateProfile.findOne({
        _id: req.params.id,
        isActive: true,
      }).populate(
        "user",
        "name email"
      );

    if (!profile) {
      return res.status(404).json({
        message:
          "Roommate profile not found.",
      });
    }

    return res.status(200).json({
      profile,
    });
  } catch (error) {
    console.error(
      "Get roommate profile by ID error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch roommate profile.",
    });
  }
};

const getRoommateMatches = async (
  req,
  res
) => {
  try {
    const currentProfile =
      await RoommateProfile.findOne({
        user: req.user.userId,
        isActive: true,
      }).populate(
        "user",
        "name email"
      );

    if (!currentProfile) {
      return res.status(404).json({
        message:
          "Please create and activate your roommate profile first.",
      });
    }

    const profiles =
      await RoommateProfile.find({
        isActive: true,
        user: {
          $ne: req.user.userId,
        },
      }).populate(
        "user",
        "name email"
      );

    const matches = profiles.map(
      (profile) => {
        const compatibility =
          calculateCompatibility(
            currentProfile,
            profile
          );

        return {
          profile,
          compatibilityScore:
            compatibility.score,
          reasons:
            compatibility.reasons,
        };
      }
    );

    matches.sort(
      (a, b) =>
        b.compatibilityScore -
        a.compatibilityScore
    );

    return res.status(200).json({
      currentProfile,
      matches,
    });
  } catch (error) {
    console.error(
      "Get roommate matches error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to calculate roommate matches.",
    });
  }
};

const updateMyRoommateProfile = async (
  req,
  res
) => {
  try {
    const profile =
      await RoommateProfile.findOne({
        user: req.user.userId,
      });

    if (!profile) {
      return res.status(404).json({
        message:
          "Roommate profile not found.",
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
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] =
          req.body[field];
      }
    });

    await profile.save();

    const updatedProfile =
      await RoommateProfile.findById(
        profile._id
      ).populate(
        "user",
        "name email"
      );

    return res.status(200).json({
      message:
        "Roommate profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(
      "Update roommate profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update roommate profile.",
    });
  }
};

const deleteMyRoommateProfile = async (
  req,
  res
) => {
  try {
    const profile =
      await RoommateProfile.findOne({
        user: req.user.userId,
      });

    if (!profile) {
      return res.status(404).json({
        message:
          "Roommate profile not found.",
      });
    }

    profile.isActive = false;

    await profile.save();

    return res.status(200).json({
      message:
        "Roommate profile deactivated successfully.",
    });
  } catch (error) {
    console.error(
      "Delete roommate profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to deactivate roommate profile.",
    });
  }
};

module.exports = {
  createRoommateProfile,
  getRoommateProfiles,
  getMyRoommateProfile,
  getRoommateProfileById,
  getRoommateMatches,
  updateMyRoommateProfile,
  deleteMyRoommateProfile,
};