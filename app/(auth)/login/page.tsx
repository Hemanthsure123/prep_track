import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login | Interview Experience Platform",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
