// src/components/Camera.jsx
import React, { useState } from "react";

const API_BASE =
  import.meta.env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export default function Camera() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleDetect = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    // Set a timeout to avoid infinite waiting on network issues
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000); // 25s

    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      // Try to parse JSON even on error to show a useful message
      let data = null;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        /* not JSON */
      }

      if (!res.ok) {
        // Common local dev cause: CORS or URL mismatch
        const corsHint =
          res.status === 0 || res.type === "opaque"
            ? " (possible CORS/URL issue)"
            : "";
        throw new Error(
          (data && (data.detail || data.error)) ||
            text ||
            `Request failed with ${res.status}${corsHint}`
        );
      }

      setResult(data);
    } catch (err) {
      // Distinguish timeouts / CORS / offline
      if (err.name === "AbortError") {
        setError("Request timed out. Is the API running on port 5000?");
      } else if (!navigator.onLine) {
        setError("You appear to be offline.");
      } else {
        setError(
          (err && err.message) ||
            "Prediction failed. Check backend logs for details."
        );
      }
      console.error(err);
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    <div
      className="page"
      style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 20 }}
    >
      <h2>Food Detection</h2>
      <p>Upload a food image to classify the item.</p>

      {/* Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ marginTop: 12 }}
      />

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: 20 }}>
          <img
            src={preview}
            alt="Uploaded Preview"
            style={{
              width: "100%",
              maxWidth: 350,
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Detect Button */}
      <button
        onClick={handleDetect}
        disabled={loading || !image}
        style={{
          marginTop: 18,
          padding: "10px 18px",
          background: loading ? "#6c757d" : "#0a58ca",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Detecting..." : "Detect Food"}
      </button>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 16, color: "#c82333", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 32 }}>
          {/* Top Prediction - Large Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: 32,
            borderRadius: 20,
            marginBottom: 24,
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ 
              fontSize: 14, 
              color: '#94a3b8', 
              fontWeight: 600, 
              letterSpacing: '1px',
              marginBottom: 12,
              textTransform: 'uppercase'
            }}>
              Detected Food
            </div>
            <div style={{ 
              fontSize: 36, 
              fontWeight: 900, 
              color: 'white', 
              marginBottom: 12,
              textTransform: 'capitalize'
            }}>
              {result.top1.class.replace(/-/g, ' ')}
            </div>
            <div style={{ 
              fontSize: 48, 
              fontWeight: 800,
              background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {(result.top1.confidence * 100).toFixed(1)}%
            </div>
            <div style={{ 
              fontSize: 12, 
              color: '#64748b', 
              marginTop: 8,
              fontStyle: 'italic'
            }}>
              Confidence Score
            </div>
          </div>

          {/* All Predictions */}
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ 
              margin: "0 0 20px 0", 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 20 }}>📊</span> Prediction Breakdown
            </h4>
            
            {result.top5.map((row, idx) => (
              <div key={idx} style={{ marginBottom: idx === 4 ? 0 : 16 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: idx === 0 ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: idx === 0 ? 'white' : '#64748b'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: idx === 0 ? '#0f172a' : '#475569',
                      textTransform: 'capitalize'
                    }}>
                      {row.class.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: idx === 0 ? '#3b82f6' : '#64748b',
                    minWidth: 60,
                    textAlign: 'right'
                  }}>
                    {(row.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: 10,
                  background: '#f1f5f9',
                  borderRadius: 10,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${row.confidence * 100}%`,
                    height: '100%',
                    background: idx === 0 
                      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      : 'linear-gradient(90deg, #cbd5e1, #94a3b8)',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 10
                  }}>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ 
            fontSize: 11, 
            color: "#94a3b8", 
            marginTop: 16, 
            textAlign: 'center', 
            fontStyle: 'italic' 
          }}>
            Note: This is a <em>classifier</em> (no bounding boxes). If you
            need boxes, switch to a YOLO detection model and API.
          </p>
        </div>
      )}
    </div>
  );
}
