import { useEffect, useState } from 'react';
import { getMyOffers } from '../../api/student';
import { acceptOffer, rejectOffer } from '../../api/offer';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentOffers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyOffers();
            setOffers(data.data || data.offers || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load offers'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAccept = async (id) => {
        if (!window.confirm('Accept this hiring offer?')) return;
        try {
            await acceptOffer(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to accept offer'));
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this hiring offer?')) return;
        try {
            await rejectOffer(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to reject offer'));
        }
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'yellow',
            accepted: 'green',
            rejected: 'red',
            withdrawn: 'gray',
            expired: 'gray',
        };
        return `badge-${map[status] || 'gray'}`;
    };

    if (loading) return <Spinner text="Loading offers..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Hiring Offers</h1>
            </div>

            {offers.length === 0 ? (
                <EmptyState title="No hiring offers" message="When clients send you offers, they'll appear here." />
            ) : (
                <div className="grid grid-2">
                    {offers.map((o) => (
                        <div key={o._id} className="card">
                            <div className="flex-between mb-1">
                                <h3 className="text-navy">{o.project?.title || 'Project'}</h3>
                                <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
                            </div>
                            <p className="text-muted mb-2">{o.message}</p>
                            <div className="entity-meta mb-2">
                                <span className="badge badge-gold">{formatCurrency(o.budget)}</span>
                                <span>Deadline: {formatDate(o.deadline)}</span>
                            </div>
                            {o.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(o._id)}>Accept</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(o._id)}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}