// ============================================
// CHATBOT NEXUSGAMES - VERSÃO 100% LOCAL
// ============================================

// Base de conhecimento completa
const RESPOSTAS = {
    // Saudações
    'ola|olá|oi|e aí|hey|opa|oie|olá|oi': 'Olá! Bem-vindo à NexusGames! 🎮 Como posso ajudar você hoje?',
    'bom dia|boa tarde|boa noite|bomdia|boatarde|boanoite': 'Olá! Tenha um excelente dia! Como posso ajudar?',
    'tudo bem|como vai|como você está|tudobem': 'Tudo ótimo! Pronto para ajudar você com jogos! 🎮',
    
    // Preços
    'preço|preços|custa|valor|quanto custa|quanto é|preco|precos': '💰 Os preços dos nossos jogos variam de R$ 45,00 a R$ 349,00. Temos opções para todos os bolsos!',
    
    // Promoções
    'promoção|promoções|desconto|oferta|barato|promocao|promocoes': '🎉 Fique de olho na nossa página inicial! Lançamos promoções toda semana. Cadastre-se para receber ofertas exclusivas!',
    
    // Entrega
    'entrega|receber|chega|envio|quando chega|entregar|entregue': '📦 Jogos digitais: entregues na hora por e-mail! Jogos físicos: 3 a 7 dias úteis.',
    
    // Horário
    'horário|atendimento|funciona|horario|atendimento|funcionamento': '💬 Atendimento 24 horas por dia, 7 dias por semana! Estamos sempre aqui para você.',
    
    // Jogos
    'jogos|catálogo|títulos|lançamentos|catalogo|jogos disponíveis': '🎯 Temos mais de 23 jogos incríveis! Categorias: RPG, Ação, FPS, Corrida, Esporte, Sobrevivência e muito mais!',
    
    // Pagamento
    'pagamento|pagar|cartão|pix|boleto|cartao|como pagar': '💳 Aceitamos: Cartão de crédito (Visa, Mastercard, Elo), Pix (aprovado na hora) e Boleto bancário.',
    
    // Suporte
    'suporte|ajuda|problema|não funciona|nao funciona|contato': '📧 Suporte: suporte@nexusgames.com | WhatsApp: (11) 99999-9999. Respondemos rápido!',
    
    // Cancelamento
    'cancelar|reembolso|devolução|troca|devolucao|estorno': '✅ Você tem até 7 dias após a compra para solicitar reembolso de jogos digitais não ativados.',
    
    // Recomendações
    'recomende ação|recomende acao|jogo de ação|melhor ação|jogo acao': '🎮 Recomendo: Marvel Spider-Man 2, God of War Ragnarök ou Red Dead Redemption 2!',
    'recomende rpg|melhor rpg|rpg bom|jogo rpg': '⚔️ Recomendo: The Witcher 3, Elden Ring ou Baldur\'s Gate 3!',
    'recomende fps|jogo de tiro|melhor tiro|jogo tiro': '🔫 Recomendo: Rainbow Six Siege ou Battlefield 2042!',
    'recomende corrida|jogo de corrida|melhor corrida': '🏎️ Recomendo: Forza Horizon 5 ou Gran Turismo 7!',
    'recomende esporte|jogo de esporte|melhor esporte': '⚽ Recomendo: EA Sports FC 25 ou NBA 2K25!',
    'recomende survival|sobrevivência|sobrevivencia': '🏕️ Recomendo: Rust!',
    
    // Jogos específicos
    'gta|grand theft auto|gtav': '🚗 Grand Theft Auto V - R$ 349,00. Ação e mundo aberto!',
    'red dead|redemption|rdr2': '🤠 Red Dead Redemption 2 - R$ 299,00. Épico de faroeste imperdível!',
    'witcher|thewitcher|witcher3': '🐺 The Witcher 3 - R$ 63,00. RPG aclamado pela crítica!',
    'elden ring|eldenring': '⚔️ Elden Ring - R$ 349,00. Game of the Year 2022!',
    'minecraft': '⛏️ Minecraft - R$ 145,00. O clássico sandbox para todas as idades!',
    'fifa|ea sports fc|efc25': '⚽ EA Sports FC 25 - R$ 299,00. O melhor do futebol!',
    'nba|nba2k': '🏀 NBA 2K25 - R$ 180,00. Basquete de alta qualidade!',
    'forza|forza horizon': '🏎️ Forza Horizon 5 - R$ 230,00. Corrida em mundo aberto!',
    'cyberpunk|cyberpunk2077': '🌆 Cyberpunk 2077 - R$ 249,00. RPG futurista incrível!',
    'hogwarts|harry potter': '🪄 Hogwarts Legacy - R$ 190,00. Explore o mundo de Harry Potter!',
    'spider man|spiderman|miranha': '🕷️ Marvel Spider-Man 2 - R$ 299,00. O melhor do Homem-Aranha!',
    'god of war|godofwar|gow': '🗡️ God of War Ragnarök - R$ 149,00. Épico nórdico!',
    'rainbow|rainbow six|r6': '🔫 Rainbow Six Siege - R$ 50,00. FPS tático competitivo!',
    'battlefield|bf2042': '🎯 Battlefield 2042 - R$ 45,00. FPS de guerra!',
    'rust': '🏕️ Rust - R$ 100,00. Sobrevivência multiplayer!',
    'hades': '👹 Hades - R$ 134,40. Roguelike viciante!',
    'stardew|stardew valley': '🌾 Stardew Valley - R$ 154,90. Simulação relaxante!',
    'terraria': '⛏️ Terraria - R$ 90,00. Sandbox de aventura!',
    
    // Agradecimentos
    'obrigado|valeu|gratidão|obrigada|brigado|brigada': '🎮 Por nada! Volte sempre à NexusGames!',
    'nome|quem é você|quem e voce|seu nome': '🤖 Meu nome é NexusBot, sou o assistente virtual da NexusGames! Prazer!',
    
    // Despedida
    'sair|fechar|tchau|ate logo|até logo|flw|falou': '👋 Até logo! Volte sempre para conferir as novidades!'
};

