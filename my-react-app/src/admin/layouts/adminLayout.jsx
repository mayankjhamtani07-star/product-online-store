import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/adminSidebar";
import "./layout.css";

const AdminLayout = () => (
    <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
            <Outlet />
        </main>
    </div>
);

export default AdminLayout;
