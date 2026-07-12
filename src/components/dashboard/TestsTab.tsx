import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Timer, ShieldAlert, CheckCircle2, AlertCircle, Play, ChevronRight, ChevronLeft, Flag, HelpCircle, RefreshCw, X, Lock } from "lucide-react";
import { Test, Question } from "../../types";

interface TestsTabProps {
  email?: string;
}

export default function TestsTab({ email }: TestsTabProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exam taking system states
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Score states
  const [showScorecard, setShowScorecard] = useState(false);
  const [scoreData, setScoreData] = useState<{
    correctCount: number;
    totalCount: number;
    percentage: number;
  } | null>(null);

  // Answer review toggle
  const [showReview, setShowReview] = useState(false);

  // Purchases and lock info
  const [purchases, setPurchases] = useState<Record<string, boolean>>({ "Class 10": false, "Class 12": false });
  const [showLockNotice, setShowLockNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
    fetchPurchases();
    return () => {
      stopTimer();
    };
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/purchases/check", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data);
      }
    } catch (err) {
      console.error("Failed to fetch student purchases:", err);
    }
  };

  const fetchTests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tests");
      if (!res.ok) {
        throw new Error("Failed to load standard test papers.");
      }
      const data = await res.json();
      setTests(data);
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isTestLocked = (test: Test) => {
    if (!test.classLevel) return false;
    
    // Admin bypasses checks
    const adminEmail = "surajeductionofficial@gmail.com";
    if (email?.toLowerCase().trim() === adminEmail) {
      return false;
    }
    
    const normalized = test.classLevel === "10th" ? "Class 10" : test.classLevel === "12th" ? "Class 12" : test.classLevel;
    if (normalized === "Class 10" || normalized === "Class 12") {
      return !purchases[normalized];
    }
    return false;
  };

  // Timer utilities
  const startTimer = (durationMins: number) => {
    setTimeLeft(durationMins * 60);
    setTimerActive(true);
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setTimerActive(false);
          // Auto submit when time runs out
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerActive(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remSecs.toString().padStart(2, "0")}`;
  };

  // Exam actions
  const handleStartExam = (test: Test) => {
    if (isTestLocked(test)) {
      setShowLockNotice(test.classLevel || "Class 12");
      return;
    }
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowScorecard(false);
    setShowReview(false);
    setScoreData(null);
    startTimer(test.duration);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (!activeTest) return;
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    stopTimer();
    calculateScore();
  };

  const handleSubmitExam = () => {
    if (window.confirm("Are you sure you want to finish and submit your test answers?")) {
      stopTimer();
      calculateScore();
    }
  };

  const calculateScore = () => {
    if (!activeTest) return;
    
    let correct = 0;
    activeTest.questions.forEach((q) => {
      const chosen = selectedAnswers[q.id];
      if (chosen !== undefined && chosen === q.correct) {
        correct++;
      }
    });

    const total = activeTest.questions.length;
    const pct = Math.round((correct / total) * 100);

    setScoreData({
      correctCount: correct,
      totalCount: total,
      percentage: pct
    });
    setShowScorecard(true);
  };

  const handleExitTest = () => {
    stopTimer();
    setActiveTest(null);
    setScoreData(null);
    setShowScorecard(false);
    setShowReview(false);
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Syncing active question banks from database...</p>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-950 text-lg">Failed to sync test papers</h3>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchTests}
          className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (tests.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-navy-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-950 text-lg">No Mock Tests Available</h3>
          <p className="text-xs text-gray-400 mt-1">There are currently no mock examinations scheduled for your active batch.</p>
        </div>
      </div>
    );
  }

  // 4. ACTIVE EXAM TAKING MODAL/SCREEN
  if (activeTest && !showScorecard) {
    const currentQuestion = activeTest.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === activeTest.questions.length - 1;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / activeTest.questions.length) * 100);

    return (
      <div className="space-y-6">
        {/* Exam Header bar */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-widest text-primary-600 uppercase">Interactive Exam Environment</span>
            <h2 className="font-display text-sm sm:text-base font-bold text-navy-950">
              {activeTest.title}
            </h2>
            <p className="text-xs text-gray-400">Subject: <span className="font-semibold text-navy-900">{activeTest.subject}</span></p>
          </div>

          {/* Real-time countdown timer */}
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 px-4 py-2 rounded-2xl text-red-700">
            <Timer className={`w-5 h-5 ${timeLeft < 60 ? "animate-bounce text-red-600" : "animate-spin-slow"}`} />
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-red-500 uppercase block -mb-1">Time Remaining</span>
              <span className="font-mono font-bold text-base">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Question sheet container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Question Column */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Question {currentQuestionIndex + 1} of {activeTest.questions.length}</span>
                <span className="text-primary-600 font-bold">{progressPercent}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary-600 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-primary-50 rounded-lg text-primary-700 text-xs font-bold">
                Q. No. {currentQuestionIndex + 1}
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-navy-950 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Choices list */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedAnswers[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(currentQuestion.id, i)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-50 border-primary-300 text-primary-900 shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      isSelected
                        ? "bg-primary-600 text-white"
                        : "bg-navy-50 text-gray-500"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Control buttons */}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-4">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 shadow-sm active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmitExam}
                  className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/10 active:scale-95 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Exam Paper</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm active:scale-95 transition cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Question Nav Map */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-bold text-sm text-navy-950">Question Navigation Map</h3>
              <p className="text-[11px] text-gray-400">Instantly switch between quiz questions</p>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {activeTest.questions.map((q, idx) => {
                const isSelected = idx === currentQuestionIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-600 text-white shadow-md ring-4 ring-primary-100"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-gray-500 border border-gray-200 hover:bg-slate-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Legend:</span>
              <div className="flex items-center gap-4 text-[11px] text-gray-600">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary-600 inline-block" /> Selected</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Solved</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-50 border border-gray-200 inline-block" /> Empty</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleExitTest}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer text-center"
              >
                Cancel and Exit Exam
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 5. EXAM SCORECARD & DETAILED RESPONSE REVIEW
  if (showScorecard && scoreData && activeTest) {
    const isPassed = scoreData.percentage >= 60;
    const comment =
      scoreData.percentage >= 90
        ? "Legendary result! Suraj Sir is extremely proud of your conceptual accuracy."
        : scoreData.percentage >= 75
        ? "Excellent score! Continue solving papers to lock down full marks in boards."
        : isPassed
        ? "Good performance, but focus on weaker equations to strengthen scores."
        : "Conceptual revision required. Book a mentorship meeting with Suraj Sir soon.";

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[11px] font-bold text-primary-700 uppercase">
              Official Examination Results
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">
              {activeTest.title}
            </h2>
            <p className="text-xs text-gray-400">Class Grade sheet compiled instantly</p>
          </div>

          {/* Dynamic Ring Score progress */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-slate-50 rounded-full border border-gray-100 shadow-inner">
            <div className="text-center space-y-0.5">
              <span className="text-3xl sm:text-4xl font-black text-navy-900 font-mono">
                {scoreData.percentage}%
              </span>
              <span className={`text-[10px] font-bold uppercase block ${isPassed ? "text-emerald-600" : "text-amber-600"}`}>
                {isPassed ? "PASSED" : "REVISE"}
              </span>
            </div>
          </div>

          {/* Score details list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto bg-slate-50 p-4 rounded-2xl border border-gray-100">
            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 uppercase">Total Questions</span>
              <p className="font-mono font-bold text-base text-navy-950">{scoreData.totalCount}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 uppercase">Correct Solved</span>
              <p className="font-mono font-bold text-base text-emerald-600">{scoreData.correctCount}</p>
            </div>
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 uppercase">Unanswered / Wrong</span>
              <p className="font-mono font-bold text-base text-red-500">
                {scoreData.totalCount - scoreData.correctCount}
              </p>
            </div>
          </div>

          {/* Suraj Sir Quote comment */}
          <div className="p-4 rounded-2xl bg-primary-50 border border-primary-100 text-xs text-primary-900 leading-relaxed font-light max-w-xl mx-auto">
            <span className="font-bold text-primary-950 block mb-0.5 text-left">Feedback from Suraj Sir:</span>
            &ldquo;{comment}&rdquo;
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl border border-gray-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 shadow-sm active:scale-95 transition cursor-pointer"
            >
              {showReview ? "Hide Correct Answers" : "Review Question Answers"}
            </button>
            <button
              onClick={handleExitTest}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm active:scale-95 transition cursor-pointer"
            >
              Back to Exam Portal
            </button>
          </div>
        </div>

        {/* Dynamic review list toggling */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <h3 className="font-display font-bold text-sm text-navy-950 mt-8">
                Detailed Question Review
              </h3>
              
              <div className="space-y-3">
                {activeTest.questions.map((q, idx) => {
                  const chosenAnswerIdx = selectedAnswers[q.id];
                  const isCorrect = chosenAnswerIdx === q.correct;
                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border bg-white space-y-3 ${
                        isCorrect ? "border-emerald-200" : "border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs font-bold text-navy-900">Q. {idx + 1}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                        }`}>
                          {isCorrect ? "Correct" : "Incorrect / Empty"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-navy-950">{q.question}</p>
                      
                      <div className="space-y-1.5 text-xs">
                        <p className="text-gray-500">
                          Your response: <span className={`font-bold ${isCorrect ? "text-emerald-700" : "text-red-500"}`}>
                            {chosenAnswerIdx !== undefined ? q.options[chosenAnswerIdx] : "None (Unanswered)"}
                          </span>
                        </p>
                        <p className="text-gray-500">
                          Correct Solution: <span className="font-bold text-emerald-700">{q.options[q.correct]}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 6. DEFAULT TESTS GRID PREVIEW
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-navy-950">
          Scheduled Mock Tests
        </h2>
        <p className="text-xs text-gray-400">Validate your learning and prepare for board milestones with mock exams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const locked = isTestLocked(test);
          return (
            <div
              key={test.id}
              onClick={() => locked && handleStartExam(test)}
              className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition flex flex-col justify-between h-full group ${
                locked
                  ? "border-red-100/50 hover:border-red-200"
                  : "border-gray-100 hover:border-primary-300 cursor-pointer"
              }`}
            >
              <div className={`space-y-4 ${locked ? "opacity-75" : ""}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="inline-flex items-center gap-1 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg text-[10px] text-primary-700 font-bold">
                      <span>{test.subject}</span>
                    </div>
                    {test.classLevel && (
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border text-white ${
                        test.classLevel === "Class 10" || test.classLevel === "10th"
                          ? "bg-purple-950/80 border-purple-500/30"
                          : "bg-blue-950/80 border-blue-500/30"
                      }`}>
                        {test.classLevel}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-gray-400 text-xs flex items-center gap-1 font-medium">
                    <Timer className="w-4 h-4 text-primary-500" />
                    <span>{test.duration} mins</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display text-sm sm:text-base font-bold text-navy-950 group-hover:text-primary-700 transition leading-snug flex items-center gap-1.5">
                    {locked && <Lock className="w-4 h-4 text-red-500 shrink-0" />}
                    <span>{test.title}</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Contains <span className="font-bold text-navy-900">{test.questions.length} selective questions</span> based on standard competitive exam rubrics.
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  {locked ? (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked Course
                    </span>
                  ) : (
                    "Class Board Prep"
                  )}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartExam(test);
                  }}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer shadow-sm ${
                    locked
                      ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      : "bg-primary-600 hover:bg-primary-700 text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <span>Unlock Class</span>
                      <Lock className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Start Test</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showLockNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in duration-200"
            >
              <div className="h-2 bg-red-600" />
              <button
                onClick={() => setShowLockNotice(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500 hover:text-navy-950 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100">
                  <Lock className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-display font-black text-navy-950 text-base">Course Purchase Required</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    This practice exam belongs to the premium <strong className="text-navy-900">{showLockNotice} core syllabus</strong>.
                    Please head over to the <strong className="text-navy-900">"Video Batches"</strong> tab to purchase and unlock the course!
                  </p>
                </div>

                <button
                  onClick={() => setShowLockNotice(null)}
                  className="w-full py-2.5 bg-navy-950 hover:bg-black text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
