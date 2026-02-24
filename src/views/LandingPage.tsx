import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  DollarSign, 
  Users, 
  ChartLine, 
  CalendarDays,
  ShoppingCart,
  ShieldPlus,
  PawPrint,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-biovet-400 font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar - Fixed & Blurry */}
      <nav className="fixed top-0 w-full z-50 bg-biovet-400/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <img src="/logo_main.webp" alt="BioVetTrack Logo" className="h-12 w-auto" />
          <div className="flex items-center gap-6">
            <Link to="/auth/login" className="text-sm font-bold text-slate-600 hover:text-biovet-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/auth/register" className="btn-primary px-6 py-2.5 rounded-full text-sm shadow-lg shadow-biovet-500/20">
              Registrar Clínica
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - El Gran Impacto */}
      <section className="relative pt-40 pb-28 px-6 bg-linear-to-br from-biovet-50 to-cyan-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Contenido Izquierdo */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-biovet-100 text-biovet-700 text-xs font-bold tracking-wide uppercase shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-biovet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-biovet-500"></span>
              </span>
              La Gestión Veterinaria del Futuro
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Simplifica cada <span className="text-biovet-600">consulta</span>, optimiza cada <span className="text-cyan-600">proceso</span>.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              BioVetTrack te ofrece una plataforma integral para gestionar pacientes, finanzas, citas y mucho más, diseñada para clínicas modernas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth/register" className="btn-primary px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2 group shadow-xl shadow-biovet-500/30 hover:shadow-biovet-500/40 transform hover:-translate-y-1 transition-all duration-300">
                Comenzar Prueba Gratuita <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-2">
                Descubre sus Funciones <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Imagen de Doctora (Free Stock Photo) */}
          <div className="relative mt-12 lg:mt-0 animate-fade-in-right">
            <img 
              src="/img/vet.png" 
              alt="Veterinaria examinando un perro con cariño" 
              className="w-full h-auto rounded-3xl shadow-2xl ring-4 ring-white ring-offset-4 ring-offset-biovet-50 transform hover:scale-[1.01] transition-transform duration-500 ease-out"
            />
            <div className="absolute -bottom-8 -left-8 bg-biovet-500 p-4 rounded-full shadow-lg transform rotate-6 animate-pulse-slow opacity-80">
              <PawPrint className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Testimonial o Frase de Valor */}
      <section className="py-20 px-6 bg-biovet-700 text-white text-center">
        <div className="max-w-4xl mx-auto animate-fade-in delay-200">
          <blockquote className="text-3xl md:text-4xl font-extrabold leading-tight italic">
            "Desde que usamos BioVetTrack, hemos reducido los errores administrativos y mejorado la atención al paciente. Es indispensable."
          </blockquote>
          <p className="mt-8 text-lg font-semibold text-biovet-200">- Dra. Elena Martínez, Clínica Veterinaria "Mascota Feliz"</p>
        </div>
      </section>

      {/* SECCIÓN 3: Características Clave (Tus Módulos) */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <h2 className="text-5xl font-extrabold text-slate-900 italic">Una solución completa para tu clínica</h2>
            <p className="text-lg text-slate-600">
              Descubre cómo BioVetTrack integra todas las áreas de tu práctica veterinaria, haciéndola más eficiente y rentable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Característica 1: Dashboard (screen-01.png) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-biovet-500 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                <ChartLine className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900">Dashboard Intuitivo</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Accede a una vista panorámica de tu clínica: ingresos, citas pendientes y próximos vencimientos, todo en un solo lugar.
              </p>
              <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-md">
                <img src="/img/screen1.png" alt="Dashboard de BioVetTrack" className="w-full h-auto object-cover object-top" />
              </div>
            </div>

            {/* Característica 2: Citas (screen-02.png) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:-rotate-6 transition-transform duration-300">
                <CalendarDays className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900">Gestión de Citas</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Organiza la agenda de tu clínica con facilidad. Crea, edita y consulta citas, evitando solapamientos y optimizando tu tiempo.
              </p>
              <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-md">
                <img src="/img/screen2.png" alt="Módulo de Citas BioVetTrack" className="w-full h-auto object-cover object-top" />
              </div>
            </div>

            {/* Característica 3: Módulo de Mascota (screen-03.png) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                <PawPrint className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900">Perfiles de Pacientes</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Accede al historial médico completo de cada mascota, incluyendo tratamientos, vacunas, desparasitación y estudios.
              </p>
              <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-md">
                <img src="/img/screen3.png" alt="Módulo de Mascota BioVetTrack" className="w-full h-auto object-cover object-top" />
              </div>
            </div>

            {/* Característica 4: Módulo de Ventas (screen-04.png) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:-rotate-6 transition-transform duration-300">
                <ShoppingCart className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900">Punto de Venta Integrado</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Gestiona tus ventas de productos y servicios de forma ágil, con control de inventario y opciones de pago a crédito.
              </p>
              <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-md">
                <img src="/img/screen4.png" alt="Módulo de Ventas BioVetTrack" className="w-full h-auto object-cover object-top" />
              </div>
            </div>

            {/* Característica 5: Reportes Financieros (Gráfico de Ingresos) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                <DollarSign className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900">Análisis Financiero</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Monitoriza tus ingresos en USD y Bs., con gráficos claros que te permiten evaluar la salud económica de tu negocio.
              </p>
              <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-md">
                <img src="/img/screen5.png" alt="Gráfico de Ingresos BioVetTrack" className="w-full h-auto object-cover object-top" />
                {/* Asumiendo que screen-01.png tiene el gráfico de ingresos, o puedes usar una específica si la tienes */}
              </div>
            </div>

            {/* Característica 6: Clientes y Mascotas */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:-rotate-6 transition-transform duration-300">
                <Users className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900">Base de Datos de Clientes</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Mantén un registro organizado de todos tus clientes y sus mascotas, facilitando la comunicación y el seguimiento.
              </p>
              <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden shadow-md">
                <img src="/img/screen6.png" alt="Listado de Clientes y Mascotas" className="w-full h-auto object-cover object-top" />
                 {/* Asumiendo que screen-03.png (modulo de mascota) también muestra dueños, o puedes usar otra */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: CTA Final */}
      <section className="py-24 px-6 bg-linear-to-tr from-biovet-600 to-cyan-500 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl font-extrabold leading-tight">
            ¿Listo para transformar la gestión de tu clínica?
          </h2>
          <p className="text-lg text-biovet-100 max-w-2xl mx-auto">
            Únete a la comunidad de veterinarios que ya están experimentando la eficiencia de BioVetTrack.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <Link to="/auth/register" className="btn-secondary px-10 py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-3 group shadow-xl shadow-white/20 hover:shadow-white/30 transform hover:-translate-y-1 transition-all duration-300">
              Registrar mi Clínica <ShieldPlus className="w-6 h-6 group-hover:rotate-6 transition-transform" />
            </Link>
            <Link to="/auth/login" className="px-10 py-4 rounded-xl border-2 border-white/50 text-white text-xl font-bold hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-3">
              Ya soy usuario <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <img src="/logo_main.webp" alt="BioVetTrack Logo" className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          <p className="text-slate-400 text-sm italic uppercase font-bold tracking-tighter">
            © {new Date().getFullYear()} BioVetTrack - Software para Clínicas Veterinarias
          </p>
        </div>
      </footer>
    </div>
  );
}