import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Trash2, Edit, Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function PgsqlVariableManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const connexion = location.state?.connexion;

  const [variables, setVariables] = useState([]);
  const [variableName, setVariableName] = useState("");
  const [requestSQL, setRequestSQL] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUserAndVariables = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setOwnerId(user.id);
        const { data, error } = await supabase
          .from("variables")
          .select("*")
          .eq("owner_id", user.id)
          .eq("connexion_name", `${connexion.database}`);
        if (!error) setVariables(data);
      }
    };
    if (connexion) fetchUserAndVariables();
  }, [connexion]);

  const resetForm = () => {
    setVariableName("");
    setRequestSQL("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!connexion || !ownerId) {
      setErrorMsg("Connexion ou utilisateur introuvable.");
      setLoading(false);
      return;
    }

    const payload = {
      connexion_name: `${connexion.database}`,
      owner_id: ownerId,
      variable_name: variableName,
      request: requestSQL,
    };

    const { error } = editingId
      ? await supabase.from("variables").update(payload).eq("id", editingId)
      : await supabase.from("variables").insert(payload);

    if (error) {
      setErrorMsg("Erreur : " + error.message);
    } else {
      Swal.fire({
        icon: "success",
        title: "Succès",
        text: `Requête ${editingId ? "mise à jour" : "créée"} avec succès.`,
        background: "#f0fdf4",
        color: "#166534",
      });
      window.location.reload();
    }

    setLoading(false);
    resetForm();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Confirmation",
      text: "Supprimer cette requête ?",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: "#fef2f2",
      color: "#991b1b",
    });

    if (!result.isConfirmed) return;

    await supabase.from("variables").delete().eq("id", id);
    setVariables((prev) => prev.filter((v) => v.id !== id));

    Swal.fire({
      icon: "success",
      title: "Supprimé",
      text: "La requête a été supprimée avec succès.",
      background: "#f0fdf4",
      color: "#166534",
    });
  };

  const handleEdit = (v) => {
    setVariableName(v.variable_name);
    setRequestSQL(v.request);
    setEditingId(v.id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg w-full max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="text-sm mb-4 text-indigo-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <h1 className="text-2xl font-bold mb-6">Gérer les requêtes</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom de la requête
            </label>
            <input
              type="text"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Requête SQL
            </label>
            <textarea
              rows="4"
              value={requestSQL}
              onChange={(e) => setRequestSQL(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
              required
            />
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md w-full"
          >
            {loading
              ? "Enregistrement..."
              : editingId
              ? "Mettre à jour"
              : "Créer"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-3">Requêtes existantes</h2>
        <div className="space-y-2">
          {variables.length === 0 && (
            <p className="text-gray-400">Aucune requête trouvée.</p>
          )}
          {variables.map((v) => (
            <div
              key={v.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{v.variable_name}</p>
                <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {v.request}
                </pre>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(v)} title="Modifier">
                  <Edit className="w-5 h-5 text-yellow-500" />
                </button>
                <button onClick={() => handleDelete(v.id)} title="Supprimer">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
