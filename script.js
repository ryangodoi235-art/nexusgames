// =========================
// NEXUSGAMES - SISTEMA COMPLETO INTEGRADO
// =========================

const API_URL = 'http://127.0.0.1:5000';
let usuarioLogado = null;
let cartProducts = [];
let todosJogos = [];

// =========================
// CARREGAR USUÁRIO LOGADO
// =========================
function carregarUsuarioLogado() {
    const usuarioSalvo = localStorage.getItem('nexus_usuario');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (usuarioSalvo) {
        usuarioLogado = JSON.parse(usuarioSalvo);
        if (loginBtn) {
            loginBtn.innerHTML = `👤 ${usuarioLogado.nome.split(' ')[0]}`;
            loginBtn.href = '#';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.onclick = () => {
                localStorage.removeItem('nexus_usuario');
                localStorage.removeItem('nexus_token');
                showNotification('Logout realizado!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            };
        }
        
        const dashboardLink = document.querySelector('a[href="dashboard_metricas.html"]');
        if (dashboardLink) {
            if (usuarioLogado.admin === true) {
                dashboardLink.style.display = 'inline-block';
            } else {
                dashboardLink.style.display = 'none';
            }
        }
        
    } else {
        if (loginBtn) {
            loginBtn.innerHTML = '👤 Entrar';
            loginBtn.href = 'login.html';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        const dashboardLink = document.querySelector('a[href="dashboard_metricas.html"]');
        if (dashboardLink) {
            dashboardLink.style.display = 'none';
        }
    }
    console.log('Usuário logado:', usuarioLogado);
}

// =========================
// ATUALIZAR INFO DO USUÁRIO
// =========================
function atualizarInfoUsuario() {
    const userInfo = document.getElementById('userInfo');
    const usuarioSalvo = localStorage.getItem('nexus_usuario');

    if (userInfo) {
        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            userInfo.innerHTML = `
                ✅ Logado como: <strong>${usuario.nome}</strong>
                <a href="meus_pedidos.html" style="margin-left: 10px; color: #c84dff;">📦 Meus Pedidos</a>
                <a href="perfil.html" style="margin-left: 10px; color: #c84dff;">👤 Perfil</a>
                <button onclick="logout()" style="margin-left: 10px; background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">🚪 Sair</button>
            `;
            userInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            userInfo.style.color = '#4caf50';
        } else {
            userInfo.innerHTML = `⚠️ Você não está logado. <a href="login.html" style="color: #c84dff;">Faça login</a> para comentar!`;
            userInfo.style.background = 'rgba(255, 152, 0, 0.1)';
            userInfo.style.color = '#ff9800';
        }
    }
}

// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.removeItem('nexus_usuario');
    localStorage.removeItem('nexus_token');
    usuarioLogado = null;
    showNotification('Logout realizado com sucesso!', 'success');
    setTimeout(() => window.location.reload(), 1000);
}

// =========================
// FUNÇÕES UTILITÁRIAS
// =========================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.innerHTML = `<div style="padding: 12px 20px;">${message}</div>`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #7c3aed, #c84dff);
        color: white;
        border-radius: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        box-shadow: 0 0 15px rgba(124,58,237,0.5);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// =========================
// CARRINHO
// =========================
const cartBtn = document.getElementById("cartBtn");

function adicionarAoCarrinho(jogoId, jogoNome, precoDigital, precoFisico) {
    console.log('Adicionando:', jogoNome);
    
    if (!usuarioLogado) {
        showNotification('Faça login para comprar!', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const radioSelecionado = document.querySelector(`input[name="midia_${jogoId}"]:checked`);
    const tipoMidia = radioSelecionado ? radioSelecionado.value : 'digital';
    const preco = tipoMidia === 'digital' ? precoDigital : precoFisico;
    const tipoTexto = tipoMidia === 'digital' ? '💾 Digital' : '📀 Física';
    
    let carrinhoAtual = JSON.parse(localStorage.getItem('checkoutGames') || '[]');
    carrinhoAtual.push({ 
        id: jogoId, 
        name: jogoNome, 
        price: preco,
        tipo_midia: tipoMidia,
        tipo_texto: tipoTexto
    });
    localStorage.setItem('checkoutGames', JSON.stringify(carrinhoAtual));

    if (cartBtn) cartBtn.innerHTML = `🛒 ${carrinhoAtual.length}`;
    showNotification(`${jogoNome} (${tipoTexto}) adicionado ao carrinho!`, 'success');
}

function carregarCarrinho() {
    const carrinhoAtual = JSON.parse(localStorage.getItem('checkoutGames') || '[]');
    if (cartBtn) cartBtn.innerHTML = `🛒 ${carrinhoAtual.length}`;
    cartProducts = carrinhoAtual;
}

// =========================
// CARREGAR JOGOS DO BANCO
// =========================
async function carregarJogos() {
    try {
        console.log('🔄 Carregando jogos do banco...');
        const response = await fetch(`${API_URL}/api/jogos`);
        const data = await response.json();
        todosJogos = data.jogos || [];

        console.log(`✅ ${todosJogos.length} jogos carregados`);

        const destaques = todosJogos.filter(jogo => jogo.destaque === true);
        renderizarJogos(destaques, 'destaquesGrid');
        renderizarJogos(todosJogos, 'todosJogosGrid');
        configurarFiltros();

    } catch (error) {
        console.error('❌ Erro ao carregar jogos:', error);
        document.getElementById('destaquesGrid').innerHTML = '<div class="loading">❌ Erro ao carregar jogos</div>';
        document.getElementById('todosJogosGrid').innerHTML = '<div class="loading">❌ Erro ao carregar jogos</div>';
    }
}

function renderizarJogos(jogos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!jogos || jogos.length === 0) {
        container.innerHTML = '<div class="loading">✨ Nenhum jogo encontrado</div>';
        return;
    }

    container.innerHTML = jogos.map(jogo => `
        <div class="game-card" data-id="${jogo.id}" data-nome="${jogo.nome}" data-preco="${jogo.preco}" data-preco-fisico="${jogo.preco_fisico || (jogo.preco * 1.10)}" data-categoria="${jogo.categoria}">
            <div class="game-badge">${jogo.destaque ? '🔥 Destaque' : '🎮 Novo'}</div>
            <button class="wishlist-btn">♡</button>
            <img src="${jogo.imagem_url || 'images/placeholder.jpg'}" alt="${jogo.nome}" onerror="this.src='images/placeholder.jpg'">
            <h3>${jogo.nome}</h3>
            <div class="game-rating">⭐ ${jogo.rating || '4.5'}/5</div>
            
            <div class="midia-opcoes">
                <label class="midia-option">
                    <input type="radio" name="midia_${jogo.id}" value="digital" checked>
                    <span>💾 Digital</span>
                    <strong>R$ ${parseFloat(jogo.preco).toFixed(2).replace('.', ',')}</strong>
                </label>
                <label class="midia-option">
                    <input type="radio" name="midia_${jogo.id}" value="fisica">
                    <span>📀 Física</span>
                    <strong>R$ ${parseFloat(jogo.preco_fisico || (jogo.preco * 1.10)).toFixed(2).replace('.', ',')}</strong>
                </label>
            </div>
            
            <button class="buy-btn" onclick="adicionarAoCarrinho(${jogo.id}, '${jogo.nome.replace(/'/g, "\\'")}', ${jogo.preco}, ${jogo.preco_fisico || (jogo.preco * 1.10)})">Comprar</button>
        </div>
    `).join('');

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            if (this.innerHTML === "♡") {
                this.innerHTML = "♥";
                this.style.color = "#ff4d6d";
                showNotification('Adicionado aos favoritos!', 'success');
            } else {
                this.innerHTML = "♡";
                this.style.color = "white";
            }
        };
    });
}

