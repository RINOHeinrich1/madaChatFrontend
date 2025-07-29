import React, { useEffect, useRef, useState } from "react";
import { Send, Pencil, Trash2, MessageSquareText } from "lucide-react";
import { askQuestion } from "../api";
import { supabase } from "../lib/supabaseClient";
import { nanoid } from "nanoid";
import TypingIndicator from "../ui/TypingIndicator";
import ReactMarkdown from "react-markdown";
import { Eye } from "lucide-react"; // ajoute l'import
import LogsDisplay from "../ui/LogDisplay";

export default function ChatUI({ chatbot_id }) {
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

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [previousMessages, setPreviousMessages] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // État pour gérer quel message montre le détail du raisonnement
  const [showLogIndex, setShowLogIndex] = useState(null);

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

  const handleEditMessage = (index) => {
    const msg = messages[index];
    if (msg.type !== "question") return;

    setPreviousMessages(messages); // sauvegarde
    setIsEditing(true); // édition active

    setQuestion(msg.text); // remet la question dans l’input
    setMessages(messages.slice(0, index)); // supprime les messages suivants
  };
  const cancelEdit = () => {
    if (previousMessages) {
      setMessages(previousMessages);
      setPreviousMessages(null);
      setQuestion("");
      setIsEditing(false);
    }
  };

  const [chatbotName, setChatbotName] = useState("ONIR Chat");
  const [chatbotAvatar, setChatbotAvatar] = useState(null);

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

  const handleDeleteMessage = (index) => {
    const newMessages = [...messages];

    newMessages.splice(index, 1);
    if (newMessages[index] && newMessages[index].type === "answer") {
      newMessages.splice(index, 1);
    }

    setMessages(newMessages);
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

      const res = await askQuestion(trimmed, chatbot_id, [], limitedHistory);

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

      setShowLogIndex(null); // ferme l'affichage détaillé par défaut après nouvelle réponse
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
  };
  function decodeHTMLEntities(str) {
    const parser = new DOMParser();
    const decoded = parser.parseFromString(
      `<!doctype html><body>${str}`,
      "text/html"
    );
    return decoded.body.textContent;
  }
  function decodeUnicode(str) {
    let decoded = str;
    try {
      // Répéter le parse tant qu'on a des séquences \uXXXX
      while (/\\u[0-9a-fA-F]{4}/.test(decoded)) {
        decoded = JSON.parse(`"${decoded}"`);
      }
    } catch {
      // Ignore les erreurs de parsing
    }
    return decoded;
  }

  function cleanText(str) {
    return decodeUnicode(decodeHTMLEntities(str));
  }

  const toggleLogs = (index) => {
    if (showLogIndex === index) {
      setShowLogIndex(null);
    } else {
      setShowLogIndex(index);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-2 sm:p-5 flex justify-center">
      <div className="w-full max-w-7xl flex justify-center">
        {" "}
        {/* center le conteneur chat */}
        {/* Chat principal */}
        <div className="flex-1 max-w-3xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col justify-between h-[90vh] sm:h-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              {chatbotAvatar ? (
                <img
                  src={chatbotAvatar}
                  alt="Avatar"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-indigo-500"
                />
              ) : (
                <MessageSquareText className="w-6 h-6" />
              )}
              {chatbotName}
            </h1>

            <div className="flex items-center gap-4">
              <button
                onClick={clearChat}
                className="text-sm flex items-center gap-1 text-red-500 hover:text-red-700 transition"
                aria-label="Vider la conversation"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Vider</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
            {messages.map((msg, idx) => (
              <div key={idx} className="message-block space-y-1">
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-xl shadow-sm text-sm break-words ${
                    msg.type === "question"
                      ? "bg-indigo-100 dark:bg-indigo-500/20 text-right"
                      : "bg-gray-100 dark:bg-gray-700 text-left"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {msg.type === "question" && (
                  <div className="flex justify-end pr-2 space-x-2 text-xs text-gray-500 items-center">
                    <button
                      onClick={() => handleEditMessage(idx)}
                      disabled={loading}
                      className={`transition flex items-center gap-1 ${
                        loading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:text-indigo-600"
                      }`}
                      aria-label="Modifier la question"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(idx)}
                      className="hover:text-red-600 transition flex items-center gap-1"
                      aria-label="Supprimer la question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Bouton œil pour voir le raisonnement (si réponse qui suit a reasoning) */}
                    <button
                      onClick={() => toggleLogs(idx + 1)}
                      className="hover:text-indigo-600 transition flex items-center"
                      aria-label="Afficher les logs de raisonnement"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Détail raisonnement sous la réponse  */}
                {msg.type === "answer" &&
                  showLogIndex === idx &&
                  msg.logs &&
                  msg.logs.length > 0 && (
                    <div className="mt-2 max-w-[80%]">
                      <LogsDisplay logs={msg.logs} />
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                {chatbotAvatar && (
                  <img
                    src={chatbotAvatar}
                    alt="Avatar bot"
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500"
                  />
                )}
                <div className="bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-xl shadow-sm max-w-[85%]">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex flex-wrap gap-2 mt-2 justify-center max-w-3xl w-full mx-auto">
            <input
              type="text"
              placeholder="Pose ta question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              className="flex-grow min-w-[250px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {isEditing && (
              <button
                onClick={cancelEdit}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2.5 rounded-xl transition"
              >
                Annuler
              </button>
            )}

            <button
              onClick={handleAsk}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl transition shadow flex items-center gap-2"
            >
              {loading ? (
                "..."
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Envoyer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
