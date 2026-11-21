const API_URL = "";
const IMG_DEFAULT = "https://raw.githubusercontent.com/starlyn-chann/Mistic-star/main/tourl/1794774266726-WGupaVZkmPsx.jpg";
const LINK_COMUNIDAD = "https://chat.whatsapp.com/GAzF9ICsYar7O6Yhe4Y5R0?s=cl&p=a&mlu=4&ilr=4&iam=2";
const ICON_USER = "https://ui-avatars.com/api/?name=U&background=0e7490&color=fff&size=128";
const ICON_Q = "https://ui-avatars.com/api/?name=?&background=334155&color=fff&size=128";
for(let i=0;i<16;i++){let b=document.createElement('div');b.className='burbuja';let s=4+Math.random()*12;b.style.width=s+'px';b.style.height=s+'px';b.style.left=Math.random()*100+'%';b.style.animationDuration=(6+Math.random()*9)+'s';b.style.animationDelay=(Math.random()*8)+'s';document.querySelector('.bg').appendChild(b)}
let modoConexion = 'vip';
function seleccionarModo(tipo){
  modoConexion = tipo;
  document.getElementById('cardToken').classList.toggle('active', tipo==='token');
  document.getElementById('cardVip').classList.toggle('active', tipo==='vip');
  document.getElementById('cardNormal').classList.toggle('active', tipo==='normal');
  document.getElementById('tokenGenerarBox').style.display = tipo==='token' ? 'block' : 'none';
  document.getElementById('tokenBox').style.display = tipo==='vip' ? 'block' : 'none';
  let btn = document.getElementById('btnCode');
  if(tipo==='token'){ btn.textContent='🎟️ Primero genera tu token arriba'; btn.classList.add('vip-mode'); document.getElementById('estadoTexto').textContent='Modo Token: pon tu número y genera tu token gratis'; }
  else if(tipo==='vip'){ btn.textContent='✨ Generar código VIP'; btn.classList.add('vip-mode'); document.getElementById('estadoTexto').textContent='Modo VIP: pon tu número + tu token'; }
  else { btn.textContent='Generar código NORMAL'; btn.classList.remove('vip-mode'); document.getElementById('estadoTexto').textContent='Modo NORMAL: solo pon tu número'; }
  try{ localStorage.setItem('marine_modo', tipo) }catch{}
}
try{ let mGuardado = localStorage.getItem('marine_modo'); if(mGuardado==='token'||mGuardado==='normal'||mGuardado==='vip') seleccionarModo(mGuardado); }catch{}
async function comprarToken(){
  let numInput = document.getElementById('tokenBoxNumero').value.replace(/[^0-9]/g,'');
  if(!numInput){
    let local = document.getElementById('number').value.replace(/[^0-9]/g,'');
    if(local.length >= 7) numInput = paisSel.code + local;
  }
  if(!numInput || numInput.length < 10){ alert('Pon tu número completo con código de país. Ej: 51987654321'); return; }
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
    document.getElementById('tokenStatus').textContent = '✅ Token generado para +' + data.number + ' - Ahora toca Registrar Houshou VIP';
    document.getElementById('tokenStatus').style.color = '#22c55e';
  }catch(e){
    document.getElementById('tokenStatus').textContent = '❌ Error: ' + e.message;
    document.getElementById('tokenStatus').style.color = '#f87171';
  } finally { btn.disabled = false; btn.textContent = '🎟️ Generar mi Token Gratis'; }
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
const PAISES_RAW = "mx|Mexico|52|America del Norte|5512345678;pe|Peru|51|America del Sur|987654321;co|Colombia|57|America del Sur|3001234567;ar|Argentina|54|America del Sur|1123456789;cl|Chile|56|America del Sur|912345678;ve|Venezuela|58|America del Sur|4123456789;ec|Ecuador|593|America del Sur|987654321;bo|Bolivia|591|America del Sur|71234567;py|Paraguay|595|America del Sur|981234567;uy|Uruguay|598|America del Sur|99123456;br|Brasil|55|America del Sur|11987654321;us|Estados Unidos|1|America del Norte|2123456789;ca|Canada|1|America del Norte|4161234567;es|Espana|34|Europa|612345678;gt|Guatemala|502|Centroamerica|51234567;hn|Honduras|504|Centroamerica|91234567;ni|Nicaragua|505|Centroamerica|81234567;cr|Costa Rica|506|Centroamerica|81234567;pa|Panama|507|Centroamerica|61234567;cu|Cuba|53|Caribe|51234567;do|Rep. Dominicana|809|Caribe|8091234567;af|Afganistan|93|Asia|701234567;al|Albania|355|Europa|671234567;dz|Argelia|213|Africa|551234567;ad|Andorra|376|Europa|312345;ao|Angola|244|Africa|912345678;ai|Anguila|1264|Caribe|2642351234;ag|Antigua y Barbuda|1268|Caribe|2684641234;aw|Aruba|599|Caribe|2971234567;au|Australia|61|Oceania|412345678;at|Austria|43|Europa|664123456;az|Azerbaiyan|994|Asia|501234567;bs|Bahamas|1242|Caribe|2423651234;bh|Barein|973|Asia|33123456;bd|Banglades|880|Asia|1712345678;bb|Barbados|1246|Caribe|2462341234;by|Bielorrusia|375|Europa|291234567;be|Belgica|32|Europa|471234567;bz|Belice|501|Centroamerica|6123456;bj|Benin|229|Africa|90123456;bm|Bermudas|1441|Caribe|4411234567;bt|Butan|975|Asia|17123456;ba|Bosnia y Herzegovina|387|Europa|61123456;bw|Botsuana|267|Africa|71123456;bn|Brunei|673|Asia|8123456;bg|Bulgaria|359|Europa|881234567;bf|Burkina Faso|226|Africa|70123456;bi|Burundi|257|Africa|79123456;kh|Camboya|855|Asia|121234567;cm|Camerun|237|Africa|691234567;cv|Cabo Verde|238|Africa|9912345;ky|Islas Caiman|1345|Caribe|3451234567;cf|Rep. Centroafricana|236|Africa|70123456;td|Chad|235|Africa|63123456;cn|China|86|Asia|13123456789;cy|Chipre|357|Europa|96123456;km|Comoras|269|Africa|7612345;cg|Congo|242|Africa|061234567;cd|Congo (RDC)|243|Africa|821234567;kr|Corea del Sur|82|Asia|1012345678;kp|Corea del Norte|850|Asia|1912345678;ci|Costa de Marfil|225|Africa|0712345678;hr|Croacia|385|Europa|911234567;cz|Chequia|420|Europa|601234567;dk|Dinamarca|45|Europa|20123456;dj|Yibuti|253|Africa|77123456;dm|Dominica|1767|Caribe|7672351234;eg|Egipto|20|Africa|1001234567;sv|El Salvador|503|Centroamerica|70123456;ae|Emiratos Arabes|971|Asia|501234567;ee|Estonia|372|Europa|50123456;sz|Esuatini|268|Africa|76123456;et|Etiopia|251|Africa|911234567;fj|Fiyi|679|Oceania|7012345;ph|Filipinas|63|Asia|9123456789;fi|Finlandia|358|Europa|401234567;fr|Francia|33|Europa|612345678;ga|Gabon|241|Africa|06123456;gm|Gambia|220|Africa|7012345;ge|Georgia|995|Asia|551234567;gh|Ghana|233|Africa|201234567;gi|Gibraltar|350|Europa|57123456;gd|Granada|1473|Caribe|4731234567;gr|Grecia|30|Europa|6912345678;gl|Groenlandia|299|America del Norte|312345;gp|Guadalupe|590|Caribe|690123456;gu|Guam|1671|Oceania|6711234567;gn|Guinea|224|Africa|60123456;gw|Guinea-Bisau|245|Africa|661234567;gq|Guinea Ecuatorial|240|Africa|222123456;gy|Guyana|592|America del Sur|6012345;ht|Haiti|509|Caribe|34123456;hu|Hungria|36|Europa|201234567;in|India|91|Asia|9876543210;id|Indonesia|62|Asia|81234567890;ir|Iran|98|Asia|9123456789;iq|Irak|964|Asia|7912345678;ie|Irlanda|353|Europa|871234567;is|Islandia|354|Europa|6112345;il|Israel|972|Asia|501234567;it|Italia|39|Europa|3123456789;jm|Jamaica|1876|Caribe|8761234567;jp|Japon|81|Asia|9012345678;jo|Jordania|962|Asia|791234567;kz|Kazajistan|7|Asia|7012345678;ke|Kenia|254|Africa|712345678;kg|Kirguistan|996|Asia|701234567;ki|Kiribati|686|Oceania|70123456;xk|Kosovo|383|Europa|44123456;kw|Kuwait|965|Asia|99123456;la|Laos|856|Asia|20123456;lv|Letonia|371|Europa|29123456;lb|Libano|961|Asia|70123456;ls|Lesoto|266|Africa|50123456;lr|Liberia|231|Africa|771234567;ly|Libia|218|Africa|911234567;li|Liechtenstein|423|Europa|7812345;lt|Lituania|370|Europa|60123456;lu|Luxemburgo|352|Europa|621234567;mo|Macao|853|Asia|66123456;mk|Macedonia del Norte|389|Europa|70123456;mg|Madagascar|261|Africa|341234567;my|Malasia|60|Asia|1212345678;mw|Malaui|265|Africa|881234567;mv|Maldivas|960|Asia|7712345;ml|Mali|223|Africa|70123456;mt|Malta|356|Europa|99123456;ma|Marruecos|212|Africa|612345678;mh|Islas Marshall|692|Oceania|6251234;mq|Martinica|596|Caribe|696123456;mr|Mauritania|222|Africa|22123456;mu|Mauricio|230|Africa|25123456;fm|Micronesia|691|Oceania|9201234;md|Moldavia|373|Europa|60123456;mc|Monaco|377|Europa|61234567;mn|Mongolia|976|Asia|99123456;me|Montenegro|382|Europa|67123456;ms|Montserrat|1664|Caribe|6641234567;mz|Mozambique|258|Africa|841234567;mm|Myanmar|95|Asia|912345678;na|Namibia|264|Africa|811234567;nr|Nauru|674|Oceania|5551234;np|Nepal|977|Asia|9841234567;ne|Niger|227|Africa|90123456;ng|Nigeria|234|Africa|8031234567;nu|Niue|683|Oceania|1234;no|Noruega|47|Europa|41234567;nc|Nueva Caledonia|687|Oceania|751234;nz|Nueva Zelanda|64|Oceania|211234567;om|Oman|968|Asia|92123456;nl|Paises Bajos|31|Europa|612345678;pk|Pakistan|92|Asia|3001234567;pw|Palaos|680|Oceania|6201234;ps|Palestina|970|Asia|591234567;pg|Papua Nueva Guinea|675|Oceania|70123456;pf|Polinesia Francesa|689|Oceania|87123456;pl|Polonia|48|Europa|601234567;pt|Portugal|351|Europa|911234567;pr|Puerto Rico|1787|Caribe|7871234567;qa|Catar|974|Asia|33123456;gb|Reino Unido|44|Europa|7912345678;ro|Rumania|40|Europa|721234567;ru|Rusia|7|Europa|9123456789;rw|Ruanda|250|Africa|781234567;as|Samoa Americana|1684|Oceania|6841234567;vc|San Vicente y Granadinas|1784|Caribe|7841234567;kn|San Cristobal y Nieves|1869|Caribe|8691234567;lc|Santa Lucia|1758|Caribe|7581234567;sm|San Marino|378|Europa|66123456;st|Santo Tome y Principe|239|Africa|9912345;sa|Arabia Saudita|966|Asia|501234567;sn|Senegal|221|Africa|701234567;rs|Serbia|381|Europa|601234567;sc|Seychelles|248|Africa|2512345;sl|Sierra Leona|232|Africa|77123456;sg|Singapur|65|Asia|81234567;sk|Eslovaquia|421|Europa|901234567;si|Eslovenia|386|Europa|401234567;sb|Islas Salomon|677|Oceania|7012345;so|Somalia|252|Africa|611234567;za|Sudafrica|27|Africa|821234567;ss|Sudan del Sur|211|Africa|921234567;sd|Sudan|249|Africa|911234567;se|Suecia|46|Europa|701234567;ch|Suiza|41|Europa|781234567;sr|Surinam|597|America del Sur|8512345;sy|Siria|963|Asia|941234567;th|Tailandia|66|Asia|812345678;tw|Taiwan|886|Asia|912345678;tz|Tanzania|255|Africa|751234567;tj|Tayikistan|992|Asia|931234567;tl|Timor Oriental|670|Asia|75123456;tg|Togo|228|Africa|90123456;tk|Tokelau|690|Oceania|1234;to|Tonga|676|Oceania|7712345;tt|Trinidad y Tobago|1868|Caribe|8681234567;tn|Tunez|216|Africa|20123456;tm|Turkmenistan|993|Asia|65123456;tr|Turquia|90|Asia|5312345678;tv|Tuvalu|688|Oceania|901234;ua|Ucrania|380|Europa|671234567;ug|Uganda|256|Africa|701234567;uz|Uzbekistan|998|Asia|901234567;vu|Vanuatu|678|Oceania|7012345;va|Ciudad del Vaticano|379|Europa|612345678;vn|Vietnam|84|Asia|912345678;ye|Yemen|967|Asia|701234567;zm|Zambia|260|Africa|961234567;zw|Zimbabue|263|Africa|771234567";
const PAISES = PAISES_RAW.split(';').map(s=>{let [iso,name,code,region,ej]=s.split('|');return {iso,name,code,region,ej}});
const seen=new Set(); const PAISES_UNICOS=PAISES.filter(p=>{let k=p.iso+'-'+p.code; if(seen.has(k)) return false; seen.add(k); return true});
PAISES_UNICOS.sort((a,b)=>a.name.localeCompare(b.name));
let PAISES_FINAL=[PAISES_UNICOS.find(p=>p.iso==='mx'),PAISES_UNICOS.find(p=>p.iso==='pe'),...PAISES_UNICOS.filter(p=>p.iso!=='mx'&&p.iso!=='pe')];
let paisSel=PAISES_FINAL[0]; let filtroActual='';
function flagUrl(iso){return `https://flagcdn.com/w80/${iso}.png`}
function renderPaises(){
  let lista=PAISES_FINAL.filter(p=>{if(!filtroActual) return true; let f=filtroActual.toLowerCase(); return p.name.toLowerCase().includes(f)||p.code.includes(f)||('+'+p.code).includes(f)||p.region.toLowerCase().includes(f)||p.iso.includes(f)});
  document.getElementById('countPaises').textContent=lista.length+' paises - Escribe para filtrar';
  document.getElementById('sinResultados').style.display=lista.length?'none':'block';
  let mostrar=filtroActual?lista.slice(0,80):lista.slice(0,60);
  document.getElementById('paisesVertical').innerHTML=mostrar.map(p=>`<div class="pais-row ${p.iso===paisSel.iso&&p.code===paisSel.code?'active':''}" onclick="selPais('${p.iso}','${p.code}',this)"><img class="flag-icon" src="${flagUrl(p.iso)}" alt="${p.name}" loading="lazy" onerror="this.src='https://flagcdn.com/w80/un.png'"><div class="info"><b>${p.name}</b><small>${p.region} - Codigo +${p.code}</small></div><span class="code">+${p.code}</span><span class="check">X</span></div>`).join('')+(lista.length>mostrar.length?`<div style="text-align:center;color:#94a3b8;font-size:12px;padding:8px">+ ${lista.length-mostrar.length} paises mas - usa el buscador</div>`:'');
}
function selPais(iso,code,el){
  paisSel=PAISES_FINAL.find(p=>p.iso===iso&&p.code===code)||PAISES_FINAL[0];
  document.querySelectorAll('.pais-row').forEach(x=>x.classList.remove('active')); if(el) el.classList.add('active');
  document.getElementById('prefijoLabel').innerHTML=`<img class="flag-icon-sm" src="${flagUrl(paisSel.iso)}"> +${paisSel.code}`;
  document.getElementById('number').placeholder=paisSel.ej;
  document.getElementById('ejemploNum').textContent=`Ej: ${paisSel.name} ${paisSel.ej} - Sin espacios, sin +`;
  document.getElementById('selActual').innerHTML=`<img class="flag-icon-sm" src="${flagUrl(paisSel.iso)}"><div><b>${paisSel.name}</b><small>${paisSel.region} - Seleccionado</small></div><span>+${paisSel.code}</span>`;
  document.getElementById('estadoTexto').textContent=`Listo para ${paisSel.name} (+${paisSel.code})`;
  try{localStorage.setItem('marine_pais_iso',paisSel.iso);localStorage.setItem('marine_pais_code',paisSel.code)}catch{}
}
function filtrarPaises(v){filtroActual=v.trim();renderPaises()}
function limpiarBusqueda(){document.getElementById('buscarPais').value='';filtroActual='';renderPaises()}
try{let isoG=localStorage.getItem('marine_pais_iso'),codeG=localStorage.getItem('marine_pais_code');if(isoG){let p=PAISES_FINAL.find(x=>x.iso===isoG&&x.code===codeG);if(p) paisSel=p}}catch{}
renderPaises();selPais(paisSel.iso,paisSel.code,null);
function showTab(tab,btn){
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  document.getElementById('tab-vincular').style.display = tab==='vincular' ? 'block':'none';
  document.getElementById('tab-bots-only').style.display = tab==='bots' ? 'block':'none';
  document.getElementById('tab-devs-only').style.display = tab==='devs' ? 'block':'none';
  if(tab==='bots') loadList();
  if(tab==='devs') loadDevs();
}
function copiarCodigo(){let c=document.getElementById('pairCode').textContent;if(!c||c.includes('-')) return alert('Aun no hay codigo');navigator.clipboard.writeText(c.replace(/-/g,'')).then(()=>alert('Codigo copiado: '+c))}
let statusInterval=null,countdownInterval=null,secondsLeft=60,pairingEnCurso=false;
let myName=localStorage.getItem('marine_name')||'';if(myName){document.getElementById('chatName').value=myName;document.getElementById('revName').value=myName}
function startCountdown(){if(countdownInterval)clearInterval(countdownInterval);secondsLeft=60;document.getElementById('expiredMsg').style.display='none';document.getElementById('countdown').textContent=secondsLeft;document.getElementById('countFill').style.width='100%';countdownInterval=setInterval(()=>{secondsLeft--;if(secondsLeft<0)secondsLeft=0;document.getElementById('countdown').textContent=secondsLeft;document.getElementById('countFill').style.width=(secondsLeft/60*100)+'%';if(secondsLeft<=0){clearInterval(countdownInterval);document.getElementById('expiredMsg').style.display='block';document.getElementById('status').textContent='Codigo vencido, genera uno nuevo';document.getElementById('status').className='error';pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent=modoConexion==='vip'?'✨ Generar código VIP':modoConexion==='token'?'🎟️ Primero genera tu token arriba':'Generar código NORMAL'}},1000)}
async function getPairingCode(){
  if(pairingEnCurso) return;
  if(modoConexion==='token'){ alert('Primero genera tu token arriba con el botón 🎟️ Generar mi Token Gratis, luego toca Registrar Houshou VIP'); return; }
  const local=document.getElementById('number').value.replace(/[^0-9]/g,'');
  if(local.length<7){alert('Pon tu numero sin el codigo. Ej '+paisSel.name+': '+paisSel.ej);return}
  const number=paisSel.code+local;
  let token = '';
  if(modoConexion==='vip'){
    token = document.getElementById('tokenVip').value.trim().toUpperCase();
    if(!token){ alert('Eres VIP, pon tu token. Toca arriba Comprar Token, es gratis por el momento. Ej: HM-XXXX-XXXX'); document.getElementById('tokenVip').focus(); return; }
  }
  let endpoint = modoConexion==='vip' ? '/api/pairing-vip' : '/api/pairing-normal';
  let body = modoConexion==='vip' ? { number, token } : { number };
  document.getElementById('estadoTexto').textContent=`Generando codigo ${modoConexion==='vip'?'VIP':'NORMAL'} para +${number}...`;
  pairingEnCurso=true;document.getElementById('btnCode').disabled=true;document.getElementById('btnCode').textContent='Generando... espera 10s';document.getElementById('status').textContent='Generando codigo de 8 digitos...';document.getElementById('status').className='';
  try{
    const res=await fetch(API_URL+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();if(data.error) throw new Error(data.error);
    if(data.already){document.getElementById('status').textContent='Ya estaba conectado';document.getElementById('status').className='success';document.getElementById('estadoTexto').textContent='Conectado';pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent=modoConexion==='vip'?'✨ Generar código VIP':'Generar código NORMAL';loadList();return}
    document.getElementById('codeEmpty').style.display='none';document.getElementById('pairCode').style.display='block';document.getElementById('pairCode').textContent=data.code;document.getElementById('estadoTexto').textContent='Codigo generado, ponlo en WhatsApp';document.getElementById('status').textContent='Pon ese codigo en WhatsApp, se conecta solo';startCountdown();
    if(statusInterval)clearInterval(statusInterval);
    statusInterval=setInterval(async()=>{const r=await fetch(API_URL+'/api/status?number='+number);const s=await r.json();if(s.connected){clearInterval(statusInterval);if(countdownInterval)clearInterval(countdownInterval);document.getElementById('status').textContent=modoConexion==='vip'?'CONECTADO COMO HOUSHOU VIP 👑':'CONECTADO COMO HOUSHOU BOT ⚪';document.getElementById('status').className='success';document.getElementById('estadoTexto').textContent=modoConexion==='vip'?'CONECTADO VIP':'CONECTADO NORMAL';document.getElementById('codeEmpty').style.display='flex';document.getElementById('codeEmpty').textContent='Conectado';document.getElementById('pairCode').style.display='none';pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent=modoConexion==='vip'?'✨ Generar código VIP':'Generar código NORMAL';loadList()}},3000);
    setTimeout(()=>{if(pairingEnCurso){pairingEnCurso=false;document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent=modoConexion==='vip'?'✨ Generar código VIP':'Generar código NORMAL'}},70000);
  }catch(e){pairingEnCurso=false;document.getElementById('status').textContent='Error: '+e.message;document.getElementById('status').className='error';document.getElementById('btnCode').disabled=false;document.getElementById('btnCode').textContent=modoConexion==='vip'?'✨ Generar código VIP':'Generar código NORMAL'}
}
async function loadList(){
  try{
    const r=await fetch(API_URL+'/api/list');const data=await r.json();const total=data.list?.length||0;document.getElementById('count').textContent=total;document.getElementById('barFill').style.width=Math.min(total/120*100,100)+'%';
    if(total>=120){document.getElementById('alertaLimite').style.display='block';document.getElementById('btnCode').disabled=true;document.getElementById('btnCode').textContent='Limite alcanzado'}
    const html=!data.list?.length?'<div style="color:#888;font-size:13px">Aun no hay Sub-Bots. Se el primero</div>':data.list.map(u=>{
      let foto = u.pic || ICON_USER;
      return `<div class="item"><img src="${foto}" onerror="this.onerror=null;this.src='${ICON_USER}'"><div class="info-bot"><b>${u.name||'Sub-Bot'}</b><small>wa.me/${u.number}</small><span>En linea</span></div><span class="badge ${u.vip?'badge-vip':'badge-normal'}">${u.vip?'VIP':'NORMAL'}</span></div>`;
    }).join('');
    let b=document.getElementById('list2');if(b)b.innerHTML=html;
  }catch(e){}
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
async function loadChat(){try{const r=await fetch(API_URL+'/api/chat');const d=await r.json();const box=document.getElementById('chatBody');document.getElementById('chatCount').textContent=d.chat?.length||0;if(!d.chat?.length){box.innerHTML='<div class="empty-chat">Se el primero en escribir.</div>';return}let my=document.getElementById('chatName').value.trim();box.innerHTML=d.chat.slice(-60).map(x=>{let isMe=my&&x.name===my;return `<div class="msg ${isMe?'msg-out':'msg-in'}"><b>${esc(x.name)} ${isMe?'(Tu)':''}</b>${esc(x.message)}<span class="time">${esc(String(x.date||'').slice(11,16))}</span></div>`}).join('');box.scrollTop=box.scrollHeight}catch{}}
async function sendChat(){const name=document.getElementById('chatName').value.trim()||'Anonimo';const message=document.getElementById('chatMsg').value.trim();if(!message) return alert('Escribe algo');localStorage.setItem('marine_name',name);document.getElementById('revName').value=name;await fetch(API_URL+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message})});document.getElementById('chatMsg').value='';loadChat()}
async function loadReviews(){try{const r=await fetch(API_URL+'/api/reviews');const d=await r.json();const box=document.getElementById('reviews');if(!d.reviews?.length){box.innerHTML='<div style="color:#888;font-size:13px">Sin resenas aun, se el primero.</div>';return}box.innerHTML=d.reviews.slice(0,20).map(x=>`<div class="review-item"><b>${esc(x.name)}</b> <small>${esc(x.date)}</small><p>${esc(x.message)}</p>${x.reply?`<div class="review-reply"><b>Owner responde:</b><br>${esc(x.reply)}</div>`:`<small style="color:#ff6ec4">Esperando respuesta del Owner...</small>`}</div>`).join('')}catch{}}
async function sendReview(){const name=document.getElementById('revName').value.trim()||'Anonimo';const message=document.getElementById('revMsg').value.trim();if(!message) return alert('Escribe tu resena');localStorage.setItem('marine_name',name);document.getElementById('chatName').value=name;await fetch(API_URL+'/api/reviews',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,message})});document.getElementById('revMsg').value='';loadReviews()}
loadList();loadChat();loadReviews();setInterval(loadList,15000);setInterval(loadChat,3000);setInterval(loadReviews,8000);