
CABINET GUILOGTRANS
Conseil · Étude · Formation en Logistique & Transport

CAHIER DES CHARGES
Conception et Développement du Site Web Institutionnel

Maître d'ouvrage	Cabinet Guilogtrans — Conakry, Guinée
Maître d'œuvre	Trivox360 / Nekomat — Agence Digitale
Type de document	Cahier des Charges Fonctionnel & Technique
Date d'émission	Juin 2026
Version	V1.0
Statut	Document de référence — Soumis au client
 
1. Présentation du Client

Le Cabinet Guilogtrans est un cabinet de conseil, d'étude et de formation spécialisé dans le domaine de la logistique et du transport, fondé en 2021 et basé à Conakry, en République de Guinée. Il s'adresse aux entreprises, institutions et professionnels souhaitant optimiser leurs opérations logistiques et renforcer les compétences de leurs équipes.

1.1 Activités principales
•	Conseil en logistique : optimisation des flux, gestion des entrepôts, planification des transports, réduction des coûts
•	Études et audit logistique : analyse des processus existants, recommandations stratégiques
•	Formation professionnelle : gestion des stocks, réglementation du transport, gestion des risques, optimisation des routes

1.2 Positionnement
Guilogtrans se positionne comme le premier cabinet spécialisé en logistique et transport en Guinée, combinant expertise sectorielle et pédagogie interactive. Sa valeur différenciante repose sur une approche personnalisée, des formateurs expérimentés et une connaissance approfondie du marché local et régional ouest-africain.

 
2. Contexte & Objectifs du Projet

À ce jour, le Cabinet Guilogtrans dispose d'une présence numérique limitée (page Facebook). L'absence d'un site web professionnel constitue un frein à la crédibilité institutionnelle, à la visibilité auprès des entreprises cibles et à la conversion des prospects en clients ou apprenants.

2.1 Objectifs stratégiques
•	Asseoir la crédibilité et la légitimité du cabinet sur le marché guinéen et sous-régional
•	Générer des leads qualifiés : entreprises cherchant des services de conseil, particuliers et professionnels souhaitant se former
•	Faciliter l'accès à l'information sur les formations (programmes, calendrier, tarifs, inscription)
•	Proposer un canal de contact et de prise en charge des demandes en ligne
•	Renforcer l'image de marque avec un design professionnel et institutionnel

2.2 Périmètre du projet
Livrable principal	Site web institutionnel multipage
Technologies	Next.js 14 (App Router), Tailwind CSS, TypeScript
Hébergement	Vercel (déploiement continu)
Nom de domaine	guilogtrans.com (ou guilogtrans.gn si disponible)
Langues	Français (langue principale)
Responsive	Oui — mobile-first

 
3. Cibles & Personas

3.1 Personas prioritaires

Persona	Profil	Besoin
Dirigeant d'entreprise	PME import/export, mines, BTP — cherche à optimiser sa chaîne logistique	Conseil stratégique, audit, accompagnement
Responsable RH / Formation	Grandes entreprises ou ONG souhaitant former leurs équipes	Catalogue de formations, devis, planning
Professionnel individuel	Logisticien, transitaire, chauffeur, gestionnaire souhaitant se certifier	Inscription en ligne, programme détaillé, tarifs
Partenaire institutionnel	Ministères, ONG, bailleurs de fonds	Présentation institutionnelle, références, contact

 
4. Architecture du Site & Arborescence

Le site sera structuré autour de 6 pages principales, accessibles depuis une navigation fixe (sticky header). L'architecture est pensée pour la clarté de lecture et la conversion.

N°	Page	Contenu clé
1	Accueil (Home)	Hero section, accroche forte, services en vignettes, chiffres clés, CTA inscription/contact, témoignages, partenaires
2	À propos	Historique, mission, vision, valeurs, équipe dirigeante, inauguration (galerie)
3	Nos Services	3 piliers : Conseil, Étude, Formation — descriptif de chaque service + CTA devis
4	Formations	Catalogue complet : programmes, durées, prochaines sessions, tarifs, formulaire d'inscription
5	Actualités / Blog	Articles, annonces de sessions, communiqués de presse — SEO local
6	Contact	Formulaire de contact, carte Google Maps, coordonnées, WhatsApp direct

 
5. Spécifications Fonctionnelles

5.1 Module Accueil
•	Hero section avec accroche principale et double CTA : « Découvrir nos formations » / « Demander un devis »
•	Section chiffres clés : Années d'expérience, formations dispensées, entreprises accompagnées, apprenants formés
•	Présentation des 3 piliers de service sous forme de cartes animées
•	Bloc témoignages clients avec photo et fonction
•	Section partenaires / logos clients défilants
•	Bandeau d'appel à l'action final avant le footer

