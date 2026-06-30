"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star, Quote, Play, ChevronLeft, ChevronRight as ChevronRightIcon, Users, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "@/components/SectionTitle";
import { db, Testimonial } from "@/lib/db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYoutubeEmbedUrl(url: string): string | null {
  const match = getYoutubeId(url);
  return match
    ? `https://www.youtube.com/embed/${match}?rel=0&autoplay=1`
    : null;
}

function getYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getTiktokEmbedUrl(url: string): string | null {
  const regExp = /tiktok\.com\/(@[\w.-]+)?\/?video\/(\d+)/;
  const match = url.match(regExp);
  return match ? `https://www.tiktok.com/embed/v2/${match[2]}` : null;
}

function isDirectVideoFile(url: string): boolean {
  return url.includes('cloudinary.com') || url.endsWith('.mp4') || url.endsWith('.webm');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** 21st.dev style: portrait photo fills card, gradient + text overlay at bottom */
function StandardCard({ t, index }: { t: Testimonial; index: number }) {
  const hasPhoto = !!t.image;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl shadow-lg group cursor-default h-full"
      style={{ minHeight: 400 }}
    >
      {/* Background: photo or gradient */}
      {hasPhoto ? (
        <img
          src={t.image}
          alt={t.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: "linear-gradient(145deg, var(--color-primary) 0%, #1a4a8a 60%, var(--color-accent) 100%)" }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Top badge */}
      {!hasPhoto && (
        <div className="absolute top-5 left-5 pointer-events-none">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-lg ${t.color}`}>
            {t.initials}
          </div>
        </div>
      )}

      {/* Rating stars - top right */}
      <div className="absolute top-5 right-5 flex gap-0.5 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 drop-shadow ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-white/30"}`}
          />
        ))}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
        <Quote className="w-6 h-6 text-white/30 mb-2" />
        <p className="text-sm leading-relaxed font-medium text-white/95 mb-4 line-clamp-4">
          {t.text}
        </p>
        <div className="flex items-center gap-3 pt-3 border-t border-white/20">
          {hasPhoto && (
            <img src={t.image} alt={t.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0" />
          )}
          <div>
            <p className="font-bold text-white text-sm leading-tight">{t.name}</p>
            <p className="text-white/60 text-xs">{t.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Video thumbnail card with pulsing play button */
function VideoThumbnailCard({ t, index, onClick }: { t: Testimonial; index: number; onClick: () => void }) {
  const ytId = t.videoUrl ? getYoutubeId(t.videoUrl) : null;
  const isDirect = t.videoUrl ? isDirectVideoFile(t.videoUrl) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-[2rem] shadow-lg group cursor-pointer transition-all duration-300 hover:shadow-2xl flex-shrink-0 w-[80vw] md:w-[80vw] lg:w-[970px] aspect-[1.6]"
    >
      {/* Background (Image or Fallback) */}
      {t.image ? (
        <img
          src={t.image}
          alt={t.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : ytId ? (
        <img
          src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
          alt={t.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          }}
        />
      ) : isDirect ? (
        <video
          src={`${t.videoUrl}#t=1`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 bg-cover bg-center filter blur-sm" style={{ backgroundImage: "url('/images/pattern.png')" }} />
        </div>
      )}

      {/* Dark gradient overlay on the left to make text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10 transition-opacity group-hover:opacity-90 duration-300" />

      {/* Floating student info / role on the left */}
      <div className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 right-20 md:right-32 z-10 pointer-events-none">
        <h3 className="text-xl md:text-3xl font-heading font-extrabold text-white leading-tight drop-shadow-sm line-clamp-3">
          {t.role}
        </h3>
        <p className="text-xs md:text-sm font-semibold text-white/70 mt-2.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
          {t.name}
        </p>
      </div>

      {/* Play CTA at the bottom left (Watch case pill style) */}
      <div className="absolute bottom-5 left-6 md:left-8 z-10">
        <div className="inline-flex items-center gap-2 bg-white text-gray-950 font-bold px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm shadow-lg transform transition-all duration-300 group-hover:bg-gray-100 group-hover:scale-105">
          <Play className="w-3 h-3 fill-gray-950 text-gray-950" />
          <span>Regarder</span>
        </div>
      </div>

      {/* Subtle play indicator at bottom right */}
      <div className="absolute bottom-5 right-5 md:bottom-6 md:right-8 z-10">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:bg-white/25">
          <Play className="w-3 h-3 md:w-4 md:h-4 fill-white ml-0.5" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TemoignagesPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const scrollRefStd = useRef<HTMLDivElement>(null);
  const scrollRefVid = useRef<HTMLDivElement>(null);
  
  // Modal state
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      await db.init();
      const list = await db.getTestimonials();
      setTestimonials(list.filter(t => t.active));
    };
    load();
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const standardCards = testimonials.filter(t => !t.type || t.type === "standard");
  const videoCards = testimonials.filter(t => t.type === "video" || (t.type as any) === "video_wide" || (t.type as any) === "video_vertical");

  return (
    <>
      {/* ─── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-primary)] py-20 relative overflow-hidden">
        <Image
          src="/images/testimonials_hero.png"
          alt="Témoignages Cabinet Guilogtrans"
          fill priority sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">Témoignages</h1>
            <div className="flex items-center text-sm text-gray-300">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-[var(--color-accent)]">Témoignages</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 1: Video testimonials horizontal scroll ────────────────────── */}
      {videoCards.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3 block">
                  En Vidéo
                </span>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-primary)] leading-tight">
                  Ils témoignent <br />
                  <span className="text-[var(--color-accent)]">face caméra</span>
                </h2>
                <p className="text-gray-500 mt-3 max-w-sm text-sm leading-relaxed">
                  Découvrez les retours de nos apprenants en format vidéo interactif.
                </p>
              </motion.div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => scroll(scrollRefVid, "left")}
                  className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(scrollRefVid, "right")}
                  className="w-11 h-11 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-md hover:bg-[var(--color-accent)] transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRefVid}
              className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory items-center"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {videoCards.map((t, index) => (
                <div key={index} className="snap-start flex-shrink-0 h-auto">
                  <VideoThumbnailCard 
                    t={t} 
                    index={index} 
                    onClick={() => setActiveVideo(t.videoUrl || null)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Section 2: Standard testimonials horizontal scroll ─────────────────── */}
      {standardCards.length > 0 && (
        <section className="py-24 bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest mb-3 block">
                  Parcours &amp; Réussites
                </span>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-primary)] leading-tight">
                  Des histoires qui<br />
                  <span className="text-[var(--color-accent)]">nous rendent fiers</span>
                </h2>
                <p className="text-gray-500 mt-3 max-w-sm text-sm leading-relaxed">
                  Chaque apprenant a une histoire unique. Voici quelques parcours inspirants de notre réseau.
                </p>
              </motion.div>

              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => scroll(scrollRefStd, "left")}
                  className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(scrollRefStd, "right")}
                  className="w-11 h-11 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-md hover:bg-[var(--color-accent)] transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRefStd}
              className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory items-stretch"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {standardCards.map((t, index) => (
                <div key={index} className="snap-start flex-shrink-0 w-64 md:w-72 h-auto">
                  <StandardCard t={t} index={index} />
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-1.5 mt-8">
              {standardCards.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === 0 ? "w-6 h-1.5 bg-[var(--color-primary)]" : "w-1.5 h-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Stats Strip ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--color-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1200+", label: "Apprenants formés" },
              { value: "95%",   label: "Taux de satisfaction" },
              { value: "8",     label: "Domaines de formation" },
              { value: "10+",   label: "Experts formateurs" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-heading font-black text-white mb-2">{stat.value}</div>
                <div className="text-white/70 text-xs font-medium uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--color-surface)] p-14 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Award className="w-8 h-8 text-[var(--color-accent)]" />
            </div>
            <h3 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-4">
              Prêt à écrire votre success story ?
            </h3>
            <p className="text-gray-500 mb-8 text-base leading-relaxed">
              Rejoignez plus de 1 200 apprenants qui ont transformé leur carrière grâce à Cabinet Guilogtrans.
            </p>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-accent)] text-white rounded-xl font-bold text-base hover:bg-[var(--color-primary)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              Commencer ma formation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Video Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              onClick={() => setActiveVideo(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
              style={{ maxHeight: "85vh" }}
            >
              {(() => {
                const yt = getYoutubeEmbedUrl(activeVideo);
                const tk = getTiktokEmbedUrl(activeVideo);
                const embedUrl = yt || tk;
                
                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full"
                      style={{ aspectRatio: tk ? "9/16" : "16/9", maxHeight: "85vh", margin: "0 auto", display: "block" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else if (isDirectVideoFile(activeVideo)) {
                  return (
                    <video
                      src={activeVideo}
                      controls
                      autoPlay
                      className="w-full max-h-[85vh]"
                    />
                  );
                } else {
                  return (
                    <div className="p-12 text-center flex flex-col items-center">
                      <Play className="w-16 h-16 text-[var(--color-primary)] mb-6 opacity-80" />
                      <p className="text-white text-lg mb-6">Cette vidéo est hébergée sur une plateforme externe.</p>
                      <a href={activeVideo} target="_blank" rel="noreferrer" className="px-8 py-4 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-[var(--color-accent)] transition">
                        Voir la vidéo
                      </a>
                    </div>
                  );
                }
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
