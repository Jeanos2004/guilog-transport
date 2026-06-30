"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Laptop, 
  HelpCircle, 
  MessageCircle, 
  Send,
  Users,
  Calendar,
  Briefcase
} from "lucide-react";
import { db } from "@/lib/db";

// === TYPES ===
interface ModuleDetail {
  description: string;
  duration: string;
  level: string;
  audience: string[];
  prerequisites?: string;
  prerequis?: string[];
  objectives: string[];
  syllabus: { title: string; points: string[] }[];
}

// === SPECIFIC MODULES DETAILED DATA ===
const moduleDetailsRegistry: Record<string, ModuleDetail> = {
  "initiation-bureautique": {
    description: "Acquérez les bases fondamentales de l'informatique et de la bureautique. Ce module vous permettra de maîtriser l'environnement Windows et d'utiliser efficacement les outils incontournables de Microsoft Office (Word, Excel, PowerPoint) pour vos tâches quotidiennes et professionnelles.",
    duration: "40 heures (100% pratique)",
    level: "Débutant",
    audience: ["Étudiants", "Professionnels en reconversion", "Secrétaires", "Toute personne souhaitant s'initier à l'outil informatique"],
    prerequisites: "Aucun prérequis. Cette formation démarre à partir de zéro.",
    objectives: [
      "Maîtriser le système d'exploitation Windows et la gestion de fichiers",
      "Savoir saisir, mettre en page et imprimer un document professionnel sous Word",
      "Créer des tableaux de calculs simples et appliquer des formules basiques dans Excel",
      "Concevoir et animer des présentations percutantes sous PowerPoint"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Environnement Windows & Internet",
        points: ["Gestion du bureau, fenêtres et raccourcis essentiels", "Création de dossiers, organisation des fichiers et stockage", "Recherche web efficace et sécurité informatique de base"]
      },
      {
        title: "Chapitre 2 : Traitement de texte avec Microsoft Word",
        points: ["Saisie et mise en forme de texte (polices, paragraphes, styles)", "Insertion de tableaux, d'images et d'éléments graphiques", "Mise en page de rapports administratifs et publipostage"]
      },
      {
        title: "Chapitre 3 : Tableur et calculs avec Microsoft Excel",
        points: ["Découverte de l'interface et structure d'un classeur", "Saisie de formules fondamentales (SOMME, MOYENNE, SI)", "Création de graphiques standards pour illustrer les résultats"]
      },
      {
        title: "Chapitre 4 : Présentation assistée avec PowerPoint",
        points: ["Règles de design d'un diaporama professionnel", "Gestion des masques de diapositives et mise en page", "Ajout d'animations, de transitions et techniques de présentation orale"]
      }
    ]
  },
  "excel-avance": {
    description: "Optimisez vos feuilles de calcul et automatisez vos processus avec les fonctionnalités les plus poussées de Microsoft Excel. Cette formation axée sur la pratique intensive vous permettra de devenir le référent de l'analyse de données chiffrées au sein de votre organisation.",
    duration: "30 heures (100% pratique)",
    level: "Avancé",
    audience: ["Analystes financiers", "Comptables", "Contrôleurs de gestion", "Logisticiens", "Assistants de direction"],
    prerequisites: "Bonne maîtrise des fonctions de base d'Excel (formules simples, mise en forme).",
    objectives: [
      "Maîtriser les fonctions logiques, de recherche et statistiques avancées (RECHERCHEV/X, INDEX/EQUIV, SI complexes)",
      "Concevoir des Tableaux de Bord dynamiques et automatisés",
      "Maîtriser PowerQuery pour nettoyer et consolider des sources de données externes",
      "S'initier aux macros simples pour automatiser les tâches répétitives"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Fonctions complexes & Logiques de calcul",
        points: ["Combinaison des fonctions SI, ET, OU, SI.CONDITIONS", "Recherche de données avec RECHERCHEV, RECHERCHEX et INDEX/EQUIV", "Fonctions matricielles et calculs temporels"]
      },
      {
        title: "Chapitre 2 : Analyse croisée et tableaux de bord dynamiques",
        points: ["Création avancée de Tableaux Croisés Dynamiques (TCD)", "Utilisation des segments et chronologies pour filtrer visuellement", "Création d'indicateurs de performance clés (KPI) personnalisés"]
      },
      {
        title: "Chapitre 3 : PowerQuery — Préparation des données",
        points: ["Connexion à des bases de données ou plusieurs fichiers Excel", "Dépoussiérage et transformation des colonnes sans écrire de formule", "Fusion et ajout de requêtes pour consolider les données"]
      },
      {
        title: "Chapitre 4 : Automatisation & Sécurisation",
        points: ["Enregistrement et modification de macros simples", "Protection des feuilles et classeurs (verrouillage des formules)", "Création de formulaires de saisie contrôlée avec validation de données"]
      }
    ]
  },
  "gestion-comptable": {
    description: "Maîtrisez la comptabilité générale de A à Z en alliant la théorie comptable à l'utilisation pratique du logiciel leader du marché Sage 100 Comptabilité. Vous serez capable d'assurer le suivi quotidien et la clôture de la comptabilité d'une entreprise.",
    duration: "40 heures (100% pratique)",
    level: "Intermédiaire à Avancé",
    audience: ["Comptables", "Chefs comptables", "Assistants de gestion", "Étudiants en comptabilité & finance", "Créateurs d'entreprise"],
    prerequisites: "Notions de base en comptabilité générale (débit/crédit, plan comptable).",
    objectives: [
      "Paramétrer un dossier d'entreprise complet sous Sage 100 Comptabilité",
      "Enregistrer tous les flux comptables quotidiens (achats, ventes, trésorerie, TVA)",
      "Réaliser le lettrage des comptes et le rapprochement bancaire",
      "Éditer les documents de synthèse (balance, grand livre, bilan et compte de résultat)"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Paramétrage initial dans Sage Comptabilité",
        points: ["Création du fichier comptable et définition des options", "Création du Plan Comptable et des plans analytiques", "Configuration des codes journaux et taux de taxes (TVA)"]
      },
      {
        title: "Chapitre 2 : Saisie des écritures quotidiennes",
        points: ["Saisie classique et saisie par pièce", "Enregistrement des factures d'achat, de vente et règlements", "Opérations diverses (OD) et gestion des écritures de paie"]
      },
      {
        title: "Chapitre 3 : Traitements comptables réguliers",
        points: ["Rapprochement bancaire manuel et automatique", "Lettrage et pointage des comptes tiers (clients et fournisseurs)", "Déclaration et écriture de centralisation de la TVA"]
      },
      {
        title: "Chapitre 4 : Travaux de fin d'exercice & Éditions",
        points: ["Génération et analyse de la Balance et du Grand Livre", "Simulation et édition du Bilan et du Compte de Résultat", "Procédures de clôture mensuelle et annuelle"]
      }
    ]
  },
  "gestion-commerciale": {
    description: "Maîtrisez l'ensemble de la chaîne de vente et d'achat grâce à l'outil Sage 100 Gestion Commerciale. De la création du devis à la facturation, en passant par le suivi des stocks et des règlements clients.",
    duration: "30 heures (100% pratique)",
    level: "Intermédiaire",
    audience: ["Responsables commerciaux", "Administrateurs des ventes (ADV)", "Acheteurs", "Secrétaires de direction", "Gestionnaires de PME"],
    prerequisites: "Notions de base de la gestion commerciale (facturation, devis, stocks).",
    objectives: [
      "Configurer la structure commerciale d'une entreprise (articles, clients, fournisseurs, dépôts)",
      "Gérer le cycle complet des ventes (devis, bon de commande, bon de livraison, facture)",
      "Gérer le cycle complet des achats et approvisionnements",
      "Analyser l'activité commerciale à travers les rapports et statistiques intégrés"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Création de la structure commerciale",
        points: ["Configuration des familles d'articles et articles simples ou composés", "Paramétrage des fiches tiers (Clients, Fournisseurs, Prospect)", "Gestion des barèmes de tarifs, promotions et remises spécifiques"]
      },
      {
        title: "Chapitre 2 : Traitement du flux des ventes",
        points: ["Saisie et modification des devis et offres de prix", "Transformation des devis en bons de commande et livraison", "Génération des factures et comptabilisation des écritures de vente"]
      },
      {
        title: "Chapitre 3 : Traitement du flux des achats & stocks",
        points: ["Création des demandes d'achat et bons de commande fournisseurs", "Réception des marchandises et traitement des factures d'achat", "Mouvements de stocks (entrées, sorties, transferts inter-dépôts)"]
      },
      {
        title: "Chapitre 4 : Règlements & Statistiques commerciales",
        points: ["Saisie des règlements clients et relance des impayés", "Analyse des ventes par article, client ou commercial", "Création d'états de gestion personnalisés"]
      }
    ]
  },
  "gestion-de-la-paie": {
    description: "Devenez autonome sur la gestion administrative du personnel et la production des bulletins de paie grâce au logiciel Sage 100 Paie et RH. Une formation pratique intégrant la législation du travail guinéenne.",
    duration: "35 heures (100% pratique)",
    level: "Intermédiaire à Avancé",
    audience: ["Gestionnaires de paie", "Responsables RH", "Comptables", "Directeurs administratifs et financiers (DAF)"],
    prerequisites: "Notions de droit social et de comptabilisation de la paie.",
    objectives: [
      "Maîtriser les concepts de base du calcul de la paie (brut, cotisations, net)",
      "Configurer les constantes et rubriques sous Sage Paie et RH",
      "Établir les fiches salariés et gérer les événements (congés, absences, heures sup)",
      "Éditer les déclarations sociales et fiscales (VRS, CNSS)"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Fondations de la paie et législation",
        points: ["Structure d'un bulletin de paie selon le code du travail guinéen", "Calcul des heures supplémentaires, primes et indemnités", "Compréhension des cotisations sociales (CNSS) et impôts sur salaire (VRS)"]
      },
      {
        title: "Chapitre 2 : Paramétrage du logiciel Sage Paie",
        points: ["Création de la base de données et configuration de l'établissement", "Création des constantes de calcul personnalisées", "Configuration et hiérarchisation des rubriques de gain et de retenue"]
      },
      {
        title: "Chapitre 3 : Gestion quotidienne et mensuelle",
        points: ["Création complète de la fiche de personnel (salariés)", "Gestion des absences, congés payés et maladie", "Préparation et calcul des bulletins de salaire individuels"]
      },
      {
        title: "Chapitre 4 : Clôture & Déclarations administratives",
        points: ["Édition du livre de paie et du journal de comptabilisation", "Impression des bulletins de paie et déclarations CNSS/VRS", "Gestion des soldes de tout compte et documents de fin de contrat"]
      }
    ]
  },
  "tableau-de-bord-avec-powerbi": {
    description: "Maîtrisez Microsoft PowerBI de A à Z. Apprenez à vous connecter à diverses sources de données, à transformer et modéliser des informations complexes avec PowerQuery et DAX, et à créer des tableaux de bord interactifs et esthétiques pour orienter les décisions managériales.",
    duration: "30 heures (100% pratique)",
    level: "Intermédiaire à Avancé",
    audience: ["Managers", "Contrôleurs de gestion", "Responsables de départements", "Analystes de données", "Consultants"],
    prerequisites: "Bonne maîtrise d'Excel (formules courantes). Aucun prérequis en programmation.",
    objectives: [
      "Importer et transformer des données de sources multiples avec PowerQuery",
      "Modéliser vos données (relations de table en schéma en étoile)",
      "Écrire des mesures et colonnes calculées avec le langage DAX",
      "Créer des visuels dynamiques, interactifs et des rapports prêts à être partagés"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Introduction et Collecte des données (PowerQuery)",
        points: ["Architecture globale de Power BI (Desktop, Service, Mobile)", "Connexions aux sources de données (Excel, Web, SQL)", "Nettoyage avancé : suppression des doublons, dépivoter, typage"]
      },
      {
        title: "Chapitre 2 : Modélisation des données & Relations",
        points: ["Principes de modélisation : schéma en étoile vs flocon", "Gestion des relations (actives, inactives, directionnalité)", "Création d'une table de calendrier dynamique"]
      },
      {
        title: "Chapitre 3 : Analyse de données avec le langage DAX",
        points: ["Syntaxe DAX fondamentale : colonnes calculées vs mesures", "Fonctions clés : CALCULATE, FILTER, ALL", "Introduction aux fonctions d'intelligence temporelle (YTD, Prior Year)"]
      },
      {
        title: "Chapitre 4 : Visualisation & Publication",
        points: ["Choix optimal des graphiques selon les indicateurs (KPI)", "Interactivité : filtres croisés, infobulles, drill-through", "Publication sur PowerBI Service et partage de rapports collaboratifs"]
      }
    ]
  },
  "community-management": {
    description: "Propulsez la visibilité de votre entreprise sur le web et les réseaux sociaux. Apprenez à élaborer une stratégie éditoriale, concevoir des visuels percutants avec Canva, et utiliser l'intelligence artificielle (ChatGPT) pour automatiser et optimiser votre communication au quotidien.",
    duration: "30 heures (100% pratique)",
    level: "Débutant à Intermédiaire",
    audience: ["Entrepreneurs", "Responsables de communication", "Community Managers débutants", "Étudiants en marketing"],
    prerequisites: "Usage courant des réseaux sociaux (Facebook, WhatsApp, Instagram).",
    objectives: [
      "Définir une stratégie éditoriale cohérente avec l'identité de marque",
      "Créer des plannings de publication efficaces (calendrier éditorial)",
      "Concevoir des contenus visuels professionnels de A à Z avec Canva",
      "Rédiger des posts captivants et engageants optimisés par ChatGPT"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Stratégie & Ligne éditoriale",
        points: ["Définir ses cibles (personas) et ses objectifs de communication", "Choix des canaux de communication adaptés au contexte guinéen", "Création et gestion de pages professionnelles (Facebook, Instagram, LinkedIn)"]
      },
      {
        title: "Chapitre 2 : Conception Graphique avec Canva",
        points: ["Maîtrise de l'interface Canva et création d'une charte graphique simple", "Design de posts statiques, de stories et de bannières", "Création de mini-vidéos animées (Reels/TikTok) engageantes"]
      },
      {
        title: "Chapitre 3 : Rédaction web et Intelligence Artificielle",
        points: ["Principes du copywriting : écrire des accroches irrésistibles", "Techniques d'utilisation de ChatGPT pour générer des idées et des rédactions", "Adaptation du ton selon le réseau social ciblé"]
      },
      {
        title: "Chapitre 4 : Modération, Publicité & Reporting",
        points: ["Gestion de la relation client sur WhatsApp Business et Messenger", "Introduction au gestionnaire de publicité Meta (Facebook Ads)", "Lecture des indicateurs de performance (portée, engagement) et rapports de résultats"]
      }
    ]
  },
  "montage-suivi-et-evaluation-des-projets": {
    description: "Maîtrisez la planification, l'exécution et l'évaluation continue des projets de développement et d'ingénierie. Cette formation unique vous initie à l'usage coordonné de MS Project pour la planification de tâches, de KoboCollect pour la collecte de données de terrain, et de SPSS pour l'analyse d'impact.",
    duration: "40 heures (100% pratique)",
    level: "Intermédiaire à Avancé",
    audience: ["Chefs de projets", "Coordonnateurs de programmes", "Chargés de suivi-évaluation", "Consultants", "Professionnels d'ONG"],
    prerequisites: "Notions de gestion de projet classique (cycle de vie de projet, cadre logique).",
    objectives: [
      "Concevoir un cadre logique et un système de suivi-évaluation complet",
      "Planifier un calendrier de tâches, de ressources et de coûts sous MS Project",
      "Créer des formulaires d'enquête numériques avec KoboToolbox et les déployer via KoboCollect",
      "Analyser les données quantitatives d'impact à l'aide de SPSS"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Fondations du Suivi-Évaluation & Cadre logique",
        points: ["Cycle de vie d'un projet et théorie du changement", "Conception des indicateurs SMART et de la matrice de cadre logique", "Mise en place d'un plan de suivi des indicateurs (performance)"]
      },
      {
        title: "Chapitre 2 : Planification de projet avec MS Project",
        points: ["Saisie des tâches, durées et liaisons de dépendance", "Attribution des ressources humaines et matérielles aux tâches", "Suivi de la courbe des coûts, gestion du chemin critique et du diagramme de Gantt"]
      },
      {
        title: "Chapitre 3 : Collecte Mobile des données avec KoboToolbox",
        points: ["Création de formulaires complexes avec sauts logiques et contrôles de saisie", "Déploiement sur mobile (KoboCollect) pour enquêtes hors ligne sur le terrain", "Gestion des soumissions de formulaires et exportations des données"]
      },
      {
        title: "Chapitre 4 : Analyse Statistique des résultats avec SPSS",
        points: ["Importation des données collectées et codage des variables", "Statistiques descriptives de base (fréquences, moyennes, croisements)", "Interprétation des résultats et rédaction de rapports de suivi-évaluation"]
      }
    ]
  }
};

