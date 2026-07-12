import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ShieldCheck, Star } from "lucide-react";
import { authApi } from "../lib/api";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";

const TESTIMONIAL = {
  text: "Found my PG within 2 days. No broker fees, no hidden charges. The owner was super transparent. NearStay is the best way to find student housing in India.",
  name: "Priya Sharma",
  college: "IIT Bombay, Mumbai",
  rating: 5,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authApi.login(data);
      const user = res.user || res.savedUser;
      authLogin(user, res.token);
      const role = user?.role || "student";
      toast.success("Logged in successfully!");
      if (role === "admin") navigate("/dashboard/admin");
      else navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left dark panel */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #0f0c29 0%, #1a1060 50%, #24243e 100%)",
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute top-[-15%] left-[-10%] w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center">
            <span className="font-bold text-white text-sm">N</span>
          </div>
          <span className="font-bold text-white text-xl tracking-tight">
            NearStay
          </span>
        </div>

        {/* Middle */}
        <div className="relative">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-5 tracking-tight">
            Your home
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(90deg, #a78bfa, #60a5fa)",
              }}
            >
              away from home.
            </span>
          </h2>
          <p className="text-white/60 leading-relaxed text-sm mb-10 max-w-xs">
            Verified PGs, hostels, and shared rooms near your college — direct
            from owners, no middlemen.
          </p>

          <div className="space-y-3 mb-10">
            {[
              "Verified property listings",
              "Direct contact with owners",
              "Secure Razorpay payments",
              "Student-reviewed ratings",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3 w-3 text-indigo-300" />
                </div>
                <span className="text-white/75 text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: TESTIMONIAL.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              "{TESTIMONIAL.text}"
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                P
              </div>
              <div>
                <div className="text-white text-xs font-semibold">
                  {TESTIMONIAL.name}
                </div>
                <div className="text-white/50 text-xs">
                  {TESTIMONIAL.college}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-white/30 text-xs">
          &copy; {new Date().getFullYear()} NearStay
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-background">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-soft">
            <span className="font-bold text-sm text-white">N</span>
          </div>
          <span className="font-bold text-xl tracking-tight">NearStay</span>
        </div>

        <div className="max-w-lg w-full mx-auto glass-panel p-10 rounded-3xl">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to continue to NearStay
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-black text-white font-semibold text-sm rounded-lg transition-all active:scale-[0.98] disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-muted rounded-xl border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground mb-2">Demo accounts</p>
            <p>Student: student@demo.com / demo123</p>
            <p>Owner: owner@demo.com / demo123</p>
            <p>Admin: admin@demo.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}