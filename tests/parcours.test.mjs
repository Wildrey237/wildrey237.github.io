// Tests du parcours prive (modele et disposition), sans navigateur : node --test tests/
import {test} from 'node:test'
import assert from 'node:assert/strict'
import * as carte from '../src/components/PrereqMap/prereqMapData.js'
import {RAILS, autourDeMoi, avancement, construireModele} from '../src/lib/parcours/modele.js'
import {CARTE, disposer, disposerAutour} from '../src/lib/parcours/disposition.js'

const ETATS = ['non commence', 'en cours', 'maitrise']
const base = carte.NODES.map(n => ({id: n.id, bande: n.tk, col: n.col, row: n.row, titre: n.t, prerequis: n.p ?? [], etat: 'non commence'}))

// Generateur pseudo-aleatoire reproductible.
function etatsAleatoires(graine) {
    let s = graine
    const alea = () => (s = (s * 16807) % 2147483647) / 2147483647
    return base.map(n => ({...n, etat: ETATS[Math.floor(alea() * 3)]}))
}

// Segments d'un trace (polyligne orthogonale).
const segments = pts => pts.slice(1).map((q, i) => [pts[i], q])
const horizontal = ([a, b]) => Math.abs(a[1] - b[1]) < 0.01
const traverse = ([[x1, y1], [x2, y2]], r) => {
    const [a, b] = [Math.min(x1, x2), Math.max(x1, x2)], [c, d] = [Math.min(y1, y2), Math.max(y1, y2)]
    return a < r.x + CARTE.largeur - 0.5 && b > r.x + 0.5 && c < r.y + r.h - 0.5 && d > r.y + 0.5
}
// Deux segments paralleles trop proches (moins de 12px) qui se recouvrent.
function tropProches(s1, s2) {
    if (horizontal(s1) !== horizontal(s2)) return false
    const [axe, autre] = horizontal(s1) ? [1, 0] : [0, 1]
    if (Math.abs(s1[0][axe] - s2[0][axe]) >= 12) return false
    const [a1, b1] = [Math.min(s1[0][autre], s1[1][autre]), Math.max(s1[0][autre], s1[1][autre])]
    const [a2, b2] = [Math.min(s2[0][autre], s2[1][autre]), Math.max(s2[0][autre], s2[1][autre])]
    return Math.min(b1, b2) - Math.max(a1, a2) > 0.5
}

function verifierAutour(modele) {
    const {centres} = autourDeMoi(modele)
    const d = disposerAutour(modele, centres)
    const centresSet = new Set(centres)
    for (const a of d.aretes) {
        // Liens directs uniquement : un bout est un centre, et le lien est un vrai prerequis.
        assert.ok(centresSet.has(a.de) || centresSet.has(a.vers), `lien indirect ${a.de} -> ${a.vers}`)
        assert.ok(modele.parId.get(a.vers).prerequis.includes(a.de), `lien qui n'est pas un prerequis ${a.de} -> ${a.vers}`)
        assert.ok(a.points.length - 2 <= 2, `plus de 2 coudes ${a.cle}`)
        assert.ok(a.points.at(-1)[0] > a.points[0][0], `lien vers la gauche ${a.cle}`)
        for (const s of segments(a.points)) for (const c of d.cartes) assert.ok(!traverse(s, c), `${a.cle} traverse ${c.cle}`)
    }
    for (let i = 0; i < d.aretes.length; i++) for (let j = i + 1; j < d.aretes.length; j++) {
        for (const s1 of segments(d.aretes[i].points)) for (const s2 of segments(d.aretes[j].points)) {
            assert.ok(!tropProches(s1, s2), `${d.aretes[i].cle} et ${d.aretes[j].cle} paralleles a moins de 12px`)
        }
    }
    for (let i = 0; i < d.cartes.length; i++) for (let j = i + 1; j < d.cartes.length; j++) {
        const p = d.cartes[i], q = d.cartes[j]
        assert.ok(!(p.x < q.x + CARTE.largeur && q.x < p.x + CARTE.largeur && p.y < q.y + q.h && q.y < p.y + p.h), `${p.cle} chevauche ${q.cle}`)
    }
}

test('compteurs des rails : seuls les noeuds de cours comptent', () => {
    const m = construireModele(base)
    const totaux = Object.fromEntries(RAILS.map(r => [r.nom, avancement(m, r.id).total]))
    assert.deepEqual(totaux, {'IA & ML': 24, Maths: 7, Algo: 11})
})

test('compteurs : maitrises et en cours ignorent les projets d apprentissage', () => {
    const noeuds = base.map(n => ['m1', 'pj_acp'].includes(n.id) ? {...n, etat: 'maitrise'} : n.id === 'pj_gd' ? {...n, etat: 'en cours'} : n)
    const a = avancement(construireModele(noeuds), 'maths')
    assert.equal(a.maitrises, 1)
    assert.equal(a.enCours, 0)
})

test('Autour de moi : rien en cours (points d entree)', () => verifierAutour(construireModele(base)))

test('Autour de moi : liens directs, 2 coudes max, aucun croisement de carte, 12px entre paralleles (40 etats)', () => {
    for (let g = 1; g <= 40; g++) verifierAutour(construireModele(etatsAleatoires(g)))
})

test('carte complete : aucune fleche ne traverse une carte ; liens hors en cours / ensuite attenues', () => {
    for (let g = 1; g <= 10; g++) {
        const m = construireModele(etatsAleatoires(g))
        const d = disposer(m, base.map(n => n.id))
        for (const a of d.aretes) {
            for (const s of segments(a.points)) for (const c of d.cartes) assert.ok(!traverse(s, c), `${a.cle} traverse ${c.id}`)
            const actif = id => ['en-cours', 'ensuite'].includes(m.statuts.get(id))
            assert.equal(a.attenue, !actif(a.de) && !actif(a.vers))
        }
    }
})
