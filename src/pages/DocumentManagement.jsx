import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import {
  FileText,
  Info,
  Search,
  UploadCloud,
  Clock,
  Trash2,
  Download,
  Files,
  SearchIcon,
  Plus,
  Link,
} from "lucide-react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import ChatBotLinkDocument, { LinkedChatbots } from "../components/ChatBotLinkDocument";


const API_URL = import.meta.env.VITE_TUNE_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function DocumentManager() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [documentFilter, setDocumentFilter] = useState("");
  const [showDocumentsInfo, setShowDocumentsInfo] = useState(false);
  const [noChunking, setNoChunking] = useState(false);
  const [openLinkModal,setOpenLinkModal]=useState(false);
  const [selectedDocumentId,setSelectedDocumentId]=useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    Swal.fire({
      title: "Recherche en cours...",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await axios.get(`${API_URL}/search-docs?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResults(res.data);
      Swal.close();
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Erreur lors de la recherche",
        text: err.message || "Une erreur est survenue",
      });
      console.error("Erreur lors de la recherche :", err);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des documents :", err);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de charger les documents.",
      });
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("no_chunking", noChunking);
    Swal.fire({
      title: "Indexation du fichier...",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      await axios.post(`${API_URL}/upload-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Fichier indexé avec succès !",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Échec de l'upload",
        text: err.message || "Une erreur est survenue",
      });
      console.error(err);
    } finally {
      setUploading(false);
      fetchDocuments();
      e.target.value = null;
    }
  };

  const handleDelete = async (filename) => {
    const confirm = await Swal.fire({
      title: "Confirmer la suppression",
      text: `Voulez-vous vraiment supprimer "${filename}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirm.isConfirmed) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      await axios.delete(`${API_URL}/delete-document`, {
        params: { filename },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire("Supprimé !", "Le document a été supprimé.", "success");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Erreur",
        err.message || "Impossible de supprimer le document",
        "error"
      );
    }
  };


  const handleLink = async (filename) => {
    const confirm = await Swal.fire({
      title: "Confirmer la liaison",
      text: `Voulez-vous vraiment supprimer "${filename}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirm.isConfirmed) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      await axios.delete(`${API_URL}/delete-document`, {
        params: { filename },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire("Supprimé !", "Le document a été supprimé.", "success");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Erreur",
        err.message || "Impossible de supprimer le document",
        "error"
      );
    }
  };

  const handleDownload = async (filePath) => {
    try {
      console.log("FILE PATH: ", filePath);
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 60);

      if (error || !data?.signedUrl) throw error;

      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("Erreur lors du téléchargement :", err);
      Swal.fire({
        icon: "error",
        title: "Téléchargement échoué",
        text: err.message || "Impossible de télécharger le fichier",
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filtrer les documents selon la recherche
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(documentFilter.toLowerCase()) ||
      doc.owner_id?.toLowerCase().includes(documentFilter.toLowerCase())
  );

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête principal */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            Gestionnaire de Documents
            <button
              onClick={() => setShowDocumentsInfo(!showDocumentsInfo)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              title="Aide"
            >
              <Info className="w-6 h-6" />
            </button>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Recherchez et gérez vos documents indexés
          </p>

          {showDocumentsInfo && (
            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-900 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700 max-w-2xl mx-auto">
              Cette interface vous permet de gérer des fichiers texte tels que
              les PDF, les documents Word (.docx) ou OpenDocument (.odt), que
              vous pouvez utiliser pour enrichir les connaissances de votre
              chatbot.{" "}
            </div>
          )}
        </div>

        {/* Système d'onglets */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <TabButton
            id="search"
            icon={SearchIcon}
            label="Recherche"
            isActive={activeTab === "search"}
            onClick={() => setActiveTab("search")}
          />
          <TabButton
            id="documents"
            icon={Files}
            label="Mes Documents"
            isActive={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
          />
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {activeTab === "search" && (
            <div className="p-8 space-y-8">
              {/* Zone de recherche */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Recherche documentaire
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trouvez rapidement l'information dans vos documents
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Entrez votre requête de recherche..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full px-6 py-4 pr-24 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200 text-lg"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={!query.trim()}
                      className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium disabled:cursor-not-allowed"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Résultats de recherche */}
              {results.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Résultats de recherche ({results.length})
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl border border-indigo-100 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                      >
                        <p className="text-gray-800 dark:text-gray-100 leading-relaxed mb-3">
                          {r.text}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                            Score: {r.score.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Aucun résultat trouvé pour votre recherche
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="p-8 space-y-8">
              {/* En-tête avec bouton d'ajout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                    Gestion des documents
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ajoutez et gérez vos documents indexés
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un document
                </button>
              </div>

              {/* Champ de recherche pour les documents */}
              <div className="max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les documents..."
                    value={documentFilter}
                    onChange={(e) => setDocumentFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                  />
                  {documentFilter && (
                    <button
                      onClick={() => setDocumentFilter("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Files className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {filteredDocuments.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {documentFilter
                          ? "Documents trouvés"
                          : "Documents indexés"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {documentFilter
                      ? `Résultats de recherche (${filteredDocuments.length})`
                      : "Documents indexés"}
                  </h3>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Nom du document
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Date d'ajout
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                           Chatbot liés
                          </th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {loadingDocs ? (
                          <tr>
                            <td colSpan="4" className="text-center py-12">
                              <div className="flex flex-col items-center gap-4">
                                <Loader2 className="animate-spin w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  Chargement des documents...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredDocuments.length > 0 ? (
                          filteredDocuments.map((doc, idx) => (
                            <tr
                              key={idx}
                              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {doc.name || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                {new Date(doc.created_at).toLocaleDateString(
                                  "fr-FR",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                <LinkedChatbots documentName={doc.name} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {setSelectedDocumentId(doc.name);setOpenLinkModal(true)}}
                                    className="p-2 text-green-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                                    title="lier"
                                  >
                                    <Link className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(doc.url)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150"
                                    title="Télécharger"
                                  >
                                    <Download className="w-5 h-5" />

                                  </button>
                                  <button
                                    onClick={() => handleDelete(doc.name)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-12">
                              <div className="flex flex-col items-center gap-4">
                                <Files className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                    {documentFilter
                                      ? "Aucun document trouvé"
                                      : "Aucun document indexé"}
                                  </p>
                                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                    {documentFilter
                                      ? "Essayez avec d'autres termes de recherche"
                                      : "Commencez par ajouter votre premier document"}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALE D'UPLOAD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-200 dark:border-gray-700 transform transition-all duration-200 scale-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ajouter un document
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sélectionnez un fichier à indexer
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors duration-200">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                />
              </div>
              {/* Dans la modale d'upload (après le input file) */}
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="no-chunking"
                  checked={noChunking}
                  onChange={(e) => setNoChunking(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="no-chunking"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Ne pas découper le document (traitement complet)
                </label>
              </div>
              {uploading && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="font-medium">Indexation en cours...</span>
                  </div>
                  <div className="mt-2 w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
       <Modal
          open={openLinkModal}
          onClose={() => setOpenLinkModal(false)}
        >
          {selectedDocumentId && (
            <ChatBotLinkDocument documentName={selectedDocumentId} 
              onClose={() => setOpenLinkModal(false)}
            />
          )}
        </Modal>
    </div>
  );
}

export default DocumentManager;
