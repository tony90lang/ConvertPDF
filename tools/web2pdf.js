// web2pdf.js
function renderweb2pdf(container) {
    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Turn HTML code into a printable PDF with full CSS support. 100% private, no uploads.");
    updatePageTitle("HTML to PDF Converter");

    area.innerHTML = `
        <h3>🌐 HTML snippet to PDF</h3>
        <p class="tool-description">
            Turn HTML code into a printable PDF. Full CSS support – perfect for invoices, reports, or saving web content.
            After generating your PDF, you can also <a href="#tool=pdfencrypt" target="_self">password‑protect</a> it.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <textarea id="htmlSnippet" rows="8" style="width:100%; border-radius:25px; padding:1rem;"><h1>Hello</h1><p>type HTML here</p></textarea><br><br>
        <div class="orientation-selector">
            <label>📐 Page size: <select id="htmlPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label>🔄 Orientation: <select id="htmlOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        </div>
        <div class="preview-box"><div id="htmlRenderPreview"></div></div>
        <button id="printHtmlBtn" class="secondary">🖨️ Print / Save as PDF</button>
    `;

    const textarea = document.getElementById('htmlSnippet');
    const previewDiv = document.getElementById('htmlRenderPreview');
    const sizeSel = document.getElementById('htmlPageSize');
    const orientSel = document.getElementById('htmlOrientation');
    const printBtn = document.getElementById('printHtmlBtn');

    textarea.addEventListener('input', () => { previewDiv.innerHTML = textarea.value; });
    printBtn.addEventListener('click', () => {
        const html = textarea.value.trim();
        if (!html) { alert('Enter HTML'); return; }
        printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';
        const fullHtml = `<!DOCTYPE html><html><head><title>HTML Print</title><style>body{font-family:sans-serif; line-height:1.6; color:#24292e; max-width:900px; margin:2rem auto; padding:0 2rem;} @media print{body{margin:2.54cm;}}</style></head><body>${html}<script>setTimeout(()=>window.print(),500);<\/script></body></html>`;
        const win = window.open('', '_blank');
        if (!win) { alert('Pop‑up blocked'); printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; return; }
        win.document.write(fullHtml); win.document.close();
        setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; }, 2000);
    });
}