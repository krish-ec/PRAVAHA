/* ============================================================
   Kabadiwala Connect — Landing interactions (effects.js)
   Light/dark theming, cinematic scanner, animated India network.
   Lightweight 2D only (SVG + canvas). Guarded for reduced-motion
   and simplified on mobile.
   ============================================================ */

(function () {
  "use strict";

  const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
  const reduce = mq("(prefers-reduced-motion: reduce)");
  const isMobile = mq("(max-width: 560px)");
  const isTablet = mq("(max-width: 960px)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const t = (k, fb) => (window.KC && KC.t ? KC.t(k) : fb) || fb;

  // Theme must be wired immediately (button may be clicked before load).
  themeToggle();
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    headerScroll();
    scrollProgress();
    splitWords();
    revealOnScroll();
    counters();
    magnetic();
    cursorGlow();
    heroScanner();
    journeyScroll();
    buildNetwork();
    transformScroll();
    phoneDemo();
    activeNav();
    if (!reduce && !isMobile) particles();
  }

  /* ---------- Theme toggle + persistence ---------- */
  function themeToggle() {
    const root = document.documentElement;
    const apply = (theme) => {
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem("kc-theme", theme); } catch (e) {}
    };
    const bind = () => {
      const btn = $("#themeToggle");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bind);
    } else {
      bind();
    }
  }

  /* ---------- Header blur + shrink on scroll ---------- */
  function headerScroll() {
    const header = $("#siteHeader");
    if (!header) return;
    const on = () => header.classList.toggle("scrolled", window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- Top scroll progress bar ---------- */
  function scrollProgress() {
    const bar = $("#scrollProgress");
    if (!bar) return;
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- Split headings into words ---------- */
  function splitWords() {
    $$("[data-words]").forEach((el) => {
      $$("span", el).forEach((span) => {
        const i18nKey = span.getAttribute("data-i18n");
        wrapWords(span);
        if (i18nKey) span.setAttribute("data-words-line", "1");
      });
    });
  }
  function wrapWords(span) {
    const text = span.textContent;
    span.textContent = "";
    const words = text.split(" ");
    words.forEach((w, i) => {
      const wrap = document.createElement("span");
      wrap.className = "word";
      wrap.textContent = w + (i < words.length - 1 ? "\u00A0" : "");
      span.appendChild(wrap);
    });
  }
  function resplitLine(span) {
    if (!span.hasAttribute("data-words-line")) return;
    wrapWords(span);
    const container = span.closest(".reveal-words");
    if (container && container.classList.contains("is-visible")) staggerWords(container);
  }
  function staggerWords(container) {
    $$(".word", container).forEach((word, i) => (word.style.transitionDelay = i * 55 + "ms"));
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest(".lang-btn")) {
      setTimeout(() => $$('[data-words-line="1"]').forEach(resplitLine), 20);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  function revealOnScroll() {
    const targets = $$(".reveal-up, .reveal-words");
    if (!targets.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach((x) => x.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target.classList.contains("reveal-words")) staggerWords(entry.target);
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((x) => io.observe(x));
  }

  /* ---------- Animated counters ---------- */
  function counters() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const render = (el, v) => {
      const d = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = Number(v).toLocaleString("en-IN", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
    };
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => render(el, parseFloat(el.getAttribute("data-count"))));
      return;
    }
    const run = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const dur = 1400, start = performance.now(), ease = (t) => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        render(el, target * ease(p));
        if (p < 1) requestAnimationFrame(tick);
        else render(el, target);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries, obs) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        run(e.target);
        obs.unobserve(e.target);
      }),
      { threshold: 0.5 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Magnetic buttons ---------- */
  function magnetic() {
    if (reduce || isMobile) return;
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.22}px, ${my * 0.3}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------- Mouse-following glow + chip parallax ---------- */
  function cursorGlow() {
    if (reduce || isMobile) return;
    const glow = $("#cursorGlow");
    const chips = $$(".hero-chip");
    let tx = window.innerWidth / 2, ty = window.innerHeight * 0.3, cx = tx, cy = ty;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      const dx = (e.clientX / window.innerWidth - 0.5) * 2;
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      chips.forEach((chip, i) => {
        const depth = (i % 4) + 1;
        chip.style.transform = `translate(${dx * depth * 3.5}px, ${dy * depth * 3.5}px)`;
      });
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      if (glow) glow.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ============================================================
     HERO SCANNER — simple scan (click -> steps -> result -> reset)
     Theme-aware, reduced-motion safe.
     ============================================================ */
  function heroScanner() {
    const stage = $("#scannerStage");
    const obj = $("#pcbObject");
    const statusText = $("#scanStatusText");
    const hint = $("#scanHint");
    const result = $("#scanResult");
    if (!stage || !obj) return;
    let scanning = false, done = false;

    function runScan() {
      if (scanning) return;
      if (done) {
        // second interaction resets the scanner
        done = false;
        stage.classList.remove("scanning");
        result.classList.remove("show");
        if (statusText) statusText.textContent = t("scan_ready", "READY TO SCAN");
        if (hint) hint.style.display = "";
        return;
      }
      scanning = true;
      stage.classList.add("scanning");
      if (hint) hint.style.display = "none";

      const steps = [
        [t("scan_scanning", "SCANNING..."), 0],
        [t("scan_identifying", "IDENTIFYING MATERIAL..."), 900],
        [t("scan_analyzing", "ANALYZING VALUE..."), 1800],
      ];
      steps.forEach(([txt, d]) => setTimeout(() => statusText && (statusText.textContent = txt), d));

      setTimeout(() => {
        stage.classList.remove("scanning");
        if (statusText) statusText.textContent = t("scan_complete", "SCAN COMPLETE");
        result.classList.add("show");
        scanning = false;
        done = true;
        if (window.KC && KC.showToast) KC.showToast(t("scan_toast", "PCB identified · ₹380–420/kg"));
      }, 2700);
    }

    obj.addEventListener("click", runScan);
    obj.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); runScan(); }
    });

    // Subtle hover tilt toward the cursor (desktop only)
    if (!reduce && !isMobile) {
      stage.addEventListener("mousemove", (e) => {
        const r = stage.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -9;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
        obj.style.transform = `perspective(720px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      stage.addEventListener("mouseleave", () => { obj.style.transform = ""; });
    }
  }

  /* ============================================================
     LIVE NETWORK — geographic nodes, curved links, packets
     ============================================================ */
  function buildNetwork() {
    const svg = $("#mapSvg");
    const nodesG = $("#mapNodes");
    const linksG = $("#mapLinks");
    const packetsG = $("#mapPackets");
    const popup = $("#nodePopup");
    const wrap = $("#mapWrap");
    if (!svg || !nodesG || !linksG) return;
    const NS = "http://www.w3.org/2000/svg";

    // Geographic-ish positions inside the 400x440 India viewBox.
    // major:true nodes remain visible on mobile.
    const cities = {
      delhi:     { name: "Delhi NCR",  x: 168, y: 132, auth: 8, req: 17, col: 42, hub: true, major: true },
      chandigarh:{ name: "Chandigarh", x: 158, y: 100, auth: 3, req: 6,  col: 14 },
      jaipur:    { name: "Jaipur",     x: 138, y: 152, auth: 4, req: 9,  col: 20 },
      lucknow:   { name: "Lucknow",    x: 208, y: 150, auth: 4, req: 8,  col: 19 },
      ahmedabad: { name: "Ahmedabad",  x: 108, y: 198, auth: 5, req: 10, col: 24, major: true },
      surat:     { name: "Surat",      x: 112, y: 222, auth: 3, req: 5,  col: 12 },
      vadodara:  { name: "Vadodara",   x: 118, y: 210, auth: 2, req: 4,  col: 9 },
      mumbai:    { name: "Mumbai",     x: 116, y: 250, auth: 6, req: 11, col: 31, major: true },
      pune:      { name: "Pune",       x: 132, y: 262, auth: 4, req: 7,  col: 18 },
      kolkata:   { name: "Kolkata",    x: 258, y: 200, auth: 5, req: 9,  col: 22, major: true },
      hyderabad: { name: "Hyderabad",  x: 168, y: 278, auth: 5, req: 8,  col: 21, major: true },
      bengaluru: { name: "Bengaluru",  x: 152, y: 330, auth: 7, req: 13, col: 34, major: true },
      chennai:   { name: "Chennai",    x: 182, y: 342, auth: 5, req: 9,  col: 23, major: true },
    };

    // Realistic-ish topology (not fully connected).
    let links = [
      ["delhi", "chandigarh"], ["delhi", "jaipur"], ["delhi", "lucknow"],
      ["delhi", "ahmedabad"], ["delhi", "kolkata"], ["delhi", "mumbai"],
      ["jaipur", "ahmedabad"], ["ahmedabad", "vadodara"], ["vadodara", "surat"],
      ["surat", "mumbai"], ["mumbai", "pune"], ["pune", "hyderabad"],
      ["hyderabad", "bengaluru"], ["bengaluru", "chennai"], ["chennai", "hyderabad"],
      ["lucknow", "kolkata"], ["kolkata", "hyderabad"], ["delhi", "hyderabad"],
    ];

    // Mobile: show only major nodes + trimmed links.
    let keys = Object.keys(cities);
    if (isMobile) {
      keys = keys.filter((k) => cities[k].major);
      links = links.filter(([a, b]) => cities[a].major && cities[b].major);
    }

    // ---- draw curved connection paths ----
    const linkEls = links.map(([a, b]) => {
      const A = cities[a], B = cities[b];
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      // perpendicular offset for a gentle curve
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
      const off = Math.min(24, len * 0.18);
      const cxp = mx + (-dy / len) * off, cyp = my + (dx / len) * off;
      const d = `M ${A.x} ${A.y} Q ${cxp} ${cyp} ${B.x} ${B.y}`;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("class", "link-path");
      path.setAttribute("d", d);
      linksG.appendChild(path);
      return { a, b, path, A, B, cxp, cyp };
    });

    // ---- draw nodes ----
    const nodeEls = {};
    keys.forEach((key, i) => {
      const c = cities[key];
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "node" + (c.hub ? " hub" : ""));
      g.setAttribute("transform", `translate(${c.x} ${c.y})`);
      g.setAttribute("tabindex", "0");
      if (!reduce) {
        const ring = document.createElementNS(NS, "circle");
        ring.setAttribute("class", "node-ring");
        ring.setAttribute("r", "5");
        ring.style.animationDelay = (i % 6) * 0.4 + "s";
        g.appendChild(ring);
        if (c.hub) {
          const ring2 = document.createElementNS(NS, "circle");
          ring2.setAttribute("class", "node-ring ring2");
          ring2.setAttribute("r", "5");
          g.appendChild(ring2);
        }
      }
      const core = document.createElementNS(NS, "circle");
      core.setAttribute("class", "node-core");
      core.setAttribute("r", c.hub ? "6" : "4");
      g.appendChild(core);
      if (!isMobile) {
        const label = document.createElementNS(NS, "text");
        label.setAttribute("class", "node-label");
        label.setAttribute("y", c.hub ? "-11" : "-8");
        label.textContent = c.hub ? c.name : c.name;
        g.appendChild(label);
      }
      nodesG.appendChild(g);
      nodeEls[key] = { g, core, c };

      // hover popup
      const show = () => showPopup(c);
      g.addEventListener("mouseenter", show);
      g.addEventListener("focus", show);
      g.addEventListener("mouseleave", hidePopup);
      g.addEventListener("blur", hidePopup);
      // click focus
      g.addEventListener("click", (e) => { e.stopPropagation(); focusNode(key); show(); });
    });

    function showPopup(c) {
      if (!popup || !wrap) return;
      const wr = wrap.getBoundingClientRect();
      const sr = svg.getBoundingClientRect();
      popup.style.left = sr.left - wr.left + (c.x / 400) * sr.width + "px";
      popup.style.top = sr.top - wr.top + (c.y / 440) * sr.height + "px";
      $("#npCity").textContent = c.name;
      const pad = (n) => String(n).padStart(2, "0");
      $("#npAuth").textContent = pad(c.auth);
      $("#npRequests").textContent = pad(c.req);
      $("#npCollectors").textContent = pad(c.col);
      popup.classList.add("show");
    }
    function hidePopup() { popup && popup.classList.remove("show"); }

    // ---- click-focus: highlight a node + its links, dim the rest ----
    let focused = null;
    function focusNode(key) {
      if (focused === key) { clearFocus(); return; }
      focused = key;
      nodesG.classList.add("focusing");
      linksG.classList.add("focusing");
      Object.entries(nodeEls).forEach(([k, n]) => n.g.classList.remove("focus"));
      linkEls.forEach((l) => l.path.classList.remove("bright"));
      nodeEls[key].g.classList.add("focus");
      linkEls.forEach((l) => {
        if (l.a === key || l.b === key) {
          l.path.classList.add("bright");
          const other = l.a === key ? l.b : l.a;
          if (nodeEls[other]) nodeEls[other].g.classList.add("focus");
        }
      });
    }
    function clearFocus() {
      focused = null;
      nodesG.classList.remove("focusing");
      linksG.classList.remove("focusing");
      Object.values(nodeEls).forEach((n) => n.g.classList.remove("focus"));
      linkEls.forEach((l) => l.path.classList.remove("bright"));
    }
    // click empty area resets
    svg.addEventListener("click", (e) => { if (e.target === svg || e.target.classList.contains("map-outline")) clearFocus(); });
    document.addEventListener("click", (e) => {
      if (wrap && !wrap.contains(e.target)) clearFocus();
    });

    if (reduce) return;

    // ---- moving packets along quadratic paths ----
    const pointOnCurve = (l, tt) => {
      const u = 1 - tt;
      return {
        x: u * u * l.A.x + 2 * u * tt * l.cxp + tt * tt * l.B.x,
        y: u * u * l.A.y + 2 * u * tt * l.cyp + tt * tt * l.B.y,
      };
    };
    // A packet per link (skip a few to avoid clutter), varied speed.
    const packetLinks = linkEls.filter((_, i) => i % (isTablet ? 2 : 1) === 0);
    const travelers = packetLinks.map((l, i) => {
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("class", "packet");
      dot.setAttribute("r", cities[l.a].hub || cities[l.b].hub ? "2.4" : "1.8");
      packetsG.appendChild(dot);
      return { l, dot, t: (i * 0.13) % 1, speed: 0.004 + (i % 4) * 0.0018 };
    });

    let running = false;
    const io = new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(step);
    }, { threshold: 0.15 });
    io.observe(svg);

    function step() {
      travelers.forEach((tr) => {
        const prev = tr.t;
        tr.t += tr.speed;
        if (tr.t >= 1) {
          tr.t -= 1;
          // packet arrived -> flash destination node + brighten link briefly
          const destKey = tr.l.b;
          const n = nodeEls[destKey];
          if (n) { n.g.classList.add("arrive"); setTimeout(() => n.g.classList.remove("arrive"), 500); }
        }
        const p = pointOnCurve(tr.l, tr.t);
        tr.dot.setAttribute("cx", p.x);
        tr.dot.setAttribute("cy", p.y);
      });
      if (running) requestAnimationFrame(step);
    }
  }

  /* ---------- JOURNEY ---------- */
  function journeyScroll() {
    const steps = $$(".j-step");
    const scenes = $$(".journey-scene");
    if (!steps.length) return;
    const setActive = (idx) => {
      steps.forEach((s, i) => s.classList.toggle("active", i === idx));
      scenes.forEach((s, i) => s.classList.toggle("active", i === idx));
    };
    if (reduce || !("IntersectionObserver" in window)) { setActive(0); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setActive(parseInt(e.target.getAttribute("data-step"), 10));
      }),
      { threshold: 0.6, rootMargin: "-20% 0px -35% 0px" }
    );
    steps.forEach((s) => io.observe(s));
  }

  /* ---------- TRANSFORMATION ---------- */
  function transformScroll() {
    const stage = $("#transformStage");
    const label = $("#tphaseLabel");
    const core = $("#transformCore");
    if (!stage) return;
    const phases = [
      { key: "tr_phase1", fb: "DISCARDED PCB", emoji: "🔌", cls: "" },
      { key: "tr_phase2", fb: "SCANNING", emoji: "🔎", cls: "" },
      { key: "tr_phase3", fb: "DISASSEMBLY", emoji: "🧩", cls: "" },
      { key: "tr_phase4", fb: "MATERIAL SEPARATION", emoji: "🧩", cls: "separated" },
      { key: "tr_phase5", fb: "RECOMBINED", emoji: "♻️", cls: "recombined" },
    ];
    if (reduce) { stage.classList.add("separated"); return; }
    let current = -1;
    const setPhase = (i) => {
      if (i === current) return;
      current = i;
      const ph = phases[i];
      stage.classList.remove("separated", "recombined");
      if (ph.cls) stage.classList.add(ph.cls);
      if (label) label.textContent = t(ph.key, ph.fb);
      if (core) core.textContent = ph.emoji;
    };
    const onScroll = () => {
      const r = stage.getBoundingClientRect();
      const prog = 1 - (r.top + r.height / 2) / window.innerHeight;
      const idx = Math.min(phases.length - 1, Math.floor(Math.max(0, Math.min(1, prog)) * phases.length));
      setPhase(idx);
    };
    setPhase(0);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Phone demo ---------- */
  function phoneDemo() {
    const screen = $("#phoneScreen");
    if (!screen) return;
    const steps = $$(".phone-step", screen);
    if (!steps.length) return;
    let i = 0, timer = null;
    const show = (n) => steps.forEach((s, k) => s.classList.toggle("active", k === n));
    if (reduce) { show(steps.length - 1); return; }
    const start = () => { if (!timer) timer = setInterval(() => { i = (i + 1) % steps.length; show(i); }, 1600); };
    const stop = () => { clearInterval(timer); timer = null; };
    const io = new IntersectionObserver((e) => (e[0].isIntersecting ? start() : stop()), { threshold: 0.3 });
    io.observe(screen);
  }

  /* ---------- Active nav ---------- */
  function activeNav() {
    const map = { how: $('[data-nav="how"]'), network: $('[data-nav="network"]') };
    const sections = ["how", "network"].map((id) => $("#" + id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const link = map[e.target.id];
        if (link) link.classList.toggle("active", e.isIntersecting);
      }),
      { threshold: 0.4 }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Ambient particle field (canvas) ---------- */
  function particles() {
    const canvas = $("#particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, dpr, pts;
    const COUNT = 42;
    const rgb = () =>
      (getComputedStyle(document.documentElement).getPropertyValue("--particle-rgb") || "14,156,107").trim();
    const alpha = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--particle-alpha")) || 0.35;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    function seed() {
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14 * dpr, vy: (Math.random() - 0.5) * 0.14 * dpr,
        r: (Math.random() * 1.3 + 0.4) * dpr,
      }));
    }
    resize(); seed();
    window.addEventListener("resize", () => { resize(); seed(); });
    let mx = -9999, my = -9999;
    window.addEventListener("mousemove", (e) => { mx = e.clientX * dpr; my = e.clientY * dpr; }, { passive: true });

    (function draw() {
      const color = rgb(), a = alpha();
      ctx.clearRect(0, 0, w, h);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 20000 * dpr * dpr) { p.x += dx * 0.0008; p.y += dy * 0.0008; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${a})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dist = Math.hypot(dx, dy);
          if (dist < 120 * dpr) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${color},${(a * 0.4) * (1 - dist / (120 * dpr))})`;
            ctx.lineWidth = dpr * 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    })();
  }
})();

/* Recycler demo action (global, referenced inline) */
function recAction(type) {
  const msg =
    type === "accept" ? "Quote accepted · Collector notified"
    : type === "counter" ? "Counter-offer sent"
    : "Opening lot details…";
  if (window.KC && window.KC.showToast) window.KC.showToast(msg);
}
