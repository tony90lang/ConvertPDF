# ConvertPDF – Free, Private, Client‑Side PDF Toolkit

🚀 **Convert PDFs, documents, and images entirely in your browser – no uploads, no servers, no privacy risks.**

👉 **Live site:** [convert-pdf-tool.netlify.app](https://convert-pdf-tool.netlify.app)

---

## ✨ Features & Tools

ConvertPDF offers a comprehensive suite of tools designed to handle your documents securely:

| Tool | Description |
|------|-------------|
| **📝 Markdown → PDF** | Convert Markdown into beautifully formatted PDFs directly in the browser. Supports LaTeX math, code syntax highlighting, and custom page breaks (`\newpage`). |
| **📃 DOCX → PDF** | Convert Word documents (.docx) to PDF while preserving tables, images, and formatting. |
| **🖼️ Images → PDF** | Combine multiple JPG/PNG images into a single, cohesive PDF document. Features auto‑orientation and page size control. |
| **🔐 PDF Password Protect** | Secure your PDFs with AES-256 encryption. Set permissions for printing, copying, and modifications. |
| **🧩 Merge PDFs** | Combine multiple PDF files into one. Simply drag and drop to reorder files before merging. |
| **📄 TXT → DOCX** | Convert plain text files to formatted Word documents. Customize font, size, line spacing, and auto-detect headings. |
| **📸 PDF → JPG** | Extract pages from PDFs as high-quality JPG images. Choose specific page ranges and download as a ZIP file. |
| **🎨 Any Image → PNG** | Convert any image format (JPG, GIF, BMP, WebP) to a lossless PNG. |
| **🌐 HTML → PDF** | Turn HTML snippets into printable PDFs with full CSS styling support. |
| **🔳 QR Code Generator** | Create custom QR codes with colors, error correction, and optional logos. Download in PNG or SVG format. |

### Why ConvertPDF?
✅ **100% Private:** All processing happens entirely within your browser natively. Your files *never* leave your device.  
✅ **Unlimited Use:** No file size limits, no daily quotas, no sign-up required, and absolutely no cost.  
✅ **Works Offline:** Once the page loads, the core functionality works completely offline!

---

## 🛠️ Tech Stack

ConvertPDF is built using modern web technologies to ensure speed, security, and a seamless developer experience:

- **HTML5 / CSS3 / Vanilla JavaScript** – Lightweight, responsive, mobile‑first design without heavy frameworks.
- **PDF-Lib** – For creating, merging, and encrypting PDFs.
- **Mammoth.js** – For converting DOCX files to HTML.
- **Marked** & **KaTeX** & **Prism.js** – For parsing Markdown, rendering complex LaTeX math, and styling code blocks.
- **QRCode** & **JSZip** – For generating QR codes and bundling files into ZIP archives.
- **Netlify / Vercel** – Hosted for blazing-fast CDN delivery and automatic HTTPS.

---

## 🚀 Getting Started (Run Locally)

Want to contribute or run ConvertPDF on your own machine? It's easy!

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari). No Node.js backend required!

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/tony90lang/ConvertPDF.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ConvertPDF
   ```
3. Open `index.html` in your browser, or start a local web server (e.g. using `serve` or VS Code Live Server).

---

## 🤝 Contributing

We welcome contributions! ConvertPDF is an open-source project driven by the community. 

- Found a bug? [Open an issue](https://github.com/tony90lang/ConvertPDF/issues).
- Have a feature request? Let us know!
- Want to write code? Submit a pull request. We have issues tagged `good first issue` to help you get started.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

*Note: The ConvertPDF name and logo are provided for use within this project; please use them respectfully.*
