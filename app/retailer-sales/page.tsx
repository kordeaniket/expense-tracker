"use client";

import React from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import RetailerSalesEntryMain from "@/components/dashboard/RetailerSalesEntryMain";

export default function RetailerSalesPage() {
  return (
    <DashboardShell>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 bg-slate-50/50 dark:bg-[#08070d]">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RetailerSalesEntryMain />
        </div>
      </div>
    </DashboardShell>
  );
}
