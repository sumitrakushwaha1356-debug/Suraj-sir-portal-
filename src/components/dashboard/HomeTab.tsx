import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Calendar, BookOpen, Clock, Trophy, CheckCircle2, ArrowRight, MessageSquareCode, Award, Zap } from "lucide-react";
import { StudentProfile } from "../../types";

interface HomeTabProps {
  profile: StudentProfile;
  onNavigateToTab: (tab: string) => void;
}

export default function HomeTab({ profile, onNavigateToTab }: HomeTabProps) {
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Watch 'Lecture 3: Newtonian Mechanics FBD'", done: true },
    { id: 2, text: "Complete Chemistry Isomerism Worksheet 2", done: false },
    { id: 3, text: "Attempt Limits & Derivatives Practice Quiz", done: false },
    { id: 4, text: "Revise math formula quick notes", done: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const progressPct = Math.round((checklist.filter(i => i.done).length / checklist.length) * 100);

  const stats = [
    { label: "Active Streak", value: `${profile.streak} Days`, desc: "Keep practicing daily!", icon: Zap, color: "text-amber-500 bg-amber-50" },
    { label: "Lectures Watched", value: "8 / 10", desc: "80% syllabus completed", icon: Clock, color: "text-blue-500 bg-blue-50" },
    { label: "Mock Tests Solved", value: "2 Tests", desc: "Avg Score: 87.5%", icon: Trophy, color: "text-emerald-500 bg-emerald-50" },
    { label: "Attendance Ratio", value: profile.attendance, desc: "Excellent consistency!", icon: Award, color: "text-purple-500 bg-purple-50" }
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Header Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-navy-900 to-primary-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-gold/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-accent-gold text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Batch: {profile.batch}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {profile.name}!
          </h2>
          <p className="text-xs sm:text-sm text-primary-200 max-w-xl font-light">
            &ldquo;The difference between ordinary and extraordinary is that little extra effort.&rdquo; Suraj Sir has updated your practice worksheets for physics kinematics today!
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab("tests")}
          className="relative z-10 py-3 px-5 rounded-2xl bg-gradient-to-r from-accent-gold to-yellow-500 hover:from-yellow-500 hover:to-accent-gold text-navy-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/35 active:scale-95 transition cursor-pointer shrink-0"
        >
          <span>Take Today's Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-navy-900">{stat.value}</p>
                <p className="text-[10px] text-gray-500">{stat.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid: Study Checklist & Mentorship updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive To-Do Checklist */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-navy-950">
                  Today's Study Checklist
                </h3>
                <p className="text-xs text-gray-400">Complete items to maintain your daily streak.</p>
              </div>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                {progressPct}% Finished
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 mt-4">
              {checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    item.done
                      ? "bg-slate-50 border-gray-100 text-gray-400 line-through"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                    item.done
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-gray-300 bg-white"
                  }`}>
                    {item.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Keep pushing! You are doing amazing work.</span>
            <button 
              onClick={() => onNavigateToTab("videos")}
              className="text-primary-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Watch lectures</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Class Announcements / Suraj Sir Updates */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-navy-950 mb-1">
              Class Announcements
            </h3>
            <p className="text-xs text-gray-400 mb-4">Latest updates directly from board staff.</p>

            <div className="space-y-4">
              {/* Announcement 1 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 mt-0.5">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Weekly Live Q&A Session</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Join Suraj Sir for a live problem-solving session this Saturday at 4:00 PM IST. Get doubts cleared instantly.</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-bold">
                    Saturday 4 PM
                  </span>
                </div>
              </div>

              {/* Announcement 2 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 mt-0.5">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">New Mathematics Study Sheets</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Suraj Sir uploaded comprehensive solved double integrals sheets. Access from the Books section today.</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-[10px] text-amber-700 font-bold">
                    New Sheet
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="p-3 bg-navy-50 rounded-xl flex items-center gap-2.5 text-[11px] text-navy-800">
              <MessageSquareCode className="w-4 h-4 text-primary-500 shrink-0" />
              <span>Have specific doubts? Connect with your class coordinator instantly.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
