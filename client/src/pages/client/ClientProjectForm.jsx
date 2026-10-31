import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProject, updateProject, getProject } from '../../api/project';
import { getCategories } from '../../api/category';
import { getSkills } from '../../api/skill';
import { getErrorMessage, toArray } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';

export default function ClientProjectForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [categories, setCategories] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        requiredSkills: [],
        budgetType: 'fixed',
        budget: '',
        deadline: '',
        projectType: 'one-time',
        visibility: 'public',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [catRes, skillRes] = await Promise.all([getCategories(), getSkills()]);
                setCategories(toArray(catRes));
                setSkills(toArray(skillRes));

                if (isEdit) {
                    const { data } = await getProject(id);
                    const p = data.project || data;
                    setForm({
                        title: p.title || '',
                        description: p.description || '',
                        category: p.category?._id || p.category || '',
                        requiredSkills: (p.requiredSkills || []).map((s) => s._id || s),
                        budgetType: p.budgetType || 'fixed',
                        budget: p.budget || '',
                        deadline: p.deadline ? p.deadline.slice(0, 10) : '',
                        projectType: p.projectType || 'one-time',
                        visibility: p.visibility || 'public',
                    });
                }
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load form data'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

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
        setForm({ ...form, requiredSkills: selected });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (isEdit) {
                await updateProject(id, form);
            } else {
                await createProject(form);
            }
            navigate('/client/projects');
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to save project'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner text="Loading..." />;

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? 'Edit Project' : 'Post a Project'}</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Title</label>
                        <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" className="form-control" value={form.description} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" className="form-control" value={form.category} onChange={handleChange} required>
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Project Type</label>
                            <select name="projectType" className="form-control" value={form.projectType} onChange={handleChange}>
                                <option value="one-time">One-time</option>
                                <option value="ongoing">Ongoing</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Required Skills (hold Ctrl/Cmd to select multiple)</label>
                        <select multiple className="form-control" value={form.requiredSkills} onChange={handleSkillsChange} style={{ minHeight: '120px' }}>
                            {skills.map((s) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-3">
                        <div className="form-group">
                            <label>Budget Type</label>
                            <select name="budgetType" className="form-control" value={form.budgetType} onChange={handleChange}>
                                <option value="fixed">Fixed</option>
                                <option value="hourly">Hourly</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Budget ($)</label>
                            <input type="number" name="budget" className="form-control" value={form.budget} onChange={handleChange} required min="1" />
                        </div>
                        <div className="form-group">
                            <label>Deadline</label>
                            <input type="date" name="deadline" className="form-control" value={form.deadline} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Visibility</label>
                        <select name="visibility" className="form-control" value={form.visibility} onChange={handleChange}>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/client/projects')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}