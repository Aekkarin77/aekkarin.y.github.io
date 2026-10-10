(() => {
    "use strict";

    /* ========================================
       Fireflies
    ======================================== */

    function initializeFireflies() {
        const container = document.querySelector(".fireflies");

        if (!container) {
            return;
        }

        const fireflyCount = 100;

        for (
            let index = 0;
            index < fireflyCount;
            index += 1
        ) {
            const firefly = document.createElement("span");

            firefly.className = "firefly";

            const size = Math.random() * 4 + 2;
            const duration = Math.random() * 6 + 8;
            const glowDuration = Math.random() * 3 + 2.5;
            const delay = -(Math.random() * duration);
            const maxOpacity = Math.random() * 0.45 + 0.25;

            firefly.style.left = `${Math.random() * 100}%`;
            firefly.style.top = `${Math.random() * 100}%`;

            firefly.style.setProperty("--size", `${size}px`);
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
       Section Reveal
    ======================================== */

    function observeOnce(element, callback, options = {}) {
        if (!element) {
            return;
        }

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            callback(element);
            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    callback(entry.target);
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                threshold: options.threshold ?? 0.15,
                rootMargin:
                    options.rootMargin ??
                    "0px 0px -10% 0px"
            }
        );

        observer.observe(element);
    }

    function initializeSectionReveals() {
        const sections = document.querySelectorAll(
            "[data-section-reveal]"
        );

        if (!sections.length) {
            return;
        }

        sections.forEach((section) => {
            observeOnce(section, (currentSection) => {
                currentSection.classList.add("is-visible");
            });
        });
    }

    /* ========================================
   Proposed UI Showcase
======================================== */

    function initializeScreenShowcase() {
        const showcase = document.querySelector(
            "[data-screen-showcase]"
        );

        if (!showcase) {
            return;
        }

        const buttons = Array.from(
            showcase.querySelectorAll("[data-screen-button]")
        );

        const images = Array.from(
            showcase.querySelectorAll("[data-screen-image]")
        );

        const indicator = showcase.querySelector(
            "[data-screen-indicator]"
        );

        const content = showcase.querySelector(
            "[data-screen-content]"
        );

        const title = showcase.querySelector(
            "[data-screen-title]"
        );

        const description = showcase.querySelector(
            "[data-screen-description]"
        );

        const features = showcase.querySelector(
            "[data-screen-features]"
        );

        const currentNumber = showcase.querySelector(
            "[data-screen-current]"
        );

        const previousButton = showcase.querySelector(
            "[data-screen-previous]"
        );

        const nextButton = showcase.querySelector(
            "[data-screen-next]"
        );

        const screens = [
            {
                title: "Store & Discovery",
                description:
                    "A storefront designed to help players scan featured releases, compare offers, and reach game details quickly.",
                features: [
                    "Featured discovery",
                    "Offer visibility",
                    "Clear navigation"
                ]
            },
            {
                title: "Product Details",
                description:
                    "A focused product page presenting game information, pricing, requirements, and available offers.",
                features: [
                    "Game information",
                    "System requirements",
                    "Purchase options"
                ]
            },
            {
                title: "Community",
                description:
                    "A shared space where players can discover discussions, recommendations, and community activity.",
                features: [
                    "Player discussions",
                    "Recommendations",
                    "Community activity"
                ]
            },
            {
                title: "Game Library",
                description:
                    "A personal collection that gives players quick access to purchased and installed games.",
                features: [
                    "Owned games",
                    "Installation status",
                    "Quick game access"
                ]
            }
        ];

        let activeIndex = 0;
        let transitionTimer;

        function moveIndicator(index) {
            const indexContainer = showcase.querySelector(
                "[data-screen-index]"
            );

            const activeButton = buttons[index];

            if (!indicator || !activeButton || !indexContainer) {
                return;
            }

            const containerRect =
                indexContainer.getBoundingClientRect();

            const buttonRect =
                activeButton.getBoundingClientRect();

            const offsetX =
                buttonRect.left - containerRect.left
                + indexContainer.scrollLeft;

            indicator.style.width = `${buttonRect.width}px`;
            indicator.style.transform =
                `translateX(${offsetX}px)`;
        }

        function updateDetails(index) {
            const screen = screens[index];

            title.textContent = screen.title;
            description.textContent = screen.description;

            features.innerHTML = screen.features
                .map((feature) => `<li>${feature}</li>`)
                .join("");

            currentNumber.textContent = String(index + 1).padStart(
                2,
                "0"
            );
        }

        function selectScreen(index) {
            if (index === activeIndex) {
                return;
            }

            window.clearTimeout(transitionTimer);

            const previousIndex = activeIndex;
            activeIndex = index;

            buttons.forEach((button, buttonIndex) => {
                const isActive = buttonIndex === activeIndex;

                button.classList.toggle("is-active", isActive);
                button.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            images.forEach((image, imageIndex) => {
                image.classList.remove(
                    "is-active",
                    "is-previous"
                );

                image.setAttribute(
                    "aria-hidden",
                    String(imageIndex !== activeIndex)
                );
            });

            images[previousIndex]?.classList.add("is-previous");
            images[activeIndex]?.classList.add("is-active");

            moveIndicator(activeIndex);
            content.classList.add("is-changing");

            transitionTimer = window.setTimeout(() => {
                updateDetails(activeIndex);
                content.classList.remove("is-changing");
            }, 180);
        }

        buttons.forEach((button, index) => {
            button.addEventListener("click", () => {
                selectScreen(index);
            });
        });

        previousButton?.addEventListener("click", () => {
            const previousIndex =
                (activeIndex - 1 + screens.length) %
                screens.length;

            selectScreen(previousIndex);
        });

        nextButton?.addEventListener("click", () => {
            const nextIndex =
                (activeIndex + 1) % screens.length;

            selectScreen(nextIndex);
        });

        window.addEventListener("resize", () => {
            moveIndicator(activeIndex);
        });

        images.forEach((image, index) => {
            image.setAttribute(
                "aria-hidden",
                String(index !== activeIndex)
            );
        });

        moveIndicator(activeIndex);
    }

    /* ========================================
   UI–Data Mapping
======================================== */

    function initializeMappingSection() {
        const section = document.querySelector(
            "[data-mapping-section]"
        );

        if (!section) {
            return;
        }

        const tabs = Array.from(
            section.querySelectorAll("[data-mapping-tab]")
        );

        const tabContainer = section.querySelector(
            "[data-mapping-tabs]"
        );

        const indicator = section.querySelector(
            "[data-mapping-indicator]"
        );

        const panel = section.querySelector(
            "[data-mapping-panel]"
        );

        const rowsContainer = section.querySelector(
            "[data-mapping-rows]"
        );

        const relationship = section.querySelector(
            "[data-mapping-relationship]"
        );

        const tooltip = section.querySelector(
            "[data-entity-tooltip]"
        );

        const tooltipTitle = section.querySelector(
            "[data-tooltip-title]"
        );

        const tooltipDescription = section.querySelector(
            "[data-tooltip-description]"
        );

        const mappingData = {
            player: {
                relationship:
                    "Player activity is connected through user_id. Purchases create ownership records, while reviews reference both the user and game.",
                rows: [
                    {
                        screen: "Create Account",
                        action:
                            "Register login credentials and personal information",
                        entities: ["user"]
                    },
                    {
                        screen: "Browse Store",
                        action:
                            "View available games, genres, and offers",
                        entities: [
                            "game",
                            "gamesubmission",
                            "genre_id_to_name"
                        ]
                    },
                    {
                        screen: "Purchase Game",
                        action:
                            "Complete payment and record game ownership",
                        entities: [
                            "user",
                            "game",
                            "purchase",
                            "library"
                        ]
                    },
                    {
                        screen: "Write Review",
                        action:
                            "Submit a recommendation and rating",
                        entities: ["user", "game", "review"]
                    }
                ]
            },

            developer: {
                relationship:
                    "A developer is an extension of a user account. The developer record references user through user_id before submission data can be created.",
                rows: [
                    {
                        screen: "Create Account",
                        action:
                            "Register login credentials and personal information",
                        entities: ["user"]
                    },
                    {
                        screen: "Developer Profile",
                        action:
                            "Add developer name and studio information",
                        entities: ["user", "developer"]
                    },
                    {
                        screen: "Game Submission",
                        action:
                            "Submit game details, files, genres, and age rating",
                        entities: [
                            "developer",
                            "gamesubmission",
                            "gamesubmission_genre",
                            "genre_id_to_name"
                        ]
                    },
                    {
                        screen: "Submission Status",
                        action:
                            "View whether a submitted game is pending, approved, or rejected",
                        entities: ["developer", "gamesubmission"]
                    }
                ]
            },

            administrator: {
                relationship:
                    "Administrators evaluate submission data and update its approval status before an accepted game becomes visible in the store.",
                rows: [
                    {
                        screen: "Administrator Login",
                        action:
                            "Authenticate an administrator account",
                        entities: ["user", "administrator"]
                    },
                    {
                        screen: "Pending Submissions",
                        action:
                            "View games waiting for administrative review",
                        entities: [
                            "administrator",
                            "developer",
                            "gamesubmission"
                        ]
                    },
                    {
                        screen: "Review Details",
                        action:
                            "Inspect game information, files, genres, and rating",
                        entities: [
                            "gamesubmission",
                            "gamesubmission_genre",
                            "genre_id_to_name"
                        ]
                    },
                    {
                        screen: "Approve or Reject",
                        action:
                            "Update the submission review status",
                        entities: [
                            "administrator",
                            "gamesubmission"
                        ]
                    }
                ]
            }
        };

        const entityDescriptions = {
            user:
                "Stores account credentials and personal information shared across user roles.",

            developer:
                "Stores the developer profile linked to user through user_id.",

            administrator:
                "Stores administrator information and review permissions.",

            game:
                "Stores published game information available to players.",

            gamesubmission:
                "Stores submitted game data and its current review status.",

            gamesubmission_genre:
                "Connects a game submission with one or more genres.",

            genre_id_to_name:
                "Maps each genre identifier to its readable genre name.",

            purchase:
                "Records a completed game purchase made by a user.",

            library:
                "Connects a user with games they own and can access.",

            review:
                "Stores a player's recommendation and rating for a game."
        };

        let activeRole = "player";
        let changeTimer;

        function escapeHTML(value) {
            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        function renderRows(role) {
            const roleData = mappingData[role];

            rowsContainer.innerHTML = roleData.rows
                .map((row, rowIndex) => {
                    const number = String(rowIndex + 1).padStart(
                        2,
                        "0"
                    );

                    const pills = row.entities
                        .map((entity) => {
                            const safeEntity = escapeHTML(entity);

                            return `
                            <button
                                class="steam-entity-pill"
                                type="button"
                                data-entity="${safeEntity}"
                            >
                                ${safeEntity}
                            </button>
                        `;
                        })
                        .join("");

                    return `
                    <article
                        class="steam-mapping__row"
                        style="--row-delay: ${rowIndex * 160}ms"
                    >
                        <span class="steam-mapping__number">
                            ${number}
                        </span>

                        <strong class="steam-mapping__screen">
                            ${escapeHTML(row.screen)}
                        </strong>

                        <p class="steam-mapping__action">
                            ${escapeHTML(row.action)}
                        </p>

                        <span
                            class="steam-mapping__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                        <div class="steam-mapping__entities">
                            ${pills}
                        </div>
                    </article>
                `;
                })
                .join("");

            relationship.textContent = roleData.relationship;

            panel.classList.remove("is-rendered");

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    panel.classList.add("is-rendered");
                });
            });
        }

        function moveIndicator(tab) {
            if (!tab || !tabContainer || !indicator) {
                return;
            }

            const containerRect =
                tabContainer.getBoundingClientRect();

            const tabRect = tab.getBoundingClientRect();

            const offsetX =
                tabRect.left -
                containerRect.left +
                tabContainer.scrollLeft;

            indicator.style.width = `${tabRect.width}px`;
            indicator.style.transform =
                `translateX(${offsetX}px)`;
        }

        function selectRole(role) {
            if (!mappingData[role] || role === activeRole) {
                return;
            }

            window.clearTimeout(changeTimer);

            activeRole = role;

            tabs.forEach((tab) => {
                const isActive =
                    tab.dataset.mappingTab === activeRole;

                tab.classList.toggle("is-active", isActive);
                tab.setAttribute(
                    "aria-selected",
                    String(isActive)
                );

                if (isActive) {
                    moveIndicator(tab);
                }
            });

            panel.classList.add("is-changing");

            changeTimer = window.setTimeout(() => {
                renderRows(activeRole);
                panel.classList.remove("is-changing");
            }, 180);
        }

        function highlightEntity(entity) {
            const pills = section.querySelectorAll(
                "[data-entity]"
            );

            section.classList.add("has-focused-entity");

            pills.forEach((pill) => {
                pill.classList.toggle(
                    "is-highlighted",
                    pill.dataset.entity === entity
                );
            });
        }

        function clearEntityHighlight() {
            section.classList.remove("has-focused-entity");

            section
                .querySelectorAll(".is-highlighted")
                .forEach((pill) => {
                    pill.classList.remove("is-highlighted");
                });

            tooltip.classList.remove("is-visible");
            tooltip.setAttribute("aria-hidden", "true");
        }

        function positionTooltip(event) {
            const spacing = 16;
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            let x = event.clientX + spacing;
            let y = event.clientY + spacing;

            if (x + tooltipWidth > window.innerWidth - spacing) {
                x = event.clientX - tooltipWidth - spacing;
            }

            if (y + tooltipHeight > window.innerHeight - spacing) {
                y = event.clientY - tooltipHeight - spacing;
            }

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }

        function showTooltip(entity, event) {
            tooltipTitle.textContent = entity;
            tooltipDescription.textContent =
                entityDescriptions[entity] ||
                "Database entity used by this interface action.";

            tooltip.classList.add("is-visible");
            tooltip.setAttribute("aria-hidden", "false");

            if (event) {
                positionTooltip(event);
            }
        }

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                selectRole(tab.dataset.mappingTab);
            });
        });

        rowsContainer.addEventListener("pointerover", (event) => {
            const pill = event.target.closest("[data-entity]");

            if (!pill) {
                return;
            }

            const entity = pill.dataset.entity;

            highlightEntity(entity);
            showTooltip(entity, event);
        });

        rowsContainer.addEventListener("pointermove", (event) => {
            if (tooltip.classList.contains("is-visible")) {
                positionTooltip(event);
            }
        });

        rowsContainer.addEventListener("pointerout", (event) => {
            const pill = event.target.closest("[data-entity]");

            if (
                pill &&
                !pill.contains(event.relatedTarget)
            ) {
                clearEntityHighlight();
            }
        });

        rowsContainer.addEventListener("focusin", (event) => {
            const pill = event.target.closest("[data-entity]");

            if (!pill) {
                return;
            }

            const entity = pill.dataset.entity;
            const rect = pill.getBoundingClientRect();

            highlightEntity(entity);
            showTooltip(entity, {
                clientX: rect.right,
                clientY: rect.top
            });
        });

        rowsContainer.addEventListener("focusout", (event) => {
            if (!rowsContainer.contains(event.relatedTarget)) {
                clearEntityHighlight();
            }
        });

        window.addEventListener("resize", () => {
            const activeTab = tabs.find((tab) =>
                tab.classList.contains("is-active")
            );

            moveIndicator(activeTab);
        });

        tabContainer.addEventListener("scroll", () => {
            const activeTab = tabs.find((tab) =>
                tab.classList.contains("is-active")
            );

            moveIndicator(activeTab);
        });

        const initialTab = tabs.find((tab) =>
            tab.classList.contains("is-active")
        );

        renderRows(activeRole);
        moveIndicator(initialTab);
    }

    function initializeDatabaseDesign() {
        const section = document.querySelector("[data-database-section]");

        if (!section) {
            return;
        }

        const canvas = section.querySelector("[data-database-canvas]");
        const stage = section.querySelector("[data-database-stage]");
        const source = canvas.dataset.databaseSource;

        const filterButtons = [
            ...section.querySelectorAll("[data-database-filter]")
        ];

        const zoomOutButton =
            section.querySelector("[data-database-zoom-out]");

        const zoomInButton =
            section.querySelector("[data-database-zoom-in]");

        const resetButton =
            section.querySelector("[data-database-reset]");

        const openButton =
            section.querySelector("[data-database-open]");

        const zoomValue =
            section.querySelector("[data-database-zoom-value]");

        const tooltip =
            section.querySelector("[data-database-tooltip]");

        const tooltipTitle =
            section.querySelector("[data-database-tooltip-title]");

        const tooltipCount =
            section.querySelector("[data-database-tooltip-count]");

        /*
         * ลำดับนี้อิงจากโครงสร้างจริงของ Er (1).svg
         * ห้ามเปลี่ยนลำดับหากยังใช้ไฟล์เดิม
         */
        const tableOrder = [
            "admin",
            "cart",
            "cartcontaingames",
            "developer",
            "game",
            "game_genre",
            "gamesubmission",
            "gamesubmission_genre",
            "genre_id_to_name",
            "paymentmethod",
            "user",
            "userowngames",
            "userreview"
        ];

        const state = {
            svg: null,
            tables: [],
            relationships: [],
            originalViewBox: null,
            currentViewBox: null,
            zoom: 1,
            animationFrame: null,

            isPanning: false,
            panStartX: 0,
            panStartY: 0,
            panStartViewBox: null
        };

        const svgNamespace = "http://www.w3.org/2000/svg";

        function isTableStart(element) {
            return (
                element.tagName?.toLowerCase() === "path" &&
                element.getAttribute("fill") ===
                "rgb(100%, 100%, 100%)" &&
                element.getAttribute("stroke") ===
                "rgb(50%, 50%, 50%)"
            );
        }

        function createSVGGroup(className) {
            const group =
                document.createElementNS(svgNamespace, "g");

            group.setAttribute("class", className);

            return group;
        }

        function prepareRelationships(svg, tableStartIndex) {
            const originalChildren = [...svg.children];

            const relationshipPaths =
                originalChildren
                    .slice(0, tableStartIndex)
                    .filter((element) => {
                        return (
                            element.tagName?.toLowerCase() === "path" &&
                            element.getAttribute("fill") === "none"
                        );
                    });

            /*
             * Er (1).svg ใช้ path 5 ตัวต่อหนึ่ง relationship:
             * 1 เส้นหลัก + 4 เครื่องหมายตรงปลายเส้น
             */
            for (
                let index = 0;
                index < relationshipPaths.length;
                index += 5
            ) {
                const paths =
                    relationshipPaths.slice(index, index + 5);

                if (paths.length === 0) {
                    continue;
                }

                const relationship =
                    createSVGGroup("steam-db-relationship");

                paths[0].before(relationship);

                paths.forEach((path) => {
                    relationship.appendChild(path);
                });

                const mainPath = paths[0];
                const length = mainPath.getTotalLength();

                mainPath.classList.add(
                    "steam-db-relationship__main"
                );

                relationship.style.setProperty(
                    "--relationship-length",
                    length
                );

                state.relationships.push({
                    element: relationship,
                    path: mainPath,
                    tables: []
                });
            }
        }

        function prepareTables(svg) {
            const originalChildren = [...svg.children];

            const starts = originalChildren
                .map((element, index) => {
                    return isTableStart(element) ? index : -1;
                })
                .filter((index) => index !== -1);

            if (starts.length !== tableOrder.length) {
                console.warn(
                    `Expected ${tableOrder.length} tables, ` +
                    `but found ${starts.length}.`
                );
            }

            prepareRelationships(svg, starts[0]);

            starts.forEach((startIndex, tableIndex) => {
                const endIndex =
                    starts[tableIndex + 1] ??
                    originalChildren.length;

                const nodes =
                    originalChildren.slice(startIndex, endIndex);

                const name =
                    tableOrder[tableIndex] ??
                    `table-${tableIndex + 1}`;

                const group =
                    createSVGGroup("steam-db-table");

                group.dataset.table = name;
                group.setAttribute("tabindex", "0");
                group.setAttribute("role", "button");
                group.setAttribute(
                    "aria-label",
                    `${name} database table`
                );

                nodes[0].before(group);

                nodes.forEach((node) => {
                    group.appendChild(node);
                });

                const table = {
                    name,
                    element: group
                };

                state.tables.push(table);

                group.addEventListener(
                    "pointerenter",
                    (event) => showTableInteraction(table, event)
                );

                group.addEventListener(
                    "pointermove",
                    moveTooltip
                );

                group.addEventListener(
                    "pointerleave",
                    () => hideTableInteraction(table)
                );

                group.addEventListener(
                    "focus",
                    (event) => showTableInteraction(table, event)
                );

                group.addEventListener(
                    "blur",
                    () => hideTableInteraction(table)
                );
            });
        }

        function distanceToRectangle(point, rectangle) {
            const horizontalDistance = Math.max(
                rectangle.left - point.x,
                0,
                point.x - rectangle.right
            );

            const verticalDistance = Math.max(
                rectangle.top - point.y,
                0,
                point.y - rectangle.bottom
            );

            return Math.hypot(
                horizontalDistance,
                verticalDistance
            );
        }

        function convertSVGPoint(path, point) {
            const matrix = path.getScreenCTM();

            if (!matrix) {
                return null;
            }

            return new DOMPoint(point.x, point.y)
                .matrixTransform(matrix);
        }

        function findNearestTable(point) {
            let nearestTable = null;
            let nearestDistance = Infinity;

            state.tables.forEach((table) => {
                const rectangle =
                    table.element.getBoundingClientRect();

                const distance =
                    distanceToRectangle(point, rectangle);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTable = table;
                }
            });

            return nearestTable;
        }

        function connectRelationshipsToTables() {
            state.relationships.forEach((relationship) => {
                const path = relationship.path;
                const length = path.getTotalLength();

                const startPoint = convertSVGPoint(
                    path,
                    path.getPointAtLength(0)
                );

                const endPoint = convertSVGPoint(
                    path,
                    path.getPointAtLength(length)
                );

                if (!startPoint || !endPoint) {
                    return;
                }

                const firstTable =
                    findNearestTable(startPoint);

                const secondTable =
                    findNearestTable(endPoint);

                relationship.tables = [
                    firstTable?.name,
                    secondTable?.name
                ].filter(
                    (name, index, names) => {
                        return (
                            name &&
                            names.indexOf(name) === index
                        );
                    }
                );

                relationship.element.dataset.tables =
                    relationship.tables.join(" ");
            });
        }

        function restartLineAnimation(relationship) {
            const element = relationship.element;
            const path = relationship.path;

            element.classList.remove("is-drawing");

            /*
             * ล้างสถานะ dash ที่อาจค้างจาก Animation รอบก่อน
             */
            path.style.strokeDasharray = "";
            path.style.strokeDashoffset = "";

            void element.getBoundingClientRect();

            function handleAnimationEnd() {
                /*
                 * เมื่อวาดเสร็จ ให้กลับเป็นเส้นเต็ม
                 * ป้องกันเส้นสั้นลงตอนเปลี่ยน Zoom
                 */
                element.classList.remove("is-drawing");

                path.style.strokeDasharray = "";
                path.style.strokeDashoffset = "";

                path.removeEventListener(
                    "animationend",
                    handleAnimationEnd
                );
            }

            path.addEventListener(
                "animationend",
                handleAnimationEnd
            );

            element.classList.add("is-drawing");
        }

        function applyFilter(selectedName) {
            const showAll = selectedName === "all";

            filterButtons.forEach((button) => {
                button.classList.toggle(
                    "is-active",
                    button.dataset.databaseFilter === selectedName
                );
            });

            if (showAll) {
                state.tables.forEach((table) => {
                    table.element.classList.remove(
                        "is-dimmed",
                        "is-related",
                        "is-selected"
                    );
                });

                state.relationships.forEach((relationship) => {
                    relationship.element.classList.remove(
                        "is-dimmed",
                        "is-related",
                        "is-drawing"
                    );
                });

                return;
            }

            const relatedRelationships =
                state.relationships.filter((relationship) => {
                    return relationship.tables.includes(
                        selectedName
                    );
                });

            const relatedTableNames =
                new Set([selectedName]);

            relatedRelationships.forEach((relationship) => {
                relationship.tables.forEach((name) => {
                    relatedTableNames.add(name);
                });
            });

            state.tables.forEach((table) => {
                const isSelected =
                    table.name === selectedName;

                const isRelated =
                    relatedTableNames.has(table.name);

                table.element.classList.toggle(
                    "is-selected",
                    isSelected
                );

                table.element.classList.toggle(
                    "is-related",
                    isRelated
                );

                table.element.classList.toggle(
                    "is-dimmed",
                    !isRelated
                );
            });

            state.relationships.forEach((relationship) => {
                const isRelated =
                    relatedRelationships.includes(relationship);

                relationship.element.classList.toggle(
                    "is-related",
                    isRelated
                );

                relationship.element.classList.toggle(
                    "is-dimmed",
                    !isRelated
                );

                relationship.element.classList.remove(
                    "is-drawing"
                );

                if (isRelated) {
                    restartLineAnimation(relationship);
                }
            });
        }

        function getTableRelationships(name) {
            return state.relationships.filter(
                (relationship) => {
                    return relationship.tables.includes(name);
                }
            );
        }

        function formatTableName(name) {
            return name.replaceAll("_", " ");
        }

        function showTableInteraction(table, event) {
            const relationships =
                getTableRelationships(table.name);

            table.element.classList.add("is-hovered");

            relationships.forEach((relationship) => {
                relationship.element.classList.add(
                    "is-hover-connected"
                );
            });

            tooltipTitle.textContent =
                formatTableName(table.name);

            tooltipCount.textContent =
                `${relationships.length} ` +
                `${relationships.length === 1
                    ? "relationship"
                    : "relationships"}`;

            tooltip.classList.add("is-visible");

            if (event.clientX && event.clientY) {
                moveTooltip(event);
            }
        }

        function hideTableInteraction(table) {
            table.element.classList.remove("is-hovered");

            state.relationships.forEach((relationship) => {
                relationship.element.classList.remove(
                    "is-hover-connected"
                );
            });

            tooltip.classList.remove("is-visible");
        }

        function moveTooltip(event) {
            const stageRectangle =
                stage.getBoundingClientRect();

            const tooltipWidth =
                tooltip.offsetWidth;

            const tooltipHeight =
                tooltip.offsetHeight;

            let left =
                event.clientX - stageRectangle.left + 14;

            let top =
                event.clientY - stageRectangle.top + 14;

            left = Math.min(
                left,
                stageRectangle.width - tooltipWidth - 12
            );

            top = Math.min(
                top,
                stageRectangle.height - tooltipHeight - 12
            );

            tooltip.style.left = `${Math.max(12, left)}px`;
            tooltip.style.top = `${Math.max(12, top)}px`;
        }

        function animateViewBox(targetViewBox) {
            cancelAnimationFrame(state.animationFrame);

            const startViewBox = {
                ...state.currentViewBox
            };

            const duration = 300;
            const startTime = performance.now();

            function ease(progress) {
                return 1 - Math.pow(1 - progress, 3);
            }

            function update(currentTime) {
                const elapsed =
                    currentTime - startTime;

                const progress =
                    Math.min(elapsed / duration, 1);

                const easedProgress =
                    ease(progress);

                const current = {
                    x:
                        startViewBox.x +
                        (targetViewBox.x - startViewBox.x) *
                        easedProgress,

                    y:
                        startViewBox.y +
                        (targetViewBox.y - startViewBox.y) *
                        easedProgress,

                    width:
                        startViewBox.width +
                        (
                            targetViewBox.width -
                            startViewBox.width
                        ) *
                        easedProgress,

                    height:
                        startViewBox.height +
                        (
                            targetViewBox.height -
                            startViewBox.height
                        ) *
                        easedProgress
                };

                state.svg.setAttribute(
                    "viewBox",
                    `${current.x} ${current.y} ` +
                    `${current.width} ${current.height}`
                );

                state.currentViewBox = current;

                if (progress < 1) {
                    state.animationFrame =
                        requestAnimationFrame(update);
                } else {
                    connectRelationshipsToTables();
                }
            }

            state.animationFrame =
                requestAnimationFrame(update);
        }

        function clamp(value, minimum, maximum) {
            return Math.min(
                Math.max(value, minimum),
                maximum
            );
        }

        function startDiagramPan(event) {
            if (
                !state.svg ||
                !state.currentViewBox ||
                event.button !== 0
            ) {
                return;
            }

            /*
             * ที่ 100% ไม่มีพื้นที่เหลือให้เลื่อน
             * ต้อง Zoom มากกว่า 100% ก่อน
             */
            if (state.zoom <= 1) {
                return;
            }

            cancelAnimationFrame(state.animationFrame);

            state.isPanning = true;
            state.panStartX = event.clientX;
            state.panStartY = event.clientY;
            state.panStartViewBox = {
                ...state.currentViewBox
            };

            canvas.classList.add("is-panning");
            canvas.setPointerCapture(event.pointerId);

            event.preventDefault();
        }

        function moveDiagramPan(event) {
            if (
                !state.isPanning ||
                !state.svg ||
                !state.panStartViewBox
            ) {
                return;
            }

            const svgRectangle =
                state.svg.getBoundingClientRect();

            if (
                svgRectangle.width === 0 ||
                svgRectangle.height === 0
            ) {
                return;
            }

            const horizontalScale =
                state.panStartViewBox.width /
                svgRectangle.width;

            const verticalScale =
                state.panStartViewBox.height /
                svgRectangle.height;

            const movementX =
                (event.clientX - state.panStartX) *
                horizontalScale;

            const movementY =
                (event.clientY - state.panStartY) *
                verticalScale;

            const original =
                state.originalViewBox;

            const current =
                state.currentViewBox;

            const minimumX = original.x;

            const maximumX =
                original.x +
                original.width -
                current.width;

            const minimumY = original.y;

            const maximumY =
                original.y +
                original.height -
                current.height;

            const nextX = clamp(
                state.panStartViewBox.x - movementX,
                minimumX,
                Math.max(minimumX, maximumX)
            );

            const nextY = clamp(
                state.panStartViewBox.y - movementY,
                minimumY,
                Math.max(minimumY, maximumY)
            );

            state.currentViewBox = {
                x: nextX,
                y: nextY,
                width: current.width,
                height: current.height
            };

            state.svg.setAttribute(
                "viewBox",
                `${state.currentViewBox.x} ` +
                `${state.currentViewBox.y} ` +
                `${state.currentViewBox.width} ` +
                `${state.currentViewBox.height}`
            );
        }

        function stopDiagramPan(event) {
            if (!state.isPanning) {
                return;
            }

            state.isPanning = false;
            state.panStartViewBox = null;

            canvas.classList.remove("is-panning");

            if (canvas.hasPointerCapture(event.pointerId)) {
                canvas.releasePointerCapture(
                    event.pointerId
                );
            }
        }

        function setZoom(nextZoom) {
            if (!state.svg || !state.originalViewBox) {
                return;
            }

            state.relationships.forEach((relationship) => {
                relationship.element.classList.remove(
                    "is-drawing"
                );

                relationship.path.style.strokeDasharray = "";
                relationship.path.style.strokeDashoffset = "";
            });

            const minimumZoom = 0.8;
            const maximumZoom = 1.8;

            state.zoom = Math.min(
                maximumZoom,
                Math.max(minimumZoom, nextZoom)
            );

            const original =
                state.originalViewBox;

            const width =
                original.width / state.zoom;

            const height =
                original.height / state.zoom;

            const centerX =
                original.x + original.width / 2;

            const centerY =
                original.y + original.height / 2;

            const targetViewBox = {
                x: centerX - width / 2,
                y: centerY - height / 2,
                width,
                height
            };

            animateViewBox(targetViewBox);

            zoomValue.textContent =
                `${Math.round(state.zoom * 100)}%`;

            zoomValue.classList.remove("is-changing");
            void zoomValue.offsetWidth;
            zoomValue.classList.add("is-changing");

            window.setTimeout(() => {
                zoomValue.classList.remove("is-changing");
            }, 180);
        }

        function resetDiagram() {
            setZoom(1);
            applyFilter("all");
        }

        async function loadDiagram() {
            try {
                const response = await fetch(source);

                if (!response.ok) {
                    throw new Error(
                        `Unable to load SVG: ${response.status}`
                    );
                }

                const svgText = await response.text();

                const documentParser =
                    new DOMParser();

                const svgDocument =
                    documentParser.parseFromString(
                        svgText,
                        "image/svg+xml"
                    );

                const parserError =
                    svgDocument.querySelector("parsererror");

                if (parserError) {
                    throw new Error(
                        "Er (1).svg contains invalid XML."
                    );
                }

                const sourceSVG =
                    svgDocument.documentElement;

                const svg =
                    document.importNode(sourceSVG, true);

                svg.removeAttribute("width");
                svg.removeAttribute("height");
                svg.setAttribute(
                    "preserveAspectRatio",
                    "xMidYMid meet"
                );

                svg.querySelectorAll("script").forEach(
                    (script) => script.remove()
                );

                canvas.replaceChildren(svg);

                state.svg = svg;

                prepareTables(svg);

                requestAnimationFrame(() => {
                    /*
                     * ตัดพื้นที่ว่างภายใน SVG ออก
                     * ทำให้ Diagram ใหญ่และอยู่กึ่งกลางตั้งแต่ 100%
                     */
                    const bounds = svg.getBBox();
                    const padding = 15;

                    const fittedViewBox = {
                        x: bounds.x - padding,
                        y: bounds.y - padding,
                        width: bounds.width + padding * 2,
                        height: bounds.height + padding * 2
                    };

                    svg.setAttribute(
                        "viewBox",
                        `${fittedViewBox.x} ${fittedViewBox.y} ` +
                        `${fittedViewBox.width} ${fittedViewBox.height}`
                    );

                    svg.setAttribute(
                        "preserveAspectRatio",
                        "xMidYMid meet"
                    );

                    state.originalViewBox = {
                        ...fittedViewBox
                    };

                    state.currentViewBox = {
                        ...fittedViewBox
                    };

                    state.zoom = 1;
                    zoomValue.textContent = "100%";

                    connectRelationshipsToTables();
                    applyFilter("all");
                });
            } catch (error) {
                console.error(
                    "Unable to load ER diagram:",
                    error
                );

                canvas.innerHTML = `
                <p class="steam-database__loading">
                    Unable to load diagram
                </p>
            `;
            }
        }

        function initializeEntranceAndCounters() {
            const counters = [
                ...section.querySelectorAll(
                    "[data-database-count]"
                )
            ];

            let hasAnimated = false;

            function animateCounter(counter) {
                const target =
                    Number(counter.dataset.databaseCount);

                const duration = 900;
                const startTime = performance.now();

                function update(currentTime) {
                    const progress = Math.min(
                        (currentTime - startTime) / duration,
                        1
                    );

                    const easedProgress =
                        1 - Math.pow(1 - progress, 3);

                    counter.textContent = Math.round(
                        target * easedProgress
                    );

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
            }

            observeOnce(
                section,
                () => {
                    if (hasAnimated) {
                        return;
                    }

                    hasAnimated = true;
                    section.classList.add("is-visible");

                    window.setTimeout(() => {
                        counters.forEach((counter, index) => {
                            window.setTimeout(
                                () => animateCounter(counter),
                                index * 100
                            );
                        });
                    }, 260);
                },
                {
                    threshold: 0.4
                }
            );
        }

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                applyFilter(
                    button.dataset.databaseFilter
                );
            });
        });

        canvas.addEventListener(
            "pointerdown",
            startDiagramPan
        );

        canvas.addEventListener(
            "pointermove",
            moveDiagramPan
        );

        canvas.addEventListener(
            "pointerup",
            stopDiagramPan
        );

        canvas.addEventListener(
            "pointercancel",
            stopDiagramPan
        );

        canvas.addEventListener(
            "lostpointercapture",
            () => {
                state.isPanning = false;
                state.panStartViewBox = null;
                canvas.classList.remove("is-panning");
            }
        );

        zoomOutButton.addEventListener("click", () => {
            setZoom(state.zoom - 0.2);
        });

        zoomInButton.addEventListener("click", () => {
            setZoom(state.zoom + 0.2);
        });

        resetButton.addEventListener(
            "click",
            resetDiagram
        );

        openButton.addEventListener("click", () => {
            window.open(source, "_blank", "noopener,noreferrer");
        });

        window.addEventListener("resize", () => {
            if (!state.svg) {
                return;
            }

            connectRelationshipsToTables();
        });

        initializeEntranceAndCounters();
        loadDiagram();
    }

    /* ========================================
    Functional Prototype
  ======================================== */
    function initializeFunctionalPrototype() {
        const section = document.querySelector(
            "[data-prototype-section]"
        );

        if (!section) {
            return;
        }

        const steps = [
            ...section.querySelectorAll(
                "[data-prototype-step]"
            )
        ];

        const screenCards = [
            ...section.querySelectorAll(
                "[data-prototype-select]"
            )
        ];

        const mainImage = section.querySelector(
            "[data-prototype-main-image]"
        );

        const progress = section.querySelector(
            "[data-prototype-progress]"
        );

        const metadata = section.querySelector(
            "[data-prototype-metadata]"
        );

        let activeIndex = 0;
        let transitionTimer = null;
        let transitionVersion = 0;
        let hasEntered = false;

        function updateProgress(index) {
            const maximumIndex =
                Math.max(steps.length - 1, 1);

            const percentage =
                (index / maximumIndex) * 100;

            progress.style.height =
                `${percentage}%`;
        }

        function preloadImages() {
            steps.forEach((step) => {
                const image = new Image();
                image.src = step.dataset.image;
            });
        }

        function changeMainImage(step) {
            const nextSource =
                step.dataset.image;

            const nextAlt =
                step.dataset.alt || "";

            if (
                mainImage.getAttribute("src") ===
                nextSource
            ) {
                return;
            }

            transitionVersion += 1;

            const currentVersion =
                transitionVersion;

            window.clearTimeout(transitionTimer);

            /*
             * ภาพเดิม Fade out 150ms
             */
            mainImage.classList.remove(
                "is-preparing"
            );

            mainImage.classList.add(
                "is-exiting"
            );

            transitionTimer = window.setTimeout(() => {
                if (
                    currentVersion !== transitionVersion
                ) {
                    return;
                }

                mainImage.src = nextSource;
                mainImage.alt = nextAlt;

                mainImage.classList.remove(
                    "is-exiting"
                );

                mainImage.classList.add(
                    "is-preparing"
                );

                /*
                 * รอให้ Browser รับตำแหน่งเริ่มต้น
                 * opacity 0 และ translateY(12px)
                 */
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (
                            currentVersion !==
                            transitionVersion
                        ) {
                            return;
                        }

                        mainImage.classList.remove(
                            "is-preparing"
                        );
                    });
                });
            }, 150);
        }

        function selectStep(index) {
            const nextStep = steps[index];

            if (!nextStep) {
                return;
            }

            activeIndex = index;

            /*
             * Click
             * → Highlight step
             * → Update progress
             * → Change screenshot
             */
            steps.forEach((step, stepIndex) => {
                const isActive =
                    stepIndex === activeIndex;

                step.classList.toggle(
                    "is-active",
                    isActive
                );

                step.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            screenCards.forEach(
                (card, cardIndex) => {
                    card.classList.toggle(
                        "is-active",
                        cardIndex === activeIndex
                    );
                }
            );

            updateProgress(activeIndex);
            changeMainImage(nextStep);
        }

        function typeMetadata() {
            if (!metadata) {
                return;
            }

            const text =
                metadata.dataset.text || "";

            const duration = 720;
            const characterDuration =
                duration / Math.max(text.length, 1);

            let characterIndex = 0;

            metadata.textContent = "";

            function typeNextCharacter() {
                characterIndex += 1;

                metadata.textContent =
                    text.slice(0, characterIndex);

                if (characterIndex < text.length) {
                    window.setTimeout(
                        typeNextCharacter,
                        characterDuration
                    );
                }
            }

            typeNextCharacter();
        }

        steps.forEach((step, index) => {
            step.setAttribute(
                "aria-pressed",
                String(index === activeIndex)
            );

            step.addEventListener("click", () => {
                selectStep(index);
            });
        });

        screenCards.forEach((card) => {
            card.addEventListener("click", () => {
                selectStep(
                    Number(card.dataset.prototypeSelect)
                );
            });
        });

        preloadImages();
        updateProgress(0);

        observeOnce(
            section,
            () => {
                if (hasEntered) {
                    return;
                }

                hasEntered = true;
                section.classList.add("is-visible");

                window.setTimeout(
                    typeMetadata,
                    280
                );
            },
            {
                threshold: 0.5
            }
        );
    }


    /* ========================================
       Initialize
    ======================================== */

    function initializeSteamPage() {
        initializeFireflies();
        initializeSectionReveals();
        initializeScreenShowcase();
        initializeMappingSection();
        initializeDatabaseDesign();
        initializeFunctionalPrototype();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeSteamPage
        );
    } else {
        initializeSteamPage();
    }
})();
