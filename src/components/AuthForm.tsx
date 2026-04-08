import { ReactNode } from "react";

interface AuthFormProps {
  title: string;
  subtitle: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  footer?: ReactNode;
  children: ReactNode;
}

const AuthForm = ({
  title,
  subtitle,
  onSubmit,
  submitLabel,
  footer,
  children
}: AuthFormProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full card-sheen rounded-3xl p-8">
        <h1 className="text-3xl font-display">{title}</h1>
        <p className="text-sm text-slate-300 mt-2">{subtitle}</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {children}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-accent-gradient text-ink font-semibold uppercase tracking-[0.2em] text-sm"
          >
            {submitLabel}
          </button>
        </form>
        {footer && <div className="mt-6 text-sm text-slate-300">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthForm;
