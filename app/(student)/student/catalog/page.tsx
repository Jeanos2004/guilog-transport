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

export default function StudentCatalogPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
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

  const getTotalCount = (course: StudentCourse) => {
    let count = 0;
    course.modules.forEach(m => {
      count += m.lectures.length;
    });
    return count;
  };

  const handleEnrollSuccess = async () => {
    if (user && selectedCourse) {
      await studentDb.enrollInCourse(user.uid, selectedCourse.id);
      await fetchProfile(user.uid);
    }
  };

  const isEnrolled = (courseId: string) => {
    return profile?.enrolledCourses?.includes(courseId) || false;
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCourses = filteredCourses.filter(c => !isEnrolled(c.id));

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-gray-800">
      <StudentSidebar />

      <div className="flex-grow flex flex-col h-auto md:h-screen md:max-h-screen overflow-y-auto md:overflow-hidden">
        <StudentHeader showSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-black text-gray-900">
              Catalogue des Formations
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
              Découvrez et débloquez de nouvelles compétences.
            </p>
          </div>

          <div>
            {availableCourses.length === 0 ? (
              <div className="p-10 bg-white border border-gray-200 rounded-none text-center shadow-sm">
                <p className="text-xs text-gray-500 font-semibold">
                  Félicitations ! Vous possédez ou avez débloqué toutes les formations disponibles.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {availableCourses.map((course) => (
                  <CourseProgressCard
                    key={course.id}
                    course={course}
                    isEnrolled={false}
                    completedCount={0}
                    totalCount={getTotalCount(course)}
                    variant="list"
                    onAction={() => {
                      setSelectedCourse(course);
                      setPaymentOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          isOpen={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onSuccess={handleEnrollSuccess}
        />
      )}
    </div>
  );
}
