// script.js – tool definitions (used by index.html only)

// ---------- TOOL DEFINITIONS ----------
const tools = [
    { id: 'md2pdf', name: '📝 Markdown → PDF', desc: 'convert .md to formatted PDF', icon: '📝', url: 'pages/md2pdf.html' },
    { id: 'docx2pdf', name: '📃 DOCX → PDF', desc: 'Word documents to PDF', icon: '📃', url: 'pages/docx2pdf.html' },
    { id: 'img2pdf', name: '🖼️ Images → PDF', desc: 'JPG/PNG to single PDF', icon: '🖼️', url: 'pages/img2pdf.html' },
    { id: 'pdfencrypt', name: '🔐 PDF Password', desc: 'protect PDF with encryption', icon: '🔐', url: 'pages/pdfencrypt.html' },
    { id: 'mergepdf', name: '🧩 Merge PDFs', desc: 'combine multiple PDF files', icon: '🧩', url: 'pages/mergepdf.html' },
    { id: 'txt2docx', name: '📄 TXT → DOCX', desc: 'plain text to Word file', icon: '📄', url: 'pages/txt2docx.html' },
    { id: 'pdf2jpg', name: '📸 PDF → JPG', desc: 'extract pages as images', icon: '📸', url: 'pages/pdf2jpg.html' },
    { id: 'img2png', name: '🎨 Any image → PNG', desc: 'convert to PNG format', icon: '🎨', url: 'pages/img2png.html' },
    { id: 'web2pdf', name: '🌐 HTML → PDF', desc: 'paste HTML snippet to PDF', icon: '🌐', url: 'pages/web2pdf.html' },
    { id: 'qrmaker', name: '📱 QR Code', desc: 'text/link → QR code PNG/SVG', icon: '📱', url: 'pages/qrmaker.html' }
];

// Render tool cards on index.html
const grid = document.getElementById('toolGrid');
if (grid) {
    tools.forEach(t => {
        const card = document.createElement('a');
        card.href = t.url;
        card.className = 'tool-card';
        card.innerHTML = `<div class="tool-icon">${t.icon}</div>
                          <div class="tool-name">${t.name}</div>
                          <div class="tool-desc">${t.desc}</div>`;
        grid.appendChild(card);
    });
}