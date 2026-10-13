import { useState } from 'react';
import { PERGUNTAS } from '../../data/faq';

export default function Faq() {
  const [aberta, setAberta] = useState(null);

  function alternar(id) {
    setAberta((atual) => (atual === id ? null : id));
  }

  return (
    <section className="mt-14 lg:mt-20">
      <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
        Perguntas frequentes
      </h2>

      <div className="mt-5 grid gap-6 md:grid-cols-[300px_1fr] lg:mt-7 lg:grid-cols-[400px_1fr] md:items-stretch">
        <div className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm">
          <img
            src="/images/faq-mulher.jpg"
            alt="Estudante a estudar com um computador portátil"
            className="h-56 w-full object-cover object-center md:h-full md:min-h-[480px]"
            loading="lazy"
          />
        </div>

        <div className="space-y-3">
          {PERGUNTAS.map((p) => {
            const isAberta = aberta === p.id;
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => alternar(p.id)}
                  aria-expanded={isAberta}
                  aria-controls={`faq-resposta-${p.id}`}
                  className="w-full px-5 py-4 text-left text-sm font-semibold text-[var(--ink)] transition hover:bg-black/[0.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mango)] motion-reduce:transition-none lg:px-6 lg:py-5 lg:text-base"
                >
                  {p.pergunta}
                </button>

                {isAberta && (
                  <div
                    id={`faq-resposta-${p.id}`}
                    role="region"
                    className="border-t border-black/5 px-5 py-4 text-sm leading-relaxed text-[var(--ink-soft)] lg:px-6 lg:py-5 lg:text-base"
                  >
                    {p.resposta}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}