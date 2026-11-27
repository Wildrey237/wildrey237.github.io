// Modele du parcours prive : rails, etats affiches et voisinages, calcules a la lecture
// a partir des noeuds (seul l'etat de chaque noeud est stocke en base).
// Module pur, utilise cote serveur et cote client.

export const RAILS = [
    {id: 'ia', nom: 'IA & ML', bandes: ['ml', 'graph', 'data']},
    {id: 'maths', nom: 'Maths', bandes: ['math']},
    {id: 'algo', nom: 'Algo', bandes: ['algo']},
]

// Etat affiche sur la carte :
// - maitrise : etat "maitrise" ;
// - en-cours : etat "en cours" ("Tu es ici") ;
// - ensuite  : non commence, et tous ses prerequis sont maitrises ou en cours (debloque au prochain pas) ;
// - plus-tard : le reste.
export const STATUTS = ['en-cours', 'ensuite', 'plus-tard', 'maitrise']

// "M1 · Algebre lineaire" -> {code: "M1", nom: "Algebre lineaire"} ; "P · ..." -> code "P".
export function decouperTitre(titre) {
    const i = titre.indexOf(' · ')
    return i < 0 ? {code: '', nom: titre} : {code: titre.slice(0, i), nom: titre.slice(i + 3)}
}

export function construireModele(noeuds) {
    const parId = new Map(noeuds.map(n => [n.id, n]))
    const successeurs = new Map(noeuds.map(n => [n.id, []]))
    for (const n of noeuds) for (const p of n.prerequis) successeurs.get(p)?.push(n.id)

    // Rail : par bande ; un projet d'apprentissage suit le rail majoritaire de ses prerequis.
    const rails = new Map()
    const railDe = id => {
        if (rails.has(id)) return rails.get(id)
        const n = parId.get(id)
        let rail = RAILS.find(r => r.bandes.includes(n.bande))?.id
        if (!rail) {
            const compte = {}
            for (const p of n.prerequis) if (parId.has(p)) compte[railDe(p)] = (compte[railDe(p)] ?? 0) + 1
            rail = RAILS.map(r => r.id).sort((a, b) => (compte[b] ?? 0) - (compte[a] ?? 0))[0]
        }
        rails.set(id, rail)
        return rail
    }

    // Profondeur : plus long chemin depuis un point d'entree (sens de lecture gauche -> droite).
    const profondeurs = new Map()
    const profondeur = id => {
        if (profondeurs.has(id)) return profondeurs.get(id)
        const prereqs = parId.get(id).prerequis.filter(p => parId.has(p))
        const d = prereqs.length ? 1 + Math.max(...prereqs.map(profondeur)) : 0
        profondeurs.set(id, d)
        return d
    }

    const statuts = new Map()
    for (const n of noeuds) {
        railDe(n.id)
        profondeur(n.id)
        let statut = 'plus-tard'
        if (n.etat === 'maitrise') statut = 'maitrise'
        else if (n.etat === 'en cours') statut = 'en-cours'
        else if (n.prerequis.every(p => ['maitrise', 'en cours'].includes(parId.get(p)?.etat))) statut = 'ensuite'
        statuts.set(n.id, statut)
    }

    // Ordre stable de lecture : profondeur, puis position d'origine sur l'ancienne carte.
    const ordre = (a, b) => profondeurs.get(a) - profondeurs.get(b)
        || parId.get(a).row - parId.get(b).row || parId.get(a).col - parId.get(b).col || a.localeCompare(b)

    return {noeuds, parId, successeurs, rails, profondeurs, statuts, ordre}
}

// "Autour de moi" : noeuds en cours, ce qu'ils debloquent et leurs prerequis directs.
// Sans noeud en cours : les noeuds "Ensuite" (points d'entree) et ce qu'ils debloquent.
export function autourDeMoi(modele) {
    const {noeuds, statuts, successeurs, parId} = modele
    let centre = noeuds.filter(n => statuts.get(n.id) === 'en-cours').map(n => n.id)
    const sansEnCours = centre.length === 0
    if (sansEnCours) centre = noeuds.filter(n => statuts.get(n.id) === 'ensuite').map(n => n.id)
    const ids = new Set(centre)
    for (const id of centre) {
        for (const s of successeurs.get(id)) ids.add(s)
        if (!sansEnCours) for (const p of parId.get(id).prerequis) ids.add(p)
    }
    return {ids: [...ids], sansEnCours}
}

// Noeuds d'un rail ayant un statut donne, dans l'ordre de lecture.
export function noeudsDuRail(modele, rail, statut) {
    return modele.noeuds
        .filter(n => modele.rails.get(n.id) === rail && (!statut || modele.statuts.get(n.id) === statut))
        .map(n => n.id)
        .sort(modele.ordre)
}

// Avancement d'un rail : maitrises / total, en cours, prochaine seance (en cours, sinon premier "Ensuite").
export function avancement(modele, rail) {
    const tous = noeudsDuRail(modele, rail)
    const compte = s => tous.filter(id => modele.statuts.get(id) === s).length
    const prochaine = noeudsDuRail(modele, rail, 'en-cours')[0] ?? noeudsDuRail(modele, rail, 'ensuite')[0] ?? null
    return {total: tous.length, maitrises: compte('maitrise'), enCours: compte('en-cours'), prochaine}
}
