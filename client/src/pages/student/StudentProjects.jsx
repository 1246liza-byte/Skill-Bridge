import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../../api/project';
import { getCategories } from '../../api/category';
import { getErrorMessage, formatCurrency, formatDate, toArray, skillLabel } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentProjects() {
    const [projects, setProjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const params = {};
                if (search) params.search = search;
                if (category) params.category = category;
                const [projRes, catRes] = await Promise.all([
                    getProjects(params),
                    getCategories(),
                ]);
                setProjects(toArray(projRes));
                setCategories(toArray(catRes));
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load projects'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [search, category]);

    return (
        <div>
            <div className="page-header">
                <h1>Browse Projects</h1>
            </div>

            <div className="filter-bar">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <Spinner text="Loading projects..." />
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : projects.length === 0 ? (
                <EmptyState title="No projects found" message="Try adjusting your search." />
            ) : (
                <div className="grid grid-3">
                    {projects.map((p) => (
                        <div key={p._id} className="card card-hover entity-card">
                            <h3 className="entity-title">
                                <Link to={`/projects/${p._id}`}>{p.title}</Link>
                            </h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                {p.description && p.description.length > 100 ? p.description.slice(0, 100) + '...' : p.description}
                            </p>
                            <div className="entity-meta">
                                <span className="badge badge-navy">{p.budgetType}</span>
                                <span className="font-bold text-navy">{formatCurrency(p.budget)}</span>
                                <span>Deadline: {formatDate(p.deadline)}</span>
                            </div>
                            <div className="entity-tags">
                                {(p.requiredSkills || []).slice(0, 3).map((s, i) => (
                                    <span key={s._id || s || i} className="tag">{skillLabel(s)}</span>
                                ))}
                            </div>
                            <Link to={`/projects/${p._id}`} className="btn btn-gold btn-sm mt-2">Apply</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}