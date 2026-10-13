const express = require('express');
const db = require('../db');
const { hashValor, compararValor, gerarToken, gerarChaveRecuperacao } = require('../utils/auth');
const { autenticarAdmin } = require('../middleware/auth');
const { hojeISO, adicionarDias, estadoVisivel } = require('../utils/helpers');

const router = express.Router();

// ---------- Login ----------

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ erro: 'username e password são obrigatórios' });

  const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin || !compararValor(password, admin.password_hash)) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = gerarToken({ tipo: 'admin', id: admin.id, username: admin.username });
  res.json({ token, admin: { id: admin.id, username: admin.username } });
});

// ---------- Recuperar password (público) ----------

router.post('/recuperar-password', async (req, res) => {
  const { username, recoveryKey, novaPassword } = req.body || {};
  if (!username || !recoveryKey || !novaPassword) {
    return res.status(400).json({ erro: 'username, recoveryKey e novaPassword são obrigatórios' });
  }
  if (novaPassword.length < 4) {
    return res.status(400).json({ erro: 'A nova password deve ter pelo menos 4 caracteres' });
  }

  const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin || !admin.recovery_key_hash) {
    return res.status(401).json({ erro: 'Dados de recuperação inválidos' });
  }
  if (!compararValor(recoveryKey.trim().toUpperCase(), admin.recovery_key_hash)) {
    return res.status(401).json({ erro: 'Dados de recuperação inválidos' });
  }

  const novoHash = hashValor(novaPassword);
  await db.run(
    'UPDATE admins SET password_hash = ?, recovery_key_hash = NULL WHERE id = ?',
    [novoHash, admin.id]
  );

  res.json({ ok: true, mensagem: 'Password alterada. A chave de recuperação foi invalidada.' });
});

// A partir daqui, todas as rotas exigem admin autenticado
router.use(autenticarAdmin);

// ---------- Me ----------

router.get('/me', async (req, res) => {
  const admin = await db.get('SELECT id, username FROM admins WHERE id = ?', [req.admin.id]);
  if (!admin) return res.status(404).json({ erro: 'Admin não encontrado' });
  res.json(admin);
});

router.put('/me', async (req, res) => {
  const { passwordAtual, novoUsername, novaPassword } = req.body || {};
  if (!passwordAtual) {
    return res.status(400).json({ erro: 'A password atual é obrigatória' });
  }

  const admin = await db.get('SELECT * FROM admins WHERE id = ?', [req.admin.id]);
  if (!admin || !compararValor(passwordAtual, admin.password_hash)) {
    return res.status(401).json({ erro: 'Password atual incorreta' });
  }

  if (novaPassword && novaPassword.length < 4) {
    return res.status(400).json({ erro: 'A nova password deve ter pelo menos 4 caracteres' });
  }

  const usernameFinal = novoUsername && novoUsername.trim() ? novoUsername.trim() : admin.username;

  if (usernameFinal !== admin.username) {
    const existente = await db.get('SELECT id FROM admins WHERE username = ? AND id != ?', [usernameFinal, admin.id]);
    if (existente) {
      return res.status(409).json({ erro: 'Já existe um admin com esse username' });
    }
  }

  const hashFinal = novaPassword ? hashValor(novaPassword) : admin.password_hash;

  await db.run('UPDATE admins SET username = ?, password_hash = ? WHERE id = ?', [usernameFinal, hashFinal, admin.id]);

  res.json({ ok: true, admin: { id: admin.id, username: usernameFinal } });
});

router.post('/me/gerar-chave-recuperacao', async (req, res) => {
  const chave = gerarChaveRecuperacao();
  const hash = hashValor(chave);

  await db.run('UPDATE admins SET recovery_key_hash = ? WHERE id = ?', [hash, req.admin.id]);

  res.json({ ok: true, recovery_key: chave });
});

router.get('/me/tem-chave-recuperacao', async (req, res) => {
  const admin = await db.get('SELECT recovery_key_hash FROM admins WHERE id = ?', [req.admin.id]);
  res.json({ tem_chave: !!admin?.recovery_key_hash });
});

// ---------- Dashboard ----------