5.2 Module Formations
•	Catalogue filtrable par catégorie (gestion des stocks, transport, supply chain, douane...)
•	Fiche formation : intitulé, objectifs, public cible, durée, prochaine session, tarif, formateur
•	Formulaire d'inscription en ligne avec validation côté client
•	Téléchargement du programme (PDF) par formation
•	Intégration d'un calendrier de sessions à venir

5.3 Module Contact & Leads
•	Formulaire multi-champs : nom, email, téléphone, organisation, type de demande (conseil / formation / autre), message
•	Envoi automatique d'un email de confirmation à l'utilisateur
•	Notification email au cabinet à chaque nouvelle demande
•	Bouton WhatsApp flottant (fixe en bas à droite sur toutes les pages)
•	Intégration Google Maps avec localisation du cabinet

5.4 Module Actualités
•	Blog CMS avec création, modification et suppression d'articles depuis l'interface admin
•	Catégories d'articles : Session de formation, Actualité logistique, Partenariat, Événement
•	Partage réseaux sociaux sur chaque article
•	Optimisation SEO automatique par article (meta title, description, OpenGraph)

5.5 Espace Administration
•	Interface back-office sécurisée par authentification (email + mot de passe)
•	Gestion des formations : ajout, modification, suppression, activation/désactivation
•	Gestion des articles de blog
•	Consultation des demandes de contact reçues
•	Export des inscriptions (CSV/Excel)

 
6. Spécifications Techniques

6.1 Stack technologique
Frontend	Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend / API	Next.js API Routes + Prisma ORM
Base de données	PostgreSQL (Supabase)
Authentification admin	NextAuth.js (credentials)
Emails transactionnels	Resend ou Nodemailer (SMTP Gmail)
CMS Blog	Sanity.io ou intégré custom (base de données)
Hébergement	Vercel (frontend) + Supabase (BDD)
Stockage fichiers (PDF)	Supabase Storage ou Cloudflare R2
Analytics	Google Analytics 4 + Vercel Analytics
SEO	next-seo + sitemap.xml + robots.txt automatiques

6.2 Performance & Accessibilité
•	Score Lighthouse ≥ 90 sur les 4 axes (Performance, Accessibilité, Bonnes pratiques, SEO)
•	Chargement initial < 3 secondes sur connexion 4G standard
•	Images optimisées via next/image (WebP automatique, lazy loading)
•	Conformité WCAG 2.1 niveau AA — navigation clavier, contraste, alt-text
•	Compatibilité navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)

6.3 Sécurité
•	HTTPS obligatoire (certificat SSL via Vercel)
•	Protection CSRF sur tous les formulaires
•	Sanitisation des entrées utilisateur côté serveur
•	Rate limiting sur les endpoints d'API (anti-spam, anti-brute force)
•	Variables d'environnement sécurisées (aucune clé en dur dans le code)

6.4 SEO Local & Référencement
•	Optimisation pour les mots-clés : formation logistique Guinée, cabinet logistique Conakry, transport Guinée formation
•	Fiche Google My Business liée au site
•	Données structurées Schema.org (Organization, Course, LocalBusiness)
•	Open Graph et Twitter Card sur toutes les pages
•	Sitemap XML soumis à Google Search Console

 
7. Design & Charte Graphique

7.1 Identité visuelle
Le design devra refléter le sérieux, l'expertise et le dynamisme du Cabinet Guilogtrans. Le ton visuel est celui d'un cabinet professionnel africain moderne : sobre, élégant, avec une identité forte.

Élément	Valeur	Usage
Couleur principale	#1A2F5E — Bleu Marine	Header, titres, CTA principaux
Couleur secondaire	#2E75B6 — Bleu Institutionnel	Accents, séparateurs, hover
Couleur d'accent	#F5A623 — Or/Ambre	CTA secondaires, badges, prix
Fond	#F2F5F9 — Gris Clair	Sections alternées, cartes
Typographie titres	Inter Bold / Poppins Bold	Toutes les sections
Typographie corps	Inter Regular 16px	Paragraphes, labels

