(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    window.PaymateUI = window.PaymateUI || {};

    window.PaymateUI.revealOnce = function revealOnce(element, options = {}) {
        if (!element) return;

        const {
            visibleClass = "is-visible",
            classTarget = element,
            ...observerOptions
        } = options;

        if (
            prefersReducedMotion ||
            !("IntersectionObserver" in window)
        ) {
            classTarget.classList.add(visibleClass);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;

                classTarget.classList.add(visibleClass);
                observer.unobserve(entry.target);
            },
            {
                threshold: 0.2,
                rootMargin: "0px 0px -8% 0px",
                ...observerOptions
            }
        );

        observer.observe(element);
    };

    const { revealOnce } = window.PaymateUI;

    function setCssProperties(element, properties) {
        Object.entries(properties).forEach(([name, value]) => {
            element.style.setProperty(name, value);
        });
    }

    /* Problem Section------------------------------------------------------ */
    const problemSection = document.querySelector("[data-problem-section]");

    revealOnce(problemSection);

    /* Requirements Section--------------------------------------------------- */
    const requirements = [
        {
            number: "01",
            code: "FR004-005",
            title: "Receipt Processing",
            description:
                "Extract transaction details from scanned or uploaded receipts and automatically categorize each expense.",
            tag: "Core Experience"
        },
        {
            number: "02",
            code: "FR005-008",
            title: "Expense Insights",
            description:
                "Turn transaction data into clear summaries, category breakdowns, and useful spending insights.",
            tag: "Financial Insight"
        },
        {
            number: "03",
            code: "FR009-011",
            title: "Budget Management",
            description:
                "Create monthly budgets, monitor remaining balances, and receive alerts before reaching spending limits.",
            tag: "Budget Control"
        },
        {
            number: "04",
            code: "FR012-014",
            title: "Financial Reports",
            description:
                "Generate visual reports that help users understand spending patterns and compare financial performance.",
            tag: "Data Visualization"
        },
        {
            number: "05",
            code: "FR016-018",
            title: "Receipt Management",
            description:
                "Store, filter, and manage past receipt records.",
            tag: "RECORD MANAGEMENT"
        },
        {
            number: "06",
            code: "FR018-020",
            title: "Group Tracking",
            description:
                "Track group expenses, and payment activity in one connected space.",
            tag: "Group Management"
        }
    ];

    const requirementsSection = document.querySelector(
        "[data-requirements-section]"
    );

    if (requirementsSection) {
        const nav = requirementsSection.querySelector(
            "[data-requirements-nav]"
        );
        const buttons = [...requirementsSection.querySelectorAll(
            "[data-requirement]"
        )];
        const indicator = requirementsSection.querySelector(
            "[data-requirement-indicator]"
        );
        const panel = requirementsSection.querySelector(
            "[data-requirement-panel]"
        );

        const code = panel.querySelector("[data-detail-code]");
        const title = panel.querySelector("[data-detail-title]");
        const description = panel.querySelector(
            "[data-detail-description]"
        );
        const tag = panel.querySelector("[data-detail-tag]");
        const backgroundNumber = panel.querySelector(
            "[data-detail-number]"
        );

        let activeIndex = 0;
        let transitionTimer;
        let enterTimer;

        function moveIndicator(button) {
            const navRect = nav.getBoundingClientRect();
            const buttonRect = button.getBoundingClientRect();

            const offset =
                buttonRect.top -
                navRect.top +
                nav.scrollTop;

            indicator.style.height = `${buttonRect.height}px`;
            indicator.style.transform = `translateY(${offset}px)`;
        }

        function updateContent(index) {
            const requirement = requirements[index];

            code.textContent = requirement.code;
            title.textContent = requirement.title;
            description.textContent = requirement.description;
            tag.textContent = requirement.tag;
            backgroundNumber.textContent = requirement.number;
        }

        function selectRequirement(index) {
            if (
                index === activeIndex ||
                !requirements[index]
            ) {
                return;
            }

            window.clearTimeout(transitionTimer);
            window.clearTimeout(enterTimer);

            const nextButton = buttons[index];

            buttons.forEach((button, buttonIndex) => {
                const isActive = buttonIndex === index;

                button.classList.toggle("is-active", isActive);
                button.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            moveIndicator(nextButton);

            if (prefersReducedMotion) {
                updateContent(index);
                activeIndex = index;
                return;
            }

            panel.classList.remove("is-entering");
            panel.classList.add("is-leaving");

            transitionTimer = window.setTimeout(() => {
                updateContent(index);

                panel.classList.remove("is-leaving");
                panel.classList.add("is-entering");

                enterTimer = window.setTimeout(() => {
                    panel.classList.remove("is-entering");
                }, 280);
            }, 220);

            activeIndex = index;
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                selectRequirement(
                    Number(button.dataset.requirement)
                );
            });
        });

        requestAnimationFrame(() => {
            moveIndicator(buttons[activeIndex]);
        });

        window.addEventListener("resize", () => {
            moveIndicator(buttons[activeIndex]);
        });

        revealOnce(requirementsSection);
    }

    /* Architecture Section--------------------------------------------------- */

    const architectureSection = document.querySelector(
        "[data-architecture-section]"
    );

    if (architectureSection) {
        const diagram = architectureSection.querySelector(
            "[data-architecture-diagram]"
        );

        const nodes = [
            ...diagram.querySelectorAll("[data-node]")
        ];

        function setConnectionFocus(connectionName) {
            diagram.classList.add("has-node-focus");

            nodes.forEach((node) => {
                node.classList.toggle(
                    "is-focused",
                    node.dataset.node === connectionName
                );
            });

            diagram
                .querySelectorAll("[data-connection]")
                .forEach((element) => {
                    element.classList.toggle(
                        "is-focused",
                        element.dataset.connection === connectionName
                    );
                });
        }

        function clearConnectionFocus() {
            diagram.classList.remove("has-node-focus");

            diagram
                .querySelectorAll(".is-focused")
                .forEach((element) => {
                    element.classList.remove("is-focused");
                });
        }

        nodes.forEach((node) => {
            ["mouseenter", "focus"].forEach((eventName) => {
                node.addEventListener(eventName, () => {
                    setConnectionFocus(node.dataset.node);
                });
            });

            ["mouseleave", "blur"].forEach((eventName) => {
                node.addEventListener(eventName, clearConnectionFocus);
            });
        });

        revealOnce(architectureSection);
    }



    /* ========================================
         Fireflies
     ======================================== */


    function initializeFireflies() {
        const container =
            document.querySelector(".fireflies");

        if (!container || prefersReducedMotion) {
            return;
        }

        const fireflyCount = 100;
        const fragment = document.createDocumentFragment();

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

            setCssProperties(firefly, {
                "--size": `${size}px`,
                "--duration": `${duration}s`,
                "--glow-duration": `${glowDuration}s`,
                "--delay": `${delay}s`,
                "--max-opacity": maxOpacity,
                "--move-x-1": `${Math.random() * 30 - 15}px`,
                "--move-y-1": `${Math.random() * -30}px`,
                "--move-x-2": `${Math.random() * 40 - 20}px`,
                "--move-y-2": `${Math.random() * -50}px`,
                "--move-x-3": `${Math.random() * 30 - 15}px`,
                "--move-y-3": `${Math.random() * -25}px`
            });

            fragment.appendChild(firefly);
        }

        container.appendChild(fragment);
    }

    /* ========================================
           Initialize
        ======================================== */

    function initializePaymatePage() {
        document
            .querySelectorAll(".scroll-reveal")
            .forEach((element) => revealOnce(element, { threshold: 0.08 }));
        initializeFireflies();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializePaymatePage
        );
    } else {
        initializePaymatePage();
    }


})();

