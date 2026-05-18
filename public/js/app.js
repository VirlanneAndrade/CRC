/* =============================================
   CRC v1.0 — Central de Relacionamento com o Contribuinte
   ============================================= */

/* ── ROBOT SVG ── */
function robotSVG(s=52,expr='happy'){
  const eyes = expr==='think'
    ? '<ellipse cx="17" cy="22" rx="4.3" ry="5.3" fill="#FFFFFF"/><ellipse cx="31" cy="22" rx="4.3" ry="5.3" fill="#FFFFFF"/><circle cx="17" cy="23" r="2.2" fill="#2F3A4A"/><circle cx="31" cy="23" r="2.2" fill="#2F3A4A"/><circle cx="16.2" cy="22" r="1.1" fill="#fff"/><circle cx="30.2" cy="22" r="1.1" fill="#fff"/>'
    : '<ellipse cx="17" cy="22" rx="4.8" ry="5.8" fill="#FFFFFF"/><ellipse cx="31" cy="22" rx="4.8" ry="5.8" fill="#FFFFFF"/><circle cx="17" cy="23" r="2.5" fill="#2F3A4A"/><circle cx="31" cy="23" r="2.5" fill="#2F3A4A"/><circle cx="16.1" cy="21.8" r="1.25" fill="#fff"/><circle cx="30.1" cy="21.8" r="1.25" fill="#fff"/><circle cx="18.1" cy="24.3" r=".55" fill="#A9D6FF"/><circle cx="32.1" cy="24.3" r=".55" fill="#A9D6FF"/>';
  const mouth = expr==='happy'
    ? '<path d="M18 30 Q24 35 30 30" stroke="#2F3A4A" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    : expr==='think'
    ? '<ellipse cx="24" cy="31" rx="2.2" ry="1.9" fill="#2F3A4A" opacity=".8"/>'
    : expr==='sad'
    ? '<path d="M18 33 Q24 28 30 33" stroke="#2F3A4A" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    : '<path d="M19 31 L29 31" stroke="#2F3A4A" stroke-width="2" stroke-linecap="round"/>';
  const cheeks = expr==='happy' ? '<circle cx="11.6" cy="27" r="2.8" fill="#F7C6D9" opacity=".72"/><circle cx="36.4" cy="27" r="2.8" fill="#F7C6D9" opacity=".72"/>' : '';
  return `<svg width="${s}" height="${s}" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="3.5" r="2.8" fill="#A9D6FF"><animate attributeName="opacity" values="1;.4;1" dur="2s" repeatCount="indefinite"/></circle>
    <line x1="24" y1="6" x2="24" y2="10" stroke="#8FC5F8" stroke-width="2" stroke-linecap="round"/>
    <rect x="5" y="10" width="38" height="28" rx="10" fill="#BFEFD6" stroke="#8FC5F8" stroke-width="1.2"/>
    <rect x="6.5" y="11.8" width="35" height="11.8" rx="8" fill="#EAF4FF" opacity=".9"/>
    <rect x="9" y="15" width="30" height="15" rx="6" fill="#F8FBFF" opacity=".88"/>
    ${eyes}
    ${cheeks}
    ${mouth}
    <path d="M14 38h20c0 2.8-2.2 5-5 5H19c-2.8 0-5-2.2-5-5z" fill="#A9D6FF"/>
    <rect x="2.2" y="20" width="5" height="10" rx="2.5" fill="#BFEFD6" stroke="#8FC5F8" stroke-width=".8"/>
    <rect x="40.8" y="20" width="5" height="10" rx="2.5" fill="#BFEFD6" stroke="#8FC5F8" stroke-width=".8"/>
    <path d="M39 13l1.1 1.9 2.1.3-1.6 1.4.4 2.1-2-1.1-1.9 1.1.4-2.1-1.6-1.4 2.1-.3L39 13z" fill="#F7C6D9"/>
    <path d="M9 12.4l.8 1.4 1.6.2-1.2 1.1.3 1.6-1.5-.8-1.5.8.3-1.6-1.2-1.1 1.6-.2.8-1.4z" fill="#A9D6FF"/>
  </svg>`;
}

/* ── MÓDULOS CONFIGURÁVEIS ── */
const DEFAULT_MODULES={
  dashboard:true,situacao_fiscal:true,certidoes:true,alvara:true,cartao_cga:true,
  segunda_via:true,extrato_divida:true,tributos:true,acordo:true,itiv:true,nfse:true,
  ficha_cadastral:true,autenticacao:true,legislacao:true,procuracao:true,protocolo:true,
  dec:true,caixa_postal:true,notificacoes:true,perfil:true,faq:true,config_dev:true
};
function getModules(){try{return JSON.parse(localStorage.getItem('crc_modules'))||{...DEFAULT_MODULES}}catch(e){return{...DEFAULT_MODULES}}}
function saveModules(m){localStorage.setItem('crc_modules',JSON.stringify(m));applySidebarModules()}
function applySidebarModules(){
  const m=getModules();
  document.querySelectorAll('.nav-item[data-page]').forEach(el=>{
    const pg=el.dataset.page;
    if(pg==='dashboard'||pg==='perfil'||pg==='config_dev')return;
    el.style.display=m[pg]===false?'none':'';
  });
}

/* ── GOOGLE CALENDAR / ICS HELPER ── */
function addToGoogleCalendar(title,dateStr,details){
  const d=new Date(dateStr);const end=new Date(d);end.setHours(end.getHours()+1);
  const fmt=dt=>dt.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(d)}/${fmt(end)}&details=${encodeURIComponent(details)}`;
  window.open(url,'_blank');
}
function downloadICS(title,dateStr,details){
  const d=new Date(dateStr);const end=new Date(d);end.setHours(end.getHours()+1);
  const fmt=dt=>dt.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(d)}\nDTEND:${fmt(end)}\nSUMMARY:${title}\nDESCRIPTION:${details}\nEND:VEVENT\nEND:VCALENDAR`;
  const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='evento.ics';a.click();
}

/* ── AUTH (admin vs contribuinte) ── */
let currentUserType='contribuinte'; // 'contribuinte' | 'admin'
let currentAdminLogin=''; // login do admin logado
const notifValidationState={email:{codigoId:null,validado:false},whatsapp:{codigoId:null,validado:false},sms:{codigoId:null,validado:false}};
const notifPageValidationState={email:{codigoId:null,validado:false},whatsapp:{codigoId:null,validado:false},sms:{codigoId:null,validado:false}};
let lgpdPendingResolve=null;
let systemDialogResolve=null;
let systemDialogMode='alert';
const MASTER_LOGIN='admin'; // login do master — único que pode excluir

function inferDialogTone(message){
  const m=String(message||'').toLowerCase();
  if(m.includes('sucesso')||m.includes('copiado')||m.includes('salvo')||m.includes('criada')||m.includes('alterada')||m.includes('atualizado')) return 'success';
  if(m.includes('inválid')||m.includes('inval')||m.includes('erro')||m.includes('falha')||m.includes('negado')||m.includes('não')||m.includes('nao')) return 'error';
  return 'info';
}

function closeSystemDialog(result=true){
  const modal=document.getElementById('modal-system');
  if(modal) modal.style.display='none';
  if(systemDialogResolve) systemDialogResolve(systemDialogMode==='confirm'?!!result:undefined);
  systemDialogResolve=null;
  systemDialogMode='alert';
}
function cancelSystemDialog(){
  closeSystemDialog(false);
}

function showSystemDialog(message,tone,mode='alert'){
  const modal=document.getElementById('modal-system');
  if(!modal){window.console.warn(message);return Promise.resolve();}
  const t=tone||inferDialogTone(message);
  const title=t==='success'?'Tudo certo':(t==='error'?'Atenção':'Informação');
  const expr=t==='success'?'happy':(t==='error'?'sad':'think');
  const klass=t==='success'?'system-dialog--success':(t==='error'?'system-dialog--error':'system-dialog--info');
  const dialog=modal.querySelector('.system-dialog');
  dialog.className=`system-dialog ${klass}`;
  dialog.querySelector('.system-dialog-robot').innerHTML=robotSVG(44,expr);
  dialog.querySelector('.system-dialog-title').textContent=title;
  dialog.querySelector('.system-dialog-message').textContent=String(message||'');
  const btnCancel=document.getElementById('system-dialog-cancel');
  const btnOk=document.getElementById('system-dialog-ok');
  if(btnCancel) btnCancel.style.display=mode==='confirm'?'':'none';
  if(btnOk) btnOk.textContent=mode==='confirm'?'Confirmar':'OK';
  systemDialogMode=mode;
  modal.style.display='flex';
  return new Promise((resolve)=>{systemDialogResolve=resolve;});
}
function showSystemConfirm(message,tone){
  return showSystemDialog(message,tone||'info','confirm');
}

if(typeof window!=='undefined'){
  window.alert=(msg)=>{showSystemDialog(msg);};
}
function getAdminUsers(){
  try{
    let users=JSON.parse(localStorage.getItem('crc_admin_users'));
    if(!users||!users.length)return defaultAdminUsers();
    const master=users.find(u=>u.login===MASTER_LOGIN);
    if(master&&!master.master){master.master=true;master.perfil='master';master.nome=master.nome||'Administrador Master';saveAdminUsers(users)}
    if(!master){users.unshift({id:1,nome:'Administrador Master',email:'admin@crc.gov.br',login:'admin',senha:'admin123',perfil:'master',ativo:true,master:true});saveAdminUsers(users)}
    return users;
  }catch(e){return defaultAdminUsers()}
}
function defaultAdminUsers(){return[{id:1,nome:'Administrador Master',email:'admin@crc.gov.br',login:'admin',senha:'admin123',perfil:'master',ativo:true,master:true},{id:2,nome:'Suporte Técnico',email:'suporte@eqfis.com.br',login:'suporte',senha:'sup2026',perfil:'suporte',ativo:true},{id:3,nome:'Desenvolvedor',email:'dev@eqfis.com.br',login:'dev',senha:'dev2026',perfil:'dev',ativo:true}]}
function saveAdminUsers(u){localStorage.setItem('crc_admin_users',JSON.stringify(u))}
function isMasterUser(u){return u.login===MASTER_LOGIN||u.master===true}
function isLoggedAsMaster(){return currentAdminLogin===MASTER_LOGIN}
function doAdminLogin(){
  const login=document.getElementById('admin-login-user').value.trim();
  const senha=document.getElementById('admin-login-pass').value;
  const users=getAdminUsers();
  const u=users.find(x=>x.login===login&&x.senha===senha&&x.ativo);
  if(!u){alert('Usuário ou senha inválidos.');return}
  currentUserType='admin';
  currentAdminLogin=u.login;
  localStorage.setItem('crc_admin_name',u.nome);
  localStorage.setItem('crc_admin_perfil',isMasterUser(u)?'master':u.perfil);
  localStorage.setItem('crc_admin_login',u.login);
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  applySidebarVisibility();
  navigate('config_dev');
}
function applySidebarVisibility(){
  const devSection=document.getElementById('sidebar-dev-section');
  if(devSection)devSection.style.display=currentUserType==='admin'?'':'none';
  const uname=document.getElementById('sidebar-username');
  const ulevel=document.querySelector('.user-level');
  const topName=document.querySelector('.topbar-username');
  if(currentUserType==='admin'){
    const adminName=localStorage.getItem('crc_admin_name')||'Admin';
    const adminPerfil=(localStorage.getItem('crc_admin_perfil')||'admin').toUpperCase();
    if(uname)uname.textContent=adminName;
    if(ulevel)ulevel.textContent=adminPerfil;
    if(topName)topName.textContent=adminName;
    if(!currentAdminLogin)currentAdminLogin=localStorage.getItem('crc_admin_login')||'';
    const adminPhoto=localStorage.getItem('arrecada_photo');
    const adminInitials=adminName.split(' ').map(n=>n[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'AD';
    const sAvatar=document.getElementById('sidebar-avatar');if(sAvatar)sAvatar.innerHTML=adminPhoto?`<img src="${adminPhoto}">`:adminInitials;
    const tAvatar=document.getElementById('topbar-avatar');if(tAvatar)tAvatar.innerHTML=adminPhoto?`<img src="${adminPhoto}">`:adminInitials;
  }else{
    const c=getContribuinteLogado();
    const nome=c?c.nome.split(' ').slice(0,2).join(' '):'Contribuinte';
    if(uname)uname.textContent=nome;
    if(ulevel)ulevel.textContent='Gov.BR '+(c?c.govbr:'');
    if(topName)topName.textContent=nome;
    const initials=c?c.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase():'??';
    const sAvatar=document.getElementById('sidebar-avatar');if(sAvatar)sAvatar.textContent=initials;
    const tAvatar=document.getElementById('topbar-avatar');if(tAvatar)tAvatar.textContent=initials;
  }
  const switchBtn=document.getElementById('contrib-switch-btn');
  if(switchBtn)switchBtn.style.display=currentUserType==='contribuinte'?'':'none';
  const picker=document.getElementById('contrib-picker');
  if(picker&&currentUserType!=='contribuinte')picker.style.display='none';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',()=>{
  loadTheme();loadSidebarState();loadProfile();createParticles();renderRobots();applySidebarModules();applySidebarVisibility();updateProcuradorBadge();applySidebarProcurador();
  document.addEventListener('click',e=>{
    const sb=document.getElementById('sidebar');
    if(sb.classList.contains('mobile-open')&&!sb.contains(e.target)&&!e.target.closest('.mobile-menu-btn')){
      sb.classList.remove('mobile-open');
    }
    const cpicker=document.getElementById('contrib-picker');
    if(cpicker&&cpicker.style.display!=='none'&&!e.target.closest('.contrib-picker')&&!e.target.closest('#contrib-switch-btn')){
      cpicker.style.display='none';
    }
  });
});

function createParticles(){
  const c=document.getElementById('particles');if(!c)return;
  for(let i=0;i<55;i++){const p=document.createElement('div');p.className='particle';p.style.left=Math.random()*100+'%';p.style.top=Math.random()*100+'%';p.style.animationDelay=Math.random()*5+'s';p.style.animationDuration=(3+Math.random()*4)+'s';if(Math.random()>.7){p.style.width='4px';p.style.height='4px';p.style.boxShadow='0 0 8px 3px rgba(0,212,160,.5)'}c.appendChild(p);}
}
function renderRobots(){
  const t={'robot-debitos':['56','happy'],'robot-notif':['56','think'],'robot-main':['52','happy'],'robot-menu-icon':['24','happy'],'tour-robot':['44','happy'],'sidebar-logo-robot':['30','happy'],'login-logo-robot':['48','happy'],'login-logo-robot-admin':['48','think']};
  Object.entries(t).forEach(([id,[s,e]])=>{const el=document.getElementById(id);if(el)el.innerHTML=robotSVG(+s,e);});
}

/* ── THEME ── */
function loadTheme(){document.documentElement.setAttribute('data-theme',localStorage.getItem('arrecada_theme')||'light')}
function toggleTheme(){
  const n=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',n);
  localStorage.setItem('arrecada_theme',n);
}

/* ── SIDEBAR ── */
function loadSidebarState(){if(localStorage.getItem('arrecada_sidebar')==='collapsed')document.getElementById('sidebar')?.classList.add('collapsed')}
function toggleSidebar(){const s=document.getElementById('sidebar');s.classList.toggle('collapsed');localStorage.setItem('arrecada_sidebar',s.classList.contains('collapsed')?'collapsed':'expanded')}
function toggleMobileSidebar(){
  const sb=document.getElementById('sidebar');const ov=document.getElementById('sidebar-overlay');
  sb.classList.toggle('mobile-open');
  if(ov)ov.classList.toggle('active',sb.classList.contains('mobile-open'));
}

/* ── LOGIN SCREENS SWITCH ── */
function switchToAdminLogin(){
  document.getElementById('login-contribuinte').classList.add('login-hidden');
  document.getElementById('login-admin').classList.remove('login-hidden');
}
function switchToContribLogin(){
  document.getElementById('login-admin').classList.add('login-hidden');
  document.getElementById('login-contribuinte').classList.remove('login-hidden');
}

/* ── CONTRIBUINTES (simulação) ── */
const DEFAULT_CONTRIBUINTES=[
  {id:1,nome:'Maria Fernanda de Oliveira Santos',cpf:'034.567.890-12',email:'maria.fernanda@email.com',telefone:'(71) 98845-1234',endereco:'Rua das Palmeiras, 234 — Centro',bairro:'Centro',cidade:'Lauro de Freitas',uf:'BA',cep:'42700-000',govbr:'Ouro'},
  {id:2,nome:'João Carlos Pereira da Silva',cpf:'012.345.678-90',email:'joao.carlos@email.com',telefone:'(71) 99912-5678',endereco:'Av. Oceânica, 1200 — Apt 301',bairro:'Vilas do Atlântico',cidade:'Lauro de Freitas',uf:'BA',cep:'42700-100',govbr:'Prata'},
  {id:3,nome:'Ana Paula Rodrigues Lima',cpf:'078.901.234-56',email:'ana.paula@email.com',telefone:'(71) 98732-9012',endereco:'Rua dos Coqueiros, 56',bairro:'Portão',cidade:'Lauro de Freitas',uf:'BA',cep:'42700-200',govbr:'Ouro'},
  {id:4,nome:'Roberto Souza Mendes',cpf:'098.765.432-10',email:'roberto.mendes@email.com',telefone:'(71) 99654-3210',endereco:'Travessa do Comércio, 89 — Sala 2',bairro:'Centro',cidade:'Lauro de Freitas',uf:'BA',cep:'42700-050',govbr:'Bronze'},
];
function getContribuintes(){try{return JSON.parse(localStorage.getItem('crc_contribuintes'))||DEFAULT_CONTRIBUINTES}catch(e){return DEFAULT_CONTRIBUINTES}}
function saveContribuintes(c){localStorage.setItem('crc_contribuintes',JSON.stringify(c))}
let contribuinteLogado=null;
function getContribuinteLogado(){
  if(contribuinteLogado)return contribuinteLogado;
  try{return JSON.parse(localStorage.getItem('crc_contrib_logado'))||getContribuintes()[0]}catch(e){return getContribuintes()[0]}
}
function setContribuinteLogado(c){
  contribuinteLogado=c;
  localStorage.setItem('crc_contrib_logado',JSON.stringify(c));
}
function toggleContribPicker(){
  if(currentUserType!=='contribuinte')return;
  const el=document.getElementById('contrib-picker');
  if(!el)return;
  const isOpen=el.style.display!=='none';
  el.style.display=isOpen?'none':'block';
  if(!isOpen)renderContribPicker();
}
function renderContribPicker(){
  const el=document.getElementById('contrib-picker-list');if(!el)return;
  const contribs=getContribuintes();
  const logado=getContribuinteLogado();
  el.innerHTML=contribs.map(c=>{
    const active=logado&&logado.id===c.id;
    const initials=c.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
    return `<div class="contrib-picker-item${active?' active':''}" onclick="switchContribuinte(${c.id})">
      <div class="contrib-picker-avatar">${initials}</div>
      <div class="contrib-picker-info">
        <div class="contrib-picker-name">${c.nome.split(' ').slice(0,3).join(' ')}</div>
        <div class="contrib-picker-cpf">${c.cpf} <span class="contrib-govbr-badge ${c.govbr.toLowerCase()}">${c.govbr}</span></div>
      </div>
      ${active?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':''}
    </div>`;
  }).join('');
}
function switchContribuinte(id){
  const c=getContribuintes().find(x=>x.id===id);
  if(!c)return;
  setContribuinteLogado(c);
  applyContribuinteUI();
  renderContribPicker();
  document.getElementById('contrib-picker').style.display='none';
  navigate(currentPage||'dashboard');
}
function applyContribuinteUI(){
  const c=getContribuinteLogado();if(!c)return;
  const initials=c.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const uname=document.getElementById('sidebar-username');if(uname)uname.textContent=c.nome.split(' ').slice(0,2).join(' ');
  const ulevel=document.querySelector('.user-level');if(ulevel)ulevel.textContent='Gov.BR '+c.govbr;
  const topName=document.querySelector('.topbar-username');if(topName)topName.textContent=c.nome.split(' ').slice(0,2).join(' ');
  const sAvatar=document.getElementById('sidebar-avatar');if(sAvatar)sAvatar.textContent=initials;
  const tAvatar=document.getElementById('topbar-avatar');if(tAvatar)tAvatar.textContent=initials;
}
function showRecuperarSenha(){
  document.getElementById('login-recuperar').style.display='block';
}
function enviarRecuperacao(){
  const cpf=document.getElementById('recuperar-cpf');
  if(!cpf||!cpf.value.trim()){alert('Informe o CPF.');return}
  const div=document.getElementById('login-recuperar');
  div.innerHTML='<div style="text-align:center;padding:16px"><div style="width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;margin:0 auto 10px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><h3 style="font-size:.95rem;margin-bottom:4px">Instruções enviadas!</h3><p style="font-size:.78rem;color:var(--text-muted)">Verifique seu e-mail cadastrado para o CPF '+cpf.value+'.</p><a href="#" onclick="event.preventDefault();document.getElementById(\'login-recuperar\').style.display=\'none\'" style="display:block;margin-top:10px;font-size:.78rem">Voltar ao login</a></div>';
}
async function doLogin(){
  const c=getContribuinteLogado();
  if(!c)setContribuinteLogado(getContribuintes()[0]);
  currentUserType='contribuinte';
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  applySidebarVisibility();
  applyContribuinteUI();
  renderContribPicker();
  const aceitouLgpd=await ensureLgpdConsent();
  if(!aceitouLgpd){
    doLogout();
    return;
  }
  navigate('dashboard');
  setTimeout(()=>{
    if(!localStorage.getItem('arrecada_notif_seen')){
      showModal('modal-notif');
      hydrateNotificacoesModal();
    }
  },800);
}
function doLogout(){
  if(getProcuradorAtivo())setProcuradorAtivo(null);
  currentUserType='contribuinte';
  currentAdminLogin='';
  localStorage.removeItem('crc_admin_login');
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  switchToContribLogin();
  applySidebarVisibility();
  applySidebarProcurador();
}

/* ── MODALS ── */
function showModal(id){document.querySelectorAll('.modal-overlay').forEach(m=>m.style.display='none');const m=document.getElementById(id);if(m)m.style.display='flex'}
function closeModal(id){const m=document.getElementById(id);if(m)m.style.display='none'}

async function ensureLgpdConsent(){
  const key='crc_lgpd_aceite_v1';
  const userId='demo-user';
  let status;
  try{
    const resp=await fetch('/api/v1/lgpd/status',{headers:{'x-user-id':userId}});
    status=await resp.json();
    if(resp.ok&&status.acceptedCurrent===true){
      localStorage.setItem(key,JSON.stringify({versao:status.currentVersion,hash:status.currentHash}));
      return true;
    }
  }catch(_err){}

  const modal=document.getElementById('modal-boleto');
  if(!modal) return false;
  let termo={versao:status?.currentVersion||'v1',hash:status?.currentHash||'',html:'<p>Termo indisponivel no momento.</p>'};
  try{
    const termoResp=await fetch('/api/v1/lgpd/termo-vigente');
    const termoBody=await termoResp.json();
    if(termoResp.ok) termo=termoBody;
  }catch(_err){}

  return new Promise((resolve)=>{
    lgpdPendingResolve=resolve;
    modal.querySelector('.modal').innerHTML=`
      <div class="modal-header"><h2>Termo de Consentimento e Privacidade</h2></div>
      <div class="modal-body">
        <div style="font-size:.84rem;line-height:1.55;color:var(--text-secondary);margin-bottom:12px">${termo.html}</div>
        <p style="font-size:.76rem;color:var(--text-muted);margin-bottom:10px">Versao: <strong>${termo.versao}</strong> · Hash: <code>${termo.hash}</code></p>
        <label style="display:flex;gap:8px;align-items:flex-start;font-size:.82rem">
          <input type="checkbox" id="lgpd-aceite-obrigatorio" style="margin-top:3px">
          <span>Declaro que li e estou ciente do tratamento dos meus dados pessoais.</span>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="rejeitarLgpd()">Nao concordo</button>
        <button class="btn btn-primary btn-sm" onclick="aceitarLgpd('${termo.versao}','${termo.hash}')">Aceitar e continuar</button>
      </div>`;
    showModal('modal-boleto');
  });
}

async function aceitarLgpd(versao,hash){
  const check=document.getElementById('lgpd-aceite-obrigatorio');
  if(!check||!check.checked){
    alert('Marque o aceite para continuar.');
    return;
  }
  try{
    const r=await fetch('/api/v1/lgpd/aceite',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-user-id':'demo-user'},
      body:JSON.stringify({papel:'TITULAR',consentimentosOpcionais:[],versaoTermo:versao})
    });
    if(!r.ok){
      const j=await r.json().catch(()=>({}));
      alert(j.erro||'Falha ao registrar aceite LGPD.');
      return;
    }
  }catch(_err){}
  localStorage.setItem('crc_lgpd_aceite_v1',JSON.stringify({versao,hash}));
  closeModal('modal-boleto');
  if(lgpdPendingResolve) lgpdPendingResolve(true);
  lgpdPendingResolve=null;
}

function rejeitarLgpd(){
  closeModal('modal-boleto');
  if(lgpdPendingResolve) lgpdPendingResolve(false);
  lgpdPendingResolve=null;
}

function hydrateNotificacoesBase(prefix,state){
  const prefs=JSON.parse(localStorage.getItem('crc_notif_pref')||'{}');
  const defaults={email:'usuario@exemplo.com',whatsapp:'(71) 98888-0000',sms:'(71) 97777-0000'};
  ['email','whatsapp','sms'].forEach((canal)=>{
    const dest=document.getElementById(`${prefix}-${canal}-destino`);
    if(dest) dest.value=(prefs[canal]&&prefs[canal].destino)||defaults[canal];
    const check=document.getElementById(`${prefix}-${canal}-check`);
    if(check) check.checked=!!prefs[canal];
    const status=document.getElementById(`${prefix}-${canal}-status`);
    const validado=!!(prefs[canal]&&prefs[canal].validado);
    state[canal].validado=validado;
    state[canal].codigoId=null;
    if(status){
      status.textContent=validado?'Validado':'Aguardando validacao';
      status.className=`notif-status ${validado?'ok':''}`;
    }
  });
}

function hydrateNotificacoesModal(){hydrateNotificacoesBase('notif',notifValidationState)}
function hydrateNotificacoesPage(){hydrateNotificacoesBase('notif-page',notifPageValidationState)}

async function enviarCodigoCanalBase(canal,prefix,state){
  const destinoEl=document.getElementById(`${prefix}-${canal}-destino`);
  const statusEl=document.getElementById(`${prefix}-${canal}-status`);
  const destino=(destinoEl&&destinoEl.value||'').trim();
  if(!destino){alert('Informe o destino do canal.');return;}
  const r=await fetch('/api/v1/notificacoes/validar/enviar',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({canal,destino})
  });
  const j=await r.json();
  if(!r.ok){alert(j.erro||'Falha ao enviar codigo.');return;}
  state[canal].codigoId=j.codigoId;
  state[canal].validado=false;
  if(statusEl){
    statusEl.textContent='Codigo enviado';
    statusEl.className='notif-status';
  }
}
async function enviarCodigoCanal(canal){await enviarCodigoCanalBase(canal,'notif',notifValidationState)}
async function enviarCodigoCanalPage(canal){await enviarCodigoCanalBase(canal,'notif-page',notifPageValidationState)}

async function confirmarCodigoCanalBase(canal,prefix,state){
  const codigoEl=document.getElementById(`${prefix}-${canal}-codigo`);
  const statusEl=document.getElementById(`${prefix}-${canal}-status`);
  const codigo=(codigoEl&&codigoEl.value||'').trim();
  const codigoId=state[canal].codigoId;
  if(!codigoId){alert('Envie o codigo primeiro.');return;}
  const r=await fetch('/api/v1/notificacoes/validar/conferir',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({codigoId,codigo})
  });
  const j=await r.json();
  state[canal].validado=!!j.validado;
  if(statusEl){
    statusEl.textContent=j.validado?'Validado com sucesso':'Codigo invalido';
    statusEl.className=`notif-status ${j.validado?'ok':'err'}`;
  }
}
async function confirmarCodigoCanal(canal){await confirmarCodigoCanalBase(canal,'notif',notifValidationState)}
async function confirmarCodigoCanalPage(canal){await confirmarCodigoCanalBase(canal,'notif-page',notifPageValidationState)}

async function salvarPreferenciasNotificacaoBase(prefix,state,closeOnSuccess){
  const canais=['email','whatsapp','sms']
    .filter((canal)=>document.getElementById(`${prefix}-${canal}-check`)?.checked)
    .map((canal)=>({
      tipo:canal,
      destino:document.getElementById(`${prefix}-${canal}-destino`)?.value||'',
      validado:!!state[canal].validado,
      sincronizarPerfil:true
    }));
  const r=await fetch('/api/v1/notificacoes/preferencias',{
    method:'PUT',
    headers:{'Content-Type':'application/json','x-user-id':'demo-user'},
    body:JSON.stringify({canais,tiposNotificacao:['vencimento','novoDocumento','acordoStatus']})
  });
  const j=await r.json();
  if(!r.ok){alert(j.erro||'Nao foi possivel salvar preferencias.');return false;}
  const local={};
  canais.forEach((c)=>{local[c.tipo]={destino:c.destino,validado:c.validado};});
  localStorage.setItem('crc_notif_pref',JSON.stringify(local));
  localStorage.setItem('arrecada_notif_seen','1');
  if(closeOnSuccess) closeModal('modal-notif');
  alert('Preferências de notificação salvas com sucesso!');
  return true;
}

async function salvarPreferenciasNotificacao(){
  await salvarPreferenciasNotificacaoBase('notif',notifValidationState,true);
}
async function salvarPreferenciasNotificacaoPage(){
  await salvarPreferenciasNotificacaoBase('notif-page',notifPageValidationState,false);
}

