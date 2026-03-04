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
        <div id="imgPngDropZone" class="drop-zone" style="border: 2px dashed var(--border-medium); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-offwhite); cursor: pointer; transition: all 0.2s ease; margin-bottom: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🖼️➕⬇️</div>
            <p>Drag and drop any image (JPG, WebP, GIF...)</p>
            <p class="note">or click to browse files</p>
            <input type="file" id="anyImgInput" accept="image/*" style="display: none;">
        </div>
        
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            <div class="orientation-selector" style="margin: 0; width: auto;">
                <label>📏 Max Width: 
                    <select id="pngMaxWidth">
                        <option value="none" selected>Original</option>
                        <option value="1920">1920px (1080p)</option>
                        <option value="1280">1280px (720p)</option>
                        <option value="800">800px</option>
                        <option value="500">500px</option>
                    </select>
                </label>
            </div>
            <div style="display: flex; align-items: center; color: var(--text-light); font-size: 0.9rem;" id="imgPngStats">
                 <span id="imgOrigSize">No file selected</span>
            </div>
        </div>

        <button id="toPngBtn" class="primary" disabled>Convert to PNG</button>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 1.5rem;">
            <div class="preview-box" style="margin: 0;">
                <div class="preview-title" style="display: flex; justify-content: space-between;">
                    <span>Generated PNG</span>
                    <span id="pngNewSize" style="font-weight: normal; font-size: 0.85em; color: var(--text-light);"></span>
                </div>
                <div style="text-align: center;">
                    <img id="pngPreview" style="max-width:100%; max-height:300px; display: none; margin: 0 auto;">
                    <div id="pngPlaceholder" style="padding: 2rem; color: var(--text-light);">Converted image will appear here</div>
                </div>
            </div>
        </div>
        <button id="downloadPngBtn" class="download-btn" disabled>⬇ Download PNG</button>
    `;

    const inp = document.getElementById('anyImgInput');
    const dropZone = document.getElementById('imgPngDropZone');
    const conv = document.getElementById('toPngBtn');
    const imgPrev = document.getElementById('pngPreview');
    const placeholder = document.getElementById('pngPlaceholder');
    const dPng = document.getElementById('downloadPngBtn');
    const maxWidthSel = document.getElementById('pngMaxWidth');
    const origSizeSpan = document.getElementById('imgOrigSize');
    const newSizeSpan = document.getElementById('pngNewSize');
    let pngBlob = null;
    let originalFile = null;

    // Setup drag and drop
    dropZone.addEventListener('click', () => inp.click());
    if (typeof setupDropZone === 'function') {
        setupDropZone('imgPngDropZone', 'anyImgInput');
    }

    inp.addEventListener('change', () => {
        const file = inp.files[0];
        if (!file) return;

        originalFile = file;

        // Show file size
        origSizeSpan.textContent = `Original: ${typeof formatFileSize === 'function' ? formatFileSize(file.size) : file.size + ' bytes'} (${file.type.split('/')[1].toUpperCase()})`;

        conv.disabled = false;

        // Reset preview
        imgPrev.style.display = 'none';
        placeholder.style.display = 'block';
        newSizeSpan.textContent = '';
        dPng.disabled = true;
        pngBlob = null;
    });

    conv.addEventListener('click', () => {
        const f = inp.files[0];
        if (!f) return;

        conv.disabled = true;
        conv.innerHTML = '⏳ Converting...';

        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let targetW = img.width;
                let targetH = img.height;

                // Handle resizing
                const maxWidthOption = maxWidthSel.value;
                if (maxWidthOption !== 'none') {
                    const maxW = parseInt(maxWidthOption);
                    if (targetW > maxW) {
                        const ratio = maxW / targetW;
                        targetW = maxW;
                        targetH = targetH * ratio;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;

                const ctx = canvas.getContext('2d');
                // Ensure transpareny support
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, targetW, targetH);

                canvas.toBlob(blob => {
                    pngBlob = blob;
                    dPng.disabled = false;

                    imgPrev.src = canvas.toDataURL('image/png');
                    imgPrev.style.display = 'block';
                    placeholder.style.display = 'none';

                    newSizeSpan.textContent = `PNG Size: ${typeof formatFileSize === 'function' ? formatFileSize(blob.size) : Math.round(blob.size / 1024) + ' KB'}`;

                    conv.disabled = false;
                    conv.innerHTML = 'Convert to PNG';

                    if (window.showToast) showToast('Converted to PNG successfully!');
                }, 'image/png');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(f);
    });

    dPng.addEventListener('click', () => {
        if (pngBlob) {
            let baseName = 'converted-image';
            if (originalFile && originalFile.name) {
                // Strip extension
                baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
            }
            downloadBlob(pngBlob, `${baseName}.png`);
        }
    });
}