// =========================
// SOBRE - NEXUSGAMES
// =========================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Página Sobre carregada');
    
    // Animação para os cards de valores
    const valorCards = document.querySelectorAll('.valor-card');
    valorCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animação para os membros da equipe
    const membros = document.querySelectorAll('.membro');
    membros.forEach((membro, index) => {
        membro.style.opacity = '0';
        membro.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            membro.style.transition = 'all 0.5s ease';
            membro.style.opacity = '1';
            membro.style.transform = 'scale(1)';
        }, 500 + (index * 100));
    });
    
    // Atualizar carrinho
    function atualizarCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('checkoutGames') || '[]');
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) cartBtn.innerHTML = `🛒 ${carrinho.length}`;
    }
    
    // Atualizar usuário logado
    function atualizarUsuario() {
        const usuarioSalvo = localStorage.getItem('nexus_usuario');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            if (loginBtn) {
                loginBtn.innerHTML = `👤 ${usuario.nome.split(' ')[0]}`;
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
        } else {
            if (loginBtn) {
                loginBtn.innerHTML = '👤 Entrar';
                loginBtn.href = 'login.html';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }
    
    atualizarUsuario();
    atualizarCarrinho();
});