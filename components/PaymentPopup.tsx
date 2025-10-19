import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

// --- Icon components defined locally to keep file count low ---
const SupportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375a6 6 0 006-6V10.5a6 6 0 10-12 0v1.875a6 6 0 006 6zM12 14.25V18.375" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5V12m7.5-1.5V12" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375a6 6 0 00-6-6V10.5a6 6 0 1112 0v1.875a6 6 0 00-6 6z" /></svg>
);
const FaqIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
);
const OffersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1014.625 7.5H9.375A2.625 2.625 0 1012 4.875z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.875v15" /></svg>
);
const LoginIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m0 0l-3 3m3-3V9" /></svg>
);
const CardCvcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line><line x1="18" y1="14" x2="22" y2="14"></line></svg>
);
const CardIcons: React.FC = () => (
    <div className="flex items-center gap-2">
        <svg className="w-8 h-auto" viewBox="0 0 38 23"><path d="M35 0H3C1.3 0 0 1.3 0 3v17c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#0069B6"/><path d="M35.1 1.6c-.1.1-.2.2-.3.3L22.6 12l-1.9-4.8c-.3-.8-1-1.3-1.8-1.3H11c-.5 0-.9.4-1 .9-.1.5.2 1 .7 1.1l2.6.5c.5.1.8.6.7 1.1l-2.4 6c-.3.8-1 1.3-1.8 1.3H5.9c-.5 0-.9-.4-1-.9-.1-.5.2-1 .7-1.1l2.6-.5c.5-.1.8-.6.7-1.1l-.8-2.3c-.3-.8-1-1.3-1.8-1.3H.1v5.6c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3.6c-.1.1-.3.2-.4.3L35.1 1.6z" fill="#F7A500"/></svg>
        <svg className="w-7 h-auto" viewBox="0 0 52 32"><circle fill="#EB001B" cx="16" cy="16" r="16"/><circle fill="#F79E1B" cx="36" cy="16" r="16"/></svg>
        <svg className="w-8 h-auto" viewBox="0 0 24 24"><path fill="#0077C0" d="M21.5,4H2.5C1.1,4,0,5.1,0,6.5v11C0,18.9,1.1,20,2.5,20h19c1.4,0,2.5-1.1,2.5-2.5v-11C24,5.1,22.9,4,21.5,4z"/><path fill="#FFF" d="M9,13.2H7.2V9.9h1.8V13.2z M8.1,9.2c-0.5,0-0.8-0.4-0.8-0.8s0.3-0.8,0.8-0.8c0.5,0,0.8,0.4,0.8,0.8S8.6,9.2,8.1,9.2z M12.8,13.2h-1.8V9.9h1.7v0.6h0c0.2-0.5,1-0.7,1.6-0.7c0.6,0,1,0.2,1.3,0.6c0.3,0.4,0.5,1,0.5,1.8v1.1H16v-1c0-0.5-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3c-0.4,0-0.8,0.2-1,0.5v1.8H12.8z M18.4,11.3c0-0.8-0.4-1.5-1.4-1.5c-0.8,0-1.3,0.6-1.3,1.5c0,0.8,0.4,1.5,1.4,1.5S18.4,12,18.4,11.3z M16.9,11.3c0,0.4,0.2,0.6,0.5,0.6c0.3,0,0.5-0.2,0.5-0.6s-0.2-0.6-0.5-0.6C17.1,10.7,16.9,10.9,16.9,11.3z"/></svg>
    </div>
);


interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Plan | null;
    onPaymentSuccess: () => void;
}

const PaymentPopup: React.FC<PaymentPopupProps> = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
    const [activeTab, setActiveTab] = useState('CARDS');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state when popup opens
            setIsProcessing(false);
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onPaymentSuccess();
            }, 1500); // Wait 1.5s on success message before calling parent
        }, 2000); // Simulate 2s payment processing
    };

    if (!isOpen || !plan) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Demo Logo */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#169fdf] rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-white font-bold text-sm">DEMO</span>
                </div>

                <div className="pt-12 px-6">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                    <h2 className="text-center text-xl font-bold text-gray-800">Demo</h2>
                    
                    <div className="flex justify-center items-center gap-6 text-xs text-gray-500 my-4">
                        <div className="text-center"><SupportIcon className="h-6 w-6 mx-auto mb-1"/><p>Support</p></div>
                        <div className="text-center"><FaqIcon className="h-6 w-6 mx-auto mb-1"/><p>FAQ</p></div>
                        <div className="text-center relative"><OffersIcon className="h-6 w-6 mx-auto mb-1"/><p>Offers</p><span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span></div>
                        <div className="text-center"><LoginIcon className="h-6 w-6 mx-auto mb-1"/><p>Login</p></div>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="py-12 px-6 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800">Payment Successful!</h3>
                        <p className="text-gray-600 mt-2">Finalizing your account setup...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex border-b">
                            {['CARDS', 'MOBILE BANKING', 'NET BANKING'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handlePayment} className="px-6 py-5">
                            {activeTab === 'CARDS' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <CardIcons />
                                        <a href="#" className="text-blue-600 text-sm font-semibold">Other Cards</a>
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Enter Card Number" className="w-full p-3 border rounded-md" required />
                                    </div>
                                    <div className="flex gap-4">
                                        <input type="text" placeholder="MM/YY" className="w-1/2 p-3 border rounded-md" required />
                                        <div className="w-1/2 relative">
                                            <input type="text" placeholder="CVC/CVV" className="w-full p-3 border rounded-md pr-10" required />
                                            <CardCvcIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <input type="text" placeholder="Card Holder Name" className="w-full p-3 border rounded-md" required />
                                    </div>
                                    <div className="flex items-start text-sm mt-4">
                                        <input type="checkbox" id="save-card" className="mt-1 mr-2"/>
                                        <label htmlFor="save-card" className="text-gray-600">
                                            Save card & remember me <br/>
                                            <span className="text-xs text-gray-500">By checking this box you agree to the <a href="#" className="text-blue-600">Terms of Service</a></span>
                                        </label>
                                    </div>
                                </div>
                            )}
                            {(activeTab === 'MOBILE BANKING' || activeTab === 'NET BANKING') && (
                                <div className="text-center py-8 text-gray-500">
                                    This is a demo. Card payment is the only active tab.
                                </div>
                            )}

                            <div className="bg-gray-100 -mx-6 -mb-5 mt-6 p-4 rounded-b-lg">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-gray-300 text-gray-700 font-bold py-3.5 rounded-md hover:bg-gray-400 transition-colors disabled:bg-blue-300 disabled:cursor-wait"
                                >
                                    {isProcessing ? 'Processing...' : `PAY ${plan.price} BDT`}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentPopup;