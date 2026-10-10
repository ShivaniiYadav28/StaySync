import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const RoommateRequests = () => {
  const navigate = useNavigate();

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getUserName = (user) => {
    if (!user) {
      return "StaySync User";
    }

    return (
      user.name ||
      user.fullName ||
      user.username ||
      "StaySync User"
    );
  };

  const getUserImage = (user) => {
    if (!user) {
      return "";
    }

    return (
      user.profileImage ||
      user.image ||
      user.photo ||
      user.avatar ||
      ""
    );
  };

  const getInitial = (user) => {
    return getUserName(user)
      .charAt(0)
      .toUpperCase();
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const incomingResponse = await api.get(
        "/roommate-requests/incoming"
      );

      const outgoingResponse = await api.get(
        "/roommate-requests/outgoing"
      );

      const acceptedResponse = await api.get(
        "/roommate-requests/accepted"
      );

      setIncomingRequests(
        Array.isArray(
          incomingResponse.data?.requests
        )
          ? incomingResponse.data.requests
          : []
      );

      setOutgoingRequests(
        Array.isArray(
          outgoingResponse.data?.requests
        )
          ? outgoingResponse.data.requests
          : []
      );

      setAcceptedRequests(
        Array.isArray(
          acceptedResponse.data?.requests
        )
          ? acceptedResponse.data.requests
          : []
      );
    } catch (err) {
      console.error(
        "Fetch roommate requests error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load roommate requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showMessage = (
    message,
    type = "success"
  ) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }

    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  const handleStartConversation = async (request) => {
    try {
      setProcessingId(request._id);
      setError("");
      const response = await api.post(
        `/conversations/roommate/${request._id}`
      );
      const conversationId = response.data?.conversation?._id;
      if (!conversationId) {
        throw new Error("Unable to open the roommate conversation.");
      }
      navigate("/messages", { state: { conversationId } });
    } catch (err) {
      showMessage(
        err.response?.data?.message || err.message || "Unable to open the conversation.",
        "error"
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleAccept = async (requestId) => {
    if (!requestId) {
      showMessage(
        "Request ID is missing.",
        "error"
      );
      return;
    }

    try {
      setProcessingId(requestId);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/roommate-requests/${requestId}/accept`
      );

      setIncomingRequests((previous) =>
        previous.filter(
          (request) =>
            request._id !== requestId
        )
      );

      if (response.data?.request) {
        setAcceptedRequests((previous) => [
          response.data.request,
          ...previous.filter(
            (request) => request._id !== requestId
          ),
        ]);
      }

      showMessage(
        response.data?.message ||
          "Roommate request accepted successfully."
      );
    } catch (err) {
      console.error(
        "Accept roommate request error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to accept roommate request.";

      showMessage(message, "error");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/roommate-requests/${requestId}/reject`
      );

      setIncomingRequests((previous) =>
        previous.filter(
          (request) =>
            request._id !== requestId
        )
      );

      showMessage(
        response.data?.message ||
          "Roommate request rejected successfully."
      );
    } catch (err) {
      console.error(
        "Reject roommate request error:",
        err
      );

      showMessage(
        err.response?.data?.message ||
          err.message ||
          "Unable to reject roommate request.",
        "error"
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleCancel = async (requestId) => {
    try {
      setProcessingId(requestId);
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/roommate-requests/${requestId}`
      );

      setOutgoingRequests((previous) =>
        previous.filter(
          (request) =>
            request._id !== requestId
        )
      );

      showMessage(
        response.data?.message ||
          "Roommate request cancelled successfully."
      );
    } catch (err) {
      console.error(
        "Cancel roommate request error:",
        err
      );

      showMessage(
        err.response?.data?.message ||
          err.message ||
          "Unable to cancel roommate request.",
        "error"
      );
    } finally {
      setProcessingId("");
    }
  };

  const RequestAvatar = ({ user }) => {
    const image = getUserImage(user);

    if (image) {
      return (
        <img
          src={image}
          alt={getUserName(user)}
          className="w-16 h-16 rounded-2xl object-cover border border-cyan-400/30"
        />
      );
    }

    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
        {getInitial(user)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070d1b] text-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold tracking-widest uppercase">
            <span>🤝</span>
            Roommate Connections
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">
            Roommate Requests
          </h1>

          <p className="mt-3 text-gray-400 max-w-2xl">
            Manage your roommate connection
            requests.
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="rounded-3xl border border-white/10 bg-[#0d1528] p-5 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-2xl font-bold">
                    Incoming Requests
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    People who want to connect
                    with you.
                  </p>
                </div>

                <div className="min-w-10 h-10 px-3 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold">
                  {incomingRequests.length}
                </div>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                  <div className="text-4xl mb-4">
                    📭
                  </div>

                  <h3 className="text-lg font-semibold">
                    No incoming requests
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    New connection requests will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map(
                    (request) => {
                      const sender =
                        request.sender;

                      const isProcessing =
                        processingId ===
                        request._id;

                      return (
                        <div
                          key={request._id}
                          className="rounded-2xl border border-white/10 bg-[#111c33] p-4 sm:p-5 hover:border-cyan-400/30 transition"
                        >
                          <div className="flex items-start gap-4">
                            <RequestAvatar
                              user={sender}
                            />

                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-lg truncate">
                                {getUserName(
                                  sender
                                )}
                              </h3>

                              {sender?.email && (
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {sender.email}
                                </p>
                              )}

                              <p className="text-xs text-cyan-300 mt-2">
                                Wants to connect
                                with you.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-5">
                            <button
                              type="button"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                handleAccept(
                                  request._id
                                )
                              }
                              className="rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#06111f] font-bold py-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing
                                ? "Accepting..."
                                : "Accept"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                isProcessing
                              }
                              onClick={() =>
                                handleReject(
                                  request._id
                                )
                              }
                              className="rounded-xl border border-red-400/20 bg-red-400/10 text-red-300 font-semibold py-3 hover:bg-red-400/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Reject"}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#0d1528] p-5 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-2xl font-bold">
                    Sent Requests
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Requests waiting for a response.
                  </p>
                </div>

                <div className="min-w-10 h-10 px-3 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-300 flex items-center justify-center font-bold">
                  {outgoingRequests.length}
                </div>
              </div>

              {outgoingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                  <div className="text-4xl mb-4">
                    📤
                  </div>

                  <h3 className="text-lg font-semibold">
                    No pending requests
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Requests you send will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outgoingRequests.map(
                    (request) => {
                      const receiver =
                        request.receiver;

                      const isProcessing =
                        processingId ===
                        request._id;

                      return (
                        <div
                          key={request._id}
                          className="rounded-2xl border border-white/10 bg-[#111c33] p-4 sm:p-5"
                        >
                          <div className="flex items-start gap-4">
                            <RequestAvatar
                              user={receiver}
                            />

                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-lg truncate">
                                {getUserName(
                                  receiver
                                )}
                              </h3>

                              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Pending
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              handleCancel(
                                request._id
                              )
                            }
                            className="w-full mt-5 rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 font-semibold py-3 hover:bg-white/[0.07] transition disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Cancelling..."
                              : "Cancel Request"}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </div>
        )}


        {acceptedRequests.length > 0 && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d1528] p-5 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-2xl font-bold">Accepted Connections</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Roommates who have accepted your connection.
                </p>
              </div>
              <div className="min-w-10 h-10 px-3 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold">
                {acceptedRequests.length}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acceptedRequests.map((request) => {
                const contact = request.contact;
                return (
                  <div
                    key={request._id}
                    className="rounded-2xl border border-white/10 bg-[#111c33] p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <RequestAvatar user={contact} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg truncate">
                          {getUserName(contact)}
                        </h3>
                        {contact?.email && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {contact.email}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Connected
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={processingId === request._id}
                      onClick={() => handleStartConversation(request)}
                      className="w-full mt-5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-[#06111f] font-bold py-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request._id ? "Opening chat..." : `Message ${getUserName(contact)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() =>
              navigate("/roommates")
            }
            className="px-6 py-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 font-semibold hover:bg-cyan-400/20 transition"
          >
            ← Find More Roommates
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateRequests;