// Tests du parcours prive (modele et disposition), sans navigateur : node --test tests/
import {test} from 'node:test'
import assert from 'node:assert/strict'
import * as carte from '../src/components/PrereqMap/prereqMapData.js'
import {IDS_BANDES, RAILS, autourDeMoi, avancement, construireModele, filtrerParBandes, voisinage} from '../src/lib/parcours/modele.js'
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

// ---------------------------------------------------------------------------------------------
// Bandes d'origine et filtre par bande

const tk = Object.fromEntries(carte.NODES.map(n => [n.id, n.tk]))

// Chaque carte est dans la bande de son tk d'origine (geometriquement et par l'etiquette).
function verifierBandes(d) {
    for (const c of d.cartes) {
        const b = d.bandes.find(x => c.y >= x.y && c.y + c.h <= x.y + x.hauteur)
        assert.ok(b, `${c.cle} hors de toute bande`)
        assert.equal(b.bande, tk[c.id], `${c.cle} (${tk[c.id]}) place dans la bande ${b.bande}`)
    }
    assert.ok(d.bandes.every(b => d.cartes.some(c => c.y >= b.y && c.y < b.y + b.hauteur)), 'bande vide affichee')
}

function verifierAucuneTraversee(d) {
    for (const a of d.aretes) for (const s of segments(a.points)) for (const c of d.cartes) {
        assert.ok(!traverse(s, c), `${a.cle} traverse ${c.cle}`)
    }
}

test('bandes d origine : chaque noeud dans la bande de son tk (carte complete et Autour de moi)', () => {
    for (let g = 0; g <= 15; g++) {
        const m = construireModele(g ? etatsAleatoires(g) : base)
        verifierBandes(disposer(m, base.map(n => n.id)))
        verifierBandes(disposerAutour(m, autourDeMoi(m).centres))
    }
})

test('donnees et mise en production : D1, D3, D4 et leurs liens d origine', () => {
    const m = construireModele(base)
    const d = disposer(m, base.map(n => n.id))
    const bandeDe = id => d.bandes.find(b => b.membres.includes(id))?.nom
    for (const id of ['d1', 'd2', 'mlops']) assert.equal(bandeDe(id), 'Données et mise en production')
    const liens = new Set(d.aretes.map(a => `${a.de}>${a.vers}`))
    // Liens d'origine de prereqMapData.js (aucun lien de D1/D3/D4 vers le filtre documentaire NLP
    // n'existe dans les donnees : p_nlp ne depend que de nlp).
    for (const l of ['d1>mlops', 'd1>d2', 'd2>pj_us', 'd1>p_fraud', 'd1>pj_eda']) assert.ok(liens.has(l), `lien ${l} absent`)
})

// Filtre : seuls les noeuds des bandes choisies, plus des fantomes qui sont de vrais prerequis.
function verifierFiltre(m, d, bandes) {
    const choix = new Set(bandes)
    for (const c of d.cartes) {
        if (choix.has(tk[c.id])) {
            assert.ok(!c.fantome, `${c.cle} marque fantome alors qu il est dans le filtre`)
        } else {
            assert.ok(c.fantome, `${c.cle} (${tk[c.id]}) affiche hors filtre ${bandes}`)
            const sert = d.cartes.some(v => !v.fantome && m.parId.get(v.id).prerequis.includes(c.id))
            assert.ok(sert, `fantome ${c.cle} qui n est le prerequis d aucun noeud affiche`)
        }
    }
    for (const a of d.aretes) {
        const cible = a.versCle ? d.cartes.find(c => c.cle === a.versCle) : d.cartes.find(c => c.id === a.vers)
        assert.ok(cible && !cible.fantome, `lien vers un fantome ${a.cle}`)
    }
    verifierAucuneTraversee(d)
    verifierBandes(d)
}

const FILTRES = [...IDS_BANDES.map(b => [b]), ['math', 'ml']]

test('filtre par bande, carte complete : chaque bande seule et Maths + ML / DL', () => {
    for (let g = 0; g <= 10; g++) {
        const m = construireModele(g ? etatsAleatoires(g) : base)
        for (const bandes of FILTRES) {
            // Par defaut : aucune autre bande, aucun fantome.
            const sans = filtrerParBandes(m, base.map(n => n.id), bandes)
            const d0 = disposer(m, sans.ids, {fantomes: sans.fantomes})
            assert.ok(d0.cartes.every(c => bandes.includes(tk[c.id]) && !c.fantome), `noeud hors filtre ${bandes}`)
            assert.ok(d0.bandes.every(b => bandes.includes(b.bande)), `bande hors filtre affichee pour ${bandes}`)
            verifierFiltre(m, d0, bandes)
            // Avec les prerequis externes : fantomes = prerequis directs uniquement.
            const {ids, fantomes} = filtrerParBandes(m, base.map(n => n.id), bandes, {externes: true})
            verifierFiltre(m, disposer(m, ids, {fantomes}), bandes)
        }
    }
})

test('filtre par bande, Autour de moi : chaque bande seule et Maths + ML / DL, 2 coudes max', () => {
    for (let g = 1; g <= 20; g++) {
        const m = construireModele(etatsAleatoires(g))
        for (const bandes of FILTRES) {
            const d0 = disposerAutour(m, autourDeMoi(m).centres, {bandes})
            assert.ok(d0.cartes.every(c => bandes.includes(tk[c.id])), `Autour : noeud hors filtre ${bandes}`)
            verifierFiltre(m, d0, bandes)
            const d = disposerAutour(m, autourDeMoi(m).centres, {bandes, externes: true})
            verifierFiltre(m, d, bandes)
            for (const a of d.aretes) assert.ok(a.points.length - 2 <= 2, `plus de 2 coudes ${a.cle}`)
        }
    }
})

test('voisinage : liens directs, puis chaine complete en amont et en aval', () => {
    const m = construireModele(base)
    const direct = voisinage(m, 'ml3')
    assert.deepEqual([...direct.amont].sort(), [...m.parId.get('ml3').prerequis].sort())
    assert.deepEqual([...direct.aval].sort(), [...m.successeurs.get('ml3')].sort())
    const chaine = voisinage(m, 'ml3', true)
    // m1 est un prerequis indirect (ml1 -> ml3 via m1 -> ml1) ; p_trader est debloque indirectement.
    assert.ok(chaine.amont.has('m1') && chaine.amont.size >= direct.amont.size)
    assert.ok(chaine.aval.has('p_trader') && !direct.aval.has('p_trader'))
    assert.ok(!chaine.amont.has('ml3') && !chaine.aval.has('ml3'))
})
