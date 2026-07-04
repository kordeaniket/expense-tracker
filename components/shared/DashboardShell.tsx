"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  TrendingUp,
  CalendarDays,
  PiggyBank,
  CreditCard,
  Target,
  Lightbulb,
  BarChart3,
  Settings,
  HelpCircle,
  Headphones,
  LogOut,
  Bell,
  Search,
  Clock,
  Menu,
  X,
  Gem,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const generalItems: SidebarItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "All Expenses", href: "/expenses", icon: TrendingUp },
    { label: "Bill & Subscription", href: "/budgets", icon: CalendarDays },
    { label: "Investment", href: "/income", icon: PiggyBank },
    { label: "Card", href: "/reports", icon: CreditCard },
    { label: "Goals", href: "/goals", icon: Target },
  ];

  const toolsItems: SidebarItem[] = [
    { label: "Insight", href: "/insight", icon: Lightbulb },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const otherItems: SidebarItem[] = [
    { label: "Setting", href: "/settings", icon: Settings },
    { label: "Help Center", href: "/help", icon: HelpCircle },
    { label: "Support", href: "/support", icon: Headphones },
  ];

  const renderSidebarLinks = (items: SidebarItem[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.label}
          href={item.href}
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? "bg-primary text-white shadow-soft font-semibold"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <item.icon className="h-4.5 w-4.5" />
          <span>{item.label}</span>
        </Link>
      );
    });
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#08070d] text-foreground flex">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border p-6 fixed h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accentPink flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            EXPENSIFY
          </span>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 space-y-6">
          {/* General Section */}
          <div className="space-y-1">
            <h4 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              General
            </h4>
            <nav className="space-y-1 mt-2">{renderSidebarLinks(generalItems)}</nav>
          </div>

          {/* Tools Section */}
          <div className="space-y-1">
            <h4 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              Tools
            </h4>
            <nav className="space-y-1 mt-2">{renderSidebarLinks(toolsItems)}</nav>
          </div>

          {/* Other Section */}
          <div className="space-y-1">
            <h4 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              Other
            </h4>
            <nav className="space-y-1 mt-2">
              {renderSidebarLinks(otherItems)}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-danger hover:bg-danger/10"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="mt-8 p-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-primary/10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/10 blur-xl" />
          <Gem className="h-6 w-6 text-primary mb-2" />
          <h5 className="font-bold text-sm text-foreground">Upgrade to PRO</h5>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-[150px]">
            Upgrade to premium plan + Get 1 month free
          </p>
          <button className="mt-3 w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98]">
            Upgrade
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAW */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-sm">
          <div className="w-64 bg-card border-r border-border p-6 flex flex-col h-full animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accentPink flex items-center justify-center text-white font-bold text-lg">
                  N
                </div>
                <span className="font-extrabold text-xl tracking-tight text-foreground">
                  EXPENSIFY
                </span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1">
              <div className="space-y-1">
                <h4 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  General
                </h4>
                <nav className="space-y-1 mt-2">{renderSidebarLinks(generalItems)}</nav>
              </div>

              <div className="space-y-1">
                <h4 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Tools
                </h4>
                <nav className="space-y-1 mt-2">{renderSidebarLinks(toolsItems)}</nav>
              </div>

              <div className="space-y-1">
                <h4 className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Other
                </h4>
                <nav className="space-y-1 mt-2">
                  {renderSidebarLinks(otherItems)}
                  <button
                    onClick={() => {
                      setIsMobileSidebarOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-danger hover:bg-danger/10"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-[#08070d]/80 backdrop-blur-md border-b border-border/50 px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-1.5">
                Hi, {session?.user?.name?.split(" ")[0] || "Ananya"} 👋
              </h2>
              <p className="text-xs text-muted-foreground">
                Track your all expense and transactions
              </p>
            </div>
          </div>

          {/* Middle & Right Header Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 sm:justify-end max-w-3xl">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs text-muted-foreground font-medium shrink-0">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>11:11 PM | 31 June 2025 | IN</span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search expenses, transaction, cards"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>

            {/* Icons & Avatar */}
            <div className="flex items-center justify-between sm:justify-start gap-3">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all hover:bg-secondary">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger animate-ping" />
              </button>

              {/* Profile Avatar */}
              <Link
                href="/settings"
                className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                title="View Profile Settings"
              >
                <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900 border border-primary/20 overflow-hidden flex items-center justify-center text-sm font-bold text-primary">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"
                  )}
                </div>
              </Link>
            </div>

          </div>

        </header>

        {/* CONTENT ZONE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
                <LogOut className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirm Logout</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to log out of your account?
              </p>
              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-secondary text-muted-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-semibold hover:bg-danger-600 transition-all shadow-soft active:scale-[0.98]"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
