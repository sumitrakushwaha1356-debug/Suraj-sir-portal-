import React, { useState, useEffect } from "react";

// Helper function to extract YouTube video ID and convert into an embeddable URL
export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";
  const trimmed = url.trim();

  let videoId = "";

  // 1. Direct 11-char ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    videoId = trimmed;
  } else {
    // 2. Regex patterns to extract video ID ignoring query parameters
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /\/embed\/([a-zA-Z0-9_-]{11})/,
      /\/v\/([a-zA-Z0-9_-]{11})/,
      /\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) {
      try {
        const urlObj = new URL(trimmed);
        const searchParams = new URLSearchParams(urlObj.search);
        const v = searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
          videoId = v;
        } else {
          const pathParts = urlObj.pathname.split("/").filter(Boolean);
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
            videoId = lastPart;
          }
        }
      } catch (e) {
        // Fallback matching
      }
    }
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return trimmed;
}

// Lecture interface
export interface LectureItem {
  title: string;
  duration: string;
  video: string;
  description?: string;
}

// Playlist required by user specification
const playlist: LectureItem[] = [
  {
    title: "Class 12 Physics Important Questions 2027 🔥 | Board Exam Most Expected Questions",
    duration: "",
    description: "Important Questions for CBSE Class 12 Physics Board Exam 2027.",
    video: "https://youtu.be/edlEFptqdSY?si=ooy1k_cv2WPewLaL"
  },
  {
    title: "गतिमान आवेश और चुंबकत्व | Class 12 Physics Chapter 4 Full Explanation 🔥",
    duration: "",
    description: "Class 12 Physics Chapter 4 Full Explanation.",
    video: "https://youtu.be/gLsCdTVoi_g?si=-sSnOmbPIM1PcAvz"
  },
  {
    title: "5 मिनट में समझो — आवेश क्या होता है? | Class 12 Physics",
    duration: "",
    description: "Quick explanation of Electric Charge for Class 12 Physics.",
    video: "https://youtu.be/X9tCF8EE9_M?si=3YnWyKoq29-_SPd2"
  },
  {
    title: "D and F Block Elements Explained Easily | Class 12 Chemistry",
    duration: "",
    description: "Complete explanation of D and F Block Elements for Class 12 Chemistry.",
    video: "https://youtu.be/GHxhWDWLdJY?si=Eej87A5Nyf4JZqp3"
  },
  {
    title: "Chemistry by Amit Sir | Basic se Bond and Carbon Hydrogen Bond Degree",
    duration: "",
    description: "Complete chemistry basics including chemical bonding and carbon-hydrogen bond concepts.",
    video: "https://youtu.be/eX7CTbVdnUE?si=kLrMzMueOMOiblyy"
  }
];

interface Class12BatchSectionProps {
  onGoHome?: () => void;
}

