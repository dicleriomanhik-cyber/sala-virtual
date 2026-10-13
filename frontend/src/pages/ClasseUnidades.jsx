import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PublicLayout from '../components/public/PublicLayout';
import BannerClasse from '../components/public/BannerClasse';
import CartaoUnidade from '../components/public/CartaoUnidade';
import { useAuth } from '../context/AuthContext';

function nomeCurtoClasse(nome) {
  if (!nome) return '';
  if (nome.includes('9ª') || nome.includes('9.ª')) return '9.ª Classe';
  if (nome.includes('12ª') || nome.includes('12.ª')) return '12.ª Classe';
  return nome;
}

function imagemBannerClasse(nome) {
  if (!nome) return null;
  if (nome.includes('9ª') || nome.includes('9.ª')) return '/images/banner-9.png';
  if (nome.includes('12ª') || nome.includes('12.ª')) return '/images/banner-12.png';
  return null;
}

function imagemLateralClasse(nome) {
  if (!nome) return null;
  if (nome.includes('9ª') || nome.includes('9.ª')) return '/images/lateral-9.png';
  if (nome.includes('12ª') || nome.includes('12.ª')) return '/images/lateral-12.png';
  return null;
}

export default function ClasseUnidades() {
  const { classeId } = useParams();
  const [unidades, setUnidades] = useState(null);
  const [classeNome, setClasseNome] = useState('');
  const [erro, setErro] = useState('');
  const { aluno } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/classes')
      .then((lista) => {
        const classe = lista.find((c) => String(c.id) === String(classeId));
        if (classe) setClasseNome(classe.nome);
      })
      .catch(() => {});

    api
      .get(`/classes/${classeId}/unidades`)
      .then(setUnidades)
      .catch(() => setErro('Não foi possível carregar as unidades desta classe.'));
  }, [classeId, aluno]);

  const nomeCurto = nomeCurtoClasse(classeNome) || 'Classe';
  const imagemBanner = imagemBannerClasse(classeNome);
  const imagemLateral = imagemLateralClasse(classeNome);

  return (
    <PublicLayout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center text-sm font-medium text-[var(--mango)] transition hover:underline"
      >
        Voltar
      </button>

      <BannerClasse
        selo="Sala de Estudo"
        titulo={`Unidades da ${nomeCurto}`}
        descricao="Escolhe uma unidade para consultar os temas e recursos disponíveis."
        imagem={imagemBanner}
      />

      {erro && (
        <p className="mt-6 text-sm" style={{ color: 'var(--brick)' }} role="alert">
          {erro}
        </p>
      )}

      <section className="mt-10 lg:mt-12">
        <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
          Unidades de estudo
        </h2>

        <div className="mt-5 grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="space-y-3 lg:space-y-4">
            {unidades === null && !erro && (
              <div className="animate-pulse space-y-3">
                <div className="h-20 rounded-2xl bg-black/[0.04]" />
                <div className="h-20 rounded-2xl bg-black/[0.04]" />
                <div className="h-20 rounded-2xl bg-black/[0.04]" />
              </div>
            )}

            {unidades?.length === 0 && (
              <p className="rounded-2xl bg-[var(--paper)] p-6 text-center text-sm text-[var(--cream-soft)]">
                Ainda não há unidades disponíveis nesta classe.
              </p>
            )}

            {unidades?.map((u) => (
              <CartaoUnidade key={u.id} unidade={u} />
            ))}
          </div>

          {imagemLateral && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 h-full min-h-[400px] overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={imagemLateral}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </aside>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}