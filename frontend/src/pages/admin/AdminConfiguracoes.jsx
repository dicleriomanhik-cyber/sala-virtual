import { useEffect, useRef, useState } from 'react';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import MensagemErro from '../../components/MensagemErro';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ABAS = [
  { id: 'geral', label: 'Geral' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'notificacoes', label: 'Notificações' },
  { id: 'adicionais', label: 'Informações Adicionais' },
  { id: 'conta', label: 'Conta' },
];

export default function AdminConfiguracoes() {
  const [aba, setAba] = useState('geral');

  return (
    <AdminLayout>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/banner-12.png')] bg-cover bg-center opacity-25"
        />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 lg:py-14">
          <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
            Configurações
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
            Configurações da Plataforma
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--cream-soft)] md:text-base">
            Gerencie as informações gerais da plataforma e mantenha tudo atualizado.
          </p>
        </div>
      </section>

      <nav className="mt-8 flex gap-6 overflow-x-auto border-b border-black/10">
        {ABAS.map((a) => (
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

      {aba === 'geral' && <AbaGeral />}
      {aba === 'conta' && <AbaConta />}
      {aba !== 'geral' && aba !== 'conta' && (
        <Placeholder aba={ABAS.find((a) => a.id === aba)?.label} />
      )}
    </AdminLayout>
  );
}

/* ---------- Aba Geral ---------- */

function AbaGeral() {
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const inputLogoRef = useRef(null);

  useEffect(() => {
    apiAdmin
      .get('/admin/config')
      .then(setForm)
      .catch((e) => setErro(e.message));
  }, []);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setSucesso(false);
  }

  async function guardar(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setAGuardar(true);
    try {
      const actualizado = await apiAdmin.put('/admin/config', {
        ...form,
        duracao_acesso_dias: Number(form.duracao_acesso_dias),
      });
      setForm(actualizado);
      setSucesso(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setAGuardar(false);
    }
  }

  function focarLogo() {
    if (inputLogoRef.current) {
      inputLogoRef.current.focus();
      inputLogoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (erro && !form) {
    return (
      <div className="mt-8">
        <MensagemErro>{erro}</MensagemErro>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mt-8 animate-pulse space-y-3">
        <div className="h-24 rounded-2xl bg-black/[0.04]" />
        <div className="h-24 rounded-2xl bg-black/[0.04]" />
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="mt-8">
      <div className="rounded-2xl bg-[var(--paper)] p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
              Informações Gerais
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Atualize os dados principais da plataforma. Essas informações serão exibidas para os utilizadores.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              Nome da Escola / Curso
            </span>
            <input
              required
              value={form.nome_escola || ''}
              onChange={(e) => actualizar('nome_escola', e.target.value)}
              className="campo"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              URL do Logótipo (opcional)
            </span>
            <input
              ref={inputLogoRef}
              value={form.logo_url || ''}
              onChange={(e) => actualizar('logo_url', e.target.value)}
              placeholder="https://exemplo.com/logo.png"
              className="campo"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              WhatsApp de Contacto (com código do país)
            </span>
            <input
              required
              value={form.whatsapp_admin || ''}
              onChange={(e) => actualizar('whatsapp_admin', e.target.value)}
              placeholder="258 84 123 4567"
              inputMode="tel"
              className="campo"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
              Duração do Acesso (dias)
            </span>
            <input
              required
              type="number"
              min="1"
              value={form.duracao_acesso_dias ?? ''}
              onChange={(e) => actualizar('duracao_acesso_dias', e.target.value)}
              className="campo"
            />
          </label>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Fale connosco</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                Morada (opcional)
              </span>
              <input
                value={form.morada || ''}
                onChange={(e) => actualizar('morada', e.target.value)}
                placeholder="Inhambane, Moçambique"
                className="campo"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                Horário de atendimento (opcional)
              </span>
              <input
                value={form.horario || ''}
                onChange={(e) => actualizar('horario', e.target.value)}
                placeholder="Atendimento 24h por dia"
                className="campo"
              />
            </label>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Redes sociais</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                URL do YouTube (opcional)
              </span>
              <input
                type="url"
                value={form.youtube_url || ''}
                onChange={(e) => actualizar('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@canal"
                className="campo"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                URL do Facebook (opcional)
              </span>
              <input
                type="url"
                value={form.facebook_url || ''}
                onChange={(e) => actualizar('facebook_url', e.target.value)}
                placeholder="https://facebook.com/pagina"
                className="campo"
              />
            </label>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
            Logótipo Atual
          </p>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-black/5 bg-[var(--paper-soft)] p-4">
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logótipo" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mango)] font-display text-base font-bold text-[var(--mango-ink)]">
                  FIS
                </span>
              )}
              <div>
                <p className="font-display text-base font-semibold text-[var(--ink)]">
                  {form.nome_escola || 'Segredos da Física'}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--cream-soft)]">
                  Sala Virtual
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={focarLogo}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--mango-soft)] px-3 py-2 text-xs font-semibold text-[var(--mango)] transition hover:brightness-95"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Trocar Logótipo
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--cream-soft)]">
            Formato recomendado: PNG ou JPG. Tamanho máximo: 2 MB.
          </p>
        </div>

        {sucesso && (
          <div
            className="mt-6 rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
            role="status"
          >
            Configurações guardadas.
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={aGuardar}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--mango)] px-5 py-3 text-sm font-semibold text-[var(--mango-ink)] transition hover:brightness-110 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 4v5h8V4M8 14h8v6H8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {aGuardar ? 'A guardar…' : 'Guardar Alterações'}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ---------- Aba Conta ---------- */

