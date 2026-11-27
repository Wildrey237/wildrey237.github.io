import {getDb} from '../../../src/lib/mongodb'
import {exigerSession} from '../../../src/lib/admin/garde'
import {SECTIONS_ACCUEIL} from '../../../src/lib/donnees/schemas'
import OrdreSections from './OrdreSections'

export default async function Organisation() {
    await exigerSession()
    const profil = await (await getDb()).collection('profil').findOne({_id: 'profil'}, {projection: {ordreSections: 1}})
    // Ordre enregistre, complete par les sections manquantes.
    const ordre = [...new Set([...(profil?.ordreSections ?? []).filter(s => SECTIONS_ACCUEIL.includes(s)), ...SECTIONS_ACCUEIL])]
    return (
        <>
            <h1>Organisation de l’accueil</h1>
            <p className="admin-doux">
                Glisser une section par sa poignée, ou utiliser Monter / Descendre. L’ordre est enregistré
                automatiquement et appliqué à l’accueil et au menu.
            </p>
            <OrdreSections ordreInitial={ordre}/>
        </>
    )
}
