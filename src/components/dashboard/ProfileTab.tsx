import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, ShieldCheck, Calendar, Phone, Award, Save, Edit2, BookOpen, GraduationCap, Trophy, Check } from "lucide-react";
import { StudentProfile } from "../../types";

interface ProfileTabProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
}

export default function ProfileTab({ profile, onUpdateProfile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [parentName, setParentName] = useState("Mr. R. K. Sharma");
  const [parentPhone, setParentPhone] = useState("+91 99887 76655");
  const [targetExam, setTargetExam] = useState("IIT-JEE Main & Advanced 2027");
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name });
    
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const achievements = [
    { title: "Kinematics Ace", desc: "Scored 100% on Kinematics Quiz Paper.", icon: Trophy, color: "text-amber-500 bg-amber-50 border-amber-100" },
    { title: "Perfect Attender", desc: "Maintained >95% attendance record.", icon: Calendar, color: "text-blue-500 bg-blue-50 border-blue-100" },
    { title: "Active Scholar", desc: "Watched all chemistry organic videos.", icon: BookOpen, color: "text-emerald-500 bg-emerald-50 border-emerald-100" }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Save Success Alert */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm"
          >
            <div className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span>Profile credentials updated successfully! Changes saved locally.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Student Badge */}
        <div className="md:col-span-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center shadow-inner font-display text-3xl font-bold">
            {profile.name.charAt(0)}
            <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-navy-950 leading-tight">
              {profile.name}
            </h3>
            <span className="text-[10px] font-bold tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full uppercase">
              Student ID: {profile.studentId}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-left text-gray-500">
            <div className="flex justify-between">
              <span>Enrolled Batch</span>
              <span className="font-bold text-navy-950">{profile.batch}</span>
            </div>
            <div className="flex justify-between">
              <span>Joined Date</span>
              <span className="font-semibold text-navy-900">{profile.joinedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Attendance Rate</span>
              <span className="font-bold text-emerald-600">{profile.attendance}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form controls */}
        <div className="md:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-navy-950">
                Personal Credentials & Settings
              </h3>
              <p className="text-xs text-gray-400">Keep your coordinates updated for exam communications.</p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-primary-500" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800">Student Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    disabled={!isEditing}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 disabled:bg-slate-100 disabled:text-gray-500 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800">Email Address (Restricted)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 text-gray-400 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800">Student Mobile Phone</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    disabled={!isEditing}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 disabled:bg-slate-100 disabled:text-gray-500 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Target Exam Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800">Academic Target Exam</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={targetExam}
                    disabled={!isEditing}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 disabled:bg-slate-100 disabled:text-gray-500 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              {/* Guardian Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800">Parent / Guardian Name</label>
                <input
                  type="text"
                  value={parentName}
                  disabled={!isEditing}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 disabled:bg-slate-100 disabled:text-gray-500 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                />
              </div>

              {/* Guardian Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800">Parent Contact Mobile</label>
                <input
                  type="text"
                  value={parentPhone}
                  disabled={!isEditing}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 disabled:bg-slate-100 disabled:text-gray-500 border border-gray-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Editing Action Save Buttons */}
            {isEditing && (
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(profile.name);
                  }}
                  className="py-2 px-4 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Badges / Awards Achievements section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-navy-950">
            Earned Badges & Course Milestones
          </h3>
          <p className="text-xs text-gray-400">Accomplishments rewarded by Suraj Sir for academic dedication.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {achievements.map((ach, i) => {
            const Icon = ach.icon;
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${ach.color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-navy-950">{ach.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-normal font-light">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
