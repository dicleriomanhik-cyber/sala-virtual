export default function Botao({ children, variante = 'primario', className = '', ...props }) {
  const base = 'w-full rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';
  const variantes = {
    primario: 'bg-[var(--mango)] text-[var(--mango-ink)] hover:brightness-105',
    secundario: 'bg-white/5 text-[var(--cream)] border border-white/15 hover:bg-white/10',
    fantasma: 'text-[var(--mango)] hover:bg-white/5',
  };
  return (
    <button className={`${base} ${variantes[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}
