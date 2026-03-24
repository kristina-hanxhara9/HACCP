import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateSerialNumber } from '@/lib/db';
import {
  DEFAULT_ENVIRONMENT_CHECKLIST,
  DEFAULT_TEMPERATURES,
  DEFAULT_STAFF_CHECKLIST,
  DEFAULT_DOCUMENT_CHECKLIST,
} from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { RiskBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type {
  Inspection,
  ChecklistItem,
  TemperatureReading,
  DocumentCheckItem,
  NonConformance,
  RiskLevel,
  NCCategory,
  ChecklistRating,
  DocumentStatus,
  InspectionType,
  HealthCertStatus,
  StaffAssessment,
} from '@/types';
import {
  INSPECTION_TYPE_LABELS,
  RISK_LEVEL_LABELS,
  NC_CATEGORY_LABELS,
} from '@/types';

const STEP_LABELS = [
  'Informacion Bazë',
  'Higjiena e Ambienteve',
  'Temperaturat',
  'Stafi & Higjiena',
  'Dokumentacioni',
  'Mospërputhjet',
  'Vlerësimi Final',
];

function createId() {
  return crypto.randomUUID();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addIds(items: any[]): any[] {
  return items.map((item) => ({ ...item, id: createId() }));
}

export function InspectionWizardPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { log } = useActivityLog();
  const isEdit = !!id;

  const businesses = useLiveQuery(() => db.businesses.toArray());
  const settings = useLiveQuery(() => db.settings.get('main'));
  const existingInspection = useLiveQuery(() => (id ? db.inspections.get(id) : undefined), [id]);
  const existingNCs = useLiveQuery(
    () => (id ? db.nonConformances.where('inspectionId').equals(id).toArray() : []),
    [id]
  );

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [businessId, setBusinessId] = useState(searchParams.get('businessId') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [inspType, setInspType] = useState<InspectionType>('rutine');
  const [inspector, setInspector] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  // Step 2: Environment
  const [envChecklist, setEnvChecklist] = useState<ChecklistItem[]>(() => addIds(DEFAULT_ENVIRONMENT_CHECKLIST));

  // Step 3: Temperatures
  const [temperatures, setTemperatures] = useState<TemperatureReading[]>(() => addIds(DEFAULT_TEMPERATURES));

  // Step 4: Staff
  const [staffChecklist, setStaffChecklist] = useState<ChecklistItem[]>(() => addIds(DEFAULT_STAFF_CHECKLIST));
  const [staffEmployeeCount, setStaffEmployeeCount] = useState<number | null>(null);
  const [healthCertStatus, setHealthCertStatus] = useState<HealthCertStatus>('te_gjitha_ne_date');
  const [lastTrainingDate, setLastTrainingDate] = useState('');
  const [nextTrainingDate, setNextTrainingDate] = useState('');
  const [staffComment, setStaffComment] = useState('');

  // Step 5: Documents
  const [docChecklist, setDocChecklist] = useState<DocumentCheckItem[]>(() => addIds(DEFAULT_DOCUMENT_CHECKLIST));

  // Step 6: Non-Conformances
  const [ncList, setNcList] = useState<NonConformance[]>([]);
  const [expandedNC, setExpandedNC] = useState<string | null>(null);

  // Step 7: Final
  const [finalNotes, setFinalNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [suggestedNextDate, setSuggestedNextDate] = useState('');

  // Initialize from existing inspection
  useEffect(() => {
    if (existingInspection) {
      setBusinessId(existingInspection.businessId);
      setDate(existingInspection.date);
      setStartTime(existingInspection.startTime);
      setEndTime(existingInspection.endTime);
      setInspType(existingInspection.type);
      setInspector(existingInspection.inspector);
      setSerialNumber(existingInspection.serialNumber);
      setEntryNotes(existingInspection.entryNotes);
      setEnvChecklist(existingInspection.environmentChecklist);
      setTemperatures(existingInspection.temperatures);
      setStaffChecklist(existingInspection.staffAssessment.checklist);
      setStaffEmployeeCount(existingInspection.staffAssessment.employeeCount);
      setHealthCertStatus(existingInspection.staffAssessment.healthCertStatus);
      setLastTrainingDate(existingInspection.staffAssessment.lastTrainingDate);
      setNextTrainingDate(existingInspection.staffAssessment.nextTrainingDate);
      setStaffComment(existingInspection.staffAssessment.staffComment);
      setDocChecklist(existingInspection.documentChecklist);
      setFinalNotes(existingInspection.finalNotes);
      setNextSteps(existingInspection.nextSteps);
      setSuggestedNextDate(existingInspection.suggestedNextDate);
    }
  }, [existingInspection]);

  useEffect(() => {
    if (existingNCs && existingNCs.length > 0 && ncList.length === 0) {
      setNcList(existingNCs);
    }
  }, [existingNCs]);

  useEffect(() => {
    if (!isEdit && !serialNumber) {
      setSerialNumber(generateSerialNumber());
    }
  }, [isEdit, serialNumber]);

  useEffect(() => {
    if (settings?.inspector?.fullName && !inspector) {
      setInspector(settings.inspector.fullName);
    }
  }, [settings, inspector]);

  // Auto-generate NCs from out-of-range temperatures
  useEffect(() => {
    const outOfRange = temperatures.filter((t) => {
      if (t.value === null) return false;
      return t.value < t.minTemp || t.value > t.maxTemp;
    });

    outOfRange.forEach((t) => {
      const alreadyExists = ncList.some(
        (nc) => nc.category === 'temperature' && nc.title.includes(t.label)
      );
      if (!alreadyExists && t.value !== null) {
        const nc: NonConformance = {
          id: createId(),
          inspectionId: id || '',
          businessId,
          title: `Temperaturë jashtë kufirit: ${t.label}`,
          category: 'temperature',
          description: `${t.label}: ${t.value}°C (kufiri: ${t.minTemp}°C deri ${t.maxTemp}°C)`,
          riskLevel: t.value > t.maxTemp + 5 || t.value < t.minTemp - 5 ? 'kritik' : 'i_larte',
          correctiveAction: '',
          deadline: '',
          responsiblePerson: '',
          status: 'hapur',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNcList((prev) => [...prev, nc]);
      }
    });
  }, [temperatures]);

  const computeRiskLevel = useCallback((): RiskLevel => {
    if (ncList.length === 0) return 'i_ulet';
    if (ncList.some((nc) => nc.riskLevel === 'kritik')) return 'kritik';
    if (ncList.some((nc) => nc.riskLevel === 'i_larte')) return 'i_larte';
    if (ncList.some((nc) => nc.riskLevel === 'mesatar')) return 'mesatar';
    return 'i_ulet';
  }, [ncList]);

  const envScore = (() => {
    const rated = envChecklist.filter((c) => c.rating !== 'na');
    if (rated.length === 0) return 0;
    const good = rated.filter((c) => c.rating === 'mire').length;
    return Math.round((good / rated.length) * 100);
  })();

  const docCompleteness = (() => {
    const withStatus = docChecklist.filter((d) => d.status === 'ka').length;
    return Math.round((withStatus / docChecklist.length) * 100);
  })();

  const buildInspection = (status: 'draft' | 'perfunduar'): Inspection => {
    const now = new Date().toISOString();
    return {
      id: id || createId(),
      serialNumber,
      businessId,
      date,
      startTime,
      endTime,
      type: inspType,
      inspector,
      entryNotes,
      environmentChecklist: envChecklist,
      temperatures,
      staffAssessment: {
        checklist: staffChecklist,
        employeeCount: staffEmployeeCount,
        healthCertStatus,
        lastTrainingDate,
        nextTrainingDate,
        staffComment,
      },
      documentChecklist: docChecklist,
      nonConformanceIds: ncList.map((nc) => nc.id),
      finalNotes,
      nextSteps,
      suggestedNextDate,
      signature: settings?.signature,
      status,
      riskLevel: computeRiskLevel(),
      aiReport: existingInspection?.aiReport,
      aiReportHistory: existingInspection?.aiReportHistory,
      createdAt: existingInspection?.createdAt || now,
      updatedAt: now,
    };
  };

  const saveInspection = async (status: 'draft' | 'perfunduar') => {
    if (!businessId) {
      toast.error('Zgjidhni një biznes');
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const inspection = buildInspection(status);
      await db.inspections.put(inspection);

      // Save NCs
      for (const nc of ncList) {
        await db.nonConformances.put({
          ...nc,
          inspectionId: inspection.id,
          businessId,
        });
      }

      if (status === 'perfunduar') {
        await log('inspection_finalized', `Inspektimi ${serialNumber} u finalizua`, inspection.id, 'inspection');
      } else if (!isEdit) {
        await log('inspection_created', `Inspektimi ${serialNumber} u krijua`, inspection.id, 'inspection');
      }

      for (const nc of ncList) {
        if (!existingNCs?.find((enc) => enc.id === nc.id)) {
          await log('nc_created', `Mospërputhje: ${nc.title}`, nc.id, 'nonconformance');
        }
      }

      toast.success(status === 'draft' ? 'Draft u ruajt me sukses' : 'Inspektimi u finalizua');
      navigate(status === 'perfunduar' ? `/app/reports/${inspection.id}` : '/app/inspections');
    } catch (err) {
      toast.error('Gabim gjatë ruajtjes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateEnvItem = (itemId: string, field: 'rating' | 'comment', value: string) => {
    setEnvChecklist((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, [field]: value } : c))
    );
  };

  const updateTemp = (itemId: string, field: keyof TemperatureReading, value: unknown) => {
    setTemperatures((prev) =>
      prev.map((t) => (t.id === itemId ? { ...t, [field]: value } : t))
    );
  };

  const addTemperature = () => {
    setTemperatures((prev) => [
      ...prev,
      { id: createId(), label: '', value: null, minTemp: -2, maxTemp: 8, comment: '' },
    ]);
  };

  const updateStaffItem = (itemId: string, field: 'rating' | 'comment', value: string) => {
    setStaffChecklist((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, [field]: value } : c))
    );
  };

  const updateDocItem = (itemId: string, field: keyof DocumentCheckItem, value: string) => {
    setDocChecklist((prev) =>
      prev.map((d) => (d.id === itemId ? { ...d, [field]: value } : d))
    );
  };

  const addNC = () => {
    const nc: NonConformance = {
      id: createId(),
      inspectionId: id || '',
      businessId,
      title: '',
      category: 'higijene_ambienti',
      description: '',
      riskLevel: 'mesatar',
      correctiveAction: '',
      deadline: '',
      responsiblePerson: '',
      status: 'hapur',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNcList((prev) => [...prev, nc]);
    setExpandedNC(nc.id);
  };

  const updateNC = (ncId: string, updates: Partial<NonConformance>) => {
    setNcList((prev) =>
      prev.map((nc) => (nc.id === ncId ? { ...nc, ...updates, updatedAt: new Date().toISOString() } : nc))
    );
  };

  const removeNC = (ncId: string) => {
    setNcList((prev) => prev.filter((nc) => nc.id !== ncId));
  };

  const isLocked = existingInspection?.status === 'perfunduar';

  if (!businesses) return <div className="text-center py-16 text-[#64748b]">Duke ngarkuar...</div>;

  const ratingOptions: { value: ChecklistRating; label: string }[] = [
    { value: 'mire', label: 'Mirë' },
    { value: 'pranueshem', label: 'Pranueshem' },
    { value: 'dobet', label: 'Dobët' },
    { value: 'na', label: 'N/A' },
  ];

  const ratingColor = (r: ChecklistRating) => {
    switch (r) {
      case 'mire': return 'bg-[#16a34a] text-white';
      case 'pranueshem': return 'bg-[#d97706] text-white';
      case 'dobet': return 'bg-[#dc2626] text-white';
      default: return 'bg-[#f1f5f9] text-[#64748b]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/inspections')} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            {isEdit ? `Inspektimi ${serialNumber}` : 'Inspektim i Ri'}
          </h1>
          {isLocked && <p className="text-xs text-[#d97706]">Ky inspektim është i finalizuar (vetëm lexim)</p>}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex items-center justify-between overflow-x-auto gap-1">
          {STEP_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                i === step
                  ? 'bg-[#1a5c35] text-white'
                  : i < step
                  ? 'bg-[#f0f9f1] text-[#1a5c35]'
                  : 'bg-[#f1f5f9] text-[#64748b]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        {/* STEP 1: Basic Info */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Informacion Bazë</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#0f172a]">Biznesi <span className="text-[#dc2626]">*</span></label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5c35]"
                >
                  <option value="">Zgjidhni biznesin</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                  ))}
                </select>
              </div>
              <Input label="Data e inspektimit" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isLocked} required />
              <Input label="Ora e fillimit" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isLocked} />
              <Input label="Ora e mbarimit" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isLocked} />
              <Select
                label="Lloji i inspektimit"
                value={inspType}
                onChange={(e) => setInspType(e.target.value as InspectionType)}
                options={Object.entries(INSPECTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                disabled={isLocked}
              />
              <Input label="Inspektori" value={inspector} onChange={(e) => setInspector(e.target.value)} disabled={isLocked} />
              <Input label="Numri serial" value={serialNumber} disabled mono />
            </div>
            <Textarea label="Vërejtje hyrëse" value={entryNotes} onChange={(e) => setEntryNotes(e.target.value)} disabled={isLocked} placeholder="Shënime gjatë mbërritjes..." rows={3} />
          </div>
        )}

        {/* STEP 2: Environment */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Higjiena e Ambienteve</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b] w-[40%]">Elementi</th>
                    <th className="text-center py-2 px-2 font-medium text-[#64748b]">Vlerësimi</th>
                    <th className="text-left py-2 pl-4 font-medium text-[#64748b]">Koment</th>
                  </tr>
                </thead>
                <tbody>
                  {envChecklist.map((item) => (
                    <tr key={item.id} className="border-b border-[#f1f5f9]">
                      <td className="py-3 pr-4 text-[#0f172a]">{item.label}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 justify-center">
                          {ratingOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => !isLocked && updateEnvItem(item.id, 'rating', opt.value)}
                              disabled={isLocked}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                item.rating === opt.value ? ratingColor(opt.value) : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pl-4">
                        <input
                          type="text"
                          value={item.comment}
                          onChange={(e) => updateEnvItem(item.id, 'comment', e.target.value)}
                          disabled={isLocked}
                          placeholder="Koment..."
                          className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded focus:outline-none focus:ring-1 focus:ring-[#1a5c35]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Environment Score */}
            <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-lg">
              <span className="text-sm font-medium text-[#64748b]">Rezultati i ambientit:</span>
              <div className="flex-1 h-3 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${envScore >= 75 ? 'bg-[#16a34a]' : envScore >= 50 ? 'bg-[#d97706]' : 'bg-[#dc2626]'}`}
                  style={{ width: `${envScore}%` }}
                />
              </div>
              <span className={`text-lg font-bold ${envScore >= 75 ? 'text-[#16a34a]' : envScore >= 50 ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                {envScore}%
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Temperatures */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Temperaturat</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Pajisja</th>
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Kufiri</th>
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b]">°C</th>
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Statusi</th>
                    <th className="text-left py-2 font-medium text-[#64748b]">Koment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {temperatures.map((t) => {
                    const isOutOfRange = t.value !== null && (t.value < t.minTemp || t.value > t.maxTemp);
                    const isWarning = t.value !== null && !isOutOfRange && (t.value <= t.minTemp + 1 || t.value >= t.maxTemp - 1);
                    return (
                      <tr key={t.id} className="border-b border-[#f1f5f9]">
                        <td className="py-3 pr-4">
                          <input
                            type="text"
                            value={t.label}
                            onChange={(e) => updateTemp(t.id, 'label', e.target.value)}
                            disabled={isLocked}
                            className="px-2 py-1 text-sm border border-[#e2e8f0] rounded w-full focus:outline-none focus:ring-1 focus:ring-[#1a5c35]"
                          />
                        </td>
                        <td className="py-3 pr-4 text-xs text-[#64748b] font-mono whitespace-nowrap">
                          {t.minTemp}°C → {t.maxTemp}°C
                        </td>
                        <td className="py-3 pr-4">
                          <input
                            type="number"
                            step="0.1"
                            value={t.value ?? ''}
                            onChange={(e) => updateTemp(t.id, 'value', e.target.value ? parseFloat(e.target.value) : null)}
                            disabled={isLocked}
                            className={`w-20 px-2 py-1 text-sm font-mono border rounded text-center focus:outline-none focus:ring-1 focus:ring-[#1a5c35] ${
                              isOutOfRange ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626]' : isWarning ? 'border-[#d97706] bg-[#fffbeb] text-[#d97706]' : 'border-[#e2e8f0]'
                            }`}
                          />
                        </td>
                        <td className="py-3 pr-4">
                          {t.value !== null && (
                            <span className={`text-lg ${isOutOfRange ? '' : isWarning ? '' : ''}`}>
                              {isOutOfRange ? '🔴' : isWarning ? '🟡' : '🟢'}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <input
                            type="text"
                            value={t.comment}
                            onChange={(e) => updateTemp(t.id, 'comment', e.target.value)}
                            disabled={isLocked}
                            placeholder="Koment..."
                            className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded focus:outline-none focus:ring-1 focus:ring-[#1a5c35]"
                          />
                        </td>
                        <td className="py-3 pl-2">
                          {!isLocked && temperatures.length > 1 && (
                            <button onClick={() => setTemperatures((p) => p.filter((x) => x.id !== t.id))} className="p-1 text-[#dc2626] hover:bg-[#fef2f2] rounded">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!isLocked && (
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addTemperature}>
                Shto pajisje
              </Button>
            )}
          </div>
        )}

        {/* STEP 4: Staff */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Stafi & Higjiena Personale</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b] w-[40%]">Elementi</th>
                    <th className="text-center py-2 px-2 font-medium text-[#64748b]">Vlerësimi</th>
                    <th className="text-left py-2 pl-4 font-medium text-[#64748b]">Koment</th>
                  </tr>
                </thead>
                <tbody>
                  {staffChecklist.map((item) => (
                    <tr key={item.id} className="border-b border-[#f1f5f9]">
                      <td className="py-3 pr-4 text-[#0f172a]">{item.label}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 justify-center">
                          {ratingOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => !isLocked && updateStaffItem(item.id, 'rating', opt.value)}
                              disabled={isLocked}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                item.rating === opt.value ? ratingColor(opt.value) : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pl-4">
                        <input
                          type="text"
                          value={item.comment}
                          onChange={(e) => updateStaffItem(item.id, 'comment', e.target.value)}
                          disabled={isLocked}
                          placeholder="Koment..."
                          className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded focus:outline-none focus:ring-1 focus:ring-[#1a5c35]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#e2e8f0]">
              <Input
                label="Nr. i punonjësve gjatë inspektimit"
                type="number"
                value={staffEmployeeCount ?? ''}
                onChange={(e) => setStaffEmployeeCount(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isLocked}
              />
              <Select
                label="Certifikatat shëndetësore"
                value={healthCertStatus}
                onChange={(e) => setHealthCertStatus(e.target.value as HealthCertStatus)}
                options={[
                  { value: 'te_gjitha_ne_date', label: 'Të gjitha në datë' },
                  { value: 'disa_te_skaduara', label: 'Disa të skaduara' },
                  { value: 'mungojne', label: 'Mungojnë' },
                ]}
                disabled={isLocked}
              />
              <Input
                label="Trajnimi i fundit HACCP"
                type="date"
                value={lastTrainingDate}
                onChange={(e) => setLastTrainingDate(e.target.value)}
                disabled={isLocked}
              />
              <Input
                label="Trajnimi i radhës i planifikuar"
                type="date"
                value={nextTrainingDate}
                onChange={(e) => setNextTrainingDate(e.target.value)}
                disabled={isLocked}
              />
            </div>
            <Textarea
              label="Koment i lirë mbi stafin"
              value={staffComment}
              onChange={(e) => setStaffComment(e.target.value)}
              disabled={isLocked}
              rows={3}
            />
          </div>
        )}

        {/* STEP 5: Documentation */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Dokumentacioni HACCP</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="text-left py-2 pr-4 font-medium text-[#64748b]">Dokumenti</th>
                    <th className="text-center py-2 px-2 font-medium text-[#64748b]">Statusi</th>
                    <th className="text-left py-2 px-2 font-medium text-[#64748b]">Data</th>
                    <th className="text-left py-2 pl-2 font-medium text-[#64748b]">Koment</th>
                  </tr>
                </thead>
                <tbody>
                  {docChecklist.map((doc) => (
                    <tr key={doc.id} className="border-b border-[#f1f5f9]">
                      <td className="py-3 pr-4 text-[#0f172a]">{doc.label}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 justify-center">
                          {(['ka', 'jo', 'mungon'] as DocumentStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => !isLocked && updateDocItem(doc.id, 'status', s)}
                              disabled={isLocked}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                doc.status === s
                                  ? s === 'ka' ? 'bg-[#16a34a] text-white' : s === 'jo' ? 'bg-[#dc2626] text-white' : 'bg-[#d97706] text-white'
                                  : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]'
                              }`}
                            >
                              {s === 'ka' ? 'Ka' : s === 'jo' ? 'Jo' : 'Mungon'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="date"
                          value={doc.updatedDate}
                          onChange={(e) => updateDocItem(doc.id, 'updatedDate', e.target.value)}
                          disabled={isLocked}
                          className="px-2 py-1 text-xs border border-[#e2e8f0] rounded focus:outline-none focus:ring-1 focus:ring-[#1a5c35]"
                        />
                      </td>
                      <td className="py-3 pl-2">
                        <input
                          type="text"
                          value={doc.comment}
                          onChange={(e) => updateDocItem(doc.id, 'comment', e.target.value)}
                          disabled={isLocked}
                          placeholder="Koment..."
                          className="w-full px-2 py-1 text-xs border border-[#e2e8f0] rounded focus:outline-none focus:ring-1 focus:ring-[#1a5c35]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Document Completeness */}
            <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-lg">
              <span className="text-sm font-medium text-[#64748b]">Plotësia e dokumentacionit:</span>
              <div className="flex-1 h-3 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${docCompleteness >= 75 ? 'bg-[#16a34a]' : docCompleteness >= 50 ? 'bg-[#d97706]' : 'bg-[#dc2626]'}`}
                  style={{ width: `${docCompleteness}%` }}
                />
              </div>
              <span className={`text-lg font-bold ${docCompleteness >= 75 ? 'text-[#16a34a]' : docCompleteness >= 50 ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                {docCompleteness}%
              </span>
            </div>
          </div>
        )}

        {/* STEP 6: Non-Conformances */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0f172a]">Mospërputhjet</h2>
              {!isLocked && (
                <Button size="sm" icon={<Plus size={14} />} onClick={addNC}>
                  Shto Mospërputhje
                </Button>
              )}
            </div>
            {ncList.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle size={32} className="mx-auto text-[#94a3b8] mb-3" />
                <p className="text-sm text-[#64748b]">Nuk ka mospërputhje të identifikuara</p>
                {!isLocked && (
                  <Button variant="secondary" size="sm" className="mt-4" icon={<Plus size={14} />} onClick={addNC}>
                    Shto mospërputhjen e parë
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {ncList.map((nc, idx) => (
                  <div key={nc.id} className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedNC(expandedNC === nc.id ? null : nc.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#64748b]">#{idx + 1}</span>
                        <span className="text-sm font-medium text-[#0f172a]">{nc.title || 'Mospërputhje e re'}</span>
                        <RiskBadge level={nc.riskLevel} size="sm" />
                      </div>
                      {expandedNC === nc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedNC === nc.id && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Titulli i shkurtër"
                            value={nc.title}
                            onChange={(e) => updateNC(nc.id, { title: e.target.value })}
                            disabled={isLocked}
                            required
                          />
                          <Select
                            label="Kategoria"
                            value={nc.category}
                            onChange={(e) => updateNC(nc.id, { category: e.target.value as NCCategory })}
                            options={Object.entries(NC_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                            disabled={isLocked}
                          />
                        </div>
                        <Textarea
                          label="Përshkrimi i detajuar"
                          value={nc.description}
                          onChange={(e) => updateNC(nc.id, { description: e.target.value })}
                          disabled={isLocked}
                          rows={3}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Select
                            label="Niveli i rrezikut"
                            value={nc.riskLevel}
                            onChange={(e) => updateNC(nc.id, { riskLevel: e.target.value as RiskLevel })}
                            options={Object.entries(RISK_LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                            disabled={isLocked}
                          />
                          <Input
                            label="Afati i korrigjimit"
                            type="date"
                            value={nc.deadline}
                            onChange={(e) => updateNC(nc.id, { deadline: e.target.value })}
                            disabled={isLocked}
                          />
                        </div>
                        <Textarea
                          label="Rekomandimi i veprimit korrigjues"
                          value={nc.correctiveAction}
                          onChange={(e) => updateNC(nc.id, { correctiveAction: e.target.value })}
                          disabled={isLocked}
                          rows={2}
                        />
                        <Input
                          label="Personi përgjegjës"
                          value={nc.responsiblePerson}
                          onChange={(e) => updateNC(nc.id, { responsiblePerson: e.target.value })}
                          disabled={isLocked}
                        />
                        {!isLocked && (
                          <div className="flex justify-end">
                            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => removeNC(nc.id)}>
                              Fshi
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 7: Final Assessment */}
        {step === 6 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#0f172a]">Vlerësimi Final & Nënshkrimi</h2>

            {/* Risk Gauge */}
            <div className="bg-[#f8fafc] rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-[#64748b] mb-3">Vlerësimi i përgjithshëm i rrezikut</p>
              <RiskBadge level={computeRiskLevel()} size="md" />
              <div className="flex justify-center gap-6 mt-4 text-xs">
                {(['kritik', 'i_larte', 'mesatar', 'i_ulet'] as RiskLevel[]).map((level) => {
                  const count = ncList.filter((nc) => nc.riskLevel === level).length;
                  return (
                    <span key={level} className="text-[#64748b]">
                      {RISK_LEVEL_LABELS[level]}: <span className="font-bold">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <Textarea
              label="Vërejtje finale"
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              disabled={isLocked}
              rows={4}
              placeholder="Konkluzionet e përgjithshme të inspektorit..."
            />
            <Textarea
              label="Hapat e radhës të rekomanduar"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              disabled={isLocked}
              rows={3}
            />
            <Input
              label="Data e inspektimit të radhës të sugjeruar"
              type="date"
              value={suggestedNextDate}
              onChange={(e) => setSuggestedNextDate(e.target.value)}
              disabled={isLocked}
            />

            {/* Signature Preview */}
            {settings?.signature && (
              <div className="border border-[#e2e8f0] rounded-xl p-6">
                <p className="text-sm font-medium text-[#64748b] mb-3">Nënshkrimi i inspektorit</p>
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 max-w-xs">
                  <img src={settings.signature} alt="Nënshkrimi" className="h-16 mx-auto" />
                  <div className="text-center mt-3 border-t border-[#e2e8f0] pt-2">
                    <p className="font-semibold text-sm text-[#0f172a]">{settings.inspector.fullName}</p>
                    <p className="text-xs text-[#64748b]">{settings.inspector.title}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-[#e2e8f0] p-4">
        <div>
          {step > 0 && (
            <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => setStep(step - 1)}>
              Mbrapa
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          {!isLocked && (
            <Button variant="secondary" icon={<Save size={16} />} onClick={() => saveInspection('draft')} loading={saving}>
              Ruaj si Draft
            </Button>
          )}
          {step < 6 ? (
            <Button icon={<ArrowRight size={16} />} onClick={() => setStep(step + 1)}>
              Vazhdo
            </Button>
          ) : (
            !isLocked && (
              <Button icon={<CheckCircle2 size={16} />} onClick={() => saveInspection('perfunduar')} loading={saving}>
                Finalizoj Inspektimin
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
