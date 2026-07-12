import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, DollarSign, Archive, CheckCircle2, AlertCircle, ShoppingBag, Plus, Minus, X, Info, HelpCircle, Lock } from "lucide-react";
import { Book } from "../../types";
import { getPurchases, getBooks } from "../../lib/firebase";

interface BooksTabProps {
  email?: string;
}

export default function BooksTab({ email }: BooksTabProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interactive purchase states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Purchased courses state
  const [purchases, setPurchases] = useState<Record<string, boolean>>({ "Class 10": false, "Class 12": false });
  const [showLockNotice, setShowLockNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const userEmail = email || localStorage.getItem("userEmail") || "";
      if (!userEmail) return;
      const data = await getPurchases(userEmail);
      setPurchases(data);
    } catch (err) {
      console.error("Failed to sync student purchases status:", err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isBookLocked = (book: Book) => {
    if (!book.classLevel) return false;
    
    // Admin bypasses checks
    const adminEmail = "surajeductionofficial@gmail.com";
    if (email?.toLowerCase().trim() === adminEmail) {
      return false;
    }
    
    const normalized = book.classLevel === "10th" ? "Class 10" : book.classLevel === "12th" ? "Class 12" : book.classLevel;
    if (normalized === "Class 10" || normalized === "Class 12") {
      return !purchases[normalized];
    }
    return false;
  };

  const handleOpenOrder = (book: Book) => {
    if (isBookLocked(book)) {
      setShowLockNotice(book.classLevel || "Class 12");
      return;
    }
    setSelectedBook(book);
    setOrderQuantity(1);
    setOrderSuccess(false);
  };

  const handleCloseOrder = () => {
    setSelectedBook(null);
  };

  const handleConfirmOrder = () => {
    if (!selectedBook) return;
    
    setOrderSuccess(true);
    
    // Dynamically update local quantity stock representational state to mirror database
    const updatedBooks = books.map((b) => {
      if (b.id === selectedBook.id) {
        return { ...b, quantity: Math.max(0, b.quantity - orderQuantity) };
      }
      return b;
    });
    
    setTimeout(() => {
      setBooks(updatedBooks);
    }, 400);
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Syncing resource catalogs from server...</p>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-950 text-lg">Failed to sync resources</h3>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchBooks}
          className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (books.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-navy-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-950 text-lg">No Materials Listed</h3>
          <p className="text-xs text-gray-400 mt-1">There are currently no textbooks or formula bundles listed for this course batch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">
            Reference Books & Practice Sets
          </h2>
          <p className="text-xs text-gray-400">Order high-quality paperbacks and visual study sheets compiled by Suraj Sir.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 text-xs text-primary-800 font-medium">
          <Info className="w-4 h-4 text-primary-500" />
          <span>On-Campus Pickups are processed within 24 hours.</span>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => {
          const isOutOfStock = book.quantity === 0;
          const locked = isBookLocked(book);
          return (
            <div
              key={book.id}
              onClick={() => locked && handleOpenOrder(book)}
              className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full group ${
                locked
                  ? "border-red-100/50 hover:border-red-200"
                  : "border-gray-100 hover:border-primary-300 cursor-pointer"
              }`}
            >
              <div className={locked ? "opacity-75" : ""}>
                {/* Book Image */}
                <div className="relative aspect-3/4 overflow-hidden bg-navy-50 shrink-0 max-h-64 flex justify-center items-center p-4">
                  {/* Accent glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />
                  
                  <img
                    src={book.image}
                    alt={book.name}
                    className="h-full object-contain transform group-hover:scale-103 transition duration-500 shadow-xl rounded"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Class Badge */}
                  {book.classLevel && (
                    <span className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[9px] font-bold border shadow-sm text-white ${
                      book.classLevel === "Class 10" || book.classLevel === "10th"
                        ? "bg-purple-950/80 border-purple-500/30"
                        : "bg-blue-950/80 border-blue-500/30"
                    }`}>
                      {book.classLevel}
                    </span>
                  )}

                  {/* Floating Stock Indicator / Locked Status */}
                  <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm flex items-center gap-1 ${
                    locked
                      ? "bg-red-950 text-white border-red-500/30"
                      : isOutOfStock
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    {locked ? (
                      <>
                        <Lock className="w-3 h-3 text-red-400" />
                        <span>Locked</span>
                      </>
                    ) : isOutOfStock ? (
                      "Out of Stock"
                    ) : (
                      `${book.quantity} Copies Remaining`
                    )}
                  </span>
                </div>

                {/* Book Details */}
                <div className="p-5 space-y-2">
                  <h3 className="font-display text-sm sm:text-base font-bold text-navy-950 leading-snug line-clamp-2">
                    {book.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 font-light">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-5 pt-0">
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Standard Price</span>
                    <p className="text-lg font-black text-navy-900 flex items-center">
                      <span className="text-sm font-bold">₹</span>
                      <span>{book.price}</span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenOrder(book);
                    }}
                    disabled={isOutOfStock && !locked}
                    className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      locked
                        ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                        : isOutOfStock
                          ? "bg-gray-100 text-gray-400 border border-gray-200 pointer-events-none"
                          : "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/15"
                    }`}
                  >
                    {locked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock Class</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? "Sold Out" : "Order Book"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Ordering Interactive Drawer/Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              {/* Colored top strip */}
              <div className="h-2 bg-gradient-to-r from-primary-600 to-indigo-600" />
              
              {/* Close Button */}
              <button
                onClick={handleCloseOrder}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500 hover:text-navy-950 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 space-y-6">
                {!orderSuccess ? (
                  <>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-widest text-primary-600 uppercase block">
                        Confirm Purchase
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-bold text-navy-950">
                        {selectedBook.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-light leading-relaxed">
                        To claim your paperback copy, configure the target quantity below. Your orders are collected from the main office counter inside the campus.
                      </p>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-gray-100">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Quantity</span>
                        <p className="text-xs font-semibold text-navy-900">Configure Copies</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(q => Math.max(1, q - 1))}
                          disabled={orderQuantity <= 1}
                          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-slate-100 active:scale-90 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-navy-950 w-6 text-center">
                          {orderQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(q => Math.min(selectedBook.quantity, q + 1))}
                          disabled={orderQuantity >= selectedBook.quantity}
                          className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-slate-100 active:scale-90 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total Price Section */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Price Per Book</span>
                        <span className="font-bold">₹{selectedBook.price}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Campus Handling Fee</span>
                        <span className="text-emerald-600 font-bold">₹0 (Free)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-navy-950 pt-2 border-t border-gray-50">
                        <span>Total Payable Amount</span>
                        <span className="text-lg font-extrabold text-primary-600">
                          ₹{selectedBook.price * orderQuantity}
                        </span>
                      </div>
                    </div>

                    {/* Submit Order Buttons */}
                    <button
                      onClick={handleConfirmOrder}
                      type="button"
                      className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition cursor-pointer"
                    >
                      Confirm Order & Reserve Book
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-navy-950 text-lg">Book Reserved!</h3>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        Successfully processed order for <span className="font-bold text-navy-900">{orderQuantity}x</span> copies of <span className="italic font-bold text-navy-900">"{selectedBook.name}"</span>.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-gray-100 text-[11px] text-gray-500 max-w-sm mx-auto space-y-1 text-left">
                      <p className="font-bold text-navy-950 flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Order Details:
                      </p>
                      <p>• Receipt ID: <span className="font-mono text-navy-950 font-bold">SSE-RESERVE-{Math.floor(Math.random() * 90000) + 10000}</span></p>
                      <p>• Action: Collect from the main registration desk on campus.</p>
                      <p>• Mode: Pay by Cash or UPI on collection.</p>
                    </div>

                    <button
                      onClick={handleCloseOrder}
                      className="py-2.5 px-6 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showLockNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden relative"
            >
              <div className="h-2 bg-red-600" />
              <button
                onClick={() => setShowLockNotice(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500 hover:text-navy-950 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                  <Lock className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-display font-black text-navy-950 text-base">Course Purchase Required</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    This reference book is reserved for students enrolled in the <strong className="text-navy-900">{showLockNotice} Core batch</strong>.
                    Please head over to the <strong className="text-navy-900">"Video Batches"</strong> tab to purchase and unlock the course!
                  </p>
                </div>

                <button
                  onClick={() => setShowLockNotice(null)}
                  className="w-full py-2.5 bg-navy-950 hover:bg-black text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
