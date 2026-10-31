import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getInitials } from '../../utils/format';

const navConfig = {
    student: [
        { to: '/student', label: 'Dashboard', end: true },
        { to: '/student/profile', label: 'My Profile' },
        { to: '/student/projects', label: 'Browse Projects' },
        { to: '/student/proposals', label: 'My Proposals' },
        { to: '/student/offers', label: 'Hiring Offers' },
        { to: '/student/hires', label: 'My Hires' },
        { to: '/student/messages', label: 'Messages' },
        { to: '/student/notifications', label: 'Notifications' },
    ],
    client: [
        { to: '/client', label: 'Dashboard', end: true },
        { to: '/client/profile', label: 'My Profile' },
        { to: '/client/projects', label: 'My Projects' },
        { to: '/client/projects/new', label: 'Post a Project' },
        { to: '/client/proposals', label: 'Proposals' },
        { to: '/client/offers', label: 'Hiring Offers' },
        { to: '/client/hires', label: 'My Hires' },
        { to: '/client/saved-students', label: 'Saved Students' },
        { to: '/client/messages', label: 'Messages' },
        { to: '/client/notifications', label: 'Notifications' },
    ],
    admin: [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/projects', label: 'Projects' },
        { to: '/admin/categories', label: 'Categories' },
        { to: '/admin/skills', label: 'Skills' },
        { to: '/admin/banners', label: 'Banners' },
        { to: '/admin/content', label: 'Site Content' },
        { to: '/admin/reports', label: 'Reports' },
        { to: '/admin/messages', label: 'Contact Messages' },
        { to: '/admin/audit-logs', label: 'Audit Logs' },
        { to: '/admin/notifications', label: 'Notifications' },
    ],
};

export default function DashboardLayout({ role }) {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    const links = navConfig[role] || [];
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <Link to="/">
                        <span className="brand-icon">SB</span>
                        <span>Skills Bridge</span>
                    </Link>
                </div>

                <div className="sidebar-user">
                    <div className="avatar">{getInitials(user?.name)}</div>
                    <div>
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role">{roleLabel}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {link.label}
                            {link.label === 'Notifications' && unreadCount > 0 && (
                                <span className="sidebar-badge">{unreadCount}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-link">
                        View Public Site
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline-gold btn-sm btn-block">
                        Logout
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <div className="dashboard-topbar">
                    <div className="dashboard-topbar-title">
                        {roleLabel} Panel
                    </div>
                    <div className="dashboard-topbar-actions">
                        <Link to={`/${role}/notifications`} className="nav-icon-btn">
                            <span className="icon-bell">🔔</span>
                            {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
                        </Link>
                    </div>
                </div>
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}