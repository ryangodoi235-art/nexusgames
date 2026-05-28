// =========================
// DASHBOARD MÉTRICAS - NEXUSGAMES
// =========================

console.log('🚀 Dashboard IA iniciado...');

// Função para carregar métricas

async function carregarMetricas() {
    try {
        const response = await fetch(`${API_URL}/api/metricas`);
        const data = await response.json();
        
        // Se o valor já vier em percentual (ex: 85), não multiplicar
        if (data.acurácia > 1) {
            document.getElementById('acuracia').textContent = data.acurácia.toFixed(1) + '%';
            document.getElementById('precisao').textContent = data.precisao.toFixed(1) + '%';
            document.getElementById('recall').textContent = data.recall.toFixed(1) + '%';
            document.getElementById('f1').textContent = data.f1_score.toFixed(1) + '%';
        } else {
            // Se vier em decimal (ex: 0.85), multiplicar
            document.getElementById('acuracia').textContent = (data.acurácia * 100).toFixed(1) + '%';
            document.getElementById('precisao').textContent = (data.precisao * 100).toFixed(1) + '%';
            document.getElementById('recall').textContent = (data.recall * 100).toFixed(1) + '%';
            document.getElementById('f1').textContent = (data.f1_score * 100).toFixed(1) + '%';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para carregar estatísticas
async function carregarEstatisticas() {
    try {
        console.log('📡 Buscando estatísticas...');
        const response = await fetch(`${window.API_URL || 'http://127.0.0.1:5000'}/api/estatisticas`);
        const data = await response.json();
        
        console.log('📊 Estatísticas recebidas:', data);
        
        const totalEl = document.getElementById('totalComentarios');
        const positivosEl = document.getElementById('positivos');
        const neutrosEl = document.getElementById('neutros');
        const negativosEl = document.getElementById('negativos');
        
        if (totalEl) totalEl.textContent = data.total || 0;
        if (positivosEl) positivosEl.textContent = data.positivos || 0;
        if (neutrosEl) neutrosEl.textContent = data.neutros || 0;
        if (negativosEl) negativosEl.textContent = data.negativos || 0;
        
        console.log('✅ Estatísticas atualizadas na tela!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
    }
}

// Verificar se é admin
function verificarAdmin() {
    const usuario = JSON.parse(localStorage.getItem('nexus_usuario') || 'null');
    const statusMsg = document.getElementById('statusMsg');
    
    console.log('👤 Usuário logado:', usuario);
    
    if (!usuario) {
        if (statusMsg) {
            statusMsg.innerHTML = '⚠️ Faça login para acessar o Dashboard';
            statusMsg.className = 'status-message aviso';
        }
        return false;
    }
    
    if (usuario.admin !== true) {
        if (statusMsg) {
            statusMsg.innerHTML = '⚠️ Acesso restrito a administradores';
            statusMsg.className = 'status-message aviso';
        }
        return false;
    }
    
    if (statusMsg) {
        statusMsg.innerHTML = '✅ Acesso autorizado - Administrador';
        statusMsg.className = 'status-message sucesso';
    }
    return true;
}

// Atualizar carrinho
function atualizarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('checkoutGames') || '[]');
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.innerHTML = `🛒 ${carrinho.length}`;
}

// Atualizar usuário no header
function atualizarUsuarioHeader() {
    const usuario = JSON.parse(localStorage.getItem('nexus_usuario') || 'null');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (usuario) {
        if (loginBtn) {
            loginBtn.innerHTML = `👤 ${usuario.nome.split(' ')[0]}`;
            loginBtn.href = '#';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.onclick = () => {
                localStorage.removeItem('nexus_usuario');
                window.location.href = 'index.html';
            };
        }
    } else {
        if (loginBtn) loginBtn.innerHTML = '👤 Entrar';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Função principal
function initDashboard() {
    console.log('🏁 Inicializando Dashboard...');
    atualizarUsuarioHeader();
    atualizarCarrinho();
    
    if (verificarAdmin()) {
        carregarMetricas();
        carregarEstatisticas();
    }
}

// Executar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}