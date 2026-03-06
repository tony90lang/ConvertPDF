// qrmaker.js
async function renderqrmaker(container) {
    try {
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
            <textarea id="qrText" placeholder="Enter text or URL (one per line for batch generation)" style="width: 100%; min-height: 80px; padding: 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium); margin-bottom: 1rem; font-family: inherit;">https://convert-pdf.vercel.app</textarea>
            
            <div class="qr-options-grid">
                <div class="qr-option"><label>Size:</label><select id="qrSize"><option value="200">Small</option><option value="300" selected>Medium</option><option value="500">Large</option><option value="1024">Print</option></select></div>
                <div class="qr-option"><label>Error Correction:</label><select id="qrErrorLevel"><option value="L">Low</option><option value="M" selected>Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></div>
                <div class="qr-option"><label>Margin/Padding:</label><select id="qrMargin"><option value="0">None</option><option value="1">Small</option><option value="2" selected>Medium</option><option value="4">Large</option></select></div>
                <div class="qr-option"><label>Foreground:</label><input type="color" id="qrDarkColor" value="#000000"></div>
                <div class="qr-option"><label>Background:</label><input type="color" id="qrLightColor" value="#ffffff"></div>
                <div class="qr-option"><label>Logo (optional):</label><input type="file" id="qrLogo" accept="image/*"></div>
                <div class="qr-option"><label>Format:</label><select id="qrFormat"><option value="png">PNG</option><option value="svg">SVG</option></select></div>
            </div>
            
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; cursor: pointer;">
                <input type="checkbox" id="qrBatchMode"> 🔄 Batch Mode (Generate multiple from lines)
            </label>
        </div>
        
        <div id="qrBatchProgressContainer" style="display:none; width: 100%; background-color: #e0e0e0; border-radius: 4px; margin-top: 1rem;">
          <div id="qrBatchProgressBar" style="width: 0%; height: 6px; background-color: var(--accent); border-radius: 4px; transition: width 0.2s;"></div>
        </div>
        
        <div class="preview-box">
            <div class="preview-title" id="qrPreviewTitle">Preview</div>
            <div id="qrPreview" style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; align-items: center; min-height: 200px;"></div>
        </div>
        
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button id="downloadQrBtn" class="download-btn" disabled>⬇ Download QR Code</button>
        </div>
    `;

    const qrText = document.getElementById('qrText');
    const qrSize = document.getElementById('qrSize');
    const qrErrorLevel = document.getElementById('qrErrorLevel');
    const qrMargin = document.getElementById('qrMargin');
    const qrDarkColor = document.getElementById('qrDarkColor');
    const qrLightColor = document.getElementById('qrLightColor');
    const qrLogo = document.getElementById('qrLogo');
    const qrFormat = document.getElementById('qrFormat');
    const qrBatchMode = document.getElementById('qrBatchMode');
    const qrPreview = document.getElementById('qrPreview');
    const qrPreviewTitle = document.getElementById('qrPreviewTitle');
    const downloadBtn = document.getElementById('downloadQrBtn');
    const progressContainer = document.getElementById('qrBatchProgressContainer');
    const progressBar = document.getElementById('qrBatchProgressBar');

    let currentQrDataUrl = null;
    let currentSvgString = null;
    let batchDataUrls = [];
    let batchSvgStrings = [];

    // Debounce function
    let timeoutId;
    function debounce(func, delay) {
        return function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    // Helper for loading images
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    async function generateQRCodes() {
        const textValue = qrText.value.trim();
        if (!textValue) {
            qrPreview.innerHTML = '<div style="color: var(--text-light);">Enter text to generate QR code</div>';
            downloadBtn.disabled = true;
            return;
        }

        qrPreview.innerHTML = '<span style="color: var(--text-light);">Generating...</span>';
        currentQrDataUrl = null;
        currentSvgString = null;
        batchDataUrls = [];
        batchSvgStrings = [];

        const isBatch = qrBatchMode.checked;
        const lines = isBatch ? textValue.split('\n').map(l => l.trim()).filter(l => l) : [textValue];

        if (lines.length === 0) return;

        if (isBatch && lines.length > 1) {
            qrPreviewTitle.textContent = `Preview (${lines.length} codes)`;
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            downloadBtn.textContent = `⬇ Download ${lines.length} QR Codes (ZIP)`;
        } else {
            qrPreviewTitle.textContent = 'Preview';
            progressContainer.style.display = 'none';
            downloadBtn.textContent = '⬇ Download QR Code';
        }

        qrPreview.innerHTML = '';

        try {
            let logoImg = null;
            if (qrLogo.files[0] && qrFormat.value !== 'svg') {
                logoImg = await loadImage(qrLogo.files[0]);
            }

            const margin = parseInt(qrMargin.value);

            for (let i = 0; i < lines.length; i++) {
                const text = lines[i];
                if (isBatch) {
                    progressBar.style.width = `${(i / lines.length) * 100}%`;
                }

                if (qrFormat.value === 'svg') {
                    const svg = await new Promise((resolve, reject) => {
                        QRCode.toString(text, {
                            type: 'svg',
                            width: parseInt(qrSize.value),
                            margin: margin,
                            color: { dark: qrDarkColor.value, light: qrLightColor.value },
                            errorCorrectionLevel: qrErrorLevel.value
                        }, (err, svg) => {
                            if (err) reject(err);
                            else resolve(svg);
                        });
                    });

                    if (!isBatch) currentSvgString = svg;
                    batchSvgStrings.push({ text, svg });

                    if (!isBatch || i < 10) { // Limit preview to 10 in batch
                        const previewWrapper = document.createElement('div');
                        previewWrapper.style.display = 'flex';
                        previewWrapper.style.flexDirection = 'column';
                        previewWrapper.style.alignItems = 'center';
                        previewWrapper.style.gap = '0.5rem';

                        const previewDiv = document.createElement('div');
                        previewDiv.innerHTML = svg;
                        previewDiv.style.width = isBatch ? '100px' : 'auto';

                        previewWrapper.appendChild(previewDiv);

                        if (isBatch) {
                            const lbl = document.createElement('span');
                            lbl.textContent = text.length > 15 ? text.substring(0, 15) + '...' : text;
                            lbl.style.fontSize = '0.8rem';
                            lbl.style.color = 'var(--text-light)';
                            previewWrapper.appendChild(lbl);
                        }

                        qrPreview.appendChild(previewWrapper);
                    }
                } else {
                    const canvas = document.createElement('canvas');
                    const size = parseInt(qrSize.value);
                    canvas.width = size; canvas.height = size;

                    await QRCode.toCanvas(canvas, text, {
                        width: size,
                        margin: margin,
                        color: { dark: qrDarkColor.value, light: qrLightColor.value },
                        errorCorrectionLevel: qrErrorLevel.value
                    });

                    if (logoImg) {
                        const ctx = canvas.getContext('2d');
                        const logoSize = size * 0.2; // Logo covers ~20% of QR code

                        // Draw a background for the logo to ensure contrast
                        ctx.fillStyle = qrLightColor.value;
                        const bgSize = logoSize + (size * 0.02);
                        ctx.fillRect((size - bgSize) / 2, (size - bgSize) / 2, bgSize, bgSize);

                        ctx.drawImage(logoImg, (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
                    }

                    const dataUrl = canvas.toDataURL('image/png');
                    if (!isBatch) currentQrDataUrl = dataUrl;
                    batchDataUrls.push({ text, dataUrl });

                    if (!isBatch || i < 10) { // Limit preview to 10 in batch
                        const previewWrapper = document.createElement('div');
                        previewWrapper.style.display = 'flex';
                        previewWrapper.style.flexDirection = 'column';
                        previewWrapper.style.alignItems = 'center';
                        previewWrapper.style.gap = '0.5rem';

                        const previewImg = document.createElement('img');
                        previewImg.src = dataUrl;
                        previewImg.style.maxWidth = isBatch ? '100px' : '300px';
                        previewImg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        previewImg.style.borderRadius = '8px';

                        previewWrapper.appendChild(previewImg);

                        if (isBatch) {
                            const lbl = document.createElement('span');
                            lbl.textContent = text.length > 15 ? text.substring(0, 15) + '...' : text;
                            lbl.style.fontSize = '0.8rem';
                            lbl.style.color = 'var(--text-light)';
                            previewWrapper.appendChild(lbl);
                        }

                        qrPreview.appendChild(previewWrapper);
                    }
                }
            }

            if (isBatch && lines.length > 10) {
                const moreLabel = document.createElement('div');
                moreLabel.textContent = `+ ${lines.length - 10} more...`;
                moreLabel.style.alignSelf = 'center';
                moreLabel.style.color = 'var(--text-light)';
                qrPreview.appendChild(moreLabel);
            }

            if (isBatch) {
                progressBar.style.width = '100%';
                setTimeout(() => { progressContainer.style.display = 'none'; }, 1000);
            }

            downloadBtn.disabled = false;
        } catch (e) {
            qrPreview.innerHTML = `<div style="color:#e74c3c;">Error: ${e.message}</div>`;
            if (window.showToast) showToast('QR generation failed: ' + e.message, 'error');
            console.error(e);
        }
    }

    // Bind events for live preview
    const debouncedGenerate = debounce(generateQRCodes, 300);

    qrText.addEventListener('input', debouncedGenerate);
    qrSize.addEventListener('change', generateQRCodes);
    qrErrorLevel.addEventListener('change', generateQRCodes);
    qrMargin.addEventListener('change', generateQRCodes);
    qrDarkColor.addEventListener('input', debouncedGenerate);
    qrLightColor.addEventListener('input', debouncedGenerate);
    qrLogo.addEventListener('change', generateQRCodes);
    qrFormat.addEventListener('change', generateQRCodes);
    qrBatchMode.addEventListener('change', generateQRCodes);

    // Initial generation
    generateQRCodes();

    downloadBtn.addEventListener('click', async () => {
        const isBatch = qrBatchMode.checked;
        const lines = qrText.value.trim().split('\n').filter(l => l.trim().length > 0);

        if (isBatch && lines.length > 1) {
            // Download as ZIP for batch mode
            try {
                // Ensure JSZip is loaded
                if (typeof JSZip === 'undefined') {
                    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
                }

                downloadBtn.disabled = true;
                const prevText = downloadBtn.textContent;
                downloadBtn.textContent = '⏳ Creating ZIP...';

                const zip = new JSZip();

                if (qrFormat.value === 'svg') {
                    batchSvgStrings.forEach((item, i) => {
                        const safeName = item.text.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || `qr_${i}`;
                        zip.file(`${safeName}_${i + 1}.svg`, item.svg);
                    });
                } else {
                    batchDataUrls.forEach((item, i) => {
                        const safeName = item.text.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || `qr_${i}`;
                        // Convert data URL to Blob
                        const dataUrlParts = item.dataUrl.split(',');
                        const mime = dataUrlParts[0].match(/:(.*?);/)[1];
                        const bstr = atob(dataUrlParts[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
                        const blob = new Blob([u8arr], { type: mime });

                        zip.file(`${safeName}_${i + 1}.png`, blob);
                    });
                }

                const content = await zip.generateAsync({ type: 'blob' });
                downloadBlob(content, 'qrcodes_batch.zip');

                downloadBtn.textContent = prevText;
                downloadBtn.disabled = false;
                if (window.showToast) showToast(`Downloaded ${lines.length} QR codes inside ZIP!`);

            } catch (err) {
                console.error("ZIP creation failed", err);
                if (window.showToast) showToast('Failed to create ZIP: ' + err.message, 'error');
                downloadBtn.disabled = false;
            }
        } else {
            // Single download
            if (qrFormat.value === 'svg' && currentSvgString) {
                const blob = new Blob([currentSvgString], { type: 'image/svg+xml' });
                downloadBlob(blob, 'qrcode.svg');
            } else if (currentQrDataUrl) {
                const link = document.createElement('a');
                link.download = 'custom-qrcode.png';
                link.href = currentQrDataUrl;
                link.click();
            }
        }
    });
    } catch (___err) {
        console.error('renderqrmaker error:', ___err);
        container.innerHTML = '<div class="warning">⚠️ Tool failed to load: ' + ___err.message + '. Please check your internet connection and refresh.</div>';
    }
}
