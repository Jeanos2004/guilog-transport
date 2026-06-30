"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Star, GraduationCap, BookOpen, Users, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { formationsData, statsData, testimonialsData } from "@/lib/data";
import { db } from "@/lib/db";

// === Hero Slider Data (Schule-style) ===
const heroSlides = [
  {
    id: 1,
    image: "/images/hero.png",
    label: "Conseil & Formation",
    title: "Disponibilité · Efficacité · Flexibilité",
    subtitle: "Cabinet de conseil, d'étude et de formation spécialisé en logistique et transport, au service des entreprises et professionnels de Guinée et d'Afrique de l'Ouest.",
    cta: { text: "Découvrir nos formations", href: "/formations" },
    ctaSecondary: { text: "Demander un devis", href: "/contact" },
  },
  {
    id: 2,
    image: "/images/about.png",
    label: "Conseil Stratégique",
    title: "Optimisation de votre chaîne logistique",
    subtitle: "Gestion des entrepôts, planification des transports et réduction de vos coûts logistiques avec nos experts.",
    cta: { text: "Nos services", href: "/a-propos" },
    ctaSecondary: { text: "Nous contacter", href: "/contact" },
  },
  {
    id: 3,
    image: "/images/gallery.png",
    label: "Études & Audit",
    title: "Analyse et diagnostic logistique",
    subtitle: "Évaluation de vos processus existants et recommandations stratégiques pour une meilleure rentabilité.",
    cta: { text: "Voir le catalogue", href: "/formations" },
    ctaSecondary: { text: "En savoir plus", href: "/a-propos" },
  },
];

// === Category images ===
const categoryImages: Record<string, string> = {
  "Informatique Bureautique": "/images/programmes/bureautique.jpg",
  "Gestion": "/images/programmes/Gestion.jpg",
  "Logistique et Transport": "/images/programmes/logistique.jpg",
  "QHSE": "/images/programmes/qhse.jpg",
  "Analyse des Données": "/images/programmes/analyse.jpg",
  "Communication Digitale": "/images/programmes/communication.jpg",
  "Infographie": "/images/programmes/Infographie.jpg",
  "Suivi-Évaluation de Projets": "/images/programmes/Suivi-Evaluation.jpg",
};

const statIcons = [
  <GraduationCap className="w-7 h-7 text-[var(--color-accent)]" key="grad" />,
  <BookOpen className="w-7 h-7 text-[var(--color-accent)]" key="book" />,
  <Users className="w-7 h-7 text-[var(--color-accent)]" key="users" />,
  <Award className="w-7 h-7 text-[var(--color-accent)]" key="award" />,
];

