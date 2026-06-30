"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Play,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LayoutGrid,
  Grid3X3,
  BookOpen,
  Award,
  Wrench,
  CalendarDays,
  GraduationCap,
  Folder,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { db, GalleryItem } from "@/lib/db";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Salles de cours":       <BookOpen className="w-4 h-4" />,
  "Remises de certificats": <Award className="w-4 h-4" />,
  "Ateliers":              <Wrench className="w-4 h-4" />,
  "Événements divers":     <CalendarDays className="w-4 h-4" />,
  "Vie étudiante":         <GraduationCap className="w-4 h-4" />,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? <Folder className="w-4 h-4" />;
}

export default function GaleriePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [lightboxList, setLightboxList] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    db.getGallery().then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, []);

  const getBaseTitle = (title: string) => title.replace(/\s*\(\d+\)$/, "").trim();

  // Create albums list
  const albums = (() => {
    const grouped: Record<string, { title: string; category: string; items: GalleryItem[]; dateAdded: string }> = {};
    items.forEach(item => {
      const baseTitle = getBaseTitle(item.title);
      if (!grouped[baseTitle]) {
        grouped[baseTitle] = {
          title: baseTitle,
          category: item.category,
          items: [],
          dateAdded: item.dateAdded || ""
        };
      }
      grouped[baseTitle].items.push(item);
    });
    return Object.values(grouped).sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  })();

  const currentAlbum = selectedAlbum ? albums.find(a => a.title === selectedAlbum) : null;

  // Build ordered list of unique categories present in data
  const categories = ["Tous", ...Array.from(new Set(items.map((i) => i.category)))];

  // Filtered albums based on selected category tab
  const filteredAlbums = activeCategory === "Tous"
    ? albums
    : albums.filter(album => album.category === activeCategory);

  const openLightbox = useCallback((item: GalleryItem, list: GalleryItem[]) => {
    setLightboxList(list);
    setLightboxIndex(list.findIndex((i) => i.id === item.id));
    setLightboxItem(item);
  }, []);

  const closeLightbox = () => setLightboxItem(null);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      const next = lightboxIndex + dir;
      if (next >= 0 && next < lightboxList.length) {
        setLightboxIndex(next);
        setLightboxItem(lightboxList[next]);
      }
    },
    [lightboxIndex, lightboxList]
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxItem) return;
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "Escape") closeLightbox();
    },
    [lightboxItem, navigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxItem]);

  return (
    <>
      {/* =============== HERO =============== */}
      <section className="relative bg-[var(--color-primary)] py-24 overflow-hidden">
        <Image
          src="/images/gallery.png"
          alt="Galerie Cabinet Guilogtrans"
          fill
          priority
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center text-sm text-white/60 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <ChevronRight className="w-4 h-4 mx-2 opacity-40" />
              <span className="text-[var(--color-accent)]">Galerie</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white leading-tight mb-4">
              Galerie Photos <br />
              <span className="text-[var(--color-accent)]">&amp; Vidéos</span>
            </h1>
            <p className="text-white/60 text-base max-w-xl leading-relaxed">
              Découvrez nos locaux, nos apprenants en action, nos cérémonies et nos moments de vie.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =============== MAIN CONTENT =============== */}
      <section className="py-16 bg-[var(--color-surface)] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ---- Category Filter Tabs ---- */}
          {!isLoading && items.length > 0 && !selectedAlbum && (
            <div className="flex flex-wrap gap-2 mb-14">
              {categories.map((cat) => {
                const count = cat === "Tous" ? albums.length : albums.filter((a) => a.category === cat).length;
                return (
                  <motion.button
                    key={cat}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                      activeCategory === cat
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {cat !== "Tous" && (
                      <span className={activeCategory === cat ? "text-white/70" : "text-gray-400"}>
                        {getCategoryIcon(cat)}
                      </span>
                    )}
                    {cat}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${activeCategory === cat ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* ---- Loading Skeleton ---- */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="border border-gray-200 bg-white p-4 space-y-4">
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse rounded-sm" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-sm" />
                  <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded-sm" />
                </div>
              ))}
            </div>
          )}

          {/* ---- Album Content View ---- */}
          {!isLoading && (
            <div>
              {selectedAlbum && currentAlbum ? (
                // Album Details View
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <button
                      onClick={() => setSelectedAlbum(null)}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[var(--color-primary)] transition-colors self-start border border-gray-200 bg-white px-4 py-2 hover:border-gray-300 shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Retour aux dossiers
                    </button>
                    <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest self-start">
                      {getCategoryIcon(currentAlbum.category)}
                      {currentAlbum.category}
                    </div>
                  </div>

                  <div className="mb-10 pb-6 border-b border-gray-100">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold text-[var(--color-primary)] mb-2">
                      {currentAlbum.title}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                      {currentAlbum.items.length} média{currentAlbum.items.length > 1 ? "s" : ""} • {currentAlbum.items.filter(i => i.mediaType === "image").length} photo{currentAlbum.items.filter(i => i.mediaType === "image").length > 1 ? "s" : ""} • {currentAlbum.items.filter(i => i.mediaType === "video").length} vidéo{currentAlbum.items.filter(i => i.mediaType === "video").length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Grid for this specific album */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentAlbum.items.map((item, idx) => (
                      <GalleryTile
                        key={item.id}
                        item={item}
                        index={idx}
                        onClick={() => openLightbox(item, currentAlbum.items)}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                // Grid of Album Folder Cards
                <div>
                  {filteredAlbums.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-gray-100 shadow-sm">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium text-lg">Aucun dossier trouvé.</p>
                      <p className="text-sm text-gray-400 mt-1">Revenez bientôt pour découvrir nos médias !</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredAlbums.map((album) => (
                        <AlbumFolderCard
                          key={album.title}
                          album={album}
                          onClick={() => setSelectedAlbum(album.title)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =============== LIGHTBOX =============== */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative z-10 w-full max-w-5xl mx-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media */}
              <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black" style={{ maxHeight: "75vh" }}>
                {lightboxItem.mediaType === "video" ? (
                  <video src={lightboxItem.mediaUrl} controls autoPlay className="w-full max-h-[75vh] object-contain" />
                ) : (
                  <img src={lightboxItem.mediaUrl} alt={lightboxItem.title} className="w-full max-h-[75vh] object-contain" />
                )}
              </div>

              {/* Info + counter */}
              <div className="mt-5 flex items-start justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                    {getCategoryIcon(lightboxItem.category)}
                  </div>
                  <div>
                    <p className="text-[var(--color-accent)] text-[10px] font-bold uppercase tracking-widest">{lightboxItem.category}</p>
                    <h3 className="text-white font-bold text-base">{lightboxItem.title}</h3>
                  </div>
                </div>
                <span className="text-white/30 text-sm font-mono mt-1 flex-shrink-0">
                  {lightboxIndex + 1} / {lightboxList.length}
                </span>
              </div>

              {/* Dot indicators */}
              {lightboxList.length > 1 && (
                <div className="flex gap-1.5 mt-4">
                  {lightboxList.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); setLightboxItem(lightboxList[i]); }}
                      className={`rounded-full transition-all ${i === lightboxIndex ? "w-5 h-2 bg-[var(--color-accent)]" : "w-2 h-2 bg-white/25 hover:bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Close */}
            <button onClick={closeLightbox} className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < lightboxList.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); navigate(1); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20">
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// Gallery Tile
// ============================================
function GalleryTile({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  const isVideo = item.mediaType === "video";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
      onClick={onClick}
      className="group relative aspect-video overflow-hidden rounded-xl cursor-pointer bg-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Media */}
      {isVideo ? (
        <video
          src={item.mediaUrl}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          preload="metadata"
          muted
          loop
          playsInline
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
        />
      ) : (
        <img
          src={item.mediaUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/80 via-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Title on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <p className="text-white font-semibold text-xs leading-tight line-clamp-2">{item.title}</p>
      </div>

      {/* Video badge */}
      {isVideo && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-[var(--color-primary)]/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
          <Play className="w-2.5 h-2.5 fill-current" />
          Vidéo
        </div>
      )}

      {/* Play button overlay for video on hover */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border-2 border-white/60 shadow-xl">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Album Folder Card Component
// ============================================
function AlbumFolderCard({
  album,
  onClick,
}: {
  album: { title: string; category: string; items: GalleryItem[] };
  onClick: () => void;
}) {
  const coverItem = album.items[0];
  const totalCount = album.items.length;
  const imageCount = album.items.filter(i => i.mediaType === "image").length;
  const videoCount = album.items.filter(i => i.mediaType === "video").length;

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Folder stacked papers effect */}
      <div className="absolute inset-0 bg-white border border-gray-200 shadow-md rounded-none translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300 pointer-events-none" />
      <div className="absolute inset-0 bg-white border border-gray-200 shadow-sm rounded-none translate-x-1 translate-y-1 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-300 pointer-events-none" />

      {/* Main folder card */}
      <div className="relative bg-white border border-gray-200 shadow-sm rounded-none overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[var(--color-primary)]">
        {/* Cover image area */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {coverItem ? (
            coverItem.mediaType === "video" ? (
              <video
                src={coverItem.mediaUrl}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
            ) : (
              <img
                src={coverItem.mediaUrl}
                alt={album.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Folder Category Tag (Top Right) */}
          <div className="absolute top-3 right-3 bg-[var(--color-primary)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md flex items-center gap-1">
            {getCategoryIcon(album.category)}
            {album.category}
          </div>

          {/* Folder Icon badge (Bottom Left) */}
          <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white p-2 border border-white/25">
            <Folder className="w-4 h-4 fill-white/10" />
          </div>

          {/* Count badge (Bottom Right) */}
          <div className="absolute bottom-3 right-3 bg-[var(--color-accent)] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1 shadow-sm">
            {totalCount} média{totalCount > 1 ? "s" : ""}
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <h3 className="text-sm font-bold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
            {album.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            {imageCount > 0 && <span>{imageCount} photo{imageCount > 1 ? "s" : ""}</span>}
            {imageCount > 0 && videoCount > 0 && <span>•</span>}
            {videoCount > 0 && <span>{videoCount} vidéo{videoCount > 1 ? "s" : ""}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
