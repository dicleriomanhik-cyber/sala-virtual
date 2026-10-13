export default function Banner({ nomeAluno, nomeEscola }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8]">
      <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
        <div className="relative z-10 px-6 py-10 md:px-12 md:py-16 lg:py-20">
          <p className="text-base font-semibold uppercase tracking-widest text-[var(--mango)] md:text-lg lg:text-xl">
            {nomeAluno ? `Olá, ${nomeAluno}` : 'Bem-vindo'}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-[var(--cream)] md:text-5xl lg:text-6xl">
            A Física fica mais clara quando aprendes ao teu ritmo.
          </h1>
          <p className="mt-5 text-sm text-[var(--cream-soft)] md:text-base lg:text-lg">
            {nomeEscola ? `Conteúdo de ${nomeEscola}. ` : ''}
            Explora os conteúdos de Física da 9.ª e da 12.ª classes, organizados por unidades e temas,
            e consulta as aulas e os materiais disponibilizados na Sala Virtual.
          </p>
          <a
            href="#escolha-classe"
            className="mt-7 inline-flex items-center rounded-full bg-[#0B2A5B] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2A5B] lg:px-6 lg:py-3.5 lg:text-base"
          >
            Explorar as classes
          </a>
        </div>

        <div className="relative h-56 md:h-full md:min-h-[440px]">
          <img
            src="/images/banner.png"
            alt="Estudante a assistir a uma aula de Física num computador portátil"
            className="h-full w-full object-cover object-[70%_center]"
            loading="eager"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#D9E6FB]/40 via-transparent to-transparent md:from-[#D9E6FB]/60"
          />
        </div>
      </div>
    </section>
  );
}