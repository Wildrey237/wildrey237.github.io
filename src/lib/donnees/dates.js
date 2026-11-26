// Conversion entre les periodes en texte libre des JSON ("Avril 2026 – En cours", "2024 – 2025")
// et des dates stockees en base.
// Convention : "Mois AAAA" -> le 1er du mois ; "AAAA" seul -> le 1er janvier (UTC).
// A l'affichage, un 1er janvier est donc rendu comme une annee seule.

const MOIS = {
    fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const EN_COURS = {fr: 'En cours', en: 'Present'}
const SEPARATEUR = ' – '

function lireBorne(texte) {
    const t = texte.trim()
    if (t === EN_COURS.fr) return null
    const annee = t.match(/^(\d{4})$/)
    if (annee) return new Date(Date.UTC(Number(annee[1]), 0, 1))
    const moisAnnee = t.match(/^(\S+)\s+(\d{4})$/)
    if (moisAnnee) {
        const m = MOIS.fr.indexOf(moisAnnee[1])
        if (m >= 0) return new Date(Date.UTC(Number(moisAnnee[2]), m, 1))
    }
    throw new Error(`Periode illisible : "${texte}"`)
}

// "Avril 2026 – En cours" -> {debut: Date, fin: null}
export function lirePeriode(texte) {
    const [debut, fin] = texte.split(SEPARATEUR)
    if (fin === undefined) throw new Error(`Periode sans separateur " – " : "${texte}"`)
    return {debut: lireBorne(debut), fin: lireBorne(fin)}
}

function formaterBorne(date, langue) {
    if (date === null) return EN_COURS[langue]
    const d = new Date(date)
    if (d.getUTCMonth() === 0 && d.getUTCDate() === 1) return String(d.getUTCFullYear())
    return `${MOIS[langue][d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

// Inverse de lirePeriode, dans la langue demandee.
export function formaterPeriode(debut, fin, langue) {
    return `${formaterBorne(debut, langue)}${SEPARATEUR}${formaterBorne(fin, langue)}`
}

// Saisie de /admin : "AAAA" (annee seule) ou "AAAA-MM" (mois) -> Date ; vide -> null.
// Rappel : "AAAA-01" et "AAAA" donnent la meme date et s'affichent comme une annee seule.
export function lireSaisieDate(texte) {
    const t = String(texte ?? '').trim()
    if (!t) return null
    const m = t.match(/^(\d{4})(?:-(0[1-9]|1[0-2]))?$/)
    if (!m) throw new Error(`Date invalide : "${t}" (attendu AAAA ou AAAA-MM)`)
    return new Date(Date.UTC(Number(m[1]), m[2] ? Number(m[2]) - 1 : 0, 1))
}

// Inverse de lireSaisieDate, pour pre-remplir les formulaires.
export function versSaisieDate(date) {
    if (!date) return ''
    const d = new Date(date)
    if (d.getUTCMonth() === 0) return String(d.getUTCFullYear())
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
