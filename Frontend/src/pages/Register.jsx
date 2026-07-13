import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, GraduationCap, Building2 } from "lucide-react";
import { authApi } from "../lib/api";
import { toast } from "sonner";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        fullName: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || "",
        gender: "other",
        role: role === "owner" ? "owner" : "student",
      };
      const res = await authApi.register(payload);
      localStorage.setItem("user", JSON.stringify(res.savedUser || res.user));
      localStorage.setItem("token", res.token);
      toast.success("Account created successfully!");
      navigate(role === "owner" ? "/dashboard/owner" : "/dashboard/student");
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "Registration failed. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="max-w-xl w-full mx-auto glass-panel p-10 rounded-3xl">
        <Link to="/" className="flex items-center gap-2.5 mb-8 group">
          <img
            src={logo}
            alt="NearStay Logo"
            className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110"
          />
          <h1 className="flex items-center select-none">
            <span className="font-poppins text-2xl font-extrabold tracking-tight text-slate-900">
              Near
            </span>
            <span className="-ml-0.5 font-kaushan leading-none text-[#4338CA]">
              <span className="text-[2rem]">S</span>
              <span className="text-2xl">tay</span>
            </span>
          </h1>
        </Link>

        <h1 className="text-xl font-bold mb-1">Create your account</h1>
        <p className="text-muted-foreground text-sm mb-7">
          Join thousands of students finding their perfect stay
        </p>

        {/* Role selector */}
        {/* <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              value: "student",
              label: "I'm a student",
              desc: "Looking for accommodation",
              Icon: GraduationCap,
            },
            {
              value: "owner",
              label: "I'm a property owner",
              desc: "Listing my property",
              Icon: Building2,
            },
          ].map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`p-4 rounded-xl border text-left transition-colors ${
                role === value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-2 ${role === value ? "text-primary" : "text-muted-foreground"}`}
              />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </button>
          ))}
        </div> */}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              value: "student",
              label: "I'm a student",
              desc: "Looking for accommodation",
              Icon: GraduationCap,
            },
            {
              value: "owner",
              label: "I'm a property owner",
              desc: "Listing my property",
              Icon: Building2,
            },
          ].map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                role === value
                  ? "border-primary bg-primary/10 ring-2 ring-primary shadow-md scale-[1.02]"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-2 transition-colors ${
                  role === value ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <div
                className={`text-sm font-medium ${
                  role === value ? "text-primary" : ""
                }`}
              >
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full name</label>
            <input
              placeholder="Your full name"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email address</label>
            <input
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
            <label className="text-sm font-medium">
              Phone <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("phone")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-3 pr-10 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Min 8 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirm password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              className="w-full h-11 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("confirmPassword", {
                required: "Please confirm password",
                validate: (val) => val === password || "Passwords don't match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-black text-white font-semibold text-sm rounded-lg mt-2 transition-all active:scale-[0.98] disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
