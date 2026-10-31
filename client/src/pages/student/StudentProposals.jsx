import { useEffect, useState } from 'react';
import { getMyProposals } from '../../api/student';
import { withdrawProposal } from '../../api/proposal';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentProposals() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyProposals();
            setProposals(data.data || data.proposals || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load proposals'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleWithdraw = async (id) => {
        if (!window.confirm('Withdraw this proposal?')) return;
        try {
            await withdrawProposal(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to withdraw proposal'));
        }
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'yellow',
            accepted: 'green',
            rejected: 'red',
            withdrawn: 'gray',
        };
        return `badge-${map[status] || 'gray'}`;
    };

    if (loading) return <Spinner text="Loading proposals..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>My Proposals</h1>
            </div>

            {proposals.length === 0 ? (
                <EmptyState title="No proposals yet" message="Browse projects and apply to get started." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Proposed Budget</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map((p) => (
                                <tr key={p._id}>
                                    <td className="font-bold">{p.project?.title || 'Project'}</td>
                                    <td>{formatCurrency(p.proposedBudget)}</td>
                                    <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                                    <td>{formatDate(p.createdAt)}</td>
                                    <td>
                                        {p.status === 'pending' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(p._id)}>Withdraw</button>
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