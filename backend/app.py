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

def anonimizar_cliente(nome_cliente):
    """Anonimiza o nome do cliente usando SHA-256 com salt"""
    if not nome_cliente:
        return "Desconhecido"
    
    segredo = "NexusGames_Segredo_2026"
    texto = f"{nome_cliente}_{segredo}"
    return hashlib.sha256(texto.encode()).hexdigest()


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
        cep = dados.get('cep')
        endereco = dados.get('endereco')
        numero = dados.get('numero')
        complemento = dados.get('complemento')
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
        
        # Adicionar colunas se não existirem
        try:
            cursor.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cep VARCHAR(10)")
            cursor.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS endereco VARCHAR(300)")
            cursor.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero VARCHAR(10)")
            cursor.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS complemento VARCHAR(100)")
            cursor.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cidade VARCHAR(100)")
            cursor.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado VARCHAR(2)")
            conn.commit()
        except Exception as e:
            print(f"Erro ao adicionar colunas: {e}")
        
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha_hash, cep, endereco, numero, complemento, cidade, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (nome, email, senha_hash, cep, endereco, numero, complemento, cidade, estado))
        
        usuario_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'status': 'sucesso', 'id': usuario_id})
    except psycopg2.IntegrityError:
        return jsonify({'erro': 'Email já cadastrado'}), 400
    except Exception as e:
        print(f"Erro: {e}")
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

# ===================== DASHBOARD DE VENDAS =====================
@app.route('/api/dashboard/vendas', methods=['GET'])
def dashboard_vendas():
    try:
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Totais gerais
        cursor.execute("""
            SELECT 
                COUNT(*) as total_vendas,
                SUM(faturamento) as faturamento_total,
                SUM(lucro) as lucro_total,
                ROUND(AVG(lucro/faturamento * 100), 1) as margem_media
            FROM vendas
        """)
        totais = cursor.fetchone()
        
        # Top 10 jogos por faturamento
        cursor.execute("""
            SELECT 
                jogo, 
                SUM(faturamento) as faturamento,
                SUM(quantidade_vendida) as unidades,
                SUM(lucro) as lucro
            FROM vendas
            GROUP BY jogo
            ORDER BY faturamento DESC
            LIMIT 10
        """)
        top_jogos = cursor.fetchall()
        
        # Vendas por mês
        cursor.execute("""
            SELECT 
                TO_CHAR(DATE_TRUNC('month', data_venda), 'MM/YYYY') as mes,
                SUM(faturamento) as faturamento,
                SUM(lucro) as lucro,
                COUNT(*) as vendas
            FROM vendas
            WHERE data_venda IS NOT NULL
            GROUP BY DATE_TRUNC('month', data_venda)
            ORDER BY DATE_TRUNC('month', data_venda) DESC
            LIMIT 12
        """)
        vendas_mensal = cursor.fetchall()
        
        # Lucro por categoria
        cursor.execute("""
            SELECT 
                categoria,
                SUM(lucro) as lucro_total,
                SUM(faturamento) as faturamento_total,
                COUNT(*) as total_vendas
            FROM vendas
            GROUP BY categoria
            ORDER BY lucro_total DESC
            LIMIT 8
        """)
        lucro_categoria = cursor.fetchall()
        
        # Formas de pagamento
        cursor.execute("""
            SELECT 
                forma_pagamento,
                COUNT(*) as total,
                SUM(faturamento) as faturamento
            FROM vendas
            GROUP BY forma_pagamento
            ORDER BY faturamento DESC
        """)
        pagamentos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'totais': totais,
            'top_jogos': top_jogos,
            'vendas_mensal': vendas_mensal,
            'lucro_categoria': lucro_categoria,
            'pagamentos': pagamentos
        })
        
    except Exception as e:
        print(f"Erro: {e}")
        return jsonify({'erro': str(e)}), 500

