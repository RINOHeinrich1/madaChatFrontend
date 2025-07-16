import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Trash, Plus, Search, Table, LayoutGrid } from "lucide-react";
import axios from "axios";
import PgsqlTemplateManager from "../components/PgsqlTemplateManager";
export default function PgsqlConnexionManager() {
  const navigate = useNavigate();
  const [connexions, setConnexions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [serviceUrl, setServiceUrl] = useState(
    "https://postgresvectorizer.onirtech.com"
  );

  // --- STATES POUR LE MODAL DE TEMPLATE ---
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedConnexion, setSelectedConnexion] = useState(null);
  const [variables, setVariables] = useState([]);
  const [template, setTemplate] = useState("");
  const [description, setDescription] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchConnexions = async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("postgresql_connexions")
      .select("*")
      .eq("owner_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setConnexions(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConnexions();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearch(term);
    setFiltered(
      connexions.filter(
        (item) =>
          item.host_name.toLowerCase().includes(term) ||
          item.database.toLowerCase().includes(term) ||
          item.table_name.toLowerCase().includes(term)
      )
    );
  };

  // Fonction pour récupérer les variables liées à une connexion
  const fetchVariables = async (connexionName) => {
    const { data, error } = await supabase
      .from("variables")
      .select("*")
      .eq("connexion_name", connexionName);

    if (!error) {
      setVariables(data);
    } else {
      setVariables([]);
      alert("Erreur lors du chargement des variables : " + error.message);
    }
  };

  // Ouvre le modal template, charge variables
  const openTemplateModal = async (item) => {
    setSelectedConnexion(item);
    await fetchVariables(item.table_name);
    setTemplate(""); // reset template
    setDescription("");
    setIsTemplateModalOpen(true);
  };

  // Enregistre le template dans Supabase
  const handleSaveTemplate = async () => {
    if (!selectedConnexion) return;
    setSavingTemplate(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Utilisateur non connecté.");
      setSavingTemplate(false);
      return;
    }

    const { error } = await supabase.from("templates").insert({
      owner_id: user.id,
      connexion_name: selectedConnexion.table_name,
      template,
      description,
    });

    if (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } else {
      alert("Template enregistré avec succès !");
      setIsTemplateModalOpen(false);
    }
    setSavingTemplate(false);
  };

  const handleDelete = async (item) => {
    const confirm = window.confirm(
      `Supprimer la table vectorisée "${item.table_name}" sur ${item.database}@${item.host_name} ?`
    );
    if (!confirm) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    try {
      await axios.post(
        `${serviceUrl}/deletevectorizeddata`,
        {
          source: `${item.database}/${item.table_name}`,
          conn_id: item.id.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      await supabase.from("postgresql_connexions").delete().eq("id", item.id);

      setConnexions((prev) => prev.filter((c) => c.id !== item.id));
      setFiltered((prev) => prev.filter((c) => c.id !== item.id));
      alert("Connexion supprimée avec succès.");
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        {/* --- Barre de recherche + vues --- */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-xl shadow-sm w-full max-w-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Rechercher..."
              className="w-full bg-transparent outline-none text-gray-800 dark:text-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row lg:items-center gap-2 w-full lg:w-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-xl text-sm shadow flex items-center justify-center ${
                  viewMode === "table"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 dark:text-white"
                }`}
              >
                <Table className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-xl text-sm shadow flex items-center justify-center ${
                  viewMode === "cards"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 dark:text-white"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => navigate("/pgsql-create")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 text-white font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nouvelle connexion</span>
            </button>
          </div>
        </div>

        {/* --- Table ou cartes --- */}
        {viewMode === "table" ? (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <table className="min-w-full table-auto text-sm text-left text-gray-700 dark:text-gray-200">
              <thead className="bg-indigo-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Hôte</th>
                  <th className="px-6 py-3">Port</th>
                  <th className="px-6 py-3">Base</th>
                  <th className="px-6 py-3">Table</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4">{item.host_name}</td>
                    <td className="px-6 py-4">{item.port}</td>
                    <td className="px-6 py-4">{item.database}</td>
                    <td className="px-6 py-4">{item.table_name}</td>
                    <td className="px-6 py-4">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() =>
                            navigate("/pgsql-variable-form", {
                              state: { connexion: item },
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Ajouter variable"
                        >
                          ➕
                        </button>

                        <button
                          onClick={() => navigate("/template-manager", {
                              state: { connexion: item },
                            })}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Template customiser"
                        >
                          📄
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-400">
                      Aucune connexion trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3 transition hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {item.database}@{item.host_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Table : <strong>{item.table_name}</strong>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    onClick={() =>
                      navigate("/pgsql-variable-form", {
                        state: { connexion: item },
                      })
                    }
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Ajouter variable"
                  >
                    ➕
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Supprimer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center col-span-full text-gray-500 dark:text-gray-300">
                Aucune connexion trouvée.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
