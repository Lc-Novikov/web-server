const API_URL = "";
const IMG_DEFAULT = "https://raw.githubusercontent.com/starlyn-chann/Mistic-star/main/tourl/1794774266726-WGupaVZkmPsx.jpg";
const LINK_COMUNIDAD = "https://chat.whatsapp.com/GAzF9ICsYar7O6Yhe4Y5R0?s=cl&p=a&mlu=4&ilr=4&iam=2";
const ICON_USER = "https://ui-avatars.com/api/?name=U&background=0e7490&color=fff&size=128";
for(let i=0;i<16;i++){let b=document.createElement('div');b.className='burbuja';let s=4+Math.random()*12;b.style.width=s+'px';b.style.height=s+'px';b.style.left=Math.random()*100+'%';b.style.animationDuration=(6+Math.random()*9)+'s';b.style.animationDelay=(Math.random()*8)+'s';document.querySelector('.bg').appendChild(b)}
let modoConexion = 'vip';
function irApartado(tipo){
  modoConexion = tipo;
  document.getElementById('vista-principal').style.display = 'none';
  document.getElementById('apartado-token').style.display = tipo==='token' ? 'block' : 'none';
  document.getElementById('apartado-vip').style.display = tipo==='vip' ? 'block' : 'none';
  document.getElementById('apartado-normal').style.display = tipo==='normal' ? 'block' : 'none';
  document.getElementById('cardToken').classList.toggle('active', tipo==='token');
  document.getElementById('cardVip').classList.toggle('active', tipo==='vip');
  document.getElementById('cardNormal').classList.toggle('active', tipo==='normal');
  window.scrollTo({top:0, behavior:'smooth'});
  try{ localStorage.setItem('marine_modo', tipo) }catch{}
  if(tipo==='token') setTimeout(()=>document.getElementById('numToken').focus(),100);
  if(tipo==='vip') setTimeout(()=>document.getElementById('tokenVip').focus(),100);
  if(tipo==='normal') setTimeout(()=>document.getElementById('numberNormal').focus(),100);
}
function volverApartado(){
  document.getElementById('vista-principal').style.display = 'block';
  document.getElementById('apartado-token').style.display = 'none';
  document.getElementById('apartado-vip').style.display = 'none';
  document.getElementById('apartado-normal').style.display = 'none';
  window.scrollTo({top:0, behavior:'smooth'});
}
function seleccionarModo(tipo){ irApartado(tipo); }
async function comprarToken(){
  let numInput = document.getElementById('numToken').value.replace(/[^0-9]/g,'');
  if(!numInput || numInput.length < 9){ alert('Pon tu numero completo con codigo de pais. Ej: 5215512345678'); return; }
  let btn = document.getElementById('btnGenerarToken');
  btn.disabled = true; btn.textContent = 'Generando tu token...';
  document.getElementById('tokenStatus').textContent = '';
  try{
    let res = await fetch(API_URL + '/api/token', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ number: numInput }) });
    let data = await res.json();
    if(data.error) throw new Error(data.error);
    document.getElementById('tokenGenerado').textContent = data.token;
    document.getElementById('tokenGeneradoBox').style.display = 'block';
    document.getElementById('tokenVip').value = data.token;
    document.getElementById('tokenStatus').textContent = 'Token generado para +' + data.number;
    document.getElementById('tokenStatus').style.color = '#22c55e';
  }catch(e){
    document.getElementById('tokenStatus').textContent = 'Error: ' + e.message;
    document.getElementById('tokenStatus').style.color = '#f87171';
  } finally { btn.disabled = false; btn.textContent = 'Generar mi Token Gratis'; }
}
function copiarTokenGenerado(){ let t = document.getElementById('tokenGenerado').textContent; navigator.clipboard.writeText(t).then(()=>alert('Token copiado: ' + t)); }
const DEVS_MANUAL=[
{nombre:'Xplorazzy Tech',usuario:'@DevsOpp',pic:'',rol:'PROPIETARIO',rolClass:'rol-propietario',cardClass:'owner',btnClass:'dev-btn-propietario',desc:'Dueno y creador del bot. Encargado del codigo, la web y toda la red Marine.',whatsapp:'https://wa.me/51954087647',number:'51954087647'},
{nombre:'DevsOpp',usuario:'@DevsOpp',pic:'https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg',rol:'OWNER',rolClass:'rol-owner',cardClass:'owner2',btnClass:'dev-btn-owner',desc:'Owner del proyecto. Ayuda con soporte, resenas y moderacion de la comunidad.',whatsapp:'https://wa.me/51939590305',number:'51939590305'},
{nombre:'Incognito',usuario:'@incognito',pic:'https://ui-avatars.com/api/?name=?&background=334155&color=fff&size=128',rol:'DEV / SOPORTE',rolClass:'rol-dev',cardClass:'dev',btnClass:'dev-btn-dev',desc:'Dev / Soporte en incognito. Proximamente se revelara su identidad.',whatsapp:LINK_COMUNIDAD,number:''},
];
async function loadDevs(){
  let devs = DEVS_MANUAL;
  try{
    const r = await fetch(API_URL + '/api/devs');
    if(r.ok){ const d = await r.json(); const lista = d.devs || d.list || d;
      if(Array.isArray(lista) && lista.length){
        devs = lista.map((x,i)=>{ const base = DEVS_MANUAL[i] || DEVS_MANUAL[DEVS_MANUAL.length-1];
          return {nombre:x.nombre||x.name||base.nombre,usuario:x.usuario||base.usuario,pic:x.pic||base.pic,rol:x.rol||base.rol,rolClass:base.rolClass,cardClass:base.cardClass,btnClass:base.btnClass,desc:x.desc||base.desc,whatsapp:x.whatsapp||(x.number?'https://wa.me/'+x.number:base.whatsapp),number:x.number||base.number};
        });
      }
    }
  }catch(e){}
  document.getElementById('devsList').innerHTML = devs.map(d=>{
    let foto = d.pic || (d.rol==='PROPIETARIO' ? ICON_USER : IMG_DEFAULT);
    return `<div class="dev-card ${d.cardClass}"><img class="dev-avatar" src="${foto}" onerror="this.onerror=null;this.src='${ICON_USER}'"><div class="dev-info"><b>${d.nombre}</b><span class="dev-user">${d.usuario}</span><small>${d.desc}</small><span class="rol ${d.rolClass}">${d.rol}</span></div></div><a class="dev-btn ${d.btnClass}" href="${d.whatsapp}" target="_blank" rel="noopener">${d.rol==='PROPIETARIO'?'Contactar al Propietario':'Contactar'}</a>`;
  }).join('');
}
loadDevs();
function showTab(tab,btn){
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  document.getElementById('tab-vincular').style.display = tab==='vincular' ? 'block':'none';
  document.getElementById('tab-bots-only').style.display = tab==='bots' ? 'block':'none';
  document.getElementById('tab-devs-only').style.display = tab==='devs' ? 'block':'none';
  if(tab==='bots') loadList();
  if(tab==='devs') loadDevs();
}
function copiarCodigo(){let c=document.getElementById('pairCode').textContent;if(!c||c.includes('-')) return alert('Aun no hay codigo');navigator.clipboard.writeText(c.replace(/-/g,'')).then(()=>alert('Codigo copiado: '+c))}
function copiarCodigoNormal(){let c=document.getElementById('pairCodeNormal').textContent;if(!c||c.includes('-')) return alert('Aun no hay codigo');navigator.clipboard.writeText(c.replace(/-/g,'')).then(()=>alert('Codigo copiado: '+c))}
let statusInterval=null,countdownInterval=null,secondsLeft=60,pairingEnCurso=false;
let myName=localStorage.getItem('marine_name')||'';if(myName){document.getElementById('chatName').value=myName;document.getElementById('revName').value=myName}
function startCountdown(){if(countdownInterval)clearInterval(countdownInterval);secondsLeft=60;document.getElementById('expiredMsg').style.display='none';document.getElementById('countdown').textContent=secondsLeft;document.getElementById('countFill').style.width='100%';countdownInterval=setInterval(()=>{secondsLeft--;if(secondsLeft<0)secondsLeft=0;document.getElementById('countdown').textContent=secondsLeft;document.getElementById('countFill').style.width=(secondsLeft/60*100)+'%';if(secondsLeft<=0){clearInterval(countdownInterval);document.getElementById('expiredMsg').style.display='block';document.getElementById('status').textContent='Codigo vencido, genera uno nuevo';document.getElementById('status').className='error';pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent='Generar codigo VIP'}},1000)}
async function getPairingCode(){
  if(pairingEnCurso) return;
  const number=document.getElementById('number').value.replace(/[^0-9]/g,'');
  if(number.length<9){alert('Pon tu numero completo con codigo de pais. Ej: 5215512345678');return}
  let token = document.getElementById('tokenVip').value.trim().toUpperCase();
  if(!token){ alert('Eres VIP, pon tu token. Toca Volver y luego Comprar Token, es gratis.'); document.getElementById('tokenVip').focus(); return; }
  document.getElementById('estadoTexto').textContent=`Generando codigo VIP para +${number}...`;
  pairingEnCurso=true;document.getElementById('btnCode').disabled=true;document.getElementById('btnCode').textContent='Generando... espera 10s';document.getElementById('status').textContent='Generando codigo de 8 digitos...';document.getElementById('status').className='';
  try{
    const res=await fetch(API_URL+'/api/pairing-vip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number, token})});
    const data=await res.json();if(data.error) throw new Error(data.error);
    if(data.already){document.getElementById('status').textContent='Ya estaba conectado';document.getElementById('status').className='success';pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent='Generar codigo VIP';loadList();return}
    document.getElementById('codeBox').style.display='block';document.getElementById('pairCode').textContent=data.code;document.getElementById('estadoTexto').textContent='Codigo generado, ponlo en WhatsApp';document.getElementById('status').textContent='Pon ese codigo en WhatsApp, se conecta solo';startCountdown();
    if(statusInterval)clearInterval(statusInterval);
    statusInterval=setInterval(async()=>{const r=await fetch(API_URL+'/api/status?number='+number);const s=await r.json();if(s.connected){clearInterval(statusInterval);if(countdownInterval)clearInterval(countdownInterval);document.getElementById('status').textContent='CONECTADO COMO HOUSHOU VIP';document.getElementById('status').className='success';document.getElementById('estadoTexto').textContent='CONECTADO VIP';document.getElementById('codeBox').style.display='none';pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent='Generar codigo VIP';loadList()}},3000);
    setTimeout(()=>{if(pairingEnCurso){pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent='Generar codigo VIP'}},70000);
  }catch(e){pairingEnCurso=false;document.getElementById('status').textContent='Error: '+e.message;document.getElementById('status').className='error';document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent='Generar codigo VIP'}
}
let pairingNormalEnCurso=false, statusIntervalNormal=null, countdownIntervalNormal=null, secondsLeftNormal=60;
function startCountdownNormal(){if(countdownIntervalNormal)clearInterval(countdownIntervalNormal);secondsLeftNormal=60;document.getElementById('expiredMsgNormal').style.display='none';document.getElementById('countdownNormal').textContent=secondsLeftNormal;document.getElementById('countFillNormal').style.width='100%';countdownIntervalNormal=setInterval(()=>{secondsLeftNormal--;if(secondsLeftNormal<0)secondsLeftNormal=0;document.getElementById('countdownNormal').textContent=secondsLeftNormal;document.getElementById('countFillNormal').style.width=(secondsLeftNormal/60*100)+'%';if(secondsLeftNormal<=0){clearInterval(countdownIntervalNormal);document.getElementById('expiredMsgNormal').style.display='block';pairingNormalEnCurso=false;document.getElementById('btnCodeNormal').disabled=false;document.getElementById('btnCodeNormal').textContent='Generar codigo NORMAL'}},1000)}
async function getPairingCodeNormal(){
  if(pairingNormalEnCurso) return;
  const number=document.getElementById('numberNormal').value.replace(/[^0-9]/g,'');
  if(number.length<9){alert('Pon tu numero completo con codigo de pais. Ej: 5215512345678');return}
  document.getElementById('estadoTextoNormal').textContent=`Generando codigo NORMAL para +${number}...`;
  pairingNormalEnCurso=true;document.getElementById('btnCodeNormal').disabled=true;document.getElementById('btnCodeNormal').textContent='Generando... espera 10s';document.getElementById('statusNormal').textContent='Generando codigo de 8 digitos...';document.getElementById('statusNormal').className='';
  try{
    const res=await fetch(API_URL+'/api/pairing-normal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number})});
    const data=await res.json();if(data.error) throw new Error(data.error);
    if(data.already){document.getElementById('statusNormal').textContent='Ya estaba conectado';document.getElementById('statusNormal').className='success';pairingNormalEnCurso=false;document.getElementById('btnCodeNormal').disabled=false;document.getElementById('btnCodeNormal').textContent='Generar codigo NORMAL';loadList();return}
    document.getElementById('codeBoxNormal').style.display='block';document.getElementById('pairCodeNormal').textContent=data.code;document.getElementById('estadoTextoNormal').textContent='Codigo generado, ponlo en WhatsApp';document.getElementById('statusNormal').textContent='Pon ese codigo en WhatsApp, se conecta solo';startCountdownNormal();
    if(statusIntervalNormal)clearInterval(statusIntervalNormal);
    statusIntervalNormal=setInterval(async()=>{const r=await fetch(API_URL+'/api/status?number='+number);const s=await r.json();if(s.connected){clearInterval(statusIntervalNormal);if(countdownIntervalNormal)clearInterval(countdownIntervalNormal);document.getElementById('statusNormal').textContent='CONECTADO COMO HOUSHOU BOT';document.getElementById('statusNormal').className='success';document.getElementById('estadoTextoNormal').textContent='CONECTADO NORMAL';document.getElementById('codeBoxNormal').style.display='none';pairingNormalEnCurso=false;document.getElementById('btnCodeNormal').disabled=false;document.getElementById('btnCodeNormal').textContent='Generar codigo NORMAL';loadList()}},3000);
    setTimeout(()=>{if(pairingNormalEnCurso){pairingNormalEnCurso=false;document.getElementById('btnCodeNormal').disabled=false;document.getElementById('btnCodeNormal').textContent='Generar codigo NORMAL'}},70000);
  }catch(e){pairingNormalEnCurso=false;document.getElementById('statusNormal').textContent='Error: '+e.message;document.getElementById('statusNormal').className='error';document.getElementById('btnCodeNormal').disabled=false;document.getElementById('btnCodeNormal').textContent='Generar codigo NORMAL'}
}
async function loadList(){
  try{
    const r=await fetch(API_URL+'/api/list');const data=await r.json();
    const total=data.list?.length||0;
    document.getElementById('count').textContent=total;
    let countTop=document.getElementById('countBotsTop'); if(countTop) countTop.textContent=total;
    document.getElementById('barFill').style.width=Math.min(total/120*100,100)+'%';
    if(total>=120){document.getElementById('alertaLimite').style.display='block';document.getElementById('btnCode').disabled=true;document.getElementById('btnCode').textContent='Limite alcanzado'}
    const html=!data.list?.length?'<div style="color:#888;font-size:13px;text-align:center;padding:16px">Aun no hay Sub-Bots. Se el primero</div>':data.list.map(u=>{
      let foto = u.pic || ICON_USER;
      let isVip = !!u.vip;
      return `<div class="item ${isVip?'item-vip':'item-normal'}"><img src="${foto}" onerror="this.onerror=null;this.src='${ICON_USER}'"><div class="info-bot"><b>${u.name||'Sub-Bot'}</b><small>wa.me/${u.number}</small><span>En linea</span></div><span class="badge ${isVip?'badge-vip':'badge-normal'}">${isVip?'<svg viewBox="0 0 24 24"><path d="M2 18h20l-2-9-6 4-2-7-2 7-6-4-2 9zM4 20h16v2H4z"/></svg> VIP':'NORMAL'}</span></div>`;
    }).join('');
    let b=document.getElementById('list2');if(b)b.innerHTML=html;
  }catch(e){}
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
async function loadChat(){try{const r=await fetch(API_URL+'/api/chat');const d=await r.json();const box=document.getElementById('chatBody');document.getElementById('chatCount').textContent=d.chat?.length||0;if(!d.chat?.length){box.innerHTML='<div class="empty-chat">Se el primero en escribir.</div>';return}let my=document.getElementById('chatName').value.trim();box.innerHTML=d.chat.slice(-60).map(x=>{let isMe=my&&x.name===my;return `<div class="msg ${isMe?'msg-out':'msg-in'}"><b>${esc(x.name)} ${isMe?'(Tu)':''}</b>${esc(x.message)}<span class="time">${esc(String(x.date||'').slice(11,16))}</span></div>`}).join('');box.scrollTop=box.scrollHeight}catch{}}
async function sendChat(){const name=document.getElementById('chatName').value.trim()||'Anonimo';const message=document.getElementById('chatMsg').value.trim();if(!message) return alert('Escribe algo');localStorage.setItem('marine_name',name);document.getElementById('revName').value=name;await fetch(API_URL+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message})});document.getElementById('chatMsg').value='';loadChat()}
async function loadReviews(){try{const r=await fetch(API_URL+'/api/reviews');const d=await r.json();const box=document.getElementById('reviews');if(!d.reviews?.length){box.innerHTML='<div style="color:#888;font-size:13px">Sin resenas aun, se el primero.</div>';return}box.innerHTML=d.reviews.slice(0,20).map(x=>`<div class="review-item"><b>${esc(x.name)}</b> <small>${esc(x.date)}</small><p>${esc(x.message)}</p>${x.reply?`<div class="review-reply"><b>Owner responde:</b><br>${esc(x.reply)}</div>`:`<small style="color:#38bdf8">Esperando respuesta del Owner...</small>`}</div>`).join('')}catch{}}
async function sendReview(){const name=document.getElementById('revName').value.trim()||'Anonimo';const message=document.getElementById('revMsg').value.trim();if(!message) return alert('Escribe tu resena');localStorage.setItem('marine_name',name);document.getElementById('chatName').value=name;await fetch(API_URL+'/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message})});document.getElementById('revMsg').value='';loadReviews()}
loadList();loadChat();loadReviews();setInterval(loadList,15000);setInterval(loadChat,3000);setInterval(loadReviews,8000);
