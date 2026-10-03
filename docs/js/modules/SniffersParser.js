export class SnifferParser {
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
        // Remove símbolos de moeda e espaços
        str = str.replace(/[R$\s]/g, '');
        // Ajuste de separadores brasileiros (1.000,50 -> 1000.50)
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
            
            // Ignora linhas de cabeçalho comuns
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