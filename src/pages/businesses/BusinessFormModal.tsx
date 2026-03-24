import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/db';
import toast from 'react-hot-toast';
import type { Business, BusinessType, RiskLevel } from '@/types';
import { BUSINESS_TYPE_LABELS, RISK_LEVEL_LABELS } from '@/types';
import { differenceInDays } from 'date-fns';

const schema = z.object({
  name: z.string().min(1, 'Emri i biznesit kërkohet'),
  type: z.string().min(1, 'Zgjidhni tipin'),
  nipt: z.string().optional(),
  registrationDate: z.string().optional(),
  address: z.string().min(1, 'Adresa kërkohet'),
  city: z.string().min(1, 'Qyteti kërkohet'),
  postalCode: z.string().optional(),
  contactPerson: z.string().min(1, 'Personi përgjegjës kërkohet'),
  phone: z.string().min(1, 'Telefoni kërkohet'),
  email: z.string().optional(),
  altPhone: z.string().optional(),
  employeeCount: z.coerce.number().optional(),
  workSchedule: z.string().optional(),
  area: z.coerce.number().optional(),
  defaultRisk: z.string().min(1),
  notes: z.string().optional(),
  foodLicenseHas: z.boolean(),
  foodLicenseExpiry: z.string().optional(),
  haccpCertHas: z.boolean(),
  haccpCertExpiry: z.string().optional(),
  pestControlHas: z.boolean(),
  pestControlExpiry: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  business: Business | null;
  onSaved?: (business: Business) => void;
}

function ExpiryIndicator({ date }: { date?: string }) {
  if (!date) return null;
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return <span className="text-xs font-medium text-[#dc2626]">Skaduar</span>;
  if (days < 30) return <span className="text-xs font-medium text-[#d97706]">Skadon për {days} ditë</span>;
  return null;
}

export function BusinessFormModal({ open, onClose, business, onSaved }: Props) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      defaultRisk: 'mesatar',
      foodLicenseHas: false,
      haccpCertHas: false,
      pestControlHas: false,
    },
  });

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        type: business.type,
        nipt: business.nipt || '',
        registrationDate: business.registrationDate || '',
        address: business.address,
        city: business.city,
        postalCode: business.postalCode || '',
        contactPerson: business.contactPerson,
        phone: business.phone,
        email: business.email || '',
        altPhone: business.altPhone || '',
        employeeCount: business.employeeCount || undefined,
        workSchedule: business.workSchedule || '',
        area: business.area || undefined,
        defaultRisk: business.defaultRisk,
        notes: business.notes || '',
        foodLicenseHas: business.foodLicense.has,
        foodLicenseExpiry: business.foodLicense.expiryDate || '',
        haccpCertHas: business.haccpCertificate.has,
        haccpCertExpiry: business.haccpCertificate.expiryDate || '',
        pestControlHas: business.pestControl.has,
        pestControlExpiry: business.pestControl.expiryDate || '',
      });
    } else {
      reset({
        name: '', type: '', nipt: '', registrationDate: '', address: '', city: '',
        postalCode: '', contactPerson: '', phone: '', email: '', altPhone: '',
        employeeCount: undefined, workSchedule: '', area: undefined, defaultRisk: 'mesatar',
        notes: '', foodLicenseHas: false, foodLicenseExpiry: '', haccpCertHas: false,
        haccpCertExpiry: '', pestControlHas: false, pestControlExpiry: '',
      });
    }
  }, [business, reset, open]);

  const onSubmit = async (data: FormData) => {
    const now = new Date().toISOString();
    const biz: Business = {
      id: business?.id || crypto.randomUUID(),
      name: data.name,
      type: data.type as BusinessType,
      nipt: data.nipt || undefined,
      registrationDate: data.registrationDate || undefined,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode || undefined,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email || undefined,
      altPhone: data.altPhone || undefined,
      employeeCount: data.employeeCount || undefined,
      workSchedule: data.workSchedule || undefined,
      area: data.area || undefined,
      defaultRisk: data.defaultRisk as RiskLevel,
      notes: data.notes || undefined,
      foodLicense: { has: data.foodLicenseHas, expiryDate: data.foodLicenseExpiry || undefined },
      haccpCertificate: { has: data.haccpCertHas, expiryDate: data.haccpCertExpiry || undefined },
      pestControl: { has: data.pestControlHas, expiryDate: data.pestControlExpiry || undefined },
      createdAt: business?.createdAt || now,
      updatedAt: now,
    };

    await db.businesses.put(biz);
    toast.success(business ? 'Biznesi u përditësua' : 'Biznesi u shtua me sukses');
    onSaved?.(biz);
    onClose();
  };

  const foodHas = watch('foodLicenseHas');
  const haccpHas = watch('haccpCertHas');
  const pestHas = watch('pestControlHas');
  const foodExpiry = watch('foodLicenseExpiry');
  const haccpExpiry = watch('haccpCertExpiry');
  const pestExpiry = watch('pestControlExpiry');

  return (
    <Modal open={open} onClose={onClose} title={business ? 'Ndrysho Biznesin' : 'Shto Biznes të Ri'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informacion Baze */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] w-full">Informacion Bazë</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Emri i biznesit" error={errors.name?.message} {...register('name')} required />
            <Select
              label="Tipi"
              error={errors.type?.message}
              options={Object.entries(BUSINESS_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="Zgjidhni tipin"
              {...register('type')}
              required
            />
            <Input label="Numri NIPT/Regjistrimit" {...register('nipt')} />
            <Input label="Data e regjistrimit" type="date" {...register('registrationDate')} />
          </div>
        </fieldset>

        {/* Lokacioni */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] w-full">Lokacioni</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Adresa e plotë" error={errors.address?.message} {...register('address')} required />
            <Input label="Qyteti" error={errors.city?.message} {...register('city')} required />
            <Input label="Kodi Postar" {...register('postalCode')} />
          </div>
        </fieldset>

        {/* Kontakt */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] w-full">Kontakt</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Personi përgjegjës" error={errors.contactPerson?.message} {...register('contactPerson')} required />
            <Input label="Telefoni" error={errors.phone?.message} {...register('phone')} required />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Telefoni alternativ" {...register('altPhone')} />
          </div>
        </fieldset>

        {/* Detaje Operative */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] w-full">Detaje Operative</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Numri i punonjësve" type="number" {...register('employeeCount')} />
            <Input label="Orari i punës" {...register('workSchedule')} placeholder="p.sh. 08:00 - 20:00" />
            <Input label="Sipërfaqja (m²)" type="number" {...register('area')} />
            <Select
              label="Kategoria e rrezikut"
              options={Object.entries(RISK_LEVEL_LABELS).filter(([k]) => k !== 'kritik').map(([v, l]) => ({ value: v, label: l }))}
              {...register('defaultRisk')}
            />
          </div>
          <div className="mt-4">
            <Textarea label="Shënime të lira" {...register('notes')} rows={3} />
          </div>
        </fieldset>

        {/* Dokumentacion */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] w-full">Dokumentacion</legend>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('foodLicenseHas')} className="rounded border-[#e2e8f0]" />
                Licenca ushqimore
              </label>
              {foodHas && <Input label="Datë skadimi" type="date" {...register('foodLicenseExpiry')} />}
              {foodHas && <ExpiryIndicator date={foodExpiry} />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('haccpCertHas')} className="rounded border-[#e2e8f0]" />
                Çertifikata HACCP
              </label>
              {haccpHas && <Input label="Datë skadimi" type="date" {...register('haccpCertExpiry')} />}
              {haccpHas && <ExpiryIndicator date={haccpExpiry} />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('pestControlHas')} className="rounded border-[#e2e8f0]" />
                Kontrata me operator dëmtuesish
              </label>
              {pestHas && <Input label="Datë skadimi" type="date" {...register('pestControlExpiry')} />}
              {pestHas && <ExpiryIndicator date={pestExpiry} />}
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
          <Button type="button" variant="secondary" onClick={onClose}>Anulo</Button>
          <Button type="submit" loading={isSubmitting}>
            {business ? 'Ruaj Ndryshimet' : 'Shto Biznesin'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