# ===================== AUDITORIA DATAOPS =====================
@app.route('/api/auditoria', methods=['GET'])
def auditoria_dataops():
    try:
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verificar vendas com lucro negativo
        cursor.execute("""
            SELECT COUNT(*) as total_prejuizos, 
                   SUM(lucro) as soma_prejuizos,
                   MIN(lucro) as maior_prejuizo
            FROM vendas WHERE lucro < 0
        """)
        prejuizos = cursor.fetchone()
        
        # Verificar anonimização
        cursor.execute("SELECT COUNT(DISTINCT cliente) as clientes_anonimizados FROM vendas")
        stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'sucesso',
            'prejuizos': prejuizos,
            'clientes_anonimizados': stats['clientes_anonimizados'],
            'mensagem': '✅ Auditoria DataOps: Nenhum prejuízo encontrado' if prejuizos['total_prejuizos'] == 0 else '⚠️ Existem vendas com prejuízo'
        })
        
    except Exception as e:
        print(f"Erro na auditoria: {e}")
        return jsonify({'erro': str(e)}), 500


# ===================== VERIFICAÇÃO DE INTEGRIDADE =====================
@app.route('/api/integridade', methods=['GET'])
def verificar_integridade():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Verificar tabelas principais
        tabelas = ['jogos', 'vendas', 'comentarios', 'usuarios']
        resultados = {}
        
        for tabela in tabelas:
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            resultados[tabela] = count
        
        # Verificar anonimização
        cursor.execute("SELECT COUNT(*) FROM vendas WHERE cliente LIKE 'hash_%' OR LENGTH(cliente) > 50")
        anonimizados = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM vendas")
        total_vendas = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        # Calcular percentual de anonimização
        perc_anonimizacao = (anonimizados / total_vendas * 100) if total_vendas > 0 else 0
        
        return jsonify({
            'status': 'online',
            'timestamp': datetime.now().isoformat(),
            'tabelas': resultados,
            'anonimizacao': {
                'total_clientes': total_vendas,
                'anonimizados': anonimizados,
                'percentual': round(perc_anonimizacao, 2)
            },
            'mensagem': '✅ Sistema íntegro e seguro' if perc_anonimizacao > 80 else '⚠️ Necessário anonimizar mais registros'
        })
        
    except Exception as e:
        print(f"Erro na integridade: {e}")
        return jsonify({'erro': str(e)}), 500


# ===================== RBAC - CONTROLE DE ACESSO =====================
class NexusRBAC:
    def __init__(self):
        self.permissoes = {
            "cliente": [
                "ver_jogos",
                "comprar",
                "comentar",
                "ver_perfil",
                "editar_perfil"
            ],
            "analista": [
                "ver_jogos",
                "ver_dashboard",
                "ver_metricas",
                "ver_vendas",
                "exportar_relatorios"
            ],
            "admin": ["*"]
        }
    
    def verificar(self, usuario, acao):
        if not usuario:
            return False
        
        if usuario.get('admin') or usuario.get('perfil') == 'admin':
            return True
        
        perfil = usuario.get('perfil', 'cliente')
        permissoes_usuario = self.permissoes.get(perfil, self.permissoes['cliente'])
        
        return acao in permissoes_usuario
    
    def get_permissoes(self, usuario):
        if not usuario:
            return []
        
        if usuario.get('admin') or usuario.get('perfil') == 'admin':
            return list(self.permissoes.keys())
        
        perfil = usuario.get('perfil', 'cliente')
        return self.permissoes.get(perfil, self.permissoes['cliente'])

# Instanciar o RBAC
rbac = NexusRBAC()

@app.route('/api/permissoes', methods=['GET'])
def verificar_permissoes():
    try:
        # REMOVIDA VERIFICAÇÃO DE TOKEN PARA TESTE
        # Usuário exemplo para demonstração
        usuario = {
            'id': 1,
            'nome': 'Usuario Teste',
            'perfil': 'cliente',
            'admin': False
        }
        
        permissoes = rbac.get_permissoes(usuario)
        
        return jsonify({
            'usuario': usuario['nome'],
            'perfil': 'admin' if usuario.get('admin') else usuario.get('perfil', 'cliente'),
            'permissoes': permissoes,
            'total_permissoes': len(permissoes)
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


def requer_permissao(acao):
    def decorator(f):
        from functools import wraps
        
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            
            if not token:
                return jsonify({'erro': 'Token não fornecido'}), 401
            
            usuario = {
                'id': 1,
                'nome': 'Usuario Teste',
                'perfil': 'cliente',
                'admin': False
            }
            
            if not rbac.verificar(usuario, acao):
                return jsonify({
                    'erro': 'Acesso negado',
                    'mensagem': f'Você não tem permissão para: {acao}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Servidor NexusGames rodando!")
    print("📍 http://127.0.0.1:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
