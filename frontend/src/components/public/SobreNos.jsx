export default function SobreNos() {
  return (
    <section className="mt-14 lg:mt-20">
      <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
        Sobre nós
      </h2>

      <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8] shadow-sm lg:mt-7">
        <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
          <div className="h-56 md:h-full md:min-h-[380px]">
            <img
              src="/images/sobre-nos.png"
              alt="Estudante a estudar Física com livros e computador portátil"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>

          <div className="px-6 pb-8 md:py-14 md:pr-14 md:pl-0 lg:py-16">
            <p className="text-sm leading-relaxed text-[var(--ink-soft)] md:text-base lg:text-lg">
              <strong className="font-semibold text-[var(--ink)]">Segredos da Física - Sala Virtual</strong> é
              um espaço de estudo criado para apoiar estudantes da 9.ª e da 12.ª classes na aprendizagem da Física.
              A plataforma organiza os conteúdos por classes, unidades e temas, permitindo aos estudantes consultar
              os recursos disponibilizados para o seu percurso de estudo.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)] md:text-base lg:text-lg">
              Pensada para uma experiência acessível em telemóveis e computadores, a Sala Virtual procura tornar
              o estudo da Física mais organizado e próximo das necessidades dos estudantes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}