import psycopg2
import hashlib
import ssl

SENHA_DO_RENDER = "IymtjBALWlhWV6bRDTTqiy5ubJCEkaYa"

DB_CONFIG = {
    'host': 'dpg-d8c8991o3t8c73b3n1i0-a-a.oregon-postgres.render.com',
    'database': 'nexusgames_db',
    'user': 'nexususer',
    'password': SENHA_DO_RENDER,
    'port': 5432,
    'sslmode': 'require'
}

def criar_tabelas():
    try:
        print("📊 Conectando ao banco no Render...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Usuários
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
        
        # Jogos
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
        
        # Comentários
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
        print("✅ Tabela comentarios criada")
        
        # Compras
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compras (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id),
                numero_pedido VARCHAR(50),
                total DECIMAL(10,2),
                data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela compras criada")
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Todas as tabelas criadas com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def inserir_jogos():
    try:
        print("🎮 Inserindo jogos...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
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
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ {len(jogos)} jogos inseridos")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao inserir jogos: {e}")
        return False

def criar_admin():
    try:
        print("👑 Criando usuário administrador...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        senha_hash = hashlib.sha256("admin123".encode()).hexdigest()
        
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha_hash, admin)
            SELECT 'Administrador', 'admin@nexusgames.com', %s, true
            WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@nexusgames.com')
        """, (senha_hash,))
        
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Usuário admin criado (admin@nexusgames.com / admin123)")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar admin: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("📊 Configurando banco no Render")
    print("=" * 50)
    
    if criar_tabelas():
        inserir_jogos()
        criar_admin()
        print("=" * 50)
        print("✅ Banco configurado com sucesso!")
        print("📍 https://nexusgames-api.onrender.com/api/jogos")
    else:
        print("❌ Falha na conexão. Verifique:")
        print("   1. A senha está correta?")
        print("   2. O banco está ativo no Render?")

