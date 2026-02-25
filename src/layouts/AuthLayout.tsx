import { Outlet, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react'; // Agregamos Home icon

export default function AuthLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/auth/login';

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Fondo - Imagen completa */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1200')",
        }}
      />

      {/* Overlay oscuro - Ajustado a tu Dark Grafito */}
      <div className="absolute inset-0 bg-dark-400/90 backdrop-blur-[2px]" />

      {/* Navegación Superior */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center gap-3">
        {/* NUEVO: Botón para volver al Inicio */}
        <Link
          to="/"
          className="text-white p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg"
          title="Ir al Inicio"
        >
          <Home size={20} />
        </Link>

        {/* Botón dinámico Login/Registro */}
        {isLoginPage ? (
          <Link
            to="/auth/register"
            className="text-white text-sm md:text-base font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-biovet-600 backdrop-blur-sm border-2 border-biovet-400/30 hover:bg-biovet-500 hover:border-biovet-400 transition-all shadow-lg"
          >
            Registrarse
          </Link>
        ) : (
          <Link
            to="/auth/login"
            className="text-white text-sm md:text-base font-semibold px-4 py-2 md:px-6 md:py-2.5 rounded-lg bg-biovet-600 backdrop-blur-sm border-2 border-biovet-400/30 hover:bg-biovet-500 hover:border-biovet-400 transition-all shadow-lg"
          >
            Iniciar Sesión
          </Link>
        )}
      </div>

      {/* Contenedor principal */}
      <div className="absolute inset-0 flex flex-col lg:flex-row z-10">
        
        {/* Columna izquierda - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="max-w-xl">
            {/* Título - Usando Space Grotesk (font-heading) y paleta Cian */}
            <h1 className="text-7xl lg:text-8xl font-black text-white leading-tight mb-2 drop-shadow-2xl font-heading italic uppercase">
              BioVetTrack
            </h1>
            {/* Eslogan solicitado */}
            <p className="text-3xl lg:text-4xl font-bold text-success-400 drop-shadow-lg mb-8 uppercase tracking-tight">
              Control Clínico Avanzado
            </p>

            {/* Lista de características - Usando el Verde Lima (success) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-success-400 shrink-0" />
                <span className="text-base font-medium">
                  Gestión integral de pacientes
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-success-400 shrink-0" />
                <span className="text-base font-medium">
                  Control de citas y servicios
                </span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="h-6 w-6 text-success-400 shrink-0" />
                <span className="text-base font-medium">
                  Reportes y estadísticas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-6 md:mb-4">
              <img
                src="/logobiovet.png"
                alt="BioVetTrack Logo"
                className="h-32 md:h-48 w-auto drop-shadow-2xl"
              />
            </div>

            {/* Título mobile */}
            <div className="lg:hidden mb-6 text-center">
              <h1 className="text-4xl font-black text-white mb-1 drop-shadow-lg font-heading italic uppercase">
                BioVetTrack
              </h1>
              <p className="text-lg font-bold text-success-400 drop-shadow-lg uppercase tracking-tighter">
                Control Clínico Avanzado
              </p>
            </div>

            {/* Contenido del formulario (Outlet) */}
            <Outlet />

            {/* Copyright */}
            <p className="text-center text-[10px] md:text-xs text-white/50 font-medium mt-6 drop-shadow-md uppercase tracking-[0.2em]">
              © 2026 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}