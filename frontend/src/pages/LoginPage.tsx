import { LoginForm } from "../features/auth/components/LoginForm";

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 flex w-full max-w-md flex-col items-center overflow-hidden rounded-2xl border bg-card p-8 text-card-foreground shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
};
