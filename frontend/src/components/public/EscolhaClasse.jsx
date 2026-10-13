import { Link } from 'react-router-dom';

function ehClasseDestacada(nome) {
  if (!nome) return false;
  return nome.includes('9ª') || nome.includes('9.ª') || nome.includes('12ª') || nome.includes('12.ª');
}

function imagemDaClasse(nome) {
  if (!nome) return null;
  if (nome.includes('9ª') || nome.includes('9.ª'))
    return { src: '/images/escolha-9.png', position: '40% center' };
  if (nome.includes('12ª') || nome.includes('12.ª'))
    return { src: '/images/escolha-12.png', position: '55% center' };
  return null;
}

export default function EscolhaClasse({ classes }) {
  if (!classes || classes.length === 0) {
    return (
      <section id="escolha-classe" className="mt-14 lg:mt-20">
        <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
          Escolha a sua classe
        </h2>
        <p className="mt-2 text-sm text-[var(--cream-soft)] lg:text-base">
          Ainda não há classes disponíveis.
        </p>
      </section>
    );
  }

  const ordenadas = [...classes].sort((a, b) => {
    const aD = ehClasseDestacada(a.nome) ? 0 : 1;
    const bD = ehClasseDestacada(b.nome) ? 0 : 1;
    return aD - bD;
  });

  return (
    <section id="escolha-classe" className="mt-14 lg:mt-20">
      <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
        Escolha a sua classe
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:mt-7 lg:gap-6">
        {ordenadas.map((c) => {
          const destacada = ehClasseDestacada(c.nome);
          const imagem = imagemDaClasse(c.nome);

          return (
            <Link
              key={c.id}
              to={`/classes/${c.id}`}
              className={`group relative block overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)] ${
                destacada ? 'border-2 border-[var(--mango)]/30' : 'border border-black/5'
              }`}
            >
              <div className="relative h-56 w-full sm:h-72 lg:h-80">
                {imagem ? (
                  <img
                    src={imagem.src}
                    alt=""
                    style={{ objectPosition: imagem.position }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#E8F0FE] to-[#C7DAF8]" />
                )}

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[var(--mango)]/85 via-[var(--mango)]/60 to-transparent"
                />

                <div className="absolute inset-0 flex flex-col justify-between p-5 lg:p-6">
                  <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                    {destacada ? 'Em destaque' : 'Classe'}
                  </span>

                  <div>
                    <h3 className="font-display text-2xl font-semibold leading-tight text-white lg:text-3xl">
                      {c.nome}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white/95 lg:text-base">
                      Ver unidades
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}