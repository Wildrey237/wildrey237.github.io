// Tests du parcours prive (modele et disposition React Flow), sans navigateur : node --test tests/
import {test} from 'node:test'
import assert from 'node:assert/strict'
import * as carte from '../src/components/PrereqMap/prereqMapData.js'
import {BANDES_CARTE, IDS_BANDES, RAILS, autourDeMoi, avancement, construireModele, filtrerParBandes, rattachement, voisinage} from '../src/lib/parcours/modele.js'
import {CARTE, cibleInitiale, disposerFlux, englobant, hauteurPort, vuePour, vueSelection} from '../src/lib/parcours/flux.js'

const ETATS = ['non commence', 'en cours', 'maitrise']
const base = carte.NODES.map(n => ({id: n.id, bande: n.tk, col: n.col, row: n.row, titre: n.t, prerequis: n.p ?? [], etat: 'non commence'}))
const tous = base.map(n => n.id)

// Generateur pseudo-aleatoire reproductible.
function etatsAleatoires(graine) {
    let s = graine
    const alea = () => (s = (s * 16807) % 2147483647) / 2147483647
    return base.map(n => ({...n, etat: ETATS[Math.floor(alea() * 3)]}))
}

const tk = Object.fromEntries(carte.NODES.map(n => [n.id, n.tk]))
const col = Object.fromEntries(carte.NODES.map(n => [n.id, n.col]))

