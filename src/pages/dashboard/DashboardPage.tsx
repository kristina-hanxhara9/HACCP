import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format, subDays, differenceInDays, isAfter, isBefore, startOfMonth } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import { RiskBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Building2,
  ClipboardCheck,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { RiskLevel } from '@/types';
import { RISK_LEVEL_LABELS } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const businesses = useLiveQuery(() => db.businesses.toArray());
  const inspections = useLiveQuery(() => db.inspections.toArray());
  const ncs = useLiveQuery(() => db.nonConformances.toArray());
  const activities = useLiveQuery(() =>
    db.activityLog.orderBy('timestamp').reverse().limit(8).toArray()
  );

  if (!businesses || !inspections || !ncs || !activities) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">Pasqyra</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const ninetyDaysAgo = subDays(now, 90);

  const inspectionsThisMonth = inspections.filter(
    (i) => isAfter(new Date(i.date), monthStart)
  ).length;

  const openNCs = ncs.filter((nc) => nc.status !== 'zgjidhur').length;

  const criticalInspections = inspections.filter(
    (i) => i.riskLevel === 'kritik' && isAfter(new Date(i.date), ninetyDaysAgo)
  ).length;

  // Risk distribution from last 90 days
  const recentInspections = inspections.filter(
    (i) => isAfter(new Date(i.date), ninetyDaysAgo)
  );
  const riskCounts: Record<RiskLevel, number> = {
    i_ulet: recentInspections.filter((i) => i.riskLevel === 'i_ulet').length,
    mesatar: recentInspections.filter((i) => i.riskLevel === 'mesatar').length,
    i_larte: recentInspections.filter((i) => i.riskLevel === 'i_larte').length,
    kritik: recentInspections.filter((i) => i.riskLevel === 'kritik').length,
  };

  const riskChartData = [
    { name: RISK_LEVEL_LABELS.i_ulet, value: riskCounts.i_ulet, color: '#16a34a' },
    { name: RISK_LEVEL_LABELS.mesatar, value: riskCounts.mesatar, color: '#d97706' },
    { name: RISK_LEVEL_LABELS.i_larte, value: riskCounts.i_larte, color: '#ea580c' },
    { name: RISK_LEVEL_LABELS.kritik, value: riskCounts.kritik, color: '#dc2626' },
  ];

  // Upcoming deadlines: open NCs due in next 14 days
  const fourteenDaysFromNow = subDays(now, -14);
  const upcomingNCs = ncs
    .filter(
      (nc) =>
        nc.status !== 'zgjidhur' &&
        nc.deadline &&
        isBefore(new Date(nc.deadline), fourteenDaysFromNow)
    )
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Businesses at risk: those with open critical or high NCs
  const atRiskBusinessIds = new Set(
    ncs
      .filter(
        (nc) =>
          nc.status !== 'zgjidhur' &&
          (nc.riskLevel === 'kritik' || nc.riskLevel === 'i_larte')
      )
      .map((nc) => nc.businessId)
  );
  const atRiskBusinesses = businesses.filter((b) => atRiskBusinessIds.has(b.id));

  const kpis = [
    { label: 'Biznese të regjistruara', value: businesses.length, icon: Building2, color: 'text-[#1a5c35]', bg: 'bg-[#f0f9f1]' },
    { label: 'Inspektime këtë muaj', value: inspectionsThisMonth, icon: ClipboardCheck, color: 'text-[#2563eb]', bg: 'bg-[#eff6ff]' },
    { label: 'Mospërputhje të hapura', value: openNCs, icon: AlertTriangle, color: 'text-[#d97706]', bg: 'bg-[#fffbeb]' },
    { label: 'Inspektime kritike', value: criticalInspections, icon: ShieldAlert, color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'inspection_created':
      case 'inspection_finalized':
        return <ClipboardCheck size={14} />;
      case 'nc_created':
      case 'nc_resolved':
        return <AlertTriangle size={14} />;
      case 'report_generated':
        return <TrendingUp size={14} />;
      default:
        return <Activity size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Pasqyra</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-[#e2e8f0] p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#64748b] font-medium">{kpi.label}</span>
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0f172a]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-base font-semibold text-[#0f172a] mb-4">Shpërndarja e rrezikut (90 ditë)</h2>
          {recentInspections.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">Nuk ka inspektime në 90 ditët e fundit</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskChartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(value) => [`${value} inspektime`, '']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {riskChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <h2 className="text-base font-semibold text-[#0f172a] mb-4">Aktiviteti i fundit</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">Nuk ka aktivitet ende</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b] flex-shrink-0 mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0f172a] truncate">{act.description}</p>
                    <p className="text-xs text-[#94a3b8]">
                      {format(new Date(act.timestamp), "d MMM yyyy, HH:mm", { locale: sq })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-[#d97706]" />
          <h2 className="text-base font-semibold text-[#0f172a]">Afate të afërta (14 ditë)</h2>
        </div>
        {upcomingNCs.length === 0 ? (
          <p className="text-sm text-[#94a3b8] text-center py-6">Nuk ka afate brenda 14 ditëve</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Biznesi</th>
                  <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Përshkrimi</th>
                  <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Rreziku</th>
                  <th className="text-right py-2 font-medium text-[#64748b]">Ditë të mbetura</th>
                </tr>
              </thead>
              <tbody>
                {upcomingNCs.slice(0, 10).map((nc) => {
                  const daysLeft = differenceInDays(new Date(nc.deadline), now);
                  const business = businesses.find((b) => b.id === nc.businessId);
                  return (
                    <tr key={nc.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                      <td className="py-3 pr-4 font-medium text-[#0f172a]">
                        {business?.name || '—'}
                      </td>
                      <td className="py-3 pr-4 text-[#64748b] max-w-[200px] truncate">
                        {nc.title}
                      </td>
                      <td className="py-3 pr-4">
                        <RiskBadge level={nc.riskLevel} size="sm" />
                      </td>
                      <td className={`py-3 text-right font-mono font-semibold ${daysLeft < 0 ? 'text-[#dc2626]' : daysLeft <= 3 ? 'text-[#d97706]' : 'text-[#64748b]'}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)} ditë vonë` : `${daysLeft} ditë`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Businesses at Risk */}
      {atRiskBusinesses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#0f172a] mb-3 flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#dc2626]" />
            Biznese në rrezik
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {atRiskBusinesses.map((biz) => {
              const bizNCs = ncs.filter(
                (nc) => nc.businessId === biz.id && nc.status !== 'zgjidhur'
              );
              const critCount = bizNCs.filter((nc) => nc.riskLevel === 'kritik').length;
              const highCount = bizNCs.filter((nc) => nc.riskLevel === 'i_larte').length;
              return (
                <div
                  key={biz.id}
                  onClick={() => navigate(`/app/businesses/${biz.id}`)}
                  className="bg-white rounded-xl border border-[#fecaca] p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#0f172a]">{biz.name}</h3>
                    <RiskBadge level={critCount > 0 ? 'kritik' : 'i_larte'} size="sm" />
                  </div>
                  <p className="text-xs text-[#64748b] mb-2">{biz.city}</p>
                  <div className="flex gap-3 text-xs">
                    {critCount > 0 && (
                      <span className="text-[#dc2626] font-medium">{critCount} kritike</span>
                    )}
                    {highCount > 0 && (
                      <span className="text-[#ea580c] font-medium">{highCount} të larta</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
