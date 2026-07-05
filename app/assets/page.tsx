"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  TrendingUp,
  Landmark,
  Coins,
  Briefcase,
  PieChart as ChartIcon,
  HelpCircle,
  PiggyBank,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface AssetData {
  _id: string;
  name: string;
  type: "Savings" | "Stocks" | "Mutual Funds" | "FD" | "Gold" | "Other";
  amount: number;
  note?: string;
}

const TYPE_COLORS: Record<string, string> = {
  Savings: "#00B894",      // Green
  Stocks: "#0984e3",       // Blue
  "Mutual Funds": "#6C5CE7", // Purple
  FD: "#FFA000",           // Orange
  Gold: "#FDCB6E",         // Yellow
  Other: "#8A8D9F",        // Slate
};

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  Savings: PiggyBank,
  Stocks: TrendingUp,
  "Mutual Funds": Briefcase,
  FD: Landmark,
  Gold: Coins,
  Other: HelpCircle,
};

export default function AssetsPortfolioPage() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"Savings" | "Stocks" | "Mutual Funds" | "FD" | "Gold" | "Other">("Savings");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/assets");
      const data = await response.json();
      if (response.ok && data.assets) {
        setAssets(data.assets);
      } else {
        throw new Error(data.error || "Failed to load assets.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch assets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setName("");
    setType("Savings");
    setAmount("");
    setNote("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (asset: AssetData) => {
    setEditingAsset(asset);
    setName(asset.name);
    setType(asset.type);
    setAmount(asset.amount.toString());
    setNote(asset.note || "");
    setShowAddModal(true);
  };

  const handleAddOrEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter an asset name.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid valuation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingAsset ? `/api/assets/${editingAsset._id}` : "/api/assets";
      const method = editingAsset ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          type,
          amount: parseFloat(amount),
          note: note || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save asset.");
      }

      toast.success(editingAsset ? "Asset updated successfully!" : "Asset added successfully!");
      setShowAddModal(false);
      fetchAssets();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the asset "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete asset.");
      }

      toast.success("Asset removed from portfolio.");
      fetchAssets();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  // Portfolio Calculations
  const netWorth = assets.reduce((sum, ast) => sum + ast.amount, 0);

  // Group assets by type for charts and totals
  const groupedTotals = assets.reduce((acc, ast) => {
    acc[ast.type] = (acc[ast.type] || 0) + ast.amount;
    return acc;
  }, {} as Record<string, number>);

  const assetTypesList: ("Savings" | "Stocks" | "Mutual Funds" | "FD" | "Gold" | "Other")[] = [
    "Savings",
    "Stocks",
    "Mutual Funds",
    "FD",
    "Gold",
    "Other",
  ];

  const chartData = Object.keys(groupedTotals).map((type) => ({
    name: type,
    value: groupedTotals[type],
    color: TYPE_COLORS[type] || "#8A8D9F",
  }));

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Asset Portfolio</h2>
            <p className="text-xs text-muted-foreground">Monitor and allocate your savings, stocks, fixed deposits, and gold net worth.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </button>
        </div>

        {/* Net Worth & Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Net Worth Summary */}
          <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="h-5 w-5" />
              </span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4">Aggregate Net Worth</p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">
                ₹{netWorth.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-muted-foreground pt-1">Total valuation across all recorded bank accounts and asset classes.</p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Asset Categories</span>
                <span className="font-bold text-foreground">{chartData.length} active</span>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
          </div>

          {/* Allocation Recharts */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                <ChartIcon className="h-4 w-4 text-primary" />
                Asset Allocation
              </h4>
              {chartData.length > 0 ? (
                <div className="h-[180px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">Total</span>
                    <span className="text-xs font-black text-foreground">₹{(netWorth / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground/60 italic font-medium">
                  Add assets to generate allocation charts.
                </div>
              )}
            </div>

            {/* Legend list */}
            <div className="flex-1 w-full space-y-2">
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Portfolio Splits</h5>
              <div className="grid grid-cols-2 gap-3.5">
                {assetTypesList.map((type) => {
                  const val = groupedTotals[type] || 0;
                  const color = TYPE_COLORS[type];
                  const percentage = netWorth > 0 ? ((val / netWorth) * 100).toFixed(1) : "0.0";
                  
                  return (
                    <div key={type} className="flex items-start gap-2.5">
                      <span className="h-3 w-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: color }} />
                      <div>
                        <p className="text-[11px] font-bold text-foreground leading-tight">{type}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                          ₹{val.toLocaleString("en-IN")} ({percentage}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
          <div className="border-b border-border/50 pb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Individual Holdings
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {assets.length} items
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-medium italic">
              No assets logged yet. Click &quot;Add Asset&quot; above to log your savings accounts, stocks, or gold.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-3 pt-1">S.N</th>
                    <th className="pb-3 pt-1">Asset Name</th>
                    <th className="pb-3 pt-1">Category</th>
                    <th className="pb-3 pt-1">Valuation / Amount</th>
                    <th className="pb-3 pt-1">Description / Notes</th>
                    <th className="pb-3 pt-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {assets.map((ast, index) => {
                    const Icon = TYPE_ICONS[ast.type] || HelpCircle;
                    const typeColor = TYPE_COLORS[ast.type] || "#8A8D9F";
                    
                    return (
                      <tr key={ast._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5 font-medium text-muted-foreground">{index + 1}.</td>
                        <td className="py-3.5 font-bold text-foreground">{ast.name}</td>
                        <td className="py-3.5 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span 
                              className="h-6 w-6 rounded-lg flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: typeColor }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span style={{ color: typeColor }}>{ast.type}</span>
                          </span>
                        </td>
                        <td className="py-3.5 font-black text-foreground text-sm">₹{ast.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="py-3.5 text-muted-foreground font-medium max-w-[250px] truncate" title={ast.note}>
                          {ast.note || <span className="opacity-55 italic">None</span>}
                        </td>
                        <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(ast)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all cursor-pointer"
                            title="Edit Asset"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(ast._id, ast.name)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-danger hover:bg-danger/5 transition-all cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD / EDIT ASSET MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">
                  {editingAsset ? "Modify Asset Record" : "Add Asset"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddOrEditAsset} className="space-y-5">
                {/* Row 1: Asset Name, Asset Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Asset Name / Institution"
                    placeholder="E.g. SBI Savings, Zerodha Account, HDFC FD"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Asset Class</label>
                    <Select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                    >
                      <option value="Savings">Savings Account Balance</option>
                      <option value="Stocks">Direct Stocks Holdings</option>
                      <option value="Mutual Funds">Mutual Funds Investments</option>
                      <option value="FD">Fixed Deposit (FD) / RD</option>
                      <option value="Gold">Gold (Digital, Sovereign Bond, Physical)</option>
                      <option value="Other">Other Asset (Real Estate, Crypto, etc.)</option>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Valuation, Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput
                    label="Current Value (INR)"
                    step="0.01"
                    placeholder="0.00"
                    required
                    prefix="₹"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <Input
                    type="text"
                    label="Description / Account Ref"
                    placeholder="E.g. Account no or units details..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 rounded-lg border border-border bg-card text-xs font-bold hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : editingAsset ? (
                      "Save Changes"
                    ) : (
                      "Record Asset"
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
