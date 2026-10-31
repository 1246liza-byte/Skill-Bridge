import { useEffect, useState } from 'react';
import { getContactMessages, deleteContactMessage } from '../../api/contact';
import { getErrorMessage, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getContactMessages();
            setMessages(data.data || data.messages || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load messages'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await deleteContactMessage(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete message'));
        }
    };

    if (loading) return <Spinner text="Loading messages..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Contact Messages</h1>
            </div>

            {messages.length === 0 ? (
                <EmptyState title="No messages" message="No contact messages have been submitted." />
            ) : (
                <div className="grid grid-2">
                    {messages.map((m) => (
                        <div key={m._id} className="card">
                            <div className="flex-between mb-1">
                                <h3 className="text-navy">{m.subject || 'No subject'}</h3>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(m.createdAt)}</span>
                            </div>
                            <div className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                                From: {m.name} ({m.email})
                            </div>
                            <p className="mb-2">{m.message}</p>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}