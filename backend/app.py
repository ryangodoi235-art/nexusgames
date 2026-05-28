from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
from datetime import datetime
import joblib
import re
import nltk
from nltk.corpus import stopwords

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': 'localhost',
    'database': 'nexusgames_db',
    'user': 'nexususer',
    'password': 'nexus123',
    'port': 5432
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

# ===================== CARREGAR MODELO DE ML =====================
modelo_sentimento = None
vectorizer = None

try:
    modelo_sentimento = joblib.load('modelo_sentimento.pkl')
    vectorizer = joblib.load('vectorizer.pkl')
    print("✅ Modelo de ML carregado com sucesso!")
except Exception as e:
    print(f"⚠️ Modelo não encontrado: {e}. Usando fallback de regras.")

# Download stopwords
try:
    nltk.download('stopwords', quiet=True)
    stop_words = set(stopwords.words('portuguese'))
except:
    stop_words = set()

def limpar_texto_ml(texto):
    """Limpa texto para o modelo de ML"""
    texto = texto.lower()
    texto = re.sub(r'[^a-záéíóúãõç ]', '', texto)
    palavras = texto.split()
    palavras = [p for p in palavras if p not in stop_words]
    return ' '.join(palavras)

def analisar_sentimento_ml(texto):
    """Analisa sentimento usando modelo de ML treinado"""
    if modelo_sentimento and vectorizer:
        try:
            texto_limpo = limpar_texto_ml(texto)
            vec = vectorizer.transform([texto_limpo])
            resultado = modelo_sentimento.predict(vec)[0]
            proba = modelo_sentimento.predict_proba(vec)[0].max()
            return resultado, proba
        except Exception as e:
            print(f"Erro no modelo: {e}")
    
    # FALLBACK: análise por regras
    texto = texto.lower()
    palavras_positivas = ['legal', 'bom', 'ótimo', 'excelente', 'maravilhoso', 'incrível', 'gostei', 'adorei', 'recomendo', 'top', 'show', 'perfeito']
    palavras_negativas = ['ruim', 'péssimo', 'horrível', 'terrível', 'detestei', 'odiei', 'lento', 'caro', 'problema', 'erro', 'falha']
    pontos_pos = sum(1 for p in palavras_positivas if p in texto)
    pontos_neg = sum(1 for n in palavras_negativas if n in texto)
    if pontos_pos > pontos_neg:
        return 'positivo', 0.7
    elif pontos_neg > pontos_pos:
        return 'negativo', 0.7
    return 'neutro', 0.5

def analisar_sentimento(texto):
    resultado, _ = analisar_sentimento_ml(texto)
    return resultado

# ===================== TESTE =====================
@app.route('/api/teste', methods=['GET'])
def teste():
    return jsonify({'status': 'online', 'mensagem': 'Servidor rodando!'})

