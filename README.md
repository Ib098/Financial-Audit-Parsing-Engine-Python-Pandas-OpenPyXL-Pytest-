```markdown
# Financial Audit & Parsing Engine

![Status](https://img.shields.io/badge/Status-Finalizado-success?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Dual_Engine_(Client--Side_%2B_Python_Core)-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![SheetJS](https://img.shields.io/badge/SheetJS-Client--Side_XLSX-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)

---

## 📌 Sumário Executivo

O **Financial Audit Engine** é uma plataforma determinística concebida para a ingestão, higienização sintática, auditoria lógica e emissão de conformidade sobre extratos e lotes de transações financeiras brutas.

O projeto resolve o problema de reconciliação em sistemas legados e operacionais que exportam dados heterogéneos sem consistência de delimitadores ou formatação monetária. A solução foi finalizada sob um paradigma arquitetural duplo:

1. **Client-Side Engine (Produção Contínua / Serverless):** Implementação autónoma que executa integralmente em memória volátil do navegador web através do GitHub Pages, suprimindo custos de infraestrutura e assegurando conformidade estrita de privacidade (*Zero-Data Retention*).
2. **Core Backend Engine (Ambiente de Engenharia / Microsserviços):** Arquitetura conteinerizada em Python com orquestração via Docker, fornecendo uma API REST assíncrona (FastAPI), pipeline CLI determinístico e painel analítico interativo (Streamlit).

---

## 🏛️ Topologia Arquitetural


```

```
                              [ Lote de Dados (.txt / .csv) ]
                                            │
                 ┌──────────────────────────┴──────────────────────────┐
                 ▼                                                     ▼
 [ NODO CLIENT-SIDE / SERVERLESS ]                   [ NODO BACKEND CONTEINERIZADO ]
 (Execução em Memória no Browser)                    (Docker Compose / Ambiente Local)
                 │                                                     │

```

┌─────────────────┴─────────────────┐                 ┌─────────────────┴─────────────────┐
│ • FileReader API                  │                 │ • FastAPI REST Service (:8000)    │
│ • SnifferParser (Heurística RegEx)│                 │ • Engine Python (Pandas/Auditor)  │
│ • Auditor Lógico (Compliance)     │                 │ • Dashboard Streamlit (:8501)     │
│ • SheetJS (Compilação .xlsx)      │                 │ • OpenPyXL Reporter Engine        │
│ • Chart.js & Tailwind UI          │                 │ • Bateria de Testes (Pytest)      │
└─────────────────┬─────────────────┘                 └─────────────────┬─────────────────┘
▼                                                     ▼
[ Relatório .XLSX / JSON ]                            [ Relatório .XLSX / JSON ]

```

---

## ⚙️ Regras de Auditoria e Heurísticas

O motor implementa validações lógicas e estáticas idênticas em ambas as frentes de computação:

| Código de Severidade | Critério Técnico | Ação do Motor |
| :--- | :--- | :--- |
| **CRITICAL** | Valor absoluto excede o teto parametrizado ($> \text{R\$} 3.000,00$). | Flag ativa; destaque vermelho no painel; catalogação no sumário executivo. |
| **WARNING** | Débito negativo anómalo ou estorno reportado no lote. | Flag ativa; realce âmbar para averiguação contábil. |
| **WARNING** | Colisão de identificadores de transação repetidos (IDs duplicados). | Sinalização imediata de suspeita de duplicidade no fluxo de liquidação. |
| **INFO** | Transações regulares em conformidade com as regras de negócio. | Consolidação nos agregadores estocásticos de volume e métricas. |

### Deteção Dinâmica de Delimitadores (*Sniffer*)
O motor infere automaticamente o layout estrutural do ficheiro analisando a densidade dos carateres `,`, `;`, `|` e tabulações `\t`, dispensando a necessidade de formatação prévia por parte do operador.

---

## 📂 Organização do Repositório

```text
├── data/
│   ├── output/                # Relatórios estruturados exportados (.json e .xlsx)
│   ├── raw/                   # Conjuntos de dados brutos e amostras de auditoria
│   └── uploads/               # Diretório transitório de ingestão da API
├── docs/                      # NÓDULO DE PRODUÇÃO WEB (GitHub Pages)
│   ├── app.js                 # Motor Client-Side unificado (Parser, Auditor e Exportador)
│   ├── index.html             # Interface responsiva construída em Tailwind CSS
│   └── styles.css             # Animações de transição e estilização global
├── src/                       # NÓDULO BACKEND (Arquitetura Python)
│   ├── auditor.py             # Implementação da classe FinancialAuditor
│   ├── parser.py              # Implementação da classe FinancialParser
│   └── reporter.py            # Orquestrador de relatórios analíticos (OpenPyXL)
├── tests/                     # Garantia de Qualidade
│   └── test_pipeline.py       # Suíte de testes unitários automatizados via Pytest
├── api.py                     # API RESTful de alta performance em FastAPI
├── app.py                     # Dashboard de observabilidade em Streamlit
├── docker-compose.yml         # Orquestrador de serviços e redes locais
├── Dockerfile.api             # Imagem conteinerizada da API Uvicorn
├── Dockerfile.streamlit       # Imagem conteinerizada do visualizador Streamlit
├── main.py                    # Ponto de entrada CLI para pipelines locais
└── requirements.txt           # Manifesto estrito de dependências Python

```

---

## 🚀 Como Utilizar

### Modo 1: Acesso Instantâneo em Produção (Zero Setup)

A interface serverless está alojada de forma estática e perene através do GitHub Pages:

* **Ambiente Ativo:** [Financial Audit Engine - Web Console](https://www.google.com/search?q=https://ib098.github.io/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-/)
* Basta arrastar um lote de dados (`.txt` ou `.csv`) e acionar a auditoria. A computação é concluída localmente pelo processador cliente, permitindo descarregar a planilha `.xlsx` instantaneamente.

### Modo 2: Orquestração Local via Docker (Ambiente Completo)

Para executar o backend analítico e os dashboards na sua própria infraestrutura:

```bash
# 1. Clonar o repositório
git clone [https://github.com/Ib098/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-.git](https://github.com/Ib098/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-.git)
cd Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-

# 2. Inicializar o ecossistema com Docker Compose
docker compose up --build

```

Endpoints locais disponibilizados:

* **API FastAPI (Docs OpenAPI):** `http://localhost:8000/docs`
* **Dashboard Streamlit:** `http://localhost:8501`

---

## 🧪 Qualidade de Código e Testes Automatizados

O núcleo lógico do backend possui cobertura de testes unitários para assegurar a idoneidade dos cálculos contábeis, tratamento de nulos e deteção de anomalias:

```bash
# Execução da suíte de validação lógica
pytest -v

```

---

## 🛡️ Privacidade e Conformidade de Dados

Na operação via web estática, nenhuma linha de dados é transmitida por redes externas. Os registos permanecem confinados na memória do navegador do utilizador durante toda a execução da rotina heurística, atendendo aos princípios fundamentais de segurança da informação e governança corporativa.

```

```
