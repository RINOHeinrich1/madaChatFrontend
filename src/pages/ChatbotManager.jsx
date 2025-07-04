import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import ChatbotFormModal from "../components/ChatbotCreateForm";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChatbotDocumentsManager from "../components/ChatbotDocumentManager";
import {
  CheckCircle,
  Pencil,
  Trash,
  Plus,
  FileText,
  Search,
  MessageSquareText,
} from "lucide-react";
import Modal from "../components/Modal"; // si tu le mets dans le même dossier
export default function ChatbotManager() {
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // chatbot à éditer
  const [selectedForDocs, setSelectedForDocs] = useState(null); // chatbot sélectionné pour voir ses documents
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedChatbotId, setSelectedChatbotId] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "table" ou "cards"

  useEffect(() => {
    const getUserAndChatbots = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      setUserId(authData.user.id);

      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("owner_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setChatbots(data);
        setFiltered(data);
      }
    };

    getUserAndChatbots();
  }, [modalOpen]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(
      chatbots.filter(
        (cb) =>
          cb.nom.toLowerCase().includes(term) ||
          cb.description?.toLowerCase().includes(term)
      )
    );
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Supprimer ce chatbot ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48", // rouge
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from("chatbots").delete().eq("id", id);
      if (!error) {
        setChatbots((prev) => prev.filter((cb) => cb.id !== id));
        setFiltered((prev) => prev.filter((cb) => cb.id !== id));
        Swal.fire("Supprimé", "Le chatbot a été supprimé.", "success");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-gray-800 dark:text-gray-100 flex justify-center px-4 py-8 transition-all duration-500">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-xl shadow-sm w-full max-w-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Rechercher..."
              className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-xl text-sm shadow ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-white"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-xl text-sm shadow ${
                viewMode === "cards"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-white"
              }`}
            >
              Cartes
            </button>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="mr-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 text-white font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />

            <span className="hidden sm:inline">Ajouter un chatbot</span>
          </button>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <table className="min-w-full table-auto text-sm text-left text-gray-700 dark:text-gray-200">
              <thead className="bg-indigo-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cb) => (
                  <tr
                    key={cb.id}
                    className="border-b dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4 font-medium">{cb.nom}</td>
                    <td className="px-6 py-4">{cb.description}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditing(cb);
                          setModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cb.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/chat/${cb.id}`)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <MessageSquareText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedChatbotId(cb.id);
                          setDocumentModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Aucun chatbot trouvé.
                    </td>
                  </tr>
                )}
                {selectedForDocs && (
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        Documents liés à :{" "}
                        <span className="italic">{selectedForDocs.nom}</span>
                      </h2>
                      <button
                        onClick={() => setSelectedForDocs(null)}
                        className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                      >
                        Fermer
                      </button>
                    </div>
                    <ChatbotDocumentsManager
                      chatbotId={selectedForDocs.id}
                      ownerId={userId}
                    />
                  </div>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((cb) => (
              <div
                key={cb.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3 transition hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {cb.nom}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {cb.description || "Aucune description"}
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(cb);
                        setModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cb.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/chat/${cb.id}`)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <MessageSquareText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedChatbotId(cb.id);
                        setDocumentModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center col-span-full text-gray-500 dark:text-gray-300">
                Aucun chatbot trouvé.
              </div>
            )}
          </div>
        )}

        {/* Modal de création / édition */}
        {modalOpen && (
          <ChatbotFormModal
            onClose={() => setModalOpen(false)}
            userId={userId}
            existing={editing}
          />
        )}
        <Modal
          open={documentModalOpen}
          onClose={() => setDocumentModalOpen(false)}
        >
          {selectedChatbotId && (
            <ChatbotDocumentsManager chatbotId={selectedChatbotId} />
          )}
        </Modal>
      </div>
    </div>
  );
}
