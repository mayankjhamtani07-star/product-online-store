import { useState } from "react";
import { useAuth } from "../context/authContext";

// re-exported for all existing imports like: import useAuthAction, { SuccessToast, LoginToast } from "../hooks/useAuthAction"
export { LoginToast, SuccessToast } from "../components/Toast";

const useAuthAction = () => {
    const { token } = useAuth();
    const [toast, setToast] = useState(false);
    const [successToast, setSuccessToast] = useState({ show: false, message: "", type: "success" });

    const guard = (fn) => {
        if (!token) {
            setToast(true);
            setTimeout(() => setToast(false), 3000);
        } else {
            fn();
        }
    };

    const showSuccess = (message, type = "success") => {
        setSuccessToast({ show: true, message, type });
        setTimeout(() => setSuccessToast({ show: false, message: "", type: "success" }), 3000);
    };

    return { guard, toast, successToast, showSuccess };
};

export default useAuthAction;
