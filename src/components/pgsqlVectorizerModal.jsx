import { X } from "lucide-react";
import FormSelect from "../ui/FormSelect";
import FormTextarea from "../ui/Formtextarea";

export default function PgsqlVectorizerModal({
  isOpen,
  onClose,
  tables,
  selectedTable,
  setSelectedTable,
  template,
  setTemplate,
  onSend,
  loading,
}) {
  if (!isOpen) return null;

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    setTemplate(""); // Réinitialise le template
  };

  const getSelectedTableColumns = () => {
    const table = tables.find((t) => t.table_name === selectedTable);
    return table?.columns || [];
  };

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
          Choisissez la table à vectoriser
        </h2>

        <FormSelect
          label="Table"
          name="selectedTable"
          value={selectedTable}
          onChange={(e) => handleTableSelect(e.target.value)}
          options={tables.map((t) => t.table_name)}
          placeholder="Sélectionnez une table"
        />

        {selectedTable && (
          <>
            <div className="mt-4 mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Colonnes disponibles :
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                {getSelectedTableColumns().map((col) => (
                  <li key={col.column_name}>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {col.column_name}
                    </span>{" "}
                    <span className="text-gray-500 text-xs">({col.data_type})</span>
                  </li>
                ))}
              </ul>
            </div>

            <FormTextarea
              label="Template (modifiable)"
              name="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              onFocus={() => {}}
              onBlur={() => {}}
              focused={false}
              placeholder="Ex: Le produit {{productName}} possède la description {{description}}."
              rows={5}
            />
          </>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            onClick={onSend}
            disabled={loading || !selectedTable}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi en cours..." : "Vectoriser"}
          </button>
        </div>
      </div>
    </div>
  );
}
