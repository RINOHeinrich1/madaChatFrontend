import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function SoonPage({
  title,
  message,
  icon: Icon,
  estimatedTime,
  features = [],
  showNotifyButton = false,
}) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setIsVisible(true);

    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  const handleNotifyMe = () => {
    alert("Nous vous notifierons dès que cette fonctionnalité sera disponible !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-gray-800 dark:text-gray-100 flex items-center justify-center font-inter px-6 py-12 relative overflow-hidden">
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-indigo-200 dark:bg-indigo-700 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Floating Gradient Circles */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }} />
      <div className="absolute bottom-20 right-16 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }} />
      <div className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }} />

      <div className={`text-center space-y-8 max-w-2xl relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 animate-pulse">
              {Icon ? (
                <Icon className="w-10 h-10 text-white transform transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <Clock className="w-10 h-10 text-white transform transition-transform duration-300 group-hover:scale-110" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent leading-tight">
            {title || "Fonctionnalité en cours de développement"}
          </h1>

          {estimatedTime && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Disponible {estimatedTime}
            </div>
          )}
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto">
          {message ||
            "Cette fonctionnalité est encore en cours de développement. Elle sera disponible bientôt avec des capacités incroyables."}
        </p>

        {/* Feature List */}
        {features.length > 0 && (
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
            <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Fonctionnalités à venir
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 transition-all duration-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Retour à l'accueil
          </button>

          {showNotifyButton && (
            <button
              onClick={handleNotifyMe}
              className="group flex items-center gap-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-600"
            >
              <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
              Me notifier
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="pt-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Développement en cours...</p>
        </div>
      </div>
    </div>
  );
}
