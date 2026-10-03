/**
 * FINANCIAL AUDIT ENGINE (Client-Side Architecture)
 * Este motor executa a ingestão, parsing, sanitização e auditoria estritamente na máquina cliente,
 * neutralizando dependências de servidores backend, túneis de rede e CORS.
 */

// 1. MÓDULO DE PARSING E SANITIZAÇÃO
class SnifferParser {
    static detectDelimiter(sampleLines) {
        const delimiters = [',', ';', '|', '\t'];
        const text = sampleLines.join('\n');
        let chosen = ',';
        let maxCount = 0;

        delimiters.forEach(delim => {
            const count = (text.match(new RegExp(`\\${delim}`, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                chosen = delim;
            }
        });
        return chosen;
    }

    static cleanCurrency(rawAmount) {
        if (typeof rawAmount === 'number') return rawAmount;
        let str = String(rawAmount || '').trim();
        // Remoção de formatação monetária (ex: R$)
        str = str.replace(/[R$\s]/g, '');
        // Conversão de decimais (BR -> US)
        if (str.includes(',') && str.includes('.')) {
            str = str.replace(/\./g, '').replace(',', '.');
        } else if (str.includes(',')) {
            str = str.replace(',', '.');
        }
        const val = parseFloat(str);
        return isNaN(val) ? 0.0 : val;
    }

    static parse(rawText) {
        const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (!lines.length) return [];

        const delimiter = this.detectDelimiter(lines.slice(0, 5));
        const records = [];

        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].split(delimiter).map(p => p.trim());
            
            // Bypass para cabeçalhos baseados em heurística
            if (i === 0 && (parts[0].toLowerCase().includes('id') || parts[0].toLowerCase().includes('data'))) {
                continue;
            }

            if (parts.length >= 3) {
                records.push({
                    id: parts[0] || `TX-${i + 1}`,
                    date: parts[1] || 'N/A',
                    description: parts[2] || 'Sem Descrição',
                    amount: this.cleanCurrency(parts[3] || 0)
                });
            }
        }
        return records;
    }
}

// 2. MÓDULO DE AUDITORIA E COMPLIANCE
class Auditor {
    constructor(threshold = 3000.0) {
        this.threshold = threshold;
    }

    audit(records) {
        const idCounts = {};
        records.forEach(r => { idCounts[r.id] = (idCounts[r.id] || 0) + 1; });

        return records.map(record => {
            const anomalies = [];
            let severity = 'INFO';
            let isFlagged = false;

            if (Math.abs(record.amount) > this.threshold) {
                anomalies.push(`Excede o limite operacional (> R$ ${this.threshold})`);
                severity = 'CRITICAL';
                isFlagged = true;
            }

            if (record.amount < 0) {
                anomalies.push('Lançamento a débito ou estorno negativo detectado');
                if (severity !== 'CRITICAL') severity = 'WARNING';
                isFlagged = true;
            }

            if (idCounts[record.id] > 1) {
                anomalies.push('Identificador de transação duplicado no lote');
                if (severity !== 'CRITICAL') severity = 'WARNING';
                isFlagged = true;
            }

            return {
                ...record,
                is_flagged: isFlagged,
                severity: severity,
                anomalies: anomalies
            };
        });
    }
}

// 3. ORQUESTRADOR DA INTERFACE E RENDERIZAÇÃO
let latestAuditedData = null;
let severityChartInstance = null;
let amountChartInstance = null;

document.getElementById('auditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const statusMsg = document.getElementById('statusMsg');
    const submitBtn = document.getElementById('submitBtn');

    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    statusMsg.classList.remove('hidden', 'text-red-400', 'text-emerald-400');
    statusMsg.classList.add('text-slate-400');
    statusMsg.textContent = 'Extraindo e processando dados em memória local...';
    submitBtn.disabled = true;

    try {
        // Leitura síncrona na máquina cliente (sem requisições externas)
        const text = await file.text();
        
        // Pipeline Local
        const parsedData = SnifferParser.parse(text);
        const auditor = new Auditor(3000.0);
        latestAuditedData = auditor.audit(parsedData);

        statusMsg.classList.add('text-emerald-400');
        statusMsg.textContent = `Arquivo ${file.name} auditado com sucesso (Processamento Local)!`;

        renderDashboard(latestAuditedData);

    } catch (error) {
        statusMsg.classList.add('text-red-400');
        statusMsg.textContent = `Erro crítico no processamento: ${error.message}`;
    } finally {
        submitBtn.disabled = false;
    }
});

