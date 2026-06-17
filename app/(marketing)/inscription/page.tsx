"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { ChevronRight, CheckCircle, Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/lib/db";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  requestType: string;
  domain: string;
  message: string;
};

function InscriptionForm() {
  const searchParams = useSearchParams();
  const initialDomain = searchParams.get("domain") || "";
  const initialModule = searchParams.get("module") || "";

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      await db.init();
      const formations = await db.getFormations();
      setCategories(formations.map((f) => f.categorie));
    };
    loadCategories();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      requestType: "Inscription individuelle",
      domain: initialDomain,
      message: initialModule ? `Bonjour, je souhaite m'inscrire pour le module : ${initialModule}.` : "",
    }
  });

  // Dynamically update form fields if URL search parameters load after initial render
  useEffect(() => {
    if (initialDomain || initialModule) {
      reset({
        requestType: "Inscription individuelle",
        domain: initialDomain,
        message: initialModule ? `Bonjour, je souhaite m'inscrire pour le module : ${initialModule}.` : "",
        fullName: "",
        email: "",
        phone: "",
        company: "",
      });
    }
  }, [initialDomain, initialModule, reset]);

  const onSubmit = async (data: FormData) => {
    await db.addInscription({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      requestType: data.requestType,
      domain: data.domain,
      message: data.message,
    });
    setIsSubmitted(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="p-12 text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-4">Demande envoyée !</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Merci pour votre intérêt. Notre équipe vous contactera dans les plus brefs délais pour finaliser votre démarche.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Faire une autre demande
          </button>
        </motion.div>
      ) : (
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Formulaire de demande</h2>
            <p className="text-gray-600">Remplissez ce formulaire pour vous inscrire à une formation ou demander un devis personnalisé.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Radio group */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Type de demande *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Inscription individuelle", "Formation en entreprise", "Demande de devis"].map((type) => (
                  <label key={type} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value={type}
                      {...register("requestType")}
                      className="w-4 h-4 text-[var(--color-primary)] border-gray-300 focus:ring-[var(--color-primary)]"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  {...register("fullName", { required: "Ce champ est requis" })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                  placeholder="John Doe"
                />
                {errors.fullName && <span className="text-red-500 text-xs mt-1 block">{errors.fullName.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="text"
                  {...register("phone", { 
                    required: "Ce champ est requis",
                  })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                  placeholder="+224 6XX XX XX XX"
                />
                {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  {...register("email", { 
                    required: "Ce champ est requis",
                    pattern: { value: /^\S+@\S+$/i, message: "Format d'email invalide" }
                  })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  placeholder="john@example.com"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise / Organisation</label>
                <input
                  type="text"
                  {...register("company")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Facultatif"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domaine de formation souhaité *</label>
              <select
                {...register("domain", { required: "Veuillez sélectionner un domaine" })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white ${errors.domain ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Sélectionnez un domaine</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.domain && <span className="text-red-500 text-xs mt-1 block">{errors.domain.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message / Besoins spécifiques</label>
              <textarea
                {...register("message")}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Précisez vos attentes ou le module exact qui vous intéresse..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Envoi en cours..." : (
                <>
                  Envoyer ma demande <Send className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-white">
      {/* Left panel: Image */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-[var(--color-primary)] overflow-hidden">
        <Image
          src="/images/inscription_hero.png"
          alt="Inscription CFIG Guinée"
          fill
          sizes="50vw"
          priority
          className="object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)] via-transparent to-transparent opacity-90" />
        
        <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16 text-white pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-[var(--color-accent)] text-xs font-bold uppercase tracking-wider mb-4 rounded-none border border-[var(--color-accent)]/30">
              Formations & Devis
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4 leading-tight">
              Démarrez votre aventure
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Que ce soit pour une formation individuelle ou pour booster les compétences de vos équipes, nous avons la solution.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel: Form */}
      <div className="w-full lg:w-7/12 flex flex-col items-center p-6 sm:p-12 lg:py-16 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="lg:hidden mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-heading font-extrabold text-[var(--color-primary)] mb-2">Inscription & Devis</h1>
          </div>

          <Suspense fallback={
            <div className="bg-white border border-gray-200 p-12 text-center shadow-sm rounded-2xl">
              <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Chargement du formulaire...</p>
            </div>
          }>
            <InscriptionForm />
          </Suspense>

          <div className="mt-8 text-center bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col sm:flex-row items-center justify-center">
            <span className="text-gray-700 mb-3 sm:mb-0 sm:mr-4 font-medium">Ou contactez-nous directement sur WhatsApp</span>
            <a 
              href="https://wa.me/224626625162" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-[#25D366] text-white rounded-md font-medium hover:bg-green-600 transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              +224 626 62 51 62
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
