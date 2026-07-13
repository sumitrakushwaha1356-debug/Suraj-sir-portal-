import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Sparkles, 
  CreditCard,
  Video as VideoIcon,
  Copy,
  Check,
  UploadCloud,
  X,
  FileText,
  Home
} from "lucide-react";
import { Playlist, Video, PaymentRequest } from "../../types";
import { getPlaylists, getPaymentRequests, createPaymentRequest, db, getPurchases } from "../../lib/firebase";
import { onSnapshot, collection } from "firebase/firestore";

interface VideosTabProps {
  onGoHome?: () => void;
}

export default function VideosTab({ onGoHome }: VideosTabProps) {
  const [playlists, setPlaylists] = useState<(Playlist & { locked?: boolean })[]>(() => {
    try {
      const cached = localStorage.getItem("cached_playlists_data");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Ignore
    }
    return [
      {
        id: "class-10-free-batch",
        title: "Class 10th Free Batch",
        thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400",
        videoCount: 0,
        description: "All-in-one free coaching batch designed for Class 10th boards preparation and fundamental concepts covering Math, Science & more.",
        classLevel: "Class 10",
        videos: [],
        locked: false
      },
      {
        id: "class-12-free-batch",
        title: "Class 12th Free Batch",
        thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400",
        videoCount: 0,
        description: "Comprehensive free batch covering Class 12th board syllabus, advanced board exams concepts and exercises with Suraj Sir.",
        classLevel: "Class 12",
        videos: [],
        locked: false
      }
    ];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  
  // Navigation states
  const [selectedPlaylist, setSelectedPlaylist] = useState<(Playlist & { locked?: boolean }) | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<"Science" | "Mathematics" | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  // QR Code Payment Flow states
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentCourse, setPaymentCourse] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Student's verification request logs
  const [myPaymentRequests, setMyPaymentRequests] = useState<PaymentRequest[]>([]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "guest@educationportal.com";
    
    setLoading(true);
    setError("");

    // Real-time listener on "playlists" collection
    const unsubscribe = onSnapshot(
      collection(db, "playlists"),
      (snapshot) => {
        try {
          const dbPlaylists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
          
          const class10Db = dbPlaylists.find(p => p.id === "class-10-free-batch");
          const class12Db = dbPlaylists.find(p => p.id === "class-12-free-batch");

          const finalPlaylistsList = [
            {
              id: "class-10-free-batch",
              title: class10Db?.title || "Class 10th Free Batch",
              thumbnail: class10Db?.thumbnail || "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400",
              videoCount: class10Db ? (class10Db.videos?.length || 0) : 0,
              description: class10Db?.description || "All-in-one free coaching batch designed for Class 10th boards preparation and fundamental concepts covering Math, Science & more.",
              classLevel: class10Db?.classLevel || "Class 10",
              videos: class10Db ? (class10Db.videos || []) : [],
              locked: false
            },
            {
              id: "class-12-free-batch",
              title: class12Db?.title || "Class 12th Free Batch",
              thumbnail: class12Db?.thumbnail || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400",
              videoCount: class12Db ? (class12Db.videos?.length || 0) : 0,
              description: class12Db?.description || "Comprehensive free batch covering Class 12th board syllabus, advanced board exams concepts and exercises with Suraj Sir.",
              classLevel: class12Db?.classLevel || "Class 12",
              videos: class12Db ? (class12Db.videos || []) : [],
              locked: false
            }
          ];

          setPlaylists(finalPlaylistsList);
          
          // Auto-sync selected playlist structure when updated
          setSelectedPlaylist(prevSelected => {
            if (!prevSelected) return null;
            const updatedSelected = finalPlaylistsList.find(p => p.id === prevSelected.id);
            if (updatedSelected) {
              setCurrentVideo(prevVid => {
                if (!prevVid) return null;
                const updatedVid = updatedSelected.videos.find(v => v.id === prevVid.id);
                return updatedVid || prevVid;
              });
              return updatedSelected;
            }
            return prevSelected;
          });

          // Store in cache for instant future loads
          try {
            localStorage.setItem("cached_playlists_data", JSON.stringify(finalPlaylistsList));
          } catch (e) {
            // Ignore
          }
          
          setLoading(false);

          // Background thread update for any purchase locked state
          getPurchases(email).then((purchasesObj) => {
            // Updates completed in background if needed in future
          }).catch(err => {
            console.error("Background purchases fetch failed:", err);
          });
        } catch (err: any) {
          setError(err.message || "An unexpected error occurred during real-time sync.");
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message || "Failed to load real-time playlists snapshot.");
        setLoading(false);
      }
    );

    fetchMyPaymentRequests();

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchPlaylists = async () => {
    // Managed by real-time subscription
  };

  const fetchMyPaymentRequests = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) return;
      const data = await getPaymentRequests(email);
      setMyPaymentRequests(data);
    } catch (err) {
      console.error("Failed to sync my payment requests:", err);
    }
  };

  const handleSelectPlaylist = (pl: Playlist & { locked?: boolean }) => {
    setSelectedPlaylist(pl);
    setCurrentVideo(null); // Clear video player when shifting playlists
    setSelectedSubject(null); // Clear selected subject when shifting playlists
  };

  const handlePlayVideo = (vid: Video) => {
    if (selectedPlaylist?.locked) {
      return; // Safety guard
    }
    setCurrentVideo(vid);
  };

  const handleBackToPlaylists = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      setSelectedPlaylist(null);
      setCurrentVideo(null);
    }
  };

  const handleBackToVideosList = () => {
    setCurrentVideo(null);
  };

  const handleOpenPayment = (courseType: string, amount: number) => {
    setPaymentCourse(courseType);
    setPaymentAmount(amount);
    setTransactionId("");
    setScreenshotUrl("");
    setPaymentError("");
    setPaymentSuccess(false);
    setShowPaymentFlow(true);
  };

  const handleClosePayment = () => {
    setShowPaymentFlow(false);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("8791693178@ptyes");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Drag and Drop files handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadScreenshotFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadScreenshotFile(e.target.files[0]);
    }
  };

  const uploadScreenshotFile = async (file: File) => {
    setUploadingScreenshot(true);
    setPaymentError("");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        setScreenshotUrl(base64Data);
        setUploadingScreenshot(false);
      };
      reader.onerror = () => {
        setPaymentError("Failed to read image file.");
        setUploadingScreenshot(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setPaymentError(err.message || "Failed to upload image file.");
      setUploadingScreenshot(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      setPaymentError("Please upload your transaction payment screenshot first.");
      return;
    }
    if (!transactionId.trim()) {
      setPaymentError("Please input your 12-digit UPI Transaction reference ID.");
      return;
    }
    
    setPaymentSubmitting(true);
    setPaymentError("");
    try {
      const email = localStorage.getItem("userEmail") || "student@surajsir.com";
      const studentName = localStorage.getItem("userName") || email.split("@")[0];
      
      await createPaymentRequest(
        email,
        studentName,
        paymentCourse,
        paymentAmount,
        transactionId.trim(),
        screenshotUrl
      );
      
      setPaymentSuccess(true);
      await fetchMyPaymentRequests(); // Sync requests list
    } catch (err: any) {
      setPaymentError(err.message || "An error occurred while submitting payment details.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // UPI QR Code Payment Flow Screen
  if (showPaymentFlow) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClosePayment}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Go Back</span>
          </button>
          
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secure Payment Desk</span>
        </div>

        {paymentSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-emerald-100 rounded-3xl p-8 text-center space-y-6 shadow-lg max-w-lg mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-black text-navy-950 text-xl">Payment Details Submitted!</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Thank you for purchasing the <strong className="text-navy-900">{paymentCourse} Full Course Syllabus</strong>!
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-left space-y-2 text-xs font-medium text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Course Selected:</span>
                <span className="font-bold text-navy-900">{paymentCourse} Syllabus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="font-bold text-navy-900">₹{paymentAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction Ref ID:</span>
                <span className="font-mono text-navy-900 font-bold">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">Verification Pending</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-normal">
              Our administration console is verifying your transaction. Playlists, lecture videos, practice exams, and reference books will unlock automatically once verified. (Usually takes 5-30 minutes).
            </p>

            <button
              onClick={() => {
                setShowPaymentFlow(false);
                fetchPlaylists();
              }}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md transition"
            >
              Return to Video Batches
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Direct UPI Pay and Details */}
            <div className="md:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center space-y-6 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase">Step 1: Pay Instantly</span>
                <h3 className="font-display font-black text-navy-950 text-base">UPI Payment Button</h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Click the button below to open your preferred UPI App (Google Pay, PhonePe, Paytm, BHIM, etc.) on your device and complete the transfer.
                </p>
              </div>

              {/* UPI Payment Button Container */}
              <div className="flex flex-col items-center justify-center py-4">
                <a
                  href={`upi://pay?pa=8791693178@ptyes&pn=Suraj%20Sir%20Education&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent("Enroll in " + paymentCourse)}`}
                  className="w-[280px] h-[56px] bg-[#002f34] hover:bg-[#001f22] text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 font-black text-sm"
                >
                  <span className="bg-white/10 p-2 rounded-xl">
                    <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                    </svg>
                  </span>
                  <span>Pay with UPI (₹{paymentAmount})</span>
                </a>
                <p className="text-[10px] text-gray-400 mt-2.5">
                  Clicking will open your preferred UPI app directly.
                </p>
              </div>

              {/* UPI ID Copy Field */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400">Or Transfer Directly to UPI ID</p>
                <div className="flex items-center justify-between gap-2 bg-slate-50 border border-gray-150 px-3 py-2 rounded-xl text-xs">
                  <span className="font-mono text-navy-950 font-bold truncate">8791693178@ptyes</span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1.5 bg-white hover:bg-slate-100 text-gray-500 rounded-lg border border-gray-200 transition shrink-0"
                    title="Copy UPI ID"
                    type="button"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Course Price Box */}
              <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl">
                <p className="text-[10px] text-primary-700 font-bold uppercase tracking-wider">Amount Due</p>
                <p className="text-2xl font-black text-primary-900 mt-1">₹{paymentAmount}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">One-time payment for {paymentCourse} Full Syllabus access</p>
              </div>
            </div>

            {/* Right Box: Screen Capture Upload and UPI Ref ID */}
            <form onSubmit={handlePaymentSubmit} className="md:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase">Step 2: Submit Confirmation</span>
                <h3 className="font-display font-black text-navy-950 text-base">Payment Verification Form</h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  After completing the UPI transfer, please submit the screenshot and the 12-digit transaction ID below.
                </p>
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Drag and Drop Screenshot Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-950 block">Upload Transfer Screenshot</label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition relative overflow-hidden ${
                    dragActive 
                      ? "border-primary-500 bg-primary-50/50" 
                      : screenshotUrl 
                        ? "border-emerald-300 bg-emerald-50/10" 
                        : "border-gray-200 hover:border-gray-300 bg-slate-50/30"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-15"
                  />

                  {uploadingScreenshot ? (
                    <div className="space-y-2 py-2">
                      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-semibold text-gray-500">Uploading screenshot to security server...</p>
                    </div>
                  ) : screenshotUrl ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-950">Screenshot Uploaded Successfully!</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-md mt-0.5">{screenshotUrl}</p>
                      </div>
                      {/* Image preview */}
                      <div className="w-24 h-24 mx-auto border border-gray-100 rounded-lg overflow-hidden bg-slate-50">
                        <img src={screenshotUrl} alt="Screenshot preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-primary-600 font-bold underline cursor-pointer">Replace Image</span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-10 h-10 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-100 shadow-sm">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">Drag & drop payment screenshot here</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Or click to select file from your device</p>
                      </div>
                      <span className="inline-block py-1 px-2.5 bg-white border border-gray-250 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm mt-1">
                        Select Image
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* UPI Transaction ID Input */}
              <div className="space-y-1.5">
                <label htmlFor="txnId" className="text-xs font-bold text-navy-950 block">UPI Transaction ID / Reference No.</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    id="txnId"
                    type="text"
                    required
                    placeholder="e.g. 301294817452 (12-digit number)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Enter the exact 12-digit reference ID shown in your payment receipt screen.</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={paymentSubmitting || uploadingScreenshot}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-75 active:scale-95 cursor-pointer mt-2"
              >
                {paymentSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Submitting payment receipt...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Submit Payment Verification</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}
      </div>
    );
  }

  // 2. ERROR STATE
  if (error && playlists.length === 0) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-950 text-lg">Failed to sync videos</h3>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchPlaylists}
          className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (playlists.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-navy-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-950 text-lg">No Playlists Available</h3>
          <p className="text-xs text-gray-400 mt-1">There are currently no uploaded playlists in this batch catalog.</p>
        </div>
      </div>
    );
  }

  // 4. ACTIVE VIDEO PLAYER VIEW (FOR UNLOCKED PLAYLISTS)
  if (currentVideo && selectedPlaylist && !selectedPlaylist.locked) {
    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToVideosList}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Playlist: {selectedPlaylist.title}</span>
            </button>
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 shadow-sm active:scale-95 transition cursor-pointer"
                title="Return to Main Home"
              >
                <Home className="w-3.5 h-3.5 text-accent-gold" />
                <span>Home</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Currently Streaming</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Integrated Video Player */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-xl aspect-video border border-navy-950">
              {currentVideo.videoUrl ? (
                <video
                  controls
                  autoPlay
                  src={currentVideo.videoUrl}
                  className="absolute inset-0 w-full h-full bg-black"
                />
              ) : (
                <iframe
                  title={currentVideo.title}
                  src={`https://www.youtube.com/embed/${currentVideo.embedCode}?autoplay=1&rel=0&modestbranding=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>

            {/* Video details */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-4">
                <h2 className="font-display text-lg sm:text-xl font-bold text-navy-950">
                  {currentVideo.title}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-slate-50 border border-gray-100 px-2.5 py-1 rounded-full shrink-0 font-medium">
                  <Clock className="w-3.5 h-3.5 text-primary-500" />
                  <span>{currentVideo.duration}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                {currentVideo.description}
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">Class Batch: IIT-JEE Elite Masterclass ({selectedPlaylist.classLevel || "Class 12"})</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Lecture Sequence within Playlist */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-navy-950">
                Lectures in this Playlist
              </h3>
              <p className="text-[11px] text-gray-400">Sequence index recommended by Suraj Sir</p>
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
              {(() => {
                const allVideos = selectedPlaylist.videos || [];
                const sidebarVideos = allVideos.filter(vid => {
                  if (!selectedSubject) return true;
                  if (vid.subject) {
                    return vid.subject.toLowerCase() === selectedSubject.toLowerCase();
                  }
                  // Auto fallback mapping based on keywords
                  const title = (vid.title || "").toLowerCase();
                  const mathKeywords = [
                    "math", "arithmetic", "integration", "calculus", "probab", "matrix", 
                    "matrices", "algebra", "relation", "function", "trig", "set", "geometry",
                    "vector", "number", "ap", "gp", "determinant", "quad", "linear"
                  ];
                  const isMath = mathKeywords.some(kw => title.includes(kw));
                  if (selectedSubject === "Mathematics") {
                    return isMath;
                  } else {
                    return !isMath;
                  }
                });

                return sidebarVideos.map((vid, idx) => {
                  const isActive = vid.id === currentVideo.id;
                  return (
                    <button
                      key={vid.id}
                      onClick={() => handlePlayVideo(vid)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-start gap-3 transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary-50 border-primary-200 text-primary-900"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${
                        isActive
                          ? "bg-primary-600 text-white"
                          : "bg-navy-50 text-gray-500"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <p className="leading-tight line-clamp-2">{vid.title}</p>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" /> {vid.duration}
                        </span>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. SELECTED PLAYLIST VIDEOS LISTING (COULD BE LOCKED OR UNLOCKED)
  if (selectedPlaylist) {
    const isLocked = selectedPlaylist.locked;
    const coursePrice = (selectedPlaylist.classLevel === "Class 10" || selectedPlaylist.classLevel === "10th") ? 599 : 999;
    const courseName = selectedPlaylist.classLevel || "Class 12";

    return (
      <div className="space-y-6">
        {/* Playlist details banner */}
        <div className="bg-gradient-to-r from-navy-950 via-primary-950 to-navy-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToPlaylists}
                className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-accent-gold backdrop-blur-sm transition border border-white/10 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Library</span>
              </button>
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-accent-gold backdrop-blur-sm transition border border-white/10 cursor-pointer"
                  title="Return to Main Home"
                >
                  <Home className="w-3 h-3 text-accent-gold animate-pulse" />
                  <span>Home</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-widest text-primary-300 uppercase block">
                IIT-JEE PREPARATION BATCHES
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                isLocked ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {isLocked ? "Locked Video" : `Approved — ${courseName} Unlocked`}
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
                {selectedPlaylist.title}
              </h2>
            </div>
            <p className="text-xs text-primary-100 max-w-2xl font-light leading-relaxed">
              {selectedPlaylist.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-primary-300 pt-1">
              <span className="bg-white/10 px-2.5 py-1 rounded-md font-bold">
                {(selectedPlaylist.videos || []).length} Total Lectures
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-accent-gold">
                {courseName} Syllabus
              </span>
            </div>
          </div>
        </div>

        {/* LOCKED STATE BANNER */}
        {isLocked ? (() => {
          const matchingRequests = myPaymentRequests.filter((r) => r.courseType === courseName);
          const pendingRequest = matchingRequests.find((r) => r.status === "Pending");
          const rejectedRequest = matchingRequests.find((r) => r.status === "Rejected");

          return (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 border border-red-200">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-black text-navy-950 text-base sm:text-lg flex items-center gap-2">
                    <span>Access Blocked: Purchase Required</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">₹{coursePrice}</span>
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                    This playlist belongs to the premium <strong className="text-navy-900">{courseName} Core Curriculum</strong>.
                    You have not unlocked access to this syllabus tier yet. Please complete the one-time registration fee below to unlock instant, unrestricted streaming access.
                  </p>
                </div>
              </div>

              {pendingRequest ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs shadow-inner">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-black text-sm">Pending Verification</p>
                    <p className="font-light leading-relaxed">
                      Your payment of <strong>₹{pendingRequest.amount}</strong> (Txn ID: <span className="font-mono font-bold">{pendingRequest.transactionId}</span>) is currently pending admin verification. Your course will unlock automatically once approved!
                    </p>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded inline-block mt-1">Submitted {pendingRequest.createdAt}</span>
                  </div>
                </div>
              ) : rejectedRequest ? (
                <div className="space-y-3">
                  <div className="bg-red-100 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900 text-xs shadow-inner">
                    <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-black text-sm">Rejected — Access Denied</p>
                      <p className="font-light leading-relaxed">
                        Your previous verification with Txn ID: <span className="font-mono font-bold">{rejectedRequest.transactionId}</span> was rejected. Please verify the amount and transaction ID and submit again.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenPayment(courseName, coursePrice)}
                      className="py-2.5 px-6 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 fill-current" />
                      <span>Re-submit Verification (₹{coursePrice})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-red-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-gray-400">
                    🔒 Protected by secure Suraj Sir Coaching student database encryption
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(courseName, coursePrice)}
                    className="py-2.5 px-6 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 fill-current" />
                    <span>Buy Course & Unlock (₹{coursePrice})</span>
                  </button>
                </div>
              )}
            </div>
          );
        })() : null}

        {/* Subject selection/Video listing layout */}
        {!selectedSubject ? (
          <div className="space-y-6">
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-display text-base sm:text-lg font-bold text-navy-950">
                Select a Subject Batch
              </h3>
              <p className="text-xs text-gray-400">Choose a subject core module below to access its exclusive video libraries.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Science Card */}
              <div
                id="science_subject_card"
                onClick={() => setSelectedSubject("Science")}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group flex flex-col items-center text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl group-hover:scale-110 transition duration-300">
                  🧪
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-navy-950 group-hover:text-emerald-700 transition">
                    Science
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-light">
                    Explore physics, chemistry, and biology lectures with rich diagrams and step-by-step formula derivations.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                  <span>Open Science Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Mathematics Card */}
              <div
                id="math_subject_card"
                onClick={() => setSelectedSubject("Mathematics")}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col items-center text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl group-hover:scale-110 transition duration-300">
                  📐
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-navy-950 group-hover:text-blue-700 transition">
                    Mathematics
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-light">
                    Master algebra, calculus, geometry, and arithmetic progression through guided problems and exercises.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                  <span>Open Mathematics Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ) : (() => {
          // Filter videos by selectedSubject
          const allVideos = selectedPlaylist.videos || [];
          const filteredVideos = allVideos.filter(vid => {
            if (vid.subject) {
              return vid.subject.toLowerCase() === selectedSubject.toLowerCase();
            }
            // Auto fallback mapping based on keywords
            const title = (vid.title || "").toLowerCase();
            const mathKeywords = [
              "math", "arithmetic", "integration", "calculus", "probab", "matrix", 
              "matrices", "algebra", "relation", "function", "trig", "set", "geometry",
              "vector", "number", "ap", "gp", "determinant", "quad", "linear"
            ];
            const isMath = mathKeywords.some(kw => title.includes(kw));
            if (selectedSubject === "Mathematics") {
              return isMath;
            } else {
              return !isMath;
            }
          });

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedSubject === "Science" ? "🧪" : "📐"}</span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-navy-950">
                    {selectedSubject} Video Library
                  </h3>
                </div>
                <button
                  id="view_all_subjects_button"
                  onClick={() => setSelectedSubject(null)}
                  className="text-xs text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>View Subjects</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-3.5">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((vid, idx) => (
                    <div
                      key={vid.id}
                      onClick={() => !isLocked && handlePlayVideo(vid)}
                      className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group ${
                        isLocked 
                          ? "border-gray-100 opacity-60 cursor-not-allowed select-none" 
                          : "border-gray-100 hover:border-primary-400 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl font-bold font-mono text-sm flex items-center justify-center shrink-0 transition-all ${
                          isLocked 
                            ? "bg-slate-100 text-slate-400" 
                            : "bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white"
                        }`}>
                          {isLocked ? <Lock className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold transition ${
                            isLocked ? "text-gray-400" : "text-navy-950 group-hover:text-primary-700"
                          }`}>
                            {vid.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-xl font-light">
                            {vid.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-primary-500" /> {vid.duration}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isLocked}
                        className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 self-end sm:self-center shrink-0 transition ${
                          isLocked 
                            ? "bg-slate-50 text-slate-400 border border-slate-100" 
                            : "bg-primary-50 group-hover:bg-primary-600 text-primary-700 group-hover:text-white"
                        }`}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Play Lecture</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-gray-100 rounded-[24px] p-12 text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mx-auto">
                      <VideoIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-navy-950">No Lectures Uploaded Yet</h4>
                      <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                        This {selectedSubject} syllabus section is active! Suraj Sir will be uploading high-definition lectures and exercises very soon. Stay tuned!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // 6. DEFAULT: PLAYLISTS GRID INDEX
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">
            Video Lecture Playlists
          </h2>
          <p className="text-xs text-gray-400">Stream professional lecture batches prepared by Suraj Sir on-demand.</p>
        </div>
        
        <div className="flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-2xl font-bold self-start">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Full Course syllabus Class 10/12 instant enrollment enabled!</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((pl) => {
          const isLocked = pl.locked;
          const levelName = pl.classLevel || "Class 12";
          const matchingRequests = myPaymentRequests.filter((r) => r.courseType === levelName);
          const pendingRequest = matchingRequests.find((r) => r.status === "Pending");
          const rejectedRequest = matchingRequests.find((r) => r.status === "Rejected");
          return (
            <div
              key={pl.id}
              onClick={() => handleSelectPlaylist(pl)}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group flex flex-col h-full relative"
            >
              {/* Thumbnail banner */}
              <div className="relative aspect-video overflow-hidden bg-navy-950 border-b border-gray-50 shrink-0">
                <img
                  src={pl.thumbnail}
                  alt={pl.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent opacity-60" />
                
                {/* Class Assignment Badge */}
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border text-white ${
                  (levelName === "Class 10" || levelName === "10th")
                    ? "bg-purple-950/70 border-purple-500/50" 
                    : "bg-blue-950/70 border-blue-500/50"
                }`}>
                  {levelName}
                </span>

                {/* Locked/Unlocked Badge */}
                <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 text-white ${
                  !isLocked
                    ? "bg-emerald-950/85 border-emerald-500/50"
                    : pendingRequest
                      ? "bg-amber-950/85 border-amber-500/50"
                      : rejectedRequest
                        ? "bg-red-950/85 border-red-500/50"
                        : "bg-red-950/85 border-red-500/50"
                }`}>
                  {!isLocked ? (
                    <>
                      <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Approved — {levelName} Unlocked</span>
                    </>
                  ) : pendingRequest ? (
                    <>
                      <AlertCircle className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                      <span>Pending Verification</span>
                    </>
                  ) : rejectedRequest ? (
                    <>
                      <X className="w-2.5 h-2.5 text-red-400" />
                      <span>Rejected — Access Denied</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-2.5 h-2.5 text-red-400" />
                      <span>Locked</span>
                    </>
                  )}
                </span>

                {/* Floating lectures count */}
                <span className="absolute bottom-3 right-3 bg-navy-950/80 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-accent-gold flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>{pl.videoCount || (pl.videos || []).length} Lectures</span>
                </span>
              </div>

              {/* Core Card Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-display text-sm sm:text-base font-bold text-navy-950 group-hover:text-primary-700 transition leading-tight">
                    {pl.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-light">
                    {pl.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                  <span className="text-primary-600 font-semibold group-hover:underline flex items-center gap-1">
                    <span>{isLocked ? "Unlock Syllabus" : "Browse Syllabus"}</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                  </span>
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">{levelName} Syllabus</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
