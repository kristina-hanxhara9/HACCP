import type { ChecklistItem, TemperatureReading, DocumentCheckItem } from '@/types';

export const DEFAULT_ENVIRONMENT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Dyshemeja dhe kanalet e kullimit', rating: 'na', comment: '' },
  { label: 'Muret dhe tavanet', rating: 'na', comment: '' },
  { label: 'Sipërfaqet e punës dhe tavolinat', rating: 'na', comment: '' },
  { label: 'Pajisjet dhe makineritë (pastërtia)', rating: 'na', comment: '' },
  { label: 'Frigoriferët dhe ngrirësit (pastërtia e brendshme)', rating: 'na', comment: '' },
  { label: 'Armaturat e ujit dhe lavatricet', rating: 'na', comment: '' },
  { label: 'Tualetet dhe dhoma e zhveshjes', rating: 'na', comment: '' },
  { label: 'Zona e hyrjes dhe pranimi i mallrave', rating: 'na', comment: '' },
  { label: 'Zona e magazinimit të thatë', rating: 'na', comment: '' },
  { label: 'Menaxhimi i mbeturinave dhe kontejnerët', rating: 'na', comment: '' },
  { label: 'Kontrolli i dëmtuesve (prova / kurthe)', rating: 'na', comment: '' },
  { label: 'Ndriçimi (intensiteti + gjendja)', rating: 'na', comment: '' },
  { label: 'Ajrimi dhe ventilimi', rating: 'na', comment: '' },
];

export const DEFAULT_TEMPERATURES: Omit<TemperatureReading, 'id'>[] = [
  { label: 'Frigorifer 1', value: null, minTemp: -2, maxTemp: 8, comment: '' },
  { label: 'Frigorifer 2', value: null, minTemp: -2, maxTemp: 8, comment: '' },
  { label: 'Frigorifer 3', value: null, minTemp: -2, maxTemp: 8, comment: '' },
  { label: 'Ngrirës 1', value: null, minTemp: -100, maxTemp: -18, comment: '' },
  { label: 'Ngrirës 2', value: null, minTemp: -100, maxTemp: -18, comment: '' },
  { label: 'Temperatura e ambientit', value: null, minTemp: 10, maxTemp: 25, comment: '' },
  { label: 'Zona e prodhimit', value: null, minTemp: 10, maxTemp: 20, comment: '' },
];

export const DEFAULT_STAFF_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Uniforma e pastër dhe e plotë', rating: 'na', comment: '' },
  { label: 'Larja e duarve — procedura e saktë', rating: 'na', comment: '' },
  { label: 'Aksesorët dhe bizhuteritë (nuk mbahen)', rating: 'na', comment: '' },
  { label: 'Shëndeti i punonjësve (plagë të mbuluara, etj.)', rating: 'na', comment: '' },
  { label: 'Pirja e duhanit dhe ngrënia në zona jo të lejuara', rating: 'na', comment: '' },
];

export const DEFAULT_DOCUMENT_CHECKLIST: Omit<DocumentCheckItem, 'id'>[] = [
  { label: 'Plani HACCP', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Analiza e rreziqeve (HACCP tree)', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Pikat kritike të kontrollit (CCP)', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Procedurat e pastrimit dhe dezinfektimit', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Regjistrat e temperaturave', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Regjistrat e pastrimit', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Regjistrat e trajnimit të stafit', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Plani i kontrollit të dëmtuesve', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Regjistrat e pranimit të mallrave', status: 'mungon', updatedDate: '', comment: '' },
  { label: 'Procedura e tërheqjes nga tregu (recall)', status: 'mungon', updatedDate: '', comment: '' },
];

export const AI_SYSTEM_PROMPT = `Ti je ekspert i lartë i sigurisë ushqimore dhe konsulent HACCP i çertifikuar me mbi 15 vjet përvojë në Shqipëri dhe rajon. Shkruan raporte profesionale inspektimi në gjuhën shqipe standarde. Raportet e tua janë të qarta, objektive, të strukturuara dhe të bazuara vetëm në të dhënat e inspektimit. Nuk shton informacion që nuk ekziston në të dhëna. Kur gjej të dhëna që mungojnë, i identifikon qartë si "Informacion i pamjaftueshëm". Nuk bën gjykime ligjore. Toni është profesional dhe konstruktiv.

Struktura e raportit duhet të jetë:

## PËRMBLEDHJE EKZEKUTIVE
[2-3 fjali vlerësim i përgjithshëm]

## VLERËSIMI I RREZIKUT
[Niveli i përgjithshëm i rrezikut dhe arsyetimi]

## GJETJET KRYESORE
[Listë e numëruar e gjetjeve të rëndësishme]

## ANALIZA E TEMPERATURAVE
[Vlerësimi i temperaturave — flag çdo devijim]

## GJENDJA E DOKUMENTACIONIT HACCP
[Vlerësimi i plotësisë së dokumentacionit]

## MOSPËRPUTHJET E IDENTIFIKUARA
[Përmbledhje e mospërputhjeve me renditje prioritare]

## REKOMANDIMET
[Rekomandime veprimi të prioritizuara me afate kohore]

## INFORMACION I PAMJAFTUESHËM
[Listë e boshllëqeve të të dhënave të gjetura]

## VLERËSIMI PËRFUNDIMTAR
[Vlerësim final profesional — 1 paragraf]`;
