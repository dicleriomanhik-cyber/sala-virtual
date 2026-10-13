import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import MensagemErro from '../../components/MensagemErro';

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' });
}

function formatarDiaCurto(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' });
}

function CartaoResumo({ titulo, valor, sub, corFundo, corIcone, icone, para }) {
  return (
    <Link
      to={para || '#'}
      className="group flex flex-col rounded-2xl bg-[var(--paper)] p-4 shadow-sm transition hover:shadow-md md:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: corFundo, color: corIcone }}
          >
            {icone}
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            {titulo}
          </p>
        </div>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--mango)]" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-[var(--ink)]">{valor}</p>
      <p className="mt-1 text-xs text-[var(--cream-soft)]">{sub}</p>
    </Link>
  );
}

/* ---------- Gráfico de linha em SVG puro ---------- */

function GraficoAcessos({ serie }) {
  if (!serie || serie.length === 0) {
    return (
      <div className="mt-5 flex h-52 w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#F4F8FE] to-[#E8F0FE]">
        <p className="text-sm text-[var(--cream-soft)]">A carregar dados…</p>
      </div>
    );
  }

  const largura = 600;
  const altura = 200;
  const paddingTop = 20;
  const paddingBottom = 30;
  const paddingLeft = 30;
  const paddingRight = 20;

  const valores = serie.map((s) => s.total);
  const maxValor = Math.max(...valores, 1);

  const larguraPlot = largura - paddingLeft - paddingRight;
  const alturaPlot = altura - paddingTop - paddingBottom;

  const pontos = serie.map((s, i) => {
    const x = paddingLeft + (i / (serie.length - 1 || 1)) * larguraPlot;
    const y = paddingTop + alturaPlot - (s.total / maxValor) * alturaPlot;
    return { x, y, valor: s.total, data: s.data };
  });

  const linhaPath = pontos
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const areaPath =
    linhaPath +
    ` L ${pontos[pontos.length - 1].x} ${paddingTop + alturaPlot}` +
    ` L ${pontos[0].x} ${paddingTop + alturaPlot} Z`;

  const yEtiquetas = [0, Math.ceil(maxValor / 2), maxValor];

  return (
    <div className="mt-5 w-full rounded-xl bg-gradient-to-br from-[#F4F8FE] to-[#E8F0FE] p-2">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="h-52 w-full"
        role="img"
        aria-label="Gráfico de evolução de acessos nos últimos 7 dias"
      >
        {/* Grelha horizontal + etiquetas do eixo Y */}
        {yEtiquetas.map((val, i) => {
          const y = paddingTop + alturaPlot - (val / maxValor) * alturaPlot;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                x2={largura - paddingRight}
                y1={y}
                y2={y}
                stroke="#D9E6FB"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <text
                x={paddingLeft - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#8A94A6"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Área sob a linha */}
        <path d={areaPath} fill="#1A73E8" fillOpacity="0.08" />

        {/* Linha */}
        <path
          d={linhaPath}
          fill="none"
          stroke="#1A73E8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pontos + etiquetas do eixo X */}
        {pontos.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#1A73E8" />
            <circle cx={p.x} cy={p.y} r="8" fill="#1A73E8" fillOpacity="0.12" />
            <text
              x={p.x}
              y={altura - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#8A94A6"
            >
              {formatarDiaCurto(p.data)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [atividade, setAtividade] = useState(null);
  const [serie, setSerie] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [s, a, ser] = await Promise.all([
          apiAdmin.get('/admin/dashboard/stats').catch(() => null),
          apiAdmin.get('/admin/dashboard/atividade').catch(() => []),
          apiAdmin.get('/admin/dashboard/series?dias=7').catch(() => null),
        ]);
        if (!activo) return;
        setStats(s);
        setAtividade(a);
        setSerie(ser);
      } catch {
        if (activo) setErro('Não foi possível carregar o painel.');
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const totalAlunos = stats?.total_alunos ?? '—';
  const totalUnidades = stats?.total_unidades ?? '—';
  const totalAulasGratuitas = stats?.total_aulas_gratuitas ?? '—';
  const totalPagamentos = stats?.total_pagamentos ?? '—';
  const porClasse = stats?.por_classe ?? [];

  const recentes = (atividade || []).slice(0, 5);

  return (
    <AdminLayout>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/banner-12.png')] bg-cover bg-center opacity-25"
        />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14 lg:py-16">
          <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
            Painel Administrativo
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
            Bem-vindo, Administrador
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
            Aqui você gerencia todo o sistema da Segredos da Física — Sala Virtual.
          </p>
        </div>
      </section>

      {erro && (
        <div className="mt-6">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoResumo
          titulo="Total de Alunos"
          valor={totalAlunos}
          sub="Alunos registados no sistema"
          corFundo="var(--mango-soft)"
          corIcone="var(--mango)"
          para="/admin/alunos"
          icone={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c.8-3 2.9-4.5 6-4.5S14.2 17 15 20" strokeLinecap="round" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M15 17.5c.5-1.5 1.7-2.3 3.2-2.3 1.4 0 2.5.6 3 1.8" strokeLinecap="round" />
            </svg>
          }
        />
        <CartaoResumo
          titulo="Unidades Disponíveis"
          valor={totalUnidades}
          sub="Unidades nas 9.ª e 12.ª classes"
          corFundo="var(--teal-soft)"
          corIcone="var(--teal)"
          para="/admin/unidades"
          icone={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 20a2.5 2.5 0 0 1 2.5-2.5H19V21H6.5A2.5 2.5 0 0 1 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <CartaoResumo
          titulo="Aulas Gratuitas"
          valor={totalAulasGratuitas}
          sub="Aulas de amostra configuradas"
          corFundo="var(--amber-soft)"
          corIcone="#7A4B0A"
          para="/admin/unidades"
          icone={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M10 9.5v5l4-2.5z" fill="currentColor" stroke="none" />
            </svg>
          }
        />
        <CartaoResumo
          titulo="Pagamentos"
          valor={totalPagamentos}
          sub="Histórico completo"
          corFundo="var(--mango-soft)"
          corIcone="var(--mango)"
          para="/admin/pagamentos"
          icone={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" strokeLinecap="round" />
              <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
            </svg>
          }
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                  Evolução de Acessos
                </h2>
                <p className="text-xs text-[var(--cream-soft)]">Últimos 7 dias</p>
              </div>
              <span className="rounded-full bg-[var(--mango-soft)] px-3 py-1 text-xs font-semibold text-[var(--mango)]">
                7 dias
              </span>
            </div>

            <GraficoAcessos serie={serie} />
          </div>

          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                Atividade Recente
              </h2>
              <Link to="/admin/pagamentos" className="text-xs font-semibold text-[var(--mango)] hover:underline">
                Ver todos
              </Link>
            </div>

            {recentes.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--cream-soft)]">
                Sem atividade de momento.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recentes.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="5.5" width="18" height="13" rx="2" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {p.aluno_nome} pediu acesso
                        </p>
                        <p className="text-xs text-[var(--cream-soft)]">
                          {p.unidade_nome} · {formatarData(p.data)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge estado={p.estado} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm md:p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
              Ações Rápidas
            </h2>
            <div className="mt-4 space-y-2">
              <Link to="/admin/alunos" className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3 20c.8-3 2.9-4.5 6-4.5S14.2 17 15 20" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-semibold text-[var(--ink)]">Gerir Alunos</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--mango)]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link to="/admin/unidades" className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--teal-soft)] text-[var(--teal)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-semibold text-[var(--ink)]">Gerir Unidades</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--mango)]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link to="/admin/pagamentos" className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--amber-soft)] text-[#7A4B0A]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M3 10h18" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-semibold text-[var(--ink)]">Ver Pagamentos</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--mango)]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link to="/admin/configuracoes" className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-black/[0.03]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-semibold text-[var(--ink)]">Configurações</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--mango)]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm md:p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
              Classes em Destaque
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {porClasse.slice(0, 2).map((c, idx) => (
                <Link
                  key={c.id}
                  to="/admin/unidades"
                  className="group flex flex-col items-start justify-between rounded-xl p-4 shadow-sm transition hover:shadow-md"
                  style={{
                    background: idx === 0 ? 'var(--mango-soft)' : '#0B2A5B',
                    color: idx === 0 ? 'var(--mango)' : 'white',
                  }}
                >
                  <p className="font-display text-3xl font-bold leading-none">
                    {c.nome.match(/\d+/)?.[0] || ''}
                    <span className="text-base">ª</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide">Classe</p>
                  <span className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/30">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              ))}
              {porClasse.length === 0 && (
                <p className="col-span-2 text-sm text-[var(--cream-soft)]">
                  A carregar classes…
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}