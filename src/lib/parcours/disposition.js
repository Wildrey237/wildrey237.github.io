// Disposition de la carte du parcours (module pur).
// - Une bande horizontale par rail, lecture de gauche a droite (colonne = profondeur).
// - Les cartes occupent une grille reguliere : toutes les colonnes d'une bande partagent les
//   memes rangees. Les fleches ne circulent que dans les couloirs (entre deux colonnes, ou entre
//   deux rangees) : elles ne traversent donc jamais une carte.
// - Fleches a angles droits : sortie a droite de la source, couloir vertical, couloir horizontal
//   au-dessus de la rangee de la cible, couloir vertical avant la cible, entree a gauche.
import {RAILS} from './modele.js'

export const CARTE = {largeur: 200, hauteur: 64}
const ECART_COL = 72     // couloir vertical entre deux colonnes
const ECART_RANG = 28    // couloir horizontal entre deux rangees
const ENTETE_BANDE = 40  // titre de la bande (et couloir au-dessus de la premiere rangee)
const ECART_BANDE = 20
const MARGE = 24

// Decalage des fleches qui partagent un couloir, pour qu'elles restent distinctes.
function decalage(k, pas, max) {
    const rang = (k % (2 * max + 1)) - max
    return rang * pas
}

export function disposer(modele, ids) {
    const garde = new Set(ids)
    const {parId, rails, statuts, ordre} = modele

    // Colonnes : profondeur recalculee dans le sous-ensemble, puis compactee (pas de colonne vide).
    const prof = new Map()
    const profondeur = id => {
        if (prof.has(id)) return prof.get(id)
        const pre = parId.get(id).prerequis.filter(p => garde.has(p))
        const d = pre.length ? 1 + Math.max(...pre.map(profondeur)) : 0
        prof.set(id, d)
        return d
    }
    ids.forEach(profondeur)
    const colonnesUtilisees = [...new Set(prof.values())].sort((a, b) => a - b)
    const colonne = new Map(ids.map(id => [id, colonnesUtilisees.indexOf(prof.get(id))]))

    // Rangees : dans chaque bande et chaque colonne, empilement dans l'ordre de lecture.
    const rangee = new Map()
    const bandes = []
    let y = MARGE
    for (const rail of RAILS) {
        const membres = ids.filter(id => rails.get(id) === rail.id).sort(ordre)
        if (!membres.length) continue
        const parColonne = new Map()
        for (const id of membres) {
            const c = colonne.get(id)
            const r = parColonne.get(c) ?? 0
            rangee.set(id, r)
            parColonne.set(c, r + 1)
        }
        const nbRangees = Math.max(...parColonne.values())
        const hauteur = ENTETE_BANDE + nbRangees * CARTE.hauteur + (nbRangees - 1) * ECART_RANG + ECART_RANG
        bandes.push({rail: rail.id, nom: rail.nom, y, hauteur, membres})
        for (const id of membres) rangee.set(id, {bande: bandes.length - 1, r: rangee.get(id)})
        y += hauteur + ECART_BANDE
    }

    const xCol = c => MARGE + c * (CARTE.largeur + ECART_COL)
    const position = id => {
        const {bande, r} = rangee.get(id)
        return {x: xCol(colonne.get(id)), y: bandes[bande].y + ENTETE_BANDE + r * (CARTE.hauteur + ECART_RANG)}
    }
    const cartes = ids.map(id => ({id, ...position(id), statut: statuts.get(id)}))

    // Fleches prerequis -> noeud (dans le sous-ensemble).
    const usageCouloir = new Map()
    const prendre = cle => {
        const k = usageCouloir.get(cle) ?? 0
        usageCouloir.set(cle, k + 1)
        return k
    }
    const aretes = []
    for (const id of ids) {
        for (const p of parId.get(id).prerequis) {
            if (!garde.has(p)) continue
            const a = position(p), b = position(id)
            const ca = colonne.get(p), cb = colonne.get(id)
            const ya = a.y + CARTE.hauteur / 2
            const yb = b.y + CARTE.hauteur / 2
            const xSortie = a.x + CARTE.largeur
            // Couloir vertical juste apres la colonne source.
            const c1 = xSortie + ECART_COL / 2 + decalage(prendre(`v${ca}`), 5, 4)
            let points
            if (cb === ca + 1) {
                points = [[xSortie, ya], [c1, ya], [c1, yb], [b.x, yb]]
            } else {
                // Couloir horizontal au-dessus de la rangee de la cible, puis couloir avant la cible.
                const {bande, r} = rangee.get(id)
                const haut = r === 0 ? bandes[bande].y + ENTETE_BANDE - ECART_RANG / 2 : b.y - ECART_RANG / 2
                const yCouloir = haut + decalage(prendre(`h${bande}:${r}`), 4, 2)
                const c2 = b.x - ECART_COL / 2 + decalage(prendre(`v${cb - 1}`), 5, 4)
                points = [[xSortie, ya], [c1, ya], [c1, yCouloir], [c2, yCouloir], [c2, yb], [b.x, yb]]
            }
            aretes.push({de: p, vers: id, points, accent: statuts.get(id) === 'ensuite'})
        }
    }
    // Fleches d'accent dessinees en dernier (au-dessus des grises).
    aretes.sort((a, b) => Number(a.accent) - Number(b.accent))

    const nbColonnes = colonnesUtilisees.length
    return {
        largeur: xCol(nbColonnes) - ECART_COL + MARGE,
        hauteur: y - ECART_BANDE + MARGE,
        cartes, aretes, bandes,
    }
}
