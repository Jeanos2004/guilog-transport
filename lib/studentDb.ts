import { firestore, auth } from "./firebase";
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

// === TYPES ===

export interface StudentProfile {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  profession: string; // "student" | "employee" | "unemployed" | "other"
  enrolledCourses: string[]; // List of course IDs
  progress: Record<string, string[]>; // courseId -> list of completed lecture IDs
  createdAt: string;
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  type: "video" | "text" | "live";
  videoUrl?: string;
  textContent?: string;
  meetUrl?: string;
  resources?: { name: string; url: string }[];
}

export interface CourseModule {
  id: string;
  title: string;
  lectures: Lecture[];
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
    price: 1500000, // In GNF (Guinean Franc)
    modules: [
      {
        id: "pbi-m1",
        title: "Module 1 : Introduction et Modélisation",
        lectures: [
          {
            id: "pbi-l1",
            title: "1.1 Bienvenue et installation de PowerBI Desktop",
            duration: "12:15",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=y78n4wV2kHY",
            resources: [{ name: "Support de cours PDF", url: "#" }]
          },
          {
            id: "pbi-l2",
            title: "1.2 Guide écrit : Modélisation des Données et Bonnes Pratiques",
            duration: "Lecture (10 min)",
            type: "text",
            textContent: `
              <h3>Qu'est-ce que la Modélisation des Données ?</h3>
              <p>La modélisation consiste à structurer vos tables de façon à ce que PowerBI puisse les analyser efficacement. En général, on utilise le <strong>schéma en étoile (Star Schema)</strong>, composé de :</p>
              <ul>
                <li><strong>Tables de Faits :</strong> Contiennent les transactions ou mesures numériques (ex: ventes, inscriptions, heures).</li>
                <li><strong>Tables de Dimensions :</strong> Contiennent les attributs descriptifs de vos faits (ex: clients, dates, produits).</li>
              </ul>
              <blockquote><strong>Règle d'or :</strong> Évitez à tout prix les relations de type N-N (plusieurs-à-plusieurs) directes entre vos tables de faits. Créez toujours une table de dimension intermédiaire.</blockquote>
              <h3>Les étapes clés de la modélisation :</h3>
              <ol>
                <li>Identifier vos clés primaires et clés étrangères.</li>
                <li>Créer des relations unidirectionnelles (1-à-plusieurs).</li>
                <li>Configurer une table de calendrier dynamique pour vos calculs de time intelligence.</li>
              </ol>
            `,
            resources: [{ name: "Fiche technique Modélisation PDF", url: "#" }]
          },
          {
            id: "pbi-l3",
            title: "1.3 Connexion aux sources de données Excel",
            duration: "18:40",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=T3_97D3NlV0",
            resources: [{ name: "Fichier d'exercice Excel", url: "#" }]
          }
        ]
      },
      {
        id: "pbi-m2",
        title: "Module 2 : Power Query et DAX",
        lectures: [
          {
            id: "pbi-l4",
            title: "2.1 Nettoyage et transformation avec Power Query",
            duration: "24:10",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=y78n4wV2kHY",
            resources: [{ name: "Guide des transformations", url: "#" }]
          },
          {
            id: "pbi-l5",
            title: "2.2 Documentation DAX : Les fonctions incontournables",
            duration: "Lecture (15 min)",
            type: "text",
            textContent: `
              <h3>Introduction au DAX (Data Analysis Expressions)</h3>
              <p>Le DAX est le langage de formule utilisé dans PowerBI. Voici les fonctions de base essentielles pour construire des tableaux de bord dynamiques :</p>
              <pre><code>// 1. Somme simple
Total Ventes = SUM(Ventes[Montant])

// 2. Filtrer des données de manière dynamique
Ventes Orange Money = CALCULATE([Total Ventes], Ventes[MoyenPaiement] = "Orange Money")

// 3. Calculer sur l'année précédente (Time Intelligence)
Ventes N-1 = CALCULATE([Total Ventes], SAMEPERIODLASTYEAR(Calendrier[Date]))</code></pre>
              <p>Ces trois fonctions vous permettront de résoudre 80% des besoins de calculs courants en entreprise.</p>
            `,
            resources: [{ name: "Cheat Sheet DAX PDF", url: "#" }]
          },
          {
            id: "pbi-l6",
            title: "2.3 Écrire ses premières mesures en DAX (SUM, CALCULATE)",
            duration: "30:05",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=T3_97D3NlV0",
            resources: [{ name: "Aide-mémoire DAX", url: "#" }]
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
        lectures: [
          {
            id: "sage-l1",
            title: "1.1 Création du fichier paie et constantes",
            duration: "15:20",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=y78n4wV2kHY"
          },
          {
            id: "sage-l2",
            title: "1.2 Configuration des fiches de personnel",
            duration: "20:45",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=T3_97D3NlV0",
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
        lectures: [
          {
            id: "comm-l1",
            title: "1.1 Définir sa ligne éditoriale et son persona",
            duration: "14:30",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=y78n4wV2kHY"
          },
          {
            id: "comm-l2",
            title: "1.2 Planifier son calendrier éditorial",
            duration: "19:15",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=T3_97D3NlV0",
            resources: [{ name: "Modèle de calendrier éditorial", url: "#" }]
          },
          {
            id: "comm-l3",
            title: "1.3 Session Live : Coaching & Questions-Réponses",
            duration: "En direct",
            type: "live",
            meetUrl: "https://meet.google.com/abc-defg-hij",
            resources: [{ name: "Notes de préparation live", url: "#" }]
          }
        ]
      }
    ]
  }
];

// === STUDENT DATABASE ACTIONS ===

export const studentDb = {
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

  /** Mark a lecture as completed / uncompleted */
  async toggleLectureProgress(uid: string, courseId: string, lectureId: string, completed: boolean): Promise<void> {
    try {
      const profile = await this.getProfile(uid);
      if (!profile) return;

      if (!profile.progress[courseId]) {
        profile.progress[courseId] = [];
      }

      const list = profile.progress[courseId];
      if (completed) {
        if (!list.includes(lectureId)) {
          list.push(lectureId);
        }
      } else {
        profile.progress[courseId] = list.filter(id => id !== lectureId);
      }

      await setDoc(doc(firestore, "students", uid), profile);
    } catch (e) {
      console.error("Error toggling lecture progress:", e);
    }
  },

  /** Fetch all courses from Firestore. Initialize with defaults if empty. */
  async getCourses(): Promise<StudentCourse[]> {
    try {
      const snap = await getDocs(collection(firestore, "student_courses"));
      if (snap.empty) {
        // Initialize Firestore with static mock courses
        for (const course of AVAILABLE_COURSES) {
          await setDoc(doc(firestore, "student_courses", course.id), course);
        }
        return AVAILABLE_COURSES;
      }
      const list: StudentCourse[] = [];
      snap.forEach((d) => {
        list.push(d.data() as StudentCourse);
      });
      return list;
    } catch (e) {
      console.error("Error fetching courses from Firestore:", e);
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
  }
};
