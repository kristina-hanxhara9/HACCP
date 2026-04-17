import { db } from './db';
import type { Business, Inspection, NonConformance, ActivityLogEntry } from '@/types';

// Stable IDs so seed is idempotent
const BIZ_1 = 'demo-biz-restorant-vila';
const BIZ_2 = 'demo-biz-furre-dita';
const BIZ_3 = 'demo-biz-pasticeri-korca';
const BIZ_4 = 'demo-biz-minimarket-fresh';

const INS_1 = 'demo-ins-0001';
const INS_2 = 'demo-ins-0002';
const INS_3 = 'demo-ins-0003';
const INS_4 = 'demo-ins-0004';

const NC_1 = 'demo-nc-temp-frigo';
const NC_2 = 'demo-nc-sapun';
const NC_3 = 'demo-nc-docs-haccp';
const NC_4 = 'demo-nc-pest';
const NC_5 = 'demo-nc-training';

const now = new Date().toISOString();

// ─── Pre-written AI Report (must be before inspections) ──

const AI_REPORT_DEMO = `## PËRMBLEDHJE EKZEKUTIVE

Inspektimi i kryer në Restorant Vila Tirana më 15 Mars 2026 zbuloi një nivel të përgjithshëm mesatar rreziku. Biznesi demonstron praktika të mira bazë higjienike, por ka mangësi të rëndësishme në kontrollin e temperaturave, plotësimin e dokumentacionit dhe trajnimin e vazhdueshëm të stafit.

## VLERËSIMI I RREZIKUT

Niveli i rrezikut: MESATAR. Arsyetimi bazohet në kombinimin e faktorëve pozitivë (ambient i mirëmbajtur, kontroll i dëmtuesve efektiv) me gjetje negative (frigorifer jashtë kufirit termik, mungesa e regjistrave të temperaturave, certifikata shëndetësore të skaduara). Nëse gjetjet kritike nuk adresohen brenda afateve, rreziku mund të rritet në "I lartë".

## GJETJET KRYESORE

1. Frigoriferi 3 regjistroi 10°C — 2 gradë mbi kufirin maksimal (8°C), duke rrezikuar sigurinë e produkteve të ruajtura
2. Dispenseri i sapunit bosh në tualetet e stafit — rrezik i drejtpërdrejtë për higjienën e duarve
3. Mungojnë regjistrat e temperaturave — nuk ka evidencë të monitorimit ditor
4. Mungon procedura e tërheqjes nga tregu (recall)
5. Mungojnë regjistrat e trajnimit të stafit
6. Certifikata shëndetësore: disa të skaduara tek 18 punonjës
7. Pirja e duhanit u vërejt afër zonës së përgatitjes së ushqimit

## ANALIZA E TEMPERATURAVE

Nga 7 pika matjeje, 5 janë brenda kufijve të pranueshëm:
- Frigorifer 1: 4°C (OK, kufiri -2 deri 8°C)
- Frigorifer 2: 5°C (OK)
- Frigorifer 3: 10°C (JASHTË KUFIRIT — devijim +2°C)
- Ngrirës 1: -22°C (OK, kufiri deri -18°C)
- Ngrirës 2: -19°C (OK)
- Ambienti: 21°C (OK)
- Zona prodhimit: 18°C (OK)

Devijimi tek Frigoriferi 3 kërkon veprim të menjëhershëm: transferim i produkteve dhe riparim/zëvendësim i pajisjes. Fakti që regjistrat e temperaturave nuk plotësohen rregullisht nënkupton se devijime të ngjashme mund të kenë ndodhur pa u identifikuar.

## GJENDJA E DOKUMENTACIONIT HACCP

Plotësia e dokumentacionit: 6 nga 10 dokumente të pranishme (60%).

Dokumente të pranishme: Plani HACCP, analiza e rreziqeve, CCP, procedurat e pastrimit, regjistrat e pastrimit, plani i kontrollit të dëmtuesve, regjistrat e pranimit.

Dokumente që mungojnë ose janë të papërditësuara:
- Regjistrat e temperaturave — nuk plotësohen rregullisht
- Regjistrat e trajnimit të stafit — nuk ekzistojnë fare
- Procedura e tërheqjes nga tregu — nuk ka procedurë të shkruar

Procedura e pastrimit ka nevojë për përditësim (përditësimi i fundit: korrik 2025).

## MOSPËRPUTHJET E IDENTIFIKUARA

1. [I LARTË] Temperatura jashtë kufirit — Frigorifer 3 (10°C vs max 8°C) — Afati: 22 Mars 2026
2. [MESATAR] Mungon sapuni në tualetet e stafit — Afati: 16 Mars 2026

Të dyja mospërputhjet kërkojnë veprim korrigjues brenda afateve të caktuara. Mospërputhja e temperaturës ka prioritet më të lartë për shkak të ndikimit të drejtpërdrejtë në sigurinë ushqimore.

## REKOMANDIMET

Prioriteti 1 — Brenda 7 ditësh:
- Riparimi ose zëvendësimi i Frigoriferit 3
- Mbushja e dispenserit të sapunit dhe vendosja e kontrollit javor

Prioriteti 2 — Brenda 14 ditësh:
- Trajnim i stafit mbi higjienën personale dhe procedurën e larjes së duarve
- Ndalim i rreptë i pirjes së duhanit afër zonave të punës

Prioriteti 3 — Brenda 30 ditësh:
- Krijimi i regjistrave ditore të temperaturave
- Krijimi i regjistrave të trajnimit të stafit
- Hartimi i procedurës së tërheqjes nga tregu
- Përditësimi i procedurave të pastrimit
- Rinovimi i certifikatave shëndetësore të skaduara

## INFORMACION I PAMJAFTUESHËM

- Nuk ka foto dokumentuese për mospërputhjet e identifikuara
- Mungon historiku i inspektimeve të mëparshme për krahasim
- Nuk u verifikua gjendja e certifikatës së kontrollit të dëmtuesve me kompaninë DDD

## VLERËSIMI PËRFUNDIMTAR

Restorant Vila Tirana demonstron angazhim bazë ndaj sigurisë ushqimore, por ka boshllëqe të dukshme në monitorimin e temperaturave dhe dokumentacionin HACCP. Adresimi i prioritar i frigoriferit problematik dhe plotësimi i regjistrave janë hapa kritikë për uljen e rrezikut. Me veprime korrigjuese brenda afateve, biznesi ka potencialin të arrijë nivel "I ulët" rreziku në inspektimin e ardhshëm të planifikuar për 15 qershor 2026.`;

