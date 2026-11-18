from io import BytesIO
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
from docx import Document

app = FastAPI(title="Suno Saathi Universal Tools API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your deployed domain before production.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = 30 * 1024 * 1024  # Starter safety cap: 30 MB per file.

async def read_limited(upload: UploadFile) -> bytes:
    data = await upload.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File exceeds the 30 MB starter upload limit.")
    return data

@app.get("/")
def root():
    return {"service": "Suno Saathi Universal Tools API", "status": "running"}

@app.post("/pdf/info")
async def pdf_info(file: UploadFile = File(...)):
    data = await read_limited(file)
    try:
        reader = PdfReader(BytesIO(data))
        return {"filename": file.filename, "pages": len(reader.pages), "size": len(data)}
    except Exception:
        raise HTTPException(400, "Could not read this PDF.")

@app.post("/pdf/merge")
async def pdf_merge(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "Select at least two PDF files.")
    writer = PdfWriter()
    try:
        for upload in files:
            data = await read_limited(upload)
            reader = PdfReader(BytesIO(data))
            for page in reader.pages:
                writer.add_page(page)
        output = BytesIO()
        writer.write(output)
        output.seek(0)
        return StreamingResponse(output, media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="merged.pdf"'})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Could not merge the supplied PDFs.")

@app.post("/pdf/split")
async def pdf_split(file: UploadFile = File(...), start_page: int = Form(...), end_page: int = Form(...)):
    data = await read_limited(file)
    try:
        reader = PdfReader(BytesIO(data))
        if start_page < 1 or end_page < start_page or end_page > len(reader.pages):
            raise HTTPException(400, f"Enter a valid page range from 1 to {len(reader.pages)}.")
        writer = PdfWriter()
        for index in range(start_page - 1, end_page):
            writer.add_page(reader.pages[index])
        output = BytesIO()
        writer.write(output)
        output.seek(0)
        return StreamingResponse(output, media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="extracted-pages.pdf"'})
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Could not split this PDF.")

@app.post("/documents/text-to-docx")
async def text_to_docx(text: str = Form(...)):
    if len(text) > 500_000:
        raise HTTPException(413, "Text is too long for this starter tool.")
    doc = Document()
    for paragraph in text.splitlines():
        doc.add_paragraph(paragraph)
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return StreamingResponse(output,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": 'attachment; filename="document.docx"'})

@app.post("/documents/docx-to-text")
async def docx_to_text(file: UploadFile = File(...)):
    data = await read_limited(file)
    try:
        doc = Document(BytesIO(data))
        text = "\n".join(p.text for p in doc.paragraphs)
        return {"text": text}
    except Exception:
        raise HTTPException(400, "Could not read this DOCX document.")

@app.post("/magic/summarize")
async def magic_summarize(text: str = Form(...)):
    """Basic extractive summary; no external AI model or provider is used."""
    words = text.split()
    if len(words) < 50:
        return {"summary": text, "mode": "short-text"}
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    if not sentences:
        return {"summary": text[:1000], "mode": "fallback"}
    # Transparent baseline heuristic. For production AI, connect a server-side provider securely.
    selected = sentences[:max(2, min(5, len(sentences)//4))]
    return {"summary": ". ".join(selected) + ".", "mode": "basic-extractive"}
