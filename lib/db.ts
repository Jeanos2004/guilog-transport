import { formationsData, testimonialsData } from "./data";

// === TYPES ===

export interface ModuleItem {
  titre: string;
  outils: string[];
}

export interface CategorieFormations {
  categorie: string;
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
}

// === DEFAULT DATA ===

const defaultArticles: Article[] = [
  {
    id: 1,
    title: "Cérémonie de remise des certificats - Promotion 2024",
    excerpt: "Retour en images sur la cérémonie de remise des attestations aux 150 apprenants de la cohorte 2024. Un moment riche en émotions et en opportunités.",
    content: "La grande salle de conférence de CFIG Guinée a vibré au rythme de la célébration le 15 mai dernier. En effet, la cérémonie solennelle de remise des attestations de fin de formation a réuni plus de 150 apprenants de la promotion 2024, marquant l'aboutissement de plusieurs mois d'efforts et d'apprentissage intensif.\n\nPrésidée par la direction du cabinet et en présence de nombreux invités d'honneur du secteur privé et public, cette cérémonie a été l'occasion de valoriser le travail remarquable accompli par les apprenants dans des domaines variés tels que l'Analyse de Données (PowerBI/Excel), la Gestion de la Paie, la Logistique ou encore le Community Management.\n\nLe Directeur de CFIG Guinée, M. Ousmane Condé, a tenu à féliciter chaleureusement les diplômés : \"Vous repartez aujourd'hui non seulement avec un certificat, mais avec des compétences opérationnelles concrètes et directement applicables. Le marché de l'emploi en Guinée a besoin de professionnels qualifiés et pratiques. Vous êtes désormais prêts à relever ce défi.\"\n\nPlusieurs témoignages d'apprenants et de recruteurs partenaires ont ponctué l'événement, soulignant l'impact direct des formations CFIG sur l'employabilité et la performance en entreprise. La journée s'est clôturée par un cocktail de réseautage, permettant aux nouveaux certifiés d'échanger avec les professionnels présents et d'ouvrir de nouvelles opportunités de carrière.",
    date: "2026-05-15",
    author: "Direction",
    category: "Événements",
    image: "/images/news_hero.png"
  },
  {
    id: 2,
    title: "L'importance de PowerBI dans la prise de décision stratégique",
    excerpt: "Découvrez pourquoi maîtriser PowerBI est devenu un atout indispensable pour les managers et analystes en entreprise aujourd'hui.",
    content: "Dans un environnement économique de plus en plus concurrentiel et digitalisé, la donnée est devenue le nouvel or noir des entreprises. Cependant, accumuler des données ne sert à rien si on ne sait pas les analyser ni les restituer sous forme d'informations exploitables. C'est là que Microsoft PowerBI s'impose comme un outil incontournable.\n\nPowerBI permet de connecter des sources de données multiples (bases de données SQL, fichiers Excel, services Cloud), de nettoyer et modéliser ces données, et de créer des rapports et tableaux de bord interactifs en temps réel. Pour les managers, directeurs et décideurs, l'avantage est immense : au lieu de naviguer à vue ou de dépendre de rapports Excel statiques souvent obsolètes, ils disposent d'indicateurs clés de performance (KPI) clairs, mis à jour automatiquement et accessibles d'un simple clic sur ordinateur ou mobile.\n\nAu sein de CFIG Guinée, nous constatons une demande croissante des entreprises locales pour former leurs collaborateurs (financiers, logisticiens, RH, contrôleurs de gestion) sur PowerBI. Maîtriser cet outil ne se limite pas à savoir concevoir des graphiques ; cela permet de transformer la culture de l'entreprise en orientant chaque décision sur des faits précis et mesurables. En devenant un expert PowerBI, vous apportez une valeur ajoutée stratégique indéniable à votre organisation et accélérez votre évolution professionnelle.",
    date: "2026-05-02",
    author: "Ousmane Condé",
    category: "Conseils",
    image: "/images/about.png"
  },
  {
    id: 3,
    title: "Nouveau partenariat avec l'Université de Conakry",
    excerpt: "CFIG Guinée est fier d'annoncer son partenariat stratégique pour accompagner les étudiants en fin de cycle vers l'employabilité.",
    content: "C'est une étape majeure pour l'insertion professionnelle des jeunes diplômés en Guinée. Le Cabinet de Formation Informatique de Gestion (CFIG Guinée) a officialisé la signature d'un protocole d'accord de partenariat stratégique avec l'Université de Conakry.\n\nCe partenariat vise à combler le fossé souvent constaté entre la formation théorique universitaire et les exigences pratiques du marché du travail. Dans le cadre de cet accord, CFIG Guinée déploiera des programmes de renforcement des compétences intensifs et orientés métiers pour les étudiants en fin de cycle universitaire.\n\nLes modules de formation porteront sur les outils bureautiques avancés, les logiciels de gestion comptable et commerciale (SAGE), ainsi que l'initiation à l'analyse de données. Des sessions spécifiques sur le développement des soft skills et la préparation aux entretiens d'embauche seront également animées par nos experts formateurs.\n\n\"Nous croyons fermement au potentiel de la jeunesse guinéenne. Ce partenariat est notre contribution pour outiller les étudiants avec les compétences réelles que recherchent les recruteurs aujourd'hui\", a déclaré le responsable des relations publiques de CFIG Guinée lors de la signature officielle.\n\nLes premières cohortes d'étudiants débuteront leurs sessions dès le mois prochain au sein des locaux de l'université et dans les salles de classe équipées de CFIG Guinée.",
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

// === STORAGE INTERACTION ===

const isClient = typeof window !== "undefined";

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing key ${key} to localStorage:`, error);
  }
}

// === PUBLIC DATABASE API ===

export const db = {
  // Formations
  getFormations(): CategorieFormations[] {
    return getStorageItem<CategorieFormations[]>("cfig_formations", formationsData);
  },
  saveFormations(data: CategorieFormations[]): void {
    setStorageItem("cfig_formations", data);
  },

  // Articles / Blog
  getArticles(): Article[] {
    return getStorageItem<Article[]>("cfig_articles", defaultArticles);
  },
  saveArticles(data: Article[]): void {
    setStorageItem("cfig_articles", data);
  },

  // Inscriptions / Devis
  getInscriptions(): InscriptionRequest[] {
    return getStorageItem<InscriptionRequest[]>("cfig_inscriptions", defaultInscriptions);
  },
  saveInscriptions(data: InscriptionRequest[]): void {
    setStorageItem("cfig_inscriptions", data);
  },
  addInscription(request: Omit<InscriptionRequest, "id" | "date" | "status">): InscriptionRequest {
    const inscriptions = this.getInscriptions();
    const newRequest: InscriptionRequest = {
      ...request,
      id: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: "En attente"
    };
    inscriptions.unshift(newRequest);
    this.saveInscriptions(inscriptions);
    return newRequest;
  },

  // Contact Messages
  getMessages(): ContactMessage[] {
    return getStorageItem<ContactMessage[]>("cfig_messages", defaultMessages);
  },
  saveMessages(data: ContactMessage[]): void {
    setStorageItem("cfig_messages", data);
  },
  addMessage(msg: Omit<ContactMessage, "id" | "date" | "status">): ContactMessage {
    const messages = this.getMessages();
    const newMsg: ContactMessage = {
      ...msg,
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: "Non lu"
    };
    messages.unshift(newMsg);
    this.saveMessages(messages);
    return newMsg;
  },

  // Testimonials
  getTestimonials(): Testimonial[] {
    return getStorageItem<Testimonial[]>("cfig_testimonials", defaultTestimonials);
  },
  saveTestimonials(data: Testimonial[]): void {
    setStorageItem("cfig_testimonials", data);
  },

  // Database Initialization Helper
  init(): void {
    if (!isClient) return;
    if (!localStorage.getItem("cfig_formations")) setStorageItem("cfig_formations", formationsData);
    if (!localStorage.getItem("cfig_articles")) setStorageItem("cfig_articles", defaultArticles);
    if (!localStorage.getItem("cfig_inscriptions")) setStorageItem("cfig_inscriptions", defaultInscriptions);
    if (!localStorage.getItem("cfig_messages")) setStorageItem("cfig_messages", defaultMessages);
    if (!localStorage.getItem("cfig_testimonials")) setStorageItem("cfig_testimonials", defaultTestimonials);
  }
};
