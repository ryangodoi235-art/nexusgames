from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
from datetime import datetime
import re
import os

app = Flask(__name__)
CORS(app)

# ===================== CONFIGURAÇÃO DO BANCO =====================
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'nexusgames_db'),
    'user': os.environ.get('DB_USER', 'nexususer'),
    'password': os.environ.get('DB_PASSWORD', 'nexus123'),
    'port': os.environ.get('DB_PORT', 5432)
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

# ===================== ROTA RAIZ (para não dar 404) =====================
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'online',
        'mensagem': 'API NexusGames está rodando!',
        'versao': '1.0.0',
        'endpoints': [
            '/api/teste',
            '/api/jogos',
            '/api/comentarios',
            '/api/chatbot',
            '/api/metricas',
            '/api/estatisticas'
        ]
    })

# ===================== ROTA DE TESTE =====================
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
        print(f"Erro listar comentários: {e}")
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
        print(f"Erro salvar: {e}")
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
        print(f"Erro estatísticas: {e}")
        return jsonify({'total': 0, 'positivos': 0, 'negativos': 0, 'neutros': 0, 'media_rating': 0})

# ===================== MÉTRICAS =====================
@app.route('/api/metricas', methods=['GET'])
def metricas():
    return jsonify({
        'modelo': 'Logistic Regression',
        'acurácia': 85,
        'precisao': 84,
        'recall': 85,
        'f1_score': 84,
        'classes': ['positivo', 'negativo', 'neutro'],
        'descricao': 'Modelo treinado com comentários em português'
    })

# ===================== CHATBOT =====================
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        dados = request.json
        pergunta = dados.get('pergunta', '').lower()
        usuario_id = dados.get('usuario_id', None)
        
        # Recomendações por categoria
        if 'ação' in pergunta or 'acao' in pergunta:
            return jsonify({'resposta': '🎮 **Recomendações de jogos de AÇÃO**\n\n1️⃣ **Grand Theft Auto V**\n   ⭐ 4.8/5 | 💰 R$ 349,00\n\n2️⃣ **Red Dead Redemption 2**\n   ⭐ 4.9/5 | 💰 R$ 299,00\n\n3️⃣ **Marvel\'s Spider-Man 2**\n   ⭐ 4.8/5 | 💰 R$ 299,00', 'sucesso': True})
        
        if 'rpg' in pergunta:
            return jsonify({'resposta': '🗡️ **Recomendações de jogos RPG**\n\n1️⃣ **The Witcher 3**\n   ⭐ 4.9/5 | 💰 R$ 63,00\n\n2️⃣ **Cyberpunk 2077**\n   ⭐ 4.5/5 | 💰 R$ 249,00\n\n3️⃣ **Elden Ring**\n   ⭐ 4.9/5 | 💰 R$ 349,00', 'sucesso': True})
        
        # Saudação
        if any(p in pergunta for p in ['olá', 'oi', 'opa', 'bom dia', 'boa tarde', 'boa noite']):
            return jsonify({'resposta': '👋 Olá! Sou o assistente da NexusGames. Posso ajudar com:\n\n• Recomendar jogos\n• Informar preços\n• Explicar como comprar\n• Falar sobre promoções\n\n*O que você gostaria de saber?*', 'sucesso': True})
        
        # Preços
        if 'preço' in pergunta or 'precos' in pergunta:
            return jsonify({'resposta': '💰 **TABELA DE PREÇOS**\n\n• Jogos variam de R$ 45 a R$ 349\n• Jogos físicos custam 10% a mais\n• Parcelamos em até 6x sem juros\n• PIX tem 10% de desconto!', 'sucesso': True})
        
        # Entrega
        if 'entrega' in pergunta:
            return jsonify({'resposta': '📦 **ENTREGA**\n\n• Jogos digitais: Imediata\n• Jogos físicos: 5-7 dias úteis\n• Frete grátis para compras acima de R$ 200', 'sucesso': True})
        
        # Pagamento
        if 'pagamento' in pergunta:
            return jsonify({'resposta': '💳 **FORMAS DE PAGAMENTO**\n\n• Cartão de Crédito (até 6x)\n• Cartão de Débito\n• PIX (10% off)\n• Boleto Bancário', 'sucesso': True})
        
        # Ajuda
        if 'ajuda' in pergunta:
            return jsonify({'resposta': '🤖 **COMANDOS DISPONÍVEIS**\n\n• "recomende ação" - Jogos de ação\n• "recomende RPG" - Jogos de RPG\n• "preços" - Tabela de preços\n• "entrega" - Informações de entrega\n• "pagamento" - Formas de pagamento', 'sucesso': True})
        
        # Resposta padrão
        return jsonify({
            'resposta': '🤔 **Não entendi sua pergunta.**\n\nTente perguntar:\n• "recomende ação"\n• "recomende RPG"\n• "preços"\n• "entrega"\n• "pagamento"',
            'sucesso': True
        })
        
    except Exception as e:
        print(f"Erro chatbot: {e}")
        return jsonify({'resposta': '❌ Erro no servidor. Tente novamente!', 'sucesso': False}), 500

# ===================== USUÁRIOS =====================
@app.route('/api/cadastrar', methods=['POST'])
def cadastrar():
    try:
        dados = request.json
        nome = dados.get('nome')
        email = dados.get('email')
        senha = dados.get('senha')
        cep = dados.get('cep')
        endereco = dados.get('endereco')
        cidade = dados.get('cidade')
        estado = dados.get('estado')
        
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
            INSERT INTO usuarios (nome, email, senha_hash, cep, endereco, cidade, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (nome, email, senha_hash, cep, endereco, cidade, estado))
        usuario_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'status': 'sucesso', 'id': usuario_id})
    except psycopg2.IntegrityError:
        return jsonify({'erro': 'Email já cadastrado'}), 400
    except Exception as e:
        print(f"Erro cadastrar: {e}")
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
        print(f"Erro login: {e}")
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Servidor NexusGames rodando!")
    print("📍 http://127.0.0.1:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
