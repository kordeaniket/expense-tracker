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
  Tag,
  X,
  Check,
  Loader2,
  FolderOpen,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface CategoryData {
  _id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  subcategories: string[];
}

const PRESET_COLORS = [
  "#6C5CE7", // Purple (Default)
  "#00B894", // Green
  "#FD79A8", // Pink
  "#FF6B81", // Red
  "#00CEC9", // Teal
  "#FFA000", // Amber
  "#0984e3", // Blue
  "#e84393", // Bright Pink
  "#2d3436", // Dark Slate
];

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoriesPage() {
  const { data, isLoading, mutate } = useSWR("/api/categories", fetcher);
  const categories: CategoryData[] = data?.categories || [];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [color, setColor] = useState("#6C5CE7");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  
  // Subcategory helper states
  const [newSubcatName, setNewSubcatName] = useState("");
  const [editingSubcatIdx, setEditingSubcatIdx] = useState<number | null>(null);
  const [editingSubcatVal, setEditingSubcatVal] = useState("");

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setType("expense");
    setColor("#6C5CE7");
    setSubcategories([]);
    setNewSubcatName("");
    setEditingSubcatIdx(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: CategoryData) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || "#6C5CE7");
    setSubcategories(cat.subcategories || []);
    setNewSubcatName("");
    setEditingSubcatIdx(null);
    setShowModal(true);
  };

  // Subcategory management functions
  const handleAddSubcat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSubcatName.trim();
    if (!trimmed) return;
    
    if (subcategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning("Subcategory already exists.");
      return;
    }
    
    setSubcategories([...subcategories, trimmed]);
    setNewSubcatName("");
  };

  const handleStartEditSubcat = (idx: number, val: string) => {
    setEditingSubcatIdx(idx);
    setEditingSubcatVal(val);
  };

  const handleSaveSubcatEdit = (idx: number) => {
    const trimmed = editingSubcatVal.trim();
    if (!trimmed) {
      handleDeleteSubcat(idx);
      setEditingSubcatIdx(null);
      return;
    }
    
    const updated = [...subcategories];
    updated[idx] = trimmed;
    setSubcategories(updated);
    setEditingSubcatIdx(null);
  };

  const handleDeleteSubcat = (idx: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a category name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory._id}` 
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          type,
          color,
          subcategories,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save category.");
      }

      toast.success(editingCategory ? "Category updated!" : "Category created!");
      setShowModal(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category.");
      }

      toast.success("Category deleted successfully.");
      setDeleteId(null);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category.");
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
            <h2 className="text-xl font-bold text-foreground tracking-tight">Category Master</h2>
            <p className="text-xs text-muted-foreground">Manage your expense/income categories and subcategories.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium italic border border-border rounded-2xl bg-card">
            No categories available. Click &quot;Add Category&quot; above to create one.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="group relative rounded-xl border border-border bg-card p-2.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex items-center justify-between overflow-hidden"
              >
                {/* Visual Accent Background */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-15 pointer-events-none"
                  style={{ backgroundColor: cat.color }}
                />

                <div className="flex items-center gap-3 z-10 w-full min-w-0">
                  {/* Color strip */}
                  <div 
                    className="shrink-0 h-10 w-1.5 rounded-full" 
                    style={{ backgroundColor: cat.color || "#6C5CE7" }} 
                  />
                  
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-bold text-foreground text-xs tracking-tight truncate max-w-[200px]">{cat.name}</h3>
                      <span className={`inline-flex w-fit items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        cat.type === "income" 
                          ? "bg-success/10 text-success" 
                          : "bg-danger-light text-danger"
                      }`}>
                        {cat.type === "income" ? (
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5" />
                        )}
                        <span>{cat.type}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient-right pb-0.5">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <>
                          <span className="shrink-0 text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" /> {cat.subcategories.length}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {cat.subcategories.map((sub, idx) => (
                              <span
                                key={idx}
                                className="inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900/35 border border-border text-[9px] font-medium text-muted-foreground whitespace-nowrap"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <span className="text-[9px] text-muted-foreground/60 italic font-medium">No subcategories</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-all cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="p-1.5 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE / EDIT CATEGORY MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3.5 mb-5">
                <h3 className="text-base font-bold text-foreground">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5 flex-1">
                {/* Row 1: Name and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Category Name"
                    placeholder="Enter category name (e.g. Health, Gift)"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType("expense")}
                        className={`py-2 px-3 text-sm font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                          type === "expense"
                            ? "bg-danger/10 border-danger text-danger shadow-soft font-bold"
                            : "bg-background border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("income")}
                        className={`py-2 px-3 text-sm font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                          type === "income"
                            ? "bg-success/10 border-success text-success shadow-soft font-bold"
                            : "bg-background border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        Income
                      </button>
                    </div>
                  </div>
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

                {/* Subcategory Manager */}
                <div className="space-y-3.5 border border-border/80 rounded-xl p-4 bg-slate-50/30 dark:bg-slate-900/10">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Manage Subcategories</label>
                    <span className="text-[10px] font-bold text-muted-foreground/80 px-2 py-0.5 rounded bg-secondary">
                      {subcategories.length} total
                    </span>
                  </div>

                  {/* Add Subcategory Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add subcategory (e.g. Electricity, Water)"
                      value={newSubcatName}
                      onChange={(e) => setNewSubcatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubcat();
                        }
                      }}
                      className="flex-1 bg-background border border-input rounded-md py-1.5 px-3 text-xs outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubcat()}
                      className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-600 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>

                  {/* Subcategories List */}
                  <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {subcategories.map((sub, idx) => {
                      const isEditing = editingSubcatIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg border transition-all ${
                            isEditing
                              ? "bg-background border-primary"
                              : "bg-background border-border hover:border-primary/45"
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingSubcatVal}
                              onChange={(e) => setEditingSubcatVal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveSubcatEdit(idx);
                                } else if (e.key === "Escape") {
                                  setEditingSubcatIdx(null);
                                }
                              }}
                              autoFocus
                              className="bg-transparent border-none text-[11px] font-semibold outline-none py-0 px-0 w-24 text-foreground"
                            />
                          ) : (
                            <span 
                              className="text-[11px] font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                              title="Double click to edit"
                              onDoubleClick={() => handleStartEditSubcat(idx, sub)}
                            >
                              {sub}
                            </span>
                          )}

                          <div className="flex items-center gap-0.5">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveSubcatEdit(idx)}
                                className="p-0.5 rounded text-success hover:bg-success/15"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditSubcat(idx, sub)}
                                className="p-0.5 rounded text-muted-foreground/60 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-950/20"
                                title="Rename"
                              >
                                <Edit2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcat(idx)}
                              className="p-0.5 rounded text-muted-foreground/60 hover:text-danger hover:bg-danger/10"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {subcategories.length === 0 && (
                      <p className="text-[11px] text-muted-foreground/50 italic py-1 pl-1">No subcategories added yet.</p>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground font-semibold italic">💡 Tip: Double-click a tag or click the edit icon to rename it inline.</p>
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
                    ) : editingCategory ? (
                      "Save Changes"
                    ) : (
                      "Create Category"
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
          onConfirm={confirmDeleteCategory}
          isDeleting={isDeleting}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${deleteName}"? All associated subcategories will also be deleted.`}
        />

      </div>
    </DashboardShell>
  );
}
