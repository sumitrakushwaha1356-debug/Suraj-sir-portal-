import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, BookOpen, ShieldCheck, HelpCircle, PhoneCall, Sparkles } from "lucide-react";

import LeftBanner from "./components/LeftBanner";
import StudentCard from "./components/StudentCard";
import AdminCard from "./components/AdminCard";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [loggedInEmail, setLoggedInEmail] = useState(() => {
    return localStorage.getItem("email") || "";
  });

  const [loginRole, setLoginRole] = useState<"student" | "admin">("student");

  // Sync state with browser navigation and shield against internal Firebase iframe/popup bugs
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

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

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  // Handle deep-linking and security redirects
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");

    if (storedToken && storedRole && storedEmail) {
      if (loggedInEmail !== storedEmail) {
        setLoggedInEmail(storedEmail);
      }
      
      // Auto-redirect from login to dashboard if already authenticated
      if (currentPath === "/") {
        if (storedRole === "admin") {
          navigateTo("/admin-dashboard");
        } else {
          navigateTo("/student-dashboard");
        }
      }
    } else {
      // If no session exists but trying to access a dashboard, redirect to login page
      if (currentPath === "/student-dashboard" || currentPath === "/admin-dashboard") {
        navigateTo("/");
      }
    }
  }, [currentPath, loggedInEmail]);

  // Secure navigation helper
  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  const handleStudentLoginSuccess = (email: string) => {
    localStorage.setItem("email", email);
    localStorage.setItem("role", "student");
    setLoggedInEmail(email);
    navigateTo("/student-dashboard");
  };

  const handleAdminLoginSuccess = (email: string) => {
    localStorage.setItem("email", email);
    localStorage.setItem("role", "admin");
    setLoggedInEmail(email);
    navigateTo("/admin-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setLoggedInEmail("");
    navigateTo("/");
  };

  // Render correct route components
  if (currentPath === "/student-dashboard") {
    return (
      <StudentDashboard
        email={loggedInEmail || "student@surajsir.com"}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === "/admin-dashboard") {
    return (
      <AdminDashboard
        email={loggedInEmail || "admin@surajsir.com"}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-navy-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* LEFT COLUMN: Premium Educator Showcase Banner (Desktop Only) */}
      <div className="w-full lg:w-[42%] xl:w-[38%] shrink-0">
        <LeftBanner />
      </div>

      {/* RIGHT COLUMN: Interactive Login Cards (Dual View) */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16 relative">
        {/* Subtle background glow decoration */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl pointer-events-none" />

        {/* Small Responsive Mobile Branding Header (Only visible on mobile/tablet) */}
        <div className="flex lg:hidden items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-gold flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold tracking-tight text-navy-900 text-sm">
                SURAJ SIR EDUCATION
              </span>
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block -mt-1">
                Portal Hub
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-primary-600 flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            <span>Join 10k+ Learners</span>
          </span>
        </div>

        {/* Top welcome/support status header */}
        <div className="relative z-10 hidden sm:flex justify-between items-center mb-8">
          <div>
            <h2 className="font-display text-lg font-bold text-navy-900">
              Welcome to the Knowledge Network
            </h2>
            <p className="text-xs text-gray-400">
              Select your respective terminal to authenticate and enter.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-primary-600 transition flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Need Help?</span>
            </a>
            <span className="text-gray-200">|</span>
            <a href="tel:+1234567890" className="hover:text-primary-600 transition flex items-center gap-1">
              <PhoneCall className="w-4 h-4 text-gray-400" />
              <span>Support Desk</span>
            </a>
          </div>
        </div>

        {/* Centered Single Form Container */}
        <div className="relative z-10 my-auto flex flex-col justify-center items-center w-full max-w-lg mx-auto">
          <div className="w-full text-center mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950 mb-1">
              Suraj Sir Education Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              Secure authentication for the online learning coaching system. Choose your terminal below to enter.
            </p>
          </div>

          {/* Segmented Sliding Tab Switcher */}
          <div className="flex bg-slate-150 p-1.5 rounded-2xl w-full mb-6 border border-gray-200 shadow-xs">
            <button
              onClick={() => setLoginRole("student")}
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                loginRole === "student"
                  ? "bg-white text-navy-950 shadow-md scale-[1.02] border border-gray-100"
                  : "text-gray-500 hover:text-navy-950 hover:bg-slate-50/50"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-primary-600" />
              <span>Student Terminal</span>
            </button>
            <button
              onClick={() => setLoginRole("admin")}
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                loginRole === "admin"
                  ? "bg-white text-navy-950 shadow-md scale-[1.02] border border-gray-100"
                  : "text-gray-500 hover:text-navy-950 hover:bg-slate-50/50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              <span>Admin Control</span>
            </button>
          </div>

          <div className="w-full relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {loginRole === "student" ? (
                <motion.div
                  key="student-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <StudentCard onLoginSuccess={handleStudentLoginSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="admin-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <AdminCard onLoginSuccess={handleAdminLoginSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info for right side */}
        <div className="relative z-10 mt-10 border-t border-gray-100 pt-6 text-center text-[11px] text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Suraj Sir Education. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-primary-600 transition">Privacy Statement</a>
            <span>•</span>
            <a href="#cookies" onClick={(e) => e.preventDefault()} className="hover:text-primary-600 transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </div>
  );
}
