// web2pdf.js
function renderweb2pdf(container) {
    container.innerHTML = '';
    const area = document.createElement('div');
    area.className = 'area';
    container.appendChild(area);

    updateMetaDescription("Turn HTML code into a printable PDF with full CSS support. 100% private, no uploads.");
    updatePageTitle("HTML to PDF Converter");

    area.innerHTML = `
        <h3>🌐 HTML snippet to PDF</h3>
        <p class="tool-description">
            Turn HTML code into a printable PDF. Full CSS support – perfect for invoices, reports, or saving web content.
            After generating your PDF, you can also <a href="pdfencrypt.html" target="_self">password‑protect</a> it.
        </p>
        <div class="faq-section">
            <h4>Frequently Asked Questions</h4>
            <details>
                <summary>Is my file uploaded to a server?</summary>
                <p>No! All processing happens locally in your browser. Your files never leave your device.</p>
            </details>
        </div>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap;">
            <label>📄 Template: 
                <select id="htmlTemplate">
                    <option value="blank">Blank</option>
                    <option value="invoice">Invoice</option>
                    <option value="receipt">Receipt</option>
                    <option value="certificate">Certificate</option>
                </select>
            </label>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">HTML Source</div>
                    <textarea id="htmlSnippet" spellcheck="false" placeholder="<h1>Hello World</h1><p>Type HTML here...</p>" style="width:100%; height: 250px; resize: vertical; padding: 1rem; font-family: monospace; border: 1px solid var(--border-medium); border-radius: var(--radius-md); background: #fdfdfd;"></textarea>
                </div>
                <div>
                    <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">CSS Styling (Optional)</div>
                    <textarea id="cssSnippet" spellcheck="false" placeholder="body { font-family: sans-serif; color: #333; }" style="width:100%; height: 150px; resize: vertical; padding: 1rem; font-family: monospace; border: 1px solid var(--border-medium); border-radius: var(--radius-md); background: #fdfdfd;"></textarea>
                </div>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div class="preview-title" style="margin-bottom: 0.5rem; font-weight: 600; color: var(--primary);">Live Preview</div>
                <div class="preview-box" id="htmlPreviewBox" style="margin: 0; flex: 1; height: 100%; min-height: 400px; padding: 0; border: 1px solid var(--border-medium); overflow: hidden;">
                    <iframe id="htmlRenderPreview" style="width: 100%; height: 100%; border: none;"></iframe>
                </div>
            </div>
        </div>
        <div class="orientation-selector">
            <label>📐 Page size: <select id="htmlPageSize"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
            <label>🔄 Orientation: <select id="htmlOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
        </div>
        <button id="printHtmlBtn" class="primary">🖨️ Generate PDF</button>
    `;

    const htmlTemplate = document.getElementById('htmlTemplate');
    const htmlSnippet = document.getElementById('htmlSnippet');
    const cssSnippet = document.getElementById('cssSnippet');
    const previewIframe = document.getElementById('htmlRenderPreview');
    const sizeSel = document.getElementById('htmlPageSize');
    const orientSel = document.getElementById('htmlOrientation');
    const printBtn = document.getElementById('printHtmlBtn');

    const templates = {
        blank: {
            html: `<h1>Hello World</h1>\n<p>Type HTML here</p>`,
            css: `body {\n  font-family: sans-serif;\n  line-height: 1.6;\n  color: #333;\n}`
        },
        invoice: {
            html: `<div class="invoice-box">\n  <table cellpadding="0" cellspacing="0">\n    <tr class="top">\n      <td colspan="2">\n        <table>\n          <tr>\n            <td class="title">\n              <h2>INVOICE</h2>\n            </td>\n            <td>\n              Invoice #: 123<br>\n              Created: January 1, 2026<br>\n              Due: February 1, 2026\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n    <tr class="heading">\n      <td>Item</td>\n      <td>Price</td>\n    </tr>\n    <tr class="item">\n      <td>Website design</td>\n      <td>$300.00</td>\n    </tr>\n    <tr class="item">\n      <td>Hosting (3 months)</td>\n      <td>$75.00</td>\n    </tr>\n    <tr class="item last">\n      <td>Domain name (1 year)</td>\n      <td>$10.00</td>\n    </tr>\n    <tr class="total">\n      <td></td>\n      <td>Total: $385.00</td>\n    </tr>\n  </table>\n</div>`,
            css: `.invoice-box {\n  max-width: 800px;\n  margin: auto;\n  padding: 30px;\n  border: 1px solid #eee;\n  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);\n  font-size: 16px;\n  line-height: 24px;\n  font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;\n  color: #555;\n}\n.invoice-box table {\n  width: 100%;\n  line-height: inherit;\n  text-align: left;\n}\n.invoice-box table td {\n  padding: 5px;\n  vertical-align: top;\n}\n.invoice-box table tr td:nth-child(2) {\n  text-align: right;\n}\n.invoice-box table tr.top table td {\n  padding-bottom: 20px;\n}\n.invoice-box table tr.top table td.title {\n  font-size: 45px;\n  line-height: 45px;\n  color: #333;\n}\n.invoice-box table tr.heading td {\n  background: #eee;\n  border-bottom: 1px solid #ddd;\n  font-weight: bold;\n}\n.invoice-box table tr.item td {\n  border-bottom: 1px solid #eee;\n}\n.invoice-box table tr.item.last td {\n  border-bottom: none;\n}\n.invoice-box table tr.total td:nth-child(2) {\n  border-top: 2px solid #eee;\n  font-weight: bold;\n}`
        },
        receipt: {
            html: `<div class="receipt">\n  <div class="header">\n    <h2>Store Name</h2>\n    <p>123 Store Address, City, State ZIP</p>\n    <p>Phone: (123) 456-7890</p>\n  </div>\n  <hr>\n  <div class="details">\n    <p>Date: 2026-03-04 14:30:00</p>\n    <p>Receipt #: 000123456</p>\n    <p>Cashier: John Doe</p>\n  </div>\n  <hr>\n  <table class="items">\n    <tr>\n      <th>Qty</th>\n      <th>Item</th>\n      <th>Price</th>\n      <th>Total</th>\n    </tr>\n    <tr>\n      <td>1</td>\n      <td>Widget A</td>\n      <td>$10.00</td>\n      <td>$10.00</td>\n    </tr>\n    <tr>\n      <td>2</td>\n      <td>Widget B</td>\n      <td>$15.00</td>\n      <td>$30.00</td>\n    </tr>\n  </table>\n  <hr>\n  <div class="totals">\n    <p>Subtotal: $40.00</p>\n    <p>Tax (8%): $3.20</p>\n    <h3>Total: $43.20</h3>\n  </div>\n  <div class="footer">\n    <p>Thank you for shopping with us!</p>\n  </div>\n</div>`,
            css: `.receipt {\n  width: 300px;\n  margin: 0 auto;\n  padding: 20px;\n  border: 1px dashed #333;\n  font-family: 'Courier New', Courier, monospace;\n  font-size: 14px;\n}\n.header, .footer {\n  text-align: center;\n}\n.header h2 {\n  margin: 0 0 10px 0;\n}\n.header p, .details p, .footer p {\n  margin: 2px 0;\n}\nhr {\n  border-top: 1px dashed #333;\n  margin: 10px 0;\n}\n.items {\n  width: 100%;\n  text-align: left;\n}\n.items th {\n  border-bottom: 1px solid #333;\n}\n.items td {\n  padding: 4px 0;\n}\n.totals {\n  text-align: right;\n}\n.totals p {\n  margin: 4px 0;\n}\n.totals h3 {\n  margin: 10px 0 0 0;\n}`
        },
        certificate: {
            html: `<div class="certificate">\n  <div class="border">\n    <div class="content">\n      <h2>CERTIFICATE OF ACHIEVEMENT</h2>\n      <p>This certificate is proudly presented to</p>\n      <h1>Jane Doe</h1>\n      <p>For outstanding performance and dedication in completing the</p>\n      <h3>Advanced Web Development Course</h3>\n      <div class="signatures">\n        <div class="sig-block">\n          <div class="sig-line"></div>\n          <p>Instructor</p>\n        </div>\n        <div class="date-block">\n          <p>March 4, 2026</p>\n        </div>\n        <div class="sig-block">\n          <div class="sig-line"></div>\n          <p>Director</p>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>`,
            css: `.certificate {\n  width: 800px;\n  height: 600px;\n  padding: 20px;\n  background-color: #f9f9f9;\n  color: #333;\n  font-family: 'Georgia', serif;\n  text-align: center;\n  margin: 0 auto;\n}\n.border {\n  border: 10px solid #2c3e50;\n  padding: 5px;\n  height: calc(100% - 30px);\n}\n.content {\n  border: 2px solid #2c3e50;\n  height: calc(100% - 4px);\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  background-color: white;\n}\n.content h2 {\n  font-size: 36px;\n  color: #2980b9;\n  letter-spacing: 2px;\n  margin-bottom: 20px;\n}\n.content h1 {\n  font-size: 48px;\n  font-style: italic;\n  margin: 20px 0;\n  color: #1e2b4f;\n  border-bottom: 1px solid #ccc;\n  padding-bottom: 10px;\n  display: inline-block;\n}\n.content h3 {\n  font-size: 24px;\n  font-weight: normal;\n  margin: 30px 0;\n}\n.content p {\n  font-size: 18px;\n  color: #555;\n}\n.signatures {\n  display: flex;\n  justify-content: space-between;\n  width: 80%;\n  margin-top: 60px;\n}\n.sig-block {\n  width: 200px;\n}\n.sig-line {\n  border-bottom: 1px solid #333;\n  height: 30px;\n  margin-bottom: 5px;\n}\n.date-block {\n  padding-top: 10px;\n  font-weight: bold;\n}`
        }
    };

    // Debounce function for live preview
    let timeoutId;
    function debounce(func, delay) {
        return function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    function updatePreview() {
        const html = htmlSnippet.value;
        const css = cssSnippet.value;

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 20px; box-sizing: border-box; }
                    ${css}
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;

        const blob = new Blob([content], { type: 'text/html' });
        previewIframe.src = URL.createObjectURL(blob);
    }

    htmlTemplate.addEventListener('change', () => {
        const tmpl = templates[htmlTemplate.value];
        if (tmpl) {
            htmlSnippet.value = tmpl.html;
            cssSnippet.value = tmpl.css;
            updatePreview();
        }
    });

    htmlSnippet.addEventListener('input', debounce(updatePreview, 300));
    cssSnippet.addEventListener('input', debounce(updatePreview, 300));

    // Initialize default template
    htmlSnippet.value = templates.blank.html;
    cssSnippet.value = templates.blank.css;
    updatePreview();
    printBtn.addEventListener('click', () => {
        printBtn.disabled = true; printBtn.innerHTML = '⏳ Preparing...';

        const fullHtml = `<!DOCTYPE html><html><head><title>ConvertPDF - HTML Document</title>
<style>
@page { size: ${sizeSel.value} ${orientSel.value}; margin: 2.54cm; }
@media print { body { margin: 2.54cm; } }
${css}
</style></head><body>${html}
<script>setTimeout(()=>window.print(),500);<\/script></body></html>`;

        const win = window.open('', '_blank');
        if (!win) {
            if (window.showToast) showToast('Pop‑up blocked by browser.', 'error');
            else alert('Pop‑up blocked');
            printBtn.disabled = false; printBtn.innerHTML = '🖨️ Generate PDF';
            return;
        }
        win.document.write(fullHtml); win.document.close();
        setTimeout(() => { printBtn.disabled = false; printBtn.innerHTML = '🖨️ Generate PDF'; }, 2000);
    });
}