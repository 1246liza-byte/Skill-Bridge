import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getConversations, getConversation, createConversation } from '../../api/conversation';
import { getMessages, sendMessage, markAsRead } from '../../api/message';
import { getErrorMessage, timeAgo, getInitials } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Messages() {
    const { user } = useAuth();
    const { socket } = useNotifications();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const loadConversations = async () => {
        try {
            const { data } = await getConversations();
            setConversations(data.data || data.conversations || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load conversations'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (activeConv) {
            const loadMessages = async () => {
                try {
                    const { data } = await getMessages(activeConv._id);
                    setMessages(data.data || data.messages || data || []);
                    markAsRead(activeConv._id);
                    socket?.emit('join-conversation', activeConv._id);
                } catch (err) {
                    setError(getErrorMessage(err, 'Failed to load messages'));
                }
            };
            loadMessages();
        }
    }, [activeConv, socket]);

    useEffect(() => {
        if (!socket) return;
        const handleMessage = (message) => {
            if (activeConv && message.conversation === activeConv._id) {
                setMessages((prev) => [...prev, message]);
            }
            loadConversations();
        };
        socket.on('message:new', handleMessage);
        return () => {
            socket.off('message:new', handleMessage);
        };
    }, [socket, activeConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openConversation = async (conv) => {
        setActiveConv(conv);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() || !activeConv) return;
        setSending(true);
        try {
            const { data } = await sendMessage(activeConv._id, { content: text });
            setMessages((prev) => [...prev, data.message || data]);
            setText('');
            loadConversations();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to send message'));
        } finally {
            setSending(false);
        }
    };

    const otherParticipant = (conv) => {
        if (!conv || !conv.participants) return null;
        return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0];
    };

    if (loading) return <Spinner text="Loading conversations..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Messages</h1>
            </div>

            <div className="messages-layout">
                <div className="conversation-list">
                    {conversations.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px' }}>
                            <h3>No conversations</h3>
                            <p>Start a conversation with a student or client.</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const other = otherParticipant(conv);
                            return (
                                <div
                                    key={conv._id}
                                    className={`conversation-item ${activeConv?._id === conv._id ? 'active' : ''}`}
                                    onClick={() => openConversation(conv)}
                                >
                                    <div className="flex-between">
                                        <span className="conv-name">{other?.name || 'User'}</span>
                                        <span className="conv-time">{timeAgo(conv.lastMessageAt)}</span>
                                    </div>
                                    <div className="conv-preview">{conv.lastMessage || 'No messages yet'}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="chat-window">
                    {!activeConv ? (
                        <div className="empty-state" style={{ flex: 1 }}>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation to start messaging.</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-header">
                                {otherParticipant(activeConv)?.name || 'Conversation'}
                            </div>
                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    messages.map((m) => (
                                        <div
                                            key={m._id}
                                            className={`message-bubble ${m.sender === user?._id ? 'mine' : 'theirs'}`}
                                        >
                                            {m.content}
                                            <span className="msg-time">{timeAgo(m.createdAt)}</span>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="chat-input" onSubmit={handleSend}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type a message..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                                    Send
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}