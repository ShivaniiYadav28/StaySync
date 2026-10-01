import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AddProperty.css";

function AddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "PG",
    gender: "Any",
    address: "",
    area: "",
    city: "",
    pincode: "",
    rent: "",
    deposit: "",
    roomType: "Double",
    totalRooms: "",
    availableRooms: "",
    amenities: "",
    rules: "",
  });

  const [images, setImages] = useState([]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    setError("");

    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    if (
      images.length + selectedFiles.length >
      6
    ) {
      setError(
        "You can upload a maximum of 6 images."
      );

      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Only JPG, PNG, and WebP images are allowed."
        );

        event.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(
          `"${file.name}" is larger than 5 MB.`
        );

        event.target.value = "";
        return;
      }
    }

    setImages((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImages((previous) =>
      previous.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = {
        ...form,

        rent: Number(form.rent),

        deposit: Number(form.deposit),

        totalRooms: Number(
          form.totalRooms
        ),

        availableRooms: Number(
          form.availableRooms
        ),

        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        rules: form.rules
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      // STEP 1:
      // Create the property first
      const propertyResponse =
        await api.post(
          "/properties",
          data
        );

      const property =
        propertyResponse.data.property;

      if (!property?._id) {
        throw new Error(
          "Property was created but its ID was not returned."
        );
      }

      // STEP 2:
      // Upload images to Cloudinary
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((image) => {
          formData.append(
            "images",
            image
          );
        });

        await api.post(
          `/properties/${property._id}/images`,
          formData
        );
      }

      setSuccess(
        images.length > 0
          ? "Property and images uploaded successfully."
          : "Property created successfully."
      );

      setTimeout(() => {
        navigate(
          "/owner/my-properties"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Create property error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create property."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property-page">
      <div className="form-container">

        <div className="form-heading">
          <p>STAYSYNC OWNER</p>

          <h1>
            Add your property
          </h1>

          <span>
            Provide accurate information
            so seekers can find your
            property easily.
          </span>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="property-form"
        >

          <label>
            Property title

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Premium PG near Manyata Tech Park"
              required
            />
          </label>

          <label>
            Description

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows="5"
              required
            />
          </label>

          <div className="form-grid">

            <label>
              Property type

              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
              >
                <option value="PG">
                  PG
                </option>

                <option value="Hostel">
                  Hostel
                </option>

                <option value="Flat">
                  Flat
                </option>

                <option value="Room">
                  Room
                </option>
              </select>
            </label>

            <label>
              Suitable for

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="Any">
                  Any
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </label>

            <label>
              Room type

              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
              >
                <option value="Single">
                  Single
                </option>

                <option value="Double">
                  Double
                </option>

                <option value="Triple">
                  Triple
                </option>

                <option value="Shared">
                  Shared
                </option>
              </select>
            </label>

          </div>

          <h3>
            Location
          </h3>

          <label>
            Address

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-grid">

            <label>
              Area

              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              City

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Pincode

              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                maxLength="6"
                required
              />
            </label>

          </div>

          <h3>
            Pricing & rooms
          </h3>

          <div className="form-grid">

            <label>
              Monthly rent

              <input
                type="number"
                name="rent"
                value={form.rent}
                onChange={handleChange}
                min="0"
                required
              />
            </label>

            <label>
              Security deposit

              <input
                type="number"
                name="deposit"
                value={form.deposit}
                onChange={handleChange}
                min="0"
                required
              />
            </label>

            <label>
              Total rooms

              <input
                type="number"
                name="totalRooms"
                value={form.totalRooms}
                onChange={handleChange}
                min="1"
                required
              />
            </label>

            <label>
              Available rooms

              <input
                type="number"
                name="availableRooms"
                value={form.availableRooms}
                onChange={handleChange}
                min="0"
                required
              />
            </label>

          </div>

          <label>
            Amenities

            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              placeholder="WiFi, Food, Laundry, Parking"
            />

            <small>
              Separate each amenity with a comma.
            </small>
          </label>

          <label>
            Rules

            <input
              name="rules"
              value={form.rules}
              onChange={handleChange}
              placeholder="No smoking, No pets"
            />

            <small>
              Separate each rule with a comma.
            </small>
          </label>

          {/* ========================= */}
          {/* PROPERTY IMAGE UPLOAD */}
          {/* ========================= */}

          <div className="image-upload-section">

            <h3>
              Property Images
            </h3>

            <p className="image-upload-description">
              Upload up to 6 photos of your
              property. JPG, PNG and WebP
              images are supported.
            </p>

            <label
              htmlFor="property-images"
              className="image-upload-box"
            >
              <span className="upload-icon">
                📷
              </span>

              <strong>
                Click to upload images
              </strong>

              <span>
                Maximum 6 images • 5 MB each
              </span>
            </label>

            <input
              id="property-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="image-file-input"
            />

            {/* IMAGE PREVIEWS */}

            {images.length > 0 && (
              <div className="image-preview-grid">

                {images.map(
                  (image, index) => (
                    <div
                      className="image-preview-card"
                      key={`${image.name}-${index}`}
                    >

                      <img
                        src={URL.createObjectURL(
                          image
                        )}
                        alt={`Property preview ${
                          index + 1
                        }`}
                      />

                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() =>
                          removeImage(index)
                        }
                      >
                        ×
                      </button>

                      {index === 0 && (
                        <span className="cover-badge">
                          Cover
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

            {images.length > 0 && (
              <p className="image-count">
                {images.length} / 6 images
                selected
              </p>
            )}

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating & uploading..."
              : "Create Property"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddProperty;