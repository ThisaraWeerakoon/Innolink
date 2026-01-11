import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';

const ChatBox = ({ dealId, userId, recipientId }) => {
    const { api } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);

    // Initial fetch for history
    const fetchMessages = async () => {
        try {
            let url = `/chat/messages?dealId=${dealId}&userId=${userId}`;
            if (recipientId) {
                url += `&recipientId=${recipientId}`;
            }
            const res = await api.get(url);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    useEffect(() => {
        fetchMessages();

        // WebSocket Connection
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
        const baseUrl = apiUrl.replace(/\/api$/, '');
        const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws';

        const client = new Client({
            brokerURL: wsUrl,
            onConnect: () => {
                console.log('Connected to WebSocket');
                // Subscribe to deal topic. 
                // Ideally for 1-on-1, we should filter on client side or have specific topic.
                // Current backend broadcasts to /topic/deal/{dealId}.
                // We will filter received messages to match our conversation.
                client.subscribe(`/topic/deal/${dealId}`, (message) => {
                    const receivedMsg = JSON.parse(message.body);
                    console.log("Received WS message:", receivedMsg);

                    // Filter: Only add if it belongs to this conversation
                    // i.e., (sender=me AND recipient=them) OR (sender=them AND recipient=me)
                    // Note: recipientId prop is the ID of the OTHER person.

                    const msgSenderId = receivedMsg.sender.id;
                    const msgRecipientId = receivedMsg.recipient?.id;

                    // Case 1: I sent it.
                    // If I sent it, I want to see it if I sent it TO the person I'm currently chatting with.
                    // OR if I sent it to NULL (group chat) and I'm in group chat mode (recipientId is null).
                    const iSentIt = msgSenderId === userId;
                    const sentToCurrentRecipient = recipientId ? msgRecipientId === recipientId : !msgRecipientId;

                    // Case 2: They sent it.
                    // If they sent it, I want to see it if it was sent TO ME.
                    // OR if it was sent to NULL (group chat) and I'm in group chat mode.
                    // AND the sender is the person I'm chatting with.
                    const theySentIt = recipientId && msgSenderId === recipientId;
                    const sentToMe = msgRecipientId === userId;
                    const sentToGroup = !msgRecipientId;

                    let isRelevant = false;

                    if (iSentIt && sentToCurrentRecipient) {
                        isRelevant = true;
                    } else if (theySentIt && (sentToMe || sentToGroup)) {
                        // If I'm chatting with User A, and User A sends a message to Me (or Group), I show it.
                        isRelevant = true;
                    } else if (!recipientId && sentToGroup) {
                        // Group chat mode: show all group messages.
                        isRelevant = true;
                    }

                    if (isRelevant) {
                        setMessages(prev => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === receivedMsg.id)) return prev;
                            return [...prev, receivedMsg];
                        });
                    }
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
    }, [dealId, userId, recipientId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: `/app/chat/${dealId}/sendMessage`,
                body: JSON.stringify({
                    dealId,
                    senderId: userId,
                    recipientId, // Add recipientId
                    content: newMessage
                }),
            });
            setNewMessage("");
        } else {
            console.error("WebSocket is not connected");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender.id === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender.id === userId
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[10px] mt-1 block text-right ${msg.sender.id === userId ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="text-sm">No messages yet.</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                )}
            </div>
            <form onSubmit={handleSend} className="border-t border-slate-200 p-4 bg-white flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
