const mongoose = require("mongoose");

const Conversation =
  require("../models/Conversation");

const Message =
  require("../models/Message");

const Inquiry =
  require("../models/Inquiry");

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


/*
 * Get all conversations
 *
 * GET
 * /api/conversations
 */
const getMyConversations = async (
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

    const conversations =
      await Conversation.find({
        $or: [
          {
            seeker: userId,
          },
          {
            owner: userId,
          },
        ],
      })
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
        )
        .sort({
          lastMessageAt: -1,
          updatedAt: -1,
        });

    /*
     * Calculate unread messages
     * for each conversation.
     */
    const conversationData =
      await Promise.all(
        conversations.map(
          async (conversation) => {
            const unreadCount =
              await Message.countDocuments({
                conversation:
                  conversation._id,

                recipient:
                  userId,

                isRead: false,
              });

            return {
              ...conversation.toObject(),

              unreadCount,
            };
          }
        )
      );

    return res.status(200).json({
      success: true,
      conversations:
        conversationData,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get conversations",
    });
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

    const conversation =
      await Conversation.findById(
        conversationId
      );

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
    const isParticipant =
      conversation.seeker.toString() ===
        userId.toString() ||
      conversation.owner.toString() ===
        userId.toString();

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
const sendMessage = async (
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

    const {
      content,
    } = req.body;

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

    if (
      typeof content !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message content is required",
      });
    }

    const cleanContent =
      content.trim();

    if (!cleanContent) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot be empty",
      });
    }

    if (
      cleanContent.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 2000 characters",
      });
    }

    const conversation =
      await Conversation.findById(
        conversationId
      ).populate(
        "property",
        "title"
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    /*
     * Only participants can send.
     */
    const isSeeker =
      conversation.seeker.toString() ===
      userId.toString();

    const isOwner =
      conversation.owner.toString() ===
      userId.toString();

    if (!isSeeker && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You are not part of this conversation",
      });
    }

    /*
     * Determine recipient.
     */
    const recipient = isSeeker
      ? conversation.owner
      : conversation.seeker;

    const message =
      await Message.create({
        conversation:
          conversation._id,

        sender: userId,

        recipient,

        content: cleanContent,
      });

    /*
     * Update conversation's
     * latest message information.
     */
    conversation.lastMessage =
      message._id;

    conversation.lastMessageAt =
      message.createdAt;

    await conversation.save();

    /*
     * Create notification for recipient.
     */
    const senderUser =
      isSeeker
        ? "Seeker"
        : "Owner";

    await createNotification({
      recipient,

      type: "new_message",

      title: "New message",

      message:
        `You received a new message from ${senderUser} regarding "${conversation.property.title}".`,

      property:
        conversation.property._id,

      inquiry:
        conversation.inquiry,
    });

    const populatedMessage =
      await Message.findById(
        message._id
      )
        .populate(
          "sender",
          "name email role"
        )
        .populate(
          "recipient",
          "name email role"
        );

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      data:
        populatedMessage,
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send message",
    });
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

      const conversation =
        await Conversation.findById(
          conversationId
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      const isParticipant =
        conversation.seeker.toString() ===
          userId.toString() ||
        conversation.owner.toString() ===
          userId.toString();

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
  getMyConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
};