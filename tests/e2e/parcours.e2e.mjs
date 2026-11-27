// Tests en navigateur du parcours (/parcours), a 1440px (plein ecran, carte React Flow).
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

    test('plein ecran : aucune barre de defilement de page, carte >= 85 % de l ecran, zoom 30-200 %', {skip: sauter}, async () => {
        for (const [w, h] of [[1440, 900], [1920, 1080], [2560, 1440]]) {
            await page.setViewportSize({width: w, height: h})
            await page.waitForTimeout(200)
            const r = await page.evaluate(() => {
                const d = document.documentElement
                const cadre = document.querySelector('[data-carte-cadre]').getBoundingClientRect()
                return {defile: d.scrollHeight > d.clientHeight || d.scrollWidth > d.clientWidth,
                    largeur: Math.round(cadre.width), bas: Math.round(cadre.bottom), hauteur: cadre.height}
            })
            assert.equal(r.defile, false, `${w}x${h} : la page defile`)
            assert.equal(r.largeur, w, `${w}x${h} : la carte n occupe pas toute la largeur`)
            assert.equal(r.bas, h, `${w}x${h} : la carte ne descend pas jusqu au bas de la fenetre`)
            assert.ok(r.hauteur / h >= 0.85, `${w}x${h} : la carte n occupe que ${Math.round(100 * r.hauteur / h)} % de la hauteur`)
        }
        await page.setViewportSize({width: 1440, height: 1000})
        const zoom = page.getByRole('group', {name: 'Zoom de la carte'})
        // Clics jusqu'a la butee : le bouton se desactive a 200 % (puis a 30 %).
        for (const [nom, butee] of [['Zoomer', /200 %/], ['Dézoomer', /30 %/]]) {
            const bouton = zoom.getByRole('button', {name: nom, exact: true})
            for (let i = 0; i < 25 && await bouton.isEnabled(); i++) { await bouton.click(); await page.waitForTimeout(250) }
            assert.match(await zoom.textContent(), butee)
        }
        await zoom.getByRole('button', {name: 'Ajuster'}).click()
    })

    test('recherche "ML1" : centre et selectionne le noeud, Echap annule', {skip: sauter}, async () => {
        const champ = page.getByRole('combobox', {name: 'Rechercher un nœud'})
        await champ.fill('ML1')
        await champ.press('Enter')
        await page.waitForFunction(() => new URL(location.href).searchParams.get('noeud') === 'ml1')
        assert.equal(await page.locator('#fiche-titre').textContent(), 'Apprendre des données')
        await page.waitForTimeout(600)
        // Le noeud est visible dans la carte (recadrage), et selectionne.
        const r = await page.evaluate(() => {
            const c = document.querySelector('[data-carte-cadre]').getBoundingClientRect()
            const n = document.querySelector('[data-carte-cadre] [data-noeud="ml1"]')
            const b = n.getBoundingClientRect()
            return {visible: b.left >= c.left && b.right <= c.right && b.top >= c.top && b.bottom <= c.bottom, presse: n.getAttribute('aria-pressed')}
        })
        assert.ok(r.visible, 'ML1 hors champ apres la recherche')
        assert.equal(r.presse, 'true')
        await page.keyboard.press('Escape')
        await page.waitForFunction(() => !new URL(location.href).searchParams.get('noeud'))
        assert.equal(await page.locator('[data-panneau][data-ouvert]').count(), 0)
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
            // Par defaut, aucun prerequis externe : seuls les noeuds des bandes choisies.
            for (const c of cartes) assert.ok(bandes.includes(tk[c.id]) && !c.fantome, `${c.id} (${tk[c.id]}) affiche hors filtre ${bandes}`)
        }
        // Rechargement : le filtre est relu depuis l'URL.
        await page.reload()
        await page.waitForSelector('[data-carte-cadre] [data-noeud]')
        const presses = await page.getByRole('group', {name: 'Filtrer la carte par bande'}).locator('[aria-pressed="true"]').allTextContents()
        assert.deepEqual(presses.map(s => s.trim()), ['Maths', 'ML / DL'])
    })
})

