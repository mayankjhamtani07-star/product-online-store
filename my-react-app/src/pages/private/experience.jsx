import { getExperiences, archiveExperience, joinExperience } from '../../api/services';
import { useState, useEffect, lazy, Suspense } from 'react';
import { FiPlus, FiStar, FiArchive, FiLogIn } from 'react-icons/fi';
import '../pages.css';
const AddExperience = lazy(() => import('../../components/addExperience'));
import { SuccessToast } from '../../hooks/useAuthAction';
import useAuthAction from '../../hooks/useAuthAction';
import { useNavigate } from 'react-router-dom';
import ExperienceCard from '../../components/ExperienceCard';


const Experience = () => {
    const { successToast, showSuccess } = useAuthAction();
    const [experiences, setExperiences] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [code, setCode] = useState('');

    const fetchExperiences = (p = page) => {
        getExperiences(p, PAGE_SIZE)
        .then(res => { setExperiences(res.data.data); setTotal(res.data.total); })
        .catch(console.error);
    };

    useEffect(() => { fetchExperiences(page); }, [page]); 

    const joinexp = async () => {
        if (!code.trim()) return;
        try {
            const res = await joinExperience(code);
            showSuccess(res.data.message);
            setShowJoin(false);
            setCode('');
            setPage(1);
            fetchExperiences(1);
        } catch (err) {
            showSuccess(err?.response?.data?.message || 'Something went wrong.', 'error');
        }
    };

    const archiveExp = (e, expid) => {
        e.stopPropagation();
        archiveExperience(expid)
        .then(res => { showSuccess(res.data.message); setPage(1); fetchExperiences(1); })
        .catch(err => showSuccess(err?.response?.data?.message || 'Something went wrong.', 'error'));
    };

    return (
        <div className="exp-page">
            <div className="exp-header">
                <div>
                    <h2 className="exp-header__title">Experiences</h2>
                    <p className="exp-header__sub">Manage your curated product experiences</p>
                </div>
                <div className="exp-header__btns">
                    <button className="exp-archive-nav-btn" onClick={() => navigate('/experience/archived')}>
                        <FiArchive size={15} /> Archived
                    </button>
                    <button className="exp-join-btn" onClick={() => setShowJoin(true)}>
                        <FiLogIn size={15} /> Join
                    </button>
                    <button className="exp-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={16} /> Add Experience
                    </button>
                </div>
            </div>

            {experiences.length === 0 ? (
                <div className="exp-empty">
                    <FiStar size={48} color="#DDDDDD" />
                    <h3>No experiences yet</h3>
                    <p>Create your first experience to get started.</p>
                    <button className="exp-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={15} /> Create Experience
                    </button>
                </div>
            ) : (
                <div className="exp-grid">
                    {experiences.map((mem) => (
                        <ExperienceCard
                            key={mem._id}
                            mem={mem}
                            onClick={() => navigate(`/experience/${mem.expid?._id}`)}
                            actionBtn={
                                <button className="exp-card__archive-btn" title="Archive" onClick={(e) => archiveExp(e, mem.expid?._id)}>
                                    <FiArchive size={14} />
                                </button>
                            }
                        />
                    ))}
                </div>
            )}

            {total > PAGE_SIZE && (
                <div className="pagination">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                    {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => (
                        <button key={i + 1} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'active' : ''}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(p => p + 1)} disabled={page === Math.ceil(total / PAGE_SIZE)}>›</button>
                </div>
            )}

            {showForm && (
                <Suspense fallback={null}>
                    <AddExperience onClose={() => setShowForm(false)} onSuccess={fetchExperiences} />
                </Suspense>
            )}
            {showJoin && (
                <div className="exp-modal-overlay" onClick={() => { setShowJoin(false); setCode(''); }}>
                    <div className="exp-modal" onClick={e => e.stopPropagation()}>
                        <h3>Join Experience</h3>
                        <input className="exp-modal-select" type="text" placeholder="Enter invite code"
                            value={code} onChange={e => setCode(e.target.value)} />
                        <button className="exp-modal-btn" onClick={joinexp}>Join</button>
                        <button className="exp-modal-close" onClick={() => { setShowJoin(false); setCode(''); }}>Cancel</button>
                    </div>
                </div>
            )}
            <SuccessToast show={successToast.show} message={successToast.message} type={successToast.type} />
        </div>
    );
};

export default Experience;
