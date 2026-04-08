import { toggleWish } from "../api/services";
import { useAuth } from "../context/authContext";
import useAuthAction from "./useAuthAction";

const useWish = () => {
    const { refreshWishCount } = useAuth();
    const { showSuccess } = useAuthAction();

    const addToWish = async (productId, onSuccess) => {
        try {
            const res = await toggleWish(productId);
            const isRemoved = res.data.message.includes("Removed");
            showSuccess(res.data.message, isRemoved ? "info" : "success");
            refreshWishCount(isRemoved ? "remove" : "add");
            if (onSuccess) onSuccess();
        } catch (err) {
            if (err?.response?.status !== 401)
                showSuccess(err?.response?.data?.message || "Something went wrong.", "error");
        }
    };

    return { addToWish };
};

export default useWish;
