// =========================
// NEXUSGAMES - SISTEMA COMPLETO INTEGRADO
// =========================

const API_URL = 'https://nexusgames-llqj.onrender.com';
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
        
        const dashboardFinanceiroLink = document.getElementById('dashboardFinanceiroLink');
        if (dashboardFinanceiroLink) {
            if (usuarioLogado.admin === true) {
                dashboardFinanceiroLink.style.display = 'inline-block';
            } else {
                dashboardFinanceiroLink.style.display = 'none';
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
        const dashboardFinanceiroLink = document.getElementById('dashboardFinanceiroLink');
        if (dashboardFinanceiroLink) {
            dashboardFinanceiroLink.style.display = 'none';
        }
    }
    console.log('Usuário logado:', usuarioLogado);
}

// =========================
// OCULTAR ANÁLISE DE SENTIMENTOS PARA NÃO-ADMIN
// =========================
function ocultarAnaliseSentimentos() {
    const usuarioSalvo = localStorage.getItem('nexus_usuario');
    let isAdmin = false;
    
    if (usuarioSalvo) {
        const usuario = JSON.parse(usuarioSalvo);
        isAdmin = usuario.admin === true;
    }
    
    if (!isAdmin) {
        const sentimentStats = document.getElementById('sentimentStats');
        if (sentimentStats) {
            sentimentStats.style.display = 'none';
        }
        const sentimentIndicator = document.getElementById('sentimentIndicator');
        if (sentimentIndicator) {
            sentimentIndicator.style.display = 'none';
        }
    }
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
                <a href="meus_pedidos.html" style="margin-left: 10px; color: #06b6d4;">📦 Meus Pedidos</a>
                <a href="perfil.html" style="margin-left: 10px; color: #06b6d4;">👤 Perfil</a>
                <button onclick="logout()" style="margin-left: 10px; background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">🚪 Sair</button>
            `;
            userInfo.style.background = 'rgba(76, 175, 80, 0.1)';
            userInfo.style.color = '#4caf50';
        } else {
            userInfo.innerHTML = `⚠️ Você não está logado. <a href="login.html" style="color: #06b6d4;">Faça login</a> para comentar!`;
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
        background: linear-gradient(135deg, #06b6d4, #8b5cf6);
        color: white;
        border-radius: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        
        const mockJogos = [
            { id: 1, nome: 'Grand Theft Auto V', preco: 349.00, categoria: 'Ação / Mundo Aberto', imagem_url: 'images/1.png', rating: 4.8, destaque: true },
            { id: 2, nome: 'Red Dead Redemption 2', preco: 299.00, categoria: 'Ação / Aventura', imagem_url: 'images/2.png', rating: 4.9, destaque: true },
            { id: 3, nome: 'The Witcher 3', preco: 63.00, categoria: 'RPG', imagem_url: 'images/5.png', rating: 4.9, destaque: true }
        ];
        todosJogos = mockJogos;
        renderizarJogos(mockJogos.filter(j => j.destaque), 'destaquesGrid');
        renderizarJogos(mockJogos, 'todosJogosGrid');
        
        document.getElementById('destaquesGrid').innerHTML = '<div class="loading">⚠️ Usando dados de exemplo</div>';
        document.getElementById('todosJogosGrid').innerHTML = '<div class="loading">⚠️ Usando dados de exemplo</div>';
    }
}

function renderizarJogos(jogos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!jogos || jogos.length === 0) {
        container.innerHTML = '<div class="loading">✨ Nenhum jogo encontrado</div>';
        return;
    }

    container.innerHTML = jogos.map(jogo => {
        const precoFisico = jogo.preco_fisico || (jogo.preco * 1.10);
        return `
        <div class="game-card" data-id="${jogo.id}" data-nome="${jogo.nome}" data-preco="${jogo.preco}" data-preco-fisico="${precoFisico}" data-categoria="${jogo.categoria}">
            <div class="game-badge">${jogo.destaque ? '🔥 Destaque' : '🎮 Novo'}</div>
            <button class="wishlist-btn">♡</button>
            <img src="${jogo.imagem_url || 'images/placeholder.jpg'}" alt="${jogo.nome}" onerror="this.src='images/placeholder.jpg'">
            <h3>${escapeHtml(jogo.nome)}</h3>
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
                    <strong>R$ ${parseFloat(precoFisico).toFixed(2).replace('.', ',')}</strong>
                </label>
            </div>
            
            <button class="buy-btn" onclick="adicionarAoCarrinho(${jogo.id}, '${escapeHtml(jogo.nome).replace(/'/g, "\\'")}', ${jogo.preco}, ${precoFisico})">Comprar</button>
        </div>
    `}).join('');

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
// CHATBOT INTELIGENTE DINÂMICO - LÊ TODOS OS DADOS DO SITE
// =========================

// Cache para armazenar dados do site
let siteDataCache = {
    jogos: [],
    comentarios: [],
    ultimaAtualizacao: null,
    categorias: new Set()
};

// Tempo de cache (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

// =========================
// CARREGAR TODOS OS DADOS DO SITE DINAMICAMENTE
// =========================
async function carregarDadosDoSite() {
    const agora = Date.now();
    
    // Usar cache se estiver fresco
    if (siteDataCache.jogos.length > 0 && (agora - siteDataCache.ultimaAtualizacao) < CACHE_TTL) {
        console.log('📦 Usando cache do chatbot');
        return siteDataCache;
    }
    
    console.log('🔄 Carregando dados atualizados do site...');
    
    try {
        // Carregar jogos da API
        const responseJogos = await fetch(`${API_URL}/api/jogos`);
        const dataJogos = await responseJogos.json();
        siteDataCache.jogos = dataJogos.jogos || [];
        
        // Extrair categorias únicas
        siteDataCache.categorias.clear();
        siteDataCache.jogos.forEach(jogo => {
            if (jogo.categoria) {
                const cats = jogo.categoria.split(' / ');
                cats.forEach(cat => siteDataCache.categorias.add(cat.trim()));
                siteDataCache.categorias.add(jogo.categoria);
            }
        });
        
        // Carregar comentários para análise de opiniões
        try {
            const responseComentarios = await fetch(`${API_URL}/api/comentarios`);
            const dataComentarios = await responseComentarios.json();
            siteDataCache.comentarios = dataComentarios || [];
        } catch (e) {
            siteDataCache.comentarios = [];
        }
        
        siteDataCache.ultimaAtualizacao = agora;
        
        console.log(`✅ Chatbot carregou: ${siteDataCache.jogos.length} jogos, ${siteDataCache.categorias.size} categorias, ${siteDataCache.comentarios.length} comentários`);
        
        return siteDataCache;
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        return siteDataCache;
    }
}

// =========================
// BUSCAR JOGO POR NOME (FLEXÍVEL)
// =========================
function buscarJogoPorNome(pergunta, jogos) {
    const termos = pergunta.toLowerCase();
    
    // Palavras-chave para identificar nome do jogo
    const stopwords = ['preço', 'preco', 'quanto', 'custa', 'valor', 'recomenda', 'melhor', 'sobre', 'jogo', 'qual'];
    
    let melhorMatch = null;
    let maiorScore = 0;
    
    for (let jogo of jogos) {
        const nomeJogo = jogo.nome.toLowerCase();
        let score = 0;
        
        // Verificar se o nome completo está na pergunta
        if (termos.includes(nomeJogo)) {
            score = 100;
        } else {
            // Verificar palavras individuais
            const palavrasNome = nomeJogo.split(' ');
            for (let palavra of palavrasNome) {
                if (palavra.length > 3 && termos.includes(palavra)) {
                    score += 20;
                }
            }
        }
        
        // Remover stopwords para evitar falsos positivos
        for (let stop of stopwords) {
            if (termos.includes(stop)) {
                score -= 5;
            }
        }
        
        if (score > maiorScore && score > 15) {
            maiorScore = score;
            melhorMatch = jogo;
        }
    }
    
    return melhorMatch;
}

// =========================
// BUSCAR JOGOS POR CATEGORIA
// =========================
function buscarJogosPorCategoria(pergunta, jogos) {
    const termos = pergunta.toLowerCase();
    
    // Mapeamento de sinônimos de categorias
    const categoriaSinonimos = {
        'rpg': ['rpg', 'role playing', 'the witcher', 'elden', 'baldur', 'cyberpunk', 'final fantasy'],
        'ação': ['ação', 'acao', 'aventura', 'gta', 'red dead', 'spider', 'god of war', 'uncharted'],
        'acao': ['ação', 'acao', 'aventura', 'gta', 'red dead', 'spider', 'god of war'],
        'corrida': ['corrida', 'forza', 'gran turismo', 'racing', 'carro', 'velocidade'],
        'fps': ['fps', 'tiro', 'rainbow', 'battlefield', 'call of duty', 'counter', 'shooter'],
        'esporte': ['esporte', 'futebol', 'fc 25', 'nba', 'basquete', 'fifa'],
        'sobrevivência': ['sobrevivência', 'sobrevivencia', 'rust', 'minecraft', 'survival'],
        'indie': ['indie', 'stardew', 'hades', 'terraria', 'independente'],
        'soulslike': ['soulslike', 'souls', 'elden', 'dark souls', 'difícil', 'desafiador']
    };
    
    let categoriaEncontrada = null;
    
    for (let [categoria, sinônimos] of Object.entries(categoriaSinonimos)) {
        for (let sin of sinônimos) {
            if (termos.includes(sin)) {
                categoriaEncontrada = categoria;
                break;
            }
        }
        if (categoriaEncontrada) break;
    }
    
    // Também verificar nas categorias reais dos jogos
    if (!categoriaEncontrada) {
        for (let jogo of jogos) {
            const catLower = (jogo.categoria || '').toLowerCase();
            if (termos.includes(catLower) || termos.includes(catLower.split('/')[0].trim())) {
                categoriaEncontrada = jogo.categoria;
                break;
            }
        }
    }
    
    if (categoriaEncontrada) {
        const jogosFiltrados = jogos.filter(jogo => 
            (jogo.categoria || '').toLowerCase().includes(categoriaEncontrada.toLowerCase()) ||
            categoriaSinonimos[categoriaEncontrada]?.some(s => (jogo.categoria || '').toLowerCase().includes(s))
        );
        
        if (jogosFiltrados.length > 0) {
            return {
                categoria: categoriaEncontrada,
                jogos: jogosFiltrados.slice(0, 5) // Top 5
            };
        }
    }
    
    return null;
}

// =========================
// ANALISAR OPINIÕES SOBRE JOGO
// =========================
function analisarOpinioesJogo(nomeJogo, comentarios) {
    const opinioes = comentarios.filter(c => 
        c.comentario && c.comentario.toLowerCase().includes(nomeJogo.toLowerCase())
    );
    
    if (opinioes.length === 0) return null;
    
    const positivos = opinioes.filter(c => c.sentimento === 'positivo').length;
    const negativos = opinioes.filter(c => c.sentimento === 'negativo').length;
    const mediaRating = opinioes.reduce((sum, c) => sum + (c.rating || 3), 0) / opinioes.length;
    
    return {
        total: opinioes.length,
        positivos,
        negativos,
        mediaRating: mediaRating.toFixed(1),
        percentualPositivo: (positivos / opinioes.length * 100).toFixed(0)
    };
}

// =========================
// RECOMENDAR JOGOS BASEADO EM PREFERÊNCIA
// =========================
function recomendarJogos(jogos, preferencia, comentarios) {
    let jogosRecomendados = [...jogos];
    
    // Filtrar por preferência se especificada
    if (preferencia && preferencia !== 'todos') {
        jogosRecomendados = jogosRecomendados.filter(j => 
            (j.categoria || '').toLowerCase().includes(preferencia.toLowerCase())
        );
    }
    
    // Ordenar por rating e popularidade
    jogosRecomendados.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // Pegar top 5
    return jogosRecomendados.slice(0, 5);
}

// =========================
// CALCULAR PREÇO COM PIX
// =========================
function calcularPIX(pergunta) {
    const numeros = pergunta.match(/\d+[.,]?\d*/g);
    if (numeros && pergunta.toLowerCase().includes('pix')) {
        let valor = parseFloat(numeros[0].replace(',', '.'));
        if (!isNaN(valor) && valor > 0 && valor < 10000) {
            const desconto = valor * 0.10;
            const novoValor = valor - desconto;
            return {
                original: valor,
                desconto: desconto,
                final: novoValor,
                economia: desconto
            };
        }
    }
    return null;
}

// =========================
// FUNÇÃO PRINCIPAL DO CHATBOT - DINÂMICA
// =========================
async function chatbotResponder(pergunta) {
    const perguntaLower = pergunta.toLowerCase();
    
    // Carregar dados atualizados do site
    const dados = await carregarDadosDoSite();
    const jogos = dados.jogos;
    const comentarios = dados.comentarios;
    
    // ===== 1. SAUDAÇÕES =====
    const saudacoes = ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'eae', 'opa', 'olá', 'oi bot'];
    if (saudacoes.some(s => perguntaLower.includes(s))) {
        return `👋 Olá! Sou o NexusBot, seu assistente virtual da NexusGames!

