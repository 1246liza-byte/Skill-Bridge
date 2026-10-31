import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getAdminDashboard();
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
                <h1>Admin Dashboard</h1>
            </div>

            <div className="grid grid-4 mb-3">
                <StatCard label="Total Users" value={stats.totalUsers || 0} icon="👥" color="navy" />
                <StatCard label="Students" value={stats.totalStudents || 0} icon="🎓" color="gold" />
                <StatCard label="Clients" value={stats.totalClients || 0} icon="💼" color="green" />
                <StatCard label="Total Projects" value={stats.totalProjects || 0} icon="📋" color="red" />
            </div>

            <div className="grid grid-4 mb-3">
                <StatCard label="Open Projects" value={stats.openProjects || 0} icon="📂" color="navy" />
                <StatCard label="Active Hires" value={stats.activeHires || 0} icon="💼" color="gold" />
                <StatCard label="Pending Reports" value={stats.pendingReports || 0} icon="🚩" color="red" />
                <StatCard label="Contact Messages" value={stats.contactMessages || 0} icon="📧" color="green" />
            </div>

            <div className="grid grid-2">
                <div className="card card-accent">
                    <h3 className="text-navy mb-2">Recent Users</h3>
                    {(data.recentUsers || []).length === 0 ? (
                        <p className="text-muted">No users yet.</p>
                    ) : (
                        data.recentUsers.map((u) => (
                            <div key={u._id} className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div>
                                    <div className="font-bold">{u.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{u.email}</div>
                                </div>
                                <span className={`badge badge-${u.role === 'admin' ? 'gold' : u.role === 'student' ? 'blue' : 'green'}`}>{u.role}</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="card card-accent">
                    <h3 className="text-navy mb-2">Recent Projects</h3>
                    {(data.recentProjects || []).length === 0 ? (
                        <p className="text-muted">No projects yet.</p>
                    ) : (
                        data.recentProjects.map((p) => (
                            <div key={p._id} className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div>
                                    <div className="font-bold">{p.title}</div>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{p.owner?.name || 'Owner'}</div>
                                </div>
                                <span className={`badge badge-${p.status === 'open' ? 'green' : p.status === 'in-progress' ? 'yellow' : 'gray'}`}>{p.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}