import Dexie, { type EntityTable } from 'dexie';
import type { Business, Inspection, NonConformance, ActivityLogEntry, Settings } from '@/types';

class HACCPDatabase extends Dexie {
  businesses!: EntityTable<Business, 'id'>;
  inspections!: EntityTable<Inspection, 'id'>;
  nonConformances!: EntityTable<NonConformance, 'id'>;
  activityLog!: EntityTable<ActivityLogEntry, 'id'>;
  settings!: EntityTable<Settings & { id: string }, 'id'>;

  constructor() {
    super('haccp_platform');

    this.version(1).stores({
      businesses: 'id, name, type, city, createdAt, updatedAt',
      inspections: 'id, serialNumber, businessId, date, type, status, riskLevel, createdAt',
      nonConformances: 'id, inspectionId, businessId, category, riskLevel, status, deadline, createdAt',
      activityLog: 'id, type, entityId, timestamp',
      settings: 'id',
    });
  }
}

export const db = new HACCPDatabase();

// Initialize default settings if they don't exist
export async function initializeDefaults() {
  const existing = await db.settings.get('main');
  if (!existing) {
    await db.settings.put({
      id: 'main',
      inspector: {
        fullName: 'Ersida Reci',
        title: 'Inspektor HACCP',
        email: '',
        phone: '',
        bio: '',
      },
      company: {
        name: 'SiguriUshqimore HACCP',
        email: '',
        phone: '',
        address: 'Shqipëri',
        website: '',
      },
      password: 'haccp2026',
      apiKey: '',
    });
  }

  // Initialize serial number counter
  if (!localStorage.getItem('haccp_serial_counter')) {
    localStorage.setItem('haccp_serial_counter', '0');
  }
  if (!localStorage.getItem('haccp_serial_year')) {
    localStorage.setItem('haccp_serial_year', new Date().getFullYear().toString());
  }
}

export function generateSerialNumber(): string {
  const currentYear = new Date().getFullYear();
  const storedYear = parseInt(localStorage.getItem('haccp_serial_year') || '0');

  let counter: number;
  if (currentYear !== storedYear) {
    counter = 1;
    localStorage.setItem('haccp_serial_year', currentYear.toString());
  } else {
    counter = parseInt(localStorage.getItem('haccp_serial_counter') || '0') + 1;
  }

  localStorage.setItem('haccp_serial_counter', counter.toString());
  return `HACCP-${currentYear}-${counter.toString().padStart(4, '0')}`;
}
