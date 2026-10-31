import { useEffect, useState } from 'react';
import { getMyProjects } from '../../api/clientService';
import { getProjectProposals, acceptProposal, rejectProposal } from '../../api/proposal';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientProposals() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getMyProjects();
                setProjects(data.data || data.projects || data || []);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load projects'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const loadProposals = async (projectId) => {
        setSelectedProject(projectId);
        setLoading(true);
        setError('');
        try {
            const { data } = await getProjectProposals(projectId);
            setProposals(data.data || data.proposals || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load proposals'));
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        if (!window.confirm('Accept this proposal? This will create a hire.')) return;
        try {
            await acceptProposal(id);
            loadProposals(selectedProject);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to accept proposal'));
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this proposal?')) return;
        try {
            await rejectProposal(id);
            loadProposals(selectedProject);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to reject proposal'));
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

    return (
        <div>
            <div className="page-header">
                <h1>Proposals</h1>
            </div>

            <div className="filter-bar">
                <select className="form-control" value={selectedProject} onChange={(e) => loadProposals(e.target.value)}>
                    <option value="">Select a project</option>
                    {projects.map((p) => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <Spinner text="Loading proposals..." />
            ) : !selectedProject ? (
                <EmptyState title="Select a project" message="Choose a project to view its proposals." />
            ) : proposals.length === 0 ? (
                <EmptyState title="No proposals" message="No proposals for this project yet." />
            ) : (
                <div className="grid grid-2">
                    {proposals.map((p) => (
                        <div key={p._id} className="card">
                            <div className="flex-between mb-1">
                                <h3 className="text-navy">{p.student?.name || 'Student'}</h3>
                                <span className={`badge ${statusBadge(p.status)}`}>{p.status}</span>
                            </div>
                            <p className="text-muted mb-2">{p.coverLetter}</p>
                            <div className="entity-meta mb-2">
                                <span className="badge badge-gold">{formatCurrency(p.proposedBudget)}</span>
                                <span>Submitted: {formatDate(p.createdAt)}</span>
                            </div>
                            {p.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button className="btn btn-success btn-sm" onClick={() => handleAccept(p._id)}>Accept</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(p._id)}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}