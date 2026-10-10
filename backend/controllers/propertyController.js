const mongoose = require("mongoose");
const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");

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
        message: "Please provide all required property details.",
      });
    }

    const stringFields = {
      title,
      description,
      address,
      area,
      city,
      pincode,
    };

    for (const [field, value] of Object.entries(stringFields)) {
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

    const rentNumber = Number(rent);
    const depositNumber = Number(deposit);
    const totalRoomsNumber = Number(totalRooms);
    const availableRoomsNumber = Number(availableRooms);

    if (
      !Number.isFinite(rentNumber) ||
      !Number.isFinite(depositNumber) ||
      !Number.isFinite(totalRoomsNumber) ||
      !Number.isFinite(availableRoomsNumber)
    ) {
      return res.status(400).json({
        message: "Rent, deposit and room values must be valid numbers.",
      });
    }

    if (rentNumber < 0 || depositNumber < 0) {
      return res.status(400).json({
        message: "Rent and deposit cannot be negative.",
      });
    }

    if (
      !Number.isInteger(totalRoomsNumber) ||
      !Number.isInteger(availableRoomsNumber)
    ) {
      return res.status(400).json({
        message: "Room counts must be whole numbers.",
      });
    }

    if (totalRoomsNumber < 1) {
      return res.status(400).json({
        message: "Total rooms must be at least 1.",
      });
    }

    if (availableRoomsNumber < 0) {
      return res.status(400).json({
        message: "Available rooms cannot be negative.",
      });
    }

    if (availableRoomsNumber > totalRoomsNumber) {
      return res.status(400).json({
        message: "Available rooms cannot exceed total rooms.",
      });
    }

    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        message: "Pincode must contain exactly 6 digits.",
      });
    }

    if (amenities !== undefined && !Array.isArray(amenities)) {
      return res.status(400).json({
        message: "Amenities must be an array.",
      });
    }

    if (rules !== undefined && !Array.isArray(rules)) {
      return res.status(400).json({
        message: "Rules must be an array.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Authentication information is missing.",
      });
    }

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
      amenities: Array.isArray(amenities) ? amenities : [],
      rules: Array.isArray(rules) ? rules : [],
      owner: req.user.userId,
    });

    return res.status(201).json({
      message: "Property created successfully.",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      }));

      return res.status(400).json({
        message: "Property validation failed.",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid property data.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A property with these details already exists.",
      });
    }

    return res.status(500).json({
      message: error.message || "Something went wrong.",
    });
  }
};

