import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PublicLayout from '../components/public/PublicLayout';
import Campo from '../components/Campo';
import MensagemErro from '../components/MensagemErro';
import { useAuth } from '../context/AuthContext';

function AtomoDecorativo() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 text-[var(--mango)]/10 md:h-56 md:w-56"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="12" fill="currentColor" stroke="none" />
      <ellipse cx="100" cy="100" rx="70" ry="30" />
      <ellipse cx="100" cy="100" rx="70" ry="30" transform="rotate(60 100 100)" />
      <ellipse cx="100" cy="100" rx="70" ry="30" transform="rotate(-60 100 100)" />
    </svg>
  );
}

export default function Registo() {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const { registar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.depoisDe || '/';
  const veioDoAdmin = location.state?.origem === 'admin';

  async function aoSubmeter(e) {
    e.preventDefault();
    setErro('');
    if (!/^\d{4}$/.test(pin)) {
      setErro('O PIN deve ter exatamente 4 dígitos.');
      return;
    }
    setAEnviar(true);
    try {
      await registar({ nome, whatsapp, pin });
      navigate(destino, { replace: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <PublicLayout>
      <div className="relative mx-auto w-full max-w-4xl py-4 md:py-10">
        <AtomoDecorativo />

        <div className="relative overflow-hidden rounded-3xl bg-[var(--paper)] shadow-lg">
          <div className="grid md:grid-cols-2">
            <div className="relative order-2 hidden md:block">
              <img
                src="/images/registo-lateral.png"
                alt=""
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[url('/images/registo-lateral.png')] bg-cover bg-center opacity-15 md:hidden"
            />

            <div className="relative z-10 order-1 p-6 md:p-10 lg:p-12">
              {veioDoAdmin && (
                <Link
                  to="/admin/alunos"
                  className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mango)] transition hover:underline"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Voltar ao painel
                </Link>
              )}

              <h1 className="font-display text-2xl font-semibold leading-tight text-[var(--ink)] md:text-3xl">
                Criar conta
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Comece o seu percurso de aprendizagem da Física.
              </p>

              <form onSubmit={aoSubmeter} className="mt-6 space-y-4">
                <Campo label="Nome completo">
                  <input
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Bento Cacilda"
                    className="campo"
                  />
                </Campo>
                <Campo label="Número de WhatsApp">
                  <input
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: 841111111"
                    inputMode="tel"
                    className="campo"
                  />
                </Campo>
                <Campo label="PIN">
                  <input
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    inputMode="numeric"
                    maxLength={4}
                    className="campo font-mono-ref tracking-[0.5em]"
                  />
                </Campo>

                <MensagemErro>{erro}</MensagemErro>

                <button
                  type="submit"
                  disabled={aEnviar}
                  className="w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2A5B] disabled:opacity-60"
                >
                  {aEnviar ? 'A criar conta…' : 'Criar conta'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
                Já tem conta?{' '}
                <Link
                  to="/entrar"
                  state={{ depoisDe: destino }}
                  className="font-semibold text-[var(--mango)] hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}