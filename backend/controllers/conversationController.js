const mongoose = require("mongoose");

const Conversation =
  require("../models/Conversation");

const Message =
  require("../models/Message");

const Inquiry =
  require("../models/Inquiry");

const RoommateRequest = require("../models/RoommateRequest");
const RoommateConversation = require("../models/RoommateConversation");

const createNotification =
  require("../utils/notificationHelper")
    .createNotification;


/*
 * Get logged-in user's ID
 */
const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.user?.user_id ||
    null
  );
};


/*
 * Check valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeRoommateConversation = (conversation) => {
  const data = conversation.toObject();
  return {
    ...data,
    type: "roommate",
    property: null,
    inquiry: null,
    seeker: data.participants[0],
    owner: data.participants[1],
  };
};

const findConversationRecord = async (conversationId) => {
  const propertyConversation = await Conversation.findById(conversationId);
  if (propertyConversation) {
    return { conversation: propertyConversation, type: "property" };
  }

  const roommateConversation = await RoommateConversation.findById(conversationId);
  if (roommateConversation) {
    return { conversation: roommateConversation, type: "roommate" };
  }

  return null;
};

const getConversationParticipantIds = (conversation, type) => {
  if (type === "roommate") {
    return conversation.participants.map((participant) =>
      String(participant._id || participant)
    );
  }

  return [String(conversation.seeker), String(conversation.owner)];
};


/*
 * Create conversation from an accepted inquiry
 *
 * POST
 * /api/conversations/inquiry/:inquiryId
 */
const createConversation = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      inquiryId,
    } = req.params;

    if (!isValidObjectId(inquiryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    const inquiry =
      await Inquiry.findById(
        inquiryId
      ).populate(
        "property",
        "title images owner"
      );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    /*
     * Conversation only allowed
     * after owner accepts inquiry.
     */
    if (inquiry.status !== "accepted") {
      return res.status(403).json({
        success: false,
        message:
          "Messaging is available only after the inquiry is accepted",
      });
    }

    const isSeeker =
      inquiry.seeker.toString() ===
      userId.toString();

    const isOwner =
      inquiry.owner.toString() ===
      userId.toString();

    if (!isSeeker && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this inquiry",
      });
    }

    /*
     * Check whether conversation already exists.
     */
    let conversation =
      await Conversation.findOne({
        inquiry: inquiry._id,
      });

    /*
     * Create conversation if it doesn't exist.
     */
    if (!conversation) {
      conversation =
        await Conversation.create({
          property:
            inquiry.property._id,

          inquiry:
            inquiry._id,

          seeker:
            inquiry.seeker,

          owner:
            inquiry.owner,
        });
    }

    conversation =
      await Conversation.findById(
        conversation._id
      )
        .populate(
          "property",
          "title images area city rent roomType"
        )
        .populate(
          "seeker",
          "name email"
        )
        .populate(
          "owner",
          "name email"
        )
        .populate(
          "lastMessage",
          "content sender recipient createdAt isRead"
        );

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create conversation",
    });
  }
};


const createRoommateConversation = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { requestId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!isValidObjectId(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid roommate request ID" });
    }

    const request = await RoommateRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Roommate request not found" });
    }
    if (request.status !== "accepted") {
      return res.status(403).json({ success: false, message: "Accept the roommate request before starting a conversation" });
    }

    const userIdString = String(userId);
    const senderId = String(request.sender);
    const receiverId = String(request.receiver);
    if (userIdString !== senderId && userIdString !== receiverId) {
      return res.status(403).json({ success: false, message: "You are not part of this roommate request" });
    }

    let conversation = await RoommateConversation.findOne({ roommateRequest: request._id });
    if (!conversation) {
      try {
        conversation = await RoommateConversation.create({
          roommateRequest: request._id,
          participants: [request.sender, request.receiver],
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        conversation = await RoommateConversation.findOne({ roommateRequest: request._id });
      }
    }

    conversation = await RoommateConversation.findById(conversation._id)
      .populate("participants", "name email")
      .populate("lastMessage", "content sender recipient createdAt isRead");

    return res.status(200).json({
      success: true,
      conversation: normalizeRoommateConversation(conversation),
    });
  } catch (error) {
    console.error("Create roommate conversation error:", error);
    return res.status(500).json({ success: false, message: "Failed to create roommate conversation" });
  }
};

