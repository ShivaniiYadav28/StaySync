import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const EditRoommateProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    const fetchProfile = async () => {
      try {
        const response =
          await api.get("/roommates/me");

        const profile =
          response.data?.profile ||
          response.data?.roommateProfile ||
          response.data?.data ||
          response.data;

        if (!profile?._id) {
          navigate("/roommates/create");
          return;
        }

        setForm({
          age: profile.age ?? "",
          gender: profile.gender ?? "",
          occupation:
            profile.occupation ?? "",
          budget: profile.budget ?? "",
          preferredCity:
            profile.preferredCity ?? "",
          preferredArea:
            profile.preferredArea ?? "",
          moveInDate: profile.moveInDate
            ? new Date(profile.moveInDate)
                .toISOString()
                .split("T")[0]
            : "",
          foodPreference:
            profile.foodPreference ?? "",
          smoking: profile.smoking ?? "",
          drinking: profile.drinking ?? "",
          pets: profile.pets ?? "",
          sleepSchedule:
            profile.sleepSchedule ?? "",
          cleanliness:
            profile.cleanliness ?? 3,
          socialLevel:
            profile.socialLevel ?? 3,
          preferredRoomType:
            profile.preferredRoomType ?? "",
        });
      } catch (err) {
        if (
          err.response?.status === 404
        ) {
          navigate("/roommates/create");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your roommate profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      setSaving(true);

      await api.put("/roommates/me", {
        age: Number(form.age),
        gender: form.gender,
        occupation: form.occupation,
        budget: Number(form.budget),
        preferredCity:
          form.preferredCity,
        preferredArea:
          form.preferredArea,
        moveInDate: form.moveInDate,
        foodPreference:
          form.foodPreference,
        smoking: form.smoking,
        drinking: form.drinking,
        pets: form.pets,
        sleepSchedule:
          form.sleepSchedule,
        cleanliness:
          Number(form.cleanliness),
        socialLevel:
          Number(form.socialLevel),
        preferredRoomType:
          form.preferredRoomType,
      });

      navigate("/roommates");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update roommate profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10";

  const selectClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-300";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050a18]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-400" />

          <p className="mt-4 text-slate-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a18] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none fixed -right-40 bottom-20 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate("/roommates")
            }
            className="mb-6 text-sm font-semibold text-slate-400 transition hover:text-cyan-400"
          >
            ← Back to Roommates
          </button>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2">
            <span>✏️</span>

            <span className="text-xs font-black tracking-[0.18em] text-cyan-300">
              EDIT PROFILE
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Update your roommate profile
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Keep your preferences updated so StaySync can
            find the most compatible roommates for you.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-700/70 bg-[#0b1428]/95 shadow-2xl"
        >
          <div className="border-b border-slate-800 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-black">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal information.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label className={labelClass}>
                Age
              </label>

              <input
                type="number"
                name="age"
                min="18"
                max="100"
                value={form.age}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Gender
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>

                <option value="prefer_not_to_say">
                  Prefer not to say
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Monthly Budget
              </label>

              <input
                type="number"
                name="budget"
                min="0"
                value={form.budget}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-y border-slate-800 bg-white/[0.02] px-6 py-6 sm:px-8">
            <h2 className="text-xl font-black">
              Location & Move-in
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update where and when you want to move.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label className={labelClass}>
                Preferred City
              </label>

              <input
                type="text"
                name="preferredCity"
                value={form.preferredCity}
                onChange={handleChange}
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
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Move-in Date
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
                Preferred Room Type
              </label>

              <select
                name="preferredRoomType"
                value={form.preferredRoomType}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select room type
                </option>

                <option value="single">
                  Single
                </option>

                <option value="double">
                  Double
                </option>

                <option value="triple">
                  Triple
                </option>

                <option value="shared">
                  Shared
                </option>

                <option value="any">
                  Any
                </option>
              </select>
            </div>
          </div>

          <div className="border-y border-slate-800 bg-white/[0.02] px-6 py-6 sm:px-8">
            <h2 className="text-xl font-black">
              Lifestyle Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              These preferences affect your compatibility score.
            </p>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <label className={labelClass}>
                Food Preference
              </label>

              <select
                name="foodPreference"
                value={form.foodPreference}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select preference
                </option>

                <option value="vegetarian">
                  Vegetarian
                </option>

                <option value="non_vegetarian">
                  Non-Vegetarian
                </option>

                <option value="vegan">
                  Vegan
                </option>

                <option value="eggetarian">
                  Eggetarian
                </option>

                <option value="any">
                  Any
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Smoking
              </label>

              <select
                name="smoking"
                value={form.smoking}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select option
                </option>

                <option value="no">
                  No
                </option>

                <option value="occasionally">
                  Occasionally
                </option>

                <option value="yes">
                  Yes
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Drinking
              </label>

              <select
                name="drinking"
                value={form.drinking}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select option
                </option>

                <option value="no">
                  No
                </option>

                <option value="occasionally">
                  Occasionally
                </option>

                <option value="yes">
                  Yes
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Pets
              </label>

              <select
                name="pets"
                value={form.pets}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select option
                </option>

                <option value="no">
                  No
                </option>

                <option value="comfortable">
                  Comfortable with pets
                </option>

                <option value="yes">
                  Yes
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Sleep Schedule
              </label>

              <select
                name="sleepSchedule"
                value={form.sleepSchedule}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">
                  Select schedule
                </option>

                <option value="early_bird">
                  Early Bird
                </option>

                <option value="normal">
                  Normal
                </option>

                <option value="night_owl">
                  Night Owl
                </option>
              </select>
            </div>
          </div>

          <div className="border-y border-slate-800 bg-white/[0.02] px-6 py-6 sm:px-8">
            <h2 className="text-xl font-black">
              Personality & Living Style
            </h2>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300">
                  Cleanliness
                </label>

                <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-sm font-black text-cyan-300">
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
                className="h-2 w-full cursor-pointer accent-cyan-400"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Relaxed</span>
                <span>Very Clean</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300">
                  Social Level
                </label>

                <span className="rounded-lg bg-purple-400/10 px-3 py-1 text-sm font-black text-purple-300">
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
                className="h-2 w-full cursor-pointer accent-purple-400"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Quiet</span>
                <span>Very Social</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 pb-4 sm:px-8">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-white/[0.02] p-6 sm:flex-row sm:justify-end sm:p-8">
            <button
              type="button"
              onClick={() =>
                navigate("/roommates")
              }
              className="rounded-xl border border-slate-700 px-7 py-3.5 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-8 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:from-cyan-300 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoommateProfile;