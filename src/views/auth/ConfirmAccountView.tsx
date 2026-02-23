import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { confirmAccount } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Mail, Shield, ShieldCheck } from "lucide-react";
import type { confirmToken } from "@/types/auth";

export default function ConfirmAccountView() {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: confirmAccount,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success(data || "¡Cuenta confirmada con éxito!", "Ahora puedes iniciar sesión.");
      navigate("/auth/login");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<confirmToken>({
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = (token: confirmToken) => {
    mutate(token);
  };

  // ESTILOS UNIFICADOS (Exactamente iguales a tu RegisterView)
  const inputBaseStyles = `
    w-full py-4 text-center
    bg-white/10 backdrop-blur-sm
    border rounded-xl text-white 
    text-3xl md:text-4xl font-black 
    tracking-[0.5em] placeholder-white/20 
    focus:outline-none focus:bg-white/15
    transition-all
    relative z-0
    /* Fix para eliminar el fondo blanco de Chrome */
    [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#1e293b_inset]
    [&:-webkit-autofill]:[-webkit-text-fill-color:white]
  `;

  const errorBadgeStyles = "text-danger-300 text-[10px] px-3 py-1 rounded-lg font-semibold bg-danger-500/20 backdrop-blur-sm inline-block mt-2 w-full text-center";

  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
          Ingresa el código de seguridad de 6 dígitos que enviamos a tu bandeja de entrada.
        </p>
      </div>

      {/* Badge de Verificación Segura */}
      <div className="flex items-center justify-center gap-2 mb-6 p-2 bg-biovet-500/10 rounded-xl border border-biovet-500/20">
        <ShieldCheck className="w-4 h-4 text-biovet-400" />
        <span className="text-[10px] text-biovet-200 font-bold uppercase tracking-widest">Verificación en dos pasos</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            placeholder="000000"
            maxLength={6}
            className={`${inputBaseStyles} ${
              errors.token ? 'border-danger-400' : 'border-white/30 focus:border-biovet-400'
            }`}
            {...register("token", {
              required: "El código es obligatorio",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Debe ser un código de 6 dígitos numéricos",
              },
            })}
          />
          {errors.token && (
            <span className={errorBadgeStyles}>
              {errors.token.message as string}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-biovet-500 text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-lg hover:bg-biovet-600 border-2 border-biovet-400/30 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Confirmar Cuenta</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
        <div className="space-y-1">
          <p className="text-white/50 text-xs">¿No recibiste el código?</p>
          <Link
            to="/auth/request-new-token"
            className="inline-flex items-center gap-2 text-biovet-300 font-semibold hover:text-white transition-colors text-sm"
          >
            <Mail className="w-4 h-4" />
            Solicitar nuevo código
          </Link>
        </div>
        
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <p className="text-white/40 text-[10px] leading-relaxed">
            💡 Revisa tu bandeja de <b>spam</b> o correo no deseado si no encuentras el mensaje.
          </p>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/40 mt-8 font-medium">
        © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
      </p>
    </>
  );
}