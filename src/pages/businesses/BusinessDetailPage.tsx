import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import { ArrowLeft, Pencil, ClipboardPlus, MapPin } from 'lucide-react';
import { RiskBadge, BusinessTypeBadge, InspectionStatusBadge, NCStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BusinessFormModal } from './BusinessFormModal';
import type { RiskLevel } from '@/types';

type Tab = 'inspections' | 'ncs' | 'docs' | 'history';

export function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('inspections');
  const [editOpen, setEditOpen] = useState(false);

  const business = useLiveQuery(() => id ? db.businesses.get(id) : undefined, [id]);
  const inspections = useLiveQuery(
    () => id ? db.inspections.where('businessId').equals(id).reverse().sortBy('date') : [],
    [id]
  );
  const ncs = useLiveQuery(
    () => id ? db.nonConformances.where('businessId').equals(id).toArray() : [],
    [id]
  );

  if (!business) {
    return <div className="text-center py-16 text-[#64748b]">Duke ngarkuar...</div>;
  }

  const openNCs = ncs?.filter((nc) => nc.status !== 'zgjidhur') || [];
  const computedRisk: RiskLevel = openNCs.some((nc) => nc.riskLevel === 'kritik')
    ? 'kritik'
    : openNCs.some((nc) => nc.riskLevel === 'i_larte')
    ? 'i_larte'
    : openNCs.some((nc) => nc.riskLevel === 'mesatar')
    ? 'mesatar'
    : 'i_ulet';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'inspections', label: 'Inspektimet' },
    { key: 'ncs', label: 'Mospërputhjet' },
    { key: 'docs', label: 'Dokumentacioni' },
    { key: 'history', label: 'Historia' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/businesses')} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#0f172a]">{business.name}</h1>
            <BusinessTypeBadge type={business.type} />
            <RiskBadge level={computedRisk} />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#64748b] mt-1">
            <MapPin size={14} />
            {business.city}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)} size="sm">Ndrysho</Button>
          <Button icon={<ClipboardPlus size={14} />} onClick={() => navigate(`/app/inspections/new?businessId=${business.id}`)} size="sm">Inspektim i ri</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e2e8f0]">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#1a5c35] text-[#1a5c35]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'inspections' && (
        <div>
          {!inspections || inspections.length === 0 ? (
            <EmptyState
              title="Nuk ka inspektime"
              description="Nuk ka asnjë inspektim për këtë biznes"
              action={
                <Button icon={<ClipboardPlus size={14} />} onClick={() => navigate(`/app/inspections/new?businessId=${business.id}`)}>
                  Krijo inspektim të ri
                </Button>
              }
            />
          ) : (
            <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="text-left px-4 py-3 font-medium text-[#64748b]">Nr. Serial</th>
                    <th className="text-left px-4 py-3 font-medium text-[#64748b]">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-[#64748b]">Lloji</th>
                    <th className="text-left px-4 py-3 font-medium text-[#64748b]">Rreziku</th>
                    <th className="text-left px-4 py-3 font-medium text-[#64748b]">Statusi</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((ins) => (
                    <tr
                      key={ins.id}
                      onClick={() => navigate(`/app/inspections/${ins.id}`)}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{ins.serialNumber}</td>
                      <td className="px-4 py-3">{format(new Date(ins.date), 'd MMM yyyy', { locale: sq })}</td>
                      <td className="px-4 py-3 capitalize">{ins.type}</td>
                      <td className="px-4 py-3"><RiskBadge level={ins.riskLevel} size="sm" /></td>
                      <td className="px-4 py-3"><InspectionStatusBadge status={ins.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'ncs' && (
        <div>
          {!ncs || ncs.length === 0 ? (
            <EmptyState title="Nuk ka mospërputhje" description="Nuk ka mospërputhje për këtë biznes" />
          ) : (
            <div className="space-y-3">
              {ncs.map((nc) => (
                <div key={nc.id} className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-[#0f172a]">{nc.title}</h3>
                      <p className="text-sm text-[#64748b] mt-1">{nc.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={nc.riskLevel} size="sm" />
                      <NCStatusBadge status={nc.status} />
                    </div>
                  </div>
                  {nc.deadline && (
                    <p className="text-xs text-[#64748b] mt-2">Afati: {format(new Date(nc.deadline), 'd MMM yyyy', { locale: sq })}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'docs' && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <div className="space-y-4">
            {[
              { label: 'Licenca ushqimore', data: business.foodLicense },
              { label: 'Çertifikata HACCP', data: business.haccpCertificate },
              { label: 'Kontrata dëmtuesish', data: business.pestControl },
            ].map((doc) => (
              <div key={doc.label} className="flex items-center justify-between py-3 border-b border-[#f1f5f9]">
                <span className="text-sm font-medium text-[#0f172a]">{doc.label}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${doc.data.has ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                    {doc.data.has ? 'Ka' : "S'ka"}
                  </span>
                  {doc.data.expiryDate && (
                    <span className="text-xs text-[#64748b]">
                      Skadon: {format(new Date(doc.data.expiryDate), 'd MMM yyyy', { locale: sq })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <EmptyState title="Historia" description="Regjistri i ndryshimeve do të shfaqet këtu" />
      )}

      <BusinessFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        business={business}
      />
    </div>
  );
}
