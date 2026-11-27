// Tests en navigateur du parcours (/parcours), a 1440px.
// Prerequis : Google Chrome installe, un site lance (npm run build && npm start, ou une preview).
// Usage : BASE_URL=http://localhost:3000 ADMIN_PASSWORD=... npm run test:e2e
// Preview protegee : ajouter VERCEL_OIDC_TOKEN (ex. via "vercel env run -- npm run test:e2e").
import {after, before, describe, test} from 'node:test'
import assert from 'node:assert/strict'
import {chromium} from 'playwright-core'

const BASE_URL = process.env.BASE_URL
const MDP = process.env.ADMIN_PASSWORD
const JETON = process.env.VERCEL_OIDC_TOKEN
const sauter = !BASE_URL ? 'BASE_URL requis' : false
const tk = {}
let navigateur

// Contexte de navigateur ; jeton OIDC (preview protegee) envoye uniquement a l'origine testee.
async function contexte() {
    const c = await navigateur.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'})
    if (JETON) {
        const origine = new URL(BASE_URL).origin
        await c.route(u => u.origin === origine, async r =>
            r.continue({headers: {...(await r.request().allHeaders()), 'x-vercel-trusted-oidc-idp-token': JETON}}))
    }
    return c
}

before(async () => {
    if (sauter) return
    navigateur = await chromium.launch({channel: 'chrome'})
    const carte = await import('../../src/components/PrereqMap/prereqMapData.js')
    for (const n of carte.NODES) tk[n.id] = n.tk
})
after(async () => navigateur?.close())

describe('visiteur sans session', () => {
    let page, reponse
    before(async () => {
        if (sauter) return
        page = await (await contexte()).newPage()
        reponse = await page.goto(`${BASE_URL}/parcours`)
        await page.waitForSelector('[data-carte-cadre] [data-noeud]')
    })

    test('/parcours : 200, contenu visible, en-tete et meta noindex', {skip: sauter}, async () => {
        assert.equal(reponse.status(), 200)
        assert.ok((await reponse.allHeaders())['x-robots-tag']?.includes('noindex'), 'en-tete X-Robots-Tag noindex absent')
        assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/)
        assert.ok(await page.getByRole('heading', {name: 'Où j’en suis'}).isVisible())
        assert.ok(await page.locator('[data-carte-cadre] [data-noeud]').first().isVisible())
        // Lecture seule : pas de boutons de changement d'etat.
        assert.equal(await page.getByRole('group', {name: 'État du nœud'}).count(), 0)
    })

    test('POST de changement d etat sans session : 401', {skip: sauter}, async () => {
        const r = await page.request.post(`${BASE_URL}/api/parcours/etat`, {
            data: {id: 'm1', etat: 'maitrise'},
            headers: JETON ? {'x-vercel-trusted-oidc-idp-token': JETON} : {},
        })
        assert.equal(r.status(), 401)
    })

    test('filtre par bande : URL mise a jour, seuls les noeuds filtres (et fantomes de prerequis)', {skip: sauter}, async () => {
        await page.getByRole('button', {name: /Carte complète/}).click()
        for (const bandes of [['math'], ['ml'], ['graph'], ['algo'], ['data'], ['proj'], ['math', 'ml']]) {
            await page.getByRole('button', {name: 'Tout', exact: true}).click()
            for (const b of bandes) {
                const nom = {math: 'Maths', ml: 'ML / DL', graph: 'Graphes', algo: 'Algo', data: 'Données', proj: 'Projets'}[b]
                await page.getByRole('group', {name: 'Filtrer la carte par bande'}).getByRole('button', {name: nom, exact: true}).click()
            }
            await page.waitForFunction(attendu => new URL(location.href).searchParams.get('bandes') === attendu, bandes.join(','))
            const cartes = await page.$$eval('[data-carte-cadre] [data-noeud]', els => els.map(e => ({id: e.dataset.noeud, fantome: e.hasAttribute('data-fantome')})))
            assert.ok(cartes.length > 0, `aucune carte pour ${bandes}`)
            for (const c of cartes) {
                if (c.fantome) assert.ok(!bandes.includes(tk[c.id]), `${c.id} fantome alors qu il est dans le filtre`)
                else assert.ok(bandes.includes(tk[c.id]), `${c.id} (${tk[c.id]}) affiche hors filtre ${bandes}`)
            }
        }
        // Rechargement : le filtre est relu depuis l'URL.
        await page.reload()
        await page.waitForSelector('[data-carte-cadre] [data-noeud]')
        const presses = await page.getByRole('group', {name: 'Filtrer la carte par bande'}).locator('[aria-pressed="true"]').allTextContents()
        assert.deepEqual(presses.map(s => s.trim()), ['Maths', 'ML / DL'])
    })
})

describe('session admin', () => {
    let page
    const sauterAdmin = sauter || (!MDP ? 'ADMIN_PASSWORD requis' : false)
    before(async () => {
        if (sauterAdmin) return
        page = await (await contexte()).newPage()
        await page.goto(`${BASE_URL}/admin/connexion?suite=/parcours`)
        await page.fill('#motDePasse', MDP)
        await page.click('button[type=submit]')
        await page.waitForURL('**/parcours')
        await page.waitForSelector('[data-carte-cadre] [data-noeud]')
    })

    test('compteurs des rails : 24, 7 et 11 noeuds de cours', {skip: sauterAdmin}, async () => {
        const totaux = await page.$$eval('[data-compteur]', els => Object.fromEntries(els.map(e => [e.dataset.compteur, e.textContent.split('/')[1].trim()])))
        assert.deepEqual(totaux, {ia: '24', maths: '7', algo: '11'})
    })

    test('edition visible pour l admin', {skip: sauterAdmin}, async () => {
        assert.equal(await page.getByRole('group', {name: 'État du nœud'}).count(), 1)
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

    test('vue Autour de moi : aucune troncature a 1440px', {skip: sauterAdmin}, async () => {
        await page.getByRole('button', {name: 'Autour de moi'}).click()
        await verifierTroncature('Autour de moi')
    })

    test('carte complete : 74 cartes, aucune troncature a 1440px', {skip: sauterAdmin}, async () => {
        await page.getByRole('button', {name: 'Tout', exact: true}).click()
        await page.getByRole('button', {name: /Carte complète/}).click()
        assert.equal(await page.locator('[data-carte-cadre] [data-noeud]').count(), 74)
        await verifierTroncature('Carte complète')
    })
})