function getRespostaInteligente(mensagem) {
    const msg = mensagem.toLowerCase().trim();
    
    // Verificar padrões
    for (const [padrao, resposta] of Object.entries(RESPOSTAS)) {
        const regex = new RegExp(padrao, 'i');
        if (regex.test(msg)) {
            return resposta;
        }
    }
    
    // Palavras-chave isoladas
    const palavras = msg.split(' ');
    for (const palavra of palavras) {
        if (palavra.length > 3) {
            for (const [padrao, resposta] of Object.entries(RESPOSTAS)) {
                if (padrao.includes(palavra)) {
                    return resposta;
                }
            }
        }
    }
    
    // Resposta padrão
    return '🤔 Desculpe, não entendi sua pergunta.\n\n💡 Você pode me perguntar sobre:\n• Preços e promoções\n• Jogos específicos (ex: GTA, Witcher)\n• Recomendações (ex: recomende RPG)\n• Entrega e pagamento\n• Suporte e horários';
}

class NexusChatbot {
    constructor() {
        this.init();
    }
    
    init() {
        if (document.getElementById('nexus-chatbot')) return;
        this.criarInterface();
        this.adicionarEstilos();
        this.configurarEventos();
        console.log('✅ NexusBot inicializado com sucesso!');
    }
    
    criarInterface() {
        const chatHTML = `
            <div id="nexus-chatbot" style="display: none;">
                <div id="chat-header">
                    <span>🤖 NexusBot - Assistente</span>
                    <button id="chat-fechar">✕</button>
                </div>
                <div id="chat-mensagens">
                    <div class="mensagem-bot">
                        👋 Olá! Sou o NexusBot!<br><br>
                        ❓ Você pode me perguntar:<br>
                        • "qual o preço dos jogos?"<br>
                        • "recomende um RPG"<br>
                        • "como funciona a entrega?"<br>
                        • "quanto custa GTA V?"<br>
                        • "tem promoção?"
                    </div>
                </div>
                <div id="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Digite sua mensagem..." autocomplete="off">
                    <button id="chat-enviar">➤</button>
                </div>
            </div>
            <button id="chat-abrir">💬 Ajuda</button>
        `;
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }
    
