import { X } from "lucide-react";
import FormTextarea from "../ui/Formtextarea";
import FormInput from "../ui/FormInput";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PgsqlTemplateModal({
  isOpen,
  onClose,
  connexion,
  template,
  setTemplate,
  description,
  setDescription,
  onSend,
  loading,
}) {
  const [variables, setVariables] = useState([]);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    const fetchVariables = async () => {
      if (!connexion?.table_name) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("variables")
        .select("*")
        .eq("owner_id", user.id)
        .eq("connexion_name", `${connexion.database}/${connexion.table_name}`);
      if (!error) setVariables(data);
    };
    if (connexion) fetchVariables();
  }, [connexion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={onClose}
          aria-label="Fermer la modale"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Créer un template personnalisé
        </h2>

        <div className="mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Variables disponibles :
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
            {variables.map((v) => (
              <li key={v.id}>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {`{{${v.variable_name}}}`}
                </span>

                <span className="text-gray-500 text-xs ml-2">
                  depuis requête : {v.request.slice(0, 60)}...
                </span>
              </li>
            ))}
            {variables.length === 0 && <li>Aucune variable disponible.</li>}
          </ul>
        </div>

        <FormTextarea
          label="Template (modifiable)"
          name="template"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          onFocus={() => setFocused("template")}
          onBlur={() => setFocused("")}
          focused={focused === "template"}
          placeholder="Ex: Le produit {{product_name}} est vendu à {{price}}."
          rows={5}
        />

        <FormInput
          label="Description (contexte d'utilisation)"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Exemple: Utilisé pour répondre aux questions sur les produits."
          focused={focused === "description"}
          onFocus={() => setFocused("description")}
          onBlur={() => setFocused("")}
        />

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            onClick={onSend}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement..." : "Créer le template"}
          </button>
        </div>
      </div>
    </div>
  );
}
