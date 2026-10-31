import { useEffect, useState } from 'react';
import { getMyOffers } from '../../api/clientService';
import { withdrawOffer } from '../../api/offer';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientOffers() {
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

    const handleWithdraw = async (id) => {
        if (!window.confirm('Withdraw this offer?')) return;
        try {
            await withdrawOffer(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to withdraw offer'));
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
                <EmptyState title="No hiring offers" message="Send offers to students from their profiles." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Project</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((o) => (
                                <tr key={o._id}>
                                    <td className="font-bold">{o.student?.name || 'Student'}</td>
                                    <td>{o.project?.title || 'Project'}</td>
                                    <td>{formatCurrency(o.budget)}</td>
                                    <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                                    <td>
                                        {o.status === 'pending' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(o._id)}>Withdraw</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}