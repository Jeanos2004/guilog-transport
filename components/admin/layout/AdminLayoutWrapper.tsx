"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/admin/layout/Sidebar";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  // For the Sidebar counts
  const [pendingInscriptionsCount, setPendingInscriptionsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.email) {
        try {
          await db.verifyAdmin(user.uid);
          setIsLoggedIn(true);
          
          // Fetch counts for sidebar
          const inscriptions = await db.getInscriptions();
          const messages = await db.getMessages();
          setPendingInscriptionsCount(inscriptions.filter(x => x.status === "En attente").length);
          setUnreadMessagesCount(messages.filter(x => x.status === "Non lu").length);
        } catch (error) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setAuthChecking(false);
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
        try {
          await db.verifyAdmin(user.uid);
          setIsLoggedIn(true);
          
          const inscriptions = await db.getInscriptions();
          const messages = await db.getMessages();
          setPendingInscriptionsCount(inscriptions.filter(x => x.status === "En attente").length);
          setUnreadMessagesCount(messages.filter(x => x.status === "Non lu").length);
        } catch (error) {
          await signOut(auth);
          throw new Error("Accès refusé. Vous n'êtes pas administrateur.");
        }
      }
    } catch (error: any) {
      let errorMsg = "Identifiants ou mot de passe incorrects.";
      if (error.code === "auth/invalid-email") {
        errorMsg = "Format d'adresse email invalide.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
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
      router.push("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-900 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute w-96 h-96 bg-[var(--color-accent)] opacity-10 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-[var(--color-light)] opacity-5 rounded-full blur-3xl -bottom-20 -right-20"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-8 w-full max-w-md shadow-2xl relative z-10 text-white mx-auto rounded-none"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--color-accent)] mx-auto flex items-center justify-center font-heading font-black text-2xl tracking-wider text-white shadow-lg mb-4">
              CF
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold">Cabinet Guilogtrans</h1>
            <p className="text-xs text-gray-300 mt-1 uppercase tracking-widest">Espace d'Administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-1.5">Adresse Email *</label>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all rounded-none"
                placeholder="Ex: admin@guilogtransguinee.com"
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
                placeholder="••••••••••"
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
    <div className="flex h-screen bg-slate-50 overflow-hidden text-gray-800 font-sans">
      <Sidebar 
        pendingInscriptionsCount={pendingInscriptionsCount} 
        unreadMessagesCount={unreadMessagesCount}
        handleLogout={handleLogout}
      />
      
      {/* Contenu principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
