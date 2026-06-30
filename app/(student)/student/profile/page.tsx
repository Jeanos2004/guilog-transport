"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { studentDb, StudentProfile } from "@/lib/studentDb";
import StudentSidebar from "@/components/student/Sidebar";
import StudentHeader from "@/components/student/Header";
import { 
  User as UserIcon, Mail, Phone, Briefcase, CheckCircle, Save, 
  MessageSquare, Bell, Shield, Sliders, Globe, Wifi, Eye, EyeOff, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Section Navigation
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security">("profile");

  // Tab 1: Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("student");
  const [bio, setBio] = useState("");

  // Tab 2: Preferences fields
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(true);
  const [themeMode, setThemeMode] = useState("light");

  // Tab 3: Security fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const p = await studentDb.getProfile(currentUser.uid);
          if (!p || !p.profession) {
            router.push("/admin");
            return;
          }
          setProfile(p);
          setFullName(p.fullName);
          setPhone(p.phone || "");
          setProfession(p.profession || "other");
      } else {
        router.push("/student/login");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("guilogtrans-preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.emailAlerts !== undefined) setEmailAlerts(parsed.emailAlerts);
        if (parsed.smsAlerts !== undefined) setSmsAlerts(parsed.smsAlerts);
        if (parsed.lowDataMode !== undefined) setLowDataMode(parsed.lowDataMode);
        if (parsed.themeMode !== undefined) setThemeMode(parsed.themeMode);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem("guilogtrans-preferences", JSON.stringify({
      emailAlerts,
      smsAlerts,
      lowDataMode,
      themeMode
    }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);

    try {
      // Upsert profile
      const updated = await studentDb.createProfile(user.uid, user.email || "", fullName, phone, profession);
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde du profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-gray-800">
      <StudentSidebar />

      <div className="flex-grow flex flex-col h-auto md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden">
        <StudentHeader title="Réglages & Compte" />

        {/* Main Content Body */}
        <main className="flex-grow p-8 overflow-y-auto">
          {/* Welcome/Page Intro */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl font-heading font-black text-gray-900">
                Paramètres du Profil
              </h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Gérez vos informations personnelles, préférences de streaming, et sécurité de connexion.
              </p>
            </div>
            
            {/* Quick Status Info */}
            <div className="flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-2.5 rounded-none border border-blue-200 shadow-sm">
              <div className="w-2 h-2 rounded-none bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Compte actif</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Left Nav menu inside settings */}
            <aside className="w-full lg:w-64 bg-white border border-gray-200 rounded-none p-5 shrink-0 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible shadow-sm">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4.5 py-3 text-xs font-bold uppercase tracking-wider rounded-none border-l-2 lg:w-full transition-all shrink-0 ${
                  activeTab === "profile" 
                    ? "bg-blue-50 text-blue-600 border-blue-600 shadow-sm" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Mon profil</span>
              </button>
              
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex items-center gap-3 px-4.5 py-3 text-xs font-bold uppercase tracking-wider rounded-none border-l-2 lg:w-full transition-all shrink-0 ${
                  activeTab === "preferences" 
                    ? "bg-blue-50 text-blue-600 border-blue-600 shadow-sm" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Préférences</span>
              </button>
 
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-4.5 py-3 text-xs font-bold uppercase tracking-wider rounded-none border-l-2 lg:w-full transition-all shrink-0 ${
                  activeTab === "security" 
                    ? "bg-blue-50 text-blue-600 border-blue-600 shadow-sm" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Sécurité</span>
              </button>
            </aside>

            {/* Right Form Card */}
            <div className="flex-grow bg-white border border-gray-200 rounded-none p-6 md:p-8 shadow-sm flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Informations Personnelles</h3>
                      <p className="text-[11px] text-gray-450 mt-1">Vos coordonnées et statut d'étudiant pour vos certificats Guilogtrans officiels.</p>
                    </div>

                    {success && (
                      <div className="p-4 bg-green-50 border border-green-300 text-green-700 text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-2 shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Profil mis à jour avec succès !</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Adresse E-mail (Non modifiable)</label>
                          <div className="relative opacity-60">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              disabled
                              className="w-full bg-slate-100 border border-gray-300 px-11 py-3 text-xs rounded-none cursor-not-allowed font-medium shadow-sm"
                              value={profile?.email || ""}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nom Complet *</label>
                          <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              required
                              className="w-full bg-slate-50 border border-gray-300 px-11 py-3 text-xs rounded-none focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-all font-medium text-gray-800 shadow-sm"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Numéro de Téléphone *</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">+224</span>
                            <input
                              type="tel"
                              required
                              className="w-full bg-slate-50 border border-gray-300 pl-14 pr-4 py-3 text-xs font-bold rounded-none focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-all text-gray-800 shadow-sm"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Statut Professionnel *</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                              required
                              className="w-full bg-slate-50 border border-gray-300 pl-11 pr-4 py-3 text-xs rounded-none focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-all appearance-none font-medium text-gray-800 shadow-sm"
                              value={profession}
                              onChange={(e) => setProfession(e.target.value)}
                            >
                              <option value="student">Étudiant / Élève</option>
                              <option value="employee">Salarié / Professionnel</option>
                              <option value="unemployed">Recherche d'emploi</option>
                              <option value="other">Autre</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Mini Biographie / Présentation</label>
                        <textarea
                          placeholder="Parlez-nous brièvement de vous et de vos objectifs de carrière..."
                          className="w-full bg-slate-50 border border-gray-300 p-4 text-xs rounded-none focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-all font-medium text-gray-850 h-24 resize-none shadow-sm"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center gap-2 disabled:opacity-50 border border-[var(--color-primary)] shadow-sm hover:shadow-md"
                        >
                          {saving ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Enregistrer le profil</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Préférences d'Apprentissage</h3>
                      <p className="text-[11px] text-gray-450 mt-1">Configurez les alertes et le comportement de lecture vidéo de la plateforme.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Streaming preference */}
                      <div className="bg-slate-50/50 border border-slate-300 p-5 rounded-none flex items-start justify-between gap-4 shadow-sm">
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-none border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Wifi className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">Économiseur de données vidéo</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-normal max-w-lg">
                              Recommandé en Guinée. Limite automatiquement le streaming vidéo à 360p/480p pour réduire la consommation de votre forfait internet mobile.
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input 
                            type="checkbox" 
                            checked={lowDataMode}
                            onChange={(e) => setLowDataMode(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-none border border-gray-300 peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Communication / Alerts preference */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Canaux de communication</h4>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailAlerts}
                              onChange={(e) => setEmailAlerts(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-800 block">Alertes de cours par e-mail</span>
                              <span className="text-[10px] text-gray-450 block">Recevoir des rappels pour vos leçons de la semaine.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={smsAlerts}
                              onChange={(e) => setSmsAlerts(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-800 block">Alertes SMS & WhatsApp (+224)</span>
                              <span className="text-[10px] text-gray-450 block">Notifications en direct pour les sessions live et examens.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Display preference */}
                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Thème visuel</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setThemeMode("light")}
                            className={`p-4 border rounded-none text-left transition-all ${
                              themeMode === "light" 
                                ? "border-gray-200 bg-blue-50 text-blue-700 shadow-sm" 
                                : "border-gray-300 text-gray-500 hover:bg-slate-50 shadow-sm"
                            }`}
                          >
                            <span className="block text-xs font-bold">Thème clair</span>
                            <span className="block text-[9px] text-gray-400 mt-0.5">Fond blanc épuré standard</span>
                          </button>

                          <button
                            onClick={() => setThemeMode("dark")}
                            className={`p-4 border rounded-none text-left transition-all ${
                              themeMode === "dark" 
                                ? "border-gray-200 bg-blue-50 text-blue-700 shadow-sm" 
                                : "border-gray-300 text-gray-500 hover:bg-slate-50 shadow-sm"
                            }`}
                          >
                            <span className="block text-xs font-bold">Thème sombre (Bientôt)</span>
                            <span className="block text-[9px] text-gray-400 mt-0.5">Idéal pour le travail de nuit</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={savePreferences}
                        className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center gap-2 border border-[var(--color-primary)] shadow-sm hover:shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer les préférences</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Sécurité du Compte</h3>
                      <p className="text-[11px] text-gray-450 mt-1">Mettez à jour votre mot de passe et surveillez vos accès.</p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setSuccess(true);
                      setCurrentPassword("");
                      setNewPassword("");
                      setTimeout(() => setSuccess(false), 3000);
                    }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Mot de passe actuel</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              className="w-full bg-slate-50 border border-gray-300 px-11 py-3 text-xs rounded-none focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-all font-medium text-gray-800 shadow-sm"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nouveau mot de passe</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              className="w-full bg-slate-50 border border-gray-300 px-11 py-3 text-xs rounded-none focus:outline-none focus:border-[var(--color-accent)] focus:bg-white transition-all font-medium text-gray-850 shadow-sm"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-300 p-5 rounded-none shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          Appareil connecté actif
                        </h4>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                          <span>Navigateur : Chrome (Windows)</span>
                          <span className="text-green-600 font-extrabold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-none bg-green-500" />
                            Cette session
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-widest rounded-none transition-all flex items-center gap-2 border border-[var(--color-primary)] shadow-sm hover:shadow-md"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Mettre à jour la sécurité</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
