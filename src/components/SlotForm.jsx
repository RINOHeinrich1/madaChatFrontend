import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Trash2, Edit, Info, Plus, X } from "lucide-react";
import Swal from "sweetalert2";

const slotDataTypes = [
  "text",
  "number",
  "date",
  "boolean",
  "location",
  "time",
  "email",
  "url",
];

export default function SlotManager() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotName, setSlotName] = useState("");
  const [columns, setColumns] = useState([{ name: "", type: "text" }]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUserAndSlots = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setOwnerId(user.id);
        const { data, error } = await supabase
          .from("slots")
          .select("*")
          .eq("owner_id", user.id);
        if (!error) setSlots(data);
      }
    };
    fetchUserAndSlots();
  }, []);

  const resetForm = () => {
    setSlotName("");
    setColumns([{ name: "", type: "text" }]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const columnObject = {};
    for (let col of columns) {
      if (!col.name || !col.type) {
        setErrorMsg("Tous les champs doivent être remplis.");
        setLoading(false);
        return;
      }
      columnObject[col.name] = col.type;
    }

    const payload = {
      slot_name: slotName,
      owner_id: ownerId,
      columns: columnObject,
    };

    const { error } = editingId
      ? await supabase.from("slots").update(payload).eq("id", editingId)
      : await supabase.from("slots").insert(payload);

    if (error) {
      setErrorMsg("Erreur : " + error.message);
    } else {
      Swal.fire({
        icon: "success",
        title: "Succès",
        text: `Slot ${editingId ? "mis à jour" : "créé"} avec succès.`,
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
      text: "Supprimer ce slot ?",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: "#fef2f2",
      color: "#991b1b",
    });

    if (!result.isConfirmed) return;

    await supabase.from("slots").delete().eq("id", id);
    setSlots((prev) => prev.filter((s) => s.id !== id));

    Swal.fire({
      icon: "success",
      title: "Supprimé",
      text: "Le slot a été supprimé avec succès.",
      background: "#f0fdf4",
      color: "#166534",
    });
  };

  const handleEdit = (slot) => {
    setSlotName(slot.slot_name);
    const columnsArray = Object.entries(slot.columns || {}).map(([name, type]) => ({
      name,
      type,
    }));
    setColumns(columnsArray);
    setEditingId(slot.id);
  };

  const handleColumnChange = (index, key, value) => {
    const updated = [...columns];
    updated[index][key] = value;
    setColumns(updated);
  };

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "text" }]);
  };

  const removeColumn = (index) => {
    const updated = [...columns];
    updated.splice(index, 1);
    setColumns(updated);
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

        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold">Gérer les slots</h1>
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
            Les slots représentent des structures dynamiques utilisées pour le slot filling.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du slot
            </label>
            <input
              type="text"
              value={slotName}
              onChange={(e) => setSlotName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colonnes</label>
            {columns.map((col, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nom de la colonne"
                  value={col.name}
                  onChange={(e) => handleColumnChange(index, "name", e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
                />
                <select
                  value={col.type}
                  onChange={(e) => handleColumnChange(index, "type", e.target.value)}
                  className="w-40 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
                >
                  {slotDataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeColumn(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addColumn}
              className="flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="w-4 h-4" /> Ajouter une colonne
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Aperçu JSON</label>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
              {JSON.stringify(
                Object.fromEntries(columns.map((c) => [c.name || "champ", c.type])),
                null,
                2
              )}
            </pre>
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

        <h2 className="text-xl font-semibold mb-3">Slots existants</h2>
        <div className="space-y-2">
          {slots.length === 0 && (
            <p className="text-gray-400">Aucun slot trouvé.</p>
          )}
          {slots.map((s) => (
            <div
              key={s.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-start"
            >
              <div className="w-full">
                <p className="font-medium">{s.slot_name}</p>
                <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {JSON.stringify(s.columns, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => handleEdit(s)} title="Modifier">
                  <Edit className="w-5 h-5 text-yellow-500" />
                </button>
                <button onClick={() => handleDelete(s.id)} title="Supprimer">
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
