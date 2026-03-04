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
        
        <div id="pdfMergeDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📄➕📄</div>
            <p>Drag and drop PDF files here</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="pdfMergeInput" accept=".pdf" multiple style="display: none;">
        </div>
        
        <ul id="mergeFileList" class="file-list"></ul>
        
        <div id="mergeStats" style="display:none; text-align:right; margin-bottom: 1rem; color: var(--text-light); font-size: 0.9rem;">
            Total Files: <span id="mergeTotalFiles">0</span> | Est. Size: <span id="mergeTotalSize">0 Bytes</span>
        </div>
        
        <div id="mergeProgressContainer" style="display:none; width: 100%; background-color: #e0e0e0; border-radius: 4px; margin-bottom: 1rem;">
          <div id="mergeProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>

        <button id="mergePdfBtn" disabled>🔗 Merge & download</button>
    `;

    const mergeInp = document.getElementById('pdfMergeInput');
    const mergeDropZone = document.getElementById('pdfMergeDropZone');
    const fileList = document.getElementById('mergeFileList');
    const mergeBtn = document.getElementById('mergePdfBtn');
    const mergeStats = document.getElementById('mergeStats');
    const mergeTotalFiles = document.getElementById('mergeTotalFiles');
    const mergeTotalSize = document.getElementById('mergeTotalSize');
    const progressContainer = document.getElementById('mergeProgressContainer');
    const progressBar = document.getElementById('mergeProgressBar');
    let filesArray = [];

    // Trigger file input dialog on drop zone click
    mergeDropZone.addEventListener('click', () => mergeInp.click());

    // Setup drag and drop using utils.js
    if (typeof setupDropZone === 'function') {
        setupDropZone('pdfMergeDropZone', 'pdfMergeInput');
    }

    function updateStats() {
        if (filesArray.length > 0) {
            mergeStats.style.display = 'block';
            mergeTotalFiles.textContent = filesArray.length;

            const totalBytes = filesArray.reduce((acc, file) => acc + file.size, 0);
            mergeTotalSize.textContent = typeof formatFileSize === 'function' ? formatFileSize(totalBytes) : totalBytes + ' bytes';

            mergeBtn.disabled = filesArray.length < 2;
        } else {
            mergeStats.style.display = 'none';
            mergeBtn.disabled = true;
        }
    }

    function renderFileList() {
        fileList.innerHTML = '';
        filesArray.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';

            const fileSize = typeof formatFileSize === 'function' ? formatFileSize(file.size) : Math.round(file.size / 1024) + ' KB';

            li.innerHTML = `
                <span class="file-name">${file.name} <sm style="color:var(--text-light); font-size:0.8em;">(${fileSize})</sm></span>
                <div class="file-actions">
                    <button class="move-up" ${index === 0 ? 'disabled' : ''} title="Move Up">↑</button>
                    <button class="move-down" ${index === filesArray.length - 1 ? 'disabled' : ''} title="Move Down">↓</button>
                    <button class="remove-file" style="color:#e74c3c; border-color:#fadbd8; background:#fdedec;" title="Remove">❌</button>
                </div>
            `;
            li.querySelector('.move-up')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    [filesArray[index - 1], filesArray[index]] = [filesArray[index], filesArray[index - 1]];
                    renderFileList();
                }
            });
            li.querySelector('.move-down')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < filesArray.length - 1) {
                    [filesArray[index], filesArray[index + 1]] = [filesArray[index + 1], filesArray[index]];
                    renderFileList();
                }
            });
            li.querySelector('.remove-file')?.addEventListener('click', (e) => {
                e.stopPropagation();
                filesArray.splice(index, 1);
                renderFileList();

                // Also update the input element if it matches the current array
                // Creating a DataTransfer object to modify the FileList
                const dt = new DataTransfer();
                filesArray.forEach(f => dt.items.add(f));
                mergeInp.files = dt.files;
            });
            fileList.appendChild(li);
        });

        updateStats();
    }

    mergeInp.addEventListener('change', () => {
        // Append new files instead of replacing
        if (mergeInp.files.length > 0) {
            const newFiles = Array.from(mergeInp.files);
            filesArray = [...filesArray, ...newFiles];

            // Deduplicate by name and lastModified
            const uniqueFiles = [];
            const seen = new Set();
            for (const f of filesArray) {
                const id = `${f.name}-${f.lastModified}-${f.size}`;
                if (!seen.has(id)) {
                    seen.add(id);
                    uniqueFiles.push(f);
                }
            }
            filesArray = uniqueFiles;

            renderFileList();
        }
    });

    mergeBtn.addEventListener('click', async () => {
        if (filesArray.length < 2) {
            if (window.showToast) showToast('Select at least two PDFs to merge', 'warning');
            else alert('Select at least two PDFs');
            return;
        }

        mergeBtn.disabled = true;
        mergeBtn.innerHTML = '⏳ Merging...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        try {
            const { PDFDocument } = PDFLib;
            const merged = await PDFDocument.create();
            let totalPages = 0;

            for (let i = 0; i < filesArray.length; i++) {
                const f = filesArray[i];
                mergeBtn.innerHTML = `⏳ Merging (${i + 1}/${filesArray.length})...`;
                progressBar.style.width = `${(i / filesArray.length) * 100}%`;

                const buf = await f.arrayBuffer();
                const pdf = await PDFDocument.load(buf, { ignoreEncryption: true }); // handle pass protected
                const copied = await merged.copyPages(pdf, pdf.getPageIndices());
                copied.forEach(p => merged.addPage(p));
                totalPages += pdf.getPageCount();
            }

            progressBar.style.width = '100%';
            mergeBtn.innerHTML = '💾 Saving...';

            const mergedBytes = await merged.save();
            const resultSize = typeof formatFileSize === 'function' ? formatFileSize(mergedBytes.byteLength) : mergedBytes.byteLength + " bytes";

            downloadBlob(new Blob([mergedBytes]), 'merged-document.pdf');

            if (window.showToast) showToast(`Successfully merged ${totalPages} pages (${resultSize})`);

        } catch (e) {
            if (window.showToast) showToast('Merge failed: ' + e.message, 'error');
            else alert('Merge failed: ' + e.message);
            console.error(e);
        } finally {
            mergeBtn.disabled = filesArray.length < 2;
            mergeBtn.innerHTML = '🔗 Merge & download';
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 2000);
        }
    });
}