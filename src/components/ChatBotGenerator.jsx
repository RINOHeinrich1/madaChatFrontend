import React, { useState } from "react";
import ChatPage from "./ChatPage";
import { ClipboardCopy, X } from "lucide-react";

const FRONT_URL= import.meta.env.VITE_FRONT_URL;
export default function EmbedGenerator() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<div id="chatbot-container"></div>
<script>
  const container = document.getElementById("chatbot-container");
  const button = document.createElement("button");
  button.innerText = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9998";
  button.style.borderRadius = "50%";
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.backgroundColor = "#4f46e5";
  button.style.color = "white";
  button.style.border = "none";
  button.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  container.appendChild(button);

  let iframe = null;
  button.onclick = () => {
    if (iframe) {
      iframe.remove();
      iframe = null;
    } else {
      iframe = document.createElement("iframe");
      iframe.src = "${FRONT_URL}/chat-widget";
      iframe.style.position = "fixed";
      iframe.style.bottom = "80px";
      iframe.style.right = "20px";
      iframe.style.width = "350px";
      iframe.style.height = "60vh";
      iframe.style.border = "none";
      iframe.style.zIndex = "9999";
      iframe.style.borderRadius = "12px";
      container.appendChild(iframe);
    }
  };
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-inter relative">
      {/* Button to trigger modal */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-5 right-5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
      >
        <ClipboardCopy className="w-4 h-4" />
        Copier le code
      </button>

      {/* Only chatbot */}
      <ChatPage />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl relative shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-indigo-600 mb-4">Code à intégrer</h2>

            <textarea
              readOnly
              value={embedCode}
              className="w-full h-64 bg-gray-900 text-white p-4 rounded-lg font-mono text-sm"
            />

            <button
              onClick={handleCopy}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition w-full"
            >
              {copied ? "✅ Code copié dans le presse-papiers !" : "📋 Copier maintenant"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
