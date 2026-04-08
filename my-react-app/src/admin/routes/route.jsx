import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { adminRoutesConfig } from "./routesConfig";
import AdminLayout from "../layouts/adminLayout";
import { useAdmin } from "../context/adminContext";
import PageLoader from "../../components/PageLoader";

const loginRoute = adminRoutesConfig.find(r => r.path === "login");
const pageRoutes = adminRoutesConfig.filter(r => r.path !== "login");

const AdminRouter = () => {
    const { token } = useAdmin();

    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/admin">
                    <Route path="login" element={token ? <Navigate to="/admin/dashboard" replace /> : loginRoute.element} />
                    <Route element={token ? <AdminLayout /> : <Navigate to="/admin/login" replace />}>
                        {pageRoutes.map(({ path, element }) => (
                            <Route key={path} path={path} element={element} />
                        ))}
                    </Route>
                    <Route index element={<Navigate to={token ? "dashboard" : "login"} replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AdminRouter;
