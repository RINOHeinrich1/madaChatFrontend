import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Pencil,
  Trash2,
  MessageSquareText,
  Eye,
  Copy,
  Check,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { askQuestion } from "../api";
import { supabase } from "../lib/supabaseClient";
import { nanoid } from "nanoid";
import TypingIndicator from "../ui/TypingIndicator";
import ReactMarkdown from "react-markdown";
import LogsDisplay from "../ui/LogDisplay";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatUI({ chatbot_id, theme = "light" }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`chat_history_${chatbot_id}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        type: "answer",
        text: "Comment puis-je vous assister aujourd'hui ? N'hésitez pas à poser votre question.",
        docs: [],
        reasoning: null,
      },
    ];
  });
  const [activeMessageIndex, setActiveMessageIndex] = useState(null);
  const [slotState, setSlotState] = useState(() => {
    const saved = localStorage.getItem(`slot_state_${chatbot_id}`);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (chatbot_id && slotState) {
      localStorage.setItem(
        `slot_state_${chatbot_id}`,
        JSON.stringify(slotState)
      );
    }
  }, [slotState, chatbot_id]);

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [previousMessages, setPreviousMessages] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogIndex, setShowLogIndex] = useState(null);
  const [chatbotName, setChatbotName] = useState("ONIR Chat");
  const [chatbotAvatar, setChatbotAvatar] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    if (chatbot_id) {
      localStorage.setItem(
        `chat_history_${chatbot_id}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, chatbot_id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchChatbotInfo = async () => {
      if (!chatbot_id) return;
      const { data, error } = await supabase
        .from("public_chatbots")
        .select("nom, avatar")
        .eq("id", chatbot_id)
        .single();

      if (!error && data) {
        setChatbotName(data.nom);
        if (data.avatar) setChatbotAvatar(data.avatar);
      } else {
        console.error(
          "Erreur lors de la récupération des infos du chatbot:",
          error
        );
      }
    };
    fetchChatbotInfo();
  }, [chatbot_id]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".message-block")) {
        setActiveMessageIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      toast.success("Message copié !", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "white",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast.error("Erreur lors de la copie", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "white",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
    }
  };

  const handleEditMessage = (index) => {
    const msg = messages[index];
    if (msg.type !== "question") return;
    setPreviousMessages(messages);
    setIsEditing(true);
    setQuestion(msg.text);
    setMessages(messages.slice(0, index));
  };

  const cancelEdit = () => {
    if (previousMessages) {
      setMessages(previousMessages);
      setPreviousMessages(null);
      setQuestion("");
      setIsEditing(false);
    }
  };

  const handleDeleteMessage = (index) => {
    console.log("Deleting Message");
    const newMessages = [...messages];
    newMessages.splice(index, 1);
    if (newMessages[index] && newMessages[index].type === "answer") {
      newMessages.splice(index, 1);
    }
    setMessages(newMessages);
    toast.success("Message supprimé", {
      duration: 2000,
      position: "top-center",
    });
  };

  const getMemoireContextuelle = async (chatbot_id) => {
    const { data, error } = await supabase
      .from("chatbots")
      .select("memoire_contextuelle")
      .eq("id", chatbot_id)
      .single();
    if (error || !data?.memoire_contextuelle) return 5;
    return data.memoire_contextuelle;
  };

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setQuestion("");
    const questionMsg = { id: nanoid(), type: "question", text: trimmed };
    setMessages((prev) => [...prev, questionMsg]);
    setLoading(true);

    try {
      const limit = await getMemoireContextuelle(chatbot_id);
      const fullHistory = [...messages, questionMsg]
        .filter((msg) => msg.type === "question" || msg.type === "answer")
        .map((msg) => ({
          role: msg.type === "question" ? "user" : "assistant",
          content: msg.text,
        }));
      const limitedHistory = fullHistory.slice(-limit);
      const res = await askQuestion(
        trimmed,
        chatbot_id,
        slotState,
        limitedHistory
      );
      if (res.slot_state) setSlotState(res.slot_state);
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          type: "answer",
          text: res.answer,
          docs: res.documents,
          logs: res.logs || [],
        },
      ]);
      setShowLogIndex(null);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          type: "answer",
          text: "❌ Une erreur est survenue lors de l'appel au modèle.",
          docs: [],
          reasoning: null,
        },
      ]);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const clearChat = () => {
    if (chatbot_id) {
      localStorage.removeItem(`chat_history_${chatbot_id}`);
      localStorage.removeItem(`slot_state_${chatbot_id}`);
    }
    setMessages([
      {
        type: "answer",
        text: "Bonjour, comment puis-je vous assister aujourd'hui ? N'hésitez pas à poser votre question.",
        docs: [],
        reasoning: null,
      },
    ]);
    setShowLogIndex(null);
    toast.success("Conversation effacée", {
      duration: 2000,
      position: "top-center",
    });
  };

  const toggleLogs = (index) => {
    setShowLogIndex(showLogIndex === index ? null : index);
  };

  const getThemeClasses = (theme) => {
    switch (theme) {
      case "dark":
        return {
          background:
            "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
          text: "text-gray-100",
          userMsg:
            "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg:
            "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 shadow-lg shadow-gray-900/25 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",
          input:
            "bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm",
          button:
            "transition-all duration-200 shadow-lg flex items-center gap-3 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25",
          headerText: "text-blue-400",
          containerBg:
            "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50",
          actionButton: "text-gray-400 hover:text-blue-400",
          clearButton: "text-red-400 hover:text-red-300",
        };

      case "dark-green":
        return {
          background:
            "bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900",
          text: "text-emerald-50",
          userMsg:
            "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg:
            "bg-gradient-to-r from-green-800 to-emerald-700 text-emerald-50 shadow-lg shadow-green-900/25 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",
          input:
            "bg-green-800/60 border-green-600/50 text-emerald-50 placeholder-green-300 backdrop-blur-sm",
          button:
            "transition-all duration-200 shadow-lg flex items-center gap-3 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25",
          headerText: "text-emerald-300",
          containerBg:
            "bg-green-800/30 backdrop-blur-xl border border-green-700/50",
          actionButton: "text-green-300 hover:text-emerald-300",
          clearButton: "text-red-400 hover:text-red-300",
        };

      case "light-green":
        return {
          background:
            "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
          text: "text-black-900",
          userMsg: "bg-white backdrop-blur-md rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg: "bg-white backdrop-blur-md rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",

          input:
            "bg-white  text-black-900 placeholder-black-500 backdrop-blur-sm",
          button:
            "text-black-500 hover:text-black-600 bg-white hover:bg-[#ADEDCB] ",
          headerText: "text-black-600",
          containerBg:
            "bg-[radial-gradient(ellipse_at_45%_100%,_#9FD2B7_0%,_#ADEDCB_25%,_#D3F2E4_50%,_#ECF5F1_75%,_#FEFEFE_100%)]",
          actionButton: "text-green-500 hover:text-green-600",
          clearButton: "text-black-500 hover:text-black-600 bg-[#ADEDCB]/30 hover:bg-[#ADEDCB] ",
        };

      case "ocean":
        return {
          background:
            "bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900",
          text: "text-cyan-50",
          userMsg:
            "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg:
            "bg-gradient-to-r from-blue-800 to-cyan-700 text-cyan-50 shadow-lg shadow-blue-900/25 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",
          input:
            "bg-blue-800/60 border-cyan-600/50 text-cyan-50 placeholder-cyan-300 backdrop-blur-sm",
          button:
            "transition-all duration-200 shadow-lg flex items-center gap-3 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25",
          headerText: "text-cyan-300",
          containerBg:
            "bg-blue-800/30 backdrop-blur-xl border border-cyan-700/50",
          actionButton: "text-cyan-300 hover:text-cyan-200",
          clearButton: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
        };

      case "sunset":
        return {
          background:
            "bg-gradient-to-br from-orange-900 via-red-900 to-pink-900",
          text: "text-orange-50",
          userMsg:
            "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg:
            "bg-gradient-to-r from-red-800 to-orange-700 text-orange-50 shadow-lg shadow-red-900/25 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",
          input:
            "bg-red-800/60 border-orange-600/50 text-orange-50 placeholder-orange-300 backdrop-blur-sm",
          button:
            "transition-all duration-200 shadow-lg flex items-center gap-3 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25",
          headerText: "text-orange-300",
          containerBg:
            "bg-red-800/30 backdrop-blur-xl border border-orange-700/50",
          actionButton: "text-orange-300 hover:text-orange-200",
          clearButton: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
        };

      case "purple":
        return {
          background:
            "bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900",
          text: "text-purple-50",
          userMsg:
            "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg:
            "bg-gradient-to-r from-violet-800 to-purple-700 text-purple-50 shadow-lg shadow-violet-900/25 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",
          input:
            "bg-violet-800/60 border-purple-600/50 text-purple-50 placeholder-purple-300 backdrop-blur-sm",
          button:
            "transition-all duration-200 shadow-lg flex items-center gap-3 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg shadow-purple-500/25",
          headerText: "text-purple-300",
          containerBg:
            "bg-violet-800/30 backdrop-blur-xl border border-purple-700/50",
          actionButton: "text-purple-300 hover:text-purple-200",
          clearButton: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
        };

      case "light":
      default:
        return {
          background: "bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50",
          text: "text-gray-800",
          userMsg:
            "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/20 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl",
          botMsg:
            "bg-white/80 backdrop-blur-sm text-gray-800 shadow-lg shadow-gray-900/10 border border-gray-100 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl",
          input:
            "bg-white/80 border-gray-200 text-gray-800 placeholder-gray-500 backdrop-blur-sm shadow-sm",
          button:
            "transition-all duration-200 shadow-lg flex items-center gap-3 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg shadow-indigo-500/25",
          headerText: "text-indigo-600",
          containerBg:
            "bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-xl shadow-gray-900/5",
          actionButton: "text-gray-500 hover:text-indigo-600",
          clearButton: "text-red-500 hover:text-red-600 hover:bg-red-500/10",
        };
    }
  };

  const themeClasses = getThemeClasses(theme);

  const rotateAnimation = `
    @keyframes rotate-left-pause {
      0%    { transform: rotate(0deg); }
      90.9% { transform: rotate(-360deg); }
      100%  { transform: rotate(-360deg); }
    }
  `;

  useEffect(() => {
    if (!document.querySelector('style[data-avatar-rotate="1"]')) {
      const s = document.createElement("style");
      s.setAttribute("data-avatar-rotate", "1");
      s.innerHTML = rotateAnimation;
      document.head.appendChild(s);
      return () => {
        document.head.removeChild(s);
      };
    }
  }, []);

  const rotateStyle = theme === "light-green" ? {
    animationName: "rotate-left-pause",
    animationDuration: "5.5s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  } : {};


  useEffect(() => {
    // Simule un délai de chargement, par ex 2 secondes
    const timer = setTimeout(() => setLoadingPage(false), 4000);
    return () => clearTimeout(timer);
  }, []);


  const animationCSS = `
  @keyframes logo-move-3d-circle-scaleY {
    0% {
      transform: translate(0, 0) scaleY(1) rotateY(0deg);
      opacity: 1;
    }
    15% {
      transform: translate(64px, 0) scaleY(0.5) rotateY(15deg);
      opacity: 0.8;
    }
    30% {
      transform: translate(64px, 0) scaleY(1) rotateY(0deg);
      opacity: 1;
    }
    45% {
      transform: translate(0, 64px) scaleY(0.5) rotateY(15deg);
      opacity: 0.8;
    }
    60% {
      transform: translate(0, 64px) scaleY(1) rotateY(0deg);
      opacity: 1;
    }
    75% {
      transform: translate(-64px, 0) scaleY(0.5) rotateY(15deg);
      opacity: 0.8;
    }
    90% {
      transform: translate(-64px, 0) scaleY(1) rotateY(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(0, 0) scaleY(1) rotateY(0deg);
      opacity: 1;
    }
  }
`;

  useEffect(() => {
    if (!document.querySelector('style[data-logo-animation="1"]')) {
      const style = document.createElement("style");
      style.setAttribute("data-logo-animation", "1");
      style.innerHTML = animationCSS;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const animationStyle =
    theme === "light-green"
      ? {
        animationName: "logo-move-3d-circle-scaleY",
        animationDuration: "4s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        willChange: "transform, opacity",
      }
      : {};


  return (

    <div
      className={`min-h-screen ${themeClasses.background} ${themeClasses.text} transition-all duration-500 font-inter p-2 sm:p-5 flex justify-center`}
    >
      <Toaster />
      <div className="w-full max-w-7xl flex justify-center">
        <div
          className={`flex-1 max-w-4xl ${themeClasses.containerBg} rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-[90vh] sm:h-auto transition-all duration-300`}
        >
          {loadingPage ? (<>
            <div className="w-full h-screen flex items-center justify-center">
              <div className="flex flex-col items-center">
                {/* Cercle noir avec avatar */}
                <div className="bg-black rounded-full flex items-center justify-center p-16">
                  <img
                    src={chatbotAvatar}
                    alt="Chatbot avatar"
                    style={animationStyle}
                    className="w-32 h-32 rounded-full object-cover animate-pulse"
                  />
                </div>

                {/* Texte en dessous */}
                <p className="text-black mt-4 text-4xl font-serif">Bonjour !</p>
              </div>
            </div>
          </>
          ) : (
            <>

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1
                  className={`text-xl sm:text-3xl font-bold flex items-center gap-4 ${themeClasses.headerText}`}
                >
                  {chatbotAvatar ? (
                    <div className="relative">
                      <img
                        src={chatbotAvatar}
                        alt="Avatar"
                        className="w-14 h-14 sm:w-14 sm:h-14 rounded-full object-cover bg-black"
                        style={rotateStyle}
                      />
                      <span
                        className="absolute bottom-1 right-1 block w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                        style={{ transform: "translate(25%, 25%)" }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <MessageSquareText className="w-8 h-8 sm:w-10 sm:h-10" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                  <div>
                    <div className="font-serif text-[22px] font-medium text-black tracking-[0.5px]">{chatbotName}</div>
                    <div className="text-sm opacity-70 font-normal">En ligne</div>
                  </div>
                </h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearChat}
                    className={`text-sm flex items-center gap-2 ${themeClasses.clearButton} transition-all duration-200 px-4 py-2 rounded-xl `}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Vider le chat</span>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-6 p-4 rounded-2xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="message-block space-y-3 group relative"
                    onClick={() =>
                      setActiveMessageIndex(activeMessageIndex === idx ? null : idx)
                    }
                  >


                    <div
                      className={`flex ${msg.type === "question" ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div className="relative">
                        {msg.type !== "question" && chatbotAvatar ? (
                          <img
                            src={chatbotAvatar}
                            alt="Avatar bot"
                            className="w-12 h-12 object-cover mr-4"
                          />
                        ) : null}
                      </div>
                      <div
                        className={`relative inline-block max-w-[85%] p-4 group-hover:pb-10 text-sm sm:text-base break-words transition-all duration-200 hover:scale-[1.01] font-awesome ${msg.type === "question" ? themeClasses.userMsg : themeClasses.botMsg
                          }`}
                      >
                        <div
                          className="prose prose-sm max-w-none prose-invert select-none"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>

                        {/* Copy button pour desktop */}
                        <button
                          onClick={() => copyToClipboard(msg.text, `${idx}-${msg.type}`)}
                          className={`absolute bottom-2 right-2 
                       opacity-0 group-hover:opacity-100
                       transition-opacity duration-200 p-2 rounded-full
                       bg-transparent shadow-none
                       ${themeClasses.actionButton} hover:scale-110`}
                          title="Copier le message"
                        >
                          {copiedMessageId === `${idx}-${msg.type}` ? (
                            <Check className="w-4 h-4 text-black-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>


                      </div>
                      {/* Avatar ou loader à droite */}
                      <div className="ml-4">
                        {msg.type === "question" ? (
                          // Avatar infini animé (exemple)
                          <div className="w-10 h-10 mt-1 bg-black rounded-full flex items-center justify-center">
                            <img width="20" height="20" src="https://img.icons8.com/ios-filled/50/FFFFFF/infinity-large.png" alt="infinity-large" />
                          </div>
                        ) : null}
                      </div>
                    </div>



                    {/* Actions pour desktop (survol) */}
                    {msg.type === "question" && (
                      <div
                        className={`flex justify-end pr-4 space-x-3 text-xs transition-all duration-200 ${activeMessageIndex === idx
                          ? "opacity-100"
                          : "opacity-0 sm:group-hover:opacity-100"
                          }`}
                      >
                        <button
                          onClick={() => handleEditMessage(idx)}
                          disabled={loading}
                          className={`transition-all duration-200 flex items-center gap-1 ${themeClasses.actionButton} hover:scale-110 p-2 rounded-lg hover:bg-white/10`}
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(idx)}
                          className={`transition-all duration-200 flex items-center gap-1 ${themeClasses.clearButton} hover:scale-110 p-2 rounded-lg hover:bg-red-500/10`}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleLogs(idx + 1)}
                          className={`transition-all duration-200 flex items-center ${themeClasses.actionButton} hover:scale-110 p-2 rounded-lg hover:bg-white/10`}
                          title="Voir les logs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {msg.type === "answer" &&
                      showLogIndex === idx &&
                      msg.logs?.length > 0 && (
                        <div className="mt-4 max-w-[85%] transition-all duration-300">
                          <LogsDisplay logs={msg.logs} />
                        </div>
                      )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-4 animate-fade-in">
                    <div className="relative">
                      {chatbotAvatar && (
                        <img
                          src={chatbotAvatar}
                          alt="Avatar bot"
                          className="w-12 h-12  object-cover"
                        />
                      )}

                    </div>
                    <div
                      className={`${themeClasses.botMsg} text-sm p-4 rounded-2xl shadow-lg max-w-[85%] animate-pulse`}
                    >
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Features */}
              {theme === "light-green" && (
                <FeatureExchange onSelect={setQuestion} />
              )}



              {/* Input */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-4xl w-full mx-auto">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleAsk()
                    }
                    className={`w-full px-6 py-4 rounded-2xl ${themeClasses.input} focus:outline-none  text-base placeholder:text-sm`}
                  />
                  {question && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>


                <div className="flex gap-3">
                  {isEditing && (
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500/20 backdrop-blur-sm hover:bg-gray-500/30 text-current px-6 py-4 rounded-2xl transition-all duration-200 font-medium hover:scale-105 border border-gray-500/30"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    onClick={handleAsk}
                    disabled={loading || !question.trim()}
                    className={`px-6 py-4 text-base rounded-2xl ${themeClasses.button}`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Envoi...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}




export function FeatureExchange({ onSelect }) {
  const initialFeatures = [
    "Quelles sont les étapes d'un divorce?",
    "Quels documents dois-je fournir ?",
    "Je peux savoir comment on peut calculer la pension compensatoire",
  ];

  const [question, setQuestion] = useState(null);
  const [features, setFeatures] = useState(initialFeatures);
  const [clickCount, setClickCount] = useState(0); // compteur de clics

  useEffect(() => {
    if (!question) {
      setFeatures(initialFeatures);
      return;
    }
    const others = initialFeatures.filter((f) => f !== question);
    setFeatures([...others, question]);

    if (onSelect) onSelect(question);
  }, [question, clickCount, onSelect]); // déclenche aussi si clickCount change

  const handleClick = (feature) => {
    setQuestion(feature);
    setClickCount((c) => c + 1); // incrémenter à chaque clic
  };

  return (
    <div className="text-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {features.map((feature) => (
          <motion.button
            key={feature}
            layout
            onClick={() => handleClick(feature)}
            transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
            className="text-sm flex flex-col justify-center items-center text-black-500 hover:text-black-600 bg-white/50 hover:bg-[#ADEDCB] transition-all duration-200 px-4 py-1 rounded-[5px] h-full text-center"
          >
            <span className="text-sm break-words">{feature}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}