// Configuração da Exportação de Excel nativa via SheetJS
document.getElementById('downloadBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (!latestAuditedData) return;

    const rows = latestAuditedData.map(item => ({
        "ID Transação": item.id,
        "Data": item.date,
        "Descrição": item.description,
        "Valor Bruto": item.amount,
        "Status": item.severity,
        "Sinalizado": item.is_flagged ? 'SIM' : 'NÃO',
        "Anomalias Encontradas": item.anomalies.join('; ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoria Consolidada");
    
    // Dispara o download da planilha sem contato com servidor
    XLSX.writeFile(workbook, "relatorio_auditado_client_side.xlsx");
});

function renderDashboard(data) {
    const sections = ['kpiSection', 'chartsSection', 'tableSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('hidden');
        el.classList.add('animate-fade-in');
    });

    const flagged = data.filter(item => item.is_flagged);
    const critical = data.filter(item => item.severity === 'CRITICAL');
    const riskVal = flagged.reduce((acc, item) => acc + Math.abs(item.amount), 0);

    document.getElementById('kpiTotal').textContent = data.length;
    document.getElementById('kpiFlagged').textContent = flagged.length;
    document.getElementById('kpiCritical').textContent = critical.length;
    document.getElementById('kpiRisk').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(riskVal);

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/30 transition-colors';

        const tdId = document.createElement('td');
        tdId.className = 'px-4 py-3 font-mono text-slate-400';
        tdId.textContent = row.id;

        const tdDate = document.createElement('td');
        tdDate.className = 'px-4 py-3';
        tdDate.textContent = row.date || 'N/A';

        const tdDesc = document.createElement('td');
        tdDesc.className = 'px-4 py-3 font-medium text-slate-200';
        tdDesc.textContent = row.description;

        const tdAmount = document.createElement('td');
        tdAmount.className = `px-4 py-3 text-right font-mono ${row.amount < 0 ? 'text-red-400' : 'text-slate-200'}`;
        tdAmount.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.amount);

        const tdSeverity = document.createElement('td');
        tdSeverity.className = 'px-4 py-3';
        const badge = document.createElement('span');
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold border';
        
        if (row.severity === 'CRITICAL') {
            badge.classList.add('bg-red-500/10', 'text-red-400', 'border-red-500/20');
            badge.textContent = 'CRITICAL';
        } else if (row.severity === 'WARNING') {
            badge.classList.add('bg-yellow-500/10', 'text-yellow-400', 'border-yellow-500/20');
            badge.textContent = 'WARNING';
        } else {
            badge.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/20');
            badge.textContent = 'INFO';
        }
        tdSeverity.appendChild(badge);

        const tdAnomalies = document.createElement('td');
        tdAnomalies.className = 'px-4 py-3 text-slate-400';
        tdAnomalies.textContent = Array.isArray(row.anomalies) && row.anomalies.length > 0 ? row.anomalies.join(', ') : '-';

        tr.append(tdId, tdDate, tdDesc, tdAmount, tdSeverity, tdAnomalies);
        tbody.appendChild(tr);
    });

    renderCharts(data);
}

function renderCharts(data) {
    if (severityChartInstance) severityChartInstance.destroy();
    if (amountChartInstance) amountChartInstance.destroy();

    const sevCounts = { INFO: 0, WARNING: 0, CRITICAL: 0 };
    data.forEach(item => { if (sevCounts[item.severity] !== undefined) sevCounts[item.severity]++; });

    const ctx1 = document.getElementById('severityChart').getContext('2d');
    severityChartInstance = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['INFO', 'WARNING', 'CRITICAL'],
            datasets: [{
                data: [sevCounts.INFO, sevCounts.WARNING, sevCounts.CRITICAL],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
    });

    const ctx2 = document.getElementById('amountChart').getContext('2d');
    amountChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: data.map(i => i.id),
            datasets: [{
                label: 'Valor (R$)',
                data: data.map(i => i.amount),
                backgroundColor: data.map(i => i.severity === 'CRITICAL' ? '#ef4444' : (i.severity === 'WARNING' ? '#f59e0b' : '#10b981'))
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } } },
            plugins: { legend: { display: false } }
        }
    });
}