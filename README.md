# Financial Audit Engine 🚀

API REST e pipeline de ingestão, sanitização e auditoria sintática/lógica de relatórios financeiros brutos (`.txt` e `.csv`), com suporte a dashboards interativos e geração automática de relatórios em Excel e JSON.

---

## 🏛️ Arquitetura e Fluxo de Dados

1. **Ingestão:** Recebimento do arquivo bruto via endpoint REST `/api/v1/audit/process`.
2. **Parsing:** Leitura dinâmica com sniffer de delimitadores e sanitização dos registros sintáticos (`src/parser.py`).
3. **Auditoria:** Aplicação de regras de compliance e limites financeiros (`src/auditor.py`).
4. **Relatórios:** Exportação para `.json` e `.xlsx` (`src/reporter.py`).
5. **Consumo:** Disponibilização dos dados via Dashboard Streamlit isolado.

---

## 🟢 Implementações Convalidadas (O que deu certo)

- [x] **Conteinerização Integral:** Orquestração da arquitetura dual (FastAPI e Streamlit) via `docker-compose`, utilizando imagem otimizada (`python:3.12-slim`) e mapeamento de volumes para persistência de relatórios locais.
- [x] **Parsing Universal com Sniffer:** Refatoração do `FinancialParser` para detecção automática de delimitadores (`|`, `;`, `,`, tabulações) e extração tolerante a falhas em layouts industriais sujos ou arquivos sem cabeçalho padronizado.
- [x] **Túnel de Tráfego Cloudflare:** Adoção do `cloudflared` em substituição ao ngrok, garantindo exposição pública do dashboard sem interceptação de telas de aviso (*browser-warning*), contornando bloqueios de origin.
- [x] **Blindagem de Frontend:** Implementação de bloqueios lógicos (*fail-fast*) no Streamlit, interceptando listas de dados vazias antes da renderização de matrizes para prevenir exceções críticas de chave (`KeyError`).
- [x] **Contrato de API Resiliente:** Padronização da resposta JSON contendo tanto a rota REST (`excel_report_url`) quanto a referência direta do arquivo (`excel_filename`).

---

## 🔴 Falhas Históricas e Resoluções Arquiteturais

### 1. Obsolescência do Ngrok em Aplicações Cliente-Servidor
- **Diagnóstico Prévio:** O uso do ngrok em contas gratuitas injetava HTML intermediário nas respostas, corrompendo o parsing JSON no cliente web estático (`Unexpected end of JSON input`).
- **Resolução Aplicada:** A transição para o **Cloudflare Tunnel** provou-se o método mais ortodoxo e eficaz para túneis efêmeros, restabelecendo a integridade do protocolo HTTPS sem injeção de payloads de terceiros.

### 2. Acoplamento Restrito de Contratos de Dados (A reavaliar)
- **Diagnóstico Prévio:** Alterações nos nomes das chaves retornadas pelo backend geravam falhas em cascata no Streamlit. Embora a verificação `if not records` tenha mitigado o colapso estrutural, o contrato ainda não possui tipagem estrita.
- **Hipótese para Reavaliação Futura:** Implementar esquemas estritos de validação via **Pydantic Schemas / DTOs** para garantir a inviolabilidade da tipagem de resposta da API antes da transmissão ao cliente.

---

## 🧪 Backlog & Ideias Não Testadas (Roadmap)

- [ ] **Processamento Assíncrono em Lote:** Implementação de fila de tarefas (Celery + Redis ou FastAPI Background Tasks) para processamento de arquivos `.txt` com mais de 100 mil linhas sem o bloqueio da thread principal (*Event Loop*).
- [ ] **Detecção de Anomalias Estatísticas (ML):** Introdução de algoritmos de agrupamento (*Isolation Forest* ou *Z-Score*) no módulo `auditor.py` para identificar padrões anômalos de fraude corporativa além das regras fixas de valor limite (*threshold*).
- [ ] **Suíte de Testes Automatizados:** Implementação de testes unitários e de integração com `pytest` para aferição de robustez dos módulos `parser` e `auditor`.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Docker e Docker Desktop em execução.

### 1. Subir a Infraestrutura (Backend + Frontend)
No terminal, a partir da raiz do projeto, execute:
```powershell
docker compose up --build
