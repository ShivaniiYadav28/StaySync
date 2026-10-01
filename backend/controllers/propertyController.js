const mongoose = require("mongoose");
const Property = require("../models/Property");

// =====================================
// CREATE PROPERTY
// =====================================

const createProperty = async (req, res) => {
  try {
    const body = req.body || {};

    const {
      title,
      description,
      propertyType,
      gender,
      address,
      area,
      city,
      pincode,
      rent,
      deposit,
      roomType,
      totalRooms,
      availableRooms,
      amenities,
      rules,
    } = body;

    // =====================================
    // REQUIRED FIELD VALIDATION
    // =====================================

    if (
      !title ||
      !description ||
      !propertyType ||
      !gender ||
      !address ||
      !area ||
      !city ||
      !pincode ||
      rent === undefined ||
      deposit === undefined ||
      !roomType ||
      totalRooms === undefined ||
      availableRooms === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide all required property details.",
      });
    }

    // =====================================
    // STRING VALIDATION
    // =====================================

    const stringFields = {
      title,
      description,
      address,
      area,
      city,
      pincode,
    };

    for (const [field, value] of Object.entries(
      stringFields
    )) {
      if (typeof value !== "string") {
        return res.status(400).json({
          message: `${field} must be a string.`,
        });
      }

      if (!value.trim()) {
        return res.status(400).json({
          message: `${field} cannot be empty.`,
        });
      }
    }

    // =====================================
    // NUMBER CONVERSION
    // =====================================

    const rentNumber = Number(rent);
    const depositNumber = Number(deposit);
    const totalRoomsNumber = Number(totalRooms);
    const availableRoomsNumber =
      Number(availableRooms);

    // =====================================
    // NUMBER VALIDATION
    // =====================================

    if (
      !Number.isFinite(rentNumber) ||
      !Number.isFinite(depositNumber) ||
      !Number.isFinite(totalRoomsNumber) ||
      !Number.isFinite(availableRoomsNumber)
    ) {
      return res.status(400).json({
        message:
          "Rent, deposit and room values must be valid numbers.",
      });
    }

    if (
      rentNumber < 0 ||
      depositNumber < 0
    ) {
      return res.status(400).json({
        message:
          "Rent and deposit cannot be negative.",
      });
    }

    if (
      !Number.isInteger(totalRoomsNumber) ||
      !Number.isInteger(availableRoomsNumber)
    ) {
      return res.status(400).json({
        message:
          "Room counts must be whole numbers.",
      });
    }

    if (totalRoomsNumber < 1) {
      return res.status(400).json({
        message:
          "Total rooms must be at least 1.",
      });
    }

    if (availableRoomsNumber < 0) {
      return res.status(400).json({
        message:
          "Available rooms cannot be negative.",
      });
    }

    if (
      availableRoomsNumber >
      totalRoomsNumber
    ) {
      return res.status(400).json({
        message:
          "Available rooms cannot exceed total rooms.",
      });
    }

    // =====================================
    // PINCODE VALIDATION
    // =====================================

    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        message:
          "Pincode must contain exactly 6 digits.",
      });
    }

    // =====================================
    // ARRAY VALIDATION
    // =====================================

    if (
      amenities !== undefined &&
      !Array.isArray(amenities)
    ) {
      return res.status(400).json({
        message:
          "Amenities must be an array.",
      });
    }

    if (
      rules !== undefined &&
      !Array.isArray(rules)
    ) {
      return res.status(400).json({
        message:
          "Rules must be an array.",
      });
    }

    // =====================================
    // AUTHENTICATION CHECK
    // =====================================

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message:
          "Authentication information is missing.",
      });
    }

    // =====================================
    // CREATE PROPERTY
    // =====================================

    const property = await Property.create({
      title: title.trim(),

      description: description.trim(),

      propertyType,

      gender,

      address: address.trim(),

      area: area.trim(),

      city: city.trim(),

      pincode: cleanPincode,

      rent: rentNumber,

      deposit: depositNumber,

      roomType,

      totalRooms: totalRoomsNumber,

      availableRooms: availableRoomsNumber,

      amenities: Array.isArray(amenities)
        ? amenities
        : [],

      rules: Array.isArray(rules)
        ? rules
        : [],

      owner: req.user.userId,
    });

    return res.status(201).json({
      message:
        "Property created successfully.",

      property,
    });
  } catch (error) {
    console.error(
      "Create property error:",
      error.message
    );

    // =====================================
    // MONGOOSE VALIDATION ERROR
    // =====================================

    if (
      error.name === "ValidationError"
    ) {
      const errors = Object.values(
        error.errors
      ).map((item) => ({
        field: item.path,
        message: item.message,
      }));

      return res.status(400).json({
        message:
          "Property validation failed.",
        errors,
      });
    }

    // =====================================
    // INVALID OBJECT ID
    // =====================================

    if (error.name === "CastError") {
      return res.status(400).json({
        message:
          "Invalid property data.",
      });
    }

    // =====================================
    // DUPLICATE KEY
    // =====================================

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A property with these details already exists.",
      });
    }

    // =====================================
    // UNKNOWN ERROR
    // =====================================

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// GET ALL PROPERTIES
// SEARCH + FILTER + PAGINATION
// =====================================

