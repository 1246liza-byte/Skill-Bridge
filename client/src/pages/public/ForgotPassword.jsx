import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { getErrorMessage } from '../../utils/format';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setLoading(true);
        try {
            await forgotPassword({ email });
            setStatus({ type: 'success', message: 'If an account exists with that email, a reset link has been sent.' });
        } catch (err) {
            setStatus({ type: 'error', message: getErrorMessage(err, 'Failed to send reset link') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Forgot Password</h1>
                <p className="auth-subtitle">Enter your email to receive a reset link</p>

                {status.message && <div className={`alert alert-${status.type}`}>{status.message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}