import { FiHeart, FiAlertCircle } from "react-icons/fi";

export const LoginToast = ({ show }) =>
    show ? (
        <div className="toast">
            <FiAlertCircle size={16} color="#F4785A" />
            Please <a href="/login" className="toast__link">login</a> to continue.
        </div>
    ) : null;

export const SuccessToast = ({ show, message, type = "success" }) =>
    show ? (
        <div className="toast" style={{ borderLeft: `4px solid ${type === "error" ? "#e05a3a" : type === "info" ? "#F4785A" : "#22c55e"}` }}>
            <FiHeart size={16} color={type === "error" ? "#e05a3a" : type === "info" ? "#F4785A" : "#22c55e"} fill={type === "success" ? "#22c55e" : "none"} />
            <span style={{ color: type === "error" ? "#e05a3a" : type === "info" ? "#F4785A" : "#22c55e" }}>{message}</span>
        </div>
    ) : null;
