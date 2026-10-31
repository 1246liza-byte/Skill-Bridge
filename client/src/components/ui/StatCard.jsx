export default function StatCard({ label, value, icon, color = 'navy' }) {
    return (
        <div className="card stat-card">
            <div className={`stat-icon stat-${color}`}>{icon}</div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
}