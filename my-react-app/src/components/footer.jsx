import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routesConfig } from "../routes/routesConfig";
import { useAuth } from "../context/authContext";
import { subscribeLead } from "../api/services";
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiSend } from "react-icons/fi";
import "./components.css";

const Footer = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState({ text: "", error: false });

    const footerLinks = routesConfig.filter(r =>
        r.footerSection === "links" && (r.layout !== "private" || token)
    );

    const handleSubscribe = async (e) => {
        e.preventDefault();
        try {
            const res = await subscribeLead(email);
            setMsg({ text: res.data.message, error: false });
            setEmail("");
        } catch (err) {
            setMsg({ text: err?.response?.data?.message || "Something went wrong.", error: true });
        }
    };

    return (
        <footer className="footer">
            <div className="footer__inner">

                <div className="footer__brand">
                    <h2 className="footer__logo">Online Store</h2>
                    <p className="footer__tagline">Discover products you love, curated just for you.</p>
                    <div className="footer__social">
                        <a href="#" className="footer__social-icon"><FiInstagram size={18} /></a>
                        <a href="#" className="footer__social-icon"><FiTwitter size={18} /></a>
                        <a href="#" className="footer__social-icon"><FiFacebook size={18} /></a>
                        <a href="#" className="footer__social-icon"><FiMail size={18} /></a>
                    </div>
                </div>

                <div className="footer__col">
                    <h4 className="footer__col-title">Pages</h4>
                    <ul className="footer__links">
                        {footerLinks.map(r => (
                            <li key={r.path} onClick={() => navigate(r.path)}>{r.label}</li>
                        ))}
                    </ul>
                </div>

                <div className="footer__col">
                    <h4 className="footer__col-title">Contact</h4>
                    <ul className="footer__links">
                        <li>support@onlinestore.com</li>
                        <li>+1 (800) 123-4567</li>
                        <li>Mon - Fri, 9am - 6pm</li>
                    </ul>
                </div>

                <div className="footer__col">
                    <h4 className="footer__col-title">Stay Updated</h4>
                    <p className="footer__newsletter-sub">Get the latest deals and updates.</p>
                    <form className="footer__newsletter" onSubmit={handleSubscribe}>
                        <div className="footer__newsletter-input-wrap">
                            <FiMail size={15} className="footer__newsletter-icon" />
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setMsg({ text: "", error: false }); }}
                                required
                                className="footer__newsletter-input"
                            />
                        </div>
                        <button type="submit" className="footer__newsletter-btn">
                            <FiSend size={14} /> Subscribe
                        </button>
                    </form>
                    {msg.text && (
                        <p className={`footer__newsletter-msg ${msg.error ? "footer__newsletter-msg--error" : ""}`}>
                            {msg.text}
                        </p>
                    )}
                </div>

            </div>

            <div className="footer__bottom">
                <span>© {new Date().getFullYear()} Online Store. All rights reserved.</span>
                <div className="footer__bottom-links">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
