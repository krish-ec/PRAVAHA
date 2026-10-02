/* Kabadiwala Connect — shared utilities */

function syncBrandLogos() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.querySelectorAll(".brand-logo").forEach((img) => {
    const darkSrc = img.getAttribute("data-dark-src");
    const lightSrc = img.getAttribute("data-light-src");
    const chosen = isDark ? (darkSrc || img.src) : (lightSrc || img.src);
    if (chosen && chosen !== img.getAttribute("src")) {
      img.setAttribute("src", chosen);
    }
    if (chosen) img.dataset.activeTheme = isDark ? "dark" : "light";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  syncBrandLogos();
  if (typeof initI18n === "function") initI18n();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
});

window.syncBrandLogos = syncBrandLogos;

function showToast(message, duration = 2500) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

window.KC = window.KC || {};
window.KC.showToast = showToast;

/* ============================================================
   Motion controller (PRD §7.7 / §8.7) — the "30%" layer.
   Each element animates once. Respects prefers-reduced-motion.
   ============================================================ */

(function () {
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Signal that JS is active so reveal states apply (progressive enhancement).
  document.documentElement.classList.add("js-ready");

  document.addEventListener("DOMContentLoaded", () => {
    setupHeaderScroll();
    setupReveals(reduceMotion);
    setupCounters(reduceMotion);
    setupPipeline(reduceMotion);
    setupScanSweep(reduceMotion);
    setupLangCrossfade();
  });

  /* Header gains a hairline border once the page scrolls */
  function setupHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Fade-and-rise reveals + staggered siblings, once on entry */
  function setupReveals(reduce) {
    const targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
    if (!targets.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.hasAttribute("data-reveal-stagger")) {
            const step = 70; // --motion-stagger
            Array.from(el.children).forEach((child, i) => {
              child.style.transitionDelay = i * step + "ms";
            });
          }
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* One-time count-up (~1.2s, ease-out). Reduced motion = final value */
  function setupCounters(reduce) {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const render = (el, val) => {
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = Number(val).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach((el) => render(el, parseFloat(el.getAttribute("data-count"))));
      return;
    }

    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const duration = 1200;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3); // ease-out cubic
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        render(el, target * ease(p));
        if (p < 1) requestAnimationFrame(tick);
        else render(el, target);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* Pipeline: steps activate left-to-right; current step takes accent */
  function setupPipeline(reduce) {
    const pipeline = document.getElementById("pipeline");
    if (!pipeline) return;
    const steps = Array.from(pipeline.querySelectorAll(".pipeline-step"));

    const activateAll = () => {
      pipeline.classList.add("is-visible");
      steps.forEach((s) => s.classList.add("step-active"));
    };

    if (reduce || !("IntersectionObserver" in window)) {
      activateAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pipeline.classList.add("is-visible");
          steps.forEach((step, i) => {
            setTimeout(() => {
              // earlier steps settle to neutral, only the newest is "current"
              steps.forEach((s) => s.classList.remove("step-current"));
              step.classList.add("step-active", "step-current");
              if (i === steps.length - 1) {
                setTimeout(() => step.classList.remove("step-current"), 400);
              }
            }, i * 120);
          });
          obs.unobserve(pipeline);
        });
      },
      { threshold: 0.25 }
    );
    io.observe(pipeline);
  }

  /* Hero scan-line sweeps once, then rests */
  function setupScanSweep(reduce) {
    if (reduce) return;
    const card = document.querySelector(".hero-card");
    if (card) card.classList.add("swept");
  }

  /* Cross-fade i18n text on language switch (Standard timing) */
  function setupLangCrossfade() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.body.classList.add("lang-fading");
        clearTimeout(window.__langFadeT);
        window.__langFadeT = setTimeout(
          () => document.body.classList.remove("lang-fading"),
          400
        );
      });
    });
  }
})();
