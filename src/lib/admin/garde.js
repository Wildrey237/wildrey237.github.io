// Verification de session cote serveur (pages et actions de /admin).
// Le middleware protege deja /admin ; chaque action revérifie quand meme (defense en profondeur).

import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {COOKIE_SESSION, jetonValide} from './session'

export async function sessionValide() {
    const jar = await cookies()
    return jetonValide(jar.get(COOKIE_SESSION)?.value, process.env.ADMIN_PASSWORD)
}

export async function exigerSession() {
    if (!(await sessionValide())) redirect('/admin/connexion')
}
