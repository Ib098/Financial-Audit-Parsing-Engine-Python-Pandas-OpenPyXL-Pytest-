import re
import csv
import logging
from pathlib import Path
from typing import List, Dict, Any, Union

# Configuração básica de logging para rastreabilidade de falhas de parsing
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class FinancialParser:
    """
    Engine de parsing universal para ingestão de dados financeiros brutos.
    Suporta detecção automática de delimitadores (;,|,) e layouts sujos.
    """

    def __init__(self, raw_filepath: Union[str, Path]):
        self.raw_filepath = Path(raw_filepath)
        self.parsed_records: List[Dict[str, Any]] = []
        self.errors_count: int = 0

    def _normalize_currency(self, raw_value: str) -> float:
        """Limpa caracteres monetários e resolve divergências entre padrão BRL e US."""
        clean_str = re.sub(r"[^\d,\.-]", "", str(raw_value).strip())
        if not clean_str:
            raise ValueError("Valor financeiro vazio ou ilegível.")

        if "," in clean_str and "." in clean_str:
            clean_str = clean_str.replace(".", "").replace(",", ".")
        elif "," in clean_str:
            clean_str = clean_str.replace(",", ".")

        return float(clean_str)

    def _detect_delimiter(self, sample_text: str) -> str:
        """Tenta adivinhar o delimitador dominante no arquivo."""
        try:
            sniffer = csv.Sniffer()
            dialect = sniffer.sniff(sample_text, delimiters=';|,')
            return dialect.delimiter
        except csv.Error:
            # Fallback manual: conta qual delimitador aparece mais no cabeçalho/amostra
            for delim in ['|', ';', ',']:
                if sample_text.count(delim) > 2:
                    return delim
            return None

    def parse(self) -> List[Dict[str, Any]]:
        """Lê o arquivo, detecta o padrão e mapeia as transações."""
        if not self.raw_filepath.exists():
            raise FileNotFoundError(f"Arquivo não localizado: {self.raw_filepath}")

        self.parsed_records.clear()
        self.errors_count = 0

        # Tentativa de leitura com fallback de encoding
        try:
            content = self.raw_filepath.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            content = self.raw_filepath.read_text(encoding="latin-1")

        if not content.strip():
            return []

        delimiter = self._detect_delimiter(content[:1024])
        lines = content.splitlines()

        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Ignorar cabeçalhos e linhas vazias
            if not line or line.startswith("#") or "HEADER" in line.upper() or "DESCRICAO" in line.upper():
                continue

            # Split dinâmico (com ou sem delimitador detectado)
            if delimiter:
                parts = [p.strip() for p in line.split(delimiter) if p.strip()]
            else:
                # Fallback para regex agressivo se não houver delimitador (ex: tabulação ou espaços duplos)
                parts = [p.strip() for p in re.split(r";|\t|\s{2,}|\||,", line) if p.strip()]

            # Validação de estrutura mínima
            if len(parts) < 4:
                logging.warning(f"Linha {line_num} ignorada (estrutura insuficiente): {line}")
                self.errors_count += 1
                continue

            try:
                # Heurística de mapeamento de colunas (Lida com 4 ou 5 colunas)
                transaction_id = parts[0]
                date = parts[1]
                
                if len(parts) == 5:
                    # Layout: ID | DATA | DESCRICAO | VALOR | CATEGORIA
                    desc_str = parts[2]
                    amount_str = parts[3]
                else:
                    # Layout Clássico: ID | DATA | DESCRICAO | VALOR
                    desc_str = parts[2]
                    amount_str = parts[-1]

                amount = self._normalize_currency(amount_str)

                self.parsed_records.append({
                    "line_number": line_num,
                    "id": transaction_id,
                    "date": date,
                    "description": desc_str,
                    "amount": amount
                })

            except Exception as e:
                logging.warning(f"Erro na linha {line_num} ({line}): {e}")
                self.errors_count += 1
                continue

        logging.info(f"Parsing concluído. Válidos: {len(self.parsed_records)} | Erros: {self.errors_count}")
        return self.parsed_records