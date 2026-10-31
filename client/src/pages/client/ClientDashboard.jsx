import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientDashboard } from '../../api/clientService';
import { getErrorMessage, formatCurrency } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';

export default function ClientDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getClientDashboard();
                setData(data);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load dashboard'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading dashboard..." />;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!data) return null;

    const stats = data.stats || {};

    return (
        <div>
            <div className="page-header">
                <h1>Client Dashboard</h1>
                <Link to="/client/projects/new" className="btn btn-gold">Post a Project</Link>
            </div>

            <div className="grid grid-4 mb-3">
                <StatCard label="Total Projects" value={stats.totalProjects || 0} icon="📋" color="navy" />
                <StatCard label="Open Projects" value={stats.openProjects || 0} icon="📂" color="gold" />
                <StatCard label="Total Proposals" value={stats.totalProposals || 0} icon="📝" color="green" />
                <StatCard label="Active Hires" value={stats.activeHires || 0} icon="💼" color="red" />
            </div>

            <div className="grid grid-2">
                <div className="card card-accent">
                    <h3 className="text-navy mb-2">Recent Projects</h3>
                    {(data.recentProjects || []).length === 0 ? (
                        <p className="text-muted">No projects yet. Post your first project!</p>
                    ) : (
                        data.recentProjects.map((p) => (
                            <div key={p._id} className="mb-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                <div className="flex-between">
                                    <span className="font-bold">{p.title}</span>
                                    <span className={`badge badge-${p.status === 'open' ? 'green' : p.status === 'in-progress' ? 'yellow' : 'gray'}`}>{p.status}</span>
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                    {formatCurrency(p.budget)} • {p.proposalCount || 0} proposals
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="card card-accent">
                    <h3 className="text-navy mb-2">Recent Proposals</h3>
                    {(data.recentProposals || []).length === 0 ? (
                        <p className="text-muted">No proposals received yet.</p>
                    ) : (
                        data.recentProposals.map((p) => (
                            <div key={p._id} className="mb-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                <div className="flex-between">
                                    <span className="font-bold">{p.student?.name || 'Student'}</span>
                                    <span className={`badge badge-${p.status === 'accepted' ? 'green' : p.status === 'rejected' ? 'red' : 'yellow'}`}>{p.status}</span>
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                    {p.project?.title} • ${p.proposedBudget}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}