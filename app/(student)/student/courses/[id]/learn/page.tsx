"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { studentDb, StudentCourse, CourseSession } from "@/lib/studentDb";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { PlayCircle, FileText, CheckCircle2, Circle, ChevronLeft } from "lucide-react";

export default function CourseLearnPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<StudentCourse | null>(null);
  const [activeSession, setActiveSession] = useState<CourseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      
      try {
        // Load course data
        const courses = await studentDb.getCourses();
        const foundCourse = courses.find((c) => c.id === id);
        
        if (foundCourse) {
          setCourse(foundCourse);
          
          // Find the first session to display by default
          if (foundCourse.modules.length > 0 && foundCourse.modules[0].sessions.length > 0) {
            setActiveSession(foundCourse.modules[0].sessions[0]);
          }
          
          // Load student progress
          const profile = await studentDb.getProfile(currentUser.uid);
          if (profile && profile.progress && profile.progress[id as string]) {
            setCompletedSessions(profile.progress[id as string]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id, router]);

  const toggleComplete = async (sessionId: string) => {
    if (!user || !id) return;
    
    const isCompleted = completedSessions.includes(sessionId);
    const newStatus = !isCompleted;
    
    // Optimistic UI update
    if (newStatus) {
      setCompletedSessions([...completedSessions, sessionId]);
    } else {
      setCompletedSessions(completedSessions.filter(completedId => completedId !== sessionId));
    }
    
    // Save to DB
    await studentDb.toggleAttendance(user.uid, id as string, sessionId, newStatus);
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-[70vh]"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!course) {
    return <div className="p-8 text-center">Cours introuvable.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/student/courses")}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold truncate max-w-md">{course.title}</h1>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">Progression :</span>
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all" 
              style={{ 
                width: `${Math.round((completedSessions.length / Math.max(1, course.modules.reduce((acc, m) => acc + m.sessions.length, 0))) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content & Sidebar Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Player Area (2/3) */}
        <div className="flex-1 overflow-y-auto bg-white border-r border-slate-200 flex flex-col">
          {activeSession ? (
            <>
              {/* Video Player or Content Placeholder */}
              <div className="w-full bg-black aspect-video flex items-center justify-center shrink-0">
                {activeSession.type === "video" && activeSession.videoUrl ? (
                  <video 
                    src={activeSession.videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    poster="/images/placeholder-video.png"
                  ></video>
                ) : activeSession.type === "document" && activeSession.videoUrl ? (
                  <iframe 
                    src={activeSession.videoUrl} 
                    className="w-full h-full bg-white"
                    title={activeSession.title}
                  ></iframe>
                ) : (
                  <div className="text-center p-8">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl text-white">Document ou Présentiel</h3>
                    <p className="text-slate-400 mt-2">Aucun fichier ou vidéo associé à cette leçon.</p>
                  </div>
                )}
              </div>
              
              {/* Session Details */}
              <div className="p-8 max-w-4xl mx-auto w-full flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeSession.title}</h2>
                    <p className="text-slate-500 mt-1">Durée : {activeSession.duration}</p>
                  </div>
                  
                  <button 
                    onClick={() => toggleComplete(activeSession.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      completedSessions.includes(activeSession.id) 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {completedSessions.includes(activeSession.id) ? (
                      <><CheckCircle2 className="w-5 h-5" /> Terminée</>
                    ) : (
                      <><Circle className="w-5 h-5" /> Marquer comme terminée</>
                    )}
                  </button>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  {activeSession.content && <p>{activeSession.content}</p>}
                  {!activeSession.content && <p>Aucune description détaillée pour cette leçon.</p>}
                  
                  {activeSession.resources && activeSession.resources.length > 0 && (
                    <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Ressources téléchargeables
                      </h4>
                      <ul className="space-y-2">
                        {activeSession.resources.map((res, i) => (
                          <li key={i}>
                            <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                              {res.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Sélectionnez une leçon dans le menu pour commencer.
            </div>
          )}
        </div>

        {/* Sidebar Modules (1/3) */}
        <div className="w-80 lg:w-96 bg-slate-50 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
            <h3 className="font-bold text-slate-900">Contenu du cours</h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {course.modules.map((module, mIndex) => (
              <div key={module.id} className="bg-white">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {module.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {module.sessions.filter(s => completedSessions.includes(s.id)).length} / {module.sessions.length} | 
                    {" "}{module.sessions.reduce((acc, s) => acc + parseInt(s.duration) || 0, 0)} min
                  </p>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {module.sessions.map((session, sIndex) => {
                    const isCompleted = completedSessions.includes(session.id);
                    const isActive = activeSession?.id === session.id;
                    
                    return (
                      <button
                        key={session.id}
                        onClick={() => setActiveSession(session)}
                        className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-start gap-3 ${
                          isActive ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : session.type === "video" ? (
                            <PlayCircle className="w-5 h-5 text-slate-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                            {session.orderIndex ? <span className="font-bold mr-1">{session.orderIndex}.</span> : <span className="font-bold mr-1">{sIndex + 1}.</span>} {session.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{session.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
