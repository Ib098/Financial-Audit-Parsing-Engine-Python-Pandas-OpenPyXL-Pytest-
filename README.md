# Financial Audit Engine

Motor analítico para higienização, auditoria lógica e emissão de conformidade sobre lotes de transações financeiras brutas (.txt/.csv). 

Resolve inconsistências de delimitadores e formatações monetárias heterogêneas através de detecção heurística (*sniffer*).

---

## 🎓 Fundamentação Acadêmica e Adoção Tecnológica

Este projeto foi concebido como um laboratório de engenharia aplicado para materializar e expandir os fundamentos de Ciência da Computação adquiridos até ao 3º período do curso de Engenharia de Software. 

A construção do ecossistema operou sob o paradigma moderno de **Desenvolvimento Assistido por Inteligência Artificial**. Modelos generativos (LLMs) foram utilizados de forma orquestrada como aceleradores para estruturação sintática (boilerplate) e resolução de entraves de integração. No entanto, a espinha dorsal da aplicação — a modelação matemática do problema, a definição dos *trade-offs* arquiteturais e as restrições lógicas — assenta integralmente nos pilares teóricos da formação acadêmica:

### 1. Aplicação de Conceitos Curriculares
* **Complexidade Assintótica e Estruturas de Dados:** O algoritmo de *parsing* e sanitização foi arquitetado com foco na otimização de tempo de execução, garantindo uma varredura linear $\mathcal{O}(n)$ sobre os lotes de transações. O domínio sobre alocação de memória dinâmica e tipos heterogêneos (consolidados na aprendizagem de C/C++) permitiu conceber um motor seguro para processamento de *arrays* volumosos diretamente na memória volátil do navegador, mitigando riscos de fragmentação.
* **Pensamento Computacional e Modularização:** O motor lógico foi decomposto em entidades isoladas (*Parser*, *Auditor*, *Reporter*), aplicando princípios estritos de coesão, encapsulamento e passagem controlada de parâmetros, fundamentos absorvidos nas disciplinas de Programação e Arquitetura de Subprogramas.
* **Redes e Protocolos de Comunicação:** A compreensão teórica da pilha TCP/IP, métodos HTTP (Request/Response) e serialização JSON foi imperativa para diagnosticar falhas de roteamento, suprimir anomalias de CORS e viabilizar a transição madura do microsserviço original para a topologia estática *Client-Side*.
* **Linguagens e Interfaces:** Aplicação prática e avançada da mecânica do Python (estruturas de repetição, manipulação de exceções e POO) e das linguagens web estruturais (manipulação do DOM via JavaScript ES6+, HTML5 e CSS3).

### 2. Expansão Extracurricular
Para garantir que a solução não seria apenas um protótipo acadêmico, mas um produto corporativo de alta disponibilidade, incorporei autonomamente tecnologias externas à grade curricular atual:
* **Backend de Alta Performance:** Adoção do *FastAPI* e *Uvicorn* (arquitetura assíncrona) em contraste com frameworks web procedurais clássicos.
* **Infraestrutura e DevOps:** Implementação de conteinerização através do *Docker* e *Docker Compose*, assegurando isolamento de dependências e paridade entre os ambientes de desenvolvimento e produção.
* **Ecossistema Frontend Moderno:** Substituição de CSS e *Bootstrap* pelo *Tailwind CSS* (abordagem baseada em classes utilitárias) para compilação visual responsiva. Integração da biblioteca *SheetJS* para viabilizar a exportação nativa de relatórios binários `.xlsx` sem intervenção de servidores.
* **Observabilidade:** Utilização do *Streamlit* para renderização rápida de *dashboards* e ferramentas de telemetria analítica no nó Python.

---

### 🌐 Demonstração Online (Client-Side)
Acesse a aplicação em produção contínua via GitHub Pages (processamento 100% em memória no navegador, com custo zero de infraestrutura e privacidade total dos dados):
👉 **[Acessar Web Console](https://ib098.github.io/Financial-Audit-Parsing-Engine-Python-Pandas-OpenPyXL-Pytest-/)**

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
