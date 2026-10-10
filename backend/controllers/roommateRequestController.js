const RoommateRequest = require("../models/RoommateRequest");
const RoommateProfile = require("../models/RoommateProfile");

const sendRoommateRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        message: "Receiver ID is required.",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        message: "You cannot send a roommate request to yourself.",
      });
    }

    const receiverProfile =
      await RoommateProfile.findOne({
        user: receiverId,
        isActive: true,
      });

    if (!receiverProfile) {
      return res.status(404).json({
        message:
          "This user does not have an active roommate profile.",
      });
    }

    const existingRequest =
      await RoommateRequest.findOne({
        $or: [
          {
            sender: senderId,
            receiver: receiverId,
          },
          {
            sender: receiverId,
            receiver: senderId,
          },
        ],
        status: {
          $in: ["pending", "accepted"],
        },
      });

    if (existingRequest) {
      const alreadyConnected =
        existingRequest.status === "accepted";

      return res.status(alreadyConnected ? 409 : 400).json({
        message: alreadyConnected
          ? "You are already connected with this user."
          : "A roommate request is already pending between you and this user.",
      });
    }

    const request = await RoommateRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    const populatedRequest =
      await RoommateRequest.findById(
        request._id
      )
        .populate(
          "sender",
          "name email profileImage image"
        )
        .populate(
          "receiver",
          "name email profileImage image"
        );

    return res.status(201).json({
      message: "Roommate request sent successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Send roommate request error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A roommate request is already pending between you and this user.",
      });
    }

    return res.status(500).json({
      message:
        "Failed to send roommate request.",
    });
  }
};

const getIncomingRequests = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const requests =
      await RoommateRequest.find({
        receiver: userId,
        status: "pending",
      })
        .populate(
          "sender",
          "name email profileImage image"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "Get incoming requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch incoming roommate requests.",
    });
  }
};

const getOutgoingRequests = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const requests =
      await RoommateRequest.find({
        sender: userId,
        status: "pending",
      })
        .populate(
          "receiver",
          "name email profileImage image"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error(
      "Get outgoing requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch outgoing roommate requests.",
    });
  }
};

const acceptRoommateRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const request =
      await RoommateRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Roommate request not found.",
      });
    }

    if (
      request.receiver.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to accept this request.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "This roommate request has already been processed.",
      });
    }

    request.status = "accepted";

    await request.save();

    const populatedRequest =
      await RoommateRequest.findById(
        request._id
      )
        .populate(
          "sender",
          "name email profileImage image"
        )
        .populate(
          "receiver",
          "name email profileImage image"
        );

    return res.status(200).json({
      message:
        "Roommate request accepted successfully.",
      request: {
        ...populatedRequest.toObject(),
        contact: populatedRequest.sender,
      },
    });
  } catch (error) {
    console.error(
      "Accept roommate request error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to accept roommate request.",
    });
  }
};

const getAcceptedConnections = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requests = await RoommateRequest.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email profileImage image")
      .populate("receiver", "name email profileImage image")
      .sort({ updatedAt: -1 });

    const seenContactIds = new Set();
    const connections = [];

    for (const request of requests) {
      const senderId = request.sender?._id?.toString();
      const contact =
        senderId === userId.toString()
          ? request.receiver
          : request.sender;
      const contactId = contact?._id?.toString();

      if (!contactId || seenContactIds.has(contactId)) {
        continue;
      }

      seenContactIds.add(contactId);
      connections.push({
        ...request.toObject(),
        contact,
      });
    }

    return res.status(200).json({ requests: connections });
  } catch (error) {
    console.error("Get accepted roommate connections error:", error);
    return res.status(500).json({
      message: "Failed to fetch accepted roommate connections.",
    });
  }
};
const rejectRoommateRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const request =
      await RoommateRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Roommate request not found.",
      });
    }

    if (
      request.receiver.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to reject this request.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "This roommate request has already been processed.",
      });
    }

    request.status = "rejected";

    await request.save();

    return res.status(200).json({
      message:
        "Roommate request rejected successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "Reject roommate request error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reject roommate request.",
    });
  }
};

const cancelRoommateRequest = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const request =
      await RoommateRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Roommate request not found.",
      });
    }

    if (
      request.sender.toString() !==
      userId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to cancel this request.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending requests can be cancelled.",
      });
    }

    await RoommateRequest.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      message:
        "Roommate request cancelled successfully.",
    });
  } catch (error) {
    console.error(
      "Cancel roommate request error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to cancel roommate request.",
    });
  }
};

module.exports = {
  sendRoommateRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getAcceptedConnections,
  acceptRoommateRequest,
  rejectRoommateRequest,
  cancelRoommateRequest,
};