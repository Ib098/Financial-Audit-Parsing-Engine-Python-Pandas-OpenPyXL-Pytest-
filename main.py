import logging
from pathlib import Path
from src.parser import FinancialParser
from src.auditor import FinancialAuditor
from src.reporter import FinancialReporter

# Configuração de logging global
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def run_pipeline():
    raw_file_path = Path("data/raw/relatorio_bruto.txt")
    output_dir = Path("data/output")

    logging.info("=== INICIANDO PIPELINE DE AUDITORIA FINANCEIRA ===")

    # 1. Ingestão e Parsing
    logging.info("[1/3] Executando Engine de Parsing...")
    parser = FinancialParser(raw_file_path)
    parsed_data = parser.parse()

    # 2. Auditoria Lógica e Regras de Negócio
    logging.info("[2/3] Executando Engine de Auditoria...")
    auditor = FinancialAuditor(high_value_threshold=3000.0)
    audited_data = auditor.audit(parsed_data)

    # 3. Geração de Entregáveis (JSON & Excel)
    logging.info("[3/3] Exportando Entregáveis Estruturados...")
    reporter = FinancialReporter(output_dir)
    reporter.export_to_json(audited_data)
    reporter.export_to_excel(audited_data)

    logging.info("=== PIPELINE CONCLUÍDO COM SUCESSO ===")

if __name__ == "__main__":
    run_pipeline()