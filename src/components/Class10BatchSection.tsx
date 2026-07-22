import React, { useState, useEffect } from "react";
import { getYouTubeEmbedUrl, LectureItem } from "./Class12BatchSection";

const class10Playlist: LectureItem[] = [
  {
    title: "Prakash ka Paravartan | Reflection of Light Class 10 Physics | Ray Diagram Easy Explanation | Hindi",
    duration: "",
    description: "Complete explanation of Reflection of Light with Ray Diagrams for Class 10 Science.",
    video: "https://youtu.be/_FSKjiotREo?si=P3hpmmzKahBUQArs"
  },
  {
    title: "Manav Netra evam Rang Biranga Sansar | Human Eye & Colourful World",
    duration: "",
    description: "Complete explanation of Human Eye and Colourful World for Class 10 Science.",
    video: "https://youtu.be/4ds0eiFnYhE?si=jGg5FsL6HYThdC11"
  },
  {
    title: "Vidhut Class 10 ⚡ Complete Chapter in One Shot | Board Exam 2026",
    duration: "",
    description: "Complete one-shot lecture of Electricity for Class 10 Board Exam.",
    video: "https://youtu.be/WrtsWQpB7Kg?si=afNjShcHMYmv4SdS"
  },
  {
    title: "Vidhut Dhara aur Chumbakatva One Shot",
    duration: "",
    description: "Complete one-shot explanation of Magnetic Effects of Electric Current.",
    video: "https://youtu.be/YU6peT7ORM4?si=LZ53Eg6rmA9xBY2O"
  },
  {
    title: "Rasayanik Abhikriya aur Samikaran | NCERT Class 10 Science Hindi Medium",
    duration: "",
    description: "Complete explanation of Chemical Reactions and Equations for Class 10 Science.",
    video: "https://youtu.be/Qw0-1HffQkE?si=VHAya-CTattyRog6"
  }
];

interface Class10BatchSectionProps {
  onGoHome?: () => void;
}

