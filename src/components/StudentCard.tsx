import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, User, Check, AlertCircle, ArrowRight, BookOpen, KeyRound } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface StudentCardProps {
  onLoginSuccess: (email: string) => void;
}

export default function StudentCard({ onLoginSuccess }: StudentCardProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form values
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInRemember, setSignInRemember] = useState(false);
  
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpAgree, setSignUpAgree] = useState(false);

  // Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    
    if (!signInEmail) {
      newErrors.signInEmail = "Email is required";
    } else if (!validateEmail(signInEmail)) {
      newErrors.signInEmail = "Please enter a valid email address";
    }
    
    if (!signInPassword) {
      newErrors.signInPassword = "Password is required";
    } else if (signInPassword.length < 6) {
      newErrors.signInPassword = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signInEmail, password: signInPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      setSuccessMsg("Success! Accessing student terminal...");
      setTimeout(() => {
        onLoginSuccess(signInEmail);
      }, 1200);
    } catch (err: any) {
      setErrors({ form: err.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    
    if (!signUpName) {
      newErrors.signUpName = "Full name is required";
    } else if (signUpName.length < 3) {
      newErrors.signUpName = "Name must be at least 3 characters";
    }
    
    if (!signUpEmail) {
      newErrors.signUpEmail = "Email is required";
    } else if (!validateEmail(signUpEmail)) {
      newErrors.signUpEmail = "Please enter a valid email address";
    }
    
    if (!signUpPassword) {
      newErrors.signUpPassword = "Password is required";
    } else if (signUpPassword.length < 6) {
      newErrors.signUpPassword = "Password must be at least 6 characters";
    }
    
    if (!signUpAgree) {
      newErrors.signUpAgree = "You must agree to the Terms of Service";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signUpName, email: signUpEmail, password: signUpPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      setSuccessMsg("Account created! Logging you in...");
      setTimeout(() => {
        onLoginSuccess(signUpEmail);
      }, 1200);
    } catch (err: any) {
      setErrors({ form: err.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setErrors({});
    setSuccessMsg("");
    setIsSubmitting(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user || !user.email) {
        throw new Error("Unable to retrieve Google user details from Firebase.");
      }

      // Send the authenticated user details to our custom backend API
      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || "Google Student",
          photoUrl: user.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
          googleId: user.uid
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process login with the server.");
      }

      const { token, user: userProfile } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", userProfile.role || "student");
      localStorage.setItem("userEmail", userProfile.email);

      setSuccessMsg("Success! Accessing student terminal...");
      setTimeout(() => {
        onLoginSuccess(userProfile.email);
      }, 1200);

    } catch (err: any) {
      console.error("Firebase Google Auth Error:", err);
      let errorMsg = err.message || "Failed to sign in with Google.";
      if (err.code === "auth/popup-blocked" || err.message?.includes("popup-blocked") || err.message?.includes("cancelled-popup-request")) {
        errorMsg = "Google login popups are blocked/cancelled inside this preview iframe. Please log in using Email & Password or click the 'Autofill Student Demo Credentials' button below.";
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMsg = "Google Sign-In popup was closed before completion. Please try again, or sign in with Email/Password.";
      } else if (err.message?.includes("cancelled-popup-request")) {
        errorMsg = "Auth popup request cancelled. Please use the Email & Password sign-in form or click the autofill tool below.";
      }
      setErrors({ form: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoStudent = () => {
    setSignInEmail("student@surajsir.com");
    setSignInPassword("password123");
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-navy-900/5 overflow-hidden flex flex-col h-full"
    >
      {/* Decorative colored strip */}
      <div className="h-2 bg-gradient-to-r from-primary-500 to-indigo-600" />
      
      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        {/* Header and Switcher */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-primary-600 uppercase">
              Student Hub
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-navy-900">
            Learn & Excel
          </h3>
          <p className="text-xs text-gray-500">
            Sign in to access your custom coursework and reports.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 p-1 bg-navy-50 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab("signin");
              setErrors({});
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "signin"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-navy-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrors({});
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "signup"
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-navy-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Action feedback status messages */}
        <AnimatePresence mode="wait">
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{successMsg}</span>
            </motion.div>
          )}
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2.5"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{errors.form}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Forms Form Container */}
        <div className="flex-1">
          {/* Continue with Google button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50/50 active:scale-[0.98] transition cursor-pointer ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            
            <div className="relative flex py-3.5 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-3 text-gray-400 text-[10px] font-bold tracking-wider uppercase">or sign in with password</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800 flex justify-between">
                  <span>Student Email Address</span>
                  {errors.signInEmail && (
                    <span className="text-[10px] text-red-500 font-normal flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.signInEmail}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="example@student.com"
                    value={signInEmail}
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      if (errors.signInEmail) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.signInEmail;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all placeholder:text-gray-400 ${
                      errors.signInEmail
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    }`}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-navy-800">
                    Password
                  </label>
                  {errors.signInPassword && (
                    <span className="text-[10px] text-red-500 font-normal flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.signInPassword}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (errors.signInPassword) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.signInPassword;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all ${
                      errors.signInPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-navy-900 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signInRemember}
                    onChange={(e) => setSignInRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Keep me signed in</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-600/10 hover:shadow-lg hover:shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                <span>{isSubmitting ? "Signing you in..." : "Access Student Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800 flex justify-between">
                  <span>Full Name</span>
                  {errors.signUpName && (
                    <span className="text-[10px] text-red-500 font-normal flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.signUpName}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={signUpName}
                    onChange={(e) => {
                      setSignUpName(e.target.value);
                      if (errors.signUpName) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.signUpName;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all placeholder:text-gray-400 ${
                      errors.signUpName
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    }`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-800 flex justify-between">
                  <span>Email Address</span>
                  {errors.signUpEmail && (
                    <span className="text-[10px] text-red-500 font-normal flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.signUpEmail}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="example@student.com"
                    value={signUpEmail}
                    onChange={(e) => {
                      setSignUpEmail(e.target.value);
                      if (errors.signUpEmail) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.signUpEmail;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all placeholder:text-gray-400 ${
                      errors.signUpEmail
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-navy-800">
                    Create Password
                  </label>
                  {errors.signUpPassword && (
                    <span className="text-[10px] text-red-500 font-normal flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.signUpPassword}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={signUpPassword}
                    onChange={(e) => {
                      setSignUpPassword(e.target.value);
                      if (errors.signUpPassword) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.signUpPassword;
                          return copy;
                        });
                      }
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border rounded-xl outline-none transition-all ${
                      errors.signUpPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-navy-900 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={signUpAgree}
                    onChange={(e) => {
                      setSignUpAgree(e.target.checked);
                      if (errors.signUpAgree) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.signUpAgree;
                          return copy;
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="text-primary-600 font-semibold hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-primary-600 font-semibold hover:underline">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
                {errors.signUpAgree && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 pl-6">
                    <AlertCircle className="w-3 h-3" /> {errors.signUpAgree}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-primary-600/10 hover:shadow-lg hover:shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                <span>{isSubmitting ? "Registering..." : "Join as Student"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Demo Helper Button */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">
            Development Quick-Test Tools
          </p>
          <button
            onClick={fillDemoStudent}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg text-xs font-semibold hover:bg-primary-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-primary-500" />
            <span>Autofill Student Demo Credentials</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
