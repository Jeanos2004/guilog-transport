"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, BookOpen, Layers, CheckCircle2, CreditCard } from "lucide-react";
import { db } from "@/lib/db";

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const categoryImages: Record<string, string> = {
  "Informatique Bureautique": "/images/gallery.png",
  "Gestion": "/images/about.png",
  "Logistique et Transport": "/images/hero.png",
  "QHSE": "/images/hero.png",
  "Analyse des Données": "/images/gallery.png",
  "Communication Digitale": "/images/about.png",
  "Infographie": "/images/gallery.png",
  "Suivi-Évaluation de Projets": "/images/about.png",
};

export default function FormationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [formations, setFormations] = useState<any[]>([]);

  useEffect(() => {
    const loadFormations = async () => {
      await db.init();
      setFormations(await db.getFormations());
    };
    loadFormations();
  }, []);

  const categories = ["Tous", ...Array.from(new Set(formations.map((f) => f.categorie)))];

  const filteredFormations = formations.reduce((acc, cat) => {
    if (activeCategory === "Tous" || activeCategory === cat.categorie) {
      cat.modules.forEach((mod: any) => {
        if (mod.details?.statutInscription === "Fermée") return;
        acc.push({
          ...mod,
          categorie: cat.categorie,
          slug: generateSlug(mod.titre),
        });
      });
    }
    return acc;
  }, [] as any[]);

  return (
    <>
      {/* PAGE HERO — Schule: solid blue bg, no gradient, image bg subtle */}
      <section className="bg-[var(--color-primary)] py-20 relative overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="Formations Guilogtrans"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/95 via-[var(--color-primary)]/70 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Breadcrumb */}
            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white/60 mb-4 gap-2">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-light)]" />
              <span className="text-[var(--color-light)]">Formations</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Nos Formations
            </h1>
            <p className="text-white/70 max-w-xl font-sans text-base leading-relaxed">
              Des programmes professionnalisants 100% pratiques, conçus pour acquérir les compétences les plus demandées par les recruteurs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTER TABS + GRID */}
      <section className="py-16 bg-[var(--color-gray)] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter tabs — Schule: text tabs with bottom underline, no pill/rounded */}
          <div className="flex flex-wrap gap-1 mb-12 border-b border-gray-200">
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-[3px] -mb-[1px] ${
                  activeCategory === cat
                    ? "border-[var(--color-accent)] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFormations.map((formation: any) => {
                const imageSrc = formation.image || categoryImages[formation.categorie] || "/images/gallery.png";
                return (
                  <motion.div
                    key={formation.slug}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-gray-200 hover: transition-all duration-300 group flex flex-col"
                  >
                    {/* Image header */}
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={formation.titre}
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                      <div className="absolute top-0 left-0 flex items-center">
                        <span className="bg-[var(--color-primary)] text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-wider">
                          {formation.categorie}
                        </span>
                        {formation.details?.statutInscription === "Fermée" && (
                          <span className="bg-red-600 text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-wider">
                            Fermée
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest mb-3">
                        <BookOpen className="w-3.5 h-3.5" />
                        Module certifiant
                      </div>

                      <h3 className="text-lg font-heading font-bold text-gray-900 mb-4 leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 min-h-[3.5rem]">
                        {formation.titre}
                      </h3>

                      <div className="h-px w-full bg-gray-100 mb-4" />

                      {/* Prix + Méthode de paiement */}
                      {(formation.prix !== undefined || formation.prixInscription !== undefined || formation.methodePaiement) && (
                        <div className="mb-4 p-3 bg-gray-50 border border-gray-100 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1.5">
                              {formation.prix !== undefined && (
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">Formation</span>
                                  <div className="text-base font-black text-[#8B0000] leading-none">
                                    {formation.prix.toLocaleString('fr-GN')} <span className="text-[10px] font-bold tracking-wider">GNF</span>
                                  </div>
                                </div>
                              )}
                              {formation.prixInscription !== undefined && (
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">Inscription</span>
                                  <div className="text-sm font-bold text-gray-800 leading-none">
                                    {formation.prixInscription.toLocaleString('fr-GN')} <span className="text-[9px] font-bold tracking-wider">GNF</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {(formation.prix !== undefined || formation.prixInscription !== undefined) && (
                              <span className="text-[9px] font-bold bg-[#8B0000] text-white px-2 py-1 uppercase tracking-wider shrink-0 mt-1">
                                Tarifs
                              </span>
                            )}
                          </div>
                          {formation.methodePaiement && (
                            <div className="flex items-center gap-1 mt-1 border-t border-gray-200 pt-2">
                              <CreditCard className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-500 font-medium">Paiement : {formation.methodePaiement}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tools */}
                      <div className="mb-5 flex-grow">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          Outils
                        </div>
                        {formation.outils && formation.outils.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {formation.outils.map((outil: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-[var(--color-gray)] border border-gray-200 text-gray-600 text-[10px] font-medium"
                              >
                                {outil}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 italic">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                            Théorie &amp; pratique métier
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <Link
                          href={`/formations/${formation.slug}`}
                          className="text-[11px] font-bold uppercase tracking-widest text-gray-900 hover:text-[#8B0000] transition-colors flex items-center gap-1"
                        >
                          En savoir plus <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link
                          href="/inscription"
                          className="bg-[var(--color-primary)] hover:bg-[#8B0000] text-white font-bold text-[9px] uppercase tracking-widest px-4 py-2.5 transition-colors"
                        >
                          S'inscrire
                        </Link>
                      </div>
                    </div>
                  </motion.div>

                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredFormations.length === 0 && (
            <div className="text-center py-24 bg-white border border-gray-200">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun module pour cette catégorie.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
