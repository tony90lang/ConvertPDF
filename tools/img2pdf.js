// img2pdf.js
async function renderimg2pdf(container) {
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
            After creating your PDF, you can also <a href="#tool=pdfencrypt" target="_self">password‑protect</a> it.
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
        <div class="flex-row">
            <input type="file" id="imgFiles" accept="image/*" multiple>
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
        </div>
        <div id="imagePreviewList" class="file-list"></div>
        <button id="convertImgBtn" class="primary">📸→📁 Generate PDF</button>
        <div class="preview-box" id="imgPreviewBox" style="display:none;">
            <div class="preview-title">Generated PDF Preview</div>
            <div id="imgPreviewPlaceholder">PDF preview will appear here after generation.</div>
        </div>
        <button id="downloadImgPdf" class="download-btn" disabled>⬇ Download PDF</button>
    `;

    const input = document.getElementById('imgFiles');
    const previewList = document.getElementById('imagePreviewList');
    const sizeSel = document.getElementById('imgPageSize');
    const orientSel = document.getElementById('imgOrientation');
    const convertBtn = document.getElementById('convertImgBtn');
    const down = document.getElementById('downloadImgPdf');
    const previewBox = document.getElementById('imgPreviewBox');
    const previewPlaceholder = document.getElementById('imgPreviewPlaceholder');
    let filesArray = [];

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
            upBtn.disabled = index === 0;
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index > 0) {
                    [filesArray[index-1], filesArray[index]] = [filesArray[index], filesArray[index-1]];
                    renderPreviewList();
                }
            });
            const downBtn = document.createElement('button');
            downBtn.textContent = '↓';
            downBtn.className = 'move-down';
            downBtn.disabled = index === filesArray.length-1;
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (index < filesArray.length-1) {
                    [filesArray[index], filesArray[index+1]] = [filesArray[index+1], filesArray[index]];
                    renderPreviewList();
                }
            });
            actions.appendChild(upBtn);
            actions.appendChild(downBtn);
            li.appendChild(thumb);
            li.appendChild(nameSpan);
            li.appendChild(actions);
            previewList.appendChild(li);
        });
    }

    input.addEventListener('change', () => {
        filesArray = Array.from(input.files);
        renderPreviewList();
        // hide previous preview box
        previewBox.style.display = 'none';
        down.disabled = true;
    });

    convertBtn.addEventListener('click', async () => {
        if (filesArray.length === 0) {
            alert('Please select at least one image.');
            return;
        }
        convertBtn.disabled = true;
        convertBtn.innerHTML = '⏳ Generating PDF...';
        previewBox.style.display = 'block';
        previewPlaceholder.innerHTML = 'Rendering pages...';

        try {
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.create();

            for (let file of filesArray) {
                const imgBytes = await file.arrayBuffer();
                let image;
                if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(imgBytes);
                } else {
                    image = await pdfDoc.embedJpg(imgBytes);
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
                const scaled = image.scaleToFit(stdW, stdH);
                page.drawImage(image, {
                    x: (stdW - scaled.width) / 2,
                    y: (stdH - scaled.height) / 2,
                    width: scaled.width,
                    height: scaled.height,
                });
            }

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
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF: ' + error.message);
            previewPlaceholder.innerHTML = 'Error generating PDF.';
            convertBtn.disabled = false;
            convertBtn.innerHTML = '📸→📁 Generate PDF';
        }
    });

    down.addEventListener('click', () => {
        if (window.currentPdfBlob) {
            downloadBlob(window.currentPdfBlob, 'combined-images.pdf');
        }
    });
}