/* ── CHAT IA ── */
let chatOpen=false;
let chatMessages=[];
function toggleChat(){
  chatOpen=!chatOpen;
  const w=document.getElementById('chat-window');
  w.style.display=chatOpen?'flex':'none';
  if(chatOpen&&chatMessages.length===0){
    addBotMessage('Olá! Sou o assistente do CRC. Posso ajudar com IPTU, certidões, acordos, NFSe e outros serviços do Portal. O que você precisa?');
  }
}
function addBotMessage(text){
  chatMessages.push({from:'bot',text});
  renderChat();
}
function addUserMessage(text){
  chatMessages.push({from:'user',text});
  renderChat();
  setTimeout(()=>{
    const lower=text.toLowerCase();
    if(lower.match(/iptu|imposto.*predial/))addBotMessage('Sobre IPTU: você pode consultar débitos em "Tributos em Aberto", emitir a 2ª via em "2ª Via Documentos" ou fazer um acordo em "Acordo da Dívida". Posso ajudar com algo específico?');
    else if(lower.match(/certid/))addBotMessage('Para emitir certidões, acesse "Certidões de Débitos" no menu lateral. Lá você escolhe a inscrição e clica em "Emitir PDF".');
    else if(lower.match(/acordo|parcel/))addBotMessage('Para acordos e parcelamentos, acesse "Acordo da Dívida". O sistema seleciona os débitos automaticamente e você pode simular parcelas de 6x até 36x.');
    else if(lower.match(/nfs|nota fiscal/))addBotMessage('Para NFSe, acesse "NFSe" no menu. Lá você pode emitir, consultar e cancelar notas fiscais de serviço.');
    else if(lower.match(/alvara|alvará/))addBotMessage('Para emitir alvará de funcionamento, acesse "Alvará" no menu. Selecione a empresa vinculada ao seu CNPJ.');
    else if(lower.match(/2.*via|segunda via|boleto/))addBotMessage('Para gerar 2ª via de boletos (IPTU, ISS, TFF, Dívida), acesse "2ª Via Documentos". Todos os seus débitos já aparecem vinculados ao CPF.');
    else if(lower.match(/itiv|transmiss/))addBotMessage('Para o ITIV (Imposto de Transmissão de Imóveis), acesse "ITIV Online" e informe os dados da transação. O cálculo é automático.');
    else if(lower.match(/cadastr|ficha/))addBotMessage('Acesse "Ficha Cadastral" para ver dados de imóveis e empresas vinculados ao seu CPF.');
    else if(lower.match(/prefeito|prefeita|vereador|politic|eleição|governo|partido/))addBotMessage('Desculpe, só posso ajudar com assuntos do Portal do Contribuinte. Posso ajudar com certidões, tributos, acordos ou outros serviços. Em que posso ajudar?');
    else if(lower.match(/receita|comida|miojo|cozinha|bolo|culinaria/))addBotMessage('Desculpe, só posso responder sobre serviços do Portal do Contribuinte. Posso ajudar com IPTU, certidões, NFSe ou outros serviços?');
    else if(lower.match(/obrigad|valeu|thanks/))addBotMessage('De nada! Estou aqui sempre que precisar. Qualquer dúvida sobre o Portal, é só perguntar.');
    else if(lower.match(/oi|olá|ola|bom dia|boa tarde|boa noite|hey|hello/))addBotMessage('Olá! Como posso ajudar? Posso tirar dúvidas sobre IPTU, certidões, acordos, NFSe, alvará e outros serviços do Portal.');
    else addBotMessage('Posso ajudar com serviços do Portal como: IPTU, certidões, 2ª via de boletos, acordos, NFSe, alvará, ITIV, ficha cadastral e legislação. Sobre qual assunto você precisa?');
  },600);
}
function renderChat(){
  const body=document.getElementById('chat-body');
  body.innerHTML=chatMessages.map(m=>`<div class="chat-msg ${m.from}"><div class="chat-bubble ${m.from}">${m.from==='bot'?'<span class="chat-bot-icon">'+robotSVG(20,'happy')+'</span>':''}${m.text}</div></div>`).join('');
  body.scrollTop=body.scrollHeight;
}
function sendChat(){
  const input=document.getElementById('chat-input');
  const text=input.value.trim();
  if(!text)return;
  addUserMessage(text);
  input.value='';
}

/* ── PROFILE ── */
function loadProfile(){const p=localStorage.getItem('arrecada_photo');if(p)updateAvatars(p)}
function handlePhotoUpload(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{localStorage.setItem('arrecada_photo',ev.target.result);updateAvatars(ev.target.result)};r.readAsDataURL(f)}
function updateAvatars(src){['sidebar-avatar','topbar-avatar'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=`<img src="${src}">`});const pp=document.getElementById('profile-photo-main');if(pp)pp.innerHTML=`<img src="${src}">`}
function triggerPhotoUpload(){document.getElementById('photo-upload').click()}

/* ── NAVIGATE ── */
let currentPage='dashboard';
const navHistory=[];
const TITLES={dashboard:'Painel do Contribuinte',certidoes:'Certidões de Débitos',alvara:'Emissão de Alvará',cartao_cga:'Cartão CGA',segunda_via:'2ª Via de Documentos',extrato_divida:'Extrato da Dívida',tributos:'Tributos em Aberto',acordo:'Acordo da Dívida',itiv:'ITIV Online',nfse:'NFSe',ficha_cadastral:'Ficha Cadastral',autenticacao:'Autenticação de Certidão',legislacao:'Legislação',situacao_fiscal:'Situação Fiscal',procuracao:'Procuração Eletrônica',protocolo:'Protocolo e Processos',dec:'Domicílio Eletrônico',caixa_postal:'Caixa Postal',notificacoes:'Central de Notificações',perfil:'Meu Perfil',faq:'Perguntas e Respostas',config_dev:'Configurações do Sistema'};

function navigate(page){
  const proc=getProcuradorAtivo();
  const alwaysAllowed=['dashboard','perfil','faq'];
  if(proc&&!alwaysAllowed.includes(page)&&!proc.sistemas.includes(page)){
    alert('Acesso negado.\n\nComo procurador de '+proc.outorgante_nome+', você tem acesso apenas aos módulos:\n'+proc.sistemas.map(s=>PROC_MODULOS[s]||s).join(', '));
    logProcurador('ACESSO_NEGADO','Tentou acessar: '+page);
    return;
  }
  if(proc&&!alwaysAllowed.includes(page)){logProcurador('NAVEGOU','Acessou módulo: '+(TITLES[page]||page))}
  if(currentPage&&currentPage!==page)navHistory.push(currentPage);
  if(navHistory.length>30)navHistory.splice(0,navHistory.length-30);
  currentPage=page;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
  document.getElementById('sidebar').classList.remove('mobile-open');
  const ov=document.getElementById('sidebar-overlay');if(ov)ov.classList.remove('active');
  document.getElementById('topbar-title').textContent=TITLES[page]||'CRC';
  const c=document.getElementById('page-container');
  c.innerHTML=pages[page]?pages[page]():pages.dashboard();c.scrollTop=0;
  injectBackButton(page);
  if(page==='perfil'){const p=localStorage.getItem('arrecada_photo');if(p){const pp=document.getElementById('profile-photo-main');if(pp)pp.innerHTML=`<img src="${p}">`}}
  if(page==='notificacoes'){setTimeout(hydrateNotificacoesPage,20);}
}
function goBack(){
  if(navHistory.length>0){navigate(navHistory.pop());navHistory.pop();}
  else navigate('dashboard');
}
function injectBackButton(page){
  if(page==='dashboard')return;
  const header=document.querySelector('.page-header');
  if(!header)return;
  const btn=document.createElement('div');
  btn.className='back-nav';
  btn.innerHTML=`<button class="back-nav-btn" onclick="goBack()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Voltar</button><span class="back-nav-trail"><a onclick="navigate('dashboard')" style="cursor:pointer">Início</a> <span class="back-sep">/</span> <span class="back-current">${(TITLES[page]||page)}</span></span>`;
  header.insertBefore(btn,header.firstChild);
}

/* ── TOUR (contextual) ── */
const TOUR_STEPS={
  dashboard:[
    {target:'[data-tour="nav-dashboard"]',text:'Este é o <strong>Painel Principal</strong> com resumo de tudo: débitos, tributos, acordos e atalhos rápidos.'},
    {target:'[data-tour="sidebar-toggle"]',text:'Clique aqui para <strong>recolher ou expandir</strong> o menu lateral.'},
    {target:'[data-tour="theme-toggle"]',text:'Alterne entre <strong>tema escuro e claro</strong>.'},
    {target:'[data-tour="tour-btn"]',text:'Este botão mostra a <strong>ajuda da tela atual</strong>. Muda conforme a página!'},
  ],
  acordo:[
    {target:'[data-tour="nav-acordo"]',text:'No <strong>Acordo da Dívida</strong> você seleciona débitos, escolhe a forma de pagamento e simula.'},
    {target:'#sim-section',text:'Aqui você faz a <strong>simulação interativa</strong>: escolha parcelas e veja o resultado na hora.'},
  ],
  segunda_via:[
    {target:'[data-tour="nav-2via"]',text:'Na <strong>2ª Via</strong> basta clicar no botão do documento desejado. Tudo já está vinculado ao seu CPF!'},
  ],
  perfil:[
    {target:'[data-tour="nav-perfil"]',text:'No <strong>Meu Perfil</strong> altere foto, endereço, telefone e veja seu nível Gov.BR.'},
  ],
  notificacoes:[
    {target:'[data-tour="nav-notif"]',text:'Configure <strong>alertas por e-mail, WhatsApp, SMS ou agenda</strong> para não perder vencimentos.'},
  ],
  _default:[
    {target:'[data-tour="sidebar-toggle"]',text:'Use o menu lateral para navegar. <strong>Recolha-o</strong> clicando aqui.'},
    {target:'[data-tour="theme-toggle"]',text:'<strong>Tema escuro ou claro</strong> — escolha o que preferir.'},
    {target:'[data-tour="tour-btn"]',text:'Sempre clique aqui para ver a <strong>ajuda da tela atual</strong>.'},
  ]
};
let tourIdx=0,tourList=[];

function startTour(){
  tourList=TOUR_STEPS[currentPage]||TOUR_STEPS._default;
  tourIdx=0;document.getElementById('tour-overlay').style.display='block';showTourStep();
}
function endTour(){document.getElementById('tour-overlay').style.display='none'}
function nextTourStep(){tourIdx++;if(tourIdx>=tourList.length){endTour();return}showTourStep()}
function showTourStep(){
  const step=tourList[tourIdx],tgt=document.querySelector(step.target),sp=document.getElementById('tour-spotlight'),tt=document.getElementById('tour-tooltip');
  document.getElementById('tour-text').innerHTML=step.text;
  document.getElementById('tour-counter').textContent=`${tourIdx+1} de ${tourList.length}`;
  document.getElementById('tour-next-btn').textContent=tourIdx===tourList.length-1?'Finalizar':'Próximo';
  if(tgt){
    const r=tgt.getBoundingClientRect(),p=6;
    sp.style.left=(r.left-p)+'px';sp.style.top=(r.top-p)+'px';sp.style.width=(r.width+p*2)+'px';sp.style.height=(r.height+p*2)+'px';
    let tl=r.right+14,tp=r.top;
    if(tl+300>window.innerWidth)tl=r.left-316;
    if(tl<8){tl=r.left;tp=r.bottom+10}
    if(tp+170>window.innerHeight)tp=window.innerHeight-190;
    if(tp<8)tp=8;
    tt.style.left=tl+'px';tt.style.top=tp+'px';
  }
}

/* ── CPF MASK ── */
document.addEventListener('input',e=>{
  if(e.target.id==='cpf-input'){let v=e.target.value.replace(/\D/g,'').slice(0,11);if(v.length>9)v=v.replace(/(\d{3})(\d{3})(\d{3})(\d+)/,'$1.$2.$3-$4');else if(v.length>6)v=v.replace(/(\d{3})(\d{3})(\d+)/,'$1.$2.$3');else if(v.length>3)v=v.replace(/(\d{3})(\d+)/,'$1.$2');e.target.value=v;}
});

/* =============================================
   PAGES
   ============================================= */
const pages={};
const SV=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">`;

function qc(pg,lbl,sub,clr,ico,bdg){return`<div class="quick-card" onclick="navigate('${pg}')"><div class="quick-card-stripe" style="background:${clr}"></div><div class="quick-card-icon" style="background:${clr}18;color:${clr}">${ico}</div><div class="quick-card-text"><span class="quick-card-label">${lbl}</span><span class="quick-card-sub">${sub}</span></div>${bdg?`<span class="badge-count">${bdg}</span>`:''}</div>`}

const I={
  cert:`${SV}<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  money:`${SV}<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  shield:`${SV}<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  card:`${SV}<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  check:`${SV}<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  clip:`${SV}<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
  home:`${SV}<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>`,
  users:`${SV}<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  mail:`${SV}<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  inbox:`${SV}<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>`,
  bell:`${SV}<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  user:`${SV}<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  help:`${SV}<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  book:`${SV}<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  doc2:`${SV}<rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>`,
  alvara:`${SV}<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>`,
};

/* ── DASHBOARD ── */
pages.dashboard=()=>`<div class="module-page">
  <div class="page-header"><h1>Olá, ${currentUserType==='admin'?(localStorage.getItem('crc_admin_name')||'Admin'):((getContribuinteLogado()||{}).nome||'Contribuinte').split(' ')[0]}!</h1><p>Bem-vindo ao seu painel — Município de Lauro de Freitas</p></div>
  <div class="summary-cards">
    <div class="summary-card" onclick="navigate('extrato_divida')"><div class="summary-icon danger">${I.shield}</div><div class="summary-info"><span class="summary-label">Dívida Ativa</span><span class="summary-value" style="color:var(--danger)">R$ 4.872,35</span><span class="summary-sub">3 inscrições</span></div></div>
    <div class="summary-card" onclick="navigate('tributos')"><div class="summary-icon orange">${I.money}</div><div class="summary-info"><span class="summary-label">A Vencer</span><span class="summary-value" style="color:var(--orange)">R$ 1.590,00</span><span class="summary-sub">2 tributos</span></div></div>
    <div class="summary-card" onclick="navigate('acordo')"><div class="summary-icon green">${I.check}</div><div class="summary-info"><span class="summary-label">Acordos</span><span class="summary-value" style="color:var(--accent)">2</span><span class="summary-sub">Em dia</span></div></div>
    <div class="summary-card" onclick="navigate('situacao_fiscal')"><div class="summary-icon accent">${I.cert}</div><div class="summary-info"><span class="summary-label">Inscrições</span><span class="summary-value">5</span><span class="summary-sub">3 Imóveis · 2 Empresas</span></div></div>
  </div>
  <div class="section-title">Acesso Rápido</div>
  <div class="quick-cards">
    ${qc('certidoes','Certidões','Emitir certidões','#00D4A0',I.cert)}
    ${qc('alvara','Alvará','Emissão de alvará','#00D4A0',I.alvara)}
    ${qc('cartao_cga','Cartão CGA','Emissão cartão','#00A87E',I.card)}
    ${qc('segunda_via','2ª Via','IPTU, ISS, TFF, Dívida','#E87C1E',I.clip)}
    ${qc('situacao_fiscal','Situação Fiscal','Consultar situação','#00D4A0',I.check)}
    ${qc('extrato_divida','Extrato Dívida','Débitos detalhados','#FF4D6A',I.cert)}
    ${qc('tributos','Tributos Aberto','Pendentes','#E87C1E',I.money)}
    ${qc('acordo','Acordo Dívida','Simular e parcelar','#00D4A0',I.shield,'2')}
    ${qc('itiv','ITIV Online','Transferência imóvel','#00D4A0',I.home)}
    ${qc('nfse','NFSe','Notas fiscais','#00D4A0',I.card)}
    ${qc('ficha_cadastral','Ficha Cadastral','Imóvel / Empresa','#6E9485',I.doc2)}
    ${qc('autenticacao','Autenticação','Validar certidão','#00D4A0',I.shield)}
    ${qc('procuracao','e-Procuração','Poderes eletrônicos','#6E9485',I.users)}
    ${qc('protocolo','Protocolo','Processos','#00D4A0',I.clip)}
    ${qc('legislacao','Legislação','Leis e decretos','#6E9485',I.book)}
    ${qc('perfil','Meu Perfil','Dados e foto','#6E9485',I.user)}
  </div>
</div>`;

/* ── SITUAÇÃO FISCAL ── */
pages.situacao_fiscal=()=>`<div class="module-page">
  <div class="page-header"><h1>Situação Fiscal</h1><p>Resumo da situação fiscal de todas as suas inscrições.</p></div>
  <div class="info-banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Dados carregados automaticamente para CPF ***.***.890-12</div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Inscrição</th><th>Tipo</th><th>Situação</th><th>Débitos Abertos</th><th>Dívida Ativa</th><th>Ação</th></tr></thead><tbody>
    <tr><td style="font-weight:700">001.023.045.001</td><td><span class="status-badge blue">Imóvel</span></td><td><span class="status-badge red">Irregular</span></td><td>R$ 1.929,30</td><td>R$ 1.438,80</td><td class="table-actions"><button class="table-action-btn primary" onclick="navigate('extrato_divida')">Extrato</button></td></tr>
    <tr><td style="font-weight:700">001.023.045.002</td><td><span class="status-badge blue">Imóvel</span></td><td><span class="status-badge green">Regular</span></td><td>R$ 0,00</td><td>—</td><td class="table-actions"><button class="table-action-btn" onclick="navigate('certidoes')">Certidão</button></td></tr>
    <tr><td style="font-weight:700">001.078.012.003</td><td><span class="status-badge blue">Imóvel</span></td><td><span class="status-badge green">Regular</span></td><td>R$ 0,00</td><td>—</td><td class="table-actions"><button class="table-action-btn" onclick="navigate('certidoes')">Certidão</button></td></tr>
    <tr><td style="font-weight:700">EMP-2024-00345</td><td><span class="status-badge orange">Empresa</span></td><td><span class="status-badge orange">Parcelado</span></td><td>R$ 2.400,00</td><td>—</td><td class="table-actions"><button class="table-action-btn" onclick="navigate('acordo')">Acordo</button></td></tr>
    <tr><td style="font-weight:700">EMP-2025-00120</td><td><span class="status-badge orange">Empresa</span></td><td><span class="status-badge green">Regular</span></td><td>R$ 0,00</td><td>—</td><td class="table-actions"><button class="table-action-btn" onclick="navigate('certidoes')">Certidão</button></td></tr>
  </tbody></table></div></div>
</div>`;

/* ── CERTIDÕES ── */
const CERTIDOES_DATA=[
  {inscricao:'001.023.045.001',tipo:'Imóvel',situacao:'Normal',vinculo:'Proprietário',tipoCert:'Certidão Negativa'},
  {inscricao:'001.023.045.002',tipo:'Imóvel',situacao:'Normal',vinculo:'Proprietário',tipoCert:'Certidão Negativa'},
  {inscricao:'001.078.012.003',tipo:'Imóvel',situacao:'Normal',vinculo:'Possuidor',tipoCert:'Certidão Negativa'},
  {inscricao:'EMP-2024-00345',tipo:'Empresa',situacao:'Regular',vinculo:'Responsável',tipoCert:'Certidão Negativa'},
  {inscricao:'034.567.890-12',tipo:'PF',situacao:'Irregular',vinculo:'Titular',tipoCert:'Positiva c/ Efeito Negativa'},
];
function getEntidadePayloadForApi(){
  const c=getEntidadeConfig();
  return {
    nome:c.nome||'',
    cnpj:c.cnpj||'',
    ibge:c.ibge||'',
    uf:c.uf||'',
    responsavel:c.responsavel||'',
    email:c.email||'',
    telefone:c.telefone||'',
    endereco:c.endereco||'',
    logo:c.logo||''
  };
}
async function emitirCertidaoPDF(idx){
  const c=CERTIDOES_DATA[idx];if(!c)return;
  const modal=document.getElementById('modal-boleto');if(!modal)return;
  const response=await fetch('/api/v1/certidoes/emitir',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      inscricao:c.inscricao,
      tipo:c.tipo,
      tipoCert:c.tipoCert,
      vinculo:c.vinculo,
      situacao:c.situacao,
      entidade:getEntidadePayloadForApi()
    })
  });
  const payload=await response.json();
  if(!response.ok){
    alert(payload.erro||'Falha ao emitir certidao.');
    return;
  }
  const emissao=new Date().toLocaleDateString('pt-BR');
  const validade=new Date(payload.validadeAte).toLocaleDateString('pt-BR');
  modal.querySelector('.modal').innerHTML=`
    <div class="modal-header"><h2>Emissão de Certidão</h2><button class="modal-close" onclick="closeModal('modal-boleto')">&times;</button></div>
    <div class="modal-body">
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:${c.situacao==='Irregular'?'var(--warning)':'var(--accent)'};display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
        <h3 style="margin-bottom:4px">${c.tipoCert}</h3>
        <p style="font-size:.84rem;color:var(--text-muted)">Inscrição: ${c.inscricao}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.85rem;margin-bottom:16px">
        <div><strong>Tipo:</strong> ${c.tipo}</div>
        <div><strong>Situação:</strong> ${c.situacao}</div>
        <div><strong>Vínculo:</strong> ${c.vinculo}</div>
        <div><strong>Emissão:</strong> ${emissao}</div>
        <div><strong>Validade:</strong> ${validade}</div>
        <div><strong>Código:</strong> <span style="font-family:monospace;font-size:.78rem">${payload.codigoAutenticacao}</span></div>
      </div>
      <div class="info-banner" style="margin-bottom:14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>${c.situacao==='Irregular'?'Esta certidão é <strong>Positiva com Efeito de Negativa</strong> pois há parcelamento em dia.':'Esta certidão atesta a <strong>inexistência de débitos</strong> para a inscrição informada.'}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="window.open('${payload.urlDownload}','_blank');closeModal('modal-boleto')">Baixar PDF</button>
        <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('${payload.codigoAutenticacao}');this.textContent='Copiado!';setTimeout(()=>this.textContent='Copiar Código',1500)">Copiar Código</button>
        <button class="btn btn-ghost btn-sm" onclick="closeModal('modal-boleto')">Fechar</button>
      </div>
    </div>`;
  showModal('modal-boleto');
}
pages.certidoes=()=>`<div class="module-page">
  <div class="page-header"><h1>Certidões de Débitos</h1><p>Clique em "Emitir" para gerar a certidão da inscrição desejada.</p></div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Ação</th><th>Tipo</th><th>Inscrição</th><th>Situação</th><th>Certidão</th><th>Vínculo</th></tr></thead><tbody>
    ${CERTIDOES_DATA.map((c,i)=>`<tr><td><button class="table-action-btn primary" onclick="emitirCertidaoPDF(${i})">Emitir PDF</button></td><td><span class="status-badge ${c.tipo==='Imóvel'?'blue':c.tipo==='Empresa'?'orange':'gray'}">${c.tipo}</span></td><td>${c.inscricao}</td><td><span class="status-badge ${c.situacao==='Irregular'?'red':'green'}">${c.situacao}</span></td><td style="font-size:.82rem">${c.tipoCert}</td><td>${c.vinculo}</td></tr>`).join('')}
  </tbody></table></div></div>
</div>`;

/* ── ALVARÁ ── */
pages.alvara=()=>`<div class="module-page">
  <div class="page-header"><h1>Emissão de Alvará</h1><p>Emita alvarás de funcionamento para suas empresas.</p></div>
  <div class="info-banner">Selecione a empresa vinculada ao seu CPF/CNPJ para emitir o alvará.</div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0"><table class="data-table"><thead><tr><th>Empresa</th><th>CNPJ</th><th>Situação</th><th>Validade</th><th>Ação</th></tr></thead><tbody>
    <tr><td style="font-weight:700">Empresa Alpha Comércio LTDA</td><td>12.345.678/0001-90</td><td><span class="status-badge green">Ativo</span></td><td>31/12/2026</td><td><button class="table-action-btn primary" onclick="emitirAlvaraPDF('Empresa Alpha Comércio LTDA','12.345.678/0001-90','EMP-2024-00345','31/12/2026')">Emitir Alvará</button></td></tr>
    <tr><td style="font-weight:700">Beta Serviços ME</td><td>98.765.432/0001-10</td><td><span class="status-badge orange">Renovação</span></td><td>Vencido</td><td><button class="table-action-btn primary" onclick="solicitarRenovacaoAlvara('Beta Serviços ME','98.765.432/0001-10','EMP-2025-00120')">Solicitar Renovação</button></td></tr>
  </tbody></table></div></div>
</div>`;

/* ── ALVARÁ FUNÇÕES ── */
async function emitirAlvaraPDF(nome,cnpj,inscricao,validade){
  const modal=document.getElementById('modal-boleto');if(!modal)return;
  const r=await fetch('/api/v1/alvaras/emitir',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nome,cnpj,inscricao,validade,entidade:getEntidadePayloadForApi()})
  });
  const payload=await r.json();
  if(!r.ok){alert(payload.erro||'Falha ao emitir alvara.');return;}
  modal.querySelector('.modal').innerHTML=`
    <div class="modal-header"><h2>Alvará de Funcionamento</h2><button class="modal-close" onclick="closeModal('modal-boleto')">&times;</button></div>
    <div class="modal-body" style="text-align:center">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
      <h3 style="margin-bottom:4px">Alvará Gerado</h3>
      <p style="font-size:.84rem;color:var(--text-muted);margin-bottom:16px">Código: ${payload.codigoAutenticacao}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;font-size:.85rem;margin-bottom:16px">
        <div><strong>Empresa:</strong> ${nome}</div><div><strong>CNPJ:</strong> ${cnpj}</div>
        <div><strong>Inscrição:</strong> ${inscricao}</div><div><strong>Validade:</strong> ${validade}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-primary btn-sm" onclick="window.open('${payload.urlDownload}','_blank');closeModal('modal-boleto')">Baixar PDF</button><button class="btn btn-ghost btn-sm" onclick="closeModal('modal-boleto')">Fechar</button></div>
    </div>`;
  showModal('modal-boleto');
}
function solicitarRenovacaoAlvara(nome,cnpj,inscricao){
  protocoloView='novo';
  navigate('protocolo');
  setTimeout(()=>{
    const tipo=document.getElementById('prot-tipo');if(tipo)tipo.value='Renovação de Alvará';
    const insc=document.getElementById('prot-inscricao');if(insc)insc.value=inscricao;
    const assunto=document.getElementById('prot-assunto');if(assunto)assunto.value='Renovação de Alvará — '+nome+' ('+cnpj+')';
  },100);
}

/* ── CARTÃO CGA ── */
async function gerarCartaoCGA(inscricao,nome,atividade){
  const modal=document.getElementById('modal-boleto');if(!modal)return;
  const r=await fetch('/api/v1/cga/emitir',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({inscricao,nome,atividade,entidade:getEntidadePayloadForApi()})
  });
  const payload=await r.json();
  if(!r.ok){alert(payload.erro||'Falha ao emitir cartao CGA.');return;}
  modal.querySelector('.modal').innerHTML=`
    <div class="modal-header"><h2>Cartão CGA</h2><button class="modal-close" onclick="closeModal('modal-boleto')">&times;</button></div>
    <div class="modal-body" style="text-align:center">
      <div style="width:64px;height:64px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
      <h3 style="margin-bottom:4px">Cartão CGA Gerado</h3>
      <p style="font-size:.84rem;color:var(--text-muted);margin-bottom:16px">Código: ${payload.codigoAutenticacao}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;font-size:.85rem;margin-bottom:16px">
        <div><strong>Inscrição:</strong> ${inscricao}</div><div><strong>Razão Social:</strong> ${nome}</div>
        <div><strong>Atividade:</strong> ${atividade}</div><div><strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-primary btn-sm" onclick="window.open('${payload.urlDownload}','_blank');closeModal('modal-boleto')">Baixar PDF</button><button class="btn btn-ghost btn-sm" onclick="closeModal('modal-boleto')">Fechar</button></div>
    </div>`;
  showModal('modal-boleto');
}
pages.cartao_cga=()=>`<div class="module-page">
  <div class="page-header"><h1>Cartão CGA</h1><p>Emissão do Cartão de Cadastro Geral de Atividades.</p></div>
  <div class="info-banner">Selecione a inscrição para gerar o Cartão CGA.</div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0"><table class="data-table"><thead><tr><th>Inscrição</th><th>Razão Social</th><th>Atividade</th><th>Situação</th><th>Ação</th></tr></thead><tbody>
    <tr><td>EMP-2024-00345</td><td style="font-weight:700">Empresa Alpha Comércio LTDA</td><td>Comércio Varejista</td><td><span class="status-badge green">Ativo</span></td><td><button class="table-action-btn primary" onclick="gerarCartaoCGA('EMP-2024-00345','Empresa Alpha Comércio LTDA','Comércio Varejista')">Gerar Cartão CGA</button></td></tr>
    <tr><td>EMP-2025-00120</td><td style="font-weight:700">Beta Serviços ME</td><td>Prestação de Serviços</td><td><span class="status-badge green">Ativo</span></td><td><button class="table-action-btn primary" onclick="gerarCartaoCGA('EMP-2025-00120','Beta Serviços ME','Prestação de Serviços')">Gerar Cartão CGA</button></td></tr>
  </tbody></table></div></div>
</div>`;

