import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProjects } from '../../api/project';
import { getCategories } from '../../api/category';
import { getErrorMessage, formatCurrency, formatDate, skillLabel } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Projects() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const params = { page };
                if (search) params.search = search;
                if (category) params.category = category;
                const { data } = await getProjects(params);
                setProjects(data.data || data.projects || data || []);
                setTotalPages(data.pagination?.pages || 1);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load projects'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [search, category, page]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const { data } = await getCategories();
                setCategories(data.data || data.categories || data || []);
            } catch (err) {
                // ignore
            }
        };
        loadCategories();
    }, []);

    const applyFilters = () => {
        setPage(1);
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        setSearchParams(params);
    };

    return (
        <div className="page-section">
            <div className="container">
                <h1 className="section-title">Find Projects</h1>
                <p className="section-subtitle">Browse projects and apply as a student</p>

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
                    <button className="btn btn-primary" onClick={applyFilters}>Search</button>
                </div>

                {loading ? (
                    <Spinner text="Loading projects..." />
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : projects.length === 0 ? (
                    <EmptyState title="No projects found" message="Try adjusting your search filters." />
                ) : (
                    <>
                        <div className="grid grid-3">
                            {projects.map((p) => (
                                <div key={p._id} className="card card-hover entity-card">
                                    <h3 className="entity-title">
                                        <Link to={`/projects/${p._id}`}>{p.title}</Link>
                                    </h3>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                        {p.description && p.description.length > 120
                                            ? p.description.slice(0, 120) + '...'
                                            : p.description}
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
                                    <div className="entity-meta">
                                        <span className="badge badge-blue">{p.proposalCount || 0} proposals</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>
                                        {p}
                                    </button>
                                ))}
                                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}