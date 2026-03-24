import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import { Save, Undo2, Trash2, Download, Upload, Key } from 'lucide-react';

type SettingsTab = 'profili' | 'nenshkrimi' | 'kompania' | 'siguria' | 'te_dhenat';

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profili');
  const settings = useLiveQuery(() => db.settings.get('main'));

  // Profile
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Company
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // API (internal — not shown in UI)
  const [apiKey, setApiKey] = useState('');

  // Signature
  const sigRef = useRef<SignatureCanvas>(null);

  // Data
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (settings) {
      setFullName(settings.inspector.fullName);
      setTitle(settings.inspector.title);
      setEmail(settings.inspector.email);
      setPhone(settings.inspector.phone);
      setBio(settings.inspector.bio);
      setCompanyName(settings.company.name);
      setCompanyEmail(settings.company.email);
      setCompanyPhone(settings.company.phone);
      setCompanyAddress(settings.company.address);
      setCompanyWebsite(settings.company.website);
      setApiKey(settings.apiKey);
    }
  }, [settings]);

  const saveProfile = async () => {
    if (!settings) return;
    await db.settings.update('main', {
      inspector: { ...settings.inspector, fullName, title, email, phone, bio },
    });
    toast.success('Profili u ruajt me sukses');
  };

  const saveCompany = async () => {
    if (!settings) return;
    await db.settings.update('main', {
      company: { ...settings.company, name: companyName, email: companyEmail, phone: companyPhone, address: companyAddress, website: companyWebsite },
    });
    toast.success('Të dhënat e kompanisë u ruajtën');
  };

  const saveSignature = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast.error('Vizatoni nënshkrimin para se ta ruani');
      return;
    }
    const dataUrl = sigRef.current.toDataURL('image/png');
    await db.settings.update('main', { signature: dataUrl });
    toast.success('Nënshkrimi u ruajt me sukses');
  };

  const changePassword = async () => {
    if (!settings) return;
    if (currentPw !== settings.password) {
      toast.error('Fjalëkalimi aktual është i gabuar');
      return;
    }
    if (newPw.length < 4) {
      toast.error('Fjalëkalimi i ri duhet të ketë të paktën 4 karaktere');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Fjalëkalimet nuk përputhen');
      return;
    }
    await db.settings.update('main', { password: newPw });
    toast.success('Fjalëkalimi u ndryshua me sukses');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  };

  const exportData = async () => {
    const data = {
      businesses: await db.businesses.toArray(),
      inspections: await db.inspections.toArray(),
      nonConformances: await db.nonConformances.toArray(),
      activityLog: await db.activityLog.toArray(),
      settings: await db.settings.toArray(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haccp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Eksporti u krye me sukses');
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.businesses) await db.businesses.bulkPut(data.businesses);
      if (data.inspections) await db.inspections.bulkPut(data.inspections);
      if (data.nonConformances) await db.nonConformances.bulkPut(data.nonConformances);
      if (data.activityLog) await db.activityLog.bulkPut(data.activityLog);
      if (data.settings) {
        for (const s of data.settings) await db.settings.put(s);
      }
      toast.success('Importi u krye me sukses');
    } catch {
      toast.error('Gabim gjatë importit — kontrolloni formatin e skedarit');
    }
    e.target.value = '';
  };

  const deleteAllData = async () => {
    await db.businesses.clear();
    await db.inspections.clear();
    await db.nonConformances.clear();
    await db.activityLog.clear();
    localStorage.removeItem('haccp_serial_counter');
    toast.success('Të gjitha të dhënat u fshinë');
    setDeleteConfirm(false);
  };

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'profili', label: 'Profili' },
    { key: 'nenshkrimi', label: 'Nënshkrimi' },
    { key: 'kompania', label: 'Kompania' },
    { key: 'siguria', label: 'Siguria' },
    { key: 'te_dhenat', label: 'Të dhënat' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Cilësimet</h1>

      <div className="border-b border-[#e2e8f0]">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key ? 'border-[#1a5c35] text-[#1a5c35]' : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
        {/* Profile */}
        {tab === 'profili' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0f172a]">Profili i Inspektorit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Emri i plotë" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Titulli / Pozicioni" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Telefoni" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Textarea label="Bio e shkurtër" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            <Button icon={<Save size={16} />} onClick={saveProfile}>Ruaj Profilin</Button>
          </div>
        )}

        {/* Signature */}
        {tab === 'nenshkrimi' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0f172a]">Nënshkrimi</h2>
            <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-2 bg-white">
              <SignatureCanvas
                ref={sigRef}
                canvasProps={{
                  className: 'w-full h-48 rounded-lg',
                  style: { width: '100%', height: '192px' },
                }}
                backgroundColor="white"
              />
            </div>
            <div className="flex gap-3">
              <Button icon={<Undo2 size={16} />} variant="secondary" onClick={() => sigRef.current?.clear()}>
                Pastro
              </Button>
              <Button icon={<Save size={16} />} onClick={saveSignature}>
                Ruaj Nënshkrimin
              </Button>
            </div>
            {settings?.signature && (
              <div className="mt-6 border border-[#e2e8f0] rounded-xl p-6 bg-[#f8fafc]">
                <p className="text-sm font-medium text-[#64748b] mb-3">Pamja paraprake:</p>
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 max-w-xs mx-auto">
                  <img src={settings.signature} alt="Nënshkrimi" className="h-16 mx-auto" />
                  <div className="text-center mt-3 border-t border-[#e2e8f0] pt-2">
                    <p className="font-bold text-sm">{settings.inspector.fullName}</p>
                    <p className="text-xs text-[#64748b]">{settings.inspector.title}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Company */}
        {tab === 'kompania' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0f172a]">Kompania</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Emri i kompanisë" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
              <Input label="Telefoni" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
              <Input label="Website" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} />
            </div>
            <Input label="Adresa" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            <Button icon={<Save size={16} />} onClick={saveCompany}>Ruaj</Button>
          </div>
        )}

        {/* Security */}
        {tab === 'siguria' && (
          <div className="space-y-6 max-w-md">
            <h2 className="text-lg font-semibold text-[#0f172a]">Ndrysho Fjalëkalimin</h2>
            <Input label="Fjalëkalimi aktual" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
            <Input label="Fjalëkalimi i ri" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            <Input label="Konfirmo fjalëkalimin" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            <Button icon={<Key size={16} />} onClick={changePassword} disabled={!currentPw || !newPw || !confirmPw}>
              Ndrysho Fjalëkalimin
            </Button>
          </div>
        )}

        {/* Data Management */}
        {tab === 'te_dhenat' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-[#0f172a]">Menaxhimi i të Dhënave</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button variant="secondary" icon={<Download size={16} />} onClick={exportData}>
                  Eksporto JSON
                </Button>
                <label>
                  <Button variant="secondary" icon={<Upload size={16} />} onClick={() => document.getElementById('import-input')?.click()}>
                    Importo JSON
                  </Button>
                  <input id="import-input" type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#dc2626]/20">
              <h3 className="text-sm font-semibold text-[#dc2626] mb-3">Zona e Rrezikshme</h3>
              <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setDeleteConfirm(true)}>
                Fshi të gjitha të dhënat
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={deleteAllData}
        title="Fshi të gjitha të dhënat"
        message="Kjo veprim do të fshijë përgjithmonë të gjitha bizneset, inspektimet, mospërputhjet dhe regjistrimet. Ky veprim nuk mund të kthehet mbrapsht."
        confirmLabel="Fshi Gjithçka"
        requireTyping="FSHIJ"
        variant="danger"
      />
    </div>
  );
}
