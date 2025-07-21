import { useRef } from "react";

export default function Diagram({ tables, foreignKeys }) {
  const cardRefs = useRef({});

  return (
    <div className="relative w-full max-h-[80vh] overflow-auto bg-gray-100 dark:bg-gray-900 rounded-xl p-6 space-y-8">
      {/* Cartes des tables */}
      <div className="flex flex-wrap gap-6">
        {tables.map((table) => (
          <div
            key={table.table_name}
            ref={(el) => (cardRefs.current[table.table_name] = el)}
            className="bg-white dark:bg-gray-800 border rounded-xl shadow-md p-4 w-64"
          >
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">
              {table.table_name}
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300">
              {table.columns.map((col) => (
                <li key={col.column_name}>
                  <span className="font-mono text-indigo-600">
                    {col.column_name}
                  </span>{" "}
                  <span className="text-gray-500 text-xs">
                    ({col.data_type})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Relations textuelles */}
      {foreignKeys?.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Relations entre les tables
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
            {foreignKeys.map((fk, index) => (
              <li key={index}>
                <span className="font-mono text-indigo-600">{fk.source_table}</span>
                {" "}
                <span className="text-gray-500">→</span>
                {" "}
                <span className="font-mono text-indigo-600">{fk.target_table}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
