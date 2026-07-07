import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, GraduationCap, Building2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      // TODO: replace with real API call
      // const res = await axios.post("/api/auth/register", { ...data, role });
      console.log("Register data:", { ...data, role });
      navigate(role === "owner" ? "/dashboard/owner" : "/dashboard/student");
    } catch (err) {
      setError(err?.response?.data?.error ?? "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-sm text-white">N</span>
          </div>
          <span className="font-bold text-xl">NearStay</span>
        </Link>

        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-muted-foreground text-sm mb-7">Join thousands of students finding their perfect stay</p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: "student", label: "I'm a student", desc: "Looking for accommodation", Icon: GraduationCap },
            { value: "owner", label: "I'm a property owner", desc: "Listing my property", Icon: Building2 },
          ].map(({ value, label, desc, Icon }) => (
            <button key={value} type="button" onClick={() => setRole(value)}
              className={`p-4 rounded-xl border text-left transition-colors ${
                role === value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
              }`}>
              <Icon className={`h-5 w-5 mb-2 ${role === value ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full name</label>
            <input placeholder="Your full name"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email address</label>
            <input type="email" placeholder="you@example.com"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone <span className="text-muted-foreground">(optional)</span></label>
            <input type="tel" placeholder="+91 98765 43210"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("phone")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                className="w-full h-11 px-3 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm password</label>
            <input type="password" placeholder="Repeat your password"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("confirmPassword", {
                required: "Please confirm password",
                validate: val => val === password || "Passwords don't match"
              })} />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit"
            className="w-full h-11 bg-primary text-black font-semibold text-sm rounded-lg mt-2 transition-all active:scale-[0.98] disabled:opacity-60"
            disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}