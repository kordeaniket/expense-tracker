import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#0b0a12] p-4 md:p-8">
      {/* Decorative blurred background shapes */}
      <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-primary-100 opacity-50 blur-3xl dark:bg-primary-900/20" />
      <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-info-100 opacity-50 blur-3xl dark:bg-info-900/20" />
      <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-danger-100 opacity-30 blur-3xl dark:bg-danger-900/10" />

      {/* Main container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-border bg-card/60 backdrop-blur-xl shadow-card grid md:grid-cols-12 overflow-hidden">
        
        {/* Left column - Branding */}
        <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-10 bg-gradient-to-br from-primary-600 to-primary-800 text-white dark:from-primary-900 dark:to-primary-950">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 font-semibold text-lg tracking-wider">
              <svg
                className="h-6 w-6 text-white animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              EXPENSIFY
            </span>
          </div>

          <div className="relative z-10 my-auto py-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              Smart Financial Tracking in One Place
            </h1>
            <p className="mt-4 text-sm text-primary-100/90 font-light leading-relaxed">
              Track your expenses, manage budgets, analyze trends, and achieve your financial goals effortlessly.
            </p>
          </div>

          <div className="relative z-10 text-xs text-primary-200/70 font-light">
            &copy; {new Date().getFullYear()} Expensify. All rights reserved.
          </div>
        </div>

        {/* Right column - Main form container */}
        <div className="col-span-12 md:col-span-7 flex flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
