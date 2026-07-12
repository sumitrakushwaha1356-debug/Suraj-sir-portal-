import { motion } from "motion/react";
import { BookOpen, GraduationCap, Award, Compass, Users, Sparkles } from "lucide-react";

// Using the exact generated asset path
const TEACHER_IMAGE = "/src/assets/images/suraj_sir_geography_teacher_1783608507019.jpg";

export default function LeftBanner() {
  const features = [
    {
      icon: GraduationCap,
      title: "Interactive Live Classes",
      desc: "Live visual sessions paired with hands-on practice worksheets.",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Award,
      title: "Premium Mentorship",
      desc: "Personalized guidance from Suraj Sir to boost confidence and conceptual depth.",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: Compass,
      title: "Structured Curriculum",
      desc: "Carefully designed milestones covering standard & competitive exam syllabi.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="relative flex flex-col justify-between w-full h-full min-h-[600px] lg:min-h-screen p-8 lg:p-12 text-white overflow-hidden bg-gradient-to-br from-navy-950 via-primary-950 to-navy-900">
      {/* Decorative background grids and glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.15),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(234,179,8,0.08),transparent_50%)]" />
      
      {/* Abstract Grid Line */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Header Branding */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center gap-3"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-gold p-0.5 shadow-lg shadow-primary-500/20">
          <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-navy-950">
            <BookOpen className="w-6 h-6 text-accent-gold" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-primary-100 to-accent-gold bg-clip-text text-transparent">
            SURAJ SIR
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-primary-300">
            Education Portal
          </p>
        </div>
      </motion.div>

      {/* Main Teacher Showcase & Quote section */}
      <div className="relative z-10 my-8 lg:my-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Confident Teacher Portrait */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-5 flex justify-center"
          >
            <div className="relative group">
              {/* Outer Golden/Blue Glow Rings */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-accent-gold via-primary-500 to-indigo-600 opacity-70 blur-md group-hover:opacity-90 transition duration-500" />
              
              <div className="relative w-52 h-68 md:w-48 md:h-64 lg:w-56 lg:h-72 rounded-2xl overflow-hidden border border-white/15 bg-navy-950 shadow-2xl">
                <img 
                  src={TEACHER_IMAGE} 
                  alt="Suraj Sir" 
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback in case of absolute path issues in dev mode
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3 bg-navy-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/15 text-center">
                  <p className="text-xs font-semibold text-accent-gold">Suraj Sir</p>
                  <p className="text-[9px] text-gray-300">Founder & Head Mentor</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slogan & Quote Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-7 flex flex-col justify-center text-center md:text-left"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto md:mx-0 mb-4 text-xs font-medium text-accent-gold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ranked #1 Education Hub</span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight mb-3">
              Shaping Minds, <br />
              <span className="bg-gradient-to-r from-accent-gold to-yellow-400 bg-clip-text text-transparent">
                Shaping Futures.
              </span>
            </h2>
            <p className="text-sm text-primary-100 italic leading-relaxed font-light">
              &ldquo;Education is not merely acquiring knowledge, but triggering the burning passion to learn, create, and lead with purpose.&rdquo;
            </p>
          </motion.div>
        </div>

        {/* Feature list */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${feat.color}`}>
                  <Icon className={`w-5 h-5 ${feat.iconColor} group-hover:scale-110 transition`} />
                </div>
                <h3 className="text-sm font-semibold text-white">{feat.title}</h3>
                <p className="text-xs text-primary-200 leading-normal">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer Meta info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-white/5 pt-6 text-[11px] text-primary-300"
      >
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Suraj Sir Education</span>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
        </div>
        <div className="flex items-center gap-1.5 text-accent-gold">
          <Users className="w-3.5 h-3.5" />
          <span>Over 10,000+ Students Mentored</span>
        </div>
      </motion.div>
    </div>
  );
}
