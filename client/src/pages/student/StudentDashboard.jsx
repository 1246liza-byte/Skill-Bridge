import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../../api/student';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';

export default function StudentDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getStudentDashboard();
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

    const stats = data.stats || data;

    return (
        <div>
            <div className="page-header">
                <h1>Student Dashboard</h1>
                <Link to="/projects" className="btn btn-gold">Browse Projects</Link>
            </div>

            <div className="grid grid-4 mb-3">
                <StatCard label="Total Proposals" value={stats.totalProposals || 0} icon="📝" color="navy" />
                <StatCard label="Pending Proposals" value={stats.pendingProposals || 0} icon="⏳" color="gold" />
                <StatCard label="Active Projects" value={stats.activeProjects || 0} icon="💼" color="green" />
                <StatCard label="Completed Projects" value={stats.completedProjects || 0} icon="✅" color="red" />
            </div>

            <div className="grid grid-4 mb-3">
                <StatCard label="Total Offers" value={stats.totalOffers || 0} icon="📨" color="navy" />
                <StatCard label="Pending Offers" value={stats.pendingOffers || 0} icon="📬" color="gold" />
                <StatCard label="Unread Messages" value={stats.unreadMessages || 0} icon="💬" color="green" />
                <StatCard label="Unread Notifications" value={stats.unreadNotifications || 0} icon="🔔" color="red" />
            </div>

            <div className="card card-accent">
                <h3 className="text-navy mb-2">Profile Completion</h3>
                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${Math.min(stats.profileCompletion || 0, 100)}%` }}
                    />
                </div>
                <p className="text-muted mt-1">
                    {stats.profileCompletion || 0}% complete —{' '}
                    <Link to="/student/profile" className="text-gold">Complete your profile</Link> to get more offers.
                </p>
            </div>
        </div>
    );
}