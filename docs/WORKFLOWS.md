# Workflows Git — Portfolio Wilfried Bemelingue

> Modèle de branches, conventions de commits et pipeline de déploiement.

---

## 1. Modèle de branches

| Branche | Usage |
|---|---|
| `work` | Branche de développement — tout le code source vit ici |
| `main` | Branche de production — contient uniquement le `dist/` compilé, servi par GitHub Pages |

**Règle absolue : ne jamais committer de code source sur `main`.** Le contenu de `main` est entièrement géré par la CI. Toute modification manuelle sur `main` sera écrasée au prochain déploiement.

Pour les contributions ponctuelles (contenu, corrections) :

| Type | Branche recommandée |
|---|---|
| Nouvelle fonctionnalité UI | `feature/nom-de-la-feature` (depuis `work`) |
| Correction de bug | `fix/description-du-bug` (depuis `work`) |
| Mise à jour de contenu | directement sur `work` si mineure |
| Mise à jour de doc | directement sur `work` |

---

## 2. Convention de commits

**Préfixes à utiliser :**

| Préfixe | Usage |
|---|---|
| `feat:` | Nouvelle fonctionnalité ou nouveau contenu |
| `fix:` | Correction de bug ou d'affichage |
| `refactor:` | Refactoring sans changement de comportement visible |
| `docs:` | Documentation uniquement (`docs/`, `README.md`, `CLAUDE.md`) |
| `chore:` | Maintenance, configuration, dépendances, CI |
| `content:` | Ajout ou mise à jour de données JSON ou de CVs |
| `style:` | Ajustements visuels sans modification fonctionnelle |

**Format :**

```
<préfixe>: description courte en minuscules

Corps optionnel si la modification nécessite contexte.
```

**Exemples :**

```
feat: add AML fraud detection project to projects section
content: update french and english CVs
fix: correct badge color for EPITA SCIA-G projects
docs: add ARCHITECTURE and WORKFLOWS documentation
chore: fix Node.js 24 deprecation warning in deploy workflow
```

---

## 3. Pipeline CI/CD

### `deploy.yml` — Déploiement automatique

**Déclencheur :** push sur `work` ou `workflow_dispatch`

**Étapes :**

1. Checkout de `work`
2. Setup Node.js 20
3. `npm install`
4. `npm run build` → génère `dist/`
5. Déploiement de `dist/` sur `main` via JamesIves (clean + single-commit)

**Suivre l'avancement :** onglet **Actions** du dépôt GitHub.

> En cas d'échec du build, corriger l'erreur sur `work` et repousser. Ne jamais corriger directement sur `main`.

---

### `cv-check.yml` — Validation des CVs

**Déclencheur :** push sur `work` si un fichier dans `cv/` change, ou `workflow_dispatch`

**Logique :**

1. Parcourt tous les fichiers `.pdf` dans `cv/`
2. Si le nom respecte déjà `cv-{langue}.pdf` → OK
3. Sinon, détecte la langue dans le nom du fichier :
   - `anglais` ou `english` → renomme en `cv-anglais.pdf`
   - `francais`, `français` ou `french` → renomme en `cv-francais.pdf`
4. Commit automatique si des fichiers ont été renommés
5. **Échec** si la langue est indétectable — le fichier est listé dans les logs

**Convention CVs :**

```
cv/cv-{langue}.pdf
```

Exemples valides : `cv-francais.pdf`, `cv-anglais.pdf`

---

## 4. Mettre à jour le contenu

### Données éditoriales (profil, expériences, projets, compétences, formations)

```bash
# Modifier les deux fichiers JSON
src/data/data-fr.json
src/data/data-en.json

git add src/data/
git commit -m "content: <description>"
git push origin work
```

Le déploiement est automatique après le push.

### CVs

```bash
# Déposer les fichiers dans cv/ en respectant la convention
cv/cv-francais.pdf
cv/cv-anglais.pdf

git add cv/
git commit -m "content: update CVs"
git push origin work
```

Si les noms ne respectent pas la convention mais contiennent un mot-clé de langue, la CI renomme automatiquement et commit.

### Documentation

```bash
git add docs/
git commit -m "docs: <description>"
git push origin work
```

---

## 5. Développement local

```bash
git clone https://github.com/Wildrey237/wildrey237.github.io.git
cd wildrey237.github.io
git checkout work
npm install
npm run dev        # Serveur local avec HMR sur http://localhost:5173
```

Autres commandes :

```bash
npm run build      # Build de production → dist/
npm run preview    # Prévisualiser le build localement
npm run lint       # ESLint (vérification uniquement, pas de fix)
```

---

## 6. Vérifications avant push

Pas de suite de tests configurée. Avant de pousser une modification :

```bash
npm run lint       # Vérifier qu'ESLint ne signale rien
npm run build      # Vérifier que le build passe sans erreur
```

> Si le build échoue localement, ne pas pousser. La CI échouera aussi et bloquera le déploiement.

---

## 7. Pull Requests (optionnel)

Pour des modifications significatives (nouvelle section, refactoring, changement d'architecture), ouvrir une PR depuis une branche `feature/*` ou `fix/*` vers `work`.

**Une PR doit mentionner :**

- Objectif de la modification
- Composants ou fichiers JSON affectés
- Capture d'écran si changement visuel
- Résultat du build local

---

← [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) · [ARCHITECTURE.md](ARCHITECTURE.md)
