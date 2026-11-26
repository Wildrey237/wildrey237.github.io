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
// - Les validateurs $jsonSchema et les index sont crees, ou mis a jour s'ils ont change
//   (par collMod, ou par reconstruction de la collection si Atlas refuse collMod).
// - Puis les correctifs de src/lib/donnees/correctifs.js non encore appliques (journal _migrations).

import fs from 'node:fs'
import {MongoClient} from 'mongodb'
import {construireDocuments, CHAMPS_ETAT} from '../src/lib/donnees/depuisJson.js'
import {COLLECTIONS} from '../src/lib/donnees/schemas.js'
import {CORRECTIFS} from '../src/lib/donnees/correctifs.js'
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
// Test uniquement : force le chemin de reconstruction meme quand collMod est autorise.
const forcerReconstruction = process.argv.includes('--forcer-reconstruction')
const OPTIONS_VALIDATION = {validationLevel: 'strict', validationAction: 'error'}

// Remplace le validateur d'une collection existante sans le droit collMod :
// copie dans une collection temporaire dotee du nouveau validateur, puis renommage par-dessus
// l'ancienne (renameCollection et dropCollection font partie du role readWrite d'Atlas).
// Les documents existants doivent deja respecter le nouveau validateur (nouveaux champs optionnels).
async function reconstruire(db, nom, validateur, index) {
    const tmp = `${nom}__reconstruction`
    if (await db.listCollections({name: tmp}, {nameOnly: true}).hasNext()) await db.collection(tmp).drop()
    await db.createCollection(tmp, {validator: validateur, ...OPTIONS_VALIDATION})
    const docs = await db.collection(nom).find().toArray()
    if (docs.length) await db.collection(tmp).insertMany(docs, {ordered: true})
    for (const {cle, options} of index) await db.collection(tmp).createIndex(cle, options ?? {})
    const copies = await db.collection(tmp).countDocuments()
    if (copies !== docs.length) throw new Error(`${nom} : ${copies} copie(s) pour ${docs.length} document(s), reconstruction annulee`)
    await db.collection(tmp).rename(nom, {dropTarget: true})
    return docs.length
}

async function synchroniserValidateur(db, nom, {validateur, index}, existantes) {
    if (!existantes.has(nom)) {
        await db.createCollection(nom, {validator: validateur, ...OPTIONS_VALIDATION})
        return 'creee'
    }
    if (JSON.stringify(existantes.get(nom)) === JSON.stringify(validateur) && !forcerReconstruction) return null
    if (!forcerReconstruction) {
        try {
            await db.command({collMod: nom, validator: validateur, ...OPTIONS_VALIDATION})
            return 'validateur mis a jour'
        } catch (e) {
            // Atlas refuse collMod a l'utilisateur de l'integration Vercel : on reconstruit.
            if (e.code !== 8000 && e.codeName !== 'Unauthorized') throw e
        }
    }
    const n = await reconstruire(db, nom, validateur, index)
    return `validateur mis a jour par reconstruction (${n} document(s) recopie(s))`
}

try {
    await client.connect()
    const db = client.db(nomBase)
    // Validateur actuel de chaque collection existante, pour ne le modifier que s'il a change.
    const existantes = new Map((await db.listCollections().toArray()).map(c => [c.name, c.options?.validator]))
    const initialisee = existantes.has('profil') && (await db.collection('profil').countDocuments({_id: 'profil'})) > 0
    const ecrireContenu = !initialisee || resync
    if (!ecrireContenu) {
        console.log('Base deja initialisee : contenu des JSON non reapplique (modifier dans /admin, ou relancer avec --resync).')
    }

    // 1. Validateurs, index et contenu initial.
    for (const [nom, definition] of Object.entries(COLLECTIONS)) {
        const changement = await synchroniserValidateur(db, nom, definition, existantes)
        for (const {cle, options} of definition.index) await db.collection(nom).createIndex(cle, options ?? {})

        const docs = ecrireContenu ? (documents[nom] ?? []) : []
        if (!docs.length) {
            console.log(`${nom.padEnd(14)} ${changement ?? 'validateur et index a jour'}`)
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
        console.log(`${nom.padEnd(14)} ${changement ? `${changement}, ` : ''}${r.upsertedCount} cree(s), ${r.modifiedCount} mis a jour, ${r.matchedCount - r.modifiedCount} inchange(s)`)
    }

    // 2. Correctifs versionnes : une seule fois chacun (rejoues tous apres un --resync,
    //    puisque le contenu vient d'etre reecrit depuis les JSON).
    const journal = db.collection('_migrations')
    const appliques = new Set((await journal.find({}, {projection: {_id: 1}}).toArray()).map(m => m._id))
    for (const correctif of CORRECTIFS) {
        if (appliques.has(correctif.id) && !resync) continue
        const resultat = await correctif.appliquer(db)
        await journal.updateOne({_id: correctif.id}, {$set: {description: correctif.description, appliqueLe: new Date(), resultat}}, {upsert: true})
        console.log(`correctif     ${correctif.id} : ${resultat}`)
    }

    console.log(`\nMigration terminee dans la base "${nomBase}"${resync ? ' (contenu resynchronise depuis les JSON)' : ''}.`)
} catch (e) {
    console.error('Echec de la migration :', e.errInfo ? JSON.stringify(e.errInfo, null, 2) : e)
    process.exitCode = 1
} finally {
    await client.close()
}
