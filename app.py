import streamlit as st
import pandas as pd
import plotly.express as px
import requests

st.set_page_config(page_title="Financial Audit Dashboard", layout="wide", page_icon="📊")

st.title("📊 Financial Audit & Parsing Engine")
st.caption("Plataforma de Auditoria Financeira e Detecção de Anomalias")

st.sidebar.header("Painel de Controle")
uploaded_file = st.sidebar.file_uploader("Selecione o relatório (.txt ou .csv)", type=["txt", "csv"])

if uploaded_file is not None:
    if st.sidebar.button("🚀 Processar e Auditar", use_container_width=True):
        files = {"file": (uploaded_file.name, uploaded_file.getvalue())}
        
        with st.spinner("Conectando à API REST e auditando lançamentos..."):
            try:
                response = requests.post("http://127.0.0.1:8000/api/v1/audit/process", files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    records = result["data"]
                    df = pd.DataFrame(records)

                    st.success(f"Arquivo `{result['filename']}` processado com sucesso!")

                    # Métricas de Topo (KPIs)
                    col1, col2, col3, col4 = st.columns(4)
                    total_proc = result["total_records"]
                    flagged_cnt = len(df[df["is_flagged"] == True])
                    critical_cnt = len(df[df["severity"] == "CRITICAL"])
                    risk_vol = df[df["is_flagged"] == True]["amount"].abs().sum()

                    col1.metric("Transações Processadas", total_proc)
                    col2.metric("Sinalizadas (Flagged)", flagged_cnt, delta_color="inverse")
                    col3.metric("Anomalias Críticas", critical_cnt, delta_color="inverse")
                    col4.metric("Volume em Risco (R$)", f"R$ {risk_vol:,.2f}")

                    st.markdown("---")

                    # Gráficos Analíticos
                    c1, c2 = st.columns(2)

                    with c1:
                        st.subheader("Distribuição de Severidade")
                        fig_pie = px.pie(
                            df, 
                            names="severity", 
                            color="severity",
                            color_discrete_map={"INFO": "#2ecc71", "WARNING": "#f1c40f", "CRITICAL": "#e74c3c"}
                        )
                        st.plotly_chart(fig_pie, use_container_width=True)

                    with c2:
                        st.subheader("Análise de Valores Monetários")
                        fig_bar = px.bar(
                            df, 
                            x="id", 
                            y="amount", 
                            color="severity",
                            hover_data=["description", "anomalies"],
                            color_discrete_map={"INFO": "#2ecc71", "WARNING": "#f1c40f", "CRITICAL": "#e74c3c"}
                        )
                        st.plotly_chart(fig_bar, use_container_width=True)

                    # Download do Excel Gerado
                    st.markdown("---")
                    excel_name = result["excel_filename"]
                    excel_url = f"http://127.0.0.1:8000/api/v1/audit/download/{excel_name}"
                    st.download_button(
                        label="📥 Baixar Relatório Executivo Formatado (.xlsx)",
                        data=requests.get(excel_url).content,
                        file_name=excel_name,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        use_container_width=True
                    )

                    # Tabela Interativa de Registros
                    st.subheader("Detalhamento dos Registros Auditados")
                    st.dataframe(df, use_container_width=True)

                else:
                    st.error(f"Erro na API: {response.json().get('detail')}")

            except requests.exceptions.ConnectionError:
                st.error("⚠️ Falha de conexão. Certifique-se de que a API FastAPI está em execução no terminal 1.")
else:
    st.info("👈 Faça o upload de um arquivo `.txt` ou `.csv` na barra lateral para iniciar a análise.")