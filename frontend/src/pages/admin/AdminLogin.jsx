import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Campo from '../../components/Campo';
import MensagemErro from '../../components/MensagemErro';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const { admin, entrar } = useAdminAuth();
  const navigate = useNavigate();

  if (admin) return <Navigate to="/admin/dashboard" replace />;

  async function aoSubmeter(e) {
    e.preventDefault();
    setErro('');
    setAEnviar(true);
    try {
      await entrar({ username, password });
      navigate('/admin/dashboard', { replace: true });
    } catch (e) {
      setErro(e.status === 401 ? 'Usuário ou senha inválidos.' : e.message);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-[var(--paper)] shadow-lg">
          <div className="relative grid md:grid-cols-2">
            {/* Imagem de fundo em mobile */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[url('/images/login-lateral.png')] bg-cover bg-center opacity-15 md:hidden"
            />

            {/* Formulário */}
            <div className="relative z-10 p-6 md:p-10 lg:p-12">
              <div className="mb-6 flex flex-col items-start gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mango)] font-display text-base font-bold text-[var(--mango-ink)]">
                  FIS
                </span>
                <h1 className="font-display text-2xl font-semibold leading-tight text-[var(--ink)] md:text-3xl">
                  Painel Admin
                </h1>
                <p className="text-sm text-[var(--ink-soft)]">
                  Segredos da Física — acesso reservado ao professor
                </p>
              </div>

              <form onSubmit={aoSubmeter} className="space-y-4">
                <Campo label="Usuário">
                  <input
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="campo"
                  />
                </Campo>
                <Campo label="Senha">
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="campo"
                  />
                </Campo>

                <MensagemErro>{erro}</MensagemErro>

                <button
                  type="submit"
                  disabled={aEnviar}
                  className="w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2A5B] disabled:opacity-60"
                >
                  {aEnviar ? 'A entrar…' : 'Entrar'}
                </button>
              </form>
            </div>

            {/* Imagem lateral em desktop */}
            <div className="relative hidden md:block">
              <img
                src="/images/login-lateral.png"
                alt=""
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>
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