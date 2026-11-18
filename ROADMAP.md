# Feature roadmap

## Included baseline
- Image: compress, resize, convert
- PDF: info, merge, extract page range (Python backend)
- Documents: text-to-DOCX, DOCX-to-text, word count
- Magic: local extractive summary; optional API integration point documented
- Daily: JSON formatter, case converter, percentage calculator

## Next implementation queue
### Image Studio
Crop/rotate, watermark, EXIF metadata removal, image-to-PDF, passport photo presets, background removal, palette extraction, upscale.

### PDF Studio
Compress, rotate, reorder, PDF-to-image, image-to-PDF, text extraction, OCR, table extraction.

### Document Studio
CSV conversion, PDF-to-DOCX, DOCX-to-PDF (requires LibreOffice or equivalent server converter), scanner workflow, Hindi/English OCR, formatting.

### Magic Studio
Provider-backed summarization, translation, document Q&A. Use server-side secrets, usage limits, consent and privacy disclosures. Evaluate local models only after device/server requirements are known.

### Daily Utilities
QR generation, unit conversion, date/time utilities, more calculators and developer helpers.
