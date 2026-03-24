import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { Building2, Plus, Search, Eye, Pencil, Trash2, ClipboardPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RiskBadge, BusinessTypeBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BusinessFormModal } from './BusinessFormModal';
import { format } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import toast from 'react-hot-toast';
import type { Business, BusinessType, RiskLevel } from '@/types';
import { BUSINESS_TYPE_LABELS } from '@/types';
import { useActivityLog } from '@/hooks/useActivityLog';

export function BusinessListPage() {
  const navigate = useNavigate();
  const { log } = useActivityLog();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'risk'>('name');
  const [formOpen, setFormOpen] = useState(false);
  const [editBusiness, setEditBusiness] = useState<Business | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const businesses = useLiveQuery(() => db.businesses.toArray());
  const inspections = useLiveQuery(() => db.inspections.toArray());
  const ncs = useLiveQuery(() => db.nonConformances.toArray());

  const cities = useMemo(() => {
    if (!businesses) return [];
    return [...new Set(businesses.map((b) => b.city))].sort();
  }, [businesses]);

  const enriched = useMemo(() => {
    if (!businesses || !inspections || !ncs) return [];
    return businesses.map((b) => {
      const bizInspections = inspections.filter((i) => i.businessId === b.id);
      const lastInspection = bizInspections.sort(
        (a, c) => new Date(c.date).getTime() - new Date(a.date).getTime()
      )[0];
      const openNCs = ncs.filter((nc) => nc.businessId === b.id && nc.status !== 'zgjidhur');
      const highestRisk: RiskLevel = openNCs.some((nc) => nc.riskLevel === 'kritik')
        ? 'kritik'
        : openNCs.some((nc) => nc.riskLevel === 'i_larte')
        ? 'i_larte'
        : openNCs.some((nc) => nc.riskLevel === 'mesatar')
        ? 'mesatar'
        : 'i_ulet';
      return { ...b, lastInspection, openNCsCount: openNCs.length, computedRisk: highestRisk };
    });
  }, [businesses, inspections, ncs]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(s) ||
          b.city.toLowerCase().includes(s) ||
          b.contactPerson.toLowerCase().includes(s)
      );
    }
    if (typeFilter) result = result.filter((b) => b.type === typeFilter);
    if (cityFilter) result = result.filter((b) => b.city === cityFilter);

    const riskOrder: Record<RiskLevel, number> = { kritik: 0, i_larte: 1, mesatar: 2, i_ulet: 3 };
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') {
        const aDate = a.lastInspection ? new Date(a.lastInspection.date).getTime() : 0;
        const bDate = b.lastInspection ? new Date(b.lastInspection.date).getTime() : 0;
        return bDate - aDate;
      }
      return riskOrder[a.computedRisk] - riskOrder[b.computedRisk];
    });
    return result;
  }, [enriched, search, typeFilter, cityFilter, sortBy]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await db.businesses.delete(deleteId);
    await db.inspections.where('businessId').equals(deleteId).delete();
    await db.nonConformances.where('businessId').equals(deleteId).delete();
    toast.success('Biznesi u fshi me sukses');
    setDeleteId(null);
  };

  if (!businesses) return <TableSkeleton rows={8} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0f172a]">Bizneset</h1>
        <Button icon={<Plus size={16} />} onClick={() => { setEditBusiness(null); setFormOpen(true); }}>
          Shto Biznes
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko biznes..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5c35] focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white"
          >
            <option value="">Të gjitha tipet</option>
            {Object.entries(BUSINESS_TYPE_LABELS).map(([val, lab]) => (
              <option key={val} value={val}>{lab}</option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white"
          >
            <option value="">Të gjitha qytetet</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white"
          >
            <option value="name">Rendit: Emri</option>
            <option value="date">Rendit: Inspektimi i fundit</option>
            <option value="risk">Rendit: Rreziku</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 size={28} />}
          title="Nuk ka biznese"
          description={search || typeFilter || cityFilter ? 'Nuk u gjet asnjë biznes me këta filtra' : 'Shtoni biznesin tuaj të parë për të filluar'}
          action={
            !search && !typeFilter && !cityFilter ? (
              <Button icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
                Shto biznesin e parë
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Biznesi</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Tipi</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Qyteti</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Inspektimi i fundit</th>
                  <th className="text-center px-4 py-3 font-medium text-[#64748b]">NC Hapura</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748b]">Rreziku</th>
                  <th className="text-right px-4 py-3 font-medium text-[#64748b]">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{b.name}</td>
                    <td className="px-4 py-3"><BusinessTypeBadge type={b.type as BusinessType} /></td>
                    <td className="px-4 py-3 text-[#64748b]">{b.city}</td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {b.lastInspection
                        ? format(new Date(b.lastInspection.date), 'd MMM yyyy', { locale: sq })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {b.openNCsCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[#fef2f2] text-[#dc2626]">
                          {b.openNCsCount}
                        </span>
                      ) : (
                        <span className="text-[#94a3b8]">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><RiskBadge level={b.computedRisk} size="sm" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/businesses/${b.id}`)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]" title="Shiko">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditBusiness(b); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]" title="Ndrysho">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => navigate(`/inspections/new?businessId=${b.id}`)} className="p-1.5 rounded-lg hover:bg-[#f0f9f1] text-[#1a5c35]" title="Inspektim i ri">
                          <ClipboardPlus size={16} />
                        </button>
                        <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg hover:bg-[#fef2f2] text-[#dc2626]" title="Fshi">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#f1f5f9]">
            {filtered.map((b) => (
              <div key={b.id} className="p-4" onClick={() => navigate(`/businesses/${b.id}`)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[#0f172a]">{b.name}</h3>
                    <p className="text-xs text-[#64748b]">{b.city}</p>
                  </div>
                  <RiskBadge level={b.computedRisk} size="sm" />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <BusinessTypeBadge type={b.type as BusinessType} />
                  {b.openNCsCount > 0 && (
                    <span className="text-xs text-[#dc2626] font-medium">{b.openNCsCount} NC</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Form Modal */}
      <BusinessFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBusiness(null); }}
        business={editBusiness}
        onSaved={async (b) => {
          if (editBusiness) {
            await log('business_updated', `U përditësua biznesi "${b.name}"`, b.id, 'business');
          } else {
            await log('business_created', `U shtua biznesi "${b.name}"`, b.id, 'business');
          }
        }}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Fshi biznesin"
        message="Jeni të sigurt? Kjo do të fshijë edhe të gjitha inspektimet dhe mospërputhjet e lidhura me këtë biznes."
        confirmLabel="Fshi"
        variant="danger"
      />
    </div>
  );
}
