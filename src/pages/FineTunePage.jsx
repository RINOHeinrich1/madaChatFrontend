import React, { useState } from "react";
import axios from "axios";
import { supabase } from "../lib/supabaseClient";
import {
  GraduationCap,
  Rocket,
  Search,
  BookOpen,
  Brain,
  XCircle,
  Clipboard,
  CheckCircle,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const API_URL = import.meta.env.VITE_TUNE_API_URL;

export default function FineTunePage() {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [allDocs, setAllDocs] = useState([]);
  const [selectedAllDocs, setSelectedAllDocs] = useState([]);

  const askQuestion = async () => {
    Swal.fire({ title: "Recherche...", didOpen: () => Swal.showLoading() });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await axios.post(
        `${API_URL}/ask`,
        { question, top_k: 3 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(res.data.results);
      setSelected([]);
      setShowAllDocs(false);
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Résultats reçus",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Erreur lors de la requête",
        text: err.message || "Une erreur est survenue",
      });
    }
  };

  const fetchAllDocs = async () => {
    Swal.fire({
      title: "Chargement des documents...",
      didOpen: () => Swal.showLoading(),
    });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await axios.get(`${API_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllDocs(res.data.documents);
      setSelectedAllDocs([]);
      setShowAllDocs(true);
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Erreur lors de la récupération des documents",
        text: err.message || "Une erreur est survenue",
      });
    }
  };

  const submitFeedback = async (useAllDocs = false) => {
    const positives = useAllDocs
      ? selectedAllDocs.map((i) => ({
          text: allDocs[i].text,
          source: allDocs[i].source,
        }))
      : selected.map((i) => ({
          text: results[i].doc,
          source: results[i].source,
        }));

    const negatives = useAllDocs
      ? allDocs
          .filter((_, i) => !selectedAllDocs.includes(i))
          .map((d) => ({
            text: d.text,
            source: d.source,
          }))
      : results
          .filter((_, i) => !selected.includes(i))
          .map((r) => ({
            text: r.doc,
            source: r.source,
          }));

    Swal.fire({
      title: "Envoi du feedback...",
      didOpen: () => Swal.showLoading(),
    });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";
      const res = await axios.post(
        `${API_URL}/feedback`,
        {
          question,
          positive_docs: positives,
          negative_docs: negatives,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowAllDocs(false);
      Swal.close();
      Swal.fire({
        icon: "success",
        title: res.data.message || "Feedback envoyé !",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Erreur lors de l’envoi du feedback",
        text: err.message || "Une erreur est survenue",
      });
    }
  };

  const deployModel = async () => {
    Swal.fire({
      title: "Déploiement du modèle en cours...",
      didOpen: () => Swal.showLoading(),
    });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";
      const res = await axios.post(
        `${API_URL}/deploy`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.close();
      Swal.fire({
        icon: "success",
        title: res.data.message || "Modèle déployé avec succès !",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Erreur lors du déploiement du modèle",
        text: err.message || "Une erreur est survenue",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-10 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            Fine-tunning du model d'embedding
          </h1>
          <button
            onClick={deployModel}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Déployer le modèle
          </button>
        </div>

        {/* Input question */}
        <div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Pose une question..."
            className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          onClick={askQuestion}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl shadow transition flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Chercher
        </button>

        {/* Résultats */}
        {results.length > 0 && !showAllDocs && (
          <div>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Résultats proposés
            </h2>
            <div className="space-y-4">
              {results.map((r, i) => (
                <label
                  key={i}
                  className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(i)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(i)
                          ? prev.filter((x) => x !== i)
                          : [...prev, i]
                      )
                    }
                    className="mt-1"
                  />
                  <div>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      Score : {r.score.toFixed(4)}
                    </p>
                    <p className="text-sm">{r.doc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => submitFeedback(false)}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition flex items-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Envoyer le feedback
              </button>
              <button
                onClick={fetchAllDocs}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg transition flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Aucun document n’est correct
              </button>
            </div>
          </div>
        )}

        {/* Tous les documents */}
        {showAllDocs && (
          <div>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <Clipboard className="w-6 h-6" />
              Tous les documents
            </h2>
            <div className="space-y-4">
              {allDocs.map((doc, i) => (
                <label
                  key={i}
                  className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedAllDocs.includes(i)}
                    onChange={() =>
                      setSelectedAllDocs((prev) =>
                        prev.includes(i)
                          ? prev.filter((x) => x !== i)
                          : [...prev, i]
                      )
                    }
                    className="mt-1"
                  />
                  <span className="text-sm">{doc}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => submitFeedback(true)}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg transition flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Envoyer les bons documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
