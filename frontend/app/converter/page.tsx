"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

const SOURCE_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "txt", label: "Plain Text / Raw" },
  { value: "text", label: "Unstructured Text" },
];

const TARGET_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel (XLSX)" },
  { value: "parquet", label: "Parquet" },
  { value: "json", label: "JSON" },
  { value: "txt", label: "Plain Text (TXT)" },
];

type InputMode = "text" | "file";

export default function ConverterPage() {
  const router = useRouter();

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sourceFormat, setSourceFormat] = useState("csv");
  const [targetFormat, setTargetFormat] = useState("xlsx");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------
  // Drag & Drop
  // -------------------------------------------------------
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setInputMode("file");
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      setFile(picked);
      setInputMode("file");
    }
  };

  // -------------------------------------------------------
  // Convert & Download
  // -------------------------------------------------------
  const handleConvert = async () => {
    setError("");

    if (inputMode === "text" && !textInput.trim()) {
      setError("Please paste some text to convert.");
      return;
    }
    if (inputMode === "file" && !file) {
      setError("Please upload a file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("source_format", sourceFormat);
      formData.append("target_format", targetFormat);

      if (inputMode === "text") {
        formData.append("text", textInput);
      } else if (file) {
        formData.append("file", file);
      }

      const res = await fetch("http://localhost:8000/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Conversion failed." }));
        throw new Error(err.detail || "Conversion failed.");
      }

      // Trigger download
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `converted.${targetFormat}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Navigate to success page
      router.push("/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Styles
  // -------------------------------------------------------
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.625rem 1.5rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "none",
    backgroundColor: active ? "#1b5e20" : "#ffffff",
    color: active ? "#ffffff" : "#555555",
    borderBottom: active ? "none" : "1.5px solid #d9d9d9",
    fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)",
    transition: "all 0.15s ease",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "4rem 1.5rem",
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", maxWidth: "800px", marginBottom: "2.5rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#1b5e20",
            marginBottom: "0.75rem",
          }}
        >
          Step 2 of 3
        </div>
        <h1
          style={{
            fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)",
            fontWeight: 800,
            fontSize: "2rem",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#111111",
            marginBottom: "0.5rem",
          }}
        >
          Convert Your Data
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#666666", lineHeight: 1.6 }}>
          Paste raw text or upload a file, then select your source and target formats.
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#ffffff",
          border: "1.5px solid #d9d9d9",
        }}
      >
        {/* Input Mode Tabs */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #d9d9d9" }}>
          <button
            id="tab-paste-text"
            style={tabStyle(inputMode === "text")}
            onClick={() => setInputMode("text")}
          >
            Paste Text
          </button>
          <button
            id="tab-upload-file"
            style={tabStyle(inputMode === "file")}
            onClick={() => setInputMode("file")}
          >
            Upload File
          </button>
        </div>

        <div style={{ padding: "1.75rem" }}>
          {/* Input Area */}
          {inputMode === "text" ? (
            <textarea
              id="text-input"
              placeholder="Paste your CSV, JSON, TSV, or any raw text here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="input-plain"
              style={{
                height: "200px",
                resize: "vertical",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: "0.8125rem",
                lineHeight: 1.6,
              }}
            />
          ) : (
            <div
              id="upload-zone"
              className={`upload-zone ${isDragOver ? "active" : ""}`}
              style={{
                height: "200px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
                gap: "0.75rem",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Upload icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={file ? "#1b5e20" : "#aaaaaa"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>

              {file ? (
                <>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1b5e20" }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#888888" }}>
                    {(file.size / 1024).toFixed(1)} KB — click to replace
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#333333" }}>
                    Drag & drop your file here
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#888888" }}>
                    or click to browse — max 10 MB
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                id="file-input"
                accept=".csv,.json,.txt,.tsv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Format selectors */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginTop: "1.25rem",
            }}
          >
            <div>
              <label
                htmlFor="source-format"
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#555555",
                  marginBottom: "0.5rem",
                }}
              >
                Source Format
              </label>
              <select
                id="source-format"
                className="input-plain"
                value={sourceFormat}
                onChange={(e) => setSourceFormat(e.target.value)}
                style={{ appearance: "none" }}
              >
                {SOURCE_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="target-format"
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#555555",
                  marginBottom: "0.5rem",
                }}
              >
                Target Format
              </label>
              <select
                id="target-format"
                className="input-plain"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                style={{ appearance: "none" }}
              >
                {TARGET_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              id="error-message"
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1rem",
                backgroundColor: "#fff5f5",
                border: "1.5px solid #ffcccc",
                fontSize: "0.8125rem",
                color: "#cc0000",
              }}
            >
              {error}
            </div>
          )}

          {/* Divider */}
          <hr className="divider" style={{ margin: "1.5rem 0" }} />

          {/* Convert button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              id="convert-btn"
              className="btn-primary"
              onClick={handleConvert}
              disabled={loading}
              style={{ minWidth: "220px" }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#ffffff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Converting...
                </>
              ) : (
                "Convert & Download"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
