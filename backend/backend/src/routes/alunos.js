const express = require('express');
const db = require('../db');
const { hashValor, compararValor, gerarToken } = require('../utils/auth');
const { autenticarAluno } = require('../middleware/auth');
const { gerarCodigoReferencia, hojeISO, estadoVisivel } = require('../utils/helpers');

const router = express.Router();

function validarPin(pin) {
  return /^\d{4}$/.test(String(pin));
}

// POST /api/alunos/registo — { nome, whatsapp, pin }
router.post('/registo', async (req, res) => {
  const { nome, whatsapp, pin } = req.body || {};
  if (!nome || !whatsapp || !pin) {
    return res.status(400).json({ erro: 'nome, whatsapp e pin são obrigatórios' });
  }
  if (!validarPin(pin)) {
    return res.status(400).json({ erro: 'PIN deve ter exatamente 4 dígitos' });
  }

  const existente = await db.get('SELECT id FROM alunos WHERE whatsapp = ?', [whatsapp]);
  if (existente) {
    return res.status(409).json({ erro: 'Já existe um aluno registado com este WhatsApp. Faça login.' });
  }

  const pinHash = hashValor(pin);
  const info = await db.run(
    'INSERT INTO alunos (nome, whatsapp, pin_hash, data_registo) VALUES (?, ?, ?, ?) RETURNING id',
    [nome, whatsapp, pinHash, hojeISO()]
  );

  const aluno = { id: info.id, nome, whatsapp };
  const token = gerarToken({ tipo: 'aluno', id: aluno.id, nome: aluno.nome });
  res.status(201).json({ token, aluno });
});

// POST /api/alunos/login — { whatsapp, pin }
router.post('/login', async (req, res) => {
  const { whatsapp, pin } = req.body || {};
  if (!whatsapp || !pin) {
    return res.status(400).json({ erro: 'whatsapp e pin são obrigatórios' });
  }

  const aluno = await db.get('SELECT * FROM alunos WHERE whatsapp = ?', [whatsapp]);
  if (!aluno || !compararValor(pin, aluno.pin_hash)) {
    return res.status(401).json({ erro: 'WhatsApp ou PIN incorretos' });
  }

  const token = gerarToken({ tipo: 'aluno', id: aluno.id, nome: aluno.nome });
  res.json({ token, aluno: { id: aluno.id, nome: aluno.nome, whatsapp: aluno.whatsapp } });
});

// GET /api/alunos/me — dados do aluno autenticado
router.get('/me', autenticarAluno, async (req, res) => {
  const aluno = await db.get('SELECT id, nome, whatsapp, data_registo FROM alunos WHERE id = ?', [req.aluno.id]);
  res.json(aluno);
});

// GET /api/alunos/me/acessos — "Minhas Unidades": tudo o que o aluno já pediu/pagou
router.get('/me/acessos', autenticarAluno, async (req, res) => {
  const linhas = await db.all(
    `SELECT a.*, u.nome AS unidade_nome, u.preco AS unidade_preco, c.nome AS classe_nome
     FROM acessos a
     JOIN unidades u ON u.id = a.unidade_id
     JOIN classes c ON c.id = u.classe_id
     WHERE a.aluno_id = ?
     ORDER BY a.data_pedido DESC`,
    [req.aluno.id]
  );

  const resultado = linhas.map((a) => ({
    id: a.id,
    unidade_id: a.unidade_id,
    unidade_nome: a.unidade_nome,
    unidade_preco: a.unidade_preco,
    classe_nome: a.classe_nome,
    estado: estadoVisivel(a),
    codigo_referencia: a.codigo_referencia,
    data_pedido: a.data_pedido,
    data_confirmacao: a.data_confirmacao,
    data_expiracao: a.data_expiracao,
  }));

  res.json(resultado);
});

// POST /api/alunos/me/acessos — { unidade_id } — pede acesso a uma unidade (cria estado 'pendente')
router.post('/me/acessos', autenticarAluno, async (req, res) => {
  const { unidade_id } = req.body || {};
  if (!unidade_id) return res.status(400).json({ erro: 'unidade_id é obrigatório' });

  const unidade = await db.get('SELECT * FROM unidades WHERE id = ? AND ativo = 1', [unidade_id]);
  if (!unidade) return res.status(404).json({ erro: 'Unidade não encontrada ou inativa' });

  // Se já existe um acesso pago e ainda ativo, não faz sentido criar outro pedido
  const acessoExistente = await db.get(
    'SELECT * FROM acessos WHERE aluno_id = ? AND unidade_id = ? ORDER BY id DESC LIMIT 1',
    [req.aluno.id, unidade_id]
  );

  if (acessoExistente && estadoVisivel(acessoExistente) === 'pago') {
    return res.status(409).json({ erro: 'Já tem acesso ativo a esta unidade', acesso: acessoExistente });
  }
  if (acessoExistente && acessoExistente.estado === 'pendente') {
    return res.status(409).json({ erro: 'Já existe um pedido pendente para esta unidade', acesso: acessoExistente });
  }

  let codigo;
  // Garante unicidade do código de referência (colisão é extremamente rara, mas verificamos)
  do {
    codigo = gerarCodigoReferencia();
  } while (await db.get('SELECT id FROM acessos WHERE codigo_referencia = ?', [codigo]));

  const info = await db.run(
    `INSERT INTO acessos (aluno_id, unidade_id, estado, codigo_referencia, data_pedido)
     VALUES (?, ?, 'pendente', ?, ?) RETURNING id`,
    [req.aluno.id, unidade_id, codigo, hojeISO()]
  );

  const cfg = await db.get('SELECT whatsapp_admin FROM configuracao WHERE id = 1');
  const aluno = await db.get('SELECT nome FROM alunos WHERE id = ?', [req.aluno.id]);

  const mensagem = `Olá! Sou ${aluno.nome}. Quero pagar a unidade "${unidade.nome}" (código ${codigo}).`;
  const linkWhatsapp = cfg.whatsapp_admin
    ? `https://wa.me/${cfg.whatsapp_admin.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
    : null;

  res.status(201).json({
    id: info.id,
    codigo_referencia: codigo,
    estado: 'pendente',
    link_whatsapp: linkWhatsapp,
  });
});

module.exports = router;
