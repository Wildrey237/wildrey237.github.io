# Architecture — Portfolio Wilfried Bemelingue

> Source de vérité technique du projet. Philosophie, structure, responsabilités des dossiers et règles à respecter.

---

## 1. Philosophie générale

Ce portfolio est un SPA statique bilingue (FR/EN), déployé sur GitHub Pages. Il doit rester simple à maintenir, facile à mettre à jour via les fichiers JSON, et suffisamment structuré pour qu'un nouveau contributeur comprenne l'organisation sans explication orale.

Le projet ne cherche pas à devenir un CMS ni un framework. La bonne architecture est volontairement sobre :

- Pages et sections déclarées dans `App.jsx`
- Composants UI isolés dans `src/components/`
- Tout le contenu éditorial dans `src/data/`
- Les chaînes d'interface (libellés, boutons) dans `src/i18n.js`

> **Principe important :** les données et l'UI sont strictement séparées. Un composant ne doit jamais contenir de contenu en dur — tout passe par les JSON ou par i18n.

---

## 2. Structure du projet

```
wildrey237.github.io/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Build + déploiement automatique sur main
│       └── cv-check.yml        # Validation et renommage automatique des CVs
├── public/
│   ├── cv/
│   │   ├── cv-francais.pdf     # CV français (convention : cv-{langue}.pdf)
│   │   └── cv-anglais.pdf      # CV anglais
│   ├── index.html              # HTML statique de fallback
│   ├── favicon.ico
│   ├── icon.svg                # Favicon <W/B>
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt
│   ├── profile_picture.jpg     # Photo de profil
│   └── logos/                  # Logos des entreprises (ExperienceSection)
├── src/
│   ├── main.jsx                # Point d'entrée React (ChakraProvider + i18n)
│   ├── App.jsx                 # Assemblage des sections + layout global
│   ├── i18n.js                 # Configuration i18next (détection langue, ressources UI)
│   ├── index.css               # Resets globaux minimaux
│   ├── App.css                 # Styles container (minimal)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProfileSection.jsx
│   │   ├── SkillsSection.jsx
│   │   ├── ExperienceSection.jsx
│   │   ├── EducationSection.jsx
│   │   ├── ProjectsSection.jsx
│   │   ├── Footer.jsx
│   │   ├── ScrollProgressBar.jsx
│   │   └── LogoMark.jsx
│   └── data/
│       ├── data-fr.json        # Contenu français
│       └── data-en.json        # Contenu anglais (structure identique)
├── docs/                       # Documentation technique (ce dossier)
├── index.html                  # Entrée Vite (root HTML)
├── vite.config.js
├── package.json
├── CLAUDE.md
└── README.md
```

---

## 3. Point d'entrée et bootstrap

**`src/main.jsx`** initialise l'application :

1. Importe `./i18n` en premier — i18next doit être prêt avant le rendu
2. Crée le thème Chakra avec `initialColorMode: 'light'` et `useSystemColorMode: false`
3. Monte `<ChakraProvider>` + `<ColorModeScript>` + `<App>`

> Le mode clair est la valeur par défaut intentionnelle. Ne pas activer `useSystemColorMode` sans décision explicite.

---

## 4. Internationalisation (`src/i18n.js`)

**Deux types de contenus bilingues, deux emplacements distincts :**

| Type de contenu | Emplacement |
|---|---|
| Libellés UI (navbar, boutons, titres de sections) | `src/i18n.js` — objets `resources.fr` et `resources.en` |
| Données éditoriales (profil, expériences, projets…) | `src/data/data-fr.json` et `src/data/data-en.json` |

**Ordre de détection de la langue :**
1. Query string (`?lng=fr`)
2. localStorage (choix persisté)
3. Cookie
4. Langue du navigateur
5. Balise HTML
6. Fallback : anglais

Les composants obtiennent la langue active via `useTranslation()` (pour les clés i18n) et `i18n.language` (pour choisir entre les deux JSON).

---

## 5. Couche de données

Tout le contenu éditorial vit dans deux fichiers JSON :

```
src/data/data-fr.json
src/data/data-en.json
```

**Structure commune :**

```json
{
  "profile": { ... },
  "experiences": [ ... ],
  "skills": { "ai": [...], "data_engineering": [...], ... },
  "education": [ ... ],
  "projects": [ ... ]
}
```

**Règle absolue :** les deux fichiers doivent rester structurellement identiques. Ajouter un champ dans l'un implique de l'ajouter dans l'autre.

**Shapes des entrées :**

```js
// Profile
{
  name, title, summary, location, email,
  linkedin, github, cvLink,
  search: "yes" | "no",
  link_picture: "URL" | "",
  typewriter_roles: [string, ...]
}

// Experience
{ title, company, city, website, logo, dates, description, tags }

// Skill (par catégorie)
{ name, desc }  // desc affiché dans le tooltip

// Education
{ school, degree, years, current: boolean, details, website }

// Project
{ title, description, school, badge, icon, tags, link }
// icon = nom d'une icône Lucide (ex: "ShieldAlert", "LineChart")
```

---

## 6. Responsabilité des composants

### `Navbar.jsx`

- Navigation fixe (z-index élevé), pill animée Framer Motion sur la section active
- Détection de section active via IntersectionObserver (offset 120px)
- Toggle langue (FR/EN) et toggle dark mode (icône avec rotation)
- Menu mobile via `useDisclosure` + `AnimatePresence`

**Ne doit pas :** contenir de données éditoriales ni de logique métier.

---

### `ProfileSection.jsx`

- Lit `profile` depuis le JSON actif
- Effet typewriter sur `typewriter_roles`
- Badge pulsant « Disponible » si `profile.search === "yes"`
- Email cliquable → copie presse-papier + toast
- Photo de profil ou `LogoMark` en fallback si `link_picture` est vide

