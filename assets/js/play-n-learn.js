(() => {
    "use strict";

    /* ========================================
       Process Timeline
    ======================================== */

    function initializeProcessTimeline() {
        const timelineSection = document.querySelector("#process-timeline");

        if (!timelineSection) {
            return;
        }

        const desktopProgressBar = document.querySelector(
            "#timeline-progress-desktop"
        );

        const mobileProgressBar = document.querySelector(
            "#timeline-progress-mobile"
        );

        const timelineSteps = [
            ...document.querySelectorAll(".timeline__node"),
        ];

        let hasTimelineAnimated = false;

        function animateProcessTimeline() {
            if (hasTimelineAnimated) {
                return;
            }

            hasTimelineAnimated = true;

            const activationPoints = [0, 25, 50, 75, 100];
            const activatedSteps = new Set();

            const animationDuration = 1200;

            let animationStartTime = null;

            function renderFrame(timestamp) {
                animationStartTime ??= timestamp;

                const elapsedTime =
                    timestamp - animationStartTime;

                const progressPercent = Math.min(
                    (elapsedTime / animationDuration) * 100,
                    100
                );

                if (desktopProgressBar) {
                    desktopProgressBar.style.width =
                        `${progressPercent}%`;
                }

                if (mobileProgressBar) {
                    mobileProgressBar.style.height =
                        `${progressPercent}%`;
                }

                activationPoints.forEach(
                    (targetPercent, index) => {
                        const step = timelineSteps[index];

                        if (
                            progressPercent < targetPercent ||
                            activatedSteps.has(index) ||
                            !step
                        ) {
                            return;
                        }

                        activatedSteps.add(index);
                        step.classList.add("is-active");
                    }
                );

                if (elapsedTime < animationDuration) {
                    requestAnimationFrame(renderFrame);
                }
            }

            requestAnimationFrame(renderFrame);
        }

        if (!("IntersectionObserver" in window)) {
            animateProcessTimeline();
            return;
        }

        const timelineObserver = new IntersectionObserver(
            (entries, observer) => {
                const isTimelineVisible = entries.some(
                    (entry) =>
                        entry.isIntersecting &&
                        entry.intersectionRatio >= 0.15
                );

                if (!isTimelineVisible) {
                    return;
                }

                animateProcessTimeline();
                observer.disconnect();
            },
            {
                rootMargin: "0px 0px -15% 0px",
                threshold: 0.2,
            }
        );

        timelineObserver.observe(timelineSection);
    }


    /* ========================================
       Challenge Cards
    ======================================== */

    function initializeChallengeCards() {
        const challengeCards = [
            ...document.querySelectorAll(".challenge-card"),
        ];

        if (!challengeCards.length) {
            return;
        }

        function revealAllCards() {
            challengeCards.forEach((card) => {
                card.classList.add("is-visible");
            });
        }

        if (!("IntersectionObserver" in window)) {
            revealAllCards();
            return;
        }

        const challengeObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: "0px 0px -10% 0px",
                threshold: 0.2,
            }
        );

        challengeCards.forEach((card) => {
            challengeObserver.observe(card);
        });
    }

    /* ========================================
        ResearchSection
    ======================================== */


    function initializeResearchSection() {
        const researchSection =
            document.querySelector(".research-section");

        if (!researchSection) {
            return;
        }

        const participantsNumber =
            researchSection.querySelector(
                ".research-participants__number"
            );

        const donutNumber =
            researchSection.querySelector(
                ".research-donut__number"
            );

        let hasAnimated = false;


        function countUp(element, target, duration, decimals = 0) {
            if (!element) {
                return;
            }

            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;

                const progress = Math.min(
                    elapsed / duration,
                    1
                );

                const value = target * progress;

                element.textContent =
                    value.toFixed(decimals) +
                    (decimals ? "%" : "");

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        }


        function animateResearchSection() {
            if (hasAnimated) {
                return;
            }

            hasAnimated = true;

            researchSection.classList.add(
                "is-research-visible"
            );


            /* 0 → 34 */
            countUp(
                participantsNumber,
                34,
                2000
            );

            /* wait for donut, then 0 → 67.6% */
            window.setTimeout(() => {
                countUp(
                    donutNumber,
                    67.7,
                    1000,
                    1
                );
            }, 1050);
        }

        if (!("IntersectionObserver" in window)) {
            animateResearchSection();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting) {
                    return;
                }

                animateResearchSection();
                observer.disconnect();
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(researchSection);
    }

    /* ========================================
        Low-Fidelity Gallery
    ======================================== */

    function initializeLowFidelityGallery() {
        const section = document.querySelector(
            ".low-fidelity-section"
        );

        if (!section) {
            return;
        }

        const screen = section.querySelector(
            ".low-fi-viewer__screen"
        );

        const image = section.querySelector(
            ".low-fi-viewer__image"
        );

        const previousButton = section.querySelector(
            ".low-fi-viewer__arrow--previous"
        );

        const nextButton = section.querySelector(
            ".low-fi-viewer__arrow--next"
        );

        const steps = [
            ...section.querySelectorAll(".low-fi-step"),
        ];

        const dots = [
            ...section.querySelectorAll(
                ".low-fi-pagination__dot"
            ),
        ];


        const screens = [
            {
                src: "../assets/images/play-n-learn/low-fi/loading-screen.png",
                alt: "Loading Screen wireframe",
            },
            {
                src: "../assets/images/play-n-learn/low-fi/choice-of-end.png",
                alt: "Choice of End wireframe",
            },
            {
                src: "../assets/images/play-n-learn/low-fi/authentication.png",
                alt: "Authentication wireframe",
            },
            {
                src: "../assets/images/play-n-learn/low-fi/teacher-dashboard.png",
                alt: "Teacher Dashboard wireframe",
            },
            {
                src: "../assets/images/play-n-learn/low-fi/existing-classroom.png",
                alt: "Existing Classroom wireframe",
            },
        ];


        let currentIndex = 0;
        let isAnimating = false;


        function updateActiveState(index) {
            steps.forEach((step, stepIndex) => {
                step.classList.toggle(
                    "is-active",
                    stepIndex === index
                );
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle(
                    "is-active",
                    dotIndex === index
                );
            });
        }


        function changeScreen(nextIndex) {
            if (
                isAnimating ||
                nextIndex === currentIndex
            ) {
                return;
            }

            const direction =
                nextIndex > currentIndex ? 1 : -1;

            isAnimating = true;


            /* Step + pagination update immediately */

            updateActiveState(nextIndex);


            /* Current screen moves out */

            const exitClass =
                direction > 0
                    ? "is-exiting-left"
                    : "is-exiting-right";

            const enterClass =
                direction > 0
                    ? "is-entering-right"
                    : "is-entering-left";

            screen.classList.add(exitClass);


            window.setTimeout(() => {
                image.src = screens[nextIndex].src;
                image.alt = screens[nextIndex].alt;

                screen.classList.remove(exitClass);
                screen.classList.add(enterClass);


                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        screen.classList.remove(enterClass);
                    });
                });


                currentIndex = nextIndex;


                window.setTimeout(() => {
                    isAnimating = false;
                }, 320);

            }, 220);
        }


        previousButton?.addEventListener(
            "click",
            () => {
                const nextIndex =
                    currentIndex === 0
                        ? screens.length - 1
                        : currentIndex - 1;

                changeScreen(nextIndex);
            }
        );


        nextButton?.addEventListener(
            "click",
            () => {
                const nextIndex =
                    currentIndex === screens.length - 1
                        ? 0
                        : currentIndex + 1;

                changeScreen(nextIndex);
            }
        );


        steps.forEach((step) => {
            step.addEventListener("click", () => {
                changeScreen(
                    Number(step.dataset.lowFiIndex)
                );
            });
        });


        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                changeScreen(
                    Number(dot.dataset.lowFiIndex)
                );
            });
        });
    }

    /* ========================================
        Fireflies
    ======================================== */


    function initializeFireflies() {
    const container =
        document.querySelector(".fireflies");

    if (!container) {
        return;
    }

    const fireflyCount = 100;

    for (let index = 0; index < fireflyCount; index += 1) {
        const firefly =
            document.createElement("span");

        firefly.className = "firefly";

        const size =
            Math.random() * 4 + 2;

        const duration =
            Math.random() * 6 + 8;

        const glowDuration =
            Math.random() * 3 + 2.5;

        const delay =
            -(Math.random() * duration);

        const maxOpacity =
            Math.random() * 0.45 + 0.25;

        firefly.style.left =
            `${Math.random() * 100}%`;

        firefly.style.top =
            `${Math.random() * 100}%`;

        firefly.style.setProperty(
            "--size",
            `${size}px`
        );

        firefly.style.setProperty(
            "--duration",
            `${duration}s`
        );

        firefly.style.setProperty(
            "--glow-duration",
            `${glowDuration}s`
        );

        firefly.style.setProperty(
            "--delay",
            `${delay}s`
        );

        firefly.style.setProperty(
            "--max-opacity",
            maxOpacity
        );

        firefly.style.setProperty(
            "--move-x-1",
            `${Math.random() * 30 - 15}px`
        );

        firefly.style.setProperty(
            "--move-y-1",
            `${Math.random() * -30}px`
        );

        firefly.style.setProperty(
            "--move-x-2",
            `${Math.random() * 40 - 20}px`
        );

        firefly.style.setProperty(
            "--move-y-2",
            `${Math.random() * -50}px`
        );

        firefly.style.setProperty(
            "--move-x-3",
            `${Math.random() * 30 - 15}px`
        );

        firefly.style.setProperty(
            "--move-y-3",
            `${Math.random() * -25}px`
        );

        container.appendChild(firefly);
    }
}



    /* ========================================
       Initialize
    ======================================== */

    function initializePlayAndLearnPage() {
        initializeProcessTimeline();
        initializeChallengeCards();
        initializeResearchSection();
        initializeLowFidelityGallery();
        initializeFireflies();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializePlayAndLearnPage
        );
    } else {
        initializePlayAndLearnPage();
    }
})();


/* ===============Copy Protection======================================== */
/*document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

document.addEventListener("copy", (event) => {
    event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

document.addEventListener("keydown", (event) => {
    const isCopy =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "c";

    if (isCopy) {
        event.preventDefault();
    }
}*/
