import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, Trash2 } from "lucide-react";

export default function ChatbotSlotManager({ chatbotId }) {
  const [slots, setSlots] = useState([]);
  const [chatbotSlots, setChatbotSlots] = useState([]);
  const [newSlotName, setNewSlotName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setOwnerId(data.user.id);
    };
    fetchUser();
  }, []);

  const fetchChatbotSlots = async () => {
    if (!chatbotId || !ownerId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("chatbot_slot_associations")
      .select("*, slots(*)")
      .eq("chatbot_id", chatbotId)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (!error) setChatbotSlots(data);
    setLoading(false);
  };

  const fetchAllSlots = async () => {
    if (!ownerId) return;
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("owner_id", ownerId);

    if (!error && data) {
      setSlots(data);
    }
  };

  useEffect(() => {
    if (ownerId) {
      fetchAllSlots();
      fetchChatbotSlots();
    }
  }, [ownerId, chatbotId]);

  const handleAddSlot = async () => {
    const slotName = newSlotName.trim();
    const desc = description.trim();
    if (!slotName || !desc || !ownerId || !chatbotId) return;

    const slot = slots.find(s => s.slot_name === slotName);
    if (!slot) return;

    const { error } = await supabase.from("chatbot_slot_associations").insert({
      chatbot_id: chatbotId,
      slot_id: slot.id,
      description: desc,
      owner_id: ownerId,
    });

    if (!error) {
      setNewSlotName("");
      setDescription("");
      fetchChatbotSlots();
    }
  };

  const handleDeleteSlot = async (id) => {
    await supabase.from("chatbot_slot_associations").delete().eq("id", id);
    fetchChatbotSlots();
  };

  const filteredSlots = newSlotName
    ? slots.filter((slot) =>
        slot.slot_name?.toLowerCase().includes(newSlotName.toLowerCase())
      )
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
        Slots associés à ce chatbot
      </h2>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Nom du slot..."
          value={newSlotName}
          onChange={(e) => {
            setNewSlotName(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
        />
        {showSuggestions && filteredSlots.length > 0 && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
            {filteredSlots.map((slot, i) => (
              <li
                key={i}
                onClick={() => {
                  setNewSlotName(slot.slot_name);
                  setShowSuggestions(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-600"
              >
                {slot.slot_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {newSlotName && (
        <div className="mb-4">
          <textarea
            placeholder="Décrire l'usage de ce slot pour le chatbot..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
      )}

      <button
        onClick={handleAddSlot}
        disabled={!newSlotName.trim() || !description.trim()}
        className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 ${
          newSlotName.trim() && description.trim()
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Plus className="w-4 h-4" />
        Associer
      </button>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Chargement…
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-4">
          {chatbotSlots.map((association) => (
            <li
              key={association.id}
              className="flex justify-between items-center py-3 text-sm text-gray-800 dark:text-gray-200"
            >
              <span>
                <strong>{association.slots?.slot_name}</strong>
                <br />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {association.description}
                </span>
              </span>
              <button
                onClick={() => handleDeleteSlot(association.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {chatbotSlots.length === 0 && (
            <li className="py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Aucun slot associé.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
