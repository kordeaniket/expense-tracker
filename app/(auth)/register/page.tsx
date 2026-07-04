"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Eye, EyeOff, Lock, User, Mail, Smartphone, Globe, Coins, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms and Conditions" }),
    }),
    username: z.string().optional(),
    phone: z.string().optional(),
    image: z.string().optional(),
    currency: z.string().default("INR"),
    timezone: z.string().optional(),
    country: z.string().optional(),
    language: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      currency: "INR",
      username: "",
      phone: "",
      image: "",
      timezone: "IST (UTC+5:30)",
      country: "India",
      language: "English",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // 1. Submit registration details
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          username: values.username || undefined,
          phone: values.phone || undefined,
          image: values.image || undefined,
          currency: values.currency,
          timezone: values.timezone || undefined,
          country: values.country || undefined,
          language: values.language || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      toast.success("Registration successful! Logging you in...");

      // 2. Automatically log the user in
      const result = await signIn("credentials", {
        identifier: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Account created, but log in failed. Please log in manually.");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create an account
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your details to register for Expensify
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* SECTION 1: REQUIRED FIELDS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
            Required Account Info
          </h3>

          {/* Full Name */}
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            disabled={isLoading}
            icon={User}
            error={errors.name?.message}
            {...register("name")}
          />

          {/* Email Address */}
          <Input
            id="email"
            label="Email Address"
            placeholder="john@example.com"
            disabled={isLoading}
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Password Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative rounded-md border border-input bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full rounded-md py-2 px-3 pl-10 pr-10 text-sm bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  {...register("password")}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative rounded-md border border-input bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full rounded-md py-2 px-3 pl-10 pr-10 text-sm bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* SECTION 2: OPTIONAL FIELDS TOGGLE */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex w-full items-center justify-between rounded-md bg-secondary/50 px-4 py-3 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <span>Optional Preferences</span>
            {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showOptional && (
            <div className="mt-4 space-y-4 rounded-md border border-border bg-slate-50/50 dark:bg-slate-900/10 p-4 transition-all duration-300">
              {/* Username & Mobile Number */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="username"
                  label="Username"
                  placeholder="johndoe"
                  disabled={isLoading}
                  icon={User}
                  error={errors.username?.message}
                  {...register("username")}
                />

                <Input
                  id="phone"
                  label="Mobile Number"
                  placeholder="e.g. 9876543210"
                  disabled={isLoading}
                  icon={Smartphone}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>

              {/* Profile Picture & Currency */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="image"
                  label="Profile Picture URL"
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isLoading}
                  icon={User}
                  error={errors.image?.message}
                  {...register("image")}
                />

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Preferred Currency
                  </label>
                  <Select
                    disabled={isLoading}
                    error={errors.currency?.message}
                    {...register("currency")}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </Select>
                </div>
              </div>

              {/* Time Zone & Country */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="timezone"
                  label="Time Zone"
                  placeholder="IST (UTC+5:30)"
                  disabled={isLoading}
                  icon={Globe}
                  error={errors.timezone?.message}
                  {...register("timezone")}
                />

                <Input
                  id="country"
                  label="Country"
                  placeholder="India"
                  disabled={isLoading}
                  icon={Globe}
                  error={errors.country?.message}
                  {...register("country")}
                />
              </div>

              {/* Language */}
              <Input
                id="language"
                label="Default Language"
                placeholder="English"
                disabled={isLoading}
                icon={Globe}
                error={errors.language?.message}
                {...register("language")}
              />
            </div>
          )}
        </div>

        {/* SECTION 3: TERMS & CONDITIONS CHECKBOX */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <input
              id="acceptTerms"
              type="checkbox"
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              {...register("acceptTerms")}
            />
            <label htmlFor="acceptTerms" className="text-xs text-muted-foreground font-medium cursor-pointer">
              I accept the{" "}
              <Link href="/terms" className="text-primary-500 hover:text-primary-600 transition-colors font-semibold">
                Terms & Conditions
              </Link>{" "}
              and privacy policy.
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative flex w-full justify-center items-center gap-2 rounded-md bg-primary py-2.5 px-4 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
