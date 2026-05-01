import { useState, useEffect } from "react";
import "./App.css";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const BarIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6"  y1="20" x2="6"  y2="14" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Brand — shared by Header & Footer ───────────────────────────────────────
function Brand({ light = false }) {
  return (
    <a href="#" className="brand">
      <img
        src="/company.png"
        alt="UNiverse Capital"
        className={`brand-logo${light ? " dark-bg" : ""}`}
      />
      <div className="brand-text">
        <div className={`brand-name${light ? " light" : ""}`}>
          <em>UN</em>iverse Capital
        </div>
        <div className={`brand-sub${light ? " light" : ""}`}>
          Quantitative Investment Management
        </div>
      </div>
    </a>
  );
}

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
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }, 50);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ scrolled, activeSection }) {
  const navLinks = [
    { href: "#what-we-do", label: "What We Do" },
    { href: "#about",      label: "About"       },
    { href: "#contact",    label: "Contact"      },
  ];

  return (
    <header className={`header${scrolled ? " scrolled" : ""}`}>
      <div className="header-inner">
        <Brand />
        <div className="header-navgroup">
          <ul className="nav-primary">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={activeSection === href.slice(1) ? "active" : ""}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-sep" />
          <div className="header-cta">
            <a href="#contact" className="btn btn-solid">Get in Touch</a>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const strips = [
    { lbl: "Strategy Type",      val: "100% Systematic"              },
    { lbl: "Markets",            val: "India · Global Digital Assets" },
    { lbl: "Discretionary Bias", val: "None"                          },
  ];

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-label">Quantitative Investment Management</div>
        <h1 className="hero-headline">
          Systematic Thinking<br />
          <em>Quantitative Edge</em> Consistent Performance<br />
        </h1>
        <p className="hero-body">
          UNiverse Capital applies quantitative methods, statistical modelling,
          and systematic research to identify and capture durable opportunities
          across Indian and global financial markets. Every decision is grounded
          in data, validated by process, and governed by strict risk controls.
        </p>
        <div className="hero-actions">
          <a href="#about"   className="btn btn-gold">About the Firm</a>
          <a href="#contact" className="btn-text">Get in Touch <span className="arr">→</span></a>
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

// ─── What We Do ───────────────────────────────────────────────────────────────
function WhatWeDo() {
  const activities = [
    {
      num: "01", title: "Strategy Research & Development",
      body: "We design, test, and validate systematic trading strategies from first principles. Every hypothesis is subjected to rigorous statistical testing across multiple market regimes before any capital is allocated. Our research pipeline combines price action analysis, volatility modelling, and structural market dynamics — with a strict focus on out-of-sample robustness over in-sample curve fitting.",
    },
    {
      num: "02", title: "Systematic Execution",
      body: "All order generation and position management is rule-based and fully automated. We remove human discretion from the execution loop entirely — eliminating emotional bias, execution slippage from hesitation, and inconsistency across trades. Our systems are designed to execute with precision and consistency regardless of market conditions or news flow.",
    },
    {
      num: "03", title: "Quantitative Risk Management",
      body: "Risk is not a constraint we work around — it is the foundation every strategy is built on. We apply position sizing based on volatility-adjusted risk budgets, enforce hard drawdown limits at the strategy and portfolio level, and monitor real-time exposure across instruments and correlations. Capital preservation governs every decision we make.",
    },
    {
      num: "04", title: "Portfolio Construction",
      body: "We construct portfolios by combining uncorrelated, individually validated strategies rather than concentrating exposure in a single model. Diversification across timeframes, instruments, and market structures reduces dependence on any one source of edge and smooths the overall return profile across different market environments.",
    },
    {
      num: "05", title: "Infrastructure & Research Technology",
      body: "We build and maintain our own research, backtesting, and execution infrastructure. This includes data pipelines for Indian equity and derivatives markets, historical tick and OHLCV datasets, Monte Carlo simulation frameworks for strategy stress-testing, and full transaction cost modelling including brokerage, STT, stamp duty, and slippage.",
    },
    {
      num: "06", title: "Continuous Improvement",
      body: "Markets evolve, and so do our models. We operate a continuous research cycle — monitoring live strategy performance against historical expectations, identifying regime shifts, and systematically evaluating new strategy hypotheses. We do not rely on a single static edge; we build a living research process designed to adapt with the market.",
    },
  ];

  return (
    <section className="section wwd-section" id="what-we-do">
      <div className="si">
        <div className="sec-lbl reveal">What We Do</div>
        <h2 className="sec-title reveal">
          How we research, build,<br />and <em>deploy capital</em> systematically.
        </h2>
        <div className="gold-rule reveal" />
        <p className="sec-intro reveal">
          Every activity at UNiverse Capital is anchored in one principle —
          decisions driven entirely by data, process, and evidence. Here is how
          that translates into practice.
        </p>
        <div className="wwd-grid">
          {activities.map((item, i) => (
            <div
              className="wwd-item reveal"
              key={i}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
            >
              <div className="wwd-num">{item.num}</div>
              <div className="wwd-title">{item.title}</div>
              <div className="wwd-body">{item.body}</div>
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
      num: "I — Systematic",   h: "Rule-Based Execution",
      b: "Every strategy is fully defined, rule-based, and repeatable before any capital is deployed. Human judgment is removed from the execution loop entirely.",
    },
    {
      num: "II — Quantitative", h: "Data-Driven Decisions",
      b: "All decisions are grounded in data, statistical significance, and mathematical models — not narratives, forecasts, or commentary about market sentiment.",
    },
    {
      num: "III — Disciplined", h: "Risk as Foundation",
      b: "Risk management is not secondary to returns — it is the foundation. Position sizing, drawdown limits, and correlation controls govern every trade we make.",
    },
  ];

  return (
    <section className="section about" id="about">
      <div className="si">
        <div className="sec-lbl reveal">About the Firm</div>
        <h2 className="sec-title reveal">
          A rigorous, <em>first-principles</em> approach<br />to quantitative investing.
        </h2>
        <div className="gold-rule reveal" />

        <div className="about-grid">
          <div className="about-copy reveal">
            <p>
              UNiverse Capital is an early-stage quantitative investment firm based in
              Nagpur, India. We apply <strong>rigorous statistical methods</strong>,
              systematic research, and disciplined risk management to generate
              consistent, repeatable returns across market cycles.
            </p>
            <p>
              Our philosophy is purely systematic — every position we hold is the direct
              output of a tested and validated model. Human discretion is intentionally
              removed from the execution process. We believe markets are measurable, and
              that disciplined measurement, consistently applied,{" "}
              <strong>creates lasting edge.</strong>
            </p>
            <p>
              We are building from first principles: rigorous hypothesis generation,
              evidence-based validation, and incremental deployment at each stage. We
              take a long-term view on strategy development, deliberately prioritising
              robustness and reliability over short-term performance optimisation.
            </p>
            <p>
              Our work is grounded in a shared commitment to intellectual honesty,
              operational discipline, and the continuous improvement of our research
              and execution infrastructure.
            </p>
          </div>

          <div className="sidebar">
            {pillars.map((p, i) => (
              <div className="sc reveal" key={i} style={{ transitionDelay: `${(i + 1) * 0.08}s` }}>
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
      region: "India",  title: "Equities & Derivatives",
      body: "NSE and BSE equity markets, index futures, and exchange-traded options. India's derivatives market ranks among the most liquid globally, offering systematic opportunities across directional, market-neutral, and statistical arbitrage strategies. Our quantitative models are designed to exploit persistent structural patterns across single stocks, indices, and exchange-traded derivatives.",
      chips: ["Nifty 50", "Bank Nifty", "Mid Cap Index", "Index Futures", "F&O", "Options"],
    },
    {
      region: "Global", title: "Digital Asset Markets",
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
          structural conditions that consistently reward systematic, evidence-driven
          strategies.
        </p>
        <div className="markets-grid">
          {cards.map((c, i) => (
            <div className="mcard reveal" key={i} style={{ transitionDelay: i === 1 ? "0.12s" : "0s" }}>
              <div className="m-region">{c.region}</div>
              <div className="m-title">{c.title}</div>
              <p className="m-body">{c.body}</p>
              <div className="chips">
                {c.chips.map((chip) => <span className="chip" key={chip}>{chip}</span>)}
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
      icon: <ShieldIcon />, title: "No Guesswork",
      body: "Every position we hold is the output of a tested, validated model — not an intuition or a narrative about market conditions. If it is not in the model, it is not in the portfolio.",
    },
    {
      icon: <BarIcon />, title: "Transparent Process",
      body: "Our investment process is documented, structured, and fully repeatable. We hold ourselves to the same standards of evidence and rigour that we apply to every strategy we research.",
    },
    {
      icon: <ClockIcon />, title: "Long-Term Orientation",
      body: "We build strategies to be robust across market conditions — not optimised for recent history. Capital preservation is weighted as heavily as return generation in every decision we make.",
    },
  ];

  return (
    <section className="principles">
      <div className="princ-inner">
        <div className="princ-hdr reveal">
          <div className="princ-lbl">Why UNiverse Capital</div>
          <div className="princ-quote">"We do not trade on conviction. We trade on evidence."</div>
        </div>
        <div className="princ-grid">
          {items.map((item, i) => (
            <div className="pitem reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
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

// ─── Contact ──────────────────────────────────────────────────────────────────
// ─── Contact ──────────────────────────────────────────────────────────────────
const EMPTY_FORM = { full_name: "", email: "", phone: "", message: "" };

function Contact() {
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [status,   setStatus]   = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res  = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.message || "Submission failed. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Unable to reach the server. Please try again.");
      setStatus("error");
    }
  };

  const isSubmitting = status === "submitting";

  // ── Success panel ────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <section className="section contact" id="contact">
        <div className="si">
          <div className="sec-lbl reveal">Contact</div>
          <h2 className="sec-title reveal">Get in Touch.</h2>
          <div className="gold-rule reveal" />

          <div style={{
            marginTop: "52px",
            padding: "64px 48px",
            background: "var(--off)",
            border: "1px solid var(--border)",
            textAlign: "center",
            maxWidth: "640px",
          }}>
            {/* Gold checkmark */}
            <div style={{
              width: "56px", height: "56px",
              border: "2px solid var(--gold)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
            }}>
              <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: "var(--gold)", fill: "none", strokeWidth: 2 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div style={{
              fontFamily: "var(--mono)", fontSize: "0.58rem",
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold)", marginBottom: "16px",
            }}>
              Enquiry Received
            </div>

            <h3 style={{
              fontFamily: "var(--serif)", fontSize: "1.8rem",
              fontWeight: 500, color: "var(--navy)",
              lineHeight: 1.2, marginBottom: "20px",
            }}>
              Thank you for reaching out.
            </h3>

            <p style={{
              fontFamily: "var(--body)", fontSize: "1rem",
              lineHeight: 1.8, color: "var(--text2)",
              fontWeight: 300, marginBottom: "32px",
            }}>
              We have received your enquiry and will be in touch within
              five business days. For urgent matters, contact us directly at{" "}
              <a href="mailto:contact@universecapital.in"
                style={{ color: "var(--navy)", borderBottom: "1px solid var(--border)" }}>
                contact@universecapital.in
              </a>.
            </p>

            <button
              onClick={() => { setStatus("idle"); setForm(EMPTY_FORM); }}
              className="btn btn-solid"
              style={{ margin: "0 auto" }}
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Normal form ──────────────────────────────────────────────────────────
  return (
    <section className="section contact" id="contact">
      <div className="si">
        <div className="sec-lbl reveal">Contact</div>
        <h2 className="sec-title reveal">Get in Touch.</h2>
        <div className="gold-rule reveal" />

        <div className="contact-grid">
          <div className="cinfo reveal">
            <p className="sec-intro">
              We welcome inquiries from institutional counterparties, research
              collaborators, and qualified professionals who share our commitment
              to rigorous, evidence-based investing.
            </p>
            <div>
              <div className="cblock-lbl">Location</div>
              <div className="cblock-val">Nagpur, Maharashtra<br />India</div>
            </div>
            <div>
              <div className="cblock-lbl">Email</div>
              <div className="cblock-val">
                <a href="mailto:contact@universecapital.in">contact@universecapital.in</a>
              </div>
            </div>
            <div>
              <div className="cblock-lbl">We Welcome</div>
              <div className="cblock-val">
                Research Collaboration<br />
                Institutional Partnerships<br />
                Career Enquiries
              </div>
            </div>
            <p className="cnote">
              All communications are treated with strict confidentiality. We
              respond to serious inquiries within five business days.
            </p>
          </div>

          <form className="cform reveal" style={{ transitionDelay: "0.12s" }} onSubmit={handleSubmit}>
            <div className="fg">
              <label>Full Name *</label>
              <input type="text" name="full_name" placeholder="Your full name"
                value={form.full_name} onChange={handleChange} required />
            </div>
            <div className="frow">
              <div className="fg">
                <label>Email Address *</label>
                <input type="email" name="email" placeholder="you@organisation.com"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="fg">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="+91 00000 00000"
                  value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="fg">
              <label>Message</label>
              <textarea name="message" placeholder="Please provide a brief description of your inquiry…"
                value={form.message} onChange={handleChange} />
            </div>

            {status === "error" && <p className="form-error">{errorMsg}</p>}

            <div className="ffoot">
              <p className="fprivacy">
                Your information is kept strictly confidential and will not be shared with third parties.
              </p>
              <button
                type="submit"
                className="fsub"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Submit Inquiry"}
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
          <Brand light />
          <p className="fb-desc">
            An early-stage quantitative trading firm applying systematic research
            and disciplined risk management to Indian and global financial markets.
          </p>
        </div>

        <div className="fc">
          <h4>Firm</h4>
          <ul>
            <li><a href="#what-we-do">What We Do</a></li>
            <li><a href="#about">About Us</a></li>
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
        <span className="fcopy">© 2024 UNiverse Capital, Nagpur, India. All rights reserved.</span>
        <p className="fdisc">
          This website is for informational purposes only and does not constitute an offer,
          solicitation, or recommendation to invest. Past performance is not indicative of
          future results. All investment activities involve risk. UNiverse Capital is an
          early-stage firm.
        </p>
      </div>
    </footer>
  );
}

// ─── App (Root) ───────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled,      setScrolled]      = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      let cur = "";
      document.querySelectorAll("section[id]").forEach((s) => {
        if (window.scrollY >= s.offsetTop - 110) cur = s.id;
      });
      setActiveSection(cur);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useRevealObserver();

  return (
    <>
      <Header scrolled={scrolled} activeSection={activeSection} />
      <Hero />
      <WhatWeDo />
      <About />
      <Markets />
      <Principles />
      <Contact />
      <Footer />
    </>
  );
}