const getProperties = async (req, res) => {
  try {
    // =====================================
    // QUERY PARAMETERS
    // =====================================

    const {
      search,
      city,
      area,
      propertyType,
      gender,
      roomType,
      minRent,
      maxRent,
      minDeposit,
      maxDeposit,
      availableOnly,
      page = 1,
      limit = 12,
    } = req.query;

    // =====================================
    // PAGINATION VALIDATION
    // =====================================

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1
    ) {
      return res.status(400).json({
        message:
          "Page must be a positive integer.",
      });
    }

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        message:
          "Limit must be between 1 and 50.",
      });
    }

    // =====================================
    // HELPER: ESCAPE REGEX
    // =====================================

    const escapeRegex = (value) => {
      return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
    };

    // =====================================
    // BUILD FILTER
    // =====================================

    const filter = {
      isActive: true,
    };

    // =====================================
    // SEARCH
    // =====================================

    if (
      search &&
      typeof search === "string"
    ) {
      const cleanSearch =
        search.trim();

      if (cleanSearch) {
        const safeSearch =
          escapeRegex(cleanSearch);

        filter.$or = [
          {
            title: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            description: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            area: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            city: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ];
      }
    }

    // =====================================
    // CITY
    // =====================================

    if (
      city &&
      typeof city === "string"
    ) {
      filter.city = {
        $regex: escapeRegex(
          city.trim()
        ),
        $options: "i",
      };
    }

    // =====================================
    // AREA
    // =====================================

    if (
      area &&
      typeof area === "string"
    ) {
      filter.area = {
        $regex: escapeRegex(
          area.trim()
        ),
        $options: "i",
      };
    }

    // =====================================
    // PROPERTY TYPE
    // =====================================

    const allowedPropertyTypes = [
      "PG",
      "Hostel",
      "Flat",
      "Room",
    ];

    if (propertyType) {
      if (
        !allowedPropertyTypes.includes(
          propertyType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid property type.",
        });
      }

      filter.propertyType =
        propertyType;
    }

    // =====================================
    // GENDER
    // =====================================

    const allowedGenders = [
      "Male",
      "Female",
      "Any",
    ];

    if (gender) {
      if (
        !allowedGenders.includes(
          gender
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid gender filter.",
        });
      }

      filter.gender = gender;
    }

    // =====================================
    // ROOM TYPE
    // =====================================

    const allowedRoomTypes = [
      "Single",
      "Double",
      "Triple",
      "Shared",
    ];

    if (roomType) {
      if (
        !allowedRoomTypes.includes(
          roomType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid room type.",
        });
      }

      filter.roomType = roomType;
    }

    // =====================================
    // RENT FILTER
    // =====================================

    if (
      minRent !== undefined ||
      maxRent !== undefined
    ) {
      filter.rent = {};

      if (minRent !== undefined) {
        const value = Number(minRent);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "minRent must be a valid non-negative number.",
          });
        }

        filter.rent.$gte = value;
      }

      if (maxRent !== undefined) {
        const value = Number(maxRent);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "maxRent must be a valid non-negative number.",
          });
        }

        filter.rent.$lte = value;
      }

      if (
        filter.rent.$gte !== undefined &&
        filter.rent.$lte !== undefined &&
        filter.rent.$gte >
          filter.rent.$lte
      ) {
        return res.status(400).json({
          message:
            "minRent cannot be greater than maxRent.",
        });
      }
    }

    // =====================================
    // DEPOSIT FILTER
    // =====================================

    if (
      minDeposit !== undefined ||
      maxDeposit !== undefined
    ) {
      filter.deposit = {};

      if (minDeposit !== undefined) {
        const value =
          Number(minDeposit);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "minDeposit must be a valid non-negative number.",
          });
        }

        filter.deposit.$gte = value;
      }

      if (maxDeposit !== undefined) {
        const value =
          Number(maxDeposit);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "maxDeposit must be a valid non-negative number.",
          });
        }

        filter.deposit.$lte = value;
      }

      if (
        filter.deposit.$gte !== undefined &&
        filter.deposit.$lte !== undefined &&
        filter.deposit.$gte >
          filter.deposit.$lte
      ) {
        return res.status(400).json({
          message:
            "minDeposit cannot be greater than maxDeposit.",
        });
      }
    }

    // =====================================
    // AVAILABLE ROOMS
    // =====================================

    if (
      availableOnly !== undefined
    ) {
      if (
        availableOnly !== "true" &&
        availableOnly !== "false"
      ) {
        return res.status(400).json({
          message:
            "availableOnly must be true or false.",
        });
      }

      if (availableOnly === "true") {
        filter.availableRooms = {
          $gt: 0,
        };
      }
    }

    // =====================================
    // DATABASE QUERY
    // =====================================

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [properties, total] =
      await Promise.all([
        Property.find(filter)
          .populate(
            "owner",
            "name email"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber),

        Property.countDocuments(
          filter
        ),
      ]);

    // =====================================
    // PAGINATION DATA
    // =====================================

    const totalPages =
      Math.ceil(
        total / limitNumber
      );

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      properties,

      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProperties: total,
        limit: limitNumber,
        hasNextPage:
          pageNumber < totalPages,
        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get properties error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// GET SINGLE PROPERTY
