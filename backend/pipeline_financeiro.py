import pandas as pd
import psycopg2
import os
import re
from datetime import datetime

# Configuração do banco (usa a mesma do Render)
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://nexususer:nexus123@localhost:5432/nexusgames_db')

def limpar_moeda(valor_str):
    """Converte string de moeda (R$ 1.234,56) para float"""
    if pd.isna(valor_str):
        return 0.0
    # Remove 'R$', espaços, e substitui vírgula por ponto
    limpo = str(valor_str).replace('R$', '').replace('.', '').replace(',', '.').strip()
    # Remove qualquer caractere não numérico exceto ponto
    limpo = re.sub(r'[^0-9.]', '', limpo)
    try:
        return float(limpo)
    except:
        return 0.0

def executar_pipeline_financeiro(caminho_arquivo):
    print("=" * 60)
    print("💰 PIPELINE FINANCEIRO - NexusGames")
    print("=" * 60)
    
    # ===================== CAMADA BRONZE =====================
    print("\n🔵 1. CAMADA BRONZE - Extraindo dados financeiros...")
    df = pd.read_csv(caminho_arquivo)
    print(f"   ✅ {len(df)} registros extraídos")
    
    # ===================== CAMADA SILVER =====================
    print("\n🟡 2. CAMADA SILVER - Transformando dados...")
    
    # Limpar colunas financeiras
    colunas_financeiras = ['preco_unitario', 'faturamento', 'preco_custo_total', 'lucro']
    for col in colunas_financeiras:
        if col in df.columns:
            df[col] = df[col].apply(limpar_moeda)
            print(f"   ✅ Coluna '{col}' convertida")
    
    # Garantir formato de data
    if 'data_venda' in df.columns:
        df['data_venda'] = pd.to_datetime(df['data_venda'], format='%d/%m/%Y', errors='coerce')
        print("   ✅ Datas convertidas")
    
    # Remover registros com datas inválidas
    df = df.dropna(subset=['data_venda'])
    print(f"   ✅ Registros válidos após limpeza: {len(df)}")
    
    # ===================== CAMADA GOLD =====================
    print("\n🟢 3. CAMADA GOLD - Carregando no Data Warehouse...")
    
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    cursor = conn.cursor()
    
    # Criar tabela de fatos se não existir
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fato_vendas_financeiras (
            id SERIAL PRIMARY KEY,
            jogo VARCHAR(200),
            plataforma VARCHAR(50),
            data_venda DATE,
            preco_unitario DECIMAL(10,2),
            faturamento DECIMAL(10,2),
            preco_custo_total DECIMAL(10,2),
            lucro DECIMAL(10,2)
        )
    """)
    
    # Inserir dados
    for _, row in df.iterrows():
        cursor.execute("""
            INSERT INTO fato_vendas_financeiras 
            (jogo, plataforma, data_venda, preco_unitario, faturamento, preco_custo_total, lucro)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            row.get('jogo', ''),
            row.get('plataforma', ''),
            row.get('data_venda'),
            row.get('preco_unitario', 0),
            row.get('faturamento', 0),
            row.get('preco_custo_total', 0),
            row.get('lucro', 0)
        ))
    
    conn.commit()
    
    # Criar tabela agregada de lucro por plataforma
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dm_lucro_plataforma AS
        SELECT 
            plataforma,
            SUM(lucro) as lucro_total,
            COUNT(*) as total_vendas,
            AVG(preco_unitario) as ticket_medio
        FROM fato_vendas_financeiras
        GROUP BY plataforma
        ORDER BY lucro_total DESC
    """)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("   ✅ Dados carregados no PostgreSQL!")
    
    # ===================== RESUMO =====================
    print("\n" + "=" * 60)
    print("📊 RESUMO DO PIPELINE FINANCEIRO")
    print("=" * 60)
    print(f"   📝 Total de transações: {len(df)}")
    print(f"   💰 Lucro total: R$ {df['lucro'].sum():,.2f}")
    print(f"   🎮 Jogos processados: {df['jogo'].nunique()}")
    print(f"   🖥️ Plataformas: {df['plataforma'].nunique()}")
    print("=" * 60)
    print("✅ PIPELINE ETL CONCLUÍDO COM SUCESSO!")
    print("=" * 60)

# Executar o pipeline
if __name__ == "__main__":
    # Substitua pelo nome do seu arquivo CSV
    executar_pipeline_financeiro('dados_financeiros.csv')
