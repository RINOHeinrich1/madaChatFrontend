import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, Trash2, Check } from "lucide-react";
import Swal from "sweetalert2";

export default function DocumentLinkChatbot({documentName, onClose }) {
  const [chatbots, setChatbots] = useState([]);
  const [allChatbots, setAllChatbots] = useState([]);
  const [selectedChatbots, setSelectedChatbots] = useState([]);
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setOwnerId(data.user.id);
    };
    fetchUser();
  }, []);

  const fetchChatbots = async () => {
    if (!documentName || !ownerId) return;
    setLoading(true);
    
    // Récupérer les chatbots déjà associés à ce document
    const { data: associatedChatbots, error } = await supabase
      .from("chatbot_document_association")
      .select("chatbot_id, description")
      .eq("document_name",documentName)
      .eq("owner_id", ownerId);

    if (!error) {
      setSelectedChatbots(associatedChatbots.map(c => c.chatbot_id));
      setDescription(associatedChatbots[0]?.description || "");
    }
    setLoading(false);
  };

  const fetchAllChatbots = async () => {
    if (!ownerId) return;
    const { data, error } = await supabase
      .from("chatbots")
      .select("id, nom")
      .eq("owner_id", ownerId);

    if (!error) setAllChatbots(data);
  };

  useEffect(() => {
    if (ownerId) {
      fetchChatbots();
      fetchAllChatbots();
    }
  }, [ownerId,documentName]);

  const handleToggleChatbot = (chatbotId) => {
    setSelectedChatbots(prev => 
      prev.includes(chatbotId)
        ? prev.filter(id => id !== chatbotId)
        : [...prev, chatbotId]
    );
  };

  const handleSave = async () => {
    if (!documentName || !ownerId) return;

    // Supprimer d'abord toutes les associations existantes pour ce document
    await supabase
      .from("chatbot_document_association")
      .delete()
      .eq("document_name",documentName)
      .eq("owner_id", ownerId);

    // Puis ajouter les nouvelles associations
    const insertPromises = selectedChatbots.map(chatbotId => 
      supabase
        .from("chatbot_document_association")
        .insert({
          chatbot_id: chatbotId,
          document_name:documentName,
          description: description,
          owner_id: ownerId,
        })
    );

    const results = await Promise.all(insertPromises);
    const hasError = results.some(result => result.error);

    if (!hasError) {
      setErrorMessage("");
      onClose?.(); // Fermer immédiatement le modal

  // Attendre un "tick" avant d’afficher le Swal
  setTimeout(async () => {
    await Swal.fire({
      icon: "success",
      title: "Chatbot lié avec succès 🎉",
      text: "Les modifications ont été enregistrées.",
      confirmButtonColor: "#6366f1",
    });
  }, 0);

    } else {
      setErrorMessage("Une erreur est survenue lors de la sauvegarde");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg relative">
      <h2 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400">
        Chatbots associés à ce document
      </h2>

      <div className="mb-4">
        <textarea
          placeholder="Décrire à quoi va servir ce document pour les chatbots sélectionnés..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Chargement…
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-4 max-h-64 overflow-y-auto">
          {allChatbots.map((chatbot) => (
            <li
              key={chatbot.id}
              className="flex justify-between items-center py-3 text-sm text-gray-800 dark:text-gray-200 px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <button
                  onClick={() => handleToggleChatbot(chatbot.id)}
                  className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                    selectedChatbots.includes(chatbot.id)
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 dark:border-gray-500"
                  }`}
                >
                  {selectedChatbots.includes(chatbot.id) && (
                    <Check className="w-3 h-3" />
                  )}
                </button>
                <span>{chatbot.nom}</span>
              </div>
            </li>
          ))}
          {allChatbots.length === 0 && (
            <li className="py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Aucun chatbot disponible.
            </li>
          )}
        </ul>
      )}

      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:bg-indigo-400"
        >
          Enregistrer
        </button>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
      )}
    </div>
  );
}


export function LinkedChatbots({ documentName }) {
    const [chatbots, setChatbots] = useState([]);
    const [ownerId, setOwnerId] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) setOwnerId(data.user.id);
      };
      fetchUser();
    }, []);
  
    const fetchLinkedChatbots = async () => {
      if (!documentName || !ownerId) return;
      setLoading(true);
  
      try {
        // Récupérer les associations
        const { data: associations, error: assocError } = await supabase
          .from("chatbot_document_association")
          .select("chatbot_id")
          .eq("document_name", documentName)
          .eq("owner_id", ownerId);
  
        if (assocError || !associations || associations.length === 0) {
          setChatbots([]);
          setLoading(false);
          return;
        }
  
        // Puis récupérer les infos des chatbots associés
        const ids = associations.map((a) => a.chatbot_id);
        const { data: chatbotsData, error: chatError } = await supabase
          .from("chatbots")
          .select("id, nom")
          .in("id", ids);
  
        if (!chatError) {
          setChatbots(chatbotsData || []);
        } else {
          setChatbots([]);
        }
      } catch (err) {
        console.error("Erreur fetchLinkedChatbots:", err);
        setChatbots([]);
      }
  
      setLoading(false);
    };
  
    useEffect(() => {
      if (ownerId) {
        fetchLinkedChatbots();
      }
    }, [ownerId, documentName]);
  
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Chargement…</p>
        ) : chatbots.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {chatbots.length} chatbot{chatbots.length > 1 && "s"} lié
              {chatbots.length > 1 && "s"} à ce document :
            </p>
            <div className="flex flex-wrap gap-2">
              {chatbots.map((chatbot) => (
                <span
                  key={chatbot.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 shadow-sm"
                >
                  {chatbot.nom}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm italic text-gray-400">
            Aucun chatbot lié à ce document.
          </p>
        )}
      </div>
    );
  }
  
