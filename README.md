# Universal Tools — Suno Saathi Group

A mobile-friendly starter project with five workspaces:
1. Image Studio
2. PDF Studio
3. Document Studio
4. Magic Studio
5. Daily Utilities

## What works in this starter

### Browser-only (no Python server required)
- Image compression (JPEG output)
- Image resizing (PNG output)
- Image format conversion (PNG/JPEG/WebP)
- Word counter
- JSON formatter
- Text case converter
- Percentage calculator
- Basic extractive text summary (runs in the browser; it is not a generative AI model)

### Optional Python backend
- PDF page count
- PDF merge
- PDF page-range extraction
- Text to DOCX
- DOCX to text
- Basic extractive summary endpoint

## Important limitations
This is a foundation, not a finished production-grade clone of every advanced tool. The homepage lists the next planned features honestly. Background removal, high-quality upscaling, OCR, PDF compression, DOCX-to-PDF and real AI translation/summarization need additional models, libraries, system packages or a securely configured provider. They are not falsely presented as completed.

Browser image tools process files locally in the browser. PDF/DOCX backend tools send selected files to the Python server while the operation runs. The starter backend has a 30 MB per-file cap and is intended for local testing, not public deployment as-is.

## Open the website on Android
1. Extract this ZIP into a folder.
2. Open the folder in Spck or another HTML editor.
3. Open `index.html` in its preview/browser.
4. Browser-only tools should work immediately.

For Netlify, upload the extracted project folder (the folder containing `index.html`) or a ZIP of its contents.

## Run the optional Python backend
A computer or Android Python environment capable of installing Python packages is needed. From the `backend` folder:

```bash
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The front end currently calls `http://127.0.0.1:8000`. If the backend runs on a different device/server, change the `API` constant near the top of `assets/js/app.js` to your backend URL. For public deployment, configure CORS to your exact website domain, add authentication/rate limits, HTTPS, file cleanup, and stricter upload controls before enabling uploads.

## Suggested development order
1. Test browser image and daily tools on Android.
2. Run and test the Python backend separately.
3. Add PDF rotate/reorder/compress and image-to-PDF.
4. Add OCR and document conversion.
5. Add a real AI provider on the server only, with clear user consent and privacy disclosures.
6. Add privacy/security review, accessibility, SEO pages and analytics/AdSense only after tool quality is tested.

## Brand
Universal Tools — by Suno Saathi Group.
Fliq remains a separate Android app and is not part of this website.
