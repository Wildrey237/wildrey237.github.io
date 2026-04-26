# Portfolio – Wilfried Bemelingue

![Build and Deploy](https://github.com/Wildrey237/wildrey237.github.io/actions/workflows/deploy.yml/badge.svg)

Portfolio personnel développé en **React + Vite**, stylisé avec **Chakra UI**, bilingue français/anglais avec détection automatique de la langue.

**URL :** [https://wildrey237.github.io/](https://wildrey237.github.io/)

---

## Sommaire

1. [Prérequis](#prérequis)
2. [Structure du projet](#structure-du-projet)
3. [Organisation des branches](#organisation-des-branches)
4. [Fonctionnalités](#fonctionnalités)
5. [Technologies](#technologies)
6. [Développement local](#développement-local)
7. [Déploiement](#déploiement)
8. [Analytics](#analytics)
9. [Contact](#contact)

---

## Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Git

---

## Structure du projet

```
src/
├── main.jsx              # Point d'entrée React
├── App.jsx               # Assemblage des sections + ScrollToTopButton
├── i18n.js               # Configuration i18next FR/EN
├── components/
│   ├── Navbar.jsx         # Navigation fixe, pill animée, menu mobile
│   ├── ProfileSection.jsx # Hero : badge disponibilité, typewriter, email copier
│   ├── SkillsSection.jsx  # Chips colorées par catégorie avec tooltips
│   ├── ExperienceSection.jsx # Timeline : border couleur, initiales, ville, site
│   ├── EducationSection.jsx  # Cartes : logo, badge "En cours", détails collapsibles
│   ├── ProjectsSection.jsx   # Carrousel 4 cartes, auto-scroll, filtres, shimmer
│   ├── Footer.jsx
│   └── LogoMark.jsx
└── data/
    ├── data-fr.json       # Contenu français
    └── data-en.json       # Contenu anglais (structure identique)

public/
├── icon.svg              # Favicon <W/B>
└── 404.html              # Page 404 custom avec redirection automatique
```

---

## Organisation des branches

- **`work`** — code source (tout le développement se fait ici)
- **`main`** — build `dist/` uniquement, servi par GitHub Pages

Ne jamais committer de code source sur `main`. Le déploiement est entièrement automatisé.

---

## Fonctionnalités

### ProfileSection
- Badge vert pulsant « Disponible pour de nouvelles opportunités »
- Nom statique + effet typewriter sur les rôles (`typewriter_roles`)
- Email cliquable → copie dans le presse-papier + toast de confirmation
- Photo de profil ou logo de fallback

### SkillsSection
- Chips colorées par catégorie (IA, Data Engineering, Software, Cloud/MLOps, Bases de données, Maths)
- Tooltip au survol avec description de chaque compétence

### ExperienceSection
- Bordure gauche colorée tournante par expérience
- Cercle avec initiales de l'entreprise
- Ville (icône lieu) et lien vers le site de l'entreprise
- Descriptions formatées : paragraphes et listes à puces (`\n\n` / `\n•`)

### EducationSection
- Cartes larges avec logo de l'établissement
- Badge « En cours » (champ `current: true` dans le JSON)
- Détails collapsibles (Chakra `Collapse`)

### ProjectsSection
- Carrousel avec 4 cartes sur desktop, 2 sur tablet, 1 sur mobile
- Défilement automatique toutes les 3,5 s (pause au survol)
- Navigation clavier (← →) et boutons précédent/suivant
- Filtres : recherche texte, école, tag technologique
- Effet shimmer au survol des cartes

### Navbar
- Pill animée Framer Motion (`layoutId`) sur la section active
- Icône dark mode avec rotation +180° à chaque clic
- Menu mobile avec animation slide-in

### Autres
- Bouton scroll-to-top (apparaît après 300 px de défilement)
- Page 404 thématique avec redirection automatique vers `/` après 4 s
- SEO : Open Graph + Twitter Card + meta description optimisés

---

## Technologies

| Domaine | Stack |
|---|---|
| Frontend | React 18, Vite |
| UI | Chakra UI v2 |
| Animations | Framer Motion |
| i18n | i18next + browser-languagedetector |
| Typewriter | react-simple-typewriter |
| Icônes | react-icons |
| Analytics | Google Analytics 4 (GA4) |
| Déploiement | GitHub Pages + GitHub Actions |

---

## Développement local

```bash
git clone https://github.com/Wildrey237/wildrey237.github.io.git
cd wildrey237.github.io
git checkout work
npm install
npm run dev
```

Autres commandes :

```bash
npm run build     # Build de production → dist/
npm run preview   # Prévisualiser le build
npm run lint      # ESLint
```

---

## Déploiement

Chaque push sur la branche `work` déclenche automatiquement `.github/workflows/deploy.yml` :

1. `npm run build` génère `dist/`
2. Le contenu de `dist/` est poussé sur `main` via JamesIves deploy action
3. GitHub Pages sert `main`

Suivre l'avancement dans l'onglet **Actions** du dépôt.

### Mettre à jour le contenu

Modifier `src/data/data-fr.json` et `src/data/data-en.json` (toujours garder les deux fichiers en sync), puis :

```bash
git add src/data/
git commit -m "Update content"
git push origin work
```

---

## Analytics

GA4 (ID : `G-QSFT7C8DBJ`) intégré dans `index.html`. Événement personnalisé `download_cv` déclenché depuis `Footer.jsx` au clic sur le bouton de téléchargement.

---

## Contact

- **LinkedIn :** [wilfried-bemelingue](https://linkedin.com/in/wilfried-bemelingue)
- **GitHub :** [Wildrey237](https://github.com/Wildrey237)

---

© Wilfried Bemelingue — Tous droits réservés.
