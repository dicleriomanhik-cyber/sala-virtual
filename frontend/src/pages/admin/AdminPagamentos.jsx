import { useEffect, useState } from 'react';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import MensagemErro from '../../components/MensagemErro';

const FILTROS = [
  { valor: '', label: 'Todos' },
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'pago', label: 'Pagos' },
  { valor: 'expirado', label: 'Expirados' },
  { valor: 'rejeitado', label: 'Rejeitados' },
];

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const a = partes[0]?.[0] || '';
  const b = partes[1]?.[0] || '';
  return (a + b).toUpperCase();
}

const CORES_AVATAR = [
  'bg-[var(--mango)] text-white',
  'bg-[var(--teal)] text-white',
  'bg-[var(--brick)] text-white',
  'bg-[#6D28D9] text-white',
  'bg-[#0369A1] text-white',
];

function corAvatar(id) {
  return CORES_AVATAR[Number(id) % CORES_AVATAR.length];
}

export default function AdminPagamentos() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Carrega do servidor sempre que busca ou estado mudam (debounce 300ms)
  useEffect(() => {
    let cancelado = false;
    setLista(null);

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (busca.trim()) params.append('busca', busca.trim());
      const qs = params.toString();
      const url = qs ? `/admin/acessos?${qs}` : '/admin/acessos';

      apiAdmin
        .get(url)
        .then((dados) => {
          if (!cancelado) setLista(dados);
        })
        .catch((e) => {
          if (!cancelado) setErro(e.message);
        });
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busca, filtroEstado]);

  // Contagens a partir de todos os acessos (carregados com filtro vazio)
  const [todos, setTodos] = useState(null);

  useEffect(() => {
    apiAdmin
      .get('/admin/acessos')
      .then(setTodos)
      .catch(() => setTodos([]));
  }, []);

  const total = todos?.length ?? 0;
  const aprovados = todos?.filter((p) => (p.estado_visivel || p.estado) === 'pago').length ?? 0;
  const pendentes = todos?.filter((p) => (p.estado_visivel || p.estado) === 'pendente').length ?? 0;
  const recusados = todos?.filter((p) => (p.estado_visivel || p.estado) === 'rejeitado').length ?? 0;

  return (
    <AdminLayout>
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/banner-12.png')] bg-cover bg-center opacity-25"
        />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 lg:py-14">
          <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
            Gestão de Pagamentos
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
            Pagamentos
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
            Acompanhe e gerencie todos os pagamentos realizados na plataforma.
          </p>
        </div>
      </section>

      {erro && (
        <div className="mt-6">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      {/* Barra de pesquisa */}
      <section className="mt-6">
        <div className="relative">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-soft)]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por aluno, unidade ou referência…"
            className="campo pl-9"
          />
        </div>
      </section>

      {/* Grelha principal */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Tabela */}
        <div className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm">
          {lista === null && !erro && (
            <div className="animate-pulse space-y-3 p-5">
              <div className="h-10 rounded-lg bg-black/[0.04]" />
              <div className="h-10 rounded-lg bg-black/[0.04]" />
              <div className="h-10 rounded-lg bg-black/[0.04]" />
            </div>
          )}

          {lista !== null && lista.length === 0 && (
            <p className="p-8 text-center text-sm text-[var(--cream-soft)]">
              Nenhum pagamento encontrado.
            </p>
          )}

          {lista !== null && lista.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--paper-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-3 py-3 text-left">Aluno</th>
                    <th className="px-3 py-3 text-left">Unidade</th>
                    <th className="px-3 py-3 text-left">Valor (MT)</th>
                    <th className="px-3 py-3 text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((p) => {
                    const estado = p.estado_visivel || p.estado;
                    return (
                      <tr key={p.id} className="border-t border-black/5 transition hover:bg-black/[0.02]">
                        <td className="whitespace-nowrap px-4 py-3 text-[var(--ink-soft)]">
                          {formatarData(p.data_pedido)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${corAvatar(p.id)}`}
                            >
                              {iniciais(p.aluno_nome)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--ink)]">{p.aluno_nome}</p>
                              <p className="text-xs text-[var(--cream-soft)]">{p.aluno_whatsapp}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-[var(--ink)]">{p.unidade_nome}</p>
                          {p.classe_nome && (
                            <p className="text-xs text-[var(--cream-soft)]">{p.classe_nome}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[var(--ink)]">
                          {p.unidade_preco} MT
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge estado={estado} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Painel lateral */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold text-[var(--ink)]">
              Resumo de Pagamentos
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResumoMini label="Total" valor={total} cor="var(--mango-soft)" iconColor="var(--mango)" />
              <ResumoMini label="Aprovados" valor={aprovados} cor="var(--teal-soft)" iconColor="var(--teal)" />
              <ResumoMini label="Pendentes" valor={pendentes} cor="var(--amber-soft)" iconColor="#7A4B0A" />
              <ResumoMini label="Recusados" valor={recusados} cor="var(--brick-soft)" iconColor="var(--brick)" />
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold text-[var(--ink)]">
              Filtrar por estado
            </h3>
            <div className="mt-4 space-y-1.5">
              {FILTROS.map((f) => (
                <button
                  key={f.valor}
                  type="button"
                  onClick={() => setFiltroEstado(f.valor)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    filtroEstado === f.valor
                      ? 'bg-[var(--mango)] text-[var(--mango-ink)]'
                      : 'text-[var(--cream-soft)] hover:bg-black/[0.04]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </AdminLayout>
  );
}

function ResumoMini({ label, valor, cor, iconColor }) {
  return (
    <div className="rounded-xl p-3" style={{ background: cor, color: iconColor }}>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ opacity: 0.7 }}>
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold">{valor}</p>
    </div>
  );
}