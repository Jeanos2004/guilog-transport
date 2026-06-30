import { formationsData, testimonialsData } from "./data";
import { firestore } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { StudentProfile, CourseSession } from "./studentDb";

// === TYPES ===

export interface FormationDetails {
  presentation?: string;          // Description libre de la formation
  objectifs?: string[];           // Objectifs pédagogiques (liste)
  prerequis?: string[];           // Prérequis (liste)
  publicCible?: string[];         // À qui s'adresse la formation (liste)
  programme?: {                   // Programme détaillé (modules/chapitres)
    title: string;
    points: string[];
  }[];
  duree?: string;                 // Ex: "2 mois", "80 heures"
  dateDebut?: string;             // Ex: "15 Juillet 2026"
  dateFin?: string;               // Ex: "30 Août 2026"
  calendrier?: string;            // Ex: "Lundi, Mercredi, Vendredi"
  horaires?: string;              // Ex: "18h00 – 20h00"
  statutInscription?: "Ouverte" | "Fermée"; // Contrôle le bouton d'inscription
  debouches?: string[];           // Les emplois/opportunités professionnelles (liste)
  planning?: { jour: string; horaire: string }[]; // Jours et horaires de la formation
}

export interface ModuleItem {
  id?: string;
  titre: string;
  outils: string[];
  prix?: number;           // Prix de la formation (coût total)
  prixInscription?: number; // Frais d'inscription séparés
  methodePaiement?: string;
  image?: string;
  details?: FormationDetails;     // Toutes les infos détaillées
  sessions?: CourseSession[];     // Séances de cours
}

export interface CategorieFormations {
  categorie: string;
  image?: string;
  modules: ModuleItem[];
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  category: string;
  image: string;
}

export interface InscriptionRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  requestType: string;
  domain: string;
  message: string;
  date: string;
  status: "En attente" | "Validé" | "Annulé";
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "Non lu" | "Lu";
}

export interface Testimonial {
  name: string;
  role: string;
  initials: string;
  color: string;
  text: string;
  rating: number;
  active: boolean;
  /** Testimonial type:
   * - "standard"       → text card with optional portrait photo (21st.dev style)
   * - "standard"       → text card with optional portrait photo
   * - "video"          → video testimonial (displayed in landscape style)
   */
  type?: "standard" | "video";
  image?: string;    // Portrait photo URL (for standard type or video cover)
  videoUrl?: string; // Video URL (YouTube, Cloudinary…)
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  dateAdded: string;
}

export interface SiteSettings {
  apprenantsForme: number;
  totalHeuresFormation: number;
  tauxSatisfaction: number;
  anneesExperience: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  createdAt: string;
  status: "actif" | "suspendu";
}

// === DEFAULT DATA ===

