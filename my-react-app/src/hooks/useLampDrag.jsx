import { useEffect } from "react";
import { gsap } from "gsap";
import Draggable from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const useLampDrag = (onPull) => {
    useEffect(() => {
        const root = document.documentElement;
        const page = document.querySelector(".auth-page");
        const form = document.querySelector(".login-form");
        const cordBead = document.querySelector(".cord-bead");
        const cordLine = document.querySelector(".cord-line");
        const hitArea = document.querySelector(".cord-hit");
        const clickSound = new Audio("https://assets.codepen.io/605876/click.mp3");

        form.classList.add("active");
        page.setAttribute("data-on", true);
        root.style.setProperty("--on", 1);

        Draggable.create(hitArea, {
            type: "y",
            bounds: { minY: 0, maxY: 60 },
            onDrag: function () {
                gsap.set(cordBead, { y: this.y });
                gsap.set(cordLine, { attr: { y2: 180 + this.y } });
            },
            onRelease: function () {
                if (this.y > 30) { clickSound.play(); onPull(); }
                gsap.to([cordBead, hitArea], { y: 0, duration: 0.5, ease: "back.out(2.5)" });
                gsap.to(cordLine, { attr: { y2: 180 }, duration: 0.5, ease: "back.out(2.5)" });
            }
        });
    }, [onPull]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useLampDrag;
