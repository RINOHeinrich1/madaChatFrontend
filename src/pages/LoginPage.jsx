import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    setMousePosition({ x, y });
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 105, 180, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)",
          }}
        />
      </div>

 

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
        <h1 className="text-4xl font-black text-center bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          MadaChat
        </h1>
        <p className="text-center text-sm text-white/70">
          Connectez-vous pour administrer vos Chatbots IA
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              await handleLogin(email, password);
            } catch (err) {
              setError("Échec de la connexion. Vérifiez vos identifiants.");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-semibold px-5 py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-500 shadow-lg hover:shadow-pink-500/30"
          >
            {loading ? "Connexion..." : (
              <>
                <LogIn className="w-5 h-5" />
                Se connecter
              </>
            )}
          </button>

          <p className="text-center text-sm text-white/60">
            Pas encore inscrit ?{" "}
            <a
              href="/register"
              className="text-indigo-400 hover:underline font-medium"
            >
              Créer un compte
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}

