import { useEffect, useState } from 'react';
import { api } from '../../api/client';

function IconeYoutubeOficial() {
  return (
    <svg viewBox="0 0 28 20" className="h-6 w-auto" aria-hidden="true">
      <path fill="#FF0000" d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.7 0 14 0 14 0S5.3 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5c2.2.6 10.9.6 10.9.6s8.7 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9Z" />
      <path fill="#FFFFFF" d="M11.2 14.3V5.7L18.6 10l-7.4 4.3Z" />
    </svg>
  );
}

export default function AulasDestaque() {
  const [aulas, setAulas] = useState(null);

  useEffect(() => {
    api
      .get('/aulas-gratuitas')
      .then(setAulas)
      .catch(() => setAulas([]));
  }, []);

  if (!aulas || aulas.length === 0) return null;

  return (
    <section id="aulas-destaque" className="mt-14 scroll-mt-24 lg:mt-20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
            Aulas gratuitas
          </h2>
          <p className="mt-1 text-sm text-[var(--cream-soft)] lg:text-base">
            Explora as aulas de amostra antes de pedir acesso a uma unidade completa.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:mt-7 lg:grid-cols-4">
        {aulas.map((aula) => (
          <a
            key={aula.id}
            href={aula.link_youtube}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-2xl bg-[var(--paper)] p-3 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)] motion-reduce:transition-none"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#E8F0FE] to-[#C7DAF8]">
              {aula.imagem_url ? (
                <img
                  src={aula.imagem_url}
                  alt={aula.titulo}
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-[var(--mango)]/40" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 drop-shadow-md">
                <IconeYoutubeOficial />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-display text-base font-semibold leading-snug text-[var(--ink)]">
                {aula.titulo}
              </h3>
              {(aula.classe || aula.disciplina) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {aula.classe && (
                    <span className="rounded-full bg-[var(--mango-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--mango)]">
                      {aula.classe}
                    </span>
                  )}
                  {aula.classe && aula.disciplina && (
                    <span className="text-[11px] font-medium text-[var(--cream-soft)]">·</span>
                  )}
                  {aula.disciplina && (
                    <span className="text-[11px] font-semibold text-[var(--cream-soft)]">
                      {aula.disciplina}
                    </span>
                  )}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}