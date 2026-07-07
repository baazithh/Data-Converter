"use client";

import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

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
        textAlign: "center",
      }}
    >
      {/* Checkmark */}
      <div
        style={{
          width: "72px",
          height: "72px",
          backgroundColor: "#1b5e20",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Step label */}
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#1b5e20",
          marginBottom: "1rem",
        }}
      >
        Step 3 of 3 — Complete
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)",
          fontWeight: 800,
          fontSize: "2.25rem",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#111111",
          marginBottom: "1rem",
        }}
      >
        File Converted
      </h1>

      {/* Message */}
      <p
        style={{
          fontSize: "0.9375rem",
          color: "#555555",
          lineHeight: 1.7,
          maxWidth: "420px",
          marginBottom: "0.75rem",
        }}
      >
        Your converted file has been successfully generated and your download
        should begin automatically.
      </p>
      <p
        style={{
          fontSize: "0.8125rem",
          color: "#888888",
          marginBottom: "3rem",
        }}
      >
        Check your browser&apos;s downloads folder if it did not start.
      </p>

      {/* Divider */}
      <div
        style={{
          width: "48px",
          height: "1.5px",
          backgroundColor: "#d9d9d9",
          marginBottom: "3rem",
        }}
      />

      {/* CTA */}
      <button
        id="convert-another-btn"
        className="btn-primary"
        onClick={() => router.push("/converter")}
        style={{ minWidth: "240px" }}
      >
        Convert Another File
      </button>
    </main>
  );
}
