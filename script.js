// script.js – main router and tool definitions

// ---------- TOOL DEFINITIONS ----------
const tools = [
    { id: 'md2pdf', name: '📝 Markdown → PDF', desc: 'convert .md to formatted PDF', icon: '📄➡️📑', group: 'core' },
    { id: 'docx2pdf', name: '📃 DOCX → PDF', desc: 'Word documents to PDF', icon: '📘➡️📕', group: 'core' },
    { id: 'img2pdf', name: '🖼️ Images → PDF', desc: 'JPG/PNG to single PDF', icon: '🌠➡️📇', group: 'core' },
    { id: 'pdfencrypt', name: '🔐 PDF password', desc: 'protect PDF with encryption', icon: '🔒📎', group: 'core' },
    { id: 'mergepdf', name: '🧩 Merge PDFs', desc: 'combine multiple PDF files', icon: '🔗📚', group: 'core' },
    { id: 'txt2docx', name: '📄 TXT → DOCX', desc: 'plain text to Word file', icon: '📋➡️📙', group: 'core' },
    { id: 'pdf2jpg', name: '📸 PDF → JPG', desc: 'extract pages as images', icon: '📑➡️🌄', group: 'extra' },
    { id: 'img2png', name: '🎨 Any image → PNG', desc: 'convert to PNG format', icon: '🖼️➡️📸', group: 'extra' },
    { id: 'web2pdf', name: '🌐 HTML → PDF', desc: 'paste HTML snippet to PDF', icon: '🕸️➡️📜', group: 'extra' },
    { id: 'qrmaker', name: '📱 QR code', desc: 'text/link → QR code PNG/SVG', icon: '🔳⬇️', group: 'extra' }
];

// render home cards
const grid = document.getElementById('toolGrid');
tools.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.setAttribute('data-tool', t.id);
    card.innerHTML = `<div class="tool-icon">${t.icon}</div>
            <div class="tool-name">${t.name}</div>
            <div class="tool-desc">${t.desc}</div>`;
    card.addEventListener('click', (e) => {
        const url = new URL(window.location.href);
        url.hash = `tool=${t.id}`;
        window.open(url.toString(), '_blank');
    });
    grid.appendChild(card);
});

// ---------- HASH ROUTING ----------
const homeSection = document.getElementById('homeSection');
const toolPanel = document.getElementById('toolPanel');
const toolTitle = document.getElementById('toolTitle');
const toolContent = document.getElementById('toolContent');
const backBtn = document.getElementById('backToHomeBtn');

function showHome() { homeSection.classList.remove('hidden'); toolPanel.classList.add('hidden'); }

function showTool(id) {
    homeSection.classList.add('hidden');
    toolPanel.classList.remove('hidden');
    const tool = tools.find(t => t.id === id);
    if (!tool) return;
    toolTitle.innerText = tool.name;
    // Call the appropriate render function from the tool modules
    const renderFunc = window['render' + id];
    if (renderFunc) {
        renderFunc(toolContent);
    } else {
        console.error('No render function for tool:', id);
        toolContent.innerHTML = '<p class="warning">Tool not available.</p>';
    }
}

backBtn.addEventListener('click', () => {
    window.location.hash = '';
    showHome();
});

function parseHash() {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('tool=')) {
        const toolId = hash.replace('tool=', '');
        showTool(toolId);
    } else {
        showHome();
    }
}
window.addEventListener('hashchange', parseHash);
parseHash();