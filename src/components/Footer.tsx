import React from "react";
import { BookOpen, GraduationCap, Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export default function Footer({ onNavigateTab }: FooterProps) {
  const handleLinkClick = (tab?: string) => {
    if (tab && onNavigateTab) {
      onNavigateTab(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-gradient-to-b from-navy-950 via-slate-900 to-navy-950 text-white pt-12 sm:pt-16 pb-8 border-t border-white/10 relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 4-Column Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          
          {/* COLUMN 1: Logo, Website Name, Description, Social Media */}
          <div className="space-y-5">
            {/* Logo & Name Area */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-amber-500 p-0.5 shadow-lg shadow-primary-500/20 animate-logo-float shrink-0">
                <div className="flex items-center justify-center w-full h-full rounded-[14px] bg-navy-950">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight footer-gradient-text">
                  Suraj Sir Portal
                </h3>
                <span className="text-[10px] font-bold text-amber-400/90 tracking-wider uppercase block">
                  Roj Study Education
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed font-normal">
              Empowering Class 10th & 12th Board students, JEE, NEET, and Competitive exam aspirants with top-quality free batch lectures, curated study materials, and expert guidance by Suraj Sir.
            </p>

            {/* Social Media Links with official icons and URLs */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/80 block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/engr_suraj_singh1?igsh=MWRqbHlrdWR3MWw2Zg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Instagram Page"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-pink-600 hover:to-purple-600 border border-white/15 flex items-center justify-center text-white footer-social-icon cursor-pointer shadow-md"
                >
                  <i className="bi bi-instagram text-lg"></i>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@thesurajinstitute?si=uH5YjnNCt4E4OKzp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official YouTube Channel"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-600 border border-white/15 flex items-center justify-center text-white footer-social-icon cursor-pointer shadow-md"
                >
                  <i className="bi bi-youtube text-lg"></i>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1Lusk8VmrF/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Facebook Page"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-blue-600 border border-white/15 flex items-center justify-center text-white footer-social-icon cursor-pointer shadow-md"
                >
                  <i className="bi bi-facebook text-lg"></i>
                </a>

              </div>
            </div>
          </div>

          {/* COLUMN 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-extrabold text-base text-white tracking-wide border-b border-white/10 pb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300 font-medium">
              <li>
                <a
                  href="#class10"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("class10batch"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Class 10th Free Batch</span>
                </a>
              </li>
              <li>
                <a
                  href="#class12"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("class12batch"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Class 12th Free Batch</span>
                </a>
              </li>
              <li>
                <a
                  href="#videos"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("videos"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>HD Video Lectures</span>
                </a>
              </li>
              <li>
                <a
                  href="#books"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("books"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reference Books & PDF Notes</span>
                </a>
              </li>
              <li>
                <a
                  href="#tests"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("tests"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Online Mock Test Series</span>
                </a>
              </li>
              <li>
                <a
                  href="#home"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("home"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Student Dashboard</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Exam Resources */}
          <div className="space-y-4">
            <h4 className="font-display font-extrabold text-base text-white tracking-wide border-b border-white/10 pb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400"></span>
              Exam Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300 font-medium">
              <li>
                <a
                  href="#cbse"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("videos"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                  <span>CBSE Board Exam 2026-27</span>
                </a>
              </li>
              <li>
                <a
                  href="#stateboards"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("videos"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                  <span>State Board Examinations</span>
                </a>
              </li>
              <li>
                <a
                  href="#jee-neet"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("videos"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                  <span>JEE & NEET Preparation</span>
                </a>
              </li>
              <li>
                <a
                  href="#ncert"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("books"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                  <span>NCERT Chapter Solutions</span>
                </a>
              </li>
              <li>
                <a
                  href="#pyq"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("books"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                  <span>Previous Year Question Papers</span>
                </a>
              </li>
              <li>
                <a
                  href="#formulas"
                  onClick={(e) => { e.preventDefault(); handleLinkClick("books"); }}
                  className="footer-link-hover inline-flex items-center gap-2 text-gray-300 hover:text-amber-400"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                  <span>Formulas & Quick Revision Sheets</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Contact Desk */}
          <div className="space-y-4">
            <h4 className="font-display font-extrabold text-base text-white tracking-wide border-b border-white/10 pb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Contact Desk
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              
              {/* Address */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold text-white block">Main Academic Campus</span>
                  <span className="text-gray-400 text-xs">near petrol punp
firozabad road 
hathwant
Remesh chandra kushwaha shop</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Helpline / WhatsApp</span>
                  <a href="tel:+919876543210" className="text-xs text-emerald-300 hover:underline">
                    +91 8791693178
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Official Support</span>
                  <a href="mailto:support@surajsir.com" className="text-xs text-primary-300 hover:underline">
                    surajsir8791@gmail.com
                  </a>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-white block">Desk Operating Hours</span>
                  <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
          
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>&copy; 2026 Suraj Sir Education Portal. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="footer-link-hover text-gray-400 hover:text-amber-400 transition"
            >
              Privacy Policy
            </a>
            <span className="text-white/20">•</span>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="footer-link-hover text-gray-400 hover:text-amber-400 transition"
            >
              Terms of Service
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}
