// txt2docx.js
async function rendertxt2docx(container) {
    await loadScript('https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js');

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
            After conversion, you can also <a href="web2pdf.html" target="_self">turn it into PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div id="txtDocxDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📝➕⬇️</div>
            <p>Drag and drop a .txt file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="txtFile" accept=".txt" style="display: none;">
        </div>
        
        <div id="txtStats" style="display:flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-light); font-size: 0.9rem;">
            <span id="txtWordCount">0 words | 0 chars</span>
            <span id="txtSize">0 Bytes</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-direction: column;">
                <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">Text Editor</div>
                <textarea id="txtEditor" spellcheck="false" placeholder="Type or paste plain text here..." style="flex: 1; min-height: 300px; resize: vertical; padding: 1rem; font-family: monospace; border: 1px solid var(--border-medium); border-radius: var(--radius-md); background: #fdfdfd;"></textarea>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">Formatting Options</div>
                <div class="formatting-controls" style="flex: 1; margin: 0; display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.3rem;">Font Family:</label>
                        <select id="txtFont" style="width: 100%;">
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Calibri" selected>Calibri</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.3rem;">Font Size:</label>
                        <select id="txtFontSize" style="width: 100%;">
                            <option value="10">10pt</option>
                            <option value="11" selected>11pt</option>
                            <option value="12">12pt</option>
                            <option value="14">14pt</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.3rem;">Line Spacing:</label>
                        <select id="txtLineSpacing" style="width: 100%;">
                            <option value="1.0">Single</option>
                            <option value="1.15">1.15</option>
                            <option value="1.5">1.5</option>
                            <option value="2.0">Double</option>
                        </select>
                    </div>
                    <label style="display: flex; align-items: center; gap: 0.5rem; margin-top: auto; cursor: pointer;">
                        <input type="checkbox" id="txtDetectHeadings" checked> <span>Detect <code>#</code> style headings</span>
                    </label>
                </div>
            </div>
        </div>
        <button id="convertTxtBtn" class="primary">📝 → 📘 Convert to DOCX</button>
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button id="downloadDocxBtn" class="download-btn" disabled>⬇ Download DOCX</button>
    `;

    const txtFile = document.getElementById('txtFile');
    const txtDropZone = document.getElementById('txtDocxDropZone');
    const txtEditor = document.getElementById('txtEditor');
    const txtWordCount = document.getElementById('txtWordCount');
    const txtSize = document.getElementById('txtSize');
    const txtFont = document.getElementById('txtFont');
    const txtFontSize = document.getElementById('txtFontSize');
    const txtLineSpacing = document.getElementById('txtLineSpacing');
    const txtDetectHeadings = document.getElementById('txtDetectHeadings');
    const convertBtn = document.getElementById('convertTxtBtn');
    const downloadBtn = document.getElementById('downloadDocxBtn');
    let currentDocxBlob = null;

    // Setup drag and drop
    txtDropZone.addEventListener('click', () => txtFile.click());
    if (typeof setupDropZone === 'function') {
        setupDropZone('txtDocxDropZone', 'txtFile');
    }

    function updateStats() {
        const text = txtEditor.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        txtWordCount.textContent = `${words.toLocaleString()} words | ${chars.toLocaleString()} chars`;

        // Disable convert if empty
        convertBtn.disabled = chars === 0;
    }

    txtEditor.addEventListener('input', () => {
        updateStats();
        // Clear size if edited manually
        if (!txtFile.files || txtFile.files.length === 0) {
            txtSize.textContent = '';
        }
    });

    txtFile.addEventListener('change', async () => {
        const file = txtFile.files[0];
        if (!file) return;

        txtSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(file.size) : file.size + " bytes";

        try {
            const text = await file.text();
            txtEditor.value = text;
            updateStats();
        } catch (e) {
            if (window.showToast) showToast('Failed to read file: ' + e.message, 'error');
            console.error(e);
        }
    });

    // Initialize stats
    updateStats();

    convertBtn.addEventListener('click', async () => {
        const textToConvert = txtEditor.value;
        if (!textToConvert.trim()) {
            if (window.showToast) showToast('Enter text or a upload a text file.', 'warning');
            else alert('Select a text file');
            return;
        }
        convertBtn.disabled = true; convertBtn.innerHTML = '⏳ Converting...';
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
            const lines = textToConvert.split('\n');
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
                    children: [new TextRun({ text: line, font: txtFont.value, size: parseInt(txtFontSize.value) * 2 })],
                    spacing: { line: Math.round(parseFloat(txtLineSpacing.value) * 240), after: 120 }
                }));
            }
            const doc = new Document({ sections: [{ children }] });
            currentDocxBlob = await Packer.toBlob(doc);
            downloadBtn.disabled = false;

            if (window.showToast) showToast('Successfully converted text to DOCX!');
        } catch (e) {
            if (window.showToast) showToast('Conversion failed: ' + e.message, 'error');
            else alert('Conversion failed: ' + e.message);
            console.error(e);
        } finally {
            convertBtn.disabled = false; convertBtn.innerHTML = '📝 → 📘 Convert to DOCX';
        }
    });

    downloadBtn.addEventListener('click', () => { if (currentDocxBlob) downloadBlob(currentDocxBlob, 'text-to-word.docx'); });
}