import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProjects } from '../../api/clientService';
import { deleteProject, publishProject } from '../../api/project';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ClientProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await deleteProject(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete project'));
        }
    };

    const handlePublish = async (id) => {
        try {
            await publishProject(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to publish project'));
        }
    };

    const statusBadge = (status) => {
        const map = {
            draft: 'gray',
            open: 'green',
            'in-progress': 'yellow',
            completed: 'navy',
            closed: 'gray',
            cancelled: 'red',
        };
        return `badge-${map[status] || 'gray'}`;
    };

    if (loading) return <Spinner text="Loading projects..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>My Projects</h1>
                <Link to="/client/projects/new" className="btn btn-gold">Post a Project</Link>
            </div>

            {projects.length === 0 ? (
                <EmptyState
                    title="No projects yet"
                    message="Post your first project to start receiving proposals."
                    action={<Link to="/client/projects/new" className="btn btn-primary">Post a Project</Link>}
                />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Proposals</th>
                                <th>Deadline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p._id}>
                                    <td className="font-bold">{p.title}</td>
                                    <td>{formatCurrency(p.budget)}</td>
                                    <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                                    <td>{p.proposalCount || 0}</td>
                                    <td>{formatDate(p.deadline)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Link to={`/client/projects/${p._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                                            {p.status === 'draft' && (
                                                <button className="btn btn-success btn-sm" onClick={() => handlePublish(p._id)}>Publish</button>
                                            )}
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                                        </div>
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