/* ── 2ª VIA ── */
async function gerarBoleto(tributo,inscricao,valor,vencimento){
  const codBarras='23793.38128 60000.000003 00000.000402 1 '+Math.floor(Math.random()*9000+1000)+'0000'+valor.replace(/[^\d]/g,'');
  const pixCode='00020126580014BR.GOV.BCB.PIX0136'+crypto.randomUUID().replace(/-/g,'').slice(0,36)+'5204000053039865802BR5925PREFEITURA LAURO FREITAS6015LAURO DE FREITAS62070503***6304';
  const pdfResp=await fetch('/api/v1/financeiro/boleto',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({tributo,inscricao,valor,vencimento,entidade:getEntidadePayloadForApi()})
  });
  const pdfPayload=await pdfResp.json();
  if(!pdfResp.ok){alert(pdfPayload.erro||'Falha ao gerar boleto.');return;}
  showModal('modal-boleto');
  setTimeout(()=>{
    const body=document.getElementById('modal-boleto-body');
    if(!body)return;
    body.innerHTML=`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:1.05rem;font-weight:800;margin-bottom:4px">2ª Via — ${tributo}</div>
      <div style="font-size:.84rem;color:var(--text-secondary)">${inscricao}</div>
    </div>
    <div class="card-panel" style="margin-bottom:14px"><div class="card-panel-body">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:.82rem;color:var(--text-muted)">Tributo</span><span style="font-weight:600">${tributo}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:.82rem;color:var(--text-muted)">Inscrição</span><span style="font-weight:600">${inscricao}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:.82rem;color:var(--text-muted)">Vencimento</span><span style="font-weight:600">${vencimento}</span></div>
      <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:2px solid var(--border)"><span style="font-size:.88rem;font-weight:700">Valor</span><span style="font-size:1.15rem;font-weight:800;color:var(--accent)">${valor}</span></div>
    </div></div>
    <div class="card-panel" style="margin-bottom:14px"><div class="card-panel-header"><h3>Código de Barras</h3></div><div class="card-panel-body" style="text-align:center">
      <div style="background:#000;height:50px;margin:0 auto 10px;max-width:320px;border-radius:4px;display:flex;align-items:center;justify-content:center">
        <div style="display:flex;gap:1px;height:40px">${Array.from({length:50},()=>'<div style="width:'+Math.ceil(Math.random()*3)+'px;height:100%;background:#fff"></div>').join('')}</div>
      </div>
      <div style="font-family:monospace;font-size:.72rem;word-break:break-all;color:var(--text-secondary);margin-bottom:10px" id="cod-barras-text">${codBarras}</div>
      <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('cod-barras-text').textContent);alert('Código copiado!')">Copiar Código de Barras</button>
    </div></div>
    <div class="card-panel" style="margin-bottom:14px"><div class="card-panel-header"><h3>PIX Copia e Cola</h3></div><div class="card-panel-body" style="text-align:center">
      <div style="width:160px;height:160px;margin:0 auto 10px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r);display:flex;align-items:center;justify-content:center">
        <svg width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fff" rx="4"/>${Array.from({length:100},(_,i)=>{const x=(i%10)*12;const y=Math.floor(i/10)*12;return Math.random()>.5?'<rect x="'+(x+1)+'" y="'+(y+1)+'" width="10" height="10" fill="#000" rx="1"/>':'';}).join('')}<rect x="4" y="4" width="28" height="28" fill="none" stroke="#000" stroke-width="4" rx="4"/><rect x="10" y="10" width="16" height="16" fill="#000" rx="2"/><rect x="88" y="4" width="28" height="28" fill="none" stroke="#000" stroke-width="4" rx="4"/><rect x="94" y="10" width="16" height="16" fill="#000" rx="2"/><rect x="4" y="88" width="28" height="28" fill="none" stroke="#000" stroke-width="4" rx="4"/><rect x="10" y="94" width="16" height="16" fill="#000" rx="2"/></svg>
      </div>
      <div style="font-family:monospace;font-size:.65rem;word-break:break-all;color:var(--text-muted);margin-bottom:10px;max-height:40px;overflow:hidden" id="pix-code-text">${pixCode}</div>
      <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('pix-code-text').textContent);alert('PIX Copia e Cola copiado!')">Copiar PIX</button>
    </div></div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="window.open('${pdfPayload.urlDownload}','_blank')">Baixar PDF</button>
      <button class="btn btn-outline btn-sm" onclick="addToGoogleCalendar('Vencimento ${tributo} - ${inscricao}','${vencimento.split('/').reverse().join('-')}T09:00:00','Portal CRC - Valor: ${valor}')">Salvar na Agenda</button>
    </div>`;
  },50);
}
pages.segunda_via=()=>{
  const boletos=[
    ['IPTU / Taxas','001.023.045.001 — 2026','R$ 1.929,30','15/04/2026','#00D4A0'],
    ['IPTU / Taxas','001.023.045.002 — 2026','R$ 1.350,00','15/04/2026','#00D4A0'],
    ['TFF / TLL','001.023.045.001 — 2026','R$ 240,00','15/03/2026','#E87C1E'],
    ['TFF / TLL','001.023.045.002 — 2026','R$ 180,00','15/03/2026','#E87C1E'],
    ['ISS','EMP-2024-00345 — 03/2026','R$ 890,00','20/03/2026','#00A87E'],
    ['ISS','EMP-2025-00120 — 03/2026','R$ 420,00','20/03/2026','#00A87E'],
    ['Parcelamento','AC-2025-001 — Parc. 4/12','R$ 160,83','15/04/2026','#00D4A0'],
    ['Dívida Ativa','001.023.045.001 — CDA 2024','R$ 1.438,80','30/04/2026','#FF4D6A'],
  ];
  return `<div class="module-page">
  <div class="page-header"><h1>2ª Via de Documentos</h1><p>Gere a 2ª via com um clique. Dados já vinculados ao seu CPF.</p></div>
  <div class="via-grid">
    ${boletos.map(([t,s,v,d,c])=>`<div class="via-card"><div class="via-card-icon" style="background:${c}18;color:${c}">${I.clip}</div><div class="via-card-text"><div class="via-card-title">2ª Via ${t}</div><div class="via-card-sub">${s}</div><div style="font-size:.78rem;font-weight:700;color:var(--text);margin-top:2px">${v} — Venc: ${d}</div></div><div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap"><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();gerarBoleto('${t}','${s}','${v}','${d}')">Gerar</button><button class="btn btn-sm btn-outline" title="Salvar na Agenda" onclick="event.stopPropagation();addToGoogleCalendar('Vencimento ${t} - ${s}','${d.split('/').reverse().join('-')}T09:00:00','Portal CRC - ${v}')">📅</button></div></div>`).join('')}
  </div>
</div>`};

/* ── EXTRATO DÍVIDA ── */
pages.extrato_divida=()=>`<div class="module-page">
  <div class="page-header"><h1>Extrato da Dívida</h1><p>Débitos inscritos em dívida ativa.</p></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Filtros</h3></div><div class="card-panel-body"><div class="filter-bar"><div class="form-group"><label>Inscrição</label><input class="form-input" value="001.023.045.001"></div><div class="form-group"><label>Exercício</label><select class="form-select"><option>Todos</option><option>2026</option><option selected>2025</option><option>2024</option></select></div><div class="form-group"><label>Tributo</label><select class="form-select"><option>Todos</option></select></div><button class="btn btn-primary btn-sm">Consultar</button></div></div></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Resultado</h3></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Inscrição</th><th>Tributo</th><th>Exercício</th><th>Original</th><th>Juros</th><th>Multa</th><th>Atualizado</th><th>Venc.</th><th>Status</th><th>Ações</th></tr></thead><tbody>
    <tr><td>001.023.045.001</td><td>IPTU</td><td>2024</td><td>R$ 1.200</td><td>R$ 142</td><td>R$ 96</td><td style="font-weight:700;color:var(--danger)">R$ 1.438,80</td><td>15/02/24</td><td><span class="status-badge red">Aberto</span></td><td class="table-actions"><button class="table-action-btn primary" onclick="navigate('segunda_via')">2ª Via</button><button class="table-action-btn" onclick="navigate('acordo')">Acordo</button></td></tr>
    <tr><td>001.023.045.001</td><td>IPTU</td><td>2025</td><td>R$ 450</td><td>R$ 22</td><td>R$ 18</td><td style="font-weight:700;color:var(--danger)">R$ 490,50</td><td>15/02/25</td><td><span class="status-badge red">Aberto</span></td><td class="table-actions"><button class="table-action-btn primary" onclick="navigate('segunda_via')">2ª Via</button><button class="table-action-btn" onclick="navigate('acordo')">Acordo</button></td></tr>
    <tr><td>EMP-2024-00345</td><td>ISS</td><td>2025</td><td>R$ 2.400</td><td>—</td><td>—</td><td style="font-weight:700">R$ 2.400</td><td>20/04/25</td><td><span class="status-badge orange">Parcelado</span></td><td class="table-actions"><button class="table-action-btn">Detalhes</button></td></tr>
  </tbody></table></div></div>
</div>`;

/* ── TRIBUTOS ── */
const TRIBUTOS_ABERTOS=[
  {id:1,tributo:'IPTU',inscricao:'001.023.045.001',exercicio:'2024',venc:'15/02/24',valor:1438.80,status:'vencido'},
  {id:2,tributo:'IPTU',inscricao:'001.023.045.001',exercicio:'2025',venc:'15/02/25',valor:490.50,status:'vencido'},
  {id:3,tributo:'IPTU',inscricao:'001.023.045.002',exercicio:'2026',venc:'15/02/26',valor:1350.00,status:'a_vencer'},
  {id:4,tributo:'Taxa Lixo',inscricao:'001.023.045.001',exercicio:'2026',venc:'15/03/26',valor:240.00,status:'a_vencer'},
];
function toggleAllTributos(master){document.querySelectorAll('.trib-check').forEach(cb=>cb.checked=master.checked)}
function gerarGuiaUnificada(){
  const selecionados=[];
  document.querySelectorAll('.trib-check:checked').forEach(cb=>selecionados.push(parseInt(cb.value)));
  if(selecionados.length===0){alert('Selecione ao menos um tributo.');return}
  const tribs=TRIBUTOS_ABERTOS.filter(t=>selecionados.includes(t.id));
  const total=tribs.reduce((s,t)=>s+t.valor,0);
  const descricao=tribs.map(t=>t.tributo+' '+t.exercicio+' ('+t.inscricao+')').join(' + ');
  gerarBoleto('Guia Unificada',descricao,'R$ '+total.toFixed(2).replace('.',','),'15/04/2026');
}
pages.tributos=()=>`<div class="module-page">
  <div class="page-header"><h1>Tributos em Aberto</h1><p>Pagamentos pendentes vinculados ao seu CPF. Selecione e gere uma guia unificada.</p></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Pendentes</h3><div style="display:flex;gap:5px"><button class="btn btn-sm btn-outline" onclick="toggleAllTributos({checked:true})">Selecionar Todos</button><button class="btn btn-sm btn-primary" onclick="gerarGuiaUnificada()">Gerar Guia</button></div></div>
  <div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th><input type="checkbox" onchange="toggleAllTributos(this)"></th><th>Tributo</th><th>Inscrição</th><th>Exercício</th><th>Venc.</th><th>Atualizado</th><th>Status</th><th>Ação</th></tr></thead><tbody>
    ${TRIBUTOS_ABERTOS.map(t=>`<tr><td><input type="checkbox" class="trib-check" value="${t.id}"></td><td>${t.tributo}</td><td>${t.inscricao}</td><td>${t.exercicio}</td><td>${t.venc}</td><td style="font-weight:700;color:${t.status==='vencido'?'var(--danger)':'var(--text)'}">R$ ${t.valor.toFixed(2).replace('.',',')}</td><td><span class="status-badge ${t.status==='vencido'?'red':'orange'}">${t.status==='vencido'?'Vencido':'A Vencer'}</span></td><td><button class="table-action-btn primary" onclick="gerarBoleto('${t.tributo}','${t.inscricao} — ${t.exercicio}','R$ ${t.valor.toFixed(2).replace('.',',')}','${t.venc}')">2ª Via</button></td></tr>`).join('')}
  </tbody></table></div></div>
  <div style="margin-top:8px;font-size:.82rem;color:var(--text-muted)">Total selecionado: selecione tributos acima e clique em "Gerar Guia" para emitir boleto/PIX unificado.</div>
</div>`;

/* ── ACORDO (com simulação interativa) ── */
pages.acordo=()=>`<div class="module-page">
  <div class="page-header"><h1>Acordo da Dívida</h1><p>Simule e parcele seus débitos em dívida ativa.</p></div>
  <div class="card-panel" id="sim-section"><div class="card-panel-header"><h3>Simulação de Acordo</h3></div><div class="card-panel-body">
    <div class="info-banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><strong>Débitos selecionados automaticamente:</strong> IPTU 2024 (R$ 1.438,80) + IPTU 2025 (R$ 490,50) = <strong>R$ 1.929,30</strong></div>
    <div class="grid-2" style="margin-bottom:16px">
      <div class="form-group"><label>Forma de Pagamento</label><select class="form-select" id="sim-forma" onchange="simular()"><option value="vista">À Vista (20% desconto)</option><option value="6">Parcelado 6x</option><option value="12" selected>Parcelado 12x</option><option value="24">Parcelado 24x</option><option value="36">Parcelado 36x</option></select></div>
      <div class="form-group"><label>Data 1º Vencimento</label><input class="form-input" type="date" value="2026-04-15"></div>
    </div>
    <div class="sim-result" id="sim-result"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" onclick="navigate('dashboard')">Voltar</button><button class="btn btn-outline btn-sm" onclick="simular()">Recalcular</button><button class="btn btn-primary btn-sm" onclick="formalizarAcordo()">Formalizar Acordo</button></div>
  </div></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Histórico de Acordos</h3></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Nº</th><th>Data</th><th>Tipo</th><th>Valor</th><th>Parcelas</th><th>Status</th></tr></thead><tbody>
    <tr><td>AC-2025-001</td><td>10/01/25</td><td>Parcelado</td><td>R$ 2.880</td><td>12x</td><td><span class="status-badge green">Em dia</span></td></tr>
    <tr><td>AC-2024-015</td><td>05/08/24</td><td>À Vista</td><td>R$ 960</td><td>1x</td><td><span class="status-badge green">Quitado</span></td></tr>
  </tbody></table></div></div>
</div>`;

function simular(){
  const forma=document.getElementById('sim-forma').value;
  const total=1929.30;const descVista=0.20;
  let html='';
  if(forma==='vista'){
    const desc=total*descVista;const final=total-desc;
    html=`<div class="sim-row"><span class="sim-label">Valor Total Atualizado</span><span class="sim-val">R$ ${total.toFixed(2)}</span></div>
    <div class="sim-row"><span class="sim-label">Desconto à Vista (20%)</span><span class="sim-val" style="color:var(--accent)">- R$ ${desc.toFixed(2)}</span></div>
    <div class="sim-row total"><span class="sim-label">Valor a Pagar</span><span class="sim-val sim-val-strong">R$ ${final.toFixed(2)}</span></div>
    <p style="font-size:.8rem;color:var(--text-muted);margin-top:10px">Pagamento via Boleto ou PIX. Vencimento: 15/04/2026</p>`;
  }else{
    const n=parseInt(forma);const entrada=total*0.10;const restante=total-entrada;const parcela=restante/n;
    html=`<div class="sim-row"><span class="sim-label">Valor Total Atualizado</span><span class="sim-val">R$ ${total.toFixed(2)}</span></div>
    <div class="sim-row"><span class="sim-label">Entrada (10%)</span><span class="sim-val">R$ ${entrada.toFixed(2)}</span></div>
    <div class="sim-row"><span class="sim-label">Saldo Restante</span><span class="sim-val">R$ ${restante.toFixed(2)}</span></div>
    <div class="sim-row"><span class="sim-label">Número de Parcelas</span><span class="sim-val">${n}x</span></div>
    <div class="sim-row total"><span class="sim-label">Valor da Parcela</span><span class="sim-val sim-val-strong">R$ ${parcela.toFixed(2)}/mês</span></div>
    <p style="font-size:.8rem;color:var(--text-muted);margin-top:10px">1ª parcela (entrada): 15/04/2026 · Demais parcelas: dia 15 de cada mês</p>`;
  }
  document.getElementById('sim-result').innerHTML=html;
}
function formalizarAcordo(){
  const forma=document.getElementById('sim-forma');
  if(!forma){alert('Simule o acordo primeiro.');return}
  const tipo=forma.value;
  const total=1929.30;
  const descVista=0.20;
  let valorFinal,parcelas,valorParcela;
  if(tipo==='vista'){
    valorFinal=total*(1-descVista);parcelas=1;valorParcela=valorFinal;
  }else{
    parcelas=parseInt(tipo);const entrada=total*0.10;const rest=total-entrada;
    valorParcela=rest/parcelas;valorFinal=total;
  }
  const numAcordo='AC-'+new Date().getFullYear()+'-'+String(Math.floor(Math.random()*999)+1).padStart(3,'0');
  const modal=document.getElementById('modal-boleto');
  if(!modal)return;
  const barcode='85890000'+String(Math.floor(valorParcela*100)).padStart(11,'0')+'0'+new Date().getFullYear()+'0415'+String(Math.floor(Math.random()*9999999999)).padStart(10,'0');
  const pixCode='00020126580014BR.GOV.BCB.PIX0136'+crypto.randomUUID?crypto.randomUUID().replace(/-/g,'').slice(0,36):'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
  modal.querySelector('.modal').innerHTML=`
    <div class="modal-header"><h2>Acordo Formalizado</h2><button class="modal-close" onclick="closeModal('modal-boleto')">&times;</button></div>
    <div class="modal-body" style="text-align:center">
      <div style="background:var(--accent);color:#fff;padding:14px 20px;border-radius:10px;margin-bottom:18px;font-size:1rem">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" style="vertical-align:middle;margin-right:8px"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
        Acordo <strong>${numAcordo}</strong> formalizado com sucesso!
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;margin-bottom:16px;font-size:.85rem">
        <div><strong>Tipo:</strong> ${tipo==='vista'?'À Vista':'Parcelado '+parcelas+'x'}</div>
        <div><strong>Valor Total:</strong> R$ ${valorFinal.toFixed(2).replace('.',',')}</div>
        <div><strong>1ª Parcela:</strong> R$ ${valorParcela.toFixed(2).replace('.',',')}</div>
        <div><strong>Vencimento:</strong> 15/04/2026</div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:14px;margin-bottom:12px">
        <h3 style="font-size:.95rem;margin-bottom:10px">DAM — Documento de Arrecadação Municipal</h3>
        <div style="background:#f8f8f8;border:1px solid #ddd;border-radius:6px;padding:10px;font-family:monospace;font-size:.72rem;word-break:break-all;margin-bottom:8px">${barcode}</div>
        <button class="btn btn-sm btn-outline" onclick="navigator.clipboard.writeText('${barcode}');this.textContent='Copiado!';setTimeout(()=>this.textContent='Copiar Código',1500)">Copiar Código</button>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:14px">
        <h3 style="font-size:.95rem;margin-bottom:10px">Pagar com PIX</h3>
        <div style="width:160px;height:160px;margin:0 auto 10px;background:#fff;border:2px solid var(--accent);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:3rem">📱</div>
        <div style="background:#f0faf5;border:1px solid var(--accent);border-radius:6px;padding:8px;font-family:monospace;font-size:.68rem;word-break:break-all;margin-bottom:8px">${pixCode}</div>
        <button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText('${pixCode}');this.textContent='PIX Copiado!';setTimeout(()=>this.textContent='Copiar PIX',1500)">Copiar PIX</button>
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-sm btn-outline" onclick="addToGoogleCalendar('Vencimento Acordo ${numAcordo}','2026-04-15T09:00:00','Valor: R$ ${valorParcela.toFixed(2)}')">📅 Agenda</button>
        <button class="btn btn-sm btn-ghost" onclick="closeModal('modal-boleto')">Fechar</button>
      </div>
    </div>`;
  showModal('modal-boleto');
}

/* ── ITIV ── */
pages.itiv=()=>`<div class="module-page">
  <div class="page-header"><h1>ITIV Online</h1><p>Imposto sobre Transmissão Inter Vivos de Bens Imóveis.</p></div>
  <div class="info-banner">Informe os dados da transação imobiliária. O cálculo do ITIV será feito automaticamente.</div>
  <div class="card-panel"><div class="card-panel-header"><h3>Nova Solicitação</h3></div><div class="card-panel-body">
    <div class="filter-bar"><div class="form-group"><label>Inscrição Imobiliária</label><select class="form-select"><option>001.023.045.001</option><option>001.023.045.002</option><option>001.078.012.003</option></select></div><div class="form-group"><label>Valor da Transação (R$)</label><input class="form-input" placeholder="Ex: 350.000,00"></div><div class="form-group"><label>Tipo</label><select class="form-select"><option>Compra e Venda</option><option>Doação</option><option>Permuta</option></select></div></div>
    <div class="filter-bar"><div class="form-group"><label>CPF/CNPJ Comprador</label><input class="form-input" placeholder="000.000.000-00"></div><div class="form-group"><label>Nome Comprador</label><input class="form-input"></div></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost btn-sm">Limpar</button><button class="btn btn-primary btn-sm">Calcular ITIV</button></div>
  </div></div>
</div>`;

/* ── NFSe ── */
let nfseView='lista';
function getNFSes(){const s=localStorage.getItem('crc_nfses');return s?JSON.parse(s):[
  {num:'2026000001',data:'10/02/2026',tomador:'Alpha Serviços LTDA',cpfcnpj:'12.345.678/0001-90',servico:'07.02 - Engenharia',valor:4500.00,iss:225.00,status:'Emitida'},
  {num:'2026000002',data:'05/03/2026',tomador:'Beta Consulting ME',cpfcnpj:'98.765.432/0001-10',servico:'01.01 - Análise',valor:2800.00,iss:140.00,status:'Emitida'},
]}
function saveNFSes(n){localStorage.setItem('crc_nfses',JSON.stringify(n))}
function showNovaEmissaoNFSe(){nfseView='nova';navigate('nfse')}
function voltarListaNFSe(){nfseView='lista';navigate('nfse')}
function emitirNFSe(){
  const cpfcnpj=document.getElementById('nfse-cpfcnpj');
  const razao=document.getElementById('nfse-razao');
  const servico=document.getElementById('nfse-servico');
  const valor=document.getElementById('nfse-valor');
  const aliquota=document.getElementById('nfse-aliq');
  const desc=document.getElementById('nfse-desc');
  if(!cpfcnpj.value.trim()||!razao.value.trim()||servico.value==='Selecione...'||!valor.value.trim()||!desc.value.trim()){
    alert('Preencha todos os campos obrigatórios (*).');return;
  }
  const v=parseFloat(valor.value.replace(/[^\d,]/g,'').replace(',','.'));
  if(isNaN(v)||v<=0){alert('Valor inválido.');return}
  const a=parseFloat(aliquota.value.replace(/[^\d,]/g,'').replace(',','.'));
  const iss=v*(a/100);
  const notas=getNFSes();
  const num=new Date().getFullYear()+String(notas.length+1).padStart(6,'0');
  notas.unshift({num:num,data:new Date().toLocaleDateString('pt-BR'),tomador:razao.value.trim(),cpfcnpj:cpfcnpj.value.trim(),servico:servico.value,valor:v,iss:iss,status:'Emitida',descricao:desc.value.trim()});
  saveNFSes(notas);
  const modal=document.getElementById('modal-boleto');
  if(modal){
    modal.querySelector('.modal').innerHTML=`
    <div class="modal-header"><h2>NFSe Emitida</h2><button class="modal-close" onclick="closeModal('modal-boleto')">&times;</button></div>
    <div class="modal-body" style="text-align:center">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></div>
      <h3 style="margin-bottom:4px">NFSe ${num} emitida com sucesso!</h3>
      <p style="font-size:.84rem;color:var(--text-muted);margin-bottom:16px">Tomador: ${razao.value.trim()}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;font-size:.85rem;margin-bottom:16px">
        <div><strong>Valor:</strong> R$ ${v.toFixed(2).replace('.',',')}</div>
        <div><strong>ISS Retido:</strong> R$ ${iss.toFixed(2).replace('.',',')}</div>
        <div><strong>Serviço:</strong> ${servico.value}</div>
        <div><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-primary btn-sm" onclick="alert('PDF NFSe (integração pendente)');closeModal('modal-boleto')">Baixar PDF</button><button class="btn btn-ghost btn-sm" onclick="closeModal('modal-boleto');voltarListaNFSe()">Fechar</button></div>
    </div>`;
    showModal('modal-boleto');
  }
  nfseView='lista';
}
function cancelarNFSe(num){
  const motivo=prompt('Informe o motivo do cancelamento da NFSe '+num+':');
  if(!motivo)return;
  const notas=getNFSes();
  const n=notas.find(x=>x.num===num);
  if(n){n.status='Cancelada';n.motivoCancelamento=motivo;saveNFSes(notas);navigate('nfse')}
}
pages.nfse=()=>{
  if(nfseView==='nova'){
    return `<div class="module-page">
    <div class="page-header"><h1>Emitir Nova NFSe</h1><p>Preencha os dados do tomador e do serviço.</p></div>
    <button class="btn btn-ghost btn-sm" onclick="voltarListaNFSe()" style="margin-bottom:14px">\u2190 Voltar</button>
    <div class="card-panel"><div class="card-panel-header"><h3>Dados do Tomador</h3></div><div class="card-panel-body">
      <div class="filter-bar"><div class="form-group"><label>CPF/CNPJ Tomador *</label><input class="form-input" id="nfse-cpfcnpj" placeholder="000.000.000-00"></div><div class="form-group"><label>Razão Social / Nome *</label><input class="form-input" id="nfse-razao"></div><div class="form-group"><label>E-mail</label><input class="form-input" type="email" id="nfse-email"></div></div>
    </div></div>
    <div class="card-panel"><div class="card-panel-header"><h3>Dados do Serviço</h3></div><div class="card-panel-body">
      <div class="filter-bar"><div class="form-group"><label>Código Serviço *</label><select class="form-select" id="nfse-servico"><option>Selecione...</option><option>01.01 - Análise e desenvolvimento de sistemas</option><option>01.02 - Programação</option><option>01.03 - Processamento de dados</option><option>07.02 - Engenharia consultiva</option><option>17.01 - Assessoria contábil</option><option>17.02 - Auditoria</option><option>25.01 - Consultoria em TI</option></select></div><div class="form-group"><label>Valor do Serviço *</label><input class="form-input" id="nfse-valor" placeholder="R$ 0,00"></div><div class="form-group"><label>Alíquota ISS (%)</label><input class="form-input" id="nfse-aliq" value="5,00"></div></div>
      <div class="form-group"><label>Discriminação do Serviço *</label><textarea class="form-textarea" id="nfse-desc" rows="4" placeholder="Descreva detalhadamente o serviço prestado..."></textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px"><button class="btn btn-ghost btn-sm" onclick="voltarListaNFSe()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="emitirNFSe()">Emitir NFSe</button></div>
    </div></div>
  </div>`;
  }
  const notas=getNFSes();
  return `<div class="module-page">
  <div class="page-header"><h1>NFSe</h1><p>Notas Fiscais de Serviço Eletrônicas vinculadas ao seu cadastro.</p></div>
  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" onclick="showNovaEmissaoNFSe()">+ Emitir NFSe</button></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Notas Emitidas</h3></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Número</th><th>Data</th><th>Tomador</th><th>CPF/CNPJ</th><th>Serviço</th><th>Valor</th><th>ISS</th><th>Status</th><th>Ações</th></tr></thead><tbody>
    ${notas.map(n=>`<tr><td style="font-weight:700">${n.num}</td><td>${n.data}</td><td>${n.tomador}</td><td style="font-size:.8rem">${n.cpfcnpj}</td><td style="font-size:.8rem">${n.servico}</td><td>R$ ${n.valor.toFixed(2).replace('.',',')}</td><td>R$ ${n.iss.toFixed(2).replace('.',',')}</td><td><span class="status-badge ${n.status==='Emitida'?'green':'red'}">${n.status}</span></td><td class="table-actions">${n.status==='Emitida'?'<button class="table-action-btn primary">PDF</button><button class="table-action-btn" onclick="cancelarNFSe(\''+n.num+'\')">Cancelar</button>':'<span style="font-size:.78rem;color:var(--text-muted)">'+n.motivoCancelamento+'</span>'}</td></tr>`).join('')}
  </tbody></table></div></div>
</div>`};

