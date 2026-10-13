import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import MensagemErro from '../../components/MensagemErro';

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
            <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
              Temas da Unidade
            </h2>
            <p className="mt-1 text-xs text-[var(--cream-soft)]">
              Acesse os temas para assistir aos vídeos e estudar o conteúdo.
            </p>
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
                {t.link_youtube ? (
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
                ) : (
                  <span className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--cream-soft)] sm:inline-flex">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="4.5" y="10" width="15" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                    </svg>
                    Bloqueado
                  </span>
                )}
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
    </AdminLayout>
  );
}