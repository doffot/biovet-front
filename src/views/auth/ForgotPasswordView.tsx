import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Mail, CheckCircle2, Shield, ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { ForgotPasswordForm } from "@/types/auth";

export default function ForgotPasswordView() {
  const initialValues: ForgotPasswordForm = { email: "" };
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onError: (error: any) => {
      toast.error(error.message || "Error al enviar las instrucciones");
    },
    onSuccess: (data) => {
      toast.success(data || "Instrucciones enviadas al email");
      setIsSubmitted(true);
    },
  });

  const handleForgotPassword = (formData: ForgotPasswordForm) => mutate(formData);

  // ESTILOS UNIFICADOS (Cristal Oscuro + Paleta Nueva)
  const inputBaseStyles = `
    w-full py-2.5 md:py-3 text-sm 
    bg-dark-400/40 backdrop-blur-md
    border rounded-xl text-white 
    placeholder-white/20 font-medium 
    focus:outline-none focus:bg-dark-400/60
    transition-all duration-300 relative z-0
    [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#1a1a1a_inset]
    [&:-webkit-autofill]:[-webkit-text-fill-color:white]
  `;

  const iconStyles = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-biovet-400 transition-colors pointer-events-none z-10 group-focus-within:text-success-400";
  const errorTextStyles = "text-danger-400 text-[10px] font-black uppercase tracking-widest px-2 mt-1 block";

  // VISTA: CORREO ENVIADO CON ÉXITO
  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success-500/10 backdrop-blur-sm rounded-full border-2 border-success-500/30">
            <CheckCircle2 className="w-10 h-10 text-success-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">¡Correo enviado!</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Revisa tu bandeja de entrada. Te hemos enviado los pasos para recuperar tu acceso.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-success-400 bg-success-500/5 rounded-xl py-3 border border-success-500/20 uppercase tracking-widest font-black">
          <Shield className="w-4 h-4" />
          <span>El enlace expira en 30 min</span>
        </div>

        <Link
          to="/auth/login"
          className="block w-full bg-biovet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-biovet-500/20 hover:bg-biovet-400 transition-all border border-white/10 text-center"
        >
          Volver al Login
        </Link>
      </div>
    );
  }

  // VISTA: FORMULARIO
  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-widest">
          Recuperar Contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-5">
        <div className="relative group">
          <Mail className={iconStyles} />
          <input
            type="email"
            placeholder="Correo electrónico"
            className={`${inputBaseStyles} pl-10 ${
              errors.email ? "border-danger-500/50" : "border-white/10 focus:border-success-500/50"
            }`}
            {...register("email", {
              required: "El email es obligatorio",
              pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
            })}
          />
          {errors.email && (
            <span className={errorTextStyles}>{errors.email.message as string}</span>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-biovet-500/20 hover:bg-biovet-400 active:scale-[0.98] transition-all disabled:opacity-50 border border-white/10 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Enviar Instrucciones"
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <Link 
          to="/auth/login" 
          className="inline-flex items-center gap-2 text-success-400 font-bold hover:text-white transition-colors text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>

      <p className="text-center text-[10px] text-white/30 mt-8 font-black uppercase tracking-widest">
        © 2026 BioVetTrack
      </p>
    </>
  );
}