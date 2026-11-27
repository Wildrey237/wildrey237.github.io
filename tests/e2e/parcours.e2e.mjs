// Test en navigateur du parcours prive a 1440px : compteurs des rails et absence de troncature.
// Prerequis : Google Chrome installe, un site lance (npm run build && npm start, ou une preview).
// Usage : BASE_URL=http://localhost:3000 ADMIN_PASSWORD=... npm run test:e2e
// Preview protegee : ajouter VERCEL_OIDC_TOKEN (ex. via "vercel env run -- npm run test:e2e").
import {after, before, test} from 'node:test'
import assert from 'node:assert/strict'
import {chromium} from 'playwright-core'

const BASE_URL = process.env.BASE_URL
const MDP = process.env.ADMIN_PASSWORD
const sauter = !BASE_URL || !MDP ? 'BASE_URL et ADMIN_PASSWORD requis' : false
let navigateur, page

before(async () => {
    if (sauter) return
    navigateur = await chromium.launch({channel: 'chrome'})
    const contexte = await navigateur.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'})
    const jeton = process.env.VERCEL_OIDC_TOKEN
    const origine = new URL(BASE_URL).origin
    // Jeton OIDC (preview protegee) envoye uniquement a l'origine du site teste.
    if (jeton) {
        await contexte.route(u => u.origin === origine, async r =>
            r.continue({headers: {...(await r.request().allHeaders()), 'x-vercel-trusted-oidc-idp-token': jeton}}))
    }
    page = await contexte.newPage()
    await page.goto(`${BASE_URL}/parcours`)
    await page.fill('#motDePasse', MDP)
    await page.click('button[type=submit]')
    await page.waitForURL('**/parcours')
    await page.waitForSelector('[data-noeud]')
})

after(async () => navigateur?.close())

test('compteurs des rails : 24, 7 et 11 noeuds de cours', {skip: sauter}, async () => {
    const totaux = await page.$$eval('[data-compteur]', els => Object.fromEntries(els.map(e => [e.dataset.compteur, e.textContent.split('/')[1].trim()])))
    assert.deepEqual(totaux, {ia: '24', maths: '7', algo: '11'})
})

// Aucune carte ni aucun titre coupe ; pas de defilement vertical interne a la carte.
async function verifierTroncature(vue) {
    const r = await page.evaluate(() => {
        const problemes = []
        for (const carte of document.querySelectorAll('[data-carte-cadre] [data-noeud]')) {
            const titre = carte.querySelector('[data-titre]')
            const bc = carte.getBoundingClientRect(), bt = titre.getBoundingClientRect()
            if (carte.scrollHeight > carte.clientHeight + 1 || carte.scrollWidth > carte.clientWidth + 1 || bt.bottom > bc.bottom - 2) {
                problemes.push(`${carte.dataset.noeud} (${titre.textContent})`)
            }
        }
        const cadre = document.querySelector('[data-carte-cadre]')
        return {problemes, cartes: document.querySelectorAll('[data-carte-cadre] [data-noeud]').length,
            defilementVertical: cadre.scrollHeight > cadre.clientHeight + 1}
    })
    assert.ok(r.cartes > 0, `${vue} : aucune carte affichee`)
    assert.deepEqual(r.problemes, [], `${vue} : cartes tronquees`)
    assert.equal(r.defilementVertical, false, `${vue} : defilement vertical interne`)
}

test('vue Autour de moi : aucune troncature a 1440px', {skip: sauter}, async () => {
    await page.getByRole('button', {name: 'Autour de moi'}).click()
    await verifierTroncature('Autour de moi')
})

test('carte complete : 74 cartes, aucune troncature a 1440px', {skip: sauter}, async () => {
    await page.getByRole('button', {name: /Carte complète/}).click()
    assert.equal(await page.locator('[data-carte-cadre] [data-noeud]').count(), 74)
    await verifierTroncature('Carte complète')
})
