// Disposition de la carte du parcours (module pur).
// - Une bande horizontale par rail, lecture de gauche a droite (colonne = profondeur).
// - Les cartes occupent une grille reguliere : toutes les colonnes d'une bande partagent les
//   memes rangees. Les fleches ne circulent que dans les couloirs (entre deux colonnes, ou entre
//   deux rangees) : elles ne traversent donc jamais une carte.
// - Fleches a angles droits : sortie a droite de la source, couloir vertical, couloir horizontal
//   au-dessus de la rangee de la cible, couloir vertical avant la cible, entree a gauche.
import {RAILS} from './modele.js'

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
    const cartes = ids.map(id => ({cle: id, id, ...position(id), h: CARTE.hauteur, statut: statuts.get(id)}))

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
            // Lien attenue s'il ne touche ni un noeud en cours ni un noeud "Ensuite".
            const actif = s => ['en-cours', 'ensuite'].includes(statuts.get(s))
            aretes.push({cle: `${p}-${id}`, de: p, vers: id, points, accent: statuts.get(id) === 'ensuite', attenue: !actif(p) && !actif(id)})
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
// Vue "Autour de moi" : une grappe par noeud central (en cours, ou point d'entree "Ensuite").
// Prerequis a gauche, noeud central au milieu, ce qu'il debloque a droite. Seuls les liens
// directs sont traces (prerequis -> centre, centre -> debloque) : chaque lien n'enjambe qu'un
// couloir, avec au plus 2 coudes, sur un couloir vertical qui lui est propre (aucun "bus").
// Un noeud partage par deux centres apparait dans chacune des deux grappes.

const PAS_PORT = 12      // ecart entre deux points d'arrivee sur le bord du centre
const PAS_COULOIR = 14   // ecart entre deux couloirs verticaux
const MARGE_PORT = 8
const ECART_GRAPPE = 40

// Hauteur du centre : assez de points d'arrivee/depart, espaces de PAS_PORT.
function hauteurCentre(n) {
    return Math.max(CARTE.hauteur, 2 * MARGE_PORT + (n - 1) * PAS_PORT)
}

// Liens d'un cote : sources (ordonnees ys) vers une cible (bord vertical x = xb, de ty a ty + th),
// en partant du bord x = xa. Points d'arrivee repartis autour du centre de la cible, dans l'ordre
// des sources (pas de croisement) ; couloir propre a chaque lien, le plus eloigne pres de la cible
// (liens imbriques). Un lien deja aligne reste droit (0 coude).
function eventail(ys, xa, xb, ty, th) {
    const ordre = ys.map((y, i) => ({y, i})).sort((a, b) => a.y - b.y)
    const n = ordre.length
    const milieu = ty + th / 2
    const ports = ordre.map((_, k) => milieu + (k - (n - 1) / 2) * PAS_PORT)
    const liens = ordre.map((o, k) => ({i: o.i, y: o.y, port: ports[k], dist: Math.abs(o.y - ports[k])}))
    const coudes = liens.filter(l => l.dist > 0.5).sort((a, b) => b.dist - a.dist)
    coudes.forEach((l, j) => { l.x = xb - PAS_COULOIR - j * PAS_COULOIR })
    const resultat = []
    for (const l of liens) {
        resultat[l.i] = l.dist <= 0.5
            ? [[xa, l.y], [xb, l.y]]
            : [[xa, l.y], [l.x, l.y], [l.x, l.port], [xb, l.port]]
    }
    return {points: resultat, couloirs: coudes.length}
}

export function disposerAutour(modele, centres) {
    const {parId, rails, statuts, successeurs, ordre} = modele
    const grappes = [...centres].sort((a, b) => {
        const ra = RAILS.findIndex(r => r.id === rails.get(a)), rb = RAILS.findIndex(r => r.id === rails.get(b))
        return ra - rb || ordre(a, b)
    }).map(c => ({
        centre: c,
        rail: rails.get(c),
        gauche: parId.get(c).prerequis.filter(p => parId.has(p)).sort(ordre),
        droite: [...successeurs.get(c)].sort(ordre),
    }))

    // Largeur des couloirs : assez pour un couloir par lien (le plus charge de tous).
    const largeurCouloir = n => Math.max(ECART_COL, 2 * PAS_COULOIR + n * PAS_COULOIR)
    const cg = largeurCouloir(Math.max(0, ...grappes.map(g => g.gauche.length)))
    const cd = largeurCouloir(Math.max(0, ...grappes.map(g => g.droite.length)))
    const x0 = MARGE, x1 = x0 + CARTE.largeur + cg, x2 = x1 + CARTE.largeur + cd
    const pile = n => n * CARTE.hauteur + Math.max(0, n - 1) * ECART_RANG

    const cartes = [], aretes = [], bandes = []
    let y = MARGE
    for (const rail of RAILS) {
        const duRail = grappes.filter(g => g.rail === rail.id)
        if (!duRail.length) continue
        const debut = y
        y += ENTETE_BANDE
        for (const g of duRail) {
            const hc = hauteurCentre(Math.max(g.gauche.length, g.droite.length, 1))
            const hg = Math.max(pile(g.gauche.length), pile(g.droite.length), hc)
            const yc = y + (hg - hc) / 2
            cartes.push({cle: `${g.centre}@${g.centre}`, id: g.centre, x: x1, y: yc, h: hc, statut: statuts.get(g.centre)})
            const placer = (liste, x) => {
                const haut = y + (hg - pile(liste.length)) / 2
                return liste.map((id, k) => {
                    const c = {cle: `${id}@${g.centre}`, id, x, y: haut + k * (CARTE.hauteur + ECART_RANG), h: CARTE.hauteur, statut: statuts.get(id)}
                    cartes.push(c)
                    return c
                })
            }
            const gauche = placer(g.gauche, x0)
            const droite = placer(g.droite, x2)
            const milieu = c => c.y + CARTE.hauteur / 2
            // Prerequis -> centre
            const eg = eventail(gauche.map(milieu), x0 + CARTE.largeur, x1, yc, hc)
            gauche.forEach((c, k) => aretes.push({cle: `${c.cle}>${g.centre}`, de: c.id, vers: g.centre, points: eg.points[k],
                accent: statuts.get(g.centre) === 'ensuite', attenue: false}))
            // Centre -> ce qu'il debloque : meme calcul en miroir (x inverses), puis remis a l'endroit.
            const ed = eventail(droite.map(milieu), -x2, -(x1 + CARTE.largeur), yc, hc)
            droite.forEach((c, k) => aretes.push({cle: `${g.centre}>${c.cle}`, de: g.centre, vers: c.id,
                points: ed.points[k].map(([px, py]) => [-px, py]).reverse(),
                accent: statuts.get(c.id) === 'ensuite', attenue: false}))
            y += hg + ECART_GRAPPE
        }
        y += ECART_BANDE - ECART_GRAPPE + ECART_RANG
        bandes.push({rail: rail.id, nom: rail.nom, y: debut, hauteur: y - debut - ECART_BANDE})
    }
    aretes.sort((a, b) => Number(a.accent) - Number(b.accent))
    return {largeur: x2 + CARTE.largeur + MARGE, hauteur: y - ECART_BANDE + MARGE, cartes, aretes, bandes}
}
