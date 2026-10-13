import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import PublicLayout from '../components/public/PublicLayout';
import Campo from '../components/Campo';
import MensagemErro from '../components/MensagemErro';

export default function RecuperarPin() {
  const [whatsapp, setWhatsapp] = useState('');
  const [pin, setPin] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Reset do "copiado" passados 2s
  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  async function aoSubmeter(e) {
    e.preventDefault();
    setErro('');
    setPin(null);
    setMensagem('');
    setAEnviar(true);
    try {
      const resposta = await api.post('/alunos/recuperar-pin', { whatsapp });
      if (resposta.pin) {
        setPin(resposta.pin);
      } else {
        setMensagem(resposta.mensagem || 'Se este número estiver registado, receberá um novo PIN.');
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  }

  async function copiarPin() {
    if (!pin) return;
    try {
      await navigator.clipboard.writeText(pin);
      setCopiado(true);
    } catch {
      // Fallback para browsers antigos
      const el = document.createElement('textarea');
      el.value = pin;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        setCopiado(true);
      } catch {
        // se falhar, ignora
      }
      document.body.removeChild(el);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-md py-6 md:py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)] md:text-3xl">
          Recuperar PIN
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Introduza o número de WhatsApp associado à sua conta. Vamos gerar um novo PIN para si.
        </p>

        {!pin && (
          <form onSubmit={aoSubmeter} className="mt-6 space-y-4">
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

            <MensagemErro>{erro}</MensagemErro>

            {mensagem && (
              <div className="rounded-lg bg-[var(--mango-soft)] px-3 py-2 text-sm text-[var(--mango)]">
                {mensagem}
              </div>
            )}

            <button
              type="submit"
              disabled={aEnviar}
              className="w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {aEnviar ? 'A gerar…' : 'Gerar novo PIN'}
            </button>
          </form>
        )}

        {pin && (
          <div className="mt-6 rounded-2xl bg-[var(--paper)] p-6 shadow-sm">
            <p className="text-sm text-[var(--ink-soft)]">O seu novo PIN é:</p>

            <div className="mt-3 flex items-center justify-center gap-3">
              <p className="font-mono-ref text-4xl font-bold tracking-[0.4em] text-[var(--mango)]">
                {pin}
              </p>
              <button
                type="button"
                onClick={copiarPin}
                aria-label="Copiar PIN"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition ${
                  copiado
                    ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
                    : 'bg-[var(--mango-soft)] text-[var(--mango)] hover:brightness-95'
                }`}
              >
                {copiado ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {copiado && (
              <p className="mt-2 text-center text-xs font-semibold text-[var(--teal)]">
                PIN copiado!
              </p>
            )}

            <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
              Guarde este PIN num lugar seguro. Não será mostrado novamente.
            </p>

            <Link
              to="/entrar"
              className="mt-6 block w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
            >
              Ir para o Login
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/entrar" className="font-semibold text-[var(--mango)] hover:underline">
            ← Voltar ao Login
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}