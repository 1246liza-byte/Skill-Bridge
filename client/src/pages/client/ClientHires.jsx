import { useEffect, useState } from 'react';
import { getMyHires } from '../../api/clientService';
import { completeHire, cancelHire } from '../../api/hire';
import { getErrorMessage, formatCurrency } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientHires() {
    const [hires, setHires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyHires();
            setHires(data.data || data.hires || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load hires'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleComplete = async (id) => {
        if (!window.confirm('Mark this hire as completed?')) return;
        try {
            await completeHire(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to complete hire'));
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this hire?')) return;
        try {
            await cancelHire(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to cancel hire'));
        }
    };

    const statusBadge = (status) => {
        const map = {
            active: 'green',
            completed: 'navy',
            cancelled: 'red',
        };
        return `badge-${map[status] || 'gray'}`;
    };

    if (loading) return <Spinner text="Loading hires..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>My Hires</h1>
            </div>

            {hires.length === 0 ? (
                <EmptyState title="No hires" message="When you accept a proposal or a student accepts your offer, hires appear here." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Student</th>
                                <th>Agreed Budget</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hires.map((h) => (
                                <tr key={h._id}>
                                    <td className="font-bold">{h.project?.title || 'Project'}</td>
                                    <td>{h.student?.name || 'Student'}</td>
                                    <td>{formatCurrency(h.agreedBudget)}</td>
                                    <td><span className="badge badge-blue">{h.source}</span></td>
                                    <td><span className={`badge ${statusBadge(h.status)}`}>{h.status}</span></td>
                                    <td>
                                        {h.status === 'active' && (
                                            <div className="flex gap-1">
                                                <button className="btn btn-success btn-sm" onClick={() => handleComplete(h._id)}>Complete</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(h._id)}>Cancel</button>
                                            </div>
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