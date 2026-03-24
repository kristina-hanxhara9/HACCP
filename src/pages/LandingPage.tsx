import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}
import {
  Shield,
  ShieldCheck,
  Thermometer,
  ClipboardList,
  ClipboardCheck,
  Brain,
  AlertTriangle,
  Building2,
  PenTool,
  Download,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Store,
  Coffee,
  Utensils,
  ShoppingBasket,
  HelpCircle,
  ChefHat,
} from 'lucide-react';

// ─── Data ───────────────────────────────────────────────

const features = [
  { icon: ClipboardCheck, title: 'Inspektime Digjitale', desc: 'Kryeni inspektime të plota me lista kontrolli, temperatura dhe vlerësime mjedisi — gjithçka dixhitale.' },
  { icon: Brain, title: 'Raporte me AI', desc: 'Gjeneroni raporte profesionale inspektimi me inteligjencë artificiale në sekonda.' },
  { icon: AlertTriangle, title: 'Gjurmimi i NC', desc: 'Regjistroni dhe ndiqni mospërputhjet me afate, përgjegjës dhe veprime korrigjuese.' },
  { icon: Building2, title: 'Menaxhimi i Bizneseve', desc: 'Administroni të gjitha bizneset, licencat, certifikatat dhe historikun e inspektimeve.' },
  { icon: PenTool, title: 'Nënshkrim Dixhital', desc: 'Nënshkruani raportet dixhitalisht direkt nga platforma — pa letra, pa vonesa.' },
  { icon: Download, title: 'Eksport & Backup', desc: 'Eksportoni të dhënat në JSON, printoni raporte në PDF dhe mbani kopje sigurie.' },
];

const steps = [
  { num: '01', title: 'Regjistroni Biznesin', desc: 'Shtoni bizneset me të dhëna të plota — licenca, certifikata, kontakte.' },
  { num: '02', title: 'Kryeni Inspektimin', desc: 'Plotësoni inspektimin hap pas hapi — mjedisi, temperaturat, stafi, dokumentat.' },
  { num: '03', title: 'Gjeneroni Raportin', desc: 'AI gjeneron raportin profesional — shtypni ose eksportoni menjëherë.' },
];

const stats = [
  { value: '100%', label: 'Digjitale' },
  { value: 'HACCP', label: 'Në Përputhje' },
  { value: 'AI', label: 'Raporte Automatike' },
  { value: '24/7', label: 'Akses i Plotë' },
];

const faqs = [
  { q: 'A duhet të kem laborator për të pasur HACCP?', a: 'Jo. Shumica e bizneseve të vogla nuk kanë laborator. Ne bashkëpunojmë me laboratorë të jashtëm kur është e nevojshme dhe fokusohemi te proceset tuaja të përditshme dhe dokumentacioni.' },
  { q: 'A jeni të detyruar të njoftoni autoritetet?', a: 'Jo, ne jemi konsulentë të pavarur. Qëllimi ynë është t\'ju ndihmojmë të përmirësoheni dhe të përgatiteni për kontrollet zyrtare.' },
  { q: 'Sa shpesh rekomandohet kontroll higjene?', a: 'Për shumicën e bizneseve, rekomandojmë të paktën një kontroll higjene në muaj, plus inspektime ndjekje kur ka mospërputhje kritike.' },
  { q: 'A mund të punojmë nga distanca?', a: 'Po. Pjesa më e madhe e dokumentacionit dhe raporteve mund të bëhet online, ndërsa inspektimet fizike organizohen sipas mundësive.' },
];

const businessTypes = [
  { label: 'Furrë', icon: Store },
  { label: 'Pastiçeri', icon: ChefHat },
  { label: 'Kafene', icon: Coffee },
  { label: 'Restorant', icon: Utensils },
  { label: 'Minimarket', icon: ShoppingBasket },
  { label: 'Tjetër', icon: HelpCircle },
];

// ─── Components ─────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item border border-[#e2e8f0] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-[#f8fafc] transition-colors">
        <span className="text-sm font-semibold text-[#0f172a] pr-4">{q}</span>
        <ChevronDown size={18} className={`text-[#64748b] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5 px-5' : 'max-h-0'}`}>
        <p className="text-sm text-[#64748b] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────

