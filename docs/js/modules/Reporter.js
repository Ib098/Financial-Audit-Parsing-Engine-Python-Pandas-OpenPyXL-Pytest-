export class Reporter {
    static exportToJSON(auditedData, filename = 'auditoria.json') {
        const blob = new Blob([JSON.stringify(auditedData, null, 2)], { type: 'application/json' });
        this._triggerDownload(blob, filename);
    }

    static exportToExcel(auditedData, filename = 'auditoria.xlsx') {
        // Mapeamento plano para planilha
        const rows = auditedData.map(item => ({
            ID: item.id,
            Data: item.date,
            Descrição: item.description,
            Valor: item.amount,
            Severidade: item.severity,
            Sinalizado: item.is_flagged ? 'SIM' : 'NÃO',
            Anomalias: item.anomalies.join('; ')
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoria");
        
        XLSX.writeFile(workbook, filename);
    }

    static _triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}