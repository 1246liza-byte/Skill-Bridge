import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/format';

export default function Register() {
    const { registerStudent, registerClient } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('student');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companyDescription: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            let user;
            if (role === 'student') {
                user = await registerStudent({ name: form.name, email: form.email, password: form.password });
            } else {
                user = await registerClient({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    companyName: form.companyName,
                    companyDescription: form.companyDescription,
                });
            }
            navigate(`/${user.role}`);
        } catch (err) {
            setError(getErrorMessage(err, 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card animate-fade-in-up">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join Skills Bridge today</p>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab ${role === 'student' ? 'active' : ''}`}
                        onClick={() => setRole('student')}
                    >
                        I'm a Student
                    </button>
                    <button
                        type="button"
                        className={`auth-tab ${role === 'client' ? 'active' : ''}`}
                        onClick={() => setRole('client')}
                    >
                        I'm a Client
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{role === 'student' ? 'Full Name' : 'Your Name'}</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {role === 'client' && (
                        <>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="form-control"
                                    value={form.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Company Description</label>
                                <textarea
                                    name="companyDescription"
                                    className="form-control"
                                    value={form.companyDescription}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
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
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-gold btn-block" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}