function AbaConta() {
  const { admin, setAdmin } = useAdminAuth();
  const [username, setUsername] = useState(admin?.username || '');
  const [passwordAtual, setPasswordAtual] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [verNova, setVerNova] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [verAtual, setVerAtual] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (novaPassword && novaPassword.length < 8) {
      setErro('A nova palavra-passe deve ter, no mínimo, 8 caracteres.');
      return;
    }
    if (novaPassword && novaPassword !== confirmarPassword) {
      setErro('A nova palavra-passe e a confirmação não coincidem.');
      return;
    }

    setAGuardar(true);
    try {
      const resposta = await apiAdmin.put('/admin/me', {
        passwordAtual,
        novoUsername: username,
        novaPassword: novaPassword || undefined,
      });
      setAdmin?.(resposta.admin);
      setSucesso(true);
      setPasswordAtual('');
      setNovaPassword('');
      setConfirmarPassword('');
    } catch (e) {
      setErro(e.message);
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={guardar}>
        <div className="rounded-2xl bg-[var(--paper)] p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
                Alterar Dados da Conta
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Atualize o seu nome de utilizador e palavra-passe de administrador.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Nome de Utilizador</p>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  Novo nome de utilizador
                </span>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="campo"
                />
              </label>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Palavra-passe</p>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  Palavra-passe actual (obrigatória)
                </span>
                <div className="relative">
                  <input
                    required
                    type={verAtual ? 'text' : 'password'}
                    value={passwordAtual}
                    onChange={(e) => setPasswordAtual(e.target.value)}
                    placeholder="••••••••"
                    className="campo pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setVerAtual(!verAtual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cream-soft)] transition hover:text-[var(--ink)]"
                    aria-label={verAtual ? 'Ocultar' : 'Mostrar'}
                  >
                    <IconeOlho aberto={verAtual} />
                  </button>
                </div>
              </label>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  Nova palavra-passe
                </span>
                <div className="relative">
                  <input
                    type={verNova ? 'text' : 'password'}
                    value={novaPassword}
                    onChange={(e) => setNovaPassword(e.target.value)}
                    placeholder="Digite a nova palavra-passe"
                    className="campo pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setVerNova(!verNova)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cream-soft)] transition hover:text-[var(--ink)]"
                    aria-label={verNova ? 'Ocultar' : 'Mostrar'}
                  >
                    <IconeOlho aberto={verNova} />
                  </button>
                </div>
                <span className="mt-1.5 block text-xs text-[var(--cream-soft)]">
                  A palavra-passe deve ter, no mínimo, 8 caracteres.
                </span>
              </label>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--cream-soft)]">
                  Confirmar nova palavra-passe
                </span>
                <div className="relative">
                  <input
                    type={verConfirmar ? 'text' : 'password'}
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Confirme a nova palavra-passe"
                    className="campo pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setVerConfirmar(!verConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cream-soft)] transition hover:text-[var(--ink)]"
                    aria-label={verConfirmar ? 'Ocultar' : 'Mostrar'}
                  >
                    <IconeOlho aberto={verConfirmar} />
                  </button>
                </div>
              </label>
            </div>
          </div>

          {erro && (
            <div className="mt-6">
              <MensagemErro>{erro}</MensagemErro>
            </div>
          )}

          {sucesso && (
            <div
              className="mt-6 rounded-lg px-3 py-2 text-sm"
              style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
              role="status"
            >
              Dados da conta atualizados.
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={aGuardar}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--mango)] px-5 py-3 text-sm font-semibold text-[var(--mango-ink)] transition hover:brightness-110 disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4.5" y="10" width="15" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
              </svg>
              {aGuardar ? 'A guardar…' : 'Guardar Alterações'}
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-[var(--paper)] p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3 4 6v5c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-3Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
                Segurança da Conta
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Mantenha as suas credenciais seguras e não partilhe a sua conta com outras pessoas.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <CartaoSeguranca
              titulo="Palavra-passe forte"
              texto="Use uma combinação de letras, números e símbolos."
              icone="lock"
            />
            <CartaoSeguranca
              titulo="Acesso restrito"
              texto="Apenas o administrador tem acesso a esta área."
              icone="escudo"
            />
            <CartaoSeguranca
              titulo="Em caso de problemas"
              texto="Se não conseguir aceder à sua conta, contacte o suporte do sistema."
              icone="info"
            />
          </div>
        </div>

        <CartaoChaveRecuperacao />
      </aside>
    </div>
  );
}

