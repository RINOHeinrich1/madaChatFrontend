import { useState, useEffect } from "react";
import { CheckCircle, Plus, Bot, AlertCircle, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import FormInput from "../ui/FormInput";
import FormTextarea from "../ui/Formtextarea";
export default function ChatbotFormModal({ onClose, userId, existing }) {
  const isEdit = !!existing;

  const [formData, setFormData] = useState({
    nom: existing?.nom || "",
    description: existing?.description || "",
    allowed_url: existing?.allowed_url || "",
    memoire_contextuelle: existing?.memoire_contextuelle || 5, // 👈 valeur par défaut 5
  });

  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [signedAvatarUrl, setSignedAvatarUrl] = useState(null);

  const urls = formData.allowed_url
    ? formData.allowed_url
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)
    : [];
  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (trimmed && !urls.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        allowed_url: [...urls, trimmed].join(","),
      }));
      setNewUrl("");
    }
  };

  const removeUrl = (urlToRemove) => {
    const updated = urls.filter((u) => u !== urlToRemove);
    setFormData((prev) => ({
      ...prev,
      allowed_url: updated.join(","),
    }));
  };

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

      let avatarUrl = existing?.avatar || null;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            upsert: true,
            cacheControl: "3600",
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
      }

      const payload = {
        nom: formData.nom,
        description: formData.description,
        allowed_url: formData.allowed_url,
        memoire_contextuelle: formData.memoire_contextuelle,
        avatar: avatarUrl,
      };

      let result;
      if (isEdit) {
        result = await supabase
          .from("chatbots")
          .update(payload)
          .eq("id", existing.id);
      } else {
        result = await supabase.from("chatbots").insert({
          ...payload,
          owner_id: userId,
        });
      }

      if (result.error) throw result.error;

      await Swal.fire({
        icon: "success",
        title: isEdit ? "Chatbot modifié avec succès 🎉" : "Chatbot créé 🎉",
        text: isEdit
          ? "Les modifications ont été enregistrées."
          : "Votre chatbot a été enregistré.",
        confirmButtonColor: "#6366f1",
      });

      onClose();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const generateSignedAvatarUrl = async () => {
      if (existing?.avatar) {
        try {
          // Extraire le chemin relatif du fichier depuis l'URL publique
          const match = existing.avatar.match(/avatars\/(.+)$/);
          const filePath = match ? match[1] : null;

          if (!filePath) {
            console.error(
              "Impossible d'extraire le chemin du fichier depuis l'URL :",
              existing.avatar
            );
            return;
          }

          const { data, error } = await supabase.storage
            .from("avatars")
            .createSignedUrl(filePath, 60); // 60 secondes

          if (error) {
            console.error("Erreur Supabase:", error.message);
          } else {
            setSignedAvatarUrl(data?.signedUrl);
          }
        } catch (err) {
          console.error(
            "Erreur lors de la génération de l'URL signée :",
            err.message
          );
        }
      }
    };

    generateSignedAvatarUrl();
  }, [existing?.avatar]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 w-full max-w-xl max-h-screen overflow-y-auto rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 p-8 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar cliquable en haut */}
        <div className="flex flex-col items-center justify-center mt-2 mb-6">
          <label htmlFor="avatar-upload" className="cursor-pointer group">
            {signedAvatarUrl || avatarFile ? (
              <img
                src={
                  avatarFile ? URL.createObjectURL(avatarFile) : signedAvatarUrl
                }
                alt="Avatar"
                className="w-24 h-24 object-cover rounded-full border-4 border-indigo-500 shadow-lg group-hover:opacity-80 transition"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:opacity-80 transition border-2 border-dashed border-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.477 0 4.779.676 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className="hidden"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Cliquez sur l'image pour modifier l'avatar
          </p>
        </div>
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
            label="Mémoire contextuelle (messages précédents)"
            name="memoire_contextuelle"
            type="number"
            min="0"
            value={formData.memoire_contextuelle}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                memoire_contextuelle: parseInt(e.target.value || 0),
              }))
            }
            focused={focusedField === "memoire_contextuelle"}
            onFocus={() => setFocusedField("memoire_contextuelle")}
            onBlur={() => setFocusedField("")}
            placeholder="Ex: 5"
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            focused={focusedField === "description"}
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField("")}
            placeholder="Ex: Chatbot d’assistance commerciale"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              URLs autorisées
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
              <button
                type="button"
                onClick={addUrl}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {urls.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full"
                >
                  <span className="text-gray-800 dark:text-white">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeUrl(url)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
                loading
                  ? "animate-pulse"
                  : "hover:scale-[1.02] active:scale-[0.98]"
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