/* ── FICHA CADASTRAL ── */
let fichaDetalhe=null;
const FICHAS_DATA={
  '001.023.045.001':{tipo:'imovel',inscricao:'001.023.045.001',proprietario:'Maria Fernanda de Oliveira Santos',cpf:'034.567.890-12',endereco:'Rua das Palmeiras, 234 — Centro',bairro:'Centro',cep:'42700-000',cidade:'Lauro de Freitas',uf:'BA',area_terreno:'360,00 m²',area_construida:'180,00 m²',valor_venal:'R$ 285.000,00',uso:'Residencial',padrao:'Médio',ano_construcao:'2012',tipo_logradouro:'Rua',lote:'045',quadra:'023',setor:'001'},
  '001.023.045.002':{tipo:'imovel',inscricao:'001.023.045.002',proprietario:'Maria Fernanda de Oliveira Santos',cpf:'034.567.890-12',endereco:'Av. Oceânica, 890 — Vilas do Atlântico',bairro:'Vilas do Atlântico',cep:'42700-100',cidade:'Lauro de Freitas',uf:'BA',area_terreno:'500,00 m²',area_construida:'320,00 m²',valor_venal:'R$ 680.000,00',uso:'Residencial',padrao:'Alto',ano_construcao:'2018',tipo_logradouro:'Avenida',lote:'012',quadra:'078',setor:'001'},
  '001.078.012.003':{tipo:'imovel',inscricao:'001.078.012.003',proprietario:'Maria Fernanda de Oliveira Santos',cpf:'034.567.890-12',endereco:'Rua dos Coqueiros, 56 — Portão',bairro:'Portão',cep:'42700-200',cidade:'Lauro de Freitas',uf:'BA',area_terreno:'250,00 m²',area_construida:'120,00 m²',valor_venal:'R$ 180.000,00',uso:'Comercial',padrao:'Simples',ano_construcao:'2005',tipo_logradouro:'Rua',lote:'012',quadra:'078',setor:'001'},
  'EMP-2024-00345':{tipo:'empresa',inscricao:'EMP-2024-00345',razao_social:'Empresa Alpha Comércio LTDA',cnpj:'12.345.678/0001-90',nome_fantasia:'Alpha Comércio',atividade_principal:'47.12-1-00 — Comércio varejista',regime_tributario:'Simples Nacional',situacao:'Ativa',data_abertura:'15/03/2018',endereco:'Av. Santos Dumont, 456 — Centro',bairro:'Centro',cep:'42700-000',cidade:'Lauro de Freitas',uf:'BA',responsavel:'Maria Fernanda de Oliveira Santos',cpf_responsavel:'034.567.890-12'},
  'EMP-2025-00120':{tipo:'empresa',inscricao:'EMP-2025-00120',razao_social:'Beta Serviços ME',cnpj:'98.765.432/0001-10',nome_fantasia:'Beta Serviços',atividade_principal:'62.01-5-01 — Desenvolvimento de software',regime_tributario:'Simples Nacional',situacao:'Ativa',data_abertura:'01/02/2025',endereco:'Rua da Tecnologia, 12 — Sala 3 — Centro',bairro:'Centro',cep:'42700-050',cidade:'Lauro de Freitas',uf:'BA',responsavel:'Maria Fernanda de Oliveira Santos',cpf_responsavel:'034.567.890-12'}
};
function verFicha(inscricao){fichaDetalhe=inscricao;navigate('ficha_cadastral')}
function voltarFichaLista(){fichaDetalhe=null;navigate('ficha_cadastral')}
function solicitarRetificacao(inscricao){
  protocoloView='novo';
  navigate('protocolo');
  setTimeout(()=>{
    const tipo=document.getElementById('prot-tipo');if(tipo)tipo.value='Retificação Cadastral';
    const insc=document.getElementById('prot-inscricao');if(insc)insc.value=inscricao;
    const assunto=document.getElementById('prot-assunto');if(assunto)assunto.value='Retificação cadastral — Inscrição '+inscricao;
  },100);
}
function renderFichaImovel(f){
  const campos=[['Inscrição',f.inscricao],['Proprietário',f.proprietario],['CPF',f.cpf],['Endereço',f.endereco],['Bairro',f.bairro],['CEP',f.cep],['Cidade/UF',f.cidade+'/'+f.uf],['Setor/Quadra/Lote',f.setor+' / '+f.quadra+' / '+f.lote],['Tipo Logradouro',f.tipo_logradouro],['Área Terreno',f.area_terreno],['Área Construída',f.area_construida],['Valor Venal',f.valor_venal],['Uso',f.uso],['Padrão Construtivo',f.padrao],['Ano Construção',f.ano_construcao]];
  return campos.map(([label,val])=>`<div class="ficha-campo"><span class="ficha-campo-label">${label}</span><span class="ficha-campo-valor">${val}</span></div>`).join('');
}
function renderFichaEmpresa(f){
  const campos=[['Inscrição',f.inscricao],['Razão Social',f.razao_social],['CNPJ',f.cnpj],['Nome Fantasia',f.nome_fantasia],['Atividade Principal',f.atividade_principal],['Regime Tributário',f.regime_tributario],['Situação',f.situacao],['Data Abertura',f.data_abertura],['Endereço',f.endereco],['Bairro',f.bairro],['CEP',f.cep],['Cidade/UF',f.cidade+'/'+f.uf],['Responsável',f.responsavel],['CPF Responsável',f.cpf_responsavel]];
  return campos.map(([label,val])=>`<div class="ficha-campo"><span class="ficha-campo-label">${label}</span><span class="ficha-campo-valor">${val}</span></div>`).join('');
}
async function baixarFichaCadastralPdf(inscricao){
  const f=FICHAS_DATA[inscricao];
  if(!f){alert('Ficha não encontrada.');return;}
  const r=await fetch('/api/v1/ficha-cadastral/pdf',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...f,entidade:getEntidadePayloadForApi()})
  });
  const payload=await r.json();
  if(!r.ok){alert(payload.erro||'Falha ao gerar PDF da ficha.');return;}
  window.open(payload.urlDownload,'_blank');
}
pages.ficha_cadastral=()=>{
  if(fichaDetalhe&&FICHAS_DATA[fichaDetalhe]){
    const f=FICHAS_DATA[fichaDetalhe];
    return `<div class="module-page">
    <div class="page-header"><h1>Ficha Cadastral — ${f.inscricao}</h1><p>${f.tipo==='imovel'?f.endereco:f.razao_social}</p></div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="voltarFichaLista()">← Voltar</button>
      <button class="btn btn-outline btn-sm" onclick="solicitarRetificacao('${f.inscricao}')">Solicitar Retificação</button>
      <button class="btn btn-outline btn-sm" onclick="baixarFichaCadastralPdf('${f.inscricao}')">Imprimir Ficha</button>
    </div>
    <div class="card-panel"><div class="card-panel-header"><h3>${f.tipo==='imovel'?'Dados do Imóvel':'Dados da Empresa'}</h3><span class="status-badge ${f.tipo==='imovel'?'blue':'orange'}">${f.tipo==='imovel'?'Imóvel':'Empresa'}</span></div>
    <div class="card-panel-body"><div class="ficha-grid">${f.tipo==='imovel'?renderFichaImovel(f):renderFichaEmpresa(f)}</div></div></div>
    <div class="info-banner" style="margin-top:16px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Algum dado incorreto? Clique em <strong>"Solicitar Retificação"</strong> para abrir um protocolo de correção. É necessário anexar comprovante e assinar via Gov.BR.</div>
  </div>`;
  }
  return `<div class="module-page">
  <div class="page-header"><h1>Ficha Cadastral</h1><p>Consulte dados cadastrais de imóveis e empresas vinculados ao seu CPF.</p></div>
  <div class="info-banner">Selecione a inscrição para visualizar a ficha completa. Caso algum dado esteja errado, você pode solicitar retificação.</div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Inscrição</th><th>Tipo</th><th>Endereço / Razão Social</th><th>Área/Atividade</th><th>Ação</th></tr></thead><tbody>
    <tr><td style="font-weight:700">001.023.045.001</td><td><span class="status-badge blue">Imóvel</span></td><td>Rua das Palmeiras, 234 — Centro</td><td>180m²</td><td class="table-actions"><button class="table-action-btn primary" onclick="verFicha('001.023.045.001')">Ver Ficha</button><button class="table-action-btn" onclick="solicitarRetificacao('001.023.045.001')">Retificar</button></td></tr>
    <tr><td style="font-weight:700">001.023.045.002</td><td><span class="status-badge blue">Imóvel</span></td><td>Av. Oceânica, 890 — Vilas do Atlântico</td><td>320m²</td><td class="table-actions"><button class="table-action-btn primary" onclick="verFicha('001.023.045.002')">Ver Ficha</button><button class="table-action-btn" onclick="solicitarRetificacao('001.023.045.002')">Retificar</button></td></tr>
    <tr><td style="font-weight:700">001.078.012.003</td><td><span class="status-badge blue">Imóvel</span></td><td>Rua dos Coqueiros, 56 — Portão</td><td>120m²</td><td class="table-actions"><button class="table-action-btn primary" onclick="verFicha('001.078.012.003')">Ver Ficha</button><button class="table-action-btn" onclick="solicitarRetificacao('001.078.012.003')">Retificar</button></td></tr>
    <tr><td style="font-weight:700">EMP-2024-00345</td><td><span class="status-badge orange">Empresa</span></td><td>Empresa Alpha Comércio LTDA</td><td>Comércio Varejista</td><td class="table-actions"><button class="table-action-btn primary" onclick="verFicha('EMP-2024-00345')">Ver Ficha</button><button class="table-action-btn" onclick="solicitarRetificacao('EMP-2024-00345')">Retificar</button></td></tr>
    <tr><td style="font-weight:700">EMP-2025-00120</td><td><span class="status-badge orange">Empresa</span></td><td>Beta Serviços ME</td><td>Desenvolvimento de software</td><td class="table-actions"><button class="table-action-btn primary" onclick="verFicha('EMP-2025-00120')">Ver Ficha</button><button class="table-action-btn" onclick="solicitarRetificacao('EMP-2025-00120')">Retificar</button></td></tr>
  </tbody></table></div></div>
</div>`};

/* ── AUTENTICAÇÃO ── */
async function verificarCertidao(){
  const input=document.getElementById('auth-codigo');
  if(!input||!input.value.trim()){alert('Informe o código de autenticação.');return}
  const codigo=input.value.trim().toUpperCase();
  const resultado=document.getElementById('auth-resultado');
  const resp=await fetch('/api/v1/documentos/autenticar/'+encodeURIComponent(codigo));
  if(resp.ok){
    const cert=await resp.json();
    const dtVal=new Date(cert.validade);
    const vigente=dtVal>=new Date();
    resultado.innerHTML=`
    <div style="text-align:center;padding:20px 0">
      <div style="width:64px;height:64px;border-radius:50%;background:${vigente?'var(--accent)':'var(--danger)'};display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">${vigente?'<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>':'<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}</svg>
      </div>
      <h3 style="color:${vigente?'var(--accent)':'var(--danger)'};margin-bottom:4px">${vigente?'CERTIDÃO VÁLIDA':'CERTIDÃO EXPIRADA'}</h3>
      <p style="font-size:.84rem;color:var(--text-muted);margin-bottom:16px">Código: ${codigo}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.85rem">
      <div><strong>Tipo:</strong> ${cert.tipo}</div>
      <div><strong>CPF/CNPJ:</strong> ${cert.inscricao}</div>
      <div><strong>Nome:</strong> ${cert.titular}</div>
      <div><strong>Situação:</strong> ${cert.valida?'Documento autenticado':'Inválido'}</div>
      <div><strong>Emissão:</strong> ${new Date(cert.emissao).toLocaleString('pt-BR')}</div>
      <div><strong>Validade:</strong> <span style="color:${vigente?'var(--accent)':'var(--danger)'}; font-weight:700">${new Date(cert.validade).toLocaleDateString('pt-BR')}</span></div>
    </div>
    <div style="margin-top:12px;text-align:center"><button class="btn btn-outline btn-sm" onclick="window.open('${cert.urlOriginal}','_blank')">Abrir PDF Original</button></div>`;
  }else{
    resultado.innerHTML=`
    <div style="text-align:center;padding:20px 0">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--danger);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <h3 style="color:var(--danger);margin-bottom:4px">CERTIDÃO NÃO ENCONTRADA</h3>
      <p style="font-size:.84rem;color:var(--text-muted)">O código informado não corresponde a nenhuma certidão emitida por este portal. Verifique o código e tente novamente.</p>
    </div>`;
  }
}
pages.autenticacao=()=>`<div class="module-page">
  <div class="page-header"><h1>Autenticação de Certidão</h1><p>Valide a autenticidade de uma certidão emitida pelo portal.</p></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Verificar Certidão</h3></div><div class="card-panel-body">
    <div class="filter-bar"><div class="form-group"><label>Código de Autenticação</label><input class="form-input" id="auth-codigo" placeholder="Ex: CERT-2026-XXXXX-XXXXX" onkeypress="if(event.key==='Enter')verificarCertidao()"></div><button class="btn btn-primary btn-sm" onclick="verificarCertidao()">Verificar</button></div>
    <p style="font-size:.84rem;color:var(--text-muted);margin-top:8px">Insira o código que aparece no rodapé da certidão emitida para confirmar sua validade.</p>
    <div id="auth-resultado" style="margin-top:16px"></div>
  </div></div>
  <div class="info-banner" style="margin-top:14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Use o código exibido no documento emitido para validação oficial da autenticidade.</div>
</div>`;

/* ── LEGISLAÇÃO ── */
const LEGISLACAO_TRIBUTARIA_DATA=[
  {tipo:'Lei',numero:'1.572/2015',ementa:'Código Tributário e de Rendas do Município (CTM/CTN Municipal)',data:'26/08/2015',url:'https://sefaz.laurodefreitas.ba.gov.br/legislacao/leis.php'},
  {tipo:'Lei',numero:'1.958/2021',ementa:'Altera dispositivos do Código Tributário Municipal',data:'28/09/2021',url:'https://cmlf.ba.gov.br/legislacoes-e-atos/leis-municipais/lei-municipal-n%C2%BA-1958-de-28-de-setembro-de-2021'},
  {tipo:'Lei',numero:'2.017/2022',ementa:'Atualizações no regime tributário municipal',data:'2022',url:'https://sefaz.laurodefreitas.ba.gov.br/legislacao/leis.php'},
  {tipo:'Lei',numero:'2.052/2023',ementa:'Alterações complementares na legislação tributária',data:'19/06/2023',url:'https://www.cmlf.ba.gov.br/legislacoes-e-atos/leis-municipais/lei-municipal-n%C2%BA-2052-de-19-de-junho-de-2023'},
  {tipo:'Decreto',numero:'5.275/2023',ementa:'Regulamentação tributária complementar',data:'2023',url:'https://sefaz.laurodefreitas.ba.gov.br/legislacao/arquivos/decreto_5275_2023.pdf'},
  {tipo:'Portal SEFAZ',numero:'Acervo Oficial',ementa:'Repositório de leis, decretos, portarias e atos fiscais vigentes',data:'Atualizado',url:'https://sefaz.laurodefreitas.ba.gov.br/legislacao/leis.php'}
];
function abrirLegislacao(url){if(!url){alert('Link não disponível para este item.');return;}window.open(url,'_blank');}
pages.legislacao=()=>`<div class="module-page">
  <div class="page-header"><h1>Legislação</h1><p>Leis do CTM/CTN Municipal e normas tributárias relacionadas de Lauro de Freitas.</p></div>
  <div class="info-banner" style="margin-bottom:12px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Lista prioriza o <strong>Código Tributário Municipal (Lei 1.572/2015)</strong> e leis correlatas. Para consolidação oficial, use também o acervo da SEFAZ/Câmara.</div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0"><table class="data-table"><thead><tr><th>Tipo</th><th>Número</th><th>Ementa</th><th>Data</th><th>Ação</th></tr></thead><tbody>
    ${LEGISLACAO_TRIBUTARIA_DATA.map((l)=>`<tr><td><span class="status-badge ${l.tipo==='Lei'?'blue':l.tipo==='Decreto'?'orange':'gray'}">${l.tipo}</span></td><td>${l.numero}</td><td>${l.ementa}</td><td>${l.data}</td><td><button class="table-action-btn primary" onclick="abrirLegislacao('${l.url}')">Abrir PDF</button></td></tr>`).join('')}
  </tbody></table></div></div>
</div>`;

/* ── PROCURAÇÃO ── */
let procuracaoView='lista';
const DEFAULT_PROCURACOES=[
  {id:1,status:'ativa',cpf:'045.678.901-23',nome:'João Carlos',vigencia:'31/12/2026',sistemas:['nfse','tributos'],tipo:'outorgada'},
  {id:2,status:'expirada',cpf:'012.345.678-90',nome:'Ana Paula',vigencia:'30/06/2025',sistemas:['certidoes'],tipo:'outorgada'},
  {id:3,status:'ativa',cpf:'078.901.234-56',nome:'Carlos Eduardo Silva',vigencia:'31/12/2026',sistemas:['certidoes','tributos','segunda_via','extrato_divida'],tipo:'recebida'}
];
function getVigenciaFimDate(vigencia){
  const txt=String(vigencia||'').trim();
  const m=txt.match(/(\d{2})\/(\d{2})\/(\d{4})(?!.*\d{2}\/\d{2}\/\d{4})/);
  if(!m)return null;
  const [,d,mo,y]=m;
  return new Date(Number(y),Number(mo)-1,Number(d),23,59,59,999);
}
function normalizeProcuracoes(rawList){
  const list=Array.isArray(rawList)?rawList:[];
  return list.map((p,idx)=>{
    const sistemas=Array.isArray(p?.sistemas)?p.sistemas.filter(Boolean):[];
    const tipo=(p?.tipo==='recebida'||p?.tipo==='outorgada')?p.tipo:'outorgada';
    const nome=String(p?.nome||'').trim()||'Sem nome';
    const cpf=String(p?.cpf||'').trim()||'—';
    const vigencia=String(p?.vigencia||'').trim()||'—';
    let status=String(p?.status||'').toLowerCase();
    if(!['ativa','expirada','revogada'].includes(status)) status='ativa';
    if(status==='ativa'){
      const fim=getVigenciaFimDate(vigencia);
      if(fim&&fim<new Date()) status='expirada';
    }
    return {
      ...p,
      id:p?.id||Date.now()+idx,
      tipo,
      nome,
      cpf,
      vigencia,
      sistemas,
      status
    };
  });
}
function getProcuracoes(){
  try{
    const raw=JSON.parse(localStorage.getItem('crc_procuracoes'));
    const base=(Array.isArray(raw)&&raw.length)?raw:DEFAULT_PROCURACOES;
    const normalized=normalizeProcuracoes(base);
    localStorage.setItem('crc_procuracoes',JSON.stringify(normalized));
    return normalized;
  }catch(e){
    const fallback=normalizeProcuracoes(DEFAULT_PROCURACOES);
    localStorage.setItem('crc_procuracoes',JSON.stringify(fallback));
    return fallback;
  }
}
function saveProcuracoes(p){localStorage.setItem('crc_procuracoes',JSON.stringify(p))}
function getProcuradorAtivo(){try{return JSON.parse(localStorage.getItem('crc_procurador_ativo'))||null}catch(e){return null}}
function setProcuradorAtivo(p){
  if(p)localStorage.setItem('crc_procurador_ativo',JSON.stringify(p));
  else localStorage.removeItem('crc_procurador_ativo');
  updateProcuradorBadge();
  applySidebarProcurador();
}
function updateProcuradorBadge(){
  const p=getProcuradorAtivo();
  const badge=document.getElementById('procurador-badge');
  const topName=document.querySelector('.topbar-username');
  const sideUser=document.getElementById('sidebar-username');
  const sideLevel=document.querySelector('.user-level');
  if(p){
    if(badge){badge.style.display='flex';badge.querySelector('.proc-badge-name').textContent='Perfil: '+p.outorgante_nome}
    if(topName)topName.textContent=p.outorgante_nome;
    if(sideUser)sideUser.textContent=p.outorgante_nome;
    if(sideLevel)sideLevel.textContent='Procurador';
  }else{
    if(badge)badge.style.display='none';
    if(currentUserType==='contribuinte'){
      const c=getContribuinteLogado();
      const nome=c?c.nome.split(' ').slice(0,2).join(' '):'Contribuinte';
      if(topName)topName.textContent=nome;
      if(sideUser)sideUser.textContent=nome;
      if(sideLevel)sideLevel.textContent='Gov.BR '+(c?c.govbr:'');
    }
  }
}
function applySidebarProcurador(){
  const p=getProcuradorAtivo();
  const navItems=document.querySelectorAll('#sidebar-nav .nav-item[data-page]');
  const alwaysVisible=['dashboard','perfil','faq'];
  navItems.forEach(item=>{
    const pg=item.dataset.page;
    if(!pg)return;
    if(p){
      if(alwaysVisible.includes(pg)||p.sistemas.includes(pg)){
        item.style.display='';
      }else{
        item.style.display='none';
      }
    }else{
      item.style.display='';
    }
  });
  const sections=document.querySelectorAll('#sidebar-nav .nav-section');
  sections.forEach(sec=>{
    let next=sec.nextElementSibling;
    let hasVisible=false;
    while(next&&!next.classList.contains('nav-section')){
      if(next.classList.contains('nav-item')&&next.style.display!=='none')hasVisible=true;
      next=next.nextElementSibling;
    }
    sec.style.display=hasVisible?'':'none';
  });
}
function logProcurador(acao,detalhes){
  const p=getProcuradorAtivo();if(!p)return;
  const logs=getProcLogs();
  logs.unshift({
    ts:new Date().toISOString(),
    data:new Date().toLocaleString('pt-BR'),
    procurador:p.procurador_nome||'—',
    procurador_cpf:p.procurador_cpf||'—',
    outorgante:p.outorgante_nome||'—',
    outorgante_cpf:p.outorgante_cpf||'—',
    acao:acao,
    detalhes:detalhes||''
  });
  if(logs.length>500)logs.length=500;
  localStorage.setItem('crc_proc_logs',JSON.stringify(logs));
}
function getProcLogs(){try{return JSON.parse(localStorage.getItem('crc_proc_logs'))||[]}catch(e){return[]}}
async function ativarProcurador(id){
  const procs=getProcuracoes().filter(p=>p.tipo==='recebida'&&p.status==='ativa');
  const proc=procs.find(p=>p.id===id);
  if(!proc){alert('Procuração não encontrada.');return}
  const ok=await showSystemConfirm('Você irá acessar o portal como procurador de '+proc.nome+'.\nVocê terá acesso APENAS aos módulos autorizados:\n\n'+proc.sistemas.map(s=>PROC_MODULOS[s]||s).join(', ')+'\n\nDeseja continuar?','info');
  if(!ok)return;
  const outorgante=getOutorganteData();
  setProcuradorAtivo({
    id:proc.id,
    outorgante_cpf:proc.cpf,
    outorgante_nome:proc.nome,
    procurador_nome:outorgante.nome,
    procurador_cpf:outorgante.cpf,
    sistemas:proc.sistemas
  });
  logProcurador('ATIVOU_PERFIL','Acessou como procurador. Módulos: '+proc.sistemas.map(s=>PROC_MODULOS[s]||s).join(', '));
  navigate('dashboard');
}
function desativarProcurador(){
  logProcurador('DESATIVOU_PERFIL','Voltou ao perfil próprio');
  setProcuradorAtivo(null);
  navigate('dashboard');
}
function showNovaProcuracao(){procuracaoView='nova';navigate('procuracao')}
function voltarListaProcuracao(){procuracaoView='lista';navigate('procuracao')}
function salvarNovaProcuracao(){
  const cpf=document.getElementById('proc-cpf')?.value.trim();
  const nome=document.getElementById('proc-nome')?.value.trim();
  const vigencia=document.getElementById('proc-vigencia')?.value;
  if(!cpf||!nome||!vigencia){alert('Preencha CPF, nome e vigência.');return}
  const sistemas=[];
  document.querySelectorAll('#proc-sistemas input:checked').forEach(cb=>sistemas.push(cb.value));
  if(sistemas.length===0){alert('Selecione ao menos um sistema.');return}
  const procs=getProcuracoes();
  procs.push({id:Date.now(),status:'ativa',cpf,nome,vigencia,sistemas,tipo:'outorgada'});
  saveProcuracoes(procs);
  alert('Procuração criada! Será validada com assinatura Gov.BR.');
  procuracaoView='lista';navigate('procuracao');
}
function visualizarProcuracao(id){
  const proc=getProcuracoes().find((p)=>p.id===id);
  if(!proc){alert('Procuração não encontrada.');return;}
  const modal=document.getElementById('modal-boleto');
  if(!modal)return;
  modal.querySelector('.modal').innerHTML=`
    <div class="modal-header"><h2>Detalhes da Procuração</h2><button class="modal-close" onclick="closeModal('modal-boleto')">&times;</button></div>
    <div class="modal-body">
      <div class="grid-2-gap8" style="font-size:.85rem">
        <div><strong>Status:</strong> ${proc.status}</div>
        <div><strong>Tipo:</strong> ${proc.tipo}</div>
        <div><strong>Nome:</strong> ${proc.nome}</div>
        <div><strong>CPF/CNPJ:</strong> ${proc.cpf}</div>
        <div><strong>Vigência:</strong> ${proc.vigencia}</div>
        <div><strong>Módulos:</strong> ${(proc.sistemas||[]).map(s=>PROC_MODULOS[s]||s).join(', ')||'—'}</div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-ghost btn-sm" onclick="closeModal('modal-boleto')">Fechar</button></div>`;
  showModal('modal-boleto');
}
async function cancelarProcuracao(id){
  const ok=await showSystemConfirm('Revogar esta procuração?','error');
  if(!ok)return;
  const procs=getProcuracoes().map(p=>p.id===id?{...p,status:'revogada'}:p);
  saveProcuracoes(procs);navigate('procuracao');
}
const PROC_MODULOS={certidoes:'Certidões',alvara:'Alvará',segunda_via:'2ª Via',extrato_divida:'Extrato Dívida',tributos:'Tributos',acordo:'Acordo da Dívida',itiv:'ITIV',nfse:'NFSe',ficha_cadastral:'Ficha Cadastral',protocolo:'Protocolo',dec:'Domicílio Eletrônico',caixa_postal:'Caixa Postal'};
const PROC_ICONES={certidoes:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',alvara:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/>',segunda_via:'<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',extrato_divida:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',tributos:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',acordo:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',itiv:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',nfse:'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',ficha_cadastral:'<rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/>',protocolo:'<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>',dec:'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',caixa_postal:'<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>'};
function getOutorganteData(){
  if(currentUserType==='admin'){
    const users=getAdminUsers();
    const u=users.find(x=>x.login===currentAdminLogin);
    return{nome:u?u.nome:'Administrador',cpf:u?u.login:'admin',email:u?u.email:'',endereco:'',tipo:'admin'};
  }
  const c=getContribuinteLogado();
  return{nome:c.nome,cpf:c.cpf,email:c.email||'',endereco:(c.endereco||'')+' — '+(c.bairro||'')+' — '+(c.cidade||'')+'/'+(c.uf||''),tipo:'contribuinte'};
}
pages.procuracao=()=>{
  if(procuracaoView==='nova')return pages._procuracao_nova();
  const procs=getProcuracoes();
  const outorgadas=procs.filter(p=>p.tipo==='outorgada');
  const recebidas=procs.filter(p=>p.tipo==='recebida');
  const outorgadasAtivas=outorgadas.filter(p=>p.status==='ativa').length;
  const recebidasAtivas=recebidas.filter(p=>p.status==='ativa').length;
  const procAtivo=getProcuradorAtivo();
  const statusBadge={ativa:'green',expirada:'gray',revogada:'red'};
  return `<div class="module-page">
  <div class="page-header"><h1>Procuração Eletrônica</h1><p>Outorgue poderes ou acesse o portal como procurador de outra pessoa.</p></div>
  <div class="info-banner warning"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Procurações são validadas via <strong>assinatura Gov.BR</strong> (nível Ouro ou certificado digital).</div>
  <div class="grid-2-gap14" style="margin-bottom:14px">
    <div class="card-panel" style="margin-bottom:0"><div class="card-panel-body" style="padding:12px 14px"><div style="font-size:.74rem;color:var(--text-muted)">Outorgadas ativas</div><div style="font-size:1.25rem;font-weight:800;color:var(--accent)">${outorgadasAtivas}</div></div></div>
    <div class="card-panel" style="margin-bottom:0"><div class="card-panel-body" style="padding:12px 14px"><div style="font-size:.74rem;color:var(--text-muted)">Recebidas ativas</div><div style="font-size:1.25rem;font-weight:800;color:var(--accent)">${recebidasAtivas}</div></div></div>
  </div>

  ${procAtivo?`<div class="info-banner" style="margin-bottom:16px;background:var(--orange-light);border-color:var(--orange);color:var(--orange)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><strong>Acessando como procurador de: ${procAtivo.nome}</strong> — <a href="#" onclick="desativarProcurador();return false" style="color:var(--danger);font-weight:700;margin-left:8px">Voltar ao meu perfil</a></div>`:''}

  <div class="card-panel" style="margin-bottom:16px"><div class="card-panel-header"><h3>Procurações Outorgadas (que dei)</h3><button class="btn btn-sm btn-primary" onclick="showNovaProcuracao()">+ Nova Procuração</button></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Status</th><th>Procurador</th><th>CPF</th><th>Vigência</th><th>Sistemas</th><th>Ações</th></tr></thead><tbody>
    ${outorgadas.length?outorgadas.map(p=>`<tr><td><span class="status-badge ${statusBadge[p.status]||'gray'}">${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span></td><td style="font-weight:600">${p.nome}</td><td>${p.cpf}</td><td>${p.vigencia}</td><td>${p.sistemas.map(s=>PROC_MODULOS[s]||s).join(', ')}</td><td class="table-actions"><button class="table-action-btn" onclick="visualizarProcuracao(${p.id})">Visualizar</button>${p.status==='ativa'?`<button class="table-action-btn" onclick="cancelarProcuracao(${p.id})">Revogar</button>`:''}</td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">Nenhuma procuração outorgada</td></tr>'}
  </tbody></table></div></div>

  <div class="card-panel"><div class="card-panel-header"><h3>Procurações Recebidas (que recebi)</h3></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Status</th><th>Outorgante</th><th>CPF</th><th>Vigência</th><th>Sistemas</th><th>Ações</th></tr></thead><tbody>
    ${recebidas.length?recebidas.map(p=>`<tr><td><span class="status-badge ${statusBadge[p.status]||'gray'}">${p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span></td><td style="font-weight:600">${p.nome}</td><td>${p.cpf}</td><td>${p.vigencia}</td><td>${p.sistemas.map(s=>PROC_MODULOS[s]||s).join(', ')}</td><td class="table-actions"><button class="table-action-btn" onclick="visualizarProcuracao(${p.id})">Visualizar</button>${p.status==='ativa'?`<button class="table-action-btn primary" onclick="ativarProcurador(${p.id})">Acessar como</button>`:''}</td></tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">Nenhuma procuração recebida</td></tr>'}
  </tbody></table></div></div>
</div>`;
};
let procDadosRF=null;
let procTipoDoc='';
async function consultarProcurador(){
  const doc=document.getElementById('proc-cpf-cnpj')?.value.replace(/\D/g,'')||'';
  const statusEl=document.getElementById('proc-consulta-status');
  const dadosEl=document.getElementById('proc-dados-rf');
  if(!doc){alert('Digite o CPF ou CNPJ do procurador.');return}
  procDadosRF=null;procTipoDoc='';
  if(dadosEl)dadosEl.innerHTML='';
  if(statusEl)statusEl.innerHTML='<span style="color:var(--orange)">Consultando Receita Federal...</span>';
  try{
    if(doc.length===14){
      procTipoDoc='cnpj';
      const resp=await fetch('/api/consulta-cnpj/'+doc);
      const data=await resp.json();
      if(data.erro){if(statusEl)statusEl.innerHTML='<span style="color:var(--danger)">'+data.erro+'</span>';return}
      procDadosRF=data;
      document.getElementById('proc-nome').value=data.razao_social;
      document.getElementById('proc-email').value=data.email||'';
      if(statusEl)statusEl.innerHTML='<span style="color:var(--accent);font-weight:600">✓ CNPJ encontrado — '+data.situacao_cadastral+'</span>';
      if(dadosEl)dadosEl.innerHTML=`
        <div class="card-panel" style="margin-top:12px;margin-bottom:0"><div class="card-panel-header"><h3>Dados da Receita Federal (CNPJ)</h3><span class="status-badge green">${data.situacao_cadastral}</span></div>
        <div class="card-panel-body"><div class="ficha-grid">
          <div class="ficha-campo"><span class="ficha-campo-label">CNPJ</span><span class="ficha-campo-valor">${data.cnpj}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Razão Social</span><span class="ficha-campo-valor">${data.razao_social}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Nome Fantasia</span><span class="ficha-campo-valor">${data.nome_fantasia||'—'}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">CNAE</span><span class="ficha-campo-valor">${data.cnae_codigo} — ${data.cnae_principal}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Natureza Jurídica</span><span class="ficha-campo-valor">${data.natureza_juridica||'—'}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Porte</span><span class="ficha-campo-valor">${data.porte||'—'}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Endereço</span><span class="ficha-campo-valor">${data.logradouro}, ${data.numero}${data.complemento?' — '+data.complemento:''}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Bairro</span><span class="ficha-campo-valor">${data.bairro}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Município/UF</span><span class="ficha-campo-valor">${data.municipio}/${data.uf}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">CEP</span><span class="ficha-campo-valor">${data.cep}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Telefone</span><span class="ficha-campo-valor">${data.telefone||'—'}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">E-mail</span><span class="ficha-campo-valor">${data.email||'—'}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Capital Social</span><span class="ficha-campo-valor">R$ ${(data.capital_social||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></div>
          <div class="ficha-campo"><span class="ficha-campo-label">Início Atividade</span><span class="ficha-campo-valor">${data.data_inicio_atividade||'—'}</span></div>
        </div></div></div>
        ${data.socios&&data.socios.length?`<div class="card-panel" style="margin-top:12px;margin-bottom:0"><div class="card-panel-header"><h3>Quadro Societário</h3></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Qualificação</th></tr></thead><tbody>${data.socios.map(s=>`<tr><td style="font-weight:600">${s.nome}</td><td>${s.cpf_cnpj||'—'}</td><td>${s.qualificacao||'—'}</td></tr>`).join('')}</tbody></table></div></div>`:''}`;
    }else if(doc.length===11){
      procTipoDoc='cpf';
      const resp=await fetch('/api/consulta-cpf/'+doc);
      const data=await resp.json();
      procDadosRF=data;
      if(statusEl)statusEl.innerHTML='<span style="color:var(--orange);font-weight:600">CPF válido — Nome completo será preenchido após assinatura Gov.BR</span>';
      if(dadosEl)dadosEl.innerHTML=`<div class="info-banner" style="margin-top:12px;background:var(--orange-light);border-color:var(--orange);color:var(--orange)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Sem integração InfoJud. O nome do procurador deverá ser preenchido manualmente. Após assinatura Gov.BR, os dados serão validados automaticamente.</div>`;
    }else{
      if(statusEl)statusEl.innerHTML='<span style="color:var(--danger)">Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.</span>';
    }
  }catch(err){
    if(statusEl)statusEl.innerHTML='<span style="color:var(--danger)">Erro de conexão. Verifique sua internet e tente novamente.</span>';
  }
}
async function assinarEGerarPDF(){
  const cpfCnpj=document.getElementById('proc-cpf-cnpj')?.value.trim();
  const nome=document.getElementById('proc-nome')?.value.trim();
  const email=document.getElementById('proc-email')?.value.trim();
  const dtInicio=document.getElementById('proc-dt-inicio')?.value;
  const dtFim=document.getElementById('proc-dt-fim')?.value;
  if(!cpfCnpj||!nome){alert('Preencha CPF/CNPJ e nome do procurador.');return}
  if(!dtInicio||!dtFim){alert('Informe a data de início e fim da vigência.');return}
  const inicio=new Date(dtInicio);const fim=new Date(dtFim);
  if(fim<=inicio){alert('A data final deve ser posterior à data de início.');return}
  const diffDays=(fim-inicio)/(1000*60*60*24);
  if(diffDays>366){alert('A vigência máxima é de 1 ano (365 dias). Reduza o período.');return}
  const sistemas=[];
  document.querySelectorAll('.proc-mod-card.selected').forEach(el=>sistemas.push(el.dataset.mod));
  if(sistemas.length===0){alert('Selecione ao menos um módulo/poder.');return}
  const sistemasNomes=sistemas.map(s=>PROC_MODULOS[s]||s).join(', ');
  const outorgante=getOutorganteData();
  const entidade=function(){try{return JSON.parse(localStorage.getItem('crc_entidade_config'))||{}}catch(e){return{}}}();
  const enderecoProc=procDadosRF&&procDadosRF.logradouro?
    (procDadosRF.logradouro+', '+procDadosRF.numero+(procDadosRF.complemento?' — '+procDadosRF.complemento:'')+' — '+procDadosRF.bairro+' — '+procDadosRF.municipio+'/'+procDadosRF.uf):'';
  const dataAssinatura=new Date().toLocaleString('pt-BR');
  const vigenciaStr=new Date(dtInicio).toLocaleDateString('pt-BR')+' a '+new Date(dtFim).toLocaleDateString('pt-BR');
  const procs=getProcuracoes();
  const novaProcId=Date.now();
  procs.push({id:novaProcId,status:'ativa',cpf:cpfCnpj,nome,vigencia:vigenciaStr,sistemas,tipo:'outorgada',email,dadosRF:procDadosRF,dtInicio,dtFim});
  saveProcuracoes(procs);
  try{
    const resp=await fetch('/api/procuracao/pdf',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        template:getTemplateProcuracao(),
        outorgante_nome:outorgante.nome,
        outorgante_cpf:outorgante.cpf,
        outorgante_endereco:outorgante.endereco,
        procurador_nome:nome,
        procurador_cpf_cnpj:cpfCnpj,
        procurador_razao_social:procDadosRF?.razao_social||nome,
        procurador_endereco:enderecoProc,
        procurador_email:email,
        sistemas:sistemasNomes,
        vigencia:vigenciaStr,
        data_assinatura:dataAssinatura,
        entidade_nome:entidade.nome||'',
        entidade_cnpj:entidade.cnpj||'',
      })
    });
    if(!resp.ok)throw new Error('Erro ao gerar PDF');
    const blob=await resp.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='procuracao_'+novaProcId+'.pdf';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Procuração assinada e PDF gerado com sucesso!\nO documento foi baixado automaticamente.');
  }catch(err){
    alert('Procuração criada! Porém ocorreu um erro ao gerar o PDF: '+err.message);
  }
  procDadosRF=null;procTipoDoc='';
  procuracaoView='lista';navigate('procuracao');
}
function toggleProcMod(el){el.classList.toggle('selected')}
function procSelecionarTodos(){document.querySelectorAll('.proc-mod-card').forEach(el=>el.classList.add('selected'))}
function procDesmarcarTodos(){document.querySelectorAll('.proc-mod-card').forEach(el=>el.classList.remove('selected'))}
function procValidarVigencia(){
  const inicio=document.getElementById('proc-dt-inicio');
  const fim=document.getElementById('proc-dt-fim');
  const info=document.getElementById('proc-vigencia-info');
  if(!inicio||!fim||!info)return;
  if(inicio.value&&fim.value){
    const d1=new Date(inicio.value),d2=new Date(fim.value);
    const diff=Math.round((d2-d1)/(1000*60*60*24));
    if(d2<=d1){info.innerHTML='<span style="color:var(--danger)">Data final deve ser posterior à inicial.</span>';return}
    if(diff>366){info.innerHTML='<span style="color:var(--danger)">Máximo 1 ano (365 dias). Período atual: '+diff+' dias.</span>';return}
    info.innerHTML='<span style="color:var(--accent)">Vigência: '+diff+' dias</span>';
  }else{info.innerHTML=''}
}
pages._procuracao_nova=()=>{
  const outorgante=getOutorganteData();
  const hoje=new Date().toISOString().split('T')[0];
  const maxDate=new Date(new Date().getTime()+365*24*60*60*1000).toISOString().split('T')[0];
  return `<div class="module-page">
  <div class="page-header"><h1>Nova Procuração Eletrônica</h1><p>Outorgue poderes a um procurador para operar no portal em seu nome.</p></div>
  <button class="btn btn-ghost btn-sm" onclick="voltarListaProcuracao()" style="margin-bottom:14px">\u2190 Voltar</button>

  <div class="card-panel" style="margin-bottom:16px"><div class="card-panel-header"><h3>Outorgante (quem assina)</h3><span class="status-badge green">${outorgante.tipo==='admin'?'Administrativo':'Contribuinte'}</span></div><div class="card-panel-body">
    <div class="ficha-grid">
      <div class="ficha-campo"><span class="ficha-campo-label">Nome</span><span class="ficha-campo-valor">${outorgante.nome}</span></div>
      <div class="ficha-campo"><span class="ficha-campo-label">CPF/Login</span><span class="ficha-campo-valor">${outorgante.cpf}</span></div>
      ${outorgante.email?'<div class="ficha-campo"><span class="ficha-campo-label">E-mail</span><span class="ficha-campo-valor">'+outorgante.email+'</span></div>':''}
      ${outorgante.endereco?'<div class="ficha-campo"><span class="ficha-campo-label">Endere\u00e7o</span><span class="ficha-campo-valor">'+outorgante.endereco+'</span></div>':''}
    </div>
  </div></div>

  <div class="card-panel" style="margin-bottom:16px"><div class="card-panel-header"><h3>1. Identificar Procurador</h3></div><div class="card-panel-body">
    <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:12px">Digite o CPF ou CNPJ do procurador. O sistema consultar\u00e1 a Receita Federal automaticamente.</p>
    <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
      <div class="form-group" style="flex:1;min-width:200px;margin:0"><label>CPF ou CNPJ do Procurador *</label><input class="form-input" id="proc-cpf-cnpj" placeholder="Digite CPF (11 d\u00edgitos) ou CNPJ (14 d\u00edgitos)"></div>
      <button class="btn btn-primary btn-sm" onclick="consultarProcurador()" style="height:38px">Consultar Receita Federal</button>
    </div>
    <div id="proc-consulta-status" style="margin-top:8px;font-size:.82rem"></div>
    <div id="proc-dados-rf"></div>
  </div></div>

  <div class="card-panel" style="margin-bottom:16px"><div class="card-panel-header"><h3>2. Dados do Procurador</h3></div><div class="card-panel-body">
    <div class="grid-2">
      <div class="form-group"><label>Nome / Raz\u00e3o Social *</label><input class="form-input" id="proc-nome" placeholder="Preenchido automaticamente"></div>
      <div class="form-group"><label>E-mail</label><input class="form-input" type="email" id="proc-email" placeholder="email@exemplo.com"></div>
    </div>
  </div></div>

  <div class="card-panel" style="margin-bottom:16px"><div class="card-panel-header"><h3>3. Vig\u00eancia</h3></div><div class="card-panel-body">
    <div class="info-banner" style="margin-bottom:12px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>A procura\u00e7\u00e3o tem vig\u00eancia <strong>m\u00e1xima de 1 ano</strong>. Ap\u00f3s esse per\u00edodo, ser\u00e1 necess\u00e1rio renovar.</div>
    <div class="grid-2">
      <div class="form-group"><label>In\u00edcio da Vig\u00eancia *</label><input class="form-input" type="date" id="proc-dt-inicio" value="${hoje}" min="${hoje}" onchange="procValidarVigencia()"></div>
      <div class="form-group"><label>Fim da Vig\u00eancia *</label><input class="form-input" type="date" id="proc-dt-fim" value="${maxDate}" min="${hoje}" max="${maxDate}" onchange="procValidarVigencia()"></div>
    </div>
    <div id="proc-vigencia-info" style="font-size:.82rem;margin-top:4px"></div>
  </div></div>

  <div class="card-panel" style="margin-bottom:16px"><div class="card-panel-header"><h3>4. Poderes (m\u00f3dulos autorizados)</h3><div style="display:flex;gap:6px"><button class="btn btn-sm btn-outline" onclick="procSelecionarTodos()">Marcar Todos</button><button class="btn btn-sm btn-ghost" onclick="procDesmarcarTodos()">Desmarcar</button></div></div><div class="card-panel-body">
    <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:12px">Clique nos m\u00f3dulos que o procurador poder\u00e1 acessar em seu nome:</p>
    <div class="proc-mod-grid">
      ${Object.entries(PROC_MODULOS).map(([k,v])=>`<div class="proc-mod-card" data-mod="${k}" onclick="toggleProcMod(this)"><div class="proc-mod-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${PROC_ICONES[k]||'<circle cx="12" cy="12" r="10"/>'}</svg></div><div class="proc-mod-name">${v}</div><div class="proc-mod-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div></div>`).join('')}
    </div>
  </div></div>

  <div class="info-banner" style="margin-bottom:16px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Ao confirmar, a procura\u00e7\u00e3o ser\u00e1 <strong>assinada via Gov.BR</strong> e um <strong>PDF ser\u00e1 gerado</strong> com os dados de <strong>${outorgante.nome}</strong> como outorgante.</div>
  <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" onclick="voltarListaProcuracao()">Cancelar</button><button class="btn btn-primary" onclick="assinarEGerarPDF()">Assinar Gov.BR e Gerar PDF</button></div>
</div>`};