// Arrondit vers le bas à la centaine inférieure : 1203 → 1200, 2560 → 2500
const roundDown = (n: number) => Math.floor(n / 100) * 100;

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [formations, setFormations] = useState<any[]>(formationsData);
  const [testimonials, setTestimonials] = useState<any[]>(testimonialsData.map(t => ({ ...t, active: true })));
  const [settings, setSettings] = useState<any>(null);
  const [validatedInscriptionsCount, setValidatedInscriptionsCount] = useState(0);

  const featuredFormations = formations.slice(0, 6);

  useEffect(() => {
    const loadDynamicData = async () => {
      await db.init();
      
      const loadedFormations = await db.getFormations();
      if (loadedFormations && loadedFormations.length > 0) {
        setFormations(loadedFormations);
      }
      
      const loadedTestimonials = await db.getTestimonials();
      if (loadedTestimonials && loadedTestimonials.length > 0) {
        const standards = loadedTestimonials.filter((t: any) => t.active && (!t.type || t.type === "standard"));
        setTestimonials(standards.slice(0, 3));
      }
      
      const loadedSettings = await db.getSettings();
      setSettings(loadedSettings);
      
      const loadedInscriptions = await db.getInscriptions();
      if (loadedInscriptions) {
        setValidatedInscriptionsCount(loadedInscriptions.filter((x: any) => x.status === "Validé").length);
      }
    };
    loadDynamicData();
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % heroSlides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, isAutoPlaying]);

  const dynamicStats = [
    { value: "4+", label: "Années d'expérience" },
    { value: "50+", label: "Formations dispensées" },
    { value: "30+", label: "Entreprises accompagnées" },
    { value: "+500", label: "Apprenants formés" }
  ];

  return (
    <>
      {/* ================================================
          HERO SLIDER — Style fidèle au thème Schule
      ================================================ */}
      <section
        className="relative w-full overflow-hidden bg-[var(--color-primary)]"
        style={{ height: "calc(100vh - 96px)", minHeight: "580px", maxHeight: "780px" }}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={heroSlides[current].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {/* Background image — full cover, no overlay gradient */}
            <Image
              src={heroSlides[current].image}
              alt={heroSlides[current].title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              className="object-cover"
            />
            {/* Gradient overlay for better readability on the left while preserving the image on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/95 via-[var(--color-primary)]/70 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${heroSlides[current].id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl"
              >
                {/* Category label — Schule style */}
                <div className="inline-flex items-center mb-5">
                  <span className="w-8 h-[2px] bg-[var(--color-accent)] mr-3" />
                  <span className="text-[var(--color-accent)] text-sm font-sans font-bold uppercase tracking-widest">
                    {heroSlides[current].label}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
                  {heroSlides[current].title}
                </h1>

                <p className="text-lg text-white/80 mb-10 max-w-2xl font-sans leading-relaxed">
                  {heroSlides[current].subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link
                    href={heroSlides[current].cta.href}
                    className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-light)] text-white font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-md"
                  >
                    {heroSlides[current].cta.text}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    href={heroSlides[current].ctaSecondary.href}
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/80 text-white hover:bg-white hover:text-gray-900 font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-md backdrop-blur-sm"
                  >
                    {heroSlides[current].ctaSecondary.text}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrow Controls — Schule style */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-[var(--color-accent)] border border-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Précédent"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-[var(--color-accent)] border border-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Suivant"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 ${
                i === current
                  ? "w-8 h-2 bg-[var(--color-accent)]"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide counter — Schule style top right */}
        <div className="absolute top-6 right-8 z-20 text-white/60 text-sm font-mono font-bold">
          {String(current + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
        </div>
      </section>

      {/* ================================================
          STATS STRIP — Schule style: white bar on color bg
      ================================================ */}
      <section className="bg-[var(--color-primary)] py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10">
            {dynamicStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 px-6 py-8 border-r border-white/10 last:border-r-0"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-accent)]/20 flex items-center justify-center">
                  {statIcons[index]}
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-heading font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/60 font-sans uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          FORMATIONS PREVIEW — Schule "Courses" block
      ================================================ */}
      <section className="py-24 bg-[var(--color-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header — Schule style: left-aligned with accent line */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
            <div>
              <span className="inline-flex items-center text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3">
                <span className="w-6 h-[2px] bg-[var(--color-accent)] mr-2 inline-block" />
                Ce que nous proposons
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                Nos Programmes Phares
              </h2>
            </div>
            <Link
              href="/formations"
              className="mt-6 md:mt-0 inline-flex items-center text-sm font-bold text-[var(--color-accent)] hover:text-gray-900 uppercase tracking-wider transition-colors"
            >
              Voir tout le catalogue <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFormations.map((formation, index) => {
              const imageSrc = formation.image || categoryImages[formation.categorie] || "/images/gallery.png";
;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 transition-all duration-300 group flex flex-col overflow-hidden"
                >
                  {/* Image header — Schule: full image top */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={formation.categorie}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      className="object-cover transition-transform duration-500"
                      
                    />
                   
                    {/* Category badge */}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {formation.categorie}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 text-[var(--color-accent)] text-[11px] font-bold uppercase tracking-widest mb-3">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{formation.modules.length} modules</span>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-gray-900 mb-4 leading-snug group-hover:text-[var(--color-primary)] transition-colors">
                      {formation.categorie}
                    </h3>

                    <ul className="space-y-2 mb-6 flex-grow">
                      {formation.modules.slice(0, 3).map((mod: any, i: number) => (
                        <li key={i} className="flex items-start text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mr-2 flex-shrink-0 mt-0.5" />
                          <span>{mod.titre}</span>
                        </li>
                      ))}
                      {formation.modules.length > 3 && (
                        <li className="text-xs text-gray-400 pl-6">
                          + {formation.modules.length - 3} autre(s) module(s)
                        </li>
                      )}
                    </ul>

                    {/* Schule card footer */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <Link
                        href="/formations"
                        className="text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-[var(--color-primary)] transition-colors"
                      >
                        En savoir plus →
                      </Link>
                      <Link
                        href="/inscription"
                        className="bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-white font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-md transition-colors"
                      >
                        S'inscrire
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================
          ABOUT PREVIEW — Schule: split image + text, no gradients
      ================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[480px] overflow-hidden"
            >
              <Image
                src="/images/section-about.jpeg"
                alt="Équipe Cabinet Guilogtrans"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
              {/* Stats badge — Schule style floating box */}
              <div className="absolute bottom-6 right-6 bg-[var(--color-primary)] text-white p-5">
                <div className="text-3xl font-heading font-bold">
                  +{settings ? roundDown(settings.apprenantsForme + validatedInscriptionsCount) : 500}
                </div>
                <div className="text-xs font-sans uppercase tracking-widest text-white/70 mt-1">
                  Professionnels formés
                </div>
              </div>
            </motion.div>

            {/* Text column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-4">
                <span className="w-6 h-[2px] bg-[var(--color-accent)] mr-2 inline-block" />
                À propos de nous
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6 leading-tight">
                Cabinet de Référence en Logistique et Transport
              </h2>

              <div className="w-12 h-1 bg-[var(--color-accent)] mb-6" />

              <p className="text-gray-600 text-base mb-5 leading-relaxed">
                Le Cabinet Guilogtrans accompagne les entreprises, institutions et professionnels souhaitant optimiser leurs opérations logistiques et renforcer les compétences de leurs équipes.
              </p>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                Nous intervenons sur trois piliers clés : le conseil stratégique, les études et l'audit logistique, ainsi que la formation professionnelle continue (gestion des stocks, réglementation douanière, etc.).
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  "Conseil stratégique",
                  "Études & Audit",
                  "Formation professionnelle",
                  "Accompagnement sur-mesure",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="/a-propos"
                className="inline-flex items-center px-7 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-sans font-bold text-sm uppercase tracking-wider transition-colors"
              >
                En savoir plus
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================
          TESTIMONIALS — Schule: solid dark bg, card quote style
      ================================================ */}
      <section className="py-24 bg-[var(--color-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center justify-center text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-6 h-[2px] bg-[var(--color-accent)] mr-2 inline-block" />
              Témoignages
              <span className="w-6 h-[2px] bg-[var(--color-accent)] ml-2 inline-block" />
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
              Ce que disent nos apprenants
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-100 p-8 hover: transition-all duration-300"
              >
                {/* Video if exists */}
                {testimonial.videoUrl ? (
                  <div className="mb-6 rounded-sm overflow-hidden bg-black/5 aspect-video relative">
                    <video src={testimonial.videoUrl} controls preload="metadata" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-[var(--color-accent)] text-5xl font-heading leading-none mb-4 select-none">
                    "
                  </div>
                )}

                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                  {testimonial.text}
                </p>

                <div className="flex items-center pt-4 border-t border-gray-100">
                  {testimonial.image ? (
                    <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover mr-3 bg-gray-100" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm mr-3 ${testimonial.color || 'bg-[var(--color-primary)]'}`}>
                      {testimonial.initials}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-gray-500 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          FINAL CTA — Schule: solid accent bar, no gradients
      ================================================ */}
      <section className="py-20 bg-[var(--color-gray)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center justify-center text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-5">
              <span className="w-6 h-[2px] bg-[var(--color-accent)] mr-2 inline-block" />
              Prêt à commencer ?
              <span className="w-6 h-[2px] bg-[var(--color-accent)] ml-2 inline-block" />
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-5">
              Rejoignez les professionnels qui font confiance au Cabinet Guilogtrans
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto font-sans">
              Des entreprises et des particuliers ont optimisé leurs flux et boosté leur carrière grâce à nos formations et notre expertise logistique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-md"
              >
                S'inscrire maintenant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[var(--color-primary)] text-gray-900 hover:bg-[var(--color-primary)] hover:text-white font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 rounded-md"
              >
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
