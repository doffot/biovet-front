import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { validateToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { KeyRound, Shield, Mail } from "lucide-react";
import type { confirmToken } from "@/types/auth";

type NewPasswordTokenProps = {
  setValidToken: React.Dispatch<React.SetStateAction<boolean>>;
  onTokenValidated: (token: confirmToken["token"]) => void;
};

export default function NewPasswordToken({ 
  setValidToken,
  onTokenValidated 
}: NewPasswordTokenProps) {

  const { mutate, isPending } = useMutation({
    mutationFn: validateToken,
    onError: (error: any) => {
      toast.error(error.message || "Token inválido");
    },
    onSuccess: (data, variables) => {
      toast.success(data || "Token válido");
      setValidToken(true);
      onTokenValidated(variables.token);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<confirmToken>({
    defaultValues: { token: "" },
  });

  const onSubmit = (formData: confirmToken) => {
    mutate(formData);
  };

  // ESTILOS UNIFICADOS
  const inputBaseStyles = `
    w-full py-4 text-center text-3xl font-black 
    bg-dark-400/40 backdrop-blur-md
    border-2 rounded-2xl text-white 
    placeholder-white/10 
    focus:outline-none focus:bg-dark-400/60
    transition-all duration-300 relative z-0
    tracking-[0.3em]
  `;

  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-biovet-500/10 backdrop-blur-sm rounded-full mb-4 border-2 border-biovet-500/30">
          <KeyRound className="w-8 h-8 text-biovet-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verificar Código</h2>
        <p className="text-white/60 text-sm font-medium">Ingresa el código de 6 dígitos enviado a tu email</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative group">
          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-biovet-400 z-10 pointer-events-none group-focus-within:text-success-400 transition-colors" />
          
          <input
            type="text"
            placeholder="000000"
            maxLength={6}
            className={`${inputBaseStyles} pl-12 ${
              errors.token ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'
            }`}
            {...register("token", {
              required: "El código es obligatorio",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Debe ser un código de 6 dígitos",
              },
            })}
          />
          {errors.token && (
            <p className="text-danger-400 text-[10px] mt-2 font-black uppercase tracking-widest text-center">
              {errors.token.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-biovet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-biovet-500/20 hover:bg-biovet-400 active:scale-[0.98] transition-all disabled:opacity-50 border border-white/10 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Validar Código"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <Link
          to="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-success-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <Mail className="w-4 h-4" />
          ¿No recibiste el código? Reenviar
        </Link>
      </div>

      <p className="text-center text-[10px] text-white/30 mt-8 font-black uppercase tracking-widest">
        © 2026 BioVetTrack
      </p>
    </div>
  );
}