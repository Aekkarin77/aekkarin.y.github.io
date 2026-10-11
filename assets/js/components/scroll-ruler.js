(() => {
    "use strict";

    const SECTION_SELECTOR = "[data-scroll-ruler-title]";
    const SCROLL_STOP_DELAY = 120;
    const TITLE_RETURN_SPEED = 0.06;
    const SCREEN_RETURN_DURATION = 560;
    const VERTICAL_TRIGGER_OFFSET = 0;
    const VERTICAL_TRANSITION_MAX = 160;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const lerp = (start, end, amount) => start + (end - start) * amount;
    const ease = (value) => value * value * (3 - 2 * value);

    function cubic(start, control1, control2, end, progress) {
        const inverse = 1 - progress;
        return (
            inverse ** 3 * start +
            3 * inverse ** 2 * progress * control1 +
            3 * inverse * progress ** 2 * control2 +
            progress ** 3 * end
        );
    }

    function mixTarget(from, to, progress, railCenter, curved = false) {
        const amount = ease(progress);
        return {
            x: curved
                ? cubic(from.x, railCenter, railCenter, to.x, amount)
                : lerp(from.x, to.x, amount),
            y: curved
                ? cubic(from.y, from.y, to.y, to.y, amount)
                : lerp(from.y, to.y, amount),
            rotation: lerp(from.rotation, to.rotation, amount),
            scale: lerp(from.scale, to.scale, amount),
            opacity: lerp(from.opacity, to.opacity, amount)
        };
    }

    class ScrollRuler {
        constructor() {
            this.sections = [...document.querySelectorAll(SECTION_SELECTOR)];
            this.items = [];
            this.ticks = [];
            this.sectionTops = [];
            this.sectionHeights = [];
            this.hoverProgress = 0;
            this.hoverTarget = 0;
            this.hoverY = -100;
            this.hoverSources = new Set();
            this.hoverLeaveTimer = 0;
            this.isScrolling = false;
            this.scrollStopTimer = 0;
            this.lastScrollY = window.scrollY;
            this.scrollDirection = 1;
            this.titleMotionActive = false;
            this.isAutoReturning = false;
            this.screenReturnFrame = 0;
            this.previousScrollBehavior = null;
            this.dragging = false;
            this.frameId = 0;
            this.needsRender = true;
            this.prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            if (!this.sections.length) return;

            this.createInterface();
            this.bindEvents();
            this.recalculate();
            this.requestFrame();
        }

        createInterface() {
            this.root = document.createElement("div");
            this.root.className = "scroll-ruler-ui";

            this.veil = document.createElement("div");
            this.veil.className = "scroll-ruler__veil";
            this.veil.setAttribute("aria-hidden", "true");

            this.rail = document.createElement("div");
            this.rail.className = "scroll-ruler";
            this.rail.setAttribute("role", "scrollbar");
            this.rail.setAttribute("aria-orientation", "vertical");
            this.rail.setAttribute("aria-valuemin", "0");
            this.rail.setAttribute("aria-valuemax", "100");
            this.rail.setAttribute("aria-valuenow", "0");
            this.rail.setAttribute("aria-label", "Page position");

            const main = document.querySelector("main");
            if (main) {
                if (!main.id) main.id = "main";
                this.rail.setAttribute("aria-controls", main.id);
            }

            const backdrop = document.createElement("div");
            backdrop.className = "scroll-ruler__backdrop";
            backdrop.setAttribute("aria-hidden", "true");

            this.scale = document.createElement("div");
            this.scale.className = "scroll-ruler__scale";
            this.scale.setAttribute("aria-hidden", "true");

            this.hoverBand = document.createElement("div");
            this.hoverBand.className = "scroll-ruler__hover-band";
            this.hoverBand.setAttribute("aria-hidden", "true");

            this.cursor = document.createElement("div");
            this.cursor.className = "scroll-ruler__cursor";
            this.cursor.setAttribute("aria-hidden", "true");
            this.cursor.innerHTML = `
                <span class="scroll-ruler__cursor-line"></span>
                <span class="scroll-ruler__percent">000%</span>
            `;
            this.percent = this.cursor.querySelector(".scroll-ruler__percent");

            this.titleLayer = document.createElement("nav");
            this.titleLayer.className = "scroll-ruler__titles";
            this.titleLayer.setAttribute("aria-label", "Page sections");

            this.sections.forEach((section, index) => {
                if (!section.id) section.id = `scroll-section-${index + 1}`;

                const title = section.dataset.scrollRulerTitle.trim();
                const link = document.createElement("a");
                link.className = "scroll-ruler__section-link";
                link.href = `#${section.id}`;
                link.setAttribute("aria-label", `Jump to ${title}`);

                const characters = [...title].map((character) => {
                    const span = document.createElement("span");
                    span.className = "scroll-ruler__char";
                    span.setAttribute("aria-hidden", "true");
                    span.textContent = character === " " ? "\u00a0" : character;
                    this.titleLayer.append(span);
                    return span;
                });

                const item = {
                    section,
                    link,
                    characters,
                    widths: [],
                    totalWidth: 0,
                    overviewProgress: 0,
                    entryScroll: 0,
                    verticalStart: 0,
                    verticalEnd: 0,
                    activationStart: 0,
                    activationEnd: 0,
                    approachMotion: 0,
                    approachReady: false,
                    motionProgress: 0,
                    motionReady: false,
                    hovered: false
                };

                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    window.scrollTo({
                        top: Math.max(0, this.sectionTops[index] - this.headerHeight),
                        behavior: this.prefersReducedMotion ? "auto" : "smooth"
                    });
                });

                link.addEventListener("pointerenter", () => {
                    item.hovered = true;
                    this.needsRender = true;
                    this.requestFrame();
                });

                link.addEventListener("pointerleave", () => {
                    item.hovered = false;
                    this.needsRender = true;
                    this.requestFrame();
                });

                link.addEventListener("focus", () => {
                    item.hovered = true;
                    this.needsRender = true;
                    this.requestFrame();
                });

                link.addEventListener("blur", () => {
                    item.hovered = false;
                    this.needsRender = true;
                    this.requestFrame();
                });

                this.titleLayer.append(link);
                this.items.push(item);
            });

            this.rail.append(backdrop, this.scale, this.hoverBand, this.cursor);
            this.root.append(this.veil, this.rail, this.titleLayer);
            document.body.append(this.root);
        }

        detectHeaderHeight() {
            const rootStyle = getComputedStyle(document.documentElement);
            const cssHeight = Number.parseFloat(
                rootStyle.getPropertyValue("--header-height")
            );
            const header = document.querySelector(
                "site-header, #site-header, [data-site-header], body > header"
            );
            const measuredHeight = header
                ? Math.max(0, header.getBoundingClientRect().bottom)
                : 0;
            return Math.max(Number.isFinite(cssHeight) ? cssHeight : 0, measuredHeight);
        }

        createTicks() {
            const fragment = document.createDocumentFragment();
            this.ticks = [];

            for (let percent = 0; percent <= 100; percent += 1) {
                const tick = document.createElement("div");
                const isMajor = percent % 5 === 0;
                tick.className = `scroll-ruler__tick${isMajor ? " scroll-ruler__tick--major" : ""}`;
                tick.dataset.percent = String(percent);

                const line = document.createElement("span");
                line.className = "scroll-ruler__tick-line";
                tick.append(line);

                if (isMajor) {
                    const number = document.createElement("span");
                    number.className = "scroll-ruler__tick-number";
                    number.textContent = String(percent);
                    tick.append(number);
                }

                this.ticks.push(tick);
                fragment.append(tick);
            }

            this.scale.replaceChildren(fragment);
        }

        measureTitles() {
            this.items.forEach((item) => {
                item.widths = item.characters.map((character) => {
                    character.style.visibility = "hidden";
                    character.style.transform = "none";
                    const width = Math.max(character.getBoundingClientRect().width, 7);
                    character.style.visibility = "";
                    return width;
                });
                item.totalWidth = item.widths.reduce((sum, width) => sum + width, 0);
            });
        }

        recalculate() {
            const css = getComputedStyle(document.documentElement);
            this.railWidth = Number.parseFloat(
                css.getPropertyValue("--scroll-ruler-width")
            ) || 60;
            this.titleSize = Number.parseFloat(
                css.getPropertyValue("--scroll-ruler-title-size")
            ) || 34;
            this.headerHeight = this.detectHeaderHeight();
            this.railHeight = Math.max(window.innerHeight - this.headerHeight, 1);
            this.overviewInset = 12;

            this.rail.style.top = `${this.headerHeight}px`;

            const sectionRects = this.sections.map((section) => {
                const rect = section.getBoundingClientRect();
                return {
                    top: rect.top + window.scrollY,
                    height: rect.height,
                    bottom: rect.bottom + window.scrollY
                };
            });

            this.sectionTops = sectionRects.map((rect) => rect.top);
            this.sectionHeights = sectionRects.map((rect) => rect.height);
            this.contentStart = sectionRects[0].top;
            this.contentEnd = sectionRects[sectionRects.length - 1].bottom;
            this.contentLength = Math.max(this.contentEnd - this.contentStart, 1);
            this.scrollStart = Math.max(0, this.contentStart - this.headerHeight);
            this.scrollEnd = Math.max(this.scrollStart, this.contentEnd - window.innerHeight);
            this.scrollRange = Math.max(this.scrollEnd - this.scrollStart, 1);

            const transitionDistance = Math.min(220, this.railHeight * 0.28);

            this.items.forEach((item, index) => {
                const visibleThreshold = this.sectionHeights[index] * 0.6;
                const bottomTitleY =
                    window.innerHeight -
                    36 -
                    (this.items.length - 1 - index) * 20;
                const verticalTransitionDistance = Math.min(
                    VERTICAL_TRANSITION_MAX,
                    this.railHeight * 0.2
                );

                item.overviewProgress = clamp(
                    (this.sectionTops[index] - this.contentStart) / this.contentLength,
                    0,
                    1
                );

                item.entryScroll = this.sectionTops[index] - window.innerHeight;

                // The title stays in its bottom row until the section reaches it.
                item.verticalStart =
                    this.sectionTops[index] -
                    bottomTitleY +
                    VERTICAL_TRIGGER_OFFSET;

                item.verticalEnd =
                    item.verticalStart + verticalTransitionDistance;

                // Never begin the top-title transition before vertical settling ends.
                item.activationStart = Math.max(
                    item.entryScroll + visibleThreshold,
                    item.verticalEnd
                );
                item.activationEnd = item.activationStart + transitionDistance;

                if (!item.approachReady) {
                    item.approachMotion = clamp(
                        (window.scrollY - item.verticalStart) /
                        Math.max(item.verticalEnd - item.verticalStart, 1),
                        0,
                        1
                    );
                    item.approachReady = true;
                }

                if (!item.motionReady) {
                    item.motionProgress = clamp(
                        (window.scrollY - item.activationStart) /
                        Math.max(item.activationEnd - item.activationStart, 1),
                        0,
                        1
                    );
                    item.motionReady = true;
                }
            });

            this.measureTitles();
            this.createTicks();
            this.needsRender = true;
            this.requestFrame();
        }

        stagger(progress, charIndex, charCount) {
            if (progress <= 0 || progress >= 1 || charCount <= 1) return progress;
            const reversePosition = 1 - charIndex / (charCount - 1);
            const spread = 0.52;
            return clamp(progress * (1 + spread) - reversePosition * spread, 0, 1);
        }

        horizontalTarget(item, naturalCenter, y, scale, opacity) {
            const rightEdge = window.innerWidth - this.railWidth;
            return {
                x: rightEdge - item.totalWidth * scale + naturalCenter * scale,
                y,
                rotation: 0,
                scale,
                opacity
            };
        }

        verticalTarget(item, naturalCenter, sectionScreenTop) {
            const verticalScale = 20 / this.titleSize;
            const titleCenterY = sectionScreenTop + item.totalWidth * verticalScale / 2;
            return {
                x: window.innerWidth - this.railWidth / 2,
                y: titleCenterY + (item.totalWidth / 2 - naturalCenter) * verticalScale,
                rotation: -90,
                scale: verticalScale,
                opacity: 0.38
            };
        }

        renderTicks(scrollOffset) {
            const overviewLength = this.railHeight - this.overviewInset * 2;

            this.ticks.forEach((tick, index) => {
                const percent = index / 100;
                const normalY = percent * this.contentLength - scrollOffset;
                const overviewY = this.overviewInset + percent * overviewLength;
                const y = lerp(normalY, overviewY, ease(this.hoverProgress));
                tick.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
            });
        }

        renderTitles(scrollPosition) {
            const smallScale = 16 / this.titleSize;
            const itemCount = this.items.length;
            const railCenter = window.innerWidth - this.railWidth / 2;
            const overviewLength = this.railHeight - this.overviewInset * 2;

            this.titleMotionActive = false;

            this.items.forEach((item) => {
                const rawApproachProgress = clamp(
                    (scrollPosition - item.verticalStart) /
                    Math.max(item.verticalEnd - item.verticalStart, 1),
                    0,
                    1
                );
                const rawProgress = clamp(
                    (scrollPosition - item.activationStart) /
                    Math.max(item.activationEnd - item.activationStart, 1),
                    0,
                    1
                );
                const approachTarget = this.isScrolling
                    ? rawApproachProgress
                    : this.scrollDirection > 0
                        ? (rawApproachProgress > 0.001 ? 1 : 0)
                        : (rawApproachProgress < 0.999 ? 0 : 1);
                const targetProgress = this.isScrolling
                    ? rawProgress
                    : rawProgress >= 0.999
                        ? 1
                        : 0;
                const motionSpeed = this.prefersReducedMotion
                    ? 1
                    : this.isScrolling
                        ? 0.28
                        : TITLE_RETURN_SPEED;

                item.approachMotion = lerp(
                    item.approachMotion,
                    approachTarget,
                    motionSpeed
                );
                item.motionProgress = lerp(
                    item.motionProgress,
                    targetProgress,
                    motionSpeed
                );

                if (Math.abs(item.approachMotion - approachTarget) < 0.001) {
                    item.approachMotion = approachTarget;
                } else {
                    this.titleMotionActive = true;
                }

                if (Math.abs(item.motionProgress - targetProgress) < 0.001) {
                    item.motionProgress = targetProgress;
                } else {
                    this.titleMotionActive = true;
                }
            });

            let activeIndex = 0;
            for (let index = 1; index < itemCount; index += 1) {
                if (this.items[index].motionProgress >= 0.999) {
                    activeIndex = index;
                }
            }

            const nextIndex = activeIndex + 1;
            const nextItem = this.items[nextIndex];
            const nextTopProgress = nextItem
                ? nextItem.motionProgress
                : 0;

            this.items.forEach((item, itemIndex) => {
                const sectionScreenTop = this.sectionTops[itemIndex] - scrollPosition;
                const bottomY = window.innerHeight - 36 - (itemCount - 1 - itemIndex) * 20;
                const pastY = this.headerHeight + 28 + itemIndex * 20;
                const activeY = this.headerHeight + 54 + itemIndex * 20;
                const overviewY = this.headerHeight + this.overviewInset +
                    item.overviewProgress * overviewLength;
                const approachProgress = item.approachMotion;
                const topProgress = item.motionProgress;

                const bounds = {
                    left: Number.POSITIVE_INFINITY,
                    top: Number.POSITIVE_INFINITY,
                    right: Number.NEGATIVE_INFINITY,
                    bottom: Number.NEGATIVE_INFINITY
                };

                let naturalCursor = 0;

                item.characters.forEach((character, charIndex) => {
                    const width = item.widths[charIndex];
                    const naturalCenter = naturalCursor + width / 2;
                    naturalCursor += width;

                    const bottomTarget = this.horizontalTarget(
                        item,
                        naturalCenter,
                        bottomY,
                        smallScale,
                        0.36
                    );
                    const pastTarget = this.horizontalTarget(
                        item,
                        naturalCenter,
                        pastY,
                        smallScale,
                        0.36
                    );
                    const activeTarget = this.horizontalTarget(
                        item,
                        naturalCenter,
                        activeY,
                        1,
                        1
                    );
                    const verticalTarget = this.verticalTarget(
                        item,
                        naturalCenter,
                        sectionScreenTop
                    );
                    const overviewTarget = this.horizontalTarget(
                        item,
                        naturalCenter,
                        overviewY,
                        item.hovered ? smallScale * 1.08 : smallScale,
                        item.hovered || itemIndex === activeIndex ? 1 : 0.83
                    );

                    let normalTarget;

                    if (itemIndex < activeIndex) {
                        normalTarget = pastTarget;
                    } else if (itemIndex === activeIndex) {
                        normalTarget = nextTopProgress > 0
                            ? mixTarget(activeTarget, pastTarget, nextTopProgress, railCenter)
                            : activeTarget;
                    } else if (itemIndex === nextIndex) {
                        if (topProgress > 0) {
                            normalTarget = mixTarget(
                                verticalTarget,
                                activeTarget,
                                this.stagger(topProgress, charIndex, item.characters.length),
                                railCenter,
                                true
                            );
                        } else {
                            normalTarget = mixTarget(
                                bottomTarget,
                                verticalTarget,
                                this.stagger(approachProgress, charIndex, item.characters.length),
                                railCenter,
                                true
                            );
                        }
                    } else {
                        normalTarget = bottomTarget;
                    }

                    const finalTarget = mixTarget(
                        normalTarget,
                        overviewTarget,
                        this.hoverProgress,
                        railCenter
                    );

                    if (item.hovered) {
                        finalTarget.opacity = 1;
                    }

                    character.style.opacity = finalTarget.opacity.toFixed(3);
                    character.style.transform = `translate3d(${finalTarget.x.toFixed(2)}px, ${finalTarget.y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${finalTarget.rotation.toFixed(2)}deg) scale(${finalTarget.scale.toFixed(4)})`;

                    if (finalTarget.opacity > 0.04) {
                        const radians = finalTarget.rotation * Math.PI / 180;
                        const cosine = Math.abs(Math.cos(radians));
                        const sine = Math.abs(Math.sin(radians));
                        const scaledWidth = width * finalTarget.scale;
                        const scaledHeight = this.titleSize * finalTarget.scale;
                        const halfWidth = (scaledWidth * cosine + scaledHeight * sine) / 2;
                        const halfHeight = (scaledWidth * sine + scaledHeight * cosine) / 2;
                        bounds.left = Math.min(bounds.left, finalTarget.x - halfWidth);
                        bounds.right = Math.max(bounds.right, finalTarget.x + halfWidth);
                        bounds.top = Math.min(bounds.top, finalTarget.y - halfHeight);
                        bounds.bottom = Math.max(bounds.bottom, finalTarget.y + halfHeight);
                    }
                });

                if (itemIndex === activeIndex) {
                    item.link.setAttribute("aria-current", "location");
                } else {
                    item.link.removeAttribute("aria-current");
                }

                if (Number.isFinite(bounds.left)) {
                    const hitPadding = 7;
                    item.link.style.display = "block";
                    item.link.style.left = `${bounds.left - hitPadding}px`;
                    item.link.style.top = `${bounds.top - hitPadding}px`;
                    item.link.style.width = `${Math.max(bounds.right - bounds.left + hitPadding * 2, 1)}px`;
                    item.link.style.height = `${Math.max(bounds.bottom - bounds.top + hitPadding * 2, 1)}px`;
                } else {
                    item.link.style.display = "none";
                }
            });
        }

        render() {
            this.frameId = 0;

            const scrollPosition = window.scrollY;
            const scrollOffset = clamp(
                scrollPosition - this.scrollStart,
                0,
                this.scrollRange
            );
            const progress = clamp(scrollOffset / this.scrollRange, 0, 1);
            const overviewLength = this.railHeight - this.overviewInset * 2;
            const cursorLocalY = this.overviewInset + progress * overviewLength;
            const cursorScreenY = this.headerHeight + cursorLocalY;
            const percentage = Math.round(progress * 100);

            const hoverSpeed = this.prefersReducedMotion ? 1 : 0.16;
            this.hoverProgress = lerp(
                this.hoverProgress,
                this.hoverTarget,
                hoverSpeed
            );
            if (Math.abs(this.hoverProgress - this.hoverTarget) < 0.001) {
                this.hoverProgress = this.hoverTarget;
            }

            this.renderTicks(scrollOffset);
            this.renderTitles(scrollPosition);

            this.cursor.style.transform = `translate3d(0, ${cursorLocalY.toFixed(2)}px, 0)`;
            this.percent.textContent = `${String(percentage).padStart(3, "0")}%`;
            this.rail.setAttribute("aria-valuenow", String(percentage));
            this.hoverBand.style.transform = `translate3d(0, ${this.hoverY.toFixed(2)}px, 0)`;

            const isAfterContent = scrollPosition > this.contentEnd - this.headerHeight;
            this.root.classList.toggle("is-after-content", isAfterContent);

            const hoverIsMoving = Math.abs(this.hoverProgress - this.hoverTarget) > 0.001;
            const shouldContinue = hoverIsMoving || this.titleMotionActive || this.needsRender;
            this.needsRender = false;
            if (shouldContinue) this.requestFrame();
        }

        scrollFromRail(clientY, smooth = false) {
            const localY = clamp(
                clientY - this.headerHeight - this.overviewInset,
                0,
                this.railHeight - this.overviewInset * 2
            );
            const progress = localY /
                Math.max(this.railHeight - this.overviewInset * 2, 1);
            const destination = this.scrollStart + progress * this.scrollRange;
            window.scrollTo({
                top: destination,
                behavior: smooth && !this.prefersReducedMotion ? "smooth" : "auto"
            });
        }

        requestFrame() {
            if (this.frameId) return;
            this.frameId = requestAnimationFrame(() => this.render());
        }

        cancelScreenReturn() {
            if (!this.isAutoReturning) return;
            cancelAnimationFrame(this.screenReturnFrame);
            this.screenReturnFrame = 0;
            this.isAutoReturning = false;
            this.isScrolling = false;
            this.lastScrollY = window.scrollY;
            this.restorePageScrollBehavior();
        }

        disablePageSmoothScroll() {
            if (this.previousScrollBehavior !== null) return;
            this.previousScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
        }

        restorePageScrollBehavior() {
            if (this.previousScrollBehavior === null) return;
            document.documentElement.style.scrollBehavior = this.previousScrollBehavior;
            this.previousScrollBehavior = null;
        }

        returnScreenTo(targetScroll) {
            const startScroll = window.scrollY;
            const distance = targetScroll - startScroll;

            if (Math.abs(distance) < 1) return;

            if (this.prefersReducedMotion) {
                window.scrollTo(0, targetScroll);
                return;
            }

            cancelAnimationFrame(this.screenReturnFrame);
            this.isAutoReturning = true;
            this.isScrolling = true;
            this.disablePageSmoothScroll();

            const startTime = performance.now();
            const step = (currentTime) => {
                if (!this.isAutoReturning) return;

                const progress = clamp(
                    (currentTime - startTime) / SCREEN_RETURN_DURATION,
                    0,
                    1
                );
                window.scrollTo({
                    top: startScroll + distance * ease(progress),
                    left: 0,
                    behavior: "auto"
                });

                if (progress < 1) {
                    this.screenReturnFrame = requestAnimationFrame(step);
                    return;
                }

                window.scrollTo({ top: targetScroll, left: 0, behavior: "auto" });
                this.screenReturnFrame = requestAnimationFrame(() => {
                    this.screenReturnFrame = 0;
                    this.isAutoReturning = false;
                    this.isScrolling = false;
                    this.lastScrollY = window.scrollY;
                    this.restorePageScrollBehavior();
                    this.needsRender = true;
                    this.requestFrame();
                });
            };

            this.screenReturnFrame = requestAnimationFrame(step);
        }

        applyHoverState(active) {
            this.hoverTarget = active ? 1 : 0;
            this.root.classList.toggle("is-hovered", active);
            this.rail.classList.toggle("is-hovered", active);
            this.needsRender = true;
            this.requestFrame();
        }

        setHoverSource(source, active) {
            window.clearTimeout(this.hoverLeaveTimer);

            if (active) {
                this.hoverSources.add(source);
                this.applyHoverState(true);
                return;
            }

            this.hoverSources.delete(source);
            this.hoverLeaveTimer = window.setTimeout(() => {
                if (!this.hoverSources.size && !this.dragging) {
                    this.applyHoverState(false);
                }
            }, 70);
        }

        bindEvents() {
            window.addEventListener("scroll", () => {
                const currentScrollY = window.scrollY;
                if (!this.isAutoReturning && currentScrollY !== this.lastScrollY) {
                    this.scrollDirection = currentScrollY > this.lastScrollY ? 1 : -1;
                }
                this.lastScrollY = currentScrollY;

                if (this.isAutoReturning) {
                    this.needsRender = true;
                    this.requestFrame();
                    return;
                }

                this.isScrolling = true;
                window.clearTimeout(this.scrollStopTimer);
                this.scrollStopTimer = window.setTimeout(() => {
                    this.isScrolling = false;

                    const partialItem = this.items.find((item) => (
                        window.scrollY > item.activationStart &&
                        window.scrollY < item.activationEnd
                    ));

                    if (partialItem && this.scrollDirection > 0 && !this.dragging) {
                        this.returnScreenTo(partialItem.activationStart);
                    }

                    this.needsRender = true;
                    this.requestFrame();
                }, SCROLL_STOP_DELAY);
                this.needsRender = true;
                this.requestFrame();
            }, { passive: true });

            window.addEventListener("wheel", () => this.cancelScreenReturn(), {
                passive: true
            });

            let resizeTimer;
            window.addEventListener("resize", () => {
                window.clearTimeout(resizeTimer);
                resizeTimer = window.setTimeout(() => this.recalculate(), 140);
            });

            window.addEventListener("load", () => this.recalculate(), { once: true });
            document.fonts?.ready.then(() => this.recalculate());

            this.rail.addEventListener("pointerenter", () => {
                this.setHoverSource("rail", true);
            });

            this.rail.addEventListener("pointerleave", () => {
                if (this.dragging) return;
                this.setHoverSource("rail", false);
            });

            this.rail.addEventListener("pointermove", (event) => {
                this.hoverY = event.clientY - this.headerHeight;
                if (this.dragging) this.scrollFromRail(event.clientY);
                this.needsRender = true;
                this.requestFrame();
            });

            this.rail.addEventListener("pointerdown", (event) => {
                event.preventDefault();
                this.cancelScreenReturn();
                this.disablePageSmoothScroll();
                this.dragging = true;
                this.rail.setPointerCapture(event.pointerId);
                this.scrollFromRail(event.clientY);
            });

            this.rail.addEventListener("pointerup", (event) => {
                this.dragging = false;
                this.restorePageScrollBehavior();
                if (this.rail.hasPointerCapture(event.pointerId)) {
                    this.rail.releasePointerCapture(event.pointerId);
                }
            });

            this.rail.addEventListener("pointercancel", (event) => {
                this.dragging = false;
                this.restorePageScrollBehavior();
                if (this.rail.hasPointerCapture(event.pointerId)) {
                    this.rail.releasePointerCapture(event.pointerId);
                }
            });

            if ("ResizeObserver" in window) {
                let observedHeight = 0;
                const observer = new ResizeObserver(() => {
                    const nextHeight = document.documentElement.scrollHeight;
                    if (Math.abs(nextHeight - observedHeight) < 2) return;
                    observedHeight = nextHeight;
                    this.recalculate();
                });
                observer.observe(document.documentElement);
            }
        }
    }

    const initialize = () => new ScrollRuler();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
