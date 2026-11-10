import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CONTACT_EMAIL = 'hello@mediverse.com';

const inputClasses =
  'w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // There is no mail backend yet, so the form opens the visitor's email app with the message filled in.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `MediVerse enquiry from ${form.firstName} ${form.lastName}`.trim();
    const body = `${form.message}\n\n---\nFrom: ${form.firstName} ${form.lastName} <${form.email}>`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-primary/30">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-6xl mt-10">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row border border-slate-100">

            {/* Left Side: Contact Info */}
            <div className="md:w-5/12 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-3 tracking-tight">Get in touch</h2>
                <p className="text-slate-400 mb-12 text-lg font-light">We'd love to hear from you. Our friendly team is always here to chat.</p>

                <div className="flex items-start space-x-5 group">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-primary/20 transition-colors">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Chat to us</h4>
                    <p className="text-slate-400 text-sm mb-2 font-light">Our friendly team is here to help.</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:text-white transition-colors font-medium break-all">{CONTACT_EMAIL}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-7/12 p-8 md:p-12 bg-white/80 backdrop-blur-3xl relative">
              {sent ? (
                <div className="relative z-10 h-full flex flex-col justify-center text-center py-10">
                  <h3 className="text-2xl font-bold text-slate-900">Almost there!</h3>
                  <p className="mt-3 text-slate-600">
                    Your email app should have opened with your message ready to send. If it didn't, write to us at{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-semibold">{CONTACT_EMAIL}</a>.
                  </p>
                  <button type="button" onClick={() => setSent(false)} className="mt-6 mx-auto text-primary font-semibold hover:underline">
                    Write another message
                  </button>
                </div>
              ) : (
                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                      <input id="firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} className={inputClasses} placeholder="Jane" required />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                      <input id="lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} className={inputClasses} placeholder="Smith" required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClasses} placeholder="you@company.com" required />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                    <textarea id="message" name="message" rows={5} value={form.message} onChange={handleChange} className={`${inputClasses} resize-none`} placeholder="Tell us how we can help..." required></textarea>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 hover:bg-primary text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
