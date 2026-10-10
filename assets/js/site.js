(() => {
    "use strict";

    function initializeScrollReveal() {
        const revealElements = document.querySelectorAll(".scroll-reveal");

        if (!revealElements.length) return;

        if (!("IntersectionObserver" in window)) {
            revealElements.forEach((element) => element.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: "0px 0px -60px 0px",
                threshold: 0.08,
            }
        );

        revealElements.forEach((element) => observer.observe(element));
    }

    function initializeLottieScrollCues() {
        const animationContainers = document.querySelectorAll("[data-scroll-animation]");

        if (!animationContainers.length || typeof window.lottie === "undefined") return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        animationContainers.forEach((container) => {
            const animationPath = container.dataset.animationSrc;
            if (!animationPath) return;

            const animation = window.lottie.loadAnimation({
                container,
                renderer: "svg",
                loop: !prefersReducedMotion,
                autoplay: !prefersReducedMotion,
                path: animationPath,
                rendererSettings: {
                    preserveAspectRatio: "xMidYMid meet",
                },
            });

            if (prefersReducedMotion) {
                animation.addEventListener("DOMLoaded", () => {
                    animation.goToAndStop(0, true);
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initializeScrollReveal();
        initializeLottieScrollCues();
    });
})();

/* ===============Copy Protection======================================== */
document.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".protected-image")) {
        event.preventDefault();
    }
});

document.addEventListener("dragstart", (event) => {
    if (event.target.closest(".protected-image")) {
        event.preventDefault();
    }
});