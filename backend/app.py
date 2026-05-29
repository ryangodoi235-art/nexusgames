# No início do arquivo, adicione a importação
import google.generativeai as genai
from flask import Flask, request, jsonify
import os

# Configurar o Gemini com a chave da API (pegando do ambiente)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')  # Modelo rápido e eficiente
    print("✅ Gemini API configurada com sucesso!")
else:
    gemini_model = None
    print("⚠️ GEMINI_API_KEY não encontrada. Chatbot usará respostas locais.")

# ============================================
# NOVA ROTA: CHATBOT COM GEMINI
# ============================================
@app.route('/api/chatbot/gemini', methods=['POST'])
def chatbot_gemini():
    """Endpoint para o chatbot usando Gemini API"""
    try:
        dados = request.get_json()
        pergunta = dados.get('pergunta', '').strip()
        
        if not pergunta:
            return jsonify({'resposta': 'Por favor, digite uma pergunta.'}), 400
        
        # Se não tem API Key configurada, usa respostas locais
        if not gemini_model:
            return jsonify({'resposta': obter_resposta_local(pergunta)}), 200
        
        # Criar um prompt com contexto da NexusGames
        prompt_contexto = f"""
Você é o NexusBot, assistente virtual da NexusGames - uma loja de jogos.
Responda de forma amigável, usando emojis quando apropriado.
Mantenha as respostas curtas e diretas (máximo 2 frases).

Pergunta do usuário: {pergunta}

Resposta (como NexusBot):
"""
        
        # Chamar a API do Gemini
        resposta = gemini_model.generate_content(prompt_contexto)
        texto_resposta = resposta.text.strip()
        
        return jsonify({'resposta': texto_resposta}), 200
        
    except Exception as e:
        print(f"Erro no Gemini: {e}")
        # Fallback para resposta local em caso de erro
        return jsonify({'resposta': obter_resposta_local(pergunta)}), 200

def obter_resposta_local(pergunta):
    """Função de fallback caso a API Gemini falhe"""
    pergunta_lower = pergunta.lower()
    
    if 'preço' in pergunta_lower or 'custa' in pergunta_lower:
        return '💰 Os preços dos nossos jogos variam de R$ 45 a R$ 349!'
    elif 'promoção' in pergunta_lower or 'desconto' in pergunta_lower:
        return '🎉 Temos promoções toda semana! Fique de olho na página inicial.'
    elif 'entrega' in pergunta_lower:
        return '📦 Jogos digitais chegam na hora! Jogos físicos levam de 3 a 7 dias úteis.'
    elif 'rpg' in pergunta_lower:
        return '⚔️ Recomendo The Witcher 3, Elden Ring ou Baldur\'s Gate 3!'
    else:
        return '🤔 Obrigado pela pergunta! Um atendente humano responderá em breve pelo e-mail suporte@nexusgames.com'

# ============================================
# ROTA ANTIGA DO CHATBOT (para compatibilidade)
# ============================================
@app.route('/api/chatbot', methods=['POST'])
def chatbot_legado():
    """Mantido para compatibilidade com código antigo"""
    return chatbot_gemini()
