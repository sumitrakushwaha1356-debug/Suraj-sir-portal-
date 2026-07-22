import { useState, useEffect } from "react";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import LoginPage from "./components/LoginPage";

export default function App() {
  const [view, setView] = useState<"home" | "student" | "admin">("home");
  const [studentEmail, setStudentEmail] = useState<string>("student@surajsir.com");
  const [role, setRole] = useState<"student" | "admin">(() => {
    return (localStorage.getItem("role") as "student" | "admin") || "student";
  });

  useEffect(() => {
    localStorage.setItem("role", role);
    localStorage.setItem("email", role === "admin" ? "admin@surajsir.com" : studentEmail);
  }, [role, studentEmail]);

  const handleSwitchRole = (newRole: "student" | "admin") => {
    setRole(newRole);
  };

  // Shield against internal Firebase iframe/popup rejection/cancelled-popup-request errors
  useEffect(() => {
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

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  if (view === "admin") {
    return (
      <AdminDashboard
        email="admin@surajsir.com"
        onLogout={() => handleSwitchRole("student")}
        onGoHome={() => setView("home")}
      />
    );
  }

  if (view === "student") {
    return (
      <StudentDashboard
        email={studentEmail}
        onLogout={() => handleSwitchRole("admin")}
        onGoHome={() => setView("home")}
      />
    );
  }

  // Render Login Page with Responsive Hero Banner and Centered Login Card
  return (
    <LoginPage
      onStudentLogin={(email) => {
        setStudentEmail(email);
        setView("student");
      }}
      onAdminLogin={() => {
        setView("admin");
      }}
    />
  );
}
