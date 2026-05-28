// =========================
// CONTATO - NEXUSGAMES
// =========================

document.addEventListener('DOMContentLoaded', () => {
    const contatoForm = document.getElementById('contatoForm');
    
    if (contatoForm) {
        contatoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const assunto = document.getElementById('assunto').value;
            const mensagem = document.getElementById('mensagem').value;
            
            if (nome && email && assunto && mensagem) {
                alert('✅ Mensagem enviada! Entraremos em contato em breve.');
                contatoForm.reset();
            } else {
                alert('❌ Preencha todos os campos!');
            }
        });
    }
});