import React, { useState, useEffect, useRef } from 'react';
import { db, auth, firebase } from '../../firebase';
import { ChatMessage } from '../../types';
import { SendIcon } from '../../components/icons/SendIcon';
import { BotIcon } from '../../components/icons/BotIcon';

interface ChatThread {
    patientId: string;
    patientName: string;
    lastMessage: string;
    lastUpdated: any;
}

const ChatManagement: React.FC = () => {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) setHospitalId(user.uid);
    }, []);

    useEffect(() => {
        if (!hospitalId) return;
        setIsLoadingThreads(true);
        const unsubscribe = db.collection('users').doc(hospitalId).collection('chats')
            .orderBy('lastUpdated', 'desc')
            .onSnapshot(snapshot => {
                const chatThreads = snapshot.docs.map(doc => ({
                    patientId: doc.id,
                    ...doc.data(),
                } as ChatThread));
                setThreads(chatThreads);
                setIsLoadingThreads(false);
            });
        return () => unsubscribe();
    }, [hospitalId]);

    useEffect(() => {
        if (!selectedThread || !hospitalId) return;
        setIsLoadingMessages(true);
        const unsubscribe = db.collection('users').doc(hospitalId).collection('chats')
            .doc(selectedThread.patientId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
                setIsLoadingMessages(false);
            });
        return () => unsubscribe();
    }, [selectedThread, hospitalId]);
    
     const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = async () => {
        if(!input.trim() || !selectedThread || !hospitalId) return;

        const messageData = {
            text: input,
            senderId: hospitalId,
            senderName: 'Hospital Support',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };
        
        setInput('');
        
        const chatRef = db.collection('users').doc(hospitalId).collection('chats').doc(selectedThread.patientId);
        
        await chatRef.collection('messages').add(messageData);
        await chatRef.update({
            lastMessage: input,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    };

    return (
        <div className="h-[calc(100vh-100px)] flex bg-white rounded-xl shadow-md overflow-hidden">
            {/* Thread List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">Patient Chats</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoadingThreads ? <p className="p-4 text-slate-500">Loading chats...</p> : threads.length === 0 ? <p className="p-4 text-slate-500">No patient chats yet.</p> : (
                        <ul>
                            {threads.map(thread => (
                                <li key={thread.patientId}>
                                    <button onClick={() => setSelectedThread(thread)} className={`w-full text-left p-4 border-b hover:bg-slate-50 ${selectedThread?.patientId === thread.patientId ? 'bg-primary-50' : ''}`}>
                                        <p className="font-bold text-slate-900">{thread.patientName}</p>
                                        <p className="text-sm text-slate-600 truncate">{thread.lastMessage}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Message View */}
            <div className="w-2/3 flex flex-col">
                {selectedThread ? (
                    <>
                        <div className="p-4 border-b bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">{selectedThread.patientName}</h3>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-slate-100">
                             {isLoadingMessages ? <p>Loading messages...</p> :
                                <div className="space-y-4">
                                     {messages.map(msg => (
                                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === hospitalId ? 'justify-end' : 'justify-start'}`}>
                                             {msg.senderId === 'AI' && <BotIcon className="h-6 w-6 bg-slate-200 text-slate-600 p-1 rounded-full mb-1" />}
                                            <div className={`max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.senderId === hospitalId ? 'bg-primary text-white' : 'bg-white text-slate-800 shadow-sm'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                             }
                        </div>
                        <div className="p-4 border-t bg-white">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your reply..."
                                    className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition"
                                />
                                <button onClick={handleSendMessage} disabled={!input.trim()} className="bg-primary text-white rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center disabled:bg-primary-300">
                                    <SendIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-slate-500">
                        <p>Select a chat to view messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;
