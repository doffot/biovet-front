import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Stethoscope, 
  ShoppingBag,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

export default function LandingPage() {
  return (
    // Usamos bg-white para que sea "Ultra Blanca" como pediste
    <div className="min-h-screen bg-white text-slate-800 selection:bg-biovet-100">
      
      {/* NAVBAR MINIMALISTA */}
      <nav className="fixed top-0 w-full z-50 bg-biovet-400/30 backdrop-blur-md border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <img src="/logo_main.webp" alt="BioVetTrack" className="h-10 w-auto" />
          <div className="flex items-center gap-4">
            <Link to="/auth/login" className="btn-ghost text-biovet-600">
              Ingresar
            </Link>
            <Link to="/auth/register" className="btn-primary rounded-full shadow-lg shadow-biovet-500/20">
              Registrar Clínica
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-biovet-50 border border-biovet-100 text-biovet-600 text-xs font-bold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-widest uppercase">Gestión Veterinaria de Alto Nivel</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-[0.9] mb-8 uppercase italic">
            Controla tu clínica <br />
            <span className="text-biovet-500">con precisión.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-10 font-sans leading-relaxed">
            Desde historiales médicos hasta finanzas multimoneda. La herramienta definitiva para médicos veterinarios que buscan excelencia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link to="/auth/register" className="btn-primary text-lg px-10 py-6 rounded-2xl shadow-2xl">
              Comenzar ahora <ArrowRight className="w-5 h-5" />
            </Link>
            <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-success-500" /> Sin contratos forzosos
            </span>
          </div>

          {/* DASHBOARD PREVIEW (screen1.png) */}
          <div className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-linear-to-r from-biovet-400 to-cyan-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white rounded-4xl p-3 shadow-2xl border border-surface-200">
              <img 
                src="/img/screen1.png" 
                alt="BioVetTrack Dashboard" 
                className="rounded-3xl w-full shadow-inner"
              />
            </div>
            
            {/* FLOATING BADGE */}
            <div className="absolute -bottom-6 -right-6 md:right-10 bg-white p-5 rounded-2xl shadow-xl border border-surface-100 flex items-center gap-4 animate-bounce duration-3000">
               <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center text-success-600">
                 <TrendingUp className="w-6 h-6" />
               </div>
               <div className="text-left">
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Crecimiento Mensual</p>
                 <p className="text-lg font-black text-slate-800">+24.5%</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Alternando Screens) */}
      <section className="py-24 bg-surface-50 border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* CITAS - screen2.png */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="space-y-6">
              <div className="badge badge-biovet px-4 py-2 uppercase tracking-tighter">Módulo Operativo</div>
              <h2 className="text-4xl md:text-5xl font-heading font-black italic uppercase leading-none">
                Agenda de citas <br /> <span className="text-biovet-500">sin complicaciones</span>
              </h2>
              <p className="text-lg text-slate-500">
                Gestiona turnos médicos y servicios de peluquería en una sola vista. Evita solapamientos y mejora la experiencia de tus clientes.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="w-4 h-4 text-biovet-500"/> Filtro por Doctor</div>
                <div className="flex items-center gap-2 font-bold text-sm"><CheckCircle2 className="w-4 h-4 text-biovet-500"/> Estado de Cita</div>
              </div>
            </div>
            <div className="relative">
              <img src="/img/screen2.png" className="rounded-3xl shadow-2xl border-4 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500" alt="Citas" />
            </div>
          </div>

          {/* PACIENTES Y VENTAS - screen3 y 4 */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Tarjeta Mascota */}
            <div className="bg-white p-10 rounded-[3rem] border border-surface-200 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-biovet-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-biovet-500/40">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-heading font-black italic uppercase mb-4">Perfil Médico 360°</h3>
              <p className="text-slate-500 mb-8 font-sans">Historial de vacunas, desparasitación y evolución clínica al alcance de un clic.</p>
              <img src="/img/screen3.png" className="rounded-2xl border border-surface-100 shadow-md" alt="Pacientes" />
            </div>

            {/* Tarjeta Ventas */}
            <div className="bg-white p-10 rounded-[3rem] border border-surface-200 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-success-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-success-500/40">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-heading font-black italic uppercase mb-4">Punto de Venta POS</h3>
              <p className="text-slate-500 mb-8 font-sans">Facturación multimoneda (USD/Bs) con control de stock inteligente por dosis o unidad.</p>
              <img src="/img/screen4.png" className="rounded-2xl border border-surface-100 shadow-md" alt="Ventas" />
            </div>
          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-biovet-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-biovet-500/20 blur-[100px] z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-heading font-black text-white italic uppercase mb-8">
              ¿Listo para dar el <span className="text-biovet-300">siguiente paso?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register" className="btn-primary text-xl px-12 py-7 rounded-2xl">
                Registrar mi Clínica Ahora
              </Link>
            </div>
            <p className="mt-8 text-biovet-200 font-bold uppercase tracking-widest text-xs">
              Únete a la evolución de la medicina veterinaria
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img src="/logo_main.webp" alt="BioVetTrack" className="h-8 opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control clínico avanzado</p>
          </div>
          <div className="text-center md:text-right">
             <p className="text-sm font-bold text-slate-500">© 2026 BioVetTrack V2.0</p>
             <p className="text-xs text-slate-400">Hecho para Médicos Veterinarios de Élite</p>
          </div>
        </div>
      </footer>
    </div>
  );
}