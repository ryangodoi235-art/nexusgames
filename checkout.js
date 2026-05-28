// =========================
// CHECKOUT NEXUSGAMES - COMPLETO
// =========================

let savedGames = JSON.parse(localStorage.getItem("checkoutGames")) || [];

const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const paymentForm = document.getElementById("paymentForm");

// Buscar CEP
async function buscarCEP() {
    const cepInput = document.getElementById('cepEntrega');
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        alert('Digite um CEP válido com 8 dígitos');
        return;
    }

    const btn = document.getElementById('btnBuscarCEP');
    btn.disabled = true;
    btn.innerHTML = '⏳ Buscando...';

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
            document.getElementById('enderecoEntrega').value = `${data.logradouro}, ${data.bairro}`;
            document.getElementById('cidadeEntrega').value = data.localidade;
            document.getElementById('estadoEntrega').value = data.uf;
            alert('✅ Endereço preenchido automaticamente!');
        } else {
            alert('❌ CEP não encontrado!');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('❌ Erro ao buscar CEP');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🔍 Buscar';
    }
}

document.getElementById('btnBuscarCEP')?.addEventListener('click', buscarCEP);

function renderCheckout() {
    let total = 0;
    checkoutItems.innerHTML = "";

    if (savedGames.length === 0) {
        checkoutItems.innerHTML = `<p style="color: #999; text-align: center;">Nenhum jogo no carrinho.</p>`;
        checkoutTotal.textContent = "R$ 0,00";
        return;
    }

    savedGames.forEach((game, index) => {
        total += game.price;
        const tipoIcon = game.tipo_midia === 'digital' ? '💾' : '📀';
        const tipoNome = game.tipo_midia === 'digital' ? 'Digital' : 'Física';
        
        checkoutItems.innerHTML += `
            <div class="game-item">
                <div>
                    <strong>${game.name}</strong>
                    <p>${tipoIcon} ${tipoNome} - R$ ${game.price.toFixed(2)}</p>
                </div>
                <button onclick="removeGame(${index})" class="remove-btn">✖</button>
            </div>
        `;
    });

    checkoutTotal.textContent = `R$ ${total.toFixed(2)}`;
}

window.removeGame = function(index) {
    savedGames.splice(index, 1);
    localStorage.setItem("checkoutGames", JSON.stringify(savedGames));
    renderCheckout();
};

function validatePayment() {
    const endereco = document.getElementById("enderecoEntrega")?.value.trim();
    const cidade = document.getElementById("cidadeEntrega")?.value.trim();
    const cardName = document.getElementById("cardName")?.value.trim();
    const cardNumber = document.getElementById("cardNumber")?.value.trim();
    const cardExpiry = document.getElementById("cardExpiry")?.value.trim();
    const cardCvv = document.getElementById("cardCvv")?.value.trim();

    if (!endereco) { alert("Digite o endereço de entrega!"); return false; }
    if (!cidade) { alert("Digite a cidade!"); return false; }
    if (!cardName) { alert("Digite o nome no cartão"); return false; }
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) { alert("Número de cartão inválido"); return false; }
    if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) { alert("Data de validade inválida (MM/AA)"); return false; }
    if (!cardCvv || cardCvv.length < 3) { alert("CVV inválido"); return false; }
    return true;
}

if (paymentForm) {
    paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (savedGames.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        if (!validatePayment()) return;

        // Criar novo pedido
const novoPedido = {
    numero: Math.floor(100000 + Math.random() * 900000),
    data: new Date().toLocaleString('pt-BR'),
    total: savedGames.reduce((sum, game) => sum + game.price, 0),
    itens: savedGames.map(game => ({ 
        nome: game.name, 
        preco: game.price,
        tipo_midia: game.tipo_midia || 'digital'
    })),
    status: 'entregue'
};
        // Salvar no histórico
        const pedidos = JSON.parse(localStorage.getItem('nexus_pedidos') || '[]');
        pedidos.unshift(novoPedido);
        localStorage.setItem('nexus_pedidos', JSON.stringify(pedidos));

        const purchaseInfo = {
            orderNumber: novoPedido.numero,
            date: new Date().toISOString(),
            total: novoPedido.total,
            games: savedGames
        };
        
        localStorage.setItem("lastPurchase", JSON.stringify(purchaseInfo));
        localStorage.removeItem("checkoutGames");
        window.location.href = "sucess.html";
    });
}

renderCheckout();

