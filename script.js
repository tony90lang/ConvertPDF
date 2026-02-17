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

        // ---------- IMPROVED: Markdown → PDF (using Print + KaTeX) ----------
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
                <div class="preview-box">
                    <div class="preview-title">Markdown preview</div>
                    <div id="mdRendered"></div>
                </div>
                <button id="printMdBtn" class="secondary">🖨️ Print / Save as PDF</button>
            `;

            const mdFile = document.getElementById('mdFile');
            const mdRendered = document.getElementById('mdRendered');
            const sizeSelect = document.getElementById('mdPageSize');
            const orientSelect = document.getElementById('mdOrientation');
            const themeSelect = document.getElementById('mdTheme');
            const printBtn = document.getElementById('printMdBtn');

            // Enhanced print CSS with better formatting (full version)
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
                    }
                    h1 { 
                        font-size: 2em;
                        border-bottom: 1px solid ${theme === 'dark' ? '#30363d' : '#eaecef'};
                        padding-bottom: 0.3rem;
                    }
                    h2 { 
                        font-size: 1.5em;
                        border-bottom: 1px solid ${theme === 'dark' ? '#444' : '#ccc'};
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
                        h1 { break-before: auto; } /* Remove forced page break */
                        h2, h3 { break-after: avoid; }
                    }
                </style>
            `;

            // Configure marked for better output
            marked.setOptions({
                gfm: true,
                breaks: true,
                headerIds: true,
                highlight: function(code, lang) {
                    return code; // Prism will handle highlighting
                }
            });

            // Update preview when file is selected
            mdFile.addEventListener('change', async () => {
                const file = mdFile.files[0];
                if (!file) return;
                const text = await file.text();
                const htmlContent = marked.parse(text);
                const theme = themeSelect.value;
                const fullHtml = printStyles(theme) + `<div class="markdown-body">${htmlContent}</div>`;
                mdRendered.innerHTML = fullHtml;
                if (window.Prism) Prism.highlightAllUnder(mdRendered);
            });

            // Print button: opens new window with formatted content + KaTeX
            printBtn.addEventListener('click', async () => {
                const file = mdFile.files[0];
                if (!file) {
                    alert('Please select a markdown file');
                    return;
                }

                printBtn.disabled = true;
                printBtn.innerHTML = '⏳ Preparing print...';

                try {
                    const text = await file.text();
                    const theme = themeSelect.value;
                    const htmlContent = marked.parse(text);

                    // Build full HTML with print styles and KaTeX for math
                    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${file.name} - Print Preview</title>
    ${printStyles(theme)}
    <!-- KaTeX CSS and JS for math rendering -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" crossorigin="anonymous"
        onload="renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\\\[', right: '\\\\]', display: true},
                {left: '\\\\(', right: '\\\\)', display: false}
            ]
        }); window.print();"></script>
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
    <!-- Fallback in case onload doesn't fire -->
    <script>
        setTimeout(function() {
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(document.body, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\\\[', right: '\\\\]', display: true},
                        {left: '\\\\(', right: '\\\\)', display: false}
                    ]
                });
            }
            window.print();
        }, 500);
    <\/script>
