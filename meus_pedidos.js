// =========================
// MEUS PEDIDOS - NEXUSGAMES
// =========================

const API_URL = 'http://127.0.0.1:5000';
let usuarioLogado = null;

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
                window.location.href = 'index.html';
            };
        }
        return true;
    } else {
        if (loginBtn) {
            loginBtn.innerHTML = '👤 Entrar';
            loginBtn.href = 'login.html';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        return false;
    }
}

// =========================
// STATUS DO PEDIDO
// =========================
function getStatusTexto(status) {
    switch (status) {
        case 'entregue': return '✅ Entregue';
        case 'pendente': return '⏳ Pendente';
        case 'cancelado': return '❌ Cancelado';
        case 'processando': return '🔄 Processando';
        default: return '📦 Em andamento';
    }
}

// =========================
// CARREGAR PEDIDOS
// =========================
function carregarPedidos() {
    const pedidosDiv = document.getElementById('pedidosList');

    if (!usuarioLogado) {
        pedidosDiv.innerHTML = `
            <div class="sem-pedidos">
                <p>🔐 Faça login para ver seus pedidos</p>
                <a href="login.html">Fazer Login</a>
            </div>
        `;
        return;
    }

    const pedidos = JSON.parse(localStorage.getItem('nexus_pedidos') || '[]');

    if (pedidos.length === 0) {
        pedidosDiv.innerHTML = `
            <div class="sem-pedidos">
                <p>📭 Você ainda não fez nenhuma compra.</p>
                <a href="index.html">🛒 Começar a comprar</a>
            </div>
        `;
        return;
    }

    pedidosDiv.innerHTML = pedidos.map(p => `
        <div class="pedido-card">
            <div class="pedido-header">
                <span class="pedido-numero">🎮 Pedido #${p.numero}</span>
                <span class="pedido-data">📅 ${p.data}</span>
                <span class="pedido-status ${p.status}">${getStatusTexto(p.status)}</span>
            </div>
            <div class="pedido-itens">
                ${p.itens.map(i => {
                    const tipoIcon = i.tipo_midia === 'digital' ? '💾' : '📀';
                    const tipoNome = i.tipo_midia === 'digital' ? 'Digital' : 'Física';
                    return `<div class="pedido-item"><span class="pedido-item-nome">${tipoIcon} ${i.nome} (${tipoNome})</span><span class="pedido-item-preco">R$ ${i.preco.toFixed(2)}</span></div>`;
                }).join('')}
            </div>
            <div class="pedido-total">Total: R$ ${p.total.toFixed(2)}</div>
        </div>
    `).join('');
}

// =========================
// ATUALIZAR CARRINHO
// =========================
function atualizarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('checkoutGames') || '[]');
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.innerHTML = `🛒 ${carrinho.length}`;
}

// =========================
// INICIALIZAÇÃO
// =========================
document.addEventListener('DOMContentLoaded', () => {
    carregarUsuarioLogado();
    carregarPedidos();
    atualizarCarrinho();
});