/* ---------- Auxiliares ---------- */

function CartaoSeguranca({ titulo, texto, icone }) {
  return (
    <div className="rounded-xl border border-black/5 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
          <Icone nome={icone} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">{titulo}</p>
          <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{texto}</p>
        </div>
      </div>
    </div>
  );
}

function CartaoChaveRecuperacao() {
  const [chave, setChave] = useState(null);
  const [temChave, setTemChave] = useState(null);
  const [aGerar, setAGerar] = useState(false);
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    apiAdmin
      .get('/admin/me/tem-chave-recuperacao')
      .then((r) => setTemChave(r.tem_chave))
      .catch(() => setTemChave(null));
  }, []);

  async function gerar() {
    if (!confirm('Isto vai invalidar a chave actual (se existir). Continuar?')) return;
    setAGerar(true);
    setErro('');
    setChave(null);
    setCopiado(false);
    try {
      const r = await apiAdmin.post('/admin/me/gerar-chave-recuperacao');
      setChave(r.recovery_key);
      setTemChave(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setAGerar(false);
    }
  }

  async function copiar() {
    if (!chave) return;
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // ignora
    }
  }

  return (
    <div className="rounded-2xl bg-[var(--paper)] p-5 shadow-sm md:p-6">
      <h3 className="font-display text-base font-semibold text-[var(--ink)]">
        Chave de recuperação
      </h3>
      <p className="mt-1 text-xs text-[var(--ink-soft)]">
        Se esquecer a password, esta chave permite-lhe recuperar o acesso. Guarde-a em local seguro.
      </p>

      {erro && (
        <div className="mt-4">
          <MensagemErro>{erro}</MensagemErro>
        </div>
      )}

      {chave ? (
        <div className="mt-4 rounded-xl border border-[var(--amber-soft)] bg-[var(--amber-soft)]/40 p-4">
          <p className="text-xs font-semibold text-[#7A4B0A]">
            Guarde esta chave agora. Não será mostrada novamente.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <p className="flex-1 break-all font-mono-ref text-sm font-semibold text-[var(--ink)]">
              {chave}
            </p>
            <button
              type="button"
              onClick={copiar}
              aria-label="Copiar chave"
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                copiado
                  ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
                  : 'bg-[var(--mango-soft)] text-[var(--mango)] hover:brightness-95'
              }`}
            >
              {copiado ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="9" y="9" width="12" height="12" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-xs text-[var(--ink-soft)]">
            {temChave === false
              ? 'Sem chave de recuperação configurada.'
              : 'A chave actual está definida, mas não pode ser visualizada.'}
          </p>
          <button
            type="button"
            onClick={gerar}
            disabled={aGerar}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--mango-soft)] px-3 py-2 text-xs font-semibold text-[var(--mango)] transition hover:brightness-95 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {aGerar ? 'A gerar…' : temChave ? 'Gerar nova chave' : 'Gerar chave'}
          </button>
        </div>
      )}
    </div>
  );
}

function IconeOlho({ aberto }) {
  if (aberto) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3 3 18 18" strokeLinecap="round" />
    </svg>
  );
}

function Icone({ nome }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, className: 'h-4 w-4' };

  if (nome === 'lock') {
    return (
      <svg {...props}>
        <rect x="4.5" y="10" width="15" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </svg>
    );
  }
  if (nome === 'escudo') {
    return (
      <svg {...props}>
        <path d="M12 3 4 6v5c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-3Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (nome === 'info') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v5h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

function Placeholder({ aba }) {
  return (
    <div className="mt-8 rounded-2xl bg-[var(--paper)] p-10 text-center shadow-sm">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mango-soft)] text-[var(--mango)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
        </svg>
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-[var(--ink)]">
        {aba} — brevemente disponível
      </h2>
      <p className="mt-2 text-sm text-[var(--cream-soft)]">
        Esta secção será activada numa próxima fase, após actualização do backend.
      </p>
    </div>
  );
}