    adicionarEstilos() {
        if (document.getElementById('chatbot-estilos')) return;
        
        const estilos = document.createElement('style');
        estilos.id = 'chatbot-estilos';
        estilos.textContent = `
            #nexus-chatbot {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 360px;
                height: 520px;
                background: #12121a;
                border-radius: 20px;
                border: 1px solid #8A2BE2;
                flex-direction: column;
                z-index: 10000;
                box-shadow: 0 0 30px rgba(138,43,226,0.3);
                font-family: Arial, sans-serif;
            }
            #chat-header {
                background: linear-gradient(135deg, #7c3aed, #c84dff);
                padding: 15px 20px;
                border-radius: 20px 20px 0 0;
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                color: white;
                font-size: 16px;
                cursor: move;
            }
            #chat-fechar {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                transition: transform 0.2s;
            }
            #chat-fechar:hover {
                transform: scale(1.1);
            }
            #chat-mensagens {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: #0a0a10;
            }
            #chat-mensagens::-webkit-scrollbar {
                width: 5px;
            }
            #chat-mensagens::-webkit-scrollbar-track {
                background: #1a1a2e;
            }
            #chat-mensagens::-webkit-scrollbar-thumb {
                background: #7c3aed;
                border-radius: 10px;
            }
            .mensagem-usuario {
                background: linear-gradient(135deg, #7c3aed, #c84dff);
                padding: 10px 15px;
                border-radius: 18px 18px 5px 18px;
                max-width: 85%;
                align-self: flex-end;
                color: white;
                word-wrap: break-word;
                font-size: 14px;
            }
            .mensagem-bot {
                background: #1a1a2e;
                padding: 10px 15px;
                border-radius: 18px 18px 18px 5px;
                max-width: 85%;
                align-self: flex-start;
                color: #e5e5e5;
                border-left: 3px solid #c84dff;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
            }
            #chat-input-area {
                padding: 12px 15px;
                border-top: 1px solid #2a1f3d;
                display: flex;
                gap: 10px;
                background: #12121a;
                border-radius: 0 0 20px 20px;
            }
            #chat-input {
                flex: 1;
                padding: 12px;
                background: #1a1a2e;
                border: 1px solid #7c3aed;
                border-radius: 12px;
                color: white;
                outline: none;
                font-size: 14px;
            }
            #chat-input:focus {
                border-color: #c84dff;
                box-shadow: 0 0 5px rgba(200,77,255,0.3);
            }
            #chat-enviar {
                background: linear-gradient(135deg, #7c3aed, #c84dff);
                border: none;
                padding: 12px 20px;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
                font-size: 16px;
            }
            #chat-enviar:hover {
                transform: scale(1.02);
            }
            #chat-abrir {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #7c3aed, #c84dff);
                border: none;
                padding: 15px 22px;
                border-radius: 50px;
                cursor: pointer;
                z-index: 9999;
                font-size: 16px;
                font-weight: bold;
                color: white;
                box-shadow: 0 0 20px rgba(124,58,237,0.5);
                transition: transform 0.2s;
            }
            #chat-abrir:hover {
                transform: scale(1.05);
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .mensagem-usuario, .mensagem-bot {
                animation: fadeIn 0.2s ease;
            }
            .digitando {
                background: #1a1a2e;
                padding: 10px 15px;
                border-radius: 18px;
                max-width: 60px;
                align-self: flex-start;
                color: #e5e5e5;
                border-left: 3px solid #c84dff;
            }
            .digitando span {
                animation: blink 1.4s infinite;
            }
            .digitando span:nth-child(2) { animation-delay: 0.2s; }
            .digitando span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes blink {
                0%, 60%, 100% { opacity: 0; }
                30% { opacity: 1; }
            }
        `;
        document.head.appendChild(estilos);
    }
    
    configurarEventos() {
        const abrirBtn = document.getElementById('chat-abrir');
        const fecharBtn = document.getElementById('chat-fechar');
        const chat = document.getElementById('nexus-chatbot');
        const enviarBtn = document.getElementById('chat-enviar');
        const input = document.getElementById('chat-input');
        
        if (abrirBtn) {
            abrirBtn.onclick = () => {
                chat.style.display = 'flex';
                abrirBtn.style.display = 'none';
            };
        }
        
        if (fecharBtn) {
            fecharBtn.onclick = () => {
                chat.style.display = 'none';
                if (abrirBtn) abrirBtn.style.display = 'flex';
            };
        }
        
        if (enviarBtn) {
            enviarBtn.onclick = () => this.enviarMensagem();
        }
        
        if (input) {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') this.enviarMensagem();
            };
        }
    }
    
    enviarMensagem() {
        const input = document.getElementById('chat-input');
        const texto = input.value.trim();
        if (!texto) return;
        
        this.adicionarMensagem(texto, 'usuario');
        input.value = '';
        
        // Mostrar "digitando"
        this.mostrarDigitando();
        
        // Simular tempo de resposta
        setTimeout(() => {
            this.removerDigitando();
            const resposta = getRespostaInteligente(texto);
            this.adicionarMensagem(resposta, 'bot');
        }, 600);
    }
    
    mostrarDigitando() {
        const container = document.getElementById('chat-mensagens');
        if (!container) return;
        
        const div = document.createElement('div');
        div.className = 'digitando';
        div.id = 'chat-digitando';
        div.innerHTML = '🤖 <span>.</span><span>.</span><span>.</span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
    
    removerDigitando() {
        const elemento = document.getElementById('chat-digitando');
        if (elemento) elemento.remove();
    }
    
    adicionarMensagem(texto, tipo) {
        const container = document.getElementById('chat-mensagens');
        if (!container) return;
        
        const div = document.createElement('div');
        div.className = `mensagem-${tipo}`;
        div.textContent = texto;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.nexusChatbot = new NexusChatbot();
    });
} else {
    window.nexusChatbot = new NexusChatbot();
}
