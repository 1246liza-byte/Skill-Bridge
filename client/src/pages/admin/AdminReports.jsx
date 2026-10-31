import { useEffect, useState } from 'react';
import { getReports, updateReportStatus } from '../../api/report';
import { getErrorMessage, formatDate } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getReports();
            setReports(data.data || data.reports || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load reports'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await updateReportStatus(id, { status });
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to update report'));
        }
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'yellow',
            reviewed: 'blue',
            resolved: 'green',
            dismissed: 'gray',
        };
        return `badge-${map[status] || 'gray'}`;
    };

    if (loading) return <Spinner text="Loading reports..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Reports</h1>
            </div>

            {reports.length === 0 ? (
                <EmptyState title="No reports" message="No reports have been submitted." />
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Reporter</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((r) => (
                                <tr key={r._id}>
                                    <td><span className="badge badge-blue">{r.reportType}</span></td>
                                    <td>{r.reporter?.name || 'User'}</td>
                                    <td>{r.reason}</td>
                                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                                    <td>{formatDate(r.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button className="btn btn-success btn-sm" onClick={() => handleStatus(r._id, 'resolved')}>Resolve</button>
                                            <button className="btn btn-outline btn-sm" onClick={() => handleStatus(r._id, 'dismissed')}>Dismiss</button>
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