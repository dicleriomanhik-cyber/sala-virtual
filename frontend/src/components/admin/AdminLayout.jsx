import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ABAS = [
  { to: '/admin/dashboard', label: 'Painel Principal' },
  { to: '/admin/pagamentos', label: 'Pagamentos' },
  { to: '/admin/configuracoes', label: 'Configurações' },
];

export default function AdminLayout({ children }) {
  const config = useConfig();
  const { sair } = useAdminAuth();
  const navigate = useNavigate();

  function aoSair() {
    sair();
    navigate('/admin/entrar', { replace: true });
  }

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
                    isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
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
                  isActive
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
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