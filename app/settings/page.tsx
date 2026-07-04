"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { User, Shield, Sliders, Loader2, Mail, Smartphone, Globe, Coins, Lock, Eye, EyeOff, FolderTree, Plus, Trash2, Edit2, X, Tag } from "lucide-react";

// Schemas for forms
const profileSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
  username: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  currency: z.string().default("INR"),
  timezone: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface CategoryData {
  _id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  subcategories: string[];
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "categories" | "security">("profile");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState("");

  // Category state
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"expense" | "income">("expense");
  const [catColor, setCatColor] = useState("#6C5CE7");
  const [subcatString, setSubcatString] = useState("");

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Watch profile picture URL for instant preview update
  const watchedImageUrl = watchProfile("image");

  useEffect(() => {
    if (watchedImageUrl) {
      setAvatarPreview(watchedImageUrl);
    }
  }, [watchedImageUrl]);

  // Fetch current user details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        
        if (response.ok && data.user) {
          resetProfile({
            name: data.user.name || "",
            username: data.user.username || "",
            phone: data.user.phone || "",
            image: data.user.image || "",
            currency: data.user.currency || "INR",
            timezone: data.user.timezone || "IST (UTC+5:30)",
            country: data.user.country || "India",
            language: data.user.language || "English",
          });
          setAvatarPreview(data.user.image || "");
        } else {
          toast.error(data.error || "Failed to load profile settings.");
        }
      } catch (error) {
        toast.error("An error occurred while loading settings.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [resetProfile]);

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok && data.categories) {
        setCategories(data.categories);
      } else {
        toast.error(data.error || "Failed to load categories.");
      }
    } catch (err) {
      toast.error("An error occurred while loading categories.");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

  // Submit Profile Information
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile changes.");
      }

      toast.success("Profile updated successfully!");
      
      // Update next-auth session cache
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          image: values.image,
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit Password Change
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsSavingPassword(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      toast.success("Password changed successfully!");
      resetPassword();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Create or Update Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSavingCategory(true);
    const subcategories = subcatString
      .split(",")
      .map((sub) => sub.trim())
      .filter(Boolean);

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          type: catType,
          color: catColor,
          subcategories,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category.");
      }

      toast.success(
        editingCategory
          ? "Category updated successfully!"
          : "Category created successfully!"
      );

      // Reset Form states
      setCatName("");
      setCatType("expense");
      setCatColor("#6C5CE7");
      setSubcatString("");
      setEditingCategory(null);

      // Refresh category list
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong saving the category.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category.");
      }

      toast.success("Category deleted successfully!");
      fetchCategories();
      if (editingCategory?._id === id) {
        setEditingCategory(null);
        setCatName("");
        setSubcatString("");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  // Select Category for Edit
  const handleEditClick = (cat: CategoryData) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatColor(cat.color);
    setSubcatString(cat.subcategories.join(", "));
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCatName("");
    setCatType("expense");
    setCatColor("#6C5CE7");
    setSubcatString("");
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Settings</h2>
          <p className="text-xs text-muted-foreground">
            Manage your account settings, theme preferences, categories master, and security.
          </p>
        </div>

        {isLoadingProfile ? (
          <div className="flex h-64 items-center justify-center rounded-md border border-border bg-card">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Loading settings...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Left: Summary Profile Card */}
            <div className="lg:col-span-4 rounded-md border border-border bg-card p-6 shadow-card flex flex-col items-center text-center h-fit">
              <div className="relative h-28 w-28 rounded-full border-4 border-primary/20 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-primary bg-primary-50">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarPreview("")}
                  />
                ) : (
                  session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"
                )}
              </div>
              <h3 className="mt-4 font-bold text-lg text-foreground">
                {session?.user?.name || "User"}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {session?.user?.email || "No Email Registered"}
              </p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary border border-primary/10">
                Active Member
              </div>
              
              {/* Navigation Items (Left sidebar style tabs) */}
              <div className="w-full mt-6 space-y-1.5 border-t border-border/50 pt-6">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === "profile"
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile Info</span>
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === "preferences"
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  <span>Preferences</span>
                </button>
                <button
                  onClick={() => setActiveTab("categories")}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === "categories"
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <FolderTree className="h-4 w-4" />
                  <span>Category Master</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === "security"
                      ? "bg-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Security & Pass</span>
                </button>
              </div>
            </div>

            {/* Right: Detailed Edit Form */}
            <div className="lg:col-span-8 rounded-md border border-border bg-card p-6 shadow-card min-h-[400px]">
              
              {/* TAB 1: PROFILE INFO */}
              {activeTab === "profile" && (
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Profile Information</h3>
                    <p className="text-xs text-muted-foreground">Update your personal account credentials.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <Input
                      id="name"
                      label="Full Name"
                      disabled={isSavingProfile}
                      icon={User}
                      error={profileErrors.name?.message}
                      {...registerProfile("name")}
                    />

                    {/* Email (Disabled) */}
                    <div className="space-y-1.5 opacity-70">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <div className="relative rounded-md border border-input bg-secondary/50">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          disabled
                          value={session?.user?.email || ""}
                          className="w-full rounded-md py-2 px-3 pl-10 pr-4 text-sm bg-transparent cursor-not-allowed outline-none text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Username */}
                    <Input
                      id="username"
                      label="Username"
                      disabled={isSavingProfile}
                      icon={User}
                      placeholder="username"
                      error={profileErrors.username?.message}
                      {...registerProfile("username")}
                    />

                    {/* Mobile Number */}
                    <Input
                      id="phone"
                      label="Mobile Number"
                      disabled={isSavingProfile}
                      icon={Smartphone}
                      placeholder="e.g. 9876543210"
                      error={profileErrors.phone?.message}
                      {...registerProfile("phone")}
                    />
                  </div>

                  {/* Profile Picture URL */}
                  <Input
                    id="image"
                    label="Profile Picture URL"
                    disabled={isSavingProfile}
                    icon={Globe}
                    placeholder="https://example.com/image.jpg"
                    error={profileErrors.image?.message}
                    {...registerProfile("image")}
                  />

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex items-center gap-2 rounded-md bg-primary py-2 px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-600 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: PREFERENCES */}
              {activeTab === "preferences" && (
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Preferences</h3>
                    <p className="text-xs text-muted-foreground">Manage your settings theme, default currency, and locations.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Theme Switcher */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Interface Theme</label>
                      <Select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">System Default</option>
                      </Select>
                    </div>

                    {/* Preferred Currency */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Default Currency</label>
                      <Select
                        disabled={isSavingProfile}
                        {...registerProfile("currency")}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Timezone */}
                    <Input
                      id="timezone"
                      label="Time Zone"
                      disabled={isSavingProfile}
                      icon={Globe}
                      error={profileErrors.timezone?.message}
                      {...registerProfile("timezone")}
                    />

                    {/* Country */}
                    <Input
                      id="country"
                      label="Country"
                      disabled={isSavingProfile}
                      icon={Globe}
                      error={profileErrors.country?.message}
                      {...registerProfile("country")}
                    />
                  </div>

                  {/* Default Language */}
                  <Input
                    id="language"
                    label="Default Language"
                    disabled={isSavingProfile}
                    icon={Globe}
                    error={profileErrors.language?.message}
                    {...registerProfile("language")}
                  />

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex items-center gap-2 rounded-md bg-primary py-2 px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-600 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CATEGORY MASTER */}
              {activeTab === "categories" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Category & Sub Category Master</h3>
                    <p className="text-xs text-muted-foreground">Manage your custom categories and subcategories mapping.</p>
                  </div>

                  {/* Add / Edit Form */}
                  <form onSubmit={handleSaveCategory} className="rounded-md border border-border bg-slate-50/50 dark:bg-slate-900/10 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        {editingCategory ? "Edit Category Mode" : "Create New Category"}
                      </h4>
                      {editingCategory && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Category Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Category Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Shopping, Food"
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          className="w-full rounded-md border border-input bg-background py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-primary text-foreground"
                        />
                      </div>

                      {/* Type Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Type</label>
                        <select
                          value={catType}
                          onChange={(e) => setCatType(e.target.value as "expense" | "income")}
                          className="w-full rounded-md border border-input bg-background py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-primary text-foreground cursor-pointer"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </div>

                      {/* Color Picker */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Theme Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={catColor}
                            onChange={(e) => setCatColor(e.target.value)}
                            className="h-8 w-12 rounded-md border border-input cursor-pointer bg-background p-1"
                          />
                          <span className="text-xs font-mono text-muted-foreground uppercase">{catColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subcategories comma-separated */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Sub Categories (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swiggy, Zomato, Amazon, Fuel"
                        value={subcatString}
                        onChange={(e) => setSubcatString(e.target.value)}
                        className="w-full rounded-md border border-input bg-background py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-primary text-foreground"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Separate multiple subcategories with commas.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingCategory}
                      className="w-full py-2 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-600 transition-all flex items-center justify-center gap-1 shadow-soft disabled:opacity-75 cursor-pointer"
                    >
                      {isSavingCategory ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : editingCategory ? (
                        <>
                          <Edit2 className="h-3 w-3" />
                          Update Category
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          Add Category
                        </>
                      )}
                    </button>
                  </form>

                  {/* Categories Grid List */}
                  {isLoadingCategories ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground font-medium italic">
                      No categories found. Build one using the form above.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                      {categories.map((cat) => (
                        <div
                          key={cat._id}
                          className="flex items-start justify-between p-3.5 rounded-md border border-border bg-background hover:bg-slate-50/20 dark:hover:bg-slate-900/5 transition-all"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <h4 className="text-sm font-bold text-foreground truncate">{cat.name}</h4>
                              <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-semibold ${
                                cat.type === "expense"
                                  ? "bg-danger-light text-danger"
                                  : "bg-success/10 text-success"
                              }`}>
                                {cat.type}
                              </span>
                            </div>
                            
                            {/* Subcategories tags list */}
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories.length === 0 ? (
                                <span className="text-[10px] text-muted-foreground italic font-medium">No subcategories</span>
                              ) : (
                                cat.subcategories.map((sub, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] font-semibold"
                                  >
                                    <Tag className="h-2.5 w-2.5 text-muted-foreground/60" />
                                    {sub}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0 ml-4 pt-1">
                            <button
                              onClick={() => handleEditClick(cat)}
                              className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-danger hover:bg-danger/5 transition-all cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SECURITY */}
              {activeTab === "security" && (
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Security & Password</h3>
                    <p className="text-xs text-muted-foreground">Change your account password securely.</p>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Password</label>
                    <div className="relative rounded-md border border-input bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        disabled={isSavingPassword}
                        placeholder="••••••••"
                        className="w-full rounded-md py-2 px-3 pl-10 pr-10 text-sm bg-transparent outline-none text-foreground"
                        {...registerPassword("currentPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                    <div className="relative rounded-md border border-input bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        disabled={isSavingPassword}
                        placeholder="••••••••"
                        className="w-full rounded-md py-2 px-3 pl-10 pr-10 text-sm bg-transparent outline-none text-foreground"
                        {...registerPassword("newPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                    <div className="relative rounded-md border border-input bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={isSavingPassword}
                        placeholder="••••••••"
                        className="w-full rounded-md py-2 px-3 pl-10 pr-10 text-sm bg-transparent outline-none text-foreground"
                        {...registerPassword("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-[11px] font-bold text-danger animate-in fade-in slide-in-from-top-1 duration-150">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="flex items-center gap-2 rounded-md bg-primary py-2 px-6 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-600 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        )}
      </div>
    </DashboardShell>
  );
}
