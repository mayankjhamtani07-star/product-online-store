import Nav from "../components/nav";
import Footer from "../components/footer";
import "./layout.css";

const PublicLayout = ({ children }) => {
  return (
    <div className="public">
      <Nav />
      <main className="main-content">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default PublicLayout;
