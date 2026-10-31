import { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings, uploadImage } from '../../api/site';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function AdminContent() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [form, setForm] = useState({});

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await getSiteSettings();
                const s = data.settings || data;
                setSettings(s);
                setForm({
                    siteName: s.siteName || '',
                    tagline: s.tagline || '',
                    logo: s.logo || '',
                    aboutUs: s.aboutUs || '',
                    contactEmail: s.contactEmail || '',
                    contactPhone: s.contactPhone || '',
                    address: s.address || '',
                    footerText: s.footerText || '',
                    primaryColor: s.primaryColor || '#1B365D',
                    accentColor: s.accentColor || '#D4AF37',
                    heroTitle: s.homepage?.heroTitle || '',
                    heroSubtitle: s.homepage?.heroSubtitle || '',
                    facebook: s.socialLinks?.facebook || '',
                    twitter: s.socialLinks?.twitter || '',
                    linkedin: s.socialLinks?.linkedin || '',
                    instagram: s.socialLinks?.instagram || '',
                });
            } catch (err) {
                setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to load settings') });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setMessage({ type: '', text: 'Uploading logo...' });
            const { data } = await uploadImage(file);
            const url = data.data?.url || data.url;
            setForm({ ...form, logo: url });
            setMessage({ type: 'success', text: 'Logo uploaded! Click Save All Changes to apply.' });
        } catch (err) {
            setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to upload logo') });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const payload = {
                siteName: form.siteName,
                tagline: form.tagline,
                logo: form.logo,
                aboutUs: form.aboutUs,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
                address: form.address,
                footerText: form.footerText,
                primaryColor: form.primaryColor,
                accentColor: form.accentColor,
                homepage: {
                    heroTitle: form.heroTitle,
                    heroSubtitle: form.heroSubtitle,
                },
                socialLinks: {
                    facebook: form.facebook,
                    twitter: form.twitter,
                    linkedin: form.linkedin,
                    instagram: form.instagram,
                },
            };
            await updateSiteSettings(payload);
            setMessage({ type: 'success', text: 'Site content updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to update settings') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner text="Loading settings..." />;

    return (
        <div>
            <div className="page-header">
                <h1>Site Content</h1>
            </div>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSave}>
                <div className="content-editor">
                    <div className="card">
                        <h3 className="text-navy mb-2">General</h3>
                        <div className="form-group">
                            <label>Site Name</label>
                            <input type="text" name="siteName" className="form-control" value={form.siteName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Tagline</label>
                            <input type="text" name="tagline" className="form-control" value={form.tagline} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Logo</label>
                            <input type="file" accept="image/*" className="form-control" onChange={handleLogoUpload} />
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                Upload a logo image, or paste a URL below.
                            </div>
                            <input type="url" name="logo" className="form-control mt-1" value={form.logo} onChange={handleChange} placeholder="https://res.cloudinary.com/..." />
                            {form.logo && <img src={form.logo} alt="Logo preview" style={{ marginTop: '8px', maxHeight: '60px' }} />}
                        </div>
                        <div className="form-group">
                            <label>About Us</label>
                            <textarea name="aboutUs" className="form-control" value={form.aboutUs} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Footer Text</label>
                            <input type="text" name="footerText" className="form-control" value={form.footerText} onChange={handleChange} />
                        </div>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label>Primary Color</label>
                                <input type="color" name="primaryColor" className="form-control" value={form.primaryColor} onChange={handleChange} style={{ padding: '4px' }} />
                            </div>
                            <div className="form-group">
                                <label>Accent Color</label>
                                <input type="color" name="accentColor" className="form-control" value={form.accentColor} onChange={handleChange} style={{ padding: '4px' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-navy mb-2">Homepage</h3>
                        <div className="form-group">
                            <label>Hero Title</label>
                            <input type="text" name="heroTitle" className="form-control" value={form.heroTitle} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Hero Subtitle</label>
                            <textarea name="heroSubtitle" className="form-control" value={form.heroSubtitle} onChange={handleChange} />
                        </div>

                        <h3 className="text-navy mb-2 mt-3">Contact Info</h3>
                        <div className="form-group">
                            <label>Contact Email</label>
                            <input type="email" name="contactEmail" className="form-control" value={form.contactEmail} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input type="text" name="contactPhone" className="form-control" value={form.contactPhone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" name="address" className="form-control" value={form.address} onChange={handleChange} />
                        </div>

                        <h3 className="text-navy mb-2 mt-3">Social Links</h3>
                        <div className="form-group">
                            <label>Facebook</label>
                            <input type="url" name="facebook" className="form-control" value={form.facebook} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Twitter</label>
                            <input type="url" name="twitter" className="form-control" value={form.twitter} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>LinkedIn</label>
                            <input type="url" name="linkedin" className="form-control" value={form.linkedin} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Instagram</label>
                            <input type="url" name="instagram" className="form-control" value={form.instagram} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="mt-3">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}