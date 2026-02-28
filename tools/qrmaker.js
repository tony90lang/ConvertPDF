// qrmaker.js
async function renderqrmaker(container) {
    await loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js');

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Create custom QR codes with colors, error correction, and optional logo. Download as PNG or SVG. 100% private, no uploads.");
    updatePageTitle("QR Code Generator");

    area.innerHTML = `
        <h3>🔳 Professional QR Code Generator</h3>
        <p class="tool-description">
            Create custom QR codes with your own colors, logo, and error correction level.
            Download as PNG for web or SVG for print. Great for marketing, business cards, and links.
            After generating, you can also <a href="img2png.html" target="_self">convert the QR to PNG</a> (if needed).
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my data uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your data never leaves your device.</p>
            </details>
        </div>
        <div class="qr-controls">
            <input type="text" id="qrText" placeholder="Enter text or URL" value="https://convert-pdf.vercel.app">
            <div class="qr-options-grid">
                <div class="qr-option"><label>Size:</label><select id="qrSize"><option value="200">Small</option><option value="300" selected>Medium</option><option value="500">Large</option><option value="1024">Print</option></select></div>
                <div class="qr-option"><label>Error Correction:</label><select id="qrErrorLevel"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></div>
                <div class="qr-option"><label>Foreground:</label><input type="color" id="qrDarkColor" value="#000000"></div>
                <div class="qr-option"><label>Background:</label><input type="color" id="qrLightColor" value="#ffffff"></div>
                <div class="qr-option"><label>Logo (optional):</label><input type="file" id="qrLogo" accept="image/*"></div>
                <div class="qr-option"><label>Format:</label><select id="qrFormat"><option value="png">PNG</option><option value="svg">SVG</option></select></div>
            </div>
            <button id="generateQrBtn" class="primary">✨ Generate QR Code</button>
        </div>
        <div class="preview-box"><div class="preview-title">Preview</div><div id="qrPreview"></div></div>
        <button id="downloadQrBtn" class="download-btn" disabled>⬇ Download QR Code</button>
    `;

    const qrText = document.getElementById('qrText');
    const qrSize = document.getElementById('qrSize');
    const qrErrorLevel = document.getElementById('qrErrorLevel');
    const qrDarkColor = document.getElementById('qrDarkColor');
    const qrLightColor = document.getElementById('qrLightColor');
    const qrLogo = document.getElementById('qrLogo');
    const qrFormat = document.getElementById('qrFormat');
    const generateBtn = document.getElementById('generateQrBtn');
    const downloadBtn = document.getElementById('downloadQrBtn');
    const qrPreview = document.getElementById('qrPreview');
    let currentQrDataUrl = null;
    let currentSvgString = null;

    generateBtn.addEventListener('click', async () => {
        const text = qrText.value.trim();
        if (!text) { alert('Enter text'); return; }
        generateBtn.disabled = true; generateBtn.innerHTML = '⏳ Generating...';
        qrPreview.innerHTML = '';
        currentQrDataUrl = null;
        currentSvgString = null;

        try {
            if (qrFormat.value === 'svg') {
                QRCode.toString(text, {
                    type: 'svg',
                    width: parseInt(qrSize.value),
                    margin: 2,
                    color: { dark: qrDarkColor.value, light: qrLightColor.value },
                    errorCorrectionLevel: qrErrorLevel.value
                }, (err, svg) => {
                    if (err) throw err;
                    currentSvgString = svg;
                    const previewDiv = document.createElement('div');
                    previewDiv.innerHTML = svg;
                    qrPreview.appendChild(previewDiv);
                    downloadBtn.disabled = false;
                });
            } else {
                const canvas = document.createElement('canvas');
                const size = parseInt(qrSize.value);
                canvas.width = size; canvas.height = size;
                await QRCode.toCanvas(canvas, text, {
                    width: size,
                    margin: 2,
                    color: { dark: qrDarkColor.value, light: qrLightColor.value },
                    errorCorrectionLevel: qrErrorLevel.value
                });
                if (qrLogo.files[0]) {
                    const logo = await loadImage(qrLogo.files[0]);
                    const ctx = canvas.getContext('2d');
                    const logoSize = size * 0.2;
                    ctx.drawImage(logo, (size-logoSize)/2, (size-logoSize)/2, logoSize, logoSize);
                }
                currentQrDataUrl = canvas.toDataURL('image/png');
                const previewImg = document.createElement('img');
                previewImg.src = currentQrDataUrl;
                previewImg.style.maxWidth = '300px';
                qrPreview.appendChild(previewImg);
                downloadBtn.disabled = false;
            }
        } catch (e) { alert('QR generation failed: '+e.message); } finally {
            generateBtn.disabled = false; generateBtn.innerHTML = '✨ Generate QR Code';
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (qrFormat.value === 'svg' && currentSvgString) {
            const blob = new Blob([currentSvgString], { type: 'image/svg+xml' });
            downloadBlob(blob, 'qrcode.svg');
        } else if (currentQrDataUrl) {
            const link = document.createElement('a');
            link.download = 'custom-qrcode.png';
            link.href = currentQrDataUrl;
            link.click();
        }
    });
}