router.get('/dashboard/stats', async (req, res) => {
  const [alunos, classes, acessos, aulasGratuitasRow] = await Promise.all([
    db.all('SELECT id FROM alunos'),
    db.all('SELECT id, nome, video_gratuito_url FROM classes ORDER BY id'),
    db.all('SELECT id, estado FROM acessos'),
    db.get('SELECT COUNT(*)::int AS n FROM aulas_gratuitas WHERE ativo = 1'),
  ]);

  const porClasse = await Promise.all(
    classes.map(async (c) => {
      const r = await db.get('SELECT COUNT(*)::int AS n FROM unidades WHERE classe_id = ?', [c.id]);
      return { id: c.id, nome: c.nome, unidades: r.n };
    })
  );

  const totalUnidades = porClasse.reduce((soma, c) => soma + c.unidades, 0);
  const totalPagamentos = acessos.filter((a) => a.estado === 'pago').length;
  const pedidosPendentes = acessos.filter((a) => a.estado === 'pendente').length;

  res.json({
    total_alunos: alunos.length,
    total_unidades: totalUnidades,
    total_aulas_gratuitas: aulasGratuitasRow.n,
    total_pagamentos: totalPagamentos,
    pedidos_pendentes: pedidosPendentes,
    por_classe: porClasse,
  });
});

router.get('/dashboard/atividade', async (req, res) => {
  const linhas = await db.all(
    `SELECT a.id, a.estado, a.data_pedido,
            al.nome AS aluno_nome,
            u.nome AS unidade_nome
     FROM acessos a
     JOIN alunos al ON al.id = a.aluno_id
     JOIN unidades u ON u.id = a.unidade_id
     ORDER BY a.data_pedido DESC
     LIMIT 10`
  );

  const resultado = linhas.map((l) => ({
    id: l.id,
    tipo: 'pedido',
    aluno_nome: l.aluno_nome,
    unidade_nome: l.unidade_nome,
    estado: estadoVisivel(l),
    data: l.data_pedido,
  }));

  res.json(resultado);
});

router.get('/dashboard/series', async (req, res) => {
  const dias = Math.min(Math.max(Number(req.query.dias) || 7, 1), 90);

  const resultado = await db.all(
    `SELECT DATE(data_pedido::timestamp) AS dia, COUNT(*)::int AS total
     FROM acessos
     WHERE data_pedido::timestamp >= NOW() - INTERVAL '1 day' * $1
     GROUP BY DATE(data_pedido::timestamp)
     ORDER BY dia ASC`,
    [dias]
  );

  const mapa = new Map(resultado.map((r) => [r.dia.toISOString().slice(0, 10), r.total]));
  const serie = [];
  for (let i = dias - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const chave = d.toISOString().slice(0, 10);
    serie.push({ data: chave, total: mapa.get(chave) || 0 });
  }

  res.json(serie);
});

// ---------- Notificações ----------

router.get('/notificacoes', async (req, res) => {
  const notificacoes = [];

  const pendentes = await db.all(
    `SELECT a.id, a.data_pedido, al.nome AS aluno_nome, u.nome AS unidade_nome
     FROM acessos a
     JOIN alunos al ON al.id = a.aluno_id
     JOIN unidades u ON u.id = a.unidade_id
     WHERE a.estado = 'pendente'
     ORDER BY a.data_pedido DESC
     LIMIT 5`
  );
  pendentes.forEach((p) => {
    notificacoes.push({
      id: `pedido-${p.id}`,
      tipo: 'pedido',
      titulo: `${p.aluno_nome} pediu acesso`,
      descricao: p.unidade_nome,
      data: p.data_pedido,
      link: '/admin/pagamentos',
    });
  });

  const novos = await db.all(
    `SELECT id, nome, data_registo
     FROM alunos
     WHERE data_registo::timestamp >= NOW() - INTERVAL '7 days'
     ORDER BY data_registo DESC
     LIMIT 5`
  );
  novos.forEach((n) => {
    notificacoes.push({
      id: `aluno-${n.id}`,
      tipo: 'aluno',
      titulo: `Novo aluno: ${n.nome}`,
      descricao: 'Registado recentemente',
      data: n.data_registo,
      link: '/admin/alunos',
    });
  });

  notificacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

  res.json(notificacoes.slice(0, 10));
});

// ---------- Aulas Gratuitas ----------

router.get('/aulas-gratuitas', async (req, res) => {
  res.json(await db.all('SELECT * FROM aulas_gratuitas ORDER BY ordem, id'));
});

