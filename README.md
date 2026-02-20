# ConvertPDF – Free, Private, Client‑Side PDF Toolkit

🚀 **Convert PDFs, documents, and images entirely in your browser – no uploads, no servers, no privacy risks.**

👉 **Live site:** [convert-pdf-self.vercel.app](https://convert-pdf-self.vercel.app)

---

## ✨ Features

| Tool | Description |
|------|-------------|
| **📝 Markdown → PDF** | Convert Markdown to beautifully formatted PDFs with LaTeX math, syntax highlighting, and custom page breaks (`\newpage` or `<!-- pagebreak -->`). |
| **📃 DOCX → PDF** | Preserve tables, images, and headings from Word documents. Optional detection of `#` style headings. |
| **🖼️ Images → PDF** | Combine multiple JPG/PNG images into a single PDF. Auto‑orientation and page size control. |
| **🔐 PDF Password** | Encrypt PDFs with a password. Set permissions for printing, copying, and modifying. |
| **🧩 Merge PDFs** | Combine multiple PDFs into one. Drag to reorder files before merging. |
| **📄 TXT → DOCX** | Convert plain text to formatted Word documents. Choose font, size, line spacing, and detect headings. |
| **📸 PDF → JPG** | Extract images from PDF pages. Choose first page, all pages, or a custom range (e.g., `1-3,5,7-9`). Download as ZIP. |
| **🎨 Any Image → PNG** | Convert any image (JPG, GIF, BMP) to PNG with lossless quality. |
| **🌐 HTML → PDF** | Turn HTML snippets into printable PDFs with full CSS support. |
| **🔳 QR Code Generator** | Create custom QR codes with colors, error correction, and optional logo. Download as PNG or SVG. |

✅ **100% private** – all processing happens in your browser. Files never leave your device.  
✅ **No sign‑up, no cost, no ads** (except optional AdSense).  
✅ **Works offline** – once loaded, the entire app runs locally.

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** – responsive, mobile‑first design
- **Vanilla JavaScript** – no frameworks, just pure JS
- **PDF.js** – render PDF pages to canvas
- **PDF‑Lib** – create, merge, and encrypt PDFs
- **Mammoth.js** – convert DOCX to HTML
- **Marked** – Markdown to HTML conversion
- **KaTeX** – render LaTeX math
- **Prism.js** – syntax highlighting for code blocks
- **QRCode** – generate QR codes with custom options
- **JSZip** – bundle multiple images into a ZIP file
- **Vercel** – hosting with automatic HTTPS and CDN

---

## 🚀 Getting Started (for developers)

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/tony90lang/ConvertPDF.git
