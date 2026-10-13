import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import MensagemErro from '../../components/MensagemErro';
import Modal from '../../components/admin/Modal';

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

function classesDoAluno(aluno) {
  if (!aluno.historico || aluno.historico.length === 0) return [];
  const nomes = aluno.historico.map((a) => a.unidade_nome || '');
  const set = new Set();
  nomes.forEach((n) => {
    if (/12/.test(n) || /ondas|nuclear|termodinâmica|mecânica/i.test(n)) set.add('12');
    if (/9/.test(n) || /óptica|estática|oscilações|electricidade/i.test(n)) set.add('9');
  });
  return [...set];
}

export default function AdminAlunos() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroClasse, setFiltroClasse] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [apagar, setApagar] = useState(null);
  const [aApagar, setAApagar] = useState(false);

  // Recarrega do servidor sempre que a busca muda (debounce via setTimeout)
  useEffect(() => {
    let cancelado = false;
    setLista(null);

    const timer = setTimeout(() => {
      const url = busca.trim()
        ? `/admin/alunos?busca=${encodeURIComponent(busca.trim())}`
        : '/admin/alunos';

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
  }, [busca]);

  // Filtros aplicados no cliente (rápidos, poucos dados)
  const filtrados = (lista || []).filter((a) => {
    if (filtroClasse !== 'todas') {
      const classes = classesDoAluno(a);
      if (!classes.includes(filtroClasse)) return false;
    }
    if (filtroEstado !== 'todos') {
      const estado = a.estado || 'activo';
      if (estado !== filtroEstado) return false;
    }
    return true;
  });

  const totalAlunos = lista?.length ?? 0;

  async function confirmarApagar() {
    setAApagar(true);
    setErro('');
    try {
      await apiAdmin.del(`/admin/alunos/${apagar.id}`);
      setLista((ls) => (ls || []).filter((a) => a.id !== apagar.id));
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
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 lg:py-14">
          <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
            Gestão de Alunos
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
            Alunos
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
            Visualize, pesquise e gerencie todos os alunos registados na plataforma.
          </p>
        </div>
      </section>

      {erro && (
        <div className="mt-6">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      {/* Barra de ferramentas */}
      <section className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-soft)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome ou WhatsApp…"
            className="campo pl-9"
          />
        </div>

        <select
          value={filtroClasse}
          onChange={(e) => setFiltroClasse(e.target.value)}
          className="campo md:max-w-[180px]"
        >
          <option value="todas">Todas as classes</option>
          <option value="9">9.ª Classe</option>
          <option value="12">12.ª Classe</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="campo md:max-w-[180px]"
        >
          <option value="todos">Todos os estados</option>
          <option value="activo">Activos</option>
          <option value="pendente">Pendentes</option>
        </select>

        <Link
          to="/registo"
          state={{ origem: 'admin' }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--mango)] px-4 py-2.5 text-sm font-semibold text-[var(--mango-ink)] transition hover:brightness-110"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Novo aluno
        </Link>
      </section>

      {/* Grelha principal */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Tabela */}
        <div className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm">
          {lista === null && !erro && (
            <div className="animate-pulse space-y-3 p-5">
              <div className="h-10 rounded-lg bg-black/[0.04]" />
              <div className="h-10 rounded-lg bg-black/[0.04]" />
              <div className="h-10 rounded-lg bg-black/[0.04]" />
            </div>
          )}

          {filtrados.length === 0 && lista !== null && (
            <p className="p-8 text-center text-sm text-[var(--cream-soft)]">
              Nenhum aluno encontrado.
            </p>
          )}

          {filtrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--paper-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-3 py-3 text-left">WhatsApp</th>
                    <th className="px-3 py-3 text-left">Unidades</th>
                    <th className="px-3 py-3 text-left">Registo</th>
                    <th className="px-3 py-3 text-left">Estado</th>
                    <th className="w-16 px-3 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((a) => (
                    <tr key={a.id} className="border-t border-black/5 transition hover:bg-black/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${corAvatar(a.id)}`}
                          >
                            {iniciais(a.nome)}
                          </span>
                          <span className="font-semibold text-[var(--ink)]">{a.nome}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[var(--ink-soft)]">
                        {a.whatsapp}
                      </td>
                      <td className="px-3 py-3 text-[var(--ink-soft)]">
                        {a.historico?.length ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[var(--ink-soft)]">
                        {formatarData(a.data_registo)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge estado={a.estado || 'activo'} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setApagar({ id: a.id, nome: a.nome })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brick)] transition hover:bg-[var(--brick-soft)]"
                          aria-label={`Apagar ${a.nome}`}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Painel lateral */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 20c.8-3 2.9-4.5 6-4.5S14.2 17 15 20" strokeLinecap="round" />
                  <circle cx="17" cy="9" r="2.5" />
                  <path d="M15 17.5c.5-1.5 1.7-2.3 3.2-2.3 1.4 0 2.5.6 3 1.8" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  Total de alunos
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                  {totalAlunos}
                </p>
                <p className="text-xs text-[var(--cream-soft)]">Registados na plataforma</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Modal de confirmação */}
      {apagar && (
        <Modal
          titulo="Apagar aluno"
          aoFechar={() => setApagar(null)}
          aoConfirmar={confirmarApagar}
          textoConfirmar="Apagar"
          aConfirmar={aApagar}
          perigo
        >
          Tem a certeza de que quer apagar "{apagar.nome}"? Isto remove também todo o seu histórico de pedidos.
          Esta ação não pode ser desfeita.
        </Modal>
      )}
    </AdminLayout>
  );
}