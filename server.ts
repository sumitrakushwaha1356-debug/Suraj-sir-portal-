import express from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "suraj-sir-secret-key-2026-education-portal";

// ==========================================
// SEED DATA CONFIGURATION
// ==========================================

const PLAYLISTS_DATA_SEED = [
  {
    id: "p1-physics",
    title: "Mastering Physics: Mechanics & Kinematics",
    thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400",
    videoCount: 4,
    description: "Complete physics core fundamentals with Suraj Sir. Master Newtonian mechanics, free body diagrams, and standard/advanced exam proofs.",
    videos: [
      {
        id: "v1_1",
        title: "Lecture 1: Kinematics 1D & Equations of Motion",
        duration: "24:15",
        embedCode: "6iS-lOqWeqE",
        description: "A complete derivation of constant acceleration velocity-displacement-time formulas. Master tricky motion graphs and slope representations."
      },
      {
        id: "v1_2",
        title: "Lecture 2: Projectile Motion & Vector Resolution",
        duration: "32:40",
        embedCode: "V379vG7K484",
        description: "How to resolve velocities along horizontal and vertical planes. Solving trajectory range, maximum height, and time of flight parameters."
      },
      {
        id: "v1_3",
        title: "Lecture 3: Newton's Laws of Motion & Free Body Diagrams",
        duration: "28:50",
        embedCode: "T-bX98rD_lI",
        description: "Learn how to isolate physical systems to construct flawless force vector diagrams. Includes complex pulley setups and friction coefficients."
      },
      {
        id: "v1_4",
        title: "Lecture 4: Work-Energy Theorem & Conservation Proofs",
        duration: "35:10",
        embedCode: "vLaG4B-5Mlg",
        description: "Mathematical derivation of mechanical energy conservation. Solving non-conservative work problems with ease."
      }
    ]
  },
  {
    id: "p2-math",
    title: "Advanced Mathematics: Calculus & Limits",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
    videoCount: 3,
    description: "Integral and differential calculus made intuitive. From epsilon-delta proofs to standard tangent derivatives and integration integrals.",
    videos: [
      {
        id: "v2_1",
        title: "Lecture 1: Dynamic Understanding of Limits & Continuity",
        duration: "19:45",
        embedCode: "9vKqVk_AaDY",
        description: "Understand limits from left-hand and right-hand limits. How to evaluate indeterminate forms using factorization, L'Hopital rule, and standard limits."
      },
      {
        id: "v2_2",
        title: "Lecture 2: Derivatives & The Power and Product Rules",
        duration: "26:30",
        embedCode: "N2PpRnFqnqY",
        description: "In-depth visual proof of instantaneous rate of change. Master differentiation techniques for complex algebraic and trigonometric equations."
      },
      {
        id: "v2_3",
        title: "Lecture 3: Definite Integration as Riemann Sums",
        duration: "39:15",
        embedCode: "H7-V0kI7F2c",
        description: "Discover how area under any graph can be approximated as infinite rectangles. Complete guide to standard definite integral substitution tricks."
      }
    ]
  },
  {
    id: "p3-chemistry",
    title: "Organic Chemistry: Carbon Synthesis Mechanisms",
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=400",
    videoCount: 3,
    description: "Crack complex mechanisms including electrophilic aromatic substitution, SN1/SN2 pathways, and isomerism with simple visual blueprinting tricks.",
    videos: [
      {
        id: "v3_1",
        title: "Lecture 1: Hybridization, Resonance, & Inductive Effects",
        duration: "22:10",
        embedCode: "I4m7M8VjFio",
        description: "Learn how molecular orbital shapes define Carbon reactivity. Visual representations of electron donation and stabilization of carbocations."
      },
      {
        id: "v3_2",
        title: "Lecture 2: SN1 vs SN2 Nucleophilic Substitution",
        duration: "30:05",
        embedCode: "7_0o8hA0z8I",
        description: "Step-by-step kinetic comparison. Master why polar aprotic solvents favor SN2 back-attack inversion, while polar protic solvents yield stable SN1 carbocations."
      },
      {
        id: "v3_3",
        title: "Lecture 3: Electrophilic Aromatic Substitution & Benzene Directors",
        duration: "34:50",
        embedCode: "lTfGj-n49G0",
        description: "Understand ortho-, para-, and meta-directors on benzene. Learn mechanism steps: generation of electrophile, sigma complex, and deprotonation."
      }
    ]
  }
];

const BOOKS_DATA_SEED = [
  {
    id: "b1",
    name: "Suraj Sir's Ultimate Physics Shortcuts & Formulas",
    price: 499,
    quantity: 15,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    description: "A legendary handbook loaded with custom speed-solving equations, cheat sheets, and conceptual shortcuts to crack complex competitive exams in seconds.",
    classLevel: "Class 12"
  },
  {
    id: "b2",
    name: "Calculus Mastery: Worksheets and Solved Proofs",
    price: 399,
    quantity: 8,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    description: "Supplementary problem sheet bundle designed specifically to bridge high school algebra into advanced double integral proofs. Personally curated by Suraj Sir.",
    classLevel: "Class 12"
  },
  {
    id: "b3",
    name: "Organic Chemistry: Comprehensive Reaction Blueprint",
    price: 599,
    quantity: 22,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400",
    description: "Visual charts detailing functional group transitions, reagent lists, and mechanism pathways. An absolute must-have memory helper for school board toppers.",
    classLevel: "Class 10"
  }
];

const TESTS_DATA_SEED = [
  {
    id: "t1",
    title: "Kinematics & Newtonian Mechanics Test",
    subject: "Physics",
    duration: 15,
    classLevel: "Class 12",
    questions: [
      {
        id: "q1_1",
        question: "What is the acceleration of an object moving with a strictly constant velocity?",
        options: ["9.8 m/s²", "0 m/s²", "Constant speed / time", "Dependent on the mass of the body"],
        correct: 1
      },
      {
        id: "q1_2",
        question: "If the net force on an isolated body is exactly doubled, what happens to its resulting acceleration?",
        options: ["It is halved", "It remains completely unchanged", "It is doubled", "It is quadrupled"],
        correct: 2
      },
      {
        id: "q1_3",
        question: "Which of the following physical forces is classified as non-conservative?",
        options: ["Gravitational Force", "Friction Force", "Electrostatic Force", "Spring Tension Force"],
        correct: 1
      },
      {
        id: "q1_4",
        question: "A ball is thrown straight upwards. At the very highest point of its trajectory, what is its acceleration?",
        options: ["0 m/s²", "9.8 m/s² downwards", "9.8 m/s² upwards", "Varies depending on its initial weight"],
        correct: 1
      }
    ]
  },
  {
    id: "t2",
    title: "Limits & Tangent Differentiation Master Test",
    subject: "Mathematics",
    duration: 20,
    classLevel: "Class 12",
    questions: [
      {
        id: "q2_1",
        question: "What is the derivative of x² * sin(x) with respect to x?",
        options: ["2x * cos(x)", "2x * sin(x) + x² * cos(x)", "2x * sin(x) - x² * cos(x)", "x² * cos(x)"],
        correct: 1
      },
      {
        id: "q2_2",
        question: "Evaluate the limit as x approaches 0 of sin(x) / x.",
        options: ["0", "Infinity", "1", "Does not exist"],
        correct: 2
      },
      {
        id: "q2_3",
        question: "What mathematical term represents the rate of change of the velocity function?",
        options: ["Speed", "Jerk", "Acceleration", "Displacement"],
        correct: 2
      },
      {
        id: "q2_4",
        question: "If f(x) = ln(x), what is f'(x) at the point x = 5?",
        options: ["1/5", "ln(5)", "5", "1"],
        correct: 0
      }
    ]
  },
  {
    id: "t3",
    title: "Alkanes & Alkynes Chemical Reaction Quiz",
    subject: "Chemistry",
    duration: 10,
    classLevel: "Class 10",
    questions: [
      {
        id: "q3_1",
        question: "Which metal catalyst is commonly utilized during hydrogenation of unsaturated alkenes?",
        options: ["Anhydrous AlCl3", "Nickel, Palladium or Platinum (Ni/Pd/Pt)", "Concentrated Sulfuric Acid", "Sodium dissolved in liquid NH3"],
        correct: 1
      },
      {
        id: "q3_2",
        question: "What is the primary organic product of ethyne hydration in HgSO4 + H2SO4?",
        options: ["Ethanol", "Ethanal (Acetaldehyde)", "Ethene gas", "Ethanoic Acid"],
        correct: 1
      },
      {
        id: "q3_3",
        question: "What configuration alteration occurs during an SN2 nucleophilic substitution?",
        options: ["Formation of a racemic mixture", "Strict retention of stereochemical configuration", "Complete inversion of configuration (Walden Inversion)", "No physical configuration change occurs"],
        correct: 2
      }
    ]
  }
];

