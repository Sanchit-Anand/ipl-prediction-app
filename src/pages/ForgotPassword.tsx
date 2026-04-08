import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthForm from "../components/AuthForm";
import { supabase } from "../lib/supabaseClient";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      if (error) throw error;
      toast.success("OTP sent to your email");
      setStep("verify");
    } catch (error: any) {
      toast.error(error.message ?? "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otp || !password || !confirm) {
      toast.error("Fill all fields");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email"
      });
      if (error) throw error;
      if (!data.session) {
        throw new Error("OTP verification failed");
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      if (updateError) throw updateError;
      toast.success("Password updated. You're in!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message ?? "Could not verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Reset Password"
      subtitle={
        step === "request"
          ? "Get a one-time code in your email."
          : "Enter the OTP and set a new password."
      }
      onSubmit={step === "request" ? sendOtp : verifyOtp}
      submitLabel={loading ? "Working..." : step === "request" ? "Send OTP" : "Update Password"}
      footer={
        <p>
          Remembered it?{" "}
          <Link to="/login" className="text-white">
            Back to login
          </Link>
        </p>
      }
    >
      {step === "request" ? (
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Email
          </label>
          <input
            type="email"
            className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
            placeholder="you@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              OTP Code
            </label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              placeholder="6-digit code"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              New Password
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Confirm Password
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
        </div>
      )}
    </AuthForm>
  );
};

export default ForgotPassword;
