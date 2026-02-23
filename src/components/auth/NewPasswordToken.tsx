import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { validateToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { KeyRound, Shield,  Mail } from "lucide-react";
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

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4 border-2 border-white/20">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verificar Código</h2>
        <p className="text-white/60 text-sm">Ingresa el código de 6 dígitos enviado a tu email</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative group">
          {/* ICONO CON Z-10 PARA QUE NO QUEDE ATRÁS */}
          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40 z-10 pointer-events-none group-focus-within:text-cyan-400 transition-colors" />
          
          <input
            type="text"
            placeholder="000000"
            maxLength={6}
            className={`relative z-0 w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border-2 rounded-2xl text-white text-center text-3xl font-black tracking-[0.3em] placeholder-white/20 focus:outline-none transition-all
              ${errors.token ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}`}
            {...register("token", {
              required: "El código es obligatorio",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Debe ser un código de 6 dígitos",
              },
            })}
          />
          {errors.token && (
            <p className="text-red-400 text-[10px] mt-2 px-3 py-1 rounded-lg font-bold bg-black/40 text-center uppercase">
              {errors.token.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#08718d] hover:bg-[#0a86a6] text-white font-bold py-4 rounded-xl transition-all shadow-lg border-2 border-white/10 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Validar Código"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
        <Link
          to="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <Mail className="w-4 h-4" />
          ¿No recibiste el código? Reenviar
        </Link>
      </div>
    </div>
  );
}