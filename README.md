# Financial Audit Engine

Motor analítico para higienização, auditoria lógica e emissão de conformidade sobre lotes de transações financeiras brutas (.txt/.csv). 

Resolve inconsistências de delimitadores e formatações monetárias heterogêneas através de detecção heurística (*sniffer*).

---

### 🌐 Demonstração Online (Client-Side)
Acesse a aplicação em produção contínua via GitHub Pages (processamento 100% em memória no navegador, com custo zero de infraestrutura e privacidade total dos dados):
👉 **[Acessar Web Console](https://ib098.github.io/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-/)**

---

### 🏛️ Arquitetura do Sistema

* **Client-Side Engine (`/docs`):** Interface estática em Tailwind CSS que executa o pipeline em memória volátil via JavaScript nativo, gerando relatórios `.xlsx` em tempo de execução via SheetJS.
* **Backend Core (`/src` & `api.py`):** Microsserviço assíncrono em Python (FastAPI) com regras contábeis, documentação OpenAPI e dashboard interativo em Streamlit.

---

## ⚖️ Decisões de Engenharia & Trade-offs

* **Pandas vs. OpenPyXL:** O processamento em vetor e a sanitização inicial ocorrem via Pandas pela performance de manipulação matricial em memória. O OpenPyXL foi reservado estritamente para a geração do relatório final, assegurando preservação de tipos nativos de células numéricas, larguras de coluna e estética corporativa executiva.
* **Transição Serverless (Client-Side) vs. Microserviço:** O backend Python conteinerizado em Docker atende a pipelines assíncronos e processamentos pesados de lote via API. Contudo, para a demonstração pública em produção, a lógica foi portada para execução em memória volátil via JavaScript/SheetJS no navegador. Isso elimina pontos únicos de falha de rede (CORS/túneis), zera custos de infraestrutura e cumpre os requisitos de privacidade ao reter zero dados nos servidores (*Zero-Data Retention*).
* **Resiliência Heurística do Parser:** Em vez de forçar um esquema estrito pré-definido, o motor avalia a densidade de separadores nos primeiros registros (`Sniffer`), tolerando inconsistências típicas de exportações legadas de ERPs bancários.

---

### ⚙️ Regras de Auditoria

| Severidade | Regra Aplicada |
| :--- | :--- |
| **CRITICAL** | Lançamentos com valor absoluto acima do teto estipulado (> R$ 3.000,00). |
| **WARNING** | Valores negativos não justificados (estornos/débitos anômalos). |
| **WARNING** | Duplicidade de identificadores de transação no mesmo lote. |
| **INFO** | Transações regulares em conformidade. |

---

### 🚀 Execução Local (Docker)

Caso deseje rodar a API FastAPI e o Dashboard Streamlit localmente:

```bash
# Clonar e iniciar os serviços
git clone [https://github.com/Ib098/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-.git](https://github.com/Ib098/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-.git)
cd Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-
docker compose up --build

```

* **Swagger/OpenAPI:** `http://localhost:8000/docs`
* **Streamlit UI:** `http://localhost:8501`

---

### 🧪 Testes Automatizados

Validação das regras de negócio e cálculo contábil:

```bash
pytest -v

```

---

### 🛠️ Tecnologias

`Python` `FastAPI` `Docker Compose` `Pytest` `JavaScript` `SheetJS` `Tailwind CSS`

```

```
