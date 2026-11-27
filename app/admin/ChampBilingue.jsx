// Champ traduisible : deux saisies cote a cote, nommees <nom>_fr et <nom>_en.
// liste = une valeur par ligne (tags) ; long = zone de texte.
export default function ChampBilingue({nom, libelle, valeur, long = false, liste = false, requis = true}) {
    const Saisie = long || liste ? 'textarea' : 'input'
    const val = l => liste ? (valeur?.[l] ?? []).join('\n') : (valeur?.[l] ?? '')
    return (
        <div className="admin-deux">
            {['fr', 'en'].map(l => (
                <div key={l}>
                    <label htmlFor={`${nom}_${l}`}>{libelle} ({l.toUpperCase()}){liste && ', une valeur par ligne'}</label>
                    <Saisie
                        id={`${nom}_${l}`}
                        name={`${nom}_${l}`}
                        defaultValue={val(l)}
                        required={requis && !liste}
                        rows={long ? 8 : undefined}
                    />
                </div>
            ))}
        </div>
    )
}
