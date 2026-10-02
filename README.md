# Financial Audit & Parsing Engine

Plataforma Full-Stack de alta performance para **ingestão, parsing, auditoria lógica e detecção de anomalias** em relatórios e extratos financeiros desestruturados.

Evoluída de um motor de processamento em lote para uma arquitetura distribuída e desacoplada, a solução oferece uma **API REST assíncrona** em **FastAPI**, um **Dashboard Executivo** interativo em **Streamlit**, relatórios estilizados em **Excel/JSON** e orquestração pronta via **Docker Compose**.

## Funcionalidades
- Ingestão e higienização de ficheiros de texto brutos (`.txt`, `.csv`).
- Normalização de valores monetários no padrão BRL.
- Auditoria lógica para deteção de duplicidades, inconformidades de datas e lançamentos negativos.
- Exportação em relatórios executivos Excel e objetos JSON padronizados.

## 📐 Arquitetura do Sistema

A aplicação adota o padrão de arquitetura desacoplada (*Decoupled Architecture*), separando a inteligência de negócios e auditoria da camada de apresentação:

```text
[ Arquivo Bruto (.txt/.csv) ]
             │
             ▼
 ┌──────────────────────┐      HTTP / REST      ┌──────────────────────┐
 │   Dashboard Web      │ ────────────────────► │     API Backend      │
 │     (Streamlit)      │ ◄──────────────────── │      (FastAPI)       │
 └──────────────────────┘      JSON Payload     └──────────┬───────────┘
            │                                              │
            │ Download (.xlsx)                             ▼
            └─────────────────────────────── ┌──────────────────────────┐
                                             │ Core Engine (src/)       │
                                             │  ├─ FinancialParser      │
                                             │  ├─ FinancialAuditor     │
                                             │  └─ FinancialReporter    │
                                             └──────────────────────────┘
