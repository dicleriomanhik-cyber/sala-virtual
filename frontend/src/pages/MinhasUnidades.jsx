import { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import PublicLayout from '../components/public/PublicLayout';
import TicketCard from '../components/TicketCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { linkWhatsapp } from '../utils/whatsapp';

export default function MinhasUnidades() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const { aluno, carregando } = useAuth();
  const config = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!aluno) return;
    api
      .get('/alunos/me/acessos')
      .then(setLista)
      .catch(() => setErro('Não foi possível carregar as suas unidades.'));
  }, [aluno]);

  if (carregando) return null;
  if (!aluno) return <Navigate to="/entrar" state={{ depoisDe: '/minhas-unidades' }} replace />;

  return (
    <PublicLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold leading-snug text-[var(--cream)] md:text-3xl lg:text-4xl">
          Minhas Unidades
        </h1>
        <p className="mt-1 text-sm text-[var(--cream-soft)] lg:text-base">
          Tudo o que já pediu ou comprou.
        </p>
      </div>

      {erro && (
        <p className="mb-4 text-sm" style={{ color: 'var(--brick)' }} role="alert">
          {erro}
        </p>
      )}

      <div className="space-y-3">
        {lista === null && !erro && (
          <div className="animate-pulse space-y-3">
            <div className="h-28 rounded-2xl bg-black/[0.04]" />
            <div className="h-28 rounded-2xl bg-black/[0.04]" />
          </div>
        )}

        {lista?.length === 0 && (
          <div className="rounded-2xl bg-[var(--paper)] p-8 text-center shadow-sm">
            <p className="text-sm text-[var(--cream-soft)]">
              Ainda não pediu acesso a nenhuma unidade.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-sm font-semibold text-[var(--mango)] hover:underline"
            >
              Ver classes disponíveis →
            </Link>
          </div>
        )}

        {lista?.map((acesso) => (
          <div
            key={acesso.id}
            onClick={() => navigate(`/unidades/${acesso.unidade_id}`)}
            className="cursor-pointer"
          >
            <TicketCard
              acesso={acesso}
              acaoWhatsapp={(e) => {
                e.stopPropagation();
                const link = linkWhatsapp({
                  whatsappAdmin: config?.whatsapp_admin,
                  alunoNome: aluno.nome,
                  unidadeNome: acesso.unidade_nome,
                  codigo: acesso.codigo_referencia,
                });
                if (link) window.open(link, '_blank', 'noopener');
              }}
            />
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}