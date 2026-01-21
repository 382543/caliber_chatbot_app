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
          {/* LEFT CONTENT */}
          <div className="hero-copy">
            <h1 className="hero-title">
              Eat smarter with <span>Caliber</span>
            </h1>

            <p className="hero-sub">
              Detect food items in seconds and build a lifestyle plan that fits your day.
            </p>

            <ul className="chips">
              <li>Instant food detection</li>
              <li>PCOD-friendly swaps</li>
              <li>Macro guidance</li>
              <li>Actionable AI tips</li>
            </ul>
          </div>

          {/* RIGHT CHARACTER */}
          <div className="hero-art" style={{ position: "relative" }}>
            <span className="hero-glow"></span>

            {/* Speech Bubble */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                padding: "12px 20px",
                borderRadius: "20px",
                boxShadow: "0 8px 24px rgba(10,88,202,0.15)",
                border: "2px solid #bfdbfe",
                fontSize: "16px",
                fontWeight: 700,
                color: "#0a58ca",
                zIndex: 10
              }}
            >
              Hi, Welcome to Caliber! 👋
            </div>

            {/* Friendly Robot */}
            <svg className="robo" viewBox="0 0 200 220" style={{width: '280px', height: '280px'}}>
              {/* Antenna */}
              <line x1="100" y1="20" x2="100" y2="40" stroke="#0a58ca" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="100" cy="15" r="6" fill="#0a58ca"/>
              
              {/* Head */}
              <rect x="60" y="40" width="80" height="60" rx="15" fill="white" stroke="#60a5fa" strokeWidth="3"/>
              
              {/* Eyes */}
              <circle cx="80" cy="65" r="8" fill="#0a58ca"/>
              <circle cx="120" cy="65" r="8" fill="#0a58ca"/>
              
              {/* Smile */}
              <path d="M 75 85 Q 100 92 125 85" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round"/>
              
              {/* Body */}
              <rect x="50" y="110" width="100" height="90" rx="20" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="3"/>
              
              {/* Body detail - horizontal line */}
              <line x1="70" y1="155" x2="130" y2="155" stroke="#60a5fa" strokeWidth="2"/>
              
              {/* Left Arm & Hand */}
              <circle cx="35" cy="140" r="15" fill="#90cdefff" stroke="#0a67d8ff" strokeWidth="2"/>
              
              {/* Right Arm & Hand */}
              <circle cx="165" cy="140" r="15" fill="#90cde7ff" stroke="#0a67d8ff" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="grid">
        <Link to="/camera" className="card">
          <div className="icon-bubble">
            <CamIcon size={22} color="#0a58ca" />
          </div>
          <h3>Camera</h3>
          <p>Scan a meal to estimate ingredients, macros and calories.</p>
        </Link>

        <Link to="/lifestyle" className="card">
          <div className="icon-bubble">
            <Leaf size={22} color="#0a58ca" />
          </div>
          <h3>Lifestyle</h3>
          <p>Daily routines, PCOD-friendly plans and stress-free diet nudges.</p>
        </Link>
      </section>

      {/* STATS */}
      <section className="stats">
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
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="dot" /> Caliber
          </Link>

          <nav className="nav-links">
            <Link to="/camera">Camera</Link>
            <Link to="/lifestyle">Lifestyle</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/lifestyle" element={<Lifestyle />} />
        <Route path="/lifestyle/:slug" element={<Category />} />
      </Routes>

      <ChatWidget />

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Caliber Chatbot</p>
      </footer>
    </div>
  );
}
