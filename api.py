import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from src.parser import FinancialParser
from src.auditor import FinancialAuditor
from src.reporter import FinancialReporter

app = FastAPI(
    title="Financial Audit Engine API",
    version="2.0.0",
    description="API REST para ingestão, parsing e auditoria financeira."
)

# Liberação de CORS para permitir requisições do GitHub Pages
app.add_middleware(
    CORSMiddleware,
    # Declaração explícita das origens confiáveis (remove o curinga "*")
    allow_origins=[
        "https://ib098.github.io",  # Cliente Web Público
        "http://localhost:8501",    # Dashboard Streamlit Local
        "http://127.0.0.1:5500"     # Live Server (Desenvolvimento)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("data/uploads")
OUTPUT_DIR = Path("data/output")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/api/v1/audit/process")
async def process_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.txt', '.csv')):
        raise HTTPException(status_code=400, detail="Formato inválido. Envie um arquivo .txt ou .csv")

    temp_path = UPLOAD_DIR / file.filename

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Ingestão e Processamento
        parser = FinancialParser(temp_path)
        parsed_data = parser.parse()

        # Auditoria Lógica
        auditor = FinancialAuditor(high_value_threshold=3000.0)
        audited_data = auditor.audit(parsed_data)

        # Geração de Relatórios
        reporter = FinancialReporter(OUTPUT_DIR)
        reporter.export_to_json(audited_data, filename=f"audit_{file.filename}.json")
        excel_path = reporter.export_to_excel(audited_data, filename=f"audit_{file.filename}.xlsx")

        # Retorno compatível com Streamlit (app.py) e Web Client (docs/app.js)
        return {
            "status": "success",
            "filename": file.filename,
            "total_records": len(audited_data),
            "excel_filename": excel_path.name,
            "excel_report_url": f"/api/v1/audit/download/{excel_path.name}",
            "data": audited_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no processamento: {str(e)}")


@app.get("/api/v1/audit/download/{filename}")
async def download_excel(filename: str):
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )