export default function EmptyState({ title, message, action }) {
    return (
        <div className="empty-state">
            <h3>{title || 'Nothing here yet'}</h3>
            {message && <p>{message}</p>}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}