/* ── PROTOCOLO ── */
let protocoloView='lista';
function getProtocolos(){try{return JSON.parse(localStorage.getItem('crc_protocolos'))||[
  {id:1,numero:'PROT-2026-00134',tipo:'Revisão de Valor Venal',assunto:'Contestação IPTU 2026',inscricao:'001.023.045.001',data:'05/03/2026',situacao:'em_analise',detalhes:'Solicitação de revisão do valor venal do imóvel.'},
  {id:2,numero:'PROT-2025-00892',tipo:'Pedido de Isenção',assunto:'Isenção IPTU — Aposentado',inscricao:'001.023.045.002',data:'12/11/2025',situacao:'deferido',detalhes:'Isenção concedida por ser aposentado com renda até 3 SM.'},
  {id:3,numero:'PROT-2026-00201',tipo:'Retificação Cadastral',assunto:'Correção de área do imóvel',inscricao:'001.023.045.001',data:'10/03/2026',situacao:'em_analise',detalhes:'Área real difere da cadastrada. Apresentado memorial descritivo.'}
]}catch(e){return[]}}
function saveProtocolos(p){localStorage.setItem('crc_protocolos',JSON.stringify(p))}
const TIPO_PROCESSO=['Retificação Cadastral','Impugnação de Lançamento','Pedido de Isenção','Restituição / Compensação','Revisão de Valor Venal','Contestação de Dívida Ativa','Solicitação Geral'];
const SIT_BADGE={em_analise:'blue',deferido:'green',indeferido:'red',pendente:'orange',arquivado:'gray'};
const SIT_LABEL={em_analise:'Em Análise',deferido:'Deferido',indeferido:'Indeferido',pendente:'Pendente',arquivado:'Arquivado'};
function showNovoProtocolo(){protocoloView='novo';navigate('protocolo')}
function voltarListaProtocolo(){protocoloView='lista';navigate('protocolo')}
function salvarNovoProtocolo(){
  const tipo=document.getElementById('prot-tipo')?.value;
  const assunto=document.getElementById('prot-assunto')?.value.trim();
  const inscricao=document.getElementById('prot-inscricao')?.value;
  const detalhes=document.getElementById('prot-detalhes')?.value.trim();
  if(!tipo||!assunto){alert('Selecione o tipo e preencha o assunto.');return}
  const prots=getProtocolos();
  const num='PROT-2026-'+String(Math.floor(Math.random()*90000)+10000);
  const hoje=new Date();const dataStr=String(hoje.getDate()).padStart(2,'0')+'/'+String(hoje.getMonth()+1).padStart(2,'0')+'/'+hoje.getFullYear();
  prots.unshift({id:Date.now(),numero:num,tipo,assunto,inscricao:inscricao||'—',data:dataStr,situacao:'em_analise',detalhes});
  saveProtocolos(prots);
  alert('Protocolo '+num+' aberto com sucesso!');
  protocoloView='lista';navigate('protocolo');
}
pages.protocolo=()=>{
  if(protocoloView==='novo')return pages._protocolo_novo();
  const prots=getProtocolos();
  return `<div class="module-page">
  <div class="page-header"><h1>Protocolo e Processos</h1><p>Acompanhe ou abra processos administrativos tributários.</p></div>
  <button class="btn btn-primary btn-sm" style="width:auto;margin-bottom:14px" onclick="showNovoProtocolo()">+ Novo Processo</button>
  <div class="card-panel"><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Protocolo</th><th>Tipo</th><th>Assunto</th><th>Inscrição</th><th>Data</th><th>Situação</th><th>Ações</th></tr></thead><tbody>
    ${prots.map(p=>`<tr><td style="font-weight:700">${p.numero}</td><td>${p.tipo}</td><td>${p.assunto}</td><td>${p.inscricao||'—'}</td><td>${p.data}</td><td><span class="status-badge ${SIT_BADGE[p.situacao]||'gray'}">${SIT_LABEL[p.situacao]||p.situacao}</span></td><td class="table-actions"><button class="table-action-btn" onclick="alert('Detalhes:\\n'+${JSON.stringify(JSON.stringify(p.detalhes||'Sem detalhes.'))})">Ver</button></td></tr>`).join('')}
  </tbody></table></div></div>
</div>`;
};
pages._protocolo_novo=()=>`<div class="module-page">
  <div class="page-header"><h1>Novo Processo Administrativo</h1><p>Abra um protocolo junto à administração tributária.</p></div>
  <div class="card-panel"><div class="card-panel-header"><h3>Dados do Processo</h3></div><div class="card-panel-body">
    <div class="grid-2">
      <div class="form-group"><label>Tipo do Processo *</label><select class="form-select" id="prot-tipo"><option value="">Selecione...</option>${TIPO_PROCESSO.map(t=>`<option value="${t}">${t}</option>`).join('')}</select></div>
      <div class="form-group"><label>Inscrição Relacionada</label><select class="form-select" id="prot-inscricao"><option value="">Nenhuma (geral)</option><option>001.023.045.001</option><option>001.023.045.002</option><option>001.078.012.003</option><option>EMP-2024-00345</option><option>EMP-2025-00120</option></select></div>
    </div>
    <div class="form-group"><label>Assunto / Título *</label><input class="form-input" id="prot-assunto" placeholder="Descreva resumidamente o pedido"></div>
    <div class="form-group"><label>Detalhes e Justificativa</label><textarea class="form-textarea" id="prot-detalhes" style="min-height:100px" placeholder="Explique detalhadamente o motivo do pedido, apresentando argumentos e referências legais se aplicável..."></textarea></div>
    <div class="form-group"><label>Anexar Documentos</label><input type="file" class="form-input" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style="padding:8px"></div>
    <div class="info-banner" style="margin-top:8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Após abrir, o protocolo será assinado via <strong>Gov.BR</strong> e encaminhado para análise. Você poderá acompanhar em tempo real.</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" onclick="voltarListaProtocolo()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="salvarNovoProtocolo()">Abrir Protocolo</button></div>
  </div></div>
</div>`;

/* ── DEC (layout completo) ── */
const DEC_MENSAGENS=[
  {
    id:1,
    numero:'NOT-2026-000123',
    assunto:'Divergência de base de cálculo — competência 01/2026',
    subtipo:'Notificação fiscal',
    origem:'EQFIS',
    dataEnvio:'01/04/2026, 10:00:00',
    primeiraVisualizacao:'27/04/2026, 11:05:51',
    cienciaTipo:'tacita',
    ciencia:'16/04/2026, 10:00:00',
    lida:true,
    prazoLeitura:'até 16/04/2026, 10:00:00 (15 dias)',
    prazoRegularizacao:'30 dias após a ciência',
    statusLinha:'Ciência tácita',
    contribuinte:'qualquer',
    cpfCnpj:'45.434.331/0001-63',
    valorDivergencia:'R$ 12.450,00',
    malhaTitulo:'Malha fiscal — base de cálculo do ISS',
    malhaSubtitulo:'Inconsistência apontada entre documentos fiscais e valores declarados.',
    descricao:'Em auditoria dos documentos fiscais do período 01/2026, foi identificada divergência na base de cálculo do ISS por não inclusão de receitas em operação interestadual.',
    fundamento:'Art. 3º da legislação municipal de ISS. IN aplicável: Código Tributário Municipal.',
    conduta:'Regularizar a base de cálculo, apresentar documentação comprobatória ou contestar formalmente no prazo legal.',
    observacao:'Processo digital nº 2026-PROC-8891.',
    periodos:[{competencia:'2026-01',bcNfse:'R$ 10.000,00',bcPgdas:'R$ 8.200,00',diferenca:'-R$ 1.800,00',status:'pendente'},{competencia:'2026-02',bcNfse:'R$ 11.500,00',bcPgdas:'R$ 11.500,00',diferenca:'R$ 0,00',status:'pendente'}],
    fiscalNome:'Mariana Alves Costa',
    fiscalCargo:'Auditora Fiscal — ISS · mat. AF-8841',
    hashAssinatura:'5e4de5c942a1741f5f88ae7f48b1b971250f9ff8f1943a446e6d9253a8d455a2',
    anexos:[{nome:'notificacao-NOT-2026-000123.pdf',url:'#'},{nome:'memoria-calculo-iss-2026-01.xlsx',url:'#'}]
  },
  {
    id:2,
    numero:'NOT-2026-000456',
    assunto:'Divergência em retenção na fonte — competências 2025',
    subtipo:'Intimação',
    origem:'Fisco municipal',
    dataEnvio:'10/01/2026, 09:30:00',
    primeiraVisualizacao:'22/04/2026, 11:32:30',
    cienciaTipo:'tacita',
    ciencia:'25/01/2026, 09:30:00',
    lida:true,
    prazoLeitura:'até 25/01/2026, 09:30:00 (15 dias)',
    prazoRegularizacao:'20 dias após a ciência',
    statusLinha:'Ciência tácita',
    contribuinte:'qualquer',
    cpfCnpj:'45.434.331/0001-63',
    valorDivergencia:'R$ 4.980,00',
    malhaTitulo:'Malha fiscal — retenção de ISS',
    malhaSubtitulo:'Diferença entre valores retidos e declarados em competência anterior.',
    descricao:'Foram identificadas inconsistências em retenções de ISS declaradas no período 2025.',
    fundamento:'Código Tributário Municipal e normas complementares de retenção ISS.',
    conduta:'Retificar declaração ou apresentar justificativa formal com anexos comprobatórios.',
    observacao:'Atendimento preferencial por protocolo eletrônico.',
    periodos:[{competencia:'2025-09',bcNfse:'R$ 7.400,00',bcPgdas:'R$ 6.100,00',diferenca:'-R$ 1.300,00',status:'pendente'}],
    fiscalNome:'Roberto Lima',
    fiscalCargo:'Auditor Fiscal — ISS · mat. AF-7744',
    hashAssinatura:'22e8ca6fb57ea4f7a7fce6c5af44c0be18b196c866f8f282a0f20a897a5e3310',
    anexos:[{nome:'notificacao-NOT-2026-000456.pdf',url:'#'}]
  },
  {
    id:3,
    numero:'NOT-2026-001024',
    assunto:'Pendência no endereço fiscal e CNAE principal',
    subtipo:'Notificação de divergência cadastral',
    origem:'Fisco municipal',
    dataEnvio:'18/05/2026, 09:45:00',
    primeiraVisualizacao:'Não visualizada',
    cienciaTipo:'efetiva',
    ciencia:'18/05/2026, 16:40:02',
    lida:false,
    prazoLeitura:'até 02/06/2026, 09:45:00 (15 dias)',
    prazoRegularizacao:'20 dias após a ciência',
    statusLinha:'Ciência efetiva',
    contribuinte:'qualquer',
    cpfCnpj:'45.434.331/0001-63',
    valorDivergencia:'R$ 0,00',
    malhaTitulo:'Malha cadastral',
    malhaSubtitulo:'Divergência entre cadastro econômico e declarações recentes.',
    descricao:'Foi identificada inconsistência entre o endereço fiscal informado no cadastro municipal e os dados declarados no portal, além de divergência no CNAE principal ativo.',
    fundamento:'Código Tributário Municipal e normas cadastrais vigentes.',
    conduta:'Atualizar o cadastro econômico com documentação comprobatória ou apresentar justificativa formal no prazo regulamentar.',
    observacao:'Atendimento preferencial por protocolo eletrônico.',
    periodos:[],
    fiscalNome:'Fernanda Ramos',
    fiscalCargo:'Auditora Fiscal — Cadastro · mat. AF-9317',
    hashAssinatura:'6d3eec5d3fcf6c45fe5e13f58165046bf8136cc6bdc1a8266b557f77e36b3e19',
    anexos:[{nome:'notificacao-NOT-2026-001024.pdf',url:'#'}]
  },
];
function getDECMensagens(){
  try{
    const contribuinteAtual=getContribuinteLogado()||{};
    const contribuinteNome=contribuinteAtual.nome||'Contribuinte';
    const contribuinteDocumento=contribuinteAtual.cpf||contribuinteAtual.cnpj||contribuinteAtual.cpfCnpj||'—';
    const raw=JSON.parse(localStorage.getItem('crc_dec_msgs'));
    const list=(Array.isArray(raw)&&raw.length)?raw:DEC_MENSAGENS;
    return list.map((m,idx)=>{
      const base=DEC_MENSAGENS.find((d)=>d.id===m?.id)||DEC_MENSAGENS[idx%DEC_MENSAGENS.length];
      const dataEnvio=m?.dataEnvio||((m?.data)?`${m.data}, 10:00:00`:base.dataEnvio);
      const primeiraVisualizacao=(m?.primeiraVisualizacao!==undefined)?m.primeiraVisualizacao:(m?.ciencia||base.primeiraVisualizacao||'Não visualizada');
      return {
        ...base,
        ...m,
        numero:m?.numero||base.numero||`NOT-${new Date().getFullYear()}-${String(m?.id||idx+1).padStart(6,'0')}`,
        assunto:m?.assunto||base.assunto||'Notificação fiscal',
        subtipo:m?.subtipo||m?.tipo||base.subtipo||'Notificação',
        dataEnvio,
        origem:m?.origem||base.origem||'Fisco municipal',
        primeiraVisualizacao,
        contribuinte:contribuinteNome,
        cpfCnpj:contribuinteDocumento,
        valorDivergencia:m?.valorDivergencia||base.valorDivergencia||'R$ 0,00',
        prazoLeitura:m?.prazoLeitura||base.prazoLeitura||'15 dias',
        prazoRegularizacao:m?.prazoRegularizacao||base.prazoRegularizacao||'30 dias após a ciência',
        cienciaTipo:m?.cienciaTipo||(m?.ciencia?'efetiva':'tacita'),
        ciencia:m?.ciencia||base.ciencia||'—',
        lida:typeof m?.lida==='boolean'?m.lida:!!m?.ciencia,
        anexos:Array.isArray(m?.anexos)?m.anexos:(Array.isArray(base.anexos)?base.anexos:[]),
        periodos:Array.isArray(m?.periodos)?m.periodos:(Array.isArray(base.periodos)?base.periodos:[]),
        contestacao:m?.contestacao||null
      };
    });
  }catch(_e){return DEC_MENSAGENS}
}
function saveDECMensagens(m){localStorage.setItem('crc_dec_msgs',JSON.stringify(m))}
let decLendoId=null;
let decContestacaoAberta=false;
function lerDEC(id){decLendoId=id;decContestacaoAberta=false;navigate('dec')}
function voltarDECLista(){decLendoId=null;decContestacaoAberta=false;navigate('dec')}
function registrarCienciaDEC(id){
  const msgs=getDECMensagens();
  const m=msgs.find(x=>x.id===id);
  if(!m)return;
  m.lida=true;
  m.cienciaTipo='efetiva';
  m.ciencia=new Date().toLocaleString('pt-BR');
  m.statusLinha='Ciência efetiva';
  if(m.primeiraVisualizacao==='Não visualizada') m.primeiraVisualizacao=m.ciencia;
  saveDECMensagens(msgs);
  navigate('dec');
}
function abrirContestacaoDEC(){decContestacaoAberta=true;navigate('dec')}
function fecharContestacaoDEC(){decContestacaoAberta=false;navigate('dec')}
function onContestacaoArquivosChange(){
  const input=document.getElementById('dec-contest-arquivos');
  const list=document.getElementById('dec-contest-arquivos-lista');
  if(!list)return;
  const files=Array.from(input?.files||[]);
  const formatSize=(bytes)=>{
    if(!Number.isFinite(bytes)||bytes<=0)return '';
    if(bytes<1024)return `${bytes} B`;
    if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  };
  list.innerHTML=files.length
    ?files.map((f)=>`<div class="dec-upload-item"><span class="dec-upload-item-name">📎 ${f.name}</span><span class="dec-upload-item-size">${formatSize(f.size)}</span></div>`).join('')
    :'<div class="dec-upload-empty">Nenhum arquivo anexado ainda.</div>';
}
function protocolarContestacaoDEC(id){
  const fundamento=document.getElementById('dec-contest-fundamento')?.value.trim()||'';
  if(!fundamento){alert('Preencha a fundamentação da contestação.');return;}
  const msgs=getDECMensagens();
  const m=msgs.find((x)=>x.id===id);
  if(!m)return;
  m.contestacao={
    protocolo:`DTE-CONTEST-${new Date().getFullYear()}-${String(Math.floor(Math.random()*100000)).padStart(5,'0')}`,
    fundamento,
    dataHora:new Date().toLocaleString('pt-BR'),
    arquivos:(Array.from(document.getElementById('dec-contest-arquivos')?.files||[]).map((f)=>f.name))
  };
  saveDECMensagens(msgs);
  decContestacaoAberta=false;
  alert(`Contestação protocolada com sucesso. Protocolo: ${m.contestacao.protocolo}`);
  navigate('dec');
}
function renderStatusCienciaTag(tipo){
  if(tipo==='efetiva') return '<span class="dec-status-pill dec-status-pill--ok"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>Ciência efetiva</span>';
  return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:.7rem;background:rgba(255,196,71,.2);color:#8a6a00;font-weight:700">Ciência tácita</span>';
}
pages.dec=()=>{
  const msgs=getDECMensagens();
  if(!decLendoId){
    const total=msgs.length;
    const efetiva=msgs.filter((m)=>m.cienciaTipo==='efetiva').length;
    const tacita=msgs.filter((m)=>m.cienciaTipo==='tacita').length;
    return `<div class="module-page">
    <div class="page-header"><h1>Olá, ${((getContribuinteLogado()||{}).nome||'qualquer').split(' ')[0].toLowerCase()}</h1><p>Lista de notificações fiscais destinadas ao seu cadastro.</p></div>
    <div class="grid-3" style="margin-bottom:14px">
      <div class="card-panel" style="margin:0"><div class="card-panel-body" style="padding:14px"><div style="font-size:1.5rem;font-weight:800;color:#7f5ac8">${total}</div><div style="font-size:.78rem;color:var(--text-muted)">Notificações</div></div></div>
      <div class="card-panel" style="margin:0"><div class="card-panel-body" style="padding:14px"><div style="font-size:1.5rem;font-weight:800;color:#7f5ac8">${efetiva}</div><div style="font-size:.78rem;color:var(--text-muted)">Ciência efetiva</div></div></div>
      <div class="card-panel" style="margin:0"><div class="card-panel-body" style="padding:14px"><div style="font-size:1.5rem;font-weight:800;color:#7f5ac8">${tacita}</div><div style="font-size:.78rem;color:var(--text-muted)">Ciência tácita</div></div></div>
    </div>
    <div class="card-panel"><div class="card-panel-header"><h3>Suas notificações</h3></div><div class="card-panel-body">
      ${msgs.map((m)=>`<div class="card-panel" style="margin-bottom:10px;cursor:pointer" onclick="lerDEC(${m.id})"><div class="card-panel-body" style="padding:12px 14px;display:flex;justify-content:space-between;gap:14px;align-items:flex-start"><div><div style="font-weight:800">${m.numero} — <span style="font-weight:500">${m.assunto}</span></div><div style="font-size:.78rem;color:var(--text-muted)">${m.subtipo} · Emitida em ${String(m.dataEnvio||'—').split(',')[0]} · Origem: ${m.origem||'Fisco municipal'}</div><div style="margin-top:6px">${renderStatusCienciaTag(m.cienciaTipo)}</div></div><div style="font-size:.74rem;color:var(--text-muted);text-align:right"><div>1ª visualização:</div><div>${m.primeiraVisualizacao||'Não visualizada'}</div></div></div></div>`).join('')}
    </div></div>
  </div>`;
  }
  const m=msgs.find((x)=>x.id===decLendoId);
  if(!m){decLendoId=null;return pages.dec();}
  if(!m.lida){
    m.lida=true;
    if(m.primeiraVisualizacao==='Não visualizada') m.primeiraVisualizacao=new Date().toLocaleString('pt-BR');
    saveDECMensagens(msgs);
  }
  const mostraContestacao=decContestacaoAberta;
  return `<div class="module-page">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <button class="btn btn-ghost btn-sm" onclick="voltarDECLista()">← Todas as notificações</button>
      <div style="font-size:.75rem;color:var(--text-muted)">Contribuinte: <strong>${m.contribuinte}</strong> · CPF/CNPJ: <strong>${m.cpfCnpj}</strong></div>
    </div>
    <div class="card-panel"><div class="card-panel-body" style="padding:0">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border-light)">
        <div style="font-size:.72rem;color:var(--text-muted)">NOTIFICAÇÃO FISCAL</div>
        <div style="font-size:1.35rem;font-weight:900">${m.numero}</div>
        <div style="font-size:.86rem;color:var(--text-secondary)">${m.assunto}</div>
      </div>
      <div class="dec-ciencia-banner ${m.cienciaTipo==='efetiva'?'is-efetiva':'is-tacita'}">
        ${m.cienciaTipo==='efetiva'
          ?`<div class="dec-ciencia-banner-title"><span class="dec-ciencia-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>CIÊNCIA EFETIVA REGISTRADA</div>`
          :`<div class="dec-ciencia-banner-title">CIÊNCIA TÁCITA</div>`
        }
        <div class="dec-ciencia-banner-ref">Referência: ${m.ciencia}</div>
      </div>
      <div style="padding:10px 14px;background:rgba(179,60,87,.12);border-bottom:1px solid rgba(179,60,87,.2)">
        <div style="font-weight:700;color:#9d2748">${m.malhaTitulo}</div>
        <div style="font-size:.76rem;color:var(--text-secondary)">${m.malhaSubtitulo}</div>
      </div>
      <div style="display:grid;grid-template-columns:${mostraContestacao?'1fr 1fr':'1fr'};gap:0">
        <div style="padding:14px 16px;border-right:${mostraContestacao?'1px solid var(--border-light)':'none'}">
          <div class="grid-2-gap8" style="margin-bottom:10px;font-size:.84rem">
            <div><strong>Contribuinte</strong><div>${m.contribuinte}</div></div>
            <div><strong>CPF/CNPJ</strong><div>${m.cpfCnpj}</div></div>
            <div><strong>N° Notificação</strong><div>${m.numero}</div></div>
            <div><strong>Valor da divergência</strong><div style="color:var(--danger);font-weight:800">${m.valorDivergencia}</div></div>
            <div><strong>Data de envio</strong><div>${m.dataEnvio}</div></div>
            <div><strong>Prazo para leitura</strong><div>${m.prazoLeitura}</div></div>
            <div><strong>Prazo para regularização</strong><div>${m.prazoRegularizacao}</div></div>
          </div>
          <div style="background:linear-gradient(90deg,#363ccf,#3794ff);color:#fff;padding:7px 10px;border-radius:6px 6px 0 0;font-size:.74rem;font-weight:800">TEOR DA NOTIFICAÇÃO</div>
          <div style="padding:10px;border:1px solid var(--border-light);border-top:none">
            <div style="font-size:.73rem;color:var(--text-muted);font-weight:700">DESCRIÇÃO / RELATO</div><div style="font-size:.83rem;margin-bottom:8px">${m.descricao}</div>
            <div style="font-size:.73rem;color:var(--text-muted);font-weight:700">FUNDAMENTAÇÃO LEGAL</div><div style="font-size:.83rem;margin-bottom:8px">${m.fundamento}</div>
            <div style="font-size:.73rem;color:var(--text-muted);font-weight:700">CONDUTA EXIGIDA</div><div style="font-size:.83rem;margin-bottom:8px">${m.conduta}</div>
            <div style="font-size:.73rem;color:var(--text-muted);font-weight:700">OBSERVAÇÃO</div><div style="font-size:.83rem">${m.observacao}</div>
          </div>
          ${m.periodos.length?`<div style="margin-top:10px;background:linear-gradient(90deg,#2342b6,#1f56da);color:#fff;padding:6px 10px;border-radius:6px 6px 0 0;font-size:.74rem;font-weight:800">PERÍODOS DE APURAÇÃO</div><table class="data-table" style="margin:0"><thead><tr><th>Competência</th><th>BC ISS (NFSE)</th><th>BC ISS (PGDAS)</th><th>Diferença</th><th>Status</th></tr></thead><tbody>${m.periodos.map((p)=>`<tr><td>${p.competencia}</td><td>${p.bcNfse}</td><td>${p.bcPgdas}</td><td style="font-weight:700">${p.diferenca}</td><td>${p.status}</td></tr>`).join('')}</tbody></table>`:''}
          <div style="margin-top:10px;background:linear-gradient(90deg,#3126a5,#4140bf);color:#fff;padding:6px 10px;border-radius:6px 6px 0 0;font-size:.74rem;font-weight:800">ASSINATURA DIGITAL DO FISCAL RESPONSÁVEL</div>
          <div style="padding:10px;border:1px solid var(--border-light);border-top:none">
            <div style="font-weight:700">${m.fiscalNome}</div>
            <div style="font-size:.78rem;color:var(--text-secondary)">${m.fiscalCargo}</div>
            <div style="font-size:.73rem;color:var(--text-muted);margin-top:8px;font-weight:700">IDENTIFICADOR CRIPTOGRÁFICO (SHA-256 SIMULADO)</div>
            <input class="form-input" readonly value="${m.hashAssinatura}" style="font-family:monospace;font-size:.72rem;margin-top:4px">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px">
              <button class="btn btn-outline btn-sm" onclick="alert('Assinatura validada com sucesso!')">Validar assinatura</button>
              <button class="btn btn-outline btn-sm" onclick="alert('Download da notificação em PDF em implementação.')">Baixar notificação em PDF</button>
              <span style="font-size:.74rem;color:var(--text-muted)">Documento oficial com identificação e teor da notificação.</span>
            </div>
          </div>
          <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">${(m.anexos||[]).map((a)=>`<button class="btn btn-ghost btn-sm" onclick="window.open('${a.url}','_blank')">📎 ${a.nome}</button>`).join('')}</div>
          <div style="text-align:center;margin-top:16px">
            <div style="font-size:.74rem;color:var(--text-muted);margin-bottom:8px">A contestação é opcional. Abra somente se quiser apresentar defesa formal.</div>
            <button class="btn btn-primary" style="min-width:280px" onclick="abrirContestacaoDEC()">⚖️ Abrir contestação</button>
          </div>
        </div>
        ${mostraContestacao?`<div style="padding:14px 16px">
          <div style="background:#f0b429;color:#1f2933;padding:8px 10px;border-radius:6px 6px 0 0;font-size:.74rem;font-weight:800">CONTESTAÇÃO</div>
          <div style="border:1px solid var(--border-light);border-top:none;padding:10px;background:#fffde8">
            <div style="font-size:.78rem;line-height:1.5"><strong>Responsabilidade do contribuinte.</strong><br>Ao protocolar, declara ciência de que <strong>injúria, desacato e ofensa</strong> contra agentes públicos configuram infração e podem gerar responsabilização administrativa, civil e penal.</div>
          </div>
          <div class="form-group" style="margin-top:12px"><label>Fundamentação da contestação *</label><textarea id="dec-contest-fundamento" class="form-textarea" style="min-height:210px" placeholder="Explique objetivamente os motivos pelos quais discorda desta notificação.">${m.contestacao?.fundamento||''}</textarea></div>
          <div class="form-group"><label>Documentos comprobatórios</label>
            <div class="dec-upload">
              <input id="dec-contest-arquivos" type="file" class="dec-upload-input" multiple onchange="onContestacaoArquivosChange()">
              <label class="dec-upload-trigger" for="dec-contest-arquivos">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Selecionar documentos</span>
              </label>
              <div class="dec-upload-hint">PDF, JPG, PNG, DOC e DOCX.</div>
            </div>
          </div>
          <div id="dec-contest-arquivos-lista" class="dec-upload-list">${m.contestacao?.arquivos?.length?m.contestacao.arquivos.map((n)=>`<div class="dec-upload-item"><span class="dec-upload-item-name">📎 ${n}</span></div>`).join(''):'<div class="dec-upload-empty">Nenhum arquivo anexado ainda.</div>'}</div>
          ${m.contestacao?`<div class="info-banner" style="margin-top:10px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Contestação já protocolada: <strong>${m.contestacao.protocolo}</strong> em ${m.contestacao.dataHora}.</div>`:''}
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn btn-ghost btn-sm" onclick="fecharContestacaoDEC()">Fechar formulário</button><button class="btn btn-primary btn-sm" onclick="protocolarContestacaoDEC(${m.id})">Protocolar contestação</button></div>
        </div>`:''}
      </div>
    </div></div>
  </div>`;
};