describe('filtre Maths + Projets et prerequis externes', () => {
    let page
    before(async () => {
        if (sauter) return
        page = await (await contexte()).newPage()
        await page.goto(`${BASE_URL}/parcours?bandes=math,proj`)
        await page.getByRole('button', {name: /Carte complète/}).click()
        await page.waitForSelector('[data-carte-cadre] [data-noeud]')
    })

    test('?bandes=math,proj : aucun noeud ni libelle des autres bandes dans le DOM', {skip: sauter}, async () => {
        const r = await page.evaluate(() => ({
            noeuds: [...document.querySelectorAll('[data-carte-cadre] [data-noeud]')].map(e => e.dataset.noeud),
            bandes: [...document.querySelectorAll('[data-carte-cadre] [data-bande]')].map(e => e.dataset.bande),
            texte: document.querySelector('[data-carte-cadre]').textContent,
        }))
        assert.deepEqual([...new Set(r.bandes)].sort(), ['math', 'proj'])
        for (const id of r.noeuds) assert.ok(['math', 'proj'].includes(tk[id]), `${id} (${tk[id]}) dans le DOM`)
        for (const libelle of ['Machine / Deep Learning', 'Graphes', 'Algorithmique', 'Données et mise en production']) {
            assert.ok(!r.texte.includes(libelle), `libelle de bande ${libelle} dans le DOM`)
        }
    })

    test('case cochee : seuls les prerequis directs apparaissent en fantome', {skip: sauter}, async () => {
        await page.getByRole('checkbox', {name: 'Prérequis externes'}).check({force: true})
        await page.waitForSelector('[data-carte-cadre] [data-fantome]')
        const cartes = await page.$$eval('[data-carte-cadre] [data-noeud]', els => els.map(e => ({id: e.dataset.noeud, fantome: e.hasAttribute('data-fantome')})))
        const carte = await import('../../src/components/PrereqMap/prereqMapData.js')
        const prerequis = new Map(carte.NODES.map(n => [n.id, n.p ?? []]))
        const visibles = cartes.filter(c => !c.fantome).map(c => c.id)
        for (const c of cartes.filter(c => c.fantome)) {
            assert.ok(!['math', 'proj'].includes(tk[c.id]), `${c.id} fantome alors qu il est dans le filtre`)
            assert.ok(visibles.some(v => prerequis.get(v).includes(c.id)), `${c.id} n est pas un prerequis direct d un noeud affiche`)
        }
        await page.getByRole('checkbox', {name: 'Prérequis externes'}).uncheck({force: true})
    })

    test('surbrillance au clic, panneau lateral, URL ?noeud=, Echap', {skip: sauter}, async () => {
        await page.getByRole('button', {name: 'Tout', exact: true}).click()
        await page.getByRole('button', {name: 'Ajuster'}).click()
        await page.waitForTimeout(400)
        const cible = page.locator('[data-carte-cadre] [data-noeud="m2"]').first()
        await cible.click()
        await page.waitForFunction(() => new URL(location.href).searchParams.get('noeud') === 'm2')
        assert.ok(await page.locator('[data-panneau][data-ouvert]').isVisible(), 'panneau ferme')
        assert.equal(await page.locator('#fiche-titre').textContent(), 'Calcul différentiel')
        // Attend que la surbrillance soit appliquee (styles calcules apres le rendu).
        await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-carte-cadre] [data-noeud="a_cx"]')).opacity === '0.2')
        const roles = await page.$$eval('[data-carte-cadre] [data-noeud]', els => Object.fromEntries(els.map(e => [e.dataset.noeud, [e.dataset.role, getComputedStyle(e).opacity]])))
        assert.equal(roles.m1[0], 'amont')                    // prerequis direct
        assert.equal(roles.m4[0], 'aval')                     // debloque
        assert.equal(roles.a_cx[0], 'autre')
        assert.equal(Number(roles.a_cx[1]), 0.2)              // le reste a 20 %
        assert.ok(await page.locator('path[data-role="amont"]').count() > 0 && await page.locator('path[data-role="aval"]').count() > 0)
        // Chaine complete : s'etend en aval (ex. M5 via M3).
        await page.getByRole('checkbox', {name: /Chaîne complète/}).check({force: true})
        assert.equal(await page.locator('[data-carte-cadre] [data-noeud="m5"]').first().getAttribute('data-role'), 'aval')
        // La carte se reduit : le panneau ne recouvre pas la carte.
        const panneau = await page.locator('[data-panneau]').boundingBox()
        const cadre = await page.locator('[data-carte-cadre]').boundingBox()
        assert.ok(cadre.x + cadre.width <= panneau.x + 1, 'le panneau recouvre la carte')
        await page.keyboard.press('Escape')
        await page.waitForFunction(() => !new URL(location.href).searchParams.get('noeud'))
        assert.equal(await page.locator('[data-panneau][data-ouvert]').count(), 0)
        // Re-clic sur le meme noeud : annule aussi.
        await cible.click(); await cible.click()
        assert.equal(await page.locator('[data-panneau][data-ouvert]').count(), 0)
        // Rechargement avec ?noeud= : panneau ouvert sur ce noeud.
        await page.goto(`${BASE_URL}/parcours?noeud=ml1`)
        await page.waitForSelector('[data-panneau][data-ouvert]')
        assert.equal(await page.locator('#fiche-titre').textContent(), 'Apprendre des données')
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

    test('edition visible pour l admin (dans le panneau)', {skip: sauterAdmin}, async () => {
        // Clic direct (le noeud peut etre hors champ ou sous une surimpression selon le cadrage).
        await page.locator('[data-carte-cadre] [data-noeud]').first().dispatchEvent('click')
        assert.equal(await page.getByRole('group', {name: 'État du nœud'}).count(), 1)
        await page.keyboard.press('Escape')
    })

    // Aucune carte ni aucun titre coupe ; pas de defilement de la page.
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
            const d = document.documentElement
            return {problemes, cartes: document.querySelectorAll('[data-carte-cadre] [data-noeud]').length,
                defilementVertical: d.scrollHeight > d.clientHeight + 1}
        })
        assert.ok(r.cartes > 0, `${vue} : aucune carte affichee`)
        assert.deepEqual(r.problemes, [], `${vue} : cartes tronquees`)
        assert.equal(r.defilementVertical, false, `${vue} : la page defile`)
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
