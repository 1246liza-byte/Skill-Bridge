import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedStudents } from '../../api/clientService';
import { getErrorMessage, skillLabel } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientSavedStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getSavedStudents();
                setStudents(data.data || data.students || data || []);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load saved students'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading saved students..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Saved Students</h1>
            </div>

            {students.length === 0 ? (
                <EmptyState
                    title="No saved students"
                    message="Browse the student directory and save students you're interested in."
                    action={<Link to="/students" className="btn btn-primary">Find Students</Link>}
                />
            ) : (
                <div className="grid grid-3">
                    {students.map((s) => (
                        <div key={s._id} className="card card-hover entity-card">
                            <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                <div className="avatar">{s.name ? s.name[0] : '?'}</div>
                                <div>
                                    <h3 className="entity-title">
                                        <Link to={`/students/${s._id}`}>{s.name}</Link>
                                    </h3>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                        {s.headline || 'Student'}
                                    </div>
                                </div>
                            </div>
                            <div className="entity-meta">
                                <span className="badge badge-gold">{s.hourlyRate ? `$${s.hourlyRate}/hr` : 'Rate N/A'}</span>
                                <span className="badge badge-blue">{s.availability || 'Available'}</span>
                            </div>
                            <div className="entity-tags">
                                {(s.skills || []).slice(0, 3).map((sk, i) => (
                                    <span key={sk._id || sk || i} className="tag">{skillLabel(sk)}</span>
                                ))}
                            </div>
                            <Link to={`/students/${s._id}`} className="btn btn-outline btn-sm mt-2">View Profile</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}