/*
 * Get all conversations
 *
 * GET
 * /api/conversations
 */
const getMyConversations = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const [propertyConversations, roommateDocuments] = await Promise.all([
      Conversation.find({ $or: [{ seeker: userId }, { owner: userId }] })
        .populate("property", "title images area city rent roomType")
        .populate("seeker", "name email")
        .populate("owner", "name email")
        .populate("lastMessage", "content sender recipient createdAt isRead"),
      RoommateConversation.find({ participants: userId })
        .populate("participants", "name email")
        .populate("lastMessage", "content sender recipient createdAt isRead"),
    ]);

    const conversations = [
      ...propertyConversations.map((conversation) => conversation.toObject()),
      ...roommateDocuments.map(normalizeRoommateConversation),
    ].sort((a, b) =>
      new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt)
    );

    const conversationData = await Promise.all(
      conversations.map(async (conversation) => ({
        ...conversation,
        unreadCount: await Message.countDocuments({
          conversation: conversation._id,
          recipient: userId,
          isRead: false,
        }),
      }))
    );

    return res.status(200).json({ success: true, conversations: conversationData });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ success: false, message: "Failed to get conversations" });
  }
};


/*
 * Get messages from a conversation
 *
 * GET
 * /api/conversations/:conversationId/messages
 */
const getMessages = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      conversationId,
    } = req.params;

    if (
      !isValidObjectId(
        conversationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid conversation ID",
      });
    }

    const conversationRecord = await findConversationRecord(conversationId);
    const conversation = conversationRecord?.conversation;

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    /*
     * Only participants can view messages.
     */
    const isParticipant = getConversationParticipantIds(
      conversation,
      conversationRecord.type
    ).includes(String(userId));

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    const messages =
      await Message.find({
        conversation:
          conversationId,
      })
        .populate(
          "sender",
          "name email role"
        )
        .populate(
          "recipient",
          "name email role"
        )
        .sort({
          createdAt: 1,
        });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get messages",
    });
  }
};


/*
 * Send message
 *
 * POST
 * /api/conversations/:conversationId/messages
 */
const sendMessage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }
    const cleanContent = content.trim();
    if (cleanContent.length > 2000) {
      return res.status(400).json({ success: false, message: "Message cannot exceed 2000 characters" });
    }

    const conversationRecord = await findConversationRecord(conversationId);
    const conversation = conversationRecord?.conversation;
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const participantIds = getConversationParticipantIds(conversation, conversationRecord.type);
    if (!participantIds.includes(String(userId))) {
      return res.status(403).json({ success: false, message: "You are not part of this conversation" });
    }
    const recipient = conversationRecord.type === "roommate"
      ? conversation.participants.find((participant) => String(participant) !== String(userId))
      : String(conversation.seeker) === String(userId)
        ? conversation.owner
        : conversation.seeker;

    const message = await Message.create({
      conversation: conversation._id,
      sender: userId,
      recipient,
      content: cleanContent,
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const isRoommateConversation = conversationRecord.type === "roommate";
    await createNotification({
      recipient,
      type: "new_message",
      title: "New message",
      message: isRoommateConversation
        ? "You received a new message from your roommate connection."
        : `You received a new message regarding "${conversation.property?.title || "your inquiry"}".`,
      property: isRoommateConversation ? null : conversation.property?._id,
      inquiry: isRoommateConversation ? null : conversation.inquiry,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email role")
      .populate("recipient", "name email role");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};


/*
 * Mark conversation messages
 * as read
 *
 * PATCH
 * /api/conversations/:conversationId/read
 */
const markConversationAsRead =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const {
        conversationId,
      } = req.params;

      if (
        !isValidObjectId(
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid conversation ID",
        });
      }

      const conversationRecord = await findConversationRecord(conversationId);
      const conversation = conversationRecord?.conversation;

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      const isParticipant = getConversationParticipantIds(
        conversation,
        conversationRecord.type
      ).includes(String(userId));

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message:
            "You are not part of this conversation",
        });
      }

      await Message.updateMany(
        {
          conversation:
            conversationId,

          recipient: userId,

          isRead: false,
        },
        {
          $set: {
            isRead: true,

            readAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Messages marked as read",
      });
    } catch (error) {
      console.error(
        "Mark messages read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark messages as read",
      });
    }
  };


module.exports = {
  createConversation,
  createRoommateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
};