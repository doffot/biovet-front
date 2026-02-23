import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { requestConfirmationCode } from "../../api/AuthAPI";
import { toast } from "../../components/Toast";
import { Mail, RefreshCw } from "lucide-react";
import type { RequestConfirmationCodeForm } from "@/types/auth";

export default function NewCodeView() {
    const initialValues: RequestConfirmationCodeForm = {
        email: "",
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: initialValues });

    const { mutate, isPending } = useMutation({
        mutationFn: requestConfirmationCode,
        onError: (error: any) => {
            const errorMsg =
                error.response?.data?.error ||
                error.message ||
                "Error al solicitar el código";
            toast.error(errorMsg);
        },
        onSuccess: (data) => {
            toast.success(data || "Nuevo código enviado al email");
            reset();
        },
    });

    const handleRequestCode = (formData: RequestConfirmationCodeForm) =>
        mutate(formData);

    const inputBaseStyles = `
        w-full py-2.5 md:py-3 text-sm 
        bg-white/10 backdrop-blur-sm
        border rounded-xl text-white 
        placeholder-white/40 font-medium 
        focus:outline-none focus:bg-white/15
        transition-all
        relative z-0
        [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_#1e293b_inset]
        [&:-webkit-autofill]:[-webkit-text-fill-color:white]
    `;

    const iconStyles =
        "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none z-10";
    const errorBadgeStyles =
        "text-danger-300 text-[10px] px-2 py-0.5 rounded-lg font-semibold bg-danger-500/20 backdrop-blur-sm inline-block mt-1";

    return (
        <>
            <div className="mb-6 text-center">
                <p className="text-white/90 text-xs md:text-sm font-medium leading-relaxed">
                    Ingresa tu email registrado y te enviaremos un nuevo código de
                    confirmación.
                </p>
            </div>

            <form
                onSubmit={handleSubmit(handleRequestCode)}
                noValidate
                className="space-y-3"
            >
                {/* Email */}
                <div className="relative">
                    <Mail className={iconStyles} />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        autoComplete="email"
                        className={`${inputBaseStyles} pl-10 ${
                            errors.email
                                ? "border-danger-400"
                                : "border-white/30 focus:border-biovet-400"
                        }`}
                        {...register("email", {
                            required: "El correo es obligatorio",
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "Email no válido",
                            },
                        })}
                    />
                    {errors.email && (
                        <span className={errorBadgeStyles}>
                            {errors.email.message as string}
                        </span>
                    )}
                </div>

                {/* Botón Enviar */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-biovet-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-lg hover:bg-biovet-600 border-2 border-biovet-400/30"
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Enviando...</span>
                            </div>
                        ) : (
                            "Enviar Código"
                        )}
                    </button>
                </div>
            </form>

            <p className="text-center mt-6 text-white/70 text-sm">
                ¿Ya tienes un código?{" "}
                <Link
                    to="/auth/confirm-account"
                    className="text-biovet-300 font-semibold hover:text-white transition-colors"
                >
                    Confirmar cuenta
                </Link>
            </p>

            <p className="text-center mt-3 text-white/70 text-sm">
                ¿Olvidaste tu contraseña?{" "}
                <Link
                    to="/auth/forgot-password"
                    className="text-biovet-300 font-semibold hover:text-white transition-colors"
                >
                    Restablecer
                </Link>
            </p>

            <p className="text-center text-[10px] text-white/40 mt-8">
                © 2024 BioVetTrack. Sistema profesional de gestión veterinaria.
            </p>
        </>
    );
}