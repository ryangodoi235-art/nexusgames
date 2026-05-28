// =========================
// LOGIN - NEXUSGAMES
// =========================

const API_URL = 'http://127.0.0.1:5000';
let isLogin = true;

// Elementos DOM
const form = document.getElementById('authForm');
const toggleLink = document.getElementById('toggleLink');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cadastroDiv = document.getElementById('cadastroDiv');
const msgDiv = document.getElementById('msg');

// Elementos do formulário
const nomeInput = document.getElementById('nome');
const cepInput = document.getElementById('cep');
const enderecoInput = document.getElementById('endereco');
const cidadeInput = document.getElementById('cidade');
const estadoSelect = document.getElementById('estado');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');

// =====================
// FUNÇÕES AUXILIARES
// =====================

function mostrarMensagem(texto, tipo = 'erro') {
    msgDiv.innerHTML = texto;
    msgDiv.className = `mensagem ${tipo}`;
    
    setTimeout(() => {
        if (msgDiv.innerHTML === texto) {
            msgDiv.innerHTML = '';
            msgDiv.className = 'mensagem';
        }
    }, 5000);
}

function limparMensagem() {
    msgDiv.innerHTML = '';
    msgDiv.className = 'mensagem';
}

function toggleForm() {
    isLogin = !isLogin;
    
    if (isLogin) {
        formTitle.innerHTML = '🔐 Entrar na NexusGames';
        submitBtn.innerHTML = 'Entrar';
        toggleLink.innerHTML = '📝 Criar uma conta';
        cadastroDiv.style.display = 'none';
    } else {
        formTitle.innerHTML = '📝 Criar conta NexusGames';
        submitBtn.innerHTML = 'Cadastrar';
        toggleLink.innerHTML = '🔐 Já tenho uma conta';
        cadastroDiv.style.display = 'block';
    }
    limparMensagem();
}

// =====================
// BUSCAR CEP (VIA CEP)
// =====================

async function buscarCEP() {
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            enderecoInput.value = `${data.logradouro}, ${data.bairro}`;
            cidadeInput.value = data.localidade;
            estadoSelect.value = data.uf;
            mostrarMensagem('✅ Endereço preenchido automaticamente!', 'sucesso');
        } else {
            mostrarMensagem('⚠️ CEP não encontrado', 'erro');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

// =====================
// GEOLOCALIZAÇÃO
// =====================

async function obterLocalizacao() {
    const btn = document.getElementById('btnLocalizarCEP');
    const cepInputLocal = document.getElementById('cep');
    
    if (!navigator.geolocation) {
        mostrarMensagem('❌ Seu navegador não suporta geolocalização', 'erro');
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '⏳ Buscando localização...';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('Coordenadas:', lat, lng);
            
            await buscarCEPporCoordenadas(lat, lng);
            btn.disabled = false;
            btn.innerHTML = '📍 Usar localização';
        },
        (error) => {
            console.error('Erro de geolocalização:', error);
            let mensagem = '';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensagem = 'Permissão negada. Ative a localização no navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensagem = 'Localização indisponível.';
                    break;
                case error.TIMEOUT:
                    mensagem = 'Tempo esgotado. Tente novamente.';
                    break;
                default:
                    mensagem = 'Erro ao obter localização.';
            }
            mostrarMensagem(`❌ ${mensagem}`, 'erro');
            btn.disabled = false;
            btn.innerHTML = '📍 Usar localização';
        }
    );
}

async function buscarCEPporCoordenadas(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data.address) {
            let cep = data.address.postcode?.replace(/[^0-9]/g, '');
            const logradouro = data.address.road || '';
            const bairro = data.address.suburb || data.address.neighbourhood || '';
            const cidade = data.address.city || data.address.town || data.address.village;
            const estado = data.address.state_code?.toUpperCase() || '';
            
            if (cep && cep.length === 8) {
                document.getElementById('cep').value = cep;
                document.getElementById('endereco').value = `${logradouro}, ${bairro}`;
                document.getElementById('cidade').value = cidade;
                document.getElementById('estado').value = estado;
                mostrarMensagem('✅ Localização detectada! Endereço preenchido.', 'sucesso');
                
                await buscarDetalhesCEP(cep);
            } else {
                mostrarMensagem('⚠️ Não foi possível obter o CEP pela localização. Digite manualmente.', 'erro');
            }
        }
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        mostrarMensagem('❌ Erro ao obter endereço. Digite o CEP manualmente.', 'erro');
    }
}

