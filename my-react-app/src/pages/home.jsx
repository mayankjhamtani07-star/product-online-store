import Header from "../components/header";
import { lazy, Suspense } from "react";
const Testimonials = lazy(() => import("../components/testimonials"));
import { FaGooglePlay, FaApple } from "react-icons/fa";
import bgfooter from "../assets/images/bg-footer.webp";
import "./pages.css";

const Home = () => {
    return (
        <>
            <Header />
            <Suspense fallback={null}>
                <Testimonials />
            </Suspense>
            <div className="home-promo"
                style={{ backgroundImage: `url(${bgfooter})` }}>
                <div className="home-promo__content">
                    <div className="home-promo__text">
                        <h2>Get voucher discount up to 70%</h2>
                        <p>Get big discounts by installing our app.</p>
                        <div className="home-promo__stores">
                            <button className="home-promo__store">
                                <FaGooglePlay className="home-promo__storeIcon" />
                                <div>
                                    <span>Get it on</span>
                                    <strong>Google Play</strong>
                                </div>
                            </button>
                            <button className="home-promo__store">
                                <FaApple className="home-promo__storeIcon" />
                                <div>
                                    <span>Download on the</span>
                                    <strong>App Store</strong>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Home;