import { getExperience, deleteExperience, removeUserFromExperience } from "../../api/services";
import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPackage, FiUsers, FiUserPlus, FiTrash2, FiEdit2, FiHeart } from "react-icons/fi";
import { GroupAvatar } from "../../components/avatars";
import "../pages.css";
import useAuthAction, { SuccessToast } from "../../hooks/useAuthAction";
import useWish from "../../hooks/useWish";
const AddExperience = lazy(() => import("../../components/addExperience"));

const FullExperience = () => {
    const { expId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, successToast } = useAuthAction();
    const { addToWish } = useWish();
    const [data, setData] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const fetchData = () => {
        getExperience(expId)
            .then(res => setData(res.data))
            .catch(err => {
                if (err?.response?.status === 403 || err?.response?.status === 404)
                    navigate("/experience");
            });
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [expId]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!data) return null;

    const { exp, members, myRole } = data;

    const deluser = (id) => {
        removeUserFromExperience(id, expId)
        .then(res => { showSuccess(res.data.message, 'success'); fetchData(); })
        .catch(err => showSuccess(err.response?.data?.message || 'Error', 'error'));
    };

    const delExp = () => {
        deleteExperience(expId)
        .then(res => { showSuccess(res.data.message, 'success'); navigate('/experience'); })
        .catch(err => showSuccess(err.response?.data?.message || 'Error', 'error'));
    };

    return (
        <>
        <div className="fexp-page">
            <button className="fexp-back" onClick={() => navigate("/experience")}>
                <FiArrowLeft size={16} /> Back
            </button>

            <div className="fexp-hero" style={{ position: 'relative' }}>
                {exp.image ? (
                    <div className="fexp-hero__img">
                        <img src={`http://localhost:3001/uploads/${exp.image}`} alt={exp.expname} />
                    </div>
                ) : (
                    <div className="fexp-hero__img fexp-hero__img--placeholder">
                        <GroupAvatar size={80} />
                    </div>
                )}
                <div className="fexp-hero__info">
                    <span className="fexp-role-badge">{myRole}</span>
                    <h1 className="fexp-hero__name">{exp.expname}</h1>
                    <p className="fexp-hero__title">{exp.title}</p>
                    <p className="fexp-hero__desc">{exp.description}</p>
                    {myRole === "admin" && (
                        <div className="fexp-hero__actions">
                            <button className="fexp-edit-btn" onClick={() => setShowEdit(true)}>
                                <FiEdit2 size={14} /> Edit
                            </button>
                            <button className="fexp-delete-btn" onClick={delExp}>
                                <FiTrash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
                <div className="fexp-add-member-wrap">
                    <span className="fexp-add-member-label">Add Member</span>
                    <button className="fexp-add-member-btn" onClick={() => setShowCode(p => !p)}>
                        <FiUserPlus size={16} />
                    </button>
                    {showCode && <span className="fexp-invite-code">{exp.code}</span>}
                </div>
            </div>

            <div className="fexp-body">
                <section className="fexp-section">
                    <div className="fexp-section__header">
                        <FiPackage size={16} />
                        <h2>Products <span>{exp.productIds?.length || 0}</span></h2>
                    </div>
                    {exp.productIds?.length === 0 ? (
                        <p className="fexp-empty-text">No products in this experience.</p>
                    ) : (
                        <div className="fexp-products-grid">
                            {exp.productIds.map(p => (
                                <div className="fexp-product-card" key={p._id}>
                                    <div className="fexp-product-card__img">
                                        <img src={`http://localhost:3001/uploads/${p.image}`} alt={p.name} />
                                    </div>
                                    <div className="fexp-product-card__info">
                                        <p className="fexp-product-card__name">{p.name}</p>
                                        <p className="fexp-product-card__price">${p.price}</p>
                                    </div>
                                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                                        onClick={() => addToWish(p._id, fetchData)}>
                                        <FiHeart size={18} style={{ color: p.wishlisted ? "#E05A3A" : "#CCCCCC", fill: p.wishlisted ? "#E05A3A" : "none" }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="fexp-section">
                    <div className="fexp-section__header">
                        <FiUsers size={16} />
                        <h2>Members <span>{members?.length || 0}</span></h2>
                    </div>
                    {members?.length === 0 ? (
                        <p className="fexp-empty-text">No members yet.</p>
                    ) : (
                        <div className="fexp-members-list">
                            {members.map(m => (
                                <div className="fexp-member-row" key={m._id}>
                                    <div className="fexp-member-avatar">
                                        {m.userid?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="fexp-member-info">
                                        <p className="fexp-member-name">{m.userid?.name}</p>
                                        <p className="fexp-member-email">{m.userid?.email}</p>
                                    </div>
                                    <span className={`fexp-member-role ${m.role === "admin" ? "fexp-member-role--admin" : ""}`}>
                                        {m.role}
                                    </span>
                                    {m.role === "member" && myRole === "admin" && (
                                        <button className="fexp-member-kick-btn" onClick={() => deluser(m.userid._id)}><FiTrash2 size={14} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>

        {showEdit && (
            <Suspense fallback={null}>
                <AddExperience
                    editMode={true}
                    expData={exp}
                    onClose={() => setShowEdit(false)}
                    onSuccess={() => { setShowEdit(false); fetchData(); }}
                />
            </Suspense>
        )}
        <SuccessToast show={successToast.show} message={successToast.message} type={successToast.type} />
        </>
    );
};

export default FullExperience;
