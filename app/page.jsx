import AccueilClient from './AccueilClient'
import {lireDonneesAccueil} from '../src/lib/donnees/lecture'

// Page regeneree au plus toutes les heures (ISR) : les modifications faites en base
// apparaissent sans redeploiement. L'etape /admin declenchera aussi revalidatePath('/').
export const revalidate = 3600

export default async function Page() {
    const {fr, en} = await lireDonneesAccueil()
    return <AccueilClient donnees={{fr, en}}/>
}
