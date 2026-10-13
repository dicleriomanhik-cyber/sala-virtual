export default function BannerClasse({
  selo = 'Sala de Estudo',
  titulo,
  descricao,
  imagem,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F0FE] via-[#D9E6FB] to-[#C7DAF8]">
      <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
        <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 lg:py-16">
          <span className="inline-flex rounded-full bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--mango)] backdrop-blur-sm md:text-xs">
            {selo}
          </span>
          <h1 className="mt-4 break-words font-display text-2xl font-semibold leading-tight text-[var(--cream)] md:text-3xl lg:text-4xl">
            {titulo}
          </h1>
          {descricao && (
            <p className="mt-3 max-w-xl text-sm text-[var(--cream-soft)] md:text-base">
              {descricao}
            </p>
          )}
        </div>

        <div className="relative h-56 md:h-full md:min-h-[320px]">
          {imagem && (
            <>
              <img
                src={imagem}
                alt=""
                className="h-full w-full object-cover object-[70%_center]"
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#D9E6FB]/50 via-transparent to-transparent md:from-[#D9E6FB]/70"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}