(() => {
    "use strict";

    const story = document.querySelector("[data-receipt-story]");

    if (!story) return;

    const steps = [
        ...story.querySelectorAll("[data-story-step]")
    ];

    const counter = story.querySelector("[data-story-current]");
    let activeIndex = -1;
    let frameRequested = false;

    function formatStep(index) {
        return String(index + 1).padStart(2, "0");
    }

    function activateStep(index) {
        if (index === activeIndex || !steps[index]) return;

        steps.forEach((step, stepIndex) => {
            const active = stepIndex === index;

            step.classList.toggle("is-active", active);

            if (active) {
                step.setAttribute("aria-current", "step");
            } else {
                step.removeAttribute("aria-current");
            }
        });

        story.style.setProperty("--story-index", index);
        counter.textContent = formatStep(index);
        activeIndex = index;
    }

    function updateStory() {
        frameRequested = false;

        const rect = story.getBoundingClientRect();
        const scrollDistance = Math.max(
            story.offsetHeight - window.innerHeight,
            1
        );

        const scrolled = Math.min(
            Math.max(-rect.top, 0),
            scrollDistance
        );

        const progress = scrolled / scrollDistance;

        /*
         * Progress 0–1 ใช้เติมเส้นตรงกลางแบบต่อเนื่อง
         */
        story.style.setProperty(
            "--story-progress",
            progress.toFixed(4)
        );

        /*
         * แบ่ง Scroll ออกเป็น 5 ช่วง
         */
        const nextIndex = Math.min(
            steps.length - 1,
            Math.floor(progress * steps.length)
        );

        activateStep(nextIndex);
    }

    function requestStoryUpdate() {
        if (frameRequested) return;

        frameRequested = true;
        window.requestAnimationFrame(updateStory);
    }

    window.PaymateUI.revealOnce(story.querySelector("[data-story-header]"), {
        visibleClass: "is-header-visible",
        classTarget: story,
        threshold: 0.18
    });

    window.addEventListener(
        "scroll",
        requestStoryUpdate,
        { passive: true }
    );

    

    window.addEventListener(
        "resize",
        requestStoryUpdate
    );

    activateStep(0);
    updateStory();
})();


