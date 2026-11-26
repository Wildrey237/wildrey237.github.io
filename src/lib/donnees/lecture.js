// Lecture des donnees de l'accueil cote serveur.
// Source : MongoDB. Repli sur les JSON historiques seulement si MONGODB_URI est absente
// (developpement local sans base) ou si la base n'a pas encore ete migree.

import {getDb, mongoConfigure} from '../mongodb.js'
import {construireDocuments} from './depuisJson.js'
import {versAffichage} from './versAffichage.js'
import dataFr from '../../data/data-fr.json'
import dataEn from '../../data/data-en.json'
import * as carte from '../../components/PrereqMap/prereqMapData.js'

function depuisJson() {
    const {documents} = construireDocuments(dataFr, dataEn, carte)
    return {...documents, profil: documents.profil[0]}
}

async function depuisMongo() {
    const db = await getDb()
    const [profil, experiences, formations, projets, competences, certifications] = await Promise.all([
        db.collection('profil').findOne({_id: 'profil'}),
        db.collection('experiences').find().sort({ordre: 1}).toArray(),
        db.collection('formations').find().sort({ordre: 1}).toArray(),
        db.collection('projets').find().sort({ordre: 1}).toArray(),
        db.collection('competences').find().sort({categorie: 1, ordre: 1}).toArray(),
        db.collection('certifications').find().sort({ordre: 1}).toArray(),
    ])
    if (!profil) return null
    return {profil, experiences, formations, projets, competences, certifications}
}

// Renvoie {fr, en, source}, chaque langue au format attendu par les composants.
export async function lireDonneesAccueil() {
    if (!mongoConfigure()) {
        console.warn('[donnees] MONGODB_URI absente : lecture depuis les JSON locaux')
        return {...versAffichage(depuisJson()), source: 'json'}
    }
    const docs = await depuisMongo()
    if (!docs) {
        console.warn('[donnees] base non migree (profil introuvable) : lecture depuis les JSON locaux')
        return {...versAffichage(depuisJson()), source: 'json'}
    }
    return {...versAffichage(docs), source: 'mongodb'}
}
