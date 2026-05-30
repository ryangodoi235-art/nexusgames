#!/usr/bin/env python3
import psycopg2
import hashlib
import os

# ⚠️ COLE A SUA EXTERNAL DATABASE URL AQUI ⚠️
# Pega do Render: PostgreSQL -> External Database URL
DATABASE_URL = "postgresql://nexususer:IymtjBALWlhWV6bRDTTqiy5ubJCEkaYa@dpg-d8c8991o3t8c73b3n1i0-a.oregon-postgres.render.com:5432/nexusgames_db_gxo9"

def criar_tabelas():
    print("=" * 50)
    print("📊 CRIANDO TABELAS DO BANCO NEXUSGAMES")
    print("=" * 50)
    
    try:
        # Tenta conectar sem SSL primeiro
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Conectado ao banco (sem SSL)!")
        
        cursor = conn.cursor()
        
        # ========== 1. TABELA usuarios ==========
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(200) UNIQUE NOT NULL,
                senha_hash VARCHAR(255) NOT NULL,
                admin BOOLEAN DEFAULT false,
                cep VARCHAR(10),
                endereco VARCHAR(300),
                cidade VARCHAR(100),
                estado VARCHAR(2),
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela 'usuarios' verificada/criada")
        
        # ========== 2. TABELA jogos ==========
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jogos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(200) NOT NULL,
                preco DECIMAL(10,2) NOT NULL,
                categoria VARCHAR(100),
                imagem_url VARCHAR(500),
                rating DECIMAL(3,1) DEFAULT 0,
                destaque BOOLEAN DEFAULT false,
                preco_fisico DECIMAL(10,2)
            )
        """)
        print("✅ Tabela 'jogos' verificada/criada")
        
        # ========== 3. TABELA comentarios ==========
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comentarios (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                comentario TEXT NOT NULL,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                sentimento VARCHAR(20) DEFAULT 'neutro',
                data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela 'comentarios' criada")
        
        # ========== 4. TABELA compras ==========
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compras (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                numero_pedido VARCHAR(20) UNIQUE NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pendente',
                data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                endereco_entrega TEXT,
                forma_pagamento VARCHAR(50)
            )
        """)
        print("✅ Tabela 'compras' criada")
        
        # ========== 5. TABELA itens_compra ==========
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS itens_compra (
                id SERIAL PRIMARY KEY,
                compra_id INTEGER REFERENCES compras(id) ON DELETE CASCADE,
                jogo_id INTEGER REFERENCES jogos(id),
                quantidade INTEGER DEFAULT 1,
                preco_unitario DECIMAL(10,2),
                tipo_midia VARCHAR(20) DEFAULT 'digital'
            )
        """)
        print("✅ Tabela 'itens_compra' criada")
        
        # ========== 6. Usuário admin ==========
        senha_hash = hashlib.sha256("admin123".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha_hash, admin)
            SELECT 'Administrador', 'admin@nexusgames.com', %s, true
            WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@nexusgames.com')
        """, (senha_hash,))
        print("✅ Usuário admin garantido")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("=" * 50)
        print("✅ TODAS AS TABELAS CRIADAS COM SUCESSO!")
        print("=" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\n🔧 DICAS:")
        print("   1. Verifique se a URL do banco está correta")
        print("   2. Use a 'External Database URL' do Render")
        print("   3. Verifique se o banco está 'Live' no Render")
        return False

if __name__ == "__main__":
    criar_tabelas()
