import { firestore, auth } from "./firebase";
import { db } from "./db";
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// === TYPES ===

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  amount: number;
  paymentMethod: "cash" | "online";
  date: string;
}

export interface StudentProfile {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  profession: string; // "student" | "employee" | "unemployed" | "other"
  enrolledCourses: string[]; // List of course IDs
  progress: Record<string, string[]>; // courseId -> list of attended session IDs
  createdAt: string;
}

export interface CourseSession {
  id: string;
  title: string;
  date: string; // ISO date string e.g., "2026-06-25T18:00:00Z"
  duration: string;
  location: string;
  meetUrl?: string;
  resources?: { name: string; url: string }[];
}

export interface CourseModule {
  id: string;
  title: string;
  sessions: CourseSession[];
}

export interface StudentCourse {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  image: string;
  price: number;
  modules: CourseModule[];
}

// === MOCK COURSES DATA ===

export const AVAILABLE_COURSES: StudentCourse[] = [
  {
    id: "powerbi-adv",
    title: "Tableau de bord avec PowerBI",
    category: "Analyse des Données",
    description: "Maîtrisez PowerBI Desktop et Services pour concevoir des rapports professionnels interactifs et automatiser vos analyses.",
    duration: "40 heures",
    image: "/images/programmes/analyse.jpg",
    price: 1500000, 
    modules: [
      {
        id: "pbi-m1",
        title: "Module 1 : Introduction et Modélisation",
        sessions: [
          {
            id: "pbi-s1",
            title: "1.1 Bienvenue et installation de PowerBI Desktop",
            date: "2026-06-22T18:00:00Z", // Past
            duration: "2 heures",
            location: "Salle B, Siège CFIG",
            resources: [{ name: "Support de cours PDF", url: "#" }]
          },
          {
            id: "pbi-s2",
            title: "1.2 Modélisation des Données et Bonnes Pratiques",
            date: "2026-06-24T18:00:00Z", // Today!
            duration: "2 heures",
            location: "Salle B, Siège CFIG",
            meetUrl: "https://zoom.us/j/1234567890",
            resources: [{ name: "Fiche technique Modélisation PDF", url: "#" }]
          },
          {
            id: "pbi-s3",
            title: "1.3 Connexion aux sources de données Excel",
            date: "2026-06-26T18:00:00Z", // Future
            duration: "2 heures",
            location: "Salle B, Siège CFIG",
            resources: [{ name: "Fichier d'exercice Excel", url: "#" }]
          }
        ]
      },
      {
        id: "pbi-m2",
        title: "Module 2 : Power Query et DAX",
        sessions: [
          {
            id: "pbi-s4",
            title: "2.1 Nettoyage et transformation avec Power Query",
            date: "2026-06-29T18:00:00Z",
            duration: "2 heures",
            location: "Salle B, Siège CFIG",
            resources: [{ name: "Guide des transformations", url: "#" }]
          },
          {
            id: "pbi-s5",
            title: "2.2 Introduction au DAX",
            date: "2026-07-01T18:00:00Z",
            duration: "2 heures",
            location: "Salle B, Siège CFIG",
            meetUrl: "https://zoom.us/j/0987654321",
            resources: [{ name: "Cheat Sheet DAX PDF", url: "#" }]
          }
        ]
      }
    ]
  },
  {
    id: "sage-paie",
    title: "Gestion de la Paie & RH",
    category: "Gestion",
    description: "Apprenez à paramétrer Sage Paie, éditer des bulletins de salaire et gérer les déclarations sociales conformément à la législation guinéenne.",
    duration: "35 heures",
    image: "/images/programmes/Gestion.jpg",
    price: 1800000,
    modules: [
      {
        id: "sage-m1",
        title: "Module 1 : Paramétrage initial",
        sessions: [
          {
            id: "sage-s1",
            title: "1.1 Création du fichier paie et constantes",
            date: "2026-06-20T09:00:00Z",
            duration: "3 heures",
            location: "Salle A, Siège CFIG",
            meetUrl: "https://meet.google.com/abc-defg-hij"
          },
          {
            id: "sage-s2",
            title: "1.2 Configuration des fiches de personnel",
            date: "2026-06-27T09:00:00Z",
            duration: "3 heures",
            location: "Salle A, Siège CFIG",
            resources: [{ name: "Fiche salarié vierge", url: "#" }]
          }
        ]
      }
    ]
  },
  {
    id: "comm-mgmt",
    title: "Community Management & Réseaux Sociaux",
    category: "Communication Digitale",
    description: "Développez et engagez votre communauté sur Facebook, Instagram et LinkedIn. Créez des visuels percutants avec Canva.",
    duration: "30 heures",
    image: "/images/programmes/communication.jpg",
    price: 1200000,
    modules: [
      {
        id: "comm-m1",
        title: "Module 1 : Stratégie de contenu",
        sessions: [
          {
            id: "comm-s1",
            title: "1.1 Définir sa ligne éditoriale et son persona",
            date: "2026-07-05T14:00:00Z",
            duration: "2 heures",
            location: "Salle C, Siège CFIG"
          },
          {
            id: "comm-s2",
            title: "1.2 Planifier son calendrier éditorial",
            date: "2026-07-07T14:00:00Z",
            duration: "2 heures",
            location: "Salle C, Siège CFIG",
            resources: [{ name: "Modèle de calendrier éditorial", url: "#" }]
          }
        ]
      }
    ]
  }
];

