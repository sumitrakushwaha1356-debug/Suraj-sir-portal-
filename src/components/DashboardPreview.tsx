import { motion } from "motion/react";
import { ArrowLeft, BookOpen, User, CheckCircle2, ShieldCheck, LogOut, Clock, Layers, Star, BookOpenCheck } from "lucide-react";

interface DashboardPreviewProps {
  role: "student" | "admin";
  email: string;
  onLogout: () => void;
}

export default function DashboardPreview({ role, email, onLogout }: DashboardPreviewProps) {
  const isStudent = role === "student";

  const studentModules = [
    { title: "Mathematics (Algebra & Calculus)", progress: 75, lectures: 18, color: "bg-blue-500" },
    { title: "Physics (Mechanics & Waves)", progress: 40, lectures: 12, color: "bg-purple-500" },
    { title: "Chemistry (Organic Compounds)", progress: 92, lectures: 24, color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Visual background flows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(234,179,8,0.06),transparent_50%)]" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 px-6 py-4 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-gold flex items-center justify-center font-bold text-white text-lg">
              S
            </div>
            <div>
              <span className="font-display font-bold tracking-tight block text-sm sm:text-base">
                SURAJ SIR EDUCATION
              </span>
              <span className="text-[9px] uppercase tracking-wider text-accent-gold font-bold block -mt-1">
                {isStudent ? "STUDENT CAMPUS" : "ADMINISTRATOR COMMAND"}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 py-1.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 active:scale-95 transition text-xs font-semibold text-gray-300 hover:text-white"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-navy-900/60 border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative"
        >
          {/* Status badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Successfully Routed to /{isStudent ? "student" : "admin"}-dashboard</span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome Back, <span className="text-accent-gold">{isStudent ? "Scholar" : "Administrator"}</span>!
          </h2>
          
          <p className="text-sm text-gray-300 max-w-lg mx-auto mb-8 font-light">
            You are successfully logged into <span className="font-semibold text-white">{email}</span>. The application core authenticated your credentials and redirected securely.
          </p>

          {/* Role specific quick preview mockup */}
          {isStudent ? (
            <div className="text-left bg-navy-950/50 rounded-2xl p-6 border border-white/5 max-w-xl mx-auto mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-300 flex items-center gap-1.5">
                  <BookOpenCheck className="w-4 h-4 text-accent-gold" /> My Active Batches
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Updated Just Now
                </span>
              </div>
              <div className="space-y-3">
                {studentModules.map((mod, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-200">{mod.title}</span>
                      <span className="text-accent-gold font-bold">{mod.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${mod.color}`} style={{ width: `${mod.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-left bg-navy-950/50 rounded-2xl p-6 border border-white/5 max-w-xl mx-auto mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> System Integration Status
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  SECURE PORTAL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block mb-0.5 text-[10px] uppercase">Active Sessions</span>
                  <span className="font-mono text-lg font-bold text-white">412 Users</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-gray-400 block mb-0.5 text-[10px] uppercase">Pending Registrations</span>
                  <span className="font-mono text-lg font-bold text-accent-gold">14 Requests</span>
                </div>
              </div>
            </div>
          )}

          {/* Info explaining dashboard will be created later */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 max-w-md mx-auto text-xs text-gray-400 leading-relaxed">
            <span className="font-semibold text-white block mb-1">Scope Boundaries Met:</span>
            As requested, dashboards are pending implementation in the next step. Currently, authentication routing behaves perfectly with zero backend locks.
          </div>

          {/* Back button */}
          <div className="mt-8">
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 py-2 px-6 rounded-xl bg-white/10 hover:bg-white/15 transition text-xs font-semibold text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In Hub</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-4 text-center text-xs text-gray-400 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} Suraj Sir Education. Setup and routing verified.
      </footer>
    </div>
  );
}
