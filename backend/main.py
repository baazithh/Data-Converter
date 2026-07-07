from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import io
import csv
import json
import re
from typing import Optional

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="Data Converter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# ---------------------------------------------------------------------------
# MIME / extension map
# ---------------------------------------------------------------------------
MEDIA_TYPES = {
    "csv":     "text/csv",
    "xlsx":    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "parquet": "application/octet-stream",
    "json":    "application/json",
    "txt":     "text/plain",
}

# ---------------------------------------------------------------------------
# Helper: parse raw bytes → DataFrame
# ---------------------------------------------------------------------------
def bytes_to_dataframe(raw: bytes, source_format: str) -> pd.DataFrame:
    """Convert raw bytes to a pandas DataFrame based on source format."""
    text = raw.decode("utf-8", errors="replace")

    if source_format == "json":
        try:
            data = json.loads(text)
            if isinstance(data, list):
                return pd.DataFrame(data)
            elif isinstance(data, dict):
                # Try records-style, else wrap
                try:
                    return pd.json_normalize(data)
                except Exception:
                    return pd.DataFrame([data])
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {exc}")

    elif source_format == "csv":
        try:
            return pd.read_csv(io.StringIO(text))
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"CSV parse error: {exc}")

    elif source_format in ("txt", "text", "raw"):
        return parse_unstructured_text(text)

    else:
        # Fallback — try CSV sniffer
        return parse_unstructured_text(text)


def parse_unstructured_text(text: str) -> pd.DataFrame:
    """
    Intelligently parse unstructured text into a DataFrame.
    Strategy (in order):
      1. Try tab-separated
      2. Try comma-separated (csv.Sniffer)
      3. Try pipe-separated
      4. Try whitespace-separated
      5. Fall back to single 'content' column (one row per non-empty line)
    """
    lines = [ln for ln in text.splitlines() if ln.strip()]

    if not lines:
        raise HTTPException(status_code=400, detail="Input text is empty.")

    # --- Tab detection ----------------------------------------------------
    if all("\t" in ln for ln in lines[:5]):
        try:
            return pd.read_csv(io.StringIO(text), sep="\t")
        except Exception:
            pass

    # --- Sniffer (comma / semicolon / etc.) ------------------------------
    sample = "\n".join(lines[:20])
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;|")
        df = pd.read_csv(io.StringIO(text), dialect=dialect)
        if len(df.columns) > 1:
            return df
    except csv.Error:
        pass

    # --- Pipe detection --------------------------------------------------
    if all("|" in ln for ln in lines[:5]):
        try:
            df = pd.read_csv(io.StringIO(text), sep=r"\|", engine="python")
            if len(df.columns) > 1:
                return df
        except Exception:
            pass

    # --- Whitespace / fixed-width ----------------------------------------
    if all(re.search(r"\s{2,}", ln) for ln in lines[:5]):
        try:
            df = pd.read_csv(io.StringIO(text), sep=r"\s{2,}", engine="python")
            if len(df.columns) > 1:
                return df
        except Exception:
            pass

    # --- Last resort: one column per line --------------------------------
    return pd.DataFrame({"content": lines})


# ---------------------------------------------------------------------------
# Helper: DataFrame → output bytes
# ---------------------------------------------------------------------------
def dataframe_to_bytes(df: pd.DataFrame, target_format: str) -> bytes:
    buf = io.BytesIO()

    if target_format == "csv":
        return df.to_csv(index=False).encode("utf-8")

    elif target_format == "xlsx":
        with pd.ExcelWriter(buf, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Sheet1")
        return buf.getvalue()

    elif target_format == "parquet":
        table = pa.Table.from_pandas(df, preserve_index=False)
        pq.write_table(table, buf)
        return buf.getvalue()

    elif target_format == "json":
        return df.to_json(orient="records", indent=2).encode("utf-8")

    elif target_format == "txt":
        return df.to_string(index=False).encode("utf-8")

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported target format: {target_format}")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/convert")
async def convert(
    request: Request,
    source_format: str = Form(...),
    target_format: str = Form(...),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    # Validate at least one input
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide either text or a file.")

    # --- Read raw bytes --------------------------------------------------
    if file:
        raw = await file.read()
        if len(raw) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE // (1024*1024)} MB.",
            )
        # Override source format hint from filename extension if possible
        if file.filename:
            ext = file.filename.rsplit(".", 1)[-1].lower()
            if ext in ("csv", "json", "txt", "tsv"):
                source_format = "csv" if ext == "tsv" else ext
    else:
        raw = text.encode("utf-8")

    # --- Parse to DataFrame ----------------------------------------------
    df = bytes_to_dataframe(raw, source_format.lower())

    # --- Convert ---------------------------------------------------------
    output_bytes = dataframe_to_bytes(df, target_format.lower())

    # --- Build filename --------------------------------------------------
    ext_map = {"csv": "csv", "xlsx": "xlsx", "parquet": "parquet", "json": "json", "txt": "txt"}
    ext = ext_map.get(target_format.lower(), target_format.lower())
    output_filename = f"converted.{ext}"
    media_type = MEDIA_TYPES.get(ext, "application/octet-stream")

    return StreamingResponse(
        io.BytesIO(output_bytes),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{output_filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
