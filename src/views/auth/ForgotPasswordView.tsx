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

  // ESTILOS EXACTOS DE TU REGISTER
  const inputBaseStyles = `
    w-full py-2.5 md:py-3 text-sm 
    bg-white/10 backdrop-blur-sm
    border rounded-xl text-white 
    placeholder-white/40 font-medium 
    focus:outline-none focus:bg-white/15
    transition-all relative z-0
    [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#1e293b_inset]
    [&:-webkit-autofill]:[-webkit-text-fill-color:white]
  `;

  const iconStyles = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none z-10";
  const errorBadgeStyles = "text-danger-300 text-[10px] px-2 py-0.5 rounded-lg font-semibold bg-danger-500/20 backdrop-blur-sm inline-block mt-1";

  // SI YA SE ENVIÓ EL CORREO
  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-biovet-500/20 backdrop-blur-sm rounded-full border-2 border-biovet-500/40">
            <CheckCircle2 className="w-10 h-10 text-biovet-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">¡Correo enviado!</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Revisa tu bandeja de entrada. Te hemos enviado los pasos para recuperar tu cuenta.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-biovet-300 bg-biovet-500/10 rounded-xl py-3 border border-biovet-500/20 uppercase tracking-widest font-bold">
          <Shield className="w-4 h-4" />
          <span>El enlace expira en 30 min</span>
        </div>

        <Link
          to="/auth/login"
          className="block w-full bg-biovet-500 text-white font-bold py-3 rounded-xl hover:bg-biovet-600 transition-all shadow-lg border-2 border-biovet-400/30"
        >
          Volver al Inicio de Sesión
        </Link>
      </div>
    );
  }

  // VISTA NORMAL DEL FORMULARIO
  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
          ¿Olvidaste tu contraseña? No te preocupes, ingresa tu correo y te ayudaremos a recuperarla.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
        <div className="relative">
          <Mail className={iconStyles} />
          <input
            type="email"
            placeholder="Correo electrónico"
            className={`${inputBaseStyles} pl-10 ${
              errors.email ? "border-danger-400" : "border-white/30 focus:border-biovet-400"
            }`}
            {...register("email", {
              required: "El email es obligatorio",
              pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
            })}
          />
          {errors.email && (
            <span className={errorBadgeStyles}>{errors.email.message as string}</span>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-lg hover:bg-biovet-600 border-2 border-biovet-400/30 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Enviar Instrucciones"
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <Link 
          to="/auth/login" 
          className="inline-flex items-center gap-2 text-biovet-300 font-semibold hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>

      <p className="text-center text-[10px] text-white/40 mt-8 font-medium">
        © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
      </p>
    </>
  );
}