router.post('/aulas-gratuitas', async (req, res) => {
  const { titulo, classe, disciplina, link_youtube, imagem_url, ordem, ativo } = req.body || {};
  if (!titulo) return res.status(400).json({ erro: 'titulo é obrigatório' });
  const info = await db.run(
    `INSERT INTO aulas_gratuitas (titulo, classe, disciplina, link_youtube, imagem_url, ordem, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    [titulo, classe || null, disciplina || null, link_youtube || null, imagem_url || null, ordem ?? 0, ativo === false ? 0 : 1]
  );
  res.status(201).json(await db.get('SELECT * FROM aulas_gratuitas WHERE id = ?', [info.id]));
});

router.put('/aulas-gratuitas/:id', async (req, res) => {
  const existente = await db.get('SELECT * FROM aulas_gratuitas WHERE id = ?', [req.params.id]);
  if (!existente) return res.status(404).json({ erro: 'Aula não encontrada' });
  const { titulo, classe, disciplina, link_youtube, imagem_url, ordem, ativo } = req.body || {};
  await db.run(
    `UPDATE aulas_gratuitas SET titulo = ?, classe = ?, disciplina = ?, link_youtube = ?, imagem_url = ?, ordem = ?, ativo = ? WHERE id = ?`,
    [
      titulo ?? existente.titulo,
      classe !== undefined ? classe : existente.classe,
      disciplina !== undefined ? disciplina : existente.disciplina,
      link_youtube !== undefined ? link_youtube : existente.link_youtube,
      imagem_url !== undefined ? imagem_url : existente.imagem_url,
      ordem ?? existente.ordem,
      ativo === undefined ? existente.ativo : (ativo ? 1 : 0),
      req.params.id,
    ]
  );
  res.json(await db.get('SELECT * FROM aulas_gratuitas WHERE id = ?', [req.params.id]));
});

router.delete('/aulas-gratuitas/:id', async (req, res) => {
  const existente = await db.get('SELECT id FROM aulas_gratuitas WHERE id = ?', [req.params.id]);
  if (!existente) return res.status(404).json({ erro: 'Aula não encontrada' });
  await db.run('DELETE FROM aulas_gratuitas WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

// ---------- Classes ----------

router.get('/classes', async (req, res) => {
  res.json(await db.all('SELECT * FROM classes ORDER BY id'));
});

router.post('/classes', async (req, res) => {
  const { nome, video_gratuito_url } = req.body || {};
  if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
  const info = await db.run('INSERT INTO classes (nome, video_gratuito_url) VALUES (?, ?) RETURNING id', [nome, video_gratuito_url || null]);
  res.status(201).json(await db.get('SELECT * FROM classes WHERE id = ?', [info.id]));
});

router.put('/classes/:id', async (req, res) => {
  const { nome, video_gratuito_url } = req.body || {};
  const existente = await db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
  if (!existente) return res.status(404).json({ erro: 'Classe não encontrada' });
  await db.run('UPDATE classes SET nome = ?, video_gratuito_url = ? WHERE id = ?', [
    nome ?? existente.nome,
    video_gratuito_url !== undefined ? video_gratuito_url : existente.video_gratuito_url,
    req.params.id,
  ]);
  res.json(await db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]));
});

router.delete('/classes/:id', async (req, res) => {
  await db.run('DELETE FROM classes WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

// ---------- Unidades ----------

router.get('/unidades', async (req, res) => {
  const { classe_id } = req.query;
  if (classe_id) {
    return res.json(await db.all('SELECT * FROM unidades WHERE classe_id = ? ORDER BY ordem, id', [classe_id]));
  }
  res.json(await db.all('SELECT * FROM unidades ORDER BY classe_id, ordem, id'));
});

router.post('/unidades', async (req, res) => {
  const { classe_id, nome, ordem, preco, ativo, descricao, pdf_url } = req.body || {};
  if (!classe_id || !nome) return res.status(400).json({ erro: 'classe_id e nome são obrigatórios' });
  const info = await db.run(
    'INSERT INTO unidades (classe_id, nome, ordem, preco, ativo, descricao, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
    [classe_id, nome, ordem ?? 0, preco ?? 0, ativo === false ? 0 : 1, descricao || null, pdf_url || null]
  );
  res.status(201).json(await db.get('SELECT * FROM unidades WHERE id = ?', [info.id]));
});

router.put('/unidades/:id', async (req, res) => {
  const existente = await db.get('SELECT * FROM unidades WHERE id = ?', [req.params.id]);
  if (!existente) return res.status(404).json({ erro: 'Unidade não encontrada' });
  const { nome, ordem, preco, ativo, classe_id, descricao, pdf_url } = req.body || {};
  await db.run(
    'UPDATE unidades SET classe_id = ?, nome = ?, ordem = ?, preco = ?, ativo = ?, descricao = ?, pdf_url = ? WHERE id = ?',
    [
      classe_id ?? existente.classe_id,
      nome ?? existente.nome,
      ordem ?? existente.ordem,
      preco ?? existente.preco,
      ativo === undefined ? existente.ativo : (ativo ? 1 : 0),
      descricao !== undefined ? descricao : existente.descricao,
      pdf_url !== undefined ? pdf_url : existente.pdf_url,
      req.params.id,
    ]
  );
  res.json(await db.get('SELECT * FROM unidades WHERE id = ?', [req.params.id]));
});

router.delete('/unidades/:id', async (req, res) => {
  await db.run('DELETE FROM unidades WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

router.post('/unidades/reordenar', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ erro: 'ids deve ser um array' });
  await db.transaction(async (client) => {
    for (let idx = 0; idx < ids.length; idx += 1) {
      await client.query('UPDATE unidades SET ordem = $1 WHERE id = $2', [idx, ids[idx]]);
    }
  });
  res.json({ ok: true });
});

// ---------- Temas ----------

router.get('/temas', async (req, res) => {
  const { unidade_id } = req.query;
  if (unidade_id) {
    return res.json(await db.all('SELECT * FROM temas WHERE unidade_id = ? ORDER BY ordem, id', [unidade_id]));
  }
  res.json(await db.all('SELECT * FROM temas ORDER BY unidade_id, ordem, id'));
});

router.post('/temas', async (req, res) => {
  const { unidade_id, nome, ordem, link_youtube, ativo, descricao, miniatura_url } = req.body || {};
  if (!unidade_id || !nome) return res.status(400).json({ erro: 'unidade_id e nome são obrigatórios' });
  const info = await db.run(
    'INSERT INTO temas (unidade_id, nome, ordem, link_youtube, ativo, descricao, miniatura_url) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
    [unidade_id, nome, ordem ?? 0, link_youtube || null, ativo === false ? 0 : 1, descricao || null, miniatura_url || null]
  );
  res.status(201).json(await db.get('SELECT * FROM temas WHERE id = ?', [info.id]));
});

router.put('/temas/:id', async (req, res) => {
  const existente = await db.get('SELECT * FROM temas WHERE id = ?', [req.params.id]);
  if (!existente) return res.status(404).json({ erro: 'Tema não encontrado' });
  const { nome, ordem, link_youtube, ativo, unidade_id, descricao, miniatura_url } = req.body || {};
  await db.run(
    'UPDATE temas SET unidade_id = ?, nome = ?, ordem = ?, link_youtube = ?, ativo = ?, descricao = ?, miniatura_url = ? WHERE id = ?',
    [
      unidade_id ?? existente.unidade_id,
      nome ?? existente.nome,
      ordem ?? existente.ordem,
      link_youtube !== undefined ? link_youtube : existente.link_youtube,
      ativo === undefined ? existente.ativo : (ativo ? 1 : 0),
      descricao !== undefined ? descricao : existente.descricao,
      miniatura_url !== undefined ? miniatura_url : existente.miniatura_url,
      req.params.id,
    ]
  );
  res.json(await db.get('SELECT * FROM temas WHERE id = ?', [req.params.id]));
});

router.delete('/temas/:id', async (req, res) => {
  await db.run('DELETE FROM temas WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

router.post('/temas/reordenar', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ erro: 'ids deve ser um array' });
  await db.transaction(async (client) => {
    for (let idx = 0; idx < ids.length; idx += 1) {
      await client.query('UPDATE temas SET ordem = $1 WHERE id = $2', [idx, ids[idx]]);
    }
  });
  res.json({ ok: true });
});

// ---------- Acessos ----------

router.get('/acessos', async (req, res) => {
  const { estado, busca } = req.query;

  let sql = `
    SELECT a.*, al.nome AS aluno_nome, al.whatsapp AS aluno_whatsapp,
           u.nome AS unidade_nome, u.preco AS unidade_preco
    FROM acessos a
    JOIN alunos al ON al.id = a.aluno_id
    JOIN unidades u ON u.id = a.unidade_id
  `;
  const params = [];
  const where = [];

  if (busca && busca.trim()) {
    where.push('(LOWER(al.nome) LIKE LOWER(?) OR LOWER(u.nome) LIKE LOWER(?) OR a.codigo_referencia LIKE ?)');
    const termo = `%${busca.trim()}%`;
    params.push(termo, termo, termo);
  }

  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY a.data_pedido DESC';

  const linhas = await db.all(sql, params);
  let resultado = linhas.map((a) => ({ ...a, estado_visivel: estadoVisivel(a) }));

  if (estado) {
    resultado = resultado.filter((a) => a.estado_visivel === estado);
  }

  res.json(resultado);
});

router.post('/acessos/:id/confirmar', async (req, res) => {
  const acesso = await db.get('SELECT * FROM acessos WHERE id = ?', [req.params.id]);
  if (!acesso) return res.status(404).json({ erro: 'Pedido não encontrado' });
  if (acesso.estado !== 'pendente') {
    return res.status(409).json({ erro: `Pedido já está com estado '${acesso.estado}'` });
  }

  const cfg = await db.get('SELECT duracao_acesso_dias FROM configuracao WHERE id = 1');
  const agora = hojeISO();
  const expiracao = adicionarDias(agora, cfg.duracao_acesso_dias);

  await db.run(`UPDATE acessos SET estado = 'pago', data_confirmacao = ?, data_expiracao = ? WHERE id = ?`, [
    agora,
    expiracao,
    req.params.id,
  ]);

  res.json(await db.get('SELECT * FROM acessos WHERE id = ?', [req.params.id]));
});

router.post('/acessos/:id/rejeitar', async (req, res) => {
  const acesso = await db.get('SELECT * FROM acessos WHERE id = ?', [req.params.id]);
  if (!acesso) return res.status(404).json({ erro: 'Pedido não encontrado' });
  if (acesso.estado !== 'pendente') {
    return res.status(409).json({ erro: `Pedido já está com estado '${acesso.estado}'` });
  }
  await db.run(`UPDATE acessos SET estado = 'rejeitado' WHERE id = ?`, [req.params.id]);
  res.json(await db.get('SELECT * FROM acessos WHERE id = ?', [req.params.id]));
});

// ---------- Alunos ----------

router.get('/alunos', async (req, res) => {
  const { busca } = req.query;

  let sql = 'SELECT id, nome, whatsapp, data_registo FROM alunos';
  const params = [];

  if (busca && busca.trim()) {
    sql += ' WHERE LOWER(nome) LIKE LOWER(?) OR whatsapp LIKE ?';
    params.push(`%${busca.trim()}%`, `%${busca.trim()}%`);
  }

  sql += ' ORDER BY data_registo DESC';

  const alunos = await db.all(sql, params);
  const resultado = await Promise.all(
    alunos.map(async (al) => {
      const historico = (
        await db.all(
          `SELECT a.id, a.estado, a.codigo_referencia, a.data_pedido, a.data_confirmacao, a.data_expiracao, u.nome AS unidade_nome
           FROM acessos a JOIN unidades u ON u.id = a.unidade_id
           WHERE a.aluno_id = ? ORDER BY a.data_pedido DESC`,
          [al.id]
        )
      ).map((h) => ({ ...h, estado_visivel: estadoVisivel(h) }));
      return { ...al, historico };
    })
  );
  res.json(resultado);
});

router.delete('/alunos/:id', async (req, res) => {
  const existente = await db.get('SELECT id FROM alunos WHERE id = ?', [req.params.id]);
  if (!existente) return res.status(404).json({ erro: 'Aluno não encontrado' });
  await db.run('DELETE FROM alunos WHERE id = ?', [req.params.id]);
  res.status(204).end();
});

// ---------- Configurações ----------

router.get('/config', async (req, res) => {
  res.json(await db.get('SELECT * FROM configuracao WHERE id = 1'));
});

router.put('/config', async (req, res) => {
  const existente = await db.get('SELECT * FROM configuracao WHERE id = 1');
  const {
    nome_escola,
    logo_url,
    whatsapp_admin,
    duracao_acesso_dias,
    email,
    morada,
    horario,
    youtube_url,
    facebook_url,
  } = req.body || {};

  await db.run(
    `UPDATE configuracao SET
       nome_escola = ?,
       logo_url = ?,
       whatsapp_admin = ?,
       duracao_acesso_dias = ?,
       email = ?,
       morada = ?,
       horario = ?,
       youtube_url = ?,
       facebook_url = ?
     WHERE id = 1`,
    [
      nome_escola ?? existente.nome_escola,
      logo_url !== undefined ? logo_url : existente.logo_url,
      whatsapp_admin ?? existente.whatsapp_admin,
      duracao_acesso_dias ?? existente.duracao_acesso_dias,
      email !== undefined ? email : existente.email,
      morada !== undefined ? morada : existente.morada,
      horario !== undefined ? horario : existente.horario,
      youtube_url !== undefined ? youtube_url : existente.youtube_url,
      facebook_url !== undefined ? facebook_url : existente.facebook_url,
    ]
  );

  res.json(await db.get('SELECT * FROM configuracao WHERE id = 1'));
});

module.exports = router;