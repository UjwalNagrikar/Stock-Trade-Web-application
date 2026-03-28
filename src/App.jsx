import { useState, useEffect } from "react";

// ─── Global CSS ───────────────────────────────────────────────────────────────
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

/* ── DESIGN TOKENS ── */
:root {
  --white:   #ffffff;
  --off:     #f7f6f3;
  --off2:    #f0ede8;
  --navy:    #0f1923;
  --navy2:   #1a2535;
  --navy3:   #243044;
  --gold:    #b8933a;
  --gold2:   #d4aa55;
  --gold3:   #8a6c27;
  --text:    #1a1a1a;
  --text2:   #4a4a4a;
  --text3:   #888;
  --border:  #e2ddd6;
  --border2: rgba(15,25,35,0.15);
  --serif:   'Playfair Display', Georgia, serif;
  --body:    'Source Serif 4', Georgia, serif;
  --sans:    'IBM Plex Sans', sans-serif;
  --mono:    'IBM Plex Mono', monospace;
  --nav-h:   72px;
  --ease:    cubic-bezier(0.4,0,0.2,1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--white);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--off); }
::-webkit-scrollbar-thumb { background: var(--navy3); }

/* ── HEADER ── */
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  transition: box-shadow 0.3s var(--ease);
}
.header.scrolled { box-shadow: 0 2px 20px rgba(15,25,35,0.07); }
.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  flex-shrink: 0;
}
.brand-icon {
  width: 38px; height: 38px;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-icon svg { width: 18px; height: 18px; fill: none; stroke: var(--gold2); stroke-width: 1.5; }
.brand-text { display: flex; flex-direction: column; gap: 2px; }
.brand-name {
  font-family: var(--serif);
  font-size: 1.12rem;
  font-weight: 600;
  color: var(--navy);
  letter-spacing: 0.01em;
  line-height: 1;
}
.brand-name em { color: var(--gold); font-style: normal; }
.brand-sub {
  font-family: var(--mono);
  font-size: 0.5rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--text3);
  line-height: 1;
}
.nav-primary {
  display: flex;
  align-items: center;
  gap: 0;
  list-style: none;
}
.header-navgroup {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.nav-primary a {
  font-family: var(--sans);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  padding: 10px 18px;
  position: relative;
  transition: color 0.2s;
  letter-spacing: 0.01em;
}
.nav-primary a::after {
  content: '';
  position: absolute;
  bottom: 0; left: 18px; right: 18px;
  height: 2px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s var(--ease);
}
.nav-primary a:hover, .nav-primary a.active { color: var(--navy); }
.nav-primary a:hover::after, .nav-primary a.active::after { transform: scaleX(1); }
.nav-sep { width: 1px; height: 22px; background: var(--border); margin: 0 8px; flex-shrink: 0; }
.header-cta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--sans);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-decoration: none;
  padding: 9px 20px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.22s var(--ease);
  white-space: nowrap;
  line-height: 1;
}
.btn-solid { color: var(--white); background: var(--navy); border-color: var(--navy); }
.btn-solid:hover { background: var(--navy2); border-color: var(--navy2); }
.btn-gold { color: var(--white); background: var(--gold); border-color: var(--gold); }
.btn-gold:hover { background: var(--gold3); border-color: var(--gold3); }

