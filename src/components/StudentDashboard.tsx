import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Video, 
  BookOpen, 
  Award, 
  User, 
  Menu, 
  X, 
  Bell, 
  Search, 
  GraduationCap, 
  BookOpenCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

import { StudentProfile } from "../types";
import HomeTab from "./dashboard/HomeTab";
import VideosTab from "./dashboard/VideosTab";
import BooksTab from "./dashboard/BooksTab";
import TestsTab from "./dashboard/TestsTab";
import ProfileTab from "./dashboard/ProfileTab";
import { getStudentProfile, createOrUpdateStudentProfileOnLogin, updateStudentProfile } from "../lib/firebase";

interface StudentDashboardProps {
  email: string;
  onLogout: () => void;
  onGoHome?: () => void;
}

export default function StudentDashboard({ email, onLogout, onGoHome }: StudentDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Student Profile representational state (can be modified in ProfileTab)
  const [profile, setProfile] = useState<StudentProfile>({
    name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
    email: email,
    studentId: "SSE-2026-9842",
    joinedDate: "Mar 12, 2026",
    batch: "JEE Elite Masterclass Class XII",
    attendance: "96.4%",
    streak: 5,
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await getStudentProfile(email);
        if (data) {
          setProfile({
            name: data.name,
            email: data.email,
            studentId: data.studentId,
            joinedDate: data.joinedDate,
            batch: data.batch || "Google Batch Class",
            attendance: data.attendance || "100.0%",
            streak: data.streak || 1,
            photoUrl: data.photoUrl,
            loginDateTime: data.loginDateTime,
            lastActiveTime: data.lastActiveTime,
            isActive: data.isActive
          });
        } else {
          const newProfile = await createOrUpdateStudentProfileOnLogin({
            email,
            name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
          });
          setProfile(newProfile);
        }
      } catch (err) {
        console.error("Failed to fetch student details on mount", err);
      }
    };
    fetchMe();
  }, [email]);

  const handleUpdateProfile = async (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    try {
      await updateStudentProfile(email, updated);
    } catch (err) {
      console.error("Failed to persist updated profile in Firestore:", err);
    }
  };

  const navItems = [
    { id: "home", label: "Home Base", icon: Home, badge: null },
    { id: "videos", label: "Video Batches", icon: Video, badge: "New" },
    { id: "books", label: "Reference Books", icon: BookOpen, badge: null },
    { id: "tests", label: "Mock Tests", icon: Award, badge: "Active" },
    { id: "profile", label: "My Profile", icon: User, badge: null },
  ];

  const notifications = [
    { id: 1, text: "Suraj Sir posted Lecture 4 on Work-Energy Theorem.", time: "10m ago", read: false },
    { id: 2, text: "Maths Limits & Differentiation Test is scheduled.", time: "2h ago", read: false },
    { id: 3, text: "Your ordered Calculus study worksheets are ready to collect.", time: "1d ago", read: true },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab profile={profile} onNavigateToTab={(tab) => setActiveTab(tab)} />;
      case "videos":
        return <VideosTab onGoHome={onGoHome} />;
      case "books":
        return <BooksTab email={profile.email} />;
      case "tests":
        return <TestsTab email={profile.email} />;
      case "profile":
        return <ProfileTab profile={profile} onUpdateProfile={handleUpdateProfile} />;
      default:
        return <HomeTab profile={profile} onNavigateToTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy-900 flex flex-col lg:flex-row relative">
      
      {/* 1. RESPONSIVE SIDEBAR DRAWER (Desktop persistent, mobile toggleable) */}
      
      {/* Mobile Drawer Trigger Bar */}
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
          <span className="font-display font-extrabold text-sm tracking-tight">SURAJ SIR CAMPUS</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications ring badge */}
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Actual Sidebar layout */}
      <aside className={`lg:w-72 shrink-0 bg-navy-950 text-white flex flex-col justify-between p-6 z-30 fixed lg:sticky top-0 h-screen transition-all duration-300 ${
        mobileMenuOpen ? "left-0 w-80 max-w-[85vw]" : "-left-80 lg:left-0"
      }`}>
        <div className="space-y-8 flex-1 flex flex-col">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-gold p-0.5 flex items-center justify-center shadow-lg shadow-primary-500/10 shrink-0">
              <div className="flex items-center justify-center w-full h-full rounded-[9px] bg-navy-950">
                <BookOpen className="w-5 h-5 text-accent-gold" />
              </div>
            </div>
            <div>
              <h2 className="font-display font-black text-sm sm:text-base tracking-tight leading-tight">
                SURAJ SIR EDUCATION
              </h2>
              <span className="text-[10px] tracking-widest font-bold text-primary-300 uppercase block">
                Scholar Console
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false); // Close mobile drawer
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-600/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isActive ? "bg-white/15 text-white" : "bg-primary-900/40 text-primary-300 border border-primary-500/15"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Current login Profile Summary block */}
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
            {profile.photoUrl ? (
              <img 
                referrerPolicy="no-referrer"
                src={profile.photoUrl} 
                alt={profile.name} 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 shrink-0" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-900 border border-primary-500/20 text-accent-gold flex items-center justify-center font-bold text-sm font-display shrink-0">
                {profile.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{profile.name}</p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Switch dashboard mode bottom bar */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400 transition text-xs font-bold text-gray-400 cursor-pointer"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-accent-gold" />
            <span>Switch to Admin Control</span>
          </button>
        </div>
      </aside>

      {/* Dimmed mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs z-20 lg:hidden"
        />
      )}

      {/* 2. MAIN APPLICATION WORKSPACE COLUMN */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        
        {/* Top Navbar details */}
        <header className="relative bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm hidden lg:flex">
          
          {/* Breadcrumb search block */}
          <div className="flex items-center gap-4">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 shadow-sm active:scale-95 transition cursor-pointer"
                title="Return to Main Home"
              >
                <Home className="w-3.5 h-3.5 text-primary-600" />
                <span>Main Home</span>
              </button>
            )}
            <span className="text-gray-200">|</span>
            <span className="text-xs font-bold text-gray-400">BATCH CAMPUS</span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-xs text-primary-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
              <span>{profile.batch}</span>
            </div>
          </div>

          {/* Utility Tools */}
          <div className="flex items-center gap-4">
            
            {/* Notifications panel trigger */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl border border-gray-100 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-500 hover:text-navy-950 transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>

              {/* Notifications dropdown list */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-40" />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 space-y-3 z-50 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <span className="font-bold text-navy-900">Notifications</span>
                        <span className="text-[10px] text-primary-600 font-bold hover:underline cursor-pointer">Mark all read</span>
                      </div>
                      <div className="space-y-2">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-2 hover:bg-slate-50 rounded-lg transition-all border-b border-gray-50/50">
                            <p className="font-medium text-gray-800 leading-tight">{notif.text}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile status */}
            <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
              {profile.photoUrl ? (
                <img 
                  referrerPolicy="no-referrer"
                  src={profile.photoUrl} 
                  alt={profile.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-500/20 shrink-0" 
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-navy-900 text-accent-gold font-bold flex items-center justify-center text-xs font-display shrink-0">
                  {profile.name.charAt(0)}
                </div>
              )}
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-navy-950 block">{profile.name}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Online scholar</span>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Inner Tab Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveTabContent()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-6 py-4 text-center text-[11px] text-gray-400 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Suraj Sir Education. Dynamic Campus environment.</span>
            <div className="flex gap-4">
              <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-primary-600 transition">Online Desk Helpline</a>
              <span>•</span>
              <a href="#system" onClick={(e) => e.preventDefault()} className="hover:text-primary-600 transition">Integration Node v1.4.2</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
