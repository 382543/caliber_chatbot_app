// App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Camera as CamIcon, Leaf } from "lucide-react";
import Camera from "./pages/Camera.jsx";
import Lifestyle from "./pages/Lifestyle.jsx";
import Category from "./pages/Category.jsx";
import ChatWidget from "./pages/ChatWidget.jsx";
import "./App.css";

/* ---- Home page ---- */
function Home() {
  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          {/* left: copy */}
          <div className="hero-copy">
            <h1 className="hero-title">
              Eat smarter with <span>Caliber</span>
            </h1>
            <p className="hero-sub">
              Detect food items in seconds and build a lifestyle plan that fits your day.
            </p>

           

            <ul className="chips">
              <li> Instant food detection</li>
              <li> PCOD-friendly swaps</li>
              <li> Macro guidance</li>
              <li>Actionable AI tips</li>
            </ul>
          </div>

          {/* right: robot illustration */}
          <div className="hero-art" aria-hidden="true">
            <span className="hero-glow"></span>
            {/* inline SVG robot */}
            <svg className="robo" viewBox="0 0 220 220" role="img" aria-label="Caliber robot">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#dbeaff" />
                  <stop offset="1" stopColor="#eef6ff" />
                </linearGradient>
              </defs>

              {/* body */}
              <rect x="45" y="70" width="130" height="100" rx="18" fill="url(#g1)" stroke="#cfe0ff" />
              {/* face */}
              <rect x="60" y="85" width="100" height="50" rx="12" fill="#fff" stroke="#d9e6ff" />
              {/* eyes */}
              <circle cx="88" cy="110" r="8" fill="#0a58ca" />
              <circle cx="132" cy="110" r="8" fill="#0a58ca" />
              {/* smile */}
              <path d="M85 124 Q110 138 135 124" fill="none" stroke="#7aa7ff" strokeWidth="4" strokeLinecap="round"/>

              {/* antenna */}
              <line x1="110" y1="60" x2="110" y2="40" stroke="#9bbcff" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="110" cy="34" r="8" fill="#0a58ca"/>
              <circle className="blink" cx="110" cy="34" r="3" fill="#fff"/>

              {/* arms */}
              <rect x="25" y="95" width="20" height="60" rx="10" fill="#eaf2ff" stroke="#d7e7ff"/>
              <rect x="175" y="95" width="20" height="60" rx="10" fill="#eaf2ff" stroke="#d7e7ff"/>

              {/* chest badge */}
              <rect x="92" y="140" width="36" height="18" rx="9" fill="#0a58ca" opacity=".9"/>
              <circle cx="100" cy="149" r="4" fill="#fff"/>
              <rect x="108" y="146" width="16" height="6" rx="3" fill="#fff" opacity=".9"/>
            </svg>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="grid" aria-label="Primary features">
        <Link to="/camera" className="card" aria-label="Camera feature">
          <div className="icon-bubble"><CamIcon size={22} color="#0a58ca" /></div>
          <h3>Camera</h3>
          <p>Scan a meal to estimate ingredients, macros and calories.</p>
        </Link>

        <Link to="/lifestyle" className="card" aria-label="Lifestyle feature">
          <div className="icon-bubble"><Leaf size={22} color="#0a58ca" /></div>
          <h3>Lifestyle</h3>
          <p>Daily routines, PCOD-friendly plans and stress-free diet nudges.</p>
        </Link>
      </section>

      {/* QUICK STATS */}
      <section className="stats" aria-label="App stats">
        <div className="pill"><span>10k+</span> foods recognized</div>
        <div className="pill"><span>92%</span> benchmark accuracy</div>
        <div className="pill"><span>24/7</span> guidance</div>
      </section>
    </main>
  );
}

/* ---- App shell ---- */
export default function App() {
  return (
    <div className="app">
      {/* Glassy navbar */}
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="Caliber home">
            <span className="dot" /> Caliber
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <Link to="/camera">Camera</Link>
            <Link to="/lifestyle">Lifestyle</Link>
            <a className="link-muted" href="https://example.com/docs" target="_blank" rel="noreferrer">
              Docs
            </a>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/lifestyle" element={<Lifestyle />} />
        <Route path="/lifestyle/:slug" element={<Category />} />
      </Routes>

      {/* Floating chat (bottom-right) */}
      <ChatWidget />

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} Caliber Chatbot </p>
          <div className="footer-links">
            <a href="https://example.com/privacy" target="_blank" rel="noreferrer">Privacy</a>
            <a href="https://example.com/terms" target="_blank" rel="noreferrer">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
