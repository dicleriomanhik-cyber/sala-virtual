const express = require('express');
const db = require('../db');
const { autenticarAlunoOpcional } = require('../middleware/auth');
const { estadoVisivel, acessoAtivo } = require('../utils/helpers');

const router = express.Router();

router.get('/config', async (req, res) => {
  const cfg = await db.get(
    `SELECT nome_escola, logo_url, whatsapp_admin, duracao_acesso_dias,
            email, morada, horario, youtube_url, facebook_url
     FROM configuracao WHERE id = 1`
  );
  res.json(cfg);
});

router.get('/classes', async (req, res) => {
  const classes = await db.all('SELECT id, nome, video_gratuito_url FROM classes ORDER BY id');
  res.json(classes);
});

router.get('/classes/:id/unidades', autenticarAlunoOpcional, async (req, res) => {
  const classeId = Number(req.params.id);

  const classe = await db.get('SELECT id, nome FROM classes WHERE id = ?', [classeId]);
  if (!classe) return res.status(404).json({ erro: 'Classe não encontrada' });

  const unidades = await db.all(
    'SELECT id, classe_id, nome, ordem, preco, descricao FROM unidades WHERE classe_id = ? AND ativo = 1 ORDER BY ordem, id',
    [classeId]
  );

  const injectarClasse = (u) => ({ ...u, classe_nome: classe.nome });

  if (!req.aluno) {
    return res.json(unidades.map((u) => ({ ...injectarClasse(u), meu_acesso: null })));
  }

  const lista = await Promise.all(
    unidades.map(async (u) => {
      const acesso = await db.get(
        `SELECT * FROM acessos WHERE aluno_id = ? AND unidade_id = ?
         ORDER BY id DESC LIMIT 1`,
        [req.aluno.id, u.id]
      );
      return {
        ...injectarClasse(u),
        meu_acesso: acesso
          ? {
              estado: estadoVisivel(acesso),
              codigo_referencia: acesso.codigo_referencia,
              data_expiracao: acesso.data_expiracao,
            }
          : null,
      };
    })
  );

  res.json(lista);
});

router.get('/unidades/:id/temas', autenticarAlunoOpcional, async (req, res) => {
  const unidadeId = Number(req.params.id);

  const unidade = await db.get(
    `SELECT u.*, c.nome AS classe_nome, c.id AS classe_id
     FROM unidades u
     JOIN classes c ON c.id = u.classe_id
     WHERE u.id = ? AND u.ativo = 1`,
    [unidadeId]
  );
  if (!unidade) return res.status(404).json({ erro: 'Unidade não encontrada' });

  const temas = await db.all(
    'SELECT id, unidade_id, nome, ordem, descricao, miniatura_url FROM temas WHERE unidade_id = ? AND ativo = 1 ORDER BY ordem, id',
    [unidadeId]
  );

  let temAcesso = false;
  if (req.aluno) {
    const acesso = await db.get(
      `SELECT * FROM acessos WHERE aluno_id = ? AND unidade_id = ?
       ORDER BY id DESC LIMIT 1`,
      [req.aluno.id, unidadeId]
    );
    temAcesso = acesso ? acessoAtivo(acesso) : false;
  }

  const baseUnidade = {
    id: unidade.id,
    nome: unidade.nome,
    preco: unidade.preco,
    descricao: unidade.descricao,
    pdf_url: unidade.pdf_url,
    classe_id: unidade.classe_id,
    classe_nome: unidade.classe_nome,
  };

  if (!temAcesso) {
    return res.json({
      unidade: baseUnidade,
      tem_acesso: false,
      temas: temas.map((t) => ({
        id: t.id,
        nome: t.nome,
        ordem: t.ordem,
        descricao: t.descricao,
        miniatura_url: t.miniatura_url,
      })),
    });
  }

  const temasComLink = await db.all(
    'SELECT id, unidade_id, nome, ordem, link_youtube, descricao, miniatura_url FROM temas WHERE unidade_id = ? AND ativo = 1 ORDER BY ordem, id',
    [unidadeId]
  );

  res.json({
    unidade: baseUnidade,
    tem_acesso: true,
    temas: temasComLink,
  });
});

module.exports = router;