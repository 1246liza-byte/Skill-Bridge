import { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { submitContact } from '../../api/contact';
import { getErrorMessage } from '../../utils/format';

export default function Contact() {
    const { settings } = useSite();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setLoading(true);
        try {
            await submitContact(form);
            setStatus({ type: 'success', message: 'Your message has been sent. We will get back to you soon!' });
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', message: getErrorMessage(err, 'Failed to send message') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <section className="hero">
                <div className="container">
                    <h1 className="animate-fade-in-up">Contact Us</h1>
                    <p className="animate-fade-in-up delay-1">We'd love to hear from you</p>
                </div>
            </section>

            <div className="page-section">
                <div className="container">
                    <div className="grid grid-2">
                        <div className="card card-accent animate-fade-in-up">
                            <h3 className="text-navy mb-2">Send us a message</h3>
                            {status.message && (
                                <div className={`alert alert-${status.type}`}>{status.message}</div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input type="text" name="subject" className="form-control" value={form.subject} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea name="message" className="form-control" value={form.message} onChange={handleChange} required />
                                </div>
                                <button type="submit" className="btn btn-gold" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>

                        <div className="card card-navy animate-fade-in-up delay-1">
                            <h3 className="mb-2">Contact Information</h3>
                            <div className="mb-2">
                                <div className="font-bold">Email</div>
                                <div className="text-muted">{settings?.contactEmail || 'support@skillsbridge.com'}</div>
                            </div>
                            <div className="mb-2">
                                <div className="font-bold">Phone</div>
                                <div className="text-muted">{settings?.contactPhone || '+1 (555) 123-4567'}</div>
                            </div>
                            <div className="mb-2">
                                <div className="font-bold">Address</div>
                                <div className="text-muted">{settings?.address || '123 University Avenue, Tech City'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}