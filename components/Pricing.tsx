import React from 'react';
import { Link } from 'react-router-dom';
import { type Plan } from '../types';
import { CheckIcon } from './icons/CheckIcon';

interface PricingProps {
  plans: Plan[];
}

const PricingCard: React.FC<{ plan: Plan; }> = ({ plan }) => {
  const cardClasses = plan.isRecommended
    ? 'border-primary border-2 bg-primary-50'
    : 'border-slate-200 border bg-white';
  const buttonClasses = plan.isRecommended
    ? 'bg-primary text-white hover:bg-primary-700'
    : 'bg-primary-100 text-primary hover:bg-primary-200';
  const headerClasses = plan.isRecommended ? 'bg-primary text-white' : plan.tier === 'Golden' ? 'bg-gold-700 text-white' : 'bg-slate-100 text-slate-800';

  return (
    <div className={`rounded-2xl shadow-lg relative flex flex-col transition-all duration-300 ${cardClasses} overflow-hidden`}>
      {plan.isRecommended && (
        <div className="absolute top-4 -right-12 transform rotate-45 bg-amber-400 text-black text-xs font-bold px-12 py-1.5 uppercase tracking-wider">
          Best Value
        </div>
      )}
      <div className={`p-6 text-center ${headerClasses}`}>
         <h3 className="text-2xl font-bold">{plan.tier}</h3>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
          <div className="text-center">
            <span className="text-5xl font-extrabold text-slate-900">BDT {plan.price}</span>
            <span className="text-slate-500 ml-1">/ month</span>
          </div>
          <ul className="mt-8 space-y-4 text-slate-600 flex-grow">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            to={`/signup?plan=${plan.tier}`}
            className={`block text-center w-full mt-10 font-bold py-3 px-6 rounded-lg transition-colors duration-300 ${buttonClasses}`}
          >
            {plan.ctaText}
          </Link>
      </div>
    </div>
  );
};

const Pricing: React.FC<PricingProps> = ({ plans }) => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Flexible Pricing for Hospitals of All Sizes</h2>
          <p className="mt-4 text-lg text-slate-600">
            Choose a plan that fits your needs and budget. Get started today and transform your hospital's digital experience.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