// === FALLBACK GENERATOR FOR OTHERS ===
const generateFallbackDetails = (title: string, category: string, outils: string[]): ModuleDetail => {
  return {
    description: `Développez vos compétences en ${title} au sein du cabinet Cabinet Guilogtrans. Ce programme 100% pratique et encadré par des experts est conçu pour répondre précisément aux besoins opérationnels du marché du travail actuel.`,
    duration: "30 heures (100% pratique)",
    level: "Débutant à Avancé",
    audience: ["Professionnels du secteur privé et public", "Diplômés souhaitant booster leur employabilité", "Entrepreneurs"],
    prerequisites: "Connaissances générales liées au domaine d'activité.",
    objectives: [
      `Maîtriser les concepts clés et méthodologies de : ${title}`,
      `Devenir autonome sur l'usage des techniques recommandées dans le domaine de la ${category}`,
      outilLabel(outils) ? `Manipuler avec aisance les outils : ${outils.join(", ")}` : "Mettre en œuvre des plans d'action professionnels",
      "Mettre en pratique immédiatement à travers des projets réels et des cas pratiques d'entreprise"
    ],
    syllabus: [
      {
        title: "Chapitre 1 : Introduction et Fondamentaux",
        points: ["Introduction aux concepts clés du domaine", "Analyse du contexte professionnel et des exigences métiers", "Mise en place des outils de travail"]
      },
      {
        title: "Chapitre 2 : Méthodologies & Outils Spécifiques",
        points: [
          `Application des principes essentiels liés au domaine : ${category}`,
          outilLabel(outils) ? `Prise en main guidée des outils : ${outils.join(", ")}` : "Développement de compétences techniques clés",
          "Exercices de mise en situation concrète"
        ]
      },
      {
        title: "Chapitre 3 : Cas Pratiques & Projets Métiers",
        points: ["Résolution de problématiques types d'entreprise", "Création de documents opérationnels ou de modèles d'analyse", "Optimisation des processus et flux de travail"]
      },
      {
        title: "Chapitre 4 : Bilan, Recommandations et Perspectives",
        points: ["Présentation des travaux pratiques et validation des acquis", "Conseils pour intégrer ces nouvelles compétences dans votre quotidien", "Procédures d'examen et attribution des attestations Guilogtrans"]
      }
    ]
  };
};

