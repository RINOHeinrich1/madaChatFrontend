import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import FormInput from "../ui/FormInput";
import React from "react";

export default function RegisterPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    first_name: "",
    organisation: "",
    address: "",
    purpose: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(formData);
      navigate("/");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-gray-800 dark:text-gray-100 flex items-center justify-center font-inter transition-all duration-500 px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MadaChat
            </h1>
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Créer votre compte administrateur
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Rejoignez la plateforme de gestion de chatbot la plus avancée de Madagascar
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 lg:p-12 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput label="Nom" name="name" required value={formData.name} onChange={handleChange} focused={focusedField === "name"} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField("")} animationDelay="0.1s" />
                <FormInput label="Prénom" name="first_name" required value={formData.first_name} onChange={handleChange} focused={focusedField === "first_name"} onFocus={() => setFocusedField("first_name")} onBlur={() => setFocusedField("")} animationDelay="0.2s" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput label="Email" name="email" type="email" required value={formData.email} onChange={handleChange} focused={focusedField === "email"} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField("")} animationDelay="0.3s" />
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField("")} placeholder="••••••••" className={`w-full px-4 py-4 pr-12 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
                      focusedField === "password"
                        ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg scale-[1.02]"
                        : formData.password
                        ? "border-green-400 dark:border-green-500"
                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400"
                    }`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors duration-200">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Informations professionnelles
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput label="Organisation" name="organisation" value={formData.organisation} onChange={handleChange} focused={focusedField === "organisation"} onFocus={() => setFocusedField("organisation")} onBlur={() => setFocusedField("")} animationDelay="0.5s" placeholder="Nom de votre entreprise" />
                <FormInput label="Téléphone" name="phone_number" value={formData.phone_number} onChange={handleChange} focused={focusedField === "phone_number"} onFocus={() => setFocusedField("phone_number")} onBlur={() => setFocusedField("")} animationDelay="0.6s" placeholder="+261 XX XX XXX XX" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormInput label="Adresse" name="address" value={formData.address} onChange={handleChange} focused={focusedField === "address"} onFocus={() => setFocusedField("address")} onBlur={() => setFocusedField("")} animationDelay="0.7s" placeholder="Votre adresse complète" />
                <FormInput label="Objectif d'utilisation" name="purpose" value={formData.purpose} onChange={handleChange} focused={focusedField === "purpose"} onFocus={() => setFocusedField("purpose")} onBlur={() => setFocusedField("")} animationDelay="0.8s" placeholder="Support client, ventes, etc." />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button type="submit" disabled={loading} className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl flex justify-center items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                loading ? "animate-pulse" : "hover:scale-[1.02] active:scale-[0.98]"
              }`}>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Création du compte...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Créer mon compte
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
              Déjà un compte ?{" "}
              <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors duration-200">
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
