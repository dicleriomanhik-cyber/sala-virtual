import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiAdmin } from '../../api/client';
import Campo from '../../components/Campo';
import MensagemErro from '../../components/MensagemErro';

export default function AdminRecuperar() {
  const [username, setUsername] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const navigate = useNavigate();

  async function aoSubmeter(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (novaPassword !== confirmar) {
      setErro('As passwords não coincidem.');
      return;
    }
    if (novaPassword.length < 4) {
      setErro('A nova password deve ter pelo menos 4 caracteres.');
      return;
    }

    setAEnviar(true);
    try {
      await apiAdmin.post('/admin/recuperar-password', {
        username,
        recoveryKey,
        novaPassword,
      });
      setSucesso(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-[var(--paper)] p-6 shadow-lg md:p-8">
          <div className="mb-6 flex flex-col items-start gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mango)] font-display text-base font-bold text-[var(--mango-ink)]">
              FIS
            </span>
            <h1 className="font-display text-2xl font-semibold leading-tight text-[var(--ink)]">
              Recuperar password
            </h1>
            <p className="text-sm text-[var(--ink-soft)]">
              Introduza a chave de recuperação que guardou quando criou a conta.
            </p>
          </div>

          {!sucesso ? (
            <form onSubmit={aoSubmeter} className="space-y-4">
              <Campo label="Nome de utilizador">
                <input
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="campo"
                />
              </Campo>
              <Campo label="Chave de recuperação">
                <input
                  required
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                  placeholder="SV-RK-XXXX-XXXX-XXXX"
                  className="campo font-mono-ref"
                />
              </Campo>
              <Campo label="Nova password">
                <input
                  required
                  type="password"
                  value={novaPassword}
                  onChange={(e) => setNovaPassword(e.target.value)}
                  placeholder="••••••••"
                  className="campo"
                />
              </Campo>
              <Campo label="Confirmar nova password">
                <input
                  required
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  className="campo"
                />
              </Campo>

              <MensagemErro>{erro}</MensagemErro>

              <button
                type="submit"
                disabled={aEnviar}
                className="w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {aEnviar ? 'A alterar…' : 'Alterar password'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-[var(--teal-soft)] px-3 py-3 text-sm text-[var(--teal)]">
                Password alterada. A chave de recuperação foi invalidada. Pode agora entrar com a nova password.
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/entrar', { replace: true })}
                className="w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Ir para o Login
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/admin/entrar" className="font-semibold text-[var(--mango)] hover:underline">
              ← Voltar ao Login
            </Link>
          </p>
        </div>
      </main>
      <footer className="py-6 text-center">
        <p className="text-xs text-[var(--cream-soft)]/70">
          Desenvolvido pela <span className="font-semibold text-[var(--cream-soft)]">SmartMetrics</span>
        </p>
      </footer>
    </div>
  );
}