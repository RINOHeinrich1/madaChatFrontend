import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  ArrowLeft,
  Trash2,
  Edit,
  Info,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

const eventTypes = ["Au remplissement", "Vide", "Pas encore rempli"];

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
  const [webActions, setWebActions] = useState([]);
  const [slotEvents, setSlotEvents] = useState([]);
  const [showEventsSection, setShowEventsSection] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event: "Au remplissement",
    action_id: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setOwnerId(user.id);

      const { data: slotsData } = await supabase
        .from("slots")
        .select("*")
        .eq("owner_id", user.id);
      setSlots(slotsData || []);

      const { data: actionsData } = await supabase
        .from("web_actions")
        .select("*")
        .eq("owner_id", user.id);
      setWebActions(actionsData || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editingId) fetchSlotEvents(editingId);
  }, [editingId]);

  const fetchSlotEvents = async (slotId) => {
    const { data, error } = await supabase
      .from("slot_events")
      .select("*, web_actions(name)")
      .eq("slot_id", slotId)
      .eq("owner_id", ownerId);
    if (!error) {
      setSlotEvents(data || []);
    } else {
      console.error("Error fetching slot events:", error);
    }
  };

  const resetForm = () => {
    setSlotName("");
    setColumns([{ name: "", type: "text" }]);
    setEditingId(null);
    setSlotEvents([]);
    setNewEvent({
      event: "Au remplissement",
      action_id: null,
    });
    setShowEventsSection(false);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const addColumn = () => {
    setColumns([...columns, { name: "", type: "text" }]);
  };

  const removeColumn = (index) => {
    if (columns.length <= 1) return;
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  const addEvent = () => {
    if (!newEvent.action_id) {
      setErrorMsg("Veuillez sélectionner une action pour l'événement");
      return;
    }

    setSlotEvents([
      ...slotEvents,
      {
        ...newEvent,
        id: Date.now().toString(), // Temporary ID for UI
        web_actions: webActions.find((a) => a.id === newEvent.action_id),
      },
    ]);

    setNewEvent({
      event: "Au remplissement",
      action_id: null,
    });
    setErrorMsg("");
  };

  const removeEvent = (index) => {
    const newEvents = [...slotEvents];
    newEvents.splice(index, 1);
    setSlotEvents(newEvents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Validate columns
    const columnObject = {};
    for (let col of columns) {
      if (!col.name || !col.type) {
        setErrorMsg("Tous les champs de colonne doivent être remplis.");
        setLoading(false);
        return;
      }
      columnObject[col.name] = col.type;
    }

    try {
      // 1. Save or update the slot
      const { data: slotData, error: slotError } = editingId
        ? await supabase
            .from("slots")
            .update({
              slot_name: slotName,
              columns: columnObject,
            })
            .eq("id", editingId)
        : await supabase
            .from("slots")
            .insert({
              slot_name: slotName,
              owner_id: ownerId,
              columns: columnObject,
            })
            .select()
            .single();

      if (slotError) throw slotError;

      const slotId = editingId || slotData.id;

      // 2. Handle slot events
      if (slotEvents.length > 0) {
        // Prepare events data for supabase
        const eventsToSave = slotEvents.map((event) => ({
          slot_id: slotId,
          event: event.event,
          action_id: event.action_id,
          owner_id: ownerId,
        }));

        // Delete existing events if editing
        if (editingId) {
          const { error: deleteError } = await supabase
            .from("slot_events")
            .delete()
            .eq("slot_id", editingId)
            .eq("owner_id", ownerId);

          if (deleteError) throw deleteError;
        }

        // Insert new events
        const { error: insertError } = await supabase
          .from("slot_events")
          .insert(eventsToSave);

        if (insertError) throw insertError;
      } else if (editingId) {
        // If no events but editing, delete all existing events
        const { error: deleteError } = await supabase
          .from("slot_events")
          .delete()
          .eq("slot_id", editingId)
          .eq("owner_id", ownerId);

        if (deleteError) throw deleteError;
      }

      // 3. Refresh data
      const { data: updatedSlots } = await supabase
        .from("slots")
        .select("*")
        .eq("owner_id", ownerId);
      setSlots(updatedSlots || []);

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: `Slot ${editingId ? "mis à jour" : "créé"} avec succès.`,
        background: "#f0fdf4",
        color: "#166534",
      });

      resetForm();
    } catch (error) {
      console.error("Error saving slot:", error);
      setErrorMsg(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Confirmation",
      text: "Supprimer ce slot et tous ses événements associés ?",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      background: "#fef2f2",
      color: "#991b1b",
    });

    if (!result.isConfirmed) return;

    try {
      // Delete associated events first
      const { error: eventsError } = await supabase
        .from("slot_events")
        .delete()
        .eq("slot_id", id)
        .eq("owner_id", ownerId);

      if (eventsError) throw eventsError;

      // Then delete the slot
      const { error: slotError } = await supabase
        .from("slots")
        .delete()
        .eq("id", id)
        .eq("owner_id", ownerId);

      if (slotError) throw slotError;

      setSlots((prev) => prev.filter((s) => s.id !== id));

      Swal.fire({
        icon: "success",
        title: "Supprimé",
        text: "Le slot a été supprimé avec succès.",
        background: "#f0fdf4",
        color: "#166534",
      });
    } catch (error) {
      console.error("Error deleting slot:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la suppression.",
      });
    }
  };

  const handleEdit = async (slot) => {
    setSlotName(slot.slot_name);
    setEditingId(slot.id);

    // Convert columns object to array format
    const columnsArray = Object.entries(slot.columns).map(([name, type]) => ({
      name,
      type,
    }));
    setColumns(columnsArray);

    // Show events section when editing
    setShowEventsSection(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Gestion des Slots</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              title="Informations"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 text-sm">
            <p className="mb-2">
              Les slots représentent des structures dynamiques utilisées pour le
              slot filling. Chaque slot peut contenir plusieurs colonnes de
              différents types.
            </p>
            <p>
              Vous pouvez associer des événements à des actions web qui seront
              déclenchées lorsque ces événements se produisent (remplissage,
              expiration, etc.).
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Modifier le Slot" : "Créer un Nouveau Slot"}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nom du Slot
                </label>
                <input
                  type="text"
                  value={slotName}
                  onChange={(e) => setSlotName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="ex: Rendez-vous médical"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Colonnes
                  </label>
                  <button
                    type="button"
                    onClick={addColumn}
                    className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>

                <div className="space-y-3">
                  {columns.map((col, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Nom de la colonne"
                        value={col.name}
                        onChange={(e) =>
                          handleColumnChange(index, "name", e.target.value)
                        }
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                      <select
                        value={col.type}
                        onChange={(e) =>
                          handleColumnChange(index, "type", e.target.value)
                        }
                        className="w-40 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        {slotDataTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {columns.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(index)}
                          className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Aperçu de la Structure
                </label>
                <pre className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm overflow-x-auto">
                  {JSON.stringify(
                    Object.fromEntries(
                      columns.map((c) => [c.name || "nom_colonne", c.type])
                    ),
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventsSection(!showEventsSection)}
                  className="flex items-center justify-between w-full text-left py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="font-medium">Événements associés</span>
                  {showEventsSection ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {showEventsSection && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Type d'événement
                        </label>
                        <select
                          value={newEvent.event}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, event: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                          {eventTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Action Web
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={newEvent.action_id || ""}
                            onChange={(e) =>
                              setNewEvent({
                                ...newEvent,
                                action_id: e.target.value || null,
                              })
                            }
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          >
                            <option value="">
                              -- Sélectionner une action --
                            </option>
                            {webActions.map((action) => (
                              <option key={action.id} value={action.id}>
                                {action.name || `Action ${action.id}`}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={addEvent}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {slotEvents.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Événements configurés
                        </h3>
                        <div className="space-y-2">
                          {slotEvents.map((event, index) => (
                            <div
                              key={index}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium">{event.event}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Action:{" "}
                                  {event.web_actions?.name || event.action_id}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeEvent(index)}
                                className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : editingId ? (
                    "Mettre à jour"
                  ) : (
                    "Créer le Slot"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Slots Existants</h2>

            {slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucun slot n'a été créé pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">
                          {slot.slot_name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {Object.keys(slot.columns).length} colonne(s)
                          définie(s)
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEdit(slot)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Voir les détails
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(slot)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
