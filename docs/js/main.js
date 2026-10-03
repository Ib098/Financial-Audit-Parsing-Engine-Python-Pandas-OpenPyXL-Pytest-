import { SnifferParser } from './modules/SnifferParser.js';
import { Auditor } from './modules/Auditor.js';
import { Reporter } from './modules/Reporter.js';

let latestAuditedData = null;

document.getElementById('auditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const text = await file.text(); // Leitura direta na memória do navegador

    // Execução do Pipeline Local
    const parsedData = SnifferParser.parse(text);
    const auditor = new Auditor(3000.0);
    latestAuditedData = auditor.audit(parsedData);

    // Renderização dos KPIs, Tabelas e Gráficos
    renderDashboard({
        filename: file.name,
        total_records: latestAuditedData.length,
        data: latestAuditedData
    });
});

// Configuração do botão de download de Excel nativo
document.getElementById('downloadBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (latestAuditedData) {
        Reporter.exportToExcel(latestAuditedData, 'relatorio_auditado.xlsx');
    }
});