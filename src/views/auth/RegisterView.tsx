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

  // ESTILOS UNIFICADOS - Consistentes con LoginView
  const inputBaseStyles = `
    w-full py-2.5 md:py-3 text-sm 
    bg-dark-400/40 backdrop-blur-md
    border rounded-xl text-white 
    placeholder-white/20 font-medium 
    focus:outline-none focus:bg-dark-400/60
    transition-all duration-300
    relative z-0
  `;

  const iconStyles = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-biovet-400 group-focus-within:text-success-400 transition-colors pointer-events-none z-10";
  const errorTextStyles = "text-danger-400 text-[10px] font-black uppercase tracking-wider px-2 mt-1 block";

  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-widest">
          Crea tu cuenta profesional
        </p>
      </div>

      <form onSubmit={handleSubmit(handleRegister)} className="space-y-3">
        
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative group">
            <User className={iconStyles} />
            <input
              type="text"
              placeholder="Nombre"
              className={`${inputBaseStyles} pl-10 ${errors.name ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("name", { required: "Obligatorio" })}
            />
            {errors.name && <span className={errorTextStyles}>{errors.name.message as string}</span>}
          </div>
          <div className="relative group">
            <User className={iconStyles} />
            <input
              type="text"
              placeholder="Apellido"
              className={`${inputBaseStyles} pl-10 ${errors.lastName ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("lastName", { required: "Obligatorio" })}
            />
            {errors.lastName && <span className={errorTextStyles}>{errors.lastName.message as string}</span>}
          </div>
        </div>

        {/* Email */}
        <div className="relative group">
          <Mail className={iconStyles} />
          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            className={`${inputBaseStyles} pl-10 ${errors.email ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
            {...register("email", { 
              required: "Email obligatorio",
              pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" }
            })}
          />
          {errors.email && <span className={errorTextStyles}>{errors.email.message as string}</span>}
        </div>

        {/* WhatsApp y Prefijo */}
        <div className="flex gap-2">
          <select
            {...register("countryCode")}
            className="w-24 bg-dark-400/40 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-success-500/50 cursor-pointer z-10"
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code} className="bg-dark-300 text-white">{c.code}</option>
            ))}
          </select>
          <div className="relative flex-1 group">
            <Phone className={iconStyles} />
            <input
              type="tel"
              placeholder="WhatsApp"
              className={`${inputBaseStyles} pl-10 ${errors.whatsapp ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("whatsapp", { 
                required: "Requerido",
                pattern: { value: /^[0-9]+$/, message: "Solo números" }
              })}
            />
            {errors.whatsapp && <span className={errorTextStyles}>{errors.whatsapp.message as string}</span>}
          </div>
        </div>

        {/* CI y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative group">
            <FileText className={iconStyles} />
            <input
              type="text"
              placeholder="Cédula"
              className={`${inputBaseStyles} pl-10 ${errors.ci ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("ci", { required: "Requerido" })}
            />
            {errors.ci && <span className={errorTextStyles}>{errors.ci.message as string}</span>}
          </div>
          <div className="relative group">
            <MapPin className={iconStyles} />
            <select
              className={`${inputBaseStyles} pl-10 pr-4 appearance-none ${errors.estado ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("estado", { required: "Selecciona estado" })}
            >
              <option value="" className="bg-dark-300">Estado...</option>
              {estadosVenezuela.map(e => <option key={e} value={e} className="bg-dark-300">{e}</option>)}
            </select>
          </div>
        </div>

        {/* CMV Profesional */}
        <div className="relative group">
          <FileText className={iconStyles} />
          <input
            type="text"
            disabled={!selectedEstado}
            placeholder={selectedEstado ? `Nº CMV ${selectedEstado}` : "Selecciona un estado"}
            className={`${inputBaseStyles} pl-10 disabled:opacity-30 ${errors.cmv ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
            {...register("cmv", { required: "CMV obligatorio" })}
          />
          {errors.cmv && <span className={errorTextStyles}>{errors.cmv.message as string}</span>}
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative group">
            <Lock className={iconStyles} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className={`${inputBaseStyles} pl-10 pr-10 ${errors.password ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("password", { 
                required: "Requerido",
                minLength: { value: 6, message: "Mínimo 6" } 
              })}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-success-400 z-20"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.password && <span className={errorTextStyles}>{errors.password.message as string}</span>}
          </div>
          <div className="relative group">
            <Lock className={iconStyles} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar"
              className={`${inputBaseStyles} pl-10 pr-10 ${errors.confirmPassword ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'}`}
              {...register("confirmPassword", { 
                required: "Confirma",
                validate: v => v === watch('password') || "No coinciden" 
              })}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-success-400 z-20"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {errors.confirmPassword && <span className={errorTextStyles}>{errors.confirmPassword.message as string}</span>}
          </div>
        </div>

        {/* Botón de Registro */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-biovet-500/20 hover:bg-biovet-400 hover:shadow-biovet-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none border border-white/10"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : 'Crear Cuenta'}
          </button>
        </div>
      </form>

      <p className="text-center mt-6 text-white/50 text-xs font-bold uppercase tracking-widest">
        ¿Ya tienes cuenta?{' '}
        <Link to="/auth/login" className="text-success-400 hover:text-white transition-colors ml-1">
          Inicia Sesión
        </Link>
      </p>
    </>
  );
}