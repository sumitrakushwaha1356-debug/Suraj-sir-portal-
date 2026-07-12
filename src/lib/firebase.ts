import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import bcrypt from "bcryptjs";

// Hardcoded safe parameters matching our migrated Google/Firebase Project
const firebaseConfig = {
  apiKey: "AIzaSyB58_c3n5Xd6GbuCZuVIZ7PG-HjIgcgojk",
  authDomain: "suraj-sir-portal.firebaseapp.com",
  projectId: "suraj-sir-portal",
  storageBucket: "suraj-sir-portal.firebasestorage.app",
  messagingSenderId: "1031166717790",
  appId: "1:1031166717790:web:61982d7e4b41963dde69cf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

googleProvider.setCustomParameters({
  prompt: "select_account"
});

// ==========================================
// SEED DATA FOR AUTOMATIC FIRESTORE SEEDING
// ==========================================

const PLAYLISTS_DATA_SEED = [
  {
    id: "p1-physics",
    title: "Mastering Physics: Mechanics & Kinematics",
    thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400",
    videoCount: 4,
    description: "Complete physics core fundamentals with Suraj Sir. Master Newtonian mechanics, free body diagrams, and standard/advanced exam proofs.",
    classLevel: "Class 12",
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
    classLevel: "Class 12",
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
    classLevel: "Class 10",
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
    published: true,
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
    published: true,
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
    published: true,
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
// FIRESTORE HARDENED ERROR HANDLERS
// ==========================================

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// DB SEEDING UTILITY
// ==========================================

export const seedDatabaseIfEmpty = async () => {
  try {
    const playlistsSnap = await getDocs(collection(db, "playlists"));
    if (playlistsSnap.empty) {
      console.log("Seeding playlists...");
      for (const pl of PLAYLISTS_DATA_SEED) {
        await setDoc(doc(db, "playlists", pl.id), pl);
      }
    }
    
    const booksSnap = await getDocs(collection(db, "books"));
    if (booksSnap.empty) {
      console.log("Seeding books...");
      for (const b of BOOKS_DATA_SEED) {
        await setDoc(doc(db, "books", b.id), b);
      }
    }
    
    const testsSnap = await getDocs(collection(db, "tests"));
    if (testsSnap.empty) {
      console.log("Seeding tests...");
      for (const t of TESTS_DATA_SEED) {
        await setDoc(doc(db, "tests", t.id), t);
      }
    }
  } catch (err) {
    console.error("Failed to seed Firestore database:", err);
  }
};

// ==========================================
// FIRESTORE CRUD ACTIONS & ACCESS CONTROL
// ==========================================

export const getPurchases = async (email: string) => {
  try {
    const emailLower = email.toLowerCase().trim();
    const adminEmail = "surajeductionofficial@gmail.com";
    const isAdmin = emailLower === adminEmail || emailLower === "admin@surajsir.com";
    
    if (isAdmin) {
      return { "Class 10": true, "Class 12": true };
    }
    
    // Query approved payment requests
    const qPayments = query(
      collection(db, "paymentRequests"),
      where("studentEmail", "==", emailLower),
      where("status", "==", "Approved")
    );
    const paymentsSnap = await getDocs(qPayments);
    const paymentCourseTypes = paymentsSnap.docs.map(d => d.data().courseType);
    
    // Query direct purchases
    const qPurchases = query(
      collection(db, "purchases"),
      where("studentEmail", "==", emailLower)
    );
    const purchasesSnap = await getDocs(qPurchases);
    const purchaseCourseTypes = purchasesSnap.docs.map(d => d.data().courseType);
    
    const allCourses = [...paymentCourseTypes, ...purchaseCourseTypes];
    
    return {
      "Class 10": allCourses.includes("Class 10"),
      "Class 12": allCourses.includes("Class 12")
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "purchases");
    throw error;
  }
};

export const getPlaylists = async (email: string) => {
  try {
    await seedDatabaseIfEmpty();
    
    const snap = await getDocs(collection(db, "playlists"));
    const playlists = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    const purchasesObj = await getPurchases(email);
    const hasClass10 = purchasesObj["Class 10"];
    const hasClass12 = purchasesObj["Class 12"];
    
    return playlists.map(pl => {
      const level = pl.classLevel || "Class 12";
      let isPurchased = false;
      if (level === "Class 10" || level === "10th") isPurchased = hasClass10;
      else if (level === "Class 12" || level === "12th") isPurchased = hasClass12;
      
      return {
        ...pl,
        locked: !isPurchased
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "playlists");
    throw error;
  }
};

export const getBooks = async () => {
  try {
    await seedDatabaseIfEmpty();
    const snap = await getDocs(collection(db, "books"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "books");
    throw error;
  }
};

export const getTests = async () => {
  try {
    await seedDatabaseIfEmpty();
    const snap = await getDocs(collection(db, "tests"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "tests");
    throw error;
  }
};

export const getPaymentRequests = async (email?: string) => {
  try {
    if (email) {
      const emailLower = email.toLowerCase().trim();
      const q = query(collection(db, "paymentRequests"), where("studentEmail", "==", emailLower));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    } else {
      const snap = await getDocs(collection(db, "paymentRequests"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "paymentRequests");
    throw error;
  }
};

export const createPaymentRequest = async (
  email: string,
  studentName: string,
  courseType: string,
  amount: number,
  transactionId: string,
  screenshotUrl: string
) => {
  try {
    const id = "pay_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    const docRef = doc(db, "paymentRequests", id);
    const payload = {
      id,
      studentName,
      studentEmail: email.toLowerCase().trim(),
      courseType,
      amount,
      transactionId,
      screenshotUrl,
      status: "Pending",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
    await setDoc(docRef, payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "paymentRequests");
    throw error;
  }
};

export const approvePayment = async (paymentId: string) => {
  try {
    const docRef = doc(db, "paymentRequests", paymentId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Payment request not found.");
    }
    const data = snap.data();
    await updateDoc(docRef, {
      status: "Approved",
      approvedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    });

    const purchaseId = "pur_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    await setDoc(doc(db, "purchases", purchaseId), {
      id: purchaseId,
      studentEmail: data.studentEmail,
      courseType: data.courseType,
      amount: data.amount,
      purchaseDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "paymentRequests");
    throw error;
  }
};

export const rejectPayment = async (paymentId: string) => {
  try {
    const docRef = doc(db, "paymentRequests", paymentId);
    await updateDoc(docRef, {
      status: "Rejected",
      rejectedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "paymentRequests");
    throw error;
  }
};

export const deletePaymentRequest = async (paymentId: string) => {
  try {
    const docRef = doc(db, "paymentRequests", paymentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "paymentRequests");
    throw error;
  }
};

export const getStudents = async () => {
  try {
    const snap = await getDocs(collection(db, "students"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "students");
    throw error;
  }
};

export const updateStudentStatus = async (email: string, isActive: boolean) => {
  try {
    const q = query(collection(db, "students"), where("email", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, "students", docId), { isActive });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "students");
    throw error;
  }
};

export const deleteStudent = async (email: string) => {
  try {
    const q = query(collection(db, "students"), where("email", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await deleteDoc(doc(db, "students", docId));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "students");
    throw error;
  }
};

export const getStudentProfile = async (email: string) => {
  try {
    const emailLower = email.toLowerCase().trim();
    const q = query(collection(db, "students"), where("email", "==", emailLower));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "students");
    throw error;
  }
};

export const createOrUpdateStudentProfileOnLogin = async (profileData: {
  email: string;
  name: string;
  photoUrl?: string;
  googleId?: string;
  passwordHash?: string;
}) => {
  try {
    const emailLower = profileData.email.toLowerCase().trim();
    const existing = await getStudentProfile(emailLower);
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    
    if (existing) {
      const docRef = doc(db, "students", existing.id);
      const updateData: any = {
        name: profileData.name || existing.name,
        lastActiveTime: nowStr,
        loginDateTime: nowStr
      };
      if (profileData.photoUrl) updateData.photoUrl = profileData.photoUrl;
      if (profileData.googleId) updateData.googleId = profileData.googleId;
      await updateDoc(docRef, updateData);
      return { ...existing, ...updateData };
    } else {
      const randId = Math.floor(1000 + Math.random() * 9000);
      const id = "SSE-2026-" + randId;
      const docRef = doc(db, "students", id);
      const newProfile = {
        name: profileData.name,
        email: emailLower,
        studentId: id,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        batch: "JEE Elite Masterclass Class XII",
        attendance: "100.0%",
        streak: 1,
        isActive: true,
        photoUrl: profileData.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        loginDateTime: nowStr,
        lastActiveTime: nowStr,
        googleId: profileData.googleId || null,
        passwordHash: profileData.passwordHash || null,
        role: "student"
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "students");
    throw error;
  }
};

export const updateStudentProfile = async (email: string, updateData: any) => {
  try {
    const emailLower = email.toLowerCase().trim();
    const q = query(collection(db, "students"), where("email", "==", emailLower));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await updateDoc(doc(db, "students", docId), updateData);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "students");
    throw error;
  }
};

export const registerStudent = async (name: string, email: string, passwordRaw: string) => {
  try {
    const emailLower = email.toLowerCase().trim();
    const existing = await getStudentProfile(emailLower);
    if (existing) {
      throw new Error("Student account already exists with this email.");
    }
    
    const passwordHash = bcrypt.hashSync(passwordRaw, 10);
    return await createOrUpdateStudentProfileOnLogin({
      email: emailLower,
      name,
      passwordHash
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "students");
    throw error;
  }
};

export const loginStudent = async (email: string, passwordRaw: string) => {
  try {
    const emailLower = email.toLowerCase().trim();
    const profile = await getStudentProfile(emailLower);
    if (!profile) {
      throw new Error("No student account found with this email.");
    }
    if (profile.isActive === false) {
      throw new Error("Your account is deactivated. Please contact support.");
    }
    if (!profile.passwordHash) {
      throw new Error("This account was created via Google Sign-In. Please log in with Google.");
    }
    const matches = bcrypt.compareSync(passwordRaw, profile.passwordHash);
    if (!matches) {
      throw new Error("Invalid email or password.");
    }
    
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    await updateStudentProfile(emailLower, {
      loginDateTime: nowStr,
      lastActiveTime: nowStr
    });
    
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "students");
    throw error;
  }
};

export const createPlaylistInDb = async (playlist: any) => {
  try {
    const id = playlist.id || "pl_" + Date.now();
    await setDoc(doc(db, "playlists", id), { ...playlist, id });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "playlists");
    throw error;
  }
};

export const updatePlaylistInDb = async (id: string, playlist: any) => {
  try {
    await updateDoc(doc(db, "playlists", id), playlist);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "playlists");
    throw error;
  }
};

export const deletePlaylistFromDb = async (id: string) => {
  try {
    await deleteDoc(doc(db, "playlists", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "playlists");
    throw error;
  }
};

export const createBookInDb = async (book: any) => {
  try {
    const id = book.id || "bk_" + Date.now();
    await setDoc(doc(db, "books", id), { ...book, id });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "books");
    throw error;
  }
};

export const updateBookInDb = async (id: string, book: any) => {
  try {
    await updateDoc(doc(db, "books", id), book);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "books");
    throw error;
  }
};

export const deleteBookFromDb = async (id: string) => {
  try {
    await deleteDoc(doc(db, "books", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "books");
    throw error;
  }
};

export const createTestInDb = async (test: any) => {
  try {
    const id = test.id || "ts_" + Date.now();
    await setDoc(doc(db, "tests", id), { ...test, id });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "tests");
    throw error;
  }
};

export const updateTestInDb = async (id: string, test: any) => {
  try {
    await updateDoc(doc(db, "tests", id), test);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "tests");
    throw error;
  }
};

export const deleteTestFromDb = async (id: string) => {
  try {
    await deleteDoc(doc(db, "tests", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "tests");
    throw error;
  }
};

export const createVideo = async (playlistId: string, video: any) => {
  try {
    const playlistDocRef = doc(db, "playlists", playlistId);
    const snap = await getDoc(playlistDocRef);
    if (!snap.exists()) {
      throw new Error("Playlist not found");
    }
    const playlistData = snap.data();
    const videos = playlistData.videos || [];
    const newVideo = {
      ...video,
      id: video.id || "vid_" + Date.now()
    };
    videos.push(newVideo);
    await updateDoc(playlistDocRef, { videos });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `playlists/${playlistId}/videos`);
    throw error;
  }
};

export const updateVideo = async (playlistId: string, videoId: string, video: any) => {
  try {
    const playlistDocRef = doc(db, "playlists", playlistId);
    const snap = await getDoc(playlistDocRef);
    if (!snap.exists()) {
      throw new Error("Playlist not found");
    }
    const playlistData = snap.data();
    const videos = playlistData.videos || [];
    const index = videos.findIndex((v: any) => v.id === videoId);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...video, id: videoId };
      await updateDoc(playlistDocRef, { videos });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `playlists/${playlistId}/videos/${videoId}`);
    throw error;
  }
};

export const deleteVideo = async (playlistId: string, videoId: string) => {
  try {
    const playlistDocRef = doc(db, "playlists", playlistId);
    const snap = await getDoc(playlistDocRef);
    if (!snap.exists()) {
      throw new Error("Playlist not found");
    }
    const playlistData = snap.data();
    const videos = (playlistData.videos || []).filter((v: any) => v.id !== videoId);
    await updateDoc(playlistDocRef, { videos });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `playlists/${playlistId}/videos/${videoId}`);
    throw error;
  }
};