(() => {
    "use strict";

    const section = document.querySelector("[data-data-design]");

    if (!section) return;

    const pipeline = section.querySelector("[data-data-pipeline]");
    const svg = section.querySelector("[data-mapping-svg]");
    const mappingNodes = [
        ...section.querySelectorAll("[data-map]")
    ];

    const mappingGroupNodes = [
        ...section.querySelectorAll("[data-map-group]")
    ];

    const destinationField = section.querySelector(
        "[data-destination-field]"
    );

    const destinationText = section.querySelector(
        "[data-destination-text]"
    );

    const destinations = {
        store_name: {
            label: "store_name",
            text: "Merchant search and receipt history"
        },

        date: {
            label: "purchase_date",
            text: "Monthly expense summary"
        },

        item_coffee: {
            label: "items[0]",
            text: "Item record · Coffee · ฿80"
        },

        item_sandwich: {
            label: "items[1]",
            text: "Item record · Sandwich · ฿120"
        },

        category: {
            label: "category_id",
            text: "Spending breakdown"
        },

        total_amount: {
            label: "total_amount",
            text: "Monthly expense summary"
        },

        ocr_confidence: {
            label: "ocr_confidence",
            text: "Receipt validation and manual review"
        }
    };

    let activeMap = null;
    let resizeFrame = null;

    function createSvgPath(mapName, start, end) {
        const pipelineRect = pipeline.getBoundingClientRect();
        const startRect = start.getBoundingClientRect();
        const endRect = end.getBoundingClientRect();

        const startX =
            startRect.right -
            pipelineRect.left;

        const startY =
            startRect.top -
            pipelineRect.top +
            startRect.height / 2;

        const endX =
            endRect.left -
            pipelineRect.left;

        const endY =
            endRect.top -
            pipelineRect.top +
            endRect.height / 2;

        const distance = Math.max(endX - startX, 20);
        const curve = Math.min(distance * 0.42, 90);

        const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        path.classList.add("data-mapping-line");
        path.dataset.mapLine = mapName;
        path.setAttribute("pathLength", "1");

        path.setAttribute(
            "d",
            [
                `M ${startX} ${startY}`,
                `C ${startX + curve} ${startY},`,
                `${endX - curve} ${endY},`,
                `${endX} ${endY}`
            ].join(" ")
        );

        return path;
    }

    function getMapGroup(mapName) {
        if (
            mapName === "item_coffee" ||
            mapName === "item_sandwich"
        ) {
            return "item";
        }

        return null;
    }

    function drawMappings() {
        if (window.innerWidth <= 900) {
            svg.replaceChildren();
            return;
        }

        const pipelineRect = pipeline.getBoundingClientRect();

        svg.setAttribute(
            "viewBox",
            `0 0 ${pipelineRect.width} ${pipelineRect.height}`
        );

        svg.replaceChildren();

        Object.keys(destinations).forEach((mapName) => {
            const relatedNodes = [
                ...pipeline.querySelectorAll(
                    `[data-map="${mapName}"]`
                )
            ];

            const mapGroup = getMapGroup(mapName);

            if (mapGroup) {
                const entityAnchor = pipeline.querySelector(
                    `[data-map-anchor="${mapGroup}"]`
                );

                if (entityAnchor) {
                    relatedNodes.push(entityAnchor);
                }
            }

            if (relatedNodes.length < 2) return;

            for (
                let index = 0;
                index < relatedNodes.length - 1;
                index += 1
            ) {
                const path = createSvgPath(
                    mapName,
                    relatedNodes[index],
                    relatedNodes[index + 1]
                );

                svg.appendChild(path);
            }
        });

        updateLineStates();
    }

    function updateLineStates() {
        svg
            .querySelectorAll("[data-map-line]")
            .forEach((line) => {
                const related =
                    activeMap &&
                    line.dataset.mapLine === activeMap;

                line.classList.toggle(
                    "is-related",
                    Boolean(related)
                );

                line.classList.toggle(
                    "is-dimmed",
                    Boolean(activeMap && !related)
                );
            });
    }

    function activateMapping(mapName) {
        activeMap = mapName;

        drawMappings();
        pipeline.classList.add("has-active-map");

        const mapGroup = getMapGroup(mapName);

        mappingNodes.forEach((node) => {
            node.classList.toggle(
                "is-related",
                node.dataset.map === mapName
            );
        });

        mappingGroupNodes.forEach((node) => {
            const related =
                mapGroup &&
                node.dataset.mapGroup === mapGroup;

            node.classList.toggle(
                "is-related",
                Boolean(related)
            );
        });

        section
            .querySelectorAll(".entity")
            .forEach((entity) => {
                const containsExactMap = Boolean(
                    entity.querySelector(
                        `[data-map="${mapName}"]`
                    )
                );

                const isGroupEntity =
                    mapGroup &&
                    entity.dataset.mapAnchor === mapGroup;

                entity.classList.toggle(
                    "is-related",
                    Boolean(
                        containsExactMap ||
                        isGroupEntity
                    )
                );
            });

        const destination = destinations[mapName];

        if (destination) {
            destinationField.textContent =
                destination.label;

            destinationText.textContent =
                destination.text;
        }

        updateLineStates();
    }

    function clearMapping() {
        activeMap = null;
        pipeline.classList.remove("has-active-map");

        section
            .querySelectorAll(".is-related")
            .forEach((element) => {
                element.classList.remove("is-related");
            });

        destinationField.textContent = "Hover a field";

        destinationText.textContent =
            "See how receipt data flows through the system";

        updateLineStates();
    }

    mappingNodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
            activateMapping(node.dataset.map);
        });

        node.addEventListener("mouseleave", clearMapping);

        node.addEventListener("focus", () => {
            activateMapping(node.dataset.map);
        });

        node.addEventListener("blur", clearMapping);
    });

    function requestMappingDraw() {
        window.cancelAnimationFrame(resizeFrame);

        resizeFrame = window.requestAnimationFrame(
            drawMappings
        );
    }

    function refreshMappingsAfterReveal() {
        requestMappingDraw();

        window.setTimeout(requestMappingDraw, 300);
        window.setTimeout(requestMappingDraw, 700);
    }

    window.addEventListener(
        "resize",
        requestMappingDraw
    );


    window.addEventListener("load", drawMappings);

    if (document.fonts?.ready) {
        document.fonts.ready.then(drawMappings);
    }

    /*
     * Section reveal
     */
    window.PaymateUI.revealOnce(section, {
        threshold: 0.15
    });

    const revealObserver = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) return;

            refreshMappingsAfterReveal();
            revealObserver.disconnect();
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    revealObserver.observe(section);
    drawMappings();
})();