function configurarFiltros() {
    const botoes = document.querySelectorAll('.filtro-btn');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(btn => btn.classList.remove('active'));
            botao.classList.add('active');

            const categoria = botao.dataset.categoria;
            let jogosFiltrados = categoria === 'todos' ? todosJogos : todosJogos.filter(jogo => jogo.categoria === categoria);

            const titulo = document.querySelector('#jogos h2:last-of-type');
            if (titulo && categoria !== 'todos') {
                const categoriaNome = botao.textContent.replace(/[🎮⚔️🗡️🌍🔫🏎️⚽🏕️🏗️🎨🎲]/g, '').trim();
                titulo.innerHTML = `📚 ${categoriaNome} (${jogosFiltrados.length} jogos)`;
            } else if (titulo) {
                titulo.innerHTML = `📚 Todos os Jogos (${todosJogos.length} jogos)`;
            }

            renderizarJogos(jogosFiltrados, 'todosJogosGrid');
        });
    });
}

function configurarBuscaJogos() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const termo = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll('#todosJogosGrid .game-card');
        cards.forEach(card => {
            const nome = card.querySelector('h3')?.innerText.toLowerCase() || '';
            card.style.display = nome.includes(termo) ? 'block' : 'none';
        });
    });
}

// =========================
// SISTEMA DE COMENTÁRIOS
// =========================
class CommentSystem {
    constructor() {
        this.initializeElements();
        this.attachEvents();
        this.loadComments();
        this.loadStatistics();
        this.setupRealtimeSentiment();
    }

