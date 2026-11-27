// Logo : apercu, chemin ou URL (vide = monogramme), et televersement d'un fichier (Vercel Blob).
export default function ChampLogo({valeur}) {
    return (
        <div className="admin-carte" style={{marginTop: 12}}>
            <div className="admin-ligne" style={{alignItems: 'flex-start', gap: 16}}>
                <div style={{width: 48, height: 48, borderRadius: 10, border: '1px solid var(--a-bord)', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0}}>
                    {valeur
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={valeur} alt="Logo actuel" style={{width: '100%', height: '100%', objectFit: 'contain', padding: 4}}/>
                        : <span className="admin-doux" style={{fontSize: 11}}>aucun</span>}
                </div>
                <div style={{flex: 1}}>
                    <label htmlFor="logo" style={{marginTop: 0}}>Logo : chemin (/logos/xxx.png) ou URL, vide = monogramme</label>
                    <input id="logo" name="logo" defaultValue={valeur ?? ''}/>
                    <label htmlFor="fichierLogo">Ou téléverser un fichier (PNG, JPEG, WebP, SVG, 1 Mo max.)</label>
                    <input id="fichierLogo" name="fichierLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"/>
                </div>
            </div>
        </div>
    )
}
