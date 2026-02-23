import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, FileText, MapPin, Lock } from "lucide-react";
import { useState } from "react";
import type { UserRegistrationForm } from "@/types/auth";
import { estadosVenezuela } from "@/data/venezuela";

const countryCodes = [
  { code: "+58", name: "Venezuela" },
  { code: "+57", name: "Colombia" },
  { code: "+593", name: "Ecuador" },
  { code: "+51", name: "Perú" },
  { code: "+52", name: "México" },
  { code: "+1", name: "EE.UU." },
  { code: "+34", name: "España" },
];

export default function RegisterView() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      whatsapp: '',
      countryCode: '+58',
      ci: '',
      cmv: '',
      estado: '',
    },
  });

  const selectedEstado = watch('estado');

  const { mutate, isPending } = useMutation({
    mutationFn: createAccount,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success(
        '¡Bienvenido/a!',
        'Te hemos enviado un correo para confirmar tu cuenta.'
      );
      reset();
      navigate('/auth/confirm-account');
    }
  });

  const handleRegister = (formData: any) => {
    const dataToSend: UserRegistrationForm = {
      ...formData,
      whatsapp: `${formData.countryCode}${formData.whatsapp}`,
    };
    delete (dataToSend as any).countryCode;
    mutate(dataToSend);
  };

  // ESTILOS UNIFICADOS (Solución al Autofill y Z-index)
  const inputBaseStyles = `
    w-full py-2.5 md:py-3 text-sm 
    bg-white/10 backdrop-blur-sm
    border rounded-xl text-white 
    placeholder-white/40 font-medium 
    focus:outline-none focus:bg-white/15
    transition-all
    relative z-0
    /* Fix para eliminar el fondo blanco de Chrome */
    [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#1e293b_inset]
    [&:-webkit-autofill]:[-webkit-text-fill-color:white]
  `;

  const iconStyles = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none z-10";
  const errorBadgeStyles = "text-danger-300 text-[10px] px-2 py-0.5 rounded-lg font-semibold bg-danger-500/20 backdrop-blur-sm inline-block mt-1";

  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
          Únete a BioVetTrack y profesionaliza tu gestión clínica veterinaria.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleRegister)} className="space-y-3">
        
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <User className={iconStyles} />
            <input
              type="text"
              placeholder="Nombre"
              className={`${inputBaseStyles} pl-10 ${errors.name ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("name", { required: "El nombre es obligatorio" })}
            />
            {errors.name && <span className={errorBadgeStyles}>{errors.name.message as string}</span>}
          </div>
          <div className="relative">
            <User className={iconStyles} />
            <input
              type="text"
              placeholder="Apellido"
              className={`${inputBaseStyles} pl-10 ${errors.lastName ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("lastName", { required: "El apellido es obligatorio" })}
            />
            {errors.lastName && <span className={errorBadgeStyles}>{errors.lastName.message as string}</span>}
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className={iconStyles} />
          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            className={`${inputBaseStyles} pl-10 ${errors.email ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
            {...register("email", { 
              required: "El email es obligatorio",
              pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" }
            })}
          />
          {errors.email && <span className={errorBadgeStyles}>{errors.email.message as string}</span>}
        </div>

        {/* WhatsApp y Prefijo */}
        <div className="flex gap-2">
          <select
            {...register("countryCode")}
            className="w-24 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white text-sm focus:outline-none focus:bg-white/20 cursor-pointer z-10"
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900 text-white">{c.code}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <Phone className={iconStyles} />
            <input
              type="tel"
              placeholder="WhatsApp (ej: 4121234567)"
              className={`${inputBaseStyles} pl-10 ${errors.whatsapp ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("whatsapp", { 
                required: "Requerido",
                pattern: { value: /^[0-9]+$/, message: "Solo números" }
              })}
            />
            {errors.whatsapp && <span className={errorBadgeStyles}>{errors.whatsapp.message as string}</span>}
          </div>
        </div>

        {/* CI y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <FileText className={iconStyles} />
            <input
              type="text"
              placeholder="Cédula"
              className={`${inputBaseStyles} pl-10 ${errors.ci ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("ci", { required: "Requerido" })}
            />
            {errors.ci && <span className={errorBadgeStyles}>{errors.ci.message as string}</span>}
          </div>
          <div className="relative">
            <MapPin className={iconStyles} />
            <select
              className={`${inputBaseStyles} pl-10 pr-4 appearance-none ${errors.estado ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("estado", { required: "Selecciona un estado" })}
            >
              <option value="" className="bg-slate-900">Estado...</option>
              {estadosVenezuela.map(e => <option key={e} value={e} className="bg-slate-900">{e}</option>)}
            </select>
          </div>
        </div>

        {/* CMV Profesional */}
        <div className="relative">
          <FileText className={iconStyles} />
          <input
            type="text"
            disabled={!selectedEstado}
            placeholder={selectedEstado ? `Nº CMV ${selectedEstado}` : "Primero selecciona un estado"}
            className={`${inputBaseStyles} pl-10 disabled:opacity-50 ${errors.cmv ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
            {...register("cmv", { required: "El CMV es obligatorio" })}
          />
          {errors.cmv && <span className={errorBadgeStyles}>{errors.cmv.message as string}</span>}
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Lock className={iconStyles} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              autoComplete="new-password"
              className={`${inputBaseStyles} pl-10 pr-10 ${errors.password ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("password", { 
                required: "Requerido",
                minLength: { value: 6, message: "Mínimo 6 caracteres" } 
              })}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-20"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.password && <span className={errorBadgeStyles}>{errors.password.message as string}</span>}
          </div>
          <div className="relative">
            <Lock className={iconStyles} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar"
              autoComplete="new-password"
              className={`${inputBaseStyles} pl-10 pr-10 ${errors.confirmPassword ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'}`}
              {...register("confirmPassword", { 
                required: "Confirma contraseña",
                validate: v => v === watch('password') || "No coinciden" 
              })}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-20"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {errors.confirmPassword && <span className={errorBadgeStyles}>{errors.confirmPassword.message as string}</span>}
          </div>
        </div>

        {/* Botón de Registro */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-lg hover:bg-biovet-600 border-2 border-biovet-400/30"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando cuenta...</span>
              </div>
            ) : 'Registrarse'}
          </button>
        </div>
      </form>

      <p className="text-center mt-6 text-white/70 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/auth/login" className="text-biovet-300 font-semibold hover:text-white transition-colors">
          Inicia Sesión
        </Link>
      </p>

      <p className="text-center text-[10px] text-white/40 mt-8">
        © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
      </p>
    </>
  );
}