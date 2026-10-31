import { useEffect, useState } from 'react';
import { getBanners, createBanner, updateBanner, deleteBanner, uploadImage } from '../../api/site';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ title: '', description: '', image: '', link: '', published: true });
    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getBanners();
            setBanners(data.data || data.banners || data || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load banners'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setError('');
            const { data } = await uploadImage(file);
            const url = data.data?.url || data.url;
            setForm({ ...form, image: url });
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to upload image'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                await updateBanner(editingId, form);
                setEditingId(null);
            } else {
                await createBanner(form);
            }
            setForm({ title: '', description: '', image: '', link: '', published: true });
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save banner'));
        }
    };

    const handleEdit = (b) => {
        setEditingId(b._id);
        setForm({ title: b.title, description: b.description || '', image: b.image || '', link: b.link || '', published: b.published });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await deleteBanner(id);
            load();
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to delete banner'));
        }
    };

    if (loading) return <Spinner text="Loading banners..." />;
    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Banners</h1>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <h3 className="text-navy mb-2">{editingId ? 'Edit Banner' : 'Add Banner'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" className="form-control" value={form.description} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Image</label>
                            <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} />
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                Upload an image, or paste a URL below.
                            </div>
                            <input type="url" name="image" className="form-control mt-1" value={form.image} onChange={handleChange} placeholder="https://res.cloudinary.com/..." />
                            {form.image && <img src={form.image} alt="Banner preview" style={{ marginTop: '8px', maxHeight: '80px', borderRadius: '6px' }} />}
                        </div>
                        <div className="form-group">
                            <label>Link</label>
                            <input type="url" name="link" className="form-control" value={form.link} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>
                                <input type="checkbox" name="published" checked={form.published} onChange={handleChange} /> Published
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
                            {editingId && (
                                <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm({ title: '', description: '', image: '', link: '', published: true }); }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h3 className="text-navy mb-2">All Banners</h3>
                    {banners.length === 0 ? (
                        <EmptyState title="No banners" message="Add your first banner." />
                    ) : (
                        banners.map((b) => (
                            <div key={b._id} className="flex-between mb-1" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <div>
                                    <div className="font-bold">{b.title} {b.published ? <span className="badge badge-green">Published</span> : <span className="badge badge-gray">Draft</span>}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{b.description}</div>
                                </div>
                                <div className="flex gap-1">
                                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(b)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}