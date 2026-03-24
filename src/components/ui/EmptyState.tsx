import type { ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-4 text-[#94a3b8]">
        {icon || <FolderOpen size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-[#0f172a] mb-1">{title}</h3>
      <p className="text-sm text-[#64748b] text-center max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
