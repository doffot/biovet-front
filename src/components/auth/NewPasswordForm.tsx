import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordWithToken } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { confirmToken, NewPasswordForm } from "@/types/auth";

export default function NewPasswordFormComponent({ token }: { token: confirmToken["token"] }) {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { password: "", confirmPassword: "" }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updatePasswordWithToken,
    onError: (error: any) => toast.error(error.message),
    onSuccess: (data) => {
      toast.success(data || "Contraseña actualizada correctamente");
      navigate("/auth/login");
    },
  });

  const password = watch("password");
  const handleNewPassword = (formData: NewPasswordForm) => mutate({ formData, token });

  // Estilos comunes para mantener limpieza
  const iconLeftStyles = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 z-10 pointer-events-none";
  const iconRightStyles = "absolute right-4 top-1/2 -translate-y-1/2 text-white/40 z-10 hover:text-white transition-colors cursor-pointer";
  const inputStyles = `relative z-0 w-full pl-12 pr-12 py-3.5 bg-white/10 backdrop-blur-md border rounded-xl text-white placeholder-white/30 text-sm focus:outline-none transition-all`;

  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
           <ShieldCheck className="w-12 h-12 text-cyan-400 opacity-80" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Nueva Contraseña</h2>
        <p className="text-white/50 text-xs mt-1">Crea una clave que no uses en otros sitios</p>
      </div>

      <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-4">
        {/* Nueva Contraseña */}
        <div className="relative">
          <Lock className={iconLeftStyles} />
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Nueva contraseña"
            className={`${inputStyles} ${errors.password ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}`}
            {...register("password", { 
              required: "La contraseña es obligatoria", 
              minLength: { value: 8, message: "Mínimo 8 caracteres" } 
            })}
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className={iconRightStyles}>
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-[10px] font-bold px-2">{errors.password.message as string}</p>}

        {/* Confirmar Contraseña */}
        <div className="relative">
          <Lock className={iconLeftStyles} />
          <input
            type={showCPwd ? "text" : "password"}
            placeholder="Confirmar contraseña"
            className={`${inputStyles} ${errors.confirmPassword ? 'border-red-500' : 'border-white/20 focus:border-cyan-500'}`}
            {...register("confirmPassword", {
              required: "Confirma tu contraseña",
              validate: v => v === password || "Las contraseñas no coinciden"
            })}
          />
          <button type="button" onClick={() => setShowCPwd(!showCPwd)} className={iconRightStyles}>
            {showCPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold px-2">{errors.confirmPassword.message as string}</p>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#08718d] hover:bg-[#0a86a6] text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center uppercase tracking-widest text-sm"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}