const getProperties = async (req, res) => {
  try {
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
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer.",
      });
    }

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        message: "Limit must be between 1 and 50.",
      });
    }

    const escapeRegex = (value) => {
      return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const filter = {
      isActive: true,
    };

    if (
      search &&
      typeof search === "string" &&
      search.trim()
    ) {
      const safeSearch = escapeRegex(search.trim());

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

    if (
      city &&
      typeof city === "string" &&
      city.trim()
    ) {
      filter.city = {
        $regex: escapeRegex(city.trim()),
        $options: "i",
      };
    }

    if (
      area &&
      typeof area === "string" &&
      area.trim()
    ) {
      filter.area = {
        $regex: escapeRegex(area.trim()),
        $options: "i",
      };
    }

    const allowedPropertyTypes = [
      "PG",
      "Hostel",
      "Flat",
      "Room",
    ];

    if (propertyType) {
      if (!allowedPropertyTypes.includes(propertyType)) {
        return res.status(400).json({
          message: "Invalid property type.",
        });
      }

      filter.propertyType = propertyType;
    }

    const allowedGenders = [
      "Male",
      "Female",
      "Any",
    ];

    if (gender) {
      if (!allowedGenders.includes(gender)) {
        return res.status(400).json({
          message: "Invalid gender filter.",
        });
      }

      filter.gender = gender;
    }

    const allowedRoomTypes = [
      "Single",
      "Double",
      "Triple",
      "Shared",
    ];

    if (roomType) {
      if (!allowedRoomTypes.includes(roomType)) {
        return res.status(400).json({
          message: "Invalid room type.",
        });
      }

      filter.roomType = roomType;
    }

    if (
      minRent !== undefined ||
      maxRent !== undefined
    ) {
      filter.rent = {};

      if (minRent !== undefined) {
        const value = Number(minRent);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            message:
              "minRent must be a valid non-negative number.",
          });
        }

        filter.rent.$gte = value;
      }

      if (maxRent !== undefined) {
        const value = Number(maxRent);

        if (!Number.isFinite(value) || value < 0) {
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
        filter.rent.$gte > filter.rent.$lte
      ) {
        return res.status(400).json({
          message:
            "minRent cannot be greater than maxRent.",
        });
      }
    }

    if (
      minDeposit !== undefined ||
      maxDeposit !== undefined
    ) {
      filter.deposit = {};

      if (minDeposit !== undefined) {
        const value = Number(minDeposit);

        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            message:
              "minDeposit must be a valid non-negative number.",
          });
        }

        filter.deposit.$gte = value;
      }

      if (maxDeposit !== undefined) {
        const value = Number(maxDeposit);

        if (!Number.isFinite(value) || value < 0) {
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
        filter.deposit.$gte > filter.deposit.$lte
      ) {
        return res.status(400).json({
          message:
            "minDeposit cannot be greater than maxDeposit.",
        });
      }
    }

    if (availableOnly !== undefined) {
      if (
        availableOnly !== "true" &&
        availableOnly !== "false"
      ) {
        return res.status(400).json({
          message: "availableOnly must be true or false.",
        });
      }

      if (availableOnly === "true") {
        filter.availableRooms = {
          $gt: 0,
        };
      }
    }

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    } else if (sort === "rent_asc") {
      sortOption = {
        rent: 1,
        createdAt: -1,
      };
    } else if (sort === "rent_desc") {
      sortOption = {
        rent: -1,
        createdAt: -1,
      };
    } else {
      return res.status(400).json({
        message: "Invalid sort option.",
      });
    }

    const skip =
      (pageNumber - 1) * limitNumber;

    const [properties, total] =
      await Promise.all([
        Property.find(filter)
          .populate("owner", "name email")
          .sort(sortOption)
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Property.countDocuments(filter),
      ]);

    const totalPages =
      total === 0
        ? 1
        : Math.ceil(total / limitNumber);

    return res.status(200).json({
      properties,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProperties: total,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get properties error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Unable to load properties.",
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

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
        message: "Property not found.",
      });
    }

    return res.status(200).json({
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Something went wrong.",
    });
  }
};

