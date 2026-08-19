const loginView=document.querySelector('#login-view'),giftView=document.querySelector('#gift-view'),form=document.querySelector('#login-form'),errorBox=document.querySelector('#login-error'),submitButton=form.querySelector('[type="submit"]');
const escapeHTML=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function renderGallery(items=[]){
  const normalized=Array.from({length:10},(_,index)=>items[index]||{caption:`Eure Erinnerung ${String(index+1).padStart(2,'0')}`,note:'Foto hinzufügen',image_url:''});
  document.querySelector('#gallery').innerHTML=normalized.map((item,index)=>`<figure class="memory reveal"><div class="memory-frame">${item.image_url?`<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.alt_text||item.caption||'Gemeinsame Erinnerung')}" loading="lazy">`:`<span class="placeholder-number">${String(index+1).padStart(2,'0')}</span>`}</div><figcaption><b>${escapeHTML(item.caption||`Moment ${index+1}`)}</b><span>${escapeHTML(item.note||'')}</span></figcaption></figure>`).join('');
}
function fillPage(profile){
  const name=profile.display_name||profile.username||'dich';
  document.querySelector('#nav-name').textContent=name;
  document.querySelector('#birth-date').textContent=profile.birth_date_label||'Heute ist dein Tag';
  if(profile.hero_text)document.querySelector('#hero-text').textContent=profile.hero_text;
  document.querySelector('#letter-title').textContent=profile.letter_title||`Mein liebster ${name},`;
  if(profile.letter_body)document.querySelector('#letter-body').innerHTML=profile.letter_body.split(/\n\n+/).map(p=>`<p>${escapeHTML(p)}</p>`).join('');
  document.querySelector('#signature').textContent=profile.signature||'dein Lieblingsmensch';
  const hero=document.querySelector('[data-slot="hero"]');
  if(profile.hero_image_url){hero.style.backgroundImage=`url("${profile.hero_image_url.replace(/["\\]/g,'')}")`;hero.classList.add('has-image');hero.innerHTML=''}
  renderGallery(profile.gallery);
}
function showGift(profile){fillPage(profile);loginView.hidden=true;giftView.hidden=false;window.scrollTo(0,0);requestAnimationFrame(observeReveals);launchConfetti(55)}
async function request(path,options){const response=await fetch(path,{credentials:'same-origin',...options});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Das hat leider nicht geklappt.');return data}

form.addEventListener('submit',async event=>{event.preventDefault();errorBox.textContent='';submitButton.disabled=true;submitButton.querySelector('span').textContent='Wird geöffnet …';try{const data=await request('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});showGift(data.profile)}catch(error){errorBox.textContent=error.message}finally{submitButton.disabled=false;submitButton.querySelector('span').textContent='Geschenk öffnen'}});
document.querySelector('.peek').addEventListener('click',event=>{const input=document.querySelector('#password');input.type=input.type==='password'?'text':'password';event.currentTarget.textContent=input.type==='password'?'○':'●'});
document.querySelector('#logout').addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST'}).catch(()=>{});giftView.hidden=true;loginView.hidden=false;form.reset()});
document.querySelector('#wish-button').addEventListener('click',event=>{event.currentTarget.classList.add('done');event.currentTarget.innerHTML='Wunsch abgeschickt <span>♥</span>';document.querySelector('#wish-message').textContent='Das Universum kümmert sich jetzt darum.';launchConfetti(90)});
function launchConfetti(amount){const colors=['#173f35','#d7b170','#f5eee3','#8faf9f'];for(let i=0;i<amount;i++){const piece=document.createElement('i');piece.className='confetti-piece';piece.style.setProperty('--left',`${Math.random()*100}vw`);piece.style.setProperty('--color',colors[i%colors.length]);piece.style.setProperty('--duration',`${2.8+Math.random()*3}s`);piece.style.setProperty('--rotate',`${Math.random()*180}deg`);piece.style.setProperty('--drift',`${-80+Math.random()*160}px`);piece.style.animationDelay=`${Math.random()*.7}s`;document.querySelector('#confetti').appendChild(piece);setTimeout(()=>piece.remove(),7000)}}
let observer;function observeReveals(){observer?.disconnect();observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.gift-view .reveal').forEach(el=>observer.observe(el))}
renderGallery();request('/api/content').then(data=>showGift(data.profile)).catch(()=>{});
