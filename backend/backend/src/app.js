const express = require('express');
const cors = require('cors');

const publicRoutes = require('./routes/public');
const alunosRoutes = require('./routes/alunos');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', publicRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// Handler de erros genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
