import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const getUserId = (user) => {
  if (!user) return "";
  return String(typeof user === "object" ? user._id || user.id || "" : user);
};

const getName = (profile) =>
  profile?.user?.name || profile?.user?.fullName || "StaySync member";

const formatLabel = (value) => {
  if (!value) return "Not specified";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatBudget = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Budget not specified";

  return `${new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)} / month`;
};

const Roommates = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [myUserId, setMyUserId] = useState("");
  const [requestStates, setRequestStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profilesResult, mineResult, outgoingResult] =
        await Promise.allSettled([
          api.get("/roommates"),
          api.get("/roommates/me"),
          api.get("/roommate-requests/outgoing"),
        ]);

      if (profilesResult.status === "rejected") {
        throw profilesResult.reason;
      }

      const profileList = profilesResult.value.data?.profiles;
      setProfiles(Array.isArray(profileList) ? profileList : []);

      if (mineResult.status === "fulfilled") {
        setMyUserId(getUserId(mineResult.value.data?.profile?.user));
      } else if (mineResult.reason?.response?.status === 404) {
        setMyUserId("");
      }

      if (outgoingResult.status === "fulfilled") {
        const pendingRequests = {};
        const requests = outgoingResult.value.data?.requests;

        if (Array.isArray(requests)) {
          requests.forEach((request) => {
            const receiverId = getUserId(request.receiver);
            if (receiverId) pendingRequests[receiverId] = "pending";
          });
        }

        setRequestStates(pendingRequests);
      }
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
          "We couldn’t load roommate profiles. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const otherProfiles = useMemo(
    () => profiles.filter((profile) => getUserId(profile.user) !== myUserId),
    [profiles, myUserId]
  );

  const cities = useMemo(
    () =>
      [
        ...new Set(
          otherProfiles
            .map((profile) => profile.preferredCity)
            .filter(Boolean)
        ),
      ].sort(),
    [otherProfiles]
  );

  const visibleProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return otherProfiles.filter((profile) => {
      const matchesCity = city === "all" || profile.preferredCity === city;

      const searchableText = [
        getName(profile),
        profile.occupation,
        profile.preferredCity,
        profile.preferredArea,
        profile.foodPreference,
        profile.preferredRoomType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCity && (!query || searchableText.includes(query));
    });
  }, [otherProfiles, search, city]);

  const sendRequest = async (profile) => {
    const receiverId = getUserId(profile.user);

    if (!receiverId || requestStates[receiverId]) return;

    setError("");
    setRequestStates((previous) => ({
      ...previous,
      [receiverId]: "sending",
    }));

    try {
      await api.post("/roommate-requests", { receiverId });

      setRequestStates((previous) => ({
        ...previous,
        [receiverId]: "pending",
      }));
    } catch (requestError) {
      setRequestStates((previous) => {
        const next = { ...previous };
        delete next[receiverId];
        return next;
      });

      setError(
        requestError.response?.data?.message ||
          "We couldn’t send the request. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#070d1b] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              <span aria-hidden="true">🤝</span>
              Roommate connections
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Find Roommates
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Browse active profiles and find someone whose plans and
              preferences fit yours.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/roommates/create")}
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
          >
            Create or edit my profile
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-red-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={loadProfiles}
              className="font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        <section className="mb-7 rounded-3xl border border-white/10 bg-[#0d1528] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <label className="sr-only" htmlFor="roommate-search">
              Search roommates
            </label>
            <input
              id="roommate-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, city, or work..."
              className="w-full rounded-xl border border-white/10 bg-[#080f20] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-cyan-400/50"
            />

            <label className="sr-only" htmlFor="roommate-city">
              Filter by city
            </label>
            <select
              id="roommate-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#080f20] px-4 py-3 text-white outline-none focus:border-cyan-400/50"
            >
              <option value="all">All cities</option>
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {loading
              ? "Loading profiles…"
              : `${visibleProfiles.length} roommate ${
                  visibleProfiles.length === 1 ? "profile" : "profiles"
                }`}
          </p>
        </section>

        {loading ? (
          <div
            className="flex justify-center py-24"
            role="status"
            aria-label="Loading roommate profiles"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
          </div>
        ) : visibleProfiles.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/15 bg-[#0d1528] px-6 py-16 text-center">
            <div className="mb-4 text-5xl" aria-hidden="true">
              🏠
            </div>

            <h2 className="text-2xl font-bold">
              {otherProfiles.length === 0
                ? "No other roommate profiles yet"
                : "No profiles match your search"}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              {otherProfiles.length === 0
                ? "Only real active profiles appear here. Create yours so other people can find you, and invite potential roommates to join StaySync."
                : "Try a different name or city, or clear the search to see all available profiles."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/roommates/create")}
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 px-5 py-3 font-bold text-[#06111f] transition hover:opacity-90"
              >
                Create my roommate profile
              </button>

              {(search || city !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCity("all");
                  }}
                  className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-gray-200 transition hover:bg-white/5"
                >
                  Clear filters
                </button>
              )}
            </div>
          </section>
        ) : (
          <section
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            aria-label="Roommate profiles"
          >
            {visibleProfiles.map((profile) => {
              const userId = getUserId(profile.user);
              const requestState = requestStates[userId];
              const name = getName(profile);
              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();

              const moveInDate =
                profile.moveInDate &&
                !Number.isNaN(new Date(profile.moveInDate).getTime())
                  ? new Date(profile.moveInDate).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })
                  : "Flexible";

              return (
                <article
                  key={profile._id || userId}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141f37] to-[#090f1e] shadow-xl transition hover:-translate-y-1 hover:border-cyan-400/40"
                >
                  <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 text-xl font-bold text-white">
                        {initials || "S"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-bold">{name}</h2>
                        <p className="mt-1 truncate text-sm text-gray-400">
                          {profile.occupation || "Occupation not specified"}
                        </p>
                        <p className="mt-2 text-sm text-cyan-200">
                          📍 {profile.preferredArea
                            ? `${profile.preferredArea}, `
                            : ""}
                          {profile.preferredCity || "Location not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/5 bg-black/15 p-4">
                      <p className="text-lg font-bold text-white">
                        {formatBudget(profile.budget)}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Looking to move {moveInDate}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Age
                        </p>
                        <p className="mt-1 font-semibold">
                          {profile.age ? `${profile.age} years` : "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Room type
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatLabel(profile.preferredRoomType)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                        🍽 {formatLabel(profile.foodPreference)}
                      </span>
                      <span className="rounded-full border border-purple-400/15 bg-purple-400/10 px-3 py-1 text-xs text-purple-200">
                        🌙 {formatLabel(profile.sleepSchedule)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!userId || Boolean(requestState)}
                      onClick={() => sendRequest(profile)}
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 py-3 font-bold text-[#06111f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {requestState === "sending"
                        ? "Sending…"
                        : requestState === "pending"
                          ? "Request sent · Pending"
                          : "Send roommate request"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default Roommates;