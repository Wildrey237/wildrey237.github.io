# Code Conventions — Portfolio Wilfried Bemelingue

> Règles de nommage, imports, composants, données et styles à respecter dans tout le projet.

---

## 1. Principes

Le codebase doit rester lisible et prévisible. Chaque fichier a une responsabilité claire, un nom parlant et une place évidente dans la structure.

**Règles prioritaires :**

- Clarté avant abstraction prématurée
- UI strictement séparée des données
- Imports explicites et localisables
- Zéro contenu éditorial en dur dans les composants
- Les exceptions doivent être documentées, pas normalisées

---

## 2. Nommage

**Composants React :**

- Fichiers en `PascalCase.jsx` — ex : `ProjectsSection.jsx`, `LogoMark.jsx`
- Le composant principal porte le même nom que son fichier
- Un composant principal par fichier
- Les sous-composants internes (ex : `ProjectCard`, `CategoryCard`) sont acceptés s'ils restent courts et locaux au fichier

**Fonctions utilitaires et helpers :**

- Fichiers en `camelCase.js` si jamais créés
- Fonctions nommées par action explicite : `getSchoolLogo`, `renderDescription`, `buildCvPath`

**Constantes :**

- `UPPER_SNAKE_CASE` pour les maps et valeurs fixes — ex : `BADGE_COLORS`, `CATEGORY_COLORS`
- Déclarées en haut de fichier, hors du composant

**Clés i18n :**

- Minuscules avec points pour les namespaces — ex : `projects.title`, `projects.filterByTags`
- Clés courtes et stables : éviter les phrases complètes comme clés

---

## 3. Imports

