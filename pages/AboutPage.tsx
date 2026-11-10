import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col selection:bg-primary/30">
      <Header />
      <main className="flex-grow">
        {/* Premium Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Redefining Healthcare <br className="hidden md:block" /> Technology.
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light">
              We are on a relentless pursuit to build the digital foundation for the future of medicine, empowering doctors and patients alike.
            </p>
          </div>
        </section>

        {/* Vision & Mission Split */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src="/images/about-team.jpg" alt="Modern Medical Team" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide uppercase mb-4">Our Vision</div>
                  <h2 className="text-4xl font-bold text-white mb-4">A connected ecosystem for better care.</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Imagine a world where patient data flows seamlessly, where appointments are booked in seconds, and where doctors have all the insights they need at their fingertips. That's the world MediVerse is building.
                  </p>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-3xl font-bold text-white mb-2">500+</h4>
                      <p className="text-slate-500">Hospitals Empowered</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-white mb-2">2M+</h4>
                      <p className="text-slate-500">Patients Served</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Glassmorphism */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Principles that guide us</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Uncompromising Quality", desc: "Healthcare demands perfection. We build systems that are robust, secure, and always reliable." },
                { title: "Empathetic Design", desc: "We design for humans—doctors, nurses, and patients—making complex workflows feel effortless." },
                { title: "Relentless Innovation", desc: "We are constantly exploring new technologies to solve the most pressing challenges in medical administration." }
              ].map((value, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:bg-slate-800/50 transition duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/0 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
