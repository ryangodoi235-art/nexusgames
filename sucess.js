// =========================
// SUCESSO - PÁGINA DE CONFIRMAÇÃO
// =========================

// Buscar informações da compra
const purchaseInfo = JSON.parse(localStorage.getItem("lastPurchase"));

// Elementos
const orderNumberSpan = document.getElementById("orderNumber");
const purchaseDateSpan = document.getElementById("purchaseDate");
const purchaseTotalSpan = document.getElementById("purchaseTotal");
const purchasedGamesDiv = document.getElementById("purchasedGames");

if (purchaseInfo) {
    // Número do pedido
    orderNumberSpan.textContent = "#" + purchaseInfo.orderNumber;
    
    // Data formatada
    const date = new Date(purchaseInfo.date);
    purchaseDateSpan.textContent = date.toLocaleDateString("pt-BR") + " às " + date.toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'});
    
    // Total
    purchaseTotalSpan.textContent = "R$ " + purchaseInfo.total.toFixed(2);
    
    // Lista de jogos comprados
    if (purchaseInfo.games && purchaseInfo.games.length > 0) {
        purchasedGamesDiv.innerHTML = `
            <h3 style="color: #c84dff; margin-bottom: 15px;">🎮 Jogos Comprados:</h3>
            ${purchaseInfo.games.map(game => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span>${game.name}</span>
                    <span style="color: #c84dff;">R$ ${game.price.toFixed(2)}</span>
                </div>
            `).join('')}
        `;
    }
    
    // Limpar dados da compra após exibir (opcional)
    // localStorage.removeItem("lastPurchase");
} else {
    // Se não houver informação de compra, redirecionar para a loja
    window.location.href = "index.html";
}