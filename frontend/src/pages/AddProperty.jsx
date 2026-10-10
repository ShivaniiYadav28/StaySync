import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "./AddProperty.css";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(event) {
      const latitude = event.latlng.lat;
      const longitude = event.latlng.lng;

      const newPosition = {
        latitude,
        longitude,
      };

      setPosition([
        latitude,
        longitude,
      ]);

      setLocation(newPosition);
    },
  });

  if (
    !position ||
    !Array.isArray(position) ||
    position.length !== 2 ||
    !Number.isFinite(position[0]) ||
    !Number.isFinite(position[1])
  ) {
    return null;
  }

  return <Marker position={position} />;
}

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

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultPosition = [
    12.9716,
    77.5946,
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

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

  const handleLocationSelect = (newLocation) => {
    setLocation(newLocation);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !Number.isFinite(location.latitude) ||
      !Number.isFinite(location.longitude)
    ) {
      setError(
        "Please select your property location on the map."
      );
      return;
    }

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

        location: {
          address: form.address,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };

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
              placeholder="Enter complete property address"
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

          <div
            style={{
              marginTop: "20px",
              marginBottom: "30px",
            }}
          >
            <h3>
              Select Property Location
            </h3>

            <p
              style={{
                color: "#9ca3af",
                marginBottom: "15px",
              }}
            >
              Click anywhere on the map to
              select the exact property
              location.
            </p>

            <div
              style={{
                height: "400px",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                border:
                  "1px solid #374151",
                position: "relative",
                zIndex: 1,
              }}
            >
              <MapContainer
                center={defaultPosition}
                zoom={12}
                scrollWheelZoom={true}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker
                  setLocation={
                    handleLocationSelect
                  }
                />
              </MapContainer>
            </div>

            {Number.isFinite(
              location.latitude
            ) &&
              Number.isFinite(
                location.longitude
              ) && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "14px",
                    borderRadius: "10px",
                    background:
                      "#111827",
                    border:
                      "1px solid #374151",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#22d3ee",
                      fontWeight: 600,
                    }}
                  >
                    Location selected
                  </p>

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      color: "#9ca3af",
                      fontSize:
                        "14px",
                    }}
                  >
                    Latitude:{" "}
                    {location.latitude.toFixed(
                      6
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      color: "#9ca3af",
                      fontSize:
                        "14px",
                    }}
                  >
                    Longitude:{" "}
                    {location.longitude.toFixed(
                      6
                    )}
                  </p>
                </div>
              )}
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
                value={
                  form.availableRooms
                }
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
              Separate each amenity with a
              comma.
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
              Separate each rule with a
              comma.
            </small>
          </label>

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
                          removeImage(
                            index
                          )
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