(() => {
    "use strict";

    const section = document.querySelector(
        "[data-design-outcome]"
    );

    if (!section) return;

    const screensContainer = section.querySelector(
        "[data-design-screens]"
    );

    const screens = [
        ...section.querySelectorAll(
            "[data-design-screen]"
        )
    ];

    function focusScreen(screenName) {
        screensContainer.classList.add("has-focus");

        screens.forEach((screen) => {
            screen.classList.toggle(
                "is-focused",
                screen.dataset.designScreen === screenName
            );
        });
    }

    function clearScreenFocus() {
        screensContainer.classList.remove("has-focus");

        screens.forEach((screen) => {
            screen.classList.remove("is-focused");
        });
    }

    screens.forEach((screen) => {
        const screenName = screen.dataset.designScreen;

        screen.addEventListener("mouseenter", () => {
            focusScreen(screenName);
        });

        screen.addEventListener("mouseleave", () => {
            clearScreenFocus();
        });

        screen.addEventListener("focusin", () => {
            focusScreen(screenName);
        });

        screen.addEventListener("focusout", (event) => {
            if (screen.contains(event.relatedTarget)) {
                return;
            }

            clearScreenFocus();
        });
    });


    window.PaymateUI.revealOnce(section, {
        threshold: 0.16
    });
})();



(() => {
    "use strict";

    const section = document.querySelector(
        "[data-reflection-section]"
    );

    if (!section) return;

    window.PaymateUI.revealOnce(section, {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px"
    });
})();