</body>
</html>`;

                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(fullHtml);
                    printWindow.document.close();

                    // Reset button after a delay
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

        // ---------- DOCX to PDF via Print (professional formatting) ----------
else if (toolId === 'docx2pdf') {
    area.innerHTML = `
        <h3>📂 Upload .docx</h3>
        <div class="flex-row"><input type="file" id="docxFile" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></div>
        <div class="orientation-selector">
            <label>📐 Page size: <select id="docxPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label>🔄 Orientation: <select id="docxOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        </div>
        <div style="margin:1rem 0;">
            <label><input type="checkbox" id="detectHeadings" checked> 🔍 Convert # style headings</label>
            <span style="margin-left:1rem; font-size:0.9rem; color:#555;">💡 For best results, use Word's built‑in heading styles.</span>
        </div>
        <div class="preview-box"><div id="docxPreview">preview area</div></div>
        <button id="printDocxBtn" class="secondary">🖨️ Print / Save as PDF</button>
    `;

    const fileIn = document.getElementById('docxFile');
    const previewDiv = document.getElementById('docxPreview');
    const sizeSel = document.getElementById('docxPageSize');
    const orientSel = document.getElementById('docxOrientation');
    const detectHeadings = document.getElementById('detectHeadings');
    const printBtn = document.getElementById('printDocxBtn');

    // Professional CSS (grayscale, clean, with page‑break control)
    const docxPrintStyles = `
        <style>
            .docx-body {
                font-family: 'Calibri', 'Segoe UI', Roboto, -apple-system, sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                max-width: 1000px;
                margin: 0 auto;
                padding: 2rem;
            }
            .docx-body h1 {
                font-size: 28px;
                color: #1e2b4f;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
                margin-top: 30px;
                margin-bottom: 20px;
                page-break-after: avoid;
            }
            .docx-body h2 {
                font-size: 24px;
                color: #2c3e50;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 8px;
                margin-top: 25px;
                margin-bottom: 15px;
                page-break-after: avoid;
            }
            .docx-body h3 {
                font-size: 20px;
                color: #34495e;
                margin-top: 20px;
                margin-bottom: 10px;
                page-break-after: avoid;
            }
            .docx-body p {
                margin: 0 0 1rem;
                orphans: 3;
                widows: 3;
            }
            .docx-body code, .docx-body pre {
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                background-color: #f4f4f4;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                font-size: 0.9em;
            }
            .docx-body code {
                padding: 2px 4px;
            }
            .docx-body pre {
                padding: 15px;
                overflow-x: auto;
                line-height: 1.4;
                page-break-inside: avoid;
            }
            .docx-body table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
                page-break-inside: avoid;
                box-shadow: 0 2px 3px rgba(0,0,0,0.1);
            }
            .docx-body th {
                background-color: #3498db;
                color: white;
                font-weight: 600;
                padding: 12px;
                text-align: left;
                border: 1px solid #2980b9;
            }
            .docx-body td {
                padding: 10px 12px;
                border: 1px solid #ddd;
                vertical-align: top;
            }
            .docx-body tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .docx-body blockquote {
                margin: 0 0 1rem;
                padding: 0 1rem;
                color: #555;
                border-left: 4px solid #ccc;
            }
            .docx-body img {
                max-width: 100%;
                height: auto;
                page-break-inside: avoid;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .docx-body ul, .docx-body ol {
                padding-left: 2rem;
                margin: 1rem 0;
            }
            .docx-body li {
                margin: 0.25rem 0;
            }
            .docx-body hr {
                height: 1px;
                padding: 0;
                margin: 2rem 0;
                background: #ccc;
                border: 0;
            }
            @page {
                margin: 2cm;
                size: auto;
            }
            @media print {
                body { margin: 0; padding: 0; background: white; }
                .docx-body h1, .docx-body h2, .docx-body h3 { break-after: avoid; }
                .docx-body pre, .docx-body table, .docx-body img { break-inside: avoid; }
            }
        </style>
    `;

    // Convert markdown-style headings inside HTML
    function enhanceHeadings(html) {
        if (!detectHeadings.checked) return html;
        // Replace <p># Heading</p> with <h1>Heading</h1> (and ## → h2, etc.)
        return html.replace(/<p>(#{1,6})\s+(.*?)<\/p>/g, (match, hashes, content) => {
            const level = hashes.length;
            return `<h${level}>${content}</h${level}>`;
        });
    }

    // Update preview when file is selected
    fileIn.addEventListener('change', async () => {
        const f = fileIn.files[0];
        if (!f) return;
        try {
            const arrayBuf = await f.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuf });
            let html = result.value;
            html = enhanceHeadings(html);
            previewDiv.innerHTML = docxPrintStyles + `<div class="docx-body">${html}</div>`;
        } catch (e) {
            previewDiv.innerHTML = `<p style="color:red;">Error reading file: ${e.message}</p>`;
        }
    });

    // Print button
    printBtn.addEventListener('click', async () => {
        const f = fileIn.files[0];
        if (!f) { alert('Please select a DOCX file'); return; }

        printBtn.disabled = true;
        printBtn.innerHTML = '⏳ Preparing print...';

        try {
            const arrayBuf = await f.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuf });
            let html = result.value;
            html = enhanceHeadings(html);

            const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${f.name} - Print Preview</title>
    ${docxPrintStyles}
</head>
<body>
    <div class="docx-body">${html}</div>
    <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 500); };
    <\/script>
</body>
</html>`;

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Pop‑up blocked! Please allow pop‑ups for this site.');
                printBtn.disabled = false;
                printBtn.innerHTML = '🖨️ Print / Save as PDF';
                return;
            }
            printWindow.document.write(fullHtml);
            printWindow.document.close();

            setTimeout(() => {
                printBtn.disabled = false;
                printBtn.innerHTML = '🖨️ Print / Save as PDF';
            }, 3000);

        } catch (e) {
            console.error(e);
            alert('Error preparing document: ' + e.message);
            printBtn.disabled = false;
            printBtn.innerHTML = '🖨️ Print / Save as PDF';
        }
    });
}

        // ---------- IMPROVED: PDF Password Encryption ----------
