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
  Calendar,
  X,
  Loader2,
  BookOpen,
  Star,
  CheckCircle,
  Clock,
  Bookmark,
  FileText,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface BookData {
  _id: string;
  title: string;
  author: string;
  status: "to-read" | "reading" | "completed";
  rating: number;
  keyPoints: string[];
  notes?: string;
  startDate?: string;
  completedDate?: string;
}

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function BooksPage() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal toggles
  const [showBookModal, setShowBookModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);

  // Form states
  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"to-read" | "reading" | "completed">("to-read");
  const [rating, setRating] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");

  // Key points management inside form
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "to-read" | "reading" | "completed">("all");

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      if (response.ok && data.books) {
        setBooks(data.books);
      } else {
        throw new Error(data.error || "Failed to load books.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor("");
    setStatus("to-read");
    setRating(3);
    setNotes("");
    setStartDate("");
    setCompletedDate("");
    setKeyPoints([]);
    setNewKeyPoint("");
    setShowBookModal(true);
  };

  const handleOpenEditModal = (book: BookData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setRating(book.rating || 3);
    setNotes(book.notes || "");
    setStartDate(book.startDate ? new Date(book.startDate).toISOString().split("T")[0] : "");
    setCompletedDate(book.completedDate ? new Date(book.completedDate).toISOString().split("T")[0] : "");
    setKeyPoints(book.keyPoints || []);
    setNewKeyPoint("");
    setShowBookModal(true);
  };

  const handleOpenDetailModal = (book: BookData) => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const handleRemoveKeyPoint = (indexToRemove: number) => {
    setKeyPoints(keyPoints.filter((_, idx) => idx !== indexToRemove));
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      toast.error("Title and Author are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingBook ? `/api/books/${editingBook._id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const payload = {
        title: title.trim(),
        author: author.trim(),
        status,
        rating,
        notes: notes.trim(),
        keyPoints,
        startDate: startDate || undefined,
        completedDate: completedDate || undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingBook ? "Book updated successfully!" : "Book added to library!");
        setShowBookModal(false);
        fetchBooks();
        if (selectedBook && editingBook && selectedBook._id === editingBook._id) {
          setSelectedBook(data.book);
        }
      } else {
        throw new Error(data.error || "Failed to save book.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to remove this book from your library?")) return;

    try {
      const response = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) {
        toast.success("Book removed successfully.");
        if (selectedBook?._id === id) {
          setShowDetailModal(false);
        }
        fetchBooks();
      } else {
        throw new Error(data.error || "Failed to delete book.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    }
  };

  // Filter and Search logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return book.status === activeTab && matchesSearch;
  });

  // Stats Calculations
  const stats = {
    total: books.length,
    reading: books.filter((b) => b.status === "reading").length,
    completed: books.filter((b) => b.status === "completed").length,
    toRead: books.filter((b) => b.status === "to-read").length,
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Books Library
            </h1>
            <p className="text-sm text-muted-foreground">
              Keep track of books you are reading, complete your reading goals, and save key takeaways.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-soft hover:bg-primary-600 transition-all active:scale-[0.98] self-start sm:self-center"
          >
            <Plus className="h-4 w-4" /> Add Book
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-2xl border border-border bg-card shadow-soft flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Books</p>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{stats.total}</h3>
            </div>
          </div>
          <div className="p-3 rounded-2xl border border-border bg-card shadow-soft flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Reading</p>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{stats.reading}</h3>
            </div>
          </div>
          <div className="p-3 rounded-2xl border border-border bg-card shadow-soft flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{stats.completed}</h3>
            </div>
          </div>
          <div className="p-3 rounded-2xl border border-border bg-card shadow-soft flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Want to Read</p>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{stats.toRead}</h3>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-3 rounded-2xl border border-border">
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
            {(["all", "to-read", "reading", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "to-read" ? "Want to Read" : tab}
              </button>
            ))}
          </div>
          <div className="relative md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, author, takeaways..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>
        </div>

        {/* Books List / Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p className="text-xs text-muted-foreground font-semibold">Loading your library...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl bg-card/30">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-bold text-sm text-foreground">No books found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Add a book to start tracking your reading progress and key takeaways.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                onClick={() => handleOpenDetailModal(book)}
                className="group cursor-pointer flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-soft hover:shadow-md hover:border-primary/30 transition-all duration-200 relative overflow-hidden"
              >
                {/* Status indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    book.status === "completed"
                      ? "bg-emerald-500"
                      : book.status === "reading"
                      ? "bg-amber-500"
                      : "bg-indigo-400"
                  }`}
                />

                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        book.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : book.status === "reading"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {book.status === "to-read" ? "want to read" : book.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < book.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-base line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">by {book.author}</p>
                  </div>

                  {book.notes && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 italic bg-secondary/30 p-2.5 rounded-lg border border-border/40">
                      "{book.notes}"
                    </p>
                  )}

                  {book.keyPoints && book.keyPoints.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" /> Key Takeaways ({book.keyPoints.length})
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 pl-1">
                        {book.keyPoints.slice(0, 2).map((point, index) => (
                          <li key={index} className="flex items-start gap-1 line-clamp-1">
                            <span className="text-primary font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                        {book.keyPoints.length > 2 && (
                          <li className="text-[10px] text-primary font-semibold flex items-center mt-1">
                            Show {book.keyPoints.length - 2} more key points <ChevronRight className="h-3 w-3" />
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border mt-4 pt-3 text-[11px] text-muted-foreground font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground/60" />
                    <span>
                      {book.status === "completed" && book.completedDate
                        ? `Finished ${new Date(book.completedDate).toLocaleDateString()}`
                        : book.status === "reading" && book.startDate
                        ? `Started ${new Date(book.startDate).toLocaleDateString()}`
                        : "Not started"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenEditModal(book, e)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                      title="Edit book details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBook(book._id, e)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all"
                      title="Delete book"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail View Overlay Modal */}
        {showDetailModal && selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-lg flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Book Profile</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground leading-snug">{selectedBook.title}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">by {selectedBook.author}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          selectedBook.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : selectedBook.status === "reading"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {selectedBook.status === "to-read" ? "want to read" : selectedBook.status}
                      </span>
                      <div className="flex items-center gap-1 ml-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < selectedBook.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenEditModal(selectedBook);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-border hover:bg-secondary text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBook(selectedBook._id)}
                      className="px-3.5 py-1.5 rounded-xl border border-danger/20 hover:bg-danger/10 text-danger text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>

                {selectedBook.notes && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Personal Notes
                    </h4>
                    <p className="text-xs text-foreground bg-secondary/35 p-3.5 rounded-xl border border-border/50 italic leading-relaxed">
                      "{selectedBook.notes}"
                    </p>
                  </div>
                )}

                {/* Key Takeaways Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Takeaways
                  </h4>
                  {selectedBook.keyPoints && selectedBook.keyPoints.length > 0 ? (
                    <div className="space-y-2">
                      {selectedBook.keyPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card text-xs text-foreground font-medium leading-relaxed shadow-soft"
                        >
                          <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                            {index + 1}
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 border border-dashed border-border rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">No takeaways saved yet for this book.</p>
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleOpenEditModal(selectedBook);
                        }}
                        className="text-xs text-primary font-bold mt-1 hover:underline"
                      >
                        Add key points now
                      </button>
                    </div>
                  )}
                </div>

                {/* History Timeline */}
                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Reading Start Date</span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {selectedBook.startDate
                        ? new Date(selectedBook.startDate).toLocaleDateString([], {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Reading Finished Date</span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {selectedBook.completedDate
                        ? new Date(selectedBook.completedDate).toLocaleDateString([], {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-foreground">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h3>
                <button
                  onClick={() => setShowBookModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="flex flex-col overflow-y-auto flex-1">
                <div className="p-6 space-y-4 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Book Title *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter book title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Author Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter author's name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Reading Status
                      </label>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        options={[
                          { value: "to-read", label: "Want to Read" },
                          { value: "reading", label: "Currently Reading" },
                          { value: "completed", label: "Completed" },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Rating
                      </label>
                      <Select
                        value={String(rating)}
                        onChange={(e) => setRating(Number(e.target.value))}
                        options={RATING_OPTIONS.map((num) => ({
                          value: String(num),
                          label: `${num} Star${num > 1 ? "s" : ""}`,
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Start Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        End Date (Optional)
                      </label>
                      <Input
                        type="date"
                        value={completedDate}
                        onChange={(e) => setCompletedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Manage Key Takeaways inside Modal */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                      Key Takeaways / Points
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a key point or takeaway..."
                        value={newKeyPoint}
                        onChange={(e) => setNewKeyPoint(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeyPoint();
                          }
                        }}
                        className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyPoint}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold rounded-xl transition-all"
                      >
                        Add
                      </button>
                    </div>
                    {keyPoints.length > 0 && (
                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl border border-border bg-slate-50/50 dark:bg-card/50">
                        {keyPoints.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg hover:bg-secondary/40 text-foreground font-medium"
                          >
                            <span className="truncate flex-1">
                              {index + 1}. {point}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyPoint(index)}
                              className="text-muted-foreground hover:text-danger p-0.5 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                      Thoughts & Notes
                    </label>
                    <textarea
                      placeholder="Write your general thoughts, summary, or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-card p-3.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                  </div>
                </div>

                <div className="p-5 border-t border-border bg-card flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-all flex items-center gap-1.5 shadow-soft disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                    {editingBook ? "Save Changes" : "Add Book"}
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
