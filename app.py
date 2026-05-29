from flask import Flask, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder='.', static_url_path='')

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
# ROTAS DA API
# ============================================
@app.route('/api/teste')
def teste():
    return jsonify({'status': 'online', 'message': 'API funcionando!'})

@app.route('/api/jogos')
def jogos():
    return jsonify({
        'jogos': [
            {'id': 1, 'nome': 'Grand Theft Auto V', 'preco': 349.00, 'categoria': 'Ação / Mundo Aberto', 'imagem_url': 'images/1.png', 'rating': 4.8, 'destaque': True},
            {'id': 2, 'nome': 'Red Dead Redemption 2', 'preco': 299.00, 'categoria': 'Ação / Aventura', 'imagem_url': 'images/2.png', 'rating': 4.9, 'destaque': True},
            {'id': 3, 'nome': 'The Witcher 3', 'preco': 63.00, 'categoria': 'RPG', 'imagem_url': 'images/5.png', 'rating': 4.9, 'destaque': True},
        ]
    })

@app.route('/api/comentarios', methods=['GET', 'POST'])
def comentarios():
    if request.method == 'GET':
        return jsonify([])
    else:
        return jsonify({'mensagem': 'Comentário recebido!', 'sentimento': 'positivo'})

@app.route('/api/estatisticas')
def estatisticas():
    return jsonify({'total': 0, 'positivos': 0, 'negativos': 0, 'neutros': 0, 'media_rating': 0})

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    from flask import request
    dados = request.get_json()
    pergunta = dados.get('pergunta', '').lower()
    
    respostas = {
        'preço': '💰 Os preços variam de R$ 45 a R$ 349!',
        'gta': '🚗 GTA V está R$ 349,00',
        'rpg': '⚔️ Recomendo The Witcher 3 ou Elden Ring!'
    }
    
    for palavra, resposta in respostas.items():
        if palavra in pergunta:
            return jsonify({'resposta': resposta})
    
    return jsonify({'resposta': 'Obrigado! Em breve um atendente responderá.'})

@app.route('/api/metricas')
def metricas():
    return jsonify({'acurácia': 85.5, 'precisao': 84.2, 'recall': 86.1, 'f1_score': 85.1})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
