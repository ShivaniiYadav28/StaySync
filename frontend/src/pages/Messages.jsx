import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";

import api from "../services/api";

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

      <div className="box-border h-[calc(100dvh-74px)] min-h-0 overflow-hidden bg-[#0b1120] px-6 py-[18px] max-[900px]:h-[calc(100dvh-68px)] max-[900px]:px-[15px] max-[900px]:py-5 max-[700px]:px-0 max-[700px]:py-0">

        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1250px] overflow-hidden rounded-[22px] border border-[#30415c] bg-[#0f172a] shadow-[0_24px_65px_rgba(0,0,0,0.42)] max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:shadow-none">

          <div className="messages-loading [flex:1] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [gap:10px] [color:#94a3b8] [&_p]:[margin:0] [&_p]:[font-size:12px]">

            <div className="messages-spinner [width:29px] [height:29px] [border:3px_solid_#1e293b] [border-top-color:#14b8a6] [border-radius:50%] [animation:staysync-spin_0.8s_linear_infinite]" />

            <p>
              Loading messages...
            </p>

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="box-border h-[calc(100dvh-74px)] min-h-0 overflow-hidden bg-[#0b1120] px-6 py-[18px] max-[900px]:h-[calc(100dvh-68px)] max-[900px]:px-[15px] max-[900px]:py-5 max-[700px]:px-0 max-[700px]:py-0">

      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1250px] overflow-hidden rounded-[22px] border border-[#30415c] bg-[#0f172a] shadow-[0_24px_65px_rgba(0,0,0,0.42)] max-[700px]:rounded-none max-[700px]:border-0 max-[700px]:shadow-none">


        {/* =================================================
            CONVERSATION SIDEBAR
        ================================================= */}

        <aside
          className={`messages-sidebar [width:350px] [min-width:350px] [display:flex] [flex-direction:column] [background:#111827] [border-right:1px_solid_#273449] max-[900px]:[width:310px] max-[900px]:[min-width:310px] max-[700px]:[width:100%] max-[700px]:[min-width:100%] max-[700px]:[border-right:none] max-[700px]:[&.mobile-hidden]:[display:none] [background:#0d1626] [&.conversation-item]:[min-height:86px] [&.conversation-item]:[padding:14px] [&.conversation-item]:[border:1px_solid_#263650] [&.conversation-item]:[border-radius:14px] [&.conversation-item]:[background:#121e32] [&.conversation-item:hover]:[border-color:#168f88] [&.conversation-item:hover]:[background:#17283d] [&.conversation-active]:[border:1px_solid_rgba(45,_212,_191,_0.65)] [&.conversation-active]:[border-left:4px_solid_#2dd4bf] [&.conversation-active]:[padding-left:11px] [&.conversation-active]:[background:linear-gradient(115deg,_rgba(20,_184,_166,_0.22),_rgba(124,_58,_237,_0.12))] max-[700px]:[&.conversation-item]:[min-height:82px] ${
            mobileChatOpen
              ? "mobile-hidden"
              : ""
          }`}
        >

          <div className="messages-sidebar-header [min-height:88px] [padding:22px_22px] [display:flex] [align-items:center] [background:#111827] [border-bottom:1px_solid_#273449] [box-sizing:border-box] [&_h1]:[margin:0] [&_h1]:[color:#f8fafc] [&_h1]:[font-size:25px] [&_h1]:[font-weight:750] [&_h1]:[letter-spacing:-0.5px] [&_p]:[margin:5px_0_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:13px] max-[430px]:[min-height:75px] max-[430px]:[padding:17px] max-[430px]:[&_h1]:[font-size:22px] [background:linear-gradient(135deg,_#111827,_#17263b)] [&_h1]:[font-size:28px]">

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

            <div className="messages-empty-sidebar [flex:1] [padding:30px_25px] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [text-align:center] [&_h3]:[margin:0] [&_h3]:[color:#f8fafc] [&_h3]:[font-size:17px] [&_p]:[max-width:245px] [&_p]:[margin:8px_0_20px] [&_p]:[color:#94a3b8] [&_p]:[font-size:12px] [&_p]:[line-height:1.6] [&_button]:[border:none] [&_button]:[background:#0d9488] [&_button]:[color:#ffffff] [&_button]:[border-radius:8px] [&_button]:[padding:9px_17px] [&_button]:[font-size:12px] [&_button]:[font-weight:600] [&_button]:[cursor:pointer] [&_button]:[transition:background_0.2s_ease] [&_button:hover]:[background:#14b8a6]">

              <div className="messages-empty-icon [width:64px] [height:64px] [margin-bottom:15px] [border-radius:50%] [background:rgba(20,_184,_166,_0.1)] [border:1px_solid_rgba(45,_212,_191,_0.12)] [color:#5eead4] [display:flex] [align-items:center] [justify-content:center] [font-size:27px]">
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

            <div className="conversation-list [flex:1] [overflow-y:auto] -webkit-scrollbar:[width:6px] -webkit-scrollbar-track:[background:transparent] -webkit-scrollbar-thumb:[background:#334155] -webkit-scrollbar-thumb:[border-radius:20px] -webkit-scrollbar-thumb:hover:[background:#475569] [display:flex] [flex-direction:column] [gap:10px] [padding:14px]">

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
                      className={`conversation-item [width:100%] [min-height:90px] [padding:15px_18px] [display:flex] [align-items:center] [gap:13px] [border:none] [border-bottom:1px_solid_#1e293b] [background:#111827] [text-align:left] [cursor:pointer] [box-sizing:border-box] [transition:background_0.2s_ease,_border-left_0.2s_ease] hover:[background:#172033] max-[430px]:[min-height:82px] max-[430px]:[padding:13px] ${
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

                      <div className="conversation-avatar [width:48px] [height:48px] [min-width:48px] [border-radius:50%] [background:linear-gradient(_135deg,_#0f766e,_#14b8a6_)] [color:#ffffff] [display:flex] [align-items:center] [justify-content:center] [font-size:15px] [font-weight:700] [box-shadow:0_4px_12px_rgba(20,_184,_166,_0.18)] max-[430px]:[width:43px] max-[430px]:[height:43px] max-[430px]:[min-width:43px]">

                        {getInitials(
                          participant?.name
                        )}

                      </div>


                      <div className="conversation-details [min-width:0] [flex:1]">

                        <div className="conversation-top-row [display:flex] [align-items:center] [justify-content:space-between] [gap:10px] [&_strong]:[min-width:0] [&_strong]:[color:#f8fafc] [&_strong]:[font-size:14px] [&_strong]:[font-weight:700] [&_strong]:[overflow:hidden] [&_strong]:[white-space:nowrap] [&_strong]:[text-overflow:ellipsis]">

                          <strong>
                            {
                              participantName
                            }
                          </strong>


                          <span className="conversation-time [flex-shrink:0] [color:#64748b] [font-size:10px]">

                            {formatConversationTime(
                              conversation.lastMessageAt ||
                              conversation.updatedAt
                            )}

                          </span>

                        </div>


                        <div className="conversation-property [margin-top:4px] [color:#5eead4] [font-size:11px] [font-weight:700] [overflow:hidden] [white-space:nowrap] [text-overflow:ellipsis]">

                          {propertyName}

                        </div>


                        <div className="conversation-bottom-row [margin-top:5px] [display:flex] [align-items:center] [justify-content:space-between] [gap:8px]">

                          <span className="conversation-preview [min-width:0] [color:#94a3b8] [font-size:12px] [overflow:hidden] [white-space:nowrap] [text-overflow:ellipsis]">

                            {getLastMessageText(
                              conversation
                            )}

                          </span>


                          {unreadCount > 0 && (

                            <span className="conversation-unread [min-width:21px] [height:21px] [padding:0_6px] [flex-shrink:0] [border-radius:50%] [background:#14b8a6] [color:#ffffff] [display:flex] [align-items:center] [justify-content:center] [font-size:10px] [font-weight:700]">

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
          className={`messages-chat flex min-h-0 min-w-0 flex-1 flex-col bg-[#0b1423] max-[700px]:hidden max-[700px]:w-full max-[700px]:[&.mobile-chat-open]:flex ${
            mobileChatOpen
              ? "mobile-chat-open"
              : ""
          }`}
        >

          {!selectedConversation ? (

            <div className="chat-no-selection [flex:1] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [text-align:center] [padding:30px] [&_h2]:[margin:0] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:19px] [&_p]:[max-width:350px] [&_p]:[margin:8px_0_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:12px] [&_p]:[line-height:1.6]">

              <div className="chat-no-selection-icon [width:70px] [height:70px] [margin-bottom:15px] [border-radius:50%] [background:rgba(20,_184,_166,_0.1)] [border:1px_solid_rgba(45,_212,_191,_0.12)] [color:#5eead4] [display:flex] [align-items:center] [justify-content:center] [font-size:30px]">
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

              <header className="chat-header [height:78px] [padding:14px_22px] [display:flex] [align-items:center] [gap:13px] [background:#111827] [border-bottom:1px_solid_#273449] [box-sizing:border-box] max-[700px]:[height:70px] max-[700px]:[padding:12px_14px] [height:84px] [background:linear-gradient(110deg,_#111827,_#17263b)]">

                <button
                  type="button"
                  className="mobile-back-button [display:none] [width:35px] [height:35px] [border:none] [border-radius:8px] [background:#1e293b] [color:#cbd5e1] [font-size:19px] [cursor:pointer] max-[700px]:[display:flex] max-[700px]:[align-items:center] max-[700px]:[justify-content:center]"
                  onClick={() =>
                    setMobileChatOpen(false)
                  }
                >
                  ←
                </button>


                <div className="chat-user-avatar [width:45px] [height:45px] [min-width:45px] [border-radius:50%] [background:linear-gradient(_135deg,_#0f766e,_#14b8a6_)] [color:#ffffff] [display:flex] [align-items:center] [justify-content:center] [font-size:14px] [font-weight:700] max-[430px]:[width:40px] max-[430px]:[height:40px] max-[430px]:[min-width:40px]">

                  {getInitials(
                    getOtherParticipantName(
                      selectedConversation
                    )
                  )}

                </div>


                <div className="chat-header-info [min-width:0] [&_h2]:[margin:0] [&_h2]:[color:#f8fafc] [&_h2]:[font-size:16px] [&_h2]:[font-weight:700] [&_p]:[margin:4px_0_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:11px]">

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

              <div className="chat-property-bar [min-height:65px] [padding:10px_20px] [display:flex] [align-items:center] [gap:12px] [background:#111827] [border-bottom:1px_solid_#273449] [box-sizing:border-box] [&>_div:nth-child(2)]:[min-width:0] [&>_div:nth-child(2)]:[display:flex] [&>_div:nth-child(2)]:[flex-direction:column] [&_span]:[color:#64748b] [&_span]:[font-size:9px] [&_span]:[text-transform:uppercase] [&_span]:[letter-spacing:0.5px] [&_strong]:[max-width:300px] [&_strong]:[margin-top:2px] [&_strong]:[color:#e2e8f0] [&_strong]:[font-size:13px] [&_strong]:[overflow:hidden] [&_strong]:[white-space:nowrap] [&_strong]:[text-overflow:ellipsis] max-[700px]:[min-height:58px] max-[700px]:[padding:9px_13px] max-[430px]:[&_strong]:[max-width:170px] [margin:12px_18px_0] [border:1px_solid_#293a54] [border-radius:14px]">

                <div className="chat-property-icon [width:38px] [height:38px] [min-width:38px] [border-radius:9px] [background:rgba(20,_184,_166,_0.1)] [border:1px_solid_rgba(45,_212,_191,_0.12)] [color:#5eead4] [display:flex] [align-items:center] [justify-content:center] [font-size:18px]">
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
                    className="view-property-button [margin-left:auto] [border:1px_solid_#0d9488] [background:transparent] [color:#5eead4] [border-radius:8px] [padding:8px_15px] [font-size:11px] [font-weight:700] [cursor:pointer] [transition:background_0.2s_ease,_color_0.2s_ease] hover:[background:#0d9488] hover:[color:#ffffff] max-[430px]:[padding:7px_9px] max-[430px]:[font-size:10px] [display:inline-flex] [align-items:center] [justify-content:center] [padding:11px_18px] [text-decoration:none] [font-size:14px] [font-weight:600] [transition:background_0.2s_ease,_transform_0.2s_ease,_box-shadow_0.2s_ease] [background:#0d9488] [color:#ffffff] [box-shadow:0_5px_15px_rgba(20,_184,_166,_0.12)] hover:[background:#14b8a6] hover:[transform:translateY(-1px)] hover:[box-shadow:0_7px_18px_rgba(20,_184,_166,_0.2)] max-[750px]:[width:100%]"
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

                <div className="messages-error [margin:10px_18px_0] [padding:10px_13px] [border:1px_solid_#7f1d1d] [border-radius:8px] [background:rgba(239,_68,_68,_0.1)] [color:#f87171] [font-size:12px]">

                  {error}

                </div>

              )}


              {/* =========================================
                  MESSAGES
              ========================================= */}

              <div className="chat-messages flex min-h-0 flex-1 flex-col gap-[13px] overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.09),transparent_45%),#0d1728] p-[25px_30px] max-[900px]:p-5 max-[700px]:p-[18px_13px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb:hover]:bg-slate-600">

                {messagesLoading ? (

                  <div className="chat-loading [flex:1] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [gap:10px] [color:#94a3b8] [&_p]:[margin:0] [&_p]:[font-size:12px]">

                    <div className="messages-spinner [width:29px] [height:29px] [border:3px_solid_#1e293b] [border-top-color:#14b8a6] [border-radius:50%] [animation:staysync-spin_0.8s_linear_infinite]" />

                    <p>
                      Loading conversation...
                    </p>

                  </div>

                ) : messages.length === 0 ? (

                  <div className="chat-empty [flex:1] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [text-align:center] [padding:30px] [&_h3]:[margin:0] [&_h3]:[color:#f8fafc] [&_h3]:[font-size:19px] [&_p]:[max-width:350px] [&_p]:[margin:8px_0_0] [&_p]:[color:#94a3b8] [&_p]:[font-size:12px] [&_p]:[line-height:1.6]">

                    <div className="chat-empty-icon [width:70px] [height:70px] [margin-bottom:15px] [border-radius:50%] [background:rgba(20,_184,_166,_0.1)] [border:1px_solid_rgba(45,_212,_191,_0.12)] [color:#5eead4] [display:flex] [align-items:center] [justify-content:center] [font-size:30px]">
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
                          className={`message-row [width:100%] [display:flex] [align-items:flex-end] [gap:7px] ${
                            mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          {!mine && (

                            <div className="message-avatar-small [width:28px] [height:28px] [min-width:28px] [margin-bottom:2px] [border-radius:50%] [background:#1e293b] [border:1px_solid_#334155] [color:#cbd5e1] [display:flex] [align-items:center] [justify-content:center] [font-size:9px] [font-weight:700]">

                              {getInitials(
                                message.sender?.name
                              )}

                            </div>

                          )}


                          <div
                            className={`message-bubble [max-width:65%] [padding:10px_13px_7px] [border-radius:15px] [box-sizing:border-box] [box-shadow:0_3px_10px_rgba(0,_0,_0,_0.15)] [&_p]:[margin:0] [&_p]:[font-size:13px] [&_p]:[line-height:1.55] [&_p]:[white-space:pre-wrap] [&_p]:[overflow-wrap:anywhere] max-[900px]:[max-width:75%] max-[700px]:[max-width:82%] [max-width:min(72%,_560px)] [padding:12px_16px_9px] [border-radius:17px] ${
                              mine
                                ? "bg-teal-700 text-white"
                                : "bg-slate-800 text-slate-100"
                            }`}
                          >

                            <p>

                              {
                                message.content
                              }

                            </p>


                            <span className={`message-time block mt-[5px] text-right text-[9px] ${mine ? "text-teal-100" : "text-slate-400"}`}>

                              {formatTime(
                                message.createdAt
                              )}


                              {mine &&
                                message.isRead && (

                                  <span className="message-read [font-size:10px] [letter-spacing:-1px]">

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
                className="message-input-area flex shrink-0 items-end gap-2.5 border-t border-[#273449] bg-[#111827] p-[15px_18px_9px] max-[700px]:p-[9px]"
                onSubmit={
                  handleSendMessage
                }
              >

                <textarea
                  className="min-h-12 max-h-[120px] min-w-0 flex-1 resize-none rounded-xl border border-slate-700 bg-[#0f172a] px-3.5 py-3 text-[13px] text-slate-50 outline-none placeholder:text-slate-500 focus:border-teal-500 focus:ring-[3px] focus:ring-teal-500/10 disabled:bg-slate-800 disabled:text-slate-500"
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
                  className="h-12 min-w-[82px] shrink-0 rounded-xl bg-gradient-to-br from-teal-700 to-teal-500 px-5 text-xs font-bold text-white transition hover:brightness-110 hover:shadow-[0_6px_15px_rgba(20,184,166,0.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 max-[700px]:px-3.5 max-[430px]:h-[42px] max-[430px]:px-3"
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


              <div className="shrink-0 bg-[#111827] px-[18px] pb-[11px] text-right text-[9px] text-slate-500 max-[700px]:hidden">

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
