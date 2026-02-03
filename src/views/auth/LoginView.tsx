import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
    onSuccess: () => {
      toast.success(
        'Acceso concedido',
        'Panel clínico de BioVetTrack listo para operar.'
      );
      navigate('/dashboard');
    },
  });

  const handleLogin = (formData: UserLoginForm) => {
    mutate(formData);
  };

  // Estilos base para inputs
  const inputBaseStyles = `
    w-full py-3 md:py-3.5 text-sm md:text-base 
    bg-white/10 backdrop-blur-sm
    border rounded-xl text-white 
    placeholder-white/40 font-medium 
    focus:outline-none focus:bg-white/15
    transition-all
  `;

  return (
    <>
      {/* Descripción */}
      <div className="mb-6 text-center">
        <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
          Accede a tu panel de control veterinario para gestionar pacientes, citas y servicios.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4 md:space-y-5">
        {/* Email */}
        <div>
          <div className="relative">
            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3 pointer-events-none z-10">
              <Mail className="h-5 md:h-6 w-5 md:w-6 text-white/70" />
              <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wide">
                Email
              </span>
            </div>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              className={`
                ${inputBaseStyles}
                pl-24 md:pl-28 pr-3 md:pr-4
                ${errors.email
                  ? 'border-danger-400 focus:border-danger-400'
                  : 'border-white/30 focus:border-biovet-400'
                }
                autofill:bg-white/10 autofill:text-white
                [&:-webkit-autofill]:bg-white/10
                [&:-webkit-autofill]:[-webkit-text-fill-color:white]
                [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]
              `}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Correo inválido',
                },
              })}
            />
          </div>
          <div className="h-6 mt-1">
            {errors.email && (
              <p className="text-danger-300 text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-lg font-semibold bg-danger-500/20 backdrop-blur-sm inline-block">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3 pointer-events-none z-10">
              <Lock className="h-5 md:h-6 w-5 md:w-6 text-white/70" />
              <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wide">
                Contraseña
              </span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              className={`
                ${inputBaseStyles}
                pl-32 md:pl-40 pr-10 md:pr-12
                ${errors.password
                  ? 'border-danger-400 focus:border-danger-400'
                  : 'border-white/30 focus:border-biovet-400'
                }
                [&:-webkit-autofill]:[-webkit-text-fill-color:white]
                [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]
              `}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 6,
                  message: 'Mínimo 6 caracteres',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 text-white/50 hover:text-white transition-colors z-10"
            >
              {showPassword ? <EyeOff className="h-4 md:h-5 w-4 md:w-5" /> : <Eye className="h-4 md:h-5 w-4 md:w-5" />}
            </button>
          </div>
          <div className="h-6 mt-1">
            {errors.password && (
              <p className="text-danger-300 text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-lg font-semibold bg-danger-500/20 backdrop-blur-sm inline-block">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Olvidaste contraseña */}
        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-white/80 hover:text-white text-xs md:text-sm font-medium transition-colors underline decoration-white/40 hover:decoration-white"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-1 md:pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-bold py-3 md:py-3.5 text-sm md:text-base rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:bg-biovet-600 border-2 border-biovet-400/30"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ingresando...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </div>
      </form>

      {/* Link a registro (mobile) */}
      <p className="text-center mt-6 text-white/70 text-sm lg:hidden">
        ¿No tienes cuenta?{' '}
        <Link to="/auth/register" className="text-biovet-300 font-semibold hover:text-white">
          Regístrate
        </Link>
      </p>
    </>
  );
}