// ─── Businesses ──────────────────────────────────────────

const businesses: (Business & { id: string })[] = [
  {
    id: BIZ_1,
    name: 'Restorant Vila Tirana',
    type: 'restorant',
    nipt: 'L91234567A',
    registrationDate: '2019-03-10',
    address: 'Rruga e Kavajës, Nr. 120',
    city: 'Tiranë',
    postalCode: '1001',
    contactPerson: 'Arben Hoxha',
    phone: '+355 69 234 5678',
    email: 'info@vilatirana.al',
    employeeCount: 18,
    workSchedule: '07:00 - 23:00',
    area: 320,
    defaultRisk: 'mesatar',
    notes: 'Restorant i madh me sallë të brendshme dhe tarracë verore. Kuzhinë tradicionale dhe ndërkombëtare.',
    foodLicense: { has: true, expiryDate: '2026-12-31' },
    haccpCertificate: { has: true, expiryDate: '2027-01-15' },
    pestControl: { has: true, expiryDate: '2026-08-20' },
    createdAt: '2026-01-05T08:00:00.000Z',
    updatedAt: '2026-03-15T10:30:00.000Z',
  },
  {
    id: BIZ_2,
    name: 'Furrë Buke "Dita"',
    type: 'furre',
    nipt: 'K82345678B',
    registrationDate: '2015-06-22',
    address: 'Lagjja 1, Rruga Tregtare',
    city: 'Durrës',
    postalCode: '2001',
    contactPerson: 'Mimoza Shehu',
    phone: '+355 68 345 6789',
    email: 'furra.dita@gmail.com',
    employeeCount: 6,
    workSchedule: '04:00 - 14:00',
    area: 85,
    defaultRisk: 'i_ulet',
    notes: 'Furrë artizanale me prodhim ditor të bukës dhe produkteve të brumit.',
    foodLicense: { has: true, expiryDate: '2027-03-01' },
    haccpCertificate: { has: true, expiryDate: '2026-11-10' },
    pestControl: { has: true, expiryDate: '2026-10-15' },
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
  },
  {
    id: BIZ_3,
    name: 'Pastiçeri Korça',
    type: 'pasticeri',
    nipt: 'L03456789C',
    registrationDate: '2021-09-14',
    address: 'Bulevardi Republika, Nr. 45',
    city: 'Korçë',
    postalCode: '7001',
    contactPerson: 'Edi Muka',
    phone: '+355 67 456 7890',
    email: 'pasticeri.korca@outlook.com',
    employeeCount: 8,
    workSchedule: '06:00 - 20:00',
    area: 120,
    defaultRisk: 'i_larte',
    notes: 'Pastiçeri me prodhim ëmbëlsirash dhe tortash. Certifikata HACCP e skaduar — nevojitet rinovim urgjent.',
    foodLicense: { has: true, expiryDate: '2026-09-30' },
    haccpCertificate: { has: false },
    pestControl: { has: true, expiryDate: '2026-07-01' },
    createdAt: '2026-01-15T07:30:00.000Z',
    updatedAt: '2026-03-20T14:00:00.000Z',
  },
  {
    id: BIZ_4,
    name: 'Minimarket Fresh',
    type: 'minimarket',
    nipt: 'M14567890D',
    registrationDate: '2022-11-03',
    address: 'Rruga Sadik Zotaj, Nr. 8',
    city: 'Vlorë',
    postalCode: '9401',
    contactPerson: 'Besnik Lala',
    phone: '+355 66 567 8901',
    employeeCount: 4,
    workSchedule: '07:00 - 22:00',
    area: 60,
    defaultRisk: 'mesatar',
    notes: 'Minimarket me produkte ushqimore bazë dhe frigorifere.',
    foodLicense: { has: true, expiryDate: '2026-06-15' },
    haccpCertificate: { has: true, expiryDate: '2026-05-20' },
    pestControl: { has: false },
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  },
];

// ─── Inspections ─────────────────────────────────────────

