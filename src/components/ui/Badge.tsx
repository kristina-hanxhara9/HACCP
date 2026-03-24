import type { RiskLevel, NCStatus, InspectionStatus, BusinessType } from '@/types';
import { RISK_LEVEL_LABELS, NC_STATUS_LABELS, INSPECTION_STATUS_LABELS, BUSINESS_TYPE_LABELS } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const styles: Record<RiskLevel, string> = {
    kritik: 'bg-[#dc2626] text-white',
    i_larte: 'bg-[#ea580c] text-white',
    mesatar: 'bg-[#d97706] text-[#0f172a]',
    i_ulet: 'bg-[#16a34a] text-white',
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${styles[level]} ${sizeClass}`}>
      {level === 'kritik' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-dot" />}
      {RISK_LEVEL_LABELS[level]}
    </span>
  );
}

interface NCStatusBadgeProps {
  status: NCStatus;
}

export function NCStatusBadge({ status }: NCStatusBadgeProps) {
  const styles: Record<NCStatus, string> = {
    hapur: 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
    ne_procesim: 'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]',
    zgjidhur: 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]',
  };

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {NC_STATUS_LABELS[status]}
    </span>
  );
}

interface InspectionStatusBadgeProps {
  status: InspectionStatus;
}

export function InspectionStatusBadge({ status }: InspectionStatusBadgeProps) {
  const styles: Record<InspectionStatus, string> = {
    draft: 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]',
    perfunduar: 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]',
  };

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
      {INSPECTION_STATUS_LABELS[status]}
    </span>
  );
}

interface BusinessTypeBadgeProps {
  type: BusinessType;
}

export function BusinessTypeBadge({ type }: BusinessTypeBadgeProps) {
  return (
    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-[#f0f9f1] text-[#1a5c35] border border-[#d1fae5]">
      {BUSINESS_TYPE_LABELS[type]}
    </span>
  );
}
