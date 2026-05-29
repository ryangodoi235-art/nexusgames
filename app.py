from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'status': 'online',
        'message': 'NexusGames API está funcionando!'
    })

@app.route('/api/teste')
def teste():
    return jsonify({
        'status': 'online',
        'message': 'API funcionando!'
    })

@app.route('/api/jogos')
def jogos():
    return jsonify({
        'jogos': [
            {'id': 1, 'nome': 'GTA V', 'preco': 349.00, 'categoria': 'Ação', 'destaque': True},
            {'id': 2, 'nome': 'Red Dead 2', 'preco': 299.00, 'categoria': 'Ação', 'destaque': True}
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
