"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { studentDb, StudentProfile, StudentCourse } from "@/lib/studentDb";
import StudentSidebar from "@/components/student/Sidebar";
import StudentHeader from "@/components/student/Header";
import { GraduationCap, Award, BookOpen, MessageSquare, Bell, Search, ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentDate] = useState(new Date());

  // Gamification state
  const [quizState, setQuizState] = useState<{
    answered: boolean;
    selected: string | null;
    isCorrect: boolean | null;
  }>({ answered: false, selected: null, isCorrect: null });
  const [xp, setXp] = useState(750);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const [p, list] = await Promise.all([
            studentDb.getProfile(currentUser.uid),
            studentDb.getCourses()
          ]);
          setProfile(p);
          setCourses(list);
        } catch (e) {
          console.error("Error loading dashboard data:", e);
        }
      } else {
        router.push("/student/login");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(c => profile?.enrolledCourses.includes(c.id));

  const getCompletedCount = (courseId: string) => {
    return profile?.progress[courseId]?.length || 0;
  };

  const getTotalCount = (course: StudentCourse) => {
    let count = 0;
    course.modules.forEach(m => {
      count += m.lectures.length;
    });
    return count;
  };

  // Get total progress percentage
  let overallProgress = 0;
  if (enrolledCourses.length > 0) {
    let totalLectures = 0;
    let completedLectures = 0;
    enrolledCourses.forEach(c => {
      totalLectures += getTotalCount(c);
      completedLectures += getCompletedCount(c.id);
    });
    overallProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  }

  // Get completed certificate courses
  const completedCertificates = enrolledCourses.filter(c => {
    const total = getTotalCount(c);
    return total > 0 && getCompletedCount(c.id) === total;
  });

  // Get next 3 upcoming/uncompleted lectures from active courses
  const upcomingLectures: { course: StudentCourse; lecture: any }[] = [];
  enrolledCourses.forEach(course => {
    course.modules.forEach(module => {
      module.lectures.forEach(lecture => {
        const isDone = profile?.progress[course.id]?.includes(lecture.id);
        if (!isDone && upcomingLectures.length < 3) {
          upcomingLectures.push({ course, lecture });
        }
      });
    });
  });

  const formattedDate = currentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  // Gamification values
  const currentLevel = Math.floor(xp / 500) + 1;
  const xpInCurrentLevel = xp % 500;
  const levelProgressPct = Math.round((xpInCurrentLevel / 500) * 100);
  const rankTitles = ["Novice CFIG", "Praticien Apprenant", "Spécialiste de Gestion", "Expert Décisionnel", "Maître du Dashboard"];
  const rankTitle = rankTitles[Math.min(currentLevel - 1, rankTitles.length - 1)];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-gray-800">
      {/* Column 1: Sidebar */}
      <StudentSidebar />

      <div className="flex-grow flex flex-col lg:flex-row h-auto lg:h-screen lg:max-h-screen lg:overflow-hidden">
        {/* Column 2: Main Content (Dashboard middle) */}
        <div className="flex-grow flex flex-col h-auto lg:h-full lg:overflow-hidden">
          <StudentHeader title="Tableau de bord" />
          <main className="flex-grow p-6 lg:p-8 space-y-8 overflow-y-auto h-auto lg:h-full">
            {/* Banner widget */}
            <div className="bg-[var(--color-primary)] border border-[var(--color-primary)] p-8 text-white relative overflow-hidden shadow-sm flex items-center justify-between rounded-none">
              <div className="relative z-10 space-y-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-light)] capitalize">
                  {formattedDate}
                </p>
                <h1 className="text-2xl md:text-3xl font-heading font-bold">
                  Ravi de vous revoir, {profile?.fullName ? profile.fullName.split(" ")[0] : "Apprenant"} !
                </h1>
                <p className="text-xs text-slate-350 font-medium max-w-sm">
                  Vous avez complété <span className="font-extrabold text-[var(--color-accent)]">{overallProgress}%</span> du programme ! Continuer à ce rythme.
                </p>
              </div>

              <div className="hidden md:flex relative z-10 w-20 h-20 bg-white/5 border border-white/10 items-center justify-center shadow-lg rounded-none">
                <GraduationCap className="w-10 h-10 text-[var(--color-accent)]" />
              </div>
            </div>

            {/* My Courses Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mes Formations actives</h2>
                <Link href="/student/courses" className="text-[10px] font-extrabold uppercase text-[var(--color-accent)] hover:underline flex items-center gap-1">
                  Tout voir
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="bg-white border border-gray-200 p-8 text-center shadow-sm rounded-none">
                  <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-xs text-gray-500 font-semibold">Aucun cours actif pour le moment.</p>
                  <Link href="/student/courses" className="mt-3 inline-block text-[10px] font-extrabold uppercase text-blue-600 hover:underline">
                    Découvrir le catalogue →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {enrolledCourses.map((c) => {
                    const completed = getCompletedCount(c.id);
                    const total = getTotalCount(c);
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    
                    const bgColors = ["bg-purple-50 text-purple-700 border-purple-100", "bg-orange-50 text-orange-700 border-orange-100", "bg-blue-50 text-blue-700 border-blue-100"];
                    const badgeStyle = bgColors[c.title.length % bgColors.length];

                    return (
                      <div
                        key={c.id}
                        onClick={() => router.push(`/student/courses/${c.id}`)}
                        className="bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between rounded-none"
                      >
                        <div>
                          {/* Icon */}
                          <div className={`w-10 h-10 flex items-center justify-center font-heading font-black text-sm mb-4 border ${badgeStyle} rounded-none`}>
                            {c.title.charAt(0)}
                          </div>
                          <h3 className="font-bold text-xs text-gray-900 leading-snug line-clamp-2 min-h-[34px]">{c.title}</h3>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider font-extrabold">{c.category}</p>
                        </div>

                        <div className="mt-6 space-y-2.5">
                          <div className="flex justify-between items-center text-[9px] font-extrabold uppercase text-gray-400">
                            <span>Progrès : {completed}/{total}</span>
                            <span className="text-[var(--color-accent)]">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 border border-gray-200/50 rounded-none overflow-hidden">
                            <div className="h-full bg-[var(--color-accent)]" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Achievements / Certificates section */}
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Certificats Obtenus</h2>
              {completedCertificates.length === 0 ? (
                <div className="p-6 bg-white border border-gray-200 text-center text-xs text-gray-400 rounded-none shadow-sm">
                  Complétez 100% d'un cours pour voir votre certificat officiel s'afficher ici.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedCertificates.map(c => (
                    <div key={c.id} className="bg-blue-50/10 border border-gray-200 p-5 rounded-none shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-150 rounded-none">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{c.title}</h4>
                          <p className="text-[9px] font-extrabold text-blue-700 uppercase tracking-widest mt-1">Certificat Officiel Débloqué</p>
                        </div>
                      </div>

                      <Link
                        href="/student/certificates"
                        className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-wider transition-colors rounded-none border border-[var(--color-primary)] shadow-sm"
                      >
                        Voir
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Column 3: Calendar & Upcoming Tasks (Right Panel) */}
        <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-150 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">

          {/* Calendar Widget */}
          <div className="bg-slate-50/50 border border-gray-200 p-5 space-y-4 rounded-none">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800">
              <span className="capitalize">
                {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
              <div className="flex items-center gap-2 text-gray-400">
                <button className="hover:text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
                <button className="hover:text-gray-600"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-[9px] font-bold text-gray-400">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, idx) => <span key={idx}>{d}</span>)}
              
              {/* Mocked days around June 2026 */}
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const isToday = day === currentDate.getDate();
                return (
                  <span
                    key={i}
                    className={`w-6 h-6 flex items-center justify-center mx-auto rounded-none ${
                      isToday ? "bg-[var(--color-primary)] text-white font-extrabold shadow-sm border border-[var(--color-primary)]" : "text-gray-700 hover:bg-slate-100 cursor-pointer border border-transparent"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="bg-[var(--color-primary)] border border-[var(--color-primary)] p-5 space-y-4 text-white shadow-sm relative overflow-hidden shrink-0 rounded-none">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">🔥</span>
                <div>
                  <span className="block text-[8px] font-bold text-[var(--color-light)] uppercase tracking-widest leading-none">Série d'assiduité</span>
                  <span className="block text-xs font-extrabold text-white mt-1.5">5 Jours consécutifs</span>
                </div>
              </div>
              <div className="bg-white/10 px-2.5 py-1 border border-white/10 flex items-center gap-1 rounded-none">
                <span className="text-[9px] font-black text-[var(--color-light)]">NV. {currentLevel}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-bold text-blue-200">
                <span>{rankTitle}</span>
                <span>{xpInCurrentLevel} / 500 XP</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 border border-white/5 overflow-hidden rounded-none">
                <div className="h-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${levelProgressPct}%` }} />
              </div>
            </div>

            {/* Streak lit flames grid - Playful feature */}
            <div className="pt-2.5 border-t border-white/5">
              <span className="block text-[8px] font-extrabold text-blue-300 uppercase tracking-widest mb-2">Suivi hebdomadaire</span>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-extrabold">
                {["L", "M", "M", "J", "V"].map((dayName, index) => {
                  const isActive = index < 4; // Mock 4 active days
                  return (
                    <div 
                      key={index} 
                      className={`py-1.5 border flex flex-col items-center gap-1 ${
                        isActive 
                          ? "bg-[var(--color-accent)]/15 border-[var(--color-accent)] text-white" 
                          : "bg-white/5 border-white/10 text-gray-500"
                      }`}
                    >
                      <span className="text-[8px] opacity-70">{dayName}</span>
                      <span>{isActive ? "🔥" : "💀"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges Row */}
            <div className="pt-2.5 border-t border-white/5 space-y-2">
              <span className="block text-[8px] font-extrabold text-blue-300 uppercase tracking-widest">Badges débloqués</span>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs" title="Assidu - Connecté 5 jours d'affilée">🔥</div>
                <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs" title="Rapide - Première leçon validée">⚡</div>
                <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center text-xs opacity-40" title="Low-Data - Mode faible bande activé">📡</div>
                <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center text-xs opacity-40" title="Diplômé - Formation terminée">🎓</div>
              </div>
            </div>
          </div>

          {/* Daily Mini-Quiz Widget */}
          <div className="bg-white border border-gray-200 p-5 space-y-4 shrink-0 rounded-none shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">💡</span>
              <div>
                <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Défi quotidien</span>
                <span className="block text-xs font-black text-gray-900 mt-1">Quiz de validation rapide</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-700 font-semibold leading-normal">
              Dans PowerBI Desktop, à quoi sert le langage DAX (Data Analysis Expressions) ?
            </p>

            {!quizState.answered ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setQuizState({ answered: true, selected: "A", isCorrect: false });
                  }}
                  className="w-full p-3 text-left text-[11px] font-bold border border-gray-200 hover:bg-slate-50 transition-colors rounded-none"
                >
                  A. À concevoir la mise en page visuelle.
                </button>
                <button
                  onClick={() => {
                    setQuizState({ answered: true, selected: "B", isCorrect: true });
                    setXp(prev => Math.min(1000, prev + 50));
                  }}
                  className="w-full p-3 text-left text-[11px] font-bold border border-gray-200 hover:bg-slate-50 transition-colors rounded-none"
                >
                  B. À écrire des formules de calcul.
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`p-3 border text-[11px] font-bold leading-normal rounded-none ${
                  quizState.isCorrect 
                    ? "bg-green-50 border-green-200 text-green-700" 
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  {quizState.isCorrect 
                    ? "Correct ! +50 XP remportés. 🥳" 
                    : "Désolé ! Le DAX sert à écrire des formules de calcul complexes."}
                </div>
                <button
                  onClick={() => setQuizState({ answered: false, selected: null, isCorrect: null })}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider transition-all rounded-none"
                >
                  Rejouer
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Tasks / Lessons */}
          <div className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Tâches aujourd'hui</h3>
                <Link href="/student/courses" className="text-[10px] font-extrabold uppercase text-[var(--color-accent)] hover:underline">
                  Voir tout
                </Link>
              </div>

              {upcomingLectures.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 text-center text-[10px] text-gray-400 rounded-none shadow-sm">
                  Toutes vos leçons ont été complétées pour aujourd'hui !
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingLectures.map(({ course, lecture }, i) => {
                    const colors = ["bg-red-50 text-red-700 border-red-100", "bg-yellow-50 text-yellow-700 border-yellow-100", "bg-purple-50 text-purple-700 border-purple-100"];
                    const iconStyle = colors[i % colors.length];
                    
                    return (
                      <div
                        key={lecture.id}
                        onClick={() => router.push(`/student/courses/${course.id}`)}
                        className="p-3.5 bg-white border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors rounded-none shadow-sm group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-9 h-9 flex items-center justify-center shrink-0 border rounded-none ${iconStyle}`}>
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-gray-900 truncate max-w-[140px] leading-tight">{lecture.title}</h4>
                            <p className="text-[9px] text-gray-400 truncate max-w-[140px] mt-0.5 leading-none">{course.title}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats Summary */}
            <div className="p-4 bg-blue-50/20 border border-blue-200 flex items-center justify-between shrink-0 rounded-none">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs rounded-none">
                  ✓
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">Progression globale</span>
              </div>
              <span className="text-xs font-black text-blue-600">{overallProgress}%</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
