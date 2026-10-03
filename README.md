# Financial Audit Engine 🚀

API REST e pipeline de ingestão, sanitização e auditoria sintática/lógica de relatórios financeiros brutos (`.txt` e `.csv`), com suporte a dashboards interativos e geração automática de relatórios executivos em Excel e JSON.

---

## 🏛️ Arquitetura e Fluxo de Dados

1. **Ingestão:** Recebimento de arquivos estruturados via endpoint REST `/api/v1/audit/process`.
2. **Parsing:** Leitura dinâmica baseada em heurística (*sniffer* de delimitadores) e sanitização rigorosa de registros sintáticos corrompidos (`src/parser.py`).
3. **Auditoria:** Aplicação de regras de *compliance*, detecção de anomalias e limites financeiros de tolerância (`src/auditor.py`).
4. **Relatórios:** Estruturação e exportação automatizada para `.json` e `.xlsx` (`src/reporter.py`).
5. **Consumo (Arquitetura Dual):** Operação simultânea via Dashboard analítico (Streamlit) e Cliente Web Estático (Vanilla JS / GitHub Pages) estritamente desacoplado.

---

## 🟢 Implementações Convalidadas (Vitórias Arquiteturais)

- [x] **Conteinerização Integral:** Orquestração da arquitetura dual (FastAPI e Streamlit) via `docker-compose`, utilizando imagem base otimizada (`python:3.12-slim`) e mapeamento de volumes para persistência local de relatórios.
- [x] **Parsing Universal com Sniffer:** Refatoração do `FinancialParser` para detecção automática de delimitadores (`|`, `;`, `,`, tabulações) e extração tolerante a falhas em layouts industriais sujos ou matrizes sem cabeçalho padronizado.
- [x] **Desacoplamento de Frontend (GitHub Pages):** Implantação de um cliente web estático puro, consumindo a API FastAPI orquestrada localmente através de túneis seguros, com resolução definitiva de bloqueios de origin (CORS) e *Mixed Content*.
- [x] **Túnel de Tráfego (Cloudflare):** Adoção do `cloudflared` em substituição ao ngrok, garantindo exposição pública dos clientes (Streamlit e Web) sem interceptação de telas de aviso (*browser-warning*).
- [x] **Blindagem de Frontend:** Implementação de bloqueios lógicos preventivos (*fail-fast*) no Streamlit, interceptando listas de dados vazias antes da renderização de matrizes para suprimir exceções críticas de chave (`KeyError`).
- [x] **Contrato de API Resiliente:** Padronização da resposta JSON contendo tanto a rota REST (`excel_report_url`) quanto a referência direta do arquivo gerado (`excel_filename`).

---

## 🔴 Falhas Históricas e Resoluções Sistêmicas

### 1. Obsolescência do Ngrok em Aplicações Cliente-Servidor
- **Diagnóstico Prévio:** O uso do ngrok em contas gratuitas injetava HTML intermediário nas respostas HTTP, corrompendo o parsing JSON no cliente web estático (`Unexpected end of JSON input`).
- **Resolução Aplicada:** A transição para o **Cloudflare Tunnel** provou-se o método mais ortodoxo e eficaz para túneis efêmeros, restabelecendo a integridade do protocolo HTTPS sem injeção de *payloads* de terceiros.

### 2. Acoplamento Restrito de Contratos de Dados
- **Diagnóstico Prévio:** Alterações estruturais nos nomes das chaves retornadas pelo backend geravam falhas em cascata no Streamlit. A verificação `if not records` mitigou o colapso de renderização, porém o contrato carece de tipagem estrita bidirecional.
- **Hipótese para Reavaliação Futura:** Implementar esquemas de validação via **Pydantic Schemas / DTOs** para garantir a inviolabilidade da tipagem de resposta da API antes da transmissão ao cliente.

---

## 🧪 Backlog & Roadmap Técnico

- [ ] **Processamento Assíncrono em Lote:** Implementação de fila de tarefas (Celery + Redis ou FastAPI Background Tasks) para processamento de arquivos `.txt` de grande volume (>100 mil linhas) sem o bloqueio da thread principal (*Event Loop*).
- [ ] **Detecção de Anomalias Estatísticas (ML):** Introdução de algoritmos de agrupamento (*Isolation Forest* ou *Z-Score*) no módulo `auditor.py` para identificar padrões suspeitos de fraude corporativa independentes de regras fixas (*thresholds*).
- [ ] **Suíte de Testes Automatizados:** Implementação de testes unitários e de integração com `pytest` para aferição contínua da robustez dos módulos lógicos.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Motor do **Docker** e **Docker Desktop** em execução ativa.
- **Cloudflare Tunnel** (`cloudflared`) instalado nativamente no host para exposição remota.

### 1. Subir a Infraestrutura (Backend + Dashboard Streamlit)
A partir da raiz do projeto, execute o build e a orquestração dos contêineres:
```powershell
docker compose up --build
