import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Database } from "lucide-react";

const sources = [
  {
    title: "Documents",
    description: "Fichiers texte, PDF, etc. utilisés comme sources d’entraînement.",
    icon: FileText,
    path: "/docs",
  },
  {
    title: "Base de données PostgreSQL",
    description: "Connexion à une base de données PostgreSQL pour extraire des données en temps réel.",
    icon: Database,
    path: "/pgsql",
  },
];

export default function SourcePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-gray-800 dark:text-gray-100 flex items-center justify-center font-inter px-6 py-12 transition-all duration-500">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Choisissez une source
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Sélectionnez un type de source pour alimenter votre chatbot.
          </p>
        </div>

        {/* Source Cards */}
        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {sources.map(({ title, description, icon: Icon, path }, index) => (
            <div
              key={index}
              onClick={() => navigate(path)}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/60 rounded-3xl shadow-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-indigo-500"
            >
              <div className="flex items-center gap-3 mb-3 text-indigo-600 dark:text-indigo-400">
                <Icon className="w-6 h-6" />
                <h2 className="text-xl font-semibold">{title}</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