Les imports sont relatifs (pas d'alias `@/` configuré dans Vite).

**Règles :**

- Préférer des chemins courts : depuis `components/`, un import vers `data/` s'écrit `../data/data-fr.json`
- Éviter les remontées profondes (`../../../`)
- Importer les deux JSON en haut du composant et sélectionner le bon à l'exécution, pas à l'import
- Grouper les imports dans cet ordre :
  1. React
  2. Librairies externes (Chakra, Framer Motion, react-icons, lucide-react…)
  3. Données locales (JSON)
  4. Composants locaux

**Exemple correct :**

```jsx
import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";
```

**Sélection de la langue dans un composant :**

```jsx
const data = i18n.language === "fr" ? frData : enData;
const { projects } = data;
```

---

## 4. Composants

**Responsabilités autorisées :**

- Affichage et mise en page
- État local lié à l'interface (menus, modals, filtres, animations)
- Lecture des JSON via le pattern langue actuelle
- Lecture des clés i18n via `useTranslation()`

**Interdictions :**

- Contenu éditorial en dur (titres, descriptions, noms) dans le JSX
- Logique de sélection ou transformation complexe des données dans le rendu
- Props imbriquées sans forme documentée

**Structure recommandée d'un composant :**

```jsx
// 1. Imports
// 2. Constantes locales (BADGE_COLORS, etc.)
// 3. Helpers locaux (getSchoolLogo, renderDescription…)
// 4. Composant principal
//    a. Hooks (useColorMode, useTranslation, useState…)
//    b. Dérivation des données (sélection JSON, filtres…)
//    c. Rendu JSX
// 5. Sous-composants internes (si courts)
```

**Hooks et valeurs dérivées :**

Calculer les valeurs `useColorModeValue` en haut du composant, pas dans le JSX inline :

```jsx
// Correct
const cardBg = useColorModeValue("white", "gray.800");
return <Box bg={cardBg}>;

// Interdit
return <Box bg={useColorModeValue("white", "gray.800")}>;
```

---

## 5. Données JSON

Les fichiers `data-fr.json` et `data-en.json` sont la source de vérité éditoriale.

**Règles :**

- Les deux fichiers doivent avoir exactement la même structure à tout moment
- Ajouter un champ dans l'un implique de l'ajouter dans l'autre, même si la valeur est vide ou `null`
- Aucune logique de présentation dans les JSON (pas de HTML, pas de classes CSS)
- Le champ `icon` d'un projet doit être un nom d'icône Lucide valide et existant dans `lucide-react`
- Le champ `description` d'une expérience utilise `\n\n` pour les paragraphes et `•` pour les listes

**Shapes attendues :**

```js
// Projet
{
  "title": string,
  "description": string,
  "school": string,          // doit correspondre à une clé dans BADGE_COLORS si badge coloré
  "badge": string,           // libellé du badge affiché sur la carte
  "icon": string,            // nom d'une icône Lucide (ex: "ShieldAlert")
  "tags": [string],
  "link": string             // URL ou "#"
}

// Expérience
{
  "title": string,
  "company": string,
  "city": string,
  "website": string,         // URL ou ""
  "logo": string,            // chemin dans /public/logos/ ou ""
  "dates": string,
  "description": string,     // \n\n entre paragraphes, • pour les listes
  "tags": [string]
}
```

---

## 6. i18n

**Deux périmètres distincts :**

| Ce qui va dans `src/i18n.js` | Ce qui va dans les JSON |
|---|---|
| Libellés de navigation | Nom, titre, résumé du profil |
| Textes de boutons | Descriptions d'expériences |
| Titres de sections | Noms de projets et tags |
| Messages UI (toast, placeholders) | Détails de formations |

**Règles :**

- Ne jamais dupliquer une clé i18n (une clé = une signification unique)
- Toute nouvelle chaîne UI doit être ajoutée dans les deux objets `fr` et `en` de `src/i18n.js`
- Ne pas utiliser i18n pour formater des données JSON (titres de projets, descriptions…)
- Utiliser `useTranslation()` dans les composants, jamais `i18n.t()` directement dans le JSX sauf cas justifié

---

## 7. Styles

Le seul système de style est **Chakra UI**. Aucune classe CSS personnalisée ne doit être ajoutée sauf dans `src/index.css` ou `src/App.css` pour des resets globaux.

**Règles :**

- Toutes les couleurs passent par `useColorModeValue(light, dark)`
- L'accent principal est `teal` — ne pas introduire d'autres couleurs primaires sans raison documentée
- Pas de styles inline sauf pour des valeurs calculées dynamiquement (ex : largeur en pourcentage, transformation CSS)
- Utiliser les props de responsive Chakra plutôt que des media queries manuelles :

```jsx
// Correct
<Box px={{ base: 4, md: 8 }} display={{ base: "none", md: "flex" }}>

// Interdit
<Box style={{ padding: "16px" }}>
```

- Les animations Framer Motion sont déclarées hors du JSX (objets `variants` ou config nommée)

**Constantes de couleurs :**

Les maps de couleurs par catégorie (`CATEGORY_COLORS`, `BADGE_COLORS`) sont des constantes de module, déclarées en haut de leur fichier de composant. Ne pas les dupliquer dans les JSON.

---

## 8. CVs

**Convention de nommage stricte :**

```
public/cv/cv-{langue}.pdf
```

Exemples valides : `public/cv/cv-francais.pdf`, `public/cv/cv-anglais.pdf`

Les fichiers doivent impérativement être dans `public/cv/` — Vite copie ce dossier tel quel dans `dist/`, ce qui les rend accessibles à `/cv/cv-{langue}.pdf` en production. Un fichier placé ailleurs ne sera pas servi.

La CI (`cv-check.yml`) valide et corrige automatiquement les noms au push. En cas de langue indétectable dans le nom, la CI échoue et liste le fichier problématique.

---

## 9. Exemples corrects

**Sélection du JSON selon la langue :**

```jsx
import frData from "../data/data-fr.json";
import enData from "../data/data-en.json";

const data = i18n.language === "fr" ? frData : enData;
const { projects } = data;
```

**Constante de couleurs hors composant :**

```jsx
const BADGE_COLORS = {
  "EPITA SCIA-G": "red.500",
  "EPITA": "purple.500",
  "Personnel": "gray.500",
};

export default function ProjectsSection() { ... }
```

**Valeurs Chakra calculées en haut du composant :**

```jsx
const cardBg = useColorModeValue("white", "gray.800");
const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
```

**Parsing de description avec bullets :**

```jsx
function renderDescription(text) {
  return text.split("\n\n").map((block, i) => {
    const lines = block.split("\n");
    const hasBullets = lines.some((l) => l.startsWith("•"));
    // ...
  });
}
```

---

## 10. Exemples interdits

**Contenu éditorial en dur dans le JSX :**

```jsx
// Interdit
<Text>Ingénieur IA passionné par les GNN et la finance quantitative</Text>
```

**useColorModeValue dans le JSX inline :**

```jsx
// Interdit
<Box bg={useColorModeValue("white", "gray.800")}>
```

**Champ présent dans un JSON, absent de l'autre :**

```json
// data-fr.json
{ "title": "...", "nouveauChamp": "valeur" }

// data-en.json — interdit : nouveauChamp manquant
{ "title": "..." }
```

**Icône Lucide inexistante :**

```json
// Interdit si "MagicWand" n'existe pas dans lucide-react
{ "icon": "MagicWand" }
```

**Import relatif profond :**

```jsx
// Interdit
import frData from "../../../data/data-fr.json";
```

---

← [ARCHITECTURE.md](ARCHITECTURE.md) · Suite → [WORKFLOWS.md](WORKFLOWS.md)
