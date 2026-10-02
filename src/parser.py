import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Union

# Configuração básica de logging para rastreabilidade de falhas de parsing
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class FinancialParser:
    """
    Engine de parsing para ingestão, higienização e estruturação de dados
    financeiros brutos oriundos de arquivos de texto (.txt, .csv sujos).
    """

    def __init__(self, raw_filepath: Union[str, Path]):
        self.raw_filepath = Path(raw_filepath)
        self.parsed_records: List[Dict[str, Any]] = []
        self.errors_count: int = 0

    def _normalize_currency(self, raw_value: str) -> float:
        """
        Higieniza strings de representação monetária no padrão brasileiro (BRL)
        ou internacional, convertendo-as para ponto flutuante (float).
        
        Trata: símbolos de moeda (R$), espaços, separadores de milhar e decimais.
        """
        # Remove símbolos monetários, espaços invisíveis e caracteres alfabéticos
        clean_str = re.sub(r"[^\d,\.-]", "", raw_value.strip())
        
        if not clean_str:
            raise ValueError("String de valor monetário vazia ou inválida.")

        # Tratamento do padrão BRL (ex: 1.500,50 -> 1500.50)
        if "," in clean_str and "." in clean_str:
            clean_str = clean_str.replace(".", "").replace(",", ".")
        elif "," in clean_str:
            clean_str = clean_str.replace(",", ".")

        return float(clean_str)

    def parse(self) -> List[Dict[str, Any]]:
        """
        Executa a varredura linha a linha do arquivo fonte, aplicando regex para
        extração de campos e descarte de ruídos ou linhas corrompidas.
        """
        if not self.raw_filepath.exists():
            raise FileNotFoundError(f"Arquivo fonte não localizado: {self.raw_filepath}")

        self.parsed_records.clear()
        self.errors_count = 0

        # Tentativa de leitura com fallback de encoding (utf-8 -> latin-1)
        content = ""
        try:
            content = self.raw_filepath.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            content = self.raw_filepath.read_text(encoding="latin-1")

        lines = content.splitlines()

        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Descarte de linhas vazias ou comentários de cabeçalho
            if not line or line.startswith("#") or "HEADER" in line.upper():
                continue

            # Suporte a múltiplos delimitadores (ponto e vírgula, tabulação ou múltiplos espaços)
            parts = [part.strip() for part in re.split(r";|\t|\s{2,}", line) if part.strip()]

            if len(parts) < 4:
                logging.warning(f"Linha {line_num} descartada por estrutura insuficiente: '{line}'")
                self.errors_count += 1
                continue

            transaction_id = parts[0]
            date = parts[1]
            description = parts[2]
            raw_amount = parts[3]

            try:
                amount = self._normalize_currency(raw_amount)
            except ValueError as e:
                logging.warning(f"Linha {line_num} descartada por falha na conversão numérica ({raw_amount}): {e}")
                self.errors_count += 1
                continue

            self.parsed_records.append({
                "line_number": line_num,
                "id": transaction_id,
                "date": date,
                "description": description,
                "amount": amount
            })

        logging.info(f"Parsing concluído. Registros válidos: {len(self.parsed_records)} | Inconsistências de leitura: {self.errors_count}")
        return self.parsed_records