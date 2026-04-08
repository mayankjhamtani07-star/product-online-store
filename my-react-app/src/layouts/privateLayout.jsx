import { useState } from "react";
import Nav from "../components/nav";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import "./layout.css";

const PrivateLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="dashboard-page">
      <Nav onToggleSidebar={() => setSidebarOpen((p) => !p)} sidebarOpen={sidebarOpen} />
      <div className={`dashboard-body ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;