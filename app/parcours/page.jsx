import {getDb} from '../../src/lib/mongodb'
import {exigerSession} from '../../src/lib/admin/garde'
import Parcours from '../../src/components/parcours/Parcours'

// Parcours prive : protege par la session de /admin (middleware), jamais indexe.
export const metadata = {
    title: 'Où j’en suis – parcours privé',
    robots: {index: false, follow: false, nocache: true, googleBot: {index: false, follow: false}},
}
export const dynamic = 'force-dynamic'

export default async function PageParcours() {
    await exigerSession()
    const docs = await (await getDb()).collection('noeuds')
        .find({}, {projection: {historique: 0}})
        .toArray()
    // Donnees simples pour le client (textes en francais, dates en ISO).
    const noeuds = docs.map(n => ({
        id: n._id,
        bande: n.bande,
        col: n.col,
        row: n.row,
        titre: n.titre.fr,
        notions: n.notions.fr,
        prerequis: n.prerequis,
        livrables: n.livrables.map(l => ({nom: l.nom.fr, detail: l.detail.fr})),
        etat: n.etat,
        etatModifieLe: n.etatModifieLe ? n.etatModifieLe.toISOString() : null,
    }))
    return <Parcours noeudsInitiaux={noeuds}/>
}
