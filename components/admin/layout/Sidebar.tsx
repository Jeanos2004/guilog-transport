"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Mail,
  LogOut,
  ShieldCheck,
  Settings,
  Image as ImageIcon,
  ClipboardList,
  Newspaper,
  HeartHandshake,
  Video
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Sidebar({ 
  pendingInscriptionsCount, 
  unreadMessagesCount,
  handleLogout 
}: { 
  pendingInscriptionsCount: number;
  unreadMessagesCount: number;
  handleLogout: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "overview";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Grouped Navigation Items
  const navGroups = [
    {
      title: "Pilotage",
      items: [
        { id: "overview", label: "Vue d'ensemble", icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: "inscriptions", label: "Inscriptions & Devis", icon: <ClipboardList className="w-4 h-4" />, badge: pendingInscriptionsCount },
        { id: "students", label: "Gestion des Étudiants", icon: <GraduationCap className="w-4 h-4" /> },
      ]
    },
    {
      title: "Contenu & Offres",
      items: [
        { id: "formations", label: "Formations & Modules", icon: <BookOpen className="w-4 h-4" /> },
        { id: "course-builder", label: "Course Builder", icon: <Video className="w-4 h-4" />, href: "/admin/course-builder" },
        { id: "actualites", label: "Blog & Actualités", icon: <Newspaper className="w-4 h-4" /> },
        { id: "testimonials", label: "Témoignages Alumni", icon: <HeartHandshake className="w-4 h-4" /> },
        { id: "galerie", label: "Galerie Médias", icon: <ImageIcon className="w-4 h-4" /> },
      ]
    },
    {
      title: "Communication",
      items: [
        { id: "messages", label: "Messages de Contact", icon: <Mail className="w-4 h-4" />, badge: unreadMessagesCount },
      ]
    },
    {
      title: "Configuration",
      items: [
        { id: "users", label: "Utilisateurs Admin", icon: <ShieldCheck className="w-4 h-4" /> },
        { id: "settings", label: "Paramètres", icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[var(--color-primary)] text-white shadow-md relative z-30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white rounded-none border border-white/20 p-1" />
          <h1 className="font-heading font-bold text-sm">Administration</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 hover:bg-white/10 rounded-md transition-colors"
          title="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-[85%] max-w-[300px] bg-[var(--color-primary)] text-white flex flex-col h-full shadow-2xl border-r border-white/10"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Cabinet Guilogtrans Logo" className="h-8 w-auto object-contain bg-white rounded-none p-1 border border-white/20" />
                  <div>
                    <h1 className="font-heading font-bold text-sm leading-tight text-white">Cabinet Guilogtrans</h1>
                    <span className="text-[9px] text-[var(--color-light)] uppercase tracking-widest font-black mt-1 block">Admin</span>
                  </div>
                </div>
              </div>

              <nav className="flex-grow p-4 space-y-5 overflow-y-auto">
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                      {group.title}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((tab: any) => {
                        // Un item est actif si on est sur la même page href OU sur le même tab dans /admin
                        const isActive = tab.href ? pathname === tab.href : (pathname === "/admin" && activeTab === tab.id);
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              if (tab.href) {
                                router.push(tab.href);
                              } else {
                                router.push(`/admin?tab=${tab.id}`);
                              }
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-l-2 ${
                              isActive
                                ? "bg-white/10 text-white border-[var(--color-accent)]"
                                : "text-gray-400 hover:bg-white/5 hover:text-white border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`transition-colors duration-150 ${isActive ? "text-[var(--color-accent)]" : "text-gray-400"}`}>
                                {tab.icon}
                              </span>
                              <span>{tab.label}</span>
                            </div>
                            {tab.badge !== undefined && tab.badge > 0 && (
                              <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-none leading-none">
                                {tab.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10 bg-black/10">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 h-full bg-[var(--color-primary)] text-white flex-col flex-shrink-0 z-25 sticky top-0 border-r border-white/5">
        <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-black/10">
          <img src="/logo.png" alt="Cabinet Guilogtrans Logo" className="h-10 w-auto object-contain bg-white rounded-none border border-white/20 shadow-sm p-1" />
          <div>
            <h1 className="font-heading font-bold text-sm tracking-wide leading-none text-white">Cabinet Guilogtrans</h1>
            <span className="text-[9px] text-[var(--color-light)] uppercase tracking-widest font-black mt-1.5 block">Console Admin</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-5 overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((tab: any) => {
                  const isActive = tab.href ? pathname === tab.href : (pathname === "/admin" && activeTab === tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.href) {
                          router.push(tab.href);
                        } else {
                          router.push(`/admin?tab=${tab.id}`);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 border-l-2 ${
                        isActive
                          ? "bg-white/10 text-white border-[var(--color-accent)]"
                          : "text-gray-400 hover:bg-white/5 hover:text-white border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors duration-150 ${isActive ? "text-[var(--color-accent)]" : "text-gray-400"}`}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-none leading-none">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
