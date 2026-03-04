// md2pdf.js
async function rendermd2pdf(container) {
    await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js')
    ]);
    await loadStylesheet('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css');
    await loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css');

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Convert Markdown to PDF with LaTeX math, syntax highlighting, and custom page breaks. 100% private, no uploads.");
    updatePageTitle("Markdown to PDF Converter");

    area.innerHTML = `
        <h3>📂 Upload .md file</h3>
        <p class="tool-description">
            Convert Markdown to PDF with LaTeX math, syntax highlighting, and custom page breaks.
            Perfect for technical documentation, research papers, and coding notes.
            After conversion, you can also <a href="pdf2jpg.html" target="_self">extract images</a> from the PDF or <a href="qrmaker.html" target="_self">generate a QR code</a> for your document.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>Can I use LaTeX math?</summary>
                <p>Yes, we support KaTeX. Use $...$ for inline and $$...$$ for display math.</p>
            </details>
            <details>
                <summary>How do I insert a page break?</summary>
                <p>Use <code>\\newpage</code> or <code>&lt;!-- pagebreak --&gt;</code> in your Markdown.</p>
            </details>
        </div>
        <div id="mdPdfDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📝➕📄</div>
            <p>Drag and drop a .md file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="mdFile" accept=".md,text/markdown" style="display: none;">
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap;">
            <div class="orientation-selector" style="margin: 0;">
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
            </div>
            <label style="margin-left: auto; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="mdDarkTheme"> 🌙 Dark Preview
            </label>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-direction: column;">
                <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">Markdown Editor</div>
                <textarea id="mdEditor" spellcheck="false" placeholder="Type or paste Markdown here... Use $...$ for math, \\newpage for page breaks." style="flex: 1; min-height: 400px; resize: vertical; padding: 1rem; font-family: monospace; border: 1px solid var(--border-medium); border-radius: var(--radius-md); background: #fdfdfd;"></textarea>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">Live Preview</div>
                <div class="preview-box" id="mdPreviewBox" style="margin: 0; flex: 1; height: 100%; min-height: 400px; overflow-y: auto; background: white; border: 1px solid var(--border-medium);">
                    <div id="mdRendered"></div>
                </div>
            </div>
        </div>

        <button id="printMdBtn" class="primary">🖨️ Generate PDF</button>
        <p class="note" style="margin-top: 1rem; text-align: center;">💡 Insert page breaks using <code>\\newpage</code> or <code>&lt;!-- pagebreak --&gt;</code></p>
    `;

    const mdFile = document.getElementById('mdFile');
    const mdDropZone = document.getElementById('mdPdfDropZone');
    const mdEditor = document.getElementById('mdEditor');
    const mdRendered = document.getElementById('mdRendered');
    const mdPreviewBox = document.getElementById('mdPreviewBox');
    const mdDarkTheme = document.getElementById('mdDarkTheme');
    const sizeSelect = document.getElementById('mdPageSize');
    const orientSelect = document.getElementById('mdOrientation');
    const printBtn = document.getElementById('printMdBtn');

    // Setup drag and drop
    mdDropZone.addEventListener('click', () => mdFile.click());
    if (typeof setupDropZone === 'function') {
        setupDropZone('mdPdfDropZone', 'mdFile');
    }

    const printStyles = (theme = 'light') => `
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'};
                background: ${theme === 'dark' ? '#0d1117' : 'white'};
                max-width: 900px;
                margin: ${theme === 'print' ? '2.54cm !important' : '0 auto'};
                padding: ${theme === 'print' ? '0 !important' : '1rem'};
            }
            .markdown-body {
                color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'};
            }
            h1, h2, h3, h4, h5, h6 { 
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
                line-height: 1.25;
                color: inherit;
                page-break-after: avoid;
            }
            h1 { font-size: 2em; border-bottom: 1px solid ${theme === 'dark' ? '#21262d' : '#eaecef'}; padding-bottom: 0.3rem; }
            h2 { font-size: 1.5em; border-bottom: 1px solid ${theme === 'dark' ? '#21262d' : '#eaecef'}; padding-bottom: 0.3rem; }
            p { margin: 0 0 1rem; orphans: 3; widows: 3; }
            code, pre { font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 0.9rem; border-radius: 3px; }
            code { padding: 0.2rem 0.4rem; color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'}; background: ${theme === 'dark' ? 'rgba(110,118,129,0.4)' : '#f6f8fa'}; }
            pre { padding: 1rem; overflow: auto; line-height: 1.45; background: ${theme === 'dark' ? '#161b22' : '#f6f8fa'}; border-radius: 6px; page-break-inside: avoid; }
            pre code { background: none; padding: 0; color: ${theme === 'dark' ? '#c9d1d9' : '#24292e'}; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; page-break-inside: avoid; }
            th, td { border: 1px solid ${theme === 'dark' ? '#30363d' : '#dfe2e5'}; padding: 0.6rem 1rem; text-align: left; }
            th { background: ${theme === 'dark' ? '#21262d' : '#f6f8fa'}; font-weight: 600; }
            tr:nth-child(even) { background: ${theme === 'dark' ? '#161b22' : '#fafbfc'}; }
            blockquote { margin: 0; padding: 0 1rem; color: ${theme === 'dark' ? '#8b949e' : '#6a737d'}; border-left: 0.25rem solid ${theme === 'dark' ? '#30363d' : '#dfe2e5'}; }
            img { max-width: 100%; height: auto; page-break-inside: avoid; }
            ul, ol { padding-left: 2rem; margin: 1rem 0; page-break-inside: avoid; }
            li { margin: 0.25rem 0; }
            hr { height: 0.25rem; padding: 0; margin: 2rem 0; background: ${theme === 'dark' ? '#30363d' : '#e1e4e8'}; border: 0; }
            .page-break { page-break-before: always; height: 0; margin: 0; padding: 0; }
            @media print {
                body { margin: 2.54cm !important; padding: 0 !important; background: white !important; color: black !important; }
                .markdown-body { color: black !important; }
                pre, table, img, ul, ol { break-inside: avoid; }
                h1, h2, h3, h4, h5, h6 { break-after: avoid; }
                code { background: #f6f8fa !important; color: black !important; border: 1px solid #ccc; }
                pre { background: #f6f8fa !important; border: 1px solid #ccc; }
                pre code { border: none !important; }
            }
        </style>
    `;

    function preprocessMarkdown(text) {
        text = text.replace(/\\newpage/g, '<div class="page-break"></div>');
        text = text.replace(/<!--\s*pagebreak\s*-->/g, '<div class="page-break"></div>');
        return text;
    }

    marked.setOptions({ gfm: true, breaks: true, headerIds: true, html: true, highlight: (code, lang) => code });

    // Debounce function for live preview
    let timeoutId;
    function debounce(func, delay) {
        return function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    // Render markdown to preview pane
    // Use the katex renderMathInElement to render math client-side
    function renderPreview() {
        const text = mdEditor.value;
        const processed = preprocessMarkdown(text);

        // Setup marked to preserve math blocks for KaTeX
        const renderer = new marked.Renderer();
        const oldCode = renderer.code.bind(renderer);
        renderer.code = function (code, language, isEscaped) {
            if (language === 'math') {
                return '$$' + code + '$$';
            }
            return oldCode(code, language, isEscaped);
        };

        const html = marked.parse(processed, { renderer });

        const theme = mdDarkTheme.checked ? 'dark' : 'light';
        mdPreviewBox.style.background = theme === 'dark' ? '#0d1117' : 'white';

        mdRendered.innerHTML = printStyles(theme) + `<div class="markdown-body" style="padding: 1rem;">${html}</div>`;

        // Render math
        if (window.renderMathInElement) {
            try {
                renderMathInElement(mdRendered, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.error("Math render error:", e);
            }
        }

        // Highlight code
        if (window.Prism) {
            try {
                Prism.highlightAllUnder(mdRendered);
            } catch (e) {
                console.error("Prism error", e);
            }
        }
    }

    // Bind events
    mdEditor.addEventListener('input', debounce(renderPreview, 300));

    mdDarkTheme.addEventListener('change', renderPreview);

    mdFile.addEventListener('change', async () => {
        const file = mdFile.files[0];
        if (!file) return;
        const text = await file.text();
        mdEditor.value = text;
        renderPreview();
    });

    // Default rendering
    renderPreview();

    printBtn.addEventListener('click', async () => {
        const text = mdEditor.value;
        if (!text.trim()) {
            if (window.showToast) showToast('Please enter or upload some Markdown content.', 'warning');
            else alert('Please enter or upload some Markdown content.');
            return;
        }
        printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';
        try {
            const processed = preprocessMarkdown(text);
            const html = marked.parse(processed);
            const fullHtml = `<!DOCTYPE html>
<html><head><title>ConvertPDF - Markdown Document</title>${printStyles('print')}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\\\[',right:'\\\\]',display:true},{left:'\\\\(',right:'\\\\)',display:false}]}); window.print();"></script>
<style>
@page { size: ${sizeSelect.value} ${orientSelect.value}; }
@media print { body { margin: 2.54cm; } }
</style>
</head><body><div class="markdown-body">${html}</div>
<script>
    setTimeout(()=>{ 
        if(window.Prism) Prism.highlightAll();
        setTimeout(() => window.print(), 500); 
    }, 500);
<\/script></body></html>`;
            const win = window.open('', '_blank');
            if (!win) {
                if (window.showToast) showToast('Pop‑up blocked by browser.', 'error');
                else alert('Pop‑up blocked');
                printBtn.disabled = false;
                printBtn.innerHTML = '🖨️ Generate PDF';
                return;
            }
            win.document.write(fullHtml); win.document.close();
            setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Generate PDF'; }, 3000);
        } catch (e) {
            if (window.showToast) showToast('Error: ' + e.message, 'error');
            else alert('Error: ' + e.message);
            printBtn.disabled = false;
            printBtn.innerHTML = '🖨️ Generate PDF';
        }
    });
}