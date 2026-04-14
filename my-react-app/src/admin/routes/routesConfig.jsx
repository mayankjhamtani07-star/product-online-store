import { lazy } from "react";
import { FiActivity, FiShoppingBag, FiUsers, FiStar, FiTarget, FiLifeBuoy, FiPackage } from "react-icons/fi";

const AdminLogin = lazy(() => import("../pages/adminLogin"));
const AdminDashboard = lazy(() => import("../pages/adminDashboard"));
const ManageProducts = lazy(() => import("../pages/manageProducts"));
const ManageUsers = lazy(() => import("../pages/manageUsers"));
const ManageExperiences = lazy(() => import("../pages/manageExperiences"));
const ManageLeads = lazy(() => import("../pages/manageLeads"));
const ManageTickets = lazy(() => import("../pages/managetickets"));
const TicketDetail = lazy(() => import("../pages/ticketDetail"));
const ManageTicketsFire = lazy(() => import("../pages/manageTicketsFire"));
const TicketDetailFire = lazy(() => import("../pages/ticketDetailFire"));
const ManageOrders = lazy(() => import("../pages/manageOrders"));

export const adminRoutesConfig = [
    { path: "login", fullPath: "/admin/login", element: <AdminLogin /> },
    { path: "dashboard", fullPath: "/admin/dashboard", element: <AdminDashboard />, icon: FiActivity, label: "Dashboard" },
    { path: "users", fullPath: "/admin/users", element: <ManageUsers />, icon: FiUsers, label: "Users", statKey: "totalUsers", statColor: "#7b7fe8" },
    { path: "products", fullPath: "/admin/products", element: <ManageProducts />, icon: FiShoppingBag, label: "Products", statKey: "totalProducts", statColor: "#f4785a" },
    { path: "experiences", fullPath: "/admin/experiences", element: <ManageExperiences />, icon: FiStar, label: "Experiences", statKey: "totalExperiences", statColor: "#27ae60" },
    { path: "ticket", fullPath: "/admin/ticket", element: <ManageTickets />, icon: FiLifeBuoy, label: "Open Tickets", statKey: "openTickets", statColor: "#f1c40f" },
    { path: "ticket/:id", fullPath: "/admin/ticket/:id", element: <TicketDetail /> },
    { path: "ticket-fire", fullPath: "/admin/ticket-fire", element: <ManageTicketsFire />, icon: FiLifeBuoy, label: "Tickets (Firebase)" },
    { path: "ticket-fire/:id", fullPath: "/admin/ticket-fire/:id", element: <TicketDetailFire /> },
    { path: "leads", fullPath: "/admin/leads", element: <ManageLeads />, icon: FiTarget, label: "Leads", statKey: "totalLeads", statColor: "#e67e22" },
    { path: "orders", fullPath: "/admin/orders", element: <ManageOrders />, icon: FiPackage, label: "Orders" },
];
