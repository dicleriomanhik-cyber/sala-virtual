import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import MensagemErro from '../../components/MensagemErro';
import Modal from '../../components/admin/Modal';

const POR_PAGINA = 8;

function estadoUnidade(u) {
  if (u.ativo === false) return 'inativa';
  return 'activa';
}

export default function AdminUnidades() {
  const [classes, setClasses] = useState(null);
  const [unidades, setUnidades] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroClasse, setFiltroClasse] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [apagar, setApagar] = useState(null);
  const [aApagar, setAApagar] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const cs = await apiAdmin.get('/admin/classes');
        if (!activo) return;
        setClasses(cs);

        const listas = await Promise.all(
          (cs || []).map((c) =>
            apiAdmin
              .get(`/admin/unidades?classe_id=${c.id}`)
              .then((us) => us.map((u) => ({ ...u, classe_id: c.id, classe_nome: c.nome })))
              .catch(() => [])
          )
        );
        if (!activo) return;
        setUnidades(listas.flat());
      } catch (e) {
        if (activo) setErro(e.message);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busca, filtroClasse, filtroEstado]);

  const filtradas = useMemo(() => {
    if (!unidades) return [];
    const alvo = busca.trim().toLowerCase();
    return unidades.filter((u) => {
      if (alvo && !u.nome?.toLowerCase().includes(alvo)) return false;
      if (filtroClasse !== 'todas' && String(u.classe_id) !== filtroClasse) return false;
      if (filtroEstado !== 'todos') {
        const est = estadoUnidade(u);
        if (est !== filtroEstado) return false;
      }
      return true;
    });
  }, [unidades, busca, filtroClasse, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil((filtradas?.length || 0) / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const fim = inicio + POR_PAGINA;
  const paginaActual = filtradas.slice(inicio, fim);

  const total = unidades?.length ?? 0;
  const activas = unidades?.filter((u) => estadoUnidade(u) === 'activa').length ?? 0;
  const inativas = unidades?.filter((u) => estadoUnidade(u) === 'inativa').length ?? 0;

  async function confirmarApagar() {
    setAApagar(true);
    setErro('');
    try {
      await apiAdmin.del(`/admin/unidades/${apagar.id}`);
      setUnidades((ls) => ls.filter((u) => u.id !== apagar.id));
      setApagar(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setAApagar(false);
    }
  }

  return (
    <AdminLayout>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/banner-12.png')] bg-cover bg-center opacity-25"
        />
        <div className="relative z-10 flex flex-col gap-4 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-10 md:py-12">
          <div>
            <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
              Gestão de Unidades
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
              Unidades
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
              Gerencie as unidades de estudo disponíveis para os alunos.
            </p>
          </div>
        </div>
      </section>

      {erro && (
        <div className="mt-6">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      <section className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-soft)]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome da unidade…"
            className="campo pl-9"
          />
        </div>

        <select value={filtroClasse} onChange={(e) => setFiltroClasse(e.target.value)} className="campo md:max-w-[180px]">
          <option value="todas">Todas as classes</option>
          {classes?.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nome}
            </option>
          ))}
        </select>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="campo md:max-w-[180px]">
          <option value="todos">Todos os estados</option>
          <option value="activa">Ativas</option>
          <option value="inativa">Inativas</option>
        </select>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm">
          {unidades === null && !erro && (
            <div className="animate-pulse space-y-3 p-5">
              <div className="h-10 rounded-lg bg-black/[0.04]" />
              <div className="h-10 rounded-lg bg-black/[0.04]" />
              <div className="h-10 rounded-lg bg-black/[0.04]" />
            </div>
          )}

          {unidades !== null && filtradas.length === 0 && (
            <p className="p-8 text-center text-sm text-[var(--cream-soft)]">
              Nenhuma unidade encontrada.
            </p>
          )}

          {paginaActual.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--paper-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Unidade</th>
                    <th className="px-3 py-3 text-left">Classe</th>
                    <th className="px-3 py-3 text-left">Preço</th>
                    <th className="px-3 py-3 text-left">Estado</th>
                    <th className="w-24 px-3 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginaActual.map((u) => (
                    <tr key={u.id} className="border-t border-black/5 transition hover:bg-black/[0.02]">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/unidades/${u.id}`}
                          className="block font-semibold text-[var(--ink)] hover:text-[var(--mango)] hover:underline"
                        >
                          {u.nome}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-[var(--ink-soft)]">
                        {u.classe_nome?.match(/\d+/)?.[0] || '—'}
                        {u.classe_nome ? '.ª' : ''}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[var(--ink-soft)]">
                        {u.preco} MT
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge estado={u.ativo === false ? 'expirado' : 'pago'} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/unidades/${u.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--mango)] transition hover:bg-[var(--mango-soft)]"
                            aria-label={`Editar ${u.nome}`}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setApagar({ id: u.id, nome: u.nome })}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brick)] transition hover:bg-[var(--brick-soft)]"
                            aria-label={`Apagar ${u.nome}`}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtradas.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-black/5 px-5 py-4 sm:flex-row">
              <p className="text-xs text-[var(--cream-soft)]">
                Mostrando {inicio + 1}–{Math.min(fim, filtradas.length)} de {filtradas.length} unidades
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="rounded-lg border border-black/10 px-2.5 py-1 text-sm font-semibold text-[var(--cream-soft)] transition hover:bg-black/[0.04] disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalPaginas }).slice(0, 5).map((_, i) => {
                  const num = i + 1;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPagina(num)}
                      className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm font-semibold transition ${
                        pagina === num
                          ? 'bg-[var(--mango)] text-[var(--mango-ink)]'
                          : 'text-[var(--cream-soft)] hover:bg-black/[0.04]'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
                {totalPaginas > 5 && <span className="px-1 text-[var(--cream-soft)]">…</span>}
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="rounded-lg border border-black/10 px-2.5 py-1 text-sm font-semibold text-[var(--cream-soft)] transition hover:bg-black/[0.04] disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold text-[var(--ink)]">
              Resumo das Unidades
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResumoMini label="Total" valor={total} cor="var(--mango-soft)" iconColor="var(--mango)" />
              <ResumoMini label="Ativas" valor={activas} cor="var(--teal-soft)" iconColor="var(--teal)" />
              <ResumoMini label="Inativas" valor={inativas} cor="var(--brick-soft)" iconColor="var(--brick)" />
            </div>
          </div>
        </aside>
      </section>

      {apagar && (
        <Modal
          titulo="Apagar unidade"
          aoFechar={() => setApagar(null)}
          aoConfirmar={confirmarApagar}
          textoConfirmar="Apagar"
          aConfirmar={aApagar}
          perigo
        >
          Tem a certeza de que quer apagar "{apagar.nome}"? Isto pode afetar os temas e acessos associados.
          Esta ação não pode ser desfeita.
        </Modal>
      )}
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