#!/usr/bin/env python3
import psycopg2
from datetime import datetime
import random

DB_CONFIG = {
    'host': 'localhost',
    'database': 'nexusgames_db',
    'user': 'nexususer',
    'password': 'nexus123',
    'port': 5432
}

# Comentários variados com diferentes usuários
comentarios_variados = [
    # Positivos
    ("João Silva", "Melhor site de jogos! Interface incrível!", 5, "positivo"),
    ("Maria Santos", "Adorei a variedade de jogos. Recomendo!", 5, "positivo"),
    ("Pedro Oliveira", "Comprei The Witcher 3, rodou perfeito!", 4, "positivo"),
    ("Ana Costa", "Site muito rápido e fácil de usar.", 5, "positivo"),
    ("Carlos Lima", "Preços excelentes, melhor que a concorrência!", 4, "positivo"),
    
    # Neutros
    ("Fernanda Souza", "Site normal, funciona bem.", 3, "neutro"),
    ("Ricardo Alves", "É ok, nada demais.", 3, "neutro"),
    ("Patrícia Rocha", "Poderia ter mais jogos indie.", 3, "neutro"),
    
    # Negativos
    ("Lucas Pereira", "Site muito lento, demora pra carregar.", 2, "negativo"),
    ("Camila Ferreira", "Tive problema no pagamento.", 1, "negativo"),
    ("Rafael Lima", "Preços altos comparado a outros sites.", 2, "negativo"),
]

def inserir_comentarios_variados():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Buscar ou criar usuários
    for nome, comentario, rating, sentimento in comentarios_variados:
        # Verificar se usuário existe
        cursor.execute("SELECT id FROM usuarios WHERE nome = %s", (nome,))
        usuario = cursor.fetchone()
        
        if usuario:
            usuario_id = usuario[0]
        else:
            # Criar usuário se não existir
            cursor.execute("""
                INSERT INTO usuarios (nome, email, senha_hash)
                VALUES (%s, %s, %s) RETURNING id
            """, (nome, f"{nome.lower().replace(' ', '')}@email.com", "hash_temporario"))
            usuario_id = cursor.fetchone()[0]
        
        # Inserir comentário
        cursor.execute("""
            INSERT INTO comentarios (usuario_id, comentario, rating, sentimento, data_comentario)
            VALUES (%s, %s, %s, %s, %s)
        """, (usuario_id, comentario, rating, sentimento, datetime.now()))
    
    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ {len(comentarios_variados)} comentários inseridos com diferentes usuários!")

if __name__ == "__main__":
    inserir_comentarios_variados()
