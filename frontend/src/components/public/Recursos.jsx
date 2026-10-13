const CARTOES = [
  {
    titulo: 'Aulas em vídeo organizadas por temas',
    texto:
      'Os conteúdos estão organizados por classe, unidade e tema. Cada tema pode incluir uma aula em vídeo, disponível para consulta após a autorização de acesso à respectiva unidade.',
    imagem: '/images/banner.png',
    alt: 'Estudante a assistir a uma aula em vídeo de Física',
  },
  {
    titulo: 'Acesso organizado aos conteúdos',
    texto:
      'O acesso às unidades é pedido a partir da própria plataforma. Depois de confirmado, os conteúdos ficam associados à conta do estudante e disponíveis para consulta enquanto o acesso estiver válido.',
    imagem: '/images/sobre-nos.png',
    alt: 'Estudante a consultar conteúdos de Física',
  },
  {
    titulo: 'Materiais de apoio em PDF',
    texto:
      'Algumas unidades podem incluir material de apoio em formato PDF, disponível para download depois de o acesso ser autorizado.',
    imagem: '/images/escolha-12.png',
    alt: 'Estudante a estudar com livros de Física',
  },
];

export default function Recursos() {
  return (
    <section className="mt-14 lg:mt-20">
      <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
        Recursos e vantagens
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:mt-7 lg:grid-cols-3 lg:gap-6">
        {CARTOES.map((c) => (
          <article
            key={c.titulo}
            className="group overflow-hidden rounded-2xl bg-[var(--paper)] shadow-sm transition hover:shadow-md motion-reduce:transition-none"
          >
            <div className="h-44 w-full overflow-hidden lg:h-56">
              <img
                src={c.imagem}
                alt={c.alt}
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                loading="lazy"
              />
            </div>
            <div className="p-5 lg:p-6">
              <h3 className="font-display text-lg font-semibold text-[var(--ink)] lg:text-xl">
                {c.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)] lg:text-base">
                {c.texto}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}