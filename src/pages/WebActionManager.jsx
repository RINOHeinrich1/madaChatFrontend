import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Trash2, Edit, Info } from "lucide-react";
import Swal from "sweetalert2";

const requestTypes = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function WebActionManager() {
  const [actions, setActions] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [requestType, setRequestType] = useState("GET");
  const [editingId, setEditingId] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setOwnerId(user.id);
      const { data, error } = await supabase
        .from("web_actions")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setActions(data);
    };

    fetchActions();
  }, []);

  const resetForm = () => {
    setName("");
    setUrl("");
    setRequestType("GET");
    setEditingId(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !url) {
      setErrorMsg("Le nom et l’URL sont requis.");
      setLoading(false);
      return;
    }

    const payload = {
      name,
      url,
      request_type: requestType,
      owner_id: ownerId,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from("web_actions")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("web_actions").insert(payload);
    }

    if (result.error) {
      setErrorMsg("Erreur : " + result.error.message);
    } else {
      Swal.fire({
        icon: "success",
        title: "Succès",
        text: editingId ? "Action mise à jour." : "Nouvelle action ajoutée.",
      });
      window.location.reload();
    }

    setLoading(false);
    resetForm();
  };

  const handleEdit = (action) => {
    setName(action.name || "");
    setUrl(action.url || "");
    setRequestType(action.request_type || "GET");
    setEditingId(action.id);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Supprimer ?",
      text: "Cette action sera supprimée définitivement.",
      showCancelButton: true,
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    await supabase.from("web_actions").delete().eq("id", id);
    setActions((prev) => prev.filter((a) => a.id !== id));

    Swal.fire({
      icon: "success",
      title: "Supprimé",
      text: "Action supprimée avec succès.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg w-full max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="text-sm mb-4 text-indigo-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold">Web Actions</h1>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-indigo-500 hover:text-indigo-700"
            title="À propos"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        {showInfo && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-900 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
            Une action Web représente une requête vers une URL, avec un type tel que GET ou POST.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Action API utilisateurs"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com/api"
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type de requête</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
            >
              {requestTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md w-full"
          >
            {loading ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-3">Actions existantes</h2>
        {actions.length === 0 && (
          <p className="text-gray-400">Aucune action enregistrée.</p>
        )}
        <div className="space-y-2">
          {actions.map((a) => (
            <div
              key={a.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{a.name || "(Sans nom)"}</p>
                <p className="text-sm text-gray-500">{a.url}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {a.request_type} - {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => handleEdit(a)} title="Modifier">
                  <Edit className="w-5 h-5 text-yellow-500" />
                </button>
                <button onClick={() => handleDelete(a.id)} title="Supprimer">
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
