import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  fullName: z.string().min(2, "Tell us your name"),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

const Register = () => {
  const { signUp, user } = useAuth();
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
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await signUp({
        fullName: values.fullName,
        email: values.email,
        password: values.password
      });
      toast.success("Account created! You are logged in.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message ?? "Could not create account");
    }
  });

  return (
    <AuthForm
      title="Create Your Squad"
      subtitle="Sign up in seconds."
      onSubmit={onSubmit}
      submitLabel={isSubmitting ? "Creating..." : "Create Account"}
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-white">
            Sign in
          </Link>
        </p>
      }
    >
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Full Name
        </label>
        <input
          type="text"
          className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
          placeholder="Your name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-rose-200 mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>
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
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Confirm Password
        </label>
        <input
          type="password"
          className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
          placeholder="••••••••"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-rose-200 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </AuthForm>
  );
};

export default Register;
