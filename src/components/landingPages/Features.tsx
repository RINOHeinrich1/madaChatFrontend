import React from "react";
import {
  Bot,
  Zap,
  Code,
  Users,
  Shield,
  Cpu,
  MessageSquare,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Features() {
  const navigate = useNavigate();
  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Chatbots RAG Intelligents",
      description:
        "Créez des chatbots qui comprennent le contexte et génèrent des réponses naturelles basées sur vos données.",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Création en Quelques Clics",
      description:
        "Interface intuitive qui permet de déployer un chatbot professionnel en moins de 5 minutes.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "100% Open Source",
      description:
        "Code source ouvert, personnalisable et extensible. Rejoignez notre communauté de contributeurs.",
      color: "from-green-500 to-teal-600",
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Intégration Facile",
      description:
        "APIs RESTful et SDKs pour intégrer facilement vos chatbots dans vos applications existantes.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Conversations Naturelles",
      description:
        "IA avancée qui comprend le contexte et maintient des conversations fluides et engageantes.",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sécurité Avancée",
      description:
        "Chiffrement des données, authentification robuste et respect des standards de sécurité.",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Fonctionnalités
            </span>
            <span className="text-gray-800 dark:text-gray-200">
              {" "}
              Principales
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Découvrez les outils puissants qui font de MadaChat la plateforme de
            référence pour créer des chatbots IA intelligents et naturels.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 rounded-3xl p-12 border border-white/20 dark:border-gray-700/50">
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Prêt à créer votre premier chatbot ?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté de développeurs et commencez à construire
            des chatbots IA révolutionnaires dès aujourd'hui.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-lg mx-auto"
          >
            <Code className="w-6 h-6" />
            Commencer maintenant
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