---

### `SkillsSection.jsx`

- Lit `skills` depuis le JSON actif
- 6 catégories : `ai`, `data_engineering`, `software_engineering`, `cloud_mlop`, `databases`, `math_foundations`
- Chaque catégorie = une `CategoryCard` avec chips + tooltip
- Couleurs par catégorie définies en constante locale

---

### `ExperienceSection.jsx`

- Lit `experiences` depuis le JSON actif
- Timeline verticale avec bordure gauche colorée (tournante par index)
- Parsing de `description` : double `\n\n` = nouveau paragraphe, `•` en début de ligne = liste
- Logo d'entreprise ou initiales en fallback

---

### `EducationSection.jsx`

- Lit `education` depuis le JSON actif
- Logo d'établissement résolu par mots-clés dans le nom (epita, ece, epsi, saint jean/yaoundé)
- Badge « En cours » si `current: true`
- Badge campus détecté par mots-clés (lyon, paris, rennes, yaoundé)
- Détails collapsibles via `Collapse`

---

### `ProjectsSection.jsx`

- Lit `projects` depuis le JSON actif
- Carrousel avec 1/2/3 cartes (responsive), auto-scroll toutes les 3,5 s
- Filtres : école, tags, recherche texte (AND entre les filtres)
- Modal plein détail au clic sur une carte
- Icône Lucide via `LucideIcons[project.icon]`, fallback `FileText`
- Couleurs de badge par école définies dans `BADGE_COLORS`

---

### `Footer.jsx`

- Sélectionne le bon CV selon la langue : `/cv/cv-francais.pdf` ou `/cv/cv-anglais.pdf`
- Déclenche l'événement GA4 `download_cv` au clic sur le bouton de téléchargement
- Position fixe en bas (z-index 999)

---

### `ScrollProgressBar.jsx`

- Barre de progression en haut (3px), largeur = % de scroll du document
- Position fixe, z-index 1000

---

### `LogoMark.jsx`

- Rend le logo textuel `<W/B>` en monospace
- Couleurs : primaire (gray.900 / white) pour W et B, accent (teal.500 / teal.300) pour `<`, `/`, `>`

---

## 7. Styles et thème

- **Chakra UI v2** est le seul système de style. Pas de classes CSS ad hoc.
- `src/index.css` et `src/App.css` ne contiennent que des resets minimaux.
- Toutes les valeurs adaptées au mode sombre passent par `useColorModeValue(light, dark)`.
- L'accent principal est `teal` (500 en clair, 400/300 en sombre).

---

## 8. Animations

- **Framer Motion** pour les animations d'entrée de section et le carrousel
- Config partagée dans `App.jsx` (`sectionAnim`) : `opacity 0→1`, `y 40→0`, `once: true`
- Shimmer sur les cartes projet : gradient CSS animé
- Bagues pulsantes du badge « disponible » : `@keyframes` CSS inline

---

## 9. Analytics

- GA4 (`G-QSFT7C8DBJ`) chargé dans `index.html` en async
- Un seul événement personnalisé : `download_cv` (depuis `Footer.jsx`)

---

## 10. CI/CD

**`deploy.yml`** — déclenchée sur push vers `work` :
1. `npm install` + `npm run build`
2. Déploiement de `dist/` sur `main` via JamesIves

**`cv-check.yml`** — déclenchée sur push vers `work` si `cv/**` change :
1. Vérifie que chaque PDF respecte le format `cv-{langue}.pdf`
2. Détecte la langue dans le nom du fichier (anglais/english, francais/français/french)
3. Renomme automatiquement et commit si nécessaire
4. Échoue si la langue est indétectable

---

## 11. Comment ajouter du contenu

### Ajouter un projet

1. Ajouter une entrée dans `src/data/data-fr.json` → tableau `projects`
2. Ajouter l'entrée correspondante dans `src/data/data-en.json` (même structure)
3. Choisir une icône Lucide valide pour le champ `icon`
4. Si l'école n'est pas encore dans `BADGE_COLORS` de `ProjectsSection.jsx`, l'ajouter

### Ajouter une expérience

1. Ajouter l'entrée dans `experiences` dans les deux JSON
2. Placer le logo dans `public/logos/` si disponible, ou laisser le champ `logo` vide (initiales en fallback)
3. Utiliser `\n\n` pour les sauts de paragraphe et `•` pour les listes dans `description`

### Ajouter une section complète

1. Créer `src/components/NewSection.jsx`
2. Ajouter les données dans les deux JSON
3. Ajouter les libellés UI dans `src/i18n.js` (objets `fr` et `en`)
4. Importer et insérer un `<MotionBox {...sectionAnim}>` dans `src/App.jsx`
5. Ajouter un lien de navigation dans `Navbar.jsx`

### Mettre à jour un CV

Déposer les nouveaux fichiers dans `cv/` en respectant la convention `cv-{langue}.pdf`. La CI les renomme automatiquement si le nom contient un mot-clé de langue reconnu.

---

## 12. Anti-patterns interdits

- Données éditoriales en dur dans un composant
- Appel à `i18n.language` pour autre chose que sélectionner le bon JSON
- Champs présents dans un JSON et absents de l'autre
- Styles inline non liés à une valeur dynamique
- Composants qui lisent les deux JSON en parallèle et fusionnent les données
- Logique de présentation (formatage, couleurs, layout) dans les fichiers JSON
- Ajout d'une nouvelle icône sans vérifier qu'elle existe dans `lucide-react`

---

Suite → [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) · [WORKFLOWS.md](WORKFLOWS.md)
