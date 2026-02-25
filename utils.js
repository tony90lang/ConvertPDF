// utils.js – shared helper functions

// ---------- DOWNLOAD BLOB ----------
function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ---------- SEO HELPERS ----------
function updateMetaDescription(desc) {
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
        meta.setAttribute('content', desc);
    }
}

function updatePageTitle(title) {
    document.title = title + " – ConvertPDF";
}

// ---------- PDF.js WORKER ----------
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ---------- LOAD IMAGE FROM FILE ----------
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}