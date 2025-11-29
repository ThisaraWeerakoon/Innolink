import { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../context/AuthContext';

const ChatBox = ({ dealId, userId, otherUserName }) => {
    const { api } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);

    // Initial fetch for history
    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/messages?dealId=${dealId}&userId=${userId}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    useEffect(() => {
        fetchMessages();

        // WebSocket Connection
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';

        const client = new Client({
            brokerURL: wsUrl,
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe(`/topic/deal/${dealId}`, (message) => {
                    const receivedMsg = JSON.parse(message.body);
                    setMessages(prev => [...prev, receivedMsg]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [dealId, userId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/chat/${dealId}/sendMessage`,
                body: JSON.stringify({
                    dealId,
                    senderId: userId,
                    content: newMessage
                }),
            });
            setNewMessage("");
        } else {
            console.error("WebSocket is not connected");
        }
    };

    return (
        <div className="flex flex-col h-full">
            {otherUserName && (
                <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-slate-700">
                    Chat with {otherUserName}
                </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender.id === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.sender.id === userId
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}>
                            <p>{msg.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <p className="text-center text-slate-400 text-sm mt-10">No messages yet. Start the conversation!</p>
                )}
            </div>
            <form onSubmit={handleSend} className="border-t border-slate-200 p-3 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