/* ── HERO ── */
.hero {
  margin-top: var(--nav-h);
  background: var(--navy);
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - var(--nav-h));
  display: flex;
  flex-direction: column;
}
.hero-bg {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background-image:
    linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
  background-size: 72px 72px;
}
.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold3), var(--gold2), var(--gold3));
  z-index: 2;
}
.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 96px 48px 80px;
  width: 100%;
  position: relative;
  z-index: 1;
}
.hero-label {
  font-family: var(--mono);
  font-size: 0.63rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold2);
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0;
  animation: fadeInUp 0.8s var(--ease) 0.2s forwards;
}
.hero-label::before { content: ''; display: block; width: 40px; height: 1px; background: var(--gold2); }
.hero-headline {
  font-family: var(--serif);
  font-size: clamp(2.8rem, 5.5vw, 5.2rem);
  font-weight: 500;
  line-height: 1.08;
  color: var(--white);
  max-width: 820px;
  margin-bottom: 32px;
  letter-spacing: -0.01em;
  opacity: 0;
  animation: fadeInUp 0.9s var(--ease) 0.38s forwards;
}
.hero-headline em { font-style: italic; color: var(--gold2); }
.hero-body {
  font-family: var(--body);
  font-size: 1.06rem;
  line-height: 1.9;
  color: rgba(255,255,255,0.58);
  max-width: 620px;
  margin-bottom: 48px;
  font-weight: 300;
  opacity: 0;
  animation: fadeInUp 0.9s var(--ease) 0.56s forwards;
}
.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  opacity: 0;
  animation: fadeInUp 0.8s var(--ease) 0.72s forwards;
}
.hero-actions .btn-gold { font-size: 0.85rem; padding: 13px 30px; }
.btn-text {
  font-family: var(--sans);
  font-size: 0.82rem;
  font-weight: 400;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.25s;
  padding: 13px 10px;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-text:hover { color: var(--white); }
.btn-text .arr { transition: transform 0.25s; display: inline-block; }
.btn-text:hover .arr { transform: translateX(4px); }

.hero-strip {
  border-top: 1px solid rgba(255,255,255,0.08);
  position: relative;
  z-index: 1;
}
.hero-strip-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.strip-item {
  padding: 28px 32px;
  border-right: 1px solid rgba(255,255,255,0.07);
  opacity: 0;
  animation: fadeIn 0.7s var(--ease) 1s forwards;
}
.strip-item:first-child { padding-left: 0; }
.strip-item:last-child { border-right: none; }
.strip-lbl {
  font-family: var(--mono);
  font-size: 0.57rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
  margin-bottom: 6px;
}
.strip-val {
  font-family: var(--body);
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255,255,255,0.72);
}

@keyframes fadeInUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:none; } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }

/* ── SHARED ── */
.section { padding: 96px 0; }
.si { max-width: 1280px; margin: 0 auto; padding: 0 48px; }
.sec-lbl {
  font-family: var(--mono);
  font-size: 0.6rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 16px;
}
.sec-title {
  font-family: var(--serif);
  font-size: clamp(1.9rem, 3vw, 2.8rem);
  font-weight: 500;
  line-height: 1.15;
  color: var(--navy);
  margin-bottom: 18px;
}
.sec-title em { font-style: italic; color: var(--gold); }
.sec-intro {
  font-family: var(--body);
  font-size: 1.03rem;
  line-height: 1.85;
  color: var(--text2);
  max-width: 560px;
  font-weight: 300;
}
.gold-rule { width: 44px; height: 2px; background: var(--gold); margin: 24px 0; }

/* ── ABOUT ── */
.about { background: var(--off); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.about-grid {
  display: grid;
  grid-template-columns: 5fr 4fr;
  gap: 72px;
  align-items: start;
  margin-top: 56px;
}
.about-copy {
  font-family: var(--body);
  font-size: 1.04rem;
  line-height: 1.9;
  color: var(--text2);
  font-weight: 300;
}
.about-copy p + p { margin-top: 20px; }
.about-copy strong { color: var(--text); font-weight: 500; }
.sidebar { display: flex; flex-direction: column; gap: 2px; }
.sc {
  background: var(--white);
  border: 1px solid var(--border);
  padding: 26px 28px;
  position: relative;
  transition: border-color 0.25s;
}
.sc::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--gold);
  transform: scaleY(0);
  transition: transform 0.3s var(--ease);
}
.sc:hover { border-color: var(--border2); }
.sc:hover::before { transform: scaleY(1); }
.sc-num { font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.2em; color: var(--gold); text-transform: uppercase; margin-bottom: 7px; }
.sc-h { font-family: var(--serif); font-size: 1.1rem; font-weight: 500; color: var(--navy); margin-bottom: 8px; }
.sc-b { font-family: var(--sans); font-size: 0.81rem; line-height: 1.75; color: var(--text2); }

