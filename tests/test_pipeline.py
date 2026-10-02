import pytest
from pathlib import Path
from src.parser import FinancialParser
from src.auditor import FinancialAuditor, AnomalyType

def test_parser_valid_line():
    # Testa se o parser extrai corretamente valores monetários com R$
    parser = FinancialParser("dummy_path")
    normalized = parser._normalize_currency("R$ 1.500,50")
    assert normalized == 1500.50

def test_auditor_negative_value():
    # Testa se o auditor identifica valores negativos como anomalia
    auditor = FinancialAuditor()
    records = [{"id": "TX999", "date": "2026-10-01", "description": "Teste", "amount": -100.0}]
    audited = auditor.audit(records)
    
    assert audited[0]["is_flagged"] is True
    assert AnomalyType.NEGATIVE_VALUE in audited[0]["anomalies"]
    assert audited[0]["severity"] == "CRITICAL"