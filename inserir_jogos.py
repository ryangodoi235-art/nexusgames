#!/usr/bin/env python3
import psycopg2

DATABASE_URL = "postgresql://nexususer:IymtjBALWlhWV6bRDTTqiy5ubJCEkaYa@dpg-d8c8991o3t8c73b3n1i0-a.oregon-postgres.render.com:5432/nexusgames_db_gxo9"

jogos = [
    ('Grand Theft Auto V', 349.00, 'Ação / Mundo Aberto', 'images/1.png', 4.8, True, 384.00),
    ('Red Dead Redemption 2', 299.00, 'Ação / Aventura', 'images/2.png', 4.9, True, 329.00),
    ('Rainbow Six Siege', 50.00, 'FPS / Competitivo', 'images/3.png', 4.7, False, 55.00),
    ("Marvel's Spider-Man 2", 299.00, 'Ação / Aventura', 'images/4.png', 4.8, True, 329.00),
    ('The Witcher 3: Wild Hunt', 63.00, 'RPG', 'images/5.png', 4.9, True, 69.30),
    ('EA Sports FC 25', 299.00, 'Esporte', 'images/6.png', 4.6, False, 329.00),
    ('Rust', 100.00, 'Sobrevivência', 'images/rust.webp', 4.7, True, 110.00),
    ('God of War Ragnarök', 149.00, 'Ação / Aventura', 'images/God_of_War_Ragnarök.jpg', 4.9, True, 163.90),
    ("Assassin's Creed Valhalla", 220.00, 'RPG / Mundo Aberto', 'images/assassins_creed_valhalla.webp', 4.5, False, 242.00),
    ('NBA 2K25', 180.00, 'Esporte', 'images/nba_2k25.webp', 4.3, False, 198.00),
    ('Forza Horizon 5', 230.00, 'Corrida', 'images/Forza_Horizon_5.jpg', 4.8, True, 253.00),
    ('Monster Hunter Wilds', 249.00, 'RPG / Ação', 'images/monster_hunter_wilds.avif', 4.8, True, 273.90),
    ('Cyberpunk 2077', 249.00, 'RPG / Mundo Aberto', 'images/cyberpunk2077.png', 4.5, True, 273.90),
    ('Elden Ring', 349.00, 'RPG / Soulslike', 'images/elden_ring.jpg', 4.9, True, 383.90),
    ('Hogwarts Legacy', 190.00, 'RPG / Mundo Aberto', 'images/hogwarts_legacy.jpg', 4.6, False, 209.00),
    ('Battlefield 2042', 45.00, 'FPS', 'images/battlefield2042.jpg', 4.0, False, 49.50),
    ('Gran Turismo 7', 132.89, 'Corrida', 'images/gran_turismo7.webp', 4.7, False, 146.18),
    ('Minecraft', 145.00, 'Sandbox / Sobrevivência', 'images/minecraft.webp', 4.8, True, 159.50),
    ('Terraria', 90.00, 'Sandbox / Sobrevivência', 'images/terraria.webp', 4.7, False, 99.00),
    ('Hades', 134.40, 'Roguelike / Ação', 'images/hades.jpg', 4.8, False, 147.84),
    ('Stardew Valley', 154.90, 'Simulação / Indie', 'images/stardew_valley.jpg', 4.9, False, 170.39),
    ("Baldur's Gate 3", 180.00, 'RPG', 'images/baldurs_gate3.jpg', 4.9, True, 198.00),
    ('Final Fantasy VII Remake', 110.00, 'RPG / Ação', 'images/final_fantasy.webp', 4.7, False, 121.00),
]

def inserir_jogos():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        for jogo in jogos:
            cursor.execute("""
                INSERT INTO jogos (nome, preco, categoria, imagem_url, rating, destaque, preco_fisico)
                SELECT %s, %s, %s, %s, %s, %s, %s
                WHERE NOT EXISTS (SELECT 1 FROM jogos WHERE nome = %s)
            """, (jogo[0], jogo[1], jogo[2], jogo[3], jogo[4], jogo[5], jogo[6], jogo[0]))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✅ {len(jogos)} jogos inseridos com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    inserir_jogos()
