import {versSaisieDate} from '../../src/lib/donnees/dates'

// Debut / fin au format AAAA ou AAAA-MM ; fin vide = en cours.
export default function ChampPeriode({debut, fin}) {
    return (
        <div className="admin-deux">
            <div>
                <label htmlFor="debut">Debut (AAAA-MM, ou AAAA pour l&apos;annee seule)</label>
                <input id="debut" name="debut" defaultValue={versSaisieDate(debut)} pattern="\d{4}(-(0[1-9]|1[0-2]))?" placeholder="2024-09" required/>
            </div>
            <div>
                <label htmlFor="fin">Fin (vide = en cours)</label>
                <input id="fin" name="fin" defaultValue={versSaisieDate(fin)} pattern="\d{4}(-(0[1-9]|1[0-2]))?" placeholder="2025-02"/>
            </div>
        </div>
    )
}
