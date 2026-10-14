import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PublicLayout from '../components/public/PublicLayout';
import BannerClasse from '../components/public/BannerClasse';
import CartaoTema from '../components/public/CartaoTema';
import Botao from '../components/Botao';
import TicketCard from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { linkWhatsapp } from '../utils/whatsapp';

const IMAGEM_BANNER = '/images/banner-9.png';

function imagemLateralClasse(nome) {
  if (!nome) return null;
  if (nome.includes('9ª') || nome.includes('9.ª')) return '/images/lateral-9.png';
  if (nome.includes('12ª') || nome.includes('12.ª')) return '/images/lateral-12.png';
  return null;
}

export default function UnidadeTemas() {
  const { unidadeId } = useParams();
  const [dados, setDados] = useState(null);
  const [meuAcesso, setMeuAcesso] = useState(undefined);
  const [classeNome, setClasseNome] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [aProcessar, setAProcessar] = useState(false);
  const { aluno } = useAuth();
  const config = useConfig();
  const navigate = useNavigate();

  const carregar = useCallback(() => {
    api
      .get(`/unidades/${unidadeId}/temas`)
      .then((d) => {
        setDados(d);
        if (d?.unidade?.classe_nome) {
          setClasseNome(d.unidade.classe_nome);
        }
      })
      .catch(() => setErro('Não foi possível carregar esta unidade.'));

    // Fallback: se a unidade não tiver classe_nome, procura nas classes
    api
      .get('/classes')
      .then(async (classes) => {
        if (classeNome) return;
        for (const c of classes) {
          try {
            const unidades = await api.get(`/classes/${c.id}/unidades`);
            if (unidades.some((u) => String(u.id) === String(unidadeId))) {
              setClasseNome(c.nome);
              break;
            }
          } catch {
            // ignora e continua
          }
        }
      })
      .catch(() => {});

    if (aluno) {
      api
        .get('/alunos/me/acessos')
        .then((lista) => {
          const encontrado = lista.find((a) => a.unidade_id === Number(unidadeId));
          setMeuAcesso(encontrado || null);
        })
        .catch(() => setMeuAcesso(null));
    } else {
      setMeuAcesso(null);
    }
  }, [unidadeId, aluno, classeNome]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function pedirAcesso() {
    setErro('');
    setMostrarConfirmacao(true);
  }

  async function confirmarPagamento() {
    setAProcessar(true);
    setErro('');
    try {
      const resposta = await api.post('/alunos/me/acessos', { unidade_id: Number(unidadeId) });
      if (resposta.link_whatsapp) {
        window.open(resposta.link_whatsapp, '_blank', 'noopener');
      }
      setMostrarConfirmacao(false);
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setAProcessar(false);
    }
  }

  function abrirWhatsapp() {
    const link = linkWhatsapp({
      whatsappAdmin: config?.whatsapp_admin,
      alunoNome: aluno?.nome,
      unidadeNome: dados?.unidade?.nome,
      codigo: meuAcesso?.codigo_referencia,
    });
    if (link) window.open(link, '_blank', 'noopener');
  }

  const podePedir = meuAcesso === null || (meuAcesso && ['expirado', 'rejeitado'].includes(meuAcesso.estado));
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

      {erro && (
        <p className="mb-4 text-sm" style={{ color: 'var(--brick)' }} role="alert">
          {erro}
        </p>
      )}

      {!dados && !erro && (
        <div className="animate-pulse space-y-3">
          <div className="h-40 rounded-3xl bg-black/[0.04]" />
          <div className="h-16 rounded-2xl bg-black/[0.04]" />
        </div>
      )}

      {dados && (
        <>
          <p className="mb-4 text-sm text-[var(--cream-soft)] lg:text-base">
            {dados.temas.length} tema{dados.temas.length === 1 ? '' : 's'} · {dados.unidade.preco} MT
          </p>

          <BannerClasse
            selo="Unidade de Estudo"
            titulo={dados.unidade.nome}
            descricao="Consulta os temas desta unidade e os respectivos vídeos."
            imagem={IMAGEM_BANNER}
          />

          {meuAcesso && (
            <div className="mt-8">
              <TicketCard acesso={meuAcesso} acaoWhatsapp={abrirWhatsapp} />
              {meuAcesso.estado === 'rejeitado' && (
                <p className="mt-2 text-xs text-[var(--cream-soft)]">
                  O pedido anterior foi rejeitado. Pode tentar novamente abaixo.
                </p>
              )}
            </div>
          )}

          <section className="mt-10 lg:mt-12">
            <h2 className="font-display text-2xl font-semibold text-[var(--cream)] lg:text-3xl">
              Temas desta unidade
            </h2>

            <div className="mt-5 grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
              <div className="overflow-hidden rounded-2xl bg-[var(--paper)] p-5 shadow-sm lg:p-6">
                <div className="space-y-2">
                  {dados.temas.map((t, i) => (
                    <CartaoTema
                      key={t.id}
                      tema={t}
                      index={i + 1}
                      temAcesso={dados.tem_acesso}
                    />
                  ))}
                </div>

                {podePedir && !mostrarConfirmacao && (
                  <div className="mt-6">
                    {!aluno ? (
                      <Botao onClick={() => navigate('/entrar', { state: { depoisDe: `/unidades/${unidadeId}` } })}>
                        Entrar para pedir acesso
                      </Botao>
                    ) : (
                      <Botao onClick={pedirAcesso}>Pedir acesso — {dados.unidade.preco} MT</Botao>
                    )}
                  </div>
                )}

                {podePedir && mostrarConfirmacao && (
                  <div className="mt-6 space-y-3 rounded-2xl bg-[var(--bg-soft)] p-4">
                    <p className="text-sm text-[var(--ink)]">
                      Vai pagar <strong>{dados.unidade.preco} MT</strong> por "{dados.unidade.nome}". Ao clicar em
                      "Pagar", o WhatsApp abre com uma mensagem pronta para enviar ao professor com o código do seu pedido.
                    </p>
                    <Botao onClick={confirmarPagamento} disabled={aProcessar}>
                      {aProcessar ? 'A preparar…' : `Pagar — ${dados.unidade.preco} MT`}
                    </Botao>
                    <button
                      onClick={() => setMostrarConfirmacao(false)}
                      disabled={aProcessar}
                      className="w-full text-center text-sm font-medium text-[var(--cream-soft)]"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
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
        </>
      )}
    </PublicLayout>
  );
}