// script.js
(function() {
    // ---------- TOOL DEFINITIONS ----------
    const tools = [
        { id: 'md2pdf', name: '📝 Markdown → PDF', desc: 'convert .md to formatted PDF', icon: '📄➡️📑', group: 'core' },
        { id: 'docx2pdf', name: '📃 DOCX → PDF', desc: 'Word documents to PDF', icon: '📘➡️📕', group: 'core' },
        { id: 'img2pdf', name: '🖼️ Images → PDF', desc: 'JPG/PNG to single PDF', icon: '🌠➡️📇', group: 'core' },
        { id: 'pdfencrypt', name: '🔐 PDF password', desc: 'protect PDF with encryption', icon: '🔒📎', group: 'core' },
        { id: 'mergepdf', name: '🧩 Merge PDFs', desc: 'combine multiple PDF files', icon: '🔗📚', group: 'core' },
        { id: 'txt2docx', name: '📄 TXT → DOCX', desc: 'plain text to Word file', icon: '📋➡️📙', group: 'core' },
        // 4 extra tools
        { id: 'pdf2jpg', name: '📸 PDF → JPG', desc: 'extract first page as image', icon: '📑➡️🌄', group: 'extra' },
        { id: 'img2png', name: '🎨 Any image → PNG', desc: 'convert to PNG format', icon: '🖼️➡️📸', group: 'extra' },
        { id: 'web2pdf', name: '🌐 HTML → PDF', desc: 'paste HTML snippet to PDF', icon: '🕸️➡️📜', group: 'extra' },
        { id: 'qrmaker', name: '📱 QR code', desc: 'text/link → QR code PNG', icon: '🔳⬇️', group: 'extra' }
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

    // ---------- DEFAULT PDF STYLES (for html2pdf) ----------
    const printStyles = `
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #111; max-width: 100%; margin: 2rem; }
            pre { background: #f0f3f9; padding: 1rem; border-radius: 12px; overflow-x: auto; }
            code { background: #f0f3f9; padding: 0.2rem 0.4rem; border-radius: 6px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 0.5rem; }
            img { max-width: 100%; }
            h1, h2, h3, h4 { color: #1e2b4f; }
        </style>
    `;

    // ---------- RENDER TOOL INTERFACES ----------
    function renderToolInterface(toolId) {
        const container = toolContent;
        container.innerHTML = '';

        const area = document.createElement('div');
        area.className = 'area';
        container.appendChild(area);

    // ---------- IMPROVED: Markdown → PDF ----------
if (toolId === 'md2pdf') {

    console.log('✅ New Markdown tool loaded');

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
        <button id="convertMdBtn" class="primary">✨ Convert to PDF</button>
        <div class="preview-box">
            <div class="preview-title">Markdown preview</div>
            <div id="mdRendered"></div>
        </div>
        <button id="downloadMdPdf" class="download-btn" disabled>⬇ Download PDF</button>
    `;

    const mdFile = document.getElementById('mdFile');
    const convertBtn = document.getElementById('convertMdBtn');
    const downloadBtn = document.getElementById('downloadMdPdf');
    const mdRendered = document.getElementById('mdRendered');
    const sizeSelect = document.getElementById('mdPageSize');
    const orientSelect = document.getElementById('mdOrientation');
    const themeSelect = document.getElementById('mdTheme');
    let generatedPdfBlob = null;

    // Enhanced print CSS with better formatting
    const printStyles = (theme) => `
        <style>
            h1, h2, h3, h4, h5, h6 { 
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.25;
    color: inherit; /* Use the same color as body text */
}
h2 { 
    font-size: 1.5em;
    border-bottom: 1px solid ${theme === 'dark' ? '#444' : '#ccc'}; /* Neutral border */
    padding-bottom: 0.3rem;
}
            p { margin-top: 0; margin-bottom: 1rem; }
            code, pre { 
                font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
                font-size: 0.9rem;
                background: ${theme === 'dark' ? '#2d2d2d' : '#f6f8fa'};
                border-radius: 3px;
            }
            code {
                padding: 0.2rem 0.4rem;
                color: ${theme === 'dark' ? '#e6e6e6' : '#24292e'};
            }
            pre {
                padding: 1rem;
                overflow: auto;
                line-height: 1.45;
                background: ${theme === 'dark' ? '#2d2d2d' : '#f6f8fa'};
                border-radius: 6px;
                page-break-inside: avoid;
            }
            pre code {
                background: none;
                padding: 0;
                color: ${theme === 'dark' ? '#e6e6e6' : '#24292e'};
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 1rem 0;
                page-break-inside: avoid;
            }
            th, td {
                border: 1px solid ${theme === 'dark' ? '#444c56' : '#dfe2e5'};
                padding: 0.6rem 1rem;
                text-align: left;
            }
            th {
                background: ${theme === 'dark' ? '#2d333b' : '#f6f8fa'};
                font-weight: 600;
            }
            tr:nth-child(even) {
                background: ${theme === 'dark' ? '#22272e' : '#fafbfc'};
            }
            blockquote {
                margin: 0;
                padding: 0 1rem;
                color: ${theme === 'dark' ? '#8b949e' : '#6a737d'};
                border-left: 0.25rem solid ${theme === 'dark' ? '#3b434b' : '#dfe2e5'};
            }
            img {
                max-width: 100%;
                height: auto;
                page-break-inside: avoid;
            }
            ul, ol {
                padding-left: 2rem;
                margin: 1rem 0;
            }
            li {
                margin: 0.25rem 0;
            }
            hr {
                height: 0.25rem;
                padding: 0;
                margin: 2rem 0;
                background: ${theme === 'dark' ? '#30363d' : '#e1e4e8'};
                border: 0;
            }
            @media print {
                body { margin: 0; padding: 1.5cm; }
                pre, table { break-inside: avoid; }
                h2, h3 { break-after: avoid; }
            }
        </style>
    `;

    // Configure marked for better output
    marked.setOptions({
        gfm: true,                 // GitHub Flavored Markdown
        breaks: true,              // Convert line breaks to <br>
        headerIds: true,            // Add IDs to headers
        highlight: function(code, lang) {
            // Prism will handle highlighting in the browser
            return code;
        }
    });

    convertBtn.addEventListener('click', async () => {
        const file = mdFile.files[0];
        if (!file) {
            alert('Please select a markdown file');
            return;
        }

        // Show loading state
        convertBtn.disabled = true;
        convertBtn.innerHTML = '⏳ Converting...';
        mdRendered.innerHTML = '<div class="loading">Processing...</div>';

        try {
            const text = await file.text();
            
            // Parse markdown to HTML
            const htmlContent = marked.parse(text);
            
            // Apply theme
            const theme = themeSelect.value;
            const fullHtml = printStyles(theme) + `
                <div class="markdown-body">
                    ${htmlContent}
                </div>
            `;
            
            // Update preview with highlighted code
            mdRendered.innerHTML = fullHtml;
            
            // Apply syntax highlighting to preview
            if (window.Prism) {
                Prism.highlightAllUnder(mdRendered);
            }

            // Create element for PDF generation
            const element = document.createElement('div');
            element.innerHTML = fullHtml;

            // Configure PDF options
            const opt = {
                margin: [0.75, 0.75, 0.75, 0.75],
                filename: 'markdown-converted.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    letterRendering: true,
                    useCORS: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'in', 
                    format: sizeSelect.value, 
                    orientation: orientSelect.value 
                },
                pagebreak: { 
                    mode: ['css', 'legacy'],  // Respect CSS page breaks
                    before: '.page-break-before',
                    after: '.page-break-after',
                    avoid: 'pre, table, img'
                }
            };

            // Generate PDF
            generatedPdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
            
            downloadBtn.disabled = false;
            
            // Reset button state
            convertBtn.disabled = false;
            convertBtn.innerHTML = '✨ Convert to PDF';
            
        } catch (error) {
            console.error('Conversion error:', error);
            mdRendered.innerHTML = `<div class="error">Error: ${error.message || 'Conversion failed'}</div>`;
            convertBtn.disabled = false;
            convertBtn.innerHTML = '✨ Convert to PDF';
        }
    });

    downloadBtn.addEventListener('click', () => { 
        if (generatedPdfBlob) {
            downloadBlob(generatedPdfBlob, 'markdown-converted.pdf');
        }
    });

        // ---------- PRINT BUTTON (Save as PDF via browser print) ----------
    const printBtn = document.createElement('button');
    printBtn.id = 'printMdBtn';
    printBtn.className = 'secondary';
    printBtn.innerHTML = '🖨️ Print / Save as PDF';
    area.appendChild(printBtn);

    printBtn.addEventListener('click', async () => {
        const file = mdFile.files[0];
        if (!file) {
            alert('Please select a markdown file');
            return;
        }

        // Show loading state
        printBtn.disabled = true;
        printBtn.innerHTML = '⏳ Preparing print...';

        try {
            const text = await file.text();
            const theme = themeSelect.value;
            
            // Configure marked
            marked.setOptions({
                gfm: true,
                breaks: true,
                headerIds: true
            });
            
            const htmlContent = marked.parse(text);
            
            // Build full HTML with print styles
            const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${file.name} - Print Preview</title>
    ${printStyles(theme)}
    <style>
        @media print {
            body { margin: 1.5cm; }
            pre, table { break-inside: avoid; }
            h1, h2, h3, h4, h5, h6 { color: inherit; }
        }
    </style>
</head>
<body>
    <div class="markdown-body">
        ${htmlContent}
    </div>
    <script>
        window.onload = function() { 
            setTimeout(() => { window.print(); }, 500);
        };
    <\/script>
</body>
</html>`;

            // Open new window and write content
            const printWindow = window.open('', '_blank');
            printWindow.document.write(fullHtml);
            printWindow.document.close();
            
            // Reset button state after a delay
            setTimeout(() => {
                printBtn.disabled = false;
                printBtn.innerHTML = '🖨️ Print / Save as PDF';
            }, 2000);
            
        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to prepare print preview');
            printBtn.disabled = false;
            printBtn.innerHTML = '🖨️ Print / Save as PDF';
        }
    });
}

        // ---------- DOCX to PDF with orientation ----------
        else if (toolId === 'docx2pdf') {
            area.innerHTML = `
                <h3>📂 Upload .docx</h3>
                <div class="flex-row"><input type="file" id="docxFile" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></div>
                <div class="orientation-selector">
                    <label>📐 Page size: <select id="docxPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                    <label>🔄 Orientation: <select id="docxOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
                </div>
                <button id="convertDocxBtn">📄→📑 Convert to PDF</button>
                <div class="preview-box"><div id="docxPreview">preview area</div></div>
                <button id="downloadDocxPdf" class="download-btn" disabled>⬇ Download PDF</button>
            `;
            const fileIn = document.getElementById('docxFile');
            const convBtn = document.getElementById('convertDocxBtn');
            const dldBtn = document.getElementById('downloadDocxPdf');
            const previewDiv = document.getElementById('docxPreview');
            const sizeSel = document.getElementById('docxPageSize');
            const orientSel = document.getElementById('docxOrientation');
            let pdfBlob = null;

            convBtn.addEventListener('click', async () => {
                const f = fileIn.files[0];
                if (!f) return;
                const arrayBuf = await f.arrayBuffer();
                const { value: html } = await mammoth.convertToHtml({ arrayBuffer: arrayBuf });
                const styledHtml = printStyles + `<div class="docx-body">${html}</div>`;
                previewDiv.innerHTML = styledHtml;
                const wrapper = document.createElement('div');
                wrapper.innerHTML = styledHtml;
                try {
                    const opt = {
                        margin: [0.5, 0.5, 0.5, 0.5],
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, letterRendering: true },
                        jsPDF: { unit: 'in', format: sizeSel.value, orientation: orientSel.value }
                    };
                    pdfBlob = await html2pdf().from(wrapper).set(opt).outputPdf('blob');
                    dldBtn.disabled = false;
                } catch { alert('pdf error'); }
            });
            dldBtn.addEventListener('click', ()=> { if(pdfBlob) downloadBlob(pdfBlob, 'document.pdf'); });
        }

        // ---------- IMAGES to PDF with orientation per image? We'll auto-orient ----------
        else if (toolId === 'img2pdf') {
            area.innerHTML = `
                <h3>🖼️ Select images (multiple)</h3>
                <div class="flex-row"><input type="file" id="imgFiles" accept="image/*" multiple></div>
                <div class="orientation-selector">
                    <label>📐 Page size: <select id="imgPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                    <label>🔄 Page orientation: <select id="imgOrientation"><option value="auto">Auto (fit image)</option><option value="portrait">Force portrait</option><option value="landscape">Force landscape</option></select></label>
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
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: sizeSel.value }); // temporary, we will re-create per page
                // we need to handle each page separately because jsPDF doesn't support mixed orientation easily.
                // Simpler: create new PDF for each image and merge? Use pdf-lib? Let's use jsPDF with addPage and set orientation each time.
                // Better: use pdf-lib to add images with custom dimensions.
                // Use pdf-lib for better control.
                const { PDFDocument, degrees } = PDFLib;
                const pdfDoc = await PDFDocument.create();
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const imgBytes = await file.arrayBuffer();
                    let image;
                    if (file.type === 'image/png') image = await pdfDoc.embedPng(imgBytes);
                    else image = await pdfDoc.embedJpg(imgBytes);
                    const dims = image.scale(1);
                    const pageWidth = dims.width;
                    const pageHeight = dims.height;
                    let orientation = orientSel.value;
                    if (orientation === 'auto') {
                        orientation = pageWidth > pageHeight ? 'landscape' : 'portrait';
                    }
                    // create page with image size? but we want standard size? We'll create page with standard size and fit image.
                    const stdSizes = { a4: [595, 842], letter: [612, 792] };
                    let stdWidth = stdSizes[sizeSel.value][0];
                    let stdHeight = stdSizes[sizeSel.value][1];
                    if (orientation === 'landscape') { // swap if needed
                        if (stdWidth < stdHeight) [stdWidth, stdHeight] = [stdHeight, stdWidth];
                    } else {
                        if (stdWidth > stdHeight) [stdWidth, stdHeight] = [stdHeight, stdWidth];
                    }
                    const page = pdfDoc.addPage([stdWidth, stdHeight]);
                    const scaled = image.scaleToFit(stdWidth, stdHeight);
                    page.drawImage(image, {
                        x: (stdWidth - scaled.width) / 2,
                        y: (stdHeight - scaled.height) / 2,
                        width: scaled.width,
                        height: scaled.height,
                    });
                    // show preview
                    const dataUrl = URL.createObjectURL(file);
                    const thumb = document.createElement('img');
                    thumb.src = dataUrl;
                    thumb.style.width = '70px'; thumb.style.margin='5px';
                    preview.appendChild(thumb);
                }
                const pdfBytes = await pdfDoc.save();
                finalPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                down.disabled = false;
            });
            down.addEventListener('click', ()=>{ if(finalPdfBlob) downloadBlob(finalPdfBlob, 'images.pdf'); });
        }

        // ---------- PDF ENCRYPT (no change) ----------
        else if (toolId === 'pdfencrypt') {
            area.innerHTML = `
                <h3>🔐 Upload PDF & set password</h3>
                <input type="file" id="pdfToEncrypt" accept=".pdf"><br><br>
                <input type="text" id="pdfPassword" placeholder="enter password" style="padding:0.7rem; width:250px; border-radius:40px; border:1px solid #b9cbee;">
                <button id="encryptPdfBtn">🔒 Encrypt & download</button>
                <div class="preview-box">encrypted pdf preview not available (password protected)</div>
            `;
            const fileE = document.getElementById('pdfToEncrypt');
            const pass = document.getElementById('pdfPassword');
            const encryptBtn = document.getElementById('encryptPdfBtn');
            encryptBtn.addEventListener('click', async () => {
                const f = fileE.files[0]; const pwd = pass.value;
                if (!f || !pwd) return alert('need file and password');
                const arrayBuf = await f.arrayBuffer();
                const { PDFDocument } = PDFLib;
                const pdfDoc = await PDFDocument.load(arrayBuf);
                pdfDoc.encrypt({ userPassword: pwd, ownerPassword: pwd, permissions: { printing: 'highResolution', modifying: false } });
                const encryptedBytes = await pdfDoc.save();
                const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
                downloadBlob(blob, 'protected.pdf');
            });
        }

        // ---------- MERGE PDF (no change) ----------
        else if (toolId === 'mergepdf') {
            area.innerHTML = `
                <h3>📚 Select multiple PDFs</h3>
                <input type="file" id="pdfMergeInput" accept=".pdf" multiple><br><br>
                <button id="mergePdfBtn">🔗 Merge & download</button>
                <div class="preview-box">merged PDF will be downloaded (preview not available)</div>
            `;
            const mergeInp = document.getElementById('pdfMergeInput');
            const mergeBtn = document.getElementById('mergePdfBtn');
            mergeBtn.addEventListener('click', async () => {
                const files = Array.from(mergeInp.files);
                if (files.length < 2) return alert('select at least two PDFs');
                const { PDFDocument } = PDFLib;
                const merged = await PDFDocument.create();
                for (const f of files) {
                    const buf = await f.arrayBuffer();
                    const pdf = await PDFDocument.load(buf);
                    const copied = await merged.copyPages(pdf, pdf.getPageIndices());
                    copied.forEach(p => merged.addPage(p));
                }
                const mergedBytes = await merged.save();
                downloadBlob(new Blob([mergedBytes]), 'merged.pdf');
            });
        }

        // ---------- TXT to DOCX (improved preview) ----------
        else if (toolId === 'txt2docx') {
            area.innerHTML = `
                <h3>📄 Upload .txt</h3>
                <input type="file" id="txtFile" accept=".txt"><br><br>
                <button id="convertTxtBtn">📝 → 📘 to DOCX</button>
                <div class="preview-box" id="txtPreview">text preview</div>
                <button id="downloadDocxBtn" class="download-btn" disabled>⬇ Download DOCX</button>
            `;
            const txtInp = document.getElementById('txtFile');
            const convTxt = document.getElementById('convertTxtBtn');
            const downTxt = document.getElementById('downloadDocxBtn');
            const previewTxt = document.getElementById('txtPreview');
            let docxBlob = null;

            convTxt.addEventListener('click', async () => {
                const f = txtInp.files[0];
                if (!f) return;
                const text = await f.text();
                previewTxt.innerText = text.slice(0, 500) + (text.length>500?'...':'');
                const { Document, Packer, Paragraph, TextRun } = docx;
                const doc = new Document({ sections: [{
                    properties: {}, children: [new Paragraph({ children: [new TextRun(text) ] })]
                }] });
                const blob = await Packer.toBlob(doc);
                docxBlob = blob;
                downTxt.disabled = false;
            });
            downTxt.addEventListener('click', () => { if (docxBlob) downloadBlob(docxBlob, 'output.docx'); });
        }

        // ---------- PDF to JPG ----------
        else if (toolId === 'pdf2jpg') {
            area.innerHTML = `
                <h3>📸 PDF → JPG (first page)</h3>
                <input type="file" id="pdf2jpgInput" accept=".pdf"><br><br>
                <button id="pdf2jpgBtn">Convert to JPG</button>
                <div class="preview-box"><canvas id="pdfCanvas" style="max-width:100%"></canvas></div>
                <button id="downloadJpgBtn" class="download-btn" disabled>⬇ Download JPG</button>
            `;
            const inp = document.getElementById('pdf2jpgInput');
            const btn = document.getElementById('pdf2jpgBtn');
            const canvas = document.getElementById('pdfCanvas');
            const dBtn = document.getElementById('downloadJpgBtn');
            let jpgUrl = null;

            btn.addEventListener('click', async () => {
                const file = inp.files[0];
                if (!file) return;
                const arrayBuf = await file.arrayBuffer();
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuf });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                canvas.width = viewport.width; canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                canvas.toBlob(blob => { jpgUrl = URL.createObjectURL(blob); dBtn.disabled = false; }, 'image/jpeg', 0.95);
            });
            dBtn.addEventListener('click', ()=> { if(jpgUrl) { const a = document.createElement('a'); a.href = jpgUrl; a.download = 'page1.jpg'; a.click(); } });
        }

        // ---------- IMG to PNG ----------
        else if (toolId === 'img2png') {
            area.innerHTML = `
                <h3>🎨 Convert any image to PNG</h3>
                <input type="file" id="anyImgInput" accept="image/*"><br><br>
                <button id="toPngBtn">Convert to PNG</button>
                <div class="preview-box"><img id="pngPreview" style="max-width:200px"></div>
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
            dPng.addEventListener('click', ()=> { if(pngBlob) downloadBlob(pngBlob, 'image.png'); });
        }

        // ---------- HTML to PDF with orientation ----------
        else if (toolId === 'web2pdf') {
            area.innerHTML = `
                <h3>🌐 HTML snippet to PDF</h3>
                <textarea id="htmlSnippet" rows="8" style="width:100%; border-radius:25px; padding:1rem;"><h1>Hello</h1><p>type HTML here</p></textarea><br><br>
                <div class="orientation-selector">
                    <label>📐 Page size: <select id="htmlPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
                    <label>🔄 Orientation: <select id="htmlOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
                </div>
                <button id="html2pdfBtn">Generate PDF</button>
                <div class="preview-box"><div id="htmlRenderPreview"></div></div>
                <button id="downloadHtmlPdf" class="download-btn" disabled>⬇ Download PDF</button>
            `;
            const textarea = document.getElementById('htmlSnippet');
            const genBtn = document.getElementById('html2pdfBtn');
            const previewDiv = document.getElementById('htmlRenderPreview');
            const dldHtml = document.getElementById('downloadHtmlPdf');
            const sizeSel = document.getElementById('htmlPageSize');
            const orientSel = document.getElementById('htmlOrientation');
            let htmlPdfBlob = null;

            genBtn.addEventListener('click', async () => {
                const html = textarea.value;
                const styled = printStyles + `<div class="html-content">${html}</div>`;
                previewDiv.innerHTML = styled;
                const wrapper = document.createElement('div');
                wrapper.innerHTML = styled;
                try {
                    const opt = {
                        margin: 0.5,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: sizeSel.value, orientation: orientSel.value }
                    };
                    htmlPdfBlob = await html2pdf().from(wrapper).set(opt).outputPdf('blob');
                    dldHtml.disabled = false;
                } catch { alert('invalid html'); }
            });
            dldHtml.addEventListener('click', ()=>{ if(htmlPdfBlob) downloadBlob(htmlPdfBlob, 'web.pdf'); });
        }

        // ---------- QR maker ----------
        else if (toolId === 'qrmaker') {
            area.innerHTML = `
                <h3>🔳 Text / URL to QR</h3>
                <input type="text" id="qrText" placeholder="enter text or link" style="width:70%; padding:0.7rem; border-radius:50px; border:1px solid #aaa;"><br><br>
                <button id="qrGenBtn">Generate QR</button>
                <div class="preview-box"><div id="qrPreview"></div></div>
                <button id="downloadQrBtn" class="download-btn" disabled>⬇ Download PNG</button>
            `;
            const qrInput = document.getElementById('qrText');
            const genQr = document.getElementById('qrGenBtn');
            const qrDiv = document.getElementById('qrPreview');
            const dQr = document.getElementById('downloadQrBtn');
            let qrBlob = null;

            genQr.addEventListener('click', () => {
                qrDiv.innerHTML = '';
                const val = qrInput.value.trim() || 'https://fileforge.demo';
                new QRCode(qrDiv, { text: val, width: 200, height: 200, colorDark: '#1e2b4f' });
                setTimeout(() => {
                    const canvas = qrDiv.querySelector('canvas');
                    if (canvas) canvas.toBlob(blob => { qrBlob = blob; dQr.disabled = false; }, 'image/png');
                }, 300);
            });
            dQr.addEventListener('click', ()=> { if(qrBlob) downloadBlob(qrBlob, 'qrcode.png'); });
        }
    }

})();

