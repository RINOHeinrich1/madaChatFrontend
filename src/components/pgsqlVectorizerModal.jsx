import { X } from "lucide-react";
import FormTextarea from "../ui/Formtextarea";
import FormInput from "../ui/FormInput";
import { useState } from "react";
import Diagram from "../ui/Diagram";
export default function PgsqlVectorizerModal({
  isOpen,
  onClose,
  tables,
  foreignKeys,
  selectedTable,
  setSelectedTable,
  template,
  setTemplate,
  description,
  setDescription,
  onSend,
  loading,
}) {
  const [focused, setFocused] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          onClick={onClose}
          aria-label="Fermer la modale"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Choisissez une table à vectoriser
        </h2>

        {/* Diagramme visuel des tables + relations */}
        <Diagram tables={tables} foreignKeys={foreignKeys} />

        <div className="mt-6">
          <FormTextarea
            label="Template (modifiable)"
            name="template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            focused={false}
            placeholder="Ex: Le produit {{productName}} possède la description {{description}}."
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
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            onClick={async () => {
              await onSend(); // ← On attend bien la mise à jour
            }}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi en cours..." : "Vectoriser"}
          </button>
        </div>
      </div>
    </div>
  );
}
