const { Readable } = require("stream");

const Property = require("../models/Property");

const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "staysync/properties",
          resource_type: "image",
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    Readable.from(buffer).pipe(uploadStream);
  });
};

const uploadPropertyImages = async (
  req,
  res
) => {
  try {
    const propertyId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please select at least one image.",
      });
    }

    const property =
      await Property.findOne({
        _id: propertyId,
        owner: req.user.userId,
      });

    if (!property) {
      return res.status(404).json({
        message:
          "Property not found or you are not the owner.",
      });
    }

    const existingImageCount =
      property.images?.length || 0;

    if (
      existingImageCount + req.files.length >
      6
    ) {
      return res.status(400).json({
        message:
          "A property can have a maximum of 6 images.",
      });
    }

    const uploadedImages = [];

    try {
      for (const file of req.files) {
        const result =
          await uploadToCloudinary(
            file.buffer
          );

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    } catch (uploadError) {
      // Clean up images already uploaded
      // if a later upload fails.
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
            "Cloudinary cleanup failed:",
            cleanupError.message
          );
        }
      }

      console.error(
        "Cloudinary upload failed:",
        uploadError
      );

      return res.status(500).json({
        message:
          "Image upload failed. Please try again.",
      });
    }

    property.images.push(
      ...uploadedImages
    );

    await property.save();

    return res.status(201).json({
      message:
        "Property images uploaded successfully.",
      images: property.images,
    });
  } catch (error) {
    console.error(
      "Upload property images error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while uploading images.",
    });
  }
};

const deletePropertyImage = async (
  req,
  res
) => {
  try {
    const {
      id: propertyId,
      imageId,
    } = req.params;

    const property =
      await Property.findOne({
        _id: propertyId,
        owner: req.user.userId,
      });

    if (!property) {
      return res.status(404).json({
        message:
          "Property not found or you are not the owner.",
      });
    }

    const image =
      property.images.id(imageId);

    if (!image) {
      return res.status(404).json({
        message: "Image not found.",
      });
    }

    await cloudinary.uploader.destroy(
      image.publicId,
      {
        resource_type: "image",
      }
    );

    image.deleteOne();

    await property.save();

    return res.status(200).json({
      message:
        "Property image deleted successfully.",
      images: property.images,
    });
  } catch (error) {
    console.error(
      "Delete property image error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while deleting the image.",
    });
  }
};

module.exports = {
  uploadPropertyImages,
  deletePropertyImage,
};