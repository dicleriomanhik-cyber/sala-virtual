import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Se há hash (ex: /#aulas-destaque), deixa o browser tratar da âncora
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    // Caso contrário, topo da página
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}