const defaultArticles: Article[] = [
  {
    id: 1,
    title: "Cérémonie de remise des certificats - Promotion 2024",
    excerpt: "Retour en images sur la cérémonie de remise des attestations aux 150 apprenants de la cohorte 2024. Un moment riche en émotions et en opportunités.",
    content: "La grande salle de conférence de Cabinet Guilogtrans a vibré au rythme de la célébration le 15 mai dernier. En effet, la cérémonie solennelle de remise des attestations de fin de formation a réuni plus de 150 apprenants de la promotion 2024, marquant l'aboutissement de plusieurs mois d'efforts et d'apprentissage intensif.\n\nPrésidée par la direction du cabinet et en présence de nombreux invités d'honneur du secteur privé et public, cette cérémonie a été l'occasion de valoriser le travail remarquable accompli par les apprenants dans des domaines variés tels que l'Analyse de Données (PowerBI/Excel), la Gestion de la Paie, la Logistique ou encore le Community Management.\n\nLe Directeur de Cabinet Guilogtrans, M. Ousmane Condé, a tenu à féliciter chaleureusement les diplômés : \"Vous repartez aujourd'hui non seulement avec un certificat, mais avec des compétences opérationnelles concrètes et directement applicables. Le marché de l'emploi en Guinée a besoin de professionnels qualifiés et pratiques. Vous êtes désormais prêts à relever ce défi.\"\n\nPlusieurs témoignages d'apprenants et de recruteurs partenaires ont ponctué l'événement, soulignant l'impact direct des formations Guilogtrans sur l'employabilité et la performance en entreprise. La journée s'est clôturée by un cocktail de réseautage, permettant aux nouveaux certifiés d'échanger avec les professionnels présents et d'ouvrir de nouvelles opportunités de carrière.",
    date: "2026-05-15",
    author: "Direction",
    category: "Événements",
    image: "/images/news_hero.png"
  },
  {
    id: 2,
    title: "L'importance de PowerBI dans la prise de décision stratégique",
    excerpt: "Découvrez pourquoi maîtriser PowerBI est devenu un atout indispensable pour les managers et analystes en entreprise aujourd'hui.",
    content: "Dans un environnement économique de plus en plus concurrentiel et digitalisé, la donnée est devenue le nouvel or noir des entreprises. Cependant, accumuler des données ne sert à rien si on ne sait pas les analyser ni les restituer sous forme d'informations exploitables. C'est là que Microsoft PowerBI s'impose comme un outil incontournable.\n\nPowerBI permet de connecter des sources de données multiples (bases de données SQL, fichiers Excel, services Cloud), de nettoyer et modéliser ces données, et de créer des rapports et tableaux de bord interactifs en temps réel. Pour les managers, directeurs et décideurs, l'avantage est immense : au lieu de naviguer à vue ou de dépendre de rapports Excel statiques souvent obsolètes, ils disposent d'indicateurs clés de performance (KPI) clairs, mis à jour automatiquement et accessibles d'un simple clic sur ordinateur ou mobile.\n\nAu sein de Cabinet Guilogtrans, nous constatons une demande croissante des entreprises locales pour former leurs collaborateurs (financiers, logisticiens, RH, contrôleurs de gestion) sur PowerBI. Maîtriser cet outil ne se limite pas à savoir concevoir des graphiques ; cela permet de transformer la culture de l'entreprise en orientant chaque décision sur des faits précis et mesurables. En devenant un expert PowerBI, vous apportez une valeur ajoutée stratégique indéniable à votre organisation et accélérez votre évolution professionnelle.",
    date: "2026-05-02",
    author: "Ousmane Condé",
    category: "Conseils",
    image: "/images/about.png"
  },
  {
    id: 3,
    title: "Nouveau partenariat avec l'Université de Conakry",
    excerpt: "Cabinet Guilogtrans est fier d'annoncer son partenariat stratégique pour accompagner les étudiants en fin de cycle vers l'employabilité.",
    content: "C'est une étape majeure pour l'insertion professionnelle des jeunes diplômés en Guinée. Le Cabinet Guilogtrans (Cabinet Guilogtrans) a officialisé la signature d'un protocole d'accord de partenariat stratégique avec l'Université de Conakry.\n\nCe partenariat vise à combler le fossé souvent constaté entre la formation théorique universitaire et les exigences pratiques du marché du travail. Dans le cadre de cet accord, Cabinet Guilogtrans déploiera des programmes de renforcement des compétences intensifs et orientés métiers pour les étudiants en fin de cycle universitaire.\n\nLes modules de formation porteront sur les outils bureautiques avancés, les logiciels de gestion comptable et commerciale (SAGE), ainsi que l'initiation à l'analyse de données. Des sessions spécifiques sur le développement des soft skills et la préparation aux entretiens d'embauche seront également animées par nos experts formateurs.\n\n\"Nous croyons fermement au potentiel de la jeunesse guinéenne. Ce partenariat est notre contribution pour outiller les étudiants avec les compétences réelles que recherchent les recruteurs aujourd'hui\", a déclaré le responsable des relations publiques de Cabinet Guilogtrans lors de la signature officielle.\n\nLes premières cohortes d'étudiants débuteront leurs sessions dès le mois prochain au sein des locaux de l'université et dans les salles de classe équipées de Cabinet Guilogtrans.",
    date: "2026-04-20",
    author: "Relations Publiques",
    category: "Partenariats",
    image: "/images/hero.png"
  }
];

const defaultTestimonials: Testimonial[] = testimonialsData.map(t => ({
  ...t,
  active: true
}));

const defaultInscriptions: InscriptionRequest[] = [
  {
    id: "REG-9872",
    fullName: "Moussa Camara",
    email: "moussa.camara@example.gn",
    phone: "+224 622 11 22 33",
    company: "Société des Eaux de Guinée",
    requestType: "Formation en entreprise",
    domain: "Analyse des Données",
    message: "Demande de formation sur PowerBI pour notre équipe de contrôle financier.",
    date: "2026-05-28T14:32:00Z",
    status: "En attente"
  },
  {
    id: "REG-1243",
    fullName: "Aicha Sylla",
    email: "aicha.sylla@gmail.com",
    phone: "+224 626 44 55 66",
    company: "",
    requestType: "Inscription individuelle",
    domain: "Gestion",
    message: "Je souhaite m'inscrire au module de Sage Comptabilité.",
    date: "2026-05-30T10:15:00Z",
    status: "Validé"
  }
];