// === STUDENT DATABASE ACTIONS ===

export const studentDb = {
  async getPayments(): Promise<PaymentRecord[]> {
    const snap = await getDocs(collection(firestore, "payments"));
    return snap.docs.map(doc => doc.data() as PaymentRecord).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  async addPayment(payment: Omit<PaymentRecord, "id">): Promise<PaymentRecord> {
    const id = Date.now().toString() + Math.floor(Math.random() * 1000);
    const newPayment = { ...payment, id };
    await setDoc(doc(firestore, "payments", id), newPayment);
    return newPayment as PaymentRecord;
  },
  /** Check Auth status and return user profile */
  async getProfile(uid: string): Promise<StudentProfile | null> {
    try {
      const docRef = doc(firestore, "students", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as StudentProfile;
      }
    } catch (e) {
      console.error("Error fetching student profile:", e);
    }
    return null;
  },

  /** Create new student profile on signup */
  async createProfile(uid: string, email: string, fullName: string, phone: string = "", profession: string = "other"): Promise<StudentProfile> {
    const profile: StudentProfile = {
      uid,
      email,
      fullName,
      phone,
      profession,
      enrolledCourses: [],
      progress: {},
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestore, "students", uid), profile);
    } catch (e) {
      console.error("Error creating student profile:", e);
    }
    return profile;
  },

  /** Buy course and add it to student profile */
  async enrollInCourse(uid: string, courseId: string): Promise<void> {
    try {
      let profile = await this.getProfile(uid);
      if (!profile) {
        // Create basic profile if missing
        profile = await this.createProfile(uid, auth.currentUser?.email || "", auth.currentUser?.displayName || "");
      }

      if (!profile.enrolledCourses) {
        profile.enrolledCourses = [];
      }

      if (!profile.enrolledCourses.includes(courseId)) {
        profile.enrolledCourses.push(courseId);
        await setDoc(doc(firestore, "students", uid), profile);
      }
    } catch (e) {
      console.error("Error enrolling in course:", e);
    }
  },

  /** Mark a session as attended / unattended */
  async toggleAttendance(uid: string, courseId: string, sessionId: string, attended: boolean): Promise<void> {
    try {
      const profile = await this.getProfile(uid);
      if (!profile) return;

      if (!profile.progress[courseId]) {
        profile.progress[courseId] = [];
      }

      const list = profile.progress[courseId];
      if (attended) {
        if (!list.includes(sessionId)) {
          list.push(sessionId);
        }
      } else {
        profile.progress[courseId] = list.filter(id => id !== sessionId);
      }

      await setDoc(doc(firestore, "students", uid), profile);
    } catch (e) {
      console.error("Error toggling attendance:", e);
    }
  },

  /** Fetch all courses from Firestore public formations */
  async getCourses(): Promise<StudentCourse[]> {
    try {
      const publicCategories = await db.getFormations();
      const studentCourses: StudentCourse[] = [];

      publicCategories.forEach(cat => {
        cat.modules.forEach(mod => {
          // Use mod.id if it exists, otherwise generate a slug
          const slug = (cat.categorie + "-" + mod.titre).toLowerCase().replace(/[^a-z0-9]/g, "-");
          const id = mod.id || slug;
          
          studentCourses.push({
            id,
            title: mod.titre,
            category: cat.categorie,
            description: mod.details?.presentation || mod.titre,
            duration: mod.details?.duree || "Non définie",
            image: mod.image || cat.image || "/images/programmes/analyse.jpg",
            price: mod.prix || 0,
            modules: [
              {
                id: id + "-m1",
                title: "Agenda de la formation",
                sessions: mod.sessions || []
              }
            ]
          });
        });
      });

      if (studentCourses.length === 0) {
        return AVAILABLE_COURSES;
      }
      return studentCourses;
    } catch (e) {
      console.error("Error fetching courses via public db:", e);
      return AVAILABLE_COURSES; // Fallback to mock data
    }
  },

  /** Save or update a course */
  async saveCourse(course: StudentCourse): Promise<void> {
    try {
      await setDoc(doc(firestore, "student_courses", course.id), course);
    } catch (e) {
      console.error("Error saving course to Firestore:", e);
    }
  },

  /** Delete a course */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, "student_courses", courseId));
    } catch (e) {
      console.error("Error deleting course from Firestore:", e);
    }
  },

  /** Delete a student and their auth account */
  async deleteStudent(uid: string): Promise<void> {
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(firestore, "students", uid));
      
      // 2. Delete from Auth via API
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete student from Auth");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  }
};