// =====================================

const getPropertyById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // =====================================
    // ID VALIDATION
    // =====================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid property ID.",
      });
    }

    // =====================================
    // FIND PROPERTY
    // =====================================

    const property =
      await Property.findOne({
        _id: id,
        isActive: true,
      }).populate(
        "owner",
        "name email"
      );

    if (!property) {
      return res.status(404).json({
        message:
          "Property not found.",
      });
    }

    return res.status(200).json({
      property,
    });
  } catch (error) {
    console.error(
      "Get property error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// GET MY PROPERTIES
// =====================================

const getMyProperties = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const properties =
      await Property.find({
        owner: req.user.userId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      properties,
    });
  } catch (error) {
    console.error(
      "Get my properties error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// UPDATE PROPERTY
// =====================================

const updateProperty = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // =====================================
    // ID VALIDATION
    // =====================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid property ID.",
      });
    }

    // =====================================
    // OWNERSHIP CHECK
    // =====================================

    const property =
      await Property.findOne({
        _id: id,
        owner: req.user.userId,
      });

    if (!property) {
      return res.status(404).json({
        message:
          "Property not found or you are not the owner.",
      });
    }

    const body = req.body || {};

    // =====================================
    // ALLOWED FIELDS
    // =====================================
    // IMPORTANT:
    // owner and isActive are intentionally
    // NOT allowed to be changed here.

    const allowedFields = [
      "title",
      "description",
      "propertyType",
      "gender",
      "address",
      "area",
      "city",
      "pincode",
      "rent",
      "deposit",
      "roomType",
      "totalRooms",
      "availableRooms",
      "amenities",
      "rules",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          body[field] !== undefined
        ) {
          property[field] =
            body[field];
        }
      }
    );

    // =====================================
    // STRING VALIDATION
    // =====================================

    const stringFields = [
      "title",
      "description",
      "address",
      "area",
      "city",
      "pincode",
    ];

    for (const field of stringFields) {
      if (
        property[field] !== undefined
      ) {
        if (
          typeof property[field] !==
          "string"
        ) {
          return res.status(400).json({
            message:
              `${field} must be a string.`,
          });
        }

        property[field] =
          property[field].trim();

        if (!property[field]) {
          return res.status(400).json({
            message:
              `${field} cannot be empty.`,
          });
        }
      }
    }

    // =====================================
    // PINCODE VALIDATION
    // =====================================

    if (
      property.pincode &&
      !/^\d{6}$/.test(
        property.pincode
      )
    ) {
      return res.status(400).json({
        message:
          "Pincode must contain exactly 6 digits.",
      });
    }

    // =====================================
    // NUMBER VALIDATION
    // =====================================

    const numericFields = [
      "rent",
      "deposit",
      "totalRooms",
      "availableRooms",
    ];

    for (const field of numericFields) {
      if (
        property[field] !== undefined
      ) {
        const value = Number(
          property[field]
        );

        if (!Number.isFinite(value)) {
          return res.status(400).json({
            message:
              `${field} must be a valid number.`,
          });
        }

        property[field] = value;
      }
    }

    // =====================================
    // RENT / DEPOSIT VALIDATION
    // =====================================

    if (
      property.rent < 0 ||
      property.deposit < 0
    ) {
      return res.status(400).json({
        message:
          "Rent and deposit cannot be negative.",
      });
    }

    // =====================================
    // ROOM VALIDATION
    // =====================================

    if (
      !Number.isInteger(
        property.totalRooms
      ) ||
      !Number.isInteger(
        property.availableRooms
      )
    ) {
      return res.status(400).json({
        message:
          "Room counts must be whole numbers.",
      });
    }

    if (
      property.totalRooms < 1
    ) {
      return res.status(400).json({
        message:
          "Total rooms must be at least 1.",
      });
    }

    if (
      property.availableRooms < 0
    ) {
      return res.status(400).json({
        message:
          "Available rooms cannot be negative.",
      });
    }

    if (
      property.availableRooms >
      property.totalRooms
    ) {
      return res.status(400).json({
        message:
          "Available rooms cannot exceed total rooms.",
      });
    }

    // =====================================
    // ARRAY VALIDATION
    // =====================================

    if (
      !Array.isArray(
        property.amenities
      )
    ) {
      return res.status(400).json({
        message:
          "Amenities must be an array.",
      });
    }

    if (
      !Array.isArray(
        property.rules
      )
    ) {
      return res.status(400).json({
        message:
          "Rules must be an array.",
      });
    }

    // =====================================
    // ARRAY CONTENT VALIDATION
    // =====================================

    const arraysToValidate = [
      {
        name: "amenities",
        value: property.amenities,
      },
      {
        name: "rules",
        value: property.rules,
      },
    ];

    for (const item of arraysToValidate) {
      for (const value of item.value) {
        if (
          typeof value !== "string"
        ) {
          return res.status(400).json({
            message:
              `${item.name} must contain only strings.`,
          });
        }

        if (!value.trim()) {
          return res.status(400).json({
            message:
              `${item.name} cannot contain empty values.`,
          });
        }
      }
    }

    // =====================================
    // SAVE
    // =====================================

    await property.save();

    return res.status(200).json({
      message:
        "Property updated successfully.",
      property,
    });
  } catch (error) {
    console.error(
      "Update property error:",
      error.message
    );

    // =====================================
    // MONGOOSE VALIDATION ERROR
    // =====================================

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors = Object.values(
        error.errors
      ).map((item) => ({
        field: item.path,
        message: item.message,
      }));

      return res.status(400).json({
        message:
          "Property validation failed.",
        errors,
      });
    }

    // =====================================
    // DUPLICATE KEY ERROR
    // =====================================

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A property with this information already exists.",
      });
    }

    // =====================================
    // SERVER ERROR
    // =====================================

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// DELETE PROPERTY
// =====================================

const deleteProperty = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // =====================================
    // ID VALIDATION
    // =====================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid property ID.",
      });
    }

    // =====================================
    // OWNERSHIP CHECK
    // =====================================

    const property =
      await Property.findOne({
        _id: id,
        owner: req.user.userId,
      });

    if (!property) {
      return res.status(404).json({
        message:
          "Property not found or you are not the owner.",
      });
    }

    await Property.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Property deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete property error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Something went wrong.",
    });
  }
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};