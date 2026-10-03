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
