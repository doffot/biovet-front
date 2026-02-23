import NewPasswordForm from "@/components/auth/NewPasswordForm";
import NewPasswordToken from "@/components/auth/NewPasswordToken";
import type { confirmToken } from "@/types/auth";
import { useState } from "react";

export default function NewPasswordView() {
  const [token, setToken] = useState<confirmToken["token"]>("");
  const [isValidToken, setIsValidToken] = useState(false);

  return (
    <>
      {!isValidToken ? (
        <NewPasswordToken
          setValidToken={setIsValidToken}
          onTokenValidated={setToken}
        />
      ) : (
        <NewPasswordForm token={token} />
      )}
    </>
  );
}