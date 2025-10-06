import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
          Your Hospital's <span className="text-primary">Digital Front Door</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-600">
          Create a professional, secure, and user-friendly website for your hospital in minutes. No technical skills required.
        </p>
        <div className="mt-10">
          <a 
            href="/#pricing"
            className="bg-primary text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/30"
          >
            Choose Your Plan
          </a>
        </div>
        <div className="mt-16 relative">
          <img 
            src="https://picsum.photos/seed/mediverse-hero/1200/600"
            alt="Dashboard preview of a hospital website"
            className="rounded-2xl shadow-2xl mx-auto ring-1 ring-slate-200"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;