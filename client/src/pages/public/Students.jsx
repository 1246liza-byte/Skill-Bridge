import { useEffect, useState } from 'react';
import { skillLabel } from '../../utils/format';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllStudents } from '../../api/student';
import { getSkills } from '../../api/skill';
import { getErrorMessage } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Students() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [students, setStudents] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [skill, setSkill] = useState(searchParams.get('skill') || '');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const params = {};
                if (search) params.search = search;
                if (skill) params.skill = skill;
                const { data } = await getAllStudents(params);
                setStudents(data.data || data.students || data || []);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load students'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [search, skill]);

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const { data } = await getSkills();
                setSkills(data.data || data.skills || data || []);
            } catch (err) {
                // ignore
            }
        };
        loadSkills();
    }, []);

    const applyFilters = () => {
        const params = {};
        if (search) params.search = search;
        if (skill) params.skill = skill;
        setSearchParams(params);
    };

    return (
        <div className="page-section">
            <div className="container">
                <h1 className="section-title">Find Students</h1>
                <p className="section-subtitle">Browse talented students ready to work on your project</p>

                <div className="filter-bar">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or headline..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select className="form-control" value={skill} onChange={(e) => setSkill(e.target.value)}>
                        <option value="">All Skills</option>
                        {skills.map((s) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={applyFilters}>Search</button>
                </div>

                {loading ? (
                    <Spinner text="Loading students..." />
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : students.length === 0 ? (
                    <EmptyState title="No students found" message="Try adjusting your search filters." />
                ) : (
                    <div className="grid grid-3">
                        {students.map((s) => (
                            <div key={s._id} className="card card-hover entity-card">
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
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    {s.bio && s.bio.length > 100 ? s.bio.slice(0, 100) + '...' : s.bio}
                                </p>
                                <div className="entity-meta">
                                    <span className="badge badge-gold">{s.hourlyRate ? `$${s.hourlyRate}/hr` : 'Rate N/A'}</span>
                                    <span className="badge badge-blue">{s.availability || 'Available'}</span>
                                    {s.rating > 0 && <span className="badge badge-navy">★ {s.rating.toFixed(1)}</span>}
                                </div>
                                <div className="entity-tags">
                                    {(s.skills || []).slice(0, 4).map((sk, i) => (
                                        <span key={sk._id || sk || i} className="tag">{skillLabel(sk)}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}