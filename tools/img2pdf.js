// img2pdf.js
async function renderimg2pdf(container) {
    try {
    await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Combine multiple JPG/PNG images into a single PDF. Auto‑orientation and page size control. 100% private, no uploads.");
    updatePageTitle("Images to PDF Converter");

    area.innerHTML = `
        <h3>🖼️ Select images (multiple)</h3>
        <p class="tool-description">
            Combine multiple images into a single PDF. Automatically adjusts orientation and page size.
            Great for creating portfolios, presentations, or scanned document collections.
            After creating your PDF, you can also <a href="pdfencrypt.html" target="_self">password‑protect</a> it.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>What image formats are supported?</summary>
                <p>JPG and PNG are fully supported. Other formats may be converted automatically.</p>
            </details>
        </div>
        <div id="imgPdfDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🖼️➕📄</div>
            <p>Drag and drop images here (JPG, PNG, WebP)</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="imgFiles" accept="image/*" multiple style="display: none;">
        </div>
        <div class="orientation-selector">
            <label>📐 Page size: 
                <select id="imgPageSize">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                </select>
            </label>
            <label>🔄 Page orientation: 
                <select id="imgOrientation">
                    <option value="auto">Auto</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                </select>
            </label>
            <label>📏 Margin: 
                <select id="imgMargin">
                    <option value="0">No margin (0px)</option>
                    <option value="20">Small (20px)</option>
                    <option value="50">Medium (50px)</option>
                    <option value="100">Large (100px)</option>
                </select>
            </label>
        </div>
        <div id="imagePreviewList" class="file-list"></div>
        <div id="imgProgressContainer" style="display:none; width: 100%; background-color: #e0e0e0; border-radius: 4px; margin-bottom: 1rem;">
          <div id="imgProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>
        <button id="convertImgBtn" class="primary" disabled>📸→📁 Generate PDF</button>
        <div class="preview-box" id="imgPreviewBox" style="display:none;">
            <div class="preview-title">Generated PDF Preview</div>
            <div id="imgPreviewPlaceholder">PDF preview will appear here after generation.</div>
        </div>
        <button id="downloadImgPdf" class="download-btn" disabled>⬇ Download PDF</button>
    `;

    const input = document.getElementById('imgFiles');
    const dropZone = document.getElementById('imgPdfDropZone');
    const previewList = document.getElementById('imagePreviewList');
    const sizeSel = document.getElementById('imgPageSize');
    const orientSel = document.getElementById('imgOrientation');
    const marginSel = document.getElementById('imgMargin');
    const convertBtn = document.getElementById('convertImgBtn');
    const down = document.getElementById('downloadImgPdf');
    const previewBox = document.getElementById('imgPreviewBox');
    const previewPlaceholder = document.getElementById('imgPreviewPlaceholder');
    const progressContainer = document.getElementById('imgProgressContainer');
    const progressBar = document.getElementById('imgProgressBar');
    let filesArray = [];

    // Setup drag and drop
    dropZone.addEventListener('click', () => input.click());
    if (typeof setupDropZone === 'function') {
        setupDropZone('imgPdfDropZone', 'imgFiles');
    }

    function renderPreviewList() {
        previewList.innerHTML = '';
        filesArray.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            // create thumbnail
            const thumb = document.createElement('img');
            thumb.src = URL.createObjectURL(file);
            thumb.style.width = '50px';
            thumb.style.height = '50px';
            thumb.style.objectFit = 'cover';
            thumb.style.borderRadius = '8px';
            thumb.style.marginRight = '10px';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-name';
            nameSpan.textContent = file.name;
            const actions = document.createElement('div');
            actions.className = 'file-actions';
            const upBtn = document.createElement('button');
            upBtn.textContent = '↑';
            upBtn.className = 'move-up';
            upBtn.title = 'Move Up';
            upBtn.disabled = index === 0;
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    [filesArray[index - 1], filesArray[index]] = [filesArray[index], filesArray[index - 1]];
                    renderPreviewList();
                }
            });
            const downBtn = document.createElement('button');
            downBtn.textContent = '↓';
            downBtn.className = 'move-down';
            downBtn.title = 'Move Down';
            downBtn.disabled = index === filesArray.length - 1;
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < filesArray.length - 1) {
                    [filesArray[index], filesArray[index + 1]] = [filesArray[index + 1], filesArray[index]];
                    renderPreviewList();
                }
            });
            const delBtn = document.createElement('button');
            delBtn.textContent = '❌';
            delBtn.className = 'remove-file';
            delBtn.title = 'Remove';
            delBtn.style.color = '#e74c3c';
            delBtn.style.borderColor = '#fadbd8';
            delBtn.style.background = '#fdedec';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                filesArray.splice(index, 1);
                renderPreviewList();

                // Update file input
                const dt = new DataTransfer();
                filesArray.forEach(f => dt.items.add(f));
                input.files = dt.files;
            });
            actions.appendChild(upBtn);
            actions.appendChild(downBtn);
            actions.appendChild(delBtn);
            li.appendChild(thumb);
            li.appendChild(nameSpan);
            li.appendChild(actions);
            previewList.appendChild(li);
        });
        convertBtn.disabled = filesArray.length === 0;
    }

    input.addEventListener('change', () => {
        if (input.files.length > 0) {
            const newFiles = Array.from(input.files);
            filesArray = [...filesArray, ...newFiles];
            renderPreviewList();
            previewBox.style.display = 'none';
            down.disabled = true;
        }
    });

    // Helper to convert non-standard images (like WebP) to JPEG format via canvas
    function convertToJpegBytes(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    blob.arrayBuffer().then(resolve).catch(reject);
                    URL.revokeObjectURL(url);
                }, 'image/jpeg', 0.95);
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
            img.src = url;
        });
    }

    convertBtn.addEventListener('click', async () => {
        if (filesArray.length === 0) {
            if (window.showToast) showToast('Please select at least one image.', 'warning');
            else alert('Please select at least one image.');
            return;
        }
        convertBtn.disabled = true;
        convertBtn.innerHTML = '⏳ Generating PDF...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        previewBox.style.display = 'block';
        previewPlaceholder.innerHTML = 'Converting images...';

        try {
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            const margin = parseInt(marginSel.value, 10);

            for (let i = 0; i < filesArray.length; i++) {
                const file = filesArray[i];
                convertBtn.innerHTML = `⏳ Processing image ${i + 1} of ${filesArray.length}...`;
                progressBar.style.width = `${(i / filesArray.length) * 100}%`;

                let imgBytes;
                let image;

                // convert WebP or other unsupported types to JPEG first
                if (file.type === 'image/webp' || (!file.type.includes('png') && !file.type.includes('jpeg') && !file.type.includes('jpg'))) {
                    imgBytes = await convertToJpegBytes(file);
                    image = await pdfDoc.embedJpg(imgBytes);
                } else {
                    imgBytes = await file.arrayBuffer();
                    if (file.type === 'image/png') {
                        image = await pdfDoc.embedPng(imgBytes);
                    } else {
                        image = await pdfDoc.embedJpg(imgBytes);
                    }
                }
                const dims = image.scale(1);
                let orientation = orientSel.value;
                if (orientation === 'auto') {
                    orientation = dims.width > dims.height ? 'landscape' : 'portrait';
                }
                const stdSizes = { a4: [595, 842], letter: [612, 792] };
                let [stdW, stdH] = stdSizes[sizeSel.value];
                if (orientation === 'landscape' && stdW < stdH) [stdW, stdH] = [stdH, stdW];
                if (orientation === 'portrait' && stdW > stdH) [stdW, stdH] = [stdH, stdW];

                const page = pdfDoc.addPage([stdW, stdH]);

                // Account for margins
                const contentW = stdW - (margin * 2);
                const contentH = stdH - (margin * 2);

                const scaled = image.scaleToFit(contentW, contentH);
                page.drawImage(image, {
                    x: margin + (contentW - scaled.width) / 2,
                    y: margin + (contentH - scaled.height) / 2,
                    width: scaled.width,
                    height: scaled.height,
                });
            }

            progressBar.style.width = '100%';
            convertBtn.innerHTML = '💾 Saving...';

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            // Store blob for download
            window.currentPdfBlob = blob;
            down.disabled = false;

            // Show simple preview (embed iframe)
            const blobUrl = URL.createObjectURL(blob);
            previewPlaceholder.innerHTML = `<iframe src="${blobUrl}" style="width:100%; height:400px;" frameborder="0"></iframe>`;

            convertBtn.disabled = false;
            convertBtn.innerHTML = '📸→📁 Generate PDF';
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            }, 2000);

            if (window.showToast) showToast('PDF generated successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            if (window.showToast) showToast('Failed to generate PDF: ' + error.message, 'error');
            else alert('Failed to generate PDF: ' + error.message);
            previewPlaceholder.innerHTML = 'Error generating PDF.';
            convertBtn.disabled = false;
            convertBtn.innerHTML = '📸→📁 Generate PDF';
            progressContainer.style.display = 'none';
        }
    });

    down.addEventListener('click', () => {
        if (window.currentPdfBlob) {
            downloadBlob(window.currentPdfBlob, 'combined-images.pdf');
        }
    });
    } catch (___err) {
        console.error('renderimg2pdf error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}
