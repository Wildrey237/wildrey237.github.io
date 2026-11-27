// Retablit les accents et apostrophes des textes de la carte (prereqMapData.js a ete saisi
// sans accents). Dictionnaire explicite, relu mot a mot : aucune devinette automatique.

const MOTS = {
    aleatoire: 'aléatoire', aleatoires: 'aléatoires', algebre: 'algèbre', arithmetique: 'arithmétique',
    automatisee: 'automatisée', avancees: 'avancées', avances: 'avancés', boite: 'boîte', boursiere: 'boursière',
    centralite: 'centralité', chaine: 'chaîne', chaines: 'chaînes', coeur: 'cœur', competences: 'compétences',
    complexite: 'complexité', conformite: 'conformité', continuite: 'continuité', correlation: 'corrélation',
    correlations: 'corrélations', couts: 'coûts', croisee: 'croisée', debruitage: 'débruitage', decalages: 'décalages',
    decision: 'décision', decomposition: 'décomposition', defaut: 'défaut', defenses: 'défenses', degre: 'degré',
    deja: 'déjà', demarrage: 'démarrage', demonstration: 'démonstration', deplacement: 'déplacement',
    derivation: 'dérivation', derive: 'dérive', derivee: 'dérivée', desequilibre: 'déséquilibre',
    desequilibrees: 'déséquilibrées', detection: 'détection', determinant: 'déterminant',
    developpement: 'développement', differentiable: 'différentiable', differentiel: 'différentiel',
    differentielles: 'différentielles', distribue: 'distribué', donnees: 'données', dualite: 'dualité',
    echangeabilite: 'échangeabilité', echantillonnage: 'échantillonnage', echelle: 'échelle', entites: 'entités',
    entrainement: 'entraînement', equation: 'équation', equations: 'équations', equite: 'équité',
    esperance: 'espérance', etat: 'état', etiquettes: 'étiquettes', evaluation: 'évaluation',
    experiences: 'expériences', explicabilite: 'explicabilité', expliquee: 'expliquée', expressivite: 'expressivité',
    fenetre: 'fenêtre', financiere: 'financière', financieres: 'financières', forets: 'forêts',
    frequences: 'fréquences', generalisation: 'généralisation', generateur: 'générateur', generatifs: 'génératifs',
    generation: 'génération', gravite: 'gravité', honnete: 'honnête', implementation: 'implémentation',
    implementer: 'implémenter', independance: 'indépendance', ingenierie: 'ingénierie', integrale: 'intégrale',
    interpretabilite: 'interprétabilité', irregulieres: 'irrégulières', lineaire: 'linéaire', lineaires: 'linéaires',
    marche: 'marché', mecanisme: 'mécanisme', medicale: 'médicale', medicales: 'médicales', memoire: 'mémoire',
    memoisation: 'mémoïsation', modele: 'modèle', modeles: 'modèles', modelisation: 'modélisation',
    multivarie: 'multivarié', naif: 'naïf', noeuds: 'nœuds', nommees: 'nommées', numerique: 'numérique',
    operateur: 'opérateur', operateurs: 'opérateurs', operations: 'opérations', optimalite: 'optimalité',
    optimise: 'optimisé', personnalite: 'personnalité', precision: 'précision', prediction: 'prédiction',
    prevision: 'prévision', probabilite: 'probabilité', probabilites: 'probabilités', qualite: 'qualité',
    recodes: 'recodés', recompense: 'récompense', recurrence: 'récurrence', recursivite: 'récursivité',
    reduction: 'réduction', reechantillonnage: 'rééchantillonnage', reel: 'réel', reelles: 'réelles',
    reference: 'référence', regle: 'règle', regles: 'règles', regner: 'régner', regression: 'régression',
    regularisation: 'régularisation', representation: 'représentation', representations: 'représentations',
    reseaux: 'réseaux', residuel: 'résiduel', residus: 'résidus', retropropagation: 'rétropropagation',
    selection: 'sélection', semantique: 'sémantique', sequences: 'séquences', sequentielles: 'séquentielles',
    series: 'séries', sigmoide: 'sigmoïde', specificite: 'spécificité', stationnarite: 'stationnarité',
    structurees: 'structurées', supervise: 'supervisé', supervises: 'supervisés', systeme: 'système',
    systemes: 'systèmes', taches: 'tâches', temperatures: 'températures', theoreme: 'théorème',
    verifiee: 'vérifiée',
}

// Mots composes et expressions (traites avant les mots seuls).
const EXPRESSIONS = [
    [/\bmarches aleatoires\b/g, 'marches aléatoires'],
    [/\bpre-entraine\b/g, 'pré-entraîné'],
    [/\bre-entrainement\b/g, 'ré-entraînement'],
    [/\bsous-problemes\b/g, 'sous-problèmes'],
    [/\bnon-stationnarite\b/g, 'non-stationnarité'],
    [/\bsous-differentiel\b/g, 'sous-différentiel'],
    [/\bbiais-variance\b/g, 'biais-variance'],
]

function avecCasse(origine, remplacement) {
    return origine[0] === origine[0].toUpperCase() ? remplacement[0].toUpperCase() + remplacement.slice(1) : remplacement
}

export function restaurerAccents(texte) {
    if (typeof texte !== 'string') return texte
    let t = texte
    for (const [motif, remplacement] of EXPRESSIONS) t = t.replace(motif, remplacement)
    // Apostrophes : "d Ito" -> "d’Ito", "l anomalie" -> "l’anomalie".
    t = t.replace(/\b([dlDL]) (?=[aeiouyhAEIOUYHéÉ])/g, '$1’')
    // "a" isole entre deux espaces : preposition "à" ("passage a l echelle").
    t = t.replace(/(?<= )a(?= )/g, 'à')
    // Mots seuls : jamais colles a un chiffre, un tiret, un "_" ou un "/" (codes "A2", "a_cx", chemins).
    t = t.replace(/(?<![\p{L}\p{N}_\-\/])[a-zA-Z]+(?![\p{L}\p{N}_\-\/])/gu, mot => {
        const cible = MOTS[mot.toLowerCase()]
        return cible ? avecCasse(mot, cible) : mot
    })
    return t
}
