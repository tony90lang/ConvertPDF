// mergepdf.js
async function rendermergepdf(container) {
    await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Combine multiple PDF files into one with drag‑to‑reorder. 100% private, no uploads.");
    updatePageTitle("Merge PDFs Online");

    area.innerHTML = `
        <h3>📚 Select multiple PDFs</h3>
        <p class="tool-description">
            Combine multiple PDF files into one. Drag to reorder pages before merging.
            Perfect for consolidating reports, invoices, or research papers.
            After merging, you can also <a href="pdfencrypt.html" target="_self">password‑protect</a> the result.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
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
            downloadBlob(new Blob([mergedBytes]), 'merged-document.pdf');
        } catch (e) { alert('Merge failed: ' + e.message); } finally {
            mergeBtn.disabled = false; mergeBtn.innerHTML = '🔗 Merge & download';
        }
    });
}