const loginView=document.querySelector('#login-view'),giftView=document.querySelector('#gift-view'),form=document.querySelector('#login-form'),errorBox=document.querySelector('#login-error'),submitButton=form.querySelector('[type="submit"]');
const escapeHTML=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const birthdayLetter={title:'Alles Gute zum Geburtstag, Слоник <3',body:'Ich bin sehr froh, dass wir wieder angefangen haben, miteinander zu reden, als ich in Japan war. Ich hätte nie gedacht, dass ich einen Menschen treffen würde, dem ich so sehr vertrauen kann und bei dem ich mich so wohlfühle.\n\nIch glaube an dich und daran, dass du alles schaffen wirst, und wünsche dir zu deinem Geburtstag nur das Allerbeste. Du wirst alles meistern, weil du schön, klug und ein zukünftiger Programmierer bist )))\n\nAlles Gute zum Geburtstag!!! Und vergiss nie: Ich bin an deiner Seite und du wirst alles schaffen.',signature:'Angel'};

function renderGallery(items=[]){
  const normalized=Array.from({length:10},(_,index)=>items[index]||{caption:`Eure Erinnerung ${String(index+1).padStart(2,'0')}`,note:'Foto hinzufügen',image_url:''});
  document.querySelector('#gallery').innerHTML=normalized.map((item,index)=>`<figure class="memory reveal"><div class="memory-frame">${item.image_url?`<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.alt_text||item.caption||'Gemeinsame Erinnerung')}" loading="lazy">`:`<span class="placeholder-number">${String(index+1).padStart(2,'0')}</span>`}</div><figcaption><b>${escapeHTML(item.caption||`Moment ${index+1}`)}</b><span>${escapeHTML(item.note||'')}</span></figcaption></figure>`).join('');
}
function fillPage(profile){
  const name=profile.display_name||profile.username||'dich';
  document.querySelector('#nav-name').textContent=name;
  document.querySelector('#footer-name').textContent=name;
  document.querySelector('#birth-date').textContent=profile.birth_date_label||'Heute ist dein Tag';
  if(profile.hero_text)document.querySelector('#hero-text').textContent=profile.hero_text;
  const hasTemplateText=!profile.letter_body||/Hier kommt dein persönlicher Text hin|Diesen Text kannst du später/i.test(profile.letter_body);
  const letterTitle=hasTemplateText?birthdayLetter.title:(profile.letter_title||`Mein liebster ${name},`),letterBody=hasTemplateText?birthdayLetter.body:profile.letter_body;
  document.querySelector('#letter-title').textContent=letterTitle;
  document.querySelector('#letter-body').innerHTML=letterBody.split(/\n\n+/).map(p=>`<p>${escapeHTML(p)}</p>`).join('');
  document.querySelector('#signature').textContent=hasTemplateText?birthdayLetter.signature:(profile.signature||'dein Lieblingsmensch');
  const finalPhoto=document.querySelector('[data-slot="final"]');
  if(profile.hero_image_url){finalPhoto.style.backgroundImage=`url("${profile.hero_image_url.replace(/["\\]/g,'')}")`;finalPhoto.classList.add('has-image');finalPhoto.innerHTML=''}
  renderGallery(profile.gallery);
}
function showGift(profile){fillPage(profile);loginView.hidden=true;giftView.hidden=false;window.scrollTo(0,0);requestAnimationFrame(observeReveals);launchConfetti(55)}
async function request(path,options){const response=await fetch(path,{credentials:'same-origin',...options});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Das hat leider nicht geklappt.');return data}

form.addEventListener('submit',async event=>{event.preventDefault();errorBox.textContent='';submitButton.disabled=true;submitButton.querySelector('span').textContent='Wird geöffnet …';try{const data=await request('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});showGift(data.profile)}catch(error){errorBox.textContent=error.message}finally{submitButton.disabled=false;submitButton.querySelector('span').textContent='Geschenk öffnen'}});
document.querySelector('.peek').addEventListener('click',event=>{const input=document.querySelector('#password');input.type=input.type==='password'?'text':'password';event.currentTarget.textContent=input.type==='password'?'○':'●'});
document.querySelector('#logout').addEventListener('click',async()=>{await fetch('/api/logout',{method:'POST'}).catch(()=>{});giftView.hidden=true;loginView.hidden=false;form.reset()});
document.querySelector('#wish-button').addEventListener('click',event=>{event.currentTarget.classList.add('done');event.currentTarget.innerHTML='Wunsch abgeschickt <span>♥</span>';document.querySelector('#wish-message').textContent='Das Universum kümmert sich jetzt darum.';launchConfetti(90)});
const finale=document.querySelector('#balloon-finale');
function playFinale(){finale.classList.remove('playing');void finale.offsetWidth;finale.classList.add('playing')}
document.querySelector('#replay-balloons').addEventListener('click',()=>{playFinale();launchConfetti(24)});
function launchConfetti(amount){const colors=['#173f35','#d7b170','#f5eee3','#8faf9f'];for(let i=0;i<amount;i++){const piece=document.createElement('i');piece.className='confetti-piece';piece.style.setProperty('--left',`${Math.random()*100}vw`);piece.style.setProperty('--color',colors[i%colors.length]);piece.style.setProperty('--duration',`${2.8+Math.random()*3}s`);piece.style.setProperty('--rotate',`${Math.random()*180}deg`);piece.style.setProperty('--drift',`${-80+Math.random()*160}px`);piece.style.animationDelay=`${Math.random()*.7}s`;document.querySelector('#confetti').appendChild(piece);setTimeout(()=>piece.remove(),7000)}}
let observer;function observeReveals(){observer?.disconnect();observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');if(entry.target===finale)playFinale();observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('.gift-view .reveal').forEach(el=>observer.observe(el))}
renderGallery();request('/api/content').then(data=>showGift(data.profile)).catch(()=>{});
