# Financial Audit Engine 🚀

API REST e pipeline de ingestão, sanitização e auditoria sintática/lógica de relatórios financeiros brutos (`.txt` e `.csv`), com suporte a dashboards interativos e geração automática de relatórios em Excel e JSON.

---

## 🏛️ Arquitetura e Fluxo de Dados

1. **Ingestão:** Recebimento do arquivo bruto via endpoint REST `/api/v1/audit/process`.
2. **Parsing:** Leitura e sanitização dos registros sintáticos (`src/parser.py`).
3. **Auditoria:** Aplicação de regras de compliance e limites financeiros (`src/auditor.py`).
4. **Relatórios:** Exportação para `.json` e `.xlsx` (`src/reporter.py`).
5. **Consumo:** Disponibilização dos dados via cliente Web estático (HTML/JS) e Dashboard Streamlit.

---

## 🟢 Implementações Convalidadas (O que deu certo)

- [x] **Ingestão Multi-formato:** Suporte a parsing e validação de estruturas de arquivos `.txt` e `.csv`.
- [x] **Arquitetura Dual de Frontend:** Suporte simultâneo para consumo via cliente Web estático (`docs/app.js`) e interface Streamlit (`app.py`).
- [x] **Contrato de API Resiliente:** Padronização da resposta JSON contendo tanto a rota REST (`excel_report_url`) quanto a referência direta do arquivo (`excel_filename`), prevenindo regressões e `KeyError`.
- [x] **Exportação de Relatórios:** Geração automática e dinâmica de planilhas Excel formatadas e arquivos JSON auditados na pasta `data/output/`.
- [x] **Configuração CORS:** Middleware FastAPI ajustado para permitir chamadas cross-origin em ambientes de desenvolvimento local e páginas estáticas.

---

## 🔴 Falhas e Limitações Catalogadas (A reavaliar com rigor)

### 1. Túneis de Desenvolvimento via ngrok (Conta Gratuita)
- **Problema:** O ngrok injeta uma página HTML intermediária (*browser-warning*) para novas conexões, o que faz com que chamadas `fetch` no frontend recebam HTML em vez do JSON esperado, gerando o erro `Unexpected end of JSON input`. Além disso, navegações com bloqueadores estritos (ex: Brave Shields) bloqueiam o tráfego por segurança.
- **Solução Paliativa Atual:** Testes locais via **Live Server** (`http://127.0.0.1:5500`) diretamente integrados ao FastAPI (`http://127.0.0.1:8000`).
- **Hipótese para Reavaliação Futura:** Avaliar a transição para **Cloudflare Tunnels (`cloudflared`)** ou a adição compulsória do cabeçalho `ngrok-skip-browser-warning: true` no cliente HTTP em ambiente de staging.

### 2. Acoplamento do Formato da Resposta no Cliente
- **Problema:** A quebra do contrato JSON entre rotas gerou exceções de chave (`KeyError`) no Streamlit quando o nome dos campos foi alterado unilateralmente.
- **Hipótese para Reavaliação Futura:** Implementar esquemas estritos de validação de dados via **Pydantic Schemas / DTOs** para garantir a tipagem e os campos do contrato de resposta da API antes do envio.

---

## 🧪 Backlog & Ideias Não Testadas (Roadmap)

- [ ] **Processamento Assíncrono em Lote:** Implementação de fila de tarefas (Celery + Redis ou FastAPI Background Tasks) para processamento de arquivos `.txt` com mais de 100 mil linhas sem travar a thread principal.
- [ ] **Detecção de Anomalias Estatísticas (ML):** Introdução de algoritmos de agrupamento (*Isolation Forest* ou *Z-Score*) no módulo `auditor.py` para identificar padrões suspeitos além de regras fixas de valor limite (*threshold*).
- [ ] **Suíte de Testes Automatizados:** Implementação de testes unitários e de integração com `pytest` para os módulos `parser`, `auditor` e endpoints da API.
- [ ] **Conteinerização Completa:** Criação de um `docker-compose.yml` isolando os serviços de API (FastAPI), Dashboard (Streamlit) e Servidor Web.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Python 3.10+
- Servidor local ou extensão **Live Server** no VS Code

### 1. Iniciar a API Backend (FastAPI)
```powershell
# Ativar ambiente virtual e subir o servidor
uvicorn api:app --reload
