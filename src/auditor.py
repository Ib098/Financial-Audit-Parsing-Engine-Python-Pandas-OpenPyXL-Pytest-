import logging
from datetime import datetime
from typing import List, Dict, Any, Set, Tuple

# Configuração de logging integrada
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


class AnomalyType:
    """Constantes para categorização de anomalias operacionais e financeiras."""
    DUPLICATE_ID = "DUPLICATE_TRANSACTION_ID"
    DUPLICATE_PAYLOAD = "SUSPICIOUS_DUPLICATE_PAYLOAD"
    NEGATIVE_VALUE = "SUSPICIOUS_NEGATIVE_VALUE"
    ZERO_VALUE = "ZERO_VALUE_TRANSACTION"
    INVALID_DATE = "INVALID_DATE_FORMAT"
    FUTURE_DATE = "FUTURE_DATE_TRANSACTION"
    HIGH_VALUE_THRESHOLD = "HIGH_VALUE_EXCEEDED"


class FinancialAuditor:
    """
    Engine de auditoria lógica para validação de integridade financeira,
    detecção de duplicidades, inconformidades temporais e classificação de risco.
    """

    def __init__(self, high_value_threshold: float = 10000.0):
        self.high_value_threshold = high_value_threshold

    def _validate_date_string(self, date_str: str) -> List[str]:
        """Aplica regras de validação lógica no formato e intervalo de datas (AAAA-MM-DD)."""
        anomalies = []
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
            if parsed_date > datetime.now():
                anomalies.append(AnomalyType.FUTURE_DATE)
        except ValueError:
            anomalies.append(AnomalyType.INVALID_DATE)
        return anomalies

    def audit(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Submete cada registro higienizado à esteira de regras de negócio.
        
        Enriquece a estrutura com metadados de auditoria: status, contagem de falhas,
        descrição detalhada e nível de severidade (INFO, WARNING, CRITICAL).
        """
        seen_ids: Set[str] = set()
        seen_payloads: Set[Tuple[str, str, float]] = set()
        audited_records: List[Dict[str, Any]] = []
        flagged_count: int = 0

        for record in records:
            anomalies: List[str] = []
            
            rec_id = str(record.get("id", ""))
            date_str = str(record.get("date", ""))
            description = str(record.get("description", ""))
            amount = float(record.get("amount", 0.0))

            # Regra 1: Duplicidade Exata de Identificador (ID)
            if rec_id in seen_ids:
                anomalies.append(AnomalyType.DUPLICATE_ID)
            else:
                seen_ids.add(rec_id)

            # Regra 2: Duplicidade de Conteúdo/Payload (Data + Descrição + Valor iguais)
            payload_signature = (date_str, description.strip().lower(), amount)
            if payload_signature in seen_payloads and AnomalyType.DUPLICATE_ID not in anomalies:
                anomalies.append(AnomalyType.DUPLICATE_PAYLOAD)
            else:
                seen_payloads.add(payload_signature)

            # Regra 3: Inconsistência Monetária (Valores Negativos ou Nulos)
            if amount < 0:
                anomalies.append(AnomalyType.NEGATIVE_VALUE)
            elif amount == 0:
                anomalies.append(AnomalyType.ZERO_VALUE)

            # Regra 4: Alerta de Alocação Acima do Teto (Outlier / Atipicidade)
            if abs(amount) >= self.high_value_threshold:
                anomalies.append(AnomalyType.HIGH_VALUE_THRESHOLD)

            # Regra 5: Validação da Sintaxe e Consistência Temporal
            anomalies.extend(self._validate_date_string(date_str))

            # Processamento de Severidade e Estado
            is_flagged = len(anomalies) > 0
            if is_flagged:
                flagged_count += 1

            # Nível de risco baseado na natureza da anomalia
            critical_rules = {AnomalyType.DUPLICATE_ID, AnomalyType.NEGATIVE_VALUE, AnomalyType.INVALID_DATE}
            if any(rule in critical_rules for rule in anomalies):
                severity = "CRITICAL"
            elif is_flagged:
                severity = "WARNING"
            else:
                severity = "INFO"

            # Retorna uma cópia imutável enriquecida com os dados da auditoria
            enriched_record = record.copy()
            enriched_record.update({
                "is_flagged": is_flagged,
                "anomalies_count": len(anomalies),
                "anomalies": ", ".join(anomalies) if anomalies else "OK",
                "severity": severity
            })

            audited_records.append(enriched_record)

        logging.info(
            f"Auditoria concluída. Registros analisados: {len(records)} | "
            f"Flagged (Com anomalia): {flagged_count} | OK: {len(records) - flagged_count}"
        )
        return audited_records