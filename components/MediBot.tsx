import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BotIcon } from './icons/BotIcon';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const MediBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // As requested, using the provided API key directly to ensure functionality.
        const apiKey = "AIzaSyDw5kuULKWXi8hDr_BhQyEUfZbVC_S7gcE";
        setAi(new GoogleGenAI({ apiKey }));
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !ai) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const systemInstruction = `You are MediBot, a friendly and knowledgeable AI medical assistant. You can provide general information about health topics, symptoms, and medical terminology.
            **Crucially, you must always include the following disclaimer at the end of your response: 'Disclaimer: I am an AI assistant and not a medical professional. Please consult with a qualified healthcare provider for any medical advice or diagnosis.'**`;

            const contents = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));
            contents.push({ role: 'user', parts: [{ text: input }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: { systemInstruction },
            });

            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (err: any) {
            console.error("MediBot Error:", err);
            const errorMessage = err.toString();
            if (errorMessage.includes("API_KEY_INVALID")) {
                setError('MediBot is offline: The provided API key is invalid. Please check the configuration.');
            } else {
                setError('Sorry, something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-primary-700"
                    aria-label="Open MediBot"
                >
                    <BotIcon className="h-8 w-8" />
                </button>
            </div>

            <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <BotIcon className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg text-slate-800">MediBot Assistant</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto bg-slate-100">
                    <div className="space-y-4">
                        <div className="p-3 bg-primary-100 text-primary-800 rounded-lg text-sm">
                            Hello! I'm MediBot, your AI medical assistant. How can I help you today?
                        </div>
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-slate-800 shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start">
                                <div className="max-w-xs px-4 py-2 rounded-2xl bg-white text-slate-800 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {error && <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <footer className="p-4 border-t">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask a medical question..."
                            className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                            disabled={isLoading || !ai}
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim() || !ai} className="bg-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center disabled:bg-primary-300">
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default MediBot;