async function buscarDetalhesCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            if (document.getElementById('endereco').value === '') {
                document.getElementById('endereco').value = `${data.logradouro}, ${data.bairro}`;
            }
            document.getElementById('cidade').value = data.localidade;
            document.getElementById('estado').value = data.uf;
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
    }
}

// =====================
// ENVIAR FORMULÁRIO
// =====================

async function handleSubmit(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    
    if (!email || !senha) {
        mostrarMensagem('❌ Preencha todos os campos', 'erro');
        return;
    }
    
    if (isLogin) {
        // ========== LOGIN ==========
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Entrando...';
            
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('nexus_usuario', JSON.stringify(data.usuario));
                localStorage.setItem('nexus_token', data.token);
                mostrarMensagem('✅ Login realizado! Redirecionando...', 'sucesso');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                mostrarMensagem(`❌ ${data.erro}`, 'erro');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Entrar';
            }
        } catch (error) {
            mostrarMensagem('❌ Erro de conexão com o servidor', 'erro');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Entrar';
        }
    } else {
        // ========== CADASTRO ==========
        const nome = nomeInput.value.trim();
        const cep = cepInput.value.trim();
        const endereco = enderecoInput.value.trim();
        const cidade = cidadeInput.value.trim();
        const estado = estadoSelect.value;
        
        if (!nome || nome.length < 3) {
            mostrarMensagem('❌ Nome deve ter pelo menos 3 caracteres', 'erro');
            return;
        }
        
        if (!cep) {
            mostrarMensagem('❌ Digite seu CEP para entrega', 'erro');
            return;
        }
        
        if (senha.length < 6) {
            mostrarMensagem('❌ Senha deve ter pelo menos 6 caracteres', 'erro');
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Cadastrando...';
            
            const response = await fetch(`${API_URL}/api/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, cep, endereco, cidade, estado })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                mostrarMensagem('✅ Cadastro realizado! Faça login para continuar.', 'sucesso');
                
                nomeInput.value = '';
                cepInput.value = '';
                enderecoInput.value = '';
                cidadeInput.value = '';
                estadoSelect.value = '';
                emailInput.value = '';
                senhaInput.value = '';
                
                setTimeout(() => {
                    toggleForm();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Entrar';
                }, 2000);
            } else {
                mostrarMensagem(`❌ ${data.erro || 'Erro ao cadastrar'}`, 'erro');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Cadastrar';
            }
        } catch (error) {
            mostrarMensagem('❌ Erro de conexão com o servidor', 'erro');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Cadastrar';
        }
    }
}

// =====================
// EVENTOS
// =====================

if (toggleLink) {
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForm();
    });
}

// Botão de localização
const btnLocalizar = document.getElementById('btnLocalizarCEP');
if (btnLocalizar) {
    btnLocalizar.addEventListener('click', obterLocalizacao);
}

// Buscar CEP automaticamente
if (cepInput) {
    cepInput.addEventListener('blur', buscarCEP);
}

emailInput?.addEventListener('input', limparMensagem);
senhaInput?.addEventListener('input', limparMensagem);
nomeInput?.addEventListener('input', limparMensagem);
cepInput?.addEventListener('input', limparMensagem);

if (form) {
    form.addEventListener('submit', handleSubmit);
}

const usuarioLogado = localStorage.getItem('nexus_usuario');
if (usuarioLogado && window.location.pathname.includes('login.html')) {
    setTimeout(() => {
    window.location.href = 'index.html';
    }, 1500);
}