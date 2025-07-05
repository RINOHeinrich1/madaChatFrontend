import React from 'react';
import { Bot, Zap, Users, ArrowRight, Github, Star } from 'lucide-react';

export default function Hero() {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20 dark:border-gray-700/50 shadow-lg mb-8 animate-fade-in">
            <Github className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Projet Open Source</span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">250+</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MadaChat
            </span>
            <br />
            <span className="text-gray-800 dark:text-gray-200 text-3xl md:text-5xl">
              Chatbots IA Naturels
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Créez des chatbots <span className="text-indigo-600 dark:text-indigo-400 font-semibold">RAG intelligents</span> qui parlent comme des humains en quelques clics. 
            Rejoignez notre communauté de développeurs passionnés.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={scrollToFeatures}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-lg"
            >
              <Zap className="w-6 h-6" />
              Découvrir les fonctionnalités
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-700/50 font-semibold text-lg">
              <Github className="w-6 h-6" />
              Voir sur GitHub
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">500+</h3>
            <p className="text-gray-600 dark:text-gray-400">Chatbots créés</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">150+</h3>
            <p className="text-gray-600 dark:text-gray-400">Développeurs actifs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">24/7</h3>
            <p className="text-gray-600 dark:text-gray-400">Support communautaire</p>
          </div>
        </div>
      </div>
    </section>
  );
}