// Invariants de disposition : aucune carte ne se chevauche ; chaque carte dans la bande de son tk ;
// bandes dans l'ordre Maths, ML / DL, Graphes, Algo, Donnees, Projets ; x croissant avec col ;
// un port par lien de chaque cote ; un couloir par lien dans chaque espace entre colonnes.
function verifierDisposition(d) {
    for (let i = 0; i < d.noeuds.length; i++) for (let j = i + 1; j < d.noeuds.length; j++) {
        const p = d.noeuds[i], q = d.noeuds[j]
        assert.ok(!(Math.abs(p.x - q.x) < CARTE.largeur && Math.abs(p.y - q.y) < CARTE.hauteur), `${p.id} chevauche ${q.id}`)
    }
    for (const n of d.noeuds) {
        const b = d.bandes.find(x => n.y >= x.y && n.y + CARTE.hauteur <= x.y + x.hauteur)
        assert.ok(b, `${n.id} hors de toute bande`)
        assert.equal(b.bande, tk[n.id], `${n.id} (${tk[n.id]}) place dans la bande ${b.bande}`)
    }
    const ordre = BANDES_CARTE.map(b => b.id)
    const affichees = d.bandes.map(b => b.bande)
    assert.deepEqual(affichees, ordre.filter(b => affichees.includes(b)), 'ordre des bandes')
    for (let i = 1; i < d.bandes.length; i++) assert.ok(d.bandes[i].y >= d.bandes[i - 1].y + d.bandes[i - 1].hauteur, 'bandes superposees')
    for (const p of d.noeuds) for (const q of d.noeuds) {
        if (col[p.id] < col[q.id]) assert.ok(p.x < q.x, `${p.id} (col ${col[p.id]}) a droite de ${q.id} (col ${col[q.id]})`)
    }
    const parCote = new Map()
    for (const l of d.liens) {
        for (const [cle, port, n] of [[`${l.source}>`, l.sortie, d.noeuds.find(x => x.id === l.source).ports.sorties],
            [`>${l.target}`, l.entree, d.noeuds.find(x => x.id === l.target).ports.entrees]]) {
            assert.ok(port >= 0 && port < n, `port hors limites ${l.id}`)
            if (!parCote.has(cle)) parCote.set(cle, new Set())
            assert.ok(!parCote.get(cle).has(port), `port partage ${cle} ${port}`)
            parCote.get(cle).add(port)
            assert.ok(hauteurPort(port, n) > 0 && hauteurPort(port, n) < CARTE.hauteur)
        }
    }
    const couloirs = new Map()
    for (const l of d.liens.filter(l => l.centreX !== undefined)) {
        const cible = d.noeuds.find(x => x.id === l.target)
        assert.ok(l.centreX < cible.x && l.centreX > cible.x - 112, `couloir hors de l espace avant la cible ${l.id}`)
        const k = `${cible.x}:${l.centreX}`
        couloirs.set(k, (couloirs.get(k) ?? 0) + 1)
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

test('carte complete : 74 cartes, disposition valide (etats aleatoires)', () => {
    for (let g = 0; g <= 10; g++) {
        const d = disposerFlux(construireModele(g ? etatsAleatoires(g) : base), tous)
        assert.equal(d.noeuds.length, 74)
        verifierDisposition(d)
    }
})

test('Autour de moi : disposition valide sur le sous-ensemble (40 etats)', () => {
    for (let g = 0; g <= 40; g++) {
        const m = construireModele(g ? etatsAleatoires(g) : base)
        verifierDisposition(disposerFlux(m, autourDeMoi(m).ids))
    }
})

test('donnees et mise en production : D1, D3, D4 et leurs liens d origine', () => {
    const d = disposerFlux(construireModele(base), tous)
    const bande = d.bandes.find(b => b.bande === 'data')
    assert.equal(bande.nom, 'Données et mise en production')
    for (const id of ['d1', 'd2', 'mlops']) assert.equal(d.noeuds.find(n => n.id === id).bande, 'data')
    const liens = new Set(d.liens.map(l => `${l.source}>${l.target}`))
    for (const l of ['d1>mlops', 'd1>d2', 'd2>pj_us', 'd1>p_fraud', 'd1>pj_eda']) assert.ok(liens.has(l), `lien ${l} absent`)
})

// Filtre : seuls les noeuds des bandes choisies, plus des fantomes qui sont de vrais prerequis.
function verifierFiltre(m, d, bandes) {
    const choix = new Set(bandes)
    for (const n of d.noeuds) {
        if (choix.has(tk[n.id])) {
            assert.ok(!n.fantome, `${n.id} marque fantome alors qu il est dans le filtre`)
        } else {
            assert.ok(n.fantome, `${n.id} (${tk[n.id]}) affiche hors filtre ${bandes}`)
            assert.ok(d.noeuds.some(v => !v.fantome && m.parId.get(v.id).prerequis.includes(n.id)), `fantome ${n.id} inutile`)
        }
    }
    for (const l of d.liens) assert.ok(!d.noeuds.find(n => n.id === l.target).fantome, `lien vers un fantome ${l.id}`)
    verifierDisposition(d)
}

const FILTRES = [...IDS_BANDES.map(b => [b]), ['math', 'ml'], ['math', 'proj']]

test('filtre par bande (carte complete et Autour de moi) : chaque bande seule et combinaisons', () => {
    for (let g = 0; g <= 10; g++) {
        const m = construireModele(g ? etatsAleatoires(g) : base)
        for (const ids of [tous, autourDeMoi(m).ids]) for (const bandes of FILTRES) {
            const sans = filtrerParBandes(m, ids, bandes)
            const d0 = disposerFlux(m, sans.ids, {fantomes: sans.fantomes})
            assert.ok(d0.noeuds.every(n => bandes.includes(tk[n.id]) && !n.fantome), `noeud hors filtre ${bandes}`)
            assert.ok(d0.bandes.every(b => bandes.includes(b.bande)), `bande hors filtre affichee pour ${bandes}`)
            verifierFiltre(m, d0, bandes)
            const avec = filtrerParBandes(m, ids, bandes, {externes: true})
            verifierFiltre(m, disposerFlux(m, avec.ids, {fantomes: avec.fantomes}), bandes)
        }
    }
})

test('filtre Projets : seul = 32 projets ; avec d autres bandes = projets rattaches ; sans Projets = aucun', () => {
    const m = construireModele(base)
    const projets = ids => ids.filter(id => tk[id] === 'proj')
    assert.equal(projets(filtrerParBandes(m, tous, ['proj']).ids).length, 32)
    // Fraude v0 (ML2, ML3, ML4, D1) : avec ML / DL et avec Donnees, pas avec Maths.
    assert.deepEqual([...rattachement(m, 'p_fraud')].sort(), ['data', 'ml'])
    assert.ok(filtrerParBandes(m, tous, ['ml', 'proj']).ids.includes('p_fraud'))
    assert.ok(filtrerParBandes(m, tous, ['data', 'proj']).ids.includes('p_fraud'))
    assert.ok(!filtrerParBandes(m, tous, ['math', 'proj']).ids.includes('p_fraud'))
    for (const autres of [['ml'], ['math'], ['graph'], ['data'], ['algo'], ['math', 'ml'], ['graph', 'data']]) {
        const {ids} = filtrerParBandes(m, tous, [...autres, 'proj'])
        const attendus = base.filter(n => n.bande === 'proj' && n.prerequis.some(p => autres.includes(tk[p]))).map(n => n.id).sort()
        assert.deepEqual(projets(ids).sort(), attendus, `projets pour ${autres} + Projets`)
        // Sans "Projets" : aucun projet.
        assert.equal(projets(filtrerParBandes(m, tous, autres).ids).length, 0, `projet affiche sans Projets (${autres})`)
        // Prerequis externes : seulement des prerequis directs de bandes non choisies, en fantome.
        const avec = filtrerParBandes(m, tous, [...autres, 'proj'], {externes: true})
        for (const f of avec.fantomes) assert.ok(![...autres, 'proj'].includes(tk[f]), `fantome ${f} dans une bande choisie`)
        const d = disposerFlux(m, avec.ids, {fantomes: avec.fantomes})
        const visibles = new Set(avec.ids)
        for (const l of d.liens) assert.ok(visibles.has(l.source) && visibles.has(l.target), `lien vers un noeud masque ${l.id}`)
    }
    // Maths + Projets : 10 projets (dont Diffusion, M5 + gen, et Trader, rattache a plusieurs bandes).
    assert.equal(projets(filtrerParBandes(m, tous, ['math', 'proj']).ids).length, 10)
})

test('cadrage initial : noeuds en cours et voisins, sinon premiere colonne ; zoom jamais sous 80 %', () => {
    const m0 = construireModele(base)
    const d0 = disposerFlux(m0, tous)
    const premiere = cibleInitiale(m0, d0.noeuds)
    assert.deepEqual([...premiere].sort(), base.filter(n => n.col === 0).map(n => n.id).sort())
    const m1 = construireModele(base.map(n => (n.id === 'ml3' ? {...n, etat: 'en cours'} : n)))
    const d1 = disposerFlux(m1, tous)
    const cible = cibleInitiale(m1, d1.noeuds)
    assert.deepEqual([...cible].sort(), ['ml3', ...m1.parId.get('ml3').prerequis, ...m1.successeurs.get('ml3')].sort())
    const r = englobant(d1.noeuds, cible)
    for (const [l, h] of [[1440, 800], [1920, 980], [600, 400]]) {
        const v = vuePour(r, l, h)
        assert.ok(v.zoom >= 0.8 && v.zoom <= 1.25, `zoom ${v.zoom} a ${l}x${h}`)
    }
    // Premiere colonne (trop haute pour tenir) : 100 %, calee en haut a gauche.
    const col0 = vuePour(englobant(d0.noeuds, premiere), 1440, 800, {aGauche: true})
    assert.equal(col0.zoom, 1)
    assert.ok(col0.x >= 0 && col0.x < 40, `premiere colonne a ${col0.x}px du bord`)
    // Rectangle qui tient : centre dans la zone.
    const petit = {x0: 0, y0: 0, x1: 220, y1: 72}
    const v = vuePour(petit, 1000, 600)
    assert.ok(Math.abs(v.x + (110 * v.zoom) - 500) < 1 && Math.abs(v.y + 36 * v.zoom - 300) < 1)
})

test('clic : zoom jamais sous 80 %, noeud selectionne toujours entierement visible', () => {
    const m = construireModele(base)
    const d = disposerFlux(m, tous)
    for (const id of ['m1', 'ml3', 'd1', 'p_trader', 'a_cx']) {
        const voisins = new Set([id, ...m.parId.get(id).prerequis, ...m.successeurs.get(id)])
        const r = englobant(d.noeuds, new Set([id]))
        for (const [l, h, z] of [[1040, 810, 1], [1520, 990, 0.8], [600, 500, 1.5]]) {
            const v = vueSelection(englobant(d.noeuds, voisins), r, l, h, z)
            assert.ok(v.zoom >= 0.8 && v.zoom <= Math.max(0.8, Math.min(z, 1)) + 1e-9, `${id} zoom ${v.zoom}`)
            const sx0 = r.x0 * v.zoom + v.x, sx1 = r.x1 * v.zoom + v.x, sy0 = r.y0 * v.zoom + v.y, sy1 = r.y1 * v.zoom + v.y
            assert.ok(sx0 >= 0 && sx1 <= l && sy0 >= 0 && sy1 <= h, `${id} hors champ a ${l}x${h}`)
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