else if (toolId === 'pdfencrypt') {
    area.innerHTML = `
        <h3>🔐 Protect PDF with Password</h3>
        
        <div class="encrypt-controls">
            <div class="form-group">
                <label>📄 Select PDF:</label>
                <input type="file" id="pdfToEncrypt" accept=".pdf">
            </div>
            
            <div class="form-group">
                <label>🔑 Password:</label>
                <input type="password" id="pdfPassword" placeholder="Enter password">
            </div>
            
            <div class="form-group">
                <label>🔑 Confirm Password:</label>
                <input type="password" id="pdfConfirmPassword" placeholder="Confirm password">
            </div>
            
            <div class="form-group">
                <label>⚙️ Permissions:</label>
                <div class="permissions-grid">
                    <label><input type="checkbox" id="permPrint" checked> Allow Printing</label>
                    <label><input type="checkbox" id="permCopy" checked> Allow Copying</label>
                    <label><input type="checkbox" id="permModify"> Allow Modifying</label>
                </div>
            </div>
            
            <div id="passwordStrength" class="password-strength"></div>
        </div>
        
        <button id="encryptPdfBtn" class="primary">🔒 Encrypt PDF</button>
        
        <div class="preview-box">
            <p class="note">Encrypted PDF preview not available (password protected)</p>
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
    
    // Password strength checker
    pdfPassword.addEventListener('input', () => {
        const pwd = pdfPassword.value;
        let strength = 0;
        
        if (pwd.length >= 8) strength++;
        if (pwd.match(/[a-z]/)) strength++;
        if (pwd.match(/[A-Z]/)) strength++;
        if (pwd.match(/[0-9]/)) strength++;
        if (pwd.match(/[^a-zA-Z0-9]/)) strength++;
        
        const messages = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#28a745'];
        
        strengthDiv.textContent = `Password Strength: ${messages[strength]}`;
        strengthDiv.style.color = colors[strength];
    });
    
    encryptBtn.addEventListener('click', async () => {
        const file = pdfFile.files[0];
        const pwd = pdfPassword.value;
        const confirm = pdfConfirm.value;
        
        // Validation
        if (!file) {
            alert('Please select a PDF file');
            return;
        }
        
        if (!pwd) {
            alert('Please enter a password');
            return;
        }
        
        if (pwd !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        if (pwd.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        encryptBtn.disabled = true;
        encryptBtn.innerHTML = '⏳ Encrypting...';
        
        try {
            const arrayBuf = await file.arrayBuffer();
            const { PDFDocument } = PDFLib;
            
            // Load PDF
            let pdfDoc;
            try {
                pdfDoc = await PDFDocument.load(arrayBuf);
            } catch (e) {
                throw new Error('Invalid or corrupted PDF file');
            }
            
            // Check if already encrypted
            if (pdfDoc.isEncrypted) {
                throw new Error('PDF is already encrypted');
            }
            
            // Set permissions
            const permissions = {
                printing: permPrint.checked ? 'highResolution' : 'none',
                modifying: permModify.checked,
                copying: permCopy.checked,
                annotating: false,
                fillingForms: false,
                contentAccessibility: true,
                documentAssembly: false
            };
            
            // Encrypt
            pdfDoc.encrypt({
                userPassword: pwd,
                ownerPassword: pwd,
                permissions: permissions
            });
            
            const encryptedBytes = await pdfDoc.save();
            const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
            
            // Download
            downloadBlob(blob, `protected-${file.name}`);
            
        } catch (error) {
            console.error('Encryption error:', error);
            alert('Encryption failed: ' + error.message);
        } finally {
            encryptBtn.disabled = false;
            encryptBtn.innerHTML = '🔒 Encrypt PDF';
        }
    });
}

        // ---------- MERGE PDF ----------
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

        // ---------- IMPROVED: TXT to DOCX with formatting ----------
else if (toolId === 'txt2docx') {
    area.innerHTML = `
        <h3>📄 Upload .txt file</h3>
        <div class="flex-row">
            <input type="file" id="txtFile" accept=".txt">
        </div>
        
        <div class="formatting-controls">
            <h4>Formatting Options</h4>
            <div class="formatting-grid">
                <div class="format-option">
                    <label>Font:</label>
                    <select id="txtFont">
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Calibri" selected>Calibri</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </div>
                
                <div class="format-option">
                    <label>Size:</label>
                    <select id="txtFontSize">
                        <option value="10">10pt</option>
                        <option value="11" selected>11pt</option>
                        <option value="12">12pt</option>
                        <option value="14">14pt</option>
                    </select>
                </div>
                
                <div class="format-option">
                    <label>Line Spacing:</label>
                    <select id="txtLineSpacing">
                        <option value="1.0">Single</option>
                        <option value="1.15">1.15</option>
                        <option value="1.5">1.5</option>
                        <option value="2.0">Double</option>
                    </select>
                </div>
                
                <div class="format-option">
                    <label>Detect Headings:</label>
                    <input type="checkbox" id="txtDetectHeadings" checked>
                </div>
            </div>
        </div>
        
        <button id="convertTxtBtn" class="primary">📝 → 📘 Convert to DOCX</button>
        
        <div class="preview-box">
            <div class="preview-title">Preview</div>
            <pre id="txtPreview" style="white-space: pre-wrap; font-family: inherit;"></pre>
        </div>
        
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
        previewTxt.textContent = currentText.slice(0, 1000) + (currentText.length > 1000 ? '...' : '');
    });
    
    convertBtn.addEventListener('click', async () => {
        if (!currentText) {
            alert('Please select a text file first');
            return;
        }
        
        convertBtn.disabled = true;
        convertBtn.innerHTML = '⏳ Converting...';
        
        try {
            // Split text into paragraphs
            const paragraphs = currentText.split(/\n\s*\n/);
            
            // Create document with sections
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
            
            const children = [];
            
            paragraphs.forEach(para => {
                const lines = para.split('\n');
                
                lines.forEach(line => {
                    line = line.trim();
                    if (!line) return;
                    
                    // Detect headings if enabled
                    if (txtDetectHeadings.checked) {
                        if (line.startsWith('# ')) {
                            children.push(
                                new Paragraph({
                                    text: line.substring(2),
                                    heading: HeadingLevel.HEADING_1,
                                    spacing: { after: 200 }
                                })
                            );
                            return;
                        } else if (line.startsWith('## ')) {
                            children.push(
                                new Paragraph({
                                    text: line.substring(3),
                                    heading: HeadingLevel.HEADING_2,
                                    spacing: { after: 200 }
                                })
                            );
                            return;
                        }
                    }
                    
                    // Regular paragraph
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line,
                                    font: txtFont.value,
                                    size: parseInt(txtFontSize.value) * 2, // docx uses half-points
                                })
                            ],
                            spacing: {
                                line: Math.round(parseFloat(txtLineSpacing.value) * 240), // docx line spacing in twips
                                after: 120
                            }
                        })
                    );
                });
            });
            
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children
                }]
            });
            
            currentDocxBlob = await Packer.toBlob(doc);
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('DOCX conversion error:', error);
            alert('Conversion failed: ' + error.message);
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '📝 → 📘 Convert to DOCX';
        }
    });
    
    downloadBtn.addEventListener('click', () => {
        if (currentDocxBlob) {
            downloadBlob(currentDocxBlob, 'converted.docx');
        }
    });
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

        // ---------- HTML to PDF via Print (with preview) ----------
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

    // Live preview
    textarea.addEventListener('input', () => {
        previewDiv.innerHTML = textarea.value;
    });

    // Print button
    printBtn.addEventListener('click', () => {
        const html = textarea.value.trim();
        if (!html) { alert('Please enter HTML'); return; }
        printBtn.disabled = true;
        printBtn.innerHTML = '⏳ Preparing print...';
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <title>HTML Print Preview</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #24292e; max-width: 900px; margin: 2rem auto; padding: 0 2rem; }
        @media print { body { margin: 0; padding: 1.5cm; } }
    </style>
</head>
<body>
    ${html}
    <script>setTimeout(() => { window.print(); }, 500);<\/script>
</body>
</html>`;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        setTimeout(() => {
            printBtn.disabled = false;
            printBtn.innerHTML = '🖨️ Print / Save as PDF';
        }, 2000);
    });
}

    // ---------- PROFESSIONAL QR CODE GENERATOR ----------
else if (toolId === 'qrmaker') {
    area.innerHTML = `
        <h3>🔳 Professional QR Code Generator</h3>
        <div class="qr-controls">
            <input type="text" id="qrText" placeholder="Enter text or URL" value="https://convert-pdf.vercel.app">
            
            <div class="qr-options-grid">
                <div class="qr-option">
                    <label>Size:</label>
                    <select id="qrSize">
                        <option value="200">Small (200px)</option>
                        <option value="300" selected>Medium (300px)</option>
                        <option value="500">Large (500px)</option>
                        <option value="1024">Print Quality (1024px)</option>
                    </select>
                </div>
                
                <div class="qr-option">
                    <label>Error Correction:</label>
                    <select id="qrErrorLevel">
                        <option value="L">Low (7%)</option>
                        <option value="M" selected>Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                    </select>
                </div>
                
                <div class="qr-option">
                    <label>Foreground:</label>
                    <input type="color" id="qrDarkColor" value="#000000">
                </div>
                
                <div class="qr-option">
                    <label>Background:</label>
                    <input type="color" id="qrLightColor" value="#ffffff">
                </div>
                
                <div class="qr-option">
                    <label>Logo (optional):</label>
                    <input type="file" id="qrLogo" accept="image/*">
                </div>
                
                <div class="qr-option">
                    <label>Format:</label>
                    <select id="qrFormat">
                        <option value="png">PNG (raster)</option>
                        <option value="svg">SVG (vector)</option>
                    </select>
                </div>
            </div>
            
            <button id="generateQrBtn" class="primary">✨ Generate QR Code</button>
        </div>
        
        <div class="preview-box" id="qrPreviewContainer">
            <div class="preview-title">Preview</div>
            <div id="qrPreview" class="qr-preview-area"></div>
        </div>
        
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
        if (!text) {
            alert('Please enter text or URL');
            return;
        }
        
        generateBtn.disabled = true;
        generateBtn.innerHTML = '⏳ Generating...';
        
        try {
            // Clear previous preview
            qrPreview.innerHTML = '';
            
            // Create canvas for QR code
            const canvas = document.createElement('canvas');
            const size = parseInt(qrSize.value);
            canvas.width = size;
            canvas.height = size;
            
            // Use QRCode library with options
            await new Promise((resolve, reject) => {
                try {
                    // @ts-ignore - QRCode is loaded globally
                    QRCode.toCanvas(
                        canvas,
                        text,
                        {
                            width: size,
                            margin: 2,
                            color: {
                                dark: qrDarkColor.value,
                                light: qrLightColor.value
                            },
                            errorCorrectionLevel: qrErrorLevel.value
                        },
                        (error) => {
                            if (error) reject(error);
                            else resolve();
                        }
                    );
                } catch (e) {
                    reject(e);
                }
            });
            
            // Add logo if provided
            if (qrLogo.files[0]) {
                const logo = await loadImage(qrLogo.files[0]);
                const ctx = canvas.getContext('2d');
                const logoSize = size * 0.2; // Logo takes 20% of QR size
                ctx.drawImage(
                    logo,
                    (size - logoSize) / 2,
                    (size - logoSize) / 2,
                    logoSize,
                    logoSize
                );
            }
            
            // Store data URL
            currentQrDataUrl = canvas.toDataURL('image/png');
            
            // Show preview
            const previewImg = document.createElement('img');
            previewImg.src = currentQrDataUrl;
            previewImg.style.maxWidth = '300px';
            previewImg.style.border = '1px solid #ccc';
            previewImg.style.borderRadius = '8px';
            qrPreview.appendChild(previewImg);
            
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('QR generation error:', error);
            alert('Failed to generate QR code: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '✨ Generate QR Code';
        }
    });
    
    // Helper to load image from file
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
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
        
        const format = qrFormat.value;
        const ext = format === 'svg' ? 'svg' : 'png';
        
        if (format === 'svg') {
            // Convert canvas to SVG (simplified - in production use a proper library)
            alert('SVG download requires additional library. Using PNG instead.');
        }
        
        // Download as PNG
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = currentQrDataUrl;
        link.click();
    });
}
    }

})();