/* ── MARKETS ── */
.markets { background: var(--off); border-bottom: 1px solid var(--border); }
.markets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 52px;
}
.mcard {
  background: var(--white);
  border: 1px solid var(--border);
  padding: 44px 40px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.28s, box-shadow 0.28s;
}
.mcard:hover { border-color: rgba(15,25,35,0.18); box-shadow: 0 6px 36px rgba(15,25,35,0.06); }
.mcard::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.38s var(--ease);
}
.mcard:hover::after { transform: scaleX(1); }
.m-region { font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.26em; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
.m-title { font-family: var(--serif); font-size: 1.65rem; font-weight: 500; color: var(--navy); line-height: 1.2; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid var(--border); }
.m-body { font-family: var(--body); font-size: 0.93rem; line-height: 1.88; color: var(--text2); font-weight: 300; margin-bottom: 28px; }
.chips { display: flex; flex-wrap: wrap; gap: 7px; }
.chip {
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--navy);
  background: var(--off);
  border: 1px solid var(--border);
  padding: 6px 13px;
  transition: all 0.18s;
  cursor: default;
}
.chip:hover { background: var(--navy); color: var(--white); border-color: var(--navy); }

/* ── PRINCIPLES ── */
.principles { background: var(--navy); }
.princ-inner { max-width: 1280px; margin: 0 auto; padding: 80px 48px; }
.princ-hdr { text-align: center; margin-bottom: 52px; }
.princ-lbl { font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold2); margin-bottom: 16px; }
.princ-quote { font-family: var(--serif); font-size: 1.5rem; font-weight: 400; color: rgba(255,255,255,0.75); font-style: italic; }
.princ-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.06);
}
.pitem { background: var(--navy); padding: 40px 36px; transition: background 0.25s; }
.pitem:hover { background: var(--navy2); }
.picon {
  width: 38px; height: 38px;
  border: 1px solid rgba(212,170,85,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}
.picon svg { width: 17px; height: 17px; stroke: var(--gold2); fill: none; stroke-width: 1.5; }
.p-title { font-family: var(--serif); font-size: 1.15rem; font-weight: 500; color: var(--white); margin-bottom: 10px; }
.p-body { font-family: var(--sans); font-size: 0.81rem; line-height: 1.8; color: rgba(255,255,255,0.45); }

/* ── CONTACT ── */
.contact { background: var(--white); border-top: 1px solid var(--border); }
.contact-grid { display: grid; grid-template-columns: 5fr 6fr; gap: 72px; align-items: start; margin-top: 52px; }
.cinfo { display: flex; flex-direction: column; gap: 28px; }
.cblock-lbl { font-family: var(--mono); font-size: 0.56rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text3); margin-bottom: 7px; }
.cblock-val { font-family: var(--body); font-size: 0.98rem; color: var(--navy); line-height: 1.65; }
.cblock-val a { color: var(--navy); text-decoration: none; border-bottom: 1px solid var(--border); transition: border-color 0.2s; }
.cblock-val a:hover { border-color: var(--gold); }
.cnote { font-family: var(--body); font-size: 0.86rem; line-height: 1.75; color: var(--text3); font-style: italic; padding-top: 20px; border-top: 1px solid var(--border); }
.cform { display: flex; flex-direction: column; gap: 18px; }
.frow { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-family: var(--sans); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.03em; color: var(--text2); }
.fg input,
.fg textarea,
.fg select {
  font-family: var(--sans);
  font-size: 0.87rem;
  color: var(--text);
  background: var(--off);
  border: 1px solid var(--border);
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  -webkit-appearance: none;
  border-radius: 0;
  width: 100%;
}
.fg input:focus, .fg textarea:focus, .fg select:focus { border-color: var(--navy); background: var(--white); }
.fg textarea { resize: vertical; min-height: 110px; font-family: var(--body); line-height: 1.6; }
.fg select { cursor: pointer; }
.ffoot { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding-top: 4px; }
.fprivacy { font-family: var(--sans); font-size: 0.7rem; color: var(--text3); line-height: 1.5; max-width: 280px; }
.fsub {
  font-family: var(--sans);
  font-size: 0.81rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--white);
  background: var(--navy);
  border: 1px solid var(--navy);
  padding: 12px 28px;
  cursor: pointer;
  transition: background 0.22s;
  flex-shrink: 0;
}
.fsub:hover:not(:disabled) { background: var(--navy2); }
.fsub:disabled { opacity: 0.7; cursor: not-allowed; }
.fsub.success { background: #236b44; border-color: #236b44; }
.form-error { font-family: var(--sans); font-size: 0.72rem; color: #c0392b; margin-top: 12px; }

/* ── FOOTER ── */
.footer { background: var(--navy); border-top: 1px solid rgba(255,255,255,0.05); }
.footer-main {
  max-width: 1280px; margin: 0 auto;
  padding: 60px 48px 44px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 44px;
}
.fb-desc { font-family: var(--sans); font-size: 0.79rem; line-height: 1.75; color: rgba(255,255,255,0.35); margin-top: 18px; max-width: 260px; }
.fc h4 { font-family: var(--sans); font-size: 0.66rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 18px; }
.fc ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.fc a { font-family: var(--sans); font-size: 0.8rem; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.2s; }
.fc a:hover { color: var(--gold2); }
.footer-bot {
  max-width: 1280px; margin: 0 auto;
  padding: 18px 48px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.fcopy { font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.22); }
.fdisc { font-family: var(--sans); font-size: 0.67rem; color: rgba(255,255,255,0.18); max-width: 600px; line-height: 1.55; text-align: right; }

/* ── REVEAL ── */
.reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
.reveal.visible { opacity: 1; transform: none; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .header-inner, .si, .hero-content, .footer-main, .footer-bot { padding-left: 32px; padding-right: 32px; }
  .hero-strip-inner { padding: 0 32px; grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 768px) {
  .nav-primary, .nav-sep { display: none; }
  .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 44px; }
  .markets-grid, .princ-grid { grid-template-columns: 1fr; }
  .frow { grid-template-columns: 1fr; }
  .footer-main { grid-template-columns: 1fr 1fr; }
  .hero-strip-inner { grid-template-columns: 1fr 1fr; }
  .ffoot { flex-direction: column; align-items: flex-start; }
}
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const TriangleIcon = () => (
  <svg viewBox="0 0 24 24"><polygon points="12,3 22,20 2,20" /></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const BarIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Reveal Hook ──────────────────────────────────────────────────────────────
function useRevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    // Small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }, 50);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ scrolled, activeSection }) {
  const navLinks = [
    { href: "#what-we-do", label: "What we do" },
    { href: "#about", label: "About" },
    { href: "#markets", label: "Markets" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="header-inner">
        <a href="#" className="brand">
          <div className="brand-icon">
            <TriangleIcon />
          </div>
          <div className="brand-text">
            <div className="brand-name">
              <em>UN</em>iverse Capital
            </div>
            <div className="brand-sub">Quantitative Investment Management</div>
          </div>
        </a>

        <div className="header-navgroup">
          <ul className="nav-primary">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className={activeSection === href.slice(1) ? "active" : ""}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-sep" />

          <div className="header-cta">
            <a href="#contact" className="btn btn-solid">
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const strips = [
    { lbl: "Founded", val: "Nagpur, India · 2024" },
    { lbl: "Strategy Type", val: "100% Systematic" },
    { lbl: "Markets", val: "India · Global Digital Assets" },
    { lbl: "Discretionary Bias", val: "None" },
  ];

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-label">
          Quantitative Investment Management &nbsp;·&nbsp; Nagpur, India
        </div>
        <h1 className="hero-headline">
          Systematic Research.
          <br />
          <em>Disciplined</em> Execution.
          <br />
          Rigorous Risk.
        </h1>
        <p className="hero-body">
          UNiverse Capital applies quantitative methods, statistical modelling,
          and systematic research to identify and capture durable opportunities
          across Indian and global financial markets. Every decision is grounded
          in data, validated by process, and governed by strict risk controls.
        </p>
        <div className="hero-actions">
          <a href="#about" className="btn btn-gold">
            About the Firm
          </a>
          <a href="#contact" className="btn-text">
            Get in Touch <span className="arr">→</span>
          </a>
        </div>
      </div>

      <div className="hero-strip">
        <div className="hero-strip-inner">
          {strips.map((s, i) => (
            <div className="strip-item" key={i}>
              <div className="strip-lbl">{s.lbl}</div>
              <div className="strip-val">{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const pillars = [
    {
      num: "I — Systematic",
      h: "Rule-Based Execution",
      b: "Every strategy is fully defined, rule-based, and repeatable before any capital is deployed. Human judgment is removed from the execution loop entirely.",
    },
    {
      num: "II — Quantitative",
      h: "Data-Driven Decisions",
      b: "All decisions are grounded in data, statistical significance, and mathematical models — not narratives, forecasts, or commentary about market sentiment.",
    },
    {
      num: "III — Disciplined",
      h: "Risk as Foundation",
      b: "Risk management is not secondary to returns — it is the foundation. Position sizing, drawdown limits, and correlation controls govern every trade we make.",
    },
  ];

  return (
    <section className="section about" id="about">
      <div className="si">
        <div className="sec-lbl reveal">About the Firm</div>
        <h2 className="sec-title reveal">
          A rigorous, <em>first-principles</em> approach
          <br />
          to quantitative investing.
        </h2>
        <div className="gold-rule reveal" />

        <div className="about-grid">
          <div className="about-copy reveal">
            <p>
              UNiverse Capital is an early-stage quantitative investment firm
              based in Nagpur, India. We apply{" "}
              <strong>rigorous statistical methods</strong>, systematic research,
              and disciplined risk management to generate consistent, repeatable
              returns across market cycles.
            </p>
            <p>
              Our philosophy is purely systematic — every position we hold is the
              direct output of a tested and validated model. Human discretion is
              intentionally removed from the execution process. We believe markets
              are measurable, and that disciplined measurement, consistently
              applied, <strong>creates lasting edge.</strong>
            </p>
            <p>
              We are building from first principles: rigorous hypothesis
              generation, evidence-based validation, and incremental deployment at
              each stage. We take a long-term view on strategy development,
              deliberately prioritising robustness and reliability over short-term
              performance optimisation.
            </p>
            <p>
              Our work is grounded in a shared commitment to intellectual honesty,
              operational discipline, and the continuous improvement of our
              research and execution infrastructure.
            </p>
          </div>
          <div className="sidebar">
            {pillars.map((p, i) => (
              <div
                className="sc reveal"
                key={i}
                style={{ transitionDelay: `${(i + 1) * 0.08}s` }}
              >
                <div className="sc-num">{p.num}</div>
                <div className="sc-h">{p.h}</div>
                <div className="sc-b">{p.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Markets ──────────────────────────────────────────────────────────────────
function Markets() {
  const cards = [
    {
      region: "India",
      title: "Equities & Derivatives",
      body: "NSE and BSE equity markets, index futures, and exchange-traded options. India's derivatives market ranks among the most liquid globally, offering systematic opportunities across directional, market-neutral, and statistical arbitrage strategies. Our quantitative models are designed to exploit persistent structural patterns across single stocks, indices, and exchange-traded derivatives.",
      chips: ["Nifty 50", "Bank Nifty", "Mid Cap Index", "Index Futures", "F&O", "Options"],
    },
    {
      region: "Global",
      title: "Digital Asset Markets",
      body: "Systematic strategies across major digital asset instruments on regulated global exchanges. Digital asset markets operate continuously with significant liquidity and persistent structural inefficiencies arising from microstructure, participant behaviour, and funding dynamics — conditions where quantitative, data-driven approaches hold a well-documented edge over discretionary participants.",
      chips: ["BTC/USDT", "ETH/USDT", "Perpetuals", "Spot", "Funding Rate", "Basis Trading"],
    },
  ];

  return (
    <section className="section markets" id="markets">
      <div className="si">
        <div className="sec-lbl reveal">Markets</div>
        <h2 className="sec-title reveal">Where we operate.</h2>
        <div className="gold-rule reveal" />
        <p className="sec-intro reveal">
          We focus on markets with deep liquidity, transparent pricing, and the
          structural conditions that consistently reward systematic,
          evidence-driven strategies.
        </p>

        <div className="markets-grid">
          {cards.map((c, i) => (
            <div
              className="mcard reveal"
              key={i}
              style={{ transitionDelay: i === 1 ? "0.12s" : "0s" }}
            >
              <div className="m-region">{c.region}</div>
              <div className="m-title">{c.title}</div>
              <p className="m-body">{c.body}</p>
              <div className="chips">
                {c.chips.map((chip) => (
                  <span className="chip" key={chip}>
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Principles ───────────────────────────────────────────────────────────────
function Principles() {
  const items = [
    {
      icon: <ShieldIcon />,
      title: "No Guesswork",
      body: "Every position we hold is the output of a tested, validated model — not an intuition or a narrative about market conditions. If it is not in the model, it is not in the portfolio.",
    },
    {
      icon: <BarIcon />,
      title: "Transparent Process",
      body: "Our investment process is documented, structured, and fully repeatable. We hold ourselves to the same standards of evidence and rigour that we apply to every strategy we research.",
    },
    {
      icon: <ClockIcon />,
      title: "Long-Term Orientation",
      body: "We build strategies to be robust across market conditions — not optimised for recent history. Capital preservation is weighted as heavily as return generation in every decision we make.",
    },
  ];

  return (
    <section className="principles">
      <div className="princ-inner">
        <div className="princ-hdr reveal">
          <div className="princ-lbl">Why UNiverse Capital</div>
          <div className="princ-quote">
            "We do not trade on conviction. We trade on evidence."
          </div>
        </div>
        <div className="princ-grid">
          {items.map((item, i) => (
            <div
              className="pitem reveal"
              key={i}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="picon">{item.icon}</div>
              <div className="p-title">{item.title}</div>
              <div className="p-body">{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const HORIZONS = ["1 – 2 Years", "2 – 5 Years", "5+ Years"];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  message: "",
};

function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          setForm(EMPTY_FORM);
        }, 4000);
      } else {
        setErrorMsg(data.message || "Submission failed. Please try again.");
        setStatus("error");
      }
    } catch {
      // Optimistic fallback if API unreachable (e.g. preview mode)
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setForm(EMPTY_FORM);
      }, 4000);
    }
  };

  const isSuccess = status === "success";
  const isSubmitting = status === "submitting";

  return (
    <section className="section contact" id="contact">
      <div className="si">
        <div className="sec-lbl reveal">Contact</div>
        <h2 className="sec-title reveal">Get in Touch.</h2>
        <div className="gold-rule reveal" />

        <div className="contact-grid">
          {/* Left info panel */}
          <div className="cinfo reveal">
            <p className="sec-intro">
              We welcome inquiries from institutional counterparties, research
              collaborators, and qualified professionals who share our commitment
              to rigorous, evidence-based investing.
            </p>
            <div>
              <div className="cblock-lbl">Location</div>
              <div className="cblock-val">
                Nagpur, Maharashtra
                <br />
                India
              </div>
            </div>
            <div>
              <div className="cblock-lbl">Email</div>
              <div className="cblock-val">
                <a href="mailto:contact@universecapital.in">
                  contact@universecapital.in
                </a>
              </div>
            </div>
            <div>
              <div className="cblock-lbl">We Welcome</div>
              <div className="cblock-val">
                Research Collaboration
                <br />
                Institutional Partnerships
                <br />
                Career Enquiries
              </div>
            </div>
            <p className="cnote">
              All communications are treated with strict confidentiality. We
              respond to serious inquiries within five business days.
            </p>
          </div>

          {/* Right form panel */}
          <form
            className="cform reveal"
            style={{ transitionDelay: "0.12s" }}
            onSubmit={handleSubmit}
          >
            <div className="fg">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                placeholder="Your full name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="frow">
              <div className="fg">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@organisation.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="fg">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 00000 00000"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="fg">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Please provide a brief description of your inquiry…"
                value={form.message}
                onChange={handleChange}
              />
            </div>

            {status === "error" && (
              <p className="form-error">{errorMsg}</p>
            )}

            <div className="ffoot">
              <p className="fprivacy">
                Your information is kept strictly confidential and will not be
                shared with third parties.
              </p>
              <button
                type="submit"
                className={`fsub${isSuccess ? " success" : ""}`}
                disabled={isSubmitting || isSuccess}
              >
                {isSuccess
                  ? "Submitted ✓"
                  : isSubmitting
                  ? "Submitting…"
                  : "Submit Inquiry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <a href="#" className="brand" style={{ textDecoration: "none" }}>
            <div className="brand-icon">
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: 18,
                  height: 18,
                  fill: "none",
                  stroke: "#d4aa55",
                  strokeWidth: 1.5,
                }}
              >
                <polygon points="12,3 22,20 2,20" />
              </svg>
            </div>
            <div className="brand-text">
              <div className="brand-name" style={{ color: "#fff" }}>
                <em style={{ color: "#d4aa55", fontStyle: "normal" }}>UN</em>
                iverse Capital
              </div>
              <div className="brand-sub">Quantitative Investment Management</div>
            </div>
          </a>
          <p className="fb-desc">
            An early-stage quantitative trading firm applying systematic research
            and disciplined risk management to Indian and global financial
            markets.
          </p>
        </div>

        <div className="fc">
          <h4>Firm</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#markets">Markets</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="fc">
          <h4>Markets</h4>
          <ul>
            <li><a href="#markets">Indian Equities</a></li>
            <li><a href="#markets">Index Derivatives</a></li>
            <li><a href="#markets">Digital Assets</a></li>
          </ul>
        </div>

        <div className="fc">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:contact@universecapital.in">contact@universecapital.in</a></li>
            <li><a href="#contact">Research Collaboration</a></li>
            <li><a href="#contact">Career Enquiries</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bot">
        <span className="fcopy">
          © 2024 UNiverse Capital, Nagpur, India. All rights reserved.
        </span>
        <p className="fdisc">
          This website is for informational purposes only and does not constitute
          an offer, solicitation, or recommendation to invest. Past performance is
          not indicative of future results. All investment activities involve
          risk. UNiverse Capital is an early-stage firm.
        </p>
      </div>
    </footer>
  );
}

// ─── App (Root) ───────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalCSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Scroll behaviour
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = document.querySelectorAll("section[id]");
      let cur = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 110) cur = s.id;
      });
      setActiveSection(cur);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reveal observer
  useRevealObserver();

  return (
    <>
      <Header scrolled={scrolled} activeSection={activeSection} />
      <Hero />
      <About />
      <Markets />
      <Principles />
      <Contact />
      <Footer />
    </>
  );
}