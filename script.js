/* ============================================================
   30 DAY CHALLENGE — SCRIPT
   GSAP entrance + scroll animations, accordion, particles,
   magnetic buttons, sticky CTA, header state.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VIDEO_URL = "https://installyourfiles.com/1901744";

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();

    initHeaderState();
    initAccordions();
    initStickyCTA();
    initPlayButtons();
    initParticles("particles", 46);
    initParticles("particles-final", 30);

    if (typeof gsap !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      if (reduceMotion) {
        revealEverythingInstantly();
        initPreloader({ animated: false });
      } else {
        initScrollReveals();
        initTimelineScrub();
        initAdParallax();
        initMagneticButtons();
        initPreloader({ animated: true });
      }
    } else {
      revealEverythingInstantly();
      initPreloader({ animated: false });
    }
  });

  /* ---------------- HEADER ---------------- */
  function initHeaderState() {
    const header = document.getElementById("site-header");
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- ACCORDIONS (FAQ + legal) ---------------- */
  function initAccordions() {
    const items = document.querySelectorAll(".accordion-item");
    items.forEach((item) => {
      const trigger = item.querySelector(".accordion-trigger");
      const panel = item.querySelector(".accordion-panel");
      panel.style.height = "0px";

      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        // close siblings within the same accordion group
        const group = item.closest(".accordion, .legal-accordion");
        if (group) {
          group.querySelectorAll(".accordion-item.is-open").forEach((openItem) => {
            if (openItem !== item) closeItem(openItem);
          });
        }

        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });

    function openItem(item) {
      const panel = item.querySelector(".accordion-panel");
      const trigger = item.querySelector(".accordion-trigger");
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      if (typeof gsap !== "undefined" && !reduceMotion) {
        gsap.to(panel, { height: panel.scrollHeight, duration: 0.45, ease: "power2.out" });
      } else {
        panel.style.height = panel.scrollHeight + "px";
      }
    }

    function closeItem(item) {
      const panel = item.querySelector(".accordion-panel");
      const trigger = item.querySelector(".accordion-trigger");
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (typeof gsap !== "undefined" && !reduceMotion) {
        gsap.to(panel, { height: 0, duration: 0.35, ease: "power2.inOut" });
      } else {
        panel.style.height = "0px";
      }
    }
  }

  /* ---------------- STICKY CTA (after 35% scroll) ---------------- */
  function initStickyCTA() {
    const bar = document.getElementById("sticky-cta");
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.classList.toggle("is-visible", progress > 0.35);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ---------------- PLAY BUTTONS ---------------- */
  function initPlayButtons() {
    document.querySelectorAll(".play-button, .play-dot").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = VIDEO_URL;
      });
    });
  }

  /* ---------------- PRELOADER ---------------- */
  let pageLoaded = false;
  window.addEventListener("load", () => { pageLoaded = true; });

  function initPreloader(options) {
    const preloader = document.getElementById("preloader");
    if (!preloader) {
      startMainAnimations();
      return;
    }

    const finishAndHide = () => {
      document.body.classList.remove("is-loading");
      preloader.classList.add("is-hidden");
      preloader.setAttribute("aria-hidden", "true");
      window.setTimeout(() => {
        preloader.style.display = "none";
        startMainAnimations();
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      }, 600);
    };

    if (!options.animated) {
      // Reduced motion / no GSAP: skip the counted animation, just wait briefly for load.
      const ring = preloader.querySelector(".preloader-ring-fill");
      const percent = preloader.querySelector(".preloader-percent");
      if (ring) ring.style.strokeDashoffset = "0";
      if (percent) percent.textContent = "100%";
      window.setTimeout(finishAndHide, pageLoaded ? 150 : 500);
      return;
    }

    const ring = preloader.querySelector(".preloader-ring-fill");
    const percent = preloader.querySelector(".preloader-percent");
    const CIRC = 327;
    const counter = { val: 0 };

    const updateRing = () => {
      const v = Math.min(100, Math.round(counter.val));
      percent.textContent = v + "%";
      ring.style.strokeDashoffset = String(CIRC - (CIRC * counter.val) / 100);
    };

    const finishTween = () => {
      gsap.to(counter, {
        val: 100,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: updateRing,
        onComplete: finishAndHide,
      });
    };

    // Animate up to ~92% while real assets (fonts, scripts, icons) finish loading.
    gsap.to(counter, {
      val: 92,
      duration: 1.3,
      ease: "power1.out",
      onUpdate: updateRing,
    });

    const watcher = window.setInterval(() => {
      if (pageLoaded && counter.val >= 90) {
        window.clearInterval(watcher);
        window.clearTimeout(fallback);
        finishTween();
      }
    }, 100);

    // Hard fallback so the preloader never blocks the page indefinitely.
    const fallback = window.setTimeout(() => {
      window.clearInterval(watcher);
      finishTween();
    }, 4500);
  }

  function startMainAnimations() {
    if (typeof gsap === "undefined" || reduceMotion) return;
    initHeroAnimations();
    initProgressRing();
  }


  function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from('[data-anim="badge"]', { y: -16, opacity: 0, duration: 0.6 })
      .from('[data-anim="title"]', { y: 28, opacity: 0, duration: 0.7 }, "-=0.3")
      .from('[data-anim="sub"]', { y: 22, opacity: 0, duration: 0.6 }, "-=0.35")
      .from('[data-anim="actions"] .btn', { y: 18, opacity: 0, duration: 0.5, stagger: 0.12 }, "-=0.3")
      .from('[data-anim="trust"] li', { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.25")
      .from('[data-anim="visual"]', { scale: 0.9, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .from(".float-card", { y: 30, opacity: 0, duration: 0.6, stagger: 0.15 }, "-=0.5");

    // continuous gentle floating loop
    document.querySelectorAll("[data-float]").forEach((el) => {
      const speedMap = { slow: 4.2, medium: 3.4, fast: 2.6 };
      const dur = speedMap[el.dataset.float] || 3.4;
      gsap.to(el, {
        y: "+=14",
        duration: dur,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 0.6,
      });
    });
  }

  /* ---------------- SCROLL REVEALS ---------------- */
  function initScrollReveals() {
    gsap.utils.toArray('[data-anim="head"]').forEach((el) => {
      gsap.from(el, {
        y: 26, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    gsap.utils.toArray(".card-grid").forEach((grid) => {
      gsap.from(grid.children, {
        y: 34, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: grid, start: "top 85%" },
      });
    });

    gsap.utils.toArray('[data-anim="fade-right"]').forEach((el) => {
      gsap.from(el, { x: -30, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" } });
    });
    gsap.utils.toArray('[data-anim="fade-left"]').forEach((el) => {
      gsap.from(el, { x: 30, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%" } });
    });

    gsap.utils.toArray(".feature-blocks .feature-block").forEach((el, i) => {
      gsap.from(el, { y: 20, opacity: 0, duration: 0.5, delay: i * 0.08, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    gsap.utils.toArray(".ad-content").forEach((el) => {
      gsap.from(el, { y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    gsap.utils.toArray(".video-preview-card").forEach((el) => {
      gsap.from(el, { scale: 0.92, opacity: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    gsap.utils.toArray(".accordion-item, .legal-accordion .accordion-item").forEach((el, i) => {
      gsap.from(el, { y: 16, opacity: 0, duration: 0.45, delay: (i % 6) * 0.05, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%" } });
    });

    gsap.from(".download-inner > *", {
      y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".download-section", start: "top 75%" },
    });

    gsap.from(".final-inner > *", {
      y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: ".final-cta", start: "top 75%" },
    });
  }

  /* ---------------- PROGRESS RING (signature element) ---------------- */
  function initProgressRing() {
    const ring = document.querySelector(".ring-fill");
    if (!ring) return;
    gsap.to(ring, {
      strokeDashoffset: 0,
      duration: 1.6,
      delay: 0.5,
      ease: "power2.out",
    });
  }

  /* ---------------- TIMELINE SCRUB ---------------- */
  function initTimelineScrub() {
    const timeline = document.querySelector(".timeline");
    const progress = document.querySelector(".timeline-progress");
    const nodes = document.querySelectorAll(".step-node");
    if (!timeline || !progress) return;

    gsap.to(progress, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: timeline,
        start: "top 70%",
        end: "bottom 60%",
        scrub: true,
      },
    });

    nodes.forEach((node) => {
      gsap.to(node, {
        backgroundColor: "var(--c-primary)",
        color: "#fff",
        duration: 0.3,
        scrollTrigger: { trigger: node, start: "top 75%", toggleActions: "play none none reverse" },
      });
    });
  }

  /* ---------------- AD PARALLAX ---------------- */
  function initAdParallax() {
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      gsap.to(el, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest(".ad-block"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  /* ---------------- MAGNETIC BUTTONS ---------------- */
  function initMagneticButtons() {
    if (window.matchMedia("(hover: none)").matches) return; // skip on touch devices

    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      const strength = 16;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: (relX / rect.width) * strength,
          y: (relY / rect.height) * strength,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
      });
    });
  }

  /* ---------------- FALLBACK: instantly reveal (no GSAP / reduced motion) ---------------- */
  function revealEverythingInstantly() {
    document.querySelectorAll(
      '[data-anim], .float-card, .card-grid > *, .accordion-item, .feature-block'
    ).forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    const ring = document.querySelector(".ring-fill");
    if (ring) ring.style.strokeDashoffset = "0";
    const progress = document.querySelector(".timeline-progress");
    if (progress) progress.style.height = "100%";
  }

  /* ---------------- LIGHTWEIGHT PARTICLES ---------------- */
  function initParticles(canvasId, count) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function makeParticles() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vy: Math.random() * 0.3 + 0.08,
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.4 + 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190,223,86,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    makeParticles();
    draw();
    window.addEventListener("resize", () => {
      resize();
      makeParticles();
    });
  }
})();
