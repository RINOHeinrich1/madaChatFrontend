import React, { useEffect, useState } from "react";
import { Bot, Zap, Users, ArrowRight, Github, Star, Sparkles, ChevronDown } from "lucide-react";
import FloatingOrb from "../../ui/FloatingOrb";
export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };



  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)`
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 105, 180, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)'
        }} />
      </div>

      {/* Floating Orbs */}
      <FloatingOrb size="w-32 h-32" color="bg-indigo-500" delay="0s" duration="6s" />
      <FloatingOrb size="w-24 h-24" color="bg-purple-500" delay="2s" duration="8s" />
      <FloatingOrb size="w-16 h-16" color="bg-pink-500" delay="4s" duration="7s" />
      <FloatingOrb size="w-20 h-20" color="bg-blue-500" delay="1s" duration="9s" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Main Hero Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-20">
          {/* Left: Enhanced Text Content */}
          <div className={`flex-1 text-center lg:text-left transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 shadow-2xl mb-8 hover:bg-white/20 transition-all duration-300 group">
              <div className="relative">
                <Github className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
              </div>
              <span className="text-white/90 font-medium">
                Projet Open Source
              </span>
              <div className="flex items-center gap-2 text-yellow-400 group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">250+</span>
              </div>
              <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
            </div>

            {/* Main Heading with Enhanced Typography */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-gradient-x mb-2">
                MadaTalk
              </span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-light text-white/80 tracking-wide">
                Chatbots IA{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                  Naturels
                </span>
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-xl md:text-2xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Créez des chatbots{' '}
              <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-semibold relative">
                qui raisonnent sur vos données
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </span>{' '}
              et parlent comme des humains en quelques clics.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={scrollToFeatures}
                className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-2xl flex items-center gap-4 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 font-bold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Zap className="w-6 h-6 group-hover:animate-bounce" />
                Les fonctionnalités
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a
                href="https://github.com/RINOHeinrich1/MadaTalkFrontend"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <button className="w-full bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white px-10 py-5 rounded-2xl flex items-center gap-4 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20 hover:border-white/40 font-bold text-lg">
                  <Github className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                   GitHub
                </button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start gap-8 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Évolutif</span>
              </div>
            </div>
          </div>

          {/* Right: Enhanced Iframe Container */}
          <div className={`flex-1 flex justify-center transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative group">
              {/* Glowing Border */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
              
              {/* Iframe Container */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <iframe
                  src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7349838454752485376?compact=1"
                  height="399"
                  width="504"
                  frameBorder="0"
                  allowFullScreen
                  title="Post intégré"
                  className="max-w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-16">
          <button
            onClick={scrollToFeatures}
            className="animate-bounce text-white/50 hover:text-white transition-colors"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  );
}