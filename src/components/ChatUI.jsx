import React, { useEffect, useRef, useState } from "react";
import { Send, Pencil, Trash2, MessageSquareText } from "lucide-react";
import { askQuestion } from "../api";
import { supabase } from "../lib/supabaseClient";
import { nanoid } from "nanoid";
import TypingIndicator from "../ui/TypingIndicator";
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
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatbot_id) {
      localStorage.setItem(
        `chat_history_${chatbot_id}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, chatbot_id]);

  const [associatedDocs, setAssociatedDocs] = useState([]);

  useEffect(() => {
    const fetchAssociatedDocs = async () => {
      if (!chatbot_id) return;
      const { data, error } = await supabase
        .from("chatbot_document_association")
        .select("document_name")
        .eq("chatbot_id", chatbot_id);

      if (!error && data) {
        const docNames = data.map((d) => d.document_name);
        setAssociatedDocs(docNames);
      } else {
        console.log(error, data);
      }
    };

    fetchAssociatedDocs();
  }, [chatbot_id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleEditMessage = (index) => {
    const msg = messages[index];
    if (msg.type !== "question") return;

    setQuestion(msg.text); // remet la question dans l'input
    setMessages(messages.slice(0, index)); // supprime tous les messages à partir de cette question
  };
  const handleDeleteMessage = (index) => {
    const newMessages = [...messages];

    // Supprime la question
    newMessages.splice(index, 1);

    // Supprime la réponse juste après si elle existe
    if (newMessages[index] && newMessages[index].type === "answer") {
      newMessages.splice(index, 1);
    }

    setMessages(newMessages);
  };

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setQuestion("");
    setLoading(true);

    try {
      const res = await askQuestion(trimmed, chatbot_id, associatedDocs);
      setMessages((prev) => [
        ...prev,
        { id: nanoid(), type: "question", text: trimmed },
        { id: nanoid(), type: "answer", text: res.answer, docs: res.documents },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "question", text: trimmed },
        {
          type: "answer",
          text: "❌ Une erreur est survenue lors de l'appel au modèle.",
          docs: [],
        },
      ]);
    } finally {
      setLoading(false);
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
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-2 sm:p-5 flex justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <MessageSquareText className="w-6 h-6" />
            ONIR Chat
          </h1>
          <button
            onClick={clearChat}
            className="text-sm flex items-center gap-1 text-red-500 hover:text-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Vider</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-1">
              <div
                className={`max-w-[85%] p-3 rounded-xl shadow-sm text-sm break-words ${
                  msg.type === "question"
                    ? "bg-indigo-100 dark:bg-indigo-500/20 ml-auto text-right"
                    : "bg-gray-100 dark:bg-gray-700 mr-auto text-left"
                }`}
              >
                <p>{msg.text}</p>
              </div>

              {msg.type === "question" && (
                <div className="flex justify-end pr-2 space-x-2 text-xs text-gray-500">
                  <button
                    onClick={() => handleEditMessage(idx)}
                    className="hover:text-indigo-600 transition flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(idx)}
                    className="hover:text-red-600 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-xl shadow-sm max-w-[85%]">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex flex-wrap gap-2 mt-2">
          <input
            type="text"
            placeholder="Pose ta question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            className="flex-1 min-w-0 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
  );
}
