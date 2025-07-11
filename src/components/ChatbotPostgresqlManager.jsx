import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, Trash2 } from "lucide-react";

export default function ChatbotPostgresqlManager({ chatbotId }) {
  const [connexions, setConnexions] = useState([]);
  const [allConnexions, setAllConnexions] = useState([]);
  const [newConnName, setNewConnName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sqlReasoning, setSqlReasoning] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setOwnerId(data.user.id);
    };
    fetchUser();
  }, []);

  const fetchConnexions = async () => {
    if (!chatbotId || !ownerId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("chatbot_pgsql_connexions")
      .select("*")
      .eq("chatbot_id", chatbotId)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (!error) setConnexions(data);
    setLoading(false);
  };

  const fetchAllConnexions = async () => {
    if (!ownerId) return;
    const { data, error } = await supabase
      .from("postgresql_connexions")
      .select("database, table_name")
      .eq("owner_id", ownerId);

    if (!error && data) {
      const formatted = data.map(
        (conn) => `${conn.database}/${conn.table_name}`
      );
      setAllConnexions(formatted);
    }
  };

  useEffect(() => {
    if (ownerId) {
      fetchConnexions();
      fetchAllConnexions();
    }
  }, [ownerId, chatbotId]);

  const handleAdd = async () => {
    const connName = newConnName.trim();
    const desc = description.trim();
    if (!connName || !desc || !ownerId || !chatbotId) return;

    const { error } = await supabase.from("chatbot_pgsql_connexions").insert({
      chatbot_id: chatbotId,
      connexion_name: connName,
      description: desc,
      owner_id: ownerId,
      sql_reasoning:sqlReasoning,
    });

    if (!error) {
      setNewConnName("");
      setDescription("");
      fetchConnexions();
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("chatbot_pgsql_connexions").delete().eq("id", id);
    fetchConnexions();
  };

  const filteredSuggestions = newConnName
    ? allConnexions.filter((name) =>
        name.toLowerCase().includes(newConnName.toLowerCase())
      )
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
        Connexions PostgreSQL liées à ce chatbot
      </h2>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Nom de la connexion (ex: db/table)..."
          value={newConnName}
          onChange={(e) => {
            setNewConnName(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
            {filteredSuggestions.map((suggestion, i) => (
              <li
                key={i}
                onClick={() => {
                  setNewConnName(suggestion);
                  setShowSuggestions(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-600"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Description obligatoire seulement si une connexion est sélectionnée */}
      {newConnName && (
        <div>
          <div className="mb-4">
            <textarea
              placeholder="Décrire l'usage de cette connexion pour le chatbot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sqlReasoning}
                onChange={(e) => setSqlReasoning(e.target.checked)}
                className="form-checkbox h-5 w-5 text-indigo-600 transition"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Activer le raisonnement SQL
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Bouton Associer désactivé si champs vides */}
      <button
        onClick={handleAdd}
        disabled={!newConnName.trim() || !description.trim()}
        className={`mt-2 px-4 py-2 rounded-lg flex items-center gap-2 ${
          newConnName.trim() && description.trim()
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
          {connexions.map((conn) => (
            <li
              key={conn.id}
              className="flex justify-between items-center py-3 text-sm text-gray-800 dark:text-gray-200"
            >
              <span>
                <strong>{conn.connexion_name}</strong>
                <br />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {conn.description}
                </span>
              </span>
              <button
                onClick={() => handleDelete(conn.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {connexions.length === 0 && (
            <li className="py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Aucune connexion associée.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
