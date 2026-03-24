import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format, differenceInDays } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import { AlertTriangle, Search } from 'lucide-react';
import { RiskBadge, NCStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import type { NCStatus } from '@/types';
import { NC_CATEGORY_LABELS } from '@/types';

type ViewFilter = 'te_gjitha' | 'kritike' | 'afatit' | 'te_zgjidhura';

export function NonConformancesPage() {
  const { log } = useActivityLog();
  const [view, setView] = useState<ViewFilter>('te_gjitha');
  const [search, setSearch] = useState('');
  const [resolveNC, setResolveNC] = useState<string | null>(null);
  const [resolveActions, setResolveActions] = useState('');
  const [resolveDate, setResolveDate] = useState(new Date().toISOString().split('T')[0]);

  const ncs = useLiveQuery(() => db.nonConformances.toArray());
  const businesses = useLiveQuery(() => db.businesses.toArray());

  const filtered = useMemo(() => {
    if (!ncs) return [];
    let result = ncs;
    const now = new Date();

    switch (view) {
      case 'kritike':
        result = result.filter((nc) => nc.status !== 'zgjidhur' && (nc.riskLevel === 'kritik' || nc.riskLevel === 'i_larte'));
        break;
      case 'afatit':
        result = result.filter((nc) => {
          if (nc.status === 'zgjidhur' || !nc.deadline) return false;
          const days = differenceInDays(new Date(nc.deadline), now);
          return days <= 14;
        });
        break;
      case 'te_zgjidhura':
        result = result.filter((nc) => nc.status === 'zgjidhur');
        break;
      default:
        result = result.filter((nc) => nc.status !== 'zgjidhur');
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (nc) =>
          nc.title.toLowerCase().includes(s) ||
          nc.description.toLowerCase().includes(s) ||
          businesses?.find((b) => b.id === nc.businessId)?.name.toLowerCase().includes(s)
      );
    }

    return result.sort((a, b) => {
      if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ncs, businesses, view, search]);

  const updateStatus = async (ncId: string, status: NCStatus) => {
    await db.nonConformances.update(ncId, { status, updatedAt: new Date().toISOString() });
    toast.success(status === 'ne_procesim' ? 'Statusi u ndryshua në "Në Procesim"' : 'Statusi u përditësua');
  };

  const handleResolve = async () => {
    if (!resolveNC) return;
    await db.nonConformances.update(resolveNC, {
      status: 'zgjidhur' as NCStatus,
      resolution: { actions: resolveActions, date: resolveDate },
      updatedAt: new Date().toISOString(),
    });
    const nc = ncs?.find((n) => n.id === resolveNC);
    if (nc) await log('nc_resolved', `U zgjidh: ${nc.title}`, nc.id, 'nonconformance');
    toast.success('Mospërputhja u shënua si e zgjidhur');
    setResolveNC(null);
    setResolveActions('');
  };

  const views: { key: ViewFilter; label: string }[] = [
    { key: 'te_gjitha', label: 'Të gjitha' },
    { key: 'kritike', label: 'Kritike' },
    { key: 'afatit', label: 'Afatit' },
    { key: 'te_zgjidhura', label: 'Të zgjidhura' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Mospërputhjet / CAPA</h1>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-1">
            {views.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === v.key ? 'bg-white text-[#0f172a] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5c35]"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle size={28} />}
          title="Nuk ka mospërputhje"
          description="Nuk u gjetën mospërputhje me këta filtra"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((nc) => {
            const biz = businesses?.find((b) => b.id === nc.businessId);
            const daysLeft = nc.deadline ? differenceInDays(new Date(nc.deadline), new Date()) : null;
            return (
              <div key={nc.id} className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#0f172a] truncate">{nc.title}</h3>
                      <RiskBadge level={nc.riskLevel} size="sm" />
                      <NCStatusBadge status={nc.status} />
                    </div>
                    <p className="text-sm text-[#64748b] mb-2">{nc.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
                      <span>{biz?.name || '—'}</span>
                      <span>{NC_CATEGORY_LABELS[nc.category]}</span>
                      {daysLeft !== null && (
                        <span className={`font-medium ${daysLeft < 0 ? 'text-[#dc2626]' : daysLeft <= 3 ? 'text-[#d97706]' : 'text-[#64748b]'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} ditë vonë` : `${daysLeft} ditë të mbetura`}
                        </span>
                      )}
                    </div>
                  </div>
                  {nc.status !== 'zgjidhur' && (
                    <div className="flex gap-2">
                      {nc.status === 'hapur' && (
                        <Button variant="secondary" size="sm" onClick={() => updateStatus(nc.id, 'ne_procesim')}>
                          Në Procesim
                        </Button>
                      )}
                      <Button size="sm" onClick={() => setResolveNC(nc.id)}>
                        Zgjidh
                      </Button>
                    </div>
                  )}
                </div>
                {nc.resolution && (
                  <div className="mt-3 pt-3 border-t border-[#f1f5f9]">
                    <p className="text-xs font-medium text-[#16a34a] mb-1">Zgjidhja:</p>
                    <p className="text-sm text-[#64748b]">{nc.resolution.actions}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">
                      {format(new Date(nc.resolution.date), 'd MMM yyyy', { locale: sq })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!resolveNC} onClose={() => setResolveNC(null)} title="Zgjidh Mospërputhjen" size="md">
        <div className="space-y-4">
          <Textarea
            label="Veprimet e ndërmarra"
            value={resolveActions}
            onChange={(e) => setResolveActions(e.target.value)}
            rows={4}
            required
            placeholder="Përshkruani veprimet korrigjuese të ndërmarra..."
          />
          <Input
            label="Data e zgjidhjes"
            type="date"
            value={resolveDate}
            onChange={(e) => setResolveDate(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setResolveNC(null)}>Anulo</Button>
            <Button onClick={handleResolve} disabled={!resolveActions.trim()}>
              Shëno si të Zgjidhur
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
