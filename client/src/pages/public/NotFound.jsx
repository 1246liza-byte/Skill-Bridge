import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="page-section">
            <div className="container text-center">
                <h1 style={{ fontSize: '4rem', color: 'var(--navy)' }}>404</h1>
                <h2 className="text-navy mb-2">Page Not Found</h2>
                <p className="text-muted mb-3">The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="btn btn-primary">Go Home</Link>
            </div>
        </div>
    );
}