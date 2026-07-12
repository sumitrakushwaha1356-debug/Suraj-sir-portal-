import { useState, useEffect } from "react";
import { GraduationCap, ShieldCheck, BookOpen, ArrowRight, Home } from "lucide-react";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import homepageImg from "./assets/images/homepage.png";

export default function App() {
  const [view, setView] = useState<"home" | "student" | "admin">("home");
  const [role, setRole] = useState<"student" | "admin">(() => {
    return (localStorage.getItem("role") as "student" | "admin") || "student";
  });

  useEffect(() => {
    localStorage.setItem("role", role);
    localStorage.setItem("email", role === "admin" ? "admin@surajsir.com" : "student@surajsir.com");
  }, [role]);

  const handleSwitchRole = (newRole: "student" | "admin") => {
    setRole(newRole);
  };

  // Shield against internal Firebase iframe/popup rejection/cancelled-popup-request errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason &&
        (reason.message?.includes("INTERNAL ASSERTION FAILED") ||
          reason.message?.includes("Pending promise was never set") ||
          reason.message?.includes("cancelled-popup-request") ||
          reason.message?.includes("popup-blocked"))
      ) {
        event.preventDefault();
        console.warn("Caught and suppressed Firebase iframe popup rejection:", reason);
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const errorMsg = event.message || "";
      const errorObj = event.error || {};
      if (
        errorMsg.includes("INTERNAL ASSERTION FAILED") ||
        errorMsg.includes("Pending promise was never set") ||
        errorObj.message?.includes("INTERNAL ASSERTION FAILED") ||
        errorObj.message?.includes("Pending promise was never set")
      ) {
        event.preventDefault();
        console.warn("Caught and suppressed Firebase iframe popup error:", event.error || errorMsg);
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  if (view === "admin") {
    return (
      <AdminDashboard
        email="admin@surajsir.com"
        onLogout={() => handleSwitchRole("student")}
        onGoHome={() => setView("home")}
      />
    );
  }

  if (view === "student") {
    return (
      <StudentDashboard
        email="student@surajsir.com"
        onLogout={() => handleSwitchRole("admin")}
        onGoHome={() => setView("home")}
      />
    );
  }

  // Beautiful Home / Hub Landing Page
  return (
    <div className="min-h-screen bg-slate-50 text-navy-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center relative z-10">
        
        {/* Split responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Title and Portal Cards (7/12 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Header / Logo */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-gold p-0.5 flex items-center justify-center shadow-md">
                  <div className="flex items-center justify-center w-full h-full rounded-[9px] bg-navy-950">
                    <BookOpen className="w-4 h-4 text-accent-gold" />
                  </div>
                </div>
                <span className="font-display font-extrabold text-sm tracking-tight text-navy-950">
                  SURAJ SIR EDUCATION
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-navy-950">
                  Suraj Sir Academy Portal
                </h1>
                <p className="text-sm sm:text-base text-gray-500 font-light leading-relaxed max-w-xl">
                  Welcome to the official learning gateway. Select a portal terminal below to get started with your exam preparation or administrative tasks.
                </p>
              </div>
            </div>

            {/* Portal cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              
              {/* Card 1: Student Portal */}
              <div 
                onClick={() => setView("student")}
                className="group bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors pointer-events-none" />
                
                <div className="space-y-4">
                  {/* Icon Container with beautiful background and halo */}
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition duration-300 shadow-inner">
                    <GraduationCap className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-navy-950 group-hover:text-primary-600 transition">
                      Student Portal
                    </h3>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                      Access live course lecture syllabi, read expert reference textbook solutions, check physical notices, and complete active mock test sheets.
                    </p>
                  </div>

                  {/* Bullet Features List */}
                  <ul className="space-y-1.5 border-t border-gray-50 pt-3 text-[11px] text-gray-500 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      <span>Class 10th & 12th Free Batches</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      <span>Syllabus-aligned Video Playlists</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      <span>Curated reference books & PDF sheets</span>
                    </li>
                  </ul>
                </div>

                <button className="w-full py-3 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-primary-600/15 transition duration-300 cursor-pointer">
                  <span>Enter Scholar Console</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition duration-300" />
                </button>
              </div>

              {/* Card 2: Admin Panel */}
              <div 
                onClick={() => setView("admin")}
                className="group bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:border-accent-amber/30 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-2xl group-hover:bg-accent-gold/10 transition-colors pointer-events-none" />
                
                <div className="space-y-4">
                  {/* Icon Container */}
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-accent-amber group-hover:scale-110 transition duration-300 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-navy-950 group-hover:text-accent-amber transition">
                      Admin Panel
                    </h3>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                      Manage online classes databases, register syllabus streams, add chapters, configure physical testing resources, and verify student registration payments.
                    </p>
                  </div>

                  {/* Bullet Features List */}
                  <ul className="space-y-1.5 border-t border-gray-50 pt-3 text-[11px] text-gray-500 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                      <span>Real-time lecture uploads & indexing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                      <span>UPI Payment verification triggers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                      <span>Student account deactivation panel</span>
                    </li>
                  </ul>
                </div>

                <button className="w-full py-3 px-5 rounded-2xl bg-navy-950 hover:bg-navy-900 border border-navy-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition duration-300 cursor-pointer">
                  <span>Enter Admin Control</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition duration-300 text-accent-gold" />
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Stunning Homepage Image frame (5/12 cols) */}
          <div className="lg:col-span-5 relative group w-full max-w-md mx-auto lg:max-w-none">
            {/* Back glowing ambient border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-accent-gold/20 rounded-[40px] blur-2xl group-hover:scale-105 transition duration-500" />
            
            <div className="relative bg-white border border-gray-100 p-4 rounded-[40px] shadow-xl hover:shadow-2xl transition duration-500">
              <div className="overflow-hidden rounded-[28px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] bg-slate-100 relative flex items-center justify-center">
                {/* Image element referring to the requested homepage.png path */}
                <img 
                  src={homepageImg} 
                  alt="Suraj Sir Academy Homepage" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 select-none"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fail-safe backdrop if image is empty or can't be decoded
                    e.currentTarget.style.opacity = "0.3";
                  }}
                />
                
                {/* Beautiful Modern Minimalistic overlay styling */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent flex flex-col justify-end p-8 text-white text-left">
                  <div className="bg-accent-gold text-navy-950 font-mono font-bold text-[10px] tracking-widest px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                    CAMPUS LEARNING
                  </div>
                  <h4 className="font-display font-black text-xl tracking-tight text-white leading-tight">
                    Smart Geography & General Science Solutions
                  </h4>
                  <p className="text-xs text-gray-200 font-light mt-2 leading-relaxed">
                    Access expert digital learning materials, syllabus maps, high-definition lecture playlists, and curated mock examinations directly from Suraj Sir's panel.
                  </p>
                  
                  {/* Subtle badges */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-300 font-medium">
                    <span className="px-2 py-0.5 rounded bg-white/10">10th Boards Prep</span>
                    <span className="px-2 py-0.5 rounded bg-white/10">12th Boards Prep</span>
                    <span className="px-2 py-0.5 rounded bg-white/10">Free Online Coaching</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="w-full text-center py-6 border-t border-gray-100 text-xs text-gray-400 z-10 bg-white">
        &copy; {new Date().getFullYear()} Suraj Sir Education. Dynamic Campus environment. All rights reserved.
      </div>
    </div>
  );
}
