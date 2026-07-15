"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { studentDb, StudentProfile, StudentCourse, CourseSession } from "@/lib/studentDb";
import StudentSidebar from "@/components/student/Sidebar";
import StudentHeader from "@/components/student/Header";
import { 
  ArrowLeft, BookOpen, Download, FileText, CheckCircle2, 
  ChevronRight, Play, Award, Clock, Star, Bookmark, Calendar,
  User as UserIcon, Activity, ChevronDown, Video, MapPin,
  PlayCircle, Monitor, Users, Lock
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function StudentCoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<CourseSession | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "resources">("overview");
  const [mobileAccordion, setMobileAccordion] = useState<string | null>("overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [course, setCourse] = useState<StudentCourse | null>(null);

  const fetchProfile = async (uid: string) => {
    const p = await studentDb.getProfile(uid);
    if (!p || !p.profession) { router.push("/admin"); return; } setProfile(p);
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const [p, list] = await Promise.all([
            studentDb.getProfile(currentUser.uid),
            studentDb.getCourses()
          ]);
          setProfile(p);
          const foundCourse = list.find(c => c.id === courseId);
          setCourse(foundCourse || null);
        } catch (e) {
          console.error("Error loading course details:", e);
        }
      } else {
        router.push("/student/login");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router, courseId]);

  // Set first session active by default when course loads, and expand first module
  useEffect(() => {
    if (course && course.modules.length > 0) {
      setExpandedModules({ [course.modules[0].id]: true });
      if (course.modules[0].sessions && course.modules[0].sessions.length > 0) {
        setActiveSession(course.modules[0].sessions[0]);
      }
    }
  }, [course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Chargement de votre programme...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-sm text-gray-500 font-bold">Formation introuvable.</p>
          <Link href="/student/courses" className="text-xs text-[var(--color-primary)] underline mt-3 inline-block font-bold">
            Retourner aux formations
          </Link>
        </div>
      </div>
    );
  }

  const isSessionAttended = (sessionId: string) => {
    return profile?.progress?.[courseId]?.includes(sessionId) || false;
  };

  const handleToggleComplete = async () => {
    if (user && activeSession) {
      const currentStatus = isSessionAttended(activeSession.id);
      await studentDb.toggleAttendance(user.uid, courseId, activeSession.id, !currentStatus);
      await fetchProfile(user.uid);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const completedCount = profile?.progress?.[courseId]?.length || 0;
  let totalSessions = 0;
  course.modules.forEach(m => {
    totalSessions += (m.sessions || []).length;
  });
  const progressPercent = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Next and Previous session navigation helper
  const allSessions: CourseSession[] = [];
  course.modules.forEach(m => {
    (m.sessions || []).forEach(s => {
      allSessions.push(s);
    });
  });

  const activeIndex = activeSession ? allSessions.findIndex(s => s.id === activeSession.id) : -1;
  const prevSession = activeIndex > 0 ? allSessions[activeIndex - 1] : null;
  const nextSession = activeIndex < allSessions.length - 1 ? allSessions[activeIndex + 1] : null;

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-gray-800">
      <StudentSidebar />

      <div className="flex-grow flex flex-col md:flex-row items-stretch h-auto md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden">
        {/* Left Side: Learning Content Area (70% width) */}
        <div className="flex-grow md:w-[70%] flex flex-col md:h-full overflow-hidden">
          <StudentHeader title="Espace Formation" />
          <div className="flex-grow p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Link href="/student/courses" className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Retour aux formations</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-400">{course.category}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-600 max-w-[200px] truncate">{course.title}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-heading font-black text-gray-950 leading-tight">
                    {activeSession?.title || course.title}
                  </h1>
                  <span className="bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border border-blue-200">
                    Cabinet Guilogtrans
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Formation : {course.title}
                </p>
              </div>
            </div>
          </div>

          {/* Active Session Card Content */}
          {activeSession ? (
            <>
              {/* ── VIDEO SESSION ───────────────────────────────── */}
              {activeSession.type === "video" && (
                <div className="bg-black rounded-none overflow-hidden shadow-lg shrink-0 aspect-video min-h-[300px] flex items-center justify-center relative group">
                  {activeSession.videoUrl ? (
                    <iframe
                      key={activeSession.id}
                      src={activeSession.videoUrl.includes("youtube.com/watch")
                        ? activeSession.videoUrl.replace("watch?v=", "embed/")
                        : activeSession.videoUrl.includes("youtu.be/")
                          ? `https://www.youtube.com/embed/${activeSession.videoUrl.split("youtu.be/")[1]?.split("?")[0]}`
                          : activeSession.videoUrl
                      }
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute inset-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-white/40">
                      <PlayCircle className="w-16 h-16" />
                      <p className="text-xs font-bold uppercase tracking-widest">Vidéo non encore disponible</p>
                      <p className="text-[10px]">L&apos;administrateur n&apos;a pas encore uploadé cette vidéo.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TEXT / DOCUMENT SESSION ─────────────────────── */}
              {(activeSession.type === "text" || activeSession.type === "document") && (
                <div className="bg-white border border-gray-200 rounded-none shadow-sm p-8 shrink-0 min-h-[300px]">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 text-base font-heading">{activeSession.title}</h2>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contenu de la séance</span>
                    </div>
                  </div>
                  {activeSession.content ? (
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {activeSession.content}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Le contenu textuel de cette séance n&apos;est pas encore disponible.</p>
                  )}
                </div>
              )}

              {/* ── ZOOM / MEET / PHYSICAL SESSION ──────────────── */}
              {(activeSession.type === "zoom" || (!activeSession.type && activeSession.date)) && (
                <div className="bg-slate-950 border border-gray-800 rounded-none shadow-sm p-8 md:p-12 text-white flex flex-col justify-between aspect-video min-h-[350px] shrink-0 relative overflow-hidden">
                  {/* Glowing decorative effect */}
                  <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--color-primary)]/10 blur-[80px] pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-wrap items-center gap-4">
                      {activeSession.meetUrl ? (
                        <span className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          Session Live / En ligne disponible
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none">
                          <Users className="w-3 h-3" />
                          Session Présentielle
                        </span>
                      )}
                      {activeSession.date && (
                        <span className="bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                          {new Date(activeSession.date).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-2xl md:text-3xl font-heading font-black leading-tight text-white mb-4">
                        {activeSession.title}
                      </h2>
                      <div className="flex flex-col gap-2 text-sm text-slate-300">
                        {activeSession.date && (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Horaire : {new Date(activeSession.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                            {activeSession.duration && ` (${activeSession.duration})`}
                          </span>
                        )}
                        {activeSession.location && (
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            Lieu : {activeSession.location}
                          </span>
                        )}
                        {activeSession.capacity && (
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            Capacité : {activeSession.capacity} places
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                    {activeSession.meetUrl && (
                      <a
                        href={activeSession.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-widest rounded-none border border-[var(--color-primary)] transition-all text-center flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Video className="w-4 h-4" />
                        Rejoindre en ligne
                      </a>
                    )}
                    
                    <button
                      onClick={handleToggleComplete}
                      className={`w-full sm:w-auto px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all border text-center flex items-center justify-center gap-2 ${
                        isSessionAttended(activeSession.id)
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      }`}
                    >
                      {isSessionAttended(activeSession.id) ? <><CheckCircle2 className="w-4 h-4" /> Présent(e) ✓</> : "Marquer comme Présent(e)"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Mark complete for video/text sessions ───────── */}
              {(activeSession.type === "video" || activeSession.type === "text" || activeSession.type === "document") && (
                <div className="bg-white border border-gray-200 p-4 flex items-center justify-between shrink-0">
                  <div className="text-xs text-gray-500">
                    {activeSession.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {activeSession.duration}</span>}
                  </div>
                  <button
                    onClick={handleToggleComplete}
                    className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all border flex items-center gap-2 ${
                      isSessionAttended(activeSession.id)
                        ? "bg-green-50 border-green-200 text-green-600"
                        : "bg-[var(--color-primary)] border-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)]"
                    }`}
                  >
                    {isSessionAttended(activeSession.id) ? <><CheckCircle2 className="w-4 h-4" /> Terminé ✓</> : <><Play className="w-4 h-4" /> Marquer comme terminé</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="aspect-video bg-gray-950 border border-gray-800 rounded-none flex items-center justify-center text-white/50 text-xs shrink-0">
              Sélectionnez une séance dans le sommaire pour commencer.
            </div>
          )}

          {/* Navigation & Controls Bar under media */}
          <div className="bg-white border border-gray-200 p-4 rounded-none shadow-sm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                disabled={!prevSession}
                onClick={() => prevSession && setActiveSession(prevSession)}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-gray-600 disabled:opacity-40 disabled:hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all border border-gray-200 flex items-center gap-1.5 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Précédent
              </button>
              <button
                disabled={!nextSession}
                onClick={() => nextSession && setActiveSession(nextSession)}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-gray-600 disabled:opacity-40 disabled:hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all border border-gray-200 flex items-center gap-1.5 shadow-sm hover:shadow-md"
              >
                Suivant <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`w-10 h-10 rounded-none border transition-all flex items-center justify-center ${
                  bookmarked 
                    ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)] shadow-sm" 
                    : "bg-white border-gray-300 text-gray-400 hover:text-gray-600"
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Description & Resources Section */}
          <div className="bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm shrink-0 mt-2">
            <div className="hidden md:flex border-b border-gray-100 bg-gray-50/50 px-6">
              {[
                { id: "overview", label: "Aperçu de la formation" },
                { id: "details", label: "Objectifs & Programme" },
                { id: "resources", label: "Ressources à télécharger" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all relative ${
                    activeTab === tab.id
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden md:block p-6 text-xs md:text-sm text-gray-600 leading-relaxed">
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Description générale</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {course.description}
                  </p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Ce que vous allez apprendre</h4>
                      <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1">
                        <li>Les fondamentaux théoriques indispensables.</li>
                        <li>La modélisation de cas pratiques d'entreprises locales.</li>
                        <li>Les meilleures astuces pour automatiser votre travail.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "resources" && (
                <div>
                  {activeSession && activeSession.resources && activeSession.resources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeSession.resources.map((res, index) => (
                        <a
                          key={index}
                          href={res.url}
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info(`Téléchargement de la ressource : ${res.name}`);
                          }}
                          className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-none shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-none border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold truncate max-w-[180px] text-gray-700">{res.name}</span>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucune ressource téléchargeable n'est associée à cette séance.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile Accordion */}
            <div className="block md:hidden divide-y divide-gray-100">
               {/* Same tabs structure for mobile but skipping details for brevity */}
               <div>
                <button
                  type="button"
                  onClick={() => setMobileAccordion(mobileAccordion === "resources" ? null : "resources")}
                  className={`w-full flex items-center justify-between p-4 text-xs font-bold uppercase tracking-wider text-left transition-all ${
                    mobileAccordion === "resources" 
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                      : "text-gray-700 bg-slate-50/50"
                  }`}
                >
                  <span>Ressources de la séance</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-250 ${mobileAccordion === "resources" ? "rotate-180 text-[var(--color-primary)]" : ""}`} />
                </button>
                {mobileAccordion === "resources" && (
                  <div className="p-4 text-xs text-gray-500 bg-white leading-relaxed border-t border-slate-100">
                    {activeSession && activeSession.resources && activeSession.resources.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {activeSession.resources.map((res, index) => (
                          <a
                            key={index}
                            href={res.url}
                            className="flex items-center justify-between p-3 bg-slate-50 border border-gray-200 shadow-sm"
                          >
                            <span className="font-bold truncate max-w-[200px] text-gray-700">{res.name}</span>
                            <Download className="w-4 h-4 text-gray-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-gray-400">Aucune ressource pour cette séance.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right Side: Navigation & Analytics Panel (30% width) */}
        <aside className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-150 md:h-full flex flex-col overflow-hidden shrink-0">
          {/* Section 1: User course progress */}
          <div className="p-6 border-b border-gray-100 shrink-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
                {initials}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-xs text-gray-900 leading-tight truncate">{profile?.fullName}</h4>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Votre présence : {progressPercent}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-1.5 bg-slate-100 border border-gray-200 rounded-none overflow-hidden">
                <div className="h-full bg-[var(--color-accent)] rounded-none transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Section 3: Expandable Sommaire/Lectures list */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 flex items-center justify-between">
              <span>Agenda des Séances</span>
              <span className="font-mono text-gray-400 font-bold">{completedCount}/{totalSessions}</span>
            </h4>

            <div className="space-y-2.5">
              {course.modules.map((m) => {
                const isExpanded = expandedModules[m.id] !== false;
                return (
                  <div key={m.id} className="border border-gray-200 rounded-none overflow-hidden bg-slate-50/30 shadow-sm">
                    <button
                      onClick={() => toggleModule(m.id)}
                      className="w-full p-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between border-b border-gray-100 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-left line-clamp-1">
                        {m.title}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-2 bg-white space-y-1">
                        {(m.sessions || []).map((session) => {
                          const isCurrent = activeSession?.id === session.id;
                          const isDone = isSessionAttended(session.id);
                          const sessionDate = new Date(session.date);
                          
                          // Pick icon based on session type
                          const TypeIcon = session.type === "video" ? PlayCircle
                            : session.type === "text" ? FileText
                            : session.type === "document" ? Download
                            : session.type === "zoom" ? Video
                            : Calendar;
                          
                          return (
                            <button
                              key={session.id}
                              onClick={() => setActiveSession(session)}
                              className={`w-full p-2.5 rounded-none text-left transition-all flex items-center justify-between border ${
                                isCurrent
                                  ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)] font-bold shadow-sm"
                                  : "bg-white border-transparent hover:bg-slate-50 text-gray-650"
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden pr-2">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                ) : (
                                  <TypeIcon className="w-3 h-3 text-gray-400 shrink-0" />
                                )}
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-medium truncate leading-tight">{session.title}</span>
                                  <span className="text-[9px] text-gray-400 mt-0.5">
                                    {session.type === "video" || session.type === "text" || session.type === "document"
                                      ? session.duration || "Durée non définie"
                                      : session.date
                                        ? `${sessionDate.toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })} à ${sessionDate.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}`
                                        : "Date non définie"
                                    }
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
