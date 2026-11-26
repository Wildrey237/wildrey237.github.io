// Migration des donnees historiques vers MongoDB Atlas.
// Sources : src/data/data-fr.json, src/data/data-en.json, src/components/PrereqMap/prereqMapData.js.
//
// Usage :
//   npm run migrer                 initialise une base vide depuis les JSON
//   npm run migrer -- --essai      affiche ce qui serait fait, sans ecrire
//   npm run migrer -- --resync     reecrit le contenu depuis les JSON, meme si la base est deja initialisee
//
// MongoDB est la source de verite : le contenu se modifie dans /admin.
// Idempotent : upsert par _id, relancable sans doublon.
// - Si la base est deja initialisee (document profil present), le contenu n'est pas touche :
//   seuls les validateurs et les index sont mis a jour. Sinon un element supprime dans /admin
//   serait recree depuis les JSON.
// - Avec --resync, les documents des JSON sont recrees s'ils manquent et leur contenu (textes,
//   dates, tags...) est ecrase ; les champs
//   d'etat (etat des noeuds, historique, statut et noeuds des projets, noeuds des competences)
//   restent intacts dans tous les cas.
// - Les validateurs $jsonSchema et les index sont crees, ou mis a jour s'ils ont change.

import fs from 'node:fs'
import {MongoClient} from 'mongodb'
import {construireDocuments, CHAMPS_ETAT} from '../src/lib/donnees/depuisJson.js'
import {COLLECTIONS} from '../src/lib/donnees/schemas.js'
import * as carte from '../src/components/PrereqMap/prereqMapData.js'

const racine = new URL('..', import.meta.url)
const lireJson = chemin => JSON.parse(fs.readFileSync(new URL(chemin, racine), 'utf8'))
const essai = process.argv.includes('--essai')
const resync = process.argv.includes('--resync')

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
    const initialisee = existantes.has('profil') && (await db.collection('profil').countDocuments({_id: 'profil'})) > 0
    const ecrireContenu = !initialisee || resync
    if (!ecrireContenu) {
        console.log('Base deja initialisee : contenu laisse intact (le modifier dans /admin, ou relancer avec --resync).')
    }

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

        const docs = ecrireContenu ? (documents[nom] ?? []) : []
        if (!docs.length) {
            console.log(`${nom.padEnd(12)} validateur et index a jour`)
            continue
        }
        const etat = CHAMPS_ETAT[nom] ?? []
        const operations = docs.map(({_id, ...champs}) => {
            const $set = {}, $setOnInsert = {}
            // Sans --resync, tout passe en $setOnInsert : seuls les documents absents sont crees.
            for (const [k, v] of Object.entries(champs)) (resync && !etat.includes(k) ? $set : $setOnInsert)[k] = v
            const update = {}
            if (Object.keys($set).length) update.$set = $set
            if (Object.keys($setOnInsert).length) update.$setOnInsert = $setOnInsert
            return {updateOne: {filter: {_id}, update, upsert: true}}
        })
        const r = await db.collection(nom).bulkWrite(operations, {ordered: false})
        console.log(`${nom.padEnd(12)} ${r.upsertedCount} cree(s), ${r.modifiedCount} mis a jour, ${r.matchedCount - r.modifiedCount} inchange(s)`)
    }
    console.log(`\nMigration terminee dans la base "${nomBase}"${resync ? ' (contenu resynchronise depuis les JSON)' : ''}.`)
} catch (e) {
    console.error('Echec de la migration :', e.errInfo ? JSON.stringify(e.errInfo, null, 2) : e)
    process.exitCode = 1
} finally {
    await client.close()
}
