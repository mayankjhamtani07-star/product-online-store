import { getArchivedExperiences, unarchiveExperience } from '../../api/services';
import { useState, useEffect } from 'react';
import { FiArchive, FiArrowLeft } from 'react-icons/fi';
import '../pages.css';
import { SuccessToast } from '../../hooks/useAuthAction';
import useAuthAction from '../../hooks/useAuthAction';
import { useNavigate } from 'react-router-dom';
import ExperienceCard from '../../components/ExperienceCard';

const ArchivedExperience = () => {
    const { successToast, showSuccess } = useAuthAction();
    const [experiences, setExperiences] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 5;
    const navigate = useNavigate();

    const fetchExperiences = (p = page) => {
        getArchivedExperiences(p, PAGE_SIZE)
        .then(res => { setExperiences(res.data.data); setTotal(res.data.total); })
        .catch(console.error);
    };

    useEffect(() => { fetchExperiences(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    const unarchiveExp = (e, expid) => {
        e.stopPropagation();
        unarchiveExperience(expid)
        .then(res => { showSuccess(res.data.message); setPage(1); fetchExperiences(1); })
        .catch(err => showSuccess(err?.response?.data?.message || 'Something went wrong.', 'error'));
    };

    return (
        <div className="exp-page">
            <div className="exp-header">
                <div>
                    <h2 className="exp-header__title">Archived Experiences</h2>
                    <p className="exp-header__sub">{total} archived experience{total !== 1 ? 's' : ''}</p>
                </div>
                <button className="exp-archive-nav-btn" onClick={() => navigate('/experience')}>
                    <FiArrowLeft size={15} /> Back to Experiences
                </button>
            </div>

            {experiences.length === 0 ? (
                <div className="exp-empty">
                    <FiArchive size={48} color="#DDDDDD" />
                    <h3>No archived experiences</h3>
                    <p>Experiences you archive will appear here.</p>
                    <button className="exp-archive-nav-btn" onClick={() => navigate('/experience')}>
                        <FiArrowLeft size={14} /> Go to Experiences
                    </button>
                </div>
            ) : (
                <div className="exp-grid">
                    {experiences.map((mem) => (
                        <ExperienceCard
                            key={mem._id}
                            mem={mem}
                            onClick={() => navigate(`/experience/${mem.expid?._id}`)}
                            extraBadge={<><FiArchive size={10} /> Archived</>}
                            actionBtn={
                                <button className="exp-card__unarchive-btn" title="Unarchive" onClick={(e) => unarchiveExp(e, mem.expid?._id)}>
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
            <SuccessToast show={successToast.show} message={successToast.message} type={successToast.type} />
        </div>
    );
};

export default ArchivedExperience;
