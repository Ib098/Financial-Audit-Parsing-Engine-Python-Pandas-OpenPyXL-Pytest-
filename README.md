# Financial Audit & Parsing Engine

Motor de processamento e auditoria automatizada para dados financeiros desestruturados. 

## Funcionalidades
- Ingestão e higienização de ficheiros de texto brutos (`.txt`, `.csv`).
- Normalização de valores monetários no padrão BRL.
- Auditoria lógica para deteção de duplicidades, inconformidades de datas e lançamentos negativos.
- Exportação em relatórios executivos Excel e objetos JSON padronizados.

## Como Executar
1. Clonar o repositório e ativar o ambiente virtual.
2. Instalar dependências: `pip install -r requirements.txt`
3. Adicionar o ficheiro de entrada em `data/raw/relatorio_bruto.txt`
4. Executar a esteira: `python main.py`