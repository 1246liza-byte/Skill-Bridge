import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { getErrorMessage } from '../../utils/format';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (form.password !== form.confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, { password: form.password });
            setStatus({ type: 'success', message: 'Password reset successfully!' });
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setStatus({ type: 'error', message: getErrorMessage(err, 'Failed to reset password') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Reset Password</h1>
                <p className="auth-subtitle">Enter your new password</p>

                {status.message && <div className={`alert alert-${status.type}`}>{status.message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}