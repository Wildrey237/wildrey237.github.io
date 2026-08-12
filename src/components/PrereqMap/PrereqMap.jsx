'use client'

import {useEffect, useRef} from 'react'
import './PrereqMap.css'
import {TRACKS, NODES, PROJ} from './prereqMapData'

const STORAGE_KEY = 'prereq_progress'

export default function PrereqMap() {
    const rootRef = useRef(null)

    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        const qs = (sel) => root.querySelector(sel)
        const qsa = (sel) => root.querySelectorAll(sel)

        const BY = {}
        NODES.forEach(n => { n.pj = PROJ[n.id] || []; BY[n.id] = n })
        NODES.forEach(n => { n.deps = NODES.filter(m => m.p.includes(n.id)).map(m => m.id) })

        // layout
        // MX : gouttiere gauche reservee aux libelles de bande, pour qu ils ne collent pas aux cartes
        const COLW = 272, ROWH = 112, MX = 158, MXR = 56, MY = 64, NW = 224, NH = 76
        const maxCol = Math.max(...NODES.map(n => n.col)), maxRow = Math.max(...NODES.map(n => n.row))
        const CW = MX + maxCol * COLW + NW + MXR
        const CH = MY * 2 + maxRow * ROWH + NH + 10
        const px = n => ({x: MX + n.col * COLW, y: MY + n.row * ROWH})
        // trace de circuit imprime : segments a angle droit, coins arrondis, plutot qu une courbe lisse
        const elbowPath = (x1, y1, x2, y2, r = 10) => {
            if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`
            const midX = x1 + (x2 - x1) / 2
            const dx1 = midX >= x1 ? 1 : -1, dx2 = x2 >= midX ? 1 : -1, dy = y2 >= y1 ? 1 : -1
            const r1 = Math.min(r, Math.abs(midX - x1), Math.abs(y2 - y1) / 2)
            const r2 = Math.min(r, Math.abs(x2 - midX), Math.abs(y2 - y1) / 2)
            return `M ${x1} ${y1} L ${midX - r1 * dx1} ${y1} Q ${midX} ${y1} ${midX} ${y1 + r1 * dy}` +
                ` L ${midX} ${y2 - r2 * dy} Q ${midX} ${y2} ${midX + r2 * dx2} ${y2} L ${x2} ${y2}`
        }

        const canvas = qs('#canvas')
        const svg = qs('#edges')
        canvas.style.width = CW + 'px'; canvas.style.height = CH + 'px'
        svg.setAttribute('viewBox', `0 0 ${CW} ${CH}`); svg.style.width = CW + 'px'; svg.style.height = CH + 'px'

        // lane labels (une par bande, alignee sur la premiere rangee de la bande)
        const laneLabels = []
        ;[['math', 0], ['proj', 3], ['ml', 4], ['proj', 7], ['graph', 9], ['proj', 12], ['algo', 13], ['data', 16], ['proj', 17]].forEach(([tk, row]) => {
            const y = MY + row * ROWH
            const el = document.createElement('div'); el.className = 'lane-label'
            el.textContent = TRACKS[tk].label; el.style.left = '18px'; el.style.top = (y + NH / 2) + 'px'
            el.style.color = TRACKS[tk].c; el.style.opacity = .6; el.style.maxWidth = '118px'
            canvas.appendChild(el); laneLabels.push(el)
        })

        // edges : degrade de la couleur du prerequis vers celle du module qu'il debloque,
        // pour lire d'un coup d'oeil le sens de la dependance
        const SVGNS = 'http://www.w3.org/2000/svg'
        const defs = document.createElementNS(SVGNS, 'defs')
        svg.appendChild(defs)
        const edgeEls = {}
        const edgePaths = []
        NODES.forEach(n => {
            const a = px(n)
            n.p.forEach(pid => {
                const pn = BY[pid]; if (!pn) return
                const b = px(pn)
                const x1 = b.x + NW, y1 = b.y + NH / 2, x2 = a.x, y2 = a.y + NH / 2
                const d = elbowPath(x1, y1, x2, y2)

                const gradId = `prereqGrad-${pid}-${n.id}`
                const grad = document.createElementNS(SVGNS, 'linearGradient')
                grad.setAttribute('id', gradId)
                grad.setAttribute('gradientUnits', 'userSpaceOnUse')
                grad.setAttribute('x1', x1); grad.setAttribute('y1', y1)
                grad.setAttribute('x2', x2); grad.setAttribute('y2', y2)
                const s1 = document.createElementNS(SVGNS, 'stop')
                s1.setAttribute('offset', '0%'); s1.style.stopColor = TRACKS[pn.tk].c; s1.style.stopOpacity = '.28'
                const s2 = document.createElementNS(SVGNS, 'stop')
                s2.setAttribute('offset', '100%'); s2.style.stopColor = TRACKS[n.tk].c; s2.style.stopOpacity = '.55'
                grad.appendChild(s1); grad.appendChild(s2)
                defs.appendChild(grad)

                const path = document.createElementNS(SVGNS, 'path')
                path.setAttribute('d', d); path.setAttribute('class', 'edge')
                path.style.stroke = `url(#${gradId})`
                path.dataset.child = n.id; path.dataset.parent = pid; path.dataset.grad = gradId
                svg.appendChild(path); edgePaths.push(path)
                ;(edgeEls[n.id] = edgeEls[n.id] || []).push(path)
            })
        })

        // nodes
        const nodeEls = {}
        NODES.forEach(n => {
            const a = px(n)
            const el = document.createElement('div')
            el.className = 'node'; el.dataset.id = n.id; el.dataset.tk = n.tk; el.dataset.st = '0'
            el.style.left = a.x + 'px'; el.style.top = a.y + 'px'
            // entree en cascade : la carte apparait selon sa position dans le flux
            el.style.animationDelay = (n.col * 42 + n.row * 14) + 'ms'
            el.style.setProperty('--tc', TRACKS[n.tk].c) // teinte la carte a la couleur de sa piste
            el.tabIndex = 0; el.setAttribute('role', 'button')
            el.setAttribute('aria-label', `${n.t}. Entree pour ouvrir le detail, espace pour changer l etat.`)
            // separateur constant dans toutes les entrees ("M1 · Algebre lineaire") : on isole le designant
            // (repere façon composant de schema electronique) du libelle descriptif
            const sepIdx = n.t.indexOf(' · ')
            const code = sepIdx === -1 ? n.t : n.t.slice(0, sepIdx)
            const label = sepIdx === -1 ? '' : n.t.slice(sepIdx + 3)
            el.innerHTML = `<span class="tk" style="background:${TRACKS[n.tk].c}"></span>
        <div class="head">
          <span class="code">${code}</span>
          <span class="lvl">${n.tk} · n${n.col}</span>
        </div>
        <span class="ttl">${label}</span>
        <div class="status" title="Changer l etat"></div>`
            el.addEventListener('click', e => { if (e.target.classList.contains('status')) return; select(n.id) })
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter') { e.preventDefault(); select(n.id) }
                else if (e.key === ' ') { e.preventDefault(); cycle(n.id) }
            })
            el.querySelector('.status').addEventListener('click', e => { e.stopPropagation(); cycle(n.id) })
            // spotlight qui suit le curseur (souris uniquement, inutile au toucher)
            el.addEventListener('pointermove', e => {
                if (e.pointerType === 'touch') return
                const r = el.getBoundingClientRect()
                el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%')
                el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%')
            })
            canvas.appendChild(el); nodeEls[n.id] = el
        })

        // ---- progress state (persiste dans le navigateur) ----
        let state = {}
        function loadState() {
            try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) state = JSON.parse(raw) }
            catch (_) { /* pas de stockage : memoire de session */ }
            NODES.forEach(n => { if (!(n.id in state)) state[n.id] = 0 })
            paintAll()
        }
        function saveState() {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (_) { /* stockage indisponible */ }
        }
        function cycle(id) { state[id] = ((state[id] || 0) + 1) % 3; saveState(); paintAll(); if (sel === id) paintDrawerState() }
        function setState(id, v) { state[id] = v; saveState(); paintAll(); paintDrawerState() }

        function ancestors(id, acc) { acc = acc || new Set(); BY[id].p.forEach(p => { if (!acc.has(p)) { acc.add(p); ancestors(p, acc) } }); return acc }
        function isReady(id) { return state[id] !== 2 && BY[id].p.every(p => state[p] === 2) }

        function paintAll() {
            // meter
            const total = NODES.length, done = NODES.filter(n => state[n.id] === 2).length
            qs('#mcount').textContent = `${done} / ${total}`
            qs('#mfill').style.width = (100 * done / total) + '%'
            NODES.forEach(n => {
                const el = nodeEls[n.id]
                el.dataset.st = state[n.id]
                el.classList.toggle('ready', isReady(n.id) && !filtered(n.tk))
            })
            applyFilter()
            if (sel) highlight(sel)
        }

        // ---- selection / highlight ----
        let sel = null
        function select(id) { sel = id; highlight(id); openDrawer(id) }
        function highlight(id) {
            const anc = ancestors(id); const deps = new Set(BY[id].deps)
            NODES.forEach(n => {
                const el = nodeEls[n.id]; el.classList.remove('sel', 'req', 'next', 'dim')
                if (n.id === id) el.classList.add('sel')
                else if (anc.has(n.id)) el.classList.add('req')
                else if (deps.has(n.id)) el.classList.add('next')
                else el.classList.add('dim')
            })
            Object.values(edgeEls).flat().forEach(p => {
                const c = p.dataset.child, pa = p.dataset.parent
                const on = (c === id || anc.has(c)) && (pa === id || anc.has(pa))
                p.classList.toggle('hot', on)
                p.style.stroke = on ? 'var(--math)' : `url(#${p.dataset.grad})`
                p.style.opacity = on ? '.9' : (sel ? '.25' : '')
            })
        }
        function clearHighlight() {
            sel = null
            NODES.forEach(n => nodeEls[n.id].classList.remove('sel', 'req', 'next', 'dim'))
            Object.values(edgeEls).flat().forEach(p => { p.classList.remove('hot'); p.style.stroke = `url(#${p.dataset.grad})`; p.style.opacity = '' })
        }

        // ---- drawer ----
        const drawer = qs('#drawer')
        function openDrawer(id) {
            const n = BY[id]
            qs('#d-eye').textContent = TRACKS[n.tk].label
            qs('#d-eye').style.color = TRACKS[n.tk].c
            qs('#d-title').textContent = n.t
            const nb = qs('#d-notions'); nb.innerHTML = ''
            n.n.forEach(x => { const s = document.createElement('span'); s.className = 'notion'; s.textContent = x; nb.appendChild(s) })
            fillChips('d-prereq', n.p, 'Aucun. Point d entree, tu peux commencer ici.')
            fillChips('d-unlocks', n.deps, 'Aboutissement. Aucun module ne depend de celui-ci.')
            const pjBox = qs('#d-proj'); pjBox.innerHTML = ''
            const sectPj = qs('#sect-pj')
            if (n.pj && n.pj.length) {
                sectPj.style.display = ''
                n.pj.forEach(p => {
                    const d = document.createElement('div'); d.className = 'proj'
                    d.innerHTML = `<div class="pn">${p.n}</div><div class="pw">${p.w}</div>`; pjBox.appendChild(d)
                })
            } else { sectPj.style.display = 'none' }
            paintDrawerState()
            drawer.classList.add('open')
        }
        function fillChips(elId, ids, emptyMsg) {
            const box = qs('#' + elId); box.innerHTML = ''
            if (!ids.length) { const e = document.createElement('span'); e.className = 'empty'; e.textContent = emptyMsg; box.appendChild(e); return }
            ids.forEach(pid => {
                const pn = BY[pid]; const c = document.createElement('span'); c.className = 'chip'
                c.innerHTML = `<span class="cd" style="background:${TRACKS[pn.tk].c}"></span>${pn.t}`
                c.addEventListener('click', () => select(pid)); box.appendChild(c)
            })
        }
        function paintDrawerState() {
            const v = state[sel] || 0
            drawer.querySelectorAll('.stbtn').forEach(b => b.classList.toggle('on', +b.dataset.v === v))
        }
        const stbtnHandlers = []
        drawer.querySelectorAll('.stbtn').forEach(b => {
            const h = () => setState(sel, +b.dataset.v)
            b.addEventListener('click', h); stbtnHandlers.push([b, h])
        })

        const closeBtn = qs('#close')
        const onClose = () => { drawer.classList.remove('open'); clearHighlight() }
        closeBtn.addEventListener('click', onClose)

        const stage = qs('#stage')
        const onStageBgClick = e => { if (e.target.id === 'stage' || e.target.id === 'canvas') { drawer.classList.remove('open'); clearHighlight() } }
        stage.addEventListener('click', onStageBgClick)

        // ---- filters ----
        const offTracks = new Set()
        function filtered(tk) { return offTracks.has(tk) }
        function applyFilter() {
            NODES.forEach(n => { nodeEls[n.id].style.display = filtered(n.tk) ? 'none' : '' })
            Object.values(edgeEls).flat().forEach(p => {
                const hide = filtered(BY[p.dataset.child].tk) || filtered(BY[p.dataset.parent].tk)
                p.style.display = hide ? 'none' : ''
            })
        }
        const legendHandlers = []
        qsa('#legend .lg').forEach(l => {
            l.tabIndex = 0; l.setAttribute('role', 'switch'); l.setAttribute('aria-checked', 'true')
            const toggle = () => {
                const tk = l.dataset.tk
                if (offTracks.has(tk)) { offTracks.delete(tk); l.classList.remove('off'); l.setAttribute('aria-checked', 'true') }
                else { offTracks.add(tk); l.classList.add('off'); l.setAttribute('aria-checked', 'false') }
                paintAll()
            }
            const onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } }
            l.addEventListener('click', toggle); l.addEventListener('keydown', onKey)
            legendHandlers.push([l, toggle, onKey])
        })

        // ---- zoom ----
        let scale = 1
        function applyZoom() { canvas.style.transform = `scale(${scale})` }
        const zinBtn = qs('#zin'), zoutBtn = qs('#zout'), zfitBtn = qs('#zfit')
        const onZin = () => { scale = Math.min(1.6, scale + .12); applyZoom() }
        const onZout = () => { scale = Math.max(.35, scale - .12); applyZoom() }
        function fit() {
            const target = (stage.clientWidth - 24) / CW
            // sous 560px, on ne descend jamais en dessous d'un seuil de lisibilite :
            // le plan deborde et se parcourt au doigt plutot que de rapetisser le texte
            const floor = stage.clientWidth < 560 ? 0.62 : 0
            scale = Math.max(floor, Math.min(1, target))
            applyZoom()
        }
        zinBtn.addEventListener('click', onZin); zoutBtn.addEventListener('click', onZout); zfitBtn.addEventListener('click', fit)

        // ---- reset en deux temps, pas de popup navigateur ----
        const resetBtn = qs('#reset')
        let armed = null
        function disarm() { clearTimeout(armed); armed = null; resetBtn.classList.remove('armed'); resetBtn.textContent = 'reset' }
        const onReset = () => {
            if (!armed) { resetBtn.classList.add('armed'); resetBtn.textContent = 'confirmer ?'; armed = setTimeout(disarm, 3500); return }
            disarm(); NODES.forEach(n => state[n.id] = 0); saveState(); paintAll()
        }
        const onResetBlur = () => { if (armed) disarm() }
        resetBtn.addEventListener('click', onReset)
        resetBtn.addEventListener('blur', onResetBlur)

        // ---- deplacement du plan a la souris ----
        let pan = null, dragged = false
        const onPointerDown = e => {
            // tactile : on laisse le scroll natif du stage gerer le pan, pas de double gestion
            if (e.pointerType === 'touch' || e.pointerType === 'pen') return
            if (e.button !== 0) return
            pan = {x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop}; dragged = false
        }
        const onPointerMove = e => {
            if (!pan) return
            const dx = e.clientX - pan.x, dy = e.clientY - pan.y
            if (!dragged && Math.hypot(dx, dy) > 5) { dragged = true; stage.classList.add('panning') }
            if (dragged) { stage.scrollLeft = pan.l - dx; stage.scrollTop = pan.t - dy }
        }
        const onPointerUp = () => { pan = null; stage.classList.remove('panning'); setTimeout(() => { dragged = false }, 0) }
        const onStageClickCapture = e => { if (dragged) { e.stopPropagation(); e.preventDefault() } }
        stage.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
        stage.addEventListener('click', onStageClickCapture, true)

        // ---- raccourcis et astuce ----
        const onKeydown = e => {
            if (e.key === 'Escape') { drawer.classList.remove('open'); clearHighlight(); if (armed) disarm() }
        }
        document.addEventListener('keydown', onKeydown)
        const tipEl = qs('#tip')
        tipEl.title = 'Cliquer pour masquer'
        const onTipClick = () => tipEl.classList.add('gone')
        tipEl.addEventListener('click', onTipClick)

        const onResize = () => { if (scale <= 1) fit() }
        window.addEventListener('resize', onResize)

        // init
        loadState()
        fit()

        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            window.removeEventListener('resize', onResize)
            document.removeEventListener('keydown', onKeydown)
            stage.removeEventListener('pointerdown', onPointerDown)
            stage.removeEventListener('click', onStageClickCapture, true)
            stage.removeEventListener('click', onStageBgClick)
            closeBtn.removeEventListener('click', onClose)
            zinBtn.removeEventListener('click', onZin)
            zoutBtn.removeEventListener('click', onZout)
            zfitBtn.removeEventListener('click', fit)
            resetBtn.removeEventListener('click', onReset)
            resetBtn.removeEventListener('blur', onResetBlur)
            tipEl.removeEventListener('click', onTipClick)
            stbtnHandlers.forEach(([b, h]) => b.removeEventListener('click', h))
            legendHandlers.forEach(([l, toggle, onKey]) => { l.removeEventListener('click', toggle); l.removeEventListener('keydown', onKey) })
            laneLabels.forEach(el => el.remove())
            Object.values(nodeEls).forEach(el => el.remove())
            edgePaths.forEach(p => p.remove())
            defs.remove()
        }
    }, [])

    return (
        <div className="prereqMap" ref={rootRef}>
            <header>
                <div className="brand">
                    <span className="k">SCIA-G · reconstruction</span>
                    <h1>Carte des prerequis</h1>
                </div>
                <div className="spacer"/>
                <div className="meter" title="Modules maitrises">
                    <span id="mcount">0 / 0</span>
                    <div className="bar"><i id="mfill"/></div>
                </div>
                <div className="legend" id="legend">
                    <span className="lg" data-tk="math"><span className="dot" style={{background: 'var(--math)'}}/>Math</span>
                    <span className="lg" data-tk="ml"><span className="dot" style={{background: 'var(--ml)'}}/>ML / DL</span>
                    <span className="lg" data-tk="graph"><span className="dot" style={{background: 'var(--graph)'}}/>ML graphe</span>
                    <span className="lg" data-tk="algo"><span className="dot" style={{background: 'var(--algo)'}}/>Algo</span>
                    <span className="lg" data-tk="data"><span className="dot" style={{background: 'var(--data)'}}/>Donnees / prod</span>
                    <span className="lg" data-tk="proj"><span className="dot" style={{background: 'var(--proj)'}}/>Projets</span>
                </div>
                <div className="controls">
                    <button className="ctl" id="zout">-</button>
                    <button className="ctl" id="zfit">ajuster</button>
                    <button className="ctl" id="zin">+</button>
                    <button className="ctl" id="reset" title="Remettre toute la progression a zero">reset</button>
                </div>
            </header>

            <main className="stage" id="stage">
                <div className="canvas" id="canvas">
                    <svg className="edges" id="edges" aria-hidden="true"/>
                </div>
            </main>

            <aside className="drawer" id="drawer" aria-label="Detail du module">
                <button className="close" id="close" title="Fermer (Echap)" aria-label="Fermer le panneau">&times;</button>
                <div className="dh">
                    <span className="eyebrow" id="d-eye">·</span>
                    <h2 id="d-title">·</h2>
                    <div className="stwrap">
                        <div className="stbtn" data-v="0">non commence</div>
                        <div className="stbtn" data-v="1">en cours</div>
                        <div className="stbtn" data-v="2">maitrise</div>
                    </div>
                </div>
                <div className="db">
                    <div className="sect">
                        <h3>Notions a maitriser</h3>
                        <div className="notions" id="d-notions"/>
                    </div>
                    <div className="sect">
                        <h3>A maitriser avant (prerequis)</h3>
                        <div className="chips" id="d-prereq"/>
                    </div>
                    <div className="sect">
                        <h3>Ce que ce module debloque</h3>
                        <div className="chips" id="d-unlocks"/>
                    </div>
                    <div className="sect" id="sect-pj">
                        <h3>Projet EPITA d&apos;application (livrable)</h3>
                        <div id="d-proj"/>
                    </div>
                </div>
                <div className="hint">Astuce : clique un prerequis pour naviguer vers lui. Le rond en haut a droite de chaque carte change son etat.</div>
            </aside>

            <div className="tip" id="tip">
                Clique une carte : sa chaine de prerequis s&apos;allume en <b style={{color: 'var(--math)'}}>or</b> (a faire avant),
                ce qu&apos;elle debloque en <b style={{color: 'var(--proj)'}}>rose</b>. Un <b style={{color: 'var(--algo)'}}>point vert</b> = pret a demarrer.
            </div>
        </div>
    )
}
