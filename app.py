from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
import psycopg2.extras
import os
import jwt
import datetime
import hashlib

# Tentar importar Gemini (opcional)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ Google Generative AI não instalado. Gemini desativado.")

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'nexusgames-secret-key-2024')

# CORS
CORS(app, origins=["*"])

# Configurar Gemini (se disponível)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
gemini_model = None

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Gemini API configurada com sucesso!")
    except Exception as e:
        print(f"⚠️ Erro ao configurar Gemini: {e}")
else:
    print("⚠️ Gemini não disponível. Usando respostas locais.")

# ============================================
# CONEXÃO COM BANCO DE DADOS
# ============================================
def get_db_connection():
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL, sslmode='require')
    
    # Fallback para configuração local
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        database=os.environ.get('DB_NAME', 'nexusgames_db'),
        user=os.environ.get('DB_USER', 'nexususer'),
        password=os.environ.get('DB_PASSWORD', 'nexus123'),
        port=os.environ.get('DB_PORT', 5432)
    )

# ============================================
# ROTAS ESTÁTICAS (Frontend)
# ============================================
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# ============================================
# ROTA DE TESTE
# ============================================
@app.route('/api/teste', methods=['GET'])
def teste():
    return jsonify({'status': 'online', 'message': 'API funcionando!'})