const inspections: (Inspection & { id: string })[] = [
  // Inspection 1 — Restorant Vila — FINALIZED with AI report
  {
    id: INS_1,
    serialNumber: 'HACCP-2026-0001',
    businessId: BIZ_1,
    date: '2026-03-15',
    startTime: '09:00',
    endTime: '12:30',
    type: 'rutine',
    inspector: 'Ersida Reci',
    entryNotes: 'Inspektimi i parë vjetor i planifikuar. Ambienti i pastër në shikim fillestar. Stafi bashkëpunues.',
    environmentChecklist: [
      { id: 'e1', label: 'Dyshemeja dhe kanalet e kullimit', rating: 'mire', comment: '' },
      { id: 'e2', label: 'Muret dhe tavanet', rating: 'mire', comment: '' },
      { id: 'e3', label: 'Sipërfaqet e punës dhe tavolinat', rating: 'pranueshem', comment: 'Disa gërvishtje në tavolinën e përgatitjes' },
      { id: 'e4', label: 'Pajisjet dhe makineritë (pastërtia)', rating: 'mire', comment: '' },
      { id: 'e5', label: 'Frigoriferët dhe ngrirësit (pastërtia e brendshme)', rating: 'pranueshem', comment: 'Nevojitet defrost i ngrirësit 2' },
      { id: 'e6', label: 'Armaturat e ujit dhe lavatricet', rating: 'mire', comment: '' },
      { id: 'e7', label: 'Tualetet dhe dhoma e zhveshjes', rating: 'dobet', comment: 'Dispenseri i sapunit bosh në tualetet e stafit' },
      { id: 'e8', label: 'Zona e hyrjes dhe pranimi i mallrave', rating: 'mire', comment: '' },
      { id: 'e9', label: 'Zona e magazinimit të thatë', rating: 'pranueshem', comment: 'Nevojitet riorganizim i rafteve' },
      { id: 'e10', label: 'Menaxhimi i mbeturinave dhe kontejnerët', rating: 'mire', comment: 'Kontejnerë të pastër me kapak' },
      { id: 'e11', label: 'Kontrolli i dëmtuesve (prova / kurthe)', rating: 'mire', comment: 'Kurthet në vend, pa shenja dëmtuesish' },
      { id: 'e12', label: 'Ndriçimi (intensiteti + gjendja)', rating: 'mire', comment: '' },
      { id: 'e13', label: 'Ajrimi dhe ventilimi', rating: 'pranueshem', comment: 'Ventilatori i kuzhinës zhurmon — nevojitet mirëmbajtje' },
    ],
    temperatures: [
      { id: 't1', label: 'Frigorifer 1', value: 4, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't2', label: 'Frigorifer 2', value: 5, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't3', label: 'Frigorifer 3', value: 10, minTemp: -2, maxTemp: 8, comment: 'Temperatura jashtë kufirit — ushqime në rrezik' },
      { id: 't4', label: 'Ngrirës 1', value: -22, minTemp: -100, maxTemp: -18, comment: '' },
      { id: 't5', label: 'Ngrirës 2', value: -19, minTemp: -100, maxTemp: -18, comment: '' },
      { id: 't6', label: 'Temperatura e ambientit', value: 21, minTemp: 10, maxTemp: 25, comment: '' },
      { id: 't7', label: 'Zona e prodhimit', value: 18, minTemp: 10, maxTemp: 20, comment: '' },
    ],
    staffAssessment: {
      checklist: [
        { id: 's1', label: 'Uniforma e pastër dhe e plotë', rating: 'mire', comment: '' },
        { id: 's2', label: 'Larja e duarve — procedura e saktë', rating: 'pranueshem', comment: 'Disa punonjës nuk lajnë duart mjaftueshëm' },
        { id: 's3', label: 'Aksesorët dhe bizhuteritë (nuk mbahen)', rating: 'mire', comment: '' },
        { id: 's4', label: 'Shëndeti i punonjësve (plagë të mbuluara, etj.)', rating: 'mire', comment: '' },
        { id: 's5', label: 'Pirja e duhanit dhe ngrënia në zona jo të lejuara', rating: 'dobet', comment: 'U vërejt pirja e duhanit afër zonës së përgatitjes' },
      ],
      employeeCount: 18,
      healthCertStatus: 'disa_te_skaduara',
      lastTrainingDate: '2025-09-20',
      nextTrainingDate: '2026-04-15',
      staffComment: 'Stafi është përgjithësisht i ndërgjegjshëm, por nevojitet rifreskim i procedurave higjienike.',
    },
    documentChecklist: [
      { id: 'd1', label: 'Plani HACCP', status: 'ka', updatedDate: '2025-11-01', comment: '' },
      { id: 'd2', label: 'Analiza e rreziqeve (HACCP tree)', status: 'ka', updatedDate: '2025-11-01', comment: '' },
      { id: 'd3', label: 'Pikat kritike të kontrollit (CCP)', status: 'ka', updatedDate: '2025-11-01', comment: '' },
      { id: 'd4', label: 'Procedurat e pastrimit dhe dezinfektimit', status: 'ka', updatedDate: '2025-07-15', comment: 'Duhet përditësuar brenda 6 muajsh' },
      { id: 'd5', label: 'Regjistrat e temperaturave', status: 'jo', updatedDate: '', comment: 'Nuk plotësohen rregullisht' },
      { id: 'd6', label: 'Regjistrat e pastrimit', status: 'ka', updatedDate: '2026-03-01', comment: '' },
      { id: 'd7', label: 'Regjistrat e trajnimit të stafit', status: 'mungon', updatedDate: '', comment: 'Nuk ekzistojnë fare' },
      { id: 'd8', label: 'Plani i kontrollit të dëmtuesve', status: 'ka', updatedDate: '2025-12-10', comment: '' },
      { id: 'd9', label: 'Regjistrat e pranimit të mallrave', status: 'ka', updatedDate: '2026-02-28', comment: '' },
      { id: 'd10', label: 'Procedura e tërheqjes nga tregu (recall)', status: 'mungon', updatedDate: '', comment: 'Nuk ka procedurë të shkruar' },
    ],
    nonConformanceIds: [NC_1, NC_2],
    finalNotes: 'Biznesi përgjithësisht në gjendje të mirë. Çështjet prioritare: riparimi i frigoriferit 3, plotësimi i regjistrave të temperaturës, dhe trajnimi i stafit brenda muajit.',
    nextSteps: '1) Riparim ose zëvendësim i frigoriferit 3 brenda 1 jave, 2) Trajnim i stafit mbi higjienën personale brenda 2 javësh, 3) Plotësim i dokumentacionit mungues brenda 30 ditësh',
    suggestedNextDate: '2026-06-15',
    status: 'perfunduar',
    riskLevel: 'mesatar',
    aiReport: AI_REPORT_DEMO,
    createdAt: '2026-03-15T09:00:00.000Z',
    updatedAt: '2026-03-15T13:00:00.000Z',
  },

  // Inspection 2 — Pastiçeri Korça — FINALIZED, no AI report
  {
    id: INS_2,
    serialNumber: 'HACCP-2026-0002',
    businessId: BIZ_3,
    date: '2026-03-22',
    startTime: '08:00',
    endTime: '11:00',
    type: 'rutine',
    inspector: 'Ersida Reci',
    entryNotes: 'Inspektim rutinë. Biznesi ka certifikatë HACCP të skaduar.',
    environmentChecklist: [
      { id: 'e1', label: 'Dyshemeja dhe kanalet e kullimit', rating: 'pranueshem', comment: 'Disa zona të lagura pa sinjalistikë' },
      { id: 'e2', label: 'Muret dhe tavanet', rating: 'dobet', comment: 'Bojë e gërvishtur në zonën e prodhimit' },
      { id: 'e3', label: 'Sipërfaqet e punës dhe tavolinat', rating: 'pranueshem', comment: '' },
      { id: 'e4', label: 'Pajisjet dhe makineritë (pastërtia)', rating: 'pranueshem', comment: 'Mikser me mbetje brumi' },
      { id: 'e5', label: 'Frigoriferët dhe ngrirësit (pastërtia e brendshme)', rating: 'dobet', comment: 'Akullim i tepërt, nevojitet defrost urgjent' },
      { id: 'e6', label: 'Armaturat e ujit dhe lavatricet', rating: 'mire', comment: '' },
      { id: 'e7', label: 'Tualetet dhe dhoma e zhveshjes', rating: 'pranueshem', comment: '' },
      { id: 'e8', label: 'Zona e hyrjes dhe pranimi i mallrave', rating: 'dobet', comment: 'Mallrat lihen në dysheme pa mbrojtje' },
      { id: 'e9', label: 'Zona e magazinimit të thatë', rating: 'pranueshem', comment: 'Produkte pa etiketim i datës së hapjes' },
      { id: 'e10', label: 'Menaxhimi i mbeturinave dhe kontejnerët', rating: 'pranueshem', comment: '' },
      { id: 'e11', label: 'Kontrolli i dëmtuesve (prova / kurthe)', rating: 'dobet', comment: 'Nuk ka sistem kontrolli — shenja minjsh pranë magazinës' },
      { id: 'e12', label: 'Ndriçimi (intensiteti + gjendja)', rating: 'pranueshem', comment: '2 llamba të prishura' },
      { id: 'e13', label: 'Ajrimi dhe ventilimi', rating: 'pranueshem', comment: '' },
    ],
    temperatures: [
      { id: 't1', label: 'Frigorifer 1', value: 7, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't2', label: 'Frigorifer 2', value: 3, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't3', label: 'Frigorifer 3', value: null, minTemp: -2, maxTemp: 8, comment: 'Jashtë funksionit' },
      { id: 't4', label: 'Ngrirës 1', value: -16, minTemp: -100, maxTemp: -18, comment: 'Jashtë kufirit — nevojitet servis' },
      { id: 't5', label: 'Ngrirës 2', value: null, minTemp: -100, maxTemp: -18, comment: 'Nuk ekziston' },
      { id: 't6', label: 'Temperatura e ambientit', value: 24, minTemp: 10, maxTemp: 25, comment: '' },
      { id: 't7', label: 'Zona e prodhimit', value: 26, minTemp: 10, maxTemp: 20, comment: 'Shumë e nxehtë — ajrimi i pamjaftueshëm' },
    ],
    staffAssessment: {
      checklist: [
        { id: 's1', label: 'Uniforma e pastër dhe e plotë', rating: 'pranueshem', comment: 'Uniforma jo e plotë tek disa punonjës' },
        { id: 's2', label: 'Larja e duarve — procedura e saktë', rating: 'dobet', comment: 'Nuk respektohet procedura' },
        { id: 's3', label: 'Aksesorët dhe bizhuteritë (nuk mbahen)', rating: 'dobet', comment: 'Unaza dhe orë tek 3 punonjës' },
        { id: 's4', label: 'Shëndeti i punonjësve (plagë të mbuluara, etj.)', rating: 'pranueshem', comment: '' },
        { id: 's5', label: 'Pirja e duhanit dhe ngrënia në zona jo të lejuara', rating: 'mire', comment: '' },
      ],
      employeeCount: 8,
      healthCertStatus: 'mungojne',
      lastTrainingDate: '',
      nextTrainingDate: '',
      staffComment: 'Stafi nuk ka marrë asnjë trajnim HACCP. Nevojitet urgjentisht program trajnimi.',
    },
    documentChecklist: [
      { id: 'd1', label: 'Plani HACCP', status: 'mungon', updatedDate: '', comment: 'Nuk ka plan HACCP' },
      { id: 'd2', label: 'Analiza e rreziqeve (HACCP tree)', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd3', label: 'Pikat kritike të kontrollit (CCP)', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd4', label: 'Procedurat e pastrimit dhe dezinfektimit', status: 'jo', updatedDate: '', comment: 'Ekziston por e vjetëruar' },
      { id: 'd5', label: 'Regjistrat e temperaturave', status: 'jo', updatedDate: '', comment: '' },
      { id: 'd6', label: 'Regjistrat e pastrimit', status: 'jo', updatedDate: '', comment: '' },
      { id: 'd7', label: 'Regjistrat e trajnimit të stafit', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd8', label: 'Plani i kontrollit të dëmtuesve', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd9', label: 'Regjistrat e pranimit të mallrave', status: 'jo', updatedDate: '', comment: '' },
      { id: 'd10', label: 'Procedura e tërheqjes nga tregu (recall)', status: 'mungon', updatedDate: '', comment: '' },
    ],
    nonConformanceIds: [NC_3, NC_4],
    finalNotes: 'Biznesi ka probleme të shumta serioze. Mungesa e plotë e dokumentacionit HACCP, problemet me kontrollin e dëmtuesve dhe temperaturat jashtë kufirit përbëjnë rrezik të lartë.',
    nextSteps: '1) Hartim urgjent i planit HACCP, 2) Kontratë me kompani kontrolli dëmtuesish, 3) Riparim ngrirësi, 4) Trajnim i menjëhershëm i stafit',
    suggestedNextDate: '2026-04-22',
    status: 'perfunduar',
    riskLevel: 'i_larte',
    createdAt: '2026-03-22T08:00:00.000Z',
    updatedAt: '2026-03-22T11:30:00.000Z',
  },

  // Inspection 3 — Furrë Buke Dita — FINALIZED, low risk
  {
    id: INS_3,
    serialNumber: 'HACCP-2026-0003',
    businessId: BIZ_2,
    date: '2026-04-02',
    startTime: '05:30',
    endTime: '07:45',
    type: 'ndjekje',
    inspector: 'Ersida Reci',
    entryNotes: 'Inspektim ndjekjeje pas trajnimit të stafit. Përmirësime të dukshme.',
    environmentChecklist: [
      { id: 'e1', label: 'Dyshemeja dhe kanalet e kullimit', rating: 'mire', comment: '' },
      { id: 'e2', label: 'Muret dhe tavanet', rating: 'mire', comment: '' },
      { id: 'e3', label: 'Sipërfaqet e punës dhe tavolinat', rating: 'mire', comment: 'Të pastra dhe të dezinfektuara' },
      { id: 'e4', label: 'Pajisjet dhe makineritë (pastërtia)', rating: 'mire', comment: 'Furra e pastër, mikser i mirëmbajtur' },
      { id: 'e5', label: 'Frigoriferët dhe ngrirësit (pastërtia e brendshme)', rating: 'mire', comment: '' },
      { id: 'e6', label: 'Armaturat e ujit dhe lavatricet', rating: 'mire', comment: '' },
      { id: 'e7', label: 'Tualetet dhe dhoma e zhveshjes', rating: 'mire', comment: '' },
      { id: 'e8', label: 'Zona e hyrjes dhe pranimi i mallrave', rating: 'mire', comment: 'Zona e mirëorganizuar' },
      { id: 'e9', label: 'Zona e magazinimit të thatë', rating: 'mire', comment: 'Rafte metalike, FIFO i respektuar' },
      { id: 'e10', label: 'Menaxhimi i mbeturinave dhe kontejnerët', rating: 'mire', comment: '' },
      { id: 'e11', label: 'Kontrolli i dëmtuesve (prova / kurthe)', rating: 'mire', comment: '' },
      { id: 'e12', label: 'Ndriçimi (intensiteti + gjendja)', rating: 'mire', comment: '' },
      { id: 'e13', label: 'Ajrimi dhe ventilimi', rating: 'mire', comment: '' },
    ],
    temperatures: [
      { id: 't1', label: 'Frigorifer 1', value: 3, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't2', label: 'Frigorifer 2', value: null, minTemp: -2, maxTemp: 8, comment: 'Nuk përdoret' },
      { id: 't3', label: 'Frigorifer 3', value: null, minTemp: -2, maxTemp: 8, comment: 'Nuk ekziston' },
      { id: 't4', label: 'Ngrirës 1', value: -20, minTemp: -100, maxTemp: -18, comment: '' },
      { id: 't5', label: 'Ngrirës 2', value: null, minTemp: -100, maxTemp: -18, comment: 'Nuk ekziston' },
      { id: 't6', label: 'Temperatura e ambientit', value: 20, minTemp: 10, maxTemp: 25, comment: '' },
      { id: 't7', label: 'Zona e prodhimit', value: 19, minTemp: 10, maxTemp: 20, comment: '' },
    ],
    staffAssessment: {
      checklist: [
        { id: 's1', label: 'Uniforma e pastër dhe e plotë', rating: 'mire', comment: '' },
        { id: 's2', label: 'Larja e duarve — procedura e saktë', rating: 'mire', comment: 'Përmirësim i dukshëm pas trajnimit' },
        { id: 's3', label: 'Aksesorët dhe bizhuteritë (nuk mbahen)', rating: 'mire', comment: '' },
        { id: 's4', label: 'Shëndeti i punonjësve (plagë të mbuluara, etj.)', rating: 'mire', comment: '' },
        { id: 's5', label: 'Pirja e duhanit dhe ngrënia në zona jo të lejuara', rating: 'mire', comment: '' },
      ],
      employeeCount: 6,
      healthCertStatus: 'te_gjitha_ne_date',
      lastTrainingDate: '2026-02-15',
      nextTrainingDate: '2026-08-15',
      staffComment: 'Stafi i trajnuar rishtazi. Të gjithë punonjësit zbatojnë procedurat e duhura.',
    },
    documentChecklist: [
      { id: 'd1', label: 'Plani HACCP', status: 'ka', updatedDate: '2026-01-15', comment: '' },
      { id: 'd2', label: 'Analiza e rreziqeve (HACCP tree)', status: 'ka', updatedDate: '2026-01-15', comment: '' },
      { id: 'd3', label: 'Pikat kritike të kontrollit (CCP)', status: 'ka', updatedDate: '2026-01-15', comment: '' },
      { id: 'd4', label: 'Procedurat e pastrimit dhe dezinfektimit', status: 'ka', updatedDate: '2026-02-01', comment: '' },
      { id: 'd5', label: 'Regjistrat e temperaturave', status: 'ka', updatedDate: '2026-04-01', comment: 'Plotësohen ditore' },
      { id: 'd6', label: 'Regjistrat e pastrimit', status: 'ka', updatedDate: '2026-04-01', comment: '' },
      { id: 'd7', label: 'Regjistrat e trajnimit të stafit', status: 'ka', updatedDate: '2026-02-15', comment: '' },
      { id: 'd8', label: 'Plani i kontrollit të dëmtuesve', status: 'ka', updatedDate: '2026-01-10', comment: '' },
      { id: 'd9', label: 'Regjistrat e pranimit të mallrave', status: 'ka', updatedDate: '2026-03-28', comment: '' },
      { id: 'd10', label: 'Procedura e tërheqjes nga tregu (recall)', status: 'ka', updatedDate: '2026-01-15', comment: '' },
    ],
    nonConformanceIds: [NC_5],
    finalNotes: 'Rezultat i shkëlqyer. Furra është në përputhje të plotë me standardet HACCP. Model i mirë për biznese të ngjashme.',
    nextSteps: 'Inspektim i radhës rutinë pas 6 muajsh',
    suggestedNextDate: '2026-10-02',
    status: 'perfunduar',
    riskLevel: 'i_ulet',
    createdAt: '2026-04-02T05:30:00.000Z',
    updatedAt: '2026-04-02T08:00:00.000Z',
  },

  // Inspection 4 — Minimarket Fresh — DRAFT
  {
    id: INS_4,
    serialNumber: 'HACCP-2026-0004',
    businessId: BIZ_4,
    date: '2026-04-16',
    startTime: '10:00',
    endTime: '',
    type: 'rutine',
    inspector: 'Ersida Reci',
    entryNotes: 'Inspektim fillestar i minimarketit.',
    environmentChecklist: [
      { id: 'e1', label: 'Dyshemeja dhe kanalet e kullimit', rating: 'mire', comment: '' },
      { id: 'e2', label: 'Muret dhe tavanet', rating: 'mire', comment: '' },
      { id: 'e3', label: 'Sipërfaqet e punës dhe tavolinat', rating: 'na', comment: '' },
      { id: 'e4', label: 'Pajisjet dhe makineritë (pastërtia)', rating: 'na', comment: '' },
      { id: 'e5', label: 'Frigoriferët dhe ngrirësit (pastërtia e brendshme)', rating: 'na', comment: '' },
      { id: 'e6', label: 'Armaturat e ujit dhe lavatricet', rating: 'na', comment: '' },
      { id: 'e7', label: 'Tualetet dhe dhoma e zhveshjes', rating: 'na', comment: '' },
      { id: 'e8', label: 'Zona e hyrjes dhe pranimi i mallrave', rating: 'na', comment: '' },
      { id: 'e9', label: 'Zona e magazinimit të thatë', rating: 'na', comment: '' },
      { id: 'e10', label: 'Menaxhimi i mbeturinave dhe kontejnerët', rating: 'na', comment: '' },
      { id: 'e11', label: 'Kontrolli i dëmtuesve (prova / kurthe)', rating: 'na', comment: '' },
      { id: 'e12', label: 'Ndriçimi (intensiteti + gjendja)', rating: 'na', comment: '' },
      { id: 'e13', label: 'Ajrimi dhe ventilimi', rating: 'na', comment: '' },
    ],
    temperatures: [
      { id: 't1', label: 'Frigorifer 1', value: null, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't2', label: 'Frigorifer 2', value: null, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't3', label: 'Frigorifer 3', value: null, minTemp: -2, maxTemp: 8, comment: '' },
      { id: 't4', label: 'Ngrirës 1', value: null, minTemp: -100, maxTemp: -18, comment: '' },
      { id: 't5', label: 'Ngrirës 2', value: null, minTemp: -100, maxTemp: -18, comment: '' },
      { id: 't6', label: 'Temperatura e ambientit', value: null, minTemp: 10, maxTemp: 25, comment: '' },
      { id: 't7', label: 'Zona e prodhimit', value: null, minTemp: 10, maxTemp: 20, comment: '' },
    ],
    staffAssessment: {
      checklist: [
        { id: 's1', label: 'Uniforma e pastër dhe e plotë', rating: 'na', comment: '' },
        { id: 's2', label: 'Larja e duarve — procedura e saktë', rating: 'na', comment: '' },
        { id: 's3', label: 'Aksesorët dhe bizhuteritë (nuk mbahen)', rating: 'na', comment: '' },
        { id: 's4', label: 'Shëndeti i punonjësve (plagë të mbuluara, etj.)', rating: 'na', comment: '' },
        { id: 's5', label: 'Pirja e duhanit dhe ngrënia në zona jo të lejuara', rating: 'na', comment: '' },
      ],
      employeeCount: null,
      healthCertStatus: 'te_gjitha_ne_date',
      lastTrainingDate: '',
      nextTrainingDate: '',
      staffComment: '',
    },
    documentChecklist: [
      { id: 'd1', label: 'Plani HACCP', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd2', label: 'Analiza e rreziqeve (HACCP tree)', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd3', label: 'Pikat kritike të kontrollit (CCP)', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd4', label: 'Procedurat e pastrimit dhe dezinfektimit', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd5', label: 'Regjistrat e temperaturave', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd6', label: 'Regjistrat e pastrimit', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd7', label: 'Regjistrat e trajnimit të stafit', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd8', label: 'Plani i kontrollit të dëmtuesve', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd9', label: 'Regjistrat e pranimit të mallrave', status: 'mungon', updatedDate: '', comment: '' },
      { id: 'd10', label: 'Procedura e tërheqjes nga tregu (recall)', status: 'mungon', updatedDate: '', comment: '' },
    ],
    nonConformanceIds: [],
    finalNotes: '',
    nextSteps: '',
    suggestedNextDate: '',
    status: 'draft',
    riskLevel: 'mesatar',
    createdAt: '2026-04-16T10:00:00.000Z',
    updatedAt: '2026-04-16T10:00:00.000Z',
  },
];

