// docx2pdf.js
async function renderdocx2pdf(container) {
    try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Convert Word documents to PDF with perfect formatting – preserves tables, images, and headings. 100% private, no uploads.");
    updatePageTitle("DOCX to PDF Converter");

    area.innerHTML = `
        <h3>📂 Upload .docx</h3>
        <p class="tool-description">
            Convert Word documents to PDF while preserving formatting, tables, and images.
            Ideal for sharing resumes, reports, and contracts securely.
            After conversion, you can also <a href="pdf2jpg.html" target="_self">extract images</a> from the resulting PDF.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>Will my formatting be preserved?</summary>
                <p>We use Mammoth.js to preserve tables, images, and headings as closely as possible.</p>
            </details>
        </div>
        <div id="docxDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .docx file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="docxFile" accept=".docx" style="display: none;">
        </div>
        <div id="docxStats" style="display:none; text-align:right; margin-bottom: 1rem; color: var(--text-light); font-size: 0.9rem;">
            File Size: <span id="docxSize">0 Bytes</span>
        </div>
            <label>📐 Page size: <select id="docxPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label>🔄 Orientation: <select id="docxOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        </div>
        <div style="margin:1rem 0;"><label><input type="checkbox" id="detectHeadings" checked> 🔍 Convert # style headings</label></div>
        <div class="preview-box"><div id="docxPreview">preview area</div></div>
        <button id="printDocxBtn" class="secondary">🖨️ Print / Save as PDF</button>
    `;

    const fileIn = document.getElementById('docxFile');
    const docxDropZone = document.getElementById('docxDropZone');
    const docxStats = document.getElementById('docxStats');
    const docxSize = document.getElementById('docxSize');
    const previewDiv = document.getElementById('docxPreview');
    const sizeSel = document.getElementById('docxPageSize');
    const orientSel = document.getElementById('docxOrientation');
    const detectHeadings = document.getElementById('detectHeadings');
    const printBtn = document.getElementById('printDocxBtn');

    // Setup drag and drop
    docxDropZone.addEventListener('click', () => fileIn.click());
    if (typeof setupDropZone === 'function') {
        setupDropZone('docxDropZone', 'docxFile');
    }

    const docxPrintStyles = `
        <style>
            .docx-body { font-family: 'Calibri', 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2c3e50; max-width: 1000px; margin: 0 auto; padding: 2rem; }
            .docx-body h1 { font-size: 28px; color: #1e2b4f; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; page-break-after: avoid; }
            .docx-body h2 { font-size: 24px; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px; page-break-after: avoid; }
            .docx-body h3 { font-size: 20px; color: #34495e; margin-top: 20px; margin-bottom: 10px; page-break-after: avoid; }
            .docx-body p { margin: 0 0 1rem; orphans: 3; widows: 3; }
            .docx-body code, .docx-body pre { font-family: 'Consolas', monospace; background: #f4f4f4; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 0.9em; }
            .docx-body pre { padding: 15px; overflow-x: auto; page-break-inside: avoid; }
            .docx-body table { border-collapse: collapse; width: 100%; margin: 20px 0; page-break-inside: avoid; box-shadow: 0 2px 3px rgba(0,0,0,0.1); }
            .docx-body th { background: #3498db; color: white; padding: 12px; border: 1px solid #2980b9; }
            .docx-body td { padding: 10px 12px; border: 1px solid #ddd; }
            .docx-body tr:nth-child(even) { background: #f8f9fa; }
            @page { margin: 2.54cm; size: auto; }
            @media print { body { margin: 0; padding: 0; background: white; } }
        </style>
    `;

    function enhanceHeadings(html) {
        if (!detectHeadings.checked) return html;
        return html.replace(/<p>(#{1,6})\s+(.*?)<\/p>/g, (m, h, c) => `<h${h.length}>${c}</h${h.length}>`);
    }

    fileIn.addEventListener('change', async () => {
        const f = fileIn.files[0];
        if (!f) return;

        docxStats.style.display = 'block';
        docxSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(f.size) : f.size + " bytes";

        previewDiv.innerHTML = '<div style="text-align:center; padding: 2rem;"><span style="font-size: 2rem;">⌛</span><br>Converting DOCX to HTML for preview...</div>';

        try {
            const buf = await f.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: buf });

            // Mammoth warnings
            if (result.messages && result.messages.length > 0) {
                console.warn("Mammoth conversion warnings:", result.messages);
            }

            let html = enhanceHeadings(result.value);
            previewDiv.innerHTML = docxPrintStyles + `<div class="docx-body">${html}</div>`;
            window.currentDocxHtml = html;
        } catch (e) {
            previewDiv.innerHTML = `<div style="color:#e74c3c; padding:1rem; border:1px solid #fadbd8; background:#fdedec; border-radius:8px;">Error converting file: ${e.message}</div>`;
            if (window.showToast) showToast('Failed to read DOCX file.', 'error');
        }
    });

    printBtn.addEventListener('click', async () => {
        const f = fileIn.files[0];
        if (!f || !window.currentDocxHtml) {
            if (window.showToast) showToast('Please select and convert a DOCX file first.', 'warning');
            else alert('Select a DOCX file');
            return;
        }

        printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';

        try {
            const html = window.currentDocxHtml;
            const fullHtml = `<!DOCTYPE html><html><head><title>${f.name} - Print</title>${docxPrintStyles}
<style>
@page { size: ${sizeSel.value} ${orientSel.value}; margin: 2.54cm; }
</style>
</head><body><div class="docx-body">${html}</div><script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script></body></html>`;
            const win = window.open('', '_blank');
            if (!win) {
                if (window.showToast) showToast('Pop‑up blocked. Allow pop-ups to print/save.', 'error');
                else alert('Pop‑up blocked');
                printBtn.disabled = false;
                printBtn.innerHTML = '🖨️ Print / Save as PDF';
                return;
            }
            win.document.write(fullHtml); win.document.close();
            setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; }, 3000);
        } catch (e) {
            if (window.showToast) showToast('Error: ' + e.message, 'error');
            else alert('Error: ' + e.message);
            printBtn.disabled = false;
            printBtn.innerHTML = '🖨️ Print / Save as PDF';
        }
    });
    } catch (___err) {
        console.error('renderdocx2pdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}
