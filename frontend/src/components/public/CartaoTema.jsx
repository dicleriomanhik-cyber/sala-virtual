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
  const bloqueado = !temAcesso || !tema.link_youtube;

  // Conteúdo comum a ambos os estados
  const conteudo = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          bloqueado
            ? 'bg-black/[0.05] text-[var(--cream-soft)]'
            : 'bg-[var(--mango-soft)] text-[var(--mango)]'
        }`}
      >
        {bloqueado ? <IconeCadeado /> : <IconeVideo />}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium lg:text-base ${
            bloqueado ? 'text-[var(--ink-soft)]' : 'text-[var(--ink)]'
          }`}
        >
          {index}. {tema.nome}
        </p>
        {tema.descricao && (
          <p className="mt-0.5 text-xs text-[var(--cream-soft)]">{tema.descricao}</p>
        )}
      </div>

      {bloqueado ? (
        <span className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--cream-soft)] sm:inline-flex">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="4.5" y="10" width="15" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          </svg>
          Bloqueado
        </span>
      ) : (
        <span className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-[var(--mango)] px-3 py-1.5 text-xs font-semibold text-[var(--mango-ink)] sm:inline-flex">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
          Assistir
        </span>
      )}
    </>
  );

  const classesBase =
    'flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-[var(--paper)] px-4 py-3 transition lg:px-5 lg:py-4';

  if (!bloqueado) {
    return (
      <a
        href={tema.link_youtube}
        target="_blank"
        rel="noreferrer"
        className={`${classesBase} hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)]`}
      >
        {conteudo}
      </a>
    );
  }

  return <div className={classesBase}>{conteudo}</div>;
}