// ─── Non-Conformances ────────────────────────────────────

const nonConformances: (NonConformance & { id: string })[] = [
  {
    id: NC_1,
    inspectionId: INS_1,
    businessId: BIZ_1,
    title: 'Temperatura jashtë kufirit — Frigorifer 3',
    category: 'temperature',
    description: 'Frigoriferi 3 regjistroi 10°C, mbi kufirin maksimal prej 8°C. Produktet e ruajtura brenda (perime, djathë) janë në rrezik kontaminimi bakterial.',
    riskLevel: 'i_larte',
    correctiveAction: 'Riparimi ose zëvendësimi i frigoriferit. Transferimi i menjëhershëm i ushqimeve në frigorifer funksional. Verifikimi i temperaturës çdo 2 orë deri në zgjidhje.',
    deadline: '2026-03-22',
    responsiblePerson: 'Arben Hoxha',
    status: 'ne_procesim',
    createdAt: '2026-03-15T11:00:00.000Z',
    updatedAt: '2026-03-18T09:00:00.000Z',
  },
  {
    id: NC_2,
    inspectionId: INS_1,
    businessId: BIZ_1,
    title: 'Mungon sapuni — Tualeti i stafit',
    category: 'higijene_ambienti',
    description: 'Dispenseri i sapunit në tualetet e stafit ishte bosh. Kjo rrezikon higjienën e duarve të punonjësve që punojnë me ushqim.',
    riskLevel: 'mesatar',
    correctiveAction: 'Mbushja menjëherë e dispenserit dhe vendosja e kontrollit javor të furnizimeve higjienike.',
    deadline: '2026-03-16',
    responsiblePerson: 'Menaxheri i turnit',
    status: 'hapur',
    createdAt: '2026-03-15T11:15:00.000Z',
    updatedAt: '2026-03-15T11:15:00.000Z',
  },
  {
    id: NC_3,
    inspectionId: INS_2,
    businessId: BIZ_3,
    title: 'Mungesa e plotë e dokumentacionit HACCP',
    category: 'dokumentacion',
    description: 'Biznesi nuk ka plan HACCP, analizë rreziqesh, CCP, regjistrat e trajnimit, apo procedurë recall. Kjo përbën shkelje serioze të rregulloreve të sigurisë ushqimore.',
    riskLevel: 'kritik',
    correctiveAction: 'Hartimi i menjëhershëm i planit HACCP me ndihmën e konsulentit. Plotësimi i të gjithë dokumentacionit brenda 30 ditësh.',
    deadline: '2026-04-22',
    responsiblePerson: 'Edi Muka',
    status: 'hapur',
    createdAt: '2026-03-22T10:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
  },
  {
    id: NC_4,
    inspectionId: INS_2,
    businessId: BIZ_3,
    title: 'Shenja dëmtuesish — Mungon sistemi i kontrollit',
    category: 'kontrolli_demtuesve',
    description: 'U vërejtën shenja minjsh pranë zonës së magazinimit. Biznesi nuk ka kontratë me kompani DDD dhe nuk ka kurthe ose stacione monitorimi.',
    riskLevel: 'kritik',
    correctiveAction: 'Lidhje urgjente e kontratës me kompani të licencuar DDD. Vendosje e stacioneve monitorimi brenda 48 orësh. Pastrim i thellë i zonës së magazinimit.',
    deadline: '2026-03-25',
    responsiblePerson: 'Edi Muka',
    status: 'hapur',
    createdAt: '2026-03-22T10:30:00.000Z',
    updatedAt: '2026-03-22T10:30:00.000Z',
  },
  {
    id: NC_5,
    inspectionId: INS_3,
    businessId: BIZ_2,
    title: 'Trajnimi i stafit — i përfunduar',
    category: 'higjiena_stafit',
    description: 'Në inspektimin e mëparshëm, stafi nuk kishte trajnim bazë HACCP. U organizua sesion trajnimi me 15 shkurt 2026.',
    riskLevel: 'i_ulet',
    correctiveAction: 'Sesion trajnimi 4-orësh u mbajt më 15 shkurt 2026. Të gjithë 6 punonjësit morën certifikatë.',
    deadline: '2026-03-01',
    responsiblePerson: 'Mimoza Shehu',
    status: 'zgjidhur',
    resolution: {
      actions: 'Trajnimi u krye me sukses. Certifikatat u lëshuan për të gjithë punonjësit. Procedurat e reja u afishuan në zonën e punës.',
      date: '2026-02-15',
    },
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-15T15:00:00.000Z',
  },
];