const getMyProperties = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Authentication required.",
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
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Something went wrong.",
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

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
      "location",
    ];

    allowedFields.forEach((field) => {
      if (
        body[field] !== undefined &&
        field !== "location"
      ) {
        property[field] = body[field];
      }
    });

    if (body.location !== undefined) {
      if (
        !body.location ||
        typeof body.location !== "object"
      ) {
        return res.status(400).json({
          message: "Location must be a valid object.",
        });
      }

      const latitude =
        Number(body.location.latitude);

      const longitude =
        Number(body.location.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return res.status(400).json({
          message:
            "Latitude and longitude must be valid numbers.",
        });
      }

      if (
        latitude < -90 ||
        latitude > 90
      ) {
        return res.status(400).json({
          message:
            "Latitude must be between -90 and 90.",
        });
      }

      if (
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          message:
            "Longitude must be between -180 and 180.",
        });
      }

      property.location = {
        address:
          typeof body.location.address === "string" &&
          body.location.address.trim()
            ? body.location.address.trim()
            : property.address,
        latitude,
        longitude,
      };
    }

    const stringFields = [
      "title",
      "description",
      "address",
      "area",
      "city",
      "pincode",
    ];

    for (const field of stringFields) {
      if (property[field] !== undefined) {
        if (
          typeof property[field] !== "string"
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

    if (
      property.pincode &&
      !/^\d{6}$/.test(property.pincode)
    ) {
      return res.status(400).json({
        message:
          "Pincode must contain exactly 6 digits.",
      });
    }

    const numericFields = [
      "rent",
      "deposit",
      "totalRooms",
      "availableRooms",
    ];

    for (const field of numericFields) {
      if (property[field] !== undefined) {
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

    if (
      property.rent < 0 ||
      property.deposit < 0
    ) {
      return res.status(400).json({
        message:
          "Rent and deposit cannot be negative.",
      });
    }

    if (
      !Number.isInteger(property.totalRooms) ||
      !Number.isInteger(property.availableRooms)
    ) {
      return res.status(400).json({
        message:
          "Room counts must be whole numbers.",
      });
    }

    if (property.totalRooms < 1) {
      return res.status(400).json({
        message:
          "Total rooms must be at least 1.",
      });
    }

    if (property.availableRooms < 0) {
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

    if (!Array.isArray(property.amenities)) {
      return res.status(400).json({
        message:
          "Amenities must be an array.",
      });
    }

    if (!Array.isArray(property.rules)) {
      return res.status(400).json({
        message:
          "Rules must be an array.",
      });
    }

    for (const value of property.amenities) {
      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return res.status(400).json({
          message:
            "Amenities must contain only non-empty strings.",
        });
      }
    }

    for (const value of property.rules) {
      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return res.status(400).json({
          message:
            "Rules must contain only non-empty strings.",
        });
      }
    }

    await property.save();

    return res.status(200).json({
      message:
        "Property updated successfully.",
      property,
    });
  } catch (error) {
    console.error(
      "Update property error:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(error.errors).map(
          (item) => ({
            field: item.path,
            message: item.message,
          })
        );

      return res.status(400).json({
        message:
          "Property validation failed.",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A property with this information already exists.",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Something went wrong.",
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

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

    if (
      Array.isArray(property.images) &&
      property.images.length > 0
    ) {
      for (const image of property.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(
              image.publicId,
              {
                resource_type: "image",
              }
            );
          } catch (cloudinaryError) {
            console.error(
              "Cloudinary delete error:",
              cloudinaryError
            );
          }
        }
      }
    }

    await Property.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Property deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete property error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Something went wrong.",
    });
  }
};

const uploadPropertyImages = async (
  req,
  res
) => {
  const uploadedImages = [];

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID.",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        message:
          "Please select at least one image.",
      });
    }

    if (req.files.length > 6) {
      return res.status(400).json({
        message:
          "You can upload a maximum of 6 images.",
      });
    }

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

    if (
      property.images.length +
      req.files.length >
      6
    ) {
      return res.status(400).json({
        message:
          "A property can have a maximum of 6 images.",
      });
    }

    const uploadToCloudinary = (
      file
    ) => {
      return new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  `staysync/properties/${id}`,
                resource_type: "image",
              },
              (
                error,
                result
              ) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(file.buffer);
        }
      );
    };

    for (const file of req.files) {
      const result =
        await uploadToCloudinary(file);

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    property.images.push(
      ...uploadedImages
    );

    await property.save();

    return res.status(200).json({
      message:
        "Property images uploaded successfully.",
      images: property.images,
      property,
    });
  } catch (error) {
    console.error(
      "Upload property images error:",
      error
    );

    if (uploadedImages.length > 0) {
      for (const image of uploadedImages) {
        try {
          await cloudinary.uploader.destroy(
            image.publicId,
            {
              resource_type: "image",
            }
          );
        } catch (cleanupError) {
          console.error(
            "Cloudinary cleanup error:",
            cleanupError
          );
        }
      }
    }

    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        message:
          "Each image must be smaller than 5 MB.",
      });
    }

    if (
      error.code ===
      "LIMIT_FILE_COUNT"
    ) {
      return res.status(400).json({
        message:
          "You can upload a maximum of 6 images.",
      });
    }

    if (
      error.message ===
      "Only JPG, PNG and WebP images are allowed."
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Failed to upload property images.",
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
};