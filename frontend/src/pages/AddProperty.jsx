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
    <div className="add-property-page [min-height:100vh] [background:#0b1120] [padding:50px_20px]">
      <div className="form-container [max-width:850px] [margin:auto]">

        <div className="form-heading [margin-bottom:30px] [&_p]:[color:#5eead4] [&_p]:[font-size:13px] [&_p]:[font-weight:700] [&_p]:[letter-spacing:2px] [&_h1]:[color:#f8fafc] [&_h1]:[margin:8px_0] [&_span]:[color:#94a3b8]">
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
          <div className="form-error [padding:14px] [border-radius:8px] [margin-bottom:20px] [background:rgba(239,_68,_68,_0.1)] [border:1px_solid_rgba(248,_113,_113,_0.2)] [color:#f87171] [padding:14px_16px] [background:rgba(127,_29,_29,_0.25)] [border:1px_solid_#7f1d1d] [border-radius:10px] [color:#fca5a5] [font-size:14px]">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success [padding:14px] [border-radius:8px] [margin-bottom:20px] [background:rgba(20,_184,_166,_0.1)] [border:1px_solid_rgba(45,_212,_191,_0.15)] [color:#5eead4]">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="property-form [background:linear-gradient(_145deg,_#111827,_#0f172a_)] [padding:35px] [border-radius:15px] [border:1px_solid_#273449] [box-shadow:0_12px_35px_rgba(0,_0,_0,_0.25)] [&_label]:[display:flex] [&_label]:[flex-direction:column] [&_label]:[gap:8px] [&_label]:[margin-bottom:20px] [&_label]:[color:#e2e8f0] [&_label]:[font-weight:600] [&_input]:[padding:12px_14px] [&_input]:[border:1px_solid_#334155] [&_input]:[border-radius:8px] [&_input]:[font-size:14px] [&_input]:[font-family:inherit] [&_input]:[box-sizing:border-box] [&_input]:[background:#0f172a] [&_input]:[color:#f8fafc] [&_input]:[outline:none] [&_input]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [&_textarea]:[padding:12px_14px] [&_textarea]:[border:1px_solid_#334155] [&_textarea]:[border-radius:8px] [&_textarea]:[font-size:14px] [&_textarea]:[font-family:inherit] [&_textarea]:[box-sizing:border-box] [&_textarea]:[background:#0f172a] [&_textarea]:[color:#f8fafc] [&_textarea]:[outline:none] [&_textarea]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [&_select]:[padding:12px_14px] [&_select]:[border:1px_solid_#334155] [&_select]:[border-radius:8px] [&_select]:[font-size:14px] [&_select]:[font-family:inherit] [&_select]:[box-sizing:border-box] [&_select]:[background:#0f172a] [&_select]:[color:#f8fafc] [&_select]:[outline:none] [&_select]:[transition:border-color_0.2s_ease,_box-shadow_0.2s_ease] [&_input::placeholder]:[color:#64748b] [&_textarea::placeholder]:[color:#64748b] [&_input:focus]:[outline:none] [&_input:focus]:[border-color:#14b8a6] [&_input:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_textarea:focus]:[outline:none] [&_textarea:focus]:[border-color:#14b8a6] [&_textarea:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_select:focus]:[outline:none] [&_select:focus]:[border-color:#14b8a6] [&_select:focus]:[box-shadow:0_0_0_3px_rgba(20,_184,_166,_0.1)] [&_select_option]:[background:#111827] [&_select_option]:[color:#f8fafc] [&_h3]:[color:#f8fafc] [&_h3]:[margin:30px_0_20px] [&_small]:[color:#64748b] [&_small]:[font-weight:400] [&_button]:[width:100%] [&_button]:[padding:14px] [&_button]:[background:#0d9488] [&_button]:[color:white] [&_button]:[border:none] [&_button]:[border-radius:8px] [&_button]:[font-size:16px] [&_button]:[font-weight:700] [&_button]:[cursor:pointer] [&_button]:[transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] [&_button:hover:not(:disabled)]:[background:#14b8a6] [&_button:hover:not(:disabled)]:[transform:translateY(-1px)] [&_button:hover:not(:disabled)]:[box-shadow:0_8px_20px_rgba(20,_184,_166,_0.18)] [&_button:disabled]:[opacity:0.6] [&_button:disabled]:[cursor:not-allowed] [&_button:disabled]:[transform:none] max-[600px]:[padding:20px]"
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

          <div className="form-grid [display:grid] [grid-template-columns:repeat(2,_1fr)] [gap:18px] max-[600px]:[grid-template-columns:1fr]">

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

          <div className="form-grid [display:grid] [grid-template-columns:repeat(2,_1fr)] [gap:18px] max-[600px]:[grid-template-columns:1fr]">

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

          <div className="form-grid [display:grid] [grid-template-columns:repeat(2,_1fr)] [gap:18px] max-[600px]:[grid-template-columns:1fr]">

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

          <div className="image-upload-section [margin-top:28px] [&_h3]:[margin-bottom:8px]">

            <h3>
              Property Images
            </h3>

            <p className="image-upload-description [margin:0_0_16px] [color:#94a3b8] [font-size:14px] [line-height:1.5]">
              Upload up to 6 photos of your
              property. JPG, PNG and WebP
              images are supported.
            </p>

            <label
              htmlFor="property-images"
              className="image-upload-box [min-height:150px] [border:2px_dashed_#334155] [border-radius:14px] [background:#0f172a] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [gap:7px] [cursor:pointer] [transition:border-color_0.2s_ease,_background_0.2s_ease,_transform_0.2s_ease] [text-align:center] hover:[border-color:#14b8a6] hover:[background:rgba(20,_184,_166,_0.06)] hover:[transform:translateY(-1px)] [&_strong]:[font-size:15px] [&_strong]:[color:#e2e8f0] [&_span:last-child]:[color:#64748b] [&_span:last-child]:[font-size:13px]"
            >
              <span className="upload-icon [font-size:32px] [margin-bottom:4px]">
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
              className="image-file-input [display:none]"
            />

            {images.length > 0 && (
              <div className="image-preview-grid [display:grid] [grid-template-columns:repeat(_3,_minmax(0,_1fr)_)] [gap:14px] [margin-top:18px] max-[700px]:[grid-template-columns:repeat(_2,_minmax(0,_1fr)_)] max-[450px]:[grid-template-columns:1fr]">

                {images.map(
                  (image, index) => (
                    <div
                      className="image-preview-card [position:relative] [height:170px] [overflow:hidden] [border-radius:12px] [background:#1e293b] [border:1px_solid_#334155] [&_img]:[width:100%] [&_img]:[height:100%] [&_img]:[object-fit:cover] [&_img]:[display:block] max-[450px]:[height:200px]"
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
                        className="remove-image-button [position:absolute] [top:8px] [right:8px] [width:30px] [height:30px] [border:none] [border-radius:50%] [background:rgba(0,_0,_0,_0.72)] [color:white] [font-size:21px] [line-height:1] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [padding:0] [transition:background_0.2s_ease,_transform_0.2s_ease] hover:[background:#dc2626] hover:[transform:scale(1.05)]"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                      >
                        ×
                      </button>

                      {index === 0 && (
                        <span className="cover-badge [position:absolute] [bottom:8px] [left:8px] [padding:5px_9px] [border-radius:6px] [background:rgba(0,_0,_0,_0.72)] [color:white] [font-size:12px] [font-weight:600]">
                          Cover
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

            {images.length > 0 && (
              <p className="image-count [margin-top:10px] [font-size:13px] [color:#64748b]">
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