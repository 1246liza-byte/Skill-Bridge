import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/category';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#1B365D' });
    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getCategories();
            setCategories(data.data || data.categories || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load categories'));
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
                await updateCategory(editingId, form);
                setEditingId(null);
            } else {
                await createCategory(form);
            }
            setForm({ name: '', description: '', icon: '', color: '#1B365D' });
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save category'));
        }
    };

    const handleEdit = (c) => {
        setEditingId(c._id);
        setForm({ name: c.name, description: c.description || '', icon: c.icon || '', color: c.color || '#1B365D' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await deleteCategory(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete category'));
        }
    };

    if (loading) return <Spinner text="Loading categories..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Categories</h1>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <h3 className="text-navy mb-2">{editingId ? 'Edit Category' : 'Add Category'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" className="form-control" value={form.description} onChange={handleChange} />
                        </div>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label>Icon (emoji)</label>
                                <input type="text" name="icon" className="form-control" value={form.icon} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <input type="color" name="color" className="form-control" value={form.color} onChange={handleChange} style={{ padding: '4px' }} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
                            {editingId && (
                                <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm({ name: '', description: '', icon: '', color: '#1B365D' }); }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h3 className="text-navy mb-2">All Categories</h3>
                    {categories.length === 0 ? (
                        <EmptyState title="No categories" message="Add your first category." />
                    ) : (
                        categories.map((c) => (
                            <div key={c._id} className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.3rem' }}>{c.icon || '📁'}</span>
                                    <div>
                                        <div className="font-bold">{c.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{c.description}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}