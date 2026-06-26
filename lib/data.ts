export const formationsData = [
  {
    image: "/images/programmes/bureautique.jpg",
    categorie: "Informatique Bureautique",
    modules: [
      { titre: "Initiation Bureautique", outils: ["Windows", "Word", "Excel", "PowerPoint"] },
      { titre: "Excel Avancé", outils: ["Microsoft Excel"] }
    ]
  },
  {
    image: "/images/programmes/Gestion.jpg",
    categorie: "Gestion",
    modules: [
      { titre: "Gestion Comptable", outils: ["Sage Comptabilité", "Excel"] },
      { titre: "Gestion Commerciale", outils: ["Sage Gestion Commerciale", "Excel"] },
      { titre: "Gestion de la Paie", outils: ["Sage Paie et RH", "Excel"] },
      { titre: "Management RH – Auditeur Social", outils: ["Sage Paie et RH", "Excel"] },
      { titre: "Responsable Administratif et Financier", outils: ["Excel"] }
    ]
  },
  {
    image: "/images/programmes/logistique.jpg",
    categorie: "Logistique et Transport",
    modules: [
      { titre: "Responsable Logistique", outils: ["Excel"] },
      { titre: "Responsable Achat et Approvisionnement", outils: ["Excel"] },
      { titre: "Gestionnaire de Stock", outils: ["Excel"] },
      { titre: "Logistique Minière", outils: ["Excel"] }
    ]
  },
  {
    image: "/images/programmes/qhse.jpg",
    categorie: "QHSE",
    modules: [
      { titre: "Superviseur HSE", outils: [] }
    ]
  },
  {
    image: "/images/programmes/analyse.jpg",
    categorie: "Analyse des Données",
    modules: [
      { titre: "Tableau de bord avec Excel", outils: ["Excel", "PowerPivot", "PowerQuery"] },
      { titre: "Tableau de bord avec PowerBI", outils: ["PowerBI Desktop", "PowerBI Services", "PowerBI Mobile", "PowerPivot", "PowerQuery"] },
      { titre: "Collecte et Analyse des Données", outils: ["KoboCollect", "KoboToolbox"] }
    ]
  },
  {
    image: "/images/programmes/communication.jpg",
    categorie: "Communication Digitale",
    modules: [
      { titre: "Community Management", outils: ["Facebook", "WhatsApp Business", "Canva", "ChatGPT"] },
      { titre: "Marketing Digital", outils: ["Facebook", "Instagram", "LinkedIn", "Wix", "Email Marketing", "Canva", "Filmora"] },
      { titre: "Communication Institutionnelle", outils: [] }
    ]
  },
  {
    image: "/images/infographie.png",
    categorie: "Infographie",
    modules: [
      { titre: "Conception de Visuels", outils: ["Adobe Photoshop", "Adobe Illustrator"] }
    ]
  },
  {
    image: "/images/suivi-evaluation.png",
    categorie: "Suivi-Évaluation de Projets",
    modules: [
      { titre: "Montage Suivi et Évaluation des Projets", outils: ["MS Project", "KoboCollect", "SPSS"] }
    ]
  }
];

export const statsData = [
  { value: "1200+", label: "Apprenants formés" },
  { value: "8", label: "Domaines de formation" },
  { value: "10+", label: "Experts formateurs" },
  { value: "95%", label: "De satisfaction" }
];

export const testimonialsData = [
  {
    name: "Amadou Diallo",
    role: "Responsable Logistique",
    initials: "AD",
    color: "bg-blue-100 text-blue-800",
    text: "La formation en Logistique m'a permis d'optimiser les flux de mon entreprise. Les formateurs sont des experts de terrain.",
    rating: 5
  },
  {
    name: "Fatoumata Camara",
    role: "Comptable",
    initials: "FC",
    color: "bg-amber-100 text-amber-800",
    text: "Excellente formation sur Sage Comptabilité. J'ai pu mettre en pratique immédiatement ce que j'ai appris.",
    rating: 5
  },
  {
    name: "Mamadou Barry",
    role: "Entrepreneur",
    initials: "MB",
    color: "bg-green-100 text-green-800",
    text: "L'accompagnement de CFIG pour notre transformation digitale a été un vrai succès.",
    rating: 4
  }
];

export const teamData = [
  {
    name: "Mamadou cellou Diallo",
    role: "Consultant-Formateur",
    initials: "MD",
    image: "/images/cellou.jpeg",
    linkedin: "#",
    zoom: 1.8,
    offsetX: "20px",
    offsetY: "-20px"
  },
  {
    name: "Ousmane Diallo",
    role: "Responsable pédagogique-Formateur",
    initials: "OD",
    image: "/images/ousmane.jpeg",
    linkedin: "#"
  },
  {
    name: "Adama Bah",
    role: "Responsable Commerciale et Finances",
    initials: "AB",
    image: "/images/adama.jpeg",
    linkedin: "#"
  },
  {
    name: "Mohamed Bangoura",
    role: "Infographe-Formateur",
    initials: "MB",
    image: "/images/mohamed.jpeg",
    linkedin: "#"
  }
];

export const servicesData = [
  {
    title: "Formation Professionnelle",
    description: "Des programmes adaptés aux besoins réels des entreprises pour monter en compétences.",
    icon: "GraduationCap"
  },
  {
    title: "Consulting Stratégique",
    description: "Accompagnement sur mesure pour optimiser vos processus et votre organisation.",
    icon: "Briefcase"
  },
  {
    title: "Implémentation Logicielles",
    description: "Déploiement et paramétrage de solutions comme Sage, PowerBI.",
    icon: "Laptop"
  },
  {
    title: "Support Continu",
    description: "Un suivi post-formation ou post-déploiement pour garantir votre succès.",
    icon: "LifeBuoy"
  }
];
