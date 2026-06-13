"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  MessageSquare,
  Mail,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Eye,
  Lock,
  Search,
  Filter,
  Layers,
  Calendar,
  Users,
  Award,
  Settings,
  Image as ImageIcon,
  Video
} from "lucide-react";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { MultiMediaUploader, MediaItem } from "@/components/admin/MultiMediaUploader";
import { motion, AnimatePresence } from "framer-motion";
import { db, CategorieFormations, ModuleItem, Article, InscriptionRequest, ContactMessage, Testimonial, SiteSettings, AdminUser, GalleryItem } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";

// ============================================================
// GALLERY TITLE FOLDER — collapsible folder-style section by title
// ============================================================
const getBaseTitle = (title: string) => title.replace(/\s*\(\d+\)$/, "").trim();

function GalleryTitleFolder({
  title,
  category,
  items,
  onEdit,
  onDelete,
  onEditAlbum,
  onDeleteAlbum,
}: {
  title: string;
  category: string;
  items: GalleryItem[];
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onEditAlbum: (title: string, category: string, items: GalleryItem[]) => void;
  onDeleteAlbum: (title: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Folder header */}
      <div className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50/50 transition-colors border-b border-gray-100">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-primary)]">{title}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
              {category} • {items.length} média{items.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className={`transition-transform duration-200 text-gray-400 ml-2 ${open ? "rotate-90" : ""}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Album Actions */}
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEditAlbum(title, category, items)}
            className="px-2.5 py-1.5 border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50/30 hover:bg-blue-50 flex items-center gap-1 transition-colors rounded-none"
            title="Modifier l'album (ajouter/supprimer des images)"
          >
            <Edit3 className="w-3.5 h-3.5" /> Modifier l'album
          </button>
          <button
            type="button"
            onClick={() => onDeleteAlbum(title)}
            className="px-2.5 py-1.5 border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50/30 hover:bg-red-50 flex items-center gap-1 transition-colors rounded-none"
            title="Supprimer tout l'album"
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-[var(--color-accent)] transition-colors"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                  {item.mediaType === "video" ? (
                    <video src={item.mediaUrl} className="w-full h-full object-cover" preload="metadata" />
                  ) : (
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-2 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.mediaType === "video" && (
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1.5 py-0.5 text-[9px] uppercase font-bold flex items-center gap-1 rounded-sm">
                      <Video className="w-2.5 h-2.5" /> Vidéo
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-semibold text-gray-700 truncate leading-tight">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  
  // === AUTHENTICATION STATE ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  // === ACTIVE TAB STATE ===
  const [activeTab, setActiveTab] = useState<"overview" | "inscriptions" | "formations" | "actualites" | "testimonials" | "galerie" | "messages" | "settings" | "users">("overview");

  // === DATA STATES ===
  const [formations, setFormations] = useState<CategorieFormations[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [inscriptions, setInscriptions] = useState<InscriptionRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
  // Settings & Admins states
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  // Settings form fields
  const [editApprenantsForme, setEditApprenantsForme] = useState<number | string>("");
  const [editTotalHeuresFormation, setEditTotalHeuresFormation] = useState<number | string>("");
  const [editTauxSatisfaction, setEditTauxSatisfaction] = useState<number | string>("");
  const [editAnneesExperience, setEditAnneesExperience] = useState<number | string>("");
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");
  const [settingsErrorMsg, setSettingsErrorMsg] = useState("");

  // New admin form fields
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [userSuccessMsg, setUserSuccessMsg] = useState("");
  const [userErrorMsg, setUserErrorMsg] = useState("");

  // === SEARCH & FILTER STATES ===
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // === MODAL / CRUD FORM STATES ===
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [modalTab, setModalTab] = useState<1|2|3|4>(1);
  // Onglet 1 — Infos Générales
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleCategory, setNewModuleCategory] = useState("");
  const [newModuleOutils, setNewModuleOutils] = useState("");
  const [newModulePrix, setNewModulePrix] = useState<number | "">("" );
  const [newModulePrixInscription, setNewModulePrixInscription] = useState<number | "">("" );
  const [newModuleMethodePaiement, setNewModuleMethodePaiement] = useState("");
  const [newModuleImage, setNewModuleImage] = useState("");
  const [newModuleStatutInscription, setNewModuleStatutInscription] = useState<"Ouverte" | "Fermée">("Ouverte");
  // Onglet 2 — Fiche Technique
  const [newModuleDuree, setNewModuleDuree] = useState("");
  const [newModuleDateDebut, setNewModuleDateDebut] = useState("");
  const [newModuleCalendrier, setNewModuleCalendrier] = useState("");
  const [newModuleHoraires, setNewModuleHoraires] = useState("");
  const [newModulePlanning, setNewModulePlanning] = useState<{ jour: string; horaire: string }[]>([]);
  // Onglet 3 — Pédagogie
  const [newModulePresentation, setNewModulePresentation] = useState("");
  const [newModuleObjectifs, setNewModuleObjectifs] = useState(""); // virgule-séparé
  const [newModulePrerequis, setNewModulePrerequis] = useState(""); // virgule-séparé
  const [newModulePublicCible, setNewModulePublicCible] = useState(""); // virgule-séparé
  const [newModuleDebouches, setNewModuleDebouches] = useState(""); // virgule-séparé
  // Onglet 4 — Programme détaillé
  const [newModuleProgramme, setNewModuleProgramme] = useState<{ title: string; points: string }[]>([
    { title: "", points: "" }
  ]);

  const [editingModule, setEditingModule] = useState<{ catIndex: number; modIndex: number; oldTitle: string } | null>(null);
  const [isSavingModule, setIsSavingModule] = useState(false);

  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleExcerpt, setArticleExcerpt] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleCategory, setArticleCategory] = useState("");
  const [articleAuthor, setArticleAuthor] = useState("");
  const [articleImage, setArticleImage] = useState("/images/news_hero.png");
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);

  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("");
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingAlbumTitle, setEditingAlbumTitle] = useState<string | null>(null);
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<InscriptionRequest | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // === INITIALIZATION & LOAD ===
  useEffect(() => {
    const initAndLoad = async () => {
      await db.init();
      setFormations(await db.getFormations());
      setArticles(await db.getArticles());
      setInscriptions(await db.getInscriptions());
      setMessages(await db.getMessages());
      setTestimonials(await db.getTestimonials());
      setGallery(await db.getGallery());
      
      const siteSettings = await db.getSettings();
      setSettings(siteSettings);
      setEditApprenantsForme(siteSettings.apprenantsForme);
      setEditTotalHeuresFormation(siteSettings.totalHeuresFormation);
      setEditTauxSatisfaction(siteSettings.tauxSatisfaction);
      setEditAnneesExperience(siteSettings.anneesExperience);

      setAdmins(await db.getAdmins());
    };
    initAndLoad();

    // Check Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email) {
          await db.syncAdmin(user.uid, user.email);
          setAdmins(await db.getAdmins());
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const user = userCredential.user;
      if (user.email) {
        await db.syncAdmin(user.uid, user.email);
        setAdmins(await db.getAdmins());
      }
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMsg = "Identifiants ou mot de passe incorrects.";
      if (error.code === "auth/invalid-email") {
        errorMsg = "Format d'adresse email invalide.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMsg = "Email ou mot de passe incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        errorMsg = "Trop de tentatives de connexion échouées. Compte temporairement bloqué.";
      } else if (error.message) {
        errorMsg = `Erreur de connexion : ${error.message}`;
      }
      setAuthError(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // === DB MUTATION WRAPPERS ===
  const refreshAllData = async () => {
    setFormations(await db.getFormations());
    setArticles(await db.getArticles());
    setInscriptions(await db.getInscriptions());
    setMessages(await db.getMessages());
    setTestimonials(await db.getTestimonials());
    setGallery(await db.getGallery());
    
    const siteSettings = await db.getSettings();
    setSettings(siteSettings);
    setAdmins(await db.getAdmins());
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccessMsg("");
    setSettingsErrorMsg("");
    try {
      const updatedSettings = {
        apprenantsForme: Number(editApprenantsForme),
        totalHeuresFormation: Number(editTotalHeuresFormation),
        tauxSatisfaction: Number(editTauxSatisfaction),
        anneesExperience: Number(editAnneesExperience)
      };
      await db.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setSettingsSuccessMsg("Paramètres enregistrés avec succès !");
    } catch (error) {
      console.error("Error saving settings:", error);
      setSettingsErrorMsg("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessMsg("");
    setUserErrorMsg("");
    if (!newAdminEmail || !newAdminPassword) return;
    if (newAdminPassword.length < 6) {
      setUserErrorMsg("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newAdminEmail, newAdminPassword);
      const user = userCredential.user;
      
      const newAdmin: AdminUser = {
        uid: user.uid,
        email: newAdminEmail,
        createdAt: new Date().toISOString(),
        status: "actif"
      };
      await db.saveAdmin(newAdmin);
      setAdmins(await db.getAdmins());
      
      setNewAdminEmail("");
      setNewAdminPassword("");
      setUserSuccessMsg("Compte administrateur créé avec succès !");
    } catch (error: any) {
      console.error("Error creating admin:", error);
      let errorMsg = "Erreur lors de la création du compte.";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "Cette adresse email est déjà utilisée.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "Adresse email invalide.";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "Le mot de passe est trop faible.";
      }
      setUserErrorMsg(errorMsg);
    }
  };

  const handleToggleAdminStatus = async (uid: string) => {
    const adminToUpdate = admins.find(a => a.uid === uid);
    if (!adminToUpdate) return;
    
    if (auth.currentUser && auth.currentUser.uid === uid) {
      alert("Vous ne pouvez pas suspendre votre propre compte !");
      return;
    }

    const newStatus = adminToUpdate.status === "actif" ? "suspendu" : "actif";
    if (!confirm(`Voulez-vous vraiment changer le statut de cet administrateur en '${newStatus}' ?`)) return;

    try {
      const updated = { ...adminToUpdate, status: newStatus as "actif" | "suspendu" };
      await db.saveAdmin(updated);
      setAdmins(await db.getAdmins());
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  // Helper to reset all module form fields
  const resetModuleForm = () => {
    setModalTab(1);
    setNewModuleTitle(""); setNewModuleCategory(""); setNewModuleOutils("");
    setNewModulePrix(""); setNewModulePrixInscription(""); setNewModuleMethodePaiement("");
    setNewModuleImage(""); setNewModuleStatutInscription("Ouverte");
    setNewModuleDuree(""); setNewModuleDateDebut(""); setNewModuleCalendrier(""); setNewModuleHoraires("");
    setNewModulePresentation(""); setNewModuleObjectifs(""); setNewModulePrerequis(""); setNewModulePublicCible("");
    setNewModuleDebouches("");
    setNewModulePlanning([]);
    setNewModuleProgramme([{ title: "", points: "" }]);
  };

  // 1. Formations CRUD
  const handleAddOrEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle || !newModuleCategory) return;

    setIsSavingModule(true);

    try {
      const currentFormations = [...formations];
      const outilsArray = newModuleOutils.split(",").map(o => o.trim()).filter(Boolean);

      // Build details object
      const programme = newModuleProgramme
        .filter(p => p.title.trim())
        .map(p => ({ title: p.title.trim(), points: p.points.split("\n").map(x => x.trim()).filter(Boolean) }));

      const details = {
        statutInscription: newModuleStatutInscription,
        ...(newModuleDuree.trim() && { duree: newModuleDuree.trim() }),
        ...(newModuleDateDebut.trim() && { dateDebut: newModuleDateDebut.trim() }),
        ...(newModulePresentation.trim() && { presentation: newModulePresentation.trim() }),
        ...(newModuleObjectifs.trim() && { objectifs: newModuleObjectifs.split("\n").map(x => x.trim()).filter(Boolean) }),
        ...(newModulePrerequis.trim() && { prerequis: newModulePrerequis.split("\n").map(x => x.trim()).filter(Boolean) }),
        ...(newModulePublicCible.trim() && { publicCible: newModulePublicCible.split("\n").map(x => x.trim()).filter(Boolean) }),
        ...(newModuleDebouches.trim() && { debouches: newModuleDebouches.split("\n").map(x => x.trim()).filter(Boolean) }),
        ...(programme.length > 0 && { programme }),
        planning: newModulePlanning,
        calendrier: newModulePlanning.map(p => p.jour).join(", "),
        horaires: newModulePlanning.map(p => `${p.jour}: ${p.horaire}`).join(", "),
      };

      const moduleData = {
        titre: newModuleTitle,
        outils: outilsArray,
        ...(newModulePrix !== "" && { prix: Number(newModulePrix) }),
        ...(newModulePrixInscription !== "" && { prixInscription: Number(newModulePrixInscription) }),
        ...(newModuleMethodePaiement.trim() && { methodePaiement: newModuleMethodePaiement.trim() }),
        ...(newModuleImage.trim() && { image: newModuleImage.trim() }),
        details,
      };

      if (editingModule !== null) {
        const { catIndex, modIndex } = editingModule;
        currentFormations[catIndex].modules[modIndex] = moduleData;
      } else {
        let cat = currentFormations.find(c => c.categorie.toLowerCase() === newModuleCategory.trim().toLowerCase());
        if (!cat) {
          cat = { categorie: newModuleCategory.trim(), modules: [] };
          currentFormations.push(cat);
        }
        cat.modules.push(moduleData);
      }

      await db.saveFormations(currentFormations);
      setFormations(currentFormations);
      resetModuleForm();
      setShowAddModuleModal(false);
      setEditingModule(null);
    } catch (error) {
      console.error("Error saving module:", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleDeleteModule = async (catIndex: number, modIndex: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce module de formation ?")) return;
    const currentFormations = [...formations];
    currentFormations[catIndex].modules.splice(modIndex, 1);
    
    // Remove category if empty
    if (currentFormations[catIndex].modules.length === 0) {
      currentFormations.splice(catIndex, 1);
    }

    await db.saveFormations(currentFormations);
    setFormations(currentFormations);
  };

  const startEditModule = (catIndex: number, modIndex: number) => {
    const mod = formations[catIndex].modules[modIndex];
    const d = mod.details;
    setModalTab(1);
    setNewModuleTitle(mod.titre);
    setNewModuleCategory(formations[catIndex].categorie);
    setNewModuleOutils(mod.outils.join(", "));
    setNewModulePrix(mod.prix ?? "");
    setNewModulePrixInscription(mod.prixInscription ?? "");
    setNewModuleMethodePaiement(mod.methodePaiement ?? "");
    setNewModuleImage(mod.image ?? "");
    setNewModuleStatutInscription(d?.statutInscription ?? "Ouverte");
    setNewModuleDuree(d?.duree ?? "");
    setNewModuleDateDebut(d?.dateDebut ?? "");
    setNewModulePresentation(d?.presentation ?? "");
    const initialPlanning = d?.planning ?? (
      d?.calendrier 
        ? d.calendrier.split(",").map(j => ({ jour: j.trim(), horaire: d.horaires || "18h00 - 20h00" }))
        : []
    );
    setNewModulePlanning(initialPlanning);
    setNewModuleObjectifs(d?.objectifs?.join("\n") ?? "");
    setNewModulePrerequis(d?.prerequis?.join("\n") ?? "");
    setNewModulePublicCible(d?.publicCible?.join("\n") ?? "");
    setNewModuleDebouches(d?.debouches?.join("\n") ?? "");
    setNewModuleProgramme(
      d?.programme?.map(p => ({ title: p.title, points: p.points.join("\n") })) ?? [{ title: "", points: "" }]
    );
    setEditingModule({ catIndex, modIndex, oldTitle: mod.titre });
    setShowAddModuleModal(true);
  };

  // 2. Inscriptions Actions
  const handleUpdateInscriptionStatus = async (id: string, status: "En attente" | "Validé" | "Annulé") => {
    const list = [...inscriptions];
    const item = list.find(x => x.id === id);
    if (item) {
      item.status = status;
      await db.saveInscriptions(list);
      setInscriptions(list);
    }
  };

  // 3. Articles (Blog) CRUD
  const handleAddOrEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle || !articleExcerpt) return;

    let currentArticles = [...articles];

    if (editingArticleId !== null) {
      // Edit
      currentArticles = currentArticles.map(a => 
        a.id === editingArticleId
          ? { ...a, title: articleTitle, excerpt: articleExcerpt, content: articleContent, category: articleCategory, author: articleAuthor, image: articleImage }
          : a
      );
      setEditingArticleId(null);
    } else {
      // Add
      const newArticle: Article = {
        id: currentArticles.length > 0 ? Math.max(...currentArticles.map(a => a.id)) + 1 : 1,
        title: articleTitle,
        excerpt: articleExcerpt,
        content: articleContent,
        date: new Date().toISOString().split("T")[0],
        author: articleAuthor || "Direction",
        category: articleCategory || "Actualités",
        image: articleImage
      };
      currentArticles.unshift(newArticle);
    }

    await db.saveArticles(currentArticles);
    setArticles(currentArticles);

    // Clear forms
    setArticleTitle("");
    setArticleExcerpt("");
    setArticleContent("");
    setArticleCategory("");
    setArticleAuthor("");
    setArticleImage("/images/news_hero.png");
    setShowAddArticleModal(false);
  };

  const startEditArticle = (article: Article) => {
    setArticleTitle(article.title);
    setArticleExcerpt(article.excerpt);
    setArticleContent(article.content || "");
    setArticleCategory(article.category);
    setArticleAuthor(article.author);
    setArticleImage(article.image);
    setEditingArticleId(article.id);
    setShowAddArticleModal(true);
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article de blog ?")) return;
    const currentArticles = articles.filter(a => a.id !== id);
    await db.saveArticles(currentArticles);
    setArticles(currentArticles);
  };

  // 4. Galerie CRUD
  const handleAddOrEditGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle || !galleryCategory || galleryMedia.length === 0) return;

    setIsSavingGallery(true);

    try {
      let currentGallery = [...gallery];
      if (editingAlbumTitle) {
        // 1. Remove all old items belonging to this album title
        currentGallery = currentGallery.filter(g => getBaseTitle(g.title) !== editingAlbumTitle);
        
        // 2. Add the updated list of items under the new title/category
        const newItems: GalleryItem[] = galleryMedia.map((media, index) => ({
          id: Date.now().toString() + "-edit-" + index,
          title: galleryTitle + (galleryMedia.length > 1 ? ` (${index + 1})` : ""),
          category: galleryCategory,
          mediaUrl: media.url,
          mediaType: media.type,
          dateAdded: new Date().toISOString()
        }));
        currentGallery = [...newItems, ...currentGallery];
      } else if (editingGalleryId) {
        const firstMedia = galleryMedia[0];
        currentGallery = currentGallery.map(g =>
          g.id === editingGalleryId ? { ...g, title: galleryTitle, category: galleryCategory, mediaUrl: firstMedia.url, mediaType: firstMedia.type } : g
        );
      } else {
        const newItems: GalleryItem[] = galleryMedia.map((media, index) => ({
          id: Date.now().toString() + "-" + index,
          title: galleryTitle + (galleryMedia.length > 1 ? ` (${index + 1})` : ""),
          category: galleryCategory,
          mediaUrl: media.url,
          mediaType: media.type,
          dateAdded: new Date().toISOString()
        }));
        currentGallery = [...newItems, ...currentGallery];
      }

      await db.saveGallery(currentGallery);
      setGallery(currentGallery);
      setShowAddGalleryModal(false);
      setEditingGalleryId(null);
      setEditingAlbumTitle(null);
      setGalleryTitle(""); setGalleryCategory(""); setGalleryMedia([]);
    } catch (error) {
      console.error("Error saving gallery:", error);
      alert("Une erreur est survenue lors de l'enregistrement de la galerie.");
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce média de la galerie ?")) return;
    const current = gallery.filter(g => g.id !== id);
    await db.saveGallery(current);
    setGallery(current);
  };

  const handleDeleteAlbum = async (albumTitle: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer l'album "${albumTitle}" et tous ses médias ?`)) return;
    const current = gallery.filter(g => getBaseTitle(g.title) !== albumTitle);
    await db.saveGallery(current);
    setGallery(current);
  };

  // 5. Testimonials toggle active
  const handleToggleTestimonial = async (index: number) => {
    const list = [...testimonials];
    list[index].active = !list[index].active;
    await db.saveTestimonials(list);
    setTestimonials(list);
  };

  // 5. Contact Messages mark as read
  const handleMarkMessageRead = async (id: string) => {
    const list = [...messages];
    const msg = list.find(m => m.id === id);
    if (msg) {
      msg.status = "Lu";
      await db.saveMessages(list);
      setMessages(list);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    const list = messages.filter(m => m.id !== id);
    await db.saveMessages(list);
    setMessages(list);
  };

  // === RENDERING UTILITIES ===

  // 1. Overview aggregates
  const pendingInscriptionsCount = inscriptions.filter(x => x.status === "En attente").length;
  const unreadMessagesCount = messages.filter(x => x.status === "Non lu").length;
  const modulesCount = formations.reduce((acc, cat) => acc + cat.modules.length, 0);
  const validatedInscriptionsCount = inscriptions.filter(x => x.status === "Validé").length;

  // Filter registrations
  const filteredInscriptions = inscriptions.filter(item => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "Tous" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }); 

  // Filter messages
  const filteredMessages = messages.filter(item => 
    item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4 font-sans text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-gray-300">Chargement de la session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Decorative patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute w-96 h-96 bg-[var(--color-accent)] opacity-10 rounded-full blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-[var(--color-light)] opacity-5 rounded-full blur-3xl -bottom-20 -right-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-8 w-full max-w-md shadow-2xl relative z-10 text-white rounded-none"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--color-accent)] mx-auto flex items-center justify-center font-heading font-black text-2xl tracking-wider text-white shadow-lg mb-4">
              CF
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">CFIG Guinée</h1>
            <p className="text-xs text-gray-300 mt-1 uppercase tracking-widest">Espace d'Administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-1.5">Adresse Email *</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all rounded-none"
                placeholder="Ex: admin@cfigguinee.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-1.5">Mot de passe *</label>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all rounded-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {authError && (
              <p className="text-red-300 text-xs font-semibold bg-red-900/30 p-3 border border-red-500/20">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-light)] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" /> {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400">
              🔒 Sécurisé par Firebase Authentication
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--color-gray)] flex font-sans text-gray-800 overflow-hidden">
      
      {/* ================================================
          1. SIDEBAR NAVIGATION
      ================================================ */}
      <aside className="w-64 h-full bg-[var(--color-primary)] text-white flex flex-col flex-shrink-0 z-20 sticky top-0">
        {/* Brand header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <img src="/logo.jpeg" alt="CFIG Guinée Logo" className="h-10 w-auto object-contain bg-white rounded-sm" />
          <div>
            <h1 className="font-heading font-bold text-sm tracking-wide leading-none">CFIG Guinée</h1>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Dashboard</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow p-4 space-y-1.5">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "inscriptions", label: "Inscriptions & Devis", icon: <GraduationCap className="w-4 h-4" />, badge: pendingInscriptionsCount },
            { id: "formations", label: "Formations & Modules", icon: <BookOpen className="w-4 h-4" /> },
            { id: "actualites", label: "Blog & Actualités", icon: <FileText className="w-4 h-4" /> },
            { id: "testimonials", label: "Témoignages Alumni", icon: <MessageSquare className="w-4 h-4" /> },
            { id: "galerie", label: "Galerie Médias", icon: <ImageIcon className="w-4 h-4" /> },
            { id: "messages", label: "Messages de Contact", icon: <Mail className="w-4 h-4" />, badge: unreadMessagesCount },
            { id: "users", label: "Utilisateurs Admin", icon: <Users className="w-4 h-4" /> },
            { id: "settings", label: "Paramètres", icon: <Settings className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery("");
                setStatusFilter("Tous");
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                {tab.label}
              </div>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ================================================
          2. MAIN CONTENT AREA
      ================================================ */}
      <main className="flex-grow flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-heading font-bold text-[var(--color-primary)] capitalize">
              {activeTab === "overview" && "Vue d'ensemble"}
              {activeTab === "inscriptions" && "Suivi des Inscriptions & Devis"}
              {activeTab === "formations" && "Gestion des Formations"}
              {activeTab === "actualites" && "Éditeur du Blog & Actualités"}
              {activeTab === "testimonials" && "Gestion des Témoignages"}
              {activeTab === "messages" && "Messages clients"}
              {activeTab === "users" && "Utilisateurs Admin"}
              {activeTab === "settings" && "Paramètres du Site"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Bienvenue dans l'interface de contrôle du cabinet CFIG Guinée.</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            Voir le site public
          </Link>
        </header>

        {/* Body content */}
        <div className="p-8 flex-grow">
          <AnimatePresence mode="wait">
            
            {/* ====================================
                TAB: OVERVIEW
            ==================================== */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Apprenants Formés", val: ((settings?.apprenantsForme || 540) + validatedInscriptionsCount).toString(), desc: "Total cumulé", icon: <Users className="w-5 h-5 text-[var(--color-accent)]" /> },
                    { title: "Modules Actifs", val: modulesCount.toString(), desc: "Répartis sur 8 catégories", icon: <BookOpen className="w-5 h-5 text-[var(--color-accent)]" /> },
                    { title: "Demandes en Attente", val: pendingInscriptionsCount.toString(), desc: "Besoin de validation", icon: <GraduationCap className="w-5 h-5 text-amber-500" />, warning: pendingInscriptionsCount > 0 },
                    { title: "Nouveaux Messages", val: unreadMessagesCount.toString(), desc: "Formulaires de contact", icon: <Mail className="w-5 h-5 text-red-500" />, alert: unreadMessagesCount > 0 }
                  ].map((card, i) => (
                    <div 
                      key={i} 
                      className={`bg-white border p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow ${
                        card.warning ? "border-l-4 border-l-amber-500 border-gray-200" : 
                        card.alert ? "border-l-4 border-l-red-500 border-gray-200" : "border-gray-200"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">{card.title}</span>
                        <span className="text-3xl font-heading font-black text-[var(--color-primary)] block mb-1">{card.val}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{card.desc}</span>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-100">
                        {card.icon}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Monthly Trend Card */}
                  <div className="bg-white border border-gray-200 p-6 lg:col-span-2 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-5">Tendances des Inscriptions (2026)</h3>
                    
                    {/* SVG Chart mockup - super clean and highly professional */}
                    <div className="h-64 w-full relative pt-4 flex items-end justify-between border-b border-l border-gray-200">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pr-4">
                        {[100, 75, 50, 25, 0].map((line, li) => (
                          <div key={li} className="w-full border-t border-dashed border-gray-400 text-[8px] font-bold text-gray-400 text-right -mt-2.5">
                            {line}%
                          </div>
                        ))}
                      </div>

                      {/* Bars */}
                      {[
                        { month: "Jan", val: 35 },
                        { month: "Fév", val: 42 },
                        { month: "Mar", val: 58 },
                        { month: "Avr", val: 74 },
                        { month: "Mai", val: 92 }
                      ].map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center group relative z-10 px-2 sm:px-4">
                          <div className="text-[10px] font-bold text-[var(--color-accent)] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.val}
                          </div>
                          <div 
                            style={{ height: `${item.val * 2}px` }} 
                            className="w-full bg-[var(--color-primary)] group-hover:bg-[var(--color-accent)] transition-all cursor-pointer shadow-sm"
                          />
                          <span className="text-[10px] font-bold text-gray-500 mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular domains card */}
                  <div className="bg-white border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-5">Répartition par Catégorie</h3>
                    <div className="space-y-4">
                      {[
                        { name: "Analyse des Données", percent: 38, count: 18, color: "bg-[var(--color-primary)]" },
                        { name: "Gestion & Comptabilité", percent: 28, count: 13, color: "bg-[var(--color-accent)]" },
                        { name: "Logistique et Transport", percent: 18, count: 9, color: "bg-[var(--color-light)]" },
                        { name: "Autres Domaines", percent: 16, count: 8, color: "bg-gray-300" }
                      ].map((domain, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-gray-700 truncate max-w-[170px]">{domain.name}</span>
                            <span className="text-[var(--color-primary)]">{domain.percent}% ({domain.count})</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 overflow-hidden">
                            <div style={{ width: `${domain.percent}%` }} className={`h-full ${domain.color}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recents Feed Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recents Inscriptions */}
                  <div className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-4 border-b border-gray-100 pb-3">Dernières Inscriptions</h3>
                    <div className="flex-grow divide-y divide-gray-100">
                      {inscriptions.slice(0, 4).map((ins, index) => (
                        <div key={index} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-sm text-[var(--color-primary)]">{ins.fullName}</h4>
                            <p className="text-xs text-gray-500">{ins.domain} — <span className="italic">{ins.requestType}</span></p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                            ins.status === "Validé" ? "bg-green-100 text-green-700" :
                            ins.status === "Annulé" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {ins.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recents Messages */}
                  <div className="bg-white border border-gray-200 p-6 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-4 border-b border-gray-100 pb-3">Messages récents</h3>
                    <div className="flex-grow divide-y divide-gray-100">
                      {messages.slice(0, 4).map((msg, index) => (
                        <div key={index} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="truncate max-w-[280px]">
                            <h4 className="font-bold text-sm text-[var(--color-primary)]">{msg.fullName}</h4>
                            <p className="text-xs text-gray-500 truncate italic">"{msg.message}"</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                            msg.status === "Lu" ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-700"
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: INSCRIPTIONS & DEVIS
            ==================================== */}
            {activeTab === "inscriptions" && (
              <motion.div
                key="inscriptions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Search & filters bar */}
                <div className="bg-white border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-gray-50"
                      placeholder="Rechercher un candidat, un ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex gap-2">
                    {["Tous", "En attente", "Validé", "Annulé"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          statusFilter === st
                            ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">Identifiant</th>
                        <th className="py-4 px-6">Candidat</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6">Domaine</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-center">Statut</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium">
                      {filteredInscriptions.map((ins) => (
                        <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-400">{ins.id}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-[var(--color-primary)]">{ins.fullName}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{ins.email} | {ins.phone}</div>
                            {ins.company && <div className="text-[9px] text-[var(--color-accent)] mt-0.5 uppercase tracking-wider font-bold">Entreprise : {ins.company}</div>}
                          </td>
                          <td className="py-4 px-6 italic text-gray-600">{ins.requestType}</td>
                          <td className="py-4 px-6 font-semibold">{ins.domain}</td>
                          <td className="py-4 px-6 text-gray-500">
                            {new Date(ins.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`text-[9px] font-bold px-2.5 py-1 uppercase tracking-wider ${
                              ins.status === "Validé" ? "bg-green-100 text-green-700" :
                              ins.status === "Annulé" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {ins.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRequest(ins)}
                              className="p-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                              title="Voir les détails"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {ins.status === "En attente" && (
                              <>
                                <button
                                  onClick={() => handleUpdateInscriptionStatus(ins.id, "Validé")}
                                  className="p-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                                  title="Valider"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateInscriptionStatus(ins.id, "Annulé")}
                                  className="p-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                                  title="Annuler"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredInscriptions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-gray-500 italic">
                            Aucune inscription ne correspond à ces critères.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: FORMATIONS & MODULES
            ==================================== */}
            {activeTab === "formations" && (
              <motion.div
                key="formations"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Actions header bar */}
                <div className="bg-white border border-gray-200 p-4 shadow-sm flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{modulesCount} Modules enregistrés</span>
                  <button
                    onClick={() => {
                      setEditingModule(null);
                      setNewModuleTitle("");
                      setNewModuleCategory("");
                      setNewModuleOutils("");
                      setNewModulePrix("");
                      setNewModuleImage("");
                      setShowAddModuleModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un module
                  </button>
                </div>

                {/* Categories and modules view */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formations.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-white border border-gray-200 shadow-sm flex flex-col">
                      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                        <h3 className="font-heading font-bold text-sm text-[var(--color-primary)] flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                          {cat.categorie}
                        </h3>
                        <span className="bg-[var(--color-accent)] text-white text-[9px] font-bold px-2 py-0.5">
                          {cat.modules.length} modules
                        </span>
                      </div>

                      <div className="p-4 flex-grow divide-y divide-gray-100">
                        {cat.modules.map((mod, modIdx) => (
                          <div key={modIdx} className="py-3 flex items-start justify-between gap-4 group">
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Miniature image */}
                              {mod.image ? (
                                <img
                                  src={mod.image}
                                  alt={mod.titre}
                                  className="w-14 h-10 object-cover flex-shrink-0 border border-gray-200"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-14 h-10 flex-shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-gray-800 leading-snug">{mod.titre}</h4>
                                {mod.prix !== undefined && (
                                  <span className="inline-block mt-1 text-[9px] font-bold text-[var(--color-accent)] bg-orange-50 border border-orange-200 px-1.5 py-0.5">
                                    {mod.prix.toLocaleString('fr-GN')} GNF
                                  </span>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {mod.outils && mod.outils.length > 0 ? (
                                    mod.outils.map((o, oi) => (
                                      <span key={oi} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-semibold border border-gray-200">
                                        {o}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[9px] text-gray-400 italic">Concepts métiers</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => startEditModule(catIdx, modIdx)}
                                className="p-1 text-gray-500 hover:text-[var(--color-accent)]"
                                title="Modifier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(catIdx, modIdx)}
                                className="p-1 text-gray-500 hover:text-red-500"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: ACTUALITES (BLOG)
            ==================================== */}
            {activeTab === "actualites" && (
              <motion.div
                key="actualites"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Actions bar */}
                <div className="bg-white border border-gray-200 p-4 shadow-sm flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{articles.length} Articles en ligne</span>
                  <button
                    onClick={() => {
                      setEditingArticleId(null);
                      setArticleTitle("");
                      setArticleExcerpt("");
                      setArticleCategory("");
                      setArticleAuthor("");
                      setArticleImage("/images/news_hero.png");
                      setShowAddArticleModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Créer un article
                  </button>
                </div>

                {/* Table grid */}
                <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">Titre</th>
                        <th className="py-4 px-6">Auteur</th>
                        <th className="py-4 px-6">Catégorie</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 max-w-sm">
                            <div className="font-bold text-[var(--color-primary)] truncate">{art.title}</div>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">{art.excerpt}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{art.author}</td>
                          <td className="py-4 px-6">
                            <span className="bg-blue-50 text-[var(--color-accent)] border border-blue-100 px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-500">
                            {new Date(art.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-4 px-6 text-right flex items-center justify-end gap-1.5 mt-2.5">
                            <button
                              onClick={() => startEditArticle(art)}
                              className="p-1.5 bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100"
                              title="Modifier"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: TESTIMONIALS
            ==================================== */}
            {activeTab === "testimonials" && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-5 border-b border-gray-100 pb-3">Témoignages Alumni actifs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((test, index) => (
                      <div 
                        key={index} 
                        className={`bg-white border p-6 shadow-sm flex flex-col relative ${
                          test.active ? "border-gray-200" : "border-gray-300 opacity-60 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 pt-2 pb-4 border-b border-gray-100">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${test.color}`}>
                            {test.initials}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[var(--color-primary)]">{test.name}</h4>
                            <p className="text-[10px] text-gray-500">{test.role}</p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 italic leading-relaxed py-4 flex-grow">
                          "{test.text}"
                        </p>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] text-amber-500 font-bold">★ {test.rating}/5</span>
                          <button
                            onClick={() => handleToggleTestimonial(index)}
                            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider border ${
                              test.active 
                                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            }`}
                          >
                            {test.active ? "Désactiver" : "Activer"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: GALERIE
            ==================================== */}
            {activeTab === "galerie" && (
              <motion.div
                key="galerie"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Toolbar */}
                <div className="flex justify-between items-center bg-white p-4 border border-gray-200 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">Galerie Médias</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                      {gallery.length} média(s) — {new Set(gallery.map(g => g.category)).size} catégorie(s)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingGalleryId(null);
                      setGalleryTitle(""); setGalleryCategory(""); setGalleryMedia([]);
                      setShowAddGalleryModal(true);
                    }}
                    className="px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--color-primary)] transition-colors rounded-none"
                  >
                    <Plus className="w-4 h-4" /> Ajouter des médias
                  </button>
                </div>

                {/* Title folders (Albums) */}
                {gallery.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 italic bg-white border border-gray-200">
                    <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    Aucun média dans la galerie.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Group items by base title
                      const grouped: Record<string, { category: string; items: GalleryItem[] }> = {};
                      gallery.forEach(item => {
                        const baseTitle = getBaseTitle(item.title);
                        if (!grouped[baseTitle]) {
                          grouped[baseTitle] = {
                            category: item.category,
                            items: []
                          };
                        }
                        grouped[baseTitle].items.push(item);
                      });

                      return Object.entries(grouped).map(([baseTitle, group]) => (
                        <GalleryTitleFolder
                          key={baseTitle}
                          title={baseTitle}
                          category={group.category}
                          items={group.items}
                          onEdit={(item) => {
                            setEditingGalleryId(item.id);
                            setGalleryTitle(getBaseTitle(item.title));
                            setGalleryCategory(item.category);
                            setGalleryMedia([{ url: item.mediaUrl, type: item.mediaType }]);
                            setShowAddGalleryModal(true);
                          }}
                          onDelete={handleDeleteGallery}
                          onEditAlbum={(albumTitle, category, items) => {
                            setEditingAlbumTitle(albumTitle);
                            setGalleryTitle(albumTitle);
                            setGalleryCategory(category);
                            setGalleryMedia(items.map(item => ({ url: item.mediaUrl, type: item.mediaType })));
                            setShowAddGalleryModal(true);
                          }}
                          onDeleteAlbum={handleDeleteAlbum}
                        />
                      ));
                    })()}
                  </div>
                )}
              </motion.div>
            )}

            {/* ====================================
                TAB: CONTACT MESSAGES
            ==================================== */}
            {activeTab === "messages" && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">Expéditeur</th>
                        <th className="py-4 px-6">Objet</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-center">Statut</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs font-medium">
                      {filteredMessages.map((msg) => (
                        <tr key={msg.id} className={`hover:bg-gray-50 transition-colors ${msg.status === "Non lu" ? "bg-red-50/10 font-bold" : ""}`}>
                          <td className="py-4 px-6">
                            <div className="text-[var(--color-primary)]">{msg.fullName}</div>
                            <div className="text-[10px] text-gray-500 font-medium">{msg.email}</div>
                          </td>
                          <td className="py-4 px-6 italic text-gray-600 truncate max-w-xs">{msg.subject}</td>
                          <td className="py-4 px-6 text-gray-500">
                            {new Date(msg.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                              msg.status === "Lu" ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-700"
                            }`}>
                              {msg.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                handleMarkMessageRead(msg.id);
                                setSelectedMessage(msg);
                              }}
                              className="p-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                              title="Lire le message"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredMessages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-500 italic">
                            Aucun message de contact reçu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: SETTINGS
            ==================================== */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 max-w-2xl"
              >
                <div className="bg-white border border-gray-200 p-8 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-6 border-b border-gray-100 pb-3">Paramètres globaux du site</h3>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nombre de base - Apprenants Formés *</label>
                      <input
                        type="number"
                        required
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                        placeholder="Ex: 540"
                        value={editApprenantsForme}
                        onChange={(e) => setEditApprenantsForme(e.target.value)}
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Ce nombre est additionné aux inscriptions validées de la base de données pour afficher le total des apprenants formés.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Total Heures de Formation *</label>
                      <input
                        type="number"
                        required
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                        placeholder="Ex: 1200"
                        value={editTotalHeuresFormation}
                        onChange={(e) => setEditTotalHeuresFormation(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Taux de Satisfaction (%) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                        placeholder="Ex: 95"
                        value={editTauxSatisfaction}
                        onChange={(e) => setEditTauxSatisfaction(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Années d'Expérience *</label>
                      <input
                        type="number"
                        required
                        className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                        placeholder="Ex: 5"
                        value={editAnneesExperience}
                        onChange={(e) => setEditAnneesExperience(e.target.value)}
                      />
                    </div>

                    {settingsSuccessMsg && (
                      <p className="text-green-700 text-xs font-semibold bg-green-50 p-3 border border-green-200">{settingsSuccessMsg}</p>
                    )}
                    {settingsErrorMsg && (
                      <p className="text-red-700 text-xs font-semibold bg-red-50 p-3 border border-red-200">{settingsErrorMsg}</p>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-3 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors rounded-none"
                    >
                      Enregistrer les modifications
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ====================================
                TAB: USERS (ADMIN MANAGEMENT)
            ==================================== */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Create Admin Form */}
                  <div className="bg-white border border-gray-200 p-6 shadow-sm h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-5 border-b border-gray-100 pb-3">Créer un Administrateur</h3>
                    
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Adresse email *</label>
                        <input
                          type="email"
                          required
                          className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                          placeholder="admin@cfigguinee.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mot de passe (min 6 car.) *</label>
                        <input
                          type="password"
                          required
                          className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                          placeholder="••••••••"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                        />
                      </div>

                      {userSuccessMsg && (
                        <p className="text-green-700 text-xs font-semibold bg-green-50 p-3 border border-green-200">{userSuccessMsg}</p>
                      )}
                      {userErrorMsg && (
                        <p className="text-red-700 text-xs font-semibold bg-red-50 p-3 border border-red-200">{userErrorMsg}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 rounded-none"
                      >
                        <Plus className="w-4 h-4" /> Créer le compte
                      </button>
                    </form>
                  </div>

                  {/* Admin List */}
                  <div className="bg-white border border-gray-200 p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-5 border-b border-gray-100 pb-3">Comptes Administrateurs</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Créé le</th>
                            <th className="py-3 px-4 text-center">Statut</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs font-medium">
                          {admins.map((adm) => (
                            <tr key={adm.uid} className={`hover:bg-gray-50 transition-colors ${adm.status === "suspendu" ? "opacity-60 bg-gray-50" : ""}`}>
                              <td className="py-3 px-4 font-bold text-[var(--color-primary)]">{adm.email}</td>
                              <td className="py-3 px-4 text-gray-500">
                                {new Date(adm.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider ${
                                  adm.status === "actif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {adm.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {auth.currentUser?.uid !== adm.uid ? (
                                  <button
                                    onClick={() => handleToggleAdminStatus(adm.uid)}
                                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${
                                      adm.status === "actif" 
                                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                                        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    }`}
                                  >
                                    {adm.status === "actif" ? "Suspendre" : "Activer"}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-400 italic">Mon compte</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ================================================
          3. FULL MODALS (CRUD / VIEW DETAILS)
      ================================================ */}
      
      {/* Modal: Add/Edit Module — Multi-Tab */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl border border-gray-200 shadow-2xl text-gray-800 rounded-none flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base font-heading font-bold text-[var(--color-primary)]">
                {editingModule !== null ? "Modifier la formation" : "Ajouter une formation"}
              </h3>
              <button
                disabled={isSavingModule}
                onClick={() => { setShowAddModuleModal(false); setEditingModule(null); resetModuleForm(); }}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-gray-100 flex-shrink-0 bg-gray-50">
              {(["Infos Générales", "Fiche Technique", "Pédagogie", "Programme"] as const).map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setModalTab((i + 1) as 1|2|3|4)}
                  className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-3 px-2 border-b-2 transition-colors ${
                    modalTab === i + 1
                      ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-white"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {i + 1}. {tab}
                </button>
              ))}
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleAddOrEditModule} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* === ONGLET 1: Infos Générales === */}
                {modalTab === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Catégorie *</label>
                        <input type="text" required disabled={isSavingModule}
                          className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          placeholder="Ex: Analyse des Données, Gestion..."
                          value={newModuleCategory} onChange={e => setNewModuleCategory(e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Intitulé de la formation *</label>
                        <input type="text" required disabled={isSavingModule}
                          className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          placeholder="Ex: Initiation à Excel"
                          value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Outils <span className="normal-case text-gray-400 font-normal">(séparés par virgules)</span></label>
                        <input type="text" disabled={isSavingModule}
                          className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          placeholder="Ex: Excel, PowerBI, Canva"
                          value={newModuleOutils} onChange={e => setNewModuleOutils(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Statut des inscriptions</label>
                        <select disabled={isSavingModule}
                          className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          value={newModuleStatutInscription} onChange={e => setNewModuleStatutInscription(e.target.value as "Ouverte" | "Fermée")}>
                          <option value="Ouverte">Ouverte</option>
                          <option value="Fermée">Fermée</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Image de la formation</label>
                        <MediaUploader
                          accept="image"
                          value={newModuleImage}
                          onChange={(url) => setNewModuleImage(url)}
                          label="Uploader une image"
                        />
                      </div>
                    </div>

                    <div className="border border-gray-100 bg-gray-50 p-4 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">Tarification</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Prix formation (GNF)</label>
                          <input type="number" min="0" step="1000" disabled={isSavingModule}
                            className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                            placeholder="Ex: 2 000 000" value={newModulePrix}
                            onChange={e => setNewModulePrix(e.target.value === "" ? "" : Number(e.target.value))} />
                          <p className="text-[9px] text-gray-400 mt-1">Coût total de la formation</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Frais d'inscription (GNF)</label>
                          <input type="number" min="0" step="1000" disabled={isSavingModule}
                            className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                            placeholder="Ex: 100 000" value={newModulePrixInscription}
                            onChange={e => setNewModulePrixInscription(e.target.value === "" ? "" : Number(e.target.value))} />
                          <p className="text-[9px] text-gray-400 mt-1">Frais d'enrôlement seulement</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Méthode de paiement</label>
                        <select disabled={isSavingModule}
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 cursor-pointer"
                          value={newModuleMethodePaiement} onChange={e => setNewModuleMethodePaiement(e.target.value)}>
                          <option value="">— Sélectionner —</option>
                          <option value="Paiement comptant">Paiement comptant (intégral)</option>
                          <option value="En 2 tranches">En 2 tranches</option>
                          <option value="En 3 tranches">En 3 tranches</option>
                          <option value="En 4 tranches">En 4 tranches</option>
                          <option value="À négocier">À négocier</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* === ONGLET 2: Fiche Technique === */}
                {modalTab === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Durée</label>
                        <input type="text" disabled={isSavingModule}
                          className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          placeholder="Ex: 2 mois / 80h"
                          value={newModuleDuree} onChange={e => setNewModuleDuree(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date de début</label>
                        <input type="text" disabled={isSavingModule}
                          className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          placeholder="Ex: 15 Juillet 2026"
                          value={newModuleDateDebut} onChange={e => setNewModuleDateDebut(e.target.value)} />
                      </div>
                      <div className="col-span-2 mt-2 border-t border-gray-100 pt-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-3">
                          Planning hebdomadaire (Jours et Horaires)
                        </label>
                        <div className="space-y-2.5">
                          {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((jour) => {
                            const planningItem = newModulePlanning.find(p => p.jour === jour);
                            const isChecked = !!planningItem;
                            return (
                              <div key={jour} className="flex items-center gap-4 py-1.5 border-b border-gray-50 last:border-b-0">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 w-24 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    disabled={isSavingModule}
                                    className="w-3.5 h-3.5 border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewModulePlanning([...newModulePlanning, { jour, horaire: "18h00 - 20h00" }]);
                                      } else {
                                        setNewModulePlanning(newModulePlanning.filter(p => p.jour !== jour));
                                      }
                                    }}
                                  />
                                  {jour}
                                </label>
                                {isChecked && (
                                  <input
                                    type="text"
                                    disabled={isSavingModule}
                                    required
                                    className="flex-1 bg-white border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                                    placeholder="Ex: 18h00 - 20h00, 9h00 - 12h00"
                                    value={planningItem.horaire}
                                    onChange={(e) => {
                                      setNewModulePlanning(
                                        newModulePlanning.map(p => p.jour === jour ? { ...p, horaire: e.target.value } : p)
                                      );
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* === ONGLET 3: Pédagogie === */}
                {modalTab === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Présentation <span className="text-gray-400 normal-case font-normal">(optionnel)</span></label>
                      <textarea rows={4} disabled={isSavingModule}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 resize-none"
                        placeholder="Décrivez la formation en quelques lignes..."
                        value={newModulePresentation} onChange={e => setNewModulePresentation(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Objectifs pédagogiques <span className="text-gray-400 normal-case font-normal">(1 par ligne)</span></label>
                      <textarea rows={4} disabled={isSavingModule}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 resize-none"
                        placeholder="Maîtriser les fondamentaux de Excel\nCréer des tableaux croisés dynamiques\n..."
                        value={newModuleObjectifs} onChange={e => setNewModuleObjectifs(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Prérequis <span className="text-gray-400 normal-case font-normal">(1 par ligne)</span></label>
                      <textarea rows={3} disabled={isSavingModule}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 resize-none"
                        placeholder="Avoir un ordinateur\nSavoir utiliser une souris\n..."
                        value={newModulePrerequis} onChange={e => setNewModulePrerequis(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Public cible <span className="text-gray-400 normal-case font-normal">(1 par ligne)</span></label>
                      <textarea rows={3} disabled={isSavingModule}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 resize-none"
                        placeholder="Étudiants\nProfessionnels en reconversion\n..."
                        value={newModulePublicCible} onChange={e => setNewModulePublicCible(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Débouchés professionnels / Emplois cibles <span className="text-gray-400 normal-case font-normal">(1 par ligne, optionnel)</span></label>
                      <textarea rows={3} disabled={isSavingModule}
                        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 resize-none"
                        placeholder="Comptable agréé\nAnalyste financier\nConsultant en gestion\n..."
                        value={newModuleDebouches} onChange={e => setNewModuleDebouches(e.target.value)} />
                    </div>
                  </div>
                )}

                {/* === ONGLET 4: Programme Détaillé === */}
                {modalTab === 4 && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-400">Ajoutez chaque module du programme. Les points de contenu sont séparés par des retours à la ligne.</p>
                    {newModuleProgramme.map((chapter, i) => (
                      <div key={i} className="border border-gray-200 p-4 bg-gray-50 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-[var(--color-primary)] text-white px-2 py-0.5">Module {i + 1}</span>
                          {newModuleProgramme.length > 1 && (
                            <button type="button" onClick={() => {
                              const arr = [...newModuleProgramme];
                              arr.splice(i, 1);
                              setNewModuleProgramme(arr);
                            }} className="ml-auto text-red-400 hover:text-red-600 text-[10px] font-bold">
                              ✕ Supprimer
                            </button>
                          )}
                        </div>
                        <input type="text" disabled={isSavingModule}
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50"
                          placeholder="Titre du module (ex: Introduction à PowerBI)"
                          value={chapter.title}
                          onChange={e => {
                            const arr = [...newModuleProgramme];
                            arr[i] = { ...arr[i], title: e.target.value };
                            setNewModuleProgramme(arr);
                          }} />
                        <textarea rows={3} disabled={isSavingModule}
                          className="w-full bg-white border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none disabled:opacity-50 resize-none"
                          placeholder="Contenu du module (1 point par ligne)..."
                          value={chapter.points}
                          onChange={e => {
                            const arr = [...newModuleProgramme];
                            arr[i] = { ...arr[i], points: e.target.value };
                            setNewModuleProgramme(arr);
                          }} />
                      </div>
                    ))}
                    <button type="button"
                      onClick={() => setNewModuleProgramme([...newModuleProgramme, { title: "", points: "" }])}
                      className="w-full border-2 border-dashed border-gray-300 py-2.5 text-xs font-bold text-gray-400 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
                      + Ajouter un module
                    </button>
                  </div>
                )}

              </div>

              {/* Sticky Footer — buttons always visible */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
                <div className="flex gap-1">
                  {([1,2,3,4] as const).map(n => (
                    <button key={n} type="button" onClick={() => setModalTab(n)}
                      className={`w-6 h-1.5 rounded-full transition-colors ${ modalTab === n ? "bg-[var(--color-primary)]" : "bg-gray-200 hover:bg-gray-300" }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {modalTab > 1 && (
                    <button type="button" onClick={() => setModalTab((modalTab - 1) as 1|2|3|4)}
                      className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 text-gray-600 rounded-none">
                      ← Précédent
                    </button>
                  )}
                  {modalTab < 4 ? (
                    <button type="button" onClick={() => setModalTab((modalTab + 1) as 1|2|3|4)}
                      className="px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-primary)] transition-colors rounded-none">
                      Suivant →
                    </button>
                  ) : (
                    <button type="submit" disabled={isSavingModule}
                      className="px-6 py-2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors rounded-none disabled:opacity-50 flex items-center gap-2">
                      {isSavingModule ? (
                        <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Enregistrement...</>
                      ) : (
                        editingModule !== null ? " Enregistrer" : "✓ Créer la formation"
                      )}
                    </button>
                  )}
                  <button type="button" disabled={isSavingModule}
                    onClick={() => { setShowAddModuleModal(false); setEditingModule(null); resetModuleForm(); }}
                    className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 text-gray-500 rounded-none disabled:opacity-50">
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Add/Edit Article */}
      {showAddArticleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 w-full max-w-lg border border-gray-200 shadow-2xl text-gray-800 rounded-none max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-heading font-bold text-[var(--color-primary)]">
                {editingArticleId !== null ? "Modifier l'article" : "Rédiger un article"}
              </h3>
              <button onClick={() => {
                setShowAddArticleModal(false);
                setEditingArticleId(null);
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOrEditArticle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Catégorie</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                    placeholder="Ex: Conseils, Événements"
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Auteur</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                    placeholder="Ex: Direction, Ousmane Condé"
                    value={articleAuthor}
                    onChange={(e) => setArticleAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Titre de l'article *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                  placeholder="Ex: Nouveau module Excel"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Image de couverture</label>
                <MediaUploader
                  accept="image"
                  value={articleImage}
                  onChange={(url) => setArticleImage(url)}
                  label="Uploader une image de couverture"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description / Extrait court *</label>
                <textarea
                  rows={2}
                  required
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                  placeholder="Rédigez un court résumé de l'article..."
                  value={articleExcerpt}
                  onChange={(e) => setArticleExcerpt(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Contenu de l'article (Texte complet) *</label>
                <textarea
                  rows={6}
                  required
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                  placeholder="Rédigez le contenu complet de l'article (utilisez des sauts de ligne doubles pour séparer les paragraphes)..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddArticleModal(false);
                    setEditingArticleId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 text-gray-600 rounded-none"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors rounded-none"
                >
                  {editingArticleId !== null ? "Enregistrer" : "Publier"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Add/Edit Gallery Media */}
      {showAddGalleryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 w-full max-w-lg border border-gray-200 shadow-2xl text-gray-800 rounded-none max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-heading font-bold text-[var(--color-primary)]">
                {editingAlbumTitle !== null ? `Modifier l'album : ${editingAlbumTitle}` : editingGalleryId !== null ? "Modifier le média" : "Ajouter des médias"}
              </h3>
              <button 
                onClick={() => {
                  setShowAddGalleryModal(false);
                  setEditingGalleryId(null);
                  setEditingAlbumTitle(null);
                  setGalleryTitle("");
                  setGalleryCategory("");
                  setGalleryMedia([]);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOrEditGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Titre *</label>
                <input
                  type="text" required
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                  placeholder="Ex: Remise des diplômes 2024"
                  value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Catégorie *</label>
                <select
                  required
                  className="w-full bg-gray-50 border border-gray-300 px-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                  value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value)}
                >
                  <option value="">Sélectionnez une catégorie...</option>
                  <option value="Salles de cours">Salles de cours</option>
                  <option value="Remises de certificats">Remises de certificats</option>
                  <option value="Ateliers">Ateliers</option>
                  <option value="Événements divers">Événements divers</option>
                  <option value="Vie étudiante">Vie étudiante</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Médias (Image ou Vidéo) *</label>
                <MultiMediaUploader
                  accept="both"
                  values={galleryMedia}
                  onAdd={(item) => setGalleryMedia(prev => [...prev, item])}
                  onRemove={(index) => setGalleryMedia(prev => {
                    const newMedia = [...prev];
                    newMedia.splice(index, 1);
                    return newMedia;
                  })}
                  label={editingGalleryId ? "Remplacer le média" : editingAlbumTitle ? "Ajouter d'autres médias à l'album" : "Uploader un ou plusieurs médias"}
                  maxFiles={editingGalleryId ? 1 : 15}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddGalleryModal(false);
                    setEditingGalleryId(null);
                    setEditingAlbumTitle(null);
                    setGalleryTitle("");
                    setGalleryCategory("");
                    setGalleryMedia([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 text-gray-600 rounded-none"
                >
                  Annuler
                </button>
                <button type="submit" disabled={isSavingGallery}
                  className="px-6 py-2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors rounded-none disabled:opacity-50 flex items-center gap-2">
                  {isSavingGallery ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Enregistrement...</>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: View Inscription details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 w-full max-w-lg border border-gray-200 shadow-2xl text-gray-800 rounded-none max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedRequest.id}</span>
                <h3 className="text-lg font-heading font-bold text-[var(--color-primary)]">Fiche d'inscription</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-200">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Nom Complet</span>
                  <span className="font-bold text-[var(--color-primary)]">{selectedRequest.fullName}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Téléphone</span>
                  <span className="font-bold">{selectedRequest.phone}</span>
                </div>
                <div className="mt-2">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Adresse Email</span>
                  <span className="font-bold">{selectedRequest.email}</span>
                </div>
                <div className="mt-2">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Date d'envoi</span>
                  <span className="font-bold">
                    {new Date(selectedRequest.date).toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Type de demande</span>
                  <span className="font-semibold text-gray-700">{selectedRequest.requestType}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Domaine de formation</span>
                  <span className="font-semibold text-gray-700">{selectedRequest.domain}</span>
                </div>
              </div>

              {selectedRequest.company && (
                <div>
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Entreprise / Organisation</span>
                  <span className="font-semibold text-[var(--color-primary)]">{selectedRequest.company}</span>
                </div>
              )}

              {selectedRequest.message && (
                <div className="border-t border-gray-100 pt-3">
                  <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-1">Message & besoins spécifiques</span>
                  <div className="bg-gray-50/50 border border-gray-200 p-3 text-gray-600 whitespace-pre-line leading-relaxed italic">
                    "{selectedRequest.message}"
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 text-gray-600 rounded-none"
              >
                Fermer
              </button>
              {selectedRequest.status === "En attente" && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateInscriptionStatus(selectedRequest.id, "Validé");
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
                  >
                    Valider le dossier
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateInscriptionStatus(selectedRequest.id, "Annulé");
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
                  >
                    Rejeter
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: View Contact Message details */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 w-full max-w-lg border border-gray-200 shadow-2xl text-gray-800 rounded-none max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedMessage.id}</span>
                <h3 className="text-lg font-heading font-bold text-[var(--color-primary)]">Message de contact</h3>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-4 border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Expéditeur</span>
                    <span className="font-bold text-[var(--color-primary)]">{selectedMessage.fullName}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Date de réception</span>
                    <span className="font-bold">{new Date(selectedMessage.date).toLocaleString("fr-FR")}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-gray-400">Email</span>
                  <span className="font-bold">{selectedMessage.email}</span>
                </div>
              </div>

              <div>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-1">Sujet / Objet</span>
                <span className="font-bold text-gray-800 text-sm">{selectedMessage.subject}</span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="block text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-1">Contenu du message</span>
                <div className="bg-gray-50/50 border border-gray-200 p-4 text-gray-600 whitespace-pre-line leading-relaxed italic">
                  "{selectedMessage.message}"
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-6 py-2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors rounded-none"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
