"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
  CreditCard,
  QrCode,
  Coins,
  Building,
  Wallet,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface PaymentModeData {
  _id: string;
  name: string;
  type: "UPI" | "Card" | "Cash" | "Bank" | "Other";
  color: string;
}

const PRESET_COLORS = [
  "#F43F5E", // Rose/Coral (UPI)
  "#FDCB6E", // Yellow (Card)
  "#00B894", // Green (Cash)
  "#54A0FF", // Blue (Bank)
  "#E84393", // Bright Pink
  "#0984e3", // Dark Blue
  "#6f42c1", // Deep Violet
  "#2d3436", // Slate
];

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  UPI: QrCode,
  Card: CreditCard,
  Cash: Coins,
  Bank: Building,
  Other: Wallet,
};

export default function PaymentModesPage() {
  const [paymentModes, setPaymentModes] = useState<PaymentModeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMode, setEditingMode] = useState<PaymentModeData | null>(null);

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"UPI" | "Card" | "Cash" | "Bank" | "Other">("UPI");
  const [color, setColor] = useState("#F43F5E");

  const fetchPaymentModes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/payment-modes");
      const data = await response.json();
      if (response.ok && data.paymentModes) {
        setPaymentModes(data.paymentModes);
      } else {
        throw new Error(data.error || "Failed to load payment modes.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch payment modes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentModes();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMode(null);
    setName("");
    setType("UPI");
    setColor("#F43F5E");
    setShowModal(true);
  };

  const handleOpenEditModal = (mode: PaymentModeData) => {
    setEditingMode(mode);
    setName(mode.name);
    setType(mode.type);
    setColor(mode.color || "#F43F5E");
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a payment mode name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingMode 
        ? `/api/payment-modes/${editingMode._id}` 
        : "/api/payment-modes";
      const method = editingMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          type,
          color,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save payment mode.");
      }

      toast.success(editingMode ? "Payment mode updated!" : "Payment mode created!");
      setShowModal(false);
      fetchPaymentModes();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMode = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDeleteMode = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/payment-modes/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete payment mode.");
      }

      toast.success("Payment mode deleted successfully.");
      setDeleteId(null);
      fetchPaymentModes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment mode.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Payment Modes</h2>
            <p className="text-xs text-muted-foreground">Manage dynamic accounts, cards, UPIs, or wallets.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Payment Mode
          </button>
        </div>

        {/* Payment Modes Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paymentModes.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium italic border border-border rounded-2xl bg-card">
            No payment modes available. Click &quot;Add Payment Mode&quot; above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paymentModes.map((mode) => {
              const Icon = TYPE_ICONS[mode.type] || Wallet;
              return (
                <div
                  key={mode._id}
                  className="group relative rounded-xl border border-border bg-card p-2.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center gap-3 z-10 min-w-0">
                    <div 
                      className="shrink-0 h-10 w-1.5 rounded-full" 
                      style={{ backgroundColor: mode.color || "#F43F5E" }} 
                    />
                    <div 
                      className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: mode.color || "#F43F5E" }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-xs tracking-tight truncate max-w-[200px]">{mode.name}</h3>
                      <span className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase">{mode.type}</span>
                    </div>
                  </div>

                  {/* Visual Glow */}
                  <div 
                    className="absolute right-10 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-10 transition-all group-hover:scale-110 pointer-events-none"
                    style={{ backgroundColor: mode.color }}
                  />

                  {/* Actions & Chip */}
                  <div className="flex items-center gap-4 shrink-0 ml-4 z-10">
                    <div className="hidden sm:flex items-center gap-1 opacity-50 dark:opacity-40">
                      <div className="h-3 w-4 rounded bg-slate-400 dark:bg-slate-500" />
                      <div className="h-3.5 w-2.5 rounded bg-slate-400 dark:bg-slate-500" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(mode)}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-all cursor-pointer"
                        title="Edit Payment Mode"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMode(mode._id, mode.name)}
                        className="p-1.5 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all cursor-pointer"
                        title="Delete Payment Mode"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-5">
                <h3 className="text-base font-bold text-foreground">
                  {editingMode ? "Edit Payment Mode" : "Add Payment Mode"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <Input
                  label="Payment Mode Name"
                  placeholder="Enter name (e.g. HDFC Credit Card, Paytm UPI, Cash Wallet)"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mode Type</label>
                  <Select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">Credit or Debit Card</option>
                    <option value="Cash">Cash Account / Physical Currency</option>
                    <option value="Bank">Bank Account Transfer</option>
                    <option value="Other">Other Wallet</option>
                  </Select>
                </div>

                {/* Color Picker */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Theme Color</label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer relative"
                        style={{ 
                          backgroundColor: c, 
                          borderColor: color === c ? "var(--foreground)" : "transparent"
                        }}
                      >
                        {color === c && (
                          <span className="absolute inset-0 flex items-center justify-center text-white">
                            <Check className="h-4.5 w-4.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                          </span>
                        )}
                      </button>
                    ))}
                    {/* Custom Color Input */}
                    <div className="relative h-8 w-8 rounded-full border border-border overflow-hidden cursor-pointer">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                      />
                      <div 
                        className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-rose-400 via-amber-300 to-sky-400"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3.5 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-border bg-card text-xs font-bold hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : editingMode ? (
                      "Save Changes"
                    ) : (
                      "Create Payment Mode"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DeleteConfirmModal
          isOpen={deleteId !== null}
          onClose={() => {
            setDeleteId(null);
            setDeleteName("");
          }}
          onConfirm={confirmDeleteMode}
          isDeleting={isDeleting}
          title="Delete Payment Mode"
          message={`Are you sure you want to delete the payment mode "${deleteName}"?`}
        />

      </div>
    </DashboardShell>
  );
}
