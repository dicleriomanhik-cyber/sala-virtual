import { useEffect, useState } from 'react';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import MensagemErro from '../../components/MensagemErro';
import Modal from '../../components/admin/Modal';

const CLASSE_OPCOES = ['9.ª Classe', '12.ª Classe'];

export default function AdminAulasGratuitas() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [editar, setEditar] = useState(null);
  const [apagar, setApagar] = useState(null);
  const [aApagar, setAApagar] = useState(false);

  async function carregar() {
    try {
      const aulas = await apiAdmin.get('/admin/aulas-gratuitas');
      setLista(aulas);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function guardar(dados) {
    setErro('');
    try {
      if (editar?.id) {
        await apiAdmin.put(`/admin/aulas-gratuitas/${editar.id}`, dados);
      } else {
        await apiAdmin.post('/admin/aulas-gratuitas', dados);
      }
      setEditar(null);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function confirmarApagar() {
    setAApagar(true);
    try {
      await apiAdmin.del(`/admin/aulas-gratuitas/${apagar.id}`);
      setApagar(null);
      carregar();
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
              Gestão de Conteúdo
            </span>
            <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
              Aulas Gratuitas
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
              Gerencie as aulas de amostra que aparecem publicamente na página inicial.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditar({ titulo: '', classe: '', disciplina: 'Física', link_youtube: '', imagem_url: '', ordem: 0, ativo: true })}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[var(--mango)] px-4 py-2.5 text-sm font-semibold text-[var(--mango-ink)] transition hover:brightness-110"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Nova aula
          </button>
        </div>
      </section>

      {erro && (
        <div className="mt-6">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm">
        {lista === null && !erro && (
          <div className="animate-pulse space-y-3 p-5">
            <div className="h-14 rounded-lg bg-black/[0.04]" />
            <div className="h-14 rounded-lg bg-black/[0.04]" />
          </div>
        )}

        {lista !== null && lista.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--cream-soft)]">
            Ainda não há aulas gratuitas. Clica em "Nova aula" para criar.
          </p>
        )}

        {lista !== null && lista.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--paper-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                <tr>
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-3 py-3 text-left">Classe</th>
                  <th className="px-3 py-3 text-left">Disciplina</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="w-24 px-3 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((a) => (
                  <tr key={a.id} className="border-t border-black/5 transition hover:bg-black/[0.02]">
                    <td className="px-4 py-3 font-semibold text-[var(--ink)]">
                      {a.titulo}
                    </td>
                    <td className="px-3 py-3 text-[var(--ink-soft)]">{a.classe || '—'}</td>
                    <td className="px-3 py-3 text-[var(--ink-soft)]">{a.disciplina || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.ativo ? 'bg-[var(--teal-soft)] text-[var(--teal)]' : 'bg-[var(--brick-soft)] text-[var(--brick)]'}`}>
                        {a.ativo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditar(a)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--mango)] transition hover:bg-[var(--mango-soft)]"
                          aria-label={`Editar ${a.titulo}`}
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setApagar({ id: a.id, titulo: a.titulo })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brick)] transition hover:bg-[var(--brick-soft)]"
                          aria-label={`Apagar ${a.titulo}`}
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
      </section>

      {editar && (
        <ModalAula
          aula={editar}
          aoFechar={() => setEditar(null)}
          aoGuardar={guardar}
        />
      )}

      {apagar && (
        <Modal
          titulo="Apagar aula"
          aoFechar={() => setApagar(null)}
          aoConfirmar={confirmarApagar}
          textoConfirmar="Apagar"
          aConfirmar={aApagar}
          perigo
        >
          Tem a certeza de que quer apagar "{apagar.titulo}"? Esta ação não pode ser desfeita.
        </Modal>
      )}
    </AdminLayout>
  );
}

function ModalAula({ aula, aoFechar, aoGuardar }) {
  const [titulo, setTitulo] = useState(aula.titulo || '');
  const [classe, setClasse] = useState(aula.classe || '');
  const [disciplina, setDisciplina] = useState(aula.disciplina || 'Física');
  const [link, setLink] = useState(aula.link_youtube || '');
  const [imagem, setImagem] = useState(aula.imagem_url || '');
  const [ordem, setOrdem] = useState(aula.ordem ?? 0);
  const [ativo, setAtivo] = useState(aula.ativo !== false && aula.ativo !== 0);
  const [aGuardar, setAGuardar] = useState(false);

  async function submeter(e) {
    e.preventDefault();
    setAGuardar(true);
    try {
      await aoGuardar({
        titulo,
        classe: classe || null,
        disciplina: disciplina || null,
        link_youtube: link || null,
        imagem_url: imagem || null,
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
          {aula.id ? 'Editar aula' : 'Nova aula gratuita'}
        </h2>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            Título
          </span>
          <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="campo" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              Classe
            </span>
            <select value={classe} onChange={(e) => setClasse(e.target.value)} className="campo">
              <option value="">—</option>
              {CLASSE_OPCOES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              Disciplina
            </span>
            <input value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="campo" />
          </label>
        </div>

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
            URL da imagem/miniatura (opcional)
          </span>
          <input
            type="text"
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            placeholder="/images/aula-1.png ou https://…/imagem.png"
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
            Activa
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