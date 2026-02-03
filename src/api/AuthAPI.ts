import { isAxiosError } from "axios";

import api from "@/lib/axios";
import { userProfileSchema, userSchema, type ChangePasswordForm, type confirmToken, type ForgotPasswordForm, type NewPasswordForm, type RequestConfirmationCodeForm, type UpdateProfileForm, type UserLoginForm, type UserProfile, type UserRegistrationForm } from "@/types/auth";

export async function createAccount(formData: UserRegistrationForm) {
  try {
    const url = "/auth/create-account";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al crear la cuenta");
    }
    throw error;
  }
}

export async function confirmAccount(formData: confirmToken) {
  try {
    const url = "/auth/confirm-account";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al confirmar la cuenta"
      );
    }
    throw error;
  }
}

export async function requestConfirmationCode(
  formData: RequestConfirmationCodeForm
) {
  try {
    const url = "/auth/request-new-token";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al solicitar nuevo código"
      );
    }
    throw error;
  }
}

export async function login(formData: UserLoginForm) {
  try {
    const url = "/auth/login";
    console.log(formData);
    const { data } = await api.post<string>(url, formData);
    
    localStorage.setItem("AUTH_TOKEN_LABVET", data);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error, 'reponse;',error.response);
      throw new Error(error.response.data.error || "Error al iniciar sesión");
    }
    throw error;
  }
}

export async function forgotPassword(formData: ForgotPasswordForm) {
  try {
    const url = "/auth/forgot-password";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al solicitar recuperación"
      );
    }
    throw error;
  }
}

export async function validateToken(formData: confirmToken) {
  try {
    const url = "/auth/validate-token";
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al validar token");
    }
    throw error;
  }
}

export async function updatePasswordWithToken({
  formData,
  token,
}: {
  formData: NewPasswordForm;
  token: confirmToken["token"];
}) {
  try {
    const url = `/auth/update-password/${token}`;
    const { data } = await api.post<string>(url, formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al actualizar contraseña"
      );
    }
    throw error;
  }
}

export async function getUser() {
  try {
    const { data } = await api.get("/auth/user");
    const response = userSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al obtener usuario");
    }
    throw error;
  }
}

// =====================================================
// ✅ NUEVAS FUNCIONES PARA PERFIL
// =====================================================

/**
 * Obtener perfil completo del veterinario
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    const { data } = await api.get("/auth/profile");
    const response = userProfileSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error al procesar datos del perfil");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al obtener perfil");
    }
    throw error;
  }
}

/**
 * Actualizar datos del perfil
 */
export async function updateProfile(
  formData: UpdateProfileForm
): Promise<UserProfile> {
  try {
    const { data } = await api.put("/auth/profile", formData);
    const response = userProfileSchema.safeParse(data);
    if (response.success) {
      return response.data;
    }
    throw new Error("Error al procesar datos del perfil");
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al actualizar perfil"
      );
    }
    throw error;
  }
}

/**
 * Cambiar contraseña
 */
export async function changePassword(formData: ChangePasswordForm): Promise<string> {
  try {
    const { data } = await api.post("/auth/change-password", formData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al cambiar contraseña"
      );
    }
    throw error;
  }
}

/**
 * Subir firma del veterinario
 */
export async function uploadSignature(file: File): Promise<{ signature: string; message: string }> {
  try {
    const formData = new FormData();
    formData.append('signature', file);

    const { data } = await api.post("/auth/profile/signature", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al subir firma");
    }
    throw error;
  }
}

/**
 * Eliminar firma del veterinario
 */
export async function deleteSignature(): Promise<string> {
  try {
    const { data } = await api.delete("/auth/profile/signature");
    return data.message;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Error al eliminar firma");
    }
    throw error;
  }
}