import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import MensagemErro from '../../components/MensagemErro';
import Modal from '../../components/admin/Modal';

function estadoTema(t) {
  return t.link_youtube ? 'disponivel' : 'em-breve';
}

export default function AdminUnidadeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unidade, setUnidade] = useState(null);
  const [classeNome, setClasseNome] = useState('');
  const [temas, setTemas] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [temaEditar, setTemaEditar] = useState(null);
  const [temaApagar, setTemaApagar] = useState(null);
  const [aApagar, setAApagar] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const classes = await apiAdmin.get('/admin/classes');
      let unidadeEncontrada = null;
      for (const c of classes) {
        const lista = await apiAdmin.get(`/admin/unidades?classe_id=${c.id}`).catch(() => []);
        const encontrada = lista.find((u) => String(u.id) === String(id));
        if (encontrada) {
          unidadeEncontrada = encontrada;
          setClasseNome(c.nome);
          break;
        }
      }
      if (!unidadeEncontrada) {
        setErro('Unidade não encontrada.');
        return;
      }
      setUnidade(unidadeEncontrada);

      const ts = await apiAdmin.get(`/admin/temas?unidade_id=${id}`).catch(() => []);
      setTemas(ts);
    } catch (e) {
      setErro(e.message);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function guardarTema(dados) {
    setErro('');
    try {
      if (temaEditar?.id) {
        await apiAdmin.put(`/admin/temas/${temaEditar.id}`, dados);
      } else {
        await apiAdmin.post('/admin/temas', { ...dados, unidade_id: Number(id) });
      }
      setTemaEditar(null);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function confirmarApagarTema() {
    setAApagar(true);
    try {
      await apiAdmin.del(`/admin/temas/${temaApagar.id}`);
      setTemaApagar(null);
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setAApagar(false);
    }
  }

  const temasFiltrados = (temas || []).filter((t) =>
    t.nome?.toLowerCase().includes(busca.trim().toLowerCase())
  );

  const imagemBanner = classeNome?.includes('9')
    ? '/images/banner-9.png'
    : '/images/banner-12.png';

  const classeCurta = classeNome?.match(/\d+/)?.[0];

  return (
    <AdminLayout>
      <button
        type="button"
        onClick={() => navigate('/admin/unidades')}
        className="mb-4 inline-flex text-sm font-medium text-[var(--mango)] transition hover:underline"
      >
        Voltar
      </button>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${imagemBanner})` }}
        />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 lg:py-14">
          <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
            Unidade
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
            {unidade?.nome || '—'}
          </h1>
          {unidade?.descricao && (
            <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
              {unidade.descricao}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {classeCurta && (
              <span className="rounded-full bg-[var(--mango-soft)] px-3 py-1 text-xs font-semibold text-[var(--mango)]">
                {classeCurta}.ª Classe
              </span>
            )}
            {temas !== null && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--cream)]">
                {temas.length} tema{temas.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      </section>

      {erro && (
        <div className="mt-6">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm">
          <div className="border-b border-black/5 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                  Temas da Unidade
                </h2>
                <p className="mt-1 text-xs text-[var(--cream-soft)]">
                  Acesse os temas para assistir aos vídeos e editar o conteúdo.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTemaEditar({
                    nome: '',
                    link_youtube: '',
                    descricao: '',
                    miniatura_url: '',
                    ordem: temas?.length ?? 0,
                    ativo: true,
                  })
                }
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--mango)] px-3 py-2 text-xs font-semibold text-[var(--mango-ink)] transition hover:brightness-110"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Novo tema
              </button>
            </div>
            <div className="relative mt-4">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-soft)]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar temas desta unidade…"
                className="campo pl-9"
              />
            </div>
          </div>

          {temas === null && (
            <div className="animate-pulse space-y-3 p-5">
              <div className="h-14 rounded-lg bg-black/[0.04]" />
              <div className="h-14 rounded-lg bg-black/[0.04]" />
              <div className="h-14 rounded-lg bg-black/[0.04]" />
            </div>
          )}

          {temas !== null && temasFiltrados.length === 0 && (
            <p className="p-8 text-center text-sm text-[var(--cream-soft)]">
              Sem temas nesta unidade.
            </p>
          )}

          {temasFiltrados.map((t, i) => {
            const estado = estadoTema(t);
            return (
              <div
                key={t.id}
                className="flex items-center gap-4 border-t border-black/5 px-5 py-4"
              >
                {t.miniatura_url ? (
                  <img
                    src={t.miniatura_url}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mango-soft)] text-sm font-bold text-[var(--mango)]">
                    {i + 1}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--ink)]">{t.nome}</p>
                  {t.descricao && (
                    <p className="mt-0.5 text-xs text-[var(--cream-soft)]">{t.descricao}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    estado === 'disponivel'
                      ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
                      : 'bg-[var(--amber-soft)] text-[#7A4B0A]'
                  }`}
                >
                  {estado === 'disponivel' ? 'Disponível' : 'Em breve'}
                </span>
                {t.link_youtube && (
                  <a
                    href={t.link_youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-[var(--mango)] px-3 py-1.5 text-xs font-semibold text-[var(--mango-ink)] transition hover:brightness-110 sm:inline-flex"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Assistir
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setTemaEditar(t)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--mango)] transition hover:bg-[var(--mango-soft)]"
                  aria-label={`Editar ${t.nome}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setTemaApagar({ id: t.id, nome: t.nome })}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--brick)] transition hover:bg-[var(--brick-soft)]"
                  aria-label={`Apagar ${t.nome}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm md:p-6">
            <h3 className="font-display text-base font-semibold text-[var(--ink)]">
              Resumo da Unidade
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--cream-soft)]">Classe</span>
                <span className="font-semibold text-[var(--ink)]">
                  {classeCurta ? `${classeCurta}.ª Classe` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--cream-soft)]">Temas</span>
                <span className="font-semibold text-[var(--ink)]">
                  {temas?.length ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--cream-soft)]">Preço</span>
                <span className="font-semibold text-[var(--ink)]">
                  {unidade?.preco ? `${unidade.preco} MT` : '—'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {temaEditar && (
        <ModalTema
          tema={temaEditar}
          aoFechar={() => setTemaEditar(null)}
          aoGuardar={guardarTema}
        />
      )}

      {temaApagar && (
        <Modal
          titulo="Apagar tema"
          aoFechar={() => setTemaApagar(null)}
          aoConfirmar={confirmarApagarTema}
          textoConfirmar="Apagar"
          aConfirmar={aApagar}
          perigo
        >
          Tem a certeza de que quer apagar "{temaApagar.nome}"? Esta ação não pode ser desfeita.
        </Modal>
      )}
    </AdminLayout>
  );
}

