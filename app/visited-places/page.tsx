"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  Loader2,
  MapPin,
  Star,
  Navigation,
  Globe,
  Map,
  ImageIcon,
  LocateFixed,
} from "lucide-react";

interface VisitedPlaceData {
  _id: string;
  name: string;
  location?: string;
  dateVisited: string;
  rating: number;
  notes?: string;
  imageUrl?: string;
}

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function VisitedPlacesPage() {
  const [places, setPlaces] = useState<VisitedPlaceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modals toggle
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  
  // Selection/Editing states
  const [editingPlace, setEditingPlace] = useState<VisitedPlaceData | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [dateVisited, setDateVisited] = useState("");
  const [rating, setRating] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/visited-places");
      const data = await response.json();
      if (response.ok && data.visitedPlaces) {
        setPlaces(data.visitedPlaces);
      } else {
        throw new Error(data.error || "Failed to load visited places.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch visited places.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlace(null);
    setName("");
    setLocation("");
    setDateVisited(new Date().toISOString().split("T")[0]);
    setRating(3);
    setNotes("");
    setImageUrl("");
    setShowPlaceModal(true);
  };

  const handleOpenEditModal = (place: VisitedPlaceData) => {
    setEditingPlace(place);
    setName(place.name);
    setLocation(place.location || "");
    setDateVisited(place.dateVisited ? new Date(place.dateVisited).toISOString().split("T")[0] : "");
    setRating(place.rating || 3);
    setNotes(place.notes || "");
    setImageUrl(place.imageUrl || "");
    setShowPlaceModal(true);
  };

  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dateVisited) {
      toast.error("Please enter a name and date visited.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingPlace ? `/api/visited-places/${editingPlace._id}` : "/api/visited-places";
      const method = editingPlace ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          dateVisited,
          rating,
          notes: notes.trim(),
          imageUrl: imageUrl.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save visited place.");
      }

      toast.success(editingPlace ? "Visited place updated!" : "Visited place added!");
      setShowPlaceModal(false);
      fetchPlaces();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const GOOGLE_API_KEY = 'AIzaSyCQMJIv9VeVedQWqnx1qugyL_KwlU-RZy0';
          const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
          );
          const data = await res.json();
          const label =
              data.results?.[0]?.address_components
                  ?.slice(0, 2)
                  ?.map((c: any) => c.long_name)
                  ?.join(", ") ||
              data.results?.[0]?.formatted_address ||
              "Current Location";
          setLocation(label);
          toast.success("Location fetched successfully!");
        } catch (error) {
          toast.error("Failed to fetch location data");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        toast.error("Unable to retrieve your location");
      }
    );
  };

  const handleDeletePlace = async (id: string, placeName: string) => {
    if (!confirm(`Are you sure you want to delete "${placeName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/visited-places/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete place.");
      }

      toast.success("Visited place deleted successfully.");
      fetchPlaces();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete visited place.");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Visited Places</h2>
            <p className="text-xs text-muted-foreground">Log your travel destinations, favorite spots, and memorable locations.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Place
          </button>
        </div>

        {/* Global Progress metric cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Total Places */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Places Visited</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">{places.length}</h3>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
          </div>

          {/* Average Rating */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Rating</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                {places.length > 0 
                  ? (places.reduce((acc, p) => acc + p.rating, 0) / places.length).toFixed(1) 
                  : "0.0"} <span className="text-sm font-medium text-muted-foreground">/ 5</span>
              </h3>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-warning/5 blur-xl" />
          </div>
        </div>

        {/* Places Grid Cards */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium italic border border-border rounded-2xl bg-card">
            No places logged yet. Click &quot;Add Place&quot; above to add your first destination.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => {
              return (
                <div
                  key={place._id}
                  className="group relative rounded-2xl border border-border bg-card shadow-card hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Image Header */}
                  <div className="h-32 bg-slate-100 dark:bg-slate-900 relative">
                    {place.imageUrl ? (
                      <img 
                        src={place.imageUrl} 
                        alt={place.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-c8c3313c4ce8?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        <Map className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md rounded-lg p-1">
                      <button
                        onClick={() => handleOpenEditModal(place)}
                        className="p-1.5 rounded-md text-foreground hover:text-primary transition-all cursor-pointer"
                        title="Edit Place"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place._id, place.name)}
                        className="p-1.5 rounded-md text-foreground hover:text-danger transition-all cursor-pointer"
                        title="Delete Place"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-foreground text-sm tracking-tight">{place.name}</h3>
                        {place.location && (
                          <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {place.location}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Visited: {new Date(place.dateVisited).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      
                      <div className="flex bg-warning/10 px-1.5 py-1 rounded text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="text-[10px] font-bold ml-1">{place.rating}</span>
                      </div>
                    </div>

                    {place.notes && (
                      <div className="mt-4 pt-4 border-t border-border/50 text-[11px] text-muted-foreground italic flex-1">
                        "{place.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT PLACE MODAL */}
        {showPlaceModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200 my-8">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">
                  {editingPlace ? "Modify Visited Place" : "Log Visited Place"}
                </h3>
                <button
                  onClick={() => setShowPlaceModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handlePlaceSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Place Name"
                    placeholder="E.g. Eiffel Tower, Maldives, Goa..."
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  
                  <div className="relative flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        label="Location (City, Country)"
                        placeholder="E.g. Paris, France"
                        icon={MapPin}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isFetchingLocation}
                      className="mb-[1px] p-2.5 rounded-xl border border-border bg-secondary hover:bg-primary hover:text-white hover:border-primary text-muted-foreground transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 flex items-center justify-center h-[42px] w-[42px]"
                      title="Use Current Location"
                    >
                      {isFetchingLocation ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <LocateFixed className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Date Visited"
                    icon={Calendar}
                    required
                    value={dateVisited}
                    onChange={(e) => setDateVisited(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
                    <div className="flex gap-2 h-[42px] items-center">
                      {RATING_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRating(opt)}
                          className={`p-1.5 rounded-md transition-all cursor-pointer hover:scale-110 ${
                            rating >= opt ? "text-warning" : "text-muted-foreground/30"
                          }`}
                        >
                          <Star className={`h-6 w-6 ${rating >= opt ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Image URL (Optional)"
                    placeholder="Paste an image URL here..."
                    icon={ImageIcon}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Memories / Notes</label>
                  <textarea
                    className="w-full h-24 rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
                    placeholder="Write about your experience..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowPlaceModal(false)}
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
                    ) : editingPlace ? (
                      "Save Changes"
                    ) : (
                      "Add Place"
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