// ==========================================
// DUAL-DATABASE ARCHITECTURE (MONGO VS LOCAL FILE)
// ==========================================

let useMongoDB = false;

// Mongoose Schemas definitions
const PlaylistSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  thumbnail: String,
  videoCount: Number,
  description: String,
  classLevel: { type: String, default: "Class 12" }, // "Class 10" or "Class 12"
  videos: [{
    id: String,
    title: String,
    duration: String,
    embedCode: String,
    description: String
  }]
});

const PurchaseSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  courseType: { type: String, required: true }, // "Class 10" or "Class 12"
  amount: Number,
  purchaseDate: String
});

const PaymentRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentName: String,
  studentEmail: String,
  courseType: String, // "Class 10" or "Class 12"
  amount: Number,
  transactionId: String,
  screenshotUrl: String,
  status: { type: String, default: "Pending" }, // "Pending", "Approved", "Rejected"
  createdAt: String,
  approvedAt: String,
  rejectedAt: String
});

const BookSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  description: String,
  classLevel: { type: String, default: "Class 12" } // "Class 10" or "Class 12"
});

const TestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  subject: String,
  duration: Number,
  questions: [{
    id: String,
    question: String,
    options: [String],
    correct: Number
  }],
  published: { type: Boolean, default: true },
  classLevel: { type: String, default: "Class 12" } // "Class 10" or "Class 12"
});

const StudentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  studentId: String,
  joinedDate: String,
  batch: String,
  attendance: String,
  streak: Number,
  passwordHash: String,
  role: { type: String, default: "student" },
  googleId: String,
  photoUrl: String,
  loginDateTime: String,
  lastActiveTime: String,
  isActive: { type: Boolean, default: true }
});

const PlaylistModel = (mongoose.models.Playlist || mongoose.model("Playlist", PlaylistSchema)) as any;
const PurchaseModel = (mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema)) as any;
const PaymentRequestModel = (mongoose.models.PaymentRequest || mongoose.model("PaymentRequest", PaymentRequestSchema)) as any;
const BookModel = (mongoose.models.Book || mongoose.model("Book", BookSchema)) as any;
const TestModel = (mongoose.models.Test || mongoose.model("Test", TestSchema)) as any;
const StudentModel = (mongoose.models.Student || mongoose.model("Student", StudentSchema)) as any;

// Local JSON File Database Fallback setup
const DB_FILE = path.join(process.cwd(), "db.json");

const getInitialSeedState = () => ({
  playlists: JSON.parse(JSON.stringify(PLAYLISTS_DATA_SEED)),
  books: JSON.parse(JSON.stringify(BOOKS_DATA_SEED)),
  tests: JSON.parse(JSON.stringify(TESTS_DATA_SEED)),
  students: [
    {
      name: "Admin",
      email: "admin@surajsir.com",
      studentId: "SSE-2026-ADMIN",
      joinedDate: "Jan 10, 2026",
      batch: "Admin Portal",
      attendance: "100.0%",
      streak: 100,
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin"
    },
    {
      name: "Saurabh Kumar",
      email: "student@surajsir.com",
      studentId: "SSE-2026-9842",
      joinedDate: "Mar 12, 2026",
      batch: "JEE Elite Masterclass Class XII",
      attendance: "96.4%",
      streak: 5,
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "student"
    }
  ],
  purchases: [],
  paymentRequests: []
});

// Load local database representation from JSON
const getLocalData = (): any => {
  if (!fs.existsSync(DB_FILE)) {
    const freshState = getInitialSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(freshState, null, 2), "utf-8");
    return freshState;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.purchases) parsed.purchases = [];
    if (!parsed.playlists) parsed.playlists = [];
    if (!parsed.paymentRequests) parsed.paymentRequests = [];
    
    // Auto-update seed data fields for local db
    parsed.books.forEach((b: any) => {
      if (b.id === "b1" || b.id === "b2") b.classLevel = "Class 12";
      if (b.id === "b3") b.classLevel = "Class 10";
    });
    parsed.tests.forEach((t: any) => {
      if (t.id === "t1" || t.id === "t2") t.classLevel = "Class 12";
      if (t.id === "t3") t.classLevel = "Class 10";
    });
    return parsed;
  } catch (err) {
    const freshState = getInitialSeedState();
    return freshState;
  }
};

const saveLocalData = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
};

// Initialize DB Engine Connection
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log("[MongoDB] Connected successfully to Cloud Cluster Database.");
      useMongoDB = true;
      
      // Perform initial Seeding of MongoDB if empty
      const plistCount = await PlaylistModel.countDocuments();
      if (plistCount === 0) {
        console.log("[MongoDB] Database empty. Seeding initial records into Cloud collections...");
        const seed = getInitialSeedState();
        await PlaylistModel.insertMany(seed.playlists);
        await BookModel.insertMany(seed.books);
        await TestModel.insertMany(seed.tests);
        await StudentModel.insertMany(seed.students);
        console.log("[MongoDB] Seeding completed.");
      }
    })
    .catch((err) => {
      // Quietly fall back to local file-based database
      useMongoDB = false;
    });
} else {
  console.log("[Express] MONGODB_URI not set. Running in Local Database Mode with './db.json' storage.");
}

// ==========================================
// SECURITY AUTHENTICATION MIDDLEWARES
// ==========================================

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token missing." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Access denied. Token is invalid or has expired." });
    }
    req.user = decoded;
    next();
  });
}

function requireAdmin(req: any, res: any, next: any) {
  const adminEmail = process.env.ADMIN_EMAIL || "surajeductionofficial@gmail.com";
  if (!req.user || req.user.role !== "admin" || req.user.email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
    return res.status(403).json({ error: "Restricted administrative clearance required." });
  }
  next();
}

// ==========================================
// REST BACKEND API ENDPOINTS
// ==========================================

// --- AUTH & USER PROFILE APIs ---

