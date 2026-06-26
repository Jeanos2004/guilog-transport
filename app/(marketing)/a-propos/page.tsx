"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Target, Eye, GraduationCap, Briefcase, Laptop, LifeBuoy } from "lucide-react";
import { SectionTitle } from "@/components/SectionTitle";
import { teamData, servicesData } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[var(--color-primary)] py-20 relative overflow-hidden">
        <Image
          src="/images/about.png"
          alt="À Propos de CFIG Guinée"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-cover opacity-20"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">À Propos de CFIG Guinée</h1>
            <div className="flex items-center text-sm text-gray-300">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-[var(--color-accent)]">À Propos</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Presentation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionTitle title="CFIG Guinée SARLU" subtitle="Votre partenaire de confiance en Guinée" />
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Le Cabinet de Formation Informatique de Gestion (CFIG Guinée SARLU) est un cabinet de référence spécialisé dans la formation professionnelle continue et le consulting d'entreprise.
                </p>
                <p>
                  Nous intervenons dans plusieurs domaines stratégiques : gestion d'entreprise, analyse de données, ressources humaines, comptabilité, logistique et communication digitale. Notre objectif est de doter les professionnels et les organisations des compétences nécessaires pour exceller dans un environnement concurrentiel.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-none shadow-sm flex flex-col hover:shadow-md transition-all duration-300"
            >
              <div className="bg-blue-50/60 border-b border-blue-100 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-blue-100 flex items-center justify-center text-[var(--color-accent)]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--color-primary)]">Notre Approche</h3>
              </div>
              <div className="p-8 flex-grow">
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-none mr-4 mt-1 shrink-0 text-[var(--color-accent)]">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-primary)] text-sm">Holistique</h4>
                      <p className="text-xs text-gray-550 mt-1">Une vision globale des défis de votre entreprise.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-none mr-4 mt-1 shrink-0 text-[var(--color-accent)]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-primary)] text-sm">Pratique</h4>
                      <p className="text-xs text-gray-550 mt-1">Des formations axées sur la pratique et l'utilisation d'outils réels.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-none mr-4 mt-1 shrink-0 text-[var(--color-accent)]">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-primary)] text-sm">Personnalisée</h4>
                      <p className="text-xs text-gray-550 mt-1">Des solutions de consultation adaptées à votre contexte spécifique.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-none shadow-sm flex flex-col hover:shadow-md transition-all duration-300"
            >
              <div className="bg-red-50/60 border-b border-red-100 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-red-100 flex items-center justify-center text-[var(--color-secondary)]">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--color-primary)]">Notre Mission</h3>
              </div>
              <div className="p-8 flex-grow">
                <p className="text-gray-600 leading-relaxed text-sm">
                  Fournir des services de formation et de consultation de haute qualité qui permettent aux individus de réaliser leur plein potentiel et aux organisations d'optimiser leurs performances opérationnelles et stratégiques.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-none shadow-sm flex flex-col hover:shadow-md transition-all duration-300"
            >
              <div className="bg-blue-50/60 border-b border-blue-100 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-none bg-blue-100 flex items-center justify-center text-[var(--color-accent)]">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--color-primary)]">Notre Vision</h3>
              </div>
              <div className="p-8 flex-grow">
                <p className="text-gray-600 leading-relaxed text-sm">
                  Devenir le partenaire privilégié et le leader incontesté de la formation professionnelle continue et du conseil en gestion en République de Guinée et dans la sous-région, reconnu pour notre excellence et notre impact positif.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Offerts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Nos Services" subtitle="Une gamme complète de solutions pour votre développement" centered />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {servicesData.map((service, index) => {
              const icons: Record<string, React.ReactNode> = {
                GraduationCap: <GraduationCap className="w-8 h-8" />,
                Briefcase: <Briefcase className="w-8 h-8" />,
                Laptop: <Laptop className="w-8 h-8" />,
                LifeBuoy: <LifeBuoy className="w-8 h-8" />,
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--color-surface)] p-8 rounded-xl text-center hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)] text-white mb-6">
                    {icons[service.icon]}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#f5f7fa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-primary)] mb-3">Notre équipe</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {teamData.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Gradient ring around photo */}
                <div className="relative mb-5">
                  {/* Outer gradient border */}
                  <div
                    className="w-40 h-40 rounded-full p-[3px] shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #1A3A6E 0%, #8B0000 50%, #1A3A6E 100%)"
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                        style={{ 
                          transform: `scale(${(member as any).zoom || 1}) translate(${(member as any).offsetX || '0px'}, ${(member as any).offsetY || '0px'})` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-lg font-heading font-bold text-[var(--color-primary)] leading-tight mb-1">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-4 max-w-[140px] leading-relaxed">
                  {member.role}
                </p>

                {/* LinkedIn */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn de ${member.name}`}
                  className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#0077B5] hover:bg-[#005f91] transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
