import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import { PLANS } from '../constants';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing plans={PLANS} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
