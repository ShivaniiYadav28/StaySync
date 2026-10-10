import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateRoommateProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "",
    occupation: "",
    budget: "",
    preferredCity: "",
    preferredArea: "",
    moveInDate: "",
    foodPreference: "",
    smoking: "",
    drinking: "",
    pets: "",
    sleepSchedule: "",
    cleanliness: 3,
    socialLevel: 3,
    preferredRoomType: "",
  });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await api.get("/roommates/me");

        if (response.data?.profile) {
          navigate("/roommates");
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          setError("Unable to check your roommate profile.");
        }
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.age ||
      !form.gender ||
      !form.occupation ||
      !form.budget ||
      !form.preferredCity ||
      !form.moveInDate ||
      !form.foodPreference ||
      !form.smoking ||
      !form.drinking ||
      !form.pets ||
      !form.sleepSchedule ||
      !form.preferredRoomType
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/roommates", {
        age: Number(form.age),
        gender: form.gender,
        occupation: form.occupation,
        budget: Number(form.budget),
        preferredCity: form.preferredCity,
        preferredArea: form.preferredArea,
        moveInDate: form.moveInDate,
        foodPreference: form.foodPreference,
        smoking: form.smoking,
        drinking: form.drinking,
        pets: form.pets,
        sleepSchedule: form.sleepSchedule,
        cleanliness: Number(form.cleanliness),
        socialLevel: Number(form.socialLevel),
        preferredRoomType: form.preferredRoomType,
      });

      setSuccess("Your roommate profile has been created successfully.");

      setTimeout(() => {
        navigate("/roommates");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create roommate profile."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500"></div>
          <p className="mt-4 text-slate-400">
            Checking your profile...
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-500";

  const selectClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
            <span className="text-3xl">👥</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create Your Roommate Profile
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Tell us about yourself and your preferences. We'll use
            this information to find compatible roommates for you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-white">
              Basic Information
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Help potential roommates know a little about you.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label className={labelClass}>
                Age <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="18"
                max="100"
                placeholder="Enter your age"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Gender <span className="text-red-400">*</span>
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">
                  Prefer not to say
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Occupation <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                placeholder="Student, Software Engineer..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Monthly Budget <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  min="0"
                  placeholder="15000"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
          </div>

          <div className="border-y border-white/10 bg-white/[0.02] px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-white">
              Location & Move-in
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Tell us where and when you're looking for a place.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label className={labelClass}>
                Preferred City <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="preferredCity"
                value={form.preferredCity}
                onChange={handleChange}
                placeholder="Bangalore"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Preferred Area
              </label>
              <input
                type="text"
                name="preferredArea"
                value={form.preferredArea}
                onChange={handleChange}
                placeholder="Yelahanka, Whitefield..."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Move-in Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="moveInDate"
                value={form.moveInDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Preferred Room Type{" "}
                <span className="text-red-400">*</span>
              </label>
              <select
                name="preferredRoomType"
                value={form.preferredRoomType}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select room type</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="shared">Shared</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>

          <div className="border-y border-white/10 bg-white/[0.02] px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-white">
              Lifestyle Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              These preferences help us calculate roommate compatibility.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label className={labelClass}>
                Food Preference{" "}
                <span className="text-red-400">*</span>
              </label>
              <select
                name="foodPreference"
                value={form.foodPreference}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select preference</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non_vegetarian">
                  Non-Vegetarian
                </option>
                <option value="vegan">Vegan</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Smoking <span className="text-red-400">*</span>
              </label>
              <select
                name="smoking"
                value={form.smoking}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Drinking <span className="text-red-400">*</span>
              </label>
              <select
                name="drinking"
                value={form.drinking}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Pets <span className="text-red-400">*</span>
              </label>
              <select
                name="pets"
                value={form.pets}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="no">No</option>
                <option value="comfortable">
                  Comfortable with pets
                </option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Sleep Schedule{" "}
                <span className="text-red-400">*</span>
              </label>
              <select
                name="sleepSchedule"
                value={form.sleepSchedule}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select schedule</option>
                <option value="early_bird">Early Bird</option>
                <option value="normal">Normal</option>
                <option value="night_owl">Night Owl</option>
              </select>
            </div>
          </div>

          <div className="border-y border-white/10 bg-white/[0.02] px-6 py-5 sm:px-8">
            <h2 className="text-xl font-semibold text-white">
              Personality & Living Style
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Rate yourself so we can find people with a compatible
              lifestyle.
            </p>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Cleanliness
                </label>
                <span className="rounded-lg bg-indigo-500/15 px-3 py-1 text-sm font-semibold text-indigo-300">
                  {form.cleanliness}/5
                </span>
              </div>

              <input
                type="range"
                name="cleanliness"
                min="1"
                max="5"
                value={form.cleanliness}
                onChange={handleChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-indigo-500"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Relaxed</span>
                <span>Very Clean</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Social Level
                </label>
                <span className="rounded-lg bg-indigo-500/15 px-3 py-1 text-sm font-semibold text-indigo-300">
                  {form.socialLevel}/5
                </span>
              </div>

              <input
                type="range"
                name="socialLevel"
                min="1"
                max="5"
                value={form.socialLevel}
                onChange={handleChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-indigo-500"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Quiet & Private</span>
                <span>Very Social</span>
              </div>
            </div>
          </div>

          {(error || success) && (
            <div className="px-6 pb-4 sm:px-8">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {success}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:justify-end sm:p-8">
            <button
              type="button"
              onClick={() => navigate("/roommates")}
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Profile..."
                : "Create Roommate Profile"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your roommate preferences will be used only to find
          compatible matches on StaySync.
        </p>
      </div>
    </div>
  );
};

export default CreateRoommateProfile;