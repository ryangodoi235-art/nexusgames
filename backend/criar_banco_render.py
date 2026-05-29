import psycopg2
import hashlib

# Substitua com os dados do seu banco
DB_CONFIG = {
    'host': 'dpg-d8c8991o3t8c73b3n1i0-a-a.oregon-postgres.render.com',
    'database': 'nexusgames_db',
    'user': 'nexususer',
    'password': 'IymtjBALWlhWV6bRDTTqiy5ubJCEkaYa',
    'port': 5432,
    'sslmode': 'require'
}

def criar_dados():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("✅ Conectado ao banco!")
        
        # Criar tabela de jogos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jogos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(200) NOT NULL,
                preco DECIMAL(10,2) NOT NULL,
                categoria VARCHAR(100),
                imagem_url VARCHAR(500),
                rating DECIMAL(3,1) DEFAULT 0,
                destaque BOOLEAN DEFAULT false
            )
        """)
        print("✅ Tabela jogos criada")
        
        # Criar tabela de usuários
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(200) UNIQUE NOT NULL,
                senha_hash VARCHAR(255) NOT NULL,
                admin BOOLEAN DEFAULT false,
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela usuarios criada")
        
        # Inserir jogos
        jogos = [
            ('Grand Theft Auto V', 349.00, 'Ação / Mundo Aberto', 'images/1.png', 4.8, True),
            ('Red Dead Redemption 2', 299.00, 'Ação / Aventura', 'images/2.png', 4.9, True),
            ('Rainbow Six Siege', 50.00, 'FPS / Competitivo', 'images/3.png', 4.7, False),
            ("Marvel's Spider-Man 2", 299.00, 'Ação / Aventura', 'images/4.png', 4.8, True),
            ('The Witcher 3: Wild Hunt', 63.00, 'RPG', 'images/5.png', 4.9, True),
            ('EA Sports FC 25', 299.00, 'Esporte', 'images/6.png', 4.6, False),
        ]
        
        for jogo in jogos:
            cursor.execute("""
                INSERT INTO jogos (nome, preco, categoria, imagem_url, rating, destaque)
                SELECT %s, %s, %s, %s, %s, %s
                WHERE NOT EXISTS (SELECT 1 FROM jogos WHERE nome = %s)
            """, (jogo[0], jogo[1], jogo[2], jogo[3], jogo[4], jogo[5], jogo[0]))
        
        # Criar admin
        senha_hash = hashlib.sha256("admin123".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha_hash, admin)
            SELECT 'Administrador', 'admin@nexusgames.com', %s, true
            WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@nexusgames.com')
        """, (senha_hash,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Dados inseridos com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    criar_dados()