// 1. User Register (Student Registration)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All registration fields are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const passwordHash = bcrypt.hashSync(password, 10);
    const studentId = `SSE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const joinedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    const newStudent = {
      name,
      email: emailLower,
      studentId,
      joinedDate,
      batch: "JEE Elite Masterclass Class XII",
      attendance: "100.0%",
      streak: 1,
      passwordHash,
      role: "student"
    };

    if (useMongoDB) {
      const exists = await StudentModel.findOne({ email: emailLower });
      if (exists) {
        return res.status(400).json({ error: "This email address is already registered." });
      }
      await StudentModel.create(newStudent);
    } else {
      const data = getLocalData();
      const exists = data.students.find((s: any) => s.email === emailLower);
      if (exists) {
        return res.status(400).json({ error: "This email address is already registered." });
      }
      data.students.push(newStudent);
      saveLocalData(data);
    }

    // Sign JWT
    const token = jwt.sign(
      { email: emailLower, role: "student", name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        name,
        email: emailLower,
        studentId,
        joinedDate,
        batch: newStudent.batch,
        attendance: newStudent.attendance,
        streak: newStudent.streak,
        role: "student"
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- GOOGLE OAUTH FLOW ENDPOINTS ---

// Google OAuth URL generation (detects whether to run real or mock flow)
app.get("/api/auth/google/url", (req, res) => {
  const clientOrigin = req.query.origin || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (
    !GOOGLE_CLIENT_ID || 
    GOOGLE_CLIENT_ID === "your_real_google_client_id" || 
    GOOGLE_CLIENT_ID === "MOCK_CLIENT_ID" ||
    !GOOGLE_CLIENT_SECRET || 
    GOOGLE_CLIENT_SECRET === "your_real_google_client_secret" ||
    GOOGLE_CLIENT_SECRET === ""
  ) {
    return res.status(400).json({ 
      error: "Google OAuth credentials are missing from the server environment. Please define GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file." 
    });
  }

  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${clientOrigin}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: clientOrigin as string
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

// Mock Google Consent Page (renders a beautiful, fully functional mock Google Account Chooser)
app.get("/auth/mock-google-consent", (req, res) => {
  const state = req.query.state || "";
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sign in with Google</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      </style>
    </head>
    <body class="bg-slate-50 flex items-center justify-center min-h-screen p-4">
      <div class="bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100 max-w-md w-full relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-400"></div>
        
        <div class="flex flex-col items-center mb-8">
          <svg class="w-10 h-10 mb-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <h1 class="text-xl font-bold text-slate-950">Sign in with Google</h1>
          <p class="text-xs text-slate-500 mt-1">to continue to <span class="font-semibold text-blue-600">Suraj Education Portal</span></p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select a simulated account:</h2>
          
          <button onclick="submitSim('Rahul Sharma', 'rahul.sharma@gmail.com', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150')" class="w-full flex items-center p-3.5 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/20 transition text-left group">
            <img class="w-10 h-10 rounded-full mr-3.5 object-cover ring-2 ring-slate-100 group-hover:ring-blue-100" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150" alt="">
            <div>
              <div class="text-sm font-bold text-slate-900">Rahul Sharma</div>
              <div class="text-xs text-slate-500">rahul.sharma@gmail.com</div>
            </div>
          </button>

          <button onclick="submitSim('Priya Patel', 'priya.patel@gmail.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150')" class="w-full flex items-center p-3.5 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/20 transition text-left group">
            <img class="w-10 h-10 rounded-full mr-3.5 object-cover ring-2 ring-slate-100 group-hover:ring-blue-100" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" alt="">
            <div>
              <div class="text-sm font-bold text-slate-900">Priya Patel</div>
              <div class="text-xs text-slate-500">priya.patel@gmail.com</div>
            </div>
          </button>

          <button onclick="submitSim('Amit Kushwaha', 'amit.kushwaha@gmail.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150')" class="w-full flex items-center p-3.5 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/20 transition text-left group">
            <img class="w-10 h-10 rounded-full mr-3.5 object-cover ring-2 ring-slate-100 group-hover:ring-blue-100" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="">
            <div>
              <div class="text-sm font-bold text-slate-900">Amit Kushwaha</div>
              <div class="text-xs text-slate-500">amit.kushwaha@gmail.com</div>
            </div>
          </button>
        </div>

        <div class="relative flex py-5 items-center">
          <div class="flex-grow border-t border-slate-100"></div>
          <span class="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or enter custom details</span>
          <div class="flex-grow border-t border-slate-100"></div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <input type="text" id="cust_name" placeholder="John Doe" class="mt-1 block w-full border border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input type="email" id="cust_email" placeholder="johndoe@gmail.com" class="mt-1 block w-full border border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold">
          </div>
          <button onclick="submitCustom()" class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/10 transition duration-200">
            Continue with Custom Account
          </button>
        </div>

        <div class="text-[10px] text-slate-400 text-center mt-6 font-medium">
          Simulated OAuth Consent Flow for development testing.
        </div>
      </div>

      <script>
        const state = "${state}";
        function submitSim(name, email, photo) {
          const url = "/auth/callback?code=mock_code&state=" + encodeURIComponent(state) + 
                      "&mock_name=" + encodeURIComponent(name) + 
                      "&mock_email=" + encodeURIComponent(email) + 
                      "&mock_photo=" + encodeURIComponent(photo);
          window.location.href = url;
        }
        function submitCustom() {
          const name = document.getElementById("cust_name").value.trim() || "Google Student";
          const email = document.getElementById("cust_email").value.trim() || "student.google@gmail.com";
          const photo = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150";
          submitSim(name, email, photo);
        }
      </script>
    </body>
    </html>
  `);
});

