import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/format';
import EmptyState from '../../components/ui/EmptyState';

export default function Notifications() {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    return (
        <div>
            <div className="page-header">
                <h1>Notifications</h1>
                {notifications.length > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <EmptyState title="No notifications" message="You're all caught up!" />
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`notification-item ${n.read ? '' : 'unread'}`}
                            onClick={() => !n.read && markAsRead(n._id)}
                            style={{ cursor: n.read ? 'default' : 'pointer' }}
                        >
                            <div className="notif-icon">🔔</div>
                            <div style={{ flex: 1 }}>
                                <div className="notif-title">{n.title}</div>
                                <div className="notif-message">{n.message}</div>
                                <div className="notif-time">{timeAgo(n.createdAt)}</div>
                            </div>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(n._id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}