/* ── CAIXA POSTAL ── */
const CP_MENSAGENS=[
  {id:1,data:'10/03/26',assunto:'Vencimento IPTU 2026 — Cota \u00danica',lida:false,remetente:'Secretaria de Fazenda',conteudo:'Prezado(a) Contribuinte,\n\nLembramos que o vencimento da cota \u00fanica do IPTU 2026 com desconto de 10% est\u00e1 pr\u00f3ximo.\n\nIm\u00f3vel: Rua das Palmeiras, 234 \u2014 Centro\nInscri\u00e7\u00e3o: 001.023.045.001\nValor com desconto: R$ 1.736,37\nVencimento: 15/04/2026\n\nPara emitir a guia, acesse "2\u00aa Via de Documentos" no portal.\n\nAtenciosamente,\nSecretaria Municipal de Fazenda'},
  {id:2,data:'01/03/26',assunto:'Campanha de Regulariza\u00e7\u00e3o Fiscal',lida:true,remetente:'Procuradoria Geral',conteudo:'Prezado(a) Contribuinte,\n\nA Prefeitura Municipal lan\u00e7ou a Campanha de Regulariza\u00e7\u00e3o Fiscal 2026.\n\nBenef\u00edcios:\n- Desconto de at\u00e9 90% em multas\n- Desconto de at\u00e9 80% em juros\n- Parcelamento em at\u00e9 60x\n\nPer\u00edodo: 01/03/2026 a 30/06/2026\n\nPara simular seu acordo, acesse "Acordo da D\u00edvida" no portal.\n\nAtenciosamente,\nProcuradoria Geral do Munic\u00edpio'},
  {id:3,data:'15/02/26',assunto:'Boas-vindas ao Portal CRC',lida:true,remetente:'Portal CRC',conteudo:'Prezado(a) Contribuinte,\n\nSeja bem-vindo(a) ao Portal Central de Relacionamento com o Contribuinte \u2014 CRC.\n\nAtrav\u00e9s deste portal voc\u00ea pode:\n- Emitir 2\u00aa via de boletos e guias\n- Consultar d\u00e9bitos e d\u00edvida ativa\n- Emitir certid\u00f5es\n- Acompanhar protocolos\n- Configurar notifica\u00e7\u00f5es\n\nEm caso de d\u00favidas, utilize nosso assistente virtual.\n\nAtenciosamente,\nEquipe CRC'},
];
function getCPMensagens(){const saved=localStorage.getItem('crc_cp_msgs');return saved?JSON.parse(saved):CP_MENSAGENS}
function saveCPMensagens(m){localStorage.setItem('crc_cp_msgs',JSON.stringify(m))}
let cpLendoId=null;
function lerCP(id){cpLendoId=id;navigate('caixa_postal')}
function voltarCPLista(){cpLendoId=null;navigate('caixa_postal')}
pages.caixa_postal=()=>{
  const msgs=getCPMensagens();
  if(cpLendoId){
    const m=msgs.find(x=>x.id===cpLendoId);
    if(!m){cpLendoId=null;return pages.caixa_postal()}
    if(!m.lida){m.lida=true;saveCPMensagens(msgs)}
    return `<div class="module-page">
    <div class="page-header"><h1>Caixa Postal</h1><p>${m.assunto}</p></div>
    <button class="btn btn-ghost btn-sm" onclick="voltarCPLista()" style="margin-bottom:14px">\u2190 Voltar</button>
    <div class="card-panel"><div class="card-panel-header"><h3>${m.assunto}</h3><span class="status-badge green">Lida</span></div>
    <div class="card-panel-body">
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;font-size:.84rem;color:var(--text-muted)">
        <div><strong>Remetente:</strong> ${m.remetente}</div>
        <div><strong>Data:</strong> ${m.data}</div>
      </div>
      <div style="white-space:pre-wrap;font-size:.88rem;line-height:1.6;padding:16px;background:var(--card);border:1px solid var(--border);border-radius:8px">${m.conteudo}</div>
    </div></div>
  </div>`;
  }
  const naoLidas=msgs.filter(m=>!m.lida).length;
  return `<div class="module-page">
  <div class="page-header"><h1>Caixa Postal</h1><p>Mensagens da Prefeitura. ${naoLidas>0?'<strong style="color:var(--danger)">'+naoLidas+' n\u00e3o lida(s)</strong>':''}</p></div>
  <div class="card-panel"><div class="card-panel-body" style="padding:0"><table class="data-table"><thead><tr><th>Status</th><th>Data</th><th>Remetente</th><th>Assunto</th><th>A\u00e7\u00f5es</th></tr></thead><tbody>
    ${msgs.map(m=>`<tr${!m.lida?' style="background:var(--accent-glow2)"':''}><td><span class="status-badge ${!m.lida?'blue':'gray'}">${!m.lida?'Nova':'Lida'}</span></td><td>${m.data}</td><td style="font-size:.82rem">${m.remetente}</td><td${!m.lida?' style="font-weight:700"':''}>${m.assunto}</td><td class="table-actions"><button class="table-action-btn ${!m.lida?'primary':''}" onclick="lerCP(${m.id})">${!m.lida?'Ler':'Ver'}</button></td></tr>`).join('')}
  </tbody></table></div></div>
</div>`};

/* ── LGPD — FORMULÁRIO ELETRÔNICO ── */
let lgpdView='lista';
function getLGPDSolicitacoes(){const s=localStorage.getItem('crc_lgpd');return s?JSON.parse(s):[]}
function saveLGPDSolicitacoes(l){localStorage.setItem('crc_lgpd',JSON.stringify(l))}
function showNovaLGPD(){lgpdView='nova';navigate('formulario_lgpd')}
function voltarListaLGPD(){lgpdView='lista';navigate('formulario_lgpd')}
function enviarSolicitacaoLGPD(){
  const tipo=document.getElementById('lgpd-tipo');
  const desc=document.getElementById('lgpd-desc');
  if(!tipo||tipo.value==='Selecione...'||!desc||!desc.value.trim()){alert('Preencha tipo e descrição.');return}
  const termos=document.getElementById('lgpd-termos');
  if(!termos||!termos.checked){alert('Aceite os termos para prosseguir.');return}
  const solic=getLGPDSolicitacoes();
  const num='LGPD-'+new Date().getFullYear()+'-'+String(solic.length+1).padStart(4,'0');
  solic.unshift({numero:num,tipo:tipo.value,descricao:desc.value.trim(),data:new Date().toLocaleDateString('pt-BR'),status:'Em análise'});
  saveLGPDSolicitacoes(solic);
  alert('Solicitação '+num+' registrada com sucesso! Prazo de resposta: até 15 dias úteis conforme LGPD.');
  lgpdView='lista';navigate('formulario_lgpd');
}

async function enviarTesteAlerta(canal,prefix='notif-admin'){
  const destinoEl=document.getElementById(`${prefix}-${canal}-destino`);
  const statusEl=document.getElementById(`${prefix}-${canal}-status`);
  const destino=(destinoEl?.value||'').trim();
  if(!destino){alert('Informe o destino para teste.');return;}
  const mensagem=`Teste de alerta ${canal.toUpperCase()} enviado pelo perfil ${(localStorage.getItem('crc_admin_perfil')||'admin').toUpperCase()}.`;
  if(statusEl){statusEl.textContent='Enviando...';statusEl.className='notif-status';}
  const r=await fetch('/api/v1/notificacoes/teste/enviar',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({canal,destino,mensagem})
  });
  const j=await r.json().catch(()=>({}));
  if(statusEl){
    statusEl.textContent=r.ok?`Enviado (${j.protocolo||'ok'})`:`Falha: ${(j.erro||'tente novamente').slice(0,50)}`;
    statusEl.className=`notif-status ${r.ok?'ok':'err'}`;
  }
  if(!r.ok){alert(j.erro||'Falha ao enviar teste.');return;}
  alert(`Teste ${canal.toUpperCase()} enviado com sucesso. Protocolo: ${j.protocolo}`);
}

async function enviarTesteAlertaAdmin(canal){await enviarTesteAlerta(canal,'notif-admin')}
pages.formulario_lgpd=()=>{
  if(lgpdView==='nova'){
    return `<div class="module-page">
    <div class="page-header"><h1>Nova Solicitação LGPD</h1><p>Exercite seus direitos sobre dados pessoais conforme Lei nº 13.709/2018.</p></div>
    <button class="btn btn-ghost btn-sm" onclick="voltarListaLGPD()" style="margin-bottom:14px">\u2190 Voltar</button>
    <div class="card-panel"><div class="card-panel-header"><h3>Dados da Solicitação</h3></div><div class="card-panel-body">
      <div class="form-group"><label>Tipo de Solicitação *</label><select class="form-select" id="lgpd-tipo"><option>Selecione...</option><option>Acesso aos dados pessoais</option><option>Retificação de dados</option><option>Exclusão de dados</option><option>Portabilidade de dados</option><option>Revogação de consentimento</option><option>Informação sobre compartilhamento</option></select></div>
      <div class="form-group"><label>Descrição detalhada *</label><textarea class="form-textarea" id="lgpd-desc" rows="5" placeholder="Descreva detalhadamente sua solicitação..."></textarea></div>
      <div class="form-group"><label>Anexo (opcional)</label><input type="file" class="form-input" accept=".pdf,.jpg,.png,.doc,.docx"></div>
      <div style="margin-top:12px"><label style="display:flex;align-items:flex-start;gap:8px;font-size:.82rem;cursor:pointer"><input type="checkbox" id="lgpd-termos" style="margin-top:3px;min-width:18px"><span>Declaro que as informações prestadas são verdadeiras e autorizo o tratamento desta solicitação conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</span></label></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" onclick="voltarListaLGPD()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="enviarSolicitacaoLGPD()">Enviar Solicitação</button></div>
    </div></div>
  </div>`;
  }
  const solic=getLGPDSolicitacoes();
  return `<div class="module-page">
  <div class="page-header"><h1>LGPD — Meus Dados</h1><p>Gerencie solicitações sobre seus dados pessoais conforme a Lei Geral de Proteção de Dados.</p></div>
  <div class="info-banner" style="margin-bottom:14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Conforme a <strong>Lei nº 13.709/2018 (LGPD)</strong>, você tem direito a: acessar, retificar, excluir, portar seus dados pessoais e revogar consentimento.</div>
  <div style="margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="showNovaLGPD()">+ Nova Solicitação</button></div>
  ${solic.length>0?`<div class="card-panel"><div class="card-panel-header"><h3>Minhas Solicitações</h3></div><div class="card-panel-body" style="padding:0;overflow-x:auto"><table class="data-table"><thead><tr><th>Protocolo</th><th>Tipo</th><th>Data</th><th>Status</th></tr></thead><tbody>${solic.map(s=>`<tr><td style="font-weight:700">${s.numero}</td><td>${s.tipo}</td><td>${s.data}</td><td><span class="status-badge ${s.status==='Concluída'?'green':'orange'}">${s.status}</span></td></tr>`).join('')}</tbody></table></div></div>`:'<div class="card-panel"><div class="card-panel-body" style="text-align:center;padding:30px;color:var(--text-muted)">Nenhuma solicitação LGPD registrada.</div></div>'}
</div>`};

/* ── NOTIFICAÇÕES ── */
pages.notificacoes=()=>`<div class="module-page">
  <div class="page-header"><h1>Central de Notificações</h1><p>Escolha por onde deseja receber seus alertas de vencimento, avisos da Caixa Postal e DEC.</p></div>

  <div class="info-banner" style="margin-bottom:16px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>Ao ativar um canal, você receberá <strong>todas</strong> as notificações do portal: vencimentos de tributos, boletos, Caixa Postal e Domicílio Eletrônico (DEC/DTE).</div>

  <div class="grid-notif" style="margin-bottom:20px">
    <div class="card-panel" style="margin-bottom:0">
      <div class="card-panel-body" style="text-align:center;padding:20px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="margin-bottom:10px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div style="font-size:1rem;font-weight:700;margin-bottom:4px">E-mail</div>
        <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:12px">Receba alertas no seu e-mail</p>
        <div class="form-group" style="margin:0;text-align:left"><label>Endereço de e-mail</label><input class="form-input" id="notif-page-email-destino" type="email" placeholder="seu@email.com"></div>
        <div class="inline-row" style="justify-content:center;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="enviarCodigoCanalPage('email')">Validar e-mail</button>
          <input class="form-input" id="notif-page-email-codigo" placeholder="Código de 6 dígitos" style="max-width:170px">
          <button class="btn btn-ghost btn-sm" onclick="confirmarCodigoCanalPage('email')">Confirmar</button>
        </div>
        <span id="notif-page-email-status" class="notif-status">Aguardando validação</span>
        <label style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;font-size:.85rem;font-weight:600;cursor:pointer"><input id="notif-page-email-check" type="checkbox" style="width:18px;height:18px"> Ativar notificações por e-mail</label>
      </div>
    </div>
    <div class="card-panel" style="margin-bottom:0">
      <div class="card-panel-body" style="text-align:center;padding:20px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="margin-bottom:10px"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        <div style="font-size:1rem;font-weight:700;margin-bottom:4px">WhatsApp</div>
        <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:12px">Receba alertas no WhatsApp</p>
        <div class="form-group" style="margin:0;text-align:left"><label>Número com DDD</label><input class="form-input" id="notif-page-whatsapp-destino" type="tel" placeholder="(XX) XXXXX-XXXX"></div>
        <div class="inline-row" style="justify-content:center;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="enviarCodigoCanalPage('whatsapp')">Enviar código</button>
          <input class="form-input" id="notif-page-whatsapp-codigo" placeholder="Código de 6 dígitos" style="max-width:170px">
          <button class="btn btn-ghost btn-sm" onclick="confirmarCodigoCanalPage('whatsapp')">Confirmar</button>
        </div>
        <span id="notif-page-whatsapp-status" class="notif-status">Aguardando validação</span>
        <label style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;font-size:.85rem;font-weight:600;cursor:pointer"><input id="notif-page-whatsapp-check" type="checkbox" style="width:18px;height:18px"> Ativar notificações por WhatsApp</label>
      </div>
    </div>
    <div class="card-panel" style="margin-bottom:0">
      <div class="card-panel-body" style="text-align:center;padding:20px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="margin-bottom:10px"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        <div style="font-size:1rem;font-weight:700;margin-bottom:4px">SMS</div>
        <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:12px">Receba alertas por SMS</p>
        <div class="form-group" style="margin:0;text-align:left"><label>Número com DDD</label><input class="form-input" id="notif-page-sms-destino" type="tel" placeholder="(XX) XXXXX-XXXX"></div>
        <div class="inline-row" style="justify-content:center;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="enviarCodigoCanalPage('sms')">Enviar código</button>
          <input class="form-input" id="notif-page-sms-codigo" placeholder="Código de 6 dígitos" style="max-width:170px">
          <button class="btn btn-ghost btn-sm" onclick="confirmarCodigoCanalPage('sms')">Confirmar</button>
        </div>
        <span id="notif-page-sms-status" class="notif-status">Aguardando validação</span>
        <label style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;font-size:.85rem;font-weight:600;cursor:pointer"><input id="notif-page-sms-check" type="checkbox" style="width:18px;height:18px"> Ativar notificações por SMS</label>
      </div>
    </div>
  </div>

  <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="salvarPreferenciasNotificacaoPage()">Salvar Preferências</button></div>
</div>`;

