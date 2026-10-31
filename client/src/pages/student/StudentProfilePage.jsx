import { useEffect, useState } from 'react';
import { getMyStudentProfile, updateStudentProfile, addPortfolio, deletePortfolio } from '../../api/student';
import { getSkills } from '../../api/skill';
import { getCategories } from '../../api/category';
import { getErrorMessage, toArray } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function StudentProfilePage() {
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [form, setForm] = useState({});
    const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', link: '' });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [profRes, skillRes, catRes] = await Promise.all([
                    getMyStudentProfile(),
                    getSkills(),
                    getCategories(),
                ]);
                const p = profRes.data.profile || profRes.data;
                setProfile(p);
                const skillList = toArray(skillRes);
                const catList = toArray(catRes);
                setSkills(skillList);
                setCategories(catList);
                setForm({
                    headline: p.headline || '',
                    bio: p.bio || '',
                    hourlyRate: p.hourlyRate || '',
                    projectRate: p.projectRate || '',
                    availability: p.availability || 'available',
                    skills: (p.skills || [])
                        .map((s) => {
                            const match = skillList.find((sk) => sk.name === (s.name || s));
                            return match ? match._id : null;
                        })
                        .filter(Boolean),
                    preferredCategories: (p.preferredCategories || []).map((c) => c._id || c),
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
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSkillsChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) selected.push(options[i].value);
        }
        setForm({ ...form, skills: selected });
    };

    const handleCategoriesChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) selected.push(options[i].value);
        }
        setForm({ ...form, preferredCategories: selected });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            // Transform selected skill IDs into the backend's expected { name, proficiency } format
            const selectedSkills = (form.skills || [])
                .map((id) => {
                    const skill = skills.find((s) => s._id === id);
                    return skill ? { name: skill.name, proficiency: 'Intermediate' } : null;
                })
                .filter(Boolean);

            const payload = {
                ...form,
                skills: selectedSkills,
            };

            const { data } = await updateStudentProfile(payload);
            setProfile(data.profile || data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to update profile') });
        } finally {
            setSaving(false);
        }
    };

    const handlePortfolioChange = (e) => {
        setPortfolioForm({ ...portfolioForm, [e.target.name]: e.target.value });
    };

    const handleAddPortfolio = async (e) => {
        e.preventDefault();
        try {
            const { data } = await addPortfolio(portfolioForm);
            setProfile(data.profile || data);
            setPortfolioForm({ title: '', description: '', link: '' });
            setMessage({ type: 'success', text: 'Portfolio item added!' });
        } catch (err) {
            setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to add portfolio item') });
        }
    };

    const handleDeletePortfolio = async (id) => {
        if (!window.confirm('Delete this portfolio item?')) return;
        try {
            const { data } = await deletePortfolio(id);
            setProfile(data.profile || data);
            setMessage({ type: 'success', text: 'Portfolio item deleted!' });
        } catch (err) {
            setMessage({ type: 'error', text: getErrorMessage(err, 'Failed to delete portfolio item') });
        }
    };

    if (loading) return <Spinner text="Loading profile..." />;

    return (
        <div>
            <div className="page-header">
                <h1>My Profile</h1>
                <span className="badge badge-gold">Completion: {profile?.profileCompletion || 0}%</span>
            </div>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="grid grid-2">
                <div className="card">
                    <h3 className="text-navy mb-2">Profile Information</h3>
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label>Headline</label>
                            <input type="text" name="headline" className="form-control" value={form.headline} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea name="bio" className="form-control" value={form.bio} onChange={handleChange} />
                        </div>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label>Hourly Rate ($)</label>
                                <input type="number" name="hourlyRate" className="form-control" value={form.hourlyRate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Project Rate ($)</label>
                                <input type="number" name="projectRate" className="form-control" value={form.projectRate} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Availability</label>
                            <select name="availability" className="form-control" value={form.availability} onChange={handleChange}>
                                <option value="available">Available</option>
                                <option value="busy">Busy</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Skills (hold Ctrl/Cmd to select multiple)</label>
                            <select multiple className="form-control" value={form.skills} onChange={handleSkillsChange} style={{ minHeight: '120px' }}>
                                {skills.map((s) => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Preferred Categories (hold Ctrl/Cmd to select multiple)</label>
                            <select multiple className="form-control" value={form.preferredCategories} onChange={handleCategoriesChange} style={{ minHeight: '100px' }}>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 className="text-navy mb-2">Portfolio</h3>
                    <form onSubmit={handleAddPortfolio} className="mb-3">
                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" name="title" className="form-control" value={portfolioForm.title} onChange={handlePortfolioChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" className="form-control" value={portfolioForm.description} onChange={handlePortfolioChange} />
                        </div>
                        <div className="form-group">
                            <label>Link</label>
                            <input type="url" name="link" className="form-control" value={portfolioForm.link} onChange={handlePortfolioChange} />
                        </div>
                        <button type="submit" className="btn btn-gold">Add Portfolio Item</button>
                    </form>

                    <h4 className="text-navy mb-2">My Portfolio Items</h4>
                    {(profile?.portfolio || []).length === 0 ? (
                        <p className="text-muted">No portfolio items yet.</p>
                    ) : (
                        profile.portfolio.map((p) => (
                            <div key={p._id} className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div>
                                    <div className="font-bold">{p.title}</div>
                                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>{p.description}</div>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePortfolio(p._id)}>Delete</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}