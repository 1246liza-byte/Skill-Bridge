import { useEffect, useState } from 'react';
import { getAdminProjects, updateAdminProject, deleteAdminProject } from '../../api/admin';
import { getErrorMessage, formatCurrency, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getAdminProjects();
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

    const handleStatusChange = async (id, status) => {
        try {
            await updateAdminProject(id, { status });
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to update project'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await deleteAdminProject(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete project'));
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
                <h1>Project Management</h1>
            </div>

            {projects.length === 0 ? (
                <EmptyState title="No projects" message="No projects have been posted yet." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Owner</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p._id}>
                                    <td className="font-bold">{p.title}</td>
                                    <td>{p.owner?.name || 'Owner'}</td>
                                    <td>{formatCurrency(p.budget)}</td>
                                    <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                                    <td>{formatDate(p.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <select
                                                className="form-control"
                                                style={{ width: 'auto', padding: '4px 8px' }}
                                                value={p.status}
                                                onChange={(e) => handleStatusChange(p._id, e.target.value)}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="open">Open</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                                <option value="closed">Closed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
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