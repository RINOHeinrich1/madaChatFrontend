import { useState, useEffect } from "react";
import { Users, Globe, Heart, Cpu, Star, MessageCircle } from "lucide-react";
import FloatingOrb from "../../ui/FloatingOrb";

export default function Community() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      value: "150+",
      label: "Développeurs",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      value: "25+",
      label: "Pays",
      color: "from-green-500 to-teal-600",
    },
    {
      icon: <Star className="w-8 h-8" />,
      value: "250+",
      label: "Stars GitHub",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      value: "1000+",
      label: "Messages Discord",
      color: "from-blue-500 to-cyan-600",
    },
  ];

  const testimonials = [
    {
      name: "Rakoto Andriamanitra",
      role: "Lead Developer, TechMada",
      content:
        "MadaChat a révolutionné notre approche du support client. En 2 jours, nous avons déployé un chatbot qui répond à 80% des questions de nos utilisateurs.",
      avatar: "RA",
    },
    {
      name: "Hery Rasolofoson",
      role: "CTO, StartupMG",
      content:
        "La qualité du code et la facilité d'intégration sont impressionnantes. Notre équipe a contribué à 3 fonctionnalités majeures en un mois.",
      avatar: "HR",
    },
    {
      name: "Mialy Razafy",
      role: "AI Researcher, UniMada",
      content:
        "Un projet open source de qualité mondiale qui met Madagascar sur la carte de l'IA. Fière d'en faire partie !",
      avatar: "MR",
    },
  ];

  return (
    <section
      id="community"
      className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-800 dark:text-gray-200">Notre </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Communauté
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Une communauté de développeurs passionnés qui construisent l'avenir
            des chatbots IA, unie par des valeurs fortes.
          </p>
        </div>

        {/* Community Values */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-12 border border-white/20 dark:border-gray-700/50 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <FloatingOrb
              size="w-32 h-32"
              color="bg-indigo-500"
              delay="0s"
              duration="6s"
            />
            <FloatingOrb
              size="w-24 h-24"
              color="bg-purple-500"
              delay="2s"
              duration="8s"
            />
            <FloatingOrb
              size="w-16 h-16"
              color="bg-pink-500"
              delay="4s"
              duration="7s"
            />
            <FloatingOrb
              size="w-20 h-20"
              color="bg-blue-500"
              delay="1s"
              duration="9s"
            />
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Passion
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Nous aimons ce que nous faisons et nous le faisons avec
                excellence.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Collaboration
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Ensemble, nous construisons des solutions plus puissantes.
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Innovation
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Nous repoussons les limites de ce qui est possible avec l'IA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
