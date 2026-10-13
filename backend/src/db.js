const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL não definida. Configura a connection string do Postgres (Supabase) na variável de ambiente DATABASE_URL.'
  );
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

function toPg(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function all(sql, params = []) {
  const res = await pool.query(toPg(sql), params);
  return res.rows;
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0];
}

async function run(sql, params = []) {
  const res = await pool.query(toPg(sql), params);
  return {
    changes: res.rowCount,
    id: res.rows[0]?.id ?? null,
  };
}

async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await fn(client);
    await client.query('COMMIT');
    return resultado;
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      video_gratuito_url TEXT
    );

    CREATE TABLE IF NOT EXISTS unidades (
      id SERIAL PRIMARY KEY,
      classe_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      ordem INTEGER NOT NULL DEFAULT 0,
      preco REAL NOT NULL DEFAULT 0,
      ativo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS temas (
      id SERIAL PRIMARY KEY,
      unidade_id INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      ordem INTEGER NOT NULL DEFAULT 0,
      link_youtube TEXT,
      ativo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS alunos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      whatsapp TEXT NOT NULL UNIQUE,
      pin_hash TEXT NOT NULL,
      data_registo TEXT NOT NULL DEFAULT (now()::text)
    );

    CREATE TABLE IF NOT EXISTS acessos (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      unidade_id INTEGER NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
      estado TEXT NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','pago','rejeitado')),
      codigo_referencia TEXT NOT NULL UNIQUE,
      data_pedido TEXT NOT NULL DEFAULT (now()::text),
      data_confirmacao TEXT,
      data_expiracao TEXT
    );

    CREATE TABLE IF NOT EXISTS configuracao (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nome_escola TEXT NOT NULL DEFAULT 'Segredos da Física',
      logo_url TEXT,
      whatsapp_admin TEXT,
      duracao_acesso_dias INTEGER NOT NULL DEFAULT 30
    );

    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recuperacoes_pin (
      id SERIAL PRIMARY KEY,
      whatsapp TEXT NOT NULL,
      data_pedido TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE configuracao
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS morada TEXT,
      ADD COLUMN IF NOT EXISTS horario TEXT,
      ADD COLUMN IF NOT EXISTS youtube_url TEXT,
      ADD COLUMN IF NOT EXISTS facebook_url TEXT;

    ALTER TABLE unidades
      ADD COLUMN IF NOT EXISTS descricao TEXT,
      ADD COLUMN IF NOT EXISTS pdf_url TEXT;

    ALTER TABLE temas
      ADD COLUMN IF NOT EXISTS descricao TEXT,
      ADD COLUMN IF NOT EXISTS miniatura_url TEXT;

    ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS recovery_key_hash TEXT;
  `);

  const cfg = await get('SELECT id FROM configuracao WHERE id = 1');
  if (!cfg) {
    await run(
      `INSERT INTO configuracao (id, nome_escola, logo_url, whatsapp_admin, duracao_acesso_dias)
       VALUES (1, 'Segredos da Física', NULL, NULL, 30)`
    );
  }
}

module.exports = { all, get, run, transaction, migrate, pool };