    initializeElements() {
        this.form = document.getElementById('commentForm');
        this.commentText = document.getElementById('commentText');
        this.commentsList = document.getElementById('commentsList');
        this.totalCommentsSpan = document.getElementById('totalComments');
        this.sentimentIndicator = document.getElementById('sentimentIndicator');
        this.submitBtn = document.getElementById('submitBtn');
        this.positiveCountSpan = document.getElementById('positiveCount');
        this.neutralCountSpan = document.getElementById('neutralCount');
        this.negativeCountSpan = document.getElementById('negativeCount');
        this.averageRatingSpan = document.getElementById('averageRating');
        this.serverStatusSpan = document.getElementById('serverStatus');
    }

    attachEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    setupRealtimeSentiment() {
        let timeout;
        if (this.commentText) {
            this.commentText.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.analyzeRealtimeSentiment(), 500);
            });
        }
    }

    async analyzeRealtimeSentiment() {
        const text = this.commentText?.value.trim();
        if (!text || text.length < 5) {
            if (this.sentimentIndicator) this.sentimentIndicator.style.display = 'none';
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/analisar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comentario: text })
            });
            const data = await response.json();
            if (data.sentimento && this.sentimentIndicator) {
                this.sentimentIndicator.style.display = 'block';
                let emoji = '', color = '', bgColor = '';
                switch (data.sentimento) {
                    case 'positivo':
                        emoji = '😊';
                        color = '#4caf50';
                        bgColor = 'rgba(76, 175, 80, 0.1)';
                        break;
                    case 'negativo':
                        emoji = '😔';
                        color = '#f44336';
                        bgColor = 'rgba(244, 67, 54, 0.1)';
                        break;
                    default:
                        emoji = '😐';
                        color = '#ff9800';
                        bgColor = 'rgba(255, 152, 0, 0.1)';
                }
                this.sentimentIndicator.style.background = bgColor;
                this.sentimentIndicator.style.border = `1px solid ${color}`;
                this.sentimentIndicator.style.color = color;
                this.sentimentIndicator.innerHTML = `${emoji} Análise: <strong>${data.sentimento.toUpperCase()}</strong>`;
            }
        } catch (error) {
            console.error('Erro na análise:', error);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!usuarioLogado) {
            showNotification('Faça login para comentar!', 'error');
            window.location.href = 'login.html';
            return;
        }
        const texto = this.commentText?.value.trim();
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        if (!texto) {
            showNotification('Escreva um comentário', 'error');
            return;
        }
        if (texto.length < 5) {
            showNotification('Comentário muito curto (mínimo 5 caracteres)', 'error');
            return;
        }
        if (!ratingInput) {
            showNotification('Selecione uma avaliação', 'error');
            return;
        }
        const rating = parseInt(ratingInput.value);

        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '⏳ Enviando...';
        }

        try {
            const response = await fetch(`${API_URL}/api/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: usuarioLogado.id, comentario: texto, rating: rating })
            });
            const data = await response.json();
            if (response.ok) {
                showNotification(`✅ Comentário enviado! Sentimento: ${data.sentimento}`, 'success');
                if (this.form) this.form.reset();
                if (this.sentimentIndicator) this.sentimentIndicator.style.display = 'none';
                document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
                await this.loadComments();
                await this.loadStatistics();
            } else {
                showNotification(data.erro || 'Erro ao enviar', 'error');
            }
        } catch (error) {
            showNotification('Erro de conexão com o servidor', 'error');
        } finally {
            if (this.submitBtn) {
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = '<span>Enviar Comentário</span><span class="btn-icon">→</span>';
            }
        }
    }

    async loadComments() {
        try {
            const response = await fetch(`${API_URL}/api/comentarios`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const comments = await response.json();
            if (this.totalCommentsSpan) this.totalCommentsSpan.textContent = comments.length;
            if (!this.commentsList) return;
            if (comments.length === 0) {
                this.commentsList.innerHTML = `<div class="empty-feedback"><p>✨ Seja o primeiro a deixar um comentário!</p></div>`;
                return;
            }
            this.commentsList.innerHTML = comments.map(comment => {
                const stars = '★'.repeat(comment.rating) + '☆'.repeat(5 - comment.rating);
                let sentimentEmoji = comment.sentimento === 'positivo' ? '😊' : (comment.sentimento === 'negativo' ? '😔' : '😐');
                let sentimentColor = comment.sentimento === 'positivo' ? '#4caf50' : (comment.sentimento === 'negativo' ? '#f44336' : '#ff9800');
                return `
                    <div class="feedback-card">
                        <div class="feedback-header-card">
                            <span class="feedback-name">👤 ${this.escapeHtml(comment.nome)}</span>
                            <span class="feedback-date">📅 ${comment.data_formatada || 'Data não disponível'}</span>
                        </div>
                        <div class="feedback-rating"><div class="stars-display" style="color:#FFD700;">${stars}</div></div>
                        <div class="feedback-text">"${this.escapeHtml(comment.comentario)}"</div>
                        <div style="margin-top:10px;font-size:12px;"><span style="color:${sentimentColor}">${sentimentEmoji} ${comment.sentimento?.toUpperCase() || 'NEUTRO'}</span></div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            if (this.commentsList) this.commentsList.innerHTML = `<div class="empty-feedback"><p>❌ Erro ao carregar comentários</p></div>`;
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch(`${API_URL}/api/estatisticas`);
            if (!response.ok) return;
            const stats = await response.json();
            if (this.positiveCountSpan) this.positiveCountSpan.textContent = stats.positivos || 0;
            if (this.neutralCountSpan) this.neutralCountSpan.textContent = stats.neutros || 0;
            if (this.negativeCountSpan) this.negativeCountSpan.textContent = stats.negativos || 0;
            if (this.totalCommentsSpan) this.totalCommentsSpan.textContent = stats.total || 0;
            if (this.averageRatingSpan) this.averageRatingSpan.textContent = stats.media_rating?.toFixed(1) || '0.0';
        } catch (error) {
            console.error('Erro estatísticas:', error);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// =========================
// CHATBOT (IA GENERATIVA) - ATUALIZADO
// =========================
function initChatbot() {
    const chatbotHTML = `
        <div id="chatbotBtn" style="position: fixed; bottom: 20px; left: 20px; z-index: 1000;">
            <button style="background: linear-gradient(135deg, #7c3aed, #c84dff); border: none; border-radius: 50%; width: 60px; height: 60px; cursor: pointer; box-shadow: 0 0 15px rgba(124,58,237,0.5); font-size: 28px;">
                💬
            </button>
        </div>
        <div id="chatbotWindow" style="display: none; position: fixed; bottom: 100px; left: 20px; width: 320px; background: #12121a; border-radius: 15px; border: 1px solid #7c3aed; z-index: 1000; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
            <div style="background: linear-gradient(135deg, #7c3aed, #c84dff); padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">🤖 Assistente Nexus</span>
                <button id="closeChatbot" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">✖</button>
            </div>
            <div id="chatbotMessages" style="height: 350px; overflow-y: auto; padding: 15px; background: #0f0f1a;">
                <div style="background: #1a1a2e; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 85%;">
                    👋 Olá! Sou o assistente da NexusGames. Pergunte sobre preços, entrega, jogos, promoções!
                </div>
            </div>
            <div style="display: flex; padding: 10px; background: #12121a; border-top: 1px solid #333;">
                <input type="text" id="chatbotInput" placeholder="Digite sua pergunta..." style="flex: 1; padding: 10px; background: #1a1a2e; border: 1px solid #7c3aed; border-radius: 8px; color: white; outline: none;">
                <button id="chatbotSend" style="background: linear-gradient(135deg, #7c3aed, #c84dff); border: none; border-radius: 8px; padding: 10px 15px; margin-left: 8px; cursor: pointer; font-weight: bold;">Enviar</button>
            </div>
        </div>
    `;

    if (!document.getElementById('chatbotBtn')) {
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    const chatbotBtn = document.getElementById('chatbotBtn');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatbot = document.getElementById('closeChatbot');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');

    if (chatbotBtn) {
        chatbotBtn.onclick = () => {
            chatbotWindow.style.display = 'block';
        };
    }

    if (closeChatbot) {
        closeChatbot.onclick = () => {
            chatbotWindow.style.display = 'none';
        };
    }

    async function enviarMensagemChatbot() {
        const mensagem = chatbotInput.value.trim();
        if (!mensagem) return;

        chatbotMessages.innerHTML += `<div style="background: linear-gradient(135deg, #7c3aed, #c84dff); padding: 10px; border-radius: 10px; margin-bottom: 10px; text-align: right; max-width: 85%; margin-left: auto;">${mensagem}</div>`;
        chatbotInput.value = '';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        try {
            const body = { pergunta: mensagem };
            if (usuarioLogado) {
                body.usuario_id = usuarioLogado.id;
            }
            
            const response = await fetch(`${API_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            const resposta = data.resposta || 'Desculpe, não entendi.';

            chatbotMessages.innerHTML += `<div style="background: #1a1a2e; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 85%;">🤖 ${resposta}</div>`;
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        } catch (error) {
            chatbotMessages.innerHTML += `<div style="background: #f44336; padding: 10px; border-radius: 10px; margin-bottom: 10px; max-width: 85%;">❌ Erro de conexão</div>`;
        }
    }

    if (chatbotSend) {
        chatbotSend.onclick = enviarMensagemChatbot;
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensagemChatbot();
        });
    }
}

// =========================
// MODO ESCURO / CLARO
// =========================

function initTheme() {
    const savedTheme = localStorage.getItem('nexus_theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.innerHTML = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        if (themeToggle) themeToggle.innerHTML = '🌙';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('light-mode')) {
                document.body.classList.remove('light-mode');
                localStorage.setItem('nexus_theme', 'dark');
                themeToggle.innerHTML = '🌙';
            } else {
                document.body.classList.add('light-mode');
                localStorage.setItem('nexus_theme', 'light');
                themeToggle.innerHTML = '☀️';
            }
        });
    }
}

// =========================
// INICIALIZAÇÃO PRINCIPAL
// =========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - Inicializando NexusGames');
    initTheme();
    carregarUsuarioLogado();
    atualizarInfoUsuario();
    carregarJogos();
    configurarBuscaJogos();
    carregarCarrinho();
    initChatbot();
    new CommentSystem();
});

// =========================
// ESTILOS DE ANIMAÇÃO
// =========================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .feedback-card { animation: fadeInUp 0.3s ease; }
    
    .loading {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
        color: #c84dff;
    }
    
    .empty-feedback {
        text-align: center;
        padding: 2rem;
        color: #999;
    }
    
    .feedback-card {
        background: rgba(26, 26, 46, 0.8);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        transition: transform 0.2s;
    }
    
    .feedback-card:hover {
        transform: translateX(5px);
    }
    
    .feedback-header-card {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .feedback-name {
        font-weight: bold;
        color: #c84dff;
    }
    
    .feedback-date {
        color: #999;
        font-size: 0.8rem;
    }
    
    .feedback-rating {
        margin-bottom: 0.5rem;
    }
    
    .feedback-text {
        font-style: italic;
        color: #ddd;
    }
    
    body.light-mode .feedback-text {
        color: #555;
    }
    
    body.light-mode .feedback-card {
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
`;
document.head.appendChild(style);