7.2 Composants UI
•	Header fixe (sticky) avec logo, navigation principale et bouton CTA « Contact »
•	Footer complet : liens rapides, réseaux sociaux, coordonnées, copyright
•	Cartes de service avec icône, titre et description + animation au survol
•	Cartes de formation avec badge catégorie, durée, tarif et bouton inscription
•	Section héros avec fond image ou dégradé, titre grand format et sous-titre
•	Bouton WhatsApp flottant persistant (#25D366)
•	Indicateur de chargement de page (progress bar top)

 
8. Livrables & Jalons

Phase	Livrable	Détail	Délai estimé
1	Maquettes UI/UX	Figma — Desktop + Mobile (3 pages clés : Accueil, Formations, Contact)	J+7
2	Intégration frontend	Next.js — toutes pages statiques avec Tailwind CSS	J+21
3	Backend & BDD	API Routes, formulaires, espace admin, gestion formations/blog	J+35
4	Contenu & SEO	Intégration du contenu client, optimisation SEO, Analytics	J+42
5	Tests & Recette	Tests multi-navigateurs, QA, corrections, rapport Lighthouse	J+49
6	Mise en production	Déploiement Vercel, nom de domaine, SSL, formation à l'admin	J+56

Durée totale estimée : 8 semaines à compter de la signature du bon de commande et de la remise complète des contenus (textes, photos, logo) par le client.

 
9. Contenu à Fournir par le Client

La qualité et la rapidité de livraison du site dépendent directement de la mise à disposition des éléments de contenu par le Cabinet Guilogtrans. Les éléments suivants devront être fournis avant le démarrage de la Phase 2.

9.1 Éléments obligatoires
•	Logo en haute définition (SVG ou PNG fond transparent, 300 dpi minimum)
•	Photos de l'équipe dirigeante (portrait professionnel fond neutre)
•	Photos des sessions de formation (haute résolution)
•	Photos des locaux / salle de formation
•	Textes de présentation : mission, vision, valeurs, historique
•	Catalogue complet des formations : intitulés, programmes, objectifs, durées, tarifs
•	Coordonnées exactes (adresse, téléphone, email professionnel, liens réseaux)
•	Au moins 3 témoignages clients avec nom, fonction, entreprise (et photo si possible)

9.2 Éléments souhaitables
•	Logo des partenaires ou clients de référence
•	Vidéo de présentation ou de l'inauguration
•	Plaquette ou brochure existante (PDF)
•	Charte graphique existante si disponible

 
10. Estimation Budgétaire

Les tarifs ci-dessous sont indicatifs et feront l'objet d'un devis définitif après validation du présent cahier des charges.

Poste	Estimation (GNF)	Estimation (USD)
Design UI/UX (Figma — Desktop + Mobile)	15 000 000	1 700
Développement Frontend (Next.js + Tailwind)	25 000 000	2 800
Développement Backend & Espace Admin	20 000 000	2 250
Intégration Contenu & SEO	8 000 000	900
Tests, QA & Mise en production	5 000 000	560
Nom de domaine (1 an)	900 000	100
Hébergement Vercel Pro (1 an)	1 800 000	200
TOTAL ESTIMATIF	75 700 000 GNF	8 510 USD

Modalités de paiement proposées : 40% à la signature — 30% à la livraison des maquettes validées — 30% à la mise en production.

Note : La maintenance mensuelle (mises à jour, corrections, hébergement) fera l'objet d'un contrat de support optionnel à partir de 1 500 000 GNF / mois.

 
11. Conditions Générales & Responsabilités

11.1 Responsabilités du maître d'œuvre (Trivox360 / Nekomat)
•	Livraison des maquettes et du site dans les délais convenus
•	Respect des spécifications du présent cahier des charges
•	Support technique pendant 30 jours après la mise en production
•	Formation à l'utilisation de l'espace administration
•	Remise des accès et codes sources à la fin du projet

11.2 Responsabilités du client (Cabinet Guilogtrans)
•	Fourniture des contenus dans les délais convenus (avant J+14)
•	Validation ou retour motivé sur chaque livrable sous 5 jours ouvrés
•	Désignation d'un interlocuteur unique pour la gestion du projet
•	Règlement des factures dans les délais convenus

11.3 Propriété intellectuelle
À la réception du paiement intégral, le Cabinet Guilogtrans devient propriétaire de l'ensemble du code source, des maquettes et des contenus produits dans le cadre de ce projet. Les bibliothèques open-source utilisées restent soumises à leurs licences respectives.

11.4 Confidentialité
Les deux parties s'engagent à traiter avec confidentialité toutes les informations échangées dans le cadre du projet. Le maître d'œuvre ne pourra utiliser le projet comme référence publique qu'avec l'accord explicite du Cabinet Guilogtrans.

 
12. Validation & Signatures

Le présent cahier des charges annule et remplace tout document antérieur. Il constitue la base contractuelle du projet dès signature des deux parties.


Maître d'ouvrage — Cabinet Guilogtrans	Maître d'œuvre — Trivox360 / Nekomat
Nom & Prénom : ________________________________
Fonction : ________________________________
Date : ________________________________
Signature :
	Nom & Prénom : ________________________________
Fonction : ________________________________
Date : ________________________________
Signature :



— Document produit par Trivox360 / Nekomat — Conakry, Guinée — Juin 2026 —
