import pandas as pd
import psycopg2
import os
from datetime import datetime

# Configuração do banco (usa a mesma do Render)
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://nexususer:nexus123@localhost:5432/nexusgames_db')

def executar_pipeline_etl(caminho_arquivo):
    print("=" * 50)
    print("📊 INICIANDO PIPELINE ETL - NexusGames")
    print("=" * 50)
    
    # ===================== CAMADA BRONZE (Extração) =====================
    print("\n🔵 1. CAMADA BRONZE - Extraindo dados brutos...")
    df = pd.read_csv(caminho_arquivo)
    print(f"   ✅ {len(df)} registros extraídos")
    
    # ===================== CAMADA SILVER (Transformação) =====================
    print("\n🟡 2. CAMADA SILVER - Transformando dados...")
    
    # Conversão de datas
    df['data_venda'] = pd.to_datetime(df['data_venda'], format='%d/%m/%Y')
    print("   ✅ Datas convertidas")
    
    # Governança: garantir estoque não negativo
    df.loc[df['estoque_disponivel_corrigido'] < 0, 'estoque_disponivel_corrigido'] = 0
    print("   ✅ Estoque corrigido (sem valores negativos)")
    
    # Remover duplicatas
    df = df.drop_duplicates(subset=['jogo'])
    print(f"   ✅ Registros após deduplicação: {len(df)}")
    
    # ===================== CAMADA GOLD (Carga) =====================
    print("\n🟢 3. CAMADA GOLD - Carregando no banco de dados...")
    
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    cursor = conn.cursor()
    
    # Atualizar tabela de jogos com dados de estoque
    for _, row in df.iterrows():
        cursor.execute("""
            UPDATE jogos 
            SET preco = %s, rating = %s, destaque = %s
            WHERE nome = %s
        """, (row['preco'], row.get('rating', 4.5), row.get('destaque', False), row['jogo']))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("   ✅ Dados carregados no PostgreSQL!")
    
    print("\n" + "=" * 50)
    print("✅ PIPELINE ETL CONCLUÍDO COM SUCESSO!")
    print("=" * 50)

# Executar o pipeline
if __name__ == "__main__":
    executar_pipeline_etl('planilha_estoque_corrigida.xlsx - Estoque Corrigido.csv')
