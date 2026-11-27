// La carte du parcours est privee : les donnees publiques de l'accueil n'en contiennent rien.
import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as carte from '../src/components/PrereqMap/prereqMapData.js'
import {construireDocuments} from '../src/lib/donnees/depuisJson.js'
import {versAffichage} from '../src/lib/donnees/versAffichage.js'

const lire = f => JSON.parse(fs.readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf8'))

test('accueil : aucune donnee de la carte privee, meme si des noeuds sont lies', () => {
    const {documents} = construireDocuments(lire('data-fr.json'), lire('data-en.json'), carte)
    // Simule des liens poses dans l'admin vers des noeuds de la carte.
    documents.projets[0].noeuds = ['gnn', 'pj_gal']
    documents.projets[0].noeudOrigine = 'pj_gal'
    documents.competences[0].noeuds = ['ml3']
    const publiques = JSON.stringify(versAffichage({...documents, profil: documents.profil[0]}))
    assert.ok(!publiques.includes('"noeuds"'), 'champ noeuds expose')
    assert.ok(!publiques.includes('noeudOrigine'), 'champ noeudOrigine expose')
    for (const id of ['gnn', 'pj_gal', 'ml3']) assert.ok(!publiques.includes(`"${id}"`), `noeud ${id} expose`)
})
