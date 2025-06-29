import { useState, useEffect } from "react";
import { CheckCircle, Bot, AlertCircle, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import React from "react";

export default function ChatbotFormModal({ onClose, userId, existing }) {
  const isEdit = !!existing;

  const [formData, setFormData] = useState({
    nom: existing?.nom || "",
    description: existing?.description || "",
  });

  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!userId) throw new Error("Utilisateur non authentifié");

      let result;
      if (isEdit) {
        result = await supabase
          .from("chatbots")
          .update({
            nom: formData.nom,
            description: formData.description,
          })
          .eq("id", existing.id);
      } else {
        result = await supabase.from("chatbots").insert({
          nom: formData.nom,
          description: formData.description,
          owner_id: userId,
        });
      }

      if (result.error) throw result.error;

      await Swal.fire({
        icon: "success",
        title: isEdit ? "Chatbot modifié avec succès 🎉" : "Chatbot créé 🎉",
        text: isEdit ? "Les modifications ont été enregistrées." : "Votre chatbot a été enregistré.",
        confirmButtonColor: "#6366f1",
      });

      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 w-full max-w-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isEdit ? "Modifier le Chatbot" : "Créer un Chatbot"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Nom du Chatbot"
            name="nom"
            required
            value={formData.nom}
            onChange={handleChange}
            focused={focusedField === "nom"}
            onFocus={() => setFocusedField("nom")}
            onBlur={() => setFocusedField("")}
            placeholder="Ex: Assistant OnirTech"
          />

          <FormInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            focused={focusedField === "description"}
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField("")}
            placeholder="Ex: Chatbot d’assistance commerciale"
          />

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl flex justify-center items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? "animate-pulse" : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  {isEdit ? "Modifier" : "Créer le Chatbot"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
            focused
              ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg scale-[1.02]"
              : value
              ? "border-green-400 dark:border-green-500"
              : "border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400"
          }`}
        />
        {value && !focused && (
          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-fade-in" />
        )}
      </div>
    </div>
  );
}
