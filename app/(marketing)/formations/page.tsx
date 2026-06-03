"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, BookOpen, Layers, CheckCircle2 } from "lucide-react";
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
          alt="Formations CFIG"
          fill
          priority
          className="object-cover opacity-20"
        />
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
                    ? "border-[var(--color-accent)] text-[var(--color-primary)]"
                    : "border-transparent text-gray-500 hover:text-[var(--color-primary)] hover:border-gray-300"
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
                    className="bg-white border border-gray-200 hover:border-[var(--color-accent)] hover:shadow-md transition-all duration-300 group flex flex-col"
                  >
                    {/* Image header */}
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={formation.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-0 left-0 bg-[var(--color-primary)] text-white text-[9px] font-bold px-3 py-1.5 uppercase tracking-wider">
                        {formation.categorie}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest mb-3">
                        <BookOpen className="w-3.5 h-3.5" />
                        Module certifiant
                      </div>

                      <h3 className="text-lg font-heading font-bold text-[var(--color-primary)] mb-4 leading-snug group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 min-h-[3.5rem]">
                        {formation.titre}
                      </h3>

                      <div className="h-px w-full bg-gray-100 mb-4" />

                      {/* Tools + Price row */}
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                            <Layers className="w-3.5 h-3.5 text-gray-400" />
                            Outils :
                          </div>
                          {formation.prix !== undefined && (
                            <span className="text-xs font-black text-[var(--color-accent)] bg-orange-50 border border-orange-200 px-2 py-0.5">
                              {formation.prix.toLocaleString('fr-GN')} GNF
                            </span>
                          )}
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
                      <Link
                        href={`/formations/${formation.slug}`}
                        className="mt-auto inline-flex items-center justify-between w-full px-5 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        <span>Voir les détails</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
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
