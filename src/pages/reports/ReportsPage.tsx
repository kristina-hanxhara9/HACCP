import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import { FileText, Eye } from 'lucide-react';
import { RiskBadge, InspectionStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';

export function ReportsPage() {
  const navigate = useNavigate();
  const inspections = useLiveQuery(() =>
    db.inspections.where('status').equals('perfunduar').reverse().sortBy('date')
  );
  const businesses = useLiveQuery(() => db.businesses.toArray());

  if (!inspections || !businesses) return <div className="space-y-6"><h1 className="text-2xl font-bold">Raportet</h1><TableSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Raportet</h1>
      {inspections.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="Nuk ka raporte"
          description="Finalizoni një inspektim për të gjeneruar raportin e parë"
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="text-left px-4 py-3 font-medium text-[#64748b]">Nr. Serial</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748b]">Biznesi</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748b]">Data</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748b]">Rreziku</th>
                <th className="text-left px-4 py-3 font-medium text-[#64748b]">Raporti AI</th>
                <th className="text-right px-4 py-3 font-medium text-[#64748b]">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((ins) => {
                const biz = businesses.find((b) => b.id === ins.businessId);
                return (
                  <tr key={ins.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{ins.serialNumber}</td>
                    <td className="px-4 py-3 font-medium text-[#0f172a]">{biz?.name || '—'}</td>
                    <td className="px-4 py-3 text-[#64748b]">{format(new Date(ins.date), 'd MMM yyyy', { locale: sq })}</td>
                    <td className="px-4 py-3"><RiskBadge level={ins.riskLevel} size="sm" /></td>
                    <td className="px-4 py-3">
                      {ins.aiReport ? (
                        <span className="text-xs font-medium text-[#16a34a]">Gjeneruar</span>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">Mungon</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/app/reports/${ins.id}`)}
                        className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]"
                        title="Shiko raportin"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
