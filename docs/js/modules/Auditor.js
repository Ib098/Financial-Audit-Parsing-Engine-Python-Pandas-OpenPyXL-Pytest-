export class Auditor {
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

            // Anomalia 1: Valor Acima do Limite (CRITICAL)
            if (Math.abs(record.amount) > this.threshold) {
                anomalies.push(`Excede o limite operacional (> R$ ${this.threshold})`);
                severity = 'CRITICAL';
                isFlagged = true;
            }

            // Anomalia 2: Valores Negativos de Estorno / Reembolso (WARNING)
            if (record.amount < 0) {
                anomalies.push('Lançamento a débito ou estorno negativo detectado');
                if (severity !== 'CRITICAL') severity = 'WARNING';
                isFlagged = true;
            }

            // Anomalia 3: Identificador Duplicado
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