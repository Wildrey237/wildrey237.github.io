// Disposition de la carte du parcours pour React Flow (module pur, sans React).
// - Une bande horizontale par bande d'origine de prereqMapData.js, dans l'ordre de BANDES_CARTE
//   (Maths, ML / DL, Graphes, Algo, Donnees et mise en production, Projets).
// - Colonne = `col` d'origine (progression de gauche a droite, comme l'ancienne ml-map), compactee
//   sur les colonnes reellement affichees ; dans une bande, les `row` d'origine sont compactees en
//   rangees successives (les projets, intercales entre les bandes a l'origine, ont la leur).
// - Chaque lien a son propre trace : un port de sortie et un port d'entree par lien (espaces sur
//   la hauteur de la carte) et un couloir vertical (centreX) propre a chaque lien, juste avant la
//   colonne de sa cible.
import {BANDES_CARTE} from './modele.js'

export const CARTE = {largeur: 220, hauteur: 72}
const ECART_COL = 112     // couloir entre deux colonnes (couloirs verticaux des liens)
const ECART_RANG = 28
const ENTETE_BANDE = 36   // etiquette de la bande
const ECART_BANDE = 16
const MARGE = 32
const PAS_COULOIR = 8
const MARGE_COULOIR = 14

// fantomes : prerequis venus d'une bande filtree, affiches en contexte (sans leurs propres liens).
export function disposerFlux(modele, ids, {fantomes = new Set()} = {}) {
    const {parId, statuts, ordre} = modele
    const garde = new Set(ids)

    const colonnes = [...new Set(ids.map(id => parId.get(id).col))].sort((a, b) => a - b)
    const xCol = c => MARGE + colonnes.indexOf(c) * (CARTE.largeur + ECART_COL)
    const largeur = colonnes.length ? xCol(colonnes.at(-1)) + CARTE.largeur + MARGE : 0

    const noeuds = [], bandes = [], position = new Map()
    let y = MARGE
    for (const b of BANDES_CARTE) {
        const membres = ids.filter(id => parId.get(id).bande === b.id).sort(ordre)
        if (!membres.length) continue
        const rangees = [...new Set(membres.map(id => parId.get(id).row))].sort((a, b2) => a - b2)
        const hauteur = ENTETE_BANDE + rangees.length * CARTE.hauteur + (rangees.length - 1) * ECART_RANG + ECART_RANG
        for (const id of membres) {
            const n = parId.get(id)
            const p = {x: xCol(n.col), y: y + ENTETE_BANDE + rangees.indexOf(n.row) * (CARTE.hauteur + ECART_RANG)}
            position.set(id, p)
            noeuds.push({id, ...p, bande: b.id, statut: statuts.get(id), fantome: fantomes.has(id)})
        }
        bandes.push({bande: b.id, nom: b.nom, y, hauteur, fantome: membres.every(id => fantomes.has(id))})
        y += hauteur + ECART_BANDE
    }

    // Liens prerequis -> noeud. Un fantome n'a pas de liens entrants.
    const actif = s => ['en-cours', 'ensuite'].includes(statuts.get(s))
    const liens = []
    for (const id of ids) {
        if (fantomes.has(id)) continue
        for (const p of parId.get(id).prerequis) {
            if (!garde.has(p)) continue
            liens.push({
                id: `${p}-${id}`, source: p, target: id,
                accent: statuts.get(id) === 'ensuite', attenue: (!actif(p) && !actif(id)) || fantomes.has(p),
                fantome: fantomes.has(p),
            })
        }
    }

    // Ports : sorties triees par hauteur de la cible, entrees par hauteur de la source (moins de
    // croisements). Port i sur n : a (i + 1) / (n + 1) de la hauteur de la carte.
    const ports = new Map(noeuds.map(n => [n.id, {sorties: 0, entrees: 0}]))
    const parSource = new Map(), parCible = new Map()
    for (const l of liens) {
        if (!parSource.has(l.source)) parSource.set(l.source, [])
        if (!parCible.has(l.target)) parCible.set(l.target, [])
        parSource.get(l.source).push(l)
        parCible.get(l.target).push(l)
    }
    const cle = pos => pos.y * 10000 + pos.x
    for (const [id, liste] of parSource) {
        liste.sort((a, b) => cle(position.get(a.target)) - cle(position.get(b.target)))
        liste.forEach((l, i) => { l.sortie = i })
        ports.get(id).sorties = liste.length
    }
    for (const [id, liste] of parCible) {
        liste.sort((a, b) => cle(position.get(a.source)) - cle(position.get(b.source)))
        liste.forEach((l, i) => { l.entree = i })
        ports.get(id).entrees = liste.length
    }
    for (const n of noeuds) n.ports = ports.get(n.id)

    // Couloir vertical de chaque lien : dans l'espace avant la colonne de sa cible, un par lien.
    // Lien vers une carte de la meme colonne (ex. un projet sous son cours) : pas de couloir
    // impose, le trace "smoothstep" contourne les cartes de lui-meme.
    const parCouloir = new Map()
    for (const l of liens) {
        if (position.get(l.source).x >= position.get(l.target).x) continue
        const c = position.get(l.target).x
        if (!parCouloir.has(c)) parCouloir.set(c, [])
        parCouloir.get(c).push(l)
    }
    const places = Math.floor((ECART_COL - 2 * MARGE_COULOIR) / PAS_COULOIR) + 1
    for (const [x, liste] of parCouloir) {
        // Les liens qui descendent le plus loin prennent les couloirs les plus proches de la cible.
        liste.sort((a, b) => (position.get(a.target).y - position.get(a.source).y) - (position.get(b.target).y - position.get(b.source).y))
        liste.forEach((l, k) => { l.centreX = x - MARGE_COULOIR - (k % places) * PAS_COULOIR })
    }

    return {largeur, hauteur: y - ECART_BANDE + MARGE, noeuds, liens, bandes}
}