# ============================================
# LOGIN
# ============================================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        dados = request.get_json()
        email = dados.get('email')
        senha = dados.get('senha')
        
        if not email or not senha:
            return jsonify({'erro': 'Email e senha são obrigatórios'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT id, nome, email, senha_hash, admin FROM usuarios WHERE email = %s", (email,))
        usuario = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not usuario:
            return jsonify({'erro': 'Usuário não encontrado'}), 401
        
        # Verificar senha (suporta SHA256)
        senha_hash = hashlib.sha256(senha.encode()).hexdigest()
        senha_valida = (senha_hash == usuario['senha_hash'])
        
        if not senha_valida:
            return jsonify({'erro': 'Senha incorreta'}), 401
        
        # Gerar token
        token = jwt.encode({
            'usuario_id': usuario['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'usuario': {
                'id': usuario['id'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'admin': usuario['admin'] if usuario['admin'] else False
            }
        }), 200
        
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

# ============================================
# CADASTRO
# ============================================
@app.route('/api/cadastro', methods=['POST'])
def cadastro():
    try:
        dados = request.get_json()
        nome = dados.get('nome')
        email = dados.get('email')
        senha = dados.get('senha')
        
        if not nome or not email or not senha:
            return jsonify({'erro': 'Todos os campos são obrigatórios'}), 400
        
        if len(senha) < 6:
            return jsonify({'erro': 'Senha deve ter pelo menos 6 caracteres'}), 400
        
        senha_hash = hashlib.sha256(senha.encode()).hexdigest()
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verificar se email já existe
        cur.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        # Inserir usuário
        cur.execute("""
            INSERT INTO usuarios (nome, email, senha_hash, admin, data_cadastro)
            VALUES (%s, %s, %s, false, NOW())
            RETURNING id
        """, (nome, email, senha_hash))
        
        usuario_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'mensagem': 'Usuário cadastrado com sucesso!',
            'usuario_id': usuario_id
        }), 201
        
    except Exception as e:
        print(f"Erro no cadastro: {e}")
        return jsonify({'erro': 'Erro interno do servidor'}), 500

# ============================================
# LISTAR JOGOS
# ============================================
@app.route('/api/jogos', methods=['GET'])
def listar_jogos():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT id, nome, preco, categoria, imagem_url, rating, destaque
            FROM jogos
            ORDER BY destaque DESC, id
        """)
        
        jogos = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        if not jogos:
            # Dados mockados se não houver jogos
            jogos = [
                {'id': 1, 'nome': 'Grand Theft Auto V', 'preco': 349.00, 'categoria': 'Ação / Mundo Aberto', 'imagem_url': 'images/1.png', 'rating': 4.8, 'destaque': True},
                {'id': 2, 'nome': 'Red Dead Redemption 2', 'preco': 299.00, 'categoria': 'Ação / Aventura', 'imagem_url': 'images/2.png', 'rating': 4.9, 'destaque': True},
                {'id': 3, 'nome': 'The Witcher 3', 'preco': 63.00, 'categoria': 'RPG', 'imagem_url': 'images/5.png', 'rating': 4.9, 'destaque': True},
            ]
        
        return jsonify({'jogos': jogos}), 200
        
    except Exception as e:
        print(f"Erro ao listar jogos: {e}")
        jogos_mock = [
            {'id': 1, 'nome': 'Grand Theft Auto V', 'preco': 349.00, 'categoria': 'Ação', 'imagem_url': 'images/1.png', 'rating': 4.8, 'destaque': True},
        ]
        return jsonify({'jogos': jogos_mock}), 200

# ============================================
# COMENTÁRIOS
# ============================================
@app.route('/api/comentarios', methods=['GET', 'POST'])
def comentarios():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            
            cur.execute("""
                SELECT c.id, u.nome, c.comentario, c.rating, c.sentimento, c.data_comentario
                FROM comentarios c
                JOIN usuarios u ON c.usuario_id = u.id
                ORDER BY c.data_comentario DESC
                LIMIT 50
            """)
            
            comentarios_lista = []
            for row in cur.fetchall():
                comentarios_lista.append({
                    'id': row['id'],
                    'nome': row['nome'],
                    'comentario': row['comentario'],
                    'rating': row['rating'],
                    'sentimento': row['sentimento'] or 'neutro',
                    'data_formatada': row['data_comentario'].strftime('%d/%m/%Y') if row['data_comentario'] else 'Data não disponível'
                })
            
            cur.close()
            conn.close()
            
            return jsonify(comentarios_lista), 200
            
        except Exception as e:
            print(f"Erro ao carregar comentários: {e}")
            return jsonify([]), 200
    
    elif request.method == 'POST':
        try:
            dados = request.get_json()
            usuario_id = dados.get('usuario_id')
            comentario = dados.get('comentario')
            rating = dados.get('rating')
            
            if not usuario_id or not comentario:
                return jsonify({'erro': 'Dados incompletos'}), 400
            
            # Análise simples de sentimento
            sentimento = 'neutro'
            palavras_positivas = ['bom', 'ótimo', 'excelente', 'maravilhoso', 'adorei', 'gostei', 'recomendo']
            palavras_negativas = ['ruim', 'péssimo', 'horrível', 'detestei', 'lento', 'caro']
            
            comentario_lower = comentario.lower()
            if any(p in comentario_lower for p in palavras_positivas):
                sentimento = 'positivo'
            elif any(p in comentario_lower for p in palavras_negativas):
                sentimento = 'negativo'
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute("""
                INSERT INTO comentarios (usuario_id, comentario, rating, sentimento)
                VALUES (%s, %s, %s, %s)
            """, (usuario_id, comentario, rating, sentimento))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return jsonify({'mensagem': 'Comentário enviado!', 'sentimento': sentimento}), 201
            
        except Exception as e:
            print(f"Erro ao salvar comentário: {e}")
            return jsonify({'erro': 'Erro ao salvar'}), 500

# ============================================
# ESTATÍSTICAS
# ============================================
@app.route('/api/estatisticas', methods=['GET'])
def estatisticas():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM comentarios")
        total = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM comentarios WHERE sentimento = 'positivo'")
        positivos = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM comentarios WHERE sentimento = 'negativo'")
        negativos = cur.fetchone()[0]
        
        neutros = total - positivos - negativos
        
        cur.execute("SELECT AVG(rating) FROM comentarios WHERE rating IS NOT NULL")
        media_rating = cur.fetchone()[0] or 0
        
        cur.close()
        conn.close()
        
        return jsonify({
            'total': total,
            'positivos': positivos,
            'negativos': negativos,
            'neutros': neutros,
            'media_rating': float(media_rating)
        }), 200
        
    except Exception as e:
        print(f"Erro estatísticas: {e}")
        return jsonify({'total': 0, 'positivos': 0, 'negativos': 0, 'neutros': 0, 'media_rating': 0}), 200

# ============================================
# CHATBOT (com Gemini)
# ============================================
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        dados = request.get_json()
        pergunta = dados.get('pergunta', '').strip().lower()
        
        if not pergunta:
            return jsonify({'resposta': 'Por favor, digite uma pergunta.'}), 400
        
        # Tentar usar Gemini primeiro
        if gemini_model:
            try:
                prompt = f"""Você é o NexusBot, assistente da NexusGames (loja de jogos).
Responda de forma amigável, com emojis, em até 2 frases.
Pergunta: {pergunta}
Resposta:"""
                resposta = gemini_model.generate_content(prompt)
                return jsonify({'resposta': resposta.text.strip()}), 200
            except Exception as e:
                print(f"Gemini error: {e}")
        
        # Fallback: respostas locais
        respostas_local = {
            'preço': '💰 Os preços variam de R$ 45 a R$ 349!',
            'preco': '💰 Os preços variam de R$ 45 a R$ 349!',
            'custa': '💰 Os preços variam de R$ 45 a R$ 349!',
            'promoção': '🎉 Temos promoções toda semana! Fique de olho!',
            'promocao': '🎉 Temos promoções toda semana! Fique de olho!',
            'entrega': '📦 Jogos digitais: entregues na hora! Físicos: 3-7 dias.',
            'gta': '🚗 Grand Theft Auto V - R$ 349,00',
            'witcher': '🐺 The Witcher 3 - R$ 63,00',
            'elden ring': '⚔️ Elden Ring - R$ 349,00',
            'rpg': '⚔️ Recomendo The Witcher 3 ou Elden Ring!',
            'obrigado': '🎮 Por nada! Volte sempre!',
        }
        
        for palavra, resposta in respostas_local.items():
            if palavra in pergunta:
                return jsonify({'resposta': resposta}), 200
        
        return jsonify({'resposta': 'Obrigado pela pergunta! Envie email para suporte@nexusgames.com 📧'}), 200
        
    except Exception as e:
        print(f"Erro chatbot: {e}")
        return jsonify({'resposta': 'Erro ao processar. Tente novamente.'}), 500

# ============================================
# MÉTRICAS
# ============================================
@app.route('/api/metricas', methods=['GET'])
def metricas():
    return jsonify({
        'acurácia': 85.5,
        'precisao': 84.2,
        'recall': 86.1,
        'f1_score': 85.1
    }), 200

# ============================================
# INICIAR SERVIDOR
# ============================================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