export default function Class12BatchSection({ onGoHome }: Class12BatchSectionProps) {
  // State for active lecture index
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Carousel active slide index
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const currentLecture = playlist[currentIndex] || playlist[0];
  const embedUrl = getYouTubeEmbedUrl(currentLecture.video);

  // Auto slide carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevLecture = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextLecture = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4 bg-light min-vh-100">
      
      {/* Header Banner */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 text-white overflow-hidden" 
           style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e1b4b 100%)" }}>
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning text-dark font-monospace fw-bold px-3 py-2 rounded-pill">
                ACADEMIC SESSION 2026-27
              </span>
              <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill">
                LIVE & RECORDED BATCH
              </span>
            </div>
            <h1 className="h2 fw-extrabold text-white mb-1 d-flex align-items-center gap-2">
              📚 Class 12th Batch (2026-27)
            </h1>
            <p className="text-slate-300 mb-0 small">
              Official Coaching Video Lectures, Board Exam Notes & Chapter-wise Problem Solving with Suraj Sir
            </p>
          </div>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="btn btn-outline-light btn-sm rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-house-door-fill"></i> Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Responsive Grid: Left Sidebar (30%) & Right Video Player (70%) */}
      <div className="row g-4">
        
        {/* Left Sidebar (30% on desktop) */}
        <div className="col-12 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 fs-6">
                <i className="bi bi-collection-play-fill text-primary"></i> Batch Lectures ({playlist.length})
              </h5>
              <span className="badge bg-success bg-opacity-10 text-success fw-bold rounded-pill px-2.5 py-1 small">
                Free Batch
              </span>
            </div>
            
            <div className="card-body p-2 overflow-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
              <div className="list-group list-group-flush gap-1">
                {playlist.map((item, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`list-group-item list-group-item-action border-0 rounded-3 p-3 transition-all text-start position-relative ${
                        isActive
                          ? "bg-primary text-white shadow-sm fw-semibold"
                          : "bg-white text-dark hover-bg-light border"
                      }`}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out"
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className={`badge rounded-pill text-uppercase px-2.5 py-1 ${
                          isActive ? "bg-white text-primary fw-bold" : "bg-light text-secondary border"
                        }`} style={{ fontSize: "0.725rem" }}>
                          Lecture {index + 1}
                        </span>
                        <span className={`small d-flex align-items-center gap-1 ${
                          isActive ? "text-white-50" : "text-muted"
                        }`}>
                          <i className="bi bi-play-circle"></i> {item.duration || "Video"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${isActive ? "bi-play-circle-fill text-warning fs-5" : "bi-play-circle text-primary fs-5"}`}></i>
                          <span className={`fw-bold ${isActive ? "text-white" : "text-dark"}`} style={{ fontSize: "0.95rem" }}>
                            {item.title}
                          </span>
                        </div>
                        {isActive && (
                          <span className="badge bg-warning text-dark fw-bold rounded-pill px-2 py-0.5" style={{ fontSize: "0.65rem" }}>
                            NOW PLAYING
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card-footer bg-light border-top p-3 text-center rounded-bottom-4">
              <p className="small text-muted mb-0 d-flex align-items-center justify-content-center gap-1">
                <i className="bi bi-shield-check text-success"></i> Auto-Sync Enabled • Click any lecture to play
              </p>
            </div>
          </div>
        </div>

        {/* Right Side (70% on desktop) */}
        <div className="col-12 col-lg-8 col-xl-9">
          
          {/* Carousel ABOVE Video */}
          <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
            <div id="class12BatchCarousel" className="carousel slide position-relative" data-bs-ride="carousel">
              
              {/* Indicators */}
              <div className="carousel-indicators mb-2">
                <button 
                  type="button" 
                  onClick={() => setActiveSlide(0)}
                  className={activeSlide === 0 ? "active" : ""} 
                  aria-current={activeSlide === 0 ? "true" : "false"} 
                  aria-label="Slide 1"
                ></button>
                <button 
                  type="button" 
                  onClick={() => setActiveSlide(1)}
                  className={activeSlide === 1 ? "active" : ""} 
                  aria-label="Slide 2"
                ></button>
                <button 
                  type="button" 
                  onClick={() => setActiveSlide(2)}
                  className={activeSlide === 2 ? "active" : ""} 
                  aria-label="Slide 3"
                ></button>
              </div>

              {/* Carousel Inner */}
              <div className="carousel-inner">
                
                {/* Slide 1 */}
                <div className={`carousel-item p-4 text-white ${activeSlide === 0 ? "active" : ""}`}
                     style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", minHeight: "170px" }}>
                  <div className="row align-items-center h-100 py-2 px-md-3">
                    <div className="col-md-9">
                      <span className="badge bg-warning text-dark fw-bold mb-2 px-3 py-1 rounded-pill">
                        🎓 Welcome Students
                      </span>
                      <h3 className="fw-bold mb-2 text-white">Welcome to Class 12th Batch (2026-27)</h3>
                      <p className="mb-3 text-light small" style={{ maxWidth: "600px" }}>
                        Start your journey towards scoring 95%+ in Class 12 Board Exams with Suraj Sir's structured video modules.
                      </p>
                      <button 
                        onClick={() => setCurrentIndex(0)}
                        className="btn btn-warning text-dark font-weight-bold fw-bold btn-sm rounded-pill px-4 shadow-sm"
                      >
                        <i className="bi bi-play-fill me-1"></i> Start Lecture 1
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slide 2 */}
                <div className={`carousel-item p-4 text-white ${activeSlide === 1 ? "active" : ""}`}
                     style={{ background: "linear-gradient(135deg, #065f46 0%, #10b981 100%)", minHeight: "170px" }}>
                  <div className="row align-items-center h-100 py-2 px-md-3">
                    <div className="col-md-9">
                      <span className="badge bg-light text-success fw-bold mb-2 px-3 py-1 rounded-pill">
                        🔥 Daily Updates
                      </span>
                      <h3 className="fw-bold mb-2 text-white">Latest Lecture Available</h3>
                      <p className="mb-3 text-light small" style={{ maxWidth: "600px" }}>
                        Watch newly uploaded chapter lectures, board exercise derivations, and daily homework problem breakdowns.
                      </p>
                      <button 
                        onClick={() => setCurrentIndex(playlist.length - 1)}
                        className="btn btn-light text-success fw-bold btn-sm rounded-pill px-4 shadow-sm"
                      >
                        <i className="bi bi-play-btn-fill me-1"></i> Watch Latest Lecture
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slide 3 */}
                <div className={`carousel-item p-4 text-white ${activeSlide === 2 ? "active" : ""}`}
                     style={{ background: "linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)", minHeight: "170px" }}>
                  <div className="row align-items-center h-100 py-2 px-md-3">
                    <div className="col-md-9">
                      <span className="badge bg-warning text-dark fw-bold mb-2 px-3 py-1 rounded-pill">
                        🚀 High Yield Preparation
                      </span>
                      <h3 className="fw-bold mb-2 text-white">Start Learning Today</h3>
                      <p className="mb-3 text-light small" style={{ maxWidth: "600px" }}>
                        Master fundamental concepts, solve past 10 years board paper sets, and build strong conceptual clarity.
                      </p>
                      <button 
                        onClick={() => setCurrentIndex(1)}
                        className="btn btn-warning text-dark fw-bold btn-sm rounded-pill px-4 shadow-sm"
                      >
                        <i className="bi bi-book-fill me-1"></i> Explore Chapter 1
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Controls */}
              <button 
                className="carousel-control-prev" 
                type="button" 
                onClick={() => setActiveSlide((prev) => (prev === 0 ? 2 : prev - 1))}
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button 
                className="carousel-control-next" 
                type="button" 
                onClick={() => setActiveSlide((prev) => (prev === 2 ? 0 : prev + 1))}
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          {/* Video Player Card */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            
            {/* Player Bar */}
            <div className="card-header bg-dark text-white p-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger text-white font-monospace">
                  <i className="bi bi-record-circle me-1 animate-pulse"></i> LIVE PLAYER
                </span>
                <span className="fw-bold text-light small d-none d-sm-inline">
                  Lecture {currentIndex + 1} of {playlist.length}
                </span>
              </div>
              <span className="small text-muted font-monospace">
                1080p HD • Direct Stream
              </span>
            </div>

            {/* Bootstrap 16x9 Ratio Video Iframe */}
            <div className="ratio ratio-16x9 bg-black position-relative">
              <iframe
                src={embedUrl}
                title={`Lecture ${currentIndex + 1}: ${currentLecture.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="border-0 w-100 h-100"
              ></iframe>
            </div>

            {/* Below Video Meta & Controls */}
            <div className="card-body p-4 bg-white">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 border-bottom pb-3 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-2.5 py-1 rounded-pill">
                      Lecture {currentIndex + 1}
                    </span>
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <i className="bi bi-clock-history"></i> Duration: {currentLecture.duration || "Full Lecture"}
                    </span>
                  </div>
                  <h3 className="h4 fw-bold text-dark mb-1">
                    {currentLecture.title}
                  </h3>
                  <p className="text-secondary mb-0 small">
                    Class 12th Coaching Curriculum • Suraj Sir
                  </p>
                </div>

                {/* Previous & Next Lecture Buttons */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevLecture}
                    disabled={currentIndex === 0}
                    className="btn btn-outline-secondary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold text-nowrap disabled:opacity-50"
                  >
                    <i className="bi bi-chevron-left"></i> Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNextLecture}
                    disabled={currentIndex === playlist.length - 1}
                    className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-1 fw-bold text-nowrap shadow-sm disabled:opacity-50"
                  >
                    Next <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Lecture Description */}
              <div className="bg-light p-3 rounded-3 border">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle-fill text-primary"></i> Lecture Overview
                </h6>
                <p className="text-muted mb-0 small leading-relaxed" style={{ lineHeight: "1.6" }}>
                  {currentLecture.description || "In this lecture, Suraj Sir explains key concepts, formula derivations, solved board numericals, and step-by-step solutions."}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
