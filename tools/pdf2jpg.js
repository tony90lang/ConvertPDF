// pdf2jpg.js
async function renderpdf2jpg(container) {
    await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    ]);

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Extract images from PDF pages. Choose first page, all pages, or a custom range. Download as ZIP. 100% private, no uploads.");
    updatePageTitle("PDF to JPG Converter");

    area.innerHTML = `
        <h3>📸 PDF → JPG</h3>
        <p class="tool-description">
            Extract images from PDF pages. Choose first page, all pages, or a custom range.
            Download individual images or a ZIP file. Perfect for presentations or social media.
            After extraction, you can also <a href="#tool=img2png" target="_self">convert images to PNG</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
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
            downloadBlob(generatedBlobs[0].blob, `pdf-page-${generatedBlobs[0].pageNum}.jpg`);
        } else {
            const zip = new JSZip();
            generatedBlobs.forEach(({blob, pageNum}) => zip.file(`page-${pageNum}.jpg`, blob));
            const content = await zip.generateAsync({ type: 'blob' });
            downloadBlob(content, 'pdf-pages.zip');
        }
    });
}