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
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface VisitedPlaceData {
  _id: string;
  name: string;
  location?: string;
  dateVisited: string;
  rating: number;
  notes?: string;
  imageUrl?: string;
  wantToVisit?: boolean;
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

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [dateVisited, setDateVisited] = useState("");
  const [rating, setRating] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [wantToVisit, setWantToVisit] = useState(false);

  // Autocomplete suggestions states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Search Nominatim API with fallback local list
  useEffect(() => {
    if (location.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        if (!response.ok) throw new Error("API error");

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const results = data.map((item: any) => {
            const city = item.address.city || item.address.town || item.address.village || item.address.suburb || item.name;
            const country = item.address.country;
            if (city && country && city !== country) {
              return `${city}, ${country}`;
            }
            return item.display_name.split(",").slice(0, 2).join(",").trim();
          });
          const uniqueResults = Array.from(new Set(results)) as string[];
          setSuggestions(uniqueResults);
        } else {
          filterLocalPlaces(location);
        }
      } catch (err) {
        filterLocalPlaces(location);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 450); // Debounce time

    return () => clearTimeout(timer);
  }, [location]);

  const filterLocalPlaces = (query: string) => {
    const localPopular = [
      "Paris, France", "London, United Kingdom", "New York, USA", "Tokyo, Japan", "Rome, Italy",
      "Goa, India", "Mumbai, India", "Delhi, India", "Bengaluru, India", "Sydney, Australia",
      "Dubai, UAE", "Singapore", "Barcelona, Spain", "Amsterdam, Netherlands", "Bangkok, Thailand",
      "Bali, Indonesia", "Phuket, Thailand", "Maldives", "Cape Town, South Africa", "Cairo, Egypt",
      "Rio de Janeiro, Brazil", "Istanbul, Turkey", "Venice, Italy", "Florence, Italy", "Vienna, Austria",
      "Prague, Czech Republic", "Munich, Germany", "Berlin, Germany", "Madrid, Spain", "Lisbon, Portugal",
      "Toronto, Canada", "Vancouver, Canada", "San Francisco, USA", "Los Angeles, USA", "Las Vegas, USA",
      "Miami, USA", "Chicago, USA", "Boston, USA", "Seattle, USA", "Washington DC, USA",
      "Hong Kong", "Seoul, South Korea", "Shanghai, China", "Beijing, China",
      "Chennai, India", "Kolkata, India", "Hyderabad, India", "Pune, India",
      "Jaipur, India", "Udaipur, India", "Agra, India", "Kochi, India", "Manali, India",
      "Shimla, India", "Darjeeling, India", "Ooty, India", "Munnar, India", "Srinagar, India",
      "Zurich, Switzerland", "Geneva, Switzerland", "Melbourne, Australia"
    ];

    const matched = localPopular.filter((place) =>
      place.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(matched.slice(0, 5));
  };

  const handleSelectSuggestion = (sug: string) => {
    setLocation(sug);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
    setWantToVisit(false);
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
    setWantToVisit(place.wantToVisit || false);
    setShowPlaceModal(true);
  };

  const handlePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name.");
      return;
    }
    if (!wantToVisit && !dateVisited) {
      toast.error("Please enter a date visited.");
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
          wantToVisit,
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

  const handleDeletePlace = (id: string, placeName: string) => {
    setDeleteId(id);
    setDeleteName(placeName);
  };

  const confirmDeletePlace = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/visited-places/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete place.");
      }

      toast.success("Visited place deleted successfully.");
      setDeleteId(null);
      fetchPlaces();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete visited place.");
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Total Places */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary z-10">
              <Globe className="h-4 w-4" />
            </div>
            <div className="z-10">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Places Visited</p>
              <h3 className="text-sm font-bold text-foreground leading-tight">{places.length}</h3>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
          </div>

          {/* Average Rating */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning z-10">
              <Star className="h-4 w-4 fill-current" />
            </div>
            <div className="z-10">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Average Rating</p>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {places.length > 0
                  ? (places.reduce((acc, p) => acc + p.rating, 0) / places.length).toFixed(1)
                  : "0.0"} <span className="text-[10px] font-medium text-muted-foreground">/ 5</span>
              </h3>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-warning/5 blur-xl" />
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
          <div className="flex flex-col gap-2">
            {places.map((place) => {
              return (
                <div
                  key={place._id}
                  className="group relative rounded-lg border border-border bg-card shadow-sm hover:shadow transition-all duration-300 flex items-center p-2 gap-3"
                >
                  {/* Thumbnail Image */}
                  <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center">
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
                      <Map className="h-4 w-4 text-primary/40" />
                    )}
                  </div>

                  {/* Main Content - Row Layout */}
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="flex flex-col justify-center min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-xs truncate">{place.name}</h3>
                        {place.wantToVisit && (
                          <span className="bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Wishlist</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground font-medium">
                        {place.location && (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="h-2.5 w-2.5" />
                            {place.location}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Calendar className="h-2.5 w-2.5" />
                          {place.wantToVisit ? "Planned: " : "Visited: "}
                          {place.dateVisited ? new Date(place.dateVisited).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {place.notes && (
                        <div className="hidden md:block text-[9px] text-muted-foreground italic truncate w-32 xl:w-48">
                          "{place.notes}"
                        </div>
                      )}

                      <div className="flex items-center bg-warning/10 px-1.5 py-0.5 rounded text-warning">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-[9px] font-bold ml-0.5">{place.rating}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 xl:opacity-100 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(place)}
                          className="p-1 rounded text-foreground hover:bg-secondary hover:text-primary transition-all cursor-pointer"
                          title="Edit Place"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePlace(place._id, place.name)}
                          className="p-1 rounded text-foreground hover:bg-danger/10 hover:text-danger transition-all cursor-pointer"
                          title="Delete Place"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT PLACE MODAL */}
        {showPlaceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-card animate-in zoom-in-95 duration-200 my-auto">

              <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
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

              <form onSubmit={handlePlaceSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Place Name"
                    placeholder="E.g. Eiffel Tower, Maldives, Goa..."
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Input
                        label="Location"
                        placeholder="E.g. Paris, France"
                        icon={MapPin}
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => {
                          if (location.trim().length >= 2) setShowSuggestions(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                      />
                      {showSuggestions && (suggestions.length > 0 || isSearchingPlaces) && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-thin">
                          {isSearchingPlaces ? (
                            <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground font-medium">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span>Searching places...</span>
                            </div>
                          ) : (
                            suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSelectSuggestion(sug);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-foreground rounded-lg hover:bg-secondary transition-all cursor-pointer truncate"
                              >
                                {sug}
                              </button>
                            ))
                          )}
                        </div>
                      )}
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

                  <Input
                    type="date"
                    label={wantToVisit ? "Planned Date (Optional)" : "Date Visited"}
                    icon={Calendar}
                    required={!wantToVisit}
                    value={dateVisited}
                    onChange={(e) => setDateVisited(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-2 rounded-xl border border-border h-[42px] self-end">
                    <input
                      type="checkbox"
                      id="wantToVisit"
                      checked={wantToVisit}
                      onChange={(e) => setWantToVisit(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="wantToVisit" className="text-xs font-semibold text-foreground cursor-pointer">
                      Want to visit this place
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
                    <div className="flex gap-2 h-[34px] items-center">
                      {RATING_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRating(opt)}
                          className={`p-1 rounded-md transition-all cursor-pointer hover:scale-110 ${rating >= opt ? "text-warning" : "text-muted-foreground/30"
                            }`}
                        >
                          <Star className={`h-5.5 w-5.5 ${rating >= opt ? "fill-current" : ""}`} />
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
                    className="w-full h-16 rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
                    placeholder="Write about your experience..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-4 flex justify-end gap-3 pt-2.5 border-t border-border/50">
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
        <DeleteConfirmModal
          isOpen={deleteId !== null}
          onClose={() => {
            setDeleteId(null);
            setDeleteName("");
          }}
          onConfirm={confirmDeletePlace}
          isDeleting={isDeleting}
          title="Delete Visited Place"
          message={`Are you sure you want to delete "${deleteName}"?`}
        />

      </div >
    </DashboardShell >
  );
}
