// Migration des donnees historiques vers MongoDB Atlas.
// Sources : src/data/data-fr.json, src/data/data-en.json, src/components/PrereqMap/prereqMapData.js.
//
// Usage :
//   node --env-file=.env.local scripts/migrer-mongodb.mjs            (ecrit en base)
//   node --env-file=.env.local scripts/migrer-mongodb.mjs --essai    (affiche sans ecrire)
//
// Idempotent : upsert par _id, relancable sans doublon.
// - Le contenu (textes, dates, tags...) est resynchronise depuis les JSON a chaque execution.
// - Les champs d'etat (etat des noeuds, historique, statut et noeuds des projets, noeuds des
//   competences) ne sont poses qu'a la creation : une relance n'ecrase pas ce qui a ete
//   modifie depuis /admin.
// - Les validateurs $jsonSchema et les index sont crees ou mis a jour.

import fs from 'node:fs'
import {MongoClient} from 'mongodb'
import {construireDocuments, CHAMPS_ETAT} from '../src/lib/donnees/depuisJson.js'
import {COLLECTIONS} from '../src/lib/donnees/schemas.js'
import * as carte from '../src/components/PrereqMap/prereqMapData.js'

const racine = new URL('..', import.meta.url)
const lireJson = chemin => JSON.parse(fs.readFileSync(new URL(chemin, racine), 'utf8'))
const essai = process.argv.includes('--essai')

const {documents, avertissements} = construireDocuments(
    lireJson('src/data/data-fr.json'),
    lireJson('src/data/data-en.json'),
    carte,
)

for (const a of avertissements) console.warn(`! ${a}`)
for (const [nom, docs] of Object.entries(documents)) console.log(`${nom.padEnd(12)} ${docs.length} document(s)`)

if (essai) {
    console.log('\nMode --essai : aucune ecriture.')
    process.exit(0)
}

if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI absente. Recupere-la avec "vercel env pull .env.local" puis relance.')
    process.exit(1)
}

const client = new MongoClient(process.env.MONGODB_URI, {appName: 'portfolio-migration'})
const nomBase = process.env.MONGODB_DB || 'portfolio'

try {
    await client.connect()
    const db = client.db(nomBase)
    // Validateur actuel de chaque collection existante, pour ne le modifier que s'il a change.
    const existantes = new Map((await db.listCollections().toArray()).map(c => [c.name, c.options?.validator]))

    for (const [nom, {validateur, index}] of Object.entries(COLLECTIONS)) {
        // Validateur : cree avec la collection, ou mis a jour (collMod) seulement s'il a change.
        // L'utilisateur Atlas fourni par l'integration Vercel n'a pas toujours le droit collMod :
        // dans ce cas on le signale et on continue (le contenu reste synchronise).
        if (existantes.has(nom)) {
            if (JSON.stringify(existantes.get(nom)) !== JSON.stringify(validateur)) {
                try {
                    await db.command({collMod: nom, validator: validateur, validationLevel: 'strict', validationAction: 'error'})
                    console.log(`${nom.padEnd(12)} validateur mis a jour`)
                } catch (e) {
                    if (e.code !== 8000 && e.codeName !== 'Unauthorized') throw e
                    console.warn(`! ${nom} : validateur modifie mais droit collMod refuse par Atlas (${e.errmsg ?? e.message}).`
                        + ' Donner le role dbAdmin a l\'utilisateur, ou modifier le validateur dans l\'interface Atlas.')
                }
            }
        } else {
            await db.createCollection(nom, {validator: validateur, validationLevel: 'strict', validationAction: 'error'})
        }
        for (const {cle, options} of index) await db.collection(nom).createIndex(cle, options ?? {})

        const docs = documents[nom] ?? []
        if (!docs.length) {
            console.log(`${nom.padEnd(12)} validateur et index a jour`)
            continue
        }
        const etat = CHAMPS_ETAT[nom] ?? []
        const operations = docs.map(({_id, ...champs}) => {
            const $set = {}, $setOnInsert = {}
            for (const [k, v] of Object.entries(champs)) (etat.includes(k) ? $setOnInsert : $set)[k] = v
            const update = {$set}
            if (Object.keys($setOnInsert).length) update.$setOnInsert = $setOnInsert
            return {updateOne: {filter: {_id}, update, upsert: true}}
        })
        const r = await db.collection(nom).bulkWrite(operations, {ordered: false})
        console.log(`${nom.padEnd(12)} ${r.upsertedCount} cree(s), ${r.modifiedCount} mis a jour, ${r.matchedCount - r.modifiedCount} inchange(s)`)
    }
    console.log(`\nMigration terminee dans la base "${nomBase}".`)
} catch (e) {
    console.error('Echec de la migration :', e.errInfo ? JSON.stringify(e.errInfo, null, 2) : e)
    process.exitCode = 1
} finally {
    await client.close()
}
