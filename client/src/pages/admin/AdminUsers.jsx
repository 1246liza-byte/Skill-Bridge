import { useEffect, useState } from 'react';
import { getUsers, suspendUser, restoreUser, deleteUser } from '../../api/admin';
import { getErrorMessage, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (roleFilter) params.role = roleFilter;
            if (search) params.search = search;
            const { data } = await getUsers(params);
            setUsers(data.data || data.users || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load users'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [roleFilter, search]);

    const handleSuspend = async (id) => {
        if (!window.confirm('Suspend this user?')) return;
        try {
            await suspendUser(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to suspend user'));
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm('Restore this user?')) return;
        try {
            await restoreUser(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to restore user'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Permanently delete this user?')) return;
        try {
            await deleteUser(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete user'));
        }
    };

    const roleBadge = (role) => {
        const map = { admin: 'gold', student: 'blue', client: 'green' };
        return `badge-${map[role] || 'gray'}`;
    };

    const statusBadge = (status) => {
        return status === 'active' ? 'badge-green' : 'badge-red';
    };

    if (loading) return <Spinner text="Loading users..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>User Management</h1>
            </div>

            <div className="filter-bar">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="form-control" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {users.length === 0 ? (
                <EmptyState title="No users found" message="Try adjusting your filters." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td className="font-bold">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                                    <td><span className={`badge ${statusBadge(u.status)}`}>{u.status}</span></td>
                                    <td>{formatDate(u.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            {u.status === 'active' ? (
                                                <button className="btn btn-warning btn-sm" onClick={() => handleSuspend(u._id)}>Suspend</button>
                                            ) : (
                                                <button className="btn btn-success btn-sm" onClick={() => handleRestore(u._id)}>Restore</button>
                                            )}
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
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