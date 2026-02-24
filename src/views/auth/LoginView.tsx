import { useForm } from 'react-hook-form';
import {  useNavigate } from 'react-router-dom';
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
      // 1. GUARDAMOS EL TOKEN (Data debe ser el string del token que viene de tu API)
      localStorage.setItem('AUTH_TOKEN', data); 

      toast.success(
        'Acceso concedido',
        'Panel clínico de BioVetTrack listo para operar.'
      );
      
      // 2. NAVEGAMOS AL DASHBOARD
      // Al navegar, el Router vuelve a chequear el localStorage y PrivateRoute dejará pasar
      navigate('/dashboard');
    },
  });

  const handleLogin = (formData: UserLoginForm) => {
    mutate(formData);
  };

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
      <div className="mb-6 text-center">
        <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
          Accede a tu panel de control veterinario para gestionar pacientes, citas y servicios.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4 md:space-y-5">
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
              className={`${inputBaseStyles} pl-24 md:pl-28 pr-3 md:pr-4 ${errors.email ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' },
              })}
            />
          </div>
          <div className="h-6 mt-1">
            {errors.email && (
              <p className="text-danger-300 text-[10px] font-semibold bg-danger-500/20 px-2 py-1 rounded-lg">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

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
              className={`${inputBaseStyles} pl-32 md:pl-40 pr-10 md:pr-12 ${errors.password ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register('password', {
                required: 'La contraseña es obligatoria',
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 text-white/50 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="h-6 mt-1">
            {errors.password && (
              <p className="text-danger-300 text-[10px] font-semibold bg-danger-500/20 px-2 py-1 rounded-lg">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-bold py-3.5 rounded-xl hover:bg-biovet-600 transition-all disabled:opacity-50"
          >
            {isPending ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </>
  );
}