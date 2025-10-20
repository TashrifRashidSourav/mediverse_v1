import React, { useState, useEffect, useRef } from 'react';
import { db, auth, firebase } from '../../../firebase';
import { ChatMessage, PlanTier, User } from '../../../types';
import { SendIcon } from '../../../components/icons/SendIcon';
import { BotIcon } from '../../../components/icons/BotIcon';

interface ChatThread {
    hospitalId: string;
    hospitalName: string;
    lastMessage: string;
    lastUpdated: any;
    logoUrl?: string;
}

const PatientChatPage: React.FC = () => {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        setIsLoadingThreads(true);

        const fetchThreads = async () => {
            try {
                const hospitalsSnapshot = await db.collection('users').get();
                const chatThreads: ChatThread[] = [];

                const chatPromises = hospitalsSnapshot.docs.map(async (hospitalDoc) => {
                    const hospitalData = hospitalDoc.data() as User;
                    if (hospitalData.plan !== PlanTier.Premium && hospitalData.plan !== PlanTier.Golden) {
                        return null;
                    }
                    const chatDoc = await db.collection('users').doc(hospitalDoc.id).collection('chats').doc(currentUser.uid).get();
                    if (chatDoc.exists) {
                        const chatData = chatDoc.data();
                        return {
                            hospitalId: hospitalDoc.id,
                            hospitalName: hospitalData.hospitalName,
                            lastMessage: chatData?.lastMessage || '',
                            lastUpdated: chatData?.lastUpdated,
                            logoUrl: hospitalData.logoUrl,
                        };
                    }
                    return null;
                });

                const results = await Promise.all(chatPromises);
                const validThreads = results.filter(thread => thread !== null) as ChatThread[];
                
                validThreads.sort((a,b) => b.lastUpdated?.toMillis() - a.lastUpdated?.toMillis());

                setThreads(validThreads);
            } catch (error) {
                console.error("Error fetching patient chat threads:", error);
            } finally {
                setIsLoadingThreads(false);
            }
        };

        fetchThreads();
    }, [currentUser]);

    useEffect(() => {
        if (!selectedThread || !currentUser) return;
        setIsLoadingMessages(true);
        const unsubscribe = db.collection('users').doc(selectedThread.hospitalId).collection('chats')
            .doc(currentUser.uid).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
                setIsLoadingMessages(false);
            });
        return () => unsubscribe();
    }, [selectedThread, currentUser]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = async () => {
        if(!input.trim() || !selectedThread || !currentUser) return;
        
        const patientName = currentUser.displayName || (await db.collection('patients').doc(currentUser.uid).get()).data()?.name || 'Patient';

        const messageData = {
            text: input,
            senderId: currentUser.uid,
            senderName: patientName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };
        
        const currentInput = input;
        setInput('');
        
        const chatRef = db.collection('users').doc(selectedThread.hospitalId).collection('chats').doc(currentUser.uid);
        
        await chatRef.collection('messages').add(messageData);
        await chatRef.update({
            patientName: patientName,
            lastMessage: currentInput,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    };

    return (
        <div className="h-[calc(100vh-100px)] flex bg-white rounded-xl shadow-md overflow-hidden">
            {/* Thread List */}
            <div className="w-full md:w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-slate-800">My Chats</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoadingThreads ? <p className="p-4 text-slate-500">Loading chats...</p> : threads.length === 0 ? <p className="p-4 text-slate-500">No chats found. Start a chat on a hospital's website.</p> : (
                        <ul>
                            {threads.map(thread => (
                                <li key={thread.hospitalId}>
                                    <button onClick={() => setSelectedThread(thread)} className={`w-full text-left p-4 border-b hover:bg-slate-50 flex items-center gap-3 ${selectedThread?.hospitalId === thread.hospitalId ? 'bg-primary-50' : ''}`}>
                                        <img src={thread.logoUrl} alt={thread.hospitalName} className="w-10 h-10 rounded-full object-contain bg-slate-200" />
                                        <div className="flex-grow overflow-hidden">
                                            <p className="font-bold text-slate-900">{thread.hospitalName}</p>
                                            <p className="text-sm text-slate-600 truncate">{thread.lastMessage}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Message View */}
            <div className="w-2/3 flex-col hidden md:flex">
                {selectedThread && currentUser ? (
                    <>
                        <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
                             <img src={selectedThread.logoUrl} alt={selectedThread.hospitalName} className="w-8 h-8 rounded-full object-contain bg-slate-200" />
                            <h3 className="font-bold text-lg text-slate-800">{selectedThread.hospitalName}</h3>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-slate-100">
                             {isLoadingMessages ? <p>Loading messages...</p> :
                                <div className="space-y-4">
                                     {messages.map(msg => (
                                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                            {(msg.senderId !== currentUser.uid && msg.senderId !== 'AI') && <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs mb-1">H</div>}
                                            {msg.senderId === 'AI' && <BotIcon className="h-6 w-6 bg-slate-200 text-slate-600 p-1 rounded-full mb-1" />}
                                            <div className={`max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.senderId === currentUser.uid ? 'bg-primary text-white' : 'bg-white text-slate-800 shadow-sm'}`}>
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
                                    placeholder="Type your message..."
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

export default PatientChatPage;