import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import PublicLayout from '../components/public/PublicLayout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

function dataLegivel(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function Perfil() {
  const { aluno, carregando, sair } = useAuth();
  const [acessos, setAcessos] = useState(null);
  const [aba, setAba] = useState('dados');

  useEffect(() => {
    if (!aluno) return;
    api
      .get('/alunos/me/acessos')
      .then(setAcessos)
      .catch(() => setAcessos([]));
  }, [aluno]);

  if (carregando) return null;
  if (!aluno) return <Navigate to="/entrar" state={{ depoisDe: '/perfil' }} replace />;

  const inicial = aluno.nome?.charAt(0).toUpperCase() || '?';
  const totalAcessos = acessos?.length ?? 0;

  const abas = [
    { id: 'dados', label: 'Dados Pessoais' },
    { id: 'unidades', label: 'Minhas Unidades' },
    { id: 'notificacoes', label: 'Notificações' },
  ];

  return (
    <PublicLayout>
      {/* Cartão do cabeçalho */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[url('/images/banner-9.png')] bg-cover bg-center opacity-25"
          />
          <div className="relative z-10 grid gap-5 px-6 py-8 md:grid-cols-[auto_1fr] md:items-center md:px-10 md:py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mango)] font-display text-3xl font-bold text-[var(--mango-ink)] md:h-24 md:w-24 md:text-4xl">
              {inicial}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl">
                {aluno.nome}
              </h1>
              <p className="mt-1 text-sm text-[var(--cream-soft)] md:text-base">
                {aluno.whatsapp}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--teal-soft)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
                Conta activa
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Abas */}
      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-black/10">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              aba === a.id
                ? 'border-[var(--mango)] text-[var(--mango)]'
                : 'border-transparent text-[var(--cream-soft)] hover:text-[var(--cream)]'
            }`}
          >
            {a.label}
          </button>
        ))}
      </nav>

      {aba === 'dados' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm lg:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="3.2" />
                      <path d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                      Informações Pessoais
                    </h2>
                    <p className="text-xs text-[var(--ink-soft)]">
                      Veja e actualize os seus dados pessoais.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-[var(--mango-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--mango)] transition hover:brightness-95"
                >
                  Editar
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <LinhaInfo icone="user" label="Nome completo" valor={aluno.nome} />
                <LinhaInfo icone="whatsapp" label="Número de WhatsApp" valor={aluno.whatsapp} />
                <LinhaInfo icone="lock" label="PIN" valor="••••••" extra="Alterar PIN" />
                <LinhaInfo icone="mail" label="Email" valor="—" />
                <LinhaInfo icone="calendar" label="Data de registo" valor={dataLegivel(aluno.data_registo)} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm lg:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5.5" width="18" height="13" rx="2" />
                    <path d="M3.5 8.5h17" strokeLinecap="round" />
                  </svg>
                </span>
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                  Resumo da Conta
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--mango-soft)]/60 p-4">
                  <p className="text-xs font-medium text-[var(--cream-soft)]">Minhas Unidades</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                    {totalAcessos}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--cream-soft)]">
                    unidades disponíveis
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--mango-soft)]/60 p-4">
                  <p className="text-xs font-medium text-[var(--cream-soft)]">Último acesso</p>
                  <p className="mt-1 font-display text-base font-semibold text-[var(--ink)]">
                    Hoje
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--cream-soft)]">
                    a partir de qualquer dispositivo
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm lg:p-6">
              <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                Ajuda e Suporte
              </h2>
              <div className="mt-4 space-y-2">
                <AtalhoBotao
                  titulo="Fale connosco"
                  sub="Precisa de assistência? Estamos aqui para si"
                  icone="help"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={sair}
              className="w-full rounded-full bg-[#0B2A5B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)]"
            >
              Sair da conta
            </button>
          </div>
        </div>
      )}

      {aba === 'unidades' && (
        <div className="mt-8">
          {acessos === null ? (
            <div className="animate-pulse space-y-3">
              <div className="h-24 rounded-2xl bg-black/[0.04]" />
              <div className="h-24 rounded-2xl bg-black/[0.04]" />
            </div>
          ) : acessos.length === 0 ? (
            <div className="rounded-2xl bg-[var(--paper)] p-8 text-center shadow-sm">
              <p className="text-sm text-[var(--cream-soft)]">
                Ainda não pediu acesso a nenhuma unidade.
              </p>
              <Link
                to="/"
                className="mt-4 inline-block text-sm font-semibold text-[var(--mango)] hover:underline"
              >
                Ver classes disponíveis →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {acessos.map((acesso) => (
                <Link
                  key={acesso.id}
                  to={`/unidades/${acesso.unidade_id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--paper)] p-4 shadow-sm transition hover:shadow-md lg:p-5"
                >
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold text-[var(--ink)] lg:text-lg">
                      {acesso.unidade_nome}
                    </p>
                    {acesso.codigo_referencia && (
                      <p className="mt-0.5 font-mono-ref text-xs text-[var(--cream-soft)]">
                        Código: {acesso.codigo_referencia}
                      </p>
                    )}
                  </div>
                  <StatusBadge estado={acesso.estado_visivel || acesso.estado} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'notificacoes' && (
        <div className="mt-8 rounded-2xl bg-[var(--paper)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--cream-soft)]">
            Não tem notificações de momento.
          </p>
        </div>
      )}
    </PublicLayout>
  );
}

/* ---------- Auxiliares ---------- */

function LinhaInfo({ icone, label, valor, extra }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--paper-soft)] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
          <Icone nome={icone} />
        </span>
        <div>
          <p className="text-xs font-medium text-[var(--cream-soft)]">{label}</p>
          <p className="text-sm font-semibold text-[var(--ink)]">{valor || '—'}</p>
        </div>
      </div>
      {extra && (
        <button
          type="button"
          className="shrink-0 rounded-lg bg-[var(--mango-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--mango)] transition hover:brightness-95"
        >
          {extra}
        </button>
      )}
    </div>
  );
}

function AtalhoBotao({ titulo, sub, icone }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/[0.03]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
        <Icone nome={icone} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--ink)]">{titulo}</p>
        <p className="text-xs text-[var(--cream-soft)]">{sub}</p>
      </div>
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--mango)]" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Icone({ nome }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, className: 'h-4 w-4' };

  if (nome === 'user') return (<svg {...props}><circle cx="12" cy="8" r="3.2" /><path d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" strokeLinecap="round" /></svg>);
  if (nome === 'whatsapp') return (<svg {...props}><path d="M12.04 3a8.85 8.85 0 0 0-7.52 13.5L3 21l4.66-1.22A8.85 8.85 0 1 0 12.04 3Z" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === 'lock') return (<svg {...props}><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" /></svg>);
  if (nome === 'mail') return (<svg {...props}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7.5 12 13l8.5-5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  if (nome === 'calendar') return (<svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v3M16 3v3" strokeLinecap="round" /></svg>);
  if (nome === 'help') return (<svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.6c0 1.6-2.4 2.4-2.4 2.4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  return null;
}