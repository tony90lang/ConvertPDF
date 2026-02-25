// txt2docx.js
function rendertxt2docx(container) {
    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Convert plain text to formatted Word documents with custom fonts, size, and line spacing. 100% private, no uploads.");
    updatePageTitle("TXT to DOCX Converter");

    area.innerHTML = `
        <h3>📄 Upload .txt file</h3>
        <p class="tool-description">
            Convert plain text to a formatted Word document. Choose font, size, and line spacing.
            Great for preparing drafts or converting code comments to documentation.
            After conversion, you can also <a href="#tool=web2pdf" target="_self">turn it into PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div class="flex-row"><input type="file" id="txtFile" accept=".txt"></div>
        <div class="formatting-controls">
            <h4>Formatting Options</h4>
            <div style="display:flex; gap:1rem; flex-wrap:wrap; margin:1rem 0;">
                <select id="txtFont"><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Calibri" selected>Calibri</option><option value="Courier New">Courier New</option></select>
                <select id="txtFontSize"><option value="10">10pt</option><option value="11" selected>11pt</option><option value="12">12pt</option><option value="14">14pt</option></select>
                <select id="txtLineSpacing"><option value="1.0">Single</option><option value="1.15">1.15</option><option value="1.5">1.5</option><option value="2.0">Double</option></select>
                <label><input type="checkbox" id="txtDetectHeadings" checked> Detect # headings</label>
            </div>
        </div>
        <button id="convertTxtBtn" class="primary">📝 → 📘 Convert to DOCX</button>
        <div class="preview-box"><div class="preview-title">Preview</div><pre id="txtPreview" style="white-space: pre-wrap; overflow: auto; max-height: 300px;"></pre></div>
        <button id="downloadDocxBtn" class="download-btn" disabled>⬇ Download DOCX</button>
    `;

    const txtFile = document.getElementById('txtFile');
    const txtFont = document.getElementById('txtFont');
    const txtFontSize = document.getElementById('txtFontSize');
    const txtLineSpacing = document.getElementById('txtLineSpacing');
    const txtDetectHeadings = document.getElementById('txtDetectHeadings');
    const convertBtn = document.getElementById('convertTxtBtn');
    const downloadBtn = document.getElementById('downloadDocxBtn');
    const previewTxt = document.getElementById('txtPreview');
    let currentDocxBlob = null;
    let currentText = '';

    txtFile.addEventListener('change', async () => {
        const file = txtFile.files[0];
        if (!file) return;
        currentText = await file.text();
        previewTxt.textContent = currentText;
    });

    convertBtn.addEventListener('click', async () => {
        if (!currentText) { alert('Select a text file'); return; }
        convertBtn.disabled = true; convertBtn.innerHTML = '⏳ Converting...';
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
            const lines = currentText.split('\n');
            const children = [];
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                if (txtDetectHeadings.checked) {
                    if (line.startsWith('# ')) {
                        children.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));
                        continue;
                    } else if (line.startsWith('## ')) {
                        children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }));
                        continue;
                    }
                }
                children.push(new Paragraph({
                    children: [new TextRun({ text: line, font: txtFont.value, size: parseInt(txtFontSize.value)*2 })],
                    spacing: { line: Math.round(parseFloat(txtLineSpacing.value)*240), after: 120 }
                }));
            }
            const doc = new Document({ sections: [{ children }] });
            currentDocxBlob = await Packer.toBlob(doc);
            downloadBtn.disabled = false;
        } catch (e) { alert('Conversion failed: ' + e.message); } finally {
            convertBtn.disabled = false; convertBtn.innerHTML = '📝 → 📘 Convert to DOCX';
        }
    });

    downloadBtn.addEventListener('click', () => { if (currentDocxBlob) downloadBlob(currentDocxBlob, 'text-to-word.docx'); });
}