/* =============================================================
   Oluwasegun Daniel — Portfolio interactions
   v3 — immersive 3D motion edition
   Vanilla JS, progressive enhancement, a11y-friendly
   ============================================================= */
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var isMobile = window.matchMedia("(max-width: 768px)").matches;

    document.addEventListener("DOMContentLoaded", function () {
        initPreloaderAndEntrance();
        initMobileMenu();
        initHeaderScroll();
        initScrollReveal();
        initScrollSpy();
        initNavIndicator();
        initScrollProgress();
        initScrollToTop();
        initCurrentYear();
        initCopyEmail();
        initContactForm();
        initSuccessModal();
        initSplitHeadline();
        initFlipScenes();
        initScrollLit();
        initTextScramble();
        initMarquee();
        initCursor();
        initMagnetic();
        initTiltCards();
        initParallax();
        initCountUp();
        initProjectShots();
        initPortrait3D();
        initHeroScene();
    });

    /* ---------- Preloader + entrance sequence ---------- */
    function initPreloaderAndEntrance() {
        var pre = document.getElementById("preloader");
        document.body.classList.add("preloading");

        var finish = function () {
            document.body.classList.remove("preloading");
            if (pre) pre.classList.add("done");
            document.documentElement.classList.add("loaded");
            setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 900);
        };

        if (prefersReduced) {
            finish();
            return;
        }

        var minTime = new Promise(function (res) { setTimeout(res, 1250); });
        var loaded = new Promise(function (res) {
            if (document.readyState === "complete") res();
            else window.addEventListener("load", res, { once: true });
        });
        // Safety net: never trap the visitor behind the preloader
        var timeout = new Promise(function (res) { setTimeout(res, 3500); });

        Promise.race([Promise.all([minTime, loaded]), timeout]).then(finish);
    }

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

    /* ---------- Scroll progress bar ---------- */
    function initScrollProgress() {
        var bar = document.getElementById("scrollProgress");
        if (!bar) return;
        var ticking = false;
        var update = function () {
            ticking = false;
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var p = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = "scaleX(" + p + ")";
        };
        window.addEventListener("scroll", function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
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
                    // keep the gliding pill in sync with the real active section
                    if (typeof window.__syncNavIndicator === "function") window.__syncNavIndicator();
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

        Object.keys(map).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) spy.observe(section);
        });

        // Expose for the nav indicator
        window.__getActiveNavLink = function () {
            var active = document.querySelector(".main-nav a.active");
            return active || null;
        };
    }

    /* ---------- Gliding pill indicator in the nav ---------- */
    function initNavIndicator() {
        var nav = document.getElementById("mainNav");
        if (!nav || !finePointer || prefersReduced) return;

        var ind = document.createElement("span");
        ind.className = "nav-indicator";
        ind.setAttribute("aria-hidden", "true");
        nav.appendChild(ind);

        function moveTo(link) {
            if (!link) { ind.classList.remove("on"); return; }
            var lr = link.getBoundingClientRect();
            var nr = nav.getBoundingClientRect();
            ind.style.setProperty("--x", (lr.left - nr.left) + "px");
            ind.style.setProperty("--w", lr.width + "px");
            ind.classList.add("on");
        }

        // hover preview
        var links = nav.querySelectorAll("a");
        links.forEach(function (link) {
            link.addEventListener("mouseenter", function () { moveTo(link); });
        });
        nav.addEventListener("mouseleave", function () {
            var active = document.querySelector(".main-nav a.active");
            if (active) moveTo(active); else ind.classList.remove("on");
        });

        // keep in sync with scroll spy (called directly when active changes)
        window.__syncNavIndicator = function () {
            moveTo(document.querySelector(".main-nav a.active"));
        };
        window.addEventListener("resize", throttle(window.__syncNavIndicator, 200));
        window.__syncNavIndicator();
    }

    /* ---------- Custom cursor ---------- */
    function initCursor() {
        if (!finePointer || prefersReduced) return;
        var dot = document.getElementById("cursorDot");
        var ring = document.getElementById("cursorRing");
        if (!dot || !ring) return;

        document.documentElement.classList.add("cursor-active");

        var mx = -100, my = -100, rx = -100, ry = -100;
        var visible = false;
        var rafId = null;

        function loop() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            dot.style.transform = "translate(" + mx + "px," + my + "px)";
            ring.style.transform = "translate(" + rx + "px," + ry + "px)" +
                (ring.classList.contains("press") ? " scale(.78)" : "");
            rafId = requestAnimationFrame(loop);
        }

        window.addEventListener("mousemove", function (e) {
            mx = e.clientX; my = e.clientY;
            if (!visible) {
                visible = true;
                dot.style.opacity = "1";
                ring.style.opacity = "1";
                rafId = requestAnimationFrame(loop);
            }
        }, { passive: true });

        document.addEventListener("mouseleave", function () {
            visible = false;
            dot.style.opacity = "0";
            ring.style.opacity = "0";
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        });

        document.addEventListener("mouseenter", function () {
            if (!visible) {
                visible = true;
                dot.style.opacity = "1";
                ring.style.opacity = "1";
                rafId = requestAnimationFrame(loop);
            }
        });

        // grow ring over interactive elements
        var HOVER_SEL = "a, button, [data-tilt], .skill, input, select, textarea, .copy-email";
        document.addEventListener("mouseover", function (e) {
            if (e.target.closest(HOVER_SEL)) ring.classList.add("hover");
        });
        document.addEventListener("mouseout", function (e) {
            if (e.target.closest(HOVER_SEL)) ring.classList.remove("hover");
        });

        window.addEventListener("mousedown", function () { ring.classList.add("press"); });
        window.addEventListener("mouseup", function () { ring.classList.remove("press"); });
    }

    /* ---------- Magnetic buttons ---------- */
    function initMagnetic() {
        if (!finePointer || prefersReduced) return;
        document.querySelectorAll(".magnetic, .nav-cta, .scroll-to-top").forEach(function (el) {
            var strength = parseFloat(el.dataset.magStrength || "0.28");
            var maxShift = 10;

            el.addEventListener("mousemove", function (e) {
                var r = el.getBoundingClientRect();
                var dx = e.clientX - (r.left + r.width / 2);
                var dy = e.clientY - (r.top + r.height / 2);
                var x = Math.max(-maxShift, Math.min(maxShift, dx * strength));
                var y = Math.max(-maxShift, Math.min(maxShift, dy * strength));
                el.style.transform = "translate(" + x + "px," + y + "px)";
            });

            el.addEventListener("mouseleave", function () {
                el.style.transform = "";
            });
        });
    }

    /* ---------- 3D tilt cards (interactive 3D showcase) ---------- */
    function initTiltCards() {
        if (!finePointer || prefersReduced) return;
        document.querySelectorAll("[data-tilt]").forEach(function (card) {
            var maxTilt = parseFloat(card.dataset.tiltMax || "7");
            var frame = null;

            function setGlare(x, y) {
                card.style.setProperty("--gx", (x * 100) + "%");
                card.style.setProperty("--gy", (y * 100) + "%");
            }

            card.addEventListener("mousemove", function (e) {
                if (frame) return;
                frame = requestAnimationFrame(function () {
                    frame = null;
                    var r = card.getBoundingClientRect();
                    var px = (e.clientX - r.left) / r.width;
                    var py = (e.clientY - r.top) / r.height;
                    var rx = (0.5 - py) * maxTilt;
                    var ry = (px - 0.5) * maxTilt;
                    setGlare(px, py);
                    card.style.transform =
                        "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" +
                        ry.toFixed(2) + "deg) translateY(-6px) scale(1.015)";
                });
            });

            card.addEventListener("mouseleave", function () {
                if (frame) { cancelAnimationFrame(frame); frame = null; }
                card.style.transform = "";
            });
        });
    }

    /* ---------- Portrait 3D response (hero centerpiece) ---------- */
    function initPortrait3D() {
        if (!finePointer || prefersReduced) return;
        var wrap = document.querySelector(".profile-image-wrapper");
        if (!wrap) return;
        var frame = null;

        window.addEventListener("mousemove", function (e) {
            if (frame) return;
            frame = requestAnimationFrame(function () {
                frame = null;
                var nx = (e.clientX / window.innerWidth) - 0.5;
                var ny = (e.clientY / window.innerHeight) - 0.5;
                wrap.style.transform =
                    "rotateY(" + (nx * 7).toFixed(2) + "deg) rotateX(" + (-ny * 5).toFixed(2) + "deg)";
            });
        }, { passive: true });

        wrap.addEventListener("mouseleave", function () {
            wrap.style.transform = "";
        });
    }

    /* ---------- Scroll parallax engine ---------- */
    function initParallax() {
        if (prefersReduced) return;
        var els = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
        if (!els.length) return;

        var items = els.map(function (el) {
            return { el: el, speed: parseFloat(el.dataset.parallax || "0.1") };
        });
        var ticking = false;

        function update() {
            ticking = false;
            var vh = window.innerHeight;
            items.forEach(function (it) {
                var r = it.el.getBoundingClientRect();
                var progress = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5-ish
                it.el.style.transform = "translate3d(0," + (progress * it.speed * 100).toFixed(1) + "px,0)";
            });
        }

        window.addEventListener("scroll", function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        window.addEventListener("resize", throttle(update, 120));
        update();
    }

    /* ---------- Stat count-up ---------- */
    function initCountUp() {
        var nums = document.querySelectorAll("[data-count]");
        if (!nums.length) return;

        var run = function (el) {
            var target = parseFloat(el.dataset.count);
            var suffix = el.dataset.suffix || "";
            if (prefersReduced || !window.IntersectionObserver) {
                el.textContent = target + suffix;
                return;
            }
            var start = null;
            var dur = 1400;
            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        };

        if (!("IntersectionObserver" in window)) {
            nums.forEach(run);
            return;
        }
        var obs = new IntersectionObserver(function (entries, o) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    run(entry.target);
                    o.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        nums.forEach(function (el) { obs.observe(el); });
    }

    /* ---------- Split headline (word-by-word reveal) ---------- */
    function initSplitHeadline() {
        document.querySelectorAll(".split").forEach(function (el) {
            var i = 0;
            function walk(node) {
                Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                    if (child.nodeType === 3) {
                        var frag = document.createDocumentFragment();
                        child.textContent.split(/(\s+)/).forEach(function (part) {
                            if (!part) return;
                            if (/^\s+$/.test(part)) {
                                frag.appendChild(document.createTextNode(" "));
                            } else {
                                var w = document.createElement("span");
                                w.className = "word";
                                var inner = document.createElement("span");
                                inner.style.setProperty("--wi", String(i++));
                                inner.textContent = part;
                                w.appendChild(inner);
                                frag.appendChild(w);
                            }
                        });
                        node.replaceChild(frag, child);
                    } else if (child.nodeType === 1 && !child.classList.contains("word")) {
                        walk(child);
                    }
                });
            }
            walk(el);
        });
    }

    /* ---------- Live project embeds — scale the 1280px render to fit its card ---------- */
    function initProjectShots() {
        var shots = document.querySelectorAll(".project-shot");
        if (!shots.length) return;

        function fit(shot) {
            var iframe = shot.querySelector("iframe");
            if (!iframe) return;
            var w = shot.clientWidth;
            if (!w) return;
            iframe.style.setProperty("--shot-scale", (w / 1280).toFixed(4));
        }

        function fitAll() { shots.forEach(fit); }
        fitAll();
        window.addEventListener("resize", throttle(fitAll, 150));

        // Cards animate in via data-reveal; width is final once visible
        if ("IntersectionObserver" in window) {
            var obs = new IntersectionObserver(function (entries, o) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        fit(entry.target);
                        o.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            shots.forEach(function (s) { obs.observe(s); });
        }

        // Late layout shifts (webfonts, reveal transitions)
        if ("ResizeObserver" in window) {
            var ro = new ResizeObserver(fitAll);
            shots.forEach(function (s) { ro.observe(s); });
        } else {
            setTimeout(fitAll, 600);
        }
    }

    /* ---------- 3D flip-up section titles ---------- */
    function initFlipScenes() {
        if (prefersReduced) return;
        document.querySelectorAll(".flip-scene").forEach(function (el) {
            if (el.dataset.flipReady) return;
            el.dataset.flipReady = "1";

            var words = el.textContent.trim().split(/\s+/);
            el.textContent = "";
            var frag = document.createDocumentFragment();
            words.forEach(function (w, i) {
                var span = document.createElement("span");
                span.className = "flip-word";
                span.style.setProperty("--wi", String(i));
                span.textContent = w;
                frag.appendChild(span);
                frag.appendChild(document.createTextNode(" "));
            });
            el.appendChild(frag);

            if (!("IntersectionObserver" in window)) {
                el.classList.add("in-view");
                return;
            }
            var obs = new IntersectionObserver(function (entries, o) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        o.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.35 });
            obs.observe(el);
        });
    }

    /* ---------- Scroll-lit headline (chars brighten through the viewport) ---------- */
    function initScrollLit() {
        document.querySelectorAll(".scroll-lit").forEach(function (el) {
            if (el.dataset.litReady) return;
            el.dataset.litReady = "1";
            if (prefersReduced) return;

            var text = el.textContent;
            el.textContent = "";
            var frag = document.createDocumentFragment();
            var chars = [];
            Array.prototype.forEach.call(text, function (ch) {
                if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
                var s = document.createElement("span");
                s.className = "lit-char";
                s.textContent = ch;
                frag.appendChild(s);
                chars.push(s);
            });
            el.appendChild(frag);
            if (!chars.length) return;

            var litCount = -1;
            var ticking = false;

            function update() {
                ticking = false;
                var r = el.getBoundingClientRect();
                var vh = window.innerHeight;
                var p = (vh * 0.9 - r.top) / (vh * 0.55);
                p = Math.max(0, Math.min(1, p));
                var n = Math.round(p * chars.length);
                if (n === litCount) return;
                litCount = n;
                chars.forEach(function (s, i) {
                    s.classList.toggle("lit", i < n);
                });
            }

            window.addEventListener("scroll", function () {
                if (!ticking) { ticking = true; requestAnimationFrame(update); }
            }, { passive: true });
            update();
        });
    }

    /* ---------- Text scramble (logo hover, animejs.com-style) ---------- */
    function initTextScramble() {
        if (!finePointer || prefersReduced) return;
        var CHARS = "!<>-_\\/[]{}=+*^?#";
        document.querySelectorAll("[data-scramble]").forEach(function (el) {
            var original = el.textContent;
            var frame = null;

            function scramble() {
                if (frame) cancelAnimationFrame(frame);
                var length = original.length;
                var resolveAt = [];
                for (var i = 0; i < length; i++) {
                    resolveAt[i] = i * 2 + Math.floor(Math.random() * 12) + 4;
                }
                var stepCount = 0;
                function step() {
                    var out = "";
                    var done = true;
                    for (var i = 0; i < length; i++) {
                        if (stepCount >= resolveAt[i]) {
                            out += original[i] || "";
                        } else {
                            done = false;
                            out += CHARS[Math.floor(Math.random() * CHARS.length)];
                        }
                    }
                    el.textContent = out;
                    stepCount++;
                    if (!done) { frame = requestAnimationFrame(step); }
                    else { frame = null; }
                }
                frame = requestAnimationFrame(step);
            }

            var host = el.closest("a") || el;
            host.addEventListener("mouseenter", scramble);
            host.addEventListener("focus", scramble);
        });
    }

    /* ---------- Kinetic skill ribbon (velocity-reactive marquee) ---------- */
    function initMarquee() {
        var ribbon = document.getElementById("skillRibbon");
        var track = document.getElementById("ribbonTrack");
        if (!ribbon || !track || prefersReduced) return;

        // Duplicate the word set until the track covers 2x the viewport
        var base = Array.prototype.slice.call(track.children);
        if (!base.length) return;
        var setWidth = 0;
        base.forEach(function (s) { setWidth += s.offsetWidth; });
        if (!setWidth) return;
        var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / setWidth));
        var html = track.innerHTML;
        for (var c = 1; c < copies; c++) track.insertAdjacentHTML("beforeend", html);

        var x = 0;
        var visible = true;
        var lastScrollY = window.scrollY;
        var boost = 0;
        var lastT = performance.now();

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
            }, { threshold: 0 }).observe(ribbon);
        }

        function tick(now) {
            requestAnimationFrame(tick);
            var dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;
            if (!visible) { lastScrollY = window.scrollY; return; }

            // Scroll velocity feeds extra speed, decaying back to cruise
            var dy = Math.abs(window.scrollY - lastScrollY);
            lastScrollY = window.scrollY;
            boost += (Math.min(dy * 4, 420) - boost) * 0.08;

            x = (x + (56 + boost) * dt) % setWidth;
            track.style.transform = "translate3d(" + (-x) + "px,0,0)";
        }
        requestAnimationFrame(tick);
    }

    /* ---------- Hero 3D particle field (lazy Three.js) ---------- */
    function initHeroScene() {
        var canvas = document.getElementById("heroCanvas");
        if (!canvas) return;
        // Simplify heavy 3D: skip on mobile, reduced motion, no WebGL
        if (isMobile || prefersReduced) return;
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) return;

        var started = false;
        var loadThree = function () {
            var s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
            s.async = true;
            s.onload = buildScene;
            s.onerror = function () { /* stay graceful: CSS layers carry the hero */ };
            document.head.appendChild(s);
        };

        // rIC when idle, with a timer fallback — some browsers throttle rIC
        var scheduled = false;
        function scheduleLoad() {
            if (scheduled) return;
            scheduled = true;
            loadThree();
        }
        if ("requestIdleCallback" in window) {
            requestIdleCallback(scheduleLoad, { timeout: 2500 });
        }
        setTimeout(scheduleLoad, 1800);

        function buildScene() {
            if (started || typeof THREE === "undefined") return;
            started = true;

            var wrapEl = canvas.parentElement;
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
            camera.position.z = 7;

            var renderer = new THREE.WebGLRenderer({
                canvas: canvas, alpha: true, antialias: true, powerPreference: "low-power"
            });
            renderer.setClearColor(0x000000, 0);

            function resize() {
                var r = wrapEl.getBoundingClientRect();
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
                renderer.setSize(r.width, r.height, false);
                camera.aspect = r.width / r.height;
                camera.updateProjectionMatrix();
            }
            resize();
            window.addEventListener("resize", throttle(resize, 150));

            // Warm bronze palette
            var COLORS = [0xB5651D, 0x8B4513, 0xC77D3E, 0xA0522D];

            // Ambient particle cloud (soft round sprites — no plain squares)
            function makeSprite() {
                var c = document.createElement("canvas");
                c.width = c.height = 64;
                var ctx = c.getContext("2d");
                var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                g.addColorStop(0, "rgba(255,255,255,1)");
                g.addColorStop(0.4, "rgba(255,255,255,.6)");
                g.addColorStop(1, "rgba(255,255,255,0)");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, 64, 64);
                return new THREE.CanvasTexture(c);
            }
            var sprite = makeSprite();

            var COUNT = 320;
            var geo = new THREE.BufferGeometry();
            var pos = new Float32Array(COUNT * 3);
            var col = new Float32Array(COUNT * 3);
            var seed = new Float32Array(COUNT);
            var color = new THREE.Color();
            for (var i = 0; i < COUNT; i++) {
                pos[i * 3] = (Math.random() - 0.5) * 16;
                pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
                color.setHex(COLORS[i % COLORS.length]);
                col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
                seed[i] = Math.random() * Math.PI * 2;
            }
            geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

            var points = new THREE.Points(geo, new THREE.PointsMaterial({
                size: 0.09,
                map: sprite,
                vertexColors: true,
                transparent: true,
                opacity: 0.75,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            }));
            scene.add(points);

            // Floating glass-like wireframe solids
            var solids = [];
            function addSolid(type, size, x, y, z) {
                var material = new THREE.MeshBasicMaterial({
                    color: COLORS[solids.length % COLORS.length],
                    wireframe: true,
                    transparent: true,
                    opacity: 0.16
                });
                var mesh = type === "ico"
                    ? new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), material)
                    : new THREE.Mesh(new THREE.TorusGeometry(size, size * 0.32, 12, 40), material);
                mesh.position.set(x, y, z);
                mesh.userData.seed = Math.random() * Math.PI * 2;
                scene.add(mesh);
                solids.push(mesh);
            }
            addSolid("ico", 0.9, -4.4, 1.5, -1.5);
            addSolid("torus", 0.7, 4.6, -1.2, -1);
            addSolid("ico", 0.55, 3.2, 1.9, -2.5);

            // Interaction state (smoothed)
            var tx = 0, ty = 0, mx = 0, my = 0, scrollN = 0, scrollCur = 0;
            window.addEventListener("mousemove", function (e) {
                tx = (e.clientX / window.innerWidth) - 0.5;
                ty = (e.clientY / window.innerHeight) - 0.5;
            }, { passive: true });

            var onScroll = function () {
                var hero = document.getElementById("hero");
                if (!hero) return;
                var r = hero.getBoundingClientRect();
                scrollN = Math.max(0, Math.min(1.4, -r.top / (r.height || 1)));
            };
            window.addEventListener("scroll", onScroll, { passive: true });
            onScroll();

            // Pause rendering when hero is out of view
            var heroVisible = true;
            if ("IntersectionObserver" in window) {
                new IntersectionObserver(function (entries) {
                    heroVisible = entries[0].isIntersecting;
                }, { threshold: 0.02 }).observe(document.getElementById("hero"));
            }

            var clock = new THREE.Clock();
            function tick() {
                requestAnimationFrame(tick);
                if (!heroVisible) return;

                var t = clock.getElapsedTime();
                mx += (tx - mx) * 0.05;
                my += (ty - my) * 0.05;
                scrollCur += (scrollN - scrollCur) * 0.08;

                // Mouse-responsive depth
                camera.position.x = mx * 0.9;
                camera.position.y = -my * 0.6;
                camera.lookAt(0, 0, 0);

                // Scroll-reactive drift: cloud recedes, solids sink
                points.position.y = scrollCur * 2.2;
                points.rotation.y = t * 0.02 + mx * 0.12;

                var p = geo.attributes.position.array;
                for (var i = 0; i < COUNT; i++) {
                    p[i * 3 + 1] += Math.sin(t * 0.6 + seed[i]) * 0.0012;
                    p[i * 3] += Math.cos(t * 0.4 + seed[i]) * 0.0009;
                }
                geo.attributes.position.needsUpdate = true;

                solids.forEach(function (m, idx) {
                    m.rotation.x = t * (0.12 + idx * 0.05) + m.userData.seed;
                    m.rotation.y = t * (0.16 + idx * 0.04);
                    m.position.y = m.userData.baseY + Math.sin(t * 0.7 + m.userData.seed) * 0.25 - scrollCur * 1.6;
                    m.position.x = m.userData.baseX + mx * (0.5 + idx * 0.2);
                });

                renderer.render(scene, camera);
            }

            solids.forEach(function (m) { m.userData.baseX = m.position.x; m.userData.baseY = m.position.y; });
            tick();

            var wrap = canvas.closest(".hero-canvas-wrap");
            if (wrap) wrap.classList.add("on");
        }
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

    /* ---------- tiny throttle helper ---------- */
    function throttle(fn, wait) {
        var last = 0, queued = null;
        return function () {
            var now = Date.now();
            var remaining = wait - (now - last);
            if (remaining <= 0) {
                last = now;
                fn.apply(this, arguments);
            } else if (!queued) {
                queued = setTimeout(function () {
                    queued = null;
                    last = Date.now();
                    fn.apply(this, arguments);
                }.bind(this), remaining);
            }
        };
    }
})();
