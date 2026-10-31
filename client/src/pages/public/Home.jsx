import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { getProjects } from '../../api/project';
import { getAllStudents } from '../../api/student';
import { getCategories } from '../../api/category';
import { formatCurrency, formatDate, toArray, skillLabel } from '../../utils/format';

export default function Home() {
    const { settings, banners } = useSite();
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [featuredStudents, setFeaturedStudents] = useState([]);
    const [categories, setCategories] = useState([]);

    const heroTitle = settings?.homepage?.heroTitle || 'Find Skilled Students for Your Next Project';
    const heroSubtitle = settings?.homepage?.heroSubtitle || 'Hire talented students for web development, design, writing, and more.';
    const features = settings?.homepage?.features || [];

    useEffect(() => {
        const load = async () => {
            try {
                const [projRes, studRes, catRes] = await Promise.all([
                    getProjects({ limit: 3, featured: true }),
                    getAllStudents({ limit: 3 }),
                    getCategories(),
                ]);
                setFeaturedProjects(toArray(projRes));
                setFeaturedStudents(toArray(studRes));
                setCategories(toArray(catRes));
            } catch (err) {
                // ignore
            }
        };
        load();
    }, []);

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <h1 className="animate-fade-in-up">{heroTitle}</h1>
                    <p className="animate-fade-in-up delay-1">{heroSubtitle}</p>
                    <div className="hero-actions animate-fade-in-up delay-2">
                        <Link to="/register" className="btn btn-gold">Get Started</Link>
                        <Link to="/projects" className="btn btn-outline-gold">Browse Projects</Link>
                    </div>
                </div>
            </section>

            {/* Banners */}
            {banners && banners.length > 0 && (
                <section className="page-section">
                    <div className="container">
                        <div className="grid grid-3">
                            {banners.map((b) => (
                                <div key={b._id} className="card card-hover">
                                    {b.image && (
                                        <div className="banner-image">
                                            <img src={b.image} alt={b.title} />
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h3 className="text-navy mb-1">{b.title}</h3>
                                        <p className="text-muted">{b.description}</p>
                                        {b.link && (
                                            <a href={b.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-2">
                                                Learn More
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="page-section" style={{ background: 'var(--white)' }}>
                <div className="container">
                    <h2 className="section-title text-center">Browse by Category</h2>
                    <p className="section-subtitle text-center">Find the right talent for your project</p>
                    <div className="grid grid-4">
                        {categories.map((c) => (
                            <Link to={`/projects?category=${c._id}`} key={c._id} className="card card-hover text-center animate-fade-in-up">
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{c.icon || '📁'}</div>
                                <h3 className="text-navy" style={{ fontSize: '1rem' }}>{c.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="page-section">
                <div className="container">
                    <div className="flex-between mb-3">
                        <h2 className="section-title">Featured Projects</h2>
                        <Link to="/projects" className="btn btn-outline btn-sm">View All</Link>
                    </div>
                    <div className="grid grid-3">
                        {featuredProjects.map((p) => (
                            <div key={p._id} className="card card-hover entity-card animate-fade-in-up">
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
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Students */}
            <section className="page-section" style={{ background: 'var(--white)' }}>
                <div className="container">
                    <div className="flex-between mb-3">
                        <h2 className="section-title">Top Students</h2>
                        <Link to="/students" className="btn btn-outline btn-sm">View All</Link>
                    </div>
                    <div className="grid grid-3">
                        {featuredStudents.map((s) => (
                            <div key={s._id} className="card card-hover entity-card animate-fade-in-up">
                                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                    <div className="avatar">{s.name ? s.name[0] : '?'}</div>
                                    <div>
                                        <h3 className="entity-title">
                                            <Link to={`/students/${s._id}`}>{s.name}</Link>
                                        </h3>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            {s.headline || 'Student'}
                                        </div>
                                    </div>
                                </div>
                                <div className="entity-meta">
                                    <span className="badge badge-gold">{s.hourlyRate ? `$${s.hourlyRate}/hr` : 'Rate N/A'}</span>
                                    <span className="badge badge-blue">{s.availability || 'Available'}</span>
                                </div>
                                <div className="entity-tags">
                                    {(s.skills || []).slice(0, 3).map((sk, i) => (
                                        <span key={sk._id || sk || i} className="tag">{skillLabel(sk)}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            {features.length > 0 && (
                <section className="page-section">
                    <div className="container">
                        <h2 className="section-title text-center">Why Skills Bridge?</h2>
                        <p className="section-subtitle text-center">Built for students and clients alike</p>
                        <div className="grid grid-3">
                            {features.map((f, i) => (
                                <div key={i} className="card text-center animate-fade-in-up">
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
                                    <h3 className="text-navy mb-1">{f.title}</h3>
                                    <p className="text-muted">{f.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}