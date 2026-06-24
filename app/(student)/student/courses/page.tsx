"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { studentDb, StudentProfile, StudentCourse } from "@/lib/studentDb";
import StudentSidebar from "@/components/student/Sidebar";
import StudentHeader from "@/components/student/Header";
import CourseProgressCard from "@/components/student/CourseProgressCard";
import PaymentModal from "@/components/student/PaymentModal";
import { Search, MessageSquare, Bell, Play, BookOpen, Clock, Award, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StudentCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<StudentCourse[]>([]);

  const [isMounted, setIsMounted] = useState(false);

  const fetchProfile = async (uid: string) => {
    const p = await studentDb.getProfile(uid);
    setProfile(p);
  };

  useEffect(() => {
    setIsMounted(true);
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.uid);
        try {
          const list = await studentDb.getCourses();
          setCourses(list);
        } catch (e) {
          console.error("Error loading courses:", e);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Chargement du catalogue...</p>
        </div>
      </div>
    );
  }

  const getCompletedCount = (courseId: string) => {
    return profile?.progress?.[courseId]?.length || 0;
  };

  const getTotalCount = (course: StudentCourse) => {
    let count = 0;
    course.modules.forEach(m => {
      count += m.lectures.length;
    });
    return count;
  };

  const isEnrolled = (courseId: string) => {
    return profile?.enrolledCourses?.includes(courseId) || false;
  };

  // Filter based on search query
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledCourses = filteredCourses.filter(c => isEnrolled(c.id));

  // Determine the "Recent Activity" course (the first enrolled course that isn't fully completed, or just the first enrolled course)
  let recentCourse: StudentCourse | null = null;
  let recentProgressPercent = 0;
  let recentCompleted = 0;
  let recentTotal = 0;

  if (enrolledCourses.length > 0) {
    // Find first course with progress < 100%
    const activeCourse = enrolledCourses.find(c => {
      const completed = getCompletedCount(c.id);
      const total = getTotalCount(c);
      return completed < total;
    });
    recentCourse = activeCourse || enrolledCourses[0];
    recentCompleted = getCompletedCount(recentCourse.id);
    recentTotal = getTotalCount(recentCourse);
    recentProgressPercent = recentTotal > 0 ? Math.round((recentCompleted / recentTotal) * 100) : 0;
  }

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-gray-800">
      <StudentSidebar />

      <div className="flex-grow flex flex-col h-auto md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden">
        <StudentHeader showSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Content Body */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {/* Welcome/Page Intro */}
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-black text-gray-900">
              Mes Formations
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Poursuivez votre apprentissage et suivez votre progression.
            </p>
          </div>

          {/* Recent Activity Card */}
          {recentCourse && !searchQuery && (
            <div className="mb-10">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">Activité Récente</h2>
              <div className="bg-white border border-gray-200 rounded-none p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row gap-6 items-stretch">
                {/* Course Thumbnail */}
                <div className="w-full md:w-80 h-44 relative rounded-none border border-slate-200 overflow-hidden bg-slate-50 shrink-0 shadow-sm">
                  <Image
                    src={recentCourse.image}
                    alt={recentCourse.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <span className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none">
                    {recentCourse.category}
                  </span>
                </div>

                {/* Course Details */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Dernier cours étudié
                    </span>
                    <h3 className="text-lg font-heading font-black text-gray-950 leading-tight">
                      {recentCourse.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {recentCourse.description}
                    </p>
                  </div>

                  <div className="mt-6 md:mt-0 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px]">Progression : {recentCompleted}/{recentTotal} Leçons</span>
                      <span className="text-blue-600 font-extrabold">{recentProgressPercent}%</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-full h-2 bg-slate-100 border border-gray-200 rounded-none overflow-hidden flex-1">
                        <div className="h-full bg-[var(--color-accent)] rounded-none transition-all duration-500" style={{ width: `${recentProgressPercent}%` }} />
                      </div>

                      <button
                        onClick={() => router.push(`/student/courses/${recentCourse!.id}`)}
                        className="w-full sm:w-auto px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-widest rounded-none border border-[var(--color-primary)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shrink-0 shadow-sm hover:shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Continuer l'apprentissage</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Courses grid (if multiple, otherwise standard list) */}
          {enrolledCourses.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">Mes Formations Actives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseProgressCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    completedCount={getCompletedCount(course.id)}
                    totalCount={getTotalCount(course)}
                    onAction={() => router.push(`/student/courses/${course.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

