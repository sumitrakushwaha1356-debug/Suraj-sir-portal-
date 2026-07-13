import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Layers, 
  BookOpen, 
  Award, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  Play, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Package, 
  FileText, 
  ArrowLeft,
  Settings,
  HelpCircle,
  Search,
  GraduationCap,
  Home
} from "lucide-react";

import { Playlist, Video, Book, Test, StudentProfile, PaymentRequest } from "../types";
import {
  getPlaylists,
  getBooks,
  getTests,
  getStudents,
  getPaymentRequests,
  updateStudentStatus,
  deleteStudent,
  createPlaylistInDb,
  updatePlaylistInDb,
  deletePlaylistFromDb,
  createVideo,
  updateVideo,
  deleteVideo,
  createBookInDb,
  updateBookInDb,
  deleteBookFromDb,
  createTestInDb,
  updateTestInDb,
  deleteTestFromDb,
  approvePayment as approvePaymentInFirestore,
  rejectPayment as rejectPaymentInFirestore,
  deletePaymentRequest
} from "../lib/firebase";

interface AdminDashboardProps {
  email: string;
  onLogout: () => void;
  onGoHome?: () => void;
}

export default function AdminDashboard({ email, onLogout, onGoHome }: AdminDashboardProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);

  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // Modal / Form States
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [playlistForm, setPlaylistForm] = useState({ title: "", description: "", thumbnail: "", classLevel: "Class 12" });

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedPlaylistForVideos, setSelectedPlaylistForVideos] = useState<Playlist | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState({ title: "", duration: "15:00", embedCode: "", description: "", videoUrl: "", subject: "Science" });

  // Playlist Management Form States (Class 10th & 12th Free Batches)
  const [pmPlaylistSelection, setPmPlaylistSelection] = useState<string>("class-12-free-batch");
  const [pmVideoTitle, setPmVideoTitle] = useState<string>("");
  const [pmYoutubeUrl, setPmYoutubeUrl] = useState<string>("");
  const [pmVideoDescription, setPmVideoDescription] = useState<string>("");
  const [pmThumbnailUrl, setPmThumbnailUrl] = useState<string>("");
  const [pmSubject, setPmSubject] = useState<string>("Science");
  const [pmEditingVideoId, setPmEditingVideoId] = useState<string | null>(null);
  const [pmOriginalPlaylistId, setPmOriginalPlaylistId] = useState<string | null>(null);

  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({ name: "", price: 0, quantity: 10, image: "", description: "" });

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testForm, setTestForm] = useState({
    title: "",
    subject: "Physics",
    duration: 15,
    questions: [] as any[]
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "videoUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          if (field === "thumbnail") {
            setPlaylistForm((prev) => ({ ...prev, thumbnail: base64Data }));
            showFeedback("Thumbnail uploaded and updated!");
          } else {
            setVideoForm((prev) => ({ ...prev, videoUrl: base64Data }));
            showFeedback("Video file uploaded and updated!");
          }
        } catch (err: any) {
          showFeedback(err.message || "Failed to upload file.", true);
        } finally {
          setUploadingFile(false);
        }
      };
      reader.onerror = () => {
        showFeedback("Failed to read file.", true);
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showFeedback(err.message || "Failed to upload file.", true);
      setUploadingFile(false);
    }
  };
  
  // Single question builder state inside Test Modal
  const [questionBuilder, setQuestionBuilder] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0
  });

  const [studentSearch, setStudentSearch] = useState("");

  const presetImages = {
    physics: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400",
    math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
    chemistry: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400",
    book: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"
  };

  // Auth header getter
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // Fetch initial system state
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [dPlaylists, dBooks, dTests, dStudents, dPayments] = await Promise.all([
        getPlaylists("surajeductionofficial@gmail.com"),
        getBooks(),
        getTests(),
        getStudents(),
        getPaymentRequests()
      ]);

      setPlaylists(dPlaylists);
      setBooks(dBooks);
      setTests(dTests);
      setStudents(dStudents);
      setPayments(dPayments);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact Firestore database.");
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleToggleStudentStatus = async (studentEmail: string, currentStatus: boolean) => {
    try {
      await updateStudentStatus(studentEmail, !currentStatus);
      showFeedback(`Student status successfully changed to ${!currentStatus ? 'Active' : 'Inactive'}.`);
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to change status", true);
    }
  };

  const handleDeleteStudent = async (studentEmail: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete student ${studentEmail}? This action is permanent.`)) {
      return;
    }
    try {
      await deleteStudent(studentEmail);
      showFeedback("Student record deleted successfully.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to delete student record.", true);
    }
  };

  // ==========================================
  // PLAYLIST CRUD HANDLERS
  // ==========================================
  const handleOpenPlaylistModal = (pl: Playlist | null = null) => {
    if (pl) {
      setEditingPlaylist(pl);
      setPlaylistForm({
        title: pl.title,
        description: pl.description,
        thumbnail: pl.thumbnail,
        classLevel: pl.classLevel || "Class 12"
      });
    } else {
      setEditingPlaylist(null);
      setPlaylistForm({
        title: "",
        description: "",
        thumbnail: presetImages.physics,
        classLevel: "Class 12"
      });
    }
    setPlaylistModalOpen(true);
  };

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncing(true);
    try {
      if (editingPlaylist) {
        await updatePlaylistInDb(editingPlaylist.id, playlistForm);
        showFeedback("Course Playlist metadata updated!");
      } else {
        await createPlaylistInDb(playlistForm);
        showFeedback("New learning playlist added successfully!");
      }
      setPlaylistModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handlePlaylistDelete = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this playlist? This deletes all associated video lectures as well.")) return;
    setSyncing(true);
    try {
      await deletePlaylistFromDb(id);
      showFeedback("Syllabus Playlist purged successfully.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================
  // VIDEO LECTURE CRUD HANDLERS
  // ==========================================
  const handleOpenVideoModal = (pl: Playlist, vid: any | null = null) => {
    setSelectedPlaylistForVideos(pl);
    if (vid) {
      setEditingVideo(vid);
      setVideoForm({
        title: vid.title,
        duration: vid.duration,
        embedCode: vid.embedCode || "",
        description: vid.description || "",
        videoUrl: vid.videoUrl || "",
        subject: vid.subject || "Science"
      });
    } else {
      setEditingVideo(null);
      setVideoForm({
        title: "",
        duration: "25:00",
        embedCode: "",
        description: "",
        videoUrl: "",
        subject: "Science"
      });
    }
    setVideoModalOpen(true);
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylistForVideos) return;
    setSyncing(true);

    try {
      if (editingVideo) {
        await updateVideo(selectedPlaylistForVideos.id, editingVideo.id, videoForm);
        showFeedback("Lecture video details updated!");
      } else {
        await createVideo(selectedPlaylistForVideos.id, videoForm);
        showFeedback("New lecture video appended to syllabus!");
      }
      setVideoModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handleVideoDelete = async (playlistId: string, videoId: string) => {
    if (!window.confirm("Purge this video from playlist?")) return;
    setSyncing(true);
    try {
      await deleteVideo(playlistId, videoId);
      showFeedback("Lecture video removed.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================
  // PLAYLIST MANAGEMENT TAB HANDLERS
  // ==========================================
  const getYoutubeId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const handlePmSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmPlaylistSelection) {
      showFeedback("Please select a playlist.", true);
      return;
    }
    if (!pmVideoTitle.trim()) {
      showFeedback("Please enter a video title.", true);
      return;
    }
    if (!pmYoutubeUrl.trim()) {
      showFeedback("Please enter a YouTube video URL or ID.", true);
      return;
    }

    setSyncing(true);
    try {
      // 1. Ensure target playlist exists in Firestore
      const targetPlaylistExists = playlists.some(p => p.id === pmPlaylistSelection);
      if (!targetPlaylistExists) {
        const title = pmPlaylistSelection === "class-10-free-batch" ? "Class 10th Free Batch" : "Class 12th Free Batch";
        const level = pmPlaylistSelection === "class-10-free-batch" ? "Class 10" : "Class 12";
        const desc = pmPlaylistSelection === "class-10-free-batch"
          ? "All-in-one free coaching batch designed for Class 10th boards preparation and fundamental concepts covering Math, Science & more."
          : "Comprehensive free batch covering Class 12th board syllabus, advanced board exams concepts and exercises with Suraj Sir.";
        const thumb = pmPlaylistSelection === "class-10-free-batch"
          ? "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400"
          : "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400";
        
        await createPlaylistInDb({
          id: pmPlaylistSelection,
          title,
          description: desc,
          thumbnail: thumb,
          classLevel: level,
          videos: []
        });
      }

      const embedCode = getYoutubeId(pmYoutubeUrl);
      const videoData = {
        title: pmVideoTitle,
        duration: "25:00",
        embedCode,
        description: pmVideoDescription,
        videoUrl: pmThumbnailUrl,
        subject: pmSubject
      };

      if (pmEditingVideoId) {
        if (pmOriginalPlaylistId && pmOriginalPlaylistId !== pmPlaylistSelection) {
          // Playlist changed, so delete from old and insert to new
          await deleteVideo(pmOriginalPlaylistId, pmEditingVideoId);
          await createVideo(pmPlaylistSelection, { ...videoData, id: pmEditingVideoId });
        } else {
          await updateVideo(pmPlaylistSelection, pmEditingVideoId, videoData);
        }
        showFeedback("Lecture video updated successfully inside Firestore!");
      } else {
        await createVideo(pmPlaylistSelection, videoData);
        showFeedback("New lecture video saved successfully inside Firestore!");
      }

      // Reset form
      setPmVideoTitle("");
      setPmYoutubeUrl("");
      setPmVideoDescription("");
      setPmThumbnailUrl("");
      setPmSubject("Science");
      setPmEditingVideoId(null);
      setPmOriginalPlaylistId(null);

      // Refresh data
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to save video to Firestore", true);
    } finally {
      setSyncing(false);
    }
  };

  const handlePmEditVideo = (playlistId: string, vid: any) => {
    setPmPlaylistSelection(playlistId);
    setPmVideoTitle(vid.title);
    setPmYoutubeUrl(vid.embedCode ? `https://www.youtube.com/watch?v=${vid.embedCode}` : "");
    setPmVideoDescription(vid.description || "");
    setPmThumbnailUrl(vid.videoUrl || "");
    setPmSubject(vid.subject || "Science");
    setPmEditingVideoId(vid.id);
    setPmOriginalPlaylistId(playlistId);
    showFeedback("Video loaded into editor form.");
  };

  const handlePmDeleteVideo = async (playlistId: string, videoId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this video?")) return;
    setSyncing(true);
    try {
      await deleteVideo(playlistId, videoId);
      showFeedback("Video deleted successfully from Firestore!");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to delete video", true);
    } finally {
      setSyncing(false);
    }
  };

  const handlePmCancelEdit = () => {
    setPmVideoTitle("");
    setPmYoutubeUrl("");
    setPmVideoDescription("");
    setPmThumbnailUrl("");
    setPmSubject("Science");
    setPmEditingVideoId(null);
    setPmOriginalPlaylistId(null);
    showFeedback("Edit cleared.");
  };

  // ==========================================
  // BOOK CRUD HANDLERS
  // ==========================================
  const handleOpenBookModal = (bk: Book | null = null) => {
    if (bk) {
      setEditingBook(bk);
      setBookForm({
        name: bk.name,
        price: bk.price,
        quantity: bk.quantity,
        image: bk.image,
        description: bk.description
      });
    } else {
      setEditingBook(null);
      setBookForm({
        name: "",
        price: 399,
        quantity: 15,
        image: presetImages.book,
        description: ""
      });
    }
    setBookModalOpen(true);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncing(true);
    try {
      if (editingBook) {
        await updateBookInDb(editingBook.id, bookForm);
        showFeedback("Reference book credentials updated!");
      } else {
        await createBookInDb(bookForm);
        showFeedback("New study reference book added to repository!");
      }
      setBookModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handleBookDelete = async (id: string) => {
    if (!window.confirm("Purge this reference book from catalog database?")) return;
    setSyncing(true);
    try {
      await deleteBookFromDb(id);
      showFeedback("Book successfully uncatalogued.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================
  // TEST MOCK CRUD HANDLERS
  // ==========================================
  const handleOpenTestModal = (tst: Test | null = null) => {
    if (tst) {
      setEditingTest(tst);
      setTestForm({
        title: tst.title,
        subject: tst.subject,
        duration: tst.duration,
        questions: [...tst.questions]
      });
    } else {
      setEditingTest(null);
      setTestForm({
        title: "",
        subject: "Physics",
        duration: 15,
        questions: []
      });
    }
    // Clear question builder
    setQuestionBuilder({
      question: "",
      options: ["", "", "", ""],
      correct: 0
    });
    setTestModalOpen(true);
  };

  const handleAddQuestionToTest = () => {
    if (!questionBuilder.question.trim()) {
      alert("Question prompt cannot be blank.");
      return;
    }
    if (questionBuilder.options.some(o => !o.trim())) {
      alert("Please specify all 4 options.");
      return;
    }

    const newQ = {
      id: "q-" + Math.random().toString(36).substring(2, 7),
      question: questionBuilder.question,
      options: [...questionBuilder.options],
      correct: questionBuilder.correct
    };

    setTestForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));

    // Reset question builder
    setQuestionBuilder({
      question: "",
      options: ["", "", "", ""],
      correct: 0
    });
  };

  const handleRemoveQuestionFromTest = (qId: string) => {
    setTestForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testForm.questions.length === 0) {
      alert("Mock test papers must contain at least 1 question.");
      return;
    }
    setSyncing(true);

    try {
      if (editingTest) {
        await updateTestInDb(editingTest.id, testForm);
        showFeedback("Mock Test Paper updated successfully!");
      } else {
        await createTestInDb(testForm);
        showFeedback("New competitive Mock Test Paper published!");
      }
      setTestModalOpen(false);
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestDelete = async (id: string) => {
    if (!window.confirm("Purge this exam sheet entirely from dynamic mocks?")) return;
    setSyncing(true);
    try {
      await deleteTestFromDb(id);
      showFeedback("Mock test paper successfully deleted.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestPublishToggle = async (tst: Test) => {
    setSyncing(true);
    try {
      await updateTestInDb(tst.id, { ...tst, published: !(tst as any).published });
      showFeedback("Mock Test availability status altered.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================
  // PAYMENT APPROVAL / REJECTION HANDLERS
  // ==========================================
  const approvePayment = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to approve this course payment? This will instantly unlock full streaming access for this student!")) return;
    setSyncing(true);
    try {
      await approvePaymentInFirestore(paymentId);
      showFeedback("Student course payment approved! Full premium curriculum access unlocked.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handleApprovePayment = approvePayment;

  const rejectPayment = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to reject this payment request? This will revoke the student's access to this course!")) return;
    setSyncing(true);
    try {
      await rejectPaymentInFirestore(paymentId);
      showFeedback("Student course payment request rejected and access revoked.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  const handleRejectPayment = rejectPayment;

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this payment request? This cannot be undone!")) return;
    setSyncing(true);
    try {
      await deletePaymentRequest(paymentId);
      showFeedback("Payment request successfully deleted.");
      await fetchAllData();
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setSyncing(false);
    }
  };

  // ==========================================
  // SIDEBAR CONFIGURATION
  // ==========================================
  const menuItems = [
    { id: "overview", label: "Dashboard Hub", icon: LayoutDashboard },
    { id: "playlists", label: "Playlists & Lectures", icon: Layers },
    { id: "playlist-management", label: "Playlist Management", icon: Settings },
    { id: "books", label: "Reference Books", icon: BookOpen },
    { id: "tests", label: "Mock Test Sheets", icon: Award },
    { id: "payments", label: "UPI Course Payments", icon: DollarSign },
    { id: "students", label: "Student Registry", icon: Users },
  ];

  // ==========================================
  // CORE LAYOUT RENDERS
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900 flex flex-col lg:flex-row relative">
      
      {/* 1. MOBILE DRAWER TRIGGER */}
      <div className="lg:hidden bg-navy-950 text-white flex justify-between items-center px-4 py-3 border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {onGoHome && (
            <button 
              onClick={onGoHome} 
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent-gold hover:bg-white/10 transition cursor-pointer"
              title="Go Home"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
          <span className="font-display font-extrabold text-sm tracking-tight">SURAJ SIR ADMIN</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. ADMIN SIDEBAR persistent */}
      <aside className={`lg:w-72 shrink-0 bg-navy-950 text-white flex flex-col justify-between p-6 z-30 fixed lg:sticky top-0 h-screen transition-all duration-300 ${
        mobileMenuOpen ? "left-0 w-80 max-w-[85vw]" : "-left-80 lg:left-0"
      }`}>
        <div className="space-y-8 flex-1 flex flex-col">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-gold p-0.5 flex items-center justify-center shadow-lg shadow-primary-500/10 shrink-0">
              <div className="flex items-center justify-center w-full h-full rounded-[9px] bg-navy-950">
                <Settings className="w-5 h-5 text-accent-gold" />
              </div>
            </div>
            <div>
              <h2 className="font-display font-black text-sm sm:text-base tracking-tight leading-tight">
                SURAJ SIR EDUCATION
              </h2>
              <span className="text-[10px] tracking-widest font-bold text-accent-gold uppercase block">
                Control Console
              </span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-full flex items-center gap-3 p-3 mb-2 rounded-xl text-xs font-bold tracking-wide transition-all text-accent-gold bg-white/5 border border-accent-gold/20 hover:bg-accent-gold/10 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Main Home</span>
              </button>
            )}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isPayments = item.id === "payments";
              const pendingCount = isPayments ? payments.filter(p => p.status === "Pending").length : 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-accent-gold to-yellow-500 text-navy-950 shadow-md shadow-accent-gold/10 scale-[1.02]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full ring-2 ring-navy-950">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer with verified credentials & logout */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-accent-gold text-navy-950 flex items-center justify-center text-xs font-bold font-display">
                SS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold leading-tight truncate">Faculty Admin</p>
                <span className="text-[10px] text-gray-400 truncate block font-light">{email}</span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600/10 hover:bg-primary-600/20 text-primary-400 rounded-xl text-xs sm:text-sm font-bold border border-primary-500/20 transition cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-primary-400" />
              <span>Switch to Student Console</span>
            </button>
          </div>

        </div>
      </aside>

      {/* 3. CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 xl:p-12 overflow-y-auto max-w-[100vw] lg:max-w-[calc(100vw-18rem)]">
        
        {/* Alerts / Feedback Banner inside content area */}
        <AnimatePresence mode="wait">
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm"
            >
              <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm"
            >
              <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-red-100 text-red-700 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic section rendering based on activeTab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-950">
                Academy Admin Center
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Comprehensive overview of portal parameters, databases, and quick upload links.</p>
            </div>

            {/* Metric widgets grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Students</span>
                  <p className="text-2xl font-black text-navy-950 font-display">{students.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Playlists</span>
                  <p className="text-2xl font-black text-navy-950 font-display">{playlists.length}</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-accent-gold shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Mock Exams</span>
                  <p className="text-2xl font-black text-navy-950 font-display">{tests.length}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Reference Books</span>
                  <p className="text-2xl font-black text-navy-950 font-display">{books.length}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer hover:border-red-200 transition" onClick={() => setActiveTab("payments")}>
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Pending Pay</span>
                  <p className="text-2xl font-black text-red-600 font-display">{payments.filter(p => p.status === "Pending").length}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Upload Portal & shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-display font-bold text-base text-navy-950">Rapid Management Shortcuts</h3>
                <p className="text-xs text-gray-400 font-light leading-normal">Instantly open upload dialogues to publish content on the Student Dashboard terminal without switching tabs.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <button
                    onClick={() => { setActiveTab("playlists"); handleOpenPlaylistModal(); }}
                    className="py-3 px-4 bg-slate-50 border border-gray-150 rounded-2xl hover:bg-amber-50 hover:border-accent-gold/40 text-xs font-bold flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-accent-gold" />
                    <span>Create Playlist</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("books"); handleOpenBookModal(); }}
                    className="py-3 px-4 bg-slate-50 border border-gray-150 rounded-2xl hover:bg-indigo-50 hover:border-indigo-250 text-xs font-bold flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>Register New Book</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("tests"); handleOpenTestModal(); }}
                    className="py-3 px-4 bg-slate-50 border border-gray-150 rounded-2xl hover:bg-emerald-50 hover:border-emerald-250 text-xs font-bold flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Publish Mock Test</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("students"); }}
                    className="py-3 px-4 bg-slate-50 border border-gray-150 rounded-2xl hover:bg-blue-50 hover:border-blue-250 text-xs font-bold flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>View Student List</span>
                  </button>
                </div>
              </div>

              {/* Portal Diagnostics / Logs */}
              <div className="bg-gradient-to-br from-navy-950 to-navy-900 border border-white/5 p-6 rounded-3xl text-white space-y-4 shadow-xl">
                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <h3 className="font-display font-bold text-sm text-accent-gold">System Health Diagnostics</h3>
                  <span className="text-[9px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">SSE Safe Mode</span>
                </div>
                
                <div className="space-y-3 text-xs leading-normal font-light">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database Engine:</span>
                    <span className="font-semibold text-accent-gold">Dual-Engine (MongoDB / File DB)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Playlists Loaded:</span>
                    <span className="font-semibold">{playlists.length} Catalogued</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Academic Records:</span>
                    <span className="font-semibold text-emerald-400">Database Synchronized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Portal Security Key:</span>
                    <span className="font-mono text-[11px] text-gray-400">JWT-256 HMAC SECURED</span>
                  </div>
                </div>

                <div className="pt-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-400 font-medium">Any content added, edited, or deleted in this management terminal will automatically update the core Student Dashboard instantaneously.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAYLISTS & LECTURES MANAGEMENT TAB */}
        {activeTab === "playlists" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">Playlists & Lecture Syllabus</h2>
                <p className="text-xs text-gray-500">Upload video playlists, edit syllabus description, and bind nested video lecture IDs.</p>
              </div>
              <button
                onClick={() => handleOpenPlaylistModal()}
                className="py-2 px-4 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Playlist</span>
              </button>
            </div>

            {/* Playlists grid displaying CRUD & video listing */}
            <div className="space-y-8">
              {playlists.map((pl) => (
                <div key={pl.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm p-6 space-y-6">
                  {/* Playlist Header Controls */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-55 border-gray-50">
                    <div className="flex items-start sm:items-center gap-4">
                      <img src={pl.thumbnail} alt="" className="w-16 h-10 object-cover rounded-lg shrink-0 border border-gray-150" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-extrabold text-sm sm:text-base text-navy-950">{pl.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            (pl.classLevel === "Class 10" || pl.classLevel === "10th")
                              ? "bg-purple-100 text-purple-700 border border-purple-200" 
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}>
                            {pl.classLevel || "Class 12"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{pl.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenVideoModal(pl)}
                        className="py-1.5 px-3 bg-primary-50 border border-primary-100 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Lecture Video
                      </button>
                      <button
                        onClick={() => handleOpenPlaylistModal(pl)}
                        className="py-1.5 px-3 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Metadata
                      </button>
                      <button
                        onClick={() => handlePlaylistDelete(pl.id)}
                        className="py-1.5 px-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Purge
                      </button>
                    </div>
                  </div>

                  {/* Inside video lectures of playlist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-navy-950 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-accent-gold" /> Included Video Lectures ({pl.videos?.length || 0})
                    </h4>
                    
                    {(!pl.videos || pl.videos.length === 0) ? (
                      <p className="text-xs text-gray-400 font-light italic">No lecture videos bound to this playlist yet. Click "Add Lecture Video" to start uploading.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pl.videos.map((vid) => (
                          <div key={vid.id} className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h5 className="text-xs sm:text-sm font-bold text-navy-950 leading-tight">{vid.title}</h5>
                              <p className="text-xs text-gray-400 line-clamp-1">{vid.description}</p>
                              <div className="flex gap-3 text-[10px] text-gray-400 font-medium">
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-150">
                                  {vid.embedCode ? `YouTube: ${vid.embedCode}` : `Direct File: ${vid.videoUrl ? "Uploaded" : "None"}`}
                                </span>
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-150 font-bold">Duration: {vid.duration}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenVideoModal(pl, vid)}
                                className="p-1.5 bg-white border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600 transition cursor-pointer"
                                title="Edit Lecture Video"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleVideoDelete(pl.id, vid.id)}
                                className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg text-red-600 transition cursor-pointer"
                                title="Delete Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYLIST MANAGEMENT TAB */}
        {activeTab === "playlist-management" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">Playlist Management</h2>
              <p className="text-xs text-gray-500">Manage video lectures for the free Class 10th and Class 12th coaching batches.</p>
            </div>

            {/* Split layout: Form on Left, Saved Videos List on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Container (5/12 columns) */}
              <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display font-bold text-sm text-navy-950 uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-accent-gold" />
                    {pmEditingVideoId ? "Edit Lecture Video" : "Add Lecture Video"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Fill in the fields below to register or update a video inside Firebase Firestore.</p>
                </div>

                <form onSubmit={handlePmSaveVideo} className="space-y-4">
                  {/* Playlist Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">Playlist Selection *</label>
                    <select
                      value={pmPlaylistSelection}
                      onChange={(e) => setPmPlaylistSelection(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:border-accent-gold/40 cursor-pointer"
                    >
                      <option value="class-10-free-batch">Class 10th Free Batch</option>
                      <option value="class-12-free-batch">Class 12th Free Batch</option>
                    </select>
                  </div>

                  {/* Video Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">Video Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Real Numbers & Arithmetic Progression"
                      value={pmVideoTitle}
                      onChange={(e) => setPmVideoTitle(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-gold/40"
                    />
                  </div>

                  {/* YouTube Video URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">YouTube Video URL *</label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={pmYoutubeUrl}
                      onChange={(e) => setPmYoutubeUrl(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-gold/40"
                    />
                  </div>

                  {/* Video Description (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">Video Description (Optional)</label>
                    <textarea
                      placeholder="e.g. Chapter 1 full explanation, exercises, board solutions."
                      value={pmVideoDescription}
                      onChange={(e) => setPmVideoDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-gold/40 resize-none"
                    />
                  </div>

                  {/* Subject Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">Subject *</label>
                    <select
                      value={pmSubject}
                      onChange={(e) => setPmSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-navy-900 focus:outline-none focus:border-accent-gold/40 cursor-pointer"
                    >
                      <option value="Science">🧪 Science</option>
                      <option value="Mathematics">📐 Mathematics</option>
                    </select>
                  </div>

                  {/* Thumbnail URL (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 block">Thumbnail URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/... or base64 image data"
                      value={pmThumbnailUrl}
                      onChange={(e) => setPmThumbnailUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-gold/40"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={syncing}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>{pmEditingVideoId ? "Update Video" : "Save Video"}</span>
                    </button>
                    {pmEditingVideoId && (
                      <button
                        type="button"
                        onClick={handlePmCancelEdit}
                        className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Organized Videos List Container (7/12 columns) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Playlist 1: Class 10th Free Batch */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-navy-950">
                        Class 10th Free Batch Videos
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold border border-purple-100">
                      {(playlists.find(p => p.id === "class-10-free-batch")?.videos?.length || 0)} Lectures
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {!(playlists.find(p => p.id === "class-10-free-batch")?.videos?.length) ? (
                      <p className="text-xs text-gray-400 italic py-4 text-center">No video lectures registered yet under Class 10th Free Batch.</p>
                    ) : (
                      playlists.find(p => p.id === "class-10-free-batch")?.videos?.map((vid) => (
                        <div key={vid.id} className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex justify-between items-center gap-4 hover:border-purple-200 transition">
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-navy-950 truncate">{vid.title}</h4>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{vid.description || "No description provided."}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 truncate">
                                YouTube: {vid.embedCode}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handlePmEditVideo("class-10-free-batch", vid)}
                              className="p-1.5 bg-white border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600 transition cursor-pointer"
                              title="Edit Video"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePmDeleteVideo("class-10-free-batch", vid.id)}
                              className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg text-red-600 transition cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Playlist 2: Class 12th Free Batch */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-navy-950">
                        Class 12th Free Batch Videos
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                      {(playlists.find(p => p.id === "class-12-free-batch")?.videos?.length || 0)} Lectures
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {!(playlists.find(p => p.id === "class-12-free-batch")?.videos?.length) ? (
                      <p className="text-xs text-gray-400 italic py-4 text-center">No video lectures registered yet under Class 12th Free Batch.</p>
                    ) : (
                      playlists.find(p => p.id === "class-12-free-batch")?.videos?.map((vid) => (
                        <div key={vid.id} className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex justify-between items-center gap-4 hover:border-blue-200 transition">
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-navy-950 truncate">{vid.title}</h4>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{vid.description || "No description provided."}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 truncate">
                                YouTube: {vid.embedCode}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handlePmEditVideo("class-12-free-batch", vid)}
                              className="p-1.5 bg-white border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600 transition cursor-pointer"
                              title="Edit Video"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handlePmDeleteVideo("class-12-free-batch", vid.id)}
                              className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg text-red-600 transition cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* BOOKS Tab */}
        {activeTab === "books" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">Reference Study Books</h2>
                <p className="text-xs text-gray-500">Configure book pricing, inventory stock availability, image urls, and cheat sheets description.</p>
              </div>
              <button
                onClick={() => handleOpenBookModal()}
                className="py-2 px-4 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Book</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((bk) => (
                <div key={bk.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <img src={bk.image} alt={bk.name} className="w-full h-40 object-cover rounded-2xl border border-gray-100 shrink-0" />
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-navy-950 leading-snug">{bk.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">{bk.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs sm:text-sm">
                    <div className="space-y-0.5">
                      <span className="text-xs text-gray-400 font-medium block">Price & Stock</span>
                      <p className="font-bold text-navy-950">₹{bk.price} <span className="font-light text-gray-400 text-xs">({bk.quantity} units left)</span></p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenBookModal(bk)}
                        className="p-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-600 rounded-xl transition cursor-pointer"
                        title="Edit Book Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBookDelete(bk.id)}
                        className="p-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TESTS Tab */}
        {activeTab === "tests" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">Mock Test Papers</h2>
                <p className="text-xs text-gray-500">Publish custom mock test worksheets, insert multiple options, specify answer keys, and set time limits.</p>
              </div>
              <button
                onClick={() => handleOpenTestModal()}
                className="py-2 px-4 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Mock Test</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tests.map((tst) => (
                <div key={tst.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-widest text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full uppercase">
                          {tst.subject}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">Duration: {tst.duration} mins</span>
                      </div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-navy-950">{tst.title}</h3>
                      <p className="text-xs text-gray-400 font-light">{tst.questions?.length || 0} Multiple-Choice Questions</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        onClick={() => handleTestPublishToggle(tst)}
                        className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          (tst as any).published !== false
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-150"
                        }`}
                      >
                        {(tst as any).published !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{(tst as any).published !== false ? "Published" : "Unpublished"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenTestModal(tst)}
                        className="py-1.5 px-3 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Test
                      </button>

                      <button
                        onClick={() => handleTestDelete(tst.id)}
                        className="py-1.5 px-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENTS Tab */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">UPI Course Payments</h2>
              <p className="text-xs text-gray-500">Verify screenshots and UPI transaction IDs submitted by students to unlock Class 10 or Class 12 video course resources.</p>
            </div>

            <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-150">
                      <th className="p-4 pl-6">Student Name & Email</th>
                      <th className="p-4">Assigned Course</th>
                      <th className="p-4">Paid Amount</th>
                      <th className="p-4">UPI Transaction ID</th>
                      <th className="p-4">Screenshot Proof</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Verification Status</th>
                      <th className="p-4 pr-6 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-navy-900 font-semibold">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-gray-400 font-medium">
                          No course payment requests received yet.
                        </td>
                      </tr>
                    ) : (
                      [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((p) => {
                        return (
                          <tr key={p.id || p._id} className="hover:bg-slate-50/50 transition">
                            {/* Student Details */}
                            <td className="p-4 pl-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-navy-900 text-sm">{p.studentName || "Student"}</span>
                                <span className="text-xs text-gray-400 font-normal mt-0.5">{p.studentEmail}</span>
                              </div>
                            </td>

                            {/* Assigned Course */}
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                                {p.courseType}
                              </span>
                            </td>

                            {/* Paid Amount */}
                            <td className="p-4">
                              <span className="font-extrabold text-navy-950">₹{p.amount}</span>
                            </td>

                            {/* UPI Transaction ID */}
                            <td className="p-4">
                              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                {p.transactionId || "N/A"}
                              </span>
                            </td>

                            {/* Screenshot Proof */}
                            <td className="p-4">
                              {p.screenshotUrl ? (
                                <a 
                                  href={p.screenshotUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 hover:underline"
                                >
                                  <img 
                                    src={p.screenshotUrl} 
                                    alt="Screenshot Proof" 
                                    className="w-12 h-12 rounded object-cover border border-gray-200 shadow-xs cursor-zoom-in"
                                  />
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs italic">No image uploaded</span>
                              )}
                            </td>

                            {/* Created Date */}
                            <td className="p-4 text-xs text-gray-500 font-normal">
                              {new Date(p.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              {p.status === "Pending" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Pending Review
                                </span>
                              )}
                              {p.status === "Approved" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Approved
                                </span>
                              )}
                              {p.status === "Rejected" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 rounded-full text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  Rejected
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {p.status !== "Approved" && (
                                  <button
                                    onClick={() => approvePayment(p.id || p._id || "")}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs animate-fade-in"
                                    title="Approve payment and unlock course"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                )}
                                {p.status !== "Rejected" && (
                                  <button
                                    onClick={() => rejectPayment(p.id || p._id || "")}
                                    className="py-1.5 px-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer animate-fade-in"
                                    title="Reject payment and revoke course access"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject / Revoke
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeletePayment(p.id || p._id || "")}
                                  className="py-1.5 px-2 bg-slate-50 border border-gray-200 hover:bg-slate-100 text-slate-500 hover:text-red-600 rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer"
                                  title="Permanently delete payment record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS Tab */}
        {activeTab === "students" && (() => {
          const filteredStudents = students.filter(student => {
            const q = studentSearch.toLowerCase().trim();
            if (!q) return true;
            return (student.name || "").toLowerCase().includes(q) || (student.email || "").toLowerCase().includes(q);
          });
          
          return (
            <div className="space-y-6 animate-fade-in">
              {/* Header and Search control */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">Student Registry</h2>
                  <p className="text-xs text-gray-500">Audit registered students credentials, account status, and Google access parameters.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition"
                  />
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 p-5 rounded-3xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-primary-600 uppercase block mb-1">Database Stats</span>
                  <h3 className="font-display text-lg sm:text-xl font-black text-navy-950">
                    {filteredStudents.length} of {students.length} Student Records
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Total credentials registered in Suraj Sir Portal databases.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-primary-600/10 font-display">
                  {students.length}
                </div>
              </div>

              {/* Table list */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                        <th className="p-4 pl-6">Profile</th>
                        <th className="p-4">Full Name & Email</th>
                        <th className="p-4">First Login Date</th>
                        <th className="p-4">Last Active Timestamp</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-navy-900 font-semibold">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                            No registered students found matching your query.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student, i) => {
                          const isStudentActive = student.isActive !== false;
                          return (
                            <tr key={i} className="hover:bg-slate-50/50 transition">
                              {/* Profile Photo */}
                              <td className="p-4 pl-6">
                                {student.photoUrl ? (
                                  <img 
                                    referrerPolicy="no-referrer"
                                    src={student.photoUrl} 
                                    alt={student.name} 
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/10" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-display text-sm font-extrabold ring-2 ring-primary-500/10">
                                    {student.name ? student.name.charAt(0) : "S"}
                                  </div>
                                )}
                              </td>

                              {/* Full Name & Email */}
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-navy-900 text-sm">{student.name || "Unnamed Student"}</span>
                                  <span className="text-xs text-gray-400 font-normal mt-0.5">{student.email}</span>
                                </div>
                              </td>

                              {/* First Login Date */}
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-700 font-semibold">
                                    {student.loginDateTime || student.joinedDate || "Never logged in"}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-normal mt-0.5">Google Access Sync</span>
                                </div>
                              </td>

                              {/* Last Active Timestamp */}
                              <td className="p-4">
                                <span className="text-xs text-gray-600 font-medium">{student.lastActiveTime || "Never active"}</span>
                              </td>

                              {/* Status badge */}
                              <td className="p-4">
                                {isStudentActive ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 rounded-full text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    Inactive
                                  </span>
                                )}
                              </td>

                              {/* Controls */}
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleToggleStudentStatus(student.email, isStudentActive)}
                                    className={`py-1.5 px-3 border rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                      isStudentActive 
                                        ? "bg-amber-50 border-amber-100 hover:bg-amber-100 text-amber-700" 
                                        : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700"
                                    }`}
                                  >
                                    {isStudentActive ? "Deactivate" : "Activate"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(student.email)}
                                    className="py-1.5 px-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

      </main>

      {/* ==========================================
          ADMIN EDIT MODAL DIALOGS (DYNAMIC POPUPS)
          ========================================== */}

      {/* A. PLAYLIST MODAL */}
      <AnimatePresence>
        {playlistModalOpen && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="font-display font-black text-navy-950 text-base sm:text-lg">
                  {editingPlaylist ? "Edit Playlist Metadata" : "Create Learning Playlist"}
                </h3>
                <button onClick={() => setPlaylistModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePlaylistSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Playlist Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Integral Calculus Shortcuts"
                    value={playlistForm.title}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Class Level Assignment</label>
                    <select
                      value={playlistForm.classLevel}
                      onChange={(e) => setPlaylistForm({ ...playlistForm, classLevel: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition text-xs font-bold text-navy-950"
                    >
                      <option value="Class 10">Class 10 (₹599)</option>
                      <option value="Class 12">Class 12 (₹999)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Upload Thumbnail File</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingFile}
                      onChange={(e) => handleFileUpload(e, "thumbnail")}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition cursor-pointer"
                    />
                    {uploadingFile && <span className="text-[10px] text-amber-600 animate-pulse font-medium">Uploading...</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Thumbnail Image URL (or preset)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={playlistForm.thumbnail}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, thumbnail: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                  <div className="flex gap-2 pt-1 font-medium text-[10px] text-gray-400 flex-wrap">
                    <span>Quick presets:</span>
                    <button type="button" onClick={() => setPlaylistForm({ ...playlistForm, thumbnail: presetImages.physics })} className="hover:text-accent-gold underline">Physics</button>
                    <button type="button" onClick={() => setPlaylistForm({ ...playlistForm, thumbnail: presetImages.math })} className="hover:text-accent-gold underline">Math</button>
                    <button type="button" onClick={() => setPlaylistForm({ ...playlistForm, thumbnail: presetImages.chemistry })} className="hover:text-accent-gold underline">Chemistry</button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Short Overview Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what subjects or proofs Suraj Sir teaches inside this specific course batch syllabus..."
                    value={playlistForm.description}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setPlaylistModalOpen(false)}
                    className="py-2 px-4 rounded-xl border border-gray-200 hover:bg-slate-50 font-bold text-gray-500 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={syncing || uploadingFile}
                    className="py-2 px-5 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 font-bold text-xs shadow-sm transition disabled:opacity-70 cursor-pointer"
                  >
                    {syncing ? "Compiling..." : editingPlaylist ? "Update Playlist" : "Create Playlist"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. VIDEO LECTURE MODAL */}
      <AnimatePresence>
        {videoModalOpen && selectedPlaylistForVideos && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-display font-black text-navy-950 text-base sm:text-lg">
                    {editingVideo ? "Modify Lecture Video" : "Upload Video Lecture"}
                  </h3>
                  <p className="text-[10px] text-gray-400">Appending inside: {selectedPlaylistForVideos.title}</p>
                </div>
                <button onClick={() => setVideoModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleVideoSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Lecture Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lecture 5: Solving pulley friction vector proofs"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Duration (Mins:Secs)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 28:15"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">YouTube Video Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 6iS-lOqWeqE"
                      value={videoForm.embedCode}
                      onChange={(e) => setVideoForm({ ...videoForm, embedCode: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Subject</label>
                  <select
                    value={videoForm.subject}
                    onChange={(e) => setVideoForm({ ...videoForm, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition cursor-pointer text-xs sm:text-sm text-navy-900"
                  >
                    <option value="Science">🧪 Science</option>
                    <option value="Mathematics">📐 Mathematics</option>
                  </select>
                </div>

                <div className="border border-dashed border-gray-200 p-4 rounded-xl space-y-3 bg-slate-50/50">
                  <span className="text-xs font-bold text-navy-950 block">OR: Direct Video File Upload</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 block">Select Video File (.mp4, etc)</label>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={uploadingFile}
                      onChange={(e) => handleFileUpload(e, "videoUrl")}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition cursor-pointer"
                    />
                    {uploadingFile && <span className="text-[10px] text-amber-600 animate-pulse font-medium block mt-1">Uploading video file...</span>}
                  </div>

                  {videoForm.videoUrl && (
                    <div className="text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100 flex items-center justify-between gap-2">
                      <span className="truncate font-medium">Uploaded path: {videoForm.videoUrl}</span>
                      <button type="button" onClick={() => setVideoForm((v) => ({ ...v, videoUrl: "" }))} className="text-red-500 hover:text-red-700 font-bold">Clear</button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Lecture Supplementary Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide short detailed summaries of equations and concepts taught in this lecture..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setVideoModalOpen(false)}
                    className="py-2 px-4 rounded-xl border border-gray-200 hover:bg-slate-50 font-bold text-gray-500 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={syncing || uploadingFile}
                    className="py-2 px-5 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 font-bold text-xs shadow-sm transition disabled:opacity-70 cursor-pointer"
                  >
                    {syncing ? "Compiling..." : editingVideo ? "Update Lecture" : "Add Lecture Video"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. BOOK MODAL */}
      <AnimatePresence>
        {bookModalOpen && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="font-display font-black text-navy-950 text-base sm:text-lg">
                  {editingBook ? "Edit Reference Book Details" : "Register Study Reference Book"}
                </h3>
                <button onClick={() => setBookModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Book Name / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calculus Mastery Cheat Sheets"
                    value={bookForm.name}
                    onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Retail Price (₹ Rupees)</label>
                    <input
                      type="number"
                      required
                      value={bookForm.price}
                      onChange={(e) => setBookForm({ ...bookForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Available Stock quantity</label>
                    <input
                      type="number"
                      required
                      value={bookForm.quantity}
                      onChange={(e) => setBookForm({ ...bookForm, quantity: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Reference Book Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={bookForm.image}
                    onChange={(e) => setBookForm({ ...bookForm, image: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                  <button type="button" onClick={() => setBookForm({ ...bookForm, image: presetImages.book })} className="text-[10px] text-gray-400 hover:text-accent-gold underline font-medium block pt-1">Autofill standard book mock thumbnail URL</button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-800 block">Description & syllabus content</label>
                  <textarea
                    rows={3}
                    placeholder="Describe speed-solving shortcut chapters or worksheets compiled inside..."
                    value={bookForm.description}
                    onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setBookModalOpen(false)}
                    className="py-2 px-4 rounded-xl border border-gray-200 hover:bg-slate-50 font-bold text-gray-500 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={syncing}
                    className="py-2 px-5 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 font-bold text-xs shadow-sm transition disabled:opacity-70 cursor-pointer"
                  >
                    {syncing ? "Saving..." : editingBook ? "Update Book" : "Register Book"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. TEST PAPER MODAL */}
      <AnimatePresence>
        {testModalOpen && (
          <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-2xl border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="font-display font-black text-navy-950 text-base sm:text-lg">
                  {editingTest ? "Edit Mock Test Sheet" : "Publish Mock Test Paper"}
                </h3>
                <button onClick={() => setTestModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-gray-400 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTestSubmit} className="space-y-6 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Mock Test Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pulley Vector Mechanics Quiz"
                      value={testForm.title}
                      onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Subject Topic</label>
                    <select
                      value={testForm.subject}
                      onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy-800 block">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      value={testForm.duration}
                      onChange={(e) => setTestForm({ ...testForm, duration: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-accent-gold transition"
                    />
                  </div>
                </div>

                {/* Question compiler box */}
                <div className="border border-gray-150 rounded-2xl p-4 sm:p-5 space-y-4 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wide">MCQ Question Builder</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">Question Prompt</label>
                      <input
                        type="text"
                        placeholder="e.g. Which of the following is conservative?"
                        value={questionBuilder.question}
                        onChange={(e) => setQuestionBuilder({ ...questionBuilder, question: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {questionBuilder.options.map((opt, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 block">Option {idx + 1}</label>
                          <input
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const optsCopy = [...questionBuilder.options];
                              optsCopy[idx] = e.target.value;
                              setQuestionBuilder({ ...questionBuilder, options: optsCopy });
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 gap-4">
                      <div className="space-y-1 shrink-0">
                        <label className="text-[10px] font-bold text-gray-500 block">Correct Option index</label>
                        <select
                          value={questionBuilder.correct}
                          onChange={(e) => setQuestionBuilder({ ...questionBuilder, correct: Number(e.target.value) })}
                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg outline-none"
                        >
                          <option value={0}>Option 1 (Index 0)</option>
                          <option value={1}>Option 2 (Index 1)</option>
                          <option value={2}>Option 3 (Index 2)</option>
                          <option value={3}>Option 4 (Index 3)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuestionToTest}
                        className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Compile Question
                      </button>
                    </div>
                  </div>
                </div>

                {/* List compiled questions */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-navy-950 uppercase tracking-wider">Compiled Questions list ({testForm.questions.length})</h4>
                  {testForm.questions.length === 0 ? (
                    <p className="text-xs text-gray-400 font-light italic">No compiled questions in this exam sheet yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {testForm.questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex justify-between items-center gap-4 text-xs font-semibold text-navy-900">
                          <p className="line-clamp-1 flex-1 leading-tight"><span className="font-mono text-gray-400 font-bold mr-1">{qIdx + 1}.</span> {q.question}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionFromTest(q.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                            title="Remove Question"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setTestModalOpen(false)}
                    className="py-2 px-4 rounded-xl border border-gray-200 hover:bg-slate-50 font-bold text-gray-500 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={syncing}
                    className="py-2 px-5 rounded-xl bg-accent-gold hover:bg-amber-500 text-navy-950 font-bold text-xs shadow-sm transition disabled:opacity-70 cursor-pointer"
                  >
                    {syncing ? "Publishing..." : editingTest ? "Update Mock Exam" : "Publish Mock Exam"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
