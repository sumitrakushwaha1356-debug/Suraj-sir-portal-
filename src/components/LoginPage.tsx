import React, { useState } from "react";
import { GraduationCap, ShieldCheck, Mail, Lock, ArrowRight, BookOpen, AlertCircle, Video, FileText, BarChart3, Award, Users, Play, Star, UserCheck, Sparkles } from "lucide-react";
import heroBannerImg from "../assets/images/hero-image.57.33.jpeg";
import { loginStudent, registerStudent } from "../lib/firebase";

interface LoginPageProps {
  onStudentLogin: (email: string) => void;
  onAdminLogin: () => void;
}

export default function LoginPage({ onStudentLogin, onAdminLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"student" | "email" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollToLogin = () => {
    const cardEl = document.getElementById("login-card-section");
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        if (!name.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        await registerStudent(name, email, password);
      } else {
        await loginStudent(email, password);
      }
      onStudentLogin(email);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const defaultEmail = email || "student@surajsir.com";
      onStudentLogin(defaultEmail);
    } catch (err: any) {
      setError("Google Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 text-navy-900 flex flex-col justify-between relative overflow-x-hidden font-sans pb-12">
      
      {/* Background Decorative Soft Shapes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col items-center">
        
        {/* Header Branding Navbar */}
        <header className="w-full text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-sm px-4 py-1.5 rounded-full">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-amber-500 p-0.5 flex items-center justify-center shadow-sm">
              <div className="flex items-center justify-center w-full h-full rounded-[6px] bg-navy-950">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <span className="font-display font-black text-xs sm:text-sm tracking-wider text-navy-950">
              SURAJ SIR EDUCATION • ROJ STUDY
            </span>
            <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-200 hidden sm:inline-block">
              India's Premier Learning Platform
            </span>
          </div>
        </header>

        {/* 1. HERO SECTION WITH IMAGE & OVERLAY CONTENT */}
        <section className="w-full mb-10 relative">
          <div className="w-full overflow-hidden rounded-[24px] shadow-2xl border border-gray-200/80 relative group" style={{ minHeight: "240px" }}>
            
            {/* Real Image element as requested */}
            <img
              src={heroBannerImg}
              alt="Roj Study Hero Banner"
              loading="lazy"
              className="w-full h-[240px] sm:h-[340px] md:h-[420px] lg:h-[460px] object-cover object-center block rounded-[24px] transition-transform duration-700 group-hover:scale-105"
              style={{
                width: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                display: "block",
                borderRadius: "24px",
                overflow: "hidden"
              }}
            />

            {/* Subtle dark gradient overlay to improve text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/50 to-transparent rounded-[24px] flex flex-col justify-end p-6 sm:p-10 text-white">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free & Premium Academic Batches (2026-27)</span>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  Learn Today, Lead Tomorrow
                </h1>

                <p className="text-xs sm:text-base text-gray-200 font-normal leading-relaxed opacity-95 max-w-xl drop-shadow">
                  Join thousands of students preparing for Board Exams, JEE, NEET, and Competitive Exams with India's best learning platform.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={scrollToLogin}
                    className="py-2.5 sm:py-3 px-6 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border border-primary-400/30"
                  >
                    <span>📘 Start Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. GLASSMORPHISM LOGIN CARD */}
        <section id="login-card-section" className="w-full max-w-md mx-auto mb-16 scroll-mt-6">
          <div className="w-full bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-[28px] shadow-2xl p-6 sm:p-8 space-y-6 transition-all duration-300 hover:shadow-primary-500/10">
            
            {/* Card Header Title */}
            <div className="text-center space-y-1">
              <h2 className="font-display text-2xl font-black text-navy-950 tracking-tight flex items-center justify-center gap-2">
                <span>Welcome Back</span>
                <span className="text-xl">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Continue your learning journey.
              </p>
            </div>

            {/* Tab Selection: Student Portal | Email Login | Admin Access */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-2xl text-xs font-bold text-gray-600 border border-gray-200/60">
              <button
                type="button"
                onClick={() => { setActiveTab("student"); setError(""); }}
                className={`py-2.5 px-2 rounded-xl transition-all duration-200 text-center cursor-pointer ${
                  activeTab === "student" ? "bg-white text-primary-600 shadow-md font-extrabold" : "hover:text-navy-950"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("email"); setError(""); }}
                className={`py-2.5 px-2 rounded-xl transition-all duration-200 text-center cursor-pointer ${
                  activeTab === "email" ? "bg-white text-primary-600 shadow-md font-extrabold" : "hover:text-navy-950"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("admin"); setError(""); }}
                className={`py-2.5 px-2 rounded-xl transition-all duration-200 text-center cursor-pointer ${
                  activeTab === "admin" ? "bg-white text-amber-600 shadow-md font-extrabold" : "hover:text-navy-950"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Error Alert Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2 shadow-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: STUDENT PORTAL QUICK LOGIN & GOOGLE AUTH */}
            {activeTab === "student" && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto shadow-inner border border-primary-100">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-navy-950">Student Portal Sign In</h3>
                  <p className="text-xs text-gray-500">Access Class 10th & 12th videos, notes, & practice tests</p>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-slate-50 text-gray-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google Login</span>
                </button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-[11px]"><span className="bg-white px-3 text-gray-400 font-semibold">OR DIRECT ACCESS</span></div>
                </div>

                {/* Enter Student Dashboard Direct Button */}
                <button
                  type="button"
                  onClick={() => onStudentLogin(email || "student@surajsir.com")}
                  className="w-full py-3.5 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-600/25 transition-all duration-200 cursor-pointer"
                >
                  <span>Enter Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 2: EMAIL / PASSWORD LOGIN & REGISTRATION */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="text-center">
                  <h3 className="font-display text-base font-extrabold text-navy-950">
                    {isRegistering ? "Create Student Account" : "Email & Password Sign In"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRegistering ? "Register to unlock complete study materials" : "Enter your registered credentials"}
                  </p>
                </div>

                {isRegistering && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none transition"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-600/25 transition-all duration-200 cursor-pointer"
                >
                  {loading ? "Authenticating..." : isRegistering ? "Register New Account" : "Sign In to Account"}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                    className="text-xs text-primary-600 hover:underline font-bold"
                  >
                    {isRegistering ? "Already have an account? Sign in" : "New student? Register here"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: ADMIN PANEL ACCESS */}
            {activeTab === "admin" && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold text-navy-950">Faculty & Admin Control</h3>
                  <p className="text-xs text-gray-500">Manage video batches, lectures, notes, & verify student payments</p>
                </div>

                <button
                  type="button"
                  onClick={onAdminLogin}
                  className="w-full py-3.5 px-5 rounded-2xl bg-navy-950 hover:bg-navy-900 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-navy-950/25 transition-all duration-200 cursor-pointer"
                >
                  <span>Enter Admin Control Panel</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            )}

          </div>
        </section>

        {/* 3. FEATURE SECTION */}
        <section className="w-full mb-16">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              WHY CHOOSE US
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
              Comprehensive Learning Features
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
              Everything you need to excel in your Class 10th & 12th Board Examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-extrabold text-navy-950 mb-2">
                🎥 HD Video Lectures
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Chapter-wise in-depth video tutorials with full explanations by Suraj Sir.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-extrabold text-navy-950 mb-2">
                📝 Notes & Practice Questions
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Handwritten notes, NCERT solution sheets, and previous year question banks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-extrabold text-navy-950 mb-2">
                📊 Progress Tracking
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Track watched lectures, completed chapters, and test performance in real time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-display text-base font-extrabold text-navy-950 mb-2">
                🏆 Board & Competitive Prep
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Curated syllabus modules designed specifically for CBSE/State Boards, JEE & NEET.
              </p>
            </div>

          </div>
        </section>

        {/* 4. TRUST & STATISTICS SECTION */}
        <section className="w-full mb-12">
          <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
            
            <div className="text-center mb-8 space-y-2 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                PLATFORM STATISTICS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                Trusted by Thousands of Students Across India
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center relative z-10">
              
              {/* Stat 1 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-center mb-2 text-amber-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mb-1">
                  📚 5000+
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  Active Students
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-center mb-2 text-primary-400">
                  <Play className="w-6 h-6" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mb-1">
                  🎬 1000+
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  Video Lessons
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-center mb-2 text-yellow-400">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mb-1">
                  ⭐ 4.9
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  Student Rating
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-center mb-2 text-emerald-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-white mb-1">
                  👨‍🏫 Top Faculty
                </div>
                <div className="text-xs text-gray-300 font-medium">
                  Expert Guidance
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-gray-500 bg-white border-t border-gray-200/80">
        &copy; {new Date().getFullYear()} Suraj Sir Education • Roj Study. All rights reserved.
      </footer>
    </div>
  );
}
