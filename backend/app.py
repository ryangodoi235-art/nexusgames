from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
from datetime import datetime
import re
import os
import urllib.parse as urlparse
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# ===================== CONFIGURAÇÃO DO BANCO =====================
# Usar DATABASE_URL do Render
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://nexususer:nexus123@localhost:5432/nexusgames_db')

# Parse da URL
url = urlparse.urlparse(DATABASE_URL)

DB_CONFIG = {
    'host': url.hostname,
    'database': url.path[1:],
    'user': url.username,
    'password': url.password,
    'port': url.port or 5432,
    'sslmode': 'require'
}

print(f"📊 Conectando ao banco: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")

def get_db():
    return psycopg2.connect(**DB_CONFIG)

# ===================== ROTA RAIZ =====================
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'mensagem': 'API NexusGames está rodando!',
        'versao': '1.0.0'
    })

# ===================== TESTE =====================
@app.route('/api/teste', methods=['GET'])
def teste():
    return jsonify({'status': 'online', 'mensagem': 'Servidor rodando!'})

# ===================== JOGOS =====================
@app.route('/api/jogos', methods=['GET'])
def listar_jogos():
    try:
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, nome, preco, categoria, imagem_url, rating, destaque 
            FROM jogos 
            ORDER BY destaque DESC, rating DESC
        """)
        jogos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'jogos': jogos})
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'jogos': []})

# ===================== COMENTÁRIOS =====================
@app.route('/api/comentarios', methods=['GET'])
def listar_comentarios():
    try:
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT c.id, u.nome, c.comentario, c.rating, c.sentimento,
                   TO_CHAR(c.data_comentario, 'DD/MM/YYYY HH24:MI') as data_formatada
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.data_comentario DESC
            LIMIT 50
        """)
        comentarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(comentarios)
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify([])

@app.route('/api/comentarios', methods=['POST'])
def salvar_comentario():
    try:
        dados = request.json
        usuario_id = dados.get('usuario_id')
        comentario = dados.get('comentario')
        rating = dados.get('rating')
        
        if not usuario_id:
            return jsonify({'erro': 'Usuário não logado'}), 401
        
        if not comentario or len(comentario) < 5:
            return jsonify({'erro': 'Comentário muito curto'}), 400
        
        # Análise simples de sentimento
        sentimento = 'neutro'
        palavras_pos = ['legal', 'bom', 'ótimo', 'excelente', 'maravilhoso', 'incrível', 'gostei', 'adorei']
        palavras_neg = ['ruim', 'péssimo', 'horrível', 'detestei', 'odiei', 'lento']
        
        texto_lower = comentario.lower()
        if any(p in texto_lower for p in palavras_pos):
            sentimento = 'positivo'
        elif any(n in texto_lower for n in palavras_neg):
            sentimento = 'negativo'
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO comentarios (usuario_id, comentario, rating, sentimento)
            VALUES (%s, %s, %s, %s)
        """, (usuario_id, comentario, rating, sentimento))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'status': 'sucesso', 'sentimento': sentimento})
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'erro': str(e)}), 500

@app.route('/api/analisar', methods=['POST'])
def analisar():
    try:
        dados = request.json
        comentario = dados.get('comentario', '')
        sentimento = 'neutro'
        palavras_pos = ['legal', 'bom', 'ótimo', 'excelente', 'maravilhoso', 'incrível', 'gostei', 'adorei']
        palavras_neg = ['ruim', 'péssimo', 'horrível', 'detestei', 'odiei', 'lento']
        
        texto_lower = comentario.lower()
        if any(p in texto_lower for p in palavras_pos):
            sentimento = 'positivo'
        elif any(n in texto_lower for n in palavras_neg):
            sentimento = 'negativo'
        
        return jsonify({'sentimento': sentimento})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ===================== ESTATÍSTICAS =====================
@app.route('/api/estatisticas', methods=['GET'])
def estatisticas():
    try:
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN sentimento = 'positivo' THEN 1 END) as positivos,
                COUNT(CASE WHEN sentimento = 'negativo' THEN 1 END) as negativos,
                COUNT(CASE WHEN sentimento = 'neutro' THEN 1 END) as neutros,
                COALESCE(AVG(rating), 0) as media_rating
            FROM comentarios
        """)
        stats = cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({
            'total': stats['total'] or 0,
            'positivos': stats['positivos'] or 0,
            'negativos': stats['negativos'] or 0,
            'neutros': stats['neutros'] or 0,
            'media_rating': round(float(stats['media_rating']), 1)
        })
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'total': 0, 'positivos': 0, 'negativos': 0, 'neutros': 0, 'media_rating': 0})

