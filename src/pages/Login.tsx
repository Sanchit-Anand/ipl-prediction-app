import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

const Login = () => {
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message ?? "Login failed");
    }
  });

  return (
    <AuthForm
      title="Welcome Back"
      subtitle="Login to continue."
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Signing in..." : "Sign In"}
      footer={
        <p>
          New here?{" "}
          <Link to="/register" className="text-white">
            Create an account
          </Link>
        </p>
      }
    >
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Email
        </label>
        <input
          type="email"
          className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
          placeholder="you@email.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-rose-200 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Password
        </label>
        <input
          type="password"
          className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-rose-200 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>
      <button
        type="button"
        className="w-full py-3 rounded-2xl bg-white/10 text-sm uppercase tracking-[0.2em]"
        onClick={() => signInWithGoogle()}
      >
        Continue with Google
      </button>
      <Link to="/forgot-password" className="text-xs text-slate-300 text-center block">
        Forgot password?
      </Link>
    </AuthForm>
  );
};

export default Login;