/* ── PERFIL ── */
pages.perfil=()=>{
  if(currentUserType==='admin')return pages._perfil_admin();
  const c=getContribuinteLogado();
  const initials=c.nome.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const p=localStorage.getItem('arrecada_photo');const ph=p?`<img src="${p}">`:initials;
  const cpfMask=c.cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/,'***.***.${c.cpf.slice(8)}');
  const govColor=c.govbr==='Ouro'?'var(--orange)':c.govbr==='Prata'?'#A8A8A8':'#CD7F32';
  return`<div class="module-page">
  <div class="page-header"><h1>Meu Perfil</h1><p>Gerencie dados, foto, endereço e preferências.</p></div>
  <div class="card-panel" style="margin-bottom:14px"><div class="card-panel-body" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <div class="profile-photo-wrapper" onclick="triggerPhotoUpload()"><div class="profile-photo" id="profile-photo-main">${ph}</div><div class="profile-photo-edit"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div></div>
    <div style="flex:1;min-width:180px"><h2 style="font-size:1.2rem;font-weight:800">${c.nome}</h2><p style="color:var(--text-secondary);font-size:.85rem">CPF: ${cpfMask} | Gov.BR: <span style="color:${govColor};font-weight:700">${c.govbr}</span></p><p style="color:var(--text-muted);font-size:.78rem;margin-top:2px">Último acesso: ${new Date().toLocaleDateString('pt-BR')}</p></div>
    <button class="btn btn-outline btn-sm" onclick="triggerPhotoUpload()">Alterar Foto</button>
  </div></div>
  <div class="grid-2-gap14">
    <div class="card-panel"><div class="card-panel-header"><h3>Dados Cadastrais</h3></div><div class="card-panel-body">
      <div class="form-group"><label>Nome</label><input class="form-input" value="${c.nome}" disabled></div>
      <div class="form-group"><label>CPF</label><input class="form-input" value="${c.cpf}" disabled></div>
      <div class="form-group"><label>E-mail *</label><input class="form-input" value="${c.email||''}"></div>
      <div class="form-group"><label>Telefone</label><input class="form-input" value="${c.telefone||''}"></div>
      <div class="form-group"><label>WhatsApp</label><input class="form-input" value="${c.telefone||''}"></div>
    </div></div>
    <div class="card-panel"><div class="card-panel-header"><h3>Endereço</h3></div><div class="card-panel-body">
      <div class="form-group"><label>CEP</label><input class="form-input" value="${c.cep||''}"></div>
      <div class="form-group"><label>Logradouro</label><input class="form-input" value="${c.endereco||''}"></div>
      <div class="form-group"><label>Bairro</label><input class="form-input" value="${c.bairro||''}"></div>
      <div class="form-group"><label>Cidade</label><input class="form-input" value="${c.cidade||''}" disabled></div>
      <div class="form-group"><label>UF</label><input class="form-input" value="${c.uf||''}" disabled></div>
    </div></div>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:12px;gap:8px"><button class="btn btn-ghost btn-sm">Cancelar</button><button class="btn btn-primary btn-sm">Salvar</button></div>
  <div class="card-panel" style="margin-top:14px"><div class="card-panel-header"><h3>Nível Gov.BR</h3></div><div class="card-panel-body"><div class="govbr-levels">
    <div class="govbr-level-card${c.govbr==='Bronze'?' current':''}" style="border-color:#CD7F32"><div class="govbr-level-name" style="color:#CD7F32">Bronze${c.govbr==='Bronze'?' — Seu nível':''}</div><div class="govbr-level-desc">Conta com CPF</div><ul class="govbr-services"><li>Consultas</li><li>Guias simples</li></ul></div>
    <div class="govbr-level-card${c.govbr==='Prata'?' current':''}" style="border-color:#A8A8A8"><div class="govbr-level-name" style="color:#A8A8A8">Prata${c.govbr==='Prata'?' — Seu nível':''}</div><div class="govbr-level-desc">Banco/biometria</div><ul class="govbr-services"><li>Bronze +</li><li>Certidões, NFSe</li></ul></div>
    <div class="govbr-level-card${c.govbr==='Ouro'?' current':''}"><div class="govbr-level-name" style="color:var(--accent)">Ouro${c.govbr==='Ouro'?' — Seu nível':''}</div><div class="govbr-level-desc">Certificado digital</div><ul class="govbr-services"><li>Tudo</li><li>e-Procuração</li><li>Domicílio Eletrônico</li></ul></div>
  </div></div></div>
</div>`};
pages._perfil_admin=()=>{
  const users=getAdminUsers();
  const me=users.find(u=>u.login===currentAdminLogin)||{};
  const isMaster=isMasterUser(me);
  const p=localStorage.getItem('arrecada_photo');const adminInitials=(me.nome||'Administrador').split(' ').map(n=>n[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'AD';const ph=p?`<img src="${p}">`:adminInitials;
  const perfilLabel=isMaster?'MASTER':(me.perfil||'admin').toUpperCase();
  const perfilColor=isMaster?'var(--accent)':me.perfil==='suporte'?'#4A90D9':'var(--orange)';
  return`<div class="module-page">
  <div class="page-header"><h1>Meu Perfil</h1><p>Dados do seu acesso administrativo.</p></div>
  <div class="card-panel" style="margin-bottom:14px"><div class="card-panel-body" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
    <div class="profile-photo-wrapper" onclick="triggerPhotoUpload()"><div class="profile-photo" id="profile-photo-main">${ph}</div><div class="profile-photo-edit"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div></div>
    <div style="flex:1;min-width:180px">
      <h2 style="font-size:1.2rem;font-weight:800">${me.nome||'Administrador'}</h2>
      <p style="color:var(--text-secondary);font-size:.85rem">Login: <strong>${me.login||'—'}</strong> | Perfil: <span style="color:${perfilColor};font-weight:700">${perfilLabel}</span></p>
      <p style="color:var(--text-muted);font-size:.78rem;margin-top:2px">${me.email||'—'}</p>
    </div>
    <button class="btn btn-outline btn-sm" onclick="triggerPhotoUpload()">Alterar Foto</button>
  </div></div>
  <div class="grid-2-gap14">
    <div class="card-panel"><div class="card-panel-header"><h3>Dados da Conta</h3></div><div class="card-panel-body">
      <div class="form-group"><label>Nome Completo</label><input class="form-input" id="adm-perfil-nome" value="${me.nome||''}"></div>
      <div class="form-group"><label>Login</label><input class="form-input" value="${me.login||''}" disabled></div>
      <div class="form-group"><label>E-mail</label><input class="form-input" type="email" id="adm-perfil-email" value="${me.email||''}"></div>
      <div class="form-group"><label>Perfil</label><input class="form-input" value="${perfilLabel}" disabled></div>
    </div></div>
    <div class="card-panel"><div class="card-panel-header"><h3>Segurança</h3></div><div class="card-panel-body">
      <div class="info-banner" style="margin-bottom:14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>${isMaster?'Você é o <strong>Administrador Master</strong>. Apenas você pode alterar sua própria senha.':'Sua senha pode ser resetada pelo Administrador Master caso necessário.'}</div>
      <div class="form-group"><label>Senha Atual</label><input class="form-input" type="password" id="adm-perfil-senha-atual" placeholder="Digite sua senha atual"></div>
      <div class="form-group"><label>Nova Senha</label><input class="form-input" type="password" id="adm-perfil-senha-nova" placeholder="Nova senha"></div>
      <div class="form-group"><label>Confirmar Nova Senha</label><input class="form-input" type="password" id="adm-perfil-senha-confirma" placeholder="Confirme a nova senha"></div>
      <div style="display:flex;justify-content:flex-end;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="salvarSenhaAdminPerfil()">Alterar Senha</button></div>
    </div></div>
  </div>
  <div class="card-panel" style="margin-top:14px">
    <div class="card-panel-header"><h3>Teste de Alertas (Admin / Suporte / Dev)</h3></div>
    <div class="card-panel-body">
      <p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:12px">Envie uma mensagem de teste para validar os canais de alerta do portal.</p>
      <div class="grid-3" style="gap:12px">
        <div>
          <div class="form-group"><label>E-mail</label><input class="form-input" id="notif-admin-email-destino" value="${me.email||''}" placeholder="email@dominio.com"></div>
          <div class="inline-row"><button class="btn btn-outline btn-sm" onclick="enviarTesteAlertaAdmin('email')">Testar e-mail</button><span id="notif-admin-email-status" class="notif-status">Aguardando teste</span></div>
        </div>
        <div>
          <div class="form-group"><label>WhatsApp</label><input class="form-input" id="notif-admin-whatsapp-destino" placeholder="(71) 99999-9999"></div>
          <div class="inline-row"><button class="btn btn-outline btn-sm" onclick="enviarTesteAlertaAdmin('whatsapp')">Testar WhatsApp</button><span id="notif-admin-whatsapp-status" class="notif-status">Aguardando teste</span></div>
        </div>
        <div>
          <div class="form-group"><label>SMS</label><input class="form-input" id="notif-admin-sms-destino" placeholder="(71) 98888-8888"></div>
          <div class="inline-row"><button class="btn btn-outline btn-sm" onclick="enviarTesteAlertaAdmin('sms')">Testar SMS</button><span id="notif-admin-sms-status" class="notif-status">Aguardando teste</span></div>
        </div>
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:12px;gap:8px"><button class="btn btn-ghost btn-sm">Cancelar</button><button class="btn btn-primary btn-sm" onclick="salvarAdminPerfil()">Salvar Perfil</button></div>
</div>`};
function salvarAdminPerfil(){
  const users=getAdminUsers();
  const me=users.find(u=>u.login===currentAdminLogin);
  if(!me)return;
  const nome=document.getElementById('adm-perfil-nome')?.value.trim();
  const email=document.getElementById('adm-perfil-email')?.value.trim();
  if(!nome){alert('O nome é obrigatório.');return}
  me.nome=nome;me.email=email;
  saveAdminUsers(users);
  localStorage.setItem('crc_admin_name',nome);
  applySidebarVisibility();
  alert('Perfil atualizado!');
  navigate('perfil');
}
function salvarSenhaAdminPerfil(){
  const users=getAdminUsers();
  const me=users.find(u=>u.login===currentAdminLogin);
  if(!me)return;
  const atual=document.getElementById('adm-perfil-senha-atual')?.value;
  const nova=document.getElementById('adm-perfil-senha-nova')?.value;
  const confirma=document.getElementById('adm-perfil-senha-confirma')?.value;
  if(!atual){alert('Digite sua senha atual.');return}
  if(me.senha!==atual){alert('Senha atual incorreta.');return}
  if(!nova||nova.length<4){alert('A nova senha deve ter pelo menos 4 caracteres.');return}
  if(nova!==confirma){alert('As senhas não conferem.');return}
  me.senha=nova;
  saveAdminUsers(users);
  alert('Senha alterada com sucesso!');
  document.getElementById('adm-perfil-senha-atual').value='';
  document.getElementById('adm-perfil-senha-nova').value='';
  document.getElementById('adm-perfil-senha-confirma').value='';
}

/* ── FAQ ── */
pages.faq=()=>`<div class="module-page">
  <div class="page-header"><h1>Perguntas e Respostas</h1><p>Dúvidas frequentes.</p></div>
  <input class="form-input" placeholder="Buscar..." style="max-width:400px;margin-bottom:14px">
  <div class="faq-categories">${['Todos','IPTU','ISS/NFSe','Dívida','Certidões','Portal'].map((c,i)=>`<span class="faq-tag${i===0?' active':''}">${c}</span>`).join('')}</div>
  ${[['Como acessar com Gov.BR?','Clique "Entrar com Gov.BR" na tela de login. Seu nível determina os serviços disponíveis.'],['Como emitir 2ª via?','Acesse "2ª Via Documentos". Todos os seus débitos já aparecem — basta clicar "Gerar".'],['Como simular acordo?','Em "Acordo da Dívida", os débitos são selecionados automaticamente. Escolha a forma de pagamento e veja o resultado.'],['Como alterar meu endereço?','Acesse "Meu Perfil" e edite os campos de endereço.'],['O que é o ITIV?','Imposto de transmissão de imóveis. Acesse "ITIV Online" para calcular.']].map(([q,a])=>`<div class="faq-item"><div class="faq-question" onclick="const x=this.nextElementSibling;x.style.display=x.style.display==='none'?'block':'none'"><span>${q}</span><span style="color:var(--text-muted)">▾</span></div><div class="faq-answer" style="display:none">${a}</div></div>`).join('')}
</div>`;

/* ── CONFIGURAÇÕES DO SISTEMA (DEV) — COM ABAS ── */
let cfgTab='entidade';
function switchCfgTab(tab){cfgTab=tab;document.getElementById('cfg-tab-content').innerHTML=CFG_TABS[tab]();document.querySelectorAll('.cfg-tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='modulos')setTimeout(renderModulesGrid,30);if(tab==='usuarios')setTimeout(renderAdminUsersTable,30);if(tab==='entidade')setTimeout(populateEntidadeConfig,30);if(tab==='ia')setTimeout(populateConfigIA,30);if(tab==='procuracao_tpl')setTimeout(populateTemplateProcuracao,30);if(tab==='contribuintes')setTimeout(renderContribuintesAdmin,30);if(tab==='config'){setTimeout(populateTributosConfig,30);setTimeout(populateNotificacoesConfig,30);}}

pages.config_dev=()=>{
  const tabs=['entidade','govbr','ia','procuracao_tpl','modulos','usuarios','contribuintes','config','logs'];
  const labels={entidade:'Entidade',govbr:'Gov.BR',ia:'IA Chatbot',procuracao_tpl:'Procuração',modulos:'Módulos',usuarios:'Usuários',contribuintes:'Contribuintes',config:'Integrações',logs:'Logs'};
  return `<div class="module-page">
  <div class="page-header"><h1>Configurações do Sistema</h1><p>Painel exclusivo — admin, suporte e desenvolvedores.</p></div>
  <div class="info-banner warning"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Acesso restrito. Logado como: <strong>${localStorage.getItem('crc_admin_name')||'Admin'}</strong> (${(localStorage.getItem('crc_admin_perfil')||'admin').toUpperCase()})${isLoggedAsMaster()?' — <strong style="color:var(--accent)">MASTER</strong>':''}</div>
  <div class="cfg-tabs-wrapper">
    ${tabs.map(t=>`<button class="cfg-tab-btn${t===cfgTab?' active':''}" data-tab="${t}" onclick="switchCfgTab('${t}')">${labels[t]}</button>`).join('')}
  </div>
  <div id="cfg-tab-content">${CFG_TABS[cfgTab]()}</div>
</div>`;
};

const CFG_TABS={};

/* ── ABA: ENTIDADE ── */
function getEntidadeConfig(){try{return JSON.parse(localStorage.getItem('crc_entidade_config'))||{}}catch(e){return{}}}
async function saveEntidadeConfig(){
  const c=getEntidadeConfig();
  c.nome=document.getElementById('ent-nome')?.value||'';c.cnpj=document.getElementById('ent-cnpj')?.value||'';
  c.ibge=document.getElementById('ent-ibge')?.value||'';c.uf=document.getElementById('ent-uf')?.value||'BA';
  c.responsavel=document.getElementById('ent-responsavel')?.value||'';c.email=document.getElementById('ent-email')?.value||'';
  c.telefone=document.getElementById('ent-telefone')?.value||'';c.endereco=document.getElementById('ent-endereco')?.value||'';
  localStorage.setItem('crc_entidade_config',JSON.stringify(c));
  try{
    await fetch('/api/v1/entidade/config',{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(c)
    });
    alert('Entidade salva! O logotipo e dados serão usados no cabeçalho dos documentos.');
  }catch(_err){
    alert('Entidade salva localmente. Não foi possível sincronizar no servidor agora.');
  }
}
function populateEntidadeConfig(){const c=getEntidadeConfig();['nome','cnpj','ibge','uf','responsavel','email','telefone','endereco'].forEach(k=>{const el=document.getElementById('ent-'+k);if(el&&c[k])el.value=c[k]});const logo=document.getElementById('ent-logo-preview');if(logo&&c.logo){logo.innerHTML=`<img src="${c.logo}" alt="Logotipo">`;logo.style.display='flex'}}
function handleEntidadeLogoUpload(e){
  const f=e.target.files[0];if(!f)return;
  if(f.type==='image/svg+xml'){
    alert('Logo em SVG nao e suportado para emissao de PDF. Use PNG, JPG ou WEBP.');
    e.target.value='';
    return;
  }
  const r=new FileReader();
  r.onload=function(ev){
    const c=getEntidadeConfig();c.logo=ev.target.result;
    localStorage.setItem('crc_entidade_config',JSON.stringify(c));
    const p=document.getElementById('ent-logo-preview');
    if(p){p.innerHTML='<img src="'+ev.target.result+'" alt="Logotipo">';p.style.display='flex'}
  };
  r.readAsDataURL(f);
}
CFG_TABS.entidade=()=>{
  const c=getEntidadeConfig();
  return `
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Cadastro de Entidade</h3><span class="status-badge green">Vinculada</span></div>
    <div class="card-panel-body">
      <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:14px">Cadastre a entidade (município/órgão) para integração e exibição no cabeçalho dos documentos gerados.</p>
      <div class="form-group" style="margin-bottom:16px">
        <label>Logotipo do Município</label>
        <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:8px">Usado no cabeçalho de certidões, boletos, guias e demais documentos.</p>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div id="ent-logo-preview" class="entidade-logo-preview" style="display:${c.logo?'flex':'none'}">${c.logo?`<img src="${c.logo}" alt="Logotipo">`:'<span style="font-size:.7rem;color:var(--text-muted)">Sem logo</span>'}</div>
          <div><input type="file" id="ent-logo-upload" accept="image/png,image/jpeg,image/webp" onchange="handleEntidadeLogoUpload(event)" style="display:none"><button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('ent-logo-upload').click()">${c.logo?'Trocar':'Enviar'} Logotipo</button></div>
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Nome da Entidade *</label><input class="form-input" id="ent-nome" placeholder="Ex: Prefeitura Municipal de..." value="${c.nome||''}"></div>
        <div class="form-group"><label>CNPJ *</label><input class="form-input" id="ent-cnpj" placeholder="00.000.000/0001-00" value="${c.cnpj||''}"></div>
        <div class="form-group"><label>Código IBGE</label><input class="form-input" id="ent-ibge" placeholder="0000000" value="${c.ibge||''}"></div>
        <div class="form-group"><label>UF</label><select class="form-select" id="ent-uf"><option value="">Selecione...</option>${['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(u=>`<option value="${u}" ${(c.uf||'BA')===u?'selected':''}>${u}</option>`).join('')}</select></div>
        <div class="form-group"><label>Responsável</label><input class="form-input" id="ent-responsavel" placeholder="Secretaria / Setor" value="${c.responsavel||''}"></div>
        <div class="form-group"><label>E-mail Institucional</label><input class="form-input" type="email" id="ent-email" placeholder="fazenda@municipio.gov.br" value="${c.email||''}"></div>
        <div class="form-group"><label>Telefone</label><input class="form-input" type="tel" id="ent-telefone" placeholder="(XX) XXXX-XXXX" value="${c.telefone||''}"></div>
        <div class="form-group"><label>Endereço</label><input class="form-input" id="ent-endereco" placeholder="Rua, nº — Bairro — Cidade/UF" value="${c.endereco||''}"></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-primary btn-sm" onclick="saveEntidadeConfig()">Salvar Entidade</button></div>
    </div>
  </div>
  <div class="card-panel">
    <div class="card-panel-header"><h3>Integrações Técnicas</h3></div>
    <div class="card-panel-body">
      <div class="info-banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>As configurações de integração de <strong>Tributos + Notificações + Testes</strong> foram centralizadas na aba <strong>Integrações</strong>.</div>
      <div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn btn-primary btn-sm" onclick="switchCfgTab('config')">Abrir Integrações</button></div>
    </div>
  </div>`;
};

/* ── ABA: GOV.BR ── */
CFG_TABS.govbr=()=>`
  <div class="card-panel">
    <div class="card-panel-header"><h3>Integração Gov.BR — Convênio Municipal</h3><span class="status-badge green">Ativo</span></div>
    <div class="card-panel-body">
      <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:14px">Configure o convênio com o Gov.BR para autenticação, assinatura digital e níveis de acesso.</p>
      <div class="grid-2">
        <div class="form-group"><label>Client ID</label><input class="form-input" placeholder="Fornecido pelo Gov.BR"></div>
        <div class="form-group"><label>Client Secret</label><input class="form-input" type="password" placeholder="Chave secreta"></div>
        <div class="form-group"><label>URL de Callback</label><input class="form-input" placeholder="https://seuportal.gov.br/auth/callback"></div>
        <div class="form-group"><label>Ambiente</label><select class="form-select"><option>Produção</option><option>Homologação</option><option selected>Desenvolvimento</option></select></div>
      </div>
      <div style="margin-top:14px;font-size:.84rem;font-weight:600;margin-bottom:8px">Serviços Habilitados:</div>
      <div class="grid-3">
        ${[['Autenticação de Cidadãos','Login via Gov.BR',true],['Assinatura Digital','Documentos e certidões',true],['Validação de Identidade','CPF autenticado',true],['Selo de Confiabilidade','Selo Gov.BR no portal',true],['Notificação Gov.BR','Via plataforma federal',false],['Biometria Facial','Reconhecimento facial',false]].map(([t,d,on])=>`<label class="cfg-option-card"><input class="cfg-option-check" type="checkbox" ${on?'checked':''} style="margin-top:2px"><div><div style="font-size:.82rem;font-weight:600">${t}</div><div style="font-size:.72rem;color:var(--text-muted)">${d}</div></div></label>`).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-outline btn-sm">Testar Conexão</button><button class="btn btn-primary btn-sm">Salvar Gov.BR</button></div>
    </div>
  </div>`;

/* ── ABA: IA CHATBOT ── */
function getConfigIA(){try{return JSON.parse(localStorage.getItem('crc_config_ia'))||{}}catch(e){return{}}}
function saveConfigIA(){
  const apiKey=document.getElementById('ia-api-key')?.value||'';
  const prompt=document.getElementById('ia-prompt')?.value||'';
  const provedor=document.getElementById('ia-provedor')?.value||'openai';
  const modelo=document.getElementById('ia-modelo')?.value||'';
  const temp=document.getElementById('ia-temp')?.value||'0.3';
  localStorage.setItem('crc_config_ia',JSON.stringify({apiKey,prompt,provedor,modelo,temperatura:temp}));
  alert('Configurações da IA salvas! Token e prompt serão usados pelo chatbot.');}
function populateConfigIA(){const c=getConfigIA();const el=document.getElementById('ia-api-key');if(el)el.value=c.apiKey||'';const p=document.getElementById('ia-prompt');if(p)p.value=c.prompt||'';const pr=document.getElementById('ia-provedor');if(pr)pr.value=c.provedor||'openai';const m=document.getElementById('ia-modelo');if(m)m.value=c.modelo||'';const t=document.getElementById('ia-temp');if(t)t.value=c.temperatura||'0.3'}
CFG_TABS.ia=()=>{
  const c=getConfigIA();
  const provs=[{v:'openai',l:'OpenAI (GPT-4o)'},{v:'anthropic',l:'Anthropic (Claude)'},{v:'google',l:'Google (Gemini)'},{v:'ollama',l:'LLM Local (Ollama)'}];
  return `
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Assistente IA — Chatbot</h3><span class="status-badge blue">Configurável</span></div>
    <div class="card-panel-body">
      <div class="info-banner"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><strong>Regra fundamental:</strong> O chatbot responde <strong>exclusivamente</strong> sobre serviços do Portal. Perguntas fora do escopo são bloqueadas.</div>
      <div class="grid-2" style="margin-top:14px">
        <div class="form-group"><label>Provedor de IA</label><select class="form-select" id="ia-provedor">${provs.map(p=>`<option value="${p.v}" ${(c.provedor||'openai')===p.v?'selected':''}>${p.l}</option>`).join('')}</select></div>
        <div class="form-group"><label>API Key / Token</label><input class="form-input" type="password" id="ia-api-key" placeholder="sk-..." value="${(c.apiKey||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}"></div>
        <div class="form-group"><label>Modelo</label><input class="form-input" id="ia-modelo" placeholder="gpt-4o-mini" value="${c.modelo||''}"></div>
        <div class="form-group"><label>Temperatura</label><input class="form-input" type="number" id="ia-temp" value="${c.temperatura||'0.3'}" min="0" max="1" step="0.1"></div>
      </div>
      <div class="form-group" style="margin-top:8px"><label>System Prompt</label><textarea class="form-textarea" id="ia-prompt" style="min-height:100px" placeholder="Defina a personalidade e regras do assistente...">${(c.prompt||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-outline btn-sm">Testar Chatbot</button><button class="btn btn-primary btn-sm" onclick="saveConfigIA()">Salvar IA</button></div>
    </div>
  </div>
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Temas Bloqueados</h3></div>
    <div class="card-panel-body">
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${['Política','Prefeito(a)','Vereadores','Culinária','Entretenimento','Esportes','Fofoca','Religião','Opinião pessoal','Dados de servidores','Salários','Licitações','Outros municípios'].map(t=>`<span class="faq-tag active" style="cursor:default;font-size:.75rem">${t}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:10px"><div class="form-group" style="margin:0;flex:1"><input class="form-input" placeholder="Adicionar tema..."></div><button class="btn btn-sm btn-outline">+ Adicionar</button></div>
    </div>
  </div>
  <div class="card-panel">
    <div class="card-panel-header"><h3>Respostas Pré-Configuradas</h3></div>
    <div class="card-panel-body" style="padding:0;overflow-x:auto">
      <table class="data-table"><thead><tr><th>Gatilho</th><th>Resposta</th><th>Ação</th></tr></thead><tbody>
        <tr><td style="font-weight:600;white-space:nowrap">Fora do escopo</td><td style="font-size:.8rem">Desculpe, só posso ajudar com assuntos do Portal.</td><td><button class="table-action-btn">Editar</button></td></tr>
        <tr><td style="font-weight:600;white-space:nowrap">Saudação</td><td style="font-size:.8rem">Olá! Sou o assistente do CRC. O que precisa?</td><td><button class="table-action-btn">Editar</button></td></tr>
        <tr><td style="font-weight:600;white-space:nowrap">Horário</td><td style="font-size:.8rem">Portal 24h. Presencial: seg-sex 8h-17h.</td><td><button class="table-action-btn">Editar</button></td></tr>
      </tbody></table>
    </div>
  </div>`;
};

/* ── ABA: TEMPLATE PROCURAÇÃO ── */
const DEFAULT_TEMPLATE_PROC=`Pelo presente instrumento particular de procuração, {outorgante_nome}, inscrito(a) no CPF sob o nº {outorgante_cpf}, residente e domiciliado(a) em {outorgante_endereco}, doravante denominado(a) OUTORGANTE, nomeia e constitui como seu(sua) bastante procurador(a):

{procurador_nome}, inscrito(a) no CPF/CNPJ sob o nº {procurador_cpf_cnpj}, com endereço em {procurador_endereco}, e-mail {procurador_email}, doravante denominado(a) PROCURADOR(A).

## PODERES

O(A) OUTORGANTE confere ao(à) PROCURADOR(A) poderes específicos e limitados para, em seu nome, acessar e operar os seguintes módulos do Portal do Contribuinte (CRC) do(a) {entidade_nome}:

{sistemas}

## VIGÊNCIA

A presente procuração terá validade até {vigencia}, podendo ser revogada a qualquer tempo pelo(a) OUTORGANTE por meio do próprio Portal.

## RESPONSABILIDADES

O(A) PROCURADOR(A) compromete-se a utilizar os acessos concedidos exclusivamente para os fins autorizados, respondendo por qualquer uso indevido ou que extrapole os limites desta procuração.

O(A) OUTORGANTE declara estar ciente de que todos os atos praticados pelo(a) PROCURADOR(A) no âmbito desta procuração serão considerados como praticados pelo(a) próprio(a) OUTORGANTE.

## ASSINATURA

Documento assinado eletronicamente via Gov.BR em {data_assinatura}, com validade jurídica nos termos da Medida Provisória nº 2.200-2/2001 e do Decreto nº 10.543/2020.

{entidade_nome} — CNPJ: {entidade_cnpj}
Data: {data} — Hora: {hora}`;

function getTemplateProcuracao(){
  const saved=localStorage.getItem('crc_template_procuracao');
  if(saved&&saved.trimStart().startsWith('## PROCURAÇÃO ELETRÔNICA')){localStorage.removeItem('crc_template_procuracao');return DEFAULT_TEMPLATE_PROC}
  return saved||DEFAULT_TEMPLATE_PROC;
}
function saveTemplateProcuracao(){
  const perfil=localStorage.getItem('crc_admin_perfil')||'';
  if(perfil!=='master'&&perfil!=='dev'&&perfil!=='suporte'){alert('Apenas Dev, Suporte ou Master podem alterar o modelo.');return}
  const t=document.getElementById('tpl-proc-editor')?.value;
  if(!t||!t.trim()){alert('O modelo não pode ficar vazio.');return}
  localStorage.setItem('crc_template_procuracao',t);
  alert('Modelo de procuração salvo!');
}
function resetTemplateProcuracao(){
  if(!confirm('Restaurar o modelo padrão? As alterações serão perdidas.'))return;
  localStorage.removeItem('crc_template_procuracao');
  populateTemplateProcuracao();
  alert('Modelo restaurado ao padrão.');
}
function populateTemplateProcuracao(){
  const el=document.getElementById('tpl-proc-editor');
  if(el)el.value=getTemplateProcuracao();
}
const TPL_PLACEHOLDERS=[
  ['{outorgante_nome}','Nome completo do outorgante (contribuinte)'],
  ['{outorgante_cpf}','CPF do outorgante'],
  ['{outorgante_endereco}','Endereço do outorgante'],
  ['{procurador_nome}','Nome/Razão Social do procurador'],
  ['{procurador_cpf_cnpj}','CPF ou CNPJ do procurador'],
  ['{procurador_razao_social}','Razão Social (se CNPJ)'],
  ['{procurador_endereco}','Endereço do procurador'],
  ['{procurador_email}','E-mail do procurador'],
  ['{sistemas}','Lista de módulos autorizados'],
  ['{vigencia}','Data de vigência da procuração'],
  ['{data_assinatura}','Data/hora da assinatura Gov.BR'],
  ['{entidade_nome}','Nome do município/entidade'],
  ['{entidade_cnpj}','CNPJ da entidade'],
  ['{data}','Data atual (dd/mm/aaaa)'],
  ['{hora}','Hora atual (hh:mm:ss)'],
];
CFG_TABS.procuracao_tpl=()=>{
  const perfil=localStorage.getItem('crc_admin_perfil')||'';
  const canEdit=perfil==='master'||perfil==='dev'||perfil==='suporte';
  return `
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Modelo de Procuração Eletrônica</h3><span class="status-badge ${canEdit?'green':'orange'}">${canEdit?'Editável':'Somente Leitura'}</span></div>
    <div class="card-panel-body">
      <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:14px">Este modelo é usado para gerar o PDF de todas as procurações. Use os placeholders abaixo para inserir dados dinâmicos. Linhas começando com <code>##</code> serão títulos de seção.</p>
      <textarea class="form-textarea" id="tpl-proc-editor" style="min-height:350px;font-family:monospace;font-size:.82rem;line-height:1.6" ${canEdit?'':'disabled'}>${getTemplateProcuracao().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
      ${canEdit?`<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" onclick="resetTemplateProcuracao()">Restaurar Padrão</button><button class="btn btn-primary btn-sm" onclick="saveTemplateProcuracao()">Salvar Modelo</button></div>`:'<p style="font-size:.78rem;color:var(--text-muted);margin-top:8px">Apenas Dev, Suporte ou Master podem editar o modelo.</p>'}
    </div>
  </div>
  <div class="card-panel">
    <div class="card-panel-header"><h3>Placeholders Disponíveis</h3></div>
    <div class="card-panel-body" style="padding:0;overflow-x:auto">
      <table class="data-table"><thead><tr><th>Placeholder</th><th>Descrição</th><th>Ação</th></tr></thead><tbody>
        ${TPL_PLACEHOLDERS.map(([p,d])=>`<tr><td><code style="background:var(--accent-glow2);padding:2px 6px;border-radius:4px;font-size:.78rem;font-weight:600;color:var(--accent)">${p}</code></td><td style="font-size:.82rem">${d}</td><td><button class="table-action-btn" onclick="navigator.clipboard.writeText('${p}');alert('Copiado!')">Copiar</button></td></tr>`).join('')}
      </tbody></table>
    </div>
  </div>
  <div class="card-panel" style="margin-top:16px">
    <div class="card-panel-header"><h3>Integração Receita Federal</h3><span class="status-badge green">Ativa</span></div>
    <div class="card-panel-body">
      <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:14px">Ao criar uma procuração, o sistema consulta automaticamente os dados do procurador:</p>
      <div class="grid-2">
        <div class="card-panel" style="margin-bottom:0"><div class="card-panel-body" style="text-align:center;padding:16px">
          <div style="font-weight:700;font-size:.9rem;margin-bottom:4px">CNPJ</div>
          <div style="font-size:.78rem;color:var(--text-muted)">BrasilAPI (pública)</div>
          <span class="status-badge green" style="margin-top:8px">Disponível</span>
          <p style="font-size:.72rem;color:var(--text-muted);margin-top:6px">Retorna: razão social, endereço, CNAE, sócios, situação cadastral</p>
        </div></div>
        <div class="card-panel" style="margin-bottom:0"><div class="card-panel-body" style="text-align:center;padding:16px">
          <div style="font-weight:700;font-size:.9rem;margin-bottom:4px">CPF</div>
          <div style="font-size:.78rem;color:var(--text-muted)">InfoJud / Serpro</div>
          <span class="status-badge orange" style="margin-top:8px">Pendente</span>
          <p style="font-size:.72rem;color:var(--text-muted);margin-top:6px">Retornará apenas o nome após assinatura Gov.BR. Integrar InfoJud para dados completos.</p>
        </div></div>
      </div>
    </div>
  </div>`;
};

/* ── ABA: MÓDULOS ── */
CFG_TABS.modulos=()=>`
  <div class="card-panel">
    <div class="card-panel-header"><h3>Módulos do Menu — Habilitar / Desabilitar</h3></div>
    <div class="card-panel-body">
      <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:14px">Habilite apenas os módulos contratados pelo município. Módulos desabilitados não aparecerão no menu dos contribuintes.</p>
      <div class="grid-3" id="modules-grid"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-primary btn-sm" onclick="saveModulesFromUI()">Salvar Módulos</button></div>
    </div>
  </div>`;

/* ── ABA: USUÁRIOS ADMIN ── */
CFG_TABS.usuarios=()=>{
  const isMaster=isLoggedAsMaster();
  return `
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Usuários do Sistema</h3><button class="btn btn-sm btn-primary" onclick="showNewUserForm()">+ Novo Usuário</button></div>
    <div class="card-panel-body">
      <div class="info-banner${isMaster?'':' warning'}" style="margin-bottom:14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${isMaster?'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'}</svg>${isMaster?'Você é o <strong>Administrador Master</strong>. Apenas você pode excluir usuários e ninguém pode alterar sua senha.':'Você não é o Master. Apenas o Master pode excluir usuários. Você pode editar dados e resetar senhas de outros usuários (exceto o Master).'}</div>
      <div id="admin-users-table"></div>
    </div>
  </div>
  <div class="card-panel" id="new-user-form-panel" style="display:none">
    <div class="card-panel-header"><h3 id="user-form-title">Novo Usuário</h3></div>
    <div class="card-panel-body">
      <div class="grid-2">
        <div class="form-group"><label>Nome Completo *</label><input class="form-input" id="nu-nome" placeholder="Nome do usuário"></div>
        <div class="form-group"><label>E-mail *</label><input class="form-input" type="email" id="nu-email" placeholder="email@empresa.com"></div>
        <div class="form-group"><label>Login *</label><input class="form-input" id="nu-login" placeholder="Login de acesso"></div>
        <div class="form-group"><label>Senha *</label><input class="form-input" type="password" id="nu-senha" placeholder="Senha"></div>
        <div class="form-group"><label>Perfil *</label><select class="form-select" id="nu-perfil"><option value="admin">Administrador</option><option value="suporte">Suporte</option><option value="dev">Desenvolvedor</option></select></div>
        <div class="form-group"><label>Status</label><select class="form-select" id="nu-ativo"><option value="true">Ativo</option><option value="false">Inativo</option></select></div>
      </div>
      <input type="hidden" id="nu-edit-id" value="">
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-ghost btn-sm" onclick="document.getElementById('new-user-form-panel').style.display='none'">Cancelar</button><button class="btn btn-primary btn-sm" onclick="saveNewUser()">Salvar Usuário</button></div>
    </div>
  </div>`;
};

/* ── ABA: CONFIG GERAIS ── */
function populateTributosConfig(){
  fetch('/api/v1/integracoes/tributos')
    .then(r=>r.json())
    .then(({config})=>{
      if(!config)return;
      const map={apiBaseUrl:'cfg-trib-api-url',authType:'cfg-trib-auth-type',authToken:'cfg-trib-auth-token',healthPath:'cfg-trib-health-path',timeoutMs:'cfg-trib-timeout',sincronizacao:'cfg-trib-sync'};
      Object.entries(map).forEach(([k,id])=>{const el=document.getElementById(id);if(el&&config[k]!==undefined)el.value=config[k];});
      (config.recursos||[]).forEach((k)=>{const el=document.getElementById(`cfg-trib-recurso-${k}`);if(el)el.checked=true;});
    })
    .catch(()=>{});
}
async function salvarTributosConfig(){
  const recursos=['cadastro','imobiliario','economico','lancamentos','divida','parcelamentos'].filter((k)=>document.getElementById(`cfg-trib-recurso-${k}`)?.checked);
  const payload={
    apiBaseUrl:document.getElementById('cfg-trib-api-url')?.value||'',
    authType:document.getElementById('cfg-trib-auth-type')?.value||'bearer',
    authToken:document.getElementById('cfg-trib-auth-token')?.value||'',
    healthPath:document.getElementById('cfg-trib-health-path')?.value||'/health',
    timeoutMs:Number(document.getElementById('cfg-trib-timeout')?.value||10000),
    sincronizacao:document.getElementById('cfg-trib-sync')?.value||'15min',
    recursos
  };
  const r=await fetch('/api/v1/integracoes/tributos',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){alert(j.erro||'Não foi possível salvar a integração de tributos.');return;}
  alert('Integração de tributos salva com sucesso.');
}
async function testarTributosConfig(){
  const payload={
    apiBaseUrl:document.getElementById('cfg-trib-api-url')?.value||'',
    authType:document.getElementById('cfg-trib-auth-type')?.value||'bearer',
    authToken:document.getElementById('cfg-trib-auth-token')?.value||'',
    healthPath:document.getElementById('cfg-trib-health-path')?.value||'/health',
    timeoutMs:Number(document.getElementById('cfg-trib-timeout')?.value||10000),
  };
  const r=await fetch('/api/v1/integracoes/tributos/testar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.ok){alert(j.erro||`Falha ao testar conexão (${j.status||'sem status'}).`);return;}
  alert(`Conexão com tributos OK (HTTP ${j.status}).`);
}
function populateNotificacoesConfig(){
  fetch('/api/v1/notificacoes/config')
    .then(r=>r.json())
    .then(({config})=>{
      if(!config)return;
      const map={emailWebhookUrl:'cfg-notif-email-webhook',whatsappWebhookUrl:'cfg-notif-whatsapp-webhook',smsWebhookUrl:'cfg-notif-sms-webhook',remetentePadrao:'cfg-notif-remetente'};
      Object.entries(map).forEach(([k,id])=>{const el=document.getElementById(id);if(el&&config[k]!==undefined)el.value=config[k];});
      const testMap={email:'cfg-test-email-destino',whatsapp:'cfg-test-whatsapp-destino',sms:'cfg-test-sms-destino'};
      Object.entries(testMap).forEach(([k,id])=>{const el=document.getElementById(id);if(el&&!el.value)el.value=k==='email'?'teste@prefeitura.ba.gov.br':'(71) 99999-9999';});
    })
    .catch(()=>{});
}
async function salvarNotificacoesConfig(){
  const payload={
    emailWebhookUrl:document.getElementById('cfg-notif-email-webhook')?.value||'',
    whatsappWebhookUrl:document.getElementById('cfg-notif-whatsapp-webhook')?.value||'',
    smsWebhookUrl:document.getElementById('cfg-notif-sms-webhook')?.value||'',
    remetentePadrao:document.getElementById('cfg-notif-remetente')?.value||'Portal CRC'
  };
  const r=await fetch('/api/v1/notificacoes/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){alert(j.erro||'Não foi possível salvar configuração de notificações.');return;}
  alert('Configuração de notificações salva com sucesso.');
}
CFG_TABS.config=()=>`
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Integração com Sistema de Tributos (API)</h3></div>
    <div class="card-panel-body">
      <div class="info-banner" style="margin-bottom:12px">Configure aqui os dados de conexão com o sistema tributário e teste o endpoint antes de colocar em produção.</div>
      <div class="grid-2">
        <div class="form-group"><label>URL Base da API</label><input class="form-input" id="cfg-trib-api-url" placeholder="https://api.tributos.gov.br"></div>
        <div class="form-group"><label>Path de Health Check</label><input class="form-input" id="cfg-trib-health-path" placeholder="/health"></div>
        <div class="form-group"><label>Autenticação</label><select class="form-select" id="cfg-trib-auth-type"><option value="bearer">Bearer Token</option><option value="x-api-key">x-api-key</option><option value="none">Sem autenticação</option></select></div>
        <div class="form-group"><label>Token / API Key</label><input class="form-input" id="cfg-trib-auth-token" type="password" placeholder="Chave de integração"></div>
        <div class="form-group"><label>Timeout (ms)</label><input class="form-input" id="cfg-trib-timeout" type="number" value="10000" min="1000" step="500"></div>
        <div class="form-group"><label>Sincronização</label><select class="form-select" id="cfg-trib-sync"><option value="tempo-real">Tempo real</option><option value="15min">A cada 15 min</option><option value="1h">A cada 1 hora</option><option value="manual">Manual</option></select></div>
      </div>
      <div class="grid-3" style="margin-top:10px">
        ${[['cadastro','Cadastro de Contribuintes'],['imobiliario','Inscrições Imobiliárias'],['economico','Inscrições Econômicas'],['lancamentos','Lançamentos Tributários'],['divida','Dívida Ativa'],['parcelamentos','Parcelamentos/Acordos']].map(([k,t])=>`<label class="cfg-option-card"><input class="cfg-option-check" id="cfg-trib-recurso-${k}" type="checkbox"><div><div style="font-size:.82rem;font-weight:600">${t}</div></div></label>`).join('')}
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-outline btn-sm" onclick="testarTributosConfig()">Testar Conexão</button><button class="btn btn-primary btn-sm" onclick="salvarTributosConfig()">Salvar Integração</button></div>
    </div>
  </div>
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Configuração de Envio de Alertas</h3></div>
    <div class="card-panel-body">
      <p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:10px">Opcional: informe webhooks dos provedores para envio real. Se vazio, o sistema permanece em modo simulado.</p>
      <div class="grid-2">
        <div class="form-group"><label>Webhook E-mail</label><input class="form-input" id="cfg-notif-email-webhook" placeholder="https://provider/email/send"></div>
        <div class="form-group"><label>Webhook WhatsApp</label><input class="form-input" id="cfg-notif-whatsapp-webhook" placeholder="https://provider/whatsapp/send"></div>
        <div class="form-group"><label>Webhook SMS</label><input class="form-input" id="cfg-notif-sms-webhook" placeholder="https://provider/sms/send"></div>
        <div class="form-group"><label>Remetente padrão</label><input class="form-input" id="cfg-notif-remetente" placeholder="Portal CRC"></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-primary btn-sm" onclick="salvarNotificacoesConfig()">Salvar Configuração de Envio</button></div>
    </div>
  </div>
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Teste Operacional de Envio</h3></div>
    <div class="card-panel-body">
      <p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:12px">Valide os canais com envio de teste (simulado ou via webhook, se configurado).</p>
      <div class="grid-3" style="gap:12px">
        <div>
          <div class="form-group"><label>Destino E-mail</label><input class="form-input" id="cfg-test-email-destino" placeholder="teste@prefeitura.ba.gov.br"></div>
          <div class="inline-row"><button class="btn btn-outline btn-sm" onclick="enviarTesteAlerta('email','cfg-test')">Testar e-mail</button><span id="cfg-test-email-status" class="notif-status">Aguardando teste</span></div>
        </div>
        <div>
          <div class="form-group"><label>Destino WhatsApp</label><input class="form-input" id="cfg-test-whatsapp-destino" placeholder="(71) 99999-9999"></div>
          <div class="inline-row"><button class="btn btn-outline btn-sm" onclick="enviarTesteAlerta('whatsapp','cfg-test')">Testar WhatsApp</button><span id="cfg-test-whatsapp-status" class="notif-status">Aguardando teste</span></div>
        </div>
        <div>
          <div class="form-group"><label>Destino SMS</label><input class="form-input" id="cfg-test-sms-destino" placeholder="(71) 98888-8888"></div>
          <div class="inline-row"><button class="btn btn-outline btn-sm" onclick="enviarTesteAlerta('sms','cfg-test')">Testar SMS</button><span id="cfg-test-sms-status" class="notif-status">Aguardando teste</span></div>
        </div>
      </div>
    </div>
  </div>
  <div class="card-panel">
    <div class="card-panel-header"><h3>Regras de Notificação ao Contribuinte</h3></div>
    <div class="card-panel-body">
      <p style="font-size:.84rem;color:var(--text-secondary);margin-bottom:14px">Defina quais tipos de notificação os contribuintes recebem quando ativam um canal (e-mail, WhatsApp ou SMS).</p>
      <div class="grid-2-gap8">
        ${[['Vencimento de tributos/boletos','Aviso antes do vencimento de IPTU, ISS, TFF, parcelas, etc.',true],['Caixa Postal','Novas mensagens da Prefeitura na Caixa Postal do contribuinte',true],['DEC / DTE (Domicílio Eletrônico)','Notificações fiscais oficiais e comunicados eletrônicos',true],['Campanhas de regularização','Avisos sobre programas de anistia, refis e descontos',false],['Emissão de documentos','Confirmação quando certidões, NFSe ou alvarás forem emitidos',false],['Alterações cadastrais','Quando houver mudança no cadastro imobiliário ou econômico',false]].map(([t,d,on])=>`<label class="cfg-option-card"><input class="cfg-option-check" type="checkbox" ${on?'checked':''}><div><div style="font-size:.82rem;font-weight:600">${t}</div><div style="font-size:.72rem;color:var(--text-muted)">${d}</div></div></label>`).join('')}
      </div>
    </div>
  </div>`;

/* ── ABA: LOGS ── */
CFG_TABS.logs=()=>{
  const procLogs=getProcLogs();
  const actionBadge={ATIVOU_PERFIL:'orange',DESATIVOU_PERFIL:'gray',NAVEGOU:'blue',ACESSO_NEGADO:'red'};
  return `
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header"><h3>Log de Atividades do Sistema</h3><button class="btn btn-sm btn-ghost">Exportar CSV</button></div>
    <div class="card-panel-body" style="padding:0;overflow-x:auto">
      <table class="data-table"><thead><tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Detalhe</th></tr></thead><tbody>
        <tr><td style="white-space:nowrap">13/03/26 10:42</td><td>admin</td><td><span class="status-badge blue">Config</span></td><td>Atualização do System Prompt</td></tr>
        <tr><td style="white-space:nowrap">12/03/26 16:18</td><td>dev</td><td><span class="status-badge green">Gov.BR</span></td><td>Teste de conexão — Sucesso</td></tr>
        <tr><td style="white-space:nowrap">11/03/26 09:05</td><td>admin</td><td><span class="status-badge orange">Chatbot</span></td><td>Bloqueio de tema: "Licitações"</td></tr>
      </tbody></table>
    </div>
  </div>
  <div class="card-panel">
    <div class="card-panel-header"><h3>Log de Procurações (acesso como procurador)</h3><span class="status-badge orange">${procLogs.length} registros</span></div>
    <div class="card-panel-body" style="padding:0;overflow-x:auto">
      ${procLogs.length?`<table class="data-table"><thead><tr><th>Data/Hora</th><th>Procurador</th><th>Outorgante</th><th>Ação</th><th>Detalhes</th></tr></thead><tbody>
        ${procLogs.slice(0,100).map(l=>`<tr><td style="white-space:nowrap;font-size:.78rem">${l.data}</td><td style="font-size:.82rem">${l.procurador}<br><span style="color:var(--text-muted);font-size:.72rem">${l.procurador_cpf}</span></td><td style="font-size:.82rem">${l.outorgante}<br><span style="color:var(--text-muted);font-size:.72rem">${l.outorgante_cpf}</span></td><td><span class="status-badge ${actionBadge[l.acao]||'gray'}">${l.acao}</span></td><td style="font-size:.8rem">${l.detalhes}</td></tr>`).join('')}
      </tbody></table>`:'<div style="text-align:center;padding:30px;color:var(--text-muted)">Nenhum log de procuração registrado.</div>'}
    </div>
  </div>`};


/* ── ABA: CONTRIBUINTES (simulação) ── */
CFG_TABS.contribuintes=()=>{
  return `
  <div class="card-panel" style="margin-bottom:16px">
    <div class="card-panel-header">
      <h3>Cadastro de Contribuintes — Simulação Gov.BR</h3>
      <button class="btn btn-sm btn-primary" onclick="showNovoContribuinteForm()">+ Novo Contribuinte</button>
    </div>
    <div class="info-banner info" style="margin:0 0 12px">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      Contribuintes cadastrados para simular login via Gov.BR. Em produção, esses dados virão automaticamente do SSO federal.
    </div>
    <div id="admin-contribuintes-table"></div>
  </div>
  <div id="contrib-edit-panel" style="display:none"></div>`;
};
function renderContribuintesAdmin(){
  const el=document.getElementById('admin-contribuintes-table');if(!el)return;
  const contribs=getContribuintes();
  el.innerHTML=`<div style="overflow-x:auto"><table class="data-table"><thead><tr><th style="width:40px">#</th><th>Nome</th><th>CPF</th><th>E-mail</th><th>Gov.BR</th><th style="width:140px">Ações</th></tr></thead><tbody>
    ${contribs.map((c,i)=>`<tr>
      <td style="font-weight:600;color:var(--text-muted)">${i+1}</td>
      <td><strong>${c.nome}</strong></td>
      <td style="font-family:monospace;font-size:.82rem">${c.cpf}</td>
      <td style="font-size:.82rem">${c.email||'—'}</td>
      <td><span class="status-badge ${c.govbr==='Ouro'?'green':c.govbr==='Prata'?'blue':'amber'}">${c.govbr}</span></td>
      <td style="display:flex;gap:6px">
        <button class="btn btn-sm btn-ghost" onclick="editContribuinte(${c.id})" title="Editar">Editar</button>
        <button class="btn btn-sm btn-ghost" style="color:var(--danger)" onclick="deleteContribuinte(${c.id})" title="Excluir">Excluir</button>
      </td>
    </tr>`).join('')}
  </tbody></table></div>`;
}
function showNovoContribuinteForm(editId){
  const panel=document.getElementById('contrib-edit-panel');if(!panel)return;
  const contribs=getContribuintes();
  const c=editId?contribs.find(x=>x.id==editId):null;
  const title=c?'Editar Contribuinte':'Novo Contribuinte';
  panel.style.display='block';
  panel.innerHTML=`
  <div class="card-panel">
    <div class="card-panel-header"><h3>${title}</h3><button class="btn btn-sm btn-ghost" onclick="document.getElementById('contrib-edit-panel').style.display='none'">Cancelar</button></div>
    <div class="card-panel-body">
      <input type="hidden" id="contrib-edit-id" value="${c?c.id:''}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group" style="grid-column:span 2"><label>Nome Completo</label><input type="text" id="ce-nome" class="form-control" value="${c?c.nome:''}" placeholder="Nome completo do contribuinte"></div>
        <div class="form-group"><label>CPF</label><input type="text" id="ce-cpf" class="form-control" value="${c?c.cpf:''}" placeholder="000.000.000-00" maxlength="14" oninput="maskCPF(this)"></div>
        <div class="form-group"><label>E-mail</label><input type="email" id="ce-email" class="form-control" value="${c?c.email:''}" placeholder="email@exemplo.com"></div>
        <div class="form-group"><label>Telefone</label><input type="text" id="ce-telefone" class="form-control" value="${c?c.telefone:''}" placeholder="(00) 00000-0000" maxlength="15" oninput="maskPhone(this)"></div>
        <div class="form-group"><label>Nível Gov.BR</label>
          <select id="ce-govbr" class="form-control">
            <option value="Ouro"${c&&c.govbr==='Ouro'?' selected':''}>Ouro</option>
            <option value="Prata"${c&&c.govbr==='Prata'?' selected':''}>Prata</option>
            <option value="Bronze"${c&&c.govbr==='Bronze'?' selected':''}>Bronze</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 2"><label>Endereço</label><input type="text" id="ce-endereco" class="form-control" value="${c?c.endereco:''}" placeholder="Rua, número — complemento"></div>
        <div class="form-group"><label>Bairro</label><input type="text" id="ce-bairro" class="form-control" value="${c?c.bairro:''}" placeholder="Bairro"></div>
        <div class="form-group"><label>Cidade</label><input type="text" id="ce-cidade" class="form-control" value="${c?c.cidade:''}" placeholder="Cidade"></div>
        <div class="form-group"><label>UF</label><input type="text" id="ce-uf" class="form-control" value="${c?c.uf:''}" maxlength="2" placeholder="BA" style="text-transform:uppercase"></div>
        <div class="form-group"><label>CEP</label><input type="text" id="ce-cep" class="form-control" value="${c?c.cep:''}" placeholder="00000-000" maxlength="9"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="document.getElementById('contrib-edit-panel').style.display='none'">Cancelar</button>
        <button class="btn btn-primary" onclick="saveContribuinteForm()">Salvar Contribuinte</button>
      </div>
    </div>
  </div>`;
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function maskCPF(el){
  let v=el.value.replace(/\D/g,'').slice(0,11);
  if(v.length>9)v=v.replace(/(\d{3})(\d{3})(\d{3})(\d+)/,'$1.$2.$3-$4');
  else if(v.length>6)v=v.replace(/(\d{3})(\d{3})(\d+)/,'$1.$2.$3');
  else if(v.length>3)v=v.replace(/(\d{3})(\d+)/,'$1.$2');
  el.value=v;
}
function maskPhone(el){
  let v=el.value.replace(/\D/g,'').slice(0,11);
  if(v.length>6)v=v.replace(/(\d{2})(\d{5})(\d+)/,'($1) $2-$3');
  else if(v.length>2)v=v.replace(/(\d{2})(\d+)/,'($1) $2');
  el.value=v;
}
function editContribuinte(id){showNovoContribuinteForm(id)}
function deleteContribuinte(id){
  if(!confirm('Excluir este contribuinte?'))return;
  let contribs=getContribuintes().filter(c=>c.id!=id);
  saveContribuintes(contribs);
  renderContribuintesAdmin();
  renderContribPicker();
}
function saveContribuinteForm(){
  const nome=document.getElementById('ce-nome').value.trim();
  const cpf=document.getElementById('ce-cpf').value.trim();
  if(!nome||!cpf){alert('Nome e CPF são obrigatórios.');return}
  const editId=document.getElementById('contrib-edit-id').value;
  const contribs=getContribuintes();
  const data={
    nome,cpf,
    email:document.getElementById('ce-email').value.trim(),
    telefone:document.getElementById('ce-telefone').value.trim(),
    govbr:document.getElementById('ce-govbr').value,
    endereco:document.getElementById('ce-endereco').value.trim(),
    bairro:document.getElementById('ce-bairro').value.trim(),
    cidade:document.getElementById('ce-cidade').value.trim(),
    uf:document.getElementById('ce-uf').value.trim().toUpperCase(),
    cep:document.getElementById('ce-cep').value.trim(),
  };
  if(editId){
    const idx=contribs.findIndex(c=>c.id==editId);
    if(idx>=0){contribs[idx]={...contribs[idx],...data}}
  }else{
    data.id=contribs.length?Math.max(...contribs.map(c=>c.id))+1:1;
    contribs.push(data);
  }
  saveContribuintes(contribs);
  renderContribuintesAdmin();
  renderContribPicker();
  document.getElementById('contrib-edit-panel').style.display='none';
  alert('Contribuinte salvo com sucesso!');
}

/* ── Render modules grid ── */
const MODULE_LABELS={
  situacao_fiscal:'Situação Fiscal',certidoes:'Certidões',alvara:'Alvará',cartao_cga:'Cartão CGA',
  segunda_via:'2ª Via Documentos',extrato_divida:'Extrato da Dívida',tributos:'Tributos em Aberto',
  acordo:'Acordo da Dívida',itiv:'ITIV Online',nfse:'NFSe',ficha_cadastral:'Ficha Cadastral',
  autenticacao:'Autenticação de Certidão',legislacao:'Legislação',procuracao:'Procuração Eletrônica',
  protocolo:'Protocolo e Processos',dec:'Domicílio Eletrônico',caixa_postal:'Caixa Postal',
  notificacoes:'Central de Notificações'
};
function renderModulesGrid(){
  const grid=document.getElementById('modules-grid');if(!grid)return;
  const m=getModules();
  grid.innerHTML=Object.entries(MODULE_LABELS).map(([k,label])=>{
    const on=m[k]!==false;
    return `<label style="display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--border-light);border-radius:var(--r-sm);cursor:pointer${on?';background:var(--accent-glow2);border-color:var(--accent)':''}"><input type="checkbox" data-module="${k}" ${on?'checked':''}><span style="font-size:.84rem;font-weight:600">${label}</span></label>`;
  }).join('');
}
function saveModulesFromUI(){
  const m=getModules();
  document.querySelectorAll('#modules-grid input[data-module]').forEach(cb=>{m[cb.dataset.module]=cb.checked});
  saveModules(m);
  alert('Módulos salvos! Menu lateral atualizado.');
}

/* ── Admin users CRUD ── */
function renderAdminUsersTable(){
  const el=document.getElementById('admin-users-table');if(!el)return;
  const users=getAdminUsers();
  const loggedIsMaster=isLoggedAsMaster();
  const perfilBadge={master:'green',admin:'green',suporte:'blue',dev:'orange'};
  el.innerHTML=`<table class="data-table"><thead><tr><th>Nome</th><th>Login</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>
    ${users.map(u=>{
      const uIsMaster=isMasterUser(u);
      const perfilLabel=uIsMaster?'MASTER':u.perfil.toUpperCase();
      let acoes='';
      if(uIsMaster){
        if(loggedIsMaster){
          acoes=`<button class="table-action-btn" onclick="editAdminUser(${u.id})">Editar</button><button class="table-action-btn" onclick="changeOwnPassword()">Alterar Senha</button>`;
        }else{
          acoes='<span style="font-size:.72rem;color:var(--text-muted)">Protegido</span>';
        }
      }else{
        acoes=`<button class="table-action-btn" onclick="editAdminUser(${u.id})">Editar</button><button class="table-action-btn" onclick="resetUserPassword(${u.id})">Resetar Senha</button>`;
        if(loggedIsMaster){
          acoes+=`<button class="table-action-btn" style="color:var(--danger);border-color:var(--danger)" onclick="deleteAdminUser(${u.id})">Excluir</button>`;
        }
      }
      return `<tr${uIsMaster?' style="background:var(--accent-glow2)"':''}><td style="font-weight:600">${u.nome}${uIsMaster?' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align:middle"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>':''}</td><td>${u.login}</td><td>${u.email}</td><td><span class="status-badge ${perfilBadge[u.perfil]||'gray'}">${perfilLabel}</span></td><td><span class="status-badge ${u.ativo?'green':'red'}">${u.ativo?'Ativo':'Inativo'}</span></td><td class="table-actions">${acoes}</td></tr>`;
    }).join('')}
  </tbody></table>`;
}
function showNewUserForm(){
  document.getElementById('new-user-form-panel').style.display='block';
  document.getElementById('user-form-title').textContent='Novo Usuário';
  document.getElementById('nu-edit-id').value='';
  ['nu-nome','nu-email','nu-login','nu-senha'].forEach(id=>{const el=document.getElementById(id);if(el){el.value='';el.disabled=false}});
  document.getElementById('nu-perfil').value='suporte';
  document.getElementById('nu-ativo').value='true';
}
function editAdminUser(id){
  const users=getAdminUsers();
  const u=users.find(x=>x.id==id);
  if(!u)return;
  if(isMasterUser(u)&&!isLoggedAsMaster()){alert('Apenas o Master pode editar seu próprio perfil.');return}
  document.getElementById('new-user-form-panel').style.display='block';
  document.getElementById('user-form-title').textContent='Editar Usuário — '+u.nome;
  document.getElementById('nu-edit-id').value=String(u.id);
  document.getElementById('nu-nome').value=u.nome;
  document.getElementById('nu-email').value=u.email;
  document.getElementById('nu-login').value=u.login;
  document.getElementById('nu-login').disabled=isMasterUser(u);
  document.getElementById('nu-senha').value='';
  document.getElementById('nu-senha').placeholder=isMasterUser(u)?'Nova senha (deixe vazio para manter)':'Deixe vazio para manter a atual';
  document.getElementById('nu-perfil').value=isMasterUser(u)?'admin':u.perfil;
  document.getElementById('nu-ativo').value=u.ativo?'true':'false';
}
function saveNewUser(){
  const editId=document.getElementById('nu-edit-id')?.value;
  const nome=document.getElementById('nu-nome').value.trim();
  const email=document.getElementById('nu-email').value.trim();
  const login=document.getElementById('nu-login').value.trim();
  const senha=document.getElementById('nu-senha').value;
  const perfil=document.getElementById('nu-perfil').value;
  const ativo=document.getElementById('nu-ativo').value==='true';
  const users=getAdminUsers();
  if(editId){
    const idx=users.findIndex(u=>u.id==editId);
    if(idx===-1){alert('Usuário não encontrado.');return}
    const u=users[idx];
    if(isMasterUser(u)&&!isLoggedAsMaster()){alert('Sem permissão para editar o Master.');return}
    if(!nome){alert('O nome é obrigatório.');return}
    u.nome=nome;
    u.email=email;
    if(!isMasterUser(u))u.perfil=perfil;
    u.ativo=ativo;
    if(senha)u.senha=senha;
    if(isMasterUser(u)&&u.id===Number(editId)){
      localStorage.setItem('crc_admin_name',u.nome);
      applySidebarVisibility();
    }
    saveAdminUsers(users);
    document.getElementById('new-user-form-panel').style.display='none';
    renderAdminUsersTable();
    alert('Usuário atualizado!');
    return;
  }
  if(!nome||!login||!senha){alert('Preencha nome, login e senha.');return}
  if(users.find(u=>u.login===login)){alert('Login já existe.');return}
  users.push({id:Date.now(),nome,email,login,senha,perfil,ativo});
  saveAdminUsers(users);
  document.getElementById('new-user-form-panel').style.display='none';
  renderAdminUsersTable();
  alert('Usuário criado!');
}
function resetUserPassword(id){
  const users=getAdminUsers();
  const u=users.find(x=>x.id==id);
  if(!u)return;
  if(isMasterUser(u)){alert('A senha do Master não pode ser resetada. Apenas o próprio Master pode alterá-la.');return}
  const novaSenha='crc'+String(Math.floor(Math.random()*900000)+100000);
  if(!confirm('Gerar nova senha para "'+u.nome+'"?\n\nA nova senha será: '+novaSenha))return;
  u.senha=novaSenha;
  saveAdminUsers(users);
  renderAdminUsersTable();
  alert('Senha resetada!\n\nUsuário: '+u.login+'\nNova senha: '+novaSenha+'\n\nInforme ao usuário.');
}
function changeOwnPassword(){
  if(!isLoggedAsMaster()){alert('Esta função é exclusiva do Master.');return}
  const senhaAtual=prompt('Digite sua senha ATUAL:');
  if(!senhaAtual)return;
  const users=getAdminUsers();
  const master=users.find(u=>isMasterUser(u));
  if(!master||master.senha!==senhaAtual){alert('Senha atual incorreta.');return}
  const novaSenha=prompt('Digite a NOVA senha:');
  if(!novaSenha||novaSenha.length<4){alert('A nova senha deve ter pelo menos 4 caracteres.');return}
  const confirma=prompt('Confirme a NOVA senha:');
  if(novaSenha!==confirma){alert('As senhas não conferem.');return}
  master.senha=novaSenha;
  saveAdminUsers(users);
  alert('Senha do Master alterada com sucesso!');
}
function deleteAdminUser(id){
  if(!isLoggedAsMaster()){alert('Apenas o Administrador Master pode excluir usuários.');return}
  const users=getAdminUsers();
  const u=users.find(x=>x.id==id);
  if(!u)return;
  if(isMasterUser(u)){alert('O Administrador Master não pode ser excluído.');return}
  if(!confirm('Excluir o usuário "'+u.nome+'" ('+u.login+')?\n\nEssa ação não pode ser desfeita.'))return;
  const filtered=users.filter(x=>x.id!==id);
  saveAdminUsers(filtered);
  renderAdminUsersTable();
  alert('Usuário excluído.');
}

/* ── Auto-run on navigate ── */
const origNav = navigate;
navigate = function(page) {
  if(page==='config_dev'&&currentUserType!=='admin'){alert('Acesso restrito. Faça login como administrador.');return}
  origNav(page);
  if(page==='acordo')setTimeout(simular,50);
};