const outilLabel = (outils: string[]) => outils && outils.length > 0;

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormations = async () => {
      await db.init();
      setFormations(await db.getFormations());
      setLoading(false);
    };
    loadFormations();
  }, []);

  const slug = params.slug as string;

  // Find module matching slug
  let activeModule: any = null;
  let activeCategory: string = "";

  if (!loading && formations.length > 0) {
    for (const cat of formations) {
      const match = cat.modules.find((mod: any) => generateSlug(mod.titre) === slug);
      if (match) {
        activeModule = match;
        activeCategory = cat.categorie;
        break;
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-gray)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeModule) {
    return (
      <div className="min-h-screen bg-[var(--color-gray)] py-24 flex flex-col items-center justify-center px-4">
        <HelpCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Formation non trouvée</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Le module de formation que vous recherchez n'existe pas ou a été déplacé.</p>
        <Link 
          href="/formations"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux formations
        </Link>
      </div>
    );
  }

  // Get details — dynamic from admin, with fallbacks
  const d = activeModule.details;
  const fallback = moduleDetailsRegistry[slug] || generateFallbackDetails(activeModule.titre, activeCategory, activeModule.outils);

  const details = {
    description: d?.presentation || fallback.description,
    duration: d?.duree || fallback.duration,
    dateDebut: d?.dateDebut || null,
    calendrier: d?.calendrier || null,
    horaires: d?.horaires || null,
    level: fallback.level,
    statutInscription: d?.statutInscription || "Ouverte",
    objectives: d?.objectifs || fallback.objectives,
    prerequis: d?.prerequis || (fallback.prerequis || [fallback.prerequisites]),
    publicCible: d?.publicCible || fallback.audience,
    syllabus: d?.programme || fallback.syllabus,
    debouches: d?.debouches || [],
    planning: d?.planning || null,
  };

  // Prefilled links
  const inscriptionUrl = `/inscription?domain=${encodeURIComponent(activeCategory)}&module=${encodeURIComponent(activeModule.titre)}`;
  const whatsappUrl = `https://wa.me/224626625162?text=${encodeURIComponent(
    `Bonjour Cabinet Guilogtrans, je souhaiterais obtenir des informations concernant la formation : "${activeModule.titre}" (Catégorie : ${activeCategory}).`
  )}`;

  return (
    <>
      {/* Dynamic Header */}
      <section className="bg-[var(--color-primary)] py-16 relative overflow-hidden text-white">
        {/* Background — custom image if set, else subtle pattern */}
        {activeModule.image ? (
          <div className="absolute inset-0 overflow-hidden">
            <img src={activeModule.image} alt={activeModule.titre} className="w-full h-full object-cover opacity-20" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute w-96 h-96 bg-[var(--color-accent)] opacity-10 rounded-full blur-3xl -top-20 -left-20" />
          </>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-6">
            <Link 
              href="/formations" 
              className="inline-flex items-center text-xs font-bold text-[var(--color-accent)] hover:text-white uppercase tracking-widest transition-colors gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour au catalogue
            </Link>
          </div>
          
          <div className="flex items-center text-xs font-bold uppercase tracking-widest text-[var(--color-light)] mb-3 gap-2">
            <span>{activeCategory}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Détails du module</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6 leading-tight max-w-4xl">
            {activeModule.titre}
          </h1>

          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-none border border-white/15">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{details.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-none border border-white/15">
              <Award className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Attestation officielle Guilogtrans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <section className="py-20 bg-[var(--color-gray)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Content (2 cols) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card 1: Overview */}
              <div className="bg-white border border-gray-200 p-8">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
                  Présentation du module
                </h2>
                <p className="text-gray-600 leading-relaxed font-sans text-base">
                  {details.description}
                </p>

                {activeModule.outils && activeModule.outils.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Outils techniques abordés :</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeModule.outils.map((outil: string, index: number) => (
                        <div 
                          key={index}
                          className="px-3 py-1.5 bg-[var(--color-gray)] border border-gray-200 text-gray-700 font-medium text-xs flex items-center gap-1.5"
                        >
                          <Laptop className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                          {outil}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Objectives */}
              <div className="bg-white border border-gray-200 p-8">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)]" />
                  Objectifs pédagogiques
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-5">À l'issue de cette formation, l'apprenant sera en mesure de :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.objectives.map((obj: string, index: number) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm font-sans leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Syllabus / Program */}
              <div className="bg-white border border-gray-200 p-8">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                  Programme de formation détaillé
                </h2>
                
                <div className="space-y-6">
                  {details.syllabus.map((chapter: { title: string; points: string[] }, cIndex: number) => (
                    <div key={cIndex} className="border border-gray-150 p-5 bg-gray-50 hover:bg-white transition-colors duration-200">
                      <h3 className="font-heading font-bold text-sm text-gray-900 mb-3 flex items-center gap-3">
                        <span className="w-6 h-6 rounded-none bg-[var(--color-accent)] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                          0{cIndex + 1}
                        </span>
                        {chapter.title}
                      </h3>
                      <ul className="space-y-2 pl-9">
                        {chapter.points.map((point: string, pIndex: number) => (
                          <li key={pIndex} className="text-gray-600 text-xs font-sans list-disc marker:text-[var(--color-accent)] leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar (1 col) */}
            <div className="space-y-6 lg:sticky lg:top-28">
              
              {/* Technical features Card */}
              <div className="bg-white border border-gray-200 overflow-hidden">

                {/* Prix block — prominent, top of card */}
                {(activeModule.prix !== undefined || activeModule.prixInscription !== undefined || activeModule.methodePaiement) && (
                  <div className="bg-[#1A3A6E] p-6 text-white">
                    {activeModule.prix !== undefined ? (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Coût de la formation</p>
                        <div className="text-3xl font-heading font-bold text-white leading-none">
                          {activeModule.prix.toLocaleString('fr-GN')}
                          <span className="text-sm font-bold ml-1 text-white/70">GNF</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-heading font-bold text-white/80 mb-4">Tarif sur demande</div>
                    )}
                    
                    {activeModule.prixInscription !== undefined && (
                      <div className="mb-4 bg-white/5 p-3 border-l-2 border-[#f0b429]">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">Frais d'inscription</p>
                        <div className="text-lg font-bold text-white leading-none">
                          {activeModule.prixInscription.toLocaleString('fr-GN')}
                          <span className="text-[10px] font-bold ml-1 text-white/70">GNF</span>
                        </div>
                      </div>
                    )}

                    {activeModule.methodePaiement && (
                      <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Paiement :</span>
                        <span className="text-[10px] font-bold text-[#f0b429] uppercase tracking-wider">{activeModule.methodePaiement}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-5 border-b border-gray-100 pb-3">Fiche technique</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                      <span className="text-gray-400 font-medium">Durée</span>
                      <span className="font-bold text-gray-900">{details.duration.split(" (")[0]}</span>
                    </div>
                    {details.dateDebut && (
                      <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                        <span className="text-gray-400 font-medium">Début</span>
                        <span className="font-bold text-[var(--color-accent)]">{details.dateDebut}</span>
                      </div>
                    )}
                    {details.planning && details.planning.length > 0 ? (
                      <div className="border-b border-gray-50 py-2">
                        <span className="text-gray-400 font-medium block text-xs mb-1">Planning</span>
                        <div className="space-y-1 pl-2 border-l-2 border-[var(--color-accent)]">
                          {details.planning.map((p: { jour: string; horaire: string }, i: number) => (
                            <div key={i} className="flex justify-between text-[11px]">
                              <span className="font-semibold text-gray-900">{p.jour}</span>
                              <span className="text-gray-600">{p.horaire}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {details.calendrier && (
                          <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                            <span className="text-gray-400 font-medium">Jours</span>
                            <span className="font-bold text-gray-900">{details.calendrier}</span>
                          </div>
                        )}
                        {details.horaires && (
                          <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                            <span className="text-gray-400 font-medium">Horaires</span>
                            <span className="font-bold text-gray-900">{details.horaires}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                      <span className="text-gray-400 font-medium">Niveau requis</span>
                      <span className="font-bold text-gray-900">{details.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                      <span className="text-gray-400 font-medium">Modalité</span>
                      <span className="font-bold text-gray-900">100% Pratique</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2">
                      <span className="text-gray-400 font-medium">Certification</span>
                      <span className="font-bold text-emerald-600">Attestation officielle</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {details.statutInscription === "Ouverte" ? (
                      <Link 
                        href={inscriptionUrl}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#8B0000] hover:bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        S'inscrire à ce module
                        <Send className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-300 text-gray-500 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
                      >
                        Inscriptions fermées
                      </button>
                    )}

                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      Conseils par WhatsApp
                    </a>
                  </div>
                </div>
              </div>


              {/* Target Audience Card */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-accent)]" />
                  Public Cible
                </h3>
                <ul className="space-y-2">
                  {details.publicCible.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-xs text-gray-600 font-sans">
                      <span className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-none flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                
                {details.prerequis && details.prerequis.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mt-6 mb-3 border-b border-gray-100 pb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[var(--color-accent)]" />
                      Prérequis
                    </h3>
                    <div className="space-y-2">
                      {details.prerequis.map((req: string, index: number) => (
                        <p key={index} className="text-gray-500 text-xs leading-relaxed font-sans italic">
                          {req}
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {details.debouches && details.debouches.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mt-6 mb-3 border-b border-gray-100 pb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[var(--color-accent)]" />
                      Débouchés professionnels
                    </h3>
                    <ul className="space-y-2">
                      {details.debouches.map((job: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-gray-600 font-sans">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none flex-shrink-0" />
                          {job}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>
    </>
  );
}
