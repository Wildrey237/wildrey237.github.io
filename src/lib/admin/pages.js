// Utilitaires de lecture pour les pages de /admin (cote serveur, pas des actions).

import {getDb} from '../mongodb'

// Ordre propose pour un nouvel element : a la fin de la liste.
export async function ordreSuivant(collection, filtre = {}) {
    const db = await getDb()
    const dernier = await db.collection(collection).find(filtre).sort({ordre: -1}).limit(1).next()
    return dernier ? dernier.ordre + 1 : 0
}

// Noeuds de la carte pour les cases a cocher (id, bande, titre).
export async function listeNoeuds() {
    const db = await getDb()
    return db.collection('noeuds').find({}, {projection: {bande: 1, titre: 1}}).sort({col: 1, row: 1}).toArray()
}
