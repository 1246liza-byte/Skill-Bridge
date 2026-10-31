import { useEffect, useState } from 'react';
import { getMyClientProfile, updateClientProfile } from '../../api/clientService';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function ClientProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [form, setForm] = useState({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await getMyClientProfile();
                const p = data.profile || data;
                setProfile(p);
                setForm({
                    companyName: p.companyName || '',
                    companyDescription: p.companyDescription || '',
                    website: p.website || '',
                    industry: p.industry || '',
                    location: p.location || '',
                });
            } catch (err) {
                setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to load profile') });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const { data } = await updateClientProfile(form);
            setProfile(data.profile || data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to update profile') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner text="Loading profile..." />;

    return (
        <div>
            <div className="page-header">
                <h1>My Profile</h1>
            </div>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="card" style={{ maxWidth: '700px' }}>
                <h3 className="text-navy mb-2">Company Information</h3>
                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input type="text" name="companyName" className="form-control" value={form.companyName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Company Description</label>
                        <textarea name="companyDescription" className="form-control" value={form.companyDescription} onChange={handleChange} />
                    </div>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label>Website</label>
                            <input type="url" name="website" className="form-control" value={form.website} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Industry</label>
                            <input type="text" name="industry" className="form-control" value={form.industry} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" name="location" className="form-control" value={form.location} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}