// Callback handler handles both mock and real Google token exchange
app.get([
  "/auth/callback", 
  "/auth/callback/", 
  "/api/auth/google/callback", 
  "/api/auth/google/callback/"
], async (req, res) => {
  try {
    const { code, state } = req.query;
    
    let email = "";
    let name = "";
    let photoUrl = "";
    let googleId = "";

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    // Detect if we should fall back to mock sign in
    const isMock = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "MOCK_CLIENT_ID" || (code as string || "").startsWith("mock_");

    if (isMock) {
      email = (req.query.mock_email as string || "student.google@gmail.com").toLowerCase().trim();
      name = req.query.mock_name as string || "Google Student";
      photoUrl = req.query.mock_photo as string || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150";
      googleId = "g-" + Math.random().toString(36).substring(2, 11);
    } else {
      const clientOrigin = (state as string) || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const isApiCallback = req.path.startsWith("/api/auth/google/callback");
      const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${clientOrigin}${isApiCallback ? "/api/auth/google/callback" : "/auth/callback"}`;

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString()
      });
      
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || "Failed to exchange Google authorization code.");
      }

      const accessToken = tokenData.access_token;
      const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error("Failed to retrieve Google user profile info.");
      }

      email = (profileData.email as string).toLowerCase().trim();
      name = profileData.name || "Google User";
      photoUrl = profileData.picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150";
      googleId = profileData.sub || "g-" + Math.random().toString(36).substring(2, 11);
    }

    const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });

    let student: any = null;

    if (useMongoDB) {
      student = await StudentModel.findOne({ email });
    } else {
      const data = getLocalData();
      student = data.students.find((s: any) => s.email === email);
    }

    if (student) {
      // Check deactivation security rule
      if (student.isActive === false) {
        return res.send(`
          <html>
            <head>
              <meta charset="utf-8">
              <title>Access Denied</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
            </head>
            <body class="bg-slate-50 flex items-center justify-center min-h-screen p-4" style="font-family: 'Plus Jakarta Sans', sans-serif;">
              <div class="bg-white p-8 rounded-3xl shadow-2xl border border-red-50 max-w-md w-full text-center space-y-5">
                <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">!</div>
                <h2 class="text-xl font-extrabold text-slate-900">Account Deactivated</h2>
                <p class="text-sm text-slate-500 leading-relaxed">Your student profile has been deactivated by the administrator. Please contact Suraj Sir or your coordinator to restore system privileges.</p>
                <button onclick="window.close()" class="w-full bg-slate-900 text-white rounded-2xl py-3.5 text-sm font-bold hover:bg-slate-800 transition duration-200">Close Window</button>
              </div>
            </body>
          </html>
        `);
      }

      // Update exists record
      student.googleId = googleId;
      student.photoUrl = photoUrl;
      if (!student.loginDateTime) student.loginDateTime = nowStr;
      student.lastActiveTime = nowStr;

      if (useMongoDB) {
        await StudentModel.findOneAndUpdate(
          { email },
          { $set: { googleId, photoUrl, lastActiveTime: nowStr, loginDateTime: student.loginDateTime || nowStr } }
        );
      } else {
        const data = getLocalData();
        const idx = data.students.findIndex((s: any) => s.email === email);
        data.students[idx] = { ...data.students[idx], googleId, photoUrl, lastActiveTime: nowStr, loginDateTime: student.loginDateTime || nowStr };
        saveLocalData(data);
      }
    } else {
      // Create new Google registered Student
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentId = `SSE-2026-${randomIdSuffix}`;
      const newStudent = {
        name,
        email,
        studentId,
        joinedDate: todayStr,
        batch: "Google Batch Class",
        attendance: "100.0%",
        streak: 1,
        role: "student",
        googleId,
        photoUrl,
        loginDateTime: nowStr,
        lastActiveTime: nowStr,
        isActive: true
      };

      if (useMongoDB) {
        await StudentModel.create(newStudent);
      } else {
        const data = getLocalData();
        data.students.push(newStudent);
        saveLocalData(data);
      }
      student = newStudent;
    }

    // Sign JWT
    const token = jwt.sign(
      { email, role: "student", name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = {
      name,
      email,
      studentId: student.studentId,
      joinedDate: student.joinedDate,
      batch: student.batch || "Google Batch Class",
      attendance: student.attendance || "100.0%",
      streak: student.streak || 1,
      role: "student",
      photoUrl,
      isActive: true,
      loginDateTime: student.loginDateTime || nowStr,
      lastActiveTime: nowStr
    };

    // Post to opener or save locally and redirect
    res.send(`
      <html>
        <body>
          <script>
            const token = "${token}";
            const user = ${JSON.stringify(userObj)};
            
            // Save to local storage for both cases
            localStorage.setItem("token", token);
            localStorage.setItem("role", "student");
            localStorage.setItem("userEmail", user.email);

            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                token: token,
                user: user
              }, '*');
              window.close();
            } else {
              window.location.href = '/student-dashboard';
            }
          </script>
          <p style="font-family: sans-serif; text-align: center; margin-top: 100px; font-weight: bold; color: #1e293b;">
            Authentication successful. Redirecting to student terminal...
          </p>
        </body>
      </html>
    `);

  } catch (err: any) {
    res.status(500).send(`
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen p-4">
          <div class="bg-white p-8 rounded-3xl shadow-2xl border border-red-100 max-w-md w-full text-center space-y-4">
            <h2 class="text-xl font-bold text-red-600">Google Login Error</h2>
            <p class="text-sm text-slate-500">${err.message}</p>
            <button onclick="window.close()" class="w-full bg-slate-900 text-white rounded-2xl py-3.5 text-sm font-bold hover:bg-slate-800 transition">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// --- NEW FIREBASE AUTHENTICATION GOOGLE LOGIN ENDPOINT ---
app.post("/api/auth/firebase-login", async (req, res) => {
  try {
    const { email, name, photoUrl, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required for Google Sign-In verification." });
    }

    const emailLower = email.toLowerCase().trim();
    const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });

    let student: any = null;

    if (useMongoDB) {
      student = await StudentModel.findOne({ email: emailLower });
    } else {
      const data = getLocalData();
      student = data.students.find((s: any) => s.email === emailLower);
    }

    if (student) {
      // Check deactivation security rule
      if (student.isActive === false) {
        return res.status(403).json({ error: "Your student profile has been deactivated by the administrator. Please contact Suraj Sir or your coordinator to restore system privileges." });
      }

      // Update existing record
      student.googleId = googleId;
      student.photoUrl = photoUrl;
      if (!student.loginDateTime) student.loginDateTime = nowStr;
      student.lastActiveTime = nowStr;

      if (useMongoDB) {
        await StudentModel.findOneAndUpdate(
          { email: emailLower },
          { $set: { googleId, photoUrl, lastActiveTime: nowStr, loginDateTime: student.loginDateTime || nowStr } }
        );
      } else {
        const data = getLocalData();
        const idx = data.students.findIndex((s: any) => s.email === emailLower);
        data.students[idx] = { ...data.students[idx], googleId, photoUrl, lastActiveTime: nowStr, loginDateTime: student.loginDateTime || nowStr };
        saveLocalData(data);
      }
    } else {
      // Create new Google registered Student
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentId = `SSE-2026-${randomIdSuffix}`;
      const newStudent = {
        name: name || "Google Student",
        email: emailLower,
        studentId,
        joinedDate: todayStr,
        batch: "Google Batch Class",
        attendance: "100.0%",
        streak: 1,
        role: "student",
        googleId,
        photoUrl: photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        loginDateTime: nowStr,
        lastActiveTime: nowStr,
        isActive: true
      };

      if (useMongoDB) {
        await StudentModel.create(newStudent);
      } else {
        const data = getLocalData();
        data.students.push(newStudent);
        saveLocalData(data);
      }
      student = newStudent;
    }

    // Sign JWT
    const token = jwt.sign(
      { email: emailLower, role: "student", name: student.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = {
      name: student.name,
      email: emailLower,
      studentId: student.studentId,
      joinedDate: student.joinedDate,
      batch: student.batch || "Google Batch Class",
      attendance: student.attendance || "100.0%",
      streak: student.streak || 1,
      role: "student",
      photoUrl: student.photoUrl,
      isActive: true,
      loginDateTime: student.loginDateTime || nowStr,
      lastActiveTime: nowStr
    };

    res.json({
      token,
      user: userObj
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. User Login (Supports both Student & Admin Login with strict security validation)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, securityPin } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "surajeductionofficial@gmail.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Suraj@87695,.";
    const ADMIN_PIN = process.env.ADMIN_PIN || "8976";

    // If attempting Admin login (indicated by securityPin being present or matching admin email)
    if (securityPin !== undefined || emailLower === ADMIN_EMAIL.toLowerCase().trim()) {
      if (emailLower !== ADMIN_EMAIL.toLowerCase().trim() || password !== ADMIN_PASSWORD || securityPin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid admin credentials." });
      }

      // Successful Admin Login
      const token = jwt.sign(
        { email: ADMIN_EMAIL, role: "admin", name: "Admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          name: "Admin",
          email: ADMIN_EMAIL,
          studentId: "SSE-2026-ADMIN",
          joinedDate: "Jan 10, 2026",
          batch: "Admin Portal",
          attendance: "100.0%",
          streak: 100,
          role: "admin"
        }
      });
    }

    // For Students - perform standard database verification
    let userRecord: any = null;
    if (useMongoDB) {
      userRecord = await StudentModel.findOne({ email: emailLower });
    } else {
      const data = getLocalData();
      userRecord = data.students.find((s: any) => s.email === emailLower);
    }

    // Standard database accounts cannot have administrative role (Only process.env admin is allowed)
    if (!userRecord || userRecord.role === "admin") {
      return res.status(401).json({ error: "Invalid email credentials or password." });
    }

    // Validate account status
    if (userRecord.isActive === false) {
      return res.status(403).json({ error: "Your account is deactivated. Please contact support." });
    }

    // Verify Password
    const matches = bcrypt.compareSync(password, userRecord.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Invalid email credentials or password." });
    }

    // Sign JWT for student
    const token = jwt.sign(
      { email: userRecord.email, role: userRecord.role, name: userRecord.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        name: userRecord.name,
        email: userRecord.email,
        studentId: userRecord.studentId,
        joinedDate: userRecord.joinedDate,
        batch: userRecord.batch,
        attendance: userRecord.attendance,
        streak: userRecord.streak,
        role: userRecord.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get verified active user state (with direct support for environment admin)
app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const email = req.user.email;
    const adminEmail = process.env.ADMIN_EMAIL || "surajeductionofficial@gmail.com";

    if (req.user.role === "admin" && email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
      return res.json({
        name: "Admin",
        email: adminEmail,
        studentId: "SSE-2026-ADMIN",
        joinedDate: "Jan 10, 2026",
        batch: "Admin Portal",
        attendance: "100.0%",
        streak: 100,
        role: "admin"
      });
    }

    let userRecord: any = null;
    if (useMongoDB) {
      userRecord = await StudentModel.findOne({ email });
    } else {
      const data = getLocalData();
      userRecord = data.students.find((s: any) => s.email === email);
    }

    // Block any db-level user from claiming admin role
    if (!userRecord || userRecord.role === "admin") {
      return res.status(404).json({ error: "Active profile record not found." });
    }

    // Block deactivated profiles
    if (userRecord.isActive === false) {
      return res.status(403).json({ error: "Account deactivated. Please contact your administrator." });
    }

    res.json({
      name: userRecord.name,
      email: userRecord.email,
      studentId: userRecord.studentId,
      joinedDate: userRecord.joinedDate,
      batch: userRecord.batch,
      attendance: userRecord.attendance,
      streak: userRecord.streak,
      role: userRecord.role,
      photoUrl: userRecord.photoUrl,
      loginDateTime: userRecord.loginDateTime,
      lastActiveTime: userRecord.lastActiveTime,
      isActive: userRecord.isActive
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update dynamic student streak, name, or profile (Student/Admin permission)
app.put("/api/students/:email", authenticateToken, async (req: any, res) => {
  try {
    const { email } = req.params;
    const { name, batch, attendance, streak } = req.body;

    // Check permissions (Students can only edit themselves, Admins can edit anyone)
    if (req.user.role !== "admin" && req.user.email !== email) {
      return res.status(403).json({ error: "Access denied. Cannot update another user's profile." });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (batch !== undefined) updates.batch = batch;
    if (attendance !== undefined) updates.attendance = attendance;
    if (streak !== undefined) updates.streak = streak;

    if (useMongoDB) {
      const result = await StudentModel.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { $set: updates },
        { new: true }
      );
      if (!result) return res.status(404).json({ error: "Student not found." });
      res.json(result);
    } else {
      const data = getLocalData();
      const idx = data.students.findIndex((s: any) => s.email === email.toLowerCase().trim());
      if (idx === -1) return res.status(404).json({ error: "Student not found." });
      
      data.students[idx] = { ...data.students[idx], ...updates };
      saveLocalData(data);
      res.json(data.students[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get all student records (Admin only)
app.get("/api/students", authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (useMongoDB) {
      const students = await StudentModel.find({ role: "student" }).select("-passwordHash");
      res.json(students);
    } else {
      const data = getLocalData();
      const filtered = data.students
        .filter((s: any) => s.role === "student")
        .map(({ passwordHash, ...rest }: any) => rest);
      res.json(filtered);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update student active status (Admin only)
app.put("/api/admin/students/:email/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ error: "isActive parameter is required" });
    }
    
    const emailLower = email.toLowerCase().trim();
    
    if (useMongoDB) {
      const student = await StudentModel.findOneAndUpdate(
        { email: emailLower },
        { $set: { isActive: !!isActive } },
        { new: true }
      );
      if (!student) return res.status(404).json({ error: "Student record not found." });
      res.json({ success: true, student });
    } else {
      const data = getLocalData();
      const idx = data.students.findIndex((s: any) => s.email === emailLower);
      if (idx === -1) return res.status(404).json({ error: "Student record not found." });
      data.students[idx].isActive = !!isActive;
      saveLocalData(data);
      res.json({ success: true, student: data.students[idx] });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a student record (Admin only)
app.delete("/api/admin/students/:email", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const emailLower = email.toLowerCase().trim();
    
    if (useMongoDB) {
      const result = await StudentModel.findOneAndDelete({ email: emailLower });
      if (!result) return res.status(404).json({ error: "Student record not found." });
      res.json({ success: true, message: "Student record deleted successfully." });
    } else {
      const data = getLocalData();
      const idx = data.students.findIndex((s: any) => s.email === emailLower);
      if (idx === -1) return res.status(404).json({ error: "Student record not found." });
      data.students.splice(idx, 1);
      saveLocalData(data);
      res.json({ success: true, message: "Student record deleted successfully." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- PLAYLISTS & VIDEO LECTURES APIs ---

// 6. Get all playlists (GET is open for students to study)
app.get("/api/videos", async (req, res) => {
  try {
    if (useMongoDB) {
      const playlists = await PlaylistModel.find();
      res.json(playlists);
    } else {
      const data = getLocalData();
      res.json(data.playlists);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Create custom playlist (Admin only)
app.post("/api/playlists", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, thumbnail, description, classLevel } = req.body;
    if (!title) return res.status(400).json({ error: "Playlist title is required." });

    const newPlaylist = {
      id: "pl-" + Math.random().toString(36).substring(2, 9),
      title,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400",
      videoCount: 0,
      description: description || "New Course batch lectures uploaded by Suraj Sir.",
      classLevel: classLevel || "Class 12",
      videos: []
    };

    if (useMongoDB) {
      await PlaylistModel.create(newPlaylist);
    } else {
      const data = getLocalData();
      data.playlists.push(newPlaylist);
      saveLocalData(data);
    }
    res.status(201).json(newPlaylist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Update playlist metadata (Admin only)
app.put("/api/playlists/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, thumbnail, description, classLevel } = req.body;

    if (useMongoDB) {
      const original = await PlaylistModel.findOne({ id });
      if (!original) return res.status(404).json({ error: "Playlist not found." });

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (thumbnail !== undefined) updates.thumbnail = thumbnail;
      if (description !== undefined) updates.description = description;
      if (classLevel !== undefined) updates.classLevel = classLevel;

      const result = await PlaylistModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      res.json(result);
    } else {
      const data = getLocalData();
      const idx = data.playlists.findIndex((p: any) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Playlist not found." });

      if (title !== undefined) data.playlists[idx].title = title;
      if (thumbnail !== undefined) data.playlists[idx].thumbnail = thumbnail;
      if (description !== undefined) data.playlists[idx].description = description;
      if (classLevel !== undefined) data.playlists[idx].classLevel = classLevel;

      saveLocalData(data);
      res.json(data.playlists[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Delete playlist (Admin only)
app.delete("/api/playlists/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (useMongoDB) {
      const result = await PlaylistModel.findOneAndDelete({ id });
      if (!result) return res.status(404).json({ error: "Playlist not found." });
    } else {
      const data = getLocalData();
      const filtered = data.playlists.filter((p: any) => p.id !== id);
      if (filtered.length === data.playlists.length) {
        return res.status(404).json({ error: "Playlist not found." });
      }
      data.playlists = filtered;
      saveLocalData(data);
    }
    res.json({ message: "Playlist successfully deleted.", id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Add video to playlist syllabus (Admin only)
app.post("/api/playlists/:id/videos", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, embedCode, description, videoUrl } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Lecture title is required." });
    }

    const newVideo = {
      id: "v-" + Math.random().toString(36).substring(2, 9),
      title,
      duration: duration || "15:00",
      embedCode: embedCode || "",
      videoUrl: videoUrl || "",
      description: description || "No supplementary lecture information provided."
    };

    if (useMongoDB) {
      const playlist = await PlaylistModel.findOne({ id });
      if (!playlist) return res.status(404).json({ error: "Playlist not found." });
      
      playlist.videos.push(newVideo);
      playlist.videoCount = playlist.videos.length;
      await playlist.save();
      res.status(201).json(playlist);
    } else {
      const data = getLocalData();
      const idx = data.playlists.findIndex((p: any) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Playlist not found." });

      data.playlists[idx].videos.push(newVideo);
      data.playlists[idx].videoCount = data.playlists[idx].videos.length;
      saveLocalData(data);
      res.status(201).json(data.playlists[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Edit specific video inside playlist (Admin only)
app.put("/api/playlists/:id/videos/:vId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, vId } = req.params;
    const { title, duration, embedCode, description, videoUrl } = req.body;

    if (useMongoDB) {
      const playlist = await PlaylistModel.findOne({ id });
      if (!playlist) return res.status(404).json({ error: "Playlist not found." });

      const video = playlist.videos.find((v: any) => v.id === vId);
      if (!video) return res.status(404).json({ error: "Lecture video not found." });

      if (title !== undefined) video.title = title;
      if (duration !== undefined) video.duration = duration;
      if (embedCode !== undefined) video.embedCode = embedCode;
      if (description !== undefined) video.description = description;
      if (videoUrl !== undefined) video.videoUrl = videoUrl;

      await playlist.save();
      res.json(playlist);
    } else {
      const data = getLocalData();
      const idx = data.playlists.findIndex((p: any) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Playlist not found." });

      const vIdx = data.playlists[idx].videos.findIndex((v: any) => v.id === vId);
      if (vIdx === -1) return res.status(404).json({ error: "Lecture video not found in playlist." });

      if (title !== undefined) data.playlists[idx].videos[vIdx].title = title;
      if (duration !== undefined) data.playlists[idx].videos[vIdx].duration = duration;
      if (embedCode !== undefined) data.playlists[idx].videos[vIdx].embedCode = embedCode;
      if (description !== undefined) data.playlists[idx].videos[vIdx].description = description;
      if (videoUrl !== undefined) data.playlists[idx].videos[vIdx].videoUrl = videoUrl;

      saveLocalData(data);
      res.json(data.playlists[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Delete video from playlist syllabus (Admin only)
app.delete("/api/playlists/:id/videos/:vId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, vId } = req.params;

    if (useMongoDB) {
      const playlist = await PlaylistModel.findOne({ id });
      if (!playlist) return res.status(404).json({ error: "Playlist not found." });

      const originalCount = playlist.videos.length;
      playlist.videos = playlist.videos.filter((v: any) => v.id !== vId);
      if (playlist.videos.length === originalCount) {
        return res.status(404).json({ error: "Lecture video not found." });
      }
      playlist.videoCount = playlist.videos.length;
      await playlist.save();
      res.json(playlist);
    } else {
      const data = getLocalData();
      const idx = data.playlists.findIndex((p: any) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Playlist not found." });

      const originalCount = data.playlists[idx].videos.length;
      data.playlists[idx].videos = data.playlists[idx].videos.filter((v: any) => v.id !== vId);
      if (data.playlists[idx].videos.length === originalCount) {
        return res.status(404).json({ error: "Lecture video not found." });
      }
      data.playlists[idx].videoCount = data.playlists[idx].videos.length;
      saveLocalData(data);
      res.json(data.playlists[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- VIDEO MANAGEMENT & PURCHASES CUSTOM APIs ---

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// Copy UPI payment QR code to public uploads directory for reliable client loading
const qrSource = path.join(process.cwd(), "src", "assets", "images", "coaching_upi_qr_1783682640556.jpg");
const qrDest = path.join(UPLOADS_DIR, "coaching_upi_qr.jpg");
if (fs.existsSync(qrSource)) {
  fs.copyFileSync(qrSource, qrDest);
  console.log("[Express] Successfully copied coaching payment QR code to public uploads directory.");
} else {
  console.log("[Express] Warning: Source QR code not found at " + qrSource);
}

// 12a. Base64 Image/Video file upload
app.post("/api/upload", authenticateToken, async (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ error: "Filename and base64Data are required." });
    }
    
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    
    const ext = path.extname(filename) || ".mp4";
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    fs.writeFileSync(filePath, buffer);
    
    res.json({ url: `/uploads/${uniqueFilename}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12b. Get playlists for logged-in student (with evaluated lock status)
app.get("/api/student/playlists", authenticateToken, async (req: any, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    
    // Fetch all playlists
    let playlists = [];
    if (useMongoDB) {
      playlists = await PlaylistModel.find().lean();
    } else {
      const data = getLocalData();
      playlists = JSON.parse(JSON.stringify(data.playlists));
    }
    
    // Fetch all purchase records for this student (and include approved payment requests as a double-layered check)
    let purchases = [];
    if (useMongoDB) {
      purchases = await PurchaseModel.find({
        studentEmail: { $regex: new RegExp("^" + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      }).lean();
      const approvedRequests = await PaymentRequestModel.find({
        studentEmail: { $regex: new RegExp("^" + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
        status: "Approved"
      }).lean();
      for (const r of approvedRequests) {
        if (!purchases.some((p: any) => p.courseType === r.courseType)) {
          purchases.push({
            studentEmail: email,
            courseType: r.courseType,
            amount: r.amount
          });
        }
      }
    } else {
      const data = getLocalData();
      purchases = data.purchases.filter((p: any) => (p.studentEmail || "").toLowerCase().trim() === email);
      const approvedRequests = data.paymentRequests.filter((r: any) => (r.studentEmail || "").toLowerCase().trim() === email && r.status === "Approved");
      for (const r of approvedRequests) {
        if (!purchases.some((p: any) => p.courseType === r.courseType)) {
          purchases.push({
            studentEmail: email,
            courseType: r.courseType,
            amount: r.amount
          });
        }
      }
    }
    
    const adminEmail = (process.env.ADMIN_EMAIL || "surajeductionofficial@gmail.com").toLowerCase().trim();
    const isAdmin = email === adminEmail;
    
    const hasClass10 = isAdmin || purchases.some((p: any) => p.courseType === "Class 10");
    const hasClass12 = isAdmin || purchases.some((p: any) => p.courseType === "Class 12");
    
    // Map playlists to include locked/unlocked status
    const studentPlaylists = playlists.map((pl: any) => {
      const level = pl.classLevel || "Class 12";
      let isPurchased = false;
      if (level === "Class 10" || level === "10th") isPurchased = hasClass10;
      else if (level === "Class 12" || level === "12th") isPurchased = hasClass12;
      
      return {
        ...pl,
        locked: !isPurchased
      };
    });
    
    res.json(studentPlaylists);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12c. Get videos by playlist (with security/purchase check)
app.get("/api/playlists/:id/videos", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const email = req.user.email.toLowerCase().trim();
    
    let playlist = null;
    if (useMongoDB) {
      playlist = await PlaylistModel.findOne({ id }).lean();
    } else {
      const data = getLocalData();
      playlist = data.playlists.find((p: any) => p.id === id);
    }
    
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found." });
    }
    
    // Fetch all purchase records for this student (and include approved payment requests as a double-layered check)
    let purchases = [];
    if (useMongoDB) {
      purchases = await PurchaseModel.find({
        studentEmail: { $regex: new RegExp("^" + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      }).lean();
      const approvedRequests = await PaymentRequestModel.find({
        studentEmail: { $regex: new RegExp("^" + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
        status: "Approved"
      }).lean();
      for (const r of approvedRequests) {
        if (!purchases.some((p: any) => p.courseType === r.courseType)) {
          purchases.push({
            studentEmail: email,
            courseType: r.courseType,
            amount: r.amount
          });
        }
      }
    } else {
      const data = getLocalData();
      purchases = data.purchases.filter((p: any) => (p.studentEmail || "").toLowerCase().trim() === email);
      const approvedRequests = data.paymentRequests.filter((r: any) => (r.studentEmail || "").toLowerCase().trim() === email && r.status === "Approved");
      for (const r of approvedRequests) {
        if (!purchases.some((p: any) => p.courseType === r.courseType)) {
          purchases.push({
            studentEmail: email,
            courseType: r.courseType,
            amount: r.amount
          });
        }
      }
    }
    
    const level = playlist.classLevel || "Class 12";
    const adminEmail = (process.env.ADMIN_EMAIL || "surajeductionofficial@gmail.com").toLowerCase().trim();
    const isAdmin = email === adminEmail;
    
    const hasClass10 = isAdmin || purchases.some((p: any) => p.courseType === "Class 10");
    const hasClass12 = isAdmin || purchases.some((p: any) => p.courseType === "Class 12");
    
    let isPurchased = false;
    if (level === "Class 10" || level === "10th") isPurchased = hasClass10;
    else if (level === "Class 12" || level === "12th") isPurchased = hasClass12;
    
    if (!isPurchased) {
      return res.status(403).json({ error: "Purchase required to view these videos.", locked: true });
    }
    
    res.json(playlist.videos || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12d. Check purchase access
app.get("/api/purchases/check", authenticateToken, async (req: any, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const { courseType } = req.query;
    
    // Fetch all purchase records for this student (and include approved payment requests as a double-layered check)
    let purchases = [];
    if (useMongoDB) {
      purchases = await PurchaseModel.find({
        studentEmail: { $regex: new RegExp("^" + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") }
      }).lean();
      const approvedRequests = await PaymentRequestModel.find({
        studentEmail: { $regex: new RegExp("^" + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
        status: "Approved"
      }).lean();
      for (const r of approvedRequests) {
        if (!purchases.some((p: any) => p.courseType === r.courseType)) {
          purchases.push({
            studentEmail: email,
            courseType: r.courseType,
            amount: r.amount
          });
        }
      }
    } else {
      const data = getLocalData();
      purchases = data.purchases.filter((p: any) => (p.studentEmail || "").toLowerCase().trim() === email);
      const approvedRequests = data.paymentRequests.filter((r: any) => (r.studentEmail || "").toLowerCase().trim() === email && r.status === "Approved");
      for (const r of approvedRequests) {
        if (!purchases.some((p: any) => p.courseType === r.courseType)) {
          purchases.push({
            studentEmail: email,
            courseType: r.courseType,
            amount: r.amount
          });
        }
      }
    }
    
    const adminEmail = (process.env.ADMIN_EMAIL || "surajeductionofficial@gmail.com").toLowerCase().trim();
    const isAdmin = email === adminEmail;
    
    if (courseType) {
      const hasPurchased = isAdmin || purchases.some((p: any) => p.courseType === courseType);
      return res.json({ purchased: hasPurchased });
    }
    
    res.json({
      "Class 10": isAdmin || purchases.some((p: any) => p.courseType === "Class 10"),
      "Class 12": isAdmin || purchases.some((p: any) => p.courseType === "Class 12")
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12e. Create a purchase (simulated payment success and save in DB)
app.post("/api/purchases", authenticateToken, async (req: any, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const { courseType, amount } = req.body;
    
    if (!courseType) {
      return res.status(400).json({ error: "courseType is required." });
    }
    
    const newPurchase = {
      studentEmail: email,
      courseType,
      amount: amount || (courseType === "Class 10" ? 599 : 999),
      purchaseDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    };
    
    if (useMongoDB) {
      await PurchaseModel.create(newPurchase);
    } else {
      const data = getLocalData();
      data.purchases.push(newPurchase);
      saveLocalData(data);
    }
    
    res.status(201).json({ success: true, purchase: newPurchase });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12f. Request UPI payment verification
app.post("/api/payments/request", authenticateToken, async (req: any, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    const { courseType, amount, transactionId, screenshotUrl } = req.body;
    
    if (!courseType || !amount || !transactionId || !screenshotUrl) {
      return res.status(400).json({ error: "courseType, amount, transactionId, and screenshotUrl are required parameters." });
    }
    
    // Fetch student's real name
    let studentName = req.user.name || "Student";
    if (useMongoDB) {
      const student = await StudentModel.findOne({ email });
      if (student) studentName = student.name;
    } else {
      const data = getLocalData();
      const student = data.students.find((s: any) => s.email.toLowerCase() === email);
      if (student) studentName = student.name;
    }
    
    const newPaymentRequest = {
      id: "PR-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      studentName,
      studentEmail: email,
      courseType,
      amount: Number(amount),
      transactionId,
      screenshotUrl,
      status: "Pending",
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    
    if (useMongoDB) {
      await PaymentRequestModel.create(newPaymentRequest);
    } else {
      const data = getLocalData();
      data.paymentRequests.push(newPaymentRequest);
      saveLocalData(data);
    }
    
    res.status(201).json({ success: true, paymentRequest: newPaymentRequest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12g. Get logged-in student's payment requests
app.get("/api/payments/my-requests", authenticateToken, async (req: any, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    
    let requests = [];
    if (useMongoDB) {
      const rawRequests = await PaymentRequestModel.find({ studentEmail: email }).sort({ _id: -1 }).lean();
      requests = rawRequests.map((r: any) => ({
        ...r,
        id: r.id || r._id.toString()
      }));
    } else {
      const data = getLocalData();
      requests = data.paymentRequests.filter((r: any) => r.studentEmail.toLowerCase() === email);
    }
    
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12h. Get all payment requests (Admin only)
app.get("/api/admin/payments", authenticateToken, requireAdmin, async (req, res) => {
  try {
    let requests = [];
    if (useMongoDB) {
      const rawRequests = await PaymentRequestModel.find().sort({ _id: -1 }).lean();
      requests = rawRequests.map((r: any) => ({
        ...r,
        id: r.id || r._id.toString()
      }));
    } else {
      const data = getLocalData();
      requests = [...data.paymentRequests].reverse();
    }
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12i. Approve payment request (Admin only)
app.post(["/api/admin/payments/:id/approve", "/api/payments/:id/approve"], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let payment = null;
    const approvalTime = new Date().toISOString();
    
    if (useMongoDB) {
      payment = await PaymentRequestModel.findOne({
        $or: [
          { id: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined }
        ].filter(Boolean)
      });
      if (!payment) return res.status(404).json({ error: "Payment request not found." });
      
      payment.status = "Approved";
      payment.approvedAt = approvalTime;
      await payment.save();
      
      const emailLower = (payment.studentEmail || "").toLowerCase().trim();
      
      // Ensure Class 12 purchase is created to unlock Class 12 videos, playlists, books, and mock tests
      const hasClass12 = await PurchaseModel.findOne({ studentEmail: emailLower, courseType: "Class 12" });
      if (!hasClass12) {
        await PurchaseModel.create({
          studentEmail: emailLower,
          courseType: "Class 12",
          amount: payment.amount || 499,
          purchaseDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        });
      }
      
      // Also save purchase record for the specific request's courseType if it's different
      if (payment.courseType && payment.courseType !== "Class 12") {
        const hasCourse = await PurchaseModel.findOne({ studentEmail: emailLower, courseType: payment.courseType });
        if (!hasCourse) {
          await PurchaseModel.create({
            studentEmail: emailLower,
            courseType: payment.courseType,
            amount: payment.amount,
            purchaseDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          });
        }
      }

      // Update student dashboard status to "Approved — Class 12 Unlocked"
      await StudentModel.findOneAndUpdate(
        { email: { $regex: new RegExp("^" + emailLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } },
        { $set: { batch: "Approved — Class 12 Unlocked" } }
      );
    } else {
      const data = getLocalData();
      const idx = data.paymentRequests.findIndex((r: any) => r.id === id);
      if (idx === -1) return res.status(404).json({ error: "Payment request not found." });
      
      data.paymentRequests[idx].status = "Approved";
      data.paymentRequests[idx].approvedAt = approvalTime;
      payment = data.paymentRequests[idx];
      
      const emailLower = (payment.studentEmail || "").toLowerCase().trim();
      
      // Ensure Class 12 purchase is created to unlock Class 12 videos, playlists, books, and mock tests
      const hasClass12 = data.purchases.some((p: any) => (p.studentEmail || "").toLowerCase().trim() === emailLower && p.courseType === "Class 12");
      if (!hasClass12) {
        data.purchases.push({
          studentEmail: emailLower,
          courseType: "Class 12",
          amount: payment.amount || 499,
          purchaseDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        });
      }

      if (payment.courseType && payment.courseType !== "Class 12") {
        const hasCourse = data.purchases.some((p: any) => (p.studentEmail || "").toLowerCase().trim() === emailLower && p.courseType === payment.courseType);
        if (!hasCourse) {
          data.purchases.push({
            studentEmail: emailLower,
            courseType: payment.courseType,
            amount: payment.amount,
            purchaseDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          });
        }
      }

      // Update student dashboard status to "Approved — Class 12 Unlocked"
      const studentIdx = data.students.findIndex((s: any) => (s.email || "").toLowerCase().trim() === emailLower);
      if (studentIdx !== -1) {
        data.students[studentIdx].batch = "Approved — Class 12 Unlocked";
      }
      
      saveLocalData(data);
    }
    
    res.json({ success: true, message: "Payment request successfully approved and course unlocked.", payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12j. Reject payment request (Admin only)
app.post(["/api/admin/payments/:id/reject", "/api/payments/:id/reject"], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let payment = null;
    const rejectionTime = new Date().toISOString();
    
    if (useMongoDB) {
      payment = await PaymentRequestModel.findOne({
        $or: [
          { id: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined }
        ].filter(Boolean)
      });
      if (!payment) return res.status(404).json({ error: "Payment request not found." });
      
      payment.status = "Rejected";
      payment.rejectedAt = rejectionTime;
      await payment.save();
      
      const studentEmailLower = (payment.studentEmail || "").toLowerCase().trim();
      
      // Keep all Class 12 (and payment course type) content locked by deleting purchase records
      await PurchaseModel.deleteMany({
        studentEmail: { $regex: new RegExp("^" + studentEmailLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
        courseType: { $in: ["Class 12", payment.courseType].filter(Boolean) }
      });
      
      // Update student dashboard status to "Rejected — Access Denied"
      await StudentModel.findOneAndUpdate(
        { email: { $regex: new RegExp("^" + studentEmailLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } },
        { $set: { batch: "Rejected — Access Denied" } }
      );
    } else {
      const data = getLocalData();
      const idx = data.paymentRequests.findIndex((r: any) => r.id === id);
      if (idx === -1) return res.status(404).json({ error: "Payment request not found." });
      
      data.paymentRequests[idx].status = "Rejected";
      data.paymentRequests[idx].rejectedAt = rejectionTime;
      payment = data.paymentRequests[idx];
      
      const studentEmailLower = (payment.studentEmail || "").toLowerCase().trim();
      
      // Keep all Class 12 (and payment course type) content locked by deleting purchase records
      data.purchases = data.purchases.filter((p: any) => {
        const pEmail = (p.studentEmail || "").toLowerCase().trim();
        return !(pEmail === studentEmailLower && (p.courseType === "Class 12" || p.courseType === payment.courseType));
      });
      
      // Update student dashboard status to "Rejected — Access Denied"
      const studentIdx = data.students.findIndex((s: any) => (s.email || "").toLowerCase().trim() === studentEmailLower);
      if (studentIdx !== -1) {
        data.students[studentIdx].batch = "Rejected — Access Denied";
      }
      
      saveLocalData(data);
    }
    
    res.json({ success: true, message: "Payment request successfully rejected.", payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12k. Delete payment request (Admin only)
app.delete("/api/admin/payments/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let payment = null;
    
    if (useMongoDB) {
      payment = await PaymentRequestModel.findOne({
        $or: [
          { id: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined }
        ].filter(Boolean)
      });
      if (!payment) return res.status(404).json({ error: "Payment request not found." });
      
      if (payment.status === "Approved") {
        const studentEmailLower = (payment.studentEmail || "").toLowerCase().trim();
        const otherApproved = await PaymentRequestModel.findOne({
          studentEmail: { $regex: new RegExp("^" + studentEmailLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
          courseType: payment.courseType,
          status: "Approved",
          id: { $ne: payment.id }
        });
        
        if (!otherApproved) {
          await PurchaseModel.deleteMany({
            studentEmail: { $regex: new RegExp("^" + studentEmailLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
            courseType: payment.courseType
          });
        }
      }
      
      await PaymentRequestModel.deleteOne({
        $or: [
          { id: payment.id },
          { _id: payment._id }
        ]
      });
    } else {
      const data = getLocalData();
      const idx = data.paymentRequests.findIndex((r: any) => r.id === id);
      if (idx === -1) return res.status(404).json({ error: "Payment request not found." });
      
      payment = data.paymentRequests[idx];
      if (payment.status === "Approved") {
        const studentEmailLower = (payment.studentEmail || "").toLowerCase().trim();
        const otherApproved = data.paymentRequests.some((r: any) => 
          (r.studentEmail || "").toLowerCase().trim() === studentEmailLower && 
          r.courseType === payment.courseType && 
          r.status === "Approved" && 
          r.id !== payment.id
        );
        
        if (!otherApproved) {
          data.purchases = data.purchases.filter((p: any) => 
            !((p.studentEmail || "").toLowerCase().trim() === studentEmailLower && p.courseType === payment.courseType)
          );
        }
      }
      
      data.paymentRequests.splice(idx, 1);
      saveLocalData(data);
    }
    
    res.json({ success: true, message: "Payment request successfully deleted." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- REFERENCE BOOKS APIs ---

// 13. Get all books list
app.get("/api/books", async (req, res) => {
  try {
    if (useMongoDB) {
      const books = await BookModel.find();
      res.json(books);
    } else {
      const data = getLocalData();
      res.json(data.books);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Create book (Admin only)
app.post("/api/books", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, quantity, image, description } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Book name and retail price are required parameters." });
    }

    const newBook = {
      id: "b-" + Math.random().toString(36).substring(2, 9),
      name,
      price: Number(price),
      quantity: Number(quantity) || 10,
      image: image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
      description: description || "Premium study reference notes personally authored by Suraj Sir."
    };

    if (useMongoDB) {
      await BookModel.create(newBook);
    } else {
      const data = getLocalData();
      data.books.push(newBook);
      saveLocalData(data);
    }
    res.status(201).json(newBook);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Update book metadata & stock (Admin only)
app.put("/api/books/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, image, description } = req.body;

    if (useMongoDB) {
      const original = await BookModel.findOne({ id });
      if (!original) return res.status(404).json({ error: "Book reference not found." });

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (price !== undefined) updates.price = Number(price);
      if (quantity !== undefined) updates.quantity = Number(quantity);
      if (image !== undefined) updates.image = image;
      if (description !== undefined) updates.description = description;

      const result = await BookModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      res.json(result);
    } else {
      const data = getLocalData();
      const idx = data.books.findIndex((b: any) => b.id === id);
      if (idx === -1) return res.status(404).json({ error: "Book reference not found." });

      if (name !== undefined) data.books[idx].name = name;
      if (price !== undefined) data.books[idx].price = Number(price);
      if (quantity !== undefined) data.books[idx].quantity = Number(quantity);
      if (image !== undefined) data.books[idx].image = image;
      if (description !== undefined) data.books[idx].description = description;

      saveLocalData(data);
      res.json(data.books[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 16. Delete study book (Admin only)
app.delete("/api/books/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (useMongoDB) {
      const result = await BookModel.findOneAndDelete({ id });
      if (!result) return res.status(404).json({ error: "Book reference not found." });
    } else {
      const data = getLocalData();
      const filtered = data.books.filter((b: any) => b.id !== id);
      if (filtered.length === data.books.length) {
        return res.status(404).json({ error: "Book reference not found." });
      }
      data.books = filtered;
      saveLocalData(data);
    }
    res.json({ message: "Book successfully deleted from school storage.", id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// --- MOCK EXAM TESTS APIs ---

// 17. Get all tests sheets
app.get("/api/tests", async (req, res) => {
  try {
    if (useMongoDB) {
      const tests = await TestModel.find();
      res.json(tests);
    } else {
      const data = getLocalData();
      res.json(data.tests);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 18. Create new mock test (Admin only)
app.post("/api/tests", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, subject, duration, questions } = req.body;
    if (!title || !subject || !duration) {
      return res.status(400).json({ error: "Test title, subject and duration constraints are required." });
    }

    const newTest = {
      id: "t-" + Math.random().toString(36).substring(2, 9),
      title,
      subject,
      duration: Number(duration),
      published: true,
      questions: questions || []
    };

    if (useMongoDB) {
      await TestModel.create(newTest);
    } else {
      const data = getLocalData();
      data.tests.push(newTest);
      saveLocalData(data);
    }
    res.status(201).json(newTest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 19. Update test metadata or questions list (Admin only)
app.put("/api/tests/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, duration, questions, published } = req.body;

    if (useMongoDB) {
      const original = await TestModel.findOne({ id });
      if (!original) return res.status(404).json({ error: "Mock test sheet not found." });

      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (subject !== undefined) updates.subject = subject;
      if (duration !== undefined) updates.duration = Number(duration);
      if (questions !== undefined) updates.questions = questions;
      if (published !== undefined) updates.published = published;

      const result = await TestModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      res.json(result);
    } else {
      const data = getLocalData();
      const idx = data.tests.findIndex((t: any) => t.id === id);
      if (idx === -1) return res.status(404).json({ error: "Mock test sheet not found." });

      if (title !== undefined) data.tests[idx].title = title;
      if (subject !== undefined) data.tests[idx].subject = subject;
      if (duration !== undefined) data.tests[idx].duration = Number(duration);
      if (questions !== undefined) data.tests[idx].questions = questions;
      if (published !== undefined) data.tests[idx].published = published;

      saveLocalData(data);
      res.json(data.tests[idx]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 20. Delete test sheet (Admin only)
app.delete("/api/tests/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (useMongoDB) {
      const result = await TestModel.findOneAndDelete({ id });
      if (!result) return res.status(404).json({ error: "Mock test sheet not found." });
    } else {
      const data = getLocalData();
      const filtered = data.tests.filter((t: any) => t.id !== id);
      if (filtered.length === data.tests.length) {
        return res.status(404).json({ error: "Mock test sheet not found." });
      }
      data.tests = filtered;
      saveLocalData(data);
    }
    res.json({ message: "Mock test paper successfully deleted.", id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// FULL-STACK VITE MIDDLEWARE CONFIG
// ==========================================
async function startServer() {
  // Verify Google OAuth Credentials on startup
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  console.log("--------------------------------------------------------------------------------");
  console.log("🔍 [Google OAuth Startup Audit]");
  if (
    !googleClientId || 
    googleClientId === "your_real_google_client_id" || 
    googleClientId === "MOCK_CLIENT_ID"
  ) {
    console.warn("⚠️  GOOGLE_CLIENT_ID is missing, unset, or using placeholder values.");
  } else {
    console.log(`✅ GOOGLE_CLIENT_ID loaded successfully: ${googleClientId.substring(0, 8)}...`);
  }

  if (
    !googleClientSecret || 
    googleClientSecret === "your_real_google_client_secret" || 
    googleClientSecret === ""
  ) {
    console.warn("⚠️  GOOGLE_CLIENT_SECRET is missing, unset, or using placeholder values.");
  } else {
    console.log("✅ GOOGLE_CLIENT_SECRET verified and loaded successfully.");
  }

  if (!googleCallbackUrl) {
    console.log("ℹ️  GOOGLE_CALLBACK_URL is not set. Falling back to dynamic container callback routing.");
  } else {
    console.log(`✅ GOOGLE_CALLBACK_URL is configured: ${googleCallbackUrl}`);
  }
  console.log("--------------------------------------------------------------------------------");

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Suraj Sir Education running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
