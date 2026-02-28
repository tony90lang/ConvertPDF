// img2png.js
function renderimg2png(container) {
    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Convert any image (JPG, GIF, BMP) to PNG format with lossless quality. 100% private, no uploads.");
    updatePageTitle("Image to PNG Converter");

    area.innerHTML = `
        <h3>🎨 Convert any image to PNG</h3>
        <p class="tool-description">
            Convert any image (JPG, GIF, BMP) to PNG format. Lossless and high quality.
            Ideal for web graphics, logos, and transparent images.
            After conversion, you can also <a href="web2pdf.html" target="_self">turn it into PDF</a>.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div class="flex-row"><input type="file" id="anyImgInput" accept="image/*"></div>
        <button id="toPngBtn" class="primary">Convert to PNG</button>
        <div class="preview-box"><img id="pngPreview" style="max-width:200px; max-height:200px;"></div>
        <button id="downloadPngBtn" class="download-btn" disabled>⬇ Download PNG</button>
    `;

    const inp = document.getElementById('anyImgInput');
    const conv = document.getElementById('toPngBtn');
    const imgPrev = document.getElementById('pngPreview');
    const dPng = document.getElementById('downloadPngBtn');
    let pngBlob = null;

    conv.addEventListener('click', () => {
        const f = inp.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                canvas.toBlob(blob => { pngBlob = blob; dPng.disabled = false; imgPrev.src = canvas.toDataURL(); }, 'image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(f);
    });
    dPng.addEventListener('click', () => { if (pngBlob) downloadBlob(pngBlob, 'converted-image.png'); });
}