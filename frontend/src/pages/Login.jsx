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

export default function Login() {
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.depoisDe || '/';

  async function aoSubmeter(e) {
    e.preventDefault();
    setErro('');
    setAEnviar(true);
    try {
      await entrar({ whatsapp, pin });
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
          <div className="relative grid md:grid-cols-2">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[url('/images/login-lateral.png')] bg-cover bg-center opacity-15 md:hidden"
            />

            <div className="relative z-10 p-6 md:p-10 lg:p-12">
              <div className="mb-6 flex flex-col items-start gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mango)] font-display text-base font-bold text-[var(--mango-ink)]">
                  FIS
                </span>
                <h1 className="font-display text-2xl font-semibold leading-tight text-[var(--ink)] md:text-3xl">
                  Bem-vindo de volta
                </h1>
                <p className="text-sm text-[var(--ink-soft)]">
                  Entre para continuar o seu percurso de aprendizagem.
                </p>
              </div>

              <form onSubmit={aoSubmeter} className="space-y-4">
                <Campo label="Número de WhatsApp">
                  <input
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ex: 258845709653"
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
                  {aEnviar ? 'A entrar…' : 'Entrar'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm">
                <Link
                  to="/recuperar-pin"
                  className="font-medium text-[var(--mango)] hover:underline"
                >
                  Esqueceu o PIN?
                </Link>
              </p>

              <p className="mt-4 text-center text-sm text-[var(--ink-soft)]">
                Ainda não tem conta?{' '}
                <Link
                  to="/registo"
                  state={{ depoisDe: destino }}
                  className="font-semibold text-[var(--mango)] hover:underline"
                >
                  Criar conta
                </Link>
              </p>
            </div>

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
      </div>
    </PublicLayout>
  );
}