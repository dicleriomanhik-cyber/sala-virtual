import { useEffect, useState } from 'react';
import { apiAdmin } from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import MensagemErro from '../../components/MensagemErro';

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminAlunos() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [aberto, setAberto] = useState(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    apiAdmin
      .get('/admin/alunos')
      .then(setLista)
      .catch((e) => setErro(e.message));
  }, []);

  const filtrados = lista?.filter((a) => {
    const alvo = busca.trim().toLowerCase();
    if (!alvo) return true;
    return a.nome.toLowerCase().includes(alvo) || a.whatsapp.includes(alvo);
  });

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-semibold text-[var(--cream)]">Alunos</h1>
      <p className="mt-1 text-sm text-[var(--cream-soft)]">Registados e o histórico de unidades pedidas.</p>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Procurar por nome ou WhatsApp…"
        className="campo mt-4"
      />

      <div className="mt-3">
        <MensagemErro>{erro}</MensagemErro>
      </div>

      <div className="mt-3 space-y-2">
        {lista === null && !erro && (
          <div className="animate-pulse space-y-2">
            <div className="h-16 rounded-2xl bg-white/5" />
            <div className="h-16 rounded-2xl bg-white/5" />
          </div>
        )}

        {filtrados?.length === 0 && (
          <p className="rounded-2xl bg-[var(--bg-soft)] p-5 text-center text-sm text-[var(--cream-soft)]">
            Nenhum aluno encontrado.
          </p>
        )}

        {filtrados?.map((a) => {
          const estaAberto = aberto === a.id;
          return (
            <div key={a.id} className="rounded-2xl bg-[var(--bg-soft)] p-4">
              <button
                onClick={() => setAberto(estaAberto ? null : a.id)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <p className="font-display text-base font-semibold text-[var(--cream)]">{a.nome}</p>
                  <p className="font-mono-ref text-xs text-[var(--cream-soft)]">{a.whatsapp}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--cream-soft)]">Desde {formatarData(a.data_registo)}</p>
                  <p className="text-xs font-semibold text-[var(--mango)]">
                    {estaAberto ? 'Fechar ▲' : `${a.historico?.length || 0} pedido(s) ▾`}
                  </p>
                </div>
              </button>

              {estaAberto && (
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                  {(!a.historico || a.historico.length === 0) && (
                    <p className="text-sm text-[var(--cream-soft)]">Ainda não pediu nenhuma unidade.</p>
                  )}
                  {a.historico?.map((acesso) => (
                    <div key={acesso.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--cream)]">{acesso.unidade_nome}</p>
                        <p className="font-mono-ref text-xs text-[var(--cream-soft)]">{acesso.codigo_referencia}</p>
                      </div>
                      <StatusBadge estado={acesso.estado_visivel || acesso.estado} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
