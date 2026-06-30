"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mail, Phone, GraduationCap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "À Propos", href: "/a-propos" },
  { name: "Formations", href: "/formations" },
  { name: "Témoignages", href: "/temoignages" },
  { name: "Galerie", href: "/galerie" },
  { name: "Actualités", href: "/actualites" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full z-50 sticky top-0 shadow-md">

      {/* === TOP BAR — Schule style === */}
      <div className="hidden lg:block bg-[var(--color-primary)] text-white text-xs py-2.5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

          {/* Left: contact info */}
          <div className="flex items-center gap-6">
            <a
              href="mailto:contact@guilogtrans-guinee.com"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--color-light)]" />
              contact@guilogtrans-guinee.com
            </a>
            <a
              href="https://wa.me/224626625162"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +224 626 62 51 62
            </a>
          </div>

          {/* Right: social icons */}
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs">Suivez-nous</span>
            <a
              href="https://www.facebook.com/guilogtransguinee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[var(--color-light)] transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/cabinet-guilogtrans-guinee/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[var(--color-light)] transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/guilogtrans_guinee?igsh=MWk5dWphdm4wOTl6YQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[var(--color-light)] transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a
              href="https://wa.me/224626625162"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-[var(--color-light)] transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* === MAIN NAV === */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo.png" alt="Cabinet Guilogtrans Logo" className="h-12 w-auto object-contain" />
              <div>
                <span className="block text-[18px] font-heading font-extrabold text-[var(--color-primary)] leading-tight tracking-tight">
                  Cabinet Guilogtrans
                </span>
                <span className="block text-[9px] font-sans font-bold text-gray-400 uppercase tracking-[0.15em]">
                  Cabinet de Formation
                </span>
              </div>
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-[13px] font-sans font-semibold uppercase tracking-wide transition-colors relative",
                      isActive
                        ? "text-[var(--color-accent)]"
                        : "text-gray-600 hover:text-[var(--color-primary)]"
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--color-accent)]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* CTA button */}
            <div className="hidden lg:block">
              <Link
                href="/student/login"
                className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors animate-pulse"
              >
                Espace Étudiant
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[var(--color-primary)] border border-gray-200 hover:border-[var(--color-accent)] transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-sm font-bold uppercase tracking-wider border-l-4 transition-all",
                      isActive
                        ? "border-[var(--color-accent)] text-[var(--color-primary)] bg-blue-50"
                        : "border-transparent text-gray-600 hover:border-[var(--color-light)] hover:text-[var(--color-primary)] hover:bg-gray-50"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-gray-100">
                <Link
                  href="/student/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-3 bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Espace Étudiant (S'inscrire)
                </Link>
                <div className="mt-3 text-center text-xs text-gray-400 space-y-1 font-sans">
                  <div>+224 626 62 51 62</div>
                  <div>contact@guilogtrans-guinee.com</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