// ─── Activity Log ────────────────────────────────────────

const activityLog: (ActivityLogEntry & { id: string })[] = [
  { id: 'demo-log-01', type: 'business_created', description: 'Biznesi "Restorant Vila Tirana" u regjistrua', entityId: BIZ_1, entityType: 'business', timestamp: '2026-01-05T08:00:00.000Z' },
  { id: 'demo-log-02', type: 'business_created', description: 'Biznesi "Furrë Buke Dita" u regjistrua', entityId: BIZ_2, entityType: 'business', timestamp: '2026-01-10T09:00:00.000Z' },
  { id: 'demo-log-03', type: 'business_created', description: 'Biznesi "Pastiçeri Korça" u regjistrua', entityId: BIZ_3, entityType: 'business', timestamp: '2026-01-15T07:30:00.000Z' },
  { id: 'demo-log-04', type: 'business_created', description: 'Biznesi "Minimarket Fresh" u regjistrua', entityId: BIZ_4, entityType: 'business', timestamp: '2026-02-01T10:00:00.000Z' },
  { id: 'demo-log-05', type: 'inspection_finalized', description: 'Inspektimi HACCP-2026-0001 u finalizua (Restorant Vila Tirana)', entityId: INS_1, entityType: 'inspection', timestamp: '2026-03-15T12:30:00.000Z' },
  { id: 'demo-log-06', type: 'nc_created', description: 'Mospërputhje: Temperatura jashtë kufirit — Frigorifer 3', entityId: NC_1, entityType: 'nonconformance', timestamp: '2026-03-15T11:00:00.000Z' },
  { id: 'demo-log-07', type: 'report_generated', description: 'Raporti AI u gjenerua për HACCP-2026-0001', entityId: INS_1, entityType: 'inspection', timestamp: '2026-03-15T13:00:00.000Z' },
  { id: 'demo-log-08', type: 'inspection_finalized', description: 'Inspektimi HACCP-2026-0002 u finalizua (Pastiçeri Korça)', entityId: INS_2, entityType: 'inspection', timestamp: '2026-03-22T11:00:00.000Z' },
  { id: 'demo-log-09', type: 'nc_created', description: 'Mospërputhje kritike: Mungesa e dokumentacionit HACCP', entityId: NC_3, entityType: 'nonconformance', timestamp: '2026-03-22T10:00:00.000Z' },
  { id: 'demo-log-10', type: 'inspection_finalized', description: 'Inspektimi HACCP-2026-0003 u finalizua (Furrë Buke Dita)', entityId: INS_3, entityType: 'inspection', timestamp: '2026-04-02T07:45:00.000Z' },
  { id: 'demo-log-11', type: 'nc_resolved', description: 'Mospërputhja "Trajnimi i stafit" u zgjidh (Furrë Buke Dita)', entityId: NC_5, entityType: 'nonconformance', timestamp: '2026-02-15T15:00:00.000Z' },
  { id: 'demo-log-12', type: 'inspection_created', description: 'Inspektimi HACCP-2026-0004 u krijua (Minimarket Fresh) — draft', entityId: INS_4, entityType: 'inspection', timestamp: '2026-04-16T10:00:00.000Z' },
];

// ─── Seed Function ───────────────────────────────────────

export async function seedDemoData(): Promise<void> {
  // Check if demo data already exists
  const existing = await db.businesses.get(BIZ_1);
  if (existing) return; // Already seeded

  await db.businesses.bulkPut(businesses);
  await db.inspections.bulkPut(inspections);
  await db.nonConformances.bulkPut(nonConformances);
  await db.activityLog.bulkPut(activityLog);

  // Set serial counter to 4 so next real inspection gets 0005
  localStorage.setItem('haccp_serial_counter', '4');
  localStorage.setItem('haccp_serial_year', '2026');

  console.log('[HACCP] Demo data seeded successfully — 4 businesses, 4 inspections, 5 NCs');
}
