import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import api from "../services/api";

import "./Messages.css";


function Messages() {

  const location = useLocation();
  const requestedConversationId = location.state?.conversationId;

  const {
    user,
    isAuthenticated,
  } = useAuth();


  const [
    conversations,
    setConversations,
  ] = useState([]);


  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState(null);


  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    messageText,
    setMessageText,
  ] = useState("");


  const [
    conversationsLoading,
    setConversationsLoading,
  ] = useState(true);


  const [
    messagesLoading,
    setMessagesLoading,
  ] = useState(false);


  const [
    sending,
    setSending,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    mobileChatOpen,
    setMobileChatOpen,
  ] = useState(false);


  /*
   * Reference to the bottom of the
   * message list.
   *
   * Used for automatic scrolling.
   */
  const messagesEndRef =
    useRef(null);


  /*
   * Current logged-in user's ID.
   *
   * Supports both:
   * user.id
   * user._id
   */
  const currentUserId =
    user?.id ||
    user?._id ||
    null;


  /* =====================================================
     SELECTED CONVERSATION
  ===================================================== */

  const selectedConversation =
    useMemo(() => {

      return conversations.find(
        (conversation) =>
          String(conversation._id) ===
          String(selectedConversationId)
      );

    }, [
      conversations,
      selectedConversationId,
    ]);


  /* =====================================================
     LOAD CONVERSATIONS
  ===================================================== */

  useEffect(() => {

    if (!isAuthenticated) {
      return;
    }


    let isMounted = true;


    const loadConversations =
      async () => {

        try {

          setConversationsLoading(true);

          setError("");


          const response =
            await api.get(
              "/conversations"
            );


          if (!isMounted) {
            return;
          }


          const conversationData =
            response.data?.conversations ||
            response.data?.data ||
            [];


          setConversations(
            Array.isArray(
              conversationData
            )
              ? conversationData
              : []
          );


          /*
           * Automatically select the first
           * conversation.
           */
          if (conversationData.length > 0) {
            const requestedConversation = conversationData.find(
              (conversation) =>
                String(conversation._id) === String(requestedConversationId)
            );

            if (requestedConversation) {
              setSelectedConversationId(requestedConversation._id);
              setMobileChatOpen(true);
            } else {
              setSelectedConversationId((previous) => {
                const stillExists = previous && conversationData.some(
                  (conversation) => String(conversation._id) === String(previous)
                );
                return stillExists ? previous : conversationData[0]._id;
              });
            }
          } else {

            setSelectedConversationId(
              null
            );

          }

        } catch (err) {

          if (!isMounted) {
            return;
          }


          console.error(
            "Failed to load conversations:",
            err
          );


          setError(
            err.response?.data?.message ||
            "Failed to load conversations."
          );


        } finally {

          if (isMounted) {

            setConversationsLoading(
              false
            );

          }

        }

      };


    loadConversations();


    return () => {

      isMounted = false;

    };

  }, [isAuthenticated, requestedConversationId]);


  /* =====================================================
     LOAD MESSAGES
  ===================================================== */

  useEffect(() => {

    if (
      !isAuthenticated ||
      !selectedConversationId
    ) {
      return;
    }


    let isMounted = true;


    const loadMessages =
      async () => {

        try {

          setMessagesLoading(true);

          setError("");


          /*
           * Clear messages from the previous
           * conversation while loading.
           */
          setMessages([]);


          const response =
            await api.get(
              `/conversations/${selectedConversationId}/messages`
            );


          if (!isMounted) {
            return;
          }


          const messageData =
            response.data?.messages ||
            response.data?.data ||
            [];


          setMessages(
            Array.isArray(messageData)
              ? messageData
              : []
          );


          /*
           * Mark the conversation as read.
           */
          try {

            await api.patch(
              `/conversations/${selectedConversationId}/read`
            );


            if (!isMounted) {
              return;
            }


            setConversations(
              (previous) =>
                previous.map(
                  (conversation) =>
                    String(
                      conversation._id
                    ) ===
                    String(
                      selectedConversationId
                    )
                      ? {
                          ...conversation,
                          unreadCount: 0,
                        }
                      : conversation
                )
            );


          } catch (readError) {

            console.error(
              "Failed to mark conversation as read:",
              readError
            );

          }

        } catch (err) {

          if (!isMounted) {
            return;
          }


          console.error(
            "Failed to load messages:",
            err
          );


          setError(
            err.response?.data?.message ||
            "Failed to load messages."
          );


        } finally {

          if (isMounted) {

            setMessagesLoading(
              false
            );

          }

        }

      };


    loadMessages();


    return () => {

      isMounted = false;

    };

  }, [
    isAuthenticated,
    selectedConversationId,
  ]);


  /* =====================================================
     AUTO SCROLL TO LATEST MESSAGE
  ===================================================== */

  useEffect(() => {

    if (
      !selectedConversationId ||
      messages.length === 0
    ) {
      return;
    }


    /*
     * Wait until the message DOM has been
     * rendered before scrolling.
     */
    const scrollTimer =
      setTimeout(() => {

        messagesEndRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "end",
          }
        );

      }, 50);


    return () => {

      clearTimeout(
        scrollTimer
      );

    };

  }, [
    selectedConversationId,
    messages,
  ]);


  /* =====================================================
     SELECT CONVERSATION
  ===================================================== */

  const handleSelectConversation =
    (conversationId) => {

      setSelectedConversationId(
        conversationId
      );

      setMobileChatOpen(true);

      setError("");

    };


  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const handleSendMessage =
    async (event) => {

      event.preventDefault();


      const content =
        messageText.trim();


      if (
        !content ||
        !selectedConversationId ||
        sending
      ) {
        return;
      }


      try {

        setSending(true);

        setError("");


        const response =
          await api.post(
            `/conversations/${selectedConversationId}/messages`,
            {
              content,
            }
          );


        const responseData =
          response.data;


        /*
         * The backend may return the
         * message object in different
         * fields.
         *
         * Never treat a success string
         * as a message object.
         */
        let newMessage = null;


        if (
          responseData?.data &&
          typeof responseData.data ===
            "object" &&
          !Array.isArray(
            responseData.data
          )
        ) {

          newMessage =
            responseData.data;

        } else if (
          responseData?.messageData &&
          typeof responseData.messageData ===
            "object"
        ) {

          newMessage =
            responseData.messageData;

        } else if (
          responseData?.message &&
          typeof responseData.message ===
            "object"
        ) {

          newMessage =
            responseData.message;

        }


        /*
         * Verify that the response
         * actually contains a message.
         */
        if (
          !newMessage ||
          !newMessage._id
        ) {

          console.error(
            "Unexpected send message response:",
            responseData
          );


          throw new Error(
            "Message was sent, but the server returned an unexpected response."
          );

        }


        /*
         * Add the new message.
         */
        setMessages(
          (previous) => [
            ...previous,
            newMessage,
          ]
        );


        /*
         * Clear input.
         */
        setMessageText("");


        /*
         * Update conversation preview.
         */
        setConversations(
          (previous) =>
            previous.map(
              (conversation) =>
                String(
                  conversation._id
                ) ===
                String(
                  selectedConversationId
                )
                  ? {
                      ...conversation,

                      lastMessage:
                        newMessage,

                      lastMessageAt:
                        newMessage.createdAt ||
                        new Date().toISOString(),

                      unreadCount: 0,
                    }
                  : conversation
            )
        );


      } catch (err) {

        console.error(
          "Failed to send message:",
          err
        );


        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to send message."
        );


      } finally {

        setSending(false);

      }

    };


  /* =====================================================
     ENTER TO SEND
  ===================================================== */

  const handleMessageKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        handleSendMessage(
          event
        );

      }

    };


  /* =====================================================
     OTHER PARTICIPANT
  ===================================================== */

  const getOtherParticipant =
    (conversation) => {

      if (!conversation) {
        return null;
      }


      const seeker =
        conversation.seeker;


      const owner =
        conversation.owner;


      const seekerId =
        seeker?._id ||
        seeker?.id;


      const ownerId =
        owner?._id ||
        owner?.id;


      if (
        currentUserId &&
        String(seekerId) ===
          String(currentUserId)
      ) {

        return owner;

      }


      if (
        currentUserId &&
        String(ownerId) ===
          String(currentUserId)
      ) {

        return seeker;

      }


      return (
        owner ||
        seeker ||
        null
      );

    };


  /* =====================================================
     PARTICIPANT NAME
  ===================================================== */

  const getOtherParticipantName =
    (conversation) => {

      const participant =
        getOtherParticipant(
          conversation
        );


      return (
        participant?.name ||
        "User"
      );

    };


  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials =
    (name) => {

      if (!name) {
        return "U";
      }


      return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (part) =>
            part[0].toUpperCase()
        )
        .join("");

    };


  /* =====================================================
     PROPERTY NAME
  ===================================================== */

  const getPropertyName =
    (conversation) => {

      if (conversation?.type === "roommate") {
        return "Roommate conversation";
      }

      return (
        conversation?.property?.title ||
        conversation?.property?.name ||
        "Property"
      );

    };


  /* =====================================================
     FORMAT MESSAGE TIME
  ===================================================== */

  const formatTime =
    (dateValue) => {

      if (!dateValue) {
        return "";
      }


      const date =
        new Date(dateValue);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "";

      }


      return date.toLocaleTimeString(
        "en-IN",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );

    };


  /* =====================================================
     FORMAT CONVERSATION TIME
  ===================================================== */

  const formatConversationTime =
    (dateValue) => {

      if (!dateValue) {
        return "";
      }


      const date =
        new Date(dateValue);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "";

      }


      const now =
        new Date();


      const sameDay =
        date.toDateString() ===
        now.toDateString();


      if (sameDay) {

        return formatTime(
          dateValue
        );

      }


      return date.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
        }
      );

    };


  /* =====================================================
     CHECK CURRENT USER MESSAGE
  ===================================================== */

  const isMyMessage =
    (message) => {

      const sender =
        message?.sender;


      const senderId =
        sender?._id ||
        sender?.id ||
        sender;


      if (
        !senderId ||
        !currentUserId
      ) {
        return false;
      }


      return (
        String(senderId) ===
        String(currentUserId)
      );

    };


  /* =====================================================
     LAST MESSAGE PREVIEW
  ===================================================== */

  const getLastMessageText =
    (conversation) => {

      const lastMessage =
        conversation?.lastMessage;


      if (!lastMessage) {
        return "No messages yet";
      }


      if (
        typeof lastMessage ===
        "object"
      ) {

        return (
          lastMessage.content ||
          "No messages yet"
        );

      }


      return "No messages yet";

    };


  /* =====================================================
     VIEW PROPERTY
  ===================================================== */

  const handleViewProperty =
    () => {

      const propertyId =
        selectedConversation
          ?.property?._id;


      if (!propertyId) {
        return;
      }


      window.location.href =
        `/properties/${propertyId}`;

    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    conversationsLoading
  ) {

    return (

      <div className="messages-page">

        <div className="messages-container">

          <div className="messages-loading">

            <div className="messages-spinner" />

            <p>
              Loading messages...
            </p>

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="messages-page">

      <div className="messages-container">


        {/* =================================================
            CONVERSATION SIDEBAR
        ================================================= */}

        <aside
          className={`messages-sidebar ${
            mobileChatOpen
              ? "mobile-hidden"
              : ""
          }`}
        >

          <div className="messages-sidebar-header">

            <div>

              <h1>
                Messages
              </h1>

              <p>
                Your conversations
              </p>

            </div>

          </div>


          {conversations.length === 0 ? (

            <div className="messages-empty-sidebar">

              <div className="messages-empty-icon">
                💬
              </div>


              <h3>
                No conversations yet
              </h3>


              <p>
                Your conversations with property
                owners or seekers will appear here.
              </p>


              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    "/properties";
                }}
              >
                Find a Stay
              </button>

            </div>

          ) : (

            <div className="conversation-list">

              {conversations.map(
                (conversation) => {

                  const participant =
                    getOtherParticipant(
                      conversation
                    );


                  const participantName =
                    getOtherParticipantName(
                      conversation
                    );


                  const propertyName =
                    getPropertyName(
                      conversation
                    );


                  const unreadCount =
                    Number(
                      conversation.unreadCount
                    ) || 0;


                  return (

                    <button
                      key={
                        conversation._id
                      }
                      type="button"
                      className={`conversation-item ${
                        String(
                          selectedConversationId
                        ) ===
                        String(
                          conversation._id
                        )
                          ? "conversation-active"
                          : ""
                      }`}
                      onClick={() =>
                        handleSelectConversation(
                          conversation._id
                        )
                      }
                    >

                      <div className="conversation-avatar">

                        {getInitials(
                          participant?.name
                        )}

                      </div>


                      <div className="conversation-details">

                        <div className="conversation-top-row">

                          <strong>
                            {
                              participantName
                            }
                          </strong>


                          <span className="conversation-time">

                            {formatConversationTime(
                              conversation.lastMessageAt ||
                              conversation.updatedAt
                            )}

                          </span>

                        </div>


                        <div className="conversation-property">

                          {propertyName}

                        </div>


                        <div className="conversation-bottom-row">

                          <span className="conversation-preview">

                            {getLastMessageText(
                              conversation
                            )}

                          </span>


                          {unreadCount > 0 && (

                            <span className="conversation-unread">

                              {unreadCount > 99
                                ? "99+"
                                : unreadCount}

                            </span>

                          )}

                        </div>

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          )}

        </aside>


        {/* =================================================
            CHAT AREA
        ================================================= */}

        <section
          className={`messages-chat ${
            mobileChatOpen
              ? "mobile-chat-open"
              : ""
          }`}
        >

          {!selectedConversation ? (

            <div className="chat-no-selection">

              <div className="chat-no-selection-icon">
                💬
              </div>


              <h2>
                Select a conversation
              </h2>


              <p>
                Choose a conversation from the
                left to start messaging.
              </p>

            </div>

          ) : (

            <>

              {/* =========================================
                  CHAT HEADER
              ========================================= */}

              <header className="chat-header">

                <button
                  type="button"
                  className="mobile-back-button"
                  onClick={() =>
                    setMobileChatOpen(false)
                  }
                >
                  ←
                </button>


                <div className="chat-user-avatar">

                  {getInitials(
                    getOtherParticipantName(
                      selectedConversation
                    )
                  )}

                </div>


                <div className="chat-header-info">

                  <h2>

                    {
                      getOtherParticipantName(
                        selectedConversation
                      )
                    }

                  </h2>


                  <p>

                    {
                      getPropertyName(
                        selectedConversation
                      )
                    }

                  </p>

                </div>

              </header>


              {/* =========================================
                  PROPERTY BAR
              ========================================= */}

              <div className="chat-property-bar">

                <div className="chat-property-icon">
                  {selectedConversation.type === "roommate" ? "💬" : "🏠"}
                </div>


                <div>

                  <span>
                    {selectedConversation.type === "roommate" ? "Conversation" : "Property"}
                  </span>


                  <strong>

                    {
                      getPropertyName(
                        selectedConversation
                      )
                    }

                  </strong>

                </div>


                {selectedConversation.property?._id && (

                  <button
                    type="button"
                    className="view-property-button"
                    onClick={
                      handleViewProperty
                    }
                  >
                    View Property
                  </button>

                )}

              </div>


              {/* =========================================
                  ERROR
              ========================================= */}

              {error && (

                <div className="messages-error">

                  {error}

                </div>

              )}


              {/* =========================================
                  MESSAGES
              ========================================= */}

              <div className="chat-messages">

                {messagesLoading ? (

                  <div className="chat-loading">

                    <div className="messages-spinner" />

                    <p>
                      Loading conversation...
                    </p>

                  </div>

                ) : messages.length === 0 ? (

                  <div className="chat-empty">

                    <div className="chat-empty-icon">
                      👋
                    </div>


                    <h3>
                      Start the conversation
                    </h3>


                    <p>

                      Send a message to{" "}

                      {
                        getOtherParticipantName(
                          selectedConversation
                        )
                      }

                      .

                    </p>

                  </div>

                ) : (

                  messages.map(
                    (message) => {

                      const mine =
                        isMyMessage(
                          message
                        );


                      return (

                        <div
                          key={
                            message._id
                          }
                          className={`message-row ${
                            mine
                              ? "message-row-mine"
                              : "message-row-other"
                          }`}
                        >

                          {!mine && (

                            <div className="message-avatar-small">

                              {getInitials(
                                message.sender?.name
                              )}

                            </div>

                          )}


                          <div
                            className={`message-bubble ${
                              mine
                                ? "message-mine"
                                : "message-other"
                            }`}
                          >

                            <p>

                              {
                                message.content
                              }

                            </p>


                            <span className="message-time">

                              {formatTime(
                                message.createdAt
                              )}


                              {mine &&
                                message.isRead && (

                                  <span className="message-read">

                                    {" "}✓✓

                                  </span>

                                )}

                            </span>

                          </div>

                        </div>

                      );

                    }
                  )

                )}


                {/* =====================================
                    AUTO-SCROLL TARGET
                ===================================== */}

                <div
                  ref={messagesEndRef}
                />

              </div>


              {/* =========================================
                  MESSAGE INPUT
              ========================================= */}

              <form
                className="message-input-area"
                onSubmit={
                  handleSendMessage
                }
              >

                <textarea
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleMessageKeyDown
                  }
                  placeholder="Type your message..."
                  maxLength={2000}
                  rows={1}
                  disabled={sending}
                />


                <button
                  type="submit"
                  className="send-message-button"
                  disabled={
                    sending ||
                    !messageText.trim()
                  }
                >

                  {sending
                    ? "Sending..."
                    : "Send"}

                </button>

              </form>


              <div className="message-input-hint">

                Press Enter to send • Shift + Enter
                for a new line

              </div>

            </>

          )}

        </section>

      </div>

    </div>

  );

}


export default Messages;