export default function Class10BatchSection({ onGoHome }: Class10BatchSectionProps) {
  // Independent State for Class 10th lecture index
  const [currentClass10Index, setCurrentClass10Index] = useState<number>(0);
  // Independent Carousel active slide index
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const currentClass10Lecture = class10Playlist[currentClass10Index] || class10Playlist[0];
  const embedUrl = getYouTubeEmbedUrl(currentClass10Lecture.video);

  // Auto slide carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevClass10Lecture = () => {
    if (currentClass10Index > 0) {
      setCurrentClass10Index(currentClass10Index - 1);
    }
  };

  const handleNextClass10Lecture = () => {
    if (currentClass10Index < class10Playlist.length - 1) {
      setCurrentClass10Index(currentClass10Index + 1);
    }
  };

  return (
    <div id="class10-batch-section" className="container-fluid py-4 px-3 px-md-4 bg-light min-vh-100">
      
      {/* Header Banner */}
      <div className="card shadow-sm border-0 rounded-4 mb-4 text-white overflow-hidden" 
           style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)" }}>
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning text-dark font-monospace fw-bold px-3 py-2 rounded-pill">
                ACADEMIC SESSION 2026-27
              </span>
              <span className="badge bg-light text-primary border px-3 py-2 rounded-pill fw-bold">
                100% FREE BATCH
              </span>
            </div>
            <h1 className="h2 fw-extrabold text-white mb-1 d-flex align-items-center gap-2">
              📘 Class 10th Free Batch (2026-27)
            </h1>
            <p className="text-light mb-0 small opacity-90">
              Complete Science, Maths, SST & English Video Modules for Class 10 Board Preparation
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

      {/* Responsive Grid: Video Player (LEFT 70% on Desktop / TOP on Mobile) & Playlist (RIGHT 30% on Desktop / BOTTOM on Mobile) */}
      <div className="row g-4">
        
        {/* Main Video Player & Carousel Column (70% on desktop, Top on mobile/tablet) */}
        <div className="col-12 col-lg-8 col-xl-9">
          
          {/* Carousel ABOVE Video */}
          <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
            <div id="class10BatchCarousel" className="carousel slide position-relative" data-bs-ride="carousel">
              
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
                     style={{ background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", minHeight: "170px" }}>
                  <div className="row align-items-center h-100 py-2 px-md-3">
                    <div className="col-md-9">
                      <span className="badge bg-warning text-dark fw-bold mb-2 px-3 py-1 rounded-pill">
                        🎓 Welcome Class 10 Scholars
                      </span>
                      <h3 className="fw-bold mb-2 text-white">Class 10th Free Batch (2026-27)</h3>
                      <p className="mb-3 text-light small" style={{ maxWidth: "600px" }}>
                        Master Class 10 concepts across Science, Maths, Social Science & English with Suraj Sir.
                      </p>
                      <button 
                        onClick={() => setCurrentClass10Index(0)}
                        className="btn btn-warning text-dark font-weight-bold fw-bold btn-sm rounded-pill px-4 shadow-sm"
                      >
                        <i className="bi bi-play-fill me-1"></i> Start Introduction
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slide 2 */}
                <div className={`carousel-item p-4 text-white ${activeSlide === 1 ? "active" : ""}`}
                     style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", minHeight: "170px" }}>
                  <div className="row align-items-center h-100 py-2 px-md-3">
                    <div className="col-md-9">
                      <span className="badge bg-light text-success fw-bold mb-2 px-3 py-1 rounded-pill">
                        📐 Mathematics & Science
                      </span>
                      <h3 className="fw-bold mb-2 text-white">Full Chapter Explanations</h3>
                      <p className="mb-3 text-light small" style={{ maxWidth: "600px" }}>
                        In-depth video tutorials for Class 10 Board exam top-scoring strategies and formula sheets.
                      </p>
                      <button 
                        onClick={() => setCurrentClass10Index(1)}
                        className="btn btn-light text-success fw-bold btn-sm rounded-pill px-4 shadow-sm"
                      >
                        <i className="bi bi-play-btn-fill me-1"></i> Play Mathematics
                      </button>
                    </div>
                  </div>
                </div>

                {/* Slide 3 */}
                <div className={`carousel-item p-4 text-white ${activeSlide === 2 ? "active" : ""}`}
                     style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", minHeight: "170px" }}>
                  <div className="row align-items-center h-100 py-2 px-md-3">
                    <div className="col-md-9">
                      <span className="badge bg-warning text-dark fw-bold mb-2 px-3 py-1 rounded-pill">
                        🔥 Board Exam Prep
                      </span>
                      <h3 className="fw-bold mb-2 text-white">100% Free Coaching Content</h3>
                      <p className="mb-3 text-light small" style={{ maxWidth: "600px" }}>
                        Start learning with free structured video lessons and revision guides.
                      </p>
                      <button 
                        onClick={() => setCurrentClass10Index(2)}
                        className="btn btn-warning text-dark fw-bold btn-sm rounded-pill px-4 shadow-sm"
                      >
                        <i className="bi bi-book-fill me-1"></i> Play Science
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
            <div className="card-header bg-dark text-white p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-info text-dark font-monospace fw-bold">
                  <i className="bi bi-record-circle me-1 animate-pulse"></i> CLASS 10 PLAYER
                </span>
                <span className="fw-bold text-light small d-none d-sm-inline">
                  Lecture {currentClass10Index + 1} of {class10Playlist.length}
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
                title={`Class 10 Lecture ${currentClass10Index + 1}: ${currentClass10Lecture.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="border-0 w-100 h-100"
              ></iframe>
            </div>

            {/* Below Video Meta & Controls */}
            <div className="card-body p-3 p-md-4 bg-white">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 border-bottom pb-3 mb-3">
                <div className="w-100">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="badge bg-info bg-opacity-10 text-info fw-bold px-2.5 py-1 rounded-pill">
                      Lecture {currentClass10Index + 1}
                    </span>
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <i className="bi bi-clock-history"></i> Duration: {currentClass10Lecture.duration || "Full Lecture"}
                    </span>
                  </div>
                  <h3 className="h5 h4-md fw-bold text-dark mb-1 text-break">
                    {currentClass10Lecture.title}
                  </h3>
                  <p className="text-secondary mb-0 small">
                    Class 10th Coaching Curriculum • Suraj Sir
                  </p>
                </div>

                {/* Previous & Next Lecture Buttons */}
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevClass10Lecture}
                    disabled={currentClass10Index === 0}
                    className="btn btn-outline-secondary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold text-nowrap disabled:opacity-50"
                  >
                    <i className="bi bi-chevron-left"></i> Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNextClass10Lecture}
                    disabled={currentClass10Index === class10Playlist.length - 1}
                    className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center gap-1 fw-bold text-nowrap shadow-sm disabled:opacity-50"
                  >
                    Next <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Lecture Description */}
              <div className="bg-light p-3 rounded-3 border">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle-fill text-info"></i> Lecture Overview
                </h6>
                <p className="text-muted mb-0 small leading-relaxed text-break" style={{ lineHeight: "1.6" }}>
                  {currentClass10Lecture.description || "Class 10th Free Batch lecture series with Suraj Sir."}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Playlist Column (30% on desktop, Bottom on mobile/tablet) */}
        <div className="col-12 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 rounded-4 sticky-lg-top" style={{ top: "80px" }}>
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 fs-6">
                <i className="bi bi-collection-play-fill text-primary"></i> Class 10 Playlist ({class10Playlist.length})
              </h5>
              <span className="badge bg-success bg-opacity-10 text-success fw-bold rounded-pill px-2.5 py-1 small">
                Free Access
              </span>
            </div>
            
            <div className="card-body p-2 overflow-auto" style={{ maxHeight: "calc(100vh - 220px)", minHeight: "300px" }}>
              <div className="list-group list-group-flush gap-1">
                {class10Playlist.map((item, index) => {
                  const isActive = index === currentClass10Index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentClass10Index(index)}
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
                          <i className="bi bi-clock"></i> {item.duration || "Video"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-2 gap-2">
                        <div className="d-flex align-items-center gap-2 text-break">
                          <i className={`bi ${isActive ? "bi-play-circle-fill text-warning fs-5" : "bi-play-circle text-primary fs-5"}`}></i>
                          <span className={`fw-bold ${isActive ? "text-white" : "text-dark"}`} style={{ fontSize: "0.95rem" }}>
                            {item.title}
                          </span>
                        </div>
                        {isActive && (
                          <span className="badge bg-warning text-dark fw-bold rounded-pill px-2 py-0.5 shrink-0" style={{ fontSize: "0.65rem" }}>
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
                <i className="bi bi-shield-check text-success"></i> Class 10 Free Batch • Select lecture to play
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