const defaultMessages: ContactMessage[] = [
  {
    id: "MSG-0091",
    fullName: "Kadiatou Diallo",
    email: "kadiatou.d@gmail.com",
    subject: "Demande de tarifs",
    message: "Bonjour, j'aimerais obtenir la grille tarifaire complète pour vos formations individuelles en bureautique.",
    date: "2026-05-29T09:00:00Z",
    status: "Non lu"
  }
];

// === PUBLIC DATABASE API ===

export const db = {
  // Formations
  async getFormations(): Promise<CategorieFormations[]> {
    try {
      const docSnap = await getDoc(doc(firestore, "formations", "all"));
      if (docSnap.exists()) {
        return docSnap.data().categories as CategorieFormations[];
      }
    } catch (error) {
      console.error("Error fetching formations from Firestore:", error);
    }
    return formationsData;
  },
  async saveFormations(data: CategorieFormations[]): Promise<void> {
    try {
      await setDoc(doc(firestore, "formations", "all"), { categories: data });
    } catch (error) {
      console.error("Error saving formations to Firestore:", error);
    }
  },

  // Articles / Blog
  async getArticles(): Promise<Article[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "articles"));
      const list: Article[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Article);
      });
      return list.sort((a, b) => b.id - a.id);
    } catch (error) {
      console.error("Error fetching articles from Firestore:", error);
    }
    return defaultArticles;
  },
  async saveArticles(data: Article[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(firestore, "articles"));
      const existingIds = snapshot.docs.map(d => d.id);
      const newIds = data.map(a => String(a.id));
      
      for (const id of existingIds) {
        if (!newIds.includes(id)) {
          await deleteDoc(doc(firestore, "articles", id));
        }
      }
      
      for (const article of data) {
        await setDoc(doc(firestore, "articles", String(article.id)), article);
      }
    } catch (error) {
      console.error("Error saving articles to Firestore:", error);
    }
  },

  // Inscriptions / Devis
  async getInscriptions(): Promise<InscriptionRequest[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "inscriptions"));
      const list: InscriptionRequest[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as InscriptionRequest);
      });
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching inscriptions from Firestore:", error);
    }
    return defaultInscriptions;
  },
  async saveInscriptions(data: InscriptionRequest[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(firestore, "inscriptions"));
      const existingIds = snapshot.docs.map(d => d.id);
      const newIds = data.map(x => x.id);
      
      for (const id of existingIds) {
        if (!newIds.includes(id)) {
          await deleteDoc(doc(firestore, "inscriptions", id));
        }
      }
      
      for (const item of data) {
        await setDoc(doc(firestore, "inscriptions", item.id), item);
      }
    } catch (error) {
      console.error("Error saving inscriptions to Firestore:", error);
    }
  },
  async addInscription(request: Omit<InscriptionRequest, "id" | "date" | "status">): Promise<InscriptionRequest> {
    const newRequest: InscriptionRequest = {
      ...request,
      id: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: "En attente"
    };
    try {
      await setDoc(doc(firestore, "inscriptions", newRequest.id), newRequest);
    } catch (error) {
      console.error("Error adding inscription to Firestore:", error);
    }
    return newRequest;
  },

  // Contact Messages
  async getMessages(): Promise<ContactMessage[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "messages"));
      const list: ContactMessage[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ContactMessage);
      });
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching messages from Firestore:", error);
    }
    return defaultMessages;
  },
  async saveMessages(data: ContactMessage[]): Promise<void> {
    try {
      const snapshot = await getDocs(collection(firestore, "messages"));
      const existingIds = snapshot.docs.map(d => d.id);
      const newIds = data.map(x => x.id);
      
      for (const id of existingIds) {
        if (!newIds.includes(id)) {
          await deleteDoc(doc(firestore, "messages", id));
        }
      }
      
      for (const item of data) {
        await setDoc(doc(firestore, "messages", item.id), item);
      }
    } catch (error) {
      console.error("Error saving messages to Firestore:", error);
    }
  },
  async addMessage(msg: Omit<ContactMessage, "id" | "date" | "status">): Promise<ContactMessage> {
    const newMsg: ContactMessage = {
      ...msg,
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: "Non lu"
    };
    try {
      await setDoc(doc(firestore, "messages", newMsg.id), newMsg);
    } catch (error) {
      console.error("Error adding message to Firestore:", error);
    }
    return newMsg;
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const docSnap = await getDoc(doc(firestore, "testimonials", "all"));
      if (docSnap.exists()) {
        return docSnap.data().list as Testimonial[];
      }
    } catch (error) {
      console.error("Error fetching testimonials from Firestore:", error);
    }
    return defaultTestimonials;
  },
  async saveTestimonials(data: Testimonial[]): Promise<void> {
    try {
      await setDoc(doc(firestore, "testimonials", "all"), { list: data });
    } catch (error) {
      console.error("Error saving testimonials to Firestore:", error);
    }
  },

  // Site Settings
  async getSettings(): Promise<SiteSettings> {
    try {
      const docSnap = await getDoc(doc(firestore, "settings", "global"));
      if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
      }
    } catch (error) {
      console.error("Error fetching settings from Firestore:", error);
    }
    return {
      apprenantsForme: 540,
      totalHeuresFormation: 1200,
      tauxSatisfaction: 95,
      anneesExperience: 5
    };
  },
  async saveSettings(data: SiteSettings): Promise<void> {
    try {
      await setDoc(doc(firestore, "settings", "global"), data);
    } catch (error) {
      console.error("Error saving site settings to Firestore:", error);
    }
  },

  // Admins
  async getAdmins(): Promise<AdminUser[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "admins"));
      const list: AdminUser[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AdminUser);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error fetching admins from Firestore:", error);
    }
    return [];
  },
  async saveAdmin(admin: AdminUser): Promise<void> {
    try {
      await setDoc(doc(firestore, "admins", admin.uid), admin);
    } catch (error) {
      console.error("Error saving admin to Firestore:", error);
    }
  },
  async verifyAdmin(uid: string): Promise<void> {
    try {
      const docRef = doc(firestore, "admins", uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("not-an-admin");
      }
    } catch (error) {
      console.error("Error verifying admin in Firestore:", error);
      throw error;
    }
  },

  async deleteAdmin(uid: string): Promise<void> {
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(firestore, "admins", uid));
      
      // 2. Delete from Auth via API
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete admin from Auth");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      throw error;
    }
  },
  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    try {
      const docRef = doc(firestore, "gallery", "all");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().items as GalleryItem[];
      }
    } catch (error) {
      console.error("Error fetching gallery from Firestore:", error);
    }
    return [];
  },
  async saveGallery(items: GalleryItem[]): Promise<void> {
    try {
      await setDoc(doc(firestore, "gallery", "all"), { items });
    } catch (error) {
      console.error("Error saving gallery to Firestore:", error);
      throw error;
    }
  },
  
  // Students
  async getStudents(): Promise<StudentProfile[]> {
    try {
      const snapshot = await getDocs(collection(firestore, "students"));
      const list: StudentProfile[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as StudentProfile);
      });
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (error) {
      console.error("Error fetching students from Firestore:", error);
    }
    return [];
  },

  async enrollStudent(uid: string, courseId: string): Promise<void> {
    try {
      const docRef = doc(firestore, "students", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const profile = snap.data() as StudentProfile;
        if (!profile.enrolledCourses.includes(courseId)) {
          profile.enrolledCourses.push(courseId);
          await setDoc(docRef, profile);
        }
      }
    } catch (error) {
      console.error("Error enrolling student in Firestore:", error);
    }
  },

  // Database Initialization Helper with Auto-Seeding
  async init(): Promise<void> {
    try {
      const docRef = doc(firestore, "formations", "all");
      const docSnap = await getDoc(docRef);
      
      // Seed site settings first if they don't exist
      const settingsRef = doc(firestore, "settings", "global");
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, {
          apprenantsForme: 540,
          totalHeuresFormation: 1200,
          tauxSatisfaction: 95,
          anneesExperience: 5
        });
      }

      if (!docSnap.exists()) {
        console.log("Firestore database is empty. Seeding default Guilogtrans data...");
        
        // Seed formations
        await setDoc(docRef, { categories: formationsData });
        
        // Seed testimonials
        await setDoc(doc(firestore, "testimonials", "all"), { list: defaultTestimonials });
        
        // Seed articles
        for (const article of defaultArticles) {
          await setDoc(doc(firestore, "articles", String(article.id)), article);
        }
        
        // Seed inscriptions
        for (const ins of defaultInscriptions) {
          await setDoc(doc(firestore, "inscriptions", ins.id), ins);
        }
        
        // Seed messages
        for (const msg of defaultMessages) {
          await setDoc(doc(firestore, "messages", msg.id), msg);
        }
        console.log("Firestore database successfully seeded!");
      }
    } catch (e) {
      console.warn("Could not check/initialize Firestore (likely environment variables are missing or incorrect):", e);
    }
  }
};
