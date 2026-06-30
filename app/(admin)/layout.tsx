import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration — Cabinet Guilogtrans",
  description: "Espace d'administration sécurisé du Cabinet de Formation Cabinet Guilogtrans.",
};

/**
 * Layout isolé pour la section admin.
 * Aucune Navbar publique, aucun Footer, aucun bouton WhatsApp.
 * Le dashboard gère son propre shell avec sidebar intégrée.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen">
      {children}
    </div>
  );
}
