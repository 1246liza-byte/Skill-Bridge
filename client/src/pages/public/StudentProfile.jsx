import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicStudentProfile } from '../../api/student';
import { getReviewsForUser } from '../../api/review';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, formatDate, skillLabel } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function StudentProfile() {
    const { id } = useParams();
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [studRes, revRes] = await Promise.all([
                    getPublicStudentProfile(id),
                    getReviewsForUser(id),
                ]);
                setStudent(studRes.data.student || studRes.data);
                setReviews(revRes.data.reviews || revRes.data || []);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load student profile'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <Spinner text="Loading profile..." />;
    if (error) return <div className="container page-section"><div className="alert alert-error">{error}</div></div>;
    if (!student) return <div className="container page-section"><div className="alert alert-info">Student not found</div></div>;

    return (
        <div className="page-section">
            <div className="container">
                <div className="card">
                    <div className="profile-header">
                        <div className="avatar">{student.name ? student.name[0] : '?'}</div>
                        <div>
                            <h2>{student.name}</h2>
                            <div className="profile-headline">{student.headline || 'Student'}</div>
                            <div className="entity-meta mt-1">
                                <span className="badge badge-gold">{student.hourlyRate ? `$${student.hourlyRate}/hr` : 'Rate N/A'}</span>
                                <span className="badge badge-blue">{student.availability || 'Available'}</span>
                                {student.rating > 0 && <span className="badge badge-navy">★ {student.rating.toFixed(1)}</span>}
                            </div>
                        </div>
                        {user && user.role === 'client' && (
                            <div style={{ marginLeft: 'auto' }}>
                                <Link to={`/client/messages`} className="btn btn-primary">Message</Link>
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <h3 className="text-navy mb-1">About</h3>
                        <p className="text-muted">{student.bio || 'No bio provided yet.'}</p>
                    </div>

                    <div className="mb-3">
                        <h3 className="text-navy mb-1">Skills</h3>
                        <div className="entity-tags">
                            {(student.skills || []).map((sk, i) => (
                                <span key={sk._id || sk || i} className="tag">{skillLabel(sk)}</span>
                            ))}
                        </div>
                    </div>

                    {student.education && student.education.length > 0 && (
                        <div className="mb-3">
                            <h3 className="text-navy mb-1">Education</h3>
                            {student.education.map((e, i) => (
                                <div key={i} className="mb-1">
                                    <div className="font-bold">{e.degree} in {e.field}</div>
                                    <div className="text-muted">{e.institution} ({e.startYear} - {e.endYear || 'Present'})</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {student.portfolio && student.portfolio.length > 0 && (
                        <div className="mb-3">
                            <h3 className="text-navy mb-1">Portfolio</h3>
                            <div className="grid grid-3">
                                {student.portfolio.map((p) => (
                                    <div key={p._id} className="card">
                                        <h4 className="text-navy">{p.title}</h4>
                                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>{p.description}</p>
                                        {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-1">View</a>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {reviews.length > 0 && (
                        <div>
                            <h3 className="text-navy mb-1">Reviews</h3>
                            {reviews.map((r) => (
                                <div key={r._id} className="card mb-1">
                                    <div className="flex-between">
                                        <span className="font-bold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(r.createdAt)}</span>
                                    </div>
                                    <p className="text-muted mt-1">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}