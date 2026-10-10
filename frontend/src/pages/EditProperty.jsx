import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(event) {
      setPosition([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={markerIcon}
    />
  );
};

const EditProperty = () => {
  const { id } = useParams();
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
  const [newImages, setNewImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const defaultMapPosition = [12.9716, 77.5946];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const validFiles = selectedFiles.filter(
      (file) => allowedTypes.includes(file.type)
    );

    const sizeValidFiles = validFiles.filter(
      (file) => file.size <= 5 * 1024 * 1024
    );

    if (
      validFiles.length !==
      selectedFiles.length
    ) {
      setError(
        "Only JPG, PNG and WebP images are allowed."
      );
      event.target.value = "";
      return;
    }

    if (
      sizeValidFiles.length !==
      validFiles.length
    ) {
      setError(
        "Each image must be smaller than 5MB."
      );
      event.target.value = "";
      return;
    }

    if (
      images.length + sizeValidFiles.length >
      6
    ) {
      setError(
        "A property can have a maximum of 6 images."
      );
      event.target.value = "";
      return;
    }

    setError("");
    setNewImages(sizeValidFiles);
    event.target.value = "";
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/properties/${id}`
      );

      const property =
        response.data.property;

      if (!property) {
        throw new Error(
          "Property not found."
        );
      }

      setForm({
        title: property.title || "",
        description:
          property.description || "",
        propertyType:
          property.propertyType || "PG",
        gender: property.gender || "Any",
        address: property.address || "",
        area: property.area || "",
        city: property.city || "",
        pincode: property.pincode || "",
        rent: property.rent ?? "",
        deposit: property.deposit ?? "",
        roomType:
          property.roomType || "Double",
        totalRooms:
          property.totalRooms ?? "",
        availableRooms:
          property.availableRooms ?? "",
        amenities: Array.isArray(
          property.amenities
        )
          ? property.amenities.join(", ")
          : "",
        rules: Array.isArray(
          property.rules
        )
          ? property.rules.join(", ")
          : "",
      });

      setImages(
        Array.isArray(property.images)
          ? property.images
          : []
      );

      const latitude = Number(
        property.location?.latitude ??
          property.location?.lat ??
          property.latitude
      );

      const longitude = Number(
        property.location?.longitude ??
          property.location?.lng ??
          property.longitude
      );

      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      ) {
        setLocation([
          latitude,
          longitude,
        ]);
      } else {
        setLocation(null);
      }
    } catch (err) {
      console.error(
        "Fetch property error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load property."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!location) {
        setError(
          "Please select the exact property location on the map."
        );
        setSaving(false);
        return;
      }

      const data = {
        title: form.title,
        description: form.description,
        propertyType: form.propertyType,
        gender: form.gender,
        address: form.address,
        area: form.area,
        city: form.city,
        pincode: form.pincode,
        rent: Number(form.rent),
        deposit: Number(form.deposit),
        roomType: form.roomType,
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
          address:
            form.address,
          latitude: location[0],
          longitude: location[1],
        },
      };

      await api.put(
        `/properties/${id}`,
        data
      );

      if (newImages.length > 0) {
        const formData = new FormData();

        newImages.forEach((image) => {
          formData.append(
            "images",
            image
          );
        });

        await api.post(
          `/properties/${id}/images`,
          formData
        );
      }

      setSuccess(
        "Property updated successfully."
      );

      setTimeout(() => {
        navigate(
          "/owner/my-properties"
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Update property error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update property."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/owner/my-properties");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">
            Loading property...
          </p>
        </div>
      </div>
    );
  }

  const mapPosition =
    location || defaultMapPosition;

  return (
    <div className="min-h-screen bg-[#080d1d] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-cyan-400 font-semibold tracking-[0.25em] text-sm">
            STAYSYNC OWNER
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Edit Property
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            Update your property information and keep your listing accurate.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-950/30 px-5 py-4">
            <p className="text-red-400">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/40 bg-green-950/30 px-5 py-4">
            <p className="text-green-400">
              {success}
            </p>
          </div>
        )}

        <div className="bg-[#11182b] border border-gray-700 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold">
                Property Images
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Manage your property photos
              </p>
            </div>

            <span className="text-cyan-400 text-sm">
              {images.length} / 6 images
            </span>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {images.map(
                (image, index) => (
                  <div
                    key={
                      image.publicId ||
                      index
                    }
                    className="relative h-48 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 group"
                  >
                    <img
                      src={image.url}
                      alt={`Property ${
                        index + 1
                      }`}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <span className="text-white text-sm">
                        Image {index + 1}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="border border-dashed border-gray-600 rounded-xl py-10 text-center mb-6">
              <div className="text-4xl mb-3">
                📷
              </div>

              <p className="text-gray-400">
                No images uploaded yet.
              </p>

              <p className="text-gray-600 text-sm mt-1">
                Add images below to improve your listing.
              </p>
            </div>
          )}

          {images.length < 6 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Add New Images
              </label>

              <label className="block border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer transition">
                <div className="text-4xl mb-3">
                  +
                </div>

                <p className="text-gray-300 font-medium">
                  Click to select images
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  JPG, PNG or WebP • Maximum 5MB each
                </p>

                <p className="text-cyan-400 text-sm mt-1">
                  {6 - images.length} image
                  {6 - images.length !== 1
                    ? "s"
                    : ""}{" "}
                  remaining
                </p>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              </label>

              {newImages.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm text-gray-300 mb-3">
                    New images selected:{" "}
                    {newImages.length}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newImages.map(
                      (image, index) => (
                        <div
                          key={`${image.name}-${index}`}
                          className="relative h-40 rounded-xl overflow-hidden border border-cyan-500/40"
                        >
                          <img
                            src={URL.createObjectURL(
                              image
                            )}
                            alt={`New image ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-2">
                            <p className="text-white text-xs truncate">
                              {image.name}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#11182b] border border-gray-700 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8 border-b border-gray-700">
            <h2 className="text-2xl font-semibold">
              Property Details
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Update the information below.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-7">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Property Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                required
                className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none resize-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Property Type
                </label>

                <select
                  name="propertyType"
                  value={
                    form.propertyType
                  }
                  onChange={handleChange}
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Suitable For
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Area
                </label>

                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  maxLength="6"
                  required
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="bg-[#0d1425] border border-gray-700 rounded-2xl p-5">
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-white">
                  Property Location
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Click on the map to select the exact location of this property.
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-700">
                <MapContainer
                  center={mapPosition}
                  zoom={location ? 16 : 12}
                  scrollWheelZoom={true}
                  style={{
                    width: "100%",
                    height: "400px",
                  }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <LocationMarker
                    position={location}
                    setPosition={
                      setLocation
                    }
                  />
                </MapContainer>
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  {location ? (
                    <>
                      <p className="text-green-400 font-medium">
                        Location selected
                      </p>

                      <p className="text-gray-500 text-sm mt-1">
                        Latitude:{" "}
                        {location[0].toFixed(
                          6
                        )}{" "}
                        | Longitude:{" "}
                        {location[1].toFixed(
                          6
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-yellow-400">
                      Click on the map to select the property location.
                    </p>
                  )}
                </div>

                {location && (
                  <button
                    type="button"
                    onClick={() =>
                      setLocation(null)
                    }
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Clear Location
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Rent
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-semibold">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="rent"
                    value={form.rent}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full bg-[#080d1d] border border-gray-700 rounded-xl pl-9 pr-4 py-3.5 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deposit
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-semibold">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="deposit"
                    value={form.deposit}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full bg-[#080d1d] border border-gray-700 rounded-xl pl-9 pr-4 py-3.5 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Type
                </label>

                <select
                  name="roomType"
                  value={form.roomType}
                  onChange={handleChange}
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Rooms
                </label>

                <input
                  type="number"
                  name="totalRooms"
                  value={form.totalRooms}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available Rooms
                </label>

                <input
                  type="number"
                  name="availableRooms"
                  value={
                    form.availableRooms
                  }
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amenities
              </label>

              <input
                type="text"
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="WiFi, AC, Washing Machine"
                className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
              />

              <p className="text-gray-600 text-xs mt-2">
                Separate amenities with commas.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rules
              </label>

              <input
                type="text"
                name="rules"
                value={form.rules}
                onChange={handleChange}
                placeholder="No smoking, No pets"
                className="w-full bg-[#080d1d] border border-gray-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400"
              />

              <p className="text-gray-600 text-xs mt-2">
                Separate rules with commas.
              </p>
            </div>
          </div>

          <div className="px-6 md:px-8 py-6 border-t border-gray-700 bg-[#0d1425]">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3.5 rounded-xl font-semibold transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition"
              >
                {saving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;