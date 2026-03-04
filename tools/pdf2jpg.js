// pdf2jpg.js
async function renderpdf2jpg(container) {
    await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
    ]);

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
            After extraction, you can also <a href="img2png.html" target="_self">convert images to PNG</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div id="pdfJpgDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕⬇️</div>
            <p>Drag and drop a .pdf file here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="pdf2jpgInput" accept=".pdf" style="display: none;">
        </div>
        <div style="margin:1rem 0;">
            <label><input type="radio" name="pageRange" value="first" checked> First page only</label><br>
            <label><input type="radio" name="pageRange" value="all"> All pages</label><br>
            <label><input type="radio" name="pageRange" value="custom"> Custom range (e.g., 1-3,5,7-9)</label>
            <input type="text" id="customRange" placeholder="1-3,5,7-9" style="margin-top:0.5rem; width:100%; max-width:300px;">
        </div>
        
        <div class="orientation-selector" style="margin-top: 1rem; margin-bottom: 1.5rem;">
            <label>🖼️ Image Quality: 
                <select id="jpgQuality">
                    <option value="1.0">Standard (1x)</option>
                    <option value="2.0" selected>High (2x)</option>
                    <option value="3.0">Ultra (3x)</option>
                </select>
            </label>
        </div>

        <button id="pdf2jpgBtn" class="primary">Convert to JPG</button>
        
        <div id="jpgProgressContainer" style="display:none; width: 100%; background-color: #e0e0e0; border-radius: 4px; margin: 1rem 0;">
          <div id="jpgProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>
        
        <div class="preview-box" id="jpgProgress" style="min-height:50px; display: none; text-align: center; margin-top: 1rem;"></div>
        
        <div id="jpgImagePreviews" class="file-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1.5rem;"></div>
        
        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1.5rem;">
            <button id="downloadJpgBtn" class="download-btn" disabled>⬇ Download JPG(s)</button>
        </div>
    `;

    const inp = document.getElementById('pdf2jpgInput');
    const dropZone = document.getElementById('pdfJpgDropZone');
    const btn = document.getElementById('pdf2jpgBtn');
    const progressDiv = document.getElementById('jpgProgress');
    const progressContainer = document.getElementById('jpgProgressContainer');
    const progressBar = document.getElementById('jpgProgressBar');
    const previewsDiv = document.getElementById('jpgImagePreviews');
    const qualitySel = document.getElementById('jpgQuality');
    const downloadBtn = document.getElementById('downloadJpgBtn');
    const firstRadio = document.querySelector('input[name="pageRange"][value="first"]');
    const allRadio = document.querySelector('input[name="pageRange"][value="all"]');
    const customRadio = document.querySelector('input[name="pageRange"][value="custom"]');
    const customInput = document.getElementById('customRange');
    let generatedBlobs = [];

    // Setup drag and drop
    dropZone.addEventListener('click', () => inp.click());
    if (typeof setupDropZone === 'function') {
        setupDropZone('pdfJpgDropZone', 'pdf2jpgInput');
    }

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
        return Array.from(pages).sort((a, b) => a - b);
    }

    btn.addEventListener('click', async () => {
        const file = inp.files[0];
        if (!file) {
            if (window.showToast) showToast('Please select a PDF file first.', 'warning');
            else alert('Please select a PDF file first.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '⏳ Loading PDF...';
        progressDiv.style.display = 'block';
        progressDiv.innerHTML = 'Loading PDF...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        previewsDiv.innerHTML = '';
        generatedBlobs = [];
        downloadBtn.disabled = true;

        try {
            const arrayBuf = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
            const totalPages = pdf.numPages;
            let pagesToExtract = [];

            if (firstRadio.checked) {
                pagesToExtract = [1];
            } else if (allRadio.checked) {
                pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
            } else if (customRadio.checked) {
                pagesToExtract = parsePageRange(customInput.value, totalPages);
                if (pagesToExtract.length === 0) {
                    alert('No valid pages in range, using first page.');
                    pagesToExtract = [1];
                }
            }

            progressDiv.innerHTML = `Extracting ${pagesToExtract.length} pages...`;
            const scaleMultiplier = parseFloat(qualitySel.value) || 2.0;

            for (let i = 0; i < pagesToExtract.length; i++) {
                const pageNum = pagesToExtract[i];
                btn.innerHTML = `⏳ Rendering page ${pageNum} (${i + 1}/${pagesToExtract.length})`;
                progressBar.style.width = `${(i / pagesToExtract.length) * 100}%`;

                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: scaleMultiplier });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport }).promise;
                const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
                generatedBlobs.push({ blob, pageNum });

                // Add to preview area
                const previewImg = document.createElement('img');
                previewImg.src = URL.createObjectURL(blob);
                previewImg.className = 'preview-box';
                previewImg.style.width = '100%';
                previewImg.style.height = 'auto';
                previewImg.style.margin = '0';
                previewImg.style.padding = '0.5rem';
                previewImg.style.display = 'block';
                previewImg.title = `Page ${pageNum}`;

                const card = document.createElement('div');
                card.style.position = 'relative';
                const label = document.createElement('div');
                label.textContent = `Page ${pageNum}`;
                label.style.position = 'absolute';
                label.style.bottom = '10px';
                label.style.left = '50%';
                label.style.transform = 'translateX(-50%)';
                label.style.background = 'rgba(0,0,0,0.6)';
                label.style.color = 'white';
                label.style.padding = '2px 8px';
                label.style.borderRadius = '12px';
                label.style.fontSize = '0.8rem';

                card.appendChild(previewImg);
                card.appendChild(label);
                previewsDiv.appendChild(card);
            }

            progressBar.style.width = '100%';
            progressDiv.innerHTML = 'Done!';
            downloadBtn.disabled = false;

            if (window.showToast) showToast(`Successfully extracted ${pagesToExtract.length} pages`);

            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressDiv.style.display = 'none';
            }, 2000);

        } catch (e) {
            progressDiv.innerHTML = `Error: ${e.message}`;
            if (window.showToast) showToast('Failed to extract images: ' + e.message, 'error');
            console.error(e);
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
            generatedBlobs.forEach(({ blob, pageNum }) => zip.file(`page-${pageNum}.jpg`, blob));
            const content = await zip.generateAsync({ type: 'blob' });
            downloadBlob(content, 'pdf-pages.zip');
        }
    });
}