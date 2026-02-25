// img2pdf.js
function renderimg2pdf(container) {
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
        <div class="flex-row"><input type="file" id="imgFiles" accept="image/*" multiple></div>
        <div class="orientation-selector">
            <label>📐 Page size: <select id="imgPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label>🔄 Page orientation: <select id="imgOrientation"><option value="auto">Auto</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
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
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        preview.innerHTML = '';
        for (let file of files) {
            const imgBytes = await file.arrayBuffer();
            let image;
            if (file.type === 'image/png') image = await pdfDoc.embedPng(imgBytes);
            else image = await pdfDoc.embedJpg(imgBytes);
            const dims = image.scale(1);
            let orientation = orientSel.value;
            if (orientation === 'auto') orientation = dims.width > dims.height ? 'landscape' : 'portrait';
            const stdSizes = { a4: [595, 842], letter: [612, 792] };
            let [stdW, stdH] = stdSizes[sizeSel.value];
            if (orientation === 'landscape' && stdW < stdH) [stdW, stdH] = [stdH, stdW];
            if (orientation === 'portrait' && stdW > stdH) [stdW, stdH] = [stdH, stdW];
            const page = pdfDoc.addPage([stdW, stdH]);
            const scaled = image.scaleToFit(stdW, stdH);
            page.drawImage(image, { x: (stdW - scaled.width) / 2, y: (stdH - scaled.height) / 2, width: scaled.width, height: scaled.height });
            const thumb = document.createElement('img'); thumb.src = URL.createObjectURL(file); thumb.style.width = '70px'; thumb.style.margin = '5px'; preview.appendChild(thumb);
        }
        const pdfBytes = await pdfDoc.save();
        finalPdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        down.disabled = false;
    });
    down.addEventListener('click', () => { if (finalPdfBlob) downloadBlob(finalPdfBlob, 'combined-images.pdf'); });
}