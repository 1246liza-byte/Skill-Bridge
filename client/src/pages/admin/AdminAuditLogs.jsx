import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/admin';
import { getErrorMessage, formatDateTime } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminAuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await getAuditLogs();
                setLogs(data.data || data.logs || data || []);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load audit logs'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading audit logs..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Audit Logs</h1>
            </div>

            {logs.length === 0 ? (
                <EmptyState title="No audit logs" message="Admin actions will be logged here." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Admin</th>
                                <th>Action</th>
                                <th>Target</th>
                                <th>Details</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((l) => (
                                <tr key={l._id}>
                                    <td className="font-bold">{l.admin?.name || 'Admin'}</td>
                                    <td><span className="badge badge-navy">{l.action}</span></td>
                                    <td>{l.targetType} {l.targetId ? `(${l.targetId.slice(0, 8)}...)` : ''}</td>
                                    <td>{l.details || '-'}</td>
                                    <td>{formatDateTime(l.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}