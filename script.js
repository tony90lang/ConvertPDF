// script.js – final version with all fixes
(function() {
    // ---------- TOOL DEFINITIONS ----------
    const tools = [
        { id: 'md2pdf', name: '📝 Markdown → PDF', desc: 'convert .md to formatted PDF', icon: '📄➡️📑', group: 'core' },
        { id: 'docx2pdf', name: '📃 DOCX → PDF', desc: 'Word documents to PDF', icon: '📘➡️📕', group: 'core' },
        { id: 'img2pdf', name: '🖼️ Images → PDF', desc: 'JPG/PNG to single PDF', icon: '🌠➡️📇', group: 'core' },
        { id: 'pdfencrypt', name: '🔐 PDF password', desc: 'protect PDF with encryption', icon: '🔒📎', group: 'core' },
        { id: 'mergepdf', name: '🧩 Merge PDFs', desc: 'combine multiple PDF files', icon: '🔗📚', group: 'core' },
        { id: 'txt2docx', name: '📄 TXT → DOCX', desc: 'plain text to Word file', icon: '📋➡️📙', group: 'core' },
        { id: 'pdf2jpg', name: '📸 PDF → JPG', desc: 'extract pages as images', icon: '📑➡️🌄', group: 'extra' },
        { id: 'img2png', name: '🎨 Any image → PNG', desc: 'convert to PNG format', icon: '🖼️➡️📸', group: 'extra' },
        { id: 'web2pdf', name: '🌐 HTML → PDF', desc: 'paste HTML snippet to PDF', icon: '🕸️➡️📜', group: 'extra' },
        { id: 'qrmaker', name: '📱 QR code', desc: 'text/link → QR code PNG/SVG', icon: '🔳⬇️', group: 'extra' }
    ];

    // render home cards
    const grid = document.getElementById('toolGrid');
    tools.forEach(t => {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.setAttribute('data-tool', t.id);
        card.innerHTML = `<div class="tool-icon">${t.icon}</div>
                <div class="tool-name">${t.name}</div>
                <div class="tool-desc">${t.desc}</div>`;
        card.addEventListener('click', (e) => {
            const url = new URL(window.location.href);
            url.hash = `tool=${t.id}`;
            window.open(url.toString(), '_blank');
        });
        grid.appendChild(card);
    });

    // ---------- HASH ROUTING ----------
    const homeSection = document.getElementById('homeSection');
    const toolPanel = document.getElementById('toolPanel');
    const toolTitle = document.getElementById('toolTitle');
    const toolContent = document.getElementById('toolContent');
    const backBtn = document.getElementById('backToHomeBtn');

    function showHome() { homeSection.classList.remove('hidden'); toolPanel.classList.add('hidden'); }
    function showTool(id) {
        homeSection.classList.add('hidden');
        toolPanel.classList.remove('hidden');
        const tool = tools.find(t => t.id === id);
        if (!tool) return;
        toolTitle.innerText = tool.name;
        renderToolInterface(id);
    }

    backBtn.addEventListener('click', () => {
        window.location.hash = '';
        showHome();
    });

    function parseHash() {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('tool=')) {
            const toolId = hash.replace('tool=', '');
            showTool(toolId);
        } else {
            showHome();
        }
    }
    window.addEventListener('hashchange', parseHash);
    parseHash();

    // ---------- HELPER: download blob ----------
    function downloadBlob(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // ---------- PDF.js worker setup ----------
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // ---------- RENDER TOOL INTERFACES ----------
    function renderToolInterface(toolId) {
        const container = toolContent;
        container.innerHTML = '';

        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

        // ==================== MARKDOWN → PDF ====================
        if (toolId === 'md2pdf') {
            area.innerHTML = `
                <h3>📂 Upload .md file</h3>
                <div class="flex-row">
                    <input type="file" id="mdFile" accept=".md,text/markdown">
                </div>
                <div class="orientation-selector">
                    <label>📐 Page size: 
                        <select id="mdPageSize">
                            <option value="a4">A4</option>
                            <option value="letter">Letter</option>
                            <option value="legal">Legal</option>
                        </select>
                    </label>
                    <label>🔄 Orientation: 
                        <select id="mdOrientation">
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </label>
                    <label>🎨 Theme: 
                        <select id="mdTheme">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </label>
                </div>
                <div class="preview-box">
                    <div class="preview-title">Markdown preview</div>
                    <div id="mdRendered"></div>
                </div>
                <button id="printMdBtn" class="secondary">🖨️ Print / Save as PDF</button>
                <p class="note">💡 Insert page breaks using <code>\\newpage</code> or <code>&lt;!-- pagebreak --&gt;</code></p>
            `;

            const mdFile = document.getElementById('mdFile');
            const mdRendered = document.getElementById('mdRendered');
            const sizeSelect = document.getElementById('mdPageSize');
            const orientSelect = document.getElementById('mdOrientation');
            const themeSelect = document.getElementById('mdTheme');
            const printBtn = document.getElementById('printMdBtn');

            const printStyles = (theme) => `
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: ${theme === 'dark' ? '#e6e6e6' : '#24292e'};
                        background: ${theme === 'dark' ? '#1e1e1e' : 'white'};
                        max-width: 900px;
                        margin: 2rem auto;
                        padding: 0 2rem;
                    }
                    h1, h2, h3, h4, h5, h6 { 
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                        font-weight: 600;
                        line-height: 1.25;
                        color: inherit;
                        page-break-after: avoid;
                    }
                    h1 { font-size: 2em; border-bottom: 1px solid ${theme === 'dark' ? '#30363d' : '#eaecef'}; padding-bottom: 0.3rem; }
                    h2 { font-size: 1.5em; border-bottom: 1px solid ${theme === 'dark' ? '#444' : '#ccc'}; padding-bottom: 0.3rem; }
                    p { margin: 0 0 1rem; orphans: 3; widows: 3; }
                    code, pre { font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 0.9rem; background: ${theme === 'dark' ? '#2d2d2d' : '#f6f8fa'}; border-radius: 3px; }
                    code { padding: 0.2rem 0.4rem; color: ${theme === 'dark' ? '#e6e6e6' : '#24292e'}; }
                    pre { padding: 1rem; overflow: auto; line-height: 1.45; background: ${theme === 'dark' ? '#2d2d2d' : '#f6f8fa'}; border-radius: 6px; page-break-inside: avoid; }
                    pre code { background: none; padding: 0; color: ${theme === 'dark' ? '#e6e6e6' : '#24292e'}; }
                    table { border-collapse: collapse; width: 100%; margin: 1rem 0; page-break-inside: avoid; }
                    th, td { border: 1px solid ${theme === 'dark' ? '#444c56' : '#dfe2e5'}; padding: 0.6rem 1rem; text-align: left; }
                    th { background: ${theme === 'dark' ? '#2d333b' : '#f6f8fa'}; font-weight: 600; }
                    tr:nth-child(even) { background: ${theme === 'dark' ? '#22272e' : '#fafbfc'}; }
                    blockquote { margin: 0; padding: 0 1rem; color: ${theme === 'dark' ? '#8b949e' : '#6a737d'}; border-left: 0.25rem solid ${theme === 'dark' ? '#3b434b' : '#dfe2e5'}; }
                    img { max-width: 100%; height: auto; page-break-inside: avoid; }
                    ul, ol { padding-left: 2rem; margin: 1rem 0; page-break-inside: avoid; }
                    li { margin: 0.25rem 0; }
                    hr { height: 0.25rem; padding: 0; margin: 2rem 0; background: ${theme === 'dark' ? '#30363d' : '#e1e4e8'}; border: 0; }
                    .page-break { page-break-before: always; height: 0; margin: 0; padding: 0; }
                    @media print {
                        body { margin: 2.54cm !important; padding: 0 !important; background: white; }
                        pre, table, img, ul, ol { break-inside: avoid; }
                        h1, h2, h3, h4, h5, h6 { break-after: avoid; }
                    }
                </style>
            `;

            function preprocessMarkdown(text) {
                text = text.replace(/\\newpage/g, '<div class="page-break"></div>');
                text = text.replace(/<!--\s*pagebreak\s*-->/g, '<div class="page-break"></div>');
                return text;
            }

            marked.setOptions({ gfm: true, breaks: true, headerIds: true, html: true, highlight: (code, lang) => code });

            mdFile.addEventListener('change', async () => {
                const file = mdFile.files[0];
                if (!file) return;
                const text = await file.text();
                const processed = preprocessMarkdown(text);
                const html = marked.parse(processed);
                const theme = themeSelect.value;
                mdRendered.innerHTML = printStyles(theme) + `<div class="markdown-body">${html}</div>`;
                if (window.Prism) Prism.highlightAllUnder(mdRendered);
            });

            printBtn.addEventListener('click', async () => {
                const file = mdFile.files[0];
                if (!file) { alert('Please select a markdown file'); return; }
                printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';
                try {
                    const text = await file.text();
                    const processed = preprocessMarkdown(text);
                    const html = marked.parse(processed);
                    const theme = themeSelect.value;
                    const fullHtml = `<!DOCTYPE html>
<html><head><title>${file.name} - Print</title>${printStyles(theme)}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\\\[',right:'\\\\]',display:true},{left:'\\\\(',right:'\\\\)',display:false}]}); window.print();"></script>
<style>@media print { body { margin: 2.54cm; } }</style>
</head><body><div class="markdown-body">${html}</div>
<script>setTimeout(()=>{ window.print(); },500);<\/script></body></html>`;
                    const win = window.open('', '_blank');
                    if (!win) { alert('Pop‑up blocked'); printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; return; }
                    win.document.write(fullHtml); win.document.close();
                    setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; }, 3000);
                } catch (e) { alert('Error: '+e.message); printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; }
            });
        }

        // ==================== DOCX → PDF ====================
        else if (toolId === 'docx2pdf') {
            area.innerHTML = `
                <h3>📂 Upload .docx</h3>
                <div class="flex-row"><input type="file" id="docxFile" accept=".docx"></div>
                <div class="orientation-selector">
                    <label>📐 Page size: <select id="docxPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                    <label>🔄 Orientation: <select id="docxOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
                </div>
                <div style="margin:1rem 0;"><label><input type="checkbox" id="detectHeadings" checked> 🔍 Convert # style headings</label></div>
                <div class="preview-box"><div id="docxPreview">preview area</div></div>
                <button id="printDocxBtn" class="secondary">🖨️ Print / Save as PDF</button>
            `;

            const fileIn = document.getElementById('docxFile');
            const previewDiv = document.getElementById('docxPreview');
            const sizeSel = document.getElementById('docxPageSize');
            const orientSel = document.getElementById('docxOrientation');
            const detectHeadings = document.getElementById('detectHeadings');
            const printBtn = document.getElementById('printDocxBtn');

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
                try {
                    const buf = await f.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer: buf });
                    let html = enhanceHeadings(result.value);
                    previewDiv.innerHTML = docxPrintStyles + `<div class="docx-body">${html}</div>`;
                } catch (e) { previewDiv.innerHTML = `<p style="color:red;">Error: ${e.message}</p>`; }
            });

            printBtn.addEventListener('click', async () => {
                const f = fileIn.files[0];
                if (!f) { alert('Select a DOCX file'); return; }
                printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';
                try {
                    const buf = await f.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer: buf });
                    let html = enhanceHeadings(result.value);
                    const fullHtml = `<!DOCTYPE html><html><head><title>${f.name} - Print</title>${docxPrintStyles}</head><body><div class="docx-body">${html}</div><script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script></body></html>`;
                    const win = window.open('', '_blank');
                    if (!win) { alert('Pop‑up blocked'); printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; return; }
                    win.document.write(fullHtml); win.document.close();
                    setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; }, 3000);
                } catch (e) { alert('Error: '+e.message); printBtn.disabled = false; printBtn.innerHTML = '🖨️ Print / Save as PDF'; }
            });
        }

        // ==================== IMAGES → PDF ====================
        else if (toolId === 'img2pdf') {
            area.innerHTML = `
                <h3>🖼️ Select images (multiple)</h3>
                <div class="flex-row"><input type="file" id="imgFiles" accept="image/*" multiple></div>
                <div class="orientation-selector">
                    <label>📐 Page size: <select id="imgPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                    <label>🔄 Page orientation: <select id="imgOrientation"><option value="auto">Auto</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
                </div>
                <button id="convertImgBtn">📸→📁 Generate PDF</button>
                <div class="preview-box" id="imgPreviewList">image previews</div>
                <button id="downloadImgPdf" class="download-btn" disabled>⬇ Download PDF</button>
            `;
            const input = document.getElementById('imgFiles');
            const conv = document.getElementById('convertImgBtn');
            const down = document.getElementById('downloadImgPdf');
            const preview = document.getElementById('imgPreviewList');
            const sizeSel = document.getElementById('imgPageSize');
            const orientSel = document.getElementById('imgOrientation');
            let finalPdfBlob = null;

            conv.addEventListener('click', async () => {
                const files = Array.from(input.files);
                if (!files.length) return;
                const { PDFDocument } = PDFLib;
                const pdfDoc = await PDFDocument.create();
                preview.innerHTML = '';
                for (let file of files) {
                    const imgBytes = await file.arrayBuffer();
                    let image;
                    if (file.type === 'image/png') image = await pdfDoc.embedPng(imgBytes);
                    else image = await pdfDoc.embedJpg(imgBytes);
                    const dims = image.scale(1);
                    let orientation = orientSel.value;
                    if (orientation === 'auto') orientation = dims.width > dims.height ? 'landscape' : 'portrait';
                    const stdSizes = { a4: [595, 842], letter: [612, 792] };
                    let [stdW, stdH] = stdSizes[sizeSel.value];
                    if (orientation === 'landscape' && stdW < stdH) [stdW, stdH] = [stdH, stdW];
                    if (orientation === 'portrait' && stdW > stdH) [stdW, stdH] = [stdH, stdW];
                    const page = pdfDoc.addPage([stdW, stdH]);
                    const scaled = image.scaleToFit(stdW, stdH);
                    page.drawImage(image, { x: (stdW - scaled.width) / 2, y: (stdH - scaled.height) / 2, width: scaled.width, height: scaled.height });
                    const thumb = document.createElement('img'); thumb.src = URL.createObjectURL(file); thumb.style.width = '70px'; thumb.style.margin = '5px'; preview.appendChild(thumb);
                }
                const pdfBytes = await pdfDoc.save();
                finalPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                down.disabled = false;
            });
            down.addEventListener('click', () => { if (finalPdfBlob) downloadBlob(finalPdfBlob, 'images.pdf'); });
        }

        // ==================== PDF PASSWORD ====================
        else if (toolId === 'pdfencrypt') {
            area.innerHTML = `
                <h3>🔐 Protect PDF with Password</h3>
                <div style="display:flex; flex-direction:column; gap:1rem; max-width:500px;">
                    <input type="file" id="pdfToEncrypt" accept=".pdf">
                    <input type="password" id="pdfPassword" placeholder="Enter password">
                    <input type="password" id="pdfConfirmPassword" placeholder="Confirm password">
                    <div class="permissions-grid" style="display:flex; gap:1rem; flex-wrap:wrap;">
                        <label><input type="checkbox" id="permPrint" checked> Allow Printing</label>
                        <label><input type="checkbox" id="permCopy" checked> Allow Copying</label>
                        <label><input type="checkbox" id="permModify"> Allow Modifying</label>
                    </div>
                    <div id="passwordStrength" class="password-strength"></div>
                    <button id="encryptPdfBtn" class="primary" style="align-self:flex-start;">🔒 Encrypt & Download</button>
                </div>
            `;

            const pdfFile = document.getElementById('pdfToEncrypt');
            const pdfPassword = document.getElementById('pdfPassword');
            const pdfConfirm = document.getElementById('pdfConfirmPassword');
            const permPrint = document.getElementById('permPrint');
            const permCopy = document.getElementById('permCopy');
            const permModify = document.getElementById('permModify');
            const encryptBtn = document.getElementById('encryptPdfBtn');
            const strengthDiv = document.getElementById('passwordStrength');

            pdfPassword.addEventListener('input', () => {
                const pwd = pdfPassword.value;
                let strength = 0;
                if (pwd.length >= 8) strength++;
                if (/[a-z]/.test(pwd)) strength++;
                if (/[A-Z]/.test(pwd)) strength++;
                if (/[0-9]/.test(pwd)) strength++;
                if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
                const msgs = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
                const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#28a745'];
                strengthDiv.textContent = `Password Strength: ${msgs[strength]}`;
                strengthDiv.style.color = colors[strength];
            });

            encryptBtn.addEventListener('click', async () => {
                const file = pdfFile.files[0];
                const pwd = pdfPassword.value;
                const confirm = pdfConfirm.value;
                if (!file) { alert('Select a PDF file'); return; }
                if (!pwd) { alert('Enter password'); return; }
                if (pwd !== confirm) { alert('Passwords do not match'); return; }
                if (pwd.length < 6) { alert('Password must be at least 6 characters'); return; }

                encryptBtn.disabled = true; encryptBtn.innerHTML = '⏳ Encrypting...';
                try {
                    const arrayBuf = await file.arrayBuffer();
                    const { PDFDocument } = PDFLib;
                    let pdfDoc;
                    try { pdfDoc = await PDFDocument.load(arrayBuf); } catch { throw new Error('Invalid PDF'); }
                    if (pdfDoc.isEncrypted) throw new Error('PDF is already encrypted');
                    const permissions = {
                        printing: permPrint.checked ? 'highResolution' : 'none',
                        modifying: permModify.checked,
                        copying: permCopy.checked,
                        annotating: false,
                        fillingForms: false,
                        contentAccessibility: true,
                        documentAssembly: false
                    };
                    pdfDoc.encrypt({ userPassword: pwd, ownerPassword: pwd, permissions });
                    const encryptedBytes = await pdfDoc.save();
                    downloadBlob(new Blob([encryptedBytes]), `protected-${file.name}`);
                } catch (e) { alert('Encryption failed: ' + e.message); } finally {
                    encryptBtn.disabled = false; encryptBtn.innerHTML = '🔒 Encrypt & Download';
                }
            });
        }

        // ==================== MERGE PDF ====================
        else if (toolId === 'mergepdf') {
            area.innerHTML = `
                <h3>📚 Select multiple PDFs</h3>
                <input type="file" id="pdfMergeInput" accept=".pdf" multiple><br><br>
                <ul id="mergeFileList" class="file-list"></ul>
                <button id="mergePdfBtn">🔗 Merge & download</button>
            `;
            const mergeInp = document.getElementById('pdfMergeInput');
            const fileList = document.getElementById('mergeFileList');
            const mergeBtn = document.getElementById('mergePdfBtn');
            let filesArray = [];

            function renderFileList() {
                fileList.innerHTML = '';
                filesArray.forEach((file, index) => {
                    const li = document.createElement('li');
                    li.className = 'file-item';
                    li.innerHTML = `
                        <span class="file-name">${file.name}</span>
                        <div class="file-actions">
                            <button class="move-up" ${index === 0 ? 'disabled' : ''}>↑</button>
                            <button class="move-down" ${index === filesArray.length-1 ? 'disabled' : ''}>↓</button>
                        </div>
                    `;
                    li.querySelector('.move-up')?.addEventListener('click', () => {
                        if (index > 0) {
                            [filesArray[index-1], filesArray[index]] = [filesArray[index], filesArray[index-1]];
                            renderFileList();
                        }
                    });
                    li.querySelector('.move-down')?.addEventListener('click', () => {
                        if (index < filesArray.length-1) {
                            [filesArray[index], filesArray[index+1]] = [filesArray[index+1], filesArray[index]];
                            renderFileList();
                        }
                    });
                    fileList.appendChild(li);
                });
            }

            mergeInp.addEventListener('change', () => {
                filesArray = Array.from(mergeInp.files);
                renderFileList();
            });

            mergeBtn.addEventListener('click', async () => {
                if (filesArray.length < 2) { alert('Select at least two PDFs'); return; }
                mergeBtn.disabled = true; mergeBtn.innerHTML = '⏳ Merging...';
                try {
                    const { PDFDocument } = PDFLib;
                    const merged = await PDFDocument.create();
                    for (const f of filesArray) {
                        const buf = await f.arrayBuffer();
                        const pdf = await PDFDocument.load(buf);
                        const copied = await merged.copyPages(pdf, pdf.getPageIndices());
                        copied.forEach(p => merged.addPage(p));
                    }
                    const mergedBytes = await merged.save();
                    downloadBlob(new Blob([mergedBytes]), 'merged.pdf');
                } catch (e) { alert('Merge failed: ' + e.message); } finally {
                    mergeBtn.disabled = false; mergeBtn.innerHTML = '🔗 Merge & download';
                }
            });
        }

        // ==================== TXT → DOCX ====================
        else if (toolId === 'txt2docx') {
            area.innerHTML = `
                <h3>📄 Upload .txt file</h3>
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

            downloadBtn.addEventListener('click', () => { if (currentDocxBlob) downloadBlob(currentDocxBlob, 'converted.docx'); });
        }

        // ==================== PDF → JPG ====================
        else if (toolId === 'pdf2jpg') {
            area.innerHTML = `
                <h3>📸 PDF → JPG</h3>
                <input type="file" id="pdf2jpgInput" accept=".pdf"><br><br>
                <div style="margin:1rem 0;">
                    <label><input type="radio" name="pageRange" value="first" checked> First page only</label><br>
                    <label><input type="radio" name="pageRange" value="all"> All pages</label><br>
                    <label><input type="radio" name="pageRange" value="custom"> Custom range (e.g., 1-3,5,7-9)</label>
                    <input type="text" id="customRange" placeholder="1-3,5,7-9" style="margin-top:0.5rem; width:100%; max-width:300px;">
                </div>
                <button id="pdf2jpgBtn" class="primary">Convert to JPG</button>
                <div class="preview-box" id="jpgProgress" style="min-height:100px;"></div>
                <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1rem;">
                    <button id="downloadJpgBtn" class="download-btn" disabled>⬇ Download JPG(s)</button>
                </div>
            `;

            const inp = document.getElementById('pdf2jpgInput');
            const btn = document.getElementById('pdf2jpgBtn');
            const progressDiv = document.getElementById('jpgProgress');
            const downloadBtn = document.getElementById('downloadJpgBtn');
            const firstRadio = document.querySelector('input[name="pageRange"][value="first"]');
            const allRadio = document.querySelector('input[name="pageRange"][value="all"]');
            const customRadio = document.querySelector('input[name="pageRange"][value="custom"]');
            const customInput = document.getElementById('customRange');
            let generatedBlobs = [];

            function parsePageRange(str, totalPages) {
                if (!str) return [];
                const parts = str.split(',');
                const pages = new Set();
                for (let part of parts) {
                    part = part.trim();
                    if (part.includes('-')) {
                        let [start, end] = part.split('-').map(Number);
                        if (isNaN(start) || isNaN(end)) continue;
                        start = Math.max(1, Math.min(start, totalPages));
                        end = Math.max(1, Math.min(end, totalPages));
                        for (let i = start; i <= end; i++) pages.add(i);
                    } else {
                        let p = Number(part);
                        if (!isNaN(p) && p >= 1 && p <= totalPages) pages.add(p);
                    }
                }
                return Array.from(pages).sort((a,b)=>a-b);
            }

            btn.addEventListener('click', async () => {
                const file = inp.files[0];
                if (!file) return;
                btn.disabled = true; btn.innerHTML = '⏳ Loading PDF...';
                progressDiv.innerHTML = 'Loading PDF...';
                generatedBlobs = [];

                try {
                    const arrayBuf = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
                    const totalPages = pdf.numPages;
                    let pagesToExtract = [];

                    if (firstRadio.checked) {
                        pagesToExtract = [1];
                    } else if (allRadio.checked) {
                        pagesToExtract = Array.from({ length: totalPages }, (_, i) => i+1);
                    } else if (customRadio.checked) {
                        pagesToExtract = parsePageRange(customInput.value, totalPages);
                        if (pagesToExtract.length === 0) {
                            alert('No valid pages in range, using first page.');
                            pagesToExtract = [1];
                        }
                    }

                    progressDiv.innerHTML = '';
                    for (let i = 0; i < pagesToExtract.length; i++) {
                        const pageNum = pagesToExtract[i];
                        progressDiv.innerHTML += `Rendering page ${pageNum}...<br>`;
                        const page = await pdf.getPage(pageNum);
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext('2d');
                        await page.render({ canvasContext: ctx, viewport }).promise;
                        const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
                        generatedBlobs.push({ blob, pageNum });
                    }
                    progressDiv.innerHTML += 'Done!';
                    downloadBtn.disabled = false;
                } catch (e) {
                    progressDiv.innerHTML = `Error: ${e.message}`;
                } finally {
                    btn.disabled = false; btn.innerHTML = 'Convert to JPG';
                }
            });

            downloadBtn.addEventListener('click', async () => {
                if (generatedBlobs.length === 0) return;
                if (generatedBlobs.length === 1) {
                    downloadBlob(generatedBlobs[0].blob, `page-${generatedBlobs[0].pageNum}.jpg`);
                } else {
                    const zip = new JSZip();
                    generatedBlobs.forEach(({blob, pageNum}) => zip.file(`page-${pageNum}.jpg`, blob));
                    const content = await zip.generateAsync({ type: 'blob' });
                    downloadBlob(content, 'images.zip');
                }
            });
        }

        // ==================== IMAGE → PNG ====================
        else if (toolId === 'img2png') {
            area.innerHTML = `
                <h3>🎨 Convert any image to PNG</h3>
                <div class="flex-row"><input type="file" id="anyImgInput" accept="image/*"></div>
                <button id="toPngBtn" class="primary">Convert to PNG</button>
                <div class="preview-box"><img id="pngPreview" style="max-width:200px; max-height:200px;"></div>
                <button id="downloadPngBtn" class="download-btn" disabled>⬇ Download PNG</button>
            `;
            const inp = document.getElementById('anyImgInput');
            const conv = document.getElementById('toPngBtn');
            const imgPrev = document.getElementById('pngPreview');
            const dPng = document.getElementById('downloadPngBtn');
            let pngBlob = null;

            conv.addEventListener('click', () => {
                const f = inp.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = e => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width; canvas.height = img.height;
                        canvas.getContext('2d').drawImage(img, 0, 0);
                        canvas.toBlob(blob => { pngBlob = blob; dPng.disabled = false; imgPrev.src = canvas.toDataURL(); }, 'image/png');
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(f);
            });
            dPng.addEventListener('click', () => { if (pngBlob) downloadBlob(pngBlob, 'image.png'); });
        }

        // ==================== HTML → PDF ====================
        else if (toolId === 'web2pdf') {
            area.innerHTML = `
                <h3>🌐 HTML snippet to PDF</h3>
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

        // ==================== QR CODE ====================
        else if (toolId === 'qrmaker') {
            area.innerHTML = `
                <h3>🔳 Professional QR Code Generator</h3>
                <div class="qr-controls">
                    <input type="text" id="qrText" placeholder="Enter text or URL" value="https://convert-pdf.vercel.app">
                    <div class="qr-options-grid">
                        <div class="qr-option"><label>Size:</label><select id="qrSize"><option value="200">Small</option><option value="300" selected>Medium</option><option value="500">Large</option><option value="1024">Print</option></select></div>
                        <div class="qr-option"><label>Error Correction:</label><select id="qrErrorLevel"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></div>
                        <div class="qr-option"><label>Foreground:</label><input type="color" id="qrDarkColor" value="#000000"></div>
                        <div class="qr-option"><label>Background:</label><input type="color" id="qrLightColor" value="#ffffff"></div>
                        <div class="qr-option"><label>Logo (optional):</label><input type="file" id="qrLogo" accept="image/*"></div>
                        <div class="qr-option"><label>Format:</label><select id="qrFormat"><option value="png">PNG</option><option value="svg">SVG</option></select></div>
                    </div>
                    <button id="generateQrBtn" class="primary">✨ Generate QR Code</button>
                </div>
                <div class="preview-box"><div class="preview-title">Preview</div><div id="qrPreview"></div></div>
                <button id="downloadQrBtn" class="download-btn" disabled>⬇ Download QR Code</button>
            `;

            const qrText = document.getElementById('qrText');
            const qrSize = document.getElementById('qrSize');
            const qrErrorLevel = document.getElementById('qrErrorLevel');
            const qrDarkColor = document.getElementById('qrDarkColor');
            const qrLightColor = document.getElementById('qrLightColor');
            const qrLogo = document.getElementById('qrLogo');
            const qrFormat = document.getElementById('qrFormat');
            const generateBtn = document.getElementById('generateQrBtn');
            const downloadBtn = document.getElementById('downloadQrBtn');
            const qrPreview = document.getElementById('qrPreview');
            let currentQrDataUrl = null;

            generateBtn.addEventListener('click', async () => {
                const text = qrText.value.trim();
                if (!text) { alert('Enter text'); return; }
                generateBtn.disabled = true; generateBtn.innerHTML = '⏳ Generating...';
                qrPreview.innerHTML = '';
                try {
                    const canvas = document.createElement('canvas');
                    const size = parseInt(qrSize.value);
                    canvas.width = size; canvas.height = size;
                    await QRCode.toCanvas(canvas, text, {
                        width: size,
                        margin: 2,
                        color: { dark: qrDarkColor.value, light: qrLightColor.value },
                        errorCorrectionLevel: qrErrorLevel.value
                    });
                    if (qrLogo.files[0]) {
                        const logo = await loadImage(qrLogo.files[0]);
                        const ctx = canvas.getContext('2d');
                        const logoSize = size * 0.2;
                        ctx.drawImage(logo, (size-logoSize)/2, (size-logoSize)/2, logoSize, logoSize);
                    }
                    currentQrDataUrl = canvas.toDataURL('image/png');
                    const previewImg = document.createElement('img');
                    previewImg.src = currentQrDataUrl;
                    previewImg.style.maxWidth = '300px';
                    qrPreview.appendChild(previewImg);
                    downloadBtn.disabled = false;
                } catch (e) { alert('QR generation failed: '+e.message); } finally {
                    generateBtn.disabled = false; generateBtn.innerHTML = '✨ Generate QR Code';
                }
            });

            function loadImage(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = e.target.result;
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            downloadBtn.addEventListener('click', () => {
                if (!currentQrDataUrl) return;
                if (qrFormat.value === 'svg') {
                    alert('SVG download requires additional library. Using PNG.');
                }
                const link = document.createElement('a');
                link.download = `qrcode-${Date.now()}.png`;
                link.href = currentQrDataUrl;
                link.click();
            });
        }
    } // end renderToolInterface
})();