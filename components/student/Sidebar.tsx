"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut, User } from "firebase/auth";
import { studentDb, StudentProfile } from "@/lib/studentDb";
import { 
  BookOpen, LayoutDashboard, LogOut, Award, CreditCard, 
  User as UserIcon, MessageSquare, Settings, Menu, X 
} from "lucide-react";

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const p = await studentDb.getProfile(currentUser.uid);
        setProfile(p);
      } else {
        router.push("/student/login");
      }
    });
    return () => unsub();
  }, [router]);

  // Close sidebar on path change (mobile navigation)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Listen for hamburger menu toggle events from the header
  useEffect(() => {
    const handleToggle = () => setIsOpen(open => !open);
    window.addEventListener("toggle-student-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-student-sidebar", handleToggle);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/student/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Mes Formations", href: "/student/courses", icon: BookOpen },
    { name: "Catalogue", href: "/student/catalog", icon: BookOpen },
    { name: "Certificats", href: "/student/certificates", icon: Award },
    { name: "Paiements", href: "/student/billing", icon: CreditCard },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel Container */}
      <div 
        className={`fixed md:sticky top-0 left-0 z-40 w-64 bg-[var(--color-primary)] text-white flex flex-col justify-between h-screen border-r border-white/5 shrink-0 font-sans transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
            {/* Brand Logo - mockup style */}
          <div className="p-6 flex items-center justify-between gap-3 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="Cabinet Guilogtrans Logo" 
                className="h-9 w-auto object-contain bg-white rounded-none border border-white/20 shadow-sm transition-all" 
              />
              <span className="text-base font-bold text-white tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
                Guilogtrans Academy
              </span>
            </Link>
            {/* Close button inside sidebar on mobile */}
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden text-white/80 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
 
          {/* Navigation links */}
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = 
                pathname === item.href || 
                (item.href === "/student/courses" && pathname.startsWith("/student/courses/")) ||
                (item.href === "/student/catalog" && pathname.startsWith("/student/catalog/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-l-2 ${
                    isActive
                      ? "bg-white/10 text-white border-[var(--color-accent)]"
                      : "text-slate-350 hover:bg-white/5 hover:text-white border-transparent"
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
 
        {/* Bottom Profile Settings & Logout */}
        <div className="p-4 space-y-1 border-t border-white/10">
          <Link
            href="/student/profile"
            className={`flex items-center gap-3.5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-l-2 ${
              pathname === "/student/profile"
                ? "bg-white/10 text-white border-[var(--color-accent)]"
                : "text-slate-355 hover:bg-white/5 hover:text-white border-transparent"
            }`}
          >
            <Settings className="w-4.5 h-4.5 shrink-0 text-slate-400" />
            <span>Réglages</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4.5 py-3 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-all border-l-2 border-transparent"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0 text-red-350" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </>
  );
}
