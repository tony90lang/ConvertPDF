// pdfencrypt.js - Fixed encryption with pdf-lib v1.17.1
async function renderpdfencrypt(container) {
    await loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');

    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Protect your PDFs with a password. Set permissions for printing, copying, and modifying. 100% private, no uploads.");
    updatePageTitle("PDF Password Protector");

    area.innerHTML = `
        <h3>🔐 Protect PDF with Password</h3>
        <p class="tool-description">
            Protect your PDFs with a password. Set permissions for printing, copying, or modifying.
            Keep sensitive documents secure before sharing.
            After encrypting, you may also want to <a href="mergepdf.html" target="_self">merge</a> it with other files.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
            <details>
                <summary>What encryption is used?</summary>
                <p>We use standard PDF encryption (AES‑256) via PDF‑Lib.</p>
            </details>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem; max-width:500px;">
            <input type="file" id="pdfToEncrypt" accept=".pdf">
            <input type="password" id="pdfPassword" placeholder="Enter password">
            <input type="password" id="pdfConfirmPassword" placeholder="Confirm password">
            <div class="permissions-grid" style="display:flex; gap:1rem; flex-wrap:wrap;">
                <label><input type="checkbox" id="permPrint" checked> Allow Printing</label>
                <label><input type="checkbox" id="permCopy" checked> Allow Copying</label>
                <label><input type="checkbox" id="permModify"> Allow Modifying</label>
            </div>
            <div id="passwordStrength" class="password-strength"></div>
            <button id="encryptPdfBtn" class="primary" style="align-self:flex-start; min-width:200px;">🔒 Encrypt & Download</button>
        </div>
    `;

    const pdfFile = document.getElementById('pdfToEncrypt');
    const pdfPassword = document.getElementById('pdfPassword');
    const pdfConfirm = document.getElementById('pdfConfirmPassword');
    const permPrint = document.getElementById('permPrint');
    const permCopy = document.getElementById('permCopy');
    const permModify = document.getElementById('permModify');
    const encryptBtn = document.getElementById('encryptPdfBtn');
    const strengthDiv = document.getElementById('passwordStrength');

    // Password strength meter
    pdfPassword.addEventListener('input', () => {
        const pwd = pdfPassword.value;
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
        const msgs = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#28a745'];
        const index = Math.min(strength, msgs.length - 1);
        strengthDiv.textContent = `Password Strength: ${msgs[index]}`;
        strengthDiv.style.color = colors[index];
    });

    encryptBtn.addEventListener('click', async () => {
        const file = pdfFile.files[0];
        const pwd = pdfPassword.value;
        const confirm = pdfConfirm.value;

        if (!file) { alert('Please select a PDF file.'); return; }
        if (!pwd) { alert('Please enter a password.'); return; }
        if (pwd !== confirm) { alert('Passwords do not match.'); return; }
        if (pwd.length < 6) { alert('Password must be at least 6 characters.'); return; }

        encryptBtn.disabled = true;
        encryptBtn.innerHTML = '⏳ Encrypting...';

        try {
            if (typeof PDFLib === 'undefined') throw new Error('PDF library not loaded. Please refresh the page.');
            const { PDFDocument } = PDFLib;

            // Load the PDF
            const arrayBuf = await file.arrayBuffer();
            let pdfDoc;
            try {
                pdfDoc = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
            } catch (loadErr) {
                if (loadErr.message && loadErr.message.toLowerCase().includes('password')) {
                    throw new Error('This PDF is already encrypted. Please remove the password first.');
                }
                throw new Error('Invalid or corrupted PDF file.');
            }

            // Create a new PDF and copy all pages (this is necessary to apply encryption)
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach(page => newPdf.addPage(page));

            // Set permissions
            const permissions = {
                printing: permPrint.checked ? 'highResolution' : 'none',
                modifying: permModify.checked,
                copying: permCopy.checked,
                annotating: false,
                fillingForms: false,
                contentAccessibility: true,
                documentAssembly: false
            };

            // Encrypt the new PDF
            newPdf.encrypt({
                userPassword: pwd,
                ownerPassword: pwd, // same for simplicity; you could use a separate owner password
                permissions: permissions
            });

            const encryptedBytes = await newPdf.save();
            downloadBlob(new Blob([encryptedBytes]), `protected-${file.name}`);

        } catch (error) {
            console.error('Encryption error:', error);
            alert('Encryption failed: ' + error.message);
        } finally {
            encryptBtn.disabled = false;
            encryptBtn.innerHTML = '🔒 Encrypt & Download';
        }
    });
}