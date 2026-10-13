import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PublicLayout from '../components/public/PublicLayout';
import Banner from '../components/public/Banner';
import AulasDestaque from '../components/public/AulasDestaque';
import EscolhaClasse from '../components/public/EscolhaClasse';
import SobreNos from '../components/public/SobreNos';
import Recursos from '../components/public/Recursos';
import Faq from '../components/public/Faq';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

export default function Home() {
  const [classes, setClasses] = useState(null);
  const [erro, setErro] = useState('');
  const { aluno } = useAuth();
  const config = useConfig();

  useEffect(() => {
    api
      .get('/classes')
      .then(setClasses)
      .catch(() => setErro('Não foi possível carregar as classes.'));
  }, []);

  return (
    <PublicLayout>
      <Banner
        nomeAluno={aluno ? aluno.nome.split(' ')[0] : null}
        nomeEscola={config?.nome_escola || null}
      />

      {erro && (
        <p className="mt-6 text-sm" style={{ color: 'var(--brick)' }} role="alert">
          {erro}
        </p>
      )}

      {classes === null && !erro && (
        <div className="mt-10 space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-black/[0.04]" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-32 animate-pulse rounded-2xl bg-black/[0.04]" />
            <div className="h-32 animate-pulse rounded-2xl bg-black/[0.04]" />
          </div>
        </div>
      )}

      {classes && (
        <>
          <AulasDestaque />
          <EscolhaClasse classes={classes} />
        </>
      )}

      <SobreNos />
      <Recursos />
      <Faq />
    </PublicLayout>
  );
}