📊 **Tenho acesso a TODOS os dados do site em tempo real:**

🎮 **${jogos.length} jogos disponíveis** no catálogo
🏷️ **${dados.categorias.size} categorias diferentes**
💬 **${comentarios.length} avaliações da comunidade**

❓ **Pergunte-me sobre:**
• Preço de qualquer jogo (ex: "quanto custa GTA V?")
• Recomendações por categoria (ex: "melhores jogos de RPG")
• Opiniões da comunidade (ex: "o que acham do Elden Ring?")
• Promoções e descontos PIX
• Entrega, pagamento, cadastro

**Como posso te ajudar hoje?** 🚀`;
    }

    // ===== 2. LISTAR TODOS OS JOGOS =====
    if (perguntaLower.includes('listar jogos') || perguntaLower.includes('todos os jogos') || perguntaLower.includes('catálogo') || perguntaLower.includes('catalogo')) {
        let resposta = `🎮 **CATÁLOGO COMPLETO NEXUSGAMES (${jogos.length} jogos)**\n\n`;
        
        // Agrupar por categoria
        const porCategoria = {};
        jogos.forEach(jogo => {
            const cat = jogo.categoria || 'Outros';
            if (!porCategoria[cat]) porCategoria[cat] = [];
            porCategoria[cat].push(jogo);
        });
        
        for (let [categoria, lista] of Object.entries(porCategoria)) {
            resposta += `**${categoria}** (${lista.length} jogos):\n`;
            resposta += lista.slice(0, 3).map(j => `  • ${j.nome} - R$ ${j.preco.toFixed(2)}`).join('\n');
            if (lista.length > 3) resposta += `\n  • ... e mais ${lista.length - 3} jogos\n`;
            resposta += '\n';
        }
        
        resposta += `\n💡 Digite "preço de [nome do jogo]" para detalhes!`;
        return resposta;
    }

    // ===== 3. BUSCAR JOGO ESPECÍFICO =====
    const jogoEncontrado = buscarJogoPorNome(pergunta, jogos);
    if (jogoEncontrado) {
        const precoFisico = (jogoEncontrado.preco * 1.10).toFixed(2);
        const precoPIX = (jogoEncontrado.preco * 0.90).toFixed(2);
        const opinioes = analisarOpinioesJogo(jogoEncontrado.nome, comentarios);
        
        let resposta = `🎮 **${jogoEncontrado.nome}**\n\n`;
        resposta += `📌 **Categoria:** ${jogoEncontrado.categoria || 'Não especificada'}\n`;
        resposta += `⭐ **Avaliação:** ${jogoEncontrado.rating || '4.5'}/5\n`;
        resposta += `💰 **Preço Digital:** R$ ${jogoEncontrado.preco.toFixed(2)}\n`;
        resposta += `📀 **Preço Físico:** R$ ${precoFisico}\n`;
        resposta += `💚 **Preço com PIX:** R$ ${precoPIX} (10% OFF)\n\n`;
        
        if (opinioes) {
            resposta += `💬 **Opinião da Comunidade:**\n`;
            resposta += `   • ${opinioes.total} avaliações\n`;
            resposta += `   • ${opinioes.percentualPositivo}% positivas\n`;
            resposta += `   • Média: ${opinioes.mediaRating}/5 ⭐\n\n`;
        }
        
        resposta += `💡 **Dica:** Use PIX e economize R$ ${(jogoEncontrado.preco * 0.10).toFixed(2)}!`;
        return resposta;
    }

    // ===== 4. BUSCAR POR CATEGORIA =====
    const categoriaResult = buscarJogosPorCategoria(pergunta, jogos);
    if (categoriaResult && categoriaResult.jogos.length > 0) {
        let resposta = `🎯 **${categoriaResult.categoria.toUpperCase()}** - Top Jogos:\n\n`;
        
        categoriaResult.jogos.forEach((jogo, idx) => {
            resposta += `${idx + 1}. **${jogo.nome}**\n`;
            resposta += `   💰 R$ ${jogo.preco.toFixed(2)} (PIX: R$ ${(jogo.preco * 0.90).toFixed(2)})\n`;
            resposta += `   ⭐ ${jogo.rating || '4.5'}/5\n\n`;
        });
        
        resposta += `💡 Quer saber mais sobre algum deles? Pergunte "preço de [nome do jogo]"!`;
        return resposta;
    }

    // ===== 5. RECOMENDAÇÕES =====
    if (perguntaLower.includes('recomenda') || perguntaLower.includes('melhor') || perguntaLower.includes('top') || perguntaLower.includes('sugestão')) {
        let categoriaPref = null;
        
        if (perguntaLower.includes('rpg')) categoriaPref = 'rpg';
        else if (perguntaLower.includes('ação') || perguntaLower.includes('acao')) categoriaPref = 'ação';
        else if (perguntaLower.includes('corrida')) categoriaPref = 'corrida';
        else if (perguntaLower.includes('fps')) categoriaPref = 'fps';
        else if (perguntaLower.includes('esporte')) categoriaPref = 'esporte';
        
        const recomendados = recomendarJogos(jogos, categoriaPref, comentarios);
        
        let resposta = `🔥 **RECOMENDAÇÕES NEXUSGAMES**\n\n`;
        
        if (categoriaPref) {
            resposta += `🎯 Baseado na sua preferência por **${categoriaPref.toUpperCase()}**:\n\n`;
        }
        
        recomendados.forEach((jogo, idx) => {
            resposta += `${idx + 1}. **${jogo.nome}**\n`;
            resposta += `   📍 ${jogo.categoria || 'Geral'}\n`;
            resposta += `   ⭐ ${jogo.rating || '4.5'}/5 | 💰 R$ ${jogo.preco.toFixed(2)}\n`;
            resposta += `   💡 PIX: R$ ${(jogo.preco * 0.90).toFixed(2)}\n\n`;
        });
        
        resposta += `✨ **Qual desses te interessou?** Pergunte o preço ou detalhes de qualquer um!`;
        return resposta;
    }

    // ===== 6. PREÇO COM PIX =====
    const pixCalc = calcularPIX(pergunta);
    if (pixCalc) {
        return `💰 **Cálculo PIX NexusGames**\n\n` +
               `Valor original: R$ ${pixCalc.original.toFixed(2)}\n` +
               `Desconto de 10%: -R$ ${pixCalc.desconto.toFixed(2)}\n` +
               `🎉 **Valor com PIX: R$ ${pixCalc.final.toFixed(2)}**\n\n` +
               `✅ Você economiza R$ ${pixCalc.economia.toFixed(2)}!\n` +
               `💡 Aproveite o desconto em qualquer jogo do nosso catálogo!`;
    }

    // ===== 7. INFORMAÇÕES GERAIS DO SITE =====
    if (perguntaLower.includes('quantos jogos') || perguntaLower.includes('total de jogos')) {
        return `📊 **Estatísticas da NexusGames em tempo real:**\n\n` +
               `🎮 **${jogos.length} jogos disponíveis** no catálogo\n` +
               `🏷️ **${dados.categorias.size} categorias** diferentes\n` +
               `💬 **${comentarios.length} avaliações** da comunidade\n` +
               `💰 Preços de R$ ${Math.min(...jogos.map(j => j.preco)).toFixed(2)} a R$ ${Math.max(...jogos.map(j => j.preco)).toFixed(2)}\n\n` +
               `💡 Digite "listar jogos" para ver o catálogo completo!`;
    }

    // ===== 8. OPINIÕES SOBRE JOGO ESPECÍFICO =====
    if ((perguntaLower.includes('opinião') || perguntaLower.includes('o que acham') || perguntaLower.includes('vale a pena'))) {
        const jogoParaOpiniao = buscarJogoPorNome(pergunta, jogos);
        if (jogoParaOpiniao) {
            const opinioes = analisarOpinioesJogo(jogoParaOpiniao.nome, comentarios);
            if (opinioes && opinioes.total > 0) {
                return `💬 **Opiniões sobre ${jogoParaOpiniao.nome}:**\n\n` +
                       `📊 Baseado em ${opinioes.total} avaliações:\n` +
                       `👍 ${opinioes.positivos} pessoas recomendam (${opinioes.percentualPositivo}%)\n` +
                       `👎 ${opinioes.negativos} não recomendaram\n` +
                       `⭐ Avaliação média: ${opinioes.mediaRating}/5\n\n` +
                       `💡 **Veredito:** ${opinioes.percentualPositivo > 70 ? '🎉 Altamente recomendado pela comunidade!' : '🤔 Avaliações mistas, veja outros jogos!'}`;
            } else {
                return `📝 Ainda não há avaliações suficientes para ${jogoParaOpiniao.nome}.\n\n` +
                       `💡 **Que tal comprar e deixar sua opinião?** ⭐\n` +
                       `💰 Preço atual: R$ ${jogoParaOpiniao.preco.toFixed(2)} (PIX: R$ ${(jogoParaOpiniao.preco * 0.90).toFixed(2)})`;
            }
        }
    }

    // ===== 9. PERGUNTAS SOBRE PREÇO EM GERAL =====
    if (perguntaLower.includes('preço') || perguntaLower.includes('preco') || perguntaLower.includes('quanto custa')) {
        const jogosBaratos = [...jogos].sort((a, b) => a.preco - b.preco).slice(0, 5);
        let resposta = `💰 **Tabela de Preços NexusGames**\n\n` +
                       `📊 Faixa de preços: R$ ${Math.min(...jogos.map(j => j.preco)).toFixed(2)} - R$ ${Math.max(...jogos.map(j => j.preco)).toFixed(2)}\n\n` +
                       `🎮 **Jogos mais baratos:**\n`;
        
        jogosBaratos.forEach(jogo => {
            resposta += `   • ${jogo.nome}: R$ ${jogo.preco.toFixed(2)} (PIX: R$ ${(jogo.preco * 0.90).toFixed(2)})\n`;
        });
        
        resposta += `\n💡 **Dica especial:** Pague com PIX e ganhe 10% de desconto em qualquer jogo!\n` +
                   `🔍 Para saber o preço de um jogo específico, digite "preço de [nome do jogo]"`;
        
        return resposta;
    }

    // ===== 10. INFORMAÇÕES DE ENTREGA =====
    if (perguntaLower.includes('entrega') || perguntaLower.includes('envio') || perguntaLower.includes('prazo') || perguntaLower.includes('frete')) {
        return `📦 **INFORMAÇÕES DE ENTREGA NEXUSGAMES**\n\n` +
               `🎮 **JOGOS DIGITAIS:**\n` +
               `• Entrega instantânea após o pagamento\n` +
               `• Disponível na biblioteca em até 5 minutos\n\n` +
               `📀 **JOGOS FÍSICOS:**\n` +
               `• Prazo: 3 a 7 dias úteis\n` +
               `• Frete: R$ 15,00 (Sul e Sudeste) / R$ 25,00 (demais regiões)\n` +
               `• Frete GRÁTIS para compras acima de R$ 300,00\n\n` +
               `📍 Acompanhe seu pedido em "Meus Pedidos" após o login!`;
    }

    // ===== 11. FORMAS DE PAGAMENTO =====
    if (perguntaLower.includes('pagamento') || perguntaLower.includes('pagar') || perguntaLower.includes('cartão') || perguntaLower.includes('parcelar')) {
        return `💳 **FORMAS DE PAGAMENTO NEXUSGAMES**\n\n` +
               `✅ **PIX:** 10% de desconto em todos os jogos\n` +
               `✅ **Cartão de Crédito:** até 12x sem juros\n` +
               `✅ **Cartão de Débito:** desconto de 5%\n` +
               `✅ **Boleto Bancário:** 5% de desconto\n\n` +
               `🔒 **Segurança:** Todos os pagamentos são processados com segurança SSL.\n` +
               `💡 **Dica:** PIX é a forma mais rápida e com maior desconto!`;
    }

    // ===== 12. RESPOSTA PADRÃO COM SUGESTÕES =====
    return `🤔 **Ainda estou aprendendo sobre isso!**

