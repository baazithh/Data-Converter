"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#1b5e20",
          marginBottom: "3rem",
        }}
      >
        utility tool
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)",
          fontWeight: 800,
          fontSize: "clamp(3rem, 10vw, 7rem)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          textAlign: "center",
          color: "#111111",
          maxWidth: "900px",
          marginBottom: "2rem",
        }}
      >
        DATA
        <br />
        <span style={{ color: "#1b5e20" }}>CONVERTER</span>
      </h1>

      {/* Divider */}
      <div
        style={{
          width: "48px",
          height: "2px",
          backgroundColor: "#1b5e20",
          marginBottom: "2rem",
        }}
      />

      {/* Subtitle */}
      <p
        style={{
          fontSize: "1rem",
          lineHeight: 1.7,
          color: "#555555",
          textAlign: "center",
          maxWidth: "520px",
          marginBottom: "3rem",
          fontWeight: 400,
        }}
      >
        A clean, minimalist tool to transform files and raw text between
        different formats. Paste your text or upload files to convert them
        instantly using a straightforward, three-step interface.
      </p>

      {/* CTA */}
      <Link href="/converter" style={{ textDecoration: "none" }}>
        <button
          id="start-now-btn"
          className="btn-primary"
          style={{ fontSize: "0.8125rem", padding: "1rem 3rem", letterSpacing: "0.12em" }}
        >
          START NOW →
        </button>
      </Link>

      {/* Step indicators */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "5rem",
          alignItems: "center",
        }}
      >
        {["Paste or Upload", "Choose Formats", "Download File"].map((step, i) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "1.5px solid #d9d9d9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#555555",
                  backgroundColor: "#ffffff",
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "#888888",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                {step}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  width: "32px",
                  height: "1px",
                  backgroundColor: "#d9d9d9",
                  marginBottom: "1.25rem",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
