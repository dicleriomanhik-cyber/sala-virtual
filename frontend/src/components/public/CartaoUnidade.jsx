import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge';

function IconeLivro() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v14.5H6.5A2.5 2.5 0 0 0 4 20V5.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20a2.5 2.5 0 0 1 2.5-2.5H19V21H6.5A2.5 2.5 0 0 1 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CartaoUnidade({ unidade }) {
  const { id, nome, preco, meu_acesso } = unidade;

  return (
    <Link
      to={`/unidades/${id}`}
      className="group flex items-center gap-4 rounded-2xl bg-[var(--paper)] p-4 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)] lg:p-5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--mango-soft)] text-[var(--mango)] lg:h-14 lg:w-14">
        <IconeLivro />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="font-display text-base font-semibold leading-snug text-[var(--ink)] lg:text-lg">
          {nome}
        </h2>
      </div>

      <div className="shrink-0 text-right">
        {meu_acesso ? (
          <StatusBadge estado={meu_acesso.estado} />
        ) : (
          <span className="font-mono-ref text-base font-semibold text-[var(--mango)] lg:text-lg">
            {preco} MT
          </span>
        )}
      </div>
    </Link>
  );
}