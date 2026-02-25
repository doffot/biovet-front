import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/AuthAPI';
import { toast } from '@/components/Toast';
import type { UserLoginForm } from '@/types/auth';

export default function LoginView() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      // Guardamos el token en el almacenamiento local
      localStorage.setItem('AUTH_TOKEN', data); 

      toast.success(
        'Acceso concedido',
        'Panel clínico de BioVetTrack listo para operar.'
      );
      
      // Navegación al dashboard principal
      navigate('/dashboard');
    },
  });

  const handleLogin = (formData: UserLoginForm) => {
    mutate(formData);
  };

  // Estilos base para los inputs con efecto Cristal Oscuro (Stealth)
  const inputBaseStyles = `
    w-full py-3 md:py-3.5 text-sm md:text-base 
    bg-dark-400/40 backdrop-blur-md
    border rounded-xl text-white 
    placeholder-white/20 font-medium 
    focus:outline-none focus:bg-dark-400/60
    transition-all duration-300
    relative z-0
  `;

  // Estilos de los iconos que reaccionan al foco del input
  const iconGroupStyles = "absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3 pointer-events-none z-10 transition-colors";
  const iconStyles = "h-5 md:h-6 w-5 md:w-6 text-biovet-400 group-focus-within:text-success-400 transition-colors";
  const labelStyles = "text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-tighter group-focus-within:text-white transition-colors";

  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-widest">
          Bienvenido de vuelta al panel
        </p>
      </div>

      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4 md:space-y-5">
        {/* Campo de Email */}
        <div>
          <div className="relative group">
            <div className={iconGroupStyles}>
              <Mail className={iconStyles} />
              <span className={labelStyles}>Email</span>
            </div>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className={`${inputBaseStyles} pl-24 md:pl-28 pr-3 md:pr-4 ${
                errors.email 
                  ? 'border-danger-500/50' 
                  : 'border-white/10 focus:border-success-500/50'
              }`}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
              })}
            />
          </div>
          <div className="h-6 mt-1">
            {errors.email && (
              <p className="text-danger-400 text-[10px] font-black uppercase tracking-wider px-2">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Campo de Contraseña */}
        <div>
          <div className="relative group">
            <div className={iconGroupStyles}>
              <Lock className={iconStyles} />
              <span className={labelStyles}>Pass</span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${inputBaseStyles} pl-24 md:pl-28 pr-10 md:pr-12 ${
                errors.password 
                  ? 'border-danger-500/50' 
                  : 'border-white/10 focus:border-success-500/50'
              }`}
              {...register('password', {
                required: 'La contraseña es obligatoria',
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 text-white/20 hover:text-success-400 transition-colors z-20"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Enlace de Olvido de Contraseña */}
          <div className="flex justify-end mt-2 px-1">
            <Link 
              to="/auth/forgot-password" 
              className="text-[10px] md:text-xs font-bold text-white/40 hover:text-success-400 uppercase tracking-widest transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="h-6 mt-1">
            {errors.password && (
              <p className="text-danger-400 text-[10px] font-black uppercase tracking-wider px-2">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-biovet-500/20 hover:bg-biovet-400 hover:shadow-biovet-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none border border-white/10"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cargando...
              </span>
            ) : (
              'Entrar al Sistema'
            )}
          </button>
        </div>
      </form>
      
      {/* Link de navegación secundaria */}
      <p className="text-center mt-6 text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-widest">
        ¿Eres nuevo?{' '}
        <Link to="/auth/register" className="text-success-400 hover:text-white transition-colors ml-1">
          Crea tu cuenta aquí
        </Link>
      </p>
    </>
  );
}