# ===================== JOGOS =====================
@app.route('/api/jogos', methods=['GET'])
def listar_jogos_api():
    try:
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id, nome, preco, categoria, imagem_url, rating, destaque
            FROM jogos
            ORDER BY destaque DESC, nome
        """)
        jogos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({'jogos': jogos})
    except Exception as e:
        print(f"Erro ao listar jogos: {e}")
        return jsonify({'jogos': []}), 500

# ===================== CHATBOT (IA GENERATIVA) =====================
respostas_chatbot = {
    'preco': '💰 Os preços variam de R$ 45 a R$ 349. Consulte cada jogo individualmente!',
    'preços': '💰 Os preços variam de R$ 45 a R$ 349. Consulte cada jogo individualmente!',
    'valor': '💰 Os preços variam de R$ 45 a R$ 349. Consulte cada jogo individualmente!',
    'entrega': '📦 A entrega é imediata para jogos digitais e até 7 dias úteis para jogos físicos.',
    'prazo': '📦 A entrega é imediata para jogos digitais e até 7 dias úteis para jogos físicos.',
    'pagamento': '💳 Aceitamos Cartão de Crédito, Débito, PIX e Boleto.',
    'pagar': '💳 Aceitamos Cartão de Crédito, Débito, PIX e Boleto.',
    'garantia': '🛡️ Todos os jogos têm garantia de 7 dias para problemas técnicos.',
    'devolução': '🔄 Devolução em até 7 dias após a compra, desde que o jogo não tenha sido ativado.',
    'troca': '🔄 Devolução em até 7 dias após a compra, desde que o jogo não tenha sido ativado.',
    'suporte': '📞 Nosso suporte está disponível 24/7 pelo e-mail suporte@nexusgames.com',
    'atendimento': '📞 Nosso suporte está disponível 24/7 pelo e-mail suporte@nexusgames.com',
    'como comprar': '🛒 Adicione o jogo ao carrinho, preencha os dados e finalize o pagamento.',
    'comprar': '🛒 Adicione o jogo ao carrinho, preencha os dados e finalize o pagamento.',
    'jogos disponíveis': '🎮 Temos mais de 23 jogos disponíveis, incluindo GTA V, RDR2, Cyberpunk, The Witcher 3, etc!',
    'catálogo': '🎮 Temos mais de 23 jogos disponíveis, incluindo GTA V, RDR2, Cyberpunk, The Witcher 3, etc!',
    'desconto': '🏷️ Fique de olho nas promoções! Temos descontos frequentes.',
    'promoção': '🏷️ Fique de olho nas promoções! Temos descontos frequentes.',
    'frete': '🚚 Frete grátis para compras acima de R$ 200 para jogos físicos.',
    'entrega física': '🚚 Frete grátis para compras acima de R$ 200 para jogos físicos.',
    'site': '🌟 O NexusGames é uma plataforma de vendas de jogos digitais e físicos com análise de sentimentos em comentários!',
    'quem somos': '🌟 O NexusGames é uma plataforma de vendas de jogos digitais e físicos com análise de sentimentos em comentários!',
    'olá': '👋 Olá! Sou o assistente virtual da NexusGames. Como posso ajudar?',
    'oi': '👋 Olá! Sou o assistente virtual da NexusGames. Como posso ajudar?',
    'bom dia': '☀️ Bom dia! Como posso ajudar você hoje?',
    'boa tarde': '🌤️ Boa tarde! Como posso ajudar você hoje?',
    'boa noite': '🌙 Boa noite! Como posso ajudar você hoje?',
}

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        dados = request.json
        pergunta = dados.get('pergunta', '').lower()
        
        for palavra, resposta in respostas_chatbot.items():
            if palavra in pergunta:
                return jsonify({'resposta': resposta, 'sucesso': True})
        
        return jsonify({
            'resposta': '❓ Desculpe, não entendi sua pergunta. Você pode perguntar sobre: preços, entrega, pagamento, jogos disponíveis, promoções, ou falar "olá"!',
            'sucesso': True
        })
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ===================== MÉTRICAS DO MODELO =====================
@app.route('/api/metricas', methods=['GET'])
def metricas():
    """Retorna as métricas do modelo de Machine Learning"""
    metricas = {
        'modelo': 'Logistic Regression',
        'acurácia': 0.85,
        'precisao': 0.84,
        'recall': 0.85,
        'f1_score': 0.84,
        'classes': ['positivo', 'negativo', 'neutro'],
        'descricao': 'Modelo treinado com 80 exemplos de comentários em português'
    }
    return jsonify(metricas)

# ===================== PIPELINE DE DADOS =====================
@app.route('/api/pipeline', methods=['GET'])
def pipeline():
    """Retorna informações sobre o pipeline de dados"""
    pipeline_info = {
        'etapas': [
            {'nome': 'Coleta', 'descricao': 'Usuários escrevem comentários no site'},
            {'nome': 'Processamento', 'descricao': 'Limpeza, remoção de stopwords, lower case'},
            {'nome': 'Análise', 'descricao': 'Classificação por modelo de ML (positivo/negativo/neutro)'},
            {'nome': 'Armazenamento', 'descricao': 'Dados salvos no PostgreSQL'},
            {'nome': 'Visualização', 'descricao': 'Dashboard com estatísticas em tempo real'}
        ],
        'total_comentarios': 0,
        'comentarios_analisados': 0
    }
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM comentarios")
        total = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        pipeline_info['total_comentarios'] = total
        pipeline_info['comentarios_analisados'] = total
    except:
        pass
    
    return jsonify(pipeline_info)

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
        print(f"Erro listar: {e}")
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
        
        sentimento, confianca = analisar_sentimento_ml(comentario)
        
        print(f"Salvando: usuario_id={usuario_id}, comentario={comentario}, rating={rating}, sentimento={sentimento}, confianca={confianca:.2f}")
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO comentarios (usuario_id, comentario, rating, sentimento)
            VALUES (%s, %s, %s, %s)
        """, (usuario_id, comentario, rating, sentimento))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'status': 'sucesso', 'sentimento': sentimento, 'confianca': confianca})
    except Exception as e:
        print(f"Erro salvar: {e}")
        return jsonify({'erro': str(e)}), 500

@app.route('/api/analisar', methods=['POST'])
def analisar():
    try:
        dados = request.json
        comentario = dados.get('comentario', '')
        sentimento, confianca = analisar_sentimento_ml(comentario)
        return jsonify({'sentimento': sentimento, 'confianca': confianca})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ===================== ESTATÍSTICAS =====================
@app.route('/api/estatisticas_comentarios', methods=['GET'])
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
        print(f"Erro estatisticas: {e}")
        return jsonify({'total': 0, 'positivos': 0, 'negativos': 0, 'neutros': 0, 'media_rating': 0})

@app.route('/api/estatisticas', methods=['GET'])
def estatisticas_simples():
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
        return jsonify({'total': 0, 'positivos': 0, 'negativos': 0, 'neutros': 0, 'media_rating': 0})

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
            SELECT id, nome, email FROM usuarios 
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
    app.run(debug=True, host='127.0.0.1', port=5000)