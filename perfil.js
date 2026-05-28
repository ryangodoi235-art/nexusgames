// =========================
// PERFIL - NEXUSGAMES
// =========================

const API_URL = 'http://127.0.0.1:5000';
let usuarioLogado = null;
let modoEdicao = false;

// =========================
// CARREGAR USUÁRIO
// =========================
function carregarUsuario() {
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
        window.location.href = 'login.html';
        return false;
    }
}

// =========================
// BUSCAR CEP
// =========================
async function buscarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
            document.getElementById('endereco').value = `${data.logradouro}, ${data.bairro}`;
            document.getElementById('cidade').value = data.localidade;
            document.getElementById('estado').value = data.uf;
            mostrarMensagem('✅ Endereço preenchido automaticamente!', 'sucesso');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

// =========================
// MOSTRAR MENSAGEM
// =========================
function mostrarMensagem(texto, tipo) {
    const msgDiv = document.getElementById('mensagemPerfil');
    if (msgDiv) {
        msgDiv.innerHTML = texto;
        msgDiv.className = `mensagem ${tipo}`;
        setTimeout(() => {
            msgDiv.innerHTML = '';
            msgDiv.className = 'mensagem';
        }, 5000);
    }
}

// =========================
// CARREGAR DADOS DO PERFIL
// =========================
function carregarPerfil() {
    const container = document.getElementById('perfilContent');
    
    // Dados do usuário (simulados por enquanto)
    const usuario = usuarioLogado;
    
    container.innerHTML = `
        <div class="perfil-card">
            <div class="perfil-avatar">
                <span>👤</span>
            </div>
            
            <div id="mensagemPerfil" class="mensagem"></div>
            
            <form id="perfilForm">
                <div class="form-group">
                    <label>Nome completo</label>
                    <input type="text" id="nome" value="${usuario.nome}" ${modoEdicao ? '' : 'disabled'}>
                </div>
                
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" id="email" value="${usuario.email}" disabled>
                </div>
                
                <div class="form-group">
                    <label>CEP</label>
                    <input type="text" id="cep" value="${usuario.cep || ''}" placeholder="00000-000" maxlength="9" ${modoEdicao ? '' : 'disabled'}>
                </div>
                
                <div class="form-group">
                    <label>Endereço</label>
                    <input type="text" id="endereco" value="${usuario.endereco || ''}" placeholder="Rua, número, bairro" ${modoEdicao ? '' : 'disabled'}>
                </div>
                
                <div class="row">
                    <div class="form-group">
                        <label>Cidade</label>
                        <input type="text" id="cidade" value="${usuario.cidade || ''}" placeholder="Cidade" ${modoEdicao ? '' : 'disabled'}>
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="estado" ${modoEdicao ? '' : 'disabled'}>
                            <option value="">Estado</option>
                            <option value="AC" ${usuario.estado === 'AC' ? 'selected' : ''}>AC</option>
                            <option value="AL" ${usuario.estado === 'AL' ? 'selected' : ''}>AL</option>
                            <option value="AP" ${usuario.estado === 'AP' ? 'selected' : ''}>AP</option>
                            <option value="AM" ${usuario.estado === 'AM' ? 'selected' : ''}>AM</option>
                            <option value="BA" ${usuario.estado === 'BA' ? 'selected' : ''}>BA</option>
                            <option value="CE" ${usuario.estado === 'CE' ? 'selected' : ''}>CE</option>
                            <option value="DF" ${usuario.estado === 'DF' ? 'selected' : ''}>DF</option>
                            <option value="ES" ${usuario.estado === 'ES' ? 'selected' : ''}>ES</option>
                            <option value="GO" ${usuario.estado === 'GO' ? 'selected' : ''}>GO</option>
                            <option value="MA" ${usuario.estado === 'MA' ? 'selected' : ''}>MA</option>
                            <option value="MT" ${usuario.estado === 'MT' ? 'selected' : ''}>MT</option>
                            <option value="MS" ${usuario.estado === 'MS' ? 'selected' : ''}>MS</option>
                            <option value="MG" ${usuario.estado === 'MG' ? 'selected' : ''}>MG</option>
                            <option value="PA" ${usuario.estado === 'PA' ? 'selected' : ''}>PA</option>
                            <option value="PB" ${usuario.estado === 'PB' ? 'selected' : ''}>PB</option>
                            <option value="PR" ${usuario.estado === 'PR' ? 'selected' : ''}>PR</option>
                            <option value="PE" ${usuario.estado === 'PE' ? 'selected' : ''}>PE</option>
                            <option value="PI" ${usuario.estado === 'PI' ? 'selected' : ''}>PI</option>
                            <option value="RJ" ${usuario.estado === 'RJ' ? 'selected' : ''}>RJ</option>
                            <option value="RN" ${usuario.estado === 'RN' ? 'selected' : ''}>RN</option>
                            <option value="RS" ${usuario.estado === 'RS' ? 'selected' : ''}>RS</option>
                            <option value="RO" ${usuario.estado === 'RO' ? 'selected' : ''}>RO</option>
                            <option value="RR" ${usuario.estado === 'RR' ? 'selected' : ''}>RR</option>
                            <option value="SC" ${usuario.estado === 'SC' ? 'selected' : ''}>SC</option>
                            <option value="SP" ${usuario.estado === 'SP' ? 'selected' : ''}>SP</option>
                            <option value="SE" ${usuario.estado === 'SE' ? 'selected' : ''}>SE</option>
                            <option value="TO" ${usuario.estado === 'TO' ? 'selected' : ''}>TO</option>
                        </select>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    ${!modoEdicao ? `
                        <button type="button" class="btn-editar" onclick="habilitarEdicao()">✏️ Editar Perfil</button>
                    ` : `
                        <button type="submit" class="btn-salvar">💾 Salvar Alterações</button>
                        <button type="button" class="btn-cancelar" onclick="cancelarEdicao()">❌ Cancelar</button>
                    `}
                </div>
                
                <button type="button" class="btn-trocar-senha" onclick="abrirModalSenha()">🔒 Trocar Senha</button>
            </form>
        </div>
        
        <div class="perfil-stats">
            <div class="stat-card">
                <div class="stat-value" id="totalCompras">0</div>
                <div class="stat-label">Compras realizadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="totalGasto">R$ 0</div>
                <div class="stat-label">Total gasto</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="membroDesde">--</div>
                <div class="stat-label">Membro desde</div>
            </div>
        </div>
    `;
    
    // Adicionar evento de busca de CEP
    const cepInput = document.getElementById('cep');
    if (cepInput && modoEdicao) {
        cepInput.addEventListener('blur', () => buscarCEP(cepInput.value));
    }
    
    // Carregar estatísticas
    carregarEstatisticas();
}

