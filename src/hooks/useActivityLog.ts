import { db } from '@/lib/db';
import type { ActivityLogEntry } from '@/types';

type ActivityType = ActivityLogEntry['type'];

export function useActivityLog() {
  const log = async (
    type: ActivityType,
    description: string,
    entityId: string,
    entityType: ActivityLogEntry['entityType']
  ) => {
    await db.activityLog.add({
      id: crypto.randomUUID(),
      type,
      description,
      entityId,
      entityType,
      timestamp: new Date().toISOString(),
    });
  };

  return { log };
}
