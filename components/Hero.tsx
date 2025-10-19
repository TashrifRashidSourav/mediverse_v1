import React from 'react';

const Hero: React.FC<{
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}> = ({
  title = "Your Hospital's <span class=\"text-primary\">Digital Front Door</span>",
  subtitle = "Create a professional, secure, and user-friendly website for your hospital in minutes. No technical skills required.",
  imageUrl = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
}) => {
  const handleScrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h1
          className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-600">
          {subtitle}
        </p>
        <div className="mt-10">
          <button
            onClick={handleScrollToPricing}
            className="bg-primary text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/30"
          >
            Choose Your Plan
          </button>
        </div>
        <div className="mt-16 relative">
          <img
            src={imageUrl}
            alt="Modern and clean hospital interior"
            className="rounded-2xl shadow-2xl mx-auto ring-1 ring-slate-200 object-cover h-[500px] w-full max-w-6xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
