import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import ChatbotFormModal from "../components/ChatbotCreateForm";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatbotDocumentsManager from "../components/ChatbotDocumentManager";
import {
  Pencil,
  Trash,
  Database,
  Plus,
  Table,
  LayoutGrid,
  FileText,
  Search,
  MessageSquareText,
  Filter,
  SortDesc,
  MoreVertical,
  Eye,
  Settings,
  Calendar,
  Users,
  Activity,
} from "lucide-react";
import Modal from "../ui/Modal";
import ChatbotPostgresqlManager from "../components/ChatbotPostgresqlManager";

export default function ChatbotManager() {
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedForDocs, setSelectedForDocs] = useState(null);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedChatbotId, setSelectedChatbotId] = useState(null);
  const [viewMode, setViewMode] = useState("cards");
  const [pgsqlModalOpen, setPgsqlModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const getUserAndChatbots = async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }
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
      setLoading(false);
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
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from("chatbots").delete().eq("id", id);
      if (!error) {
        setChatbots((prev) => prev.filter((cb) => cb.id !== id));
        setFiltered((prev) => prev.filter((cb) => cb.id !== id));
        Swal.fire({
          title: "Supprimé",
          text: "Le chatbot a été supprimé.",
          icon: "success",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "rounded-xl",
          },
        });
      }
    }
  };

  const ActionButton = ({ onClick, className, children, tooltip }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95 ${className}`}
      title={tooltip}
    >
      {children}
    </button>
  );

  const DropdownMenu = ({ chatbot, onClose }) => (
    <div className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200">
      <button
        onClick={() => {
          navigate(`/chat/${chatbot.id}`);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <MessageSquareText className="w-4 h-4 text-green-500" />
        Ouvrir le chat
      </button>

      <button
        onClick={() => {
          setSelectedChatbotId(chatbot.id);
          setDocumentModalOpen(true);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
      >
        <FileText className="w-4 h-4 text-blue-500" />
        Gérer les documents
      </button>

      <button
        onClick={() => {
          setSelectedChatbotId(chatbot.id);
          setPgsqlModalOpen(true);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
      >
        <Database className="w-4 h-4 text-yellow-500" />
        Base de données
      </button>

      <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

      <button
        onClick={() => {
          setEditing(chatbot);
          setModalOpen(true);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <Pencil className="w-4 h-4 text-indigo-500" />
        Modifier
      </button>

      <button
        onClick={() => {
          handleDelete(chatbot.id);
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <Trash className="w-4 h-4" />
        Supprimer
      </button>
    </div>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-gray-800 dark:text-gray-100 transition-all duration-500">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec statistiques */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mes Chatbots
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Gérez et configurez vos assistants intelligents
              </p>
            </div>

            {/* Statistiques rapides */}
            <div className="flex gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {chatbots.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Chatbots
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'outils améliorée */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Recherche améliorée */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                value={search}
                onChange={handleSearch}
                placeholder="Rechercher un chatbot..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Boutons de vue */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "cards"
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Cartes</span>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span className="hidden sm:inline">Tableau</span>
                </button>
              </div>

              {/* Bouton d'ajout */}
              <button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nouveau chatbot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 rounded-full animate-pulse"></div>
              <Loader2 className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Chargement de vos chatbots...
            </p>
          </div>
        ) : viewMode === "table" ? (
          // Vue tableau améliorée
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-indigo-900/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Chatbot
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Créé le
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((cb, index) => (
                    <tr
                      key={cb.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {cb.avatar ? (
                              <img
                                src={cb.avatar}
                                alt="avatar"
                                className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-gray-100 dark:ring-gray-700"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {cb.nom}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {" "}
                              ID: {cb.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {cb.description || "Aucune description"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(cb.created_at).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === cb.id ? null : cb.id
                              );
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {activeDropdown === cb.id && (
                            <DropdownMenu
                              chatbot={cb}
                              onClose={() => setActiveDropdown(null)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Aucun chatbot trouvé
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            {search
                              ? "Essayez un autre terme de recherche"
                              : "Créez votre premier chatbot"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Vue cartes améliorée
          <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((cb, index) => (
                <div
                  key={cb.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 dark:border-gray-700  transform hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Header de la carte */}
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        {cb.avatar ? (
                          <img
                            src={cb.avatar}
                            alt="avatar"
                            className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4 ring-gray-100 dark:ring-gray-700"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                          <Activity className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === cb.id ? null : cb.id
                            );
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 
  opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeDropdown === cb.id && (
                          <DropdownMenu
                            chatbot={cb}
                            onClose={() => setActiveDropdown(null)}
                          />
                        )}
                      </div>
                    </div>

                    <div
                      onClick={() => navigate(`/chat/${cb.id}`)}
                      className="cursor-pointer space-y-2"
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {cb.nom}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {cb.description || "Aucune description disponible"}
                      </p>
                    </div>
                  </div>

                  {/* Footer de la carte */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(cb.created_at).toLocaleDateString("fr-FR")}
                      </div>

                      {/* Actions rapides */}
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <ActionButton
                          onClick={() => navigate(`/chat/${cb.id}`)}
                          className="bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400"
                          tooltip="Ouvrir le chat"
                        >
                          <MessageSquareText className="w-4 h-4" />
                        </ActionButton>

                        <ActionButton
                          onClick={() => {
                            setSelectedChatbotId(cb.id);
                            setDocumentModalOpen(true);
                          }}
                          className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                          tooltip="Documents"
                        >
                          <FileText className="w-4 h-4" />
                        </ActionButton>

                        <ActionButton
                          onClick={() => {
                            setSelectedChatbotId(cb.id);
                            setPgsqlModalOpen(true);
                          }}
                          className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
                          tooltip="Base de données"
                        >
                          <Database className="w-4 h-4" />
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* État vide amélioré */}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto">
                    {search ? (
                      <Search className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Users className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {search ? "Aucun résultat" : "Aucun chatbot"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      {search
                        ? "Essayez un autre terme de recherche ou créez un nouveau chatbot"
                        : "Commencez par créer votre premier chatbot intelligent"}
                    </p>
                  </div>
                  {!search && (
                    <button
                      onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-3"
                    >
                      <Plus className="w-5 h-5" />
                      Créer mon premier chatbot
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
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

        <Modal open={pgsqlModalOpen} onClose={() => setPgsqlModalOpen(false)}>
          {selectedChatbotId && (
            <ChatbotPostgresqlManager chatbotId={selectedChatbotId} />
          )}
        </Modal>
      </div>
    </div>
  );
}
