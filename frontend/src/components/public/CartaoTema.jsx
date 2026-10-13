function IconeCadeado() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function IconeVideo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M10 9.5v5l4-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function CartaoTema({ tema, index, temAcesso }) {
  const classesBase =
    'flex items-center gap-4 rounded-xl border border-black/5 bg-[var(--paper)] px-4 py-3 transition lg:px-5 lg:py-4';

  if (temAcesso && tema.link_youtube) {
    return (
      <a
        href={tema.link_youtube}
        target="_blank"
        rel="noreferrer"
        className={`${classesBase} hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)]`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--mango-soft)] text-[var(--mango)]">
          <IconeVideo />
        </span>
        <span className="text-sm font-medium text-[var(--ink)] lg:text-base">
          {index}. {tema.nome}
        </span>
      </a>
    );
  }

  return (
    <div className={classesBase}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] text-[var(--cream-soft)]">
        <IconeCadeado />
      </span>
      <span className="text-sm font-medium text-[var(--ink-soft)] lg:text-base">
        {index}. {tema.nome}
      </span>
    </div>
  );
}