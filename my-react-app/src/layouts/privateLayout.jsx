import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import "./layout.css";

const PrivateLayout = ({ children }) => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-body">
        <Sidebar />
        <main className="main-content">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
