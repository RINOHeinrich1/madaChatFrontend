import React from "react";
import { Mail, Users, Code, MessageCircle, Github, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-800 dark:text-gray-200">Rejoignez </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MadaChat
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Faites partie de la révolution des chatbots IA. Contribuez, apprenez
            et innovez avec nous.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 rounded-3xl p-8 border border-white/20 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Contactez notre équipe
              </h3>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Email
                    </h4>
                    <a
                      href="mailto:contact@onirtech.com"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      contact@onirtech.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Basé à
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Madagascar
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Communauté
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      150+ développeurs actifs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Methods */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Comment nous rejoindre
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 rounded-xl">
                  <Github className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Contribuez sur GitHub
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Participez au développement
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Rejoignez Discord
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Échangez avec la communauté
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-900 dark:to-green-900 rounded-xl">
                  <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Partagez vos projets
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Montrez vos créations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Prêt à commencer ?</h3>
              <p className="text-lg mb-8 text-indigo-100">
                Rejoignez notre communauté de développeurs passionnés et créez
                des chatbots IA révolutionnaires.
              </p>

              <div className="space-y-4">
                <button className="w-full bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-colors duration-300 shadow-lg">
                  <Mail className="w-5 h-5 inline mr-2" />
                  Nous contacter
                </button>
                <a
                  href="https://github.com/RINOHeinrich1/madaChatFrontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-300 inline-flex items-center justify-center"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Voir le projet GitHub
                </a>
              </div>
            </div>

            {/* Team Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Notre mission
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Démocratiser l'accès à l'intelligence artificielle
                conversationnelle en créant des outils open source accessibles à
                tous les développeurs, peu importe leur niveau d'expertise.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                  IA Conversationnelle
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  RAG
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  Open Source
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  Communauté
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
