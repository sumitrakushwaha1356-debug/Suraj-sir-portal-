export interface Video {
  id: string;
  title: string;
  duration: string;
  embedCode: string;
  description: string;
  videoUrl?: string;
  subject?: string;
}

export interface Playlist {
  id: string;
  title: string;
  thumbnail: string;
  videoCount: number;
  description: string;
  videos: Video[];
  classLevel?: string;
}

export interface Book {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
  classLevel?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number; // minutes
  questions: Question[];
  classLevel?: string;
}

export interface PaymentRequest {
  id: string;
  _id?: string;
  studentName: string;
  studentEmail: string;
  courseType: string; // "Class 10" or "Class 12"
  amount: number;
  transactionId: string;
  screenshotUrl: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  studentId: string;
  joinedDate: string;
  batch: string;
  attendance: string;
  streak: number;
  googleId?: string;
  photoUrl?: string;
  loginDateTime?: string;
  lastActiveTime?: string;
  isActive?: boolean;
}
