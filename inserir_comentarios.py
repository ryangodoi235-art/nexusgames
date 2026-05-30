#!/usr/bin/env python3
import psycopg2
from datetime import datetime

DATABASE_URL = "postgresql://nexususer:IymtjBALWlhWV6bRDTTqiy5ubJCEkaYa@dpg-d8c8991o3t8c73b3n1i0-a.oregon-postgres.render.com:5432/nexusgames_db_gxo9"

comentarios = [
    (1, "Melhor loja de jogos que já comprei! Interface incrível e entrega rápida.", 5, "positivo"),
    (1, "Adorei o sistema de recomendação, descobri jogos novos!", 4, "positivo"),
    (1, "O chatbot é muito útil, respondeu todas minhas dúvidas.", 5, "positivo"),
    (1, "Preços um pouco altos, mas a qualidade compensa.", 4, "positivo"),
    (1, "Gostei muito da experiência de compra. Recomendo!", 5, "positivo"),
]

def inserir_comentarios():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        for comentario in comentarios:
            cursor.execute("""
                INSERT INTO comentarios (usuario_id, comentario, rating, sentimento, data_comentario)
                VALUES (%s, %s, %s, %s, %s)
            """, (comentario[0], comentario[1], comentario[2], comentario[3], datetime.now()))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ {len(comentarios)} comentários inseridos!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    inserir_comentarios()