// =========================
// HABILITAR EDIÇÃO
// =========================
function habilitarEdicao() {
    modoEdicao = true;
    carregarPerfil();
}

// =========================
// CANCELAR EDIÇÃO
// =========================
function cancelarEdicao() {
    modoEdicao = false;
    carregarPerfil();
}

// =========================
// SALVAR ALTERAÇÕES
// =========================
async function salvarAlteracoes(e) {
    e.preventDefault();
    
    const dadosAtualizados = {
        nome: document.getElementById('nome').value,
        cep: document.getElementById('cep').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value
    };
    
    // Atualizar localStorage
    const usuarioAtualizado = { ...usuarioLogado, ...dadosAtualizados };
    localStorage.setItem('nexus_usuario', JSON.stringify(usuarioAtualizado));
    usuarioLogado = usuarioAtualizado;
    
    mostrarMensagem('✅ Perfil atualizado com sucesso!', 'sucesso');
    modoEdicao = false;
    
    setTimeout(() => {
        carregarPerfil();
        atualizarNomeNoHeader();
    }, 1500);
}

// =========================
// ATUALIZAR NOME NO HEADER
// =========================
function atualizarNomeNoHeader() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && usuarioLogado) {
        loginBtn.innerHTML = `👤 ${usuarioLogado.nome.split(' ')[0]}`;
    }
}

// =========================
// CARREGAR ESTATÍSTICAS
// =========================
function carregarEstatisticas() {
    const pedidos = JSON.parse(localStorage.getItem('nexus_pedidos') || '[]');
    const pedidosUsuario = pedidos.filter(p => p.usuarioId === usuarioLogado?.id);
    
    const totalCompras = pedidosUsuario.length;
    const totalGasto = pedidosUsuario.reduce((sum, p) => sum + p.total, 0);
    const dataCadastro = usuarioLogado?.dataCadastro || new Date().toLocaleDateString('pt-BR');
    
    document.getElementById('totalCompras').innerText = totalCompras;
    document.getElementById('totalGasto').innerText = `R$ ${totalGasto.toFixed(2)}`;
    document.getElementById('membroDesde').innerText = dataCadastro;
}

// =========================
// MODAL TROCAR SENHA
// =========================
function abrirModalSenha() {
    const novaSenha = prompt('Digite sua nova senha (mínimo 6 caracteres):');
    if (novaSenha && novaSenha.length >= 6) {
        // Aqui você pode implementar a troca de senha no backend
        mostrarMensagem('✅ Senha alterada com sucesso!', 'sucesso');
    } else if (novaSenha) {
        mostrarMensagem('❌ A senha deve ter pelo menos 6 caracteres', 'erro');
    }
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
    if (carregarUsuario()) {
        carregarPerfil();
    }
    atualizarCarrinho();
    
    const form = document.getElementById('perfilForm');
    if (form) {
        form.addEventListener('submit', salvarAlteracoes);
    }
});

// Expor funções globalmente
window.habilitarEdicao = habilitarEdicao;
window.cancelarEdicao = cancelarEdicao;
window.abrirModalSenha = abrirModalSenha;