// Hauteur (en px, dans la carte) d'un port i sur n.
export const hauteurPort = (i, n) => ((i + 1) / (n + 1)) * CARTE.hauteur

// Rectangle englobant des noeuds dont l'id est dans `ids` (tous si ids est absent).
export function englobant(noeuds, ids) {
    const liste = noeuds.filter(n => !ids || ids.has(n.id))
    if (!liste.length) return null
    return {
        x0: Math.min(...liste.map(n => n.x)), y0: Math.min(...liste.map(n => n.y)),
        x1: Math.max(...liste.map(n => n.x + CARTE.largeur)), y1: Math.max(...liste.map(n => n.y + CARTE.hauteur)),
    }
}

// Cadrage initial : noeuds en cours et leurs voisins directs presents ; sinon la premiere colonne.
export function cibleInitiale(modele, noeuds) {
    const presents = new Set(noeuds.map(n => n.id))
    const ids = new Set()
    for (const n of noeuds) {
        if (n.statut !== 'en-cours' || n.fantome) continue
        ids.add(n.id)
        for (const v of [...modele.parId.get(n.id).prerequis, ...modele.successeurs.get(n.id)]) if (presents.has(v)) ids.add(v)
    }
    if (ids.size) return ids
    const xMin = Math.min(...noeuds.map(n => n.x))
    return new Set(noeuds.filter(n => n.x === xMin).map(n => n.id))
}

// Vue {x, y, zoom} qui cadre un rectangle dans une zone (l x h).
// - S'il tient a un zoom >= zoomMin : zoom ajuste (au plus zoomMax), rectangle centre (ou cale a
//   gauche avec aGauche, ex. premiere colonne : la lecture se fait vers la droite).
// - Sinon : rien ne sert de reduire, zoom 100 % (texte lisible), cale en haut a gauche.
export function vuePour(r, l, h, {zoomMin = 0.8, zoomMax = 1.25, marge = 40, aGauche = false} = {}) {
    const bw = r.x1 - r.x0 + 2 * marge, bh = r.y1 - r.y0 + 2 * marge
    const ajuste = Math.min(l / bw, h / bh)
    const zoom = ajuste >= zoomMin ? Math.min(zoomMax, ajuste) : Math.max(zoomMin, 1)
    const x = (aGauche ? 0 : Math.max((l - bw * zoom) / 2, 0)) - (r.x0 - marge) * zoom
    const y = Math.max((h - bh * zoom) / 2, 0) - (r.y0 - marge) * zoom
    return {x, y, zoom}
}

// Vue apres un clic : cadre le noeud et ses voisins (zoom jamais sous zoomMin, jamais au-dessus
// du zoom actuel ni de 100 %). Si les voisins ne tiennent pas, le centre se rapproche du noeud
// pour que celui-ci reste toujours entierement visible.
export function vueSelection(voisins, noeud, l, h, zoomActuel, {zoomMin = 0.8, marge = 32} = {}) {
    const bw = voisins.x1 - voisins.x0 + 2 * marge, bh = voisins.y1 - voisins.y0 + 2 * marge
    const plafond = Math.max(zoomMin, Math.min(zoomActuel, 1))
    const zoom = Math.max(zoomMin, Math.min(plafond, l / bw, h / bh))
    // Centre ideal : celui des voisins ; borne pour garder le noeud (et une marge) dans la vue.
    const demiL = l / 2 / zoom, demiH = h / 2 / zoom
    const borne = (c, a, b, demi) => Math.min(Math.max(c, b + marge - demi), a - marge + demi)
    const cx = borne((voisins.x0 + voisins.x1) / 2, noeud.x0, noeud.x1, demiL)
    const cy = borne((voisins.y0 + voisins.y1) / 2, noeud.y0, noeud.y1, demiH)
    return {x: l / 2 - cx * zoom, y: h / 2 - cy * zoom, zoom}
}
