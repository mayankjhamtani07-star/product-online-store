import { useState, useEffect } from "react";

const Toggle = ({ active, onToggle, stopPropagation }) => {
    const [label, setLabel] = useState(active ? "Active" : "Inactive");

    useEffect(() => {
        const t = setTimeout(() => setLabel(active ? "Active" : "Inactive"), 600);
        return () => clearTimeout(t);
    }, [active]);

    const handleClick = (e) => {
        if (stopPropagation) e.stopPropagation();
        onToggle();
    };

    return (
        <div className={`admin-toggle ${active ? "admin-toggle--on" : "admin-toggle--off"}`} onClick={handleClick}>
            <span className="admin-toggle__label">{label}</span>
        </div>
    );
};

export default Toggle;
