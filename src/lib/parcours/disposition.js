// Disposition de la carte du parcours (module pur).
// - Une bande horizontale par bande d'origine de prereqMapData.js (math, ml, graph, algo, data,
//   proj), lecture de gauche a droite (colonne = profondeur). Les rails ne servent jamais ici.
// - Les cartes occupent une grille reguliere : toutes les colonnes d'une bande partagent les
//   memes rangees. Les fleches ne circulent que dans les couloirs (entre deux colonnes, ou entre
//   deux rangees) : elles ne traversent donc jamais une carte.
// - Fleches a angles droits : sortie a droite de la source, couloir vertical, couloir horizontal
//   au-dessus de la rangee de la cible, couloir vertical avant la cible, entree a gauche.
import {BANDES_CARTE} from './modele.js'

// Taille d'une carte : 2 lignes de titre tiennent sans coupe (titre le plus long : 44 caracteres).
export const CARTE = {largeur: 240, hauteur: 76}
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

// fantomes : prerequis venus d'une bande filtree, affiches en contexte (sans leurs propres liens).
export function disposer(modele, ids, {fantomes = new Set()} = {}) {
    const garde = new Set(ids)
    const {parId, statuts, ordre} = modele

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
    for (const b of BANDES_CARTE) {
        // Pas de bande vide : seules les bandes qui ont des noeuds a afficher sont dessinees.
        const membres = ids.filter(id => parId.get(id).bande === b.id).sort(ordre)
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
        bandes.push({bande: b.id, nom: b.nom, y, hauteur, membres, fantome: membres.every(id => fantomes.has(id))})
        for (const id of membres) rangee.set(id, {bande: bandes.length - 1, r: rangee.get(id)})
        y += hauteur + ECART_BANDE
    }

    const xCol = c => MARGE + c * (CARTE.largeur + ECART_COL)
    const position = id => {
        const {bande, r} = rangee.get(id)
        return {x: xCol(colonne.get(id)), y: bandes[bande].y + ENTETE_BANDE + r * (CARTE.hauteur + ECART_RANG)}
    }
    const cartes = ids.map(id => ({cle: id, id, ...position(id), h: CARTE.hauteur, statut: statuts.get(id), fantome: fantomes.has(id)}))

    // Fleches prerequis -> noeud (dans le sous-ensemble).
    const usageCouloir = new Map()
    const prendre = cle => {
        const k = usageCouloir.get(cle) ?? 0
        usageCouloir.set(cle, k + 1)
        return k
    }
    const aretes = []
    for (const id of ids) {
        // Un fantome n'a pas de liens entrants : seul son lien vers le noeud filtre est trace.
        if (fantomes.has(id)) continue
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
            // Lien attenue s'il ne touche ni un noeud en cours ni un noeud "Ensuite".
            const actif = s => ['en-cours', 'ensuite'].includes(statuts.get(s))
            aretes.push({cle: `${p}-${id}`, de: p, vers: id, points, accent: statuts.get(id) === 'ensuite',
                attenue: (!actif(p) && !actif(id)) || fantomes.has(p), fantome: fantomes.has(p)})
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

// ---------------------------------------------------------------------------------------------
// Vue "Autour de moi" : trois colonnes (prerequis | noeuds centraux | ce qu'ils debloquent),
// chaque noeud dans la bande de son tk d'origine. Seuls les liens directs sont traces
// (prerequis -> centre, centre -> debloque). Chaque lien reste dans le couloir entre deux
// colonnes : sortie horizontale, couloir vertical propre au lien, entree horizontale (2 coudes
// au plus) ; il ne traverse donc jamais une carte. Points de sortie / d'entree espaces de 12px
// sur les cartes, couloirs espaces de 14px, ordonnes pour qu'aucun lien n'en longe un autre a
// moins de 12px. Un noeud peut figurer dans deux colonnes (ex. centre et prerequis d'un autre).

const PAS_PORT = 12
const PAS_COULOIR = 14
const MARGE_PORT = 8
const ECART_PILE = 28

const hauteurPour = n => Math.max(CARTE.hauteur, 2 * MARGE_PORT + (n - 1) * PAS_PORT)

// Ordonne les couloirs d'un canal. Contrainte : si le segment de sortie de A et le segment
// d'entree de B sont a moins de 12px en hauteur, le couloir de A doit etre a gauche de celui de B
// (sinon ils se recouvrent). Tri topologique ; a egalite, les liens les plus longs vers la cible.
function ordonnerCouloirs(liens) {
    const n = liens.length
    const avant = Array.from({length: n}, () => new Set())
    const degre = new Array(n).fill(0)
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
        if (a !== b && Math.abs(liens[a].ySortie - liens[b].yEntree) < PAS_PORT && !avant[a].has(b)) {
            avant[a].add(b)
            degre[b]++
        }
    }
    const longueur = i => Math.abs(liens[i].yEntree - liens[i].ySortie)
    const restants = new Set(liens.keys())
    const ordre = []
    while (restants.size) {
        let prets = [...restants].filter(i => degre[i] === 0)
        // Cycle (tres rare) : on le rompt sur le lien le plus court.
        if (!prets.length) prets = [[...restants].sort((a, b) => longueur(a) - longueur(b))[0]]
        prets.sort((a, b) => longueur(a) - longueur(b))
        const i = prets[0]
        restants.delete(i)
        ordre.push(i)
        for (const b of avant[i]) degre[b]--
    }
    return ordre
}

export function disposerAutour(modele, centres, {bandes: filtre = null} = {}) {
    const {parId, statuts, successeurs, ordre} = modele
    const choix = filtre?.length ? new Set(filtre) : null
    const garde = id => !choix || choix.has(parId.get(id).bande)

    // Liens directs : prerequis -> centre (prerequis hors filtre : fantomes), centre -> debloque.
    const centresGardes = [...centres].filter(garde)
    const liensG = [], liensD = []
    for (const c of centresGardes) {
        for (const p of parId.get(c).prerequis) if (parId.has(p)) liensG.push({de: p, vers: c})
        for (const s of successeurs.get(c)) if (garde(s)) liensD.push({de: c, vers: s})
    }
    const colonnes = [
        [...new Set(liensG.map(l => l.de))],
        centresGardes,
        [...new Set(liensD.map(l => l.vers))],
    ]
    // Nombre de liens par cote de carte, pour dimensionner sa hauteur (points espaces de 12px).
    const compte = new Map()
    const ajouter = (cle, n = 1) => compte.set(cle, (compte.get(cle) ?? 0) + n)
    for (const l of liensG) { ajouter(`0:${l.de}`); ajouter(`1:${l.vers}:g`) }
    for (const l of liensD) { ajouter(`1:${l.de}:d`); ajouter(`2:${l.vers}`) }
    // Cartes qui recoivent des liens : deux pas de plus, pour pouvoir decaler les points d'entree.
    const hauteurCarte = (k, id) => hauteurPour(k === 1
        ? Math.max((compte.get(`1:${id}:g`) ?? 0) * 2 + 1, compte.get(`1:${id}:d`) ?? 0, 1)
        : k === 2 ? (compte.get(`2:${id}`) ?? 1) * 2 + 1 : (compte.get(`0:${id}`) ?? 1))

    // Largeur des canaux : un couloir par lien.
    const largeurCanal = n => Math.max(ECART_COL, 2 * PAS_COULOIR + n * PAS_COULOIR)
    const x = [MARGE]
    x[1] = x[0] + CARTE.largeur + largeurCanal(liensG.length)
    x[2] = x[1] + CARTE.largeur + largeurCanal(liensD.length)

    // Bandes d'origine : dans chaque bande, chaque colonne empile ses noeuds de cette bande.
    const cartes = [], bandes = [], parCle = new Map()
    let y = MARGE
    for (const b of BANDES_CARTE) {
        const parColonne = colonnes.map(col => col.filter(id => parId.get(id).bande === b.id).sort(ordre))
        if (!parColonne.some(c => c.length)) continue
        const debut = y
        let hauteurBande = 0
        parColonne.forEach((liste, k) => {
            let yk = debut + ENTETE_BANDE
            for (const id of liste) {
                const h = hauteurCarte(k, id)
                const carte = {cle: `${id}#${k}`, id, x: x[k], y: yk, h, statut: statuts.get(id), fantome: !garde(id)}
                cartes.push(carte)
                parCle.set(carte.cle, carte)
                yk += h + ECART_PILE
            }
            hauteurBande = Math.max(hauteurBande, yk - ECART_PILE - debut)
        })
        const toutFantome = parColonne.flat().every(id => !garde(id))
        bandes.push({bande: b.id, nom: b.nom, y: debut, hauteur: hauteurBande + ECART_RANG, fantome: toutFantome})
        y = debut + hauteurBande + ECART_RANG + ECART_BANDE
    }

    // Points de sortie puis d'entree, dans l'ordre de l'autre extremite. Les points d'entree sont
    // places a au moins 12px de tous les points de sortie du meme couloir : un segment d'entree ne
    // peut alors jamais longer un segment de sortie, quel que soit l'ordre des couloirs.
    function ports(liens, cleSource, cleCible) {
        const sorties = new Map(), entrees = new Map()
        const grouper = (m, cle, e) => { if (!m.has(cle)) m.set(cle, []); m.get(cle).push(e) }
        for (const l of liens) {
            l.source = parCle.get(cleSource(l))
            l.cible = parCle.get(cleCible(l))
            grouper(sorties, l.source.cle, l)
            grouper(entrees, l.cible.cle, l)
        }
        const milieu = c => c.y + c.h / 2
        for (const [cle, liste] of sorties) {
            const carte = parCle.get(cle)
            liste.sort((a, b) => milieu(a.cible) - milieu(b.cible))
            liste.forEach((l, i) => { l.ySortie = milieu(carte) + (i - (liste.length - 1) / 2) * PAS_PORT })
        }
        const ysSortie = liens.map(l => l.ySortie)
        const libre = (y, pris) => ysSortie.every(o => Math.abs(o - y) >= PAS_PORT) && pris.every(o => Math.abs(o - y) >= PAS_PORT)
        for (const [cle, liste] of entrees) {
            const carte = parCle.get(cle)
            liste.sort((a, b) => milieu(a.source) - milieu(b.source))
            const pris = []
            liste.forEach((l, i) => {
                const ideal = milieu(carte) + (i - (liste.length - 1) / 2) * PAS_PORT
                const haut = carte.y + MARGE_PORT, bas = carte.y + carte.h - MARGE_PORT
                // Candidats de plus en plus eloignes de la position ideale, par pas de 2px.
                let y = ideal
                for (let d = 0; d <= carte.h; d += 2) {
                    const c = [ideal + d, ideal - d].find(v => v >= haut && v <= bas && libre(v, pris))
                    if (c !== undefined) { y = c; break }
                }
                pris.push(y)
                l.yEntree = y
            })
        }
    }
    ports(liensG, l => `${l.de}#0`, l => `${l.vers}#1`)
    ports(liensD, l => `${l.de}#1`, l => `${l.vers}#2`)

    const aretes = []
    const tracer = (liens, xa, xb) => {
        const ordreCouloirs = ordonnerCouloirs(liens)
        ordreCouloirs.forEach((i, rang) => { liens[i].xCouloir = xa + PAS_COULOIR * (rang + 1) })
        for (const l of liens) {
            // Toujours via son couloir (meme aligne) : la regle d'ordre des couloirs s'applique a tous.
            const points = Math.abs(l.ySortie - l.yEntree) < 0.5
                ? [[xa, l.ySortie], [l.xCouloir, l.ySortie], [xb, l.yEntree]]
                : [[xa, l.ySortie], [l.xCouloir, l.ySortie], [l.xCouloir, l.yEntree], [xb, l.yEntree]]
            aretes.push({cle: `${l.source.cle}>${l.cible.cle}`, de: l.de, vers: l.vers, versCle: l.cible.cle, points,
                accent: statuts.get(l.vers) === 'ensuite', attenue: l.source.fantome, fantome: l.source.fantome})
        }
    }
    tracer(liensG, x[0] + CARTE.largeur, x[1])
    tracer(liensD, x[1] + CARTE.largeur, x[2])
    aretes.sort((a, b) => Number(a.accent) - Number(b.accent))

    // Colonnes vides (ex. aucun prerequis) : la largeur suit les colonnes reellement utilisees.
    const derniere = colonnes[2].length ? 2 : colonnes[1].length ? 1 : 0
    return {largeur: x[derniere] + CARTE.largeur + MARGE, hauteur: Math.max(y - ECART_BANDE, MARGE) + MARGE, cartes, aretes, bandes}
}
