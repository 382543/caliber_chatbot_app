import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Lifestyle.css"; // <-- THIS IMPORT IS REQUIRED

const CATEGORIES = [
  { 
    slug: "vegetables", 
    label: "Vegetables", 
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&h=200&fit=crop",
    tone: "green",  
    desc: "Leafy greens, roots, crucifers", 
    tags:["PCOD-friendly","Low GI"] 
  },
  { 
    slug: "fruits",     
    label: "Fruits",     
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop",
    tone: "pink",   
    desc: "Berries, citrus, tropical",     
    tags:["Antioxidants"] 
  },
  { 
    slug: "proteins",   
    label: "Proteins",   
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop",
    tone: "amber",  
    desc: "Pulses, eggs, lean meats",      
    tags:["High Protein"] 
  },
  { 
    slug: "grains",     
    label: "Grains",     
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop",
    tone: "gold",   
    desc: "Rice, oats, quinoa, millets",   
    tags:["Whole grain","Low GI"] 
  },
  { 
    slug: "dairy",      
    label: "Dairy",      
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop",
    tone: "blue",   
    desc: "Milk, curd, paneer, cheese",    
    tags:["Calcium"] 
  },
  { 
    slug: "junk",       
    label: "Junk",       
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200&h=200&fit=crop",
    tone: "red",    
    desc: "Fried & ultra-processed",       
    tags:["Limit"] 
  },
];


const FILTERS = ["All","PCOD-friendly","Low GI","High Protein","Whole grain","Antioxidants","Limit"];

export default function Lifestyle() {
  const [query, setQuery]   = useState("");
  const [active, setActive] = useState("All");

  const list = useMemo(() => {
    return CATEGORIES.filter(c => {
      const matchesText = (c.label + " " + c.desc).toLowerCase().includes(query.toLowerCase());
      const matchesTag  = active === "All" ? true : (c.tags||[]).includes(active);
      return matchesText && matchesTag;
    });
  }, [query, active]);

  return (
    <div className="life-wrap">
      <header className="life-hero">
        <h2>Lifestyle · Food Categories</h2>
        <p>Search or filter to explore suggestions, swaps, and quick tips.</p>
      </header>

      <div className="life-toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search categories…"
            value={query}
            onChange={e=>setQuery(e.target.value)}
          />
          <span className="kbd">/</span>
        </div>
        <div className="chips">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`chip ${active===f ? "active":""}`}
              onClick={()=>setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="life-bg">
        <div className="blob blob-a"></div>
        <div className="blob blob-b"></div>
        <div className="grid-dots"></div>
      </div>

      <section className="life-grid">
        {list.map((c, i) => (
          <Link
            key={c.slug}
            to={`/lifestyle/${c.slug}`}
            className={`life-card tone-${c.tone}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="ring" aria-hidden="true"></span>
            <div className="card-image">
              <img src={c.image} alt={c.label} />
            </div>
            <h4>{c.label}</h4>
            <p>{c.desc}</p>
            <div className="mini-tags">
              {(c.tags||[]).map(t => <span key={t} className="mini">{t}</span>)}
            </div>
            <span className="arrow" aria-hidden="true">→</span>
            <span className="ripple" aria-hidden="true"></span>
          </Link>
        ))}
      </section>

      <div className="life-footerlinks">
        <Link to="/" className="life-link">← Back to Home</Link>
      </div>
    </div>
  );
}
