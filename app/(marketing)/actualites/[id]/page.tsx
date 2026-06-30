"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft, Calendar, User, BookOpen, ArrowRight } from "lucide-react";
import { db, Article } from "@/lib/db";

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticleData = async () => {
      await db.init();
      const articlesList = await db.getArticles();
      const articleId = Number(params.id);
      const foundArticle = articlesList.find((a) => a.id === articleId) || null;
      
      setArticle(foundArticle);
      
      // Recent articles excluding current one
      const recent = articlesList
        .filter((a) => a.id !== articleId)
        .slice(0, 3);
      setRecentArticles(recent);
      
      setLoading(false);
    };
    loadArticleData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-gray)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--color-gray)] py-24 flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Article non trouvé</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">L'article de blog que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link 
          href="/actualites"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header section */}
      <section className="bg-[var(--color-primary)] py-16 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute w-96 h-96 bg-[var(--color-accent)] opacity-10 rounded-full blur-3xl -top-20 -left-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <Link 
              href="/actualites" 
              className="inline-flex items-center text-xs font-bold text-[var(--color-accent)] hover:text-white uppercase tracking-widest transition-colors gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour aux actualités
            </Link>
          </div>

          <div className="flex items-center text-xs font-bold uppercase tracking-widest text-[var(--color-light)] mb-3 gap-2">
            <span>{article.category}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Lecture de l'article</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-6 leading-tight max-w-4xl">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-6 items-center text-xs text-white/60 font-sans font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Par {article.author}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content Section */}
      <section className="py-20 bg-[var(--color-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Content Column (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-gray-200 p-6 sm:p-10 space-y-8">
              
              {/* Main Image */}
              <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-gray-100">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Text content */}
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed font-sans text-base space-y-6">
                {article.content ? (
                  article.content.split("\n\n").map((para, index) => (
                    <p key={index}>{para}</p>
                  ))
                ) : (
                  <p>{article.excerpt}</p>
                )}
              </div>

            </div>

            {/* Right Sidebar Column (1 col) */}
            <div className="space-y-6 lg:sticky lg:top-28">
              
              {/* Suggestion list */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-5 border-b border-gray-100 pb-3">
                  Articles Récents
                </h3>
                
                <div className="space-y-6">
                  {recentArticles.map((recent) => (
                    <Link 
                      key={recent.id} 
                      href={`/actualites/${recent.id}`}
                      className="group flex gap-3.5 items-start focus:outline-none"
                    >
                      <div className="relative w-16 h-16 bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        <Image
                          src={recent.image}
                          alt={recent.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"  
                          className="object-cover transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider block mb-0.5">
                          {recent.category}
                        </span>
                        <h4 className="text-xs font-heading font-bold text-gray-900 leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                          {recent.title}
                        </h4>
                        <span className="text-[9px] text-gray-400 block mt-1">{recent.date}</span>
                      </div>
                    </Link>
                  ))}
                  
                  {recentArticles.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">Aucun autre article disponible.</p>
                  )}
                </div>
              </div>

              {/* Marketing card calling to action */}
              <div className="bg-[var(--color-primary)] text-white p-6 border-t-4 border-t-[var(--color-accent)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                
                <h3 className="font-heading font-bold text-lg mb-3 relative z-10">Formez-vous avec des experts</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6 font-sans relative z-10">
                  Découvrez nos offres de formations certifiantes et pratiques pour booster vos compétences en bureautique, gestion, données et logistique.
                </p>
                
                <Link
                  href="/formations"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--color-accent)] hover:bg-white hover:text-gray-900 text-white text-xs font-bold uppercase tracking-wider transition-all w-full justify-center relative z-10"
                >
                  Découvrir les formations
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}
