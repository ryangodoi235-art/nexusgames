import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'database': 'nexusgames_db',
    'user': 'nexususer',
    'password': 'nexus123',
    'port': 5432
}

def criar_tabelas():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(200) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Tabela de comentários
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER REFERENCES usuarios(id),
            comentario TEXT NOT NULL,
            rating INTEGER,
            sentimento VARCHAR(20),
            data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Tabelas criadas com sucesso!")

if __name__ == "__main__":
    criar_tabelas()