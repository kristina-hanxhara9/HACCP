import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import { Plus, Search, Eye, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RiskBadge, InspectionStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { INSPECTION_TYPE_LABELS, RISK_LEVEL_LABELS } from '@/types';
import type { InspectionType, InspectionStatus, RiskLevel } from '@/types';

export function InspectionListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  const inspections = useLiveQuery(() => db.inspections.orderBy('date').reverse().toArray());
  const businesses = useLiveQuery(() => db.businesses.toArray());
  const ncs = useLiveQuery(() => db.nonConformances.toArray());

  const filtered = useMemo(() => {
    if (!inspections || !businesses) return [];
    let result = inspections.map((ins) => {
      const biz = businesses.find((b) => b.id === ins.businessId);
      const ncCount = ncs?.filter((nc) => nc.inspectionId === ins.id).length || 0;
      return { ...ins, businessName: biz?.name || '—', ncCount };
    });

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.serialNumber.toLowerCase().includes(s) ||
          i.businessName.toLowerCase().includes(s) ||
          i.inspector.toLowerCase().includes(s)
      );
    }
    if (typeFilter) result = result.filter((i) => i.type === typeFilter);
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    if (riskFilter) result = result.filter((i) => i.riskLevel === riskFilter);

    return result;
  }, [inspections, businesses, ncs, search, typeFilter, statusFilter, riskFilter]);

  if (!inspections || !businesses) return <div className="space-y-6"><h1 className="text-2xl font-bold text-[#0f172a]">Inspektimet</h1><TableSkeleton rows={6} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0f172a]">Inspektimet</h1>
        <Button icon={<Plus size={16} />} onClick={() => navigate('/app/inspections/new')}>
          Inspektim i Ri
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko sipas nr. serial, biznes, inspektor..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5c35]"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white">
            <option value="">Të gjitha llojet</option>
            {Object.entries(INSPECTION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white">
            <option value="">Të gjitha statuset</option>
            <option value="draft">Draft</option>
            <option value="perfunduar">Përfunduar</option>
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white">
            <option value="">Të gjitha rreziqet</option>
            {Object.entries(RISK_LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={28} />}
          title="Nuk ka inspektime"
          description={search || typeFilter || statusFilter || riskFilter ? 'Nuk u gjet asnjë inspektim me këta filtra' : 'Krijoni inspektimin tuaj të parë'}
          action={
            !search && !typeFilter && !statusFilter && !riskFilter ? (
              <Button icon={<Plus size={16} />} onClick={() => navigate('/app/inspections/new')}>Krijo inspektimin e parë</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Nr. Serial</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Biznesi</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Lloji</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Inspektori</th>
                  <th className="text-center px-4 py-3 font-medium text-[#64748b]">NC</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Rreziku</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Statusi</th>
                  <th className="text-right px-4 py-3 font-medium text-[#64748b]">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ins) => (
                  <tr key={ins.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{ins.serialNumber}</td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{ins.businessName}</td>
                    <td className="px-4 py-3 text-[#64748b]">{format(new Date(ins.date), 'd MMM yyyy', { locale: sq })}</td>
                    <td className="px-4 py-3 text-[#64748b]">{INSPECTION_TYPE_LABELS[ins.type as InspectionType]}</td>
                    <td className="px-4 py-3 text-[#64748b]">{ins.inspector}</td>
                    <td className="px-4 py-3 text-center">
                      {ins.ncCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[#fef2f2] text-[#dc2626]">{ins.ncCount}</span>
                      ) : <span className="text-[#94a3b8]">0</span>}
                    </td>
                    <td className="px-4 py-3"><RiskBadge level={ins.riskLevel as RiskLevel} size="sm" /></td>
                    <td className="px-4 py-3"><InspectionStatusBadge status={ins.status as InspectionStatus} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => navigate(`/app/inspections/${ins.id}`)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]" title="Shiko/Ndrysho">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
