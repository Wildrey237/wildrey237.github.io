# Portfolio – Documentation et Déploiement

![Build and Deploy](https://github.com/Wildrey237/wildrey237.github.io/actions/workflows/deploy.yml/badge.svg)

Ce projet est un portfolio personnel développé en **React avec Vite** et stylisé avec **Chakra UI**.  
Il permet de présenter votre profil, vos compétences et vos expériences de manière professionnelle, responsive et bilingue (français/anglais). Le site détecte automatiquement la langue de l'utilisateur et bascule en anglais par défaut si la langue détectée n'est pas prise en charge.

**URL du site déployé :** [https://wildrey237.github.io/](https://wildrey237.github.io/)

## Sommaire

1. [Prérequis](#prérequis)
2. [Description du projet](#description-du-projet)
3. [Structure des fichiers et répertoires](#structure-des-fichiers-et-répertoires)
4. [Organisation des branches](#organisation-des-branches)
5. [Fonctionnalités principales](#fonctionnalités-principales)
6. [Technologies](#technologies)
7. [Instructions pour le développement local](#instructions-pour-le-développement-local)
8. [Workflow Git et bonnes pratiques](#workflow-git-et-bonnes-pratiques)
9. [Déploiement automatique (recommandé)](#déploiement-automatique-recommandé)
10. [Déploiement manuel (optionnel)](#déploiement-manuel-optionnel)
11. [Points importants et avertissements](#points-importants-et-avertissements)
13. [Contact](#contact)
14. [Licence](#licence)

---

## Prérequis

Avant de démarrer, assurez-vous d'avoir installé :

- **Node.js** version 18 ou supérieure
- **npm** version 9 ou supérieure  
- **Git**

Vérifiez vos versions :
```bash
node --version
npm --version
git --version
```

## Description du projet

Ce portfolio présente les fonctionnalités suivantes :

- **Profil dynamique :** Nom avec effet machine à écrire, titre, résumé, localisation et liens cliquables (email, LinkedIn, GitHub)
- **Compétences :** Présentées sous forme de cartes avec icônes, description affichée en popover (hover desktop ou clic mobile)
- **Expériences :** Affichées en timeline animée, avec tags techniques interactifs
- **Parcours scolaire :** Affichage sous forme d'accordéon enrichi de badges et liens vers les sites officiels
- **Multilingue :** Détection automatique FR/EN (anglais par défaut) avec possibilité de changer manuellement
- **Navbar :** Fixe, transparente, avec indicateur actif, changement de langue (FR/EN), switch clair/sombre
- **Footer :** Fixe, discret, liens vers les réseaux et bouton pour télécharger le CV (adapté à la langue)
- **Design responsive et mode clair/sombre**
- **Déploiement automatique :** Via GitHub Actions, chaque tag `deploy-*` sur `work` déclenche un build et met à jour la branche `main` servie par GitHub Pages

---

## Structure des fichiers et répertoires

### Racine du projet

- **`package.json`** - Déclare les dépendances, les scripts (dev, build), et la clé "homepage" pour GitHub Pages
- **`vite.config.js`** - Configuration de Vite (bundler)
- **`.github/workflows/deploy.yml`** - Workflow GitHub Actions pour déployer automatiquement le contenu du dossier `dist` vers la branche `main`
- **`README.md`** - Documentation du projet (instructions, commandes, déploiement)
- **`.gitignore`** - Liste des fichiers et dossiers à ignorer par Git

### Répertoire `src/`

Contient tout le code source React :

- **`src/main.jsx`** - Point d'entrée de l'application (montage du composant App)
- **`src/App.jsx`** - Composant racine qui assemble la Navbar, les sections (Profil, Skills, Experiences, Education) et le Footer
- **`src/i18n.js`** - Configuration d'i18next pour la gestion des langues FR/EN avec détection automatique

#### `src/components/`

Contient les composants modulaires :

- **`Navbar.jsx`** - Barre de navigation fixe et responsive
- **`ProfileSection.jsx`** - Affiche le profil avec effet machine à écrire et liens
- **`SkillsSection.jsx`** - Affiche les compétences par catégories avec popovers
- **`ExperienceSection.jsx`** - Affiche la timeline des expériences
- **`EducationSection.jsx`** - Affiche le parcours scolaire sous forme d'accordéon
- **`Footer.jsx`** - Pied de page avec icônes et bouton de téléchargement du CV

#### `src/data/`

Contient les données multilingues au format JSON :

- **`data-fr.json`** - Profil, compétences, expériences et parcours scolaire en français
- **`data-en.json`** - Profil, compétences, expériences et parcours scolaire en anglais

### Autres répertoires

- **`public/`** - Contient les fichiers statiques accessibles directement (favicon, images)
- **`dist/`** - Généré automatiquement après `npm run build`, contient le build optimisé déployé sur la branche `main`

### Résumé de l'organisation

- **Code source** → branche `work` (dans `src/` principalement)
- **Build déployé** → branche `main` (contenu du dossier `dist`)
- **Automatisation** → `.github/workflows/deploy.yml`
- **Données dynamiques multilingues** → `src/data/data-fr.json` et `src/data/data-en.json`
- **Composants modulaires** → dans `src/components/`

---

## Organisation des branches

- **`work`**  
  Branche de développement contenant le code source (React, JSON multilingues, configurations).

- **`main`**  
  Branche de production contenant uniquement le build généré (dossier `dist`) qui est servi par GitHub Pages.

---

## Fonctionnalités principales

### Profil
- Nom affiché avec un effet machine à écrire
- Titre : étudiant en génie informatique spécialisé en IA, Deep Learning et Machine Learning
- Résumé : recherche d'un stage de fin d'études (6 mois), basé en Île‑de‑France, ouvert à l'international, bilingue français et anglais courant (TOEIC en cours)
- Liens vers email, LinkedIn et GitHub

### Compétences
- Cartes par catégorie (Développement, Environnements, Bases de données, IA/ML, Big Data)
- Icônes devant chaque compétence
- Popover descriptif : au survol sur desktop, au clic sur mobile

### Expériences
- Timeline animée (Framer Motion) alternant gauche/droite
- Tags techniques interactifs

### Parcours scolaire
- Affichage sous forme d'accordéon enrichi
- Badges pour chaque formation
- Liens vers les sites officiels des établissements

### Navbar
- Fixe et responsive, transparente
- Boutons vers les sections avec indicateur actif animé
- Logo et bouton Home ramenant en haut de page
- Bouton FR/EN avec détection automatique de la langue
- Switch mode clair/sombre

### Footer
- Fixe et discret
- Icônes mail / LinkedIn / GitHub
- Bouton de téléchargement du CV (FR ou EN selon la langue)

### Internationalisation
- Détection automatique de la langue de l'utilisateur
- Fallback en anglais si la langue détectée n'est pas prise en charge
- Possibilité de changer manuellement la langue

---

## Technologies

- **Frontend :** React (Vite), Chakra UI
- **Animations :** Framer Motion
- **Internationalisation :** i18next + i18next-browser-languagedetector
- **Effets :** react-simple-typewriter
- **Icônes :** react-icons
- **Déploiement :** GitHub Pages, GitHub Actions

---

## Instructions pour le développement local

### Installation

```bash
# Cloner le projet
git clone https://github.com/Wildrey237/wildrey237.github.io.git
cd wildrey237.github.io

# Basculer sur la branche de développement
git checkout work

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Organisation du code source

- **Données multilingues :**
  - `src/data/data-fr.json` - Contenu en français
  - `src/data/data-en.json` - Contenu en anglais
- **Composants :** `src/components/`
- **Configuration i18n :** `src/i18n.js`
- **Point d'entrée :** `src/main.jsx`
- **Composant racine :** `src/App.jsx`

---

## Workflow Git et bonnes pratiques

### Travailler sur le code source

```bash
# Créer une nouvelle branche depuis work si besoin
git checkout work

# Ajouter vos modifications
git add .

# Commit
git commit -m "Description du commit"

# Pousser sur la branche work
git push origin work
```

### Déploiement via tags

```bash
# Créer un tag pour déclencher le déploiement
git tag deploy-v1.0.0
git push origin deploy-v1.0.0
```

### Mettre à jour votre branche locale

```bash
# Toujours mettre à jour avant de pousser
git pull origin work --rebase
git push origin work
```

---

## Déploiement automatique (recommandé)

Le déploiement est automatisé via un workflow GitHub Actions :

- Chaque tag `deploy-*` poussé sur `work` déclenche un build
- Le dossier `dist` est déployé automatiquement sur la branche `main`
- GitHub Pages sert la branche `main`

**Configuration :** `.github/workflows/deploy.yml`

**Vérifier l'exécution :** Onglet Actions du dépôt GitHub

---

## Déploiement manuel (optionnel)

Si besoin, il est possible de déployer manuellement :

```bash
# Générer le build
npm run build

# Passer sur la branche main
git checkout main

# Supprimer les anciens fichiers (sauf .git)
rm -rf * .[^.]*

# Copier les fichiers buildés à la racine
cp -r dist/* .

# Déployer
git add .
git commit -m "Déploiement manuel"
git push origin main
```

---

## Points importants et avertissements

- **Attention :** Ne pas modifier directement la branche `main` (elle est gérée automatiquement par CI/CD)

- **Configuration homepage :** Vérifier que le fichier `package.json` contient :
  ```json
  "homepage": "https://wildrey237.github.io/"
  ```

- **Cohérence des données :** S'assurer que les fichiers JSON sont synchronisés :
  - `src/data/data-fr.json`
  - `src/data/data-en.json`

- **Fichiers statiques :** Vérifiez que le favicon et les liens (CV, réseaux) sont valides avant le déploiement

- **Workflow automatique :** Le déploiement se fait via tags `deploy-*`, pas sur chaque push

---

## Contact

Pour toute question ou collaboration :

- **Email :** Disponible dans le footer du site
- **LinkedIn :** [Profil LinkedIn](https://linkedin.com/in/wilfried-bemelingue)
- **GitHub :** [Profil GitHub](https://github.com/Wildrey237)

---

## Licence

Ce projet est protégé par les droits d'auteur.  
Aucune réutilisation sans autorisation préalable.

---

### Maintenance

Pour toute évolution ou maintenance, suivre les commandes et processus décrits dans ce README.