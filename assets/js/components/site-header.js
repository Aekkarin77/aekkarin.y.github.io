const siteRootUrl = new URL("../../../", import.meta.url);
const buildSiteUrl = (path) => new URL(path, siteRootUrl).href;

class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.renderMarkup();
        this.cacheDomElements();
        this.attachEventListeners();
        this.updateHeaderScrollState();
    }

    disconnectedCallback() {
        window.removeEventListener("scroll", this.updateHeaderScrollState);
        window.removeEventListener("keydown", this.handleGlobalKeydown);
    }

    renderMarkup() {
        const homeUrl = buildSiteUrl("index.html");
        const resumeUrl = buildSiteUrl("assets/documents/Resume-Revised.pdf");

        this.innerHTML = `
            <header class="site-header" id="navbar">
                <a class="site-header__brand" href="${homeUrl}" aria-label="AEK.Y — Home">
                    AEK.Y
                </a>

                <nav class="site-header__nav" aria-label="Primary navigation">
                    <a href="${homeUrl}#work">Work</a>
                    <a href="${homeUrl}#about">About</a>
                    <a href="${homeUrl}#contact">Contact</a>
                </nav>

                <a class="site-header__resume" href="${resumeUrl}" target="_blank" download>
                    <svg class="site-header__resume-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Download Resume</span>
                </a>

                <button
                    class="menu-toggle"
                    type="button"
                    aria-label="Open navigation"
                    aria-controls="mobile-menu"
                    aria-expanded="false"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>

            <nav
                class="mobile-menu"
                id="mobile-menu"
                aria-label="Mobile navigation"
                aria-hidden="true"
            >
                <a href="${homeUrl}#work">Work</a>
                <a href="${homeUrl}#about">About</a>
                <a href="${homeUrl}#contact">Contact</a>
                <a href="${resumeUrl}" download>Download Resume</a>

                <p class="mobile-menu__status meta-label">
                    <span class="mobile-menu__status-dot" aria-hidden="true"></span>
                    Open to Opportunities
                </p>
            </nav>
        `;
    }

    cacheDomElements() {
        this.headerElement = this.querySelector(".site-header");
        this.mobileMenuElement = this.querySelector(".mobile-menu");
        this.menuToggleElement = this.querySelector(".menu-toggle");
    }

    attachEventListeners() {
        this.menuToggleElement?.addEventListener("click", () => {
            const isOpen = this.mobileMenuElement?.classList.contains("is-open") ?? false;
            this.setMobileMenuOpen(!isOpen);
        });

        this.mobileMenuElement?.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => this.setMobileMenuOpen(false));
        });

        window.addEventListener("scroll", this.updateHeaderScrollState, { passive: true });
        window.addEventListener("keydown", this.handleGlobalKeydown);
    }

    updateHeaderScrollState = () => {
        this.headerElement?.classList.toggle("is-scrolled", window.scrollY > 50);
    };

    handleGlobalKeydown = (event) => {
        if (event.key === "Escape") {
            this.setMobileMenuOpen(false);
        }
    };

    setMobileMenuOpen(isOpen) {
        if (!this.headerElement || !this.mobileMenuElement || !this.menuToggleElement) return;

        this.mobileMenuElement.classList.toggle("is-open", isOpen);
        this.headerElement.classList.toggle("is-menu-open", isOpen);
        document.body.classList.toggle("menu-open", isOpen);

        this.mobileMenuElement.setAttribute("aria-hidden", String(!isOpen));
        this.menuToggleElement.setAttribute("aria-expanded", String(isOpen));
        this.menuToggleElement.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    }
}

if (!customElements.get("site-header")) {
    customElements.define("site-header", SiteHeader);
}