function ModalTema({ tema, aoFechar, aoGuardar }) {
  const [nome, setNome] = useState(tema.nome || '');
  const [link, setLink] = useState(tema.link_youtube || '');
  const [descricao, setDescricao] = useState(tema.descricao || '');
  const [miniatura, setMiniatura] = useState(tema.miniatura_url || '');
  const [ordem, setOrdem] = useState(tema.ordem ?? 0);
  const [ativo, setAtivo] = useState(tema.ativo !== false && tema.ativo !== 0);
  const [aGuardar, setAGuardar] = useState(false);

  async function submeter(e) {
    e.preventDefault();
    setAGuardar(true);
    try {
      await aoGuardar({
        nome,
        link_youtube: link || null,
        descricao: descricao || null,
        miniatura_url: miniatura || null,
        ordem: Number(ordem) || 0,
        ativo,
      });
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:items-center"
      onClick={aoFechar}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submeter}
        className="w-full max-w-lg space-y-4 rounded-2xl bg-[var(--paper)] p-6"
      >
        <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
          {tema.id ? 'Editar tema' : 'Novo tema'}
        </h2>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            Nome do tema
          </span>
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className="campo" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            Link do YouTube
          </span>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            className="campo"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            Descrição curta (opcional)
          </span>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Conceitos básicos e grandezas físicas"
            className="campo"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            URL da miniatura (opcional)
          </span>
          <input
            type="url"
            value={miniatura}
            onChange={(e) => setMiniatura(e.target.value)}
            placeholder="https://…/miniatura.png"
            className="campo"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              Ordem
            </span>
            <input
              type="number"
              min="0"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              className="campo"
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-[var(--ink)]">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 accent-[var(--mango)]"
            />
            Activo
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={aoFechar}
            className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold text-[var(--cream-soft)] transition hover:bg-black/[0.04]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={aGuardar}
            className="flex-1 rounded-full bg-[#0B2A5B] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {aGuardar ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}