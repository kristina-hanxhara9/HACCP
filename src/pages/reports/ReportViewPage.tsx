import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { sq } from 'date-fns/locale/sq';
import { ArrowLeft, Printer, Sparkles, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/Button';
import { RiskBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { AI_SYSTEM_PROMPT } from '@/lib/constants';
import {
  BUSINESS_TYPE_LABELS,
  INSPECTION_TYPE_LABELS,
  RISK_LEVEL_LABELS,
  NC_CATEGORY_LABELS,
  NC_STATUS_LABELS,
  DOC_STATUS_LABELS,
  HEALTH_CERT_LABELS,
} from '@/types';
import type { BusinessType, InspectionType, RiskLevel, NCCategory, NCStatus, DocumentStatus, HealthCertStatus, ChecklistRating } from '@/types';

const RATING_LABELS: Record<ChecklistRating, string> = { mire: 'Mirë', pranueshem: 'Pranueshem', dobet: 'Dobët', na: 'N/A' };

export function ReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log } = useActivityLog();
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const inspection = useLiveQuery(() => (id ? db.inspections.get(id) : undefined), [id]);
  const business = useLiveQuery(
    () => (inspection?.businessId ? db.businesses.get(inspection.businessId) : undefined),
    [inspection?.businessId]
  );
  const ncs = useLiveQuery(
    () => (id ? db.nonConformances.where('inspectionId').equals(id).toArray() : []),
    [id]
  );
  const settings = useLiveQuery(() => db.settings.get('main'));

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const generateAIReport = async () => {
    if (!inspection || !business || !settings?.apiKey) {
      if (!settings?.apiKey) toast.error('Vendosni API key në Cilësimet');
      return;
    }
    setGenerating(true);
    try {
      const userMessage = buildReportPrompt();
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': settings.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: AI_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Gabim API');
      }

      const data = await response.json();
      const reportText = data.content?.[0]?.text || '';

      const history = inspection.aiReportHistory || [];
      if (inspection.aiReport) {
        history.push({ text: inspection.aiReport, generatedAt: new Date().toISOString() });
      }

      await db.inspections.update(inspection.id, {
        aiReport: reportText,
        aiReportHistory: history,
        updatedAt: new Date().toISOString(),
      });

      await log('report_generated', `Raporti AI u gjenerua për ${inspection.serialNumber}`, inspection.id, 'inspection');
      toast.success('Raporti AI u gjenerua me sukses');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gabim i panjohur';
      toast.error(`Gabim: ${message}`);
    } finally {
      setGenerating(false);
    }
  };

  const buildReportPrompt = () => {
    if (!inspection || !business) return '';
    const lines: string[] = [];
    lines.push(`RAPORTI I INSPEKTIMIT HACCP`);
    lines.push(`Biznesi: ${business.name} (${BUSINESS_TYPE_LABELS[business.type as BusinessType]})`);
    if (business.nipt) lines.push(`NIPT: ${business.nipt}`);
    lines.push(`Qyteti: ${business.city}, Adresa: ${business.address}`);
    lines.push(`Personi kontaktues: ${business.contactPerson}, Tel: ${business.phone}`);
    if (business.employeeCount) lines.push(`Nr. punonjësve: ${business.employeeCount}`);
    if (business.area) lines.push(`Sipërfaqja: ${business.area} m²`);
    lines.push(`Data: ${inspection.date}, Ora: ${inspection.startTime || '—'} - ${inspection.endTime || '—'}`);
    lines.push(`Lloji: ${INSPECTION_TYPE_LABELS[inspection.type as InspectionType]}`);
    lines.push(`Inspektori: ${inspection.inspector}`);
    lines.push(`Nr. Serial: ${inspection.serialNumber}`);
    lines.push(`Niveli i rrezikut: ${RISK_LEVEL_LABELS[inspection.riskLevel as RiskLevel]}`);
    if (inspection.entryNotes) lines.push(`Shënime hyrëse: ${inspection.entryNotes}`);
    lines.push('');

    // Business licenses
    lines.push('LICENCAT E BIZNESIT:');
    lines.push(`- Licencë ushqimore: ${business.foodLicense.has ? `Po${business.foodLicense.expiryDate ? ` (skadon: ${business.foodLicense.expiryDate})` : ''}` : 'Jo'}`);
    lines.push(`- Certifikatë HACCP: ${business.haccpCertificate.has ? `Po${business.haccpCertificate.expiryDate ? ` (skadon: ${business.haccpCertificate.expiryDate})` : ''}` : 'Jo'}`);
    lines.push(`- Kontroll dëmtuesish: ${business.pestControl.has ? `Po${business.pestControl.expiryDate ? ` (skadon: ${business.pestControl.expiryDate})` : ''}` : 'Jo'}`);
    lines.push('');

    lines.push('HIGJIENA E AMBIENTEVE:');
    inspection.environmentChecklist.forEach((c) => {
      lines.push(`- ${c.label}: ${RATING_LABELS[c.rating]}${c.comment ? ` (${c.comment})` : ''}`);
    });
    lines.push('');
    lines.push('TEMPERATURAT:');
    inspection.temperatures.forEach((t) => {
      if (t.value !== null) {
        const status = t.value < t.minTemp || t.value > t.maxTemp ? 'JASHTË KUFIRIT' : 'OK';
        lines.push(`- ${t.label}: ${t.value}°C (kufiri: ${t.minTemp}→${t.maxTemp}°C) [${status}]${t.comment ? ` (${t.comment})` : ''}`);
      }
    });
    lines.push('');
    lines.push('STAFI:');
    inspection.staffAssessment.checklist.forEach((c) => {
      lines.push(`- ${c.label}: ${RATING_LABELS[c.rating]}${c.comment ? ` (${c.comment})` : ''}`);
    });
    lines.push(`Punonjës: ${inspection.staffAssessment.employeeCount || '—'}`);
    lines.push(`Certifikata shëndetësore: ${HEALTH_CERT_LABELS[inspection.staffAssessment.healthCertStatus as HealthCertStatus]}`);
    if (inspection.staffAssessment.lastTrainingDate) lines.push(`Trajnimi i fundit: ${inspection.staffAssessment.lastTrainingDate}`);
    if (inspection.staffAssessment.nextTrainingDate) lines.push(`Trajnimi i ardhshëm: ${inspection.staffAssessment.nextTrainingDate}`);
    if (inspection.staffAssessment.staffComment) lines.push(`Koment stafi: ${inspection.staffAssessment.staffComment}`);
    lines.push('');
    lines.push('DOKUMENTACIONI:');
    inspection.documentChecklist.forEach((d) => {
      let entry = `- ${d.label}: ${DOC_STATUS_LABELS[d.status as DocumentStatus]}`;
      if (d.updatedDate) entry += ` (përditësuar: ${d.updatedDate})`;
      if (d.comment) entry += ` — ${d.comment}`;
      lines.push(entry);
    });
    lines.push('');
    if (ncs && ncs.length > 0) {
      lines.push('MOSPËRPUTHJET:');
      ncs.forEach((nc, i) => {
        lines.push(`${i + 1}. ${nc.title} [${RISK_LEVEL_LABELS[nc.riskLevel as RiskLevel]}] - ${NC_CATEGORY_LABELS[nc.category as NCCategory]} - Statusi: ${NC_STATUS_LABELS[nc.status as NCStatus]}`);
        lines.push(`   Përshkrimi: ${nc.description}`);
        lines.push(`   Veprim korrigjues: ${nc.correctiveAction || '—'}`);
        lines.push(`   Personi përgjegjës: ${nc.responsiblePerson || '—'}`);
        lines.push(`   Afati: ${nc.deadline || '—'}`);
      });
    } else {
      lines.push('MOSPËRPUTHJET: Asnjë mospërputhje nuk u identifikua.');
    }
    lines.push('');
    lines.push(`VËREJTJE FINALE: ${inspection.finalNotes || '—'}`);
    if (inspection.nextSteps) lines.push(`HAPAT E ARDHSHËM: ${inspection.nextSteps}`);
    if (inspection.suggestedNextDate) lines.push(`DATA E SUGJERUAR PËR INSPEKTIMIN E ARDHSHËM: ${inspection.suggestedNextDate}`);
    return lines.join('\n');
  };

  if (!inspection) return <div className="text-center py-16 text-[#64748b]">Duke ngarkuar...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/reports')} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#0f172a]">Raporti {inspection.serialNumber}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Sparkles size={16} />} onClick={generateAIReport} loading={generating}>
            {inspection.aiReport ? 'Rigjenero Raport AI' : 'Gjenero Raport AI'}
          </Button>
          <Button icon={<Printer size={16} />} onClick={() => handlePrint()}>
            Printo / PDF
          </Button>
        </div>
      </div>

      {/* AI Report Loading */}
      {generating && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 text-center">
          <Loader2 size={32} className="animate-spin text-[#1a5c35] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#0f172a]">Duke analizuar të dhënat...</p>
          <div className="mt-3 h-2 bg-[#e2e8f0] rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-gradient-to-r from-[#1a5c35] to-[#2d7a4f] animate-shimmer rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {/* Printable Content */}
      <div ref={printRef} className="space-y-6">
        {/* Cover Page */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 print-avoid-break">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1a5c35] flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#0f172a]">{settings?.company.name || 'FoodSafeConsulting HACCP'}</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a]">RAPORT INSPEKTIMI HIGJIENIK</h2>
            <p className="font-mono text-lg font-semibold text-[#1a5c35]">{inspection.serialNumber}</p>
            <div className="mt-6 space-y-2 text-sm text-[#64748b]">
              <p><strong>Biznesi:</strong> {business?.name || '—'} ({business ? BUSINESS_TYPE_LABELS[business.type as BusinessType] : '—'})</p>
              <p><strong>Qyteti:</strong> {business?.city || '—'}</p>
              <p><strong>Data:</strong> {format(new Date(inspection.date), 'd MMMM yyyy', { locale: sq })}</p>
              <p><strong>Lloji:</strong> {INSPECTION_TYPE_LABELS[inspection.type as InspectionType]}</p>
              <p><strong>Inspektori:</strong> {inspection.inspector}</p>
            </div>
            <div className="mt-6">
              <RiskBadge level={inspection.riskLevel} />
            </div>
          </div>
        </div>

        {/* AI Report */}
        {inspection.aiReport && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 print-page-break">
            <h2 className="text-lg font-semibold text-[#0f172a] mb-6">Analiza e Raportit AI</h2>
            <div className="prose prose-sm max-w-none text-[#0f172a]">
              {inspection.aiReport.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-base font-semibold text-[#1a5c35] mt-6 mb-2">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return <p key={i} className="text-sm text-[#374151] ml-4 mb-1">• {line.replace(/^[-*] /, '')}</p>;
                }
                if (line.match(/^\d+\./)) {
                  return <p key={i} className="text-sm text-[#374151] ml-4 mb-1">{line}</p>;
                }
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm text-[#374151] mb-2">{line}</p>;
              })}
            </div>
          </div>
        )}

        {/* Page 2: Business Details + Environment + Temperatures */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 print-page-break">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6">Të Dhënat e Biznesit & Inspektimi Mjedisor</h2>

          {/* Business details */}
          {business && (
            <div className="mb-6 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
              <h3 className="text-sm font-semibold text-[#0f172a] mb-3">Informacioni i biznesit</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><span className="text-[#64748b]">Emri:</span> <strong>{business.name}</strong></p>
                <p><span className="text-[#64748b]">Lloji:</span> {BUSINESS_TYPE_LABELS[business.type as BusinessType]}</p>
                {business.nipt && <p><span className="text-[#64748b]">NIPT:</span> {business.nipt}</p>}
                <p><span className="text-[#64748b]">Adresa:</span> {business.address}, {business.city}</p>
                <p><span className="text-[#64748b]">Kontakti:</span> {business.contactPerson} — {business.phone}</p>
                {business.employeeCount && <p><span className="text-[#64748b]">Punonjës:</span> {business.employeeCount}</p>}
                {business.area && <p><span className="text-[#64748b]">Sipërfaqja:</span> {business.area} m²</p>}
                {business.workSchedule && <p><span className="text-[#64748b]">Orari:</span> {business.workSchedule}</p>}
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                <span className={business.foodLicense.has ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                  Licencë ushqimore: {business.foodLicense.has ? `Po${business.foodLicense.expiryDate ? ` (${business.foodLicense.expiryDate})` : ''}` : 'Jo'}
                </span>
                <span className={business.haccpCertificate.has ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                  HACCP: {business.haccpCertificate.has ? `Po${business.haccpCertificate.expiryDate ? ` (${business.haccpCertificate.expiryDate})` : ''}` : 'Jo'}
                </span>
                <span className={business.pestControl.has ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                  Kontroll dëmtuesish: {business.pestControl.has ? `Po${business.pestControl.expiryDate ? ` (${business.pestControl.expiryDate})` : ''}` : 'Jo'}
                </span>
              </div>
            </div>
          )}

          {/* Environment checklist table */}
          <h3 className="text-sm font-semibold text-[#0f172a] mb-2">Higjiena e Ambienteve</h3>
          <table className="print-table w-full text-xs mb-6">
            <thead>
              <tr>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Elementi</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-24">Vlerësimi</th>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Koment</th>
              </tr>
            </thead>
            <tbody>
              {inspection.environmentChecklist.map((c, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                  <td className="p-2 border border-[#e2e8f0]">{c.label}</td>
                  <td className={`p-2 border border-[#e2e8f0] text-center font-medium ${
                    c.rating === 'mire' ? 'text-[#16a34a]' : c.rating === 'pranueshem' ? 'text-[#d97706]' : c.rating === 'dobet' ? 'text-[#dc2626]' : 'text-[#94a3b8]'
                  }`}>{RATING_LABELS[c.rating]}</td>
                  <td className="p-2 border border-[#e2e8f0] text-[#64748b]">{c.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Temperature readings table */}
          <h3 className="text-sm font-semibold text-[#0f172a] mb-2">Regjistrimet e Temperaturave</h3>
          <table className="print-table w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Pajisja</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-20">Vlera °C</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-28">Kufiri (min–max)</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-20">Statusi</th>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Koment</th>
              </tr>
            </thead>
            <tbody>
              {inspection.temperatures.map((t, i) => {
                const outOfRange = t.value !== null && (t.value < t.minTemp || t.value > t.maxTemp);
                return (
                  <tr key={i} className={outOfRange ? 'bg-[#fef2f2]' : i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-2 border border-[#e2e8f0]">{t.label}</td>
                    <td className={`p-2 border border-[#e2e8f0] text-center font-mono font-medium ${outOfRange ? 'text-[#dc2626]' : ''}`}>
                      {t.value !== null ? `${t.value}°C` : '—'}
                    </td>
                    <td className="p-2 border border-[#e2e8f0] text-center text-[#64748b]">{t.minTemp}°C – {t.maxTemp}°C</td>
                    <td className={`p-2 border border-[#e2e8f0] text-center font-semibold ${outOfRange ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
                      {t.value !== null ? (outOfRange ? 'JASHTË' : 'OK') : '—'}
                    </td>
                    <td className="p-2 border border-[#e2e8f0] text-[#64748b]">{t.comment || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Page 3: Staff Assessment + Documentation */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 print-page-break">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6">Vlerësimi i Stafit & Dokumentacioni</h2>

          {/* Staff checklist table */}
          <h3 className="text-sm font-semibold text-[#0f172a] mb-2">Vlerësimi i Stafit</h3>
          <table className="print-table w-full text-xs mb-4">
            <thead>
              <tr>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Elementi</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-24">Vlerësimi</th>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Koment</th>
              </tr>
            </thead>
            <tbody>
              {inspection.staffAssessment.checklist.map((c, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                  <td className="p-2 border border-[#e2e8f0]">{c.label}</td>
                  <td className={`p-2 border border-[#e2e8f0] text-center font-medium ${
                    c.rating === 'mire' ? 'text-[#16a34a]' : c.rating === 'pranueshem' ? 'text-[#d97706]' : c.rating === 'dobet' ? 'text-[#dc2626]' : 'text-[#94a3b8]'
                  }`}>{RATING_LABELS[c.rating]}</td>
                  <td className="p-2 border border-[#e2e8f0] text-[#64748b]">{c.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Staff summary */}
          <div className="mb-8 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
            <p><span className="text-[#64748b]">Nr. punonjësve:</span> <strong>{inspection.staffAssessment.employeeCount || '—'}</strong></p>
            <p><span className="text-[#64748b]">Certifikatat shëndetësore:</span> <strong>{HEALTH_CERT_LABELS[inspection.staffAssessment.healthCertStatus as HealthCertStatus]}</strong></p>
            {inspection.staffAssessment.lastTrainingDate && (
              <p><span className="text-[#64748b]">Trajnimi i fundit:</span> {inspection.staffAssessment.lastTrainingDate}</p>
            )}
            {inspection.staffAssessment.nextTrainingDate && (
              <p><span className="text-[#64748b]">Trajnimi i ardhshëm:</span> {inspection.staffAssessment.nextTrainingDate}</p>
            )}
            {inspection.staffAssessment.staffComment && (
              <p className="col-span-2"><span className="text-[#64748b]">Koment:</span> {inspection.staffAssessment.staffComment}</p>
            )}
          </div>

          {/* Document checklist table */}
          <h3 className="text-sm font-semibold text-[#0f172a] mb-2">Dokumentacioni HACCP</h3>
          <table className="print-table w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Dokumenti</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-20">Statusi</th>
                <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-28">Përditësuar</th>
                <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Koment</th>
              </tr>
            </thead>
            <tbody>
              {inspection.documentChecklist.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                  <td className="p-2 border border-[#e2e8f0]">{d.label}</td>
                  <td className={`p-2 border border-[#e2e8f0] text-center font-medium ${
                    d.status === 'ka' ? 'text-[#16a34a]' : d.status === 'jo' ? 'text-[#dc2626]' : 'text-[#d97706]'
                  }`}>{DOC_STATUS_LABELS[d.status as DocumentStatus]}</td>
                  <td className="p-2 border border-[#e2e8f0] text-center text-[#64748b]">{d.updatedDate || '—'}</td>
                  <td className="p-2 border border-[#e2e8f0] text-[#64748b]">{d.comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page 4: Non-Conformances (only if any exist) */}
        {ncs && ncs.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 print-page-break">
            <h2 className="text-lg font-semibold text-[#0f172a] mb-6">Mospërputhjet e Identifikuara</h2>
            <table className="print-table w-full text-xs mb-6">
              <thead>
                <tr>
                  <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-8">#</th>
                  <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Titulli</th>
                  <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-28">Kategoria</th>
                  <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-20">Rreziku</th>
                  <th className="text-left p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold">Veprimi korrigjues</th>
                  <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-24">Përgjegjës</th>
                  <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-24">Afati</th>
                  <th className="text-center p-2 bg-[#f1f5f9] border border-[#e2e8f0] font-semibold w-20">Statusi</th>
                </tr>
              </thead>
              <tbody>
                {ncs.map((nc, i) => (
                  <tr key={nc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}>
                    <td className="p-2 border border-[#e2e8f0] text-center">{i + 1}</td>
                    <td className="p-2 border border-[#e2e8f0]">
                      <p className="font-medium">{nc.title}</p>
                      <p className="text-[#64748b] mt-0.5">{nc.description}</p>
                    </td>
                    <td className="p-2 border border-[#e2e8f0] text-center">{NC_CATEGORY_LABELS[nc.category as NCCategory]}</td>
                    <td className={`p-2 border border-[#e2e8f0] text-center font-semibold ${
                      nc.riskLevel === 'kritik' ? 'text-[#dc2626]' : nc.riskLevel === 'i_larte' ? 'text-[#ea580c]' : nc.riskLevel === 'mesatar' ? 'text-[#d97706]' : 'text-[#16a34a]'
                    }`}>{RISK_LEVEL_LABELS[nc.riskLevel as RiskLevel]}</td>
                    <td className="p-2 border border-[#e2e8f0]">{nc.correctiveAction || '—'}</td>
                    <td className="p-2 border border-[#e2e8f0] text-center">{nc.responsiblePerson || '—'}</td>
                    <td className="p-2 border border-[#e2e8f0] text-center">{nc.deadline || '—'}</td>
                    <td className="p-2 border border-[#e2e8f0] text-center">{NC_STATUS_LABELS[nc.status as NCStatus]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* NC photos */}
            {ncs.some(nc => nc.photo) && (
              <div>
                <h3 className="text-sm font-semibold text-[#0f172a] mb-3">Foto të mospërputhjeve</h3>
                <div className="grid grid-cols-2 gap-4">
                  {ncs.filter(nc => nc.photo).map((nc, i) => (
                    <div key={i} className="print-avoid-break">
                      <img src={nc.photo} alt={nc.title} className="w-full h-48 object-cover rounded-lg border border-[#e2e8f0]" />
                      <p className="text-xs text-[#64748b] mt-1">{nc.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signature Page */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-8 print-page-break">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6">Nënshkrimi & Verifikimi</h2>

          {/* Final notes & next steps */}
          {inspection.finalNotes && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#64748b] mb-1">Vërejtje finale:</h3>
              <p className="text-sm text-[#0f172a]">{inspection.finalNotes}</p>
            </div>
          )}
          {inspection.nextSteps && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#64748b] mb-1">Hapat e ardhshëm:</h3>
              <p className="text-sm text-[#0f172a]">{inspection.nextSteps}</p>
            </div>
          )}
          {inspection.suggestedNextDate && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#64748b] mb-1">Data e sugjeruar për inspektimin e ardhshëm:</h3>
              <p className="text-sm text-[#0f172a]">{format(new Date(inspection.suggestedNextDate), 'd MMMM yyyy', { locale: sq })}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              {settings?.signature && (
                <img src={settings.signature} alt="Nënshkrimi" className="h-20 mx-auto mb-2" />
              )}
              <div className="border-t border-[#0f172a] pt-2">
                <p className="font-bold text-sm">{settings?.inspector.fullName || inspection.inspector}</p>
                <p className="text-xs text-[#64748b]">{settings?.inspector.title || 'Inspektor HACCP'}</p>
                <p className="text-xs text-[#64748b]">{format(new Date(inspection.date), 'd MMMM yyyy', { locale: sq })}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 border-2 border-dashed border-[#e2e8f0] rounded-lg mx-auto flex items-center justify-center">
                <span className="text-xs text-[#94a3b8]">Vula e Kompanisë</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#94a3b8] mt-8 text-center">
            Ky raport është konfidencial dhe i destinuar vetëm për përdorim të brendshëm. Riprodhimi ose shpërndarja pa autorizim është e ndaluar.
          </p>
        </div>
      </div>
    </div>
  );
}
