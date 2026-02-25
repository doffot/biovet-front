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

  // ESTILOS UNIFICADOS (Stealth & BioVet Palette)
  const inputBaseStyles = `
    w-full py-3.5 md:py-4 text-sm 
    bg-dark-400/40 backdrop-blur-md
    border rounded-xl text-white 
    placeholder-white/20 font-medium 
    focus:outline-none focus:bg-dark-400/60
    transition-all duration-300 relative z-0
  `;

  const iconLeftStyles = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-biovet-400 z-10 pointer-events-none group-focus-within:text-success-400 transition-colors";
  const iconRightStyles = "absolute right-4 top-1/2 -translate-y-1/2 text-white/20 z-20 hover:text-success-400 transition-colors cursor-pointer";
  const errorTextStyles = "text-danger-400 text-[10px] font-black uppercase tracking-widest px-2 mt-1 block";

  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-biovet-500/10 rounded-full border-2 border-biovet-500/20">
            <ShieldCheck className="w-10 h-10 text-biovet-400" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-widest">Nueva Clave</h2>
        <p className="text-white/50 text-xs mt-2 font-medium">Define tu nueva credencial de acceso profesional</p>
      </div>

      <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-4">
        {/* Nueva Contraseña */}
        <div>
          <div className="relative group">
            <Lock className={iconLeftStyles} />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Nueva contraseña"
              className={`${inputBaseStyles} pl-12 pr-12 ${
                errors.password ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'
              }`}
              {...register("password", { 
                required: "La contraseña es obligatoria", 
                minLength: { value: 8, message: "Mínimo 8 caracteres" } 
              })}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className={iconRightStyles}>
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className={errorTextStyles}>{errors.password.message}</span>}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <div className="relative group">
            <Lock className={iconLeftStyles} />
            <input
              type={showCPwd ? "text" : "password"}
              placeholder="Confirmar contraseña"
              className={`${inputBaseStyles} pl-12 pr-12 ${
                errors.confirmPassword ? 'border-danger-500/50' : 'border-white/10 focus:border-success-500/50'
              }`}
              {...register("confirmPassword", {
                required: "Confirma tu contraseña",
                validate: v => v === password || "Las contraseñas no coinciden"
              })}
            />
            <button type="button" onClick={() => setShowCPwd(!showCPwd)} className={iconRightStyles}>
              {showCPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <span className={errorTextStyles}>{errors.confirmPassword.message}</span>}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-biovet-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-biovet-500/20 hover:bg-biovet-400 active:scale-[0.98] transition-all disabled:opacity-50 border border-white/10 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Actualizar Acceso"
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-[10px] text-white/30 mt-8 font-black uppercase tracking-widest">
        © 2026 BioVetTrack
      </p>
    </div>
  );
}