import React from "react";
import { BookOpen, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export default function Footer({ onNavigateTab }: FooterProps) {
  return (
    <footer className="w-full bg-gradient-to-b from-navy-950 via-slate-950 to-navy-950 text-white pt-4 sm:pt-5 pb-3 border-t border-white/10 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/4 w-48 h-48 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2-Column Ultra-Slim Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 pb-3 border-b border-white/10 items-start">
          
          {/* COLUMN 1: Logo, Portal Name, Description, Social Media */}
          <div className="space-y-2">
            {/* Logo & Name Area */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-amber-500 p-0.5 shadow-md shrink-0">
                <div className="flex items-center justify-center w-full h-full rounded-[6px] bg-navy-950">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-base tracking-tight text-white leading-none">
                  Suraj Sir Portal
                </h3>
                <span className="text-[10px] font-semibold text-amber-400/90 tracking-wider uppercase block mt-0.5">
                  Roj Study Education
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300/90 leading-relaxed max-w-xl">
              Empowering Class 10th & 12th Board students, JEE, NEET, and Competitive exam aspirants with top-quality free batch lectures and expert guidance by Suraj Sir.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 me-1">
                Connect:
              </span>
              
              {/* Instagram */}
              <a
                href="https://www.instagram.com/engr_suraj_singh1?igsh=MWRqbHlrdWR3MWw2Zg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official Instagram Page"
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-pink-600 border border-white/15 flex items-center justify-center text-white text-xs transition-all duration-200"
              >
                <i className="bi bi-instagram"></i>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@thesurajinstitute?si=uH5YjnNCt4E4OKzp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official YouTube Channel"
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-red-600 border border-white/15 flex items-center justify-center text-white text-xs transition-all duration-200"
              >
                <i className="bi bi-youtube"></i>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1Lusk8VmrF/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official Facebook Page"
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-blue-600 border border-white/15 flex items-center justify-center text-white text-xs transition-all duration-200"
              >
                <i className="bi bi-facebook"></i>
              </a>
            </div>
          </div>

          {/* COLUMN 2: Contact Desk */}
          <div className="space-y-2">
            <h4 className="font-display font-semibold text-sm text-white tracking-wide border-b border-white/10 pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              CONTACT DESK
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
              
              {/* Address */}
              <div className="sm:col-span-2 flex items-start gap-2 p-1.5 rounded-md bg-white/5 border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-tight text-[11px]">
                  <span className="font-semibold text-white me-1">Main Campus:</span>
                  <span className="text-gray-300">near petrol pump firozabad road hathwant Remesh chandra kushwaha shop</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 p-1.5 rounded-md bg-white/5 border border-white/10">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="leading-tight text-[11px]">
                  <span className="font-semibold text-white block">Helpline / WhatsApp</span>
                  <a href="tel:+918791693178" className="text-emerald-300 hover:underline">
                    +91 8791693178
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 p-1.5 rounded-md bg-white/5 border border-white/10">
                <Mail className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                <div className="leading-tight text-[11px]">
                  <span className="font-semibold text-white block">Official Support</span>
                  <a href="mailto:surajsir8791@gmail.com" className="text-primary-300 hover:underline">
                    surajsir8791@gmail.com
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>&copy; 2026 Suraj Sir Education Portal. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-amber-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-white/20">•</span>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-amber-400 transition-colors"
            >
              Terms of Service
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}