export function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ businessName: '', type: 'Furrë', city: '', name: '', phone: '', email: '', message: '' });

  // GSAP animations
  useLayoutEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger || !mainRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ── Floating icons bobbing ──
      gsap.utils.toArray('.float-icon').forEach((icon: any, i: number) => {
        gsap.to(icon, {
          y: -15,
          rotation: i % 2 === 0 ? 3 : -3,
          duration: 2 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
      });

      // ── Mouse parallax on hero ──
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        gsap.to('.hero-parallax', { x, y, duration: 1, ease: 'power2.out' });
        gsap.to('.float-icon', { x: -x * 1.5, y: -y * 1.5, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
      };
      window.addEventListener('mousemove', handleMouseMove);

      // ── Scroll-triggered sections ──
      const revealSections = gsap.utils.toArray('.gsap-reveal');
      revealSections.forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: 'top 85%', once: true },
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });

      // ── Feature cards stagger ──
      ScrollTrigger.create({
        trigger: '#features .grid',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from('.feature-card', { y: 60, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' });
        },
      });

      // ── Steps stagger ──
      ScrollTrigger.create({
        trigger: '#steps .grid',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from('.step-card', { x: -40, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out' });
        },
      });

      // ── Stats counter-like reveal ──
      ScrollTrigger.create({
        trigger: '#stats',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from('.stat-item', { y: 30, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.12, ease: 'back.out(1.7)' });
        },
      });

      // ── FAQ items stagger ──
      ScrollTrigger.create({
        trigger: '#faq .space-y-3',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.from('.faq-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
        },
      });

      // ── Contact section ──
      ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.from('.contact-left > *', { x: -30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' });
          gsap.from('.contact-form', { x: 30, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });
        },
      });

      // ── Compliance badges ──
      ScrollTrigger.create({
        trigger: '#compliance .grid',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.from('.compliance-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });
        },
      });

      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, mainRef.current);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Kerkesë Inspektimi: ${formData.businessName || 'Biznes i Ri'} (${formData.city})`;
    const body = `Përshëndetje,\n\nDua të rezervoj një inspektim ose të marr më shumë informacion.\n\nTipi: ${formData.type}\nQyteti: ${formData.city}\nBiznesi: ${formData.businessName || '-'}\nTelefoni: ${formData.phone}\nEmri: ${formData.name || '-'}\nEmail: ${formData.email || '-'}\n\nMesazhi:\n${formData.message || '-'}`;
    window.location.href = `mailto:ersidareci73@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div ref={mainRef} className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1a5c35] flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0f172a] leading-tight">SiguriUshqimore</p>
              <p className="text-[9px] font-medium text-[#64748b] tracking-wider uppercase">HACCP Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#0f172a] hover:text-[#1a5c35] transition-colors">Kontakt</a>
            <Link to="/login" className="px-5 py-2 bg-[#1a5c35] text-white text-sm font-medium rounded-lg hover:bg-[#144a2a] transition-colors">
              Hyr në Platformë
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#f8fafc] pt-20 pb-10">
        {/* Background blobs */}
        <div className="hero-parallax absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#1a5c35]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#1a5c35]/8 rounded-full blur-[100px]" />
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 pointer-events-none hidden md:block max-w-7xl mx-auto z-0">
          <div className="float-icon absolute top-[15%] left-[8%] text-[#1a5c35] bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-2xl shadow-[#1a5c35]/10 border border-white/50">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <div className="float-icon absolute top-[25%] right-[12%] text-[#1a5c35] bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-2xl shadow-[#1a5c35]/10 border border-white/50">
            <Thermometer size={40} strokeWidth={1.5} />
          </div>
          <div className="float-icon absolute bottom-[25%] left-[15%] text-[#1a5c35] bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-2xl shadow-[#1a5c35]/10 border border-white/50">
            <ClipboardList size={40} strokeWidth={1.5} />
          </div>
        </div>

        <div className="hero-parallax relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] rounded-full shadow-sm mb-8 animate-[fadeSlideUp_0.8s_ease-out_0.1s_both]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a5c35] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a5c35]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Specializuar për biznese ushqimore</span>
          </div>

          <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-extrabold text-[#0f172a] tracking-tight leading-[1.1] mb-8 overflow-hidden animate-[fadeSlideUp_0.9s_ease-out_0.25s_both]">
            <span>Konsulencë </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a5c35] to-[#2d7a4f]">HACCP</span>
            <br />
            <span>& Siguri Ushqimore</span>
          </h1>

          <p className="hero-desc text-lg md:text-xl text-[#64748b] leading-relaxed mb-10 max-w-2xl mx-auto animate-[fadeSlideUp_0.8s_ease-out_0.4s_both]">
            Ndihmojmë furra, pastiçeri, kafene, restorante dhe minimarkete të jenë në përputhje me kërkesat ligjore, pa stres dhe pa letra të pafundme.
          </p>

          <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-[fadeSlideUp_0.8s_ease-out_0.55s_both]">
            <a href="#contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1a5c35] text-white text-base font-semibold rounded-xl hover:bg-[#144a2a] transition-all hover:shadow-lg hover:shadow-[#1a5c35]/20">
              Rezervo një inspektim <ArrowRight size={18} />
            </a>
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/50 text-[#0f172a] text-base font-semibold rounded-xl border border-[#e2e8f0] hover:bg-white transition-colors">
              Zbulo Më Shumë <ChevronRight size={18} />
            </a>
          </div>

          <div className="hero-tag flex items-center justify-center gap-4 text-[#94a3b8] text-sm font-medium animate-[fadeSlideUp_0.8s_ease-out_0.7s_both]">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#e2e8f0]" />
            <p>Platformë online + Raporte AI</p>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#e2e8f0]" />
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="gsap-reveal text-center mb-16">
            <p className="text-sm font-semibold text-[#1a5c35] tracking-wider uppercase mb-3">Veçoritë</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Gjithçka që ju nevojitet</h2>
            <p className="text-[#64748b] max-w-xl mx-auto">Nga inspektimi deri te raporti final — një platformë e vetme për të gjithë procesin HACCP.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="feature-card group p-6 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#1a5c35]/30 hover:shadow-lg hover:shadow-[#1a5c35]/5 transition-all duration-300" >
                <div className="w-12 h-12 rounded-xl bg-[#f0f9f1] flex items-center justify-center mb-4 group-hover:bg-[#1a5c35] transition-colors duration-300">
                  <f.icon size={22} className="text-[#1a5c35] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-[#0f172a] mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="steps" className="py-24 md:py-32 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="gsap-reveal text-center mb-16">
            <p className="text-sm font-semibold text-[#1a5c35] tracking-wider uppercase mb-3">Si Funksionon</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Tre hapa të thjeshtë</h2>
            <p className="text-[#64748b] max-w-xl mx-auto">Procesi i inspektimit i thjeshtëzuar dhe i automatizuar nga fillimi deri në fund.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="step-card relative">
                <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0] h-full">
                  <span className="text-5xl font-bold text-[#1a5c35]/10 block mb-4">{s.num}</span>
                  <h3 className="text-lg font-semibold text-[#0f172a] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight size={24} className="text-[#1a5c35]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="py-20 bg-[#1a5c35]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={s.label} className="stat-item text-center">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-sm text-white/70 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Compliance ─── */}
      <section id="compliance" className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="gsap-reveal text-center mb-12">
            <p className="text-sm font-semibold text-[#1a5c35] tracking-wider uppercase mb-3">Përputhshmëria</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Në përputhje me standardet</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Rregullore HACCP Kombëtare', 'Standarde Europiane të Sigurisë Ushqimore', 'Dokumentacion i Plotë Inspektimi'].map((item, i) => (
              <div key={item} className="compliance-item flex items-start gap-3 p-5 rounded-xl bg-[#f0f9f1] border border-[#1a5c35]/10">
                <CheckCircle size={20} className="text-[#1a5c35] mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-[#0f172a]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 md:py-32 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="gsap-reveal text-center mb-12">
            <p className="text-sm font-semibold text-[#1a5c35] tracking-wider uppercase mb-3">Pyetje të Shpeshta</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Keni pyetje?</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className="py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left info */}
            <div className="contact-left lg:col-span-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f9f1] text-[#1a5c35] text-xs font-bold uppercase tracking-wider mb-6 border border-[#1a5c35]/20">
                Kontakt
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6 leading-tight">
                Gati për të nisur?<br />
                <span className="text-[#1a5c35]">Rezervo inspektimin.</span>
              </h2>
              <p className="text-lg text-[#64748b] mb-12 leading-relaxed">
                Na tregoni detajet e biznesit tuaj dhe ne do t&apos;ju kontaktojmë për të caktuar një orar.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f9f1] border border-[#1a5c35]/10 flex items-center justify-center text-[#1a5c35] group-hover:bg-[#1a5c35] group-hover:text-white transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-[#94a3b8] mb-1 tracking-wider">Email</div>
                    <a href="mailto:ersidareci73@gmail.com" className="font-bold text-lg text-[#0f172a] hover:text-[#1a5c35] transition-colors">ersidareci73@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f9f1] border border-[#1a5c35]/10 flex items-center justify-center text-[#1a5c35] group-hover:bg-[#1a5c35] group-hover:text-white transition-all duration-300">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-[#94a3b8] mb-1 tracking-wider">Telefon / WhatsApp</div>
                    <a href="tel:+355684249050" className="font-bold text-lg text-[#0f172a] hover:text-[#1a5c35] transition-colors">+355 68 424 9050</a>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0f9f1] border border-[#1a5c35]/10 flex items-center justify-center text-[#1a5c35] group-hover:bg-[#1a5c35] group-hover:text-white transition-all duration-300">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-[#94a3b8] mb-1 tracking-wider">Vendndodhja</div>
                    <div className="font-bold text-lg text-[#0f172a]">Shqipëri</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="contact-form lg:col-span-7 bg-[#f8fafc] p-8 md:p-10 rounded-[2rem] border border-[#e2e8f0] shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* Business type */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#64748b] uppercase tracking-wide block">Tipi i biznesit</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {businessTypes.map((bType) => {
                      const Icon = bType.icon;
                      return (
                        <button key={bType.label} type="button" onClick={() => setFormData({ ...formData, type: bType.label })}
                          className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                            formData.type === bType.label
                              ? 'bg-[#1a5c35] border-[#1a5c35] text-white shadow-[0_0_15px_rgba(26,92,53,0.2)]'
                              : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f0f9f1] hover:text-[#0f172a] hover:border-[#1a5c35]/30'
                          }`}
                        >
                          <Icon size={18} /> {bType.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Required fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0f172a] block">Qyteti <span className="text-[#1a5c35]">*</span></label>
                    <input required name="city" value={formData.city} onChange={handleChange} type="text" placeholder="psh. Tiranë"
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a5c35] focus:ring-1 focus:ring-[#1a5c35] outline-none transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0f172a] block">Telefoni <span className="text-[#1a5c35]">*</span></label>
                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="069 XX XX XXX"
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a5c35] focus:ring-1 focus:ring-[#1a5c35] outline-none transition-all text-sm" />
                  </div>
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#64748b] flex justify-between"><span>Emri i biznesit</span><span className="text-[10px] uppercase tracking-wider opacity-50">Opsionale</span></label>
                    <input name="businessName" value={formData.businessName} onChange={handleChange} type="text" placeholder="Emri i subjektit"
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a5c35] focus:ring-1 focus:ring-[#1a5c35] outline-none transition-all text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#64748b] flex justify-between"><span>Emri juaj</span><span className="text-[10px] uppercase tracking-wider opacity-50">Opsionale</span></label>
                    <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Emri i kontaktit"
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a5c35] focus:ring-1 focus:ring-[#1a5c35] outline-none transition-all text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#64748b] flex justify-between"><span>Email</span><span className="text-[10px] uppercase tracking-wider opacity-50">Opsionale</span></label>
                  <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@shembull.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a5c35] focus:ring-1 focus:ring-[#1a5c35] outline-none transition-all text-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#64748b] flex justify-between"><span>Si mund t&apos;ju ndihmojmë?</span><span className="text-[10px] uppercase tracking-wider opacity-50">Opsionale</span></label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={3} placeholder="Shkruani ndonjë detaj shtesë..."
                    className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1a5c35] focus:ring-1 focus:ring-[#1a5c35] outline-none transition-all resize-none text-sm" />
                </div>

                <button type="submit" className="w-full py-4 bg-[#1a5c35] hover:bg-[#144a2a] text-white text-base font-bold rounded-xl transition-all shadow-lg shadow-[#1a5c35]/20">
                  Dërgo kërkesën
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#1a5c35] flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-[#0f172a]">SiguriUshqimore HACCP</p>
          </div>
          <p className="text-xs text-[#94a3b8]">&copy; {new Date().getFullYear()} SiguriUshqimore HACCP. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </footer>
    </div>
  );
}