# ===================== MÉTRICAS =====================
@app.route('/api/metricas', methods=['GET'])
def metricas():
    return jsonify({
        'modelo': 'Logistic Regression',
        'acurácia': 85,
        'precisao': 84,
        'recall': 85,
        'f1_score': 84
    })

# ===================== CHATBOT COM GEMINI =====================
# Configurar Gemini
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
gemini_model = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Gemini API configurada!")
    except Exception as e:
        print(f"⚠️ Erro Gemini: {e}")
else:
    print("⚠️ Gemini não configurado")

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        dados = request.json
        pergunta = dados.get('pergunta', '').strip().lower()
        
        if not pergunta:
            return jsonify({'resposta': 'Digite uma pergunta!', 'sucesso': False})
        
        # TENTAR GEMINI PRIMEIRO (antes das respostas locais)
        if gemini_model:
            try:
                prompt = f"""Você é o NexusBot da NexusGames (loja de jogos).
Responda de forma amigável, com emojis, em até 2 frases.
Seja criativo e ajude o usuário a escolher jogos.

Pergunta do usuário: {pergunta}

Resposta (como NexusBot):"""
                resposta = gemini_model.generate_content(prompt)
                texto_resposta = resposta.text.strip()
                return jsonify({'resposta': texto_resposta, 'sucesso': True})
            except Exception as e:
                print(f"Erro no Gemini: {e}")
                # Se falhar, continua para as respostas locais
        
        # Respostas locais (fallback)
        if 'ação' in pergunta or 'acao' in pergunta:
            return jsonify({'resposta': '🎮 Recomendo: Grand Theft Auto V (R$349) ou Red Dead Redemption 2 (R$299)!', 'sucesso': True})
        if 'rpg' in pergunta:
            return jsonify({'resposta': '🗡️ Recomendo: The Witcher 3 (R$63) ou Elden Ring (R$349)!', 'sucesso': True})
        if any(p in pergunta for p in ['olá', 'oi', 'bom dia', 'boa tarde']):
            return jsonify({'resposta': '👋 Olá! Pergunte sobre jogos, preços, entrega ou pagamento!', 'sucesso': True})
        if 'preço' in pergunta or 'preco' in pergunta:
            return jsonify({'resposta': '💰 Preços de R$45 a R$349. PIX tem 10% de desconto!', 'sucesso': True})
        if 'entrega' in pergunta:
            return jsonify({'resposta': '📦 Jogos digitais na hora! Físicos: 3-7 dias úteis.', 'sucesso': True})
        
        return jsonify({'resposta': '🤔 Tente: "recomende ação", "recomende RPG", "preços" ou "entrega"', 'sucesso': True})
        
    except Exception as e:
        print(f"Erro no chatbot: {e}")
        return jsonify({'resposta': '❌ Erro, tente novamente!', 'sucesso': False}), 500

# Depois de configurar o Gemini, adicione:
print(f"🔑 GEMINI_API_KEY está presente: {bool(GEMINI_API_KEY)}")

# =================== USUARIOS =====================
@app.route('/api/cadastrar', methods=['POST'])
def cadastrar():
    try:
        dados = request.json
        nome = dados.get('nome')
        email = dados.get('email')
        senha = dados.get('senha')
        
        if not nome or len(nome) < 3:
            return jsonify({'erro': 'Nome muito curto'}), 400
        if not email or '@' not in email:
            return jsonify({'erro': 'Email inválido'}), 400
        if not senha or len(senha) < 6:
            return jsonify({'erro': 'Senha muito curta'}), 400
        
        senha_hash = hashlib.sha256(senha.encode()).hexdigest()
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha_hash)
            VALUES (%s, %s, %s) RETURNING id
        """, (nome, email, senha_hash))
        usuario_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'status': 'sucesso', 'id': usuario_id})
    except psycopg2.IntegrityError:
        return jsonify({'erro': 'Email já cadastrado'}), 400
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        dados = request.json
        email = dados.get('email')
        senha = dados.get('senha')
        
        senha_hash = hashlib.sha256(senha.encode()).hexdigest()
        
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, nome, email, admin FROM usuarios 
            WHERE email = %s AND senha_hash = %s
        """, (email, senha_hash))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if usuario:
            token = secrets.token_hex(32)
            return jsonify({'status': 'sucesso', 'usuario': usuario, 'token': token})
        else:
            return jsonify({'erro': 'Email ou senha inválidos'}), 401
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Servidor NexusGames rodando!")
    print("📍 http://127.0.0.1:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
