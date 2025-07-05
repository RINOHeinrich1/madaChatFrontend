import React from 'react';
import Header from "../components/landingPages/Header"
import Hero from '../components/landingPages/Hero';
import Features from '../components/landingPages/Features';
import Community from '../components/landingPages/Community';
import Contact from '../components/landingPages/Contact';
import Footer from '../components/landingPages/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 font-inter">
      <Header />
      <Hero />
      <Features />
      <Community />
      <Contact />
      <Footer />
    </div>
  );
}

export default LandingPage;