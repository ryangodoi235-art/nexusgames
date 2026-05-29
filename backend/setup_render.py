import urllib3
import json
import time

# Desabilitar avisos SSL
urllib3.disable_warnings()

# Configuração do banco (SUBSTITUA A SENHA)
DB_CONFIG = {
    'host': 'dpg-d8c8991o3t8c73b3n1i0-a-a.oregon-postgres.render.com',
    'database': 'nexusgames_db',
    'user': 'nexususer',
    'password': 'IymtjBALWlhWV6bRDTTqiy5ubJCEkaYa',
    'port': 5432
}

# Comandos SQL para criar as tabelas
sql_comandos = [
    """
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        admin BOOLEAN DEFAULT false,
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS jogos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(100),
        imagem_url VARCHAR(500),
        rating DECIMAL(3,1) DEFAULT 0,
        destaque BOOLEAN DEFAULT false
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        comentario TEXT NOT NULL,
        rating INTEGER,
        sentimento VARCHAR(20),
        data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS compras (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        numero_pedido VARCHAR(50),
        total DECIMAL(10,2),
        data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
]

def testar_conexao():
    """Testa a conexão com o banco"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port'],
            connect_timeout=10
        )
        conn.close()
        return True
    except Exception as e:
        print(f"Erro: {e}")
        return False

def criar_tabelas():
    """Cria as tabelas usando psycopg2"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port'],
            connect_timeout=30
        )
        cursor = conn.cursor()
        
        for sql in sql_comandos:
            cursor.execute(sql)
            print("✅ Comando executado")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Erro detalhado: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("📊 Configurando banco no Render")
    print("=" * 50)
    
    if criar_tabelas():
        print("✅ Tabelas criadas com sucesso!")
    else:
        print("❌ Erro ao criar tabelas")
        print("Tentando método alternativo...")
        
        # Método alternativo
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        
        if criar_tabelas():
            print("✅ Tabelas criadas com sucesso!")
        else:
            print("❌ Falha definitiva")
