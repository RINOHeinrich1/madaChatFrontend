import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import FormInput from "../ui/FormInput";
import { CheckCircle, AlertCircle, Save } from "lucide-react";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  console.log("User: ", currentUser);
  const [formData, setFormData] = useState({
    name: "",
    first_name: "",
    organisation: "",
    address: "",
    purpose: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Impossible de récupérer l'utilisateur connecté.");
        setLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
        setError("Impossible de charger le profil.");
      } else if (data) {
        setFormData({
          name: data.name || "",
          first_name: data.first_name || "",
          organisation: data.organisation || "",
          address: data.address || "",
          purpose: data.purpose || "",
          phone_number: data.phone_number || "",
        });
      }

      setLoadingProfile(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("owner_id", currentUser.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        // update
        const { error: updateError } = await supabase
          .from("profiles")
          .update(formData)
          .eq("owner_id", currentUser.id);

        if (updateError) throw updateError;
      } else {
        // insert
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ ...formData, owner_id: currentUser.id }]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de la sauvegarde du profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center px-4 py-8 transition-all duration-500">
      <div className="w-full max-w-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 lg:p-12 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            Information sur votre profile
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Modifier vos informations personnelles
          </p>
        </div>
        {loadingProfile ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormInput
                label="Nom"
                name="name"
                value={formData.name}
                onChange={handleChange}
                focused={focusedField === "name"}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
              />
              <FormInput
                label="Prénom"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                focused={focusedField === "first_name"}
                onFocus={() => setFocusedField("first_name")}
                onBlur={() => setFocusedField("")}
              />
              <FormInput
                label="Organisation"
                name="organisation"
                value={formData.organisation}
                onChange={handleChange}
                focused={focusedField === "organisation"}
                onFocus={() => setFocusedField("organisation")}
                onBlur={() => setFocusedField("")}
              />
              <FormInput
                label="Téléphone"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                focused={focusedField === "phone_number"}
                onFocus={() => setFocusedField("phone_number")}
                onBlur={() => setFocusedField("")}
              />
              <FormInput
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleChange}
                focused={focusedField === "address"}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField("")}
              />
              <FormInput
                label="Objectif d'utilisation"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                focused={focusedField === "purpose"}
                onFocus={() => setFocusedField("purpose")}
                onBlur={() => setFocusedField("")}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Profil sauvegardé avec succès.
                </p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl flex justify-center items-center gap-3 transition-all duration-300 shadow-lg ${
                  loading
                    ? "animate-pulse"
                    : "hover:scale-[1.02] hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
