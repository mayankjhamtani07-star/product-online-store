import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import Products from "./products";
import axios from "axios";

const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#25D366"/>
        <path d="M23.5 8.5A10.07 10.07 0 0 0 16 5.5C10.75 5.5 6.5 9.75 6.5 15a9.44 9.44 0 0 0 1.34 4.88L6.5 26.5l6.78-1.78A9.5 9.5 0 0 0 16 25.5c5.25 0 9.5-4.25 9.5-9.5a9.44 9.44 0 0 0-2-5.5zm-7.5 14.6a7.87 7.87 0 0 1-4.02-1.1l-.29-.17-3 .79.8-2.93-.19-.3A7.9 7.9 0 1 1 16 23.1zm4.33-5.9c-.24-.12-1.4-.69-1.61-.77s-.37-.12-.53.12-.61.77-.75.93-.28.18-.51.06a6.44 6.44 0 0 1-1.9-1.17 7.1 7.1 0 0 1-1.31-1.63c-.14-.24 0-.37.1-.49s.24-.28.36-.42a1.6 1.6 0 0 0 .24-.4.44.44 0 0 0-.02-.42c-.06-.12-.53-1.28-.73-1.75s-.38-.4-.53-.4h-.45a.87.87 0 0 0-.63.3 2.65 2.65 0 0 0-.82 1.97 4.6 4.6 0 0 0 .96 2.44 10.55 10.55 0 0 0 4.04 3.57c.56.24 1 .39 1.34.5a3.22 3.22 0 0 0 1.48.09 2.43 2.43 0 0 0 1.59-1.12 1.97 1.97 0 0 0 .14-1.12c-.06-.1-.22-.16-.46-.28z" fill="#fff"/>
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#1877F2"/>
        <path d="M21 16h-3v10h-4V16h-2v-4h2v-2c0-3 1.5-4.5 4.5-4.5H21v4h-2c-.6 0-1 .4-1 1v1.5h3l-.5 4z" fill="#fff"/>
    </svg>
);

const Capture = () => {
    const [showModal, setShowModal] = useState(false);
    const [scale, setScale] = useState(1);
    const [imageUrl, setImageUrl] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const captureRef = useRef();
    const CAPTURE_WIDTH = window.innerWidth;

    useEffect(() => {
        if (!showModal || !captureRef.current) return;

        const contentHeight = captureRef.current.scrollHeight;
        setScale(Math.min(1, window.innerHeight / contentHeight));

        setTimeout(async () => {
            try {
                const dataUrl = await toPng(captureRef.current, {
                    width: CAPTURE_WIDTH,
                    style: { transform: "none" },
                    cacheBust: true,
                });

                const formData = new FormData();
                formData.append("file", dataUrl);
                formData.append("upload_preset", "sa6pwded");
                const res = await axios.post(
                    "https://api.cloudinary.com/v1_1/djrdoq4hk/image/upload",
                    formData
                );
                setImageUrl(res.data.secure_url);
            } catch (err) {
                console.error(err);
            } finally {
                setShowModal(false);
                setCapturing(false);
                setScale(1);
            }
        }, 2000);
    }, [showModal]);

    const handleCapture = () => { setCapturing(true); setShowModal(true); };

    const shareWhatsApp = () => {
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(imageUrl)}`, "_blank");
        setImageUrl(null);
    };

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`, "_blank");
        setImageUrl(null);
    };

    return (
        <>
            <button className="capture-btn" onClick={handleCapture} disabled={capturing}>
                {capturing ? "Capturing..." : "Capture"}
            </button>

            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.6)", zIndex: 9999,
                    display: "flex", alignItems: "flex-start", justifyContent: "center",
                    overflowY: "auto",
                }}>
                    <div style={{
                        width: CAPTURE_WIDTH,
                        transform: `scale(${scale})`,
                        transformOrigin: "top center",
                    }}>
                        <Products ref={captureRef} />
                    </div>
                </div>
            )}

            {imageUrl && (
                <div className="capture-overlay" onClick={() => setImageUrl(null)}>
                    <div className="capture-modal" onClick={e => e.stopPropagation()}>
                        <div className="capture-modal__header">
                            <h3>Share Screenshot</h3>
                            <button className="capture-modal__close" onClick={() => setImageUrl(null)}>✕</button>
                        </div>
                        <img src={imageUrl} alt="screenshot" className="capture-preview" />
                        <div className="capture-share-btns">
                            <button className="capture-whatsapp-btn" onClick={shareWhatsApp}>
                                <WhatsAppIcon /> WhatsApp
                            </button>
                            <button className="capture-facebook-btn" onClick={shareFacebook}>
                                <FacebookIcon /> Facebook
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Capture;
