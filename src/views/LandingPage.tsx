import { Link } from "react-router-dom";
import {
  ArrowRight,
  
  Stethoscope,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  FileText,
  MousePointer2,
} from "lucide-react";

export default function LandingPage() {
  return (
    /* FONDO OSCURO PROFUNDO (Match con Sidebar/Header) */
    <div className="min-h-screen bg-[#1a1c1e] text-slate-200 selection:bg-emerald-500/30 font-sans">
      {/* BACKGROUND GLOWS (Efecto de iluminación ambiental) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* NAVBAR GLASSMORPHISM */}
      <nav className="fixed top-0 w-full z-50 bg-[#1a1c1e]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logobiovet.png"
              alt="BioVetTrack"
              className="h-10 w-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
            <span className="text-xl font-black tracking-tighter text-white">
              BioVet<span className="text-emerald-500">Track</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/auth/login"
              className="text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Ingresar
            </Link>
            <Link
              to="/auth/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-[#1a1c1e] px-6 py-2.5 rounded-full font-black text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
            >
              Registrar Clínica
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black mb-8 tracking-[0.2em] uppercase">
            <Zap className="w-3 h-3 fill-emerald-400" />
            Gestión Veterinaria de Élite
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tight text-white leading-[0.85] mb-8 uppercase italic">
            Domina tu <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-emerald-400 to-emerald-600 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Clínica.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-12 leading-relaxed">
            La plataforma de control clínico más avanzada. <br />
            Precisión médica, finanzas inteligentes y tecnología de vanguardia.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <Link
              to="/auth/register"
              className="group relative bg-white text-[#1a1c1e] text-xl font-black px-12 py-6 rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1"
            >
              PROBAR GRATIS{" "}
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
            <div className="flex items-center gap-3 text-slate-500 text-sm font-bold bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>SIN TARJETA DE CRÉDITO</span>
            </div>
          </div>

          {/* DASHBOARD PREVIEW CON EFECTO DE BORDE NEÓN */}
          <div className="relative max-w-6xl mx-auto group">
            <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-cyan-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse"></div>
            <div className="relative bg-[#1a1c1e] rounded-4xl p-2 border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none z-10"></div>
              <img
                src="/img/screen1.png"
                alt="BioVetTrack Dashboard"
                className="rounded-3xl w-full opacity-90 group-hover:opacity-100 transition-all duration-700"
              />
            </div>

            {/* FLOATING BADGE */}
            <div className="absolute -bottom-10 -right-4 md:right-10 bg-[#25282c] p-6 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-5 backdrop-blur-xl animate-bounce duration-4000">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-[#1a1c1e] shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <TrendingUp className="w-8 h-8 font-bold" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Crecimiento Mensual
                </p>
                <p className="text-2xl font-black text-white">+24.5%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE HISTORIAL CLÍNICO (OPTIMIZADA) */}
      <section className="py-32 relative bg-[#151719] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter">
              Seguimiento <span className="text-emerald-500">Médico Total</span>
            </h2>
            <p className="text-slate-500 mt-4 font-black uppercase tracking-[0.4em] text-[10px]">
              Evolución clínica en tiempo real
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* CARD CONSULTAS (screen10.png) */}
            <div className="group relative bg-white/5 rounded-[3rem] border border-white/5 p-8 transition-all hover:bg-white/10 hover:border-emerald-500/30 overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                      Consultas
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      Diagnóstico y Triaje
                    </p>
                  </div>
                </div>
                <MousePointer2 className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
              </div>

              <div className="relative group-hover:scale-[1.03] transition-transform duration-700 ease-out">
                <div className="absolute -inset-2 bg-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src="/img/screen10.png"
                  alt="Consulta"
                  className="relative rounded-2xl border border-white/10 shadow-2xl"
                />
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-[#1a1c1e] p-5 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">
                    Status
                  </p>
                  <p className="text-xs font-bold text-white tracking-widest uppercase italic">
                    "Traumatismo"
                  </p>
                </div>
                <div className="bg-[#1a1c1e] p-5 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">
                    ID Caso
                  </p>
                  <p className="text-xs font-bold text-emerald-400 tracking-widest">
                    #BC821B
                  </p>
                </div>
              </div>
            </div>

            {/* CARD RECETAS (screen11.png) */}
            <div className="group relative bg-white/5 rounded-[3rem] border border-white/5 p-8 transition-all hover:bg-white/10 hover:border-pink-500/30 overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                      Recetas
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      Tratamientos Médicos
                    </p>
                  </div>
                </div>
                <MousePointer2 className="text-slate-700 group-hover:text-pink-500 transition-colors" />
              </div>

              <div className="relative group-hover:scale-[1.03] transition-transform duration-700 ease-out">
                <div className="absolute -inset-2 bg-pink-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src="/img/screen11.png"
                  alt="Recetas"
                  className="relative rounded-2xl border border-white/10 shadow-2xl"
                />
              </div>

              <div className="mt-10 p-5 bg-[#1a1c1e] rounded-2xl border border-white/5 group-hover:border-pink-500/20 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                  <p className="text-sm font-bold text-slate-300 italic uppercase tracking-tighter">
                    Fármaco: <span className="text-white">Pediacort</span>
                  </p>
                </div>
                <button className="text-[10px] font-black text-pink-500 border-b border-pink-500/30 pb-0.5 uppercase hover:text-white transition-colors">
                  Generar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULOS SECUNDARIOS */}
      <section className="py-32 relative bg-[#1a1c1e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="group bg-white/5 p-12 rounded-[3.5rem] border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-white/10 relative overflow-hidden">
              <div className="w-16 h-16 bg-emerald-500 text-[#1a1c1e] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20">
                <Stethoscope className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter">
                Módulo Citas
              </h3>
              <p className="text-slate-400 mb-8 text-lg font-medium leading-relaxed">
                Sincroniza consultas médicos y peluquería sin solapamientos.
              </p>
              <img
                src="/img/screen2.png"
                className="rounded-2xl border border-white/5 shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
                alt="Citas"
              />
            </div>

            <div className="group bg-white/5 p-12 rounded-[3.5rem] border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-white/10 relative overflow-hidden">
              <div className="w-16 h-16 bg-white text-[#1a1c1e] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-white/10">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-4xl font-black text-white italic uppercase mb-4 tracking-tighter">
                Finanzas POS
              </h3>
              <p className="text-slate-400 mb-8 text-lg font-medium leading-relaxed">
                Venta multimoneda (USD/Bs) con stock inteligente por dosis.
              </p>
              <img
                src="/img/screen4.png"
                className="rounded-2xl border border-white/5 shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
                alt="Ventas"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL IMPACTANTE */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-linear-to-b from-emerald-600 to-emerald-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.2)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">
              ¿Listo para la <br />
              <span className="text-[#1a1c1e] bg-white px-4">Evolución?</span>
            </h2>
            <Link
              to="/auth/register"
              className="inline-block bg-[#1a1c1e] text-white text-2xl font-black px-16 py-8 rounded-4xl hover:scale-105 transition-transform shadow-2xl border border-white/10"
            >
              REGISTRAR MI CLÍNICA
            </Link>
            <p className="text-emerald-200 font-black uppercase tracking-[0.4em] text-xs animate-pulse">
              Únete a los Médicos Veterinarios de Élite
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER DARK */}
      <footer className="py-20 border-t border-white/5 bg-[#0f1113]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logobiovet.png"
                alt="BioVetTrack"
                className="h-8 grayscale hover:grayscale-0 transition-all opacity-50"
              />
              <span className="text-lg font-black text-slate-500">
                BioVetTrack <span className="text-[10px] align-top">V2.0</span>
              </span>
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              Advanced Clinical Control System
            </p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-sm font-black text-slate-400">
              © 2026 BIOVETTRACK TECHNOLOGY
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
              Hecho para líderes en salud animal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
