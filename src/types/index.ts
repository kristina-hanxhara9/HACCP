export type RiskLevel = 'kritik' | 'i_larte' | 'mesatar' | 'i_ulet';

export type BusinessType = 'furre' | 'pasticeri' | 'kafene' | 'restorant' | 'minimarket' | 'njesi_prodhimi' | 'tjeter';

export type InspectionType = 'rutine' | 'ndjekje' | 'urgjent' | 'certifikim';

export type InspectionStatus = 'draft' | 'perfunduar';

export type NCStatus = 'hapur' | 'ne_procesim' | 'zgjidhur';

export type NCCategory =
  | 'higijene_ambienti'
  | 'temperature'
  | 'dokumentacion'
  | 'higjiena_stafit'
  | 'certifikata'
  | 'kontrolli_demtuesve'
  | 'infrastrukture'
  | 'tjeter';

export type ChecklistRating = 'mire' | 'pranueshem' | 'dobet' | 'na';

export type DocumentStatus = 'ka' | 'jo' | 'mungon';

export type HealthCertStatus = 'te_gjitha_ne_date' | 'disa_te_skaduara' | 'mungojne';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  nipt?: string;
  registrationDate?: string;
  address: string;
  city: string;
  postalCode?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  altPhone?: string;
  employeeCount?: number;
  workSchedule?: string;
  area?: number;
  defaultRisk: RiskLevel;
  notes?: string;
  foodLicense: { has: boolean; expiryDate?: string };
  haccpCertificate: { has: boolean; expiryDate?: string };
  pestControl: { has: boolean; expiryDate?: string };
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  rating: ChecklistRating;
  comment: string;
}

export interface TemperatureReading {
  id: string;
  label: string;
  value: number | null;
  minTemp: number;
  maxTemp: number;
  comment: string;
}

export interface DocumentCheckItem {
  id: string;
  label: string;
  status: DocumentStatus;
  updatedDate: string;
  comment: string;
}

export interface NonConformance {
  id: string;
  inspectionId: string;
  businessId: string;
  title: string;
  category: NCCategory;
  description: string;
  riskLevel: RiskLevel;
  correctiveAction: string;
  deadline: string;
  responsiblePerson: string;
  photo?: string; // base64
  status: NCStatus;
  resolution?: {
    actions: string;
    date: string;
    evidence?: string; // base64
  };
  createdAt: string;
  updatedAt: string;
}

export interface StaffAssessment {
  checklist: ChecklistItem[];
  employeeCount: number | null;
  healthCertStatus: HealthCertStatus;
  lastTrainingDate: string;
  nextTrainingDate: string;
  staffComment: string;
}

export interface Inspection {
  id: string;
  serialNumber: string;
  businessId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: InspectionType;
  inspector: string;
  entryNotes: string;
  environmentChecklist: ChecklistItem[];
  temperatures: TemperatureReading[];
  staffAssessment: StaffAssessment;
  documentChecklist: DocumentCheckItem[];
  nonConformanceIds: string[];
  finalNotes: string;
  nextSteps: string;
  suggestedNextDate: string;
  signature?: string; // base64
  status: InspectionStatus;
  riskLevel: RiskLevel;
  aiReport?: string;
  aiReportHistory?: Array<{ text: string; generatedAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  type: 'inspection_created' | 'inspection_finalized' | 'nc_created' | 'nc_resolved' | 'report_generated' | 'business_created' | 'business_updated';
  description: string;
  entityId: string;
  entityType: 'inspection' | 'business' | 'nonconformance';
  timestamp: string;
}

export interface Settings {
  inspector: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    bio: string;
    photo?: string; // base64
  };
  signature?: string; // base64
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    logo?: string; // base64
  };
  password: string;
  apiKey: string;
}

// Label maps for display
export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  furre: 'Furrë',
  pasticeri: 'Pastiçeri',
  kafene: 'Kafene',
  restorant: 'Restorant',
  minimarket: 'Minimarket',
  njesi_prodhimi: 'Njësi Prodhimi',
  tjeter: 'Tjetër',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  kritik: 'Kritik',
  i_larte: 'I Lartë',
  mesatar: 'Mesatar',
  i_ulet: 'I Ulët',
};

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  rutine: 'Rutinë',
  ndjekje: 'Ndjekje',
  urgjent: 'Urgjent',
  certifikim: 'Certifikim',
};

export const NC_CATEGORY_LABELS: Record<NCCategory, string> = {
  higijene_ambienti: 'Higjienë ambienti',
  temperature: 'Temperaturë jashtë kufirit',
  dokumentacion: 'Dokumentacion HACCP',
  higjiena_stafit: 'Higjiena e stafit',
  certifikata: 'Certifikata / Licenca',
  kontrolli_demtuesve: 'Kontrolli i dëmtuesve',
  infrastrukture: 'Infrastrukturë / Pajisje',
  tjeter: 'Tjetër',
};

export const NC_STATUS_LABELS: Record<NCStatus, string> = {
  hapur: 'Hapur',
  ne_procesim: 'Në Procesim',
  zgjidhur: 'Zgjidhur',
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  draft: 'Draft',
  perfunduar: 'Përfunduar',
};

export const HEALTH_CERT_LABELS: Record<HealthCertStatus, string> = {
  te_gjitha_ne_date: 'Të gjitha në datë',
  disa_te_skaduara: 'Disa të skaduara',
  mungojne: 'Mungojnë',
};

export const DOC_STATUS_LABELS: Record<DocumentStatus, string> = {
  ka: 'Ka',
  jo: 'Jo',
  mungon: 'Mungon',
};
