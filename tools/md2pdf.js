// md2pdf.js
async function rendermd2pdf(container) {
    // Load required libraries
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
            After conversion, you can also <a href="#tool=pdf2jpg" target="_self">extract images</a> from the PDF or <a href="#tool=qrmaker" target="_self">generate a QR code</a> for your document.
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
    const printBtn = document.getElementById('printMdBtn');

    const printStyles = (theme = 'light') => `
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #24292e;
                background: white;
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
            h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3rem; }
            h2 { font-size: 1.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.3rem; }
            p { margin: 0 0 1rem; orphans: 3; widows: 3; }
            code, pre { font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 0.9rem; background: #f6f8fa; border-radius: 3px; }
            code { padding: 0.2rem 0.4rem; color: #24292e; }
            pre { padding: 1rem; overflow: auto; line-height: 1.45; background: #f6f8fa; border-radius: 6px; page-break-inside: avoid; }
            pre code { background: none; padding: 0; color: #24292e; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; page-break-inside: avoid; }
            th, td { border: 1px solid #dfe2e5; padding: 0.6rem 1rem; text-align: left; }
            th { background: #f6f8fa; font-weight: 600; }
            tr:nth-child(even) { background: #fafbfc; }
            blockquote { margin: 0; padding: 0 1rem; color: #6a737d; border-left: 0.25rem solid #dfe2e5; }
            img { max-width: 100%; height: auto; page-break-inside: avoid; }
            ul, ol { padding-left: 2rem; margin: 1rem 0; page-break-inside: avoid; }
            li { margin: 0.25rem 0; }
            hr { height: 0.25rem; padding: 0; margin: 2rem 0; background: #e1e4e8; border: 0; }
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
        mdRendered.innerHTML = printStyles() + `<div class="markdown-body">${html}</div>`;
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
            const fullHtml = `<!DOCTYPE html>
<html><head><title>${file.name} - Print</title>${printStyles()}
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