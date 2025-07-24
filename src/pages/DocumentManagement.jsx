import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import {
  FileText,
  Search,
  UploadCloud,
  Clock,
  Trash2,
  Download,
} from "lucide-react";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_TUNE_API_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
function DocumentManager() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
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
        title: "Échec de l’upload",
        text: err.message || "Une erreur est survenue",
      });
      console.error(err);
    } finally {
      setUploading(false);
      fetchDocuments();
      e.target.value = null; // Reset input file
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
      fetchDocuments(); // recharge la liste
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
        .createSignedUrl(filePath, 60); // 60 secondes de validité

      if (error || !data?.signedUrl) throw error;

      window.open(data.signedUrl, "_blank"); // Ouvre dans un nouvel onglet
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
        {/* Titre */}
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Recherche documentaire
        </h1>

        {/* Zone de recherche */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Entrez votre requête..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition shadow flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Rechercher
          </button>
        </div>

        {/* Upload fichier */}
        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <UploadCloud className="w-6 h-6" />
            Uploader un fichier :
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic flex items-center gap-2 animate-pulse">
              <Clock className="w-5 h-5" />
              Indexation en cours...
            </p>
          )}
        </div>

        {/* Résultats */}
        <div className="space-y-4">
          {results.map((r, i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600"
            >
              <p className="text-sm">{r.text}</p>
              <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                Score : {r.score.toFixed(3)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
            Liste des documents indexés
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Date d'ajout</th>
                  <th className="px-6 py-3">Propriétaire</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingDocs ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">
                      <div className="flex justify-center items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Loader2 className="animate-spin w-6 h-6" />
                        <span className="text-sm">
                          Chargement des documents...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : documents.length > 0 ? (
                  documents.map((doc, idx) => (
                    <tr
                      key={idx}
                      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-6 py-4">{doc.name || "N/A"}</td>
                      <td className="px-6 py-4">
                        {new Date(doc.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{doc.owner_id}</td>
                      <td className="px-6 py-4 flex gap-3 items-center justify-end">
                        <button
                          onClick={() => handleDownload(doc.url)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Télécharger"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center italic">
                      Aucun document trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentManager;
