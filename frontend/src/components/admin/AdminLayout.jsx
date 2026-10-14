import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { apiAdmin } from '../../api/client';

const ABAS = [
  { to: '/admin/dashboard', label: 'Painel Principal' },
  { to: '/admin/pagamentos', label: 'Pagamentos' },
  { to: '/admin/configuracoes', label: 'Configurações' },
];

const CHAVE_LIDAS = 'admin:notificacoes-lidas';

function tempoRelativo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

function lerIdsLidas() {
  try {
    const raw = localStorage.getItem(CHAVE_LIDAS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function guardarIdsLidas(ids) {
  try {
    localStorage.setItem(CHAVE_LIDAS, JSON.stringify([...ids]));
  } catch {
    // ignora
  }
}

export default function AdminLayout({ children }) {
  const config = useConfig();
  const { sair } = useAdminAuth();
  const navigate = useNavigate();

  const [notificacoes, setNotificacoes] = useState([]);
  const [idsLidas, setIdsLidas] = useState(() => lerIdsLidas());
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    apiAdmin
      .get('/admin/notificacoes')
      .then(setNotificacoes)
      .catch(() => setNotificacoes([]));
  }, []);

  useEffect(() => {
    function aoClicarFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  // Marca todas as notificações actuais como lidas ao abrir o dropdown
  function alternarDropdown() {
    const vaiAbrir = !dropdownAberto;
    setDropdownAberto(vaiAbrir);

    if (vaiAbrir && notificacoes.length > 0) {
      const novasLidas = new Set(idsLidas);
      notificacoes.forEach((n) => novasLidas.add(n.id));
      setIdsLidas(novasLidas);
      guardarIdsLidas(novasLidas);
    }
  }

  function aoSair() {
    sair();
    navigate('/admin/entrar', { replace: true });
  }

  const naoLidas = notificacoes.filter((n) => !idsLidas.has(n.id)).length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B2A5B] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6 md:py-4">
          <Link to="/admin/dashboard" className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold md:text-lg">
              {config?.nome_escola || 'Segredos da Física'}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/60">
              Sala Virtual
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Secções do painel">
            {ABAS.map((aba) => (
              <NavLink
                key={aba.to}
                to={aba.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {aba.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden text-sm text-white/70 lg:inline">
              Olá, Administrador
            </span>

            {/* Sino de notificações */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={alternarDropdown}
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10"
                aria-label="Notificações"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
                </svg>
                {naoLidas > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brick)] px-1 text-[10px] font-bold text-white">
                    {naoLidas > 9 ? '9+' : naoLidas}
                  </span>
                )}
              </button>

              {dropdownAberto && (
                <div className="fixed inset-x-4 top-16 z-30 overflow-hidden rounded-2xl bg-[var(--paper)] shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
                  <div className="border-b border-black/5 px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--ink)]">Notificações</p>
                  </div>

                  {notificacoes.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-[var(--cream-soft)]">
                      Sem notificações de momento.
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {notificacoes.map((n) => {
                        const lida = idsLidas.has(n.id);
                        return (
                          <li key={n.id}>
                            <Link
                              to={n.link}
                              onClick={() => setDropdownAberto(false)}
                              className={`flex items-start gap-3 border-b border-black/5 px-4 py-3 transition hover:bg-black/[0.02] ${
                                lida ? 'opacity-60' : ''
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  n.tipo === 'pedido'
                                    ? 'bg-[var(--amber-soft)] text-[#7A4B0A]'
                                    : 'bg-[var(--mango-soft)] text-[var(--mango)]'
                                }`}
                              >
                                {n.tipo === 'pedido' ? (
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <rect x="3" y="5.5" width="18" height="13" rx="2" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <circle cx="12" cy="8" r="3" />
                                    <path d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" strokeLinecap="round" />
                                  </svg>
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[var(--ink)]">
                                  {n.titulo}
                                </p>
                                <p className="text-xs text-[var(--cream-soft)]">
                                  {n.descricao}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[var(--cream-soft)]/70">
                                  {tempoRelativo(n.data)}
                                </p>
                              </div>
                              {!lida && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--mango)]" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Ver site */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 md:px-3"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
                <path d="M3.5 9h17M3.5 15h17M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9s1.3-6.5 3.8-9Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden md:inline">Ver site</span>
            </Link>

            {/* Sair */}
            <button
              onClick={aoSair}
              className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 md:px-3"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Secções do painel">
          {ABAS.map((aba) => (
            <NavLink
              key={aba.to}
              to={aba.to}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isActive ? 'text-white' : 'text-white/70 hover:text-white'
                }`
              }
            >
              {aba.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 md:px-6 md:py-8">
        {children}
      </main>

      <footer className="py-6">
        <p className="text-center text-xs text-[var(--cream-soft)]/70">
          Desenvolvido pela <span className="font-semibold text-[var(--cream-soft)]">SmartMetrics</span>
        </p>
      </footer>
    </div>
  );
}