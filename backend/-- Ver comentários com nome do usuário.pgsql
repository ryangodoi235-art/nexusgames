-- Ver comentários com nome do usuário
SELECT u.nome, c.comentario, c.rating, c.sentimento, c.data_comentario
FROM comentarios c
JOIN usuarios u ON c.usuario_id = u.id
ORDER BY c.data_comentario DESC;

-- Ver estatísticas dos comentários
SELECT sentimento, COUNT(*) as total
FROM comentarios
GROUP BY sentimento;

-- Ver todos os usuários
SELECT * FROM usuarios;

-- Ver todos os jogos
SELECT * FROM jogos;