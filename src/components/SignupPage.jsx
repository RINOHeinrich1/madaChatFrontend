import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { signup } = useAuth(); // cette fonction doit enregistrer l'utilisateur dans Supabase
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(formData); // cette fonction devrait créer un utilisateur + insérer dans profiles
      navigate("/");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex items-center justify-center font-inter transition-colors duration-300 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2">
          📝 <span>Inscription — MadaChat</span>
        </h1>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Créez un compte pour accéder à l'administration du chatbot
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nom" name="name" required value={formData.name} onChange={handleChange} />
            <Input label="Prénom" name="first_name" required value={formData.first_name} onChange={handleChange} />
            <Input label="Email" name="email" type="email" required value={formData.email} onChange={handleChange} />
            <Input label="Mot de passe" name="password" type="password" required value={formData.password} onChange={handleChange} />
            <Input label="Organisation" name="organisation" value={formData.organisation} onChange={handleChange} />
            <Input label="Adresse" name="address" value={formData.address} onChange={handleChange} />
            <Input label="Objet" name="purpose" value={formData.purpose} onChange={handleChange} />
            <Input label="Téléphone" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 rounded-xl flex justify-center items-center gap-2 transition shadow"
          >
            {loading ? "Création du compte..." : (<><UserPlus className="w-5 h-5" /> S'inscrire</>)}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", required = false, value, onChange }) {
  return (
    <div>
      <label htmlFor={name} className="block mb-1 font-medium">{label}{required && " *"}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
