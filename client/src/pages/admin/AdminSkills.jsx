import { useEffect, useState } from 'react';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../../api/skill';
import { getCategories } from '../../api/category';
import { getErrorMessage, toArray } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminSkills() {
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', category: '' });
    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const [skillRes, catRes] = await Promise.all([getSkills(), getCategories()]);
            setSkills(toArray(skillRes));
            setCategories(toArray(catRes));
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load skills'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await updateSkill(editingId, form);
                setEditingId(null);
            } else {
                await createSkill(form);
            }
            setForm({ name: '', category: '' });
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save skill'));
        }
    };

    const handleEdit = (s) => {
        setEditingId(s._id);
        setForm({ name: s.name, category: s.category?._id || s.category || '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this skill?')) return;
        try {
            await deleteSkill(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete skill'));
        }
    };

    const categoryName = (id) => {
        const c = categories.find((cat) => cat._id === id);
        return c ? c.name : 'Uncategorized';
    };

    if (loading) return <Spinner text="Loading skills..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Skills</h1>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <h3 className="text-navy mb-2">{editingId ? 'Edit Skill' : 'Add Skill'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Skill Name</label>
                            <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" className="form-control" value={form.category} onChange={handleChange} required>
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
                            {editingId && (
                                <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm({ name: '', category: '' }); }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h3 className="text-navy mb-2">All Skills</h3>
                    {skills.length === 0 ? (
                        <EmptyState title="No skills" message="Add your first skill." />
                    ) : (
                        skills.map((s) => (
                            <div key={s._id} className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div>
                                    <div className="font-bold">{s.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{categoryName(s.category?._id || s.category)}</div>
                                </div>
                                <div className="flex gap-1">
                                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}