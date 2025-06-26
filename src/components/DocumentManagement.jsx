import { useState } from "react";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import { FileText, Search, UploadCloud, Clock } from "lucide-react";

const API_URL = import.meta.env.VITE_TUNE_API_URL;

function DocumentManager() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await axios.get(`${API_URL}/search-docs?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResults(res.data);
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      await axios.post(`${API_URL}/upload-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Fichier indexé !");
    } catch (err) {
      alert("❌ Échec de l’upload.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

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
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
      </div>
    </div>
  );
}

export default DocumentManager;
