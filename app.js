// Opción mínima: autodiscovery por nombres 1.jpg, 2.png, ... en /images
const el = document.createElement('article')
el.className = 'group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900'
el.innerHTML = `
<img src="${p.src}" alt="${p.id}" class="h-60 w-full object-cover group-hover:scale-105 transition duration-300"/>
<div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
<h3 class="font-bold">${p.id}</h3>
<div class="mt-2 flex items-center gap-2 text-sm">
<span class="font-semibold">${avgStr(rating)}</span>
<span class="text-white/60">(${rating.count})</span>
${voted?'<span class="ml-auto text-xs px-2 py-0.5 rounded-lg bg-white/10">Ya votaste</span>':''}
</div>
</div>`
el.addEventListener('click', ()=> openModal(p))
return el
}


function renderGallery(list){
galleryEl.innerHTML = ''
if(!list.length){ emptyEl.classList.remove('hidden'); return }
emptyEl.classList.add('hidden')
list.forEach(p=> galleryEl.appendChild(productCard(p)))
}


// =================== Modal ===================
function openModal(p){
currentId = p.id
pendingRating = 0
modalImage.src = p.src
modalImage.alt = p.id
modalTitle.textContent = p.id
modalDesc.textContent = ''
const r = ratings[p.id] || {sum:0,count:0}
modalAvg.textContent = avgStr(r)
modalCount.textContent = `(${r.count})`
renderStars(modalStars, 0)
voteMsg.textContent = hasVoted(p.id) ? 'Ya votaste esta imagen en este navegador.' : ''
modal.classList.remove('hidden')
modal.classList.add('flex')
}


function closeModal(){ modal.classList.add('hidden'); modal.classList.remove('flex') }
modalClose.addEventListener('click', closeModal)
modal.addEventListener('click', (e)=> { if(e.target===modal) closeModal() })


modalStars.addEventListener('mouseover', (e)=>{
const span = e.target.closest('span'); if(!span) return; renderStars(modalStars, Number(span.dataset.val))
})
modalStars.addEventListener('click', (e)=>{
const span = e.target.closest('span'); if(!span) return; pendingRating = Number(span.dataset.val)
})
modalSubmit.addEventListener('click', ()=>{
if(!currentId || !pendingRating){ voteMsg.textContent = 'Elegí una cantidad de estrellas.'; return }
if(hasVoted(currentId)){ voteMsg.textContent = 'Ya registraste tu voto en este navegador.'; return }
const prev = ratings[currentId] || {sum:0,count:0}
const next = { sum: prev.sum + pendingRating, count: prev.count + 1 }
ratings[currentId] = next
saveVoteLocal(currentId, pendingRating)
modalAvg.textContent = avgStr(next)
modalCount.textContent = `(${next.count})`
voteMsg.textContent = '¡Gracias por votar!'
renderGallery(products)
})


// =================== Sorteos ===================
sortMostRatedBtn.addEventListener('click', ()=>{
const enriched = products.map(p=> ({...p, r: ratings[p.id] || {sum:0,count:0}}))
enriched.sort((a,b)=> (b.r.sum/(b.r.count||1)) - (a.r.sum/(a.r.count||1)))
renderGallery(enriched)
})


sortNewestBtn.addEventListener('click', ()=>{
const sorted = [...products].sort((a,b)=> new Date(b.date||0) - new Date(a.date||0))
renderGallery(sorted)
})


resetFiltersBtn.addEventListener('click', ()=> renderGallery(products))


// =================== Boot ===================
(async function boot(){
products = await discoverImages()
initLocalRatings()
renderGallery(products)
})()
