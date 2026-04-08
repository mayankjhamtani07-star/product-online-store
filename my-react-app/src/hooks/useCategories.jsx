import { useState } from "react";
import { getCategories, getSubcategories } from "../api/services";

const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const fetchCategories = () => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(console.error);
    };

    const fetchSubcategories = (id) => {
        getSubcategories(id)
            .then(res => setSubcategories(res.data))
            .catch(console.error);
    };

    return { categories, subcategories, setSubcategories, fetchCategories, fetchSubcategories };
};

export default useCategories;
