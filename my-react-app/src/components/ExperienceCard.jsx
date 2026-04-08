import { FiPackage, FiUsers } from "react-icons/fi";
import { GroupAvatar } from "./avatars";

const ExperienceCard = ({ mem, onClick, actionBtn, extraBadge }) => {
    const exp = mem.expid;
    if (!exp) return null;

    return (
        <div className={`exp-card${extraBadge ? " exp-card--archived" : ""}`} onClick={onClick}>
            {exp.image ? (
                <div className="exp-card__img">
                    <img src={`http://localhost:3001/uploads/${exp.image}`} alt={exp.expname} />
                    {extraBadge && <div className="exp-card__archived-badge">{extraBadge}</div>}
                </div>
            ) : (
                <div className="exp-card__img exp-card__img--placeholder">
                    <GroupAvatar size={56} />
                    {extraBadge && <div className="exp-card__archived-badge">{extraBadge}</div>}
                </div>
            )}
            <div className="exp-card__body">
                <div className="exp-card__top">
                    <div>
                        <h3 className="exp-card__name">{exp.expname}</h3>
                        <p className="exp-card__title">{exp.title}</p>
                    </div>
                    {actionBtn}
                </div>
                <p className="exp-card__desc">{exp.description}</p>
                {exp.productIds?.length > 0 && (
                    <div className="exp-card__products">
                        {exp.productIds.slice(0, 3).map(p => (
                            <span key={p._id} className="exp-card__product-tag">
                                <FiPackage size={11} /> {p.name}
                            </span>
                        ))}
                        {exp.productIds.length > 3 && (
                            <span className="exp-card__product-tag exp-card__product-more">
                                +{exp.productIds.length - 3} more
                            </span>
                        )}
                    </div>
                )}
                <div className="exp-card__footer">
                    <span className={`exp-card__role ${mem.role === "Admin" ? "exp-card__role--admin" : ""}`}>{mem.role}</span>
                    <div className="exp-card__meta">
                        <span className="exp-card__count"><FiPackage size={11} /> {exp.productIds?.length || 0}</span>
                        <span className="exp-card__count"><FiUsers size={11} /> {mem.memberCount ?? 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExperienceCard;
