// Configuração da URL da API Backend
const API_BASE_URL = 'http://127.0.0.1:4040';

let severityChartInstance = null;
let amountChartInstance = null;

document.getElementById('auditForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const statusMsg = document.getElementById('statusMsg');
    const submitBtn = document.getElementById('submitBtn');

    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Feedback visual: exibe a mensagem de status e desabilita o botão
    statusMsg.classList.remove('hidden', 'text-red-400', 'text-emerald-400');
    statusMsg.classList.add('text-slate-400');
    statusMsg.textContent = 'Enviando arquivo e executando algoritmos de auditoria...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/audit/process`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Falha no processamento do arquivo.');
        }

        const result = await response.json();
        
        statusMsg.classList.add('text-emerald-400');
        statusMsg.textContent = `Arquivo ${result.filename} auditado com sucesso!`;

        renderDashboard(result);

    } catch (error) {
        statusMsg.classList.add('text-red-400');
        statusMsg.textContent = `Erro: ${error.message}`;
    } finally {
        submitBtn.disabled = false;
    }
});

function renderDashboard(result) {
    const data = result.data;

    // 1. Exibir seções ocultas com animação
    const sections = ['kpiSection', 'chartsSection', 'tableSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('hidden');
        el.classList.add('animate-fade-in');
    });

    // 2. Calcular KPIs
    const totalProc = result.total_records;
    const flagged = data.filter(item => item.is_flagged);
    const critical = data.filter(item => item.severity === 'CRITICAL');
    const riskVal = flagged.reduce((acc, item) => acc + Math.abs(item.amount), 0);

    document.getElementById('kpiTotal').textContent = totalProc;
    document.getElementById('kpiFlagged').textContent = flagged.length;
    document.getElementById('kpiCritical').textContent = critical.length;
    document.getElementById('kpiRisk').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(riskVal);

    // 3. Atualizar URL de Download
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.href = `${API_BASE_URL}${result.excel_report_url}`;

    // 4. Renderizar Tabela de Forma Segura (Prevenção de XSS)
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/30 transition-colors';

        // Criação de células utilizando elementos DOM para mitigar injeção de scripts
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

    // 5. Renderizar Gráficos
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
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
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}