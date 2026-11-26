// Client MongoDB partage (cote serveur uniquement).
// L'URI vient de MONGODB_URI (injectee par l'integration Vercel / MongoDB Atlas) : jamais en dur.
// Le client est garde dans globalThis pour etre reutilise entre les requetes (Fluid Compute)
// et entre les rechargements a chaud en developpement.

import {MongoClient} from 'mongodb'

// Nom de la base : MONGODB_DB si defini, sinon "portfolio".
export const NOM_BASE = process.env.MONGODB_DB || 'portfolio'

export function mongoConfigure() {
    return Boolean(process.env.MONGODB_URI)
}

export async function getDb() {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI absente')
    if (!globalThis._clientMongo) {
        globalThis._clientMongo = new MongoClient(process.env.MONGODB_URI, {
            appName: 'portfolio',
            maxPoolSize: 5,
        }).connect()
    }
    const client = await globalThis._clientMongo
    return client.db(NOM_BASE)
}
