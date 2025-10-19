import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MedicalIcon } from '../components/icons/MedicalIcon';


const PaymentCancelPage: React.FC = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tranId = searchParams.get('tran_id');
        if (tranId) {
            localStorage.removeItem(`signup_data_${tranId}`);
        }
    }, [searchParams]);
    
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12 md:py-20 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl text-center p-8 md:p-12">
                    <MedicalIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Cancelled</h2>
                    <p className="text-slate-600 mb-6">Your payment process was cancelled, and your registration has not been completed. You can start over at any time.</p>
                    <Link to="/#pricing" className="mt-8 inline-block bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700">Choose a Plan</Link>
                </div>
            </main>
            <Footer />
        </div>
    );
};
export default PaymentCancelPage;
