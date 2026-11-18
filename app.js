const $ = (id) => document.getElementById(id);
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject; img.src = url;
  });
}
function canvasBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}
function safeName(name, ext) { return (name.replace(/\.[^.]+$/, "") || "image") + "." + ext; }

$("quality").addEventListener("input", e => $("qualityOut").textContent = e.target.value + "%");
$("compressBtn").addEventListener("click", async () => {
  const f = $("imgCompressFile").files[0]; if (!f) return $("compressResult").textContent = "Please choose an image.";
  try {
    const img = await loadImage(f), c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    const blob = await canvasBlob(c, "image/jpeg", Number($("quality").value) / 100);
    if (!blob) throw new Error("This browser could not encode the image.");
    downloadBlob(blob, safeName(f.name, "jpg"));
    const saved = Math.max(0, (1 - blob.size / f.size) * 100);
    $("compressResult").textContent = `Original: ${(f.size/1024).toFixed(1)} KB · New: ${(blob.size/1024).toFixed(1)} KB · Size change: ${saved.toFixed(1)}%`;
  } catch (e) { $("compressResult").textContent = "Could not process this image: " + e.message; }
});
$("resizeBtn").addEventListener("click", async () => {
  const f = $("imgResizeFile").files[0]; if (!f) return $("resizeResult").textContent = "Please choose an image.";
  try {
    const img = await loadImage(f), w = Number($("resizeWidth").value), h = Number($("resizeHeight").value);
    if (!w && !h) return $("resizeResult").textContent = "Enter a width or height.";
    const ratio = img.naturalWidth / img.naturalHeight, width = w || Math.round(h * ratio), height = h || Math.round(w / ratio);
    if (width < 1 || height < 1 || width > 12000 || height > 12000) return $("resizeResult").textContent = "Use dimensions between 1 and 12000 pixels.";
    const c = document.createElement("canvas"); c.width = width; c.height = height; c.getContext("2d").drawImage(img,0,0,width,height);
    const blob = await canvasBlob(c, "image/png"); downloadBlob(blob, safeName(f.name,"png"));
    $("resizeResult").textContent = `Downloaded ${width} × ${height} PNG.`;
  } catch(e) { $("resizeResult").textContent = "Resize failed: " + e.message; }
});
$("convertBtn").addEventListener("click", async () => {
  const f = $("imgConvertFile").files[0]; if (!f) return $("convertResult").textContent = "Please choose an image.";
  try {
    const img = await loadImage(f), c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img,0,0);
    const type = $("imageFormat").value, ext = type.split("/")[1], blob = await canvasBlob(c,type,.92);
    downloadBlob(blob,safeName(f.name,ext)); $("convertResult").textContent = `Converted to ${ext.toUpperCase()} (${(blob.size/1024).toFixed(1)} KB).`;
  } catch(e) { $("convertResult").textContent = "Conversion failed: " + e.message; }
});
$("wordText").addEventListener("input", () => {
  const t = $("wordText").value, words = t.trim() ? t.trim().split(/\s+/).length : 0;
  $("wordCount").textContent = `${words} words · ${t.length} characters · ${t ? t.split(/\r\n|\r|\n/).length : 0} lines`;
});
$("jsonBtn").addEventListener("click", () => {
  try { $("jsonResult").textContent = JSON.stringify(JSON.parse($("jsonInput").value), null, 2); }
  catch(e) { $("jsonResult").textContent = "Invalid JSON: " + e.message; }
});
document.querySelectorAll("[data-case]").forEach(btn => btn.addEventListener("click", () => {
  const t = $("caseInput").value, mode = btn.dataset.case;
  const out = mode === "upper" ? t.toUpperCase() : mode === "lower" ? t.toLowerCase() : t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  $("caseResult").textContent = out;
}));
$("percentBtn").addEventListener("click", () => {
  const p = Number($("percent").value), n = Number($("baseNumber").value);
  if ($("percent").value === "" || $("baseNumber").value === "") return $("percentResult").textContent = "Enter both values.";
  $("percentResult").textContent = `${p}% of ${n} = ${(p*n/100).toLocaleString()}`;
});
$("summaryBtn").addEventListener("click", () => {
  const text = $("summaryInput").value.trim(); if (!text) return $("summaryResult").textContent = "Paste some text first.";
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  if (sentences.length <= 3) return $("summaryResult").textContent = text;
  const words = text.toLowerCase().match(/[a-z0-9]{3,}/g) || [], freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const scored = sentences.map((s,i) => {
    const terms = s.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
    const score = terms.reduce((sum,w) => sum + (freq[w] || 0), 0) / Math.max(1, terms.length);
    return {s:s.trim(),i,score};
  });
  const count = Math.max(2, Math.ceil(sentences.length * .25));
  $("summaryResult").textContent = scored.sort((a,b)=>b.score-a.score).slice(0,count).sort((a,b)=>a.i-b.i).map(x=>x.s).join(" ");
});
const API = "https://steady-vacherin-f70a28.netlify.app"
async function postFile(path, file, extra={}) {
  const fd = new FormData(); fd.append("file",file);
  Object.entries(extra).forEach(([k,v])=>fd.append(k,v));
  const r = await fetch(API+path,{method:"POST",body:fd});
  if (!r.ok) throw new Error(await r.text());
  return r;
}
$("mergeBtn").addEventListener("click", async () => {
  const fs = [...$("mergeFiles").files]; if(fs.length<2) return $("mergeResult").textContent="Select at least two PDF files.";
  const fd=new FormData(); fs.forEach(f=>fd.append("files",f));
  try { const r=await fetch(API+"/pdf/merge",{method:"POST",body:fd}); if(!r.ok) throw new Error(await r.text()); downloadBlob(await r.blob(),"merged.pdf"); $("mergeResult").textContent="Merged PDF downloaded."; }
  catch(e){ $("mergeResult").textContent="Backend unavailable or operation failed: "+e.message; }
});
$("pdfInfoBtn").addEventListener("click", async () => {
  const f=$("pdfInfoFile").files[0]; if(!f) return $("pdfInfoResult").textContent="Choose a PDF.";
  try { const r=await postFile("/pdf/info",f), j=await r.json(); $("pdfInfoResult").textContent=`${j.pages} pages · ${(j.size/1024).toFixed(1)} KB`; }
  catch(e){ $("pdfInfoResult").textContent="Backend unavailable or invalid PDF: "+e.message; }
});
$("splitBtn").addEventListener("click", async () => {
  const f=$("splitFile").files[0]; if(!f) return $("splitResult").textContent="Choose a PDF.";
  try { const r=await postFile("/pdf/split",f,{start_page:$("splitFrom").value,end_page:$("splitTo").value}); downloadBlob(await r.blob(),"extracted-pages.pdf"); $("splitResult").textContent="Extracted PDF downloaded."; }
  catch(e){ $("splitResult").textContent="Backend unavailable or operation failed: "+e.message; }
});
$("docxBtn").addEventListener("click", async () => {
  const fd=new FormData(); fd.append("text",$("docxText").value);
  try { const r=await fetch(API+"/documents/text-to-docx",{method:"POST",body:fd}); if(!r.ok) throw new Error(await r.text()); downloadBlob(await r.blob(),"document.docx"); $("docxResult").textContent="DOCX downloaded."; }
  catch(e){ $("docxResult").textContent="Backend unavailable or operation failed: "+e.message; }
});
$("docxReadBtn").addEventListener("click", async () => {
  const f=$("docxFile").files[0]; if(!f) return $("docxReadResult").textContent="Choose a DOCX file.";
  try { const r=await postFile("/documents/docx-to-text",f), j=await r.json(); $("docxReadResult").textContent=j.text || "(No paragraph text found)"; }
  catch(e){ $("docxReadResult").textContent="Backend unavailable or operation failed: "+e.message; }
});
