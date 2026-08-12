/* =============================================================
   Oluwasegun Daniel — Portfolio interactions
   Vanilla JS, progressive enhancement, a11y-friendly
   ============================================================= */
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHeaderScroll();
        initScrollReveal();
        initScrollSpy();
        initScrollToTop();
        initCurrentYear();
        initCopyEmail();
        initContactForm();
        initSuccessModal();
    });

    /* ---------- Mobile menu ---------- */
    function initMobileMenu() {
        var btn = document.getElementById("mobileMenuBtn");
        var nav = document.getElementById("mainNav");
        if (!btn || !nav) return;

        function setOpen(open) {
            nav.classList.toggle("active", open);
            btn.setAttribute("aria-expanded", String(open));
            btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            var icon = btn.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars", !open);
                icon.classList.toggle("fa-times", open);
            }
        }

        btn.addEventListener("click", function () {
            setOpen(!nav.classList.contains("active"));
        });

        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () { setOpen(false); });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("active")) {
                setOpen(false);
                btn.focus();
            }
        });

        // Close when clicking outside the header
        document.addEventListener("click", function (e) {
            if (!nav.classList.contains("active")) return;
            if (!nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
        });
    }

    /* ---------- Header shadow on scroll ---------- */
    function initHeaderScroll() {
        var header = document.getElementById("siteHeader");
        if (!header) return;
        var onScroll = function () {
            header.classList.toggle("scrolled", window.scrollY > 12);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---------- Scroll reveal ---------- */
    function initScrollReveal() {
        var items = document.querySelectorAll("[data-reveal]");
        if (!items.length) return;

        // No IntersectionObserver or reduced motion → show everything now
        if (!("IntersectionObserver" in window) || prefersReduced) {
            items.forEach(function (el) { el.classList.add("in-view"); });
            return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

        items.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- Scroll spy (active nav link) ---------- */
    function initScrollSpy() {
        var links = Array.prototype.slice.call(
            document.querySelectorAll('.main-nav a[href^="#"]')
        );
        if (!links.length || !("IntersectionObserver" in window)) return;

        var map = {};
        links.forEach(function (link) {
            var id = link.getAttribute("href").slice(1);
            var section = document.getElementById(id);
            if (section) map[id] = link;
        });

        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    links.forEach(function (l) { l.classList.remove("active"); });
                    var active = map[entry.target.id];
                    if (active) active.classList.add("active");
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

        Object.keys(map).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) spy.observe(section);
        });
    }

    /* ---------- Scroll to top ---------- */
    function initScrollToTop() {
        var btn = document.getElementById("scrollToTop");
        if (!btn) return;
        var onScroll = function () {
            btn.classList.toggle("visible", window.scrollY > 400);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        btn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
        });
    }

    /* ---------- Current year ---------- */
    function initCurrentYear() {
        var el = document.getElementById("currentYear");
        if (el) el.textContent = String(new Date().getFullYear());
    }

    /* ---------- Copy email ---------- */
    function initCopyEmail() {
        var btn = document.getElementById("copyEmail");
        var textEl = document.getElementById("emailText");
        var hint = document.getElementById("copyHint");
        if (!btn || !textEl) return;

        btn.addEventListener("click", function () {
            var email = textEl.textContent.trim();
            var done = function () {
                if (hint) hint.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(function () {
                    if (hint) hint.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(done).catch(fallback);
            } else {
                fallback();
            }
            function fallback() {
                var ta = document.createElement("textarea");
                ta.value = email;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand("copy"); done(); } catch (e) { /* noop */ }
                document.body.removeChild(ta);
            }
        });
    }

    /* ---------- Contact form ---------- */
    function initContactForm() {
        var form = document.getElementById("contactForm");
        if (!form) return;

        var submitBtn = document.getElementById("submitBtn");
        var status = document.getElementById("formStatus");
        var honey = form.querySelector('input[name="website"]');
        var ENDPOINT = "/api/contact";
        var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var submitting = false;

        var fields = ["name", "email", "subject", "message"];

        function setError(id, hasError) {
            var input = document.getElementById(id);
            if (!input) return;
            input.classList.toggle("error", hasError);
            input.setAttribute("aria-invalid", String(hasError));
        }

        function validate() {
            var ok = true;
            var firstBad = null;
            var vals = {};
            fields.forEach(function (id) {
                vals[id] = (document.getElementById(id).value || "").trim();
            });

            var checks = {
                name: !!vals.name,
                email: EMAIL_RE.test(vals.email),
                subject: !!vals.subject,
                message: vals.message.length >= 10
            };

            fields.forEach(function (id) {
                var bad = !checks[id];
                setError(id, bad);
                if (bad && !firstBad) firstBad = document.getElementById(id);
                if (bad) ok = false;
            });

            if (firstBad) firstBad.focus();
            return ok ? vals : null;
        }

        // Clear error as the user corrects a field
        fields.forEach(function (id) {
            var input = document.getElementById(id);
            if (!input) return;
            var evt = input.tagName === "SELECT" ? "change" : "input";
            input.addEventListener(evt, function () { setError(id, false); });
        });

        function setStatus(msg, isError) {
            if (!status) return;
            status.textContent = msg || "";
            status.classList.toggle("error-text", !!isError);
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            // Prevent accidental duplicate submissions
            if (submitting) return;

            // Bot trap: silently ignore
            if (honey && honey.value) return;

            var vals = validate();
            if (!vals) {
                setStatus("Please fix the highlighted fields.", true);
                return;
            }

            submitting = true;
            setStatus("");
            var original = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin-c" aria-hidden="true"></i> Sending...';

            fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    name: vals.name,
                    email: vals.email,
                    subject: vals.subject,
                    message: vals.message,
                    website: honey ? honey.value : ""
                })
            })
                .then(function (res) {
                    return res.json().then(
                        function (d) { return { ok: res.ok, status: res.status, data: d }; },
                        function () { return { ok: res.ok, status: res.status, data: {} }; }
                    );
                })
                .then(function (r) {
                    var d = r.data || {};
                    if (r.ok && d.success === true) {
                        form.reset();
                        openSuccess();
                        return;
                    }
                    if (d.error) {
                        // Server responded with a specific reason (validation, config, Resend, etc.)
                        setStatus(d.error, true);
                    } else if (r.status === 404) {
                        // The /api function isn't running here at all
                        setStatus("Contact service not found (404). If you're testing locally, run “vercel dev” — opening the file directly or via Live Server can't execute /api. On the live site, redeploy so the latest version is published.", true);
                    } else {
                        setStatus("Couldn't send right now — please email me directly at danieloluwasegun488@gmail.com", true);
                    }
                })
                .catch(function () {
                    // Network-level failure (opened as file://, offline, or blocked)
                    setStatus("Couldn't reach the contact service. If you opened the page as a local file, serve it with “vercel dev” instead — otherwise email me directly at danieloluwasegun488@gmail.com", true);
                })
                .finally(function () {
                    submitting = false;
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = original;
                });
        });
    }

    /* ---------- Success modal ---------- */
    var lastFocused = null;

    function openSuccess() {
        var overlay = document.getElementById("successOverlay");
        if (!overlay) return;
        lastFocused = document.activeElement;
        overlay.classList.add("show");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        var closeBtn = document.getElementById("successClose");
        if (closeBtn) closeBtn.focus();
    }

    function closeSuccess() {
        var overlay = document.getElementById("successOverlay");
        if (!overlay) return;
        overlay.classList.remove("show");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function initSuccessModal() {
        var overlay = document.getElementById("successOverlay");
        if (!overlay) return;
        var closeBtn = document.getElementById("successClose");

        if (closeBtn) closeBtn.addEventListener("click", closeSuccess);

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeSuccess();
        });

        document.addEventListener("keydown", function (e) {
            if (!overlay.classList.contains("show")) return;
            if (e.key === "Escape") closeSuccess();
            // Simple focus trap: keep focus on the Continue button
            if (e.key === "Tab" && closeBtn) {
                e.preventDefault();
                closeBtn.focus();
            }
        });
    }
})();
