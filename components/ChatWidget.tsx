import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { auth, db, firebase } from '../firebase';
import { PlanTier, ChatMessage } from '../types';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';
import { BotIcon } from './icons/BotIcon';

interface ChatWidgetProps {
    hospitalId: string;
    hospitalName: string;
    plan: PlanTier;
    themeColor?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ hospitalId, hospitalName, plan, themeColor = '#0D9488' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const apiKey = process.env.API_KEY;
        if (apiKey) {
            setAi(new GoogleGenAI({ apiKey }));
        }
    }, []);

    useEffect(() => {
        if (!isOpen || !currentUser || !hospitalId) return;

        const chatRef = db.collection('users').doc(hospitalId).collection('chats').doc(currentUser.uid).collection('messages').orderBy('timestamp', 'asc');
        
        const unsubscribe = chatRef.onSnapshot(snapshot => {
            const fetchedMessages: ChatMessage[] = [];
            snapshot.forEach(doc => {
                fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(fetchedMessages);
        }, err => {
            console.error("Error fetching chat messages:", err);
            setError("Could not load messages.");
        });

        return () => unsubscribe();
    }, [isOpen, currentUser, hospitalId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const getPatientName = async (user: firebase.User): Promise<string> => {
        if (user.displayName) {
            return user.displayName;
        }
        try {
            const patientDoc = await db.collection('patients').doc(user.uid).get();
            if (patientDoc.exists) {
                return patientDoc.data()?.name || 'Patient';
            }
        } catch (error) {
            console.error("Error fetching patient name for chat:", error);
        }
        return 'Patient';
    };


    const handleSend = async () => {
        if (!input.trim() || isLoading || !currentUser || !hospitalId) return;

        const userMessageText = input;
        setInput('');
        
        const patientName = await getPatientName(currentUser);

        const chatRef = db.collection('users').doc(hospitalId).collection('chats').doc(currentUser.uid);
        const messagesRef = chatRef.collection('messages');
        
        const messageData = {
            text: userMessageText,
            senderId: currentUser.uid,
            senderName: patientName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            // Use a transaction to ensure both writes succeed or fail together
            await db.runTransaction(async (transaction) => {
                transaction.set(chatRef, {
                    patientName: patientName,
                    lastMessage: userMessageText,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });

                const newMessageRef = messagesRef.doc();
                transaction.set(newMessageRef, messageData);
            });
            
            // Trigger AI response
            if (ai) {
                 setIsLoading(true);
                 triggerAIResponse(userMessageText);
            }

        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message.");
        }
    };
    
    const triggerAIResponse = async (userMessage: string) => {
        if(!ai || !currentUser) return;
        
        try {
            const systemInstruction = `You are a helpful and friendly customer service assistant for ${hospitalName}. Your goal is to answer general questions about the hospital, such as opening hours, available doctors, services, or location.
            **Do not provide any medical advice or diagnosis.** If a user asks for medical advice, you must politely decline and recommend they book an appointment with a doctor. Keep your answers concise.`;

            const history = messages.map(msg => ({
                role: msg.senderId === currentUser.uid ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
                config: { systemInstruction },
            });
            
            const aiMessage = {
                text: response.text,
                senderId: 'AI',
                senderName: 'AI Assistant',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection('users').doc(hospitalId).collection('chats').doc(currentUser.uid).collection('messages').add(aiMessage);

        } catch(err) {
            console.error("Gemini API Error:", err);
            // Don't show an error in the chat, just fail silently. The manager can still respond.
        } finally {
            setIsLoading(false);
        }
    }

    if (!currentUser || (plan !== PlanTier.Premium && plan !== PlanTier.Golden)) {
        return null;
    }

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:opacity-90"
                    style={{ backgroundColor: themeColor }}
                    aria-label="Open Chat"
                >
                    <ChatBubbleIcon className="h-8 w-8" />
                </button>
            </div>

             <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b rounded-t-2xl text-white" style={{backgroundColor: themeColor}}>
                    <div className="flex items-center gap-3">
                        <ChatBubbleIcon className="h-6 w-6" />
                        <h3 className="font-bold text-lg">{hospitalName} Support</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)}>
                        <XIcon className="h-6 w-6" />
                    </button>
                </header>

                <div className="flex-grow p-4 overflow-y-auto bg-slate-100">
                    <div className="space-y-4">
                         {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                {msg.senderId === 'AI' && <BotIcon className="h-6 w-6 bg-slate-200 text-slate-600 p-1 rounded-full mb-1" />}
                                 <div className={`max-w-xs px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.senderId === currentUser.uid ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 shadow-sm'}`}>
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
                            placeholder="Type a message..."
                            className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:border-transparent transition"
                            style={{'--tw-ring-color': themeColor} as React.CSSProperties}
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center disabled:opacity-50" style={{backgroundColor: themeColor}}>
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default ChatWidget;