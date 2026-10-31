import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { settings } = useSite();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    const siteName = settings?.siteName || 'Skills Bridge';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinkClass = ({ isActive }) =>
        `nav-link ${isActive ? 'active' : ''}`;

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    {settings?.logo ? (
                        <img src={settings.logo} alt={siteName} className="brand-logo" />
                    ) : (
                        <span className="brand-icon">SB</span>
                    )}
                    <span className="brand-name">{siteName}</span>
                </Link>

                <nav className="navbar-links">
                    <NavLink to="/" className={navLinkClass} end>
                        Home
                    </NavLink>
                    <NavLink to="/students" className={navLinkClass}>
                        Find Students
                    </NavLink>
                    <NavLink to="/projects" className={navLinkClass}>
                        Find Projects
                    </NavLink>
                    <NavLink to="/about" className={navLinkClass}>
                        About
                    </NavLink>
                    <NavLink to="/contact" className={navLinkClass}>
                        Contact
                    </NavLink>
                </nav>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link to={`/${user.role}/notifications`} className="nav-icon-btn">
                                <span className="icon-bell">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="icon-badge">{unreadCount}</span>
                                )}
                            </Link>
                            <Link to={`/${user.role}`} className="btn btn-gold btn-sm">
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline btn-sm">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-gold btn-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}