💡 **Aqui está o que posso fazer por você:**

🎮 **Consultar jogos:** "preço de GTA V"
⭐ **Recomendações:** "recomende jogos de RPG" ou "melhores jogos"
📊 **Estatísticas:** "quantos jogos têm na loja?"
💬 **Opiniões:** "o que acham do Elden Ring?"
💰 **PIX:** "quanto fica R$ 100 com PIX?"
🏷️ **Categorias:** "jogos de corrida" ou "FPS"
📦 **Entrega:** "como funciona a entrega?"
💳 **Pagamento:** "formas de pagamento"

📚 **Ou diga "listar jogos" para ver nosso catálogo completo!**

🔍 **Tente reformular sua pergunta** - estou sempre aprendendo com novos dados! 🚀`;
}

// =========================
// INICIALIZAR CHATBOT
// =========================
function initChatbot() {
    if (document.getElementById('chatbotBtn')) return;
    
    // Botão do chatbot
    const btn = document.createElement('button');
    btn.id = 'chatbotBtn';
    btn.innerHTML = '💬';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #06b6d4, #8b5cf6);
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.6);
        transition: transform 0.2s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    
    // Janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatWindow';
    chatWindow.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 420px;
        height: 580px;
        background: #0f172a;
        border-radius: 15px;
        border: 1px solid #06b6d4;
        display: none;
        flex-direction: column;
        z-index: 9999;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
    `;
    
    chatWindow.innerHTML = `
        <div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 15px; color: white; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
            <span>🤖 NexusBot 3.0 - IA Dinâmica</span>
            <button id="closeChat" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <div id="chatMessages" style="flex: 1; padding: 15px; overflow-y: auto; background: #0a0a10; display: flex; flex-direction: column; gap: 10px;">
            <div style="background: #1e293b; padding: 12px 15px; border-radius: 15px; border-left: 3px solid #06b6d4; max-width: 85%; align-self: flex-start; color: #94a3b8;">
                🤖 <strong>NexusBot 3.0 - IA em Tempo Real</strong><br><br>
                📊 Tenho acesso a TODOS os dados do seu site:<br>
                • Catálogo completo de jogos<br>
                • Preços atualizados<br>
                • Avaliações da comunidade<br>
                • Informações de entrega e pagamento<br><br>
                ❓ <strong>Experimente perguntar:</strong><br>
                • "listar jogos"<br>
                • "preço de GTA V"<br>
                • "recomende jogos de RPG"<br>
                • "quantos jogos tem na loja?"<br>
                • "o que acham do Elden Ring?"<br><br>
                🚀 <strong>Pergunte qualquer coisa sobre a loja!</strong>
            </div>
        </div>
        <div style="padding: 12px; display: flex; gap: 8px; background: #0f172a; border-top: 1px solid #06b6d4;">
            <input type="text" id="chatInput" placeholder="Digite sua pergunta..." style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #06b6d4; background: #1e293b; color: white; outline: none; font-family: 'Share Tech Mono', monospace;">
            <button id="sendChat" style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); border: none; padding: 12px 20px; border-radius: 10px; color: white; cursor: pointer; font-weight: bold;">Enviar</button>
        </div>
        <div style="padding: 8px; text-align: center; font-size: 10px; color: #475569; background: #0f172a;">
            📊 Dados atualizados em tempo real via API
        </div>
    `;
    
    document.body.appendChild(btn);
    document.body.appendChild(chatWindow);
    
    btn.onclick = () => {
        chatWindow.style.display = 'flex';
        btn.style.display = 'none';
    };
    
    document.getElementById('closeChat').onclick = () => {
        chatWindow.style.display = 'none';
        btn.style.display = 'flex';
    };
    
    const sendBtn = document.getElementById('sendChat');
    const input = document.getElementById('chatInput');
    const messagesDiv = document.getElementById('chatMessages');
    
    async function sendMessage() {
        const msg = input.value.trim();
        if (!msg) return;
        
        messagesDiv.innerHTML += `<div style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 10px 15px; border-radius: 15px; max-width: 85%; align-self: flex-end; color: white;">${escapeHtml(msg)}</div>`;
        input.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        const loadingId = 'loading-' + Date.now();
        messagesDiv.innerHTML += `<div id="${loadingId}" style="background: #1e293b; padding: 10px 15px; border-radius: 15px; max-width: 60px; align-self: flex-start; border-left: 3px solid #06b6d4; color: #94a3b8;">🤖 <span>.</span><span>.</span><span>.</span></div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        const resposta = await chatbotResponder(msg);
        
        document.getElementById(loadingId)?.remove();
        messagesDiv.innerHTML += `<div style="background: #1e293b; padding: 10px 15px; border-radius: 15px; max-width: 85%; align-self: flex-start; border-left: 3px solid #06b6d4; color: #94a3b8; white-space: pre-line;">🤖 ${escapeHtml(resposta)}</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    sendBtn.onclick = sendMessage;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
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
// HEADER QUE DIMINUI AO ROLAR
// =========================
function initShrinkHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Adiciona a classe 'shrink' quando rolar mais de 50px
        if (currentScrollY > 50) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }
        
        // Adiciona sombra ao rolar
        if (currentScrollY > 20) {
            header.classList.add('sticky-shadow');
        } else {
            header.classList.remove('sticky-shadow');
        }
    });
    
    console.log('✅ Header shrink ativado');
}

// =========================
// GARANTIR HEADER FIXO
// =========================
function forceStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    
    // Garantir que o header está fixo
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.width = '100%';
    header.style.zIndex = '10000';
    
    console.log('✅ Header fixo ativado');
}

// =========================
// INICIALIZAÇÃO PRINCIPAL
// =========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - Inicializando NexusGames');
    initTheme();
    forceStickyHeader();
    initShrinkHeader();
    carregarUsuarioLogado();
    atualizarInfoUsuario();
    ocultarAnaliseSentimentos();
    carregarJogos();
    configurarBuscaJogos();
    carregarCarrinho();
    initChatbot();
    new CommentSystem();
});
