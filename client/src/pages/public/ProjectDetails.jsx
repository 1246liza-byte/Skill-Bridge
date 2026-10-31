import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProject } from '../../api/project';
import { createProposal } from '../../api/proposal';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, formatCurrency, formatDate, skillLabel } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function ProjectDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showProposal, setShowProposal] = useState(false);
    const [proposal, setProposal] = useState({ coverLetter: '', proposedBudget: '' });
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getProject(id);
                setProject(data.project || data);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load project'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleProposalChange = (e) => {
        setProposal({ ...proposal, [e.target.name]: e.target.value });
    };

    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);
        try {
            await createProposal({
                project: id,
                coverLetter: proposal.coverLetter,
                proposedBudget: proposal.proposedBudget,
            });
            setShowProposal(false);
            setProposal({ coverLetter: '', proposedBudget: '' });
            alert('Proposal submitted successfully!');
        } catch (err) {
            setSubmitError(getErrorMessage(err, 'Failed to submit proposal'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner text="Loading project..." />;
    if (error) return <div className="container page-section"><div className="alert alert-error">{error}</div></div>;
    if (!project) return <div className="container page-section"><div className="alert alert-info">Project not found</div></div>;

    const canApply = user && user.role === 'student' && project.status === 'open';

    return (
        <div className="page-section">
            <div className="container">
                <div className="card">
                    <div className="flex-between mb-2">
                        <h1 className="section-title" style={{ fontSize: '1.8rem' }}>{project.title}</h1>
                        <span className="badge badge-navy">{project.status}</span>
                    </div>

                    <div className="entity-meta mb-3">
                        <span className="badge badge-gold">{project.budgetType}</span>
                        <span className="font-bold text-navy">{formatCurrency(project.budget)}</span>
                        <span>Deadline: {formatDate(project.deadline)}</span>
                        <span>{project.proposalCount || 0} proposals</span>
                    </div>

                    <div className="mb-3">
                        <h3 className="text-navy mb-1">Description</h3>
                        <p className="text-muted" style={{ lineHeight: '1.8' }}>{project.description}</p>
                    </div>

                    <div className="mb-3">
                        <h3 className="text-navy mb-1">Required Skills</h3>
                        <div className="entity-tags">
                            {(project.requiredSkills || []).map((s, i) => (
                                <span key={s._id || s || i} className="tag">{skillLabel(s)}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <h3 className="text-navy mb-1">Project Type</h3>
                        <span className="badge badge-blue">{project.projectType}</span>
                    </div>

                    {canApply && !showProposal && (
                        <button className="btn btn-gold" onClick={() => setShowProposal(true)}>
                            Apply for this Project
                        </button>
                    )}

                    {canApply && showProposal && (
                        <div className="card mt-3" style={{ background: 'var(--light-blue)' }}>
                            <h3 className="text-navy mb-2">Submit Proposal</h3>
                            {submitError && <div className="alert alert-error">{submitError}</div>}
                            <form onSubmit={handleSubmitProposal}>
                                <div className="form-group">
                                    <label>Cover Letter</label>
                                    <textarea
                                        name="coverLetter"
                                        className="form-control"
                                        value={proposal.coverLetter}
                                        onChange={handleProposalChange}
                                        required
                                        placeholder="Tell the client why you're the right fit..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Proposed Budget (USD)</label>
                                    <input
                                        type="number"
                                        name="proposedBudget"
                                        className="form-control"
                                        value={proposal.proposedBudget}
                                        onChange={handleProposalChange}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Submit Proposal'}
                                    </button>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowProposal(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {!user && (
                        <div className="alert alert-info mt-3">
                            <Link to="/login">Login</Link> as a student to apply for this project.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}