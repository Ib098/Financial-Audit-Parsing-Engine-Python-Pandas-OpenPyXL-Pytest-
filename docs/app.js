// Definição da URL da API Backend
// Em ambiente local: 'http://127.0.0.1:8000'
// Em produção (Render/Koyeb): 'https://seu-backend.onrender.com'
const API_BASE_URL = 'http://127.0.0.1:8000';

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

    // Feedback de Carregamento
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

    // Exibir seções com animação de fade-in
    const sections = ['kpiSection', 'chartsSection', 'tableSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('hidden');
        el.classList.add('animate-fade-in');
    });

    // 1. Exibir Seções
    document.getElementById('kpiSection').classList.remove('hidden');
    document.getElementById('chartsSection').classList.remove('hidden');
    document.getElementById('tableSection').classList.remove('hidden');

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

    // 4. Renderizar Tabela
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/30 transition-colors';

        let sevBadge = '';
        if (row.severity === 'CRITICAL') sevBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">CRITICAL</span>';
        else if (row.severity === 'WARNING') sevBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">WARNING</span>';
        else sevBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">INFO</span>';

        tr.innerHTML = `
            <td class="px-4 py-3 font-mono text-slate-400">${row.id}</td>
            <td class="px-4 py-3">${row.date || 'N/A'}</td>
            <td class="px-4 py-3 font-medium text-slate-200">${row.description}</td>
            <td class="px-4 py-3 text-right font-mono ${row.amount < 0 ? 'text-red-400' : 'text-slate-200'}">
                ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.amount)}
            </td>
            <td class="px-4 py-3">${sevBadge}</td>
            <td class="px-4 py-3 text-slate-400">${row.anomalies.join(', ') || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    // 5. Renderizar Gráficos (Chart.js)
    renderCharts(data);
}

function renderCharts(data) {
    // Destruir instâncias anteriores se existirem
    if (severityChartInstance) severityChartInstance.destroy();
    if (amountChartInstance) amountChartInstance.destroy();

    // Contagem de Severidades
    const sevCounts = { INFO: 0, WARNING: 0, CRITICAL: 0 };
    data.forEach(item => { if (sevCounts[item.severity] !== undefined) sevCounts[item.severity]++; });

    // Chart 1: Donut (Severidade)
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

    // Chart 2: Bar (Valores)
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