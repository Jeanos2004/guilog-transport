import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-primary)] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top accent line */}
        <div className="h-1 bg-[var(--color-accent)] mb-12 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="col-span-1">
            <img src="/logo.png" alt="Cabinet Guilogtrans Logo" className="h-12 w-auto object-contain mb-4 bg-white rounded-sm" />
            <h3 className="text-xl font-heading font-bold text-white mb-4 tracking-tight">
              Cabinet <span className="text-[var(--color-light)]">Guilogtrans</span>
            </h3>
            <p className="text-white/60 mb-6 text-sm leading-relaxed">
              Cabinet de conseil, d'étude et de formation spécialisé en logistique et transport à Conakry.
            </p>
            <div className="flex items-center gap-3">
              {[
                {
                  label: "Facebook",
                  url: "#",
                  path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
                },
                {
                  label: "LinkedIn",
                  url: "#",
                  path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
                },
                {
                  label: "Instagram",
                  url: "#",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
                },
              ].map(({ label, url, path }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-white/10 hover:bg-[var(--color-accent)] flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
              Liens Rapides
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "À Propos de nous", href: "/a-propos" },
                { label: "Nos Formations", href: "/formations" },
                { label: "Actualités & Blog", href: "/actualites" },
                { label: "Galerie Photos", href: "/galerie" },
                { label: "Nous Contacter", href: "/contact" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1.5 group"
                  >
                    <span className="w-3 h-[2px] bg-[var(--color-accent)] flex-shrink-0 group-hover:w-5 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Formations */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
              Domaines
            </h4>
            <ul className="space-y-2.5">
              {[
                "Logistique & Transport",
                "Gestion des Stocks",
                "Supply Chain",
                "Réglementation Douanière",
                "Sécurité Routière",
              ].map((item) => (
                <li key={item} className="text-white/60 text-sm flex items-center gap-1.5">
                  <span className="w-3 h-[2px] bg-[var(--color-light)]/50 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-sans font-bold text-white uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--color-light)] flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm leading-relaxed">
                  [Adresse à fournir]
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--color-light)] flex-shrink-0" />
                <div className="space-y-1">
                  <a href="#" className="block text-white/60 hover:text-white text-sm transition-colors font-sans">
                    [Téléphone à fournir]
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--color-light)] flex-shrink-0" />
                <a href="#" className="text-white/60 hover:text-white text-sm transition-colors font-sans">
                